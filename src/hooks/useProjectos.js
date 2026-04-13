import { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, deleteDoc, getDoc, setDoc } from 'firebase/firestore'
import { orcRef } from './useOrcamento'

const projListaRef = (projId) => doc(db, 'projectos', projId)
const prefsRef     = (uid)    => doc(db, 'preferencias', uid)
const activoRef    = (uid)    => doc(db, 'projecto_ativo', uid)

function gerarProjId() { return 'proj_' + Date.now() }

export function useProjectos(user) {
  const [projectos,     setProjectos]     = useState([])
  const [projCarregado, setProjCarregado] = useState(false)
  const [tipos,         setTipos]         = useState([
    { id:'cozinha',    label:'Cozinha',       icon:'🍳', cor:'#c8943a', activo:true  },
    { id:'banho',      label:'Casa de Banho', icon:'🚿', cor:'#4a8fa8', activo:true  },
    { id:'closet',     label:'Closet',        icon:'👕', cor:'#8a9e6e', activo:true  },
    { id:'suite',      label:'Suite',         icon:'🛏', cor:'#b07acc', activo:false },
    { id:'escritorio', label:'Escritorio',    icon:'💼', cor:'#7a9e9a', activo:false },
    { id:'outro',      label:'Outro',         icon:'*',  cor:'#7a7a72', activo:true  },
  ])

  // Estado do projecto aberto
  const [projId,  setProjId]  = useState(null)
  const [nome,    setNome]    = useState('')
  const [campos,  setCampos]  = useState({})
  const [tipo,    setTipo]    = useState(null)
  const [passo,   setPasso]   = useState('lista')
  const [compSel,    setCompSel]    = useState([])
  const [compFeitos, setCompFeitos] = useState([])
  const [compActual, setCompActual] = useState(null)
  const [kitSelId,   setKitSelId]   = useState(null)
  const [kitItems,   setKitItems]   = useState([])
  const [guiaCarregado, setGuiaCarregado] = useState(false)
  const saveTimer = useRef(null)

  // Ouvir lista de projectos
  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(collection(db, 'projectos'), snap => {
      const lista = snap.docs
        .map(d => ({ projId: d.id, ...d.data() }))
        .filter(p => p.uid === user.uid)
        .sort((a,b) => (b.ts||0) - (a.ts||0))
      setProjectos(lista)
      setProjCarregado(true)
    })
    return () => unsub()
  }, [user])

  // Carregar tipos guardados
  useEffect(() => {
    if (!user) return
    getDoc(prefsRef(user.uid)).then(snap => {
      if (snap.exists() && Array.isArray(snap.data().projTipos)) setTipos(snap.data().projTipos)
    }).catch(() => {})
  }, [user])

  // Carregar projecto activo ao arrancar
  useEffect(() => {
    if (!user || !projCarregado) return
    getDoc(activoRef(user.uid)).then(snap => {
      if (snap.exists() && snap.data().projId) {
        _carregarEstado(snap.data().projId).catch(() => {})
      }
    }).catch(() => {})
  }, [user, projCarregado])

  // Guardar estado do guia com debounce
  const guardarGuia = (estado) => {
    if (!user || !guiaCarregado || !estado.projId) return
    if (['lista','nome','detalhe'].includes(estado.passo)) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setDoc(projListaRef(estado.projId), {
        uid: user.uid, ...estado, ts: Date.now(),
      }, { merge: true }).catch(() => {})
    }, 600)
  }

  const _carregarEstado = async (id) => {
    const snap = await getDoc(projListaRef(id))
    if (!snap.exists()) return
    const d = snap.data()
    setProjId(id); setNome(d.nome||''); setCampos(d.campos||{}); setTipo(d.tipo||null)
    setPasso(d.passo||'componentes'); setCompSel(d.compSel||[]); setCompFeitos(d.compFeitos||[])
    setCompActual(d.compActual||null); setKitSelId(d.kitSelId||null); setKitItems(d.kitItems||[])
    setGuiaCarregado(true)
    if (user) setDoc(activoRef(user.uid), { projId: id }).catch(() => {})
  }

  const abrirProjecto = async (id) => {
    await _carregarEstado(id)
    setPasso('detalhe')
  }

  const criarProjecto = async (tipoObj, nomeCliente) => {
    const id = gerarProjId()
    const nomeUsar = (nomeCliente||'').trim()
    await setDoc(projListaRef(id), {
      uid: user.uid, projId: id, nome: nomeUsar, tipo: tipoObj.id, campos: {},
      passo: 'componentes', compSel: [], compFeitos: [], compActual: null,
      kitSelId: null, kitItems: [], total: 0, ts: Date.now(),
    }).catch(() => {})
    await setDoc(activoRef(user.uid), { projId: id }).catch(() => {})
    setProjId(id); setNome(nomeUsar); setCampos({}); setTipo(tipoObj.id)
    setCompSel([]); setCompFeitos([]); setCompActual(null); setKitSelId(null); setKitItems([])
    setPasso('componentes'); setGuiaCarregado(true)
  }

  const apagarProjecto = async (id) => {
    await deleteDoc(orcRef(id)).catch(() => {})
    await deleteDoc(projListaRef(id))
    if (id === projId) resetarEstado(false)
  }

  const guardarIdentidade = (novoNome, novosCampos) => {
    setNome(novoNome); setCampos(novosCampos)
    if (projId && user) {
      setDoc(projListaRef(projId), { nome: novoNome, campos: novosCampos, ts: Date.now() }, { merge: true }).catch(() => {})
    }
  }

  const actualizarTotal = (total) => {
    if (!projId || !user) return
    setDoc(projListaRef(projId), { total, ts: Date.now() }, { merge: true }).catch(() => {})
  }

  const resetarEstado = (guardar = true) => {
    if (guardar && projId && user) {
      clearTimeout(saveTimer.current)
      setDoc(projListaRef(projId), {
        uid: user.uid, projId, nome, tipo, campos,
        passo, compSel, compFeitos, compActual, kitSelId, kitItems,
        ts: Date.now(),
      }, { merge: true }).catch(() => {})
      setDoc(activoRef(user.uid), { projId: null }).catch(() => {})
    }
    setProjId(null); setNome(''); setCampos({}); setTipo(null)
    setPasso('lista'); setCompSel([]); setCompFeitos([])
    setCompActual(null); setKitSelId(null); setKitItems([])
    setGuiaCarregado(false)
  }

  const saveTipos = (t) => {
    setTipos(t)
    if (user) setDoc(prefsRef(user.uid), { projTipos: t }, { merge: true }).catch(() => {})
  }

  return {
    // Lista
    projectos, tipos, tiposActivos: tipos.filter(t => t.activo),
    saveTipos,
    // Projecto aberto
    projId, nome, campos, tipo, passo, setPasso,
    compSel, setCompSel,
    compFeitos, setCompFeitos,
    compActual, setCompActual,
    kitSelId, setKitSelId,
    kitItems, setKitItems,
    guiaCarregado, guardarGuia,
    // Accoes
    abrirProjecto, criarProjecto, apagarProjecto,
    guardarIdentidade, actualizarTotal, resetarEstado,
  }
}

import { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, deleteDoc, getDoc, setDoc } from 'firebase/firestore'
import { orcRef } from './useOrcamento'

const projRef  = (id)  => doc(db, 'projectos', id)
const prefsRef = (uid) => doc(db, 'preferencias', uid)
const activoRef= (uid) => doc(db, 'projecto_ativo', uid)

function gerarId() { return 'proj_' + Date.now() }

export function useProjectos(user) {
  const [projectos,     setProjectos]     = useState([])
  const [projCarregado, setProjCarregado] = useState(false)
  const [tipos, setTipos] = useState([
    { id:'cozinha',    label:'Cozinha',        icon:'🍳', cor:'#c8943a', activo:true  },
    { id:'banho',      label:'Casa de Banho',  icon:'🚿', cor:'#4a8fa8', activo:true  },
    { id:'closet',     label:'Closet',         icon:'👕', cor:'#8a9e6e', activo:true  },
    { id:'suite',      label:'Suite',          icon:'🛏', cor:'#b07acc', activo:false },
    { id:'escritorio', label:'Escritorio',     icon:'💼', cor:'#7a9e9a', activo:false },
    { id:'outro',      label:'Outro',          icon:'*',  cor:'#7a7a72', activo:true  },
  ])

  // Projecto aberto - apenas dados de identidade
  const [projId, setProjId] = useState(null)
  const [nome,   setNome]   = useState('')
  const [campos, setCampos] = useState({})
  const [tipo,   setTipo]   = useState(null)

  // Navegacao
  const [passo, setPasso] = useState('lista')
  // passo: 'lista' | 'nome' | 'detalhe' | 'adicionar' | 'execucao'

  // Execucao - o que esta a ser tratado agora
  const [execTarefa,  setExecTarefa]  = useState(null) // { tipo:'kit'|'categoria'|'especial', ref, nome, kitId? }
  const [kitSelId,    setKitSelId]    = useState(null)
  const [kitItems,    setKitItems]    = useState([])

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

  useEffect(() => {
    if (!user) return
    getDoc(prefsRef(user.uid)).then(snap => {
      if (snap.exists() && Array.isArray(snap.data().projTipos)) setTipos(snap.data().projTipos)
    }).catch(() => {})
  }, [user])

  // Ao arrancar, restaurar projecto activo
  useEffect(() => {
    if (!user || !projCarregado) return
    getDoc(activoRef(user.uid)).then(snap => {
      if (snap.exists() && snap.data().projId) {
        _carregar(snap.data().projId).catch(() => {})
      }
    }).catch(() => {})
  }, [user, projCarregado])

  async function _carregar(id) {
    const snap = await getDoc(projRef(id))
    if (!snap.exists()) return
    const d = snap.data()
    setProjId(id); setNome(d.nome||''); setCampos(d.campos||{}); setTipo(d.tipo||null)
    if (user) setDoc(activoRef(user.uid), { projId: id }).catch(() => {})
  }

  async function abrirProjecto(id) {
    await _carregar(id)
    setPasso('detalhe')
  }

  async function criarProjecto(tipoObj, nomeCliente) {
    const id = gerarId()
    const nomeUsar = (nomeCliente||'').trim()
    await setDoc(projRef(id), {
      uid: user.uid, projId: id,
      nome: nomeUsar, tipo: tipoObj.id, campos: {},
      total: 0, ts: Date.now(),
    }).catch(() => {})
    await setDoc(activoRef(user.uid), { projId: id }).catch(() => {})
    setProjId(id); setNome(nomeUsar); setCampos({}); setTipo(tipoObj.id)
    setPasso('adicionar')
  }

  async function apagarProjecto(id) {
    await deleteDoc(orcRef(id)).catch(() => {})
    await deleteDoc(projRef(id))
    if (id === projId) fecharProjecto()
  }

  function fecharProjecto() {
    if (projId && user) setDoc(activoRef(user.uid), { projId: null }).catch(() => {})
    setProjId(null); setNome(''); setCampos({}); setTipo(null)
    setPasso('lista'); setExecTarefa(null); setKitSelId(null); setKitItems([])
  }

  function guardarIdentidade(novoNome, novosCampos) {
    setNome(novoNome); setCampos(novosCampos)
    if (projId && user) {
      setDoc(projRef(projId), { nome: novoNome, campos: novosCampos, ts: Date.now() }, { merge: true }).catch(() => {})
    }
  }

  function actualizarTotal(total) {
    if (!projId || !user) return
    setDoc(projRef(projId), { total, ts: Date.now() }, { merge: true }).catch(() => {})
  }

  function saveTipos(t) {
    setTipos(t)
    if (user) setDoc(prefsRef(user.uid), { projTipos: t }, { merge: true }).catch(() => {})
  }

  // Iniciar execucao de uma tarefa
  function iniciarExecucao(tarefa) {
    // tarefa: { tipo, ref, nome, kitId? }
    setExecTarefa(tarefa)
    setKitSelId(tarefa.kitId || null)
    setKitItems(tarefa.kitItems || [])
    setPasso('execucao')
  }

  return {
    projectos, tipos, tiposActivos: tipos.filter(t => t.activo), saveTipos,
    projId, nome, campos, tipo, passo, setPasso,
    execTarefa, setExecTarefa,
    kitSelId, setKitSelId,
    kitItems, setKitItems,
    abrirProjecto, criarProjecto, apagarProjecto,
    fecharProjecto, guardarIdentidade, actualizarTotal,
    iniciarExecucao,
  }
}

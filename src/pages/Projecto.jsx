import React, { useState, useEffect, useCallback, useRef } from 'react'
import { db } from '../firebase'
import {
  collection, doc, onSnapshot, deleteDoc,
  getDoc, setDoc
} from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { addToOrcamento, orcRef } from '../hooks/useOrcamento'

const TIPOS_DEFAULT = [
  { id:'cozinha',    label:'Cozinha',       icon:'🍳', cor:'#c8943a', activo:true  },
  { id:'banho',      label:'Casa de Banho', icon:'🚿', cor:'#4a8fa8', activo:true  },
  { id:'closet',     label:'Closet',        icon:'👕', cor:'#8a9e6e', activo:true  },
  { id:'suite',      label:'Suite',         icon:'🛏', cor:'#b07acc', activo:false },
  { id:'escritorio', label:'Escritorio',    icon:'💼', cor:'#7a9e9a', activo:false },
  { id:'outro',      label:'Outro',         icon:'*',  cor:'#7a7a72', activo:true  },
]

const COMPONENTES = [
  { id:'base',       label:'Kit base',        icon:'📦', desc:'Artigos essenciais',                    cor:'#c8943a',
    match:(n,c,t)=>{ const nl=n.toLowerCase(),cl=(c||'').toLowerCase(),tl=(t||'').toLowerCase(); return nl.includes('base')||(cl&&cl.includes(tl)) }, destino:null },
  { id:'eletro',     label:'Eletrodomesticos', icon:'⚡', desc:'Electrodomesticos encastraveis',        cor:'#8a9e6e',
    match:(n)=>n.toLowerCase().includes('eletro')||n.toLowerCase().includes('electro'), destino:'biblioteca', destCat:'Eletrodomesticos' },
  { id:'acessorios', label:'Acessorios',       icon:'🔩', desc:'Puxadores, calhas, dobradicas',         cor:'#b07acc',
    match:(n)=>n.toLowerCase().includes('acess'), destino:'biblioteca', destCat:'Acessorios' },
  { id:'ferragens',  label:'Ferragens',        icon:'🔧', desc:'Ferragens de cozinha e montagem',       cor:'#7a9e9a',
    match:(n)=>n.toLowerCase().includes('ferragem')||n.toLowerCase().includes('ferrag'), destino:'biblioteca', destCat:'Ferragens' },
  { id:'iluminacao', label:'Iluminacao',       icon:'💡', desc:'Iluminacao embutida e decorativa',      cor:'#d4b87a',
    match:(n)=>n.toLowerCase().includes('ilumina')||n.toLowerCase().includes('luz'), destino:'biblioteca', destCat:'Iluminacao' },
  { id:'instalacao', label:'Instalacao',       icon:'🛠', desc:'Servicos de montagem e instalacao',    cor:'#9a7acc',
    match:(n)=>n.toLowerCase().includes('instala')||n.toLowerCase().includes('montagem'), destino:'maodeobra', destCat:null },
  { id:'tampos',     label:'Tampos',           icon:'⬛', desc:'Calculadora ANIGRACO',                  cor:'#4a8fa8',
    match:(n)=>n.toLowerCase().includes('tampo'), destino:'tampos', destCat:null, sempreCalculadora:true },
]

function f2(n) { return parseFloat(n||0).toFixed(2) }
function hexToRgb(hex) {
  if (!hex||hex.startsWith('var')) return '56,189,248'
  try { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }
  catch { return '56,189,248' }
}
function gerarProjId() { return 'proj_' + Date.now() }

const projListaRef = (projId) => doc(db, 'projectos', projId)
const prefsRef     = (uid)    => doc(db, 'preferencias', uid)
const activoRef    = (uid)    => doc(db, 'projecto_ativo', uid)

function kitsParaComp(comp, kits, tipoLabel) {
  if (comp.sempreCalculadora) return []
  return kits.filter(k => comp.match(k.name, k.contexto, tipoLabel))
}

// Passos: 'lista' | 'novo_nome' | 'componentes' | 'execucao' | 'resumo' | 'ver_proj'
export default function Projecto({ showToast, onNavegar }) {
  const { user } = useAuth()

  const [tipos,     setTipos]     = useState(TIPOS_DEFAULT)
  const [editTipos, setEditTipos] = useState(false)
  const [projectos, setProjectos] = useState([])
  const [projCarregado, setProjCarregado] = useState(false)

  // Projecto em edição
  const [projId,  setProjId]  = useState(null)
  const [nome,    setNome]    = useState('')
  const [campos,  setCampos]  = useState({})
  const [tipo,    setTipo]    = useState(null)

  // Passo actual
  const [passo, setPasso] = useState('lista')

  // Guia
  const [compSel,    setCompSel]    = useState([])
  const [compFeitos, setCompFeitos] = useState([])
  const [compActual, setCompActual] = useState(null)
  const [kitSelId,   setKitSelId]   = useState(null)
  const [kitItems,   setKitItems]   = useState([])

  // Orçamento
  const [orcItems, setOrcItems] = useState([])

  // Modais
  const [confirmApagar,    setConfirmApagar]    = useState(null)
  const [confirmSaltar,    setConfirmSaltar]    = useState(false)
  const [confirmSairGuia,  setConfirmSairGuia]  = useState(false)
  const [modalId,          setModalId]          = useState(false)

  // Dados
  const [kits,    setKits]    = useState([])
  const [artigos, setArtigos] = useState([])
  const [loading, setLoading] = useState(false)
  const [kitsEncontrados, setKitsEncontrados] = useState([])
  const [subst, setSubst] = useState(null)

  // Modal identidade
  const [modalNome,   setModalNome]   = useState('')
  const [modalCampos, setModalCampos] = useState([])

  // Novo projecto - nome inicial
  const [novoTipoSel,  setNovoTipoSel]  = useState(null)
  const [novoNomeInput, setNovoNomeInput] = useState('')

  const saveTimer = useRef(null)
  const [guiaCarregado, setGuiaCarregado] = useState(false)

  // Carregar kits e artigos
  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), s => setKits(s.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), s => setArtigos(s.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  // Carregar tipos
  useEffect(() => {
    if (!user) return
    getDoc(prefsRef(user.uid)).then(snap => {
      if (snap.exists() && Array.isArray(snap.data().projTipos)) setTipos(snap.data().projTipos)
    }).catch(() => {})
  }, [user])

  // Carregar lista de projectos
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

  // Orçamento do projecto activo
  useEffect(() => {
    if (!projId) { setOrcItems([]); return }
    const unsub = onSnapshot(orcRef(projId), snap => {
      setOrcItems(snap.exists() ? (snap.data().items||[]) : [])
    })
    return () => unsub()
  }, [projId])

  // Gravar guia (debounce)
  useEffect(() => {
    if (!user || !guiaCarregado || !projId || passo === 'lista' || passo === 'novo_nome') return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      setDoc(projListaRef(projId), {
        uid: user.uid, projId, nome, tipo, campos,
        passo: passo === 'ver_proj' ? 'resumo' : passo,
        compSel, compFeitos, compActual, kitSelId, kitItems,
        total: _calcTotal(orcItems), ts: Date.now(),
      }, { merge: true }).catch(() => {})
    }, 600)
    return () => clearTimeout(saveTimer.current)
  }, [passo, compSel, compFeitos, compActual, kitSelId, kitItems, nome, campos, projId, user, guiaCarregado])

  // Actualizar total
  useEffect(() => {
    if (!projId || !user) return
    setDoc(projListaRef(projId), { total: _calcTotal(orcItems), ts: Date.now() }, { merge: true }).catch(() => {})
  }, [orcItems, projId, user])

  // Kits para o componente actual
  useEffect(() => {
    if (!compActual || !kits.length) return
    const comp = COMPONENTES.find(c => c.id === compActual)
    if (!comp) return
    const tipoLabel = tipos.find(t => t.id === tipo)?.label || ''
    const enc = kitsParaComp(comp, kits, tipoLabel)
    setKitsEncontrados(enc)
    if (enc.length === 1 && !kitSelId) {
      setKitSelId(enc[0].id)
      setKitItems((enc[0].items||[]).map(i=>({...i,incluido:true})))
    }
  }, [compActual, kits, tipo, tipos])

  function _calcTotal(items) {
    return items.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0)
  }

  const tipoActual   = tipos.find(t => t.id === tipo)
  const tiposActivos = tipos.filter(t => t.activo)
  const totalOrc     = _calcTotal(orcItems)
  const compObjActual = COMPONENTES.find(c => c.id === compActual)
  const kitSel        = kits.find(k => k.id === kitSelId) || null
  const compPorFazer  = compSel.filter(c => !compFeitos.includes(c))

  const artsSub   = subst ? artigos.filter(a=>a.cat===subst.cat&&subst.sub&&a.sub===subst.sub).sort((a,b)=>(a.ref||'').localeCompare(b.ref||'')) : []
  const artsResto = subst ? artigos.filter(a=>a.cat===subst.cat&&!(subst.sub&&a.sub===subst.sub)).sort((a,b)=>(a.ref||'').localeCompare(b.ref||'')) : []
  const artsCat   = subst ? [...artsSub, ...artsResto] : []

  // Carregar projecto em memória
  const _carregarEstado = async (id) => {
    const snap = await getDoc(projListaRef(id))
    if (!snap.exists()) return
    const d = snap.data()
    setProjId(id); setNome(d.nome||''); setCampos(d.campos||{}); setTipo(d.tipo||null)
    setCompSel(d.compSel||[]); setCompFeitos(d.compFeitos||[])
    setCompActual(d.compActual||null); setKitSelId(d.kitSelId||null); setKitItems(d.kitItems||[])
    setGuiaCarregado(true)
    if (user) setDoc(activoRef(user.uid), { projId: id }).catch(() => {})
  }

  // Abrir projecto existente -> vai para vista do projecto
  const abrirProjecto = async (id) => {
    try {
      await _carregarEstado(id)
      setPasso('ver_proj')
    } catch(e) { console.error(e) }
  }

  // Retomar guia de um projecto a meio
  const retomarGuia = async (id) => {
    try {
      const snap = await getDoc(projListaRef(id))
      if (!snap.exists()) return
      const d = snap.data()
      await _carregarEstado(id)
      setPasso(d.passo || 'componentes')
    } catch(e) { console.error(e) }
  }

  // Gravar e voltar à lista
  const voltarALista = () => {
    if (projId && user) {
      clearTimeout(saveTimer.current)
      setDoc(projListaRef(projId), {
        uid: user.uid, projId, nome, tipo, campos,
        passo: passo === 'ver_proj' ? 'resumo' : passo,
        compSel, compFeitos, compActual, kitSelId, kitItems,
        total: totalOrc, ts: Date.now(),
      }, { merge: true }).catch(() => {})
      setDoc(activoRef(user.uid), { projId: null }).catch(() => {})
    }
    setProjId(null); setNome(''); setCampos({}); setTipo(null)
    setPasso('lista'); setCompSel([]); setCompFeitos([])
    setCompActual(null); setKitSelId(null); setKitItems([])
    setGuiaCarregado(false)
  }

  // Pedir confirmação para sair do guia
  const pedirSairGuia = () => setConfirmSairGuia(true)

  // Criar novo projecto - passo 1: escolher tipo
  const iniciarNovoProjecto = (tipoObj) => {
    setNovoTipoSel(tipoObj)
    setNovoNomeInput('')
    setPasso('novo_nome')
  }

  // Criar novo projecto - passo 2: confirmar nome e criar
  const confirmarNovoProjecto = async () => {
    if (!novoTipoSel) return
    const id = gerarProjId()
    const docData = {
      uid: user.uid, projId: id,
      nome: novoNomeInput.trim(), tipo: novoTipoSel.id, campos: {},
      passo: 'componentes',
      compSel: [], compFeitos: [], compActual: null, kitSelId: null, kitItems: [],
      total: 0, ts: Date.now(),
    }
    await setDoc(projListaRef(id), docData).catch(() => {})
    await setDoc(activoRef(user.uid), { projId: id }).catch(() => {})
    setProjId(id); setNome(novoNomeInput.trim()); setCampos({}); setTipo(novoTipoSel.id)
    setCompSel([]); setCompFeitos([]); setCompActual(null); setKitSelId(null); setKitItems([])
    setPasso('componentes')
    setGuiaCarregado(true)
  }

  // Apagar projecto
  const apagarProjecto = async (id) => {
    try {
      await deleteDoc(orcRef(id)).catch(() => {})
      await deleteDoc(projListaRef(id))
      if (id === projId) voltarALista()
      showToast('Projecto apagado')
    } catch { showToast('Erro ao apagar') }
    setConfirmApagar(null)
  }

  // Acções do guia
  const toggleComp = (id) => setCompSel(p => p.includes(id)?p.filter(x=>x!==id):[...p,id])

  const avancarDeComponentes = () => {
    if (!compSel.length) { showToast('Selecciona pelo menos um componente'); return }
    iniciarComp(compSel[0])
  }

  const iniciarComp = (compId) => {
    setCompActual(compId); setKitSelId(null); setKitItems([]); setPasso('execucao')
  }

  const escolherKit = (kit) => {
    setKitSelId(kit.id)
    setKitItems((kit.items||[]).map(i=>({...i,incluido:true})))
  }

  const temItensNoOrc = useCallback((compId) => {
    const comp = COMPONENTES.find(c => c.id === compId)
    if (!comp) return false
    if (comp.sempreCalculadora) return orcItems.some(i => i.origem === 'Tampos')
    if (kitSelId) {
      const kit = kits.find(k => k.id === kitSelId)
      if (kit) return orcItems.some(i => i.origem === kit.name)
    }
    if (comp.destCat) return orcItems.some(i => i.cat===comp.destCat||i.origem===comp.destCat)
    if (comp.destino === 'maodeobra') return orcItems.some(i => i.origem === 'Mao de Obra')
    return false
  }, [orcItems, kits, kitSelId])

  const confirmarKit = async () => {
    if (!kitSel) { showToast('Escolhe um kit primeiro'); return }
    setLoading(true)
    const para = kitItems.filter(i=>i.incluido)
    for (const item of para) {
      await addToOrcamento(projId, {
        ref:item.ref, desc:item.desc, cat:item.cat||'', sub:item.sub||'',
        price:item.price||0, supplier:item.supplier||'', link:item.link||'',
        origem: kitSel.name,
      }, ()=>{})
    }
    setLoading(false)
    showToast(`"${kitSel.name}" - ${para.length} artigos adicionados`)
    marcarFeitoEAvancar(compActual)
  }

  const marcarFeitoEAvancar = useCallback((comp) => {
    const novos = [...compFeitos, comp]
    setCompFeitos(novos)
    const rest = compSel.filter(c => !novos.includes(c))
    if (!rest.length) { setPasso('resumo') }
    else { iniciarComp(rest[0]) }
  }, [compFeitos, compSel])

  const substituir = (artigo) => {
    setKitItems(p => p.map((item,i) => i===subst.idx
      ? {...item, artId:artigo.id, ref:artigo.ref, desc:artigo.desc, cat:artigo.cat||'', sub:artigo.sub||'', price:artigo.price||0, supplier:artigo.supplier||'', link:artigo.link||'', notes:artigo.notes||'', incluido:true}
      : item))
    setSubst(null)
    showToast(`Substituido por ${artigo.ref}`)
  }

  const tentarSaltar = () => {
    if (!temItensNoOrc(compActual)) { setConfirmSaltar(true) }
    else { marcarFeitoEAvancar(compActual) }
  }

  const voltarPassoGuia = () => {
    if (passo==='componentes') pedirSairGuia()
    else if (passo==='execucao') setPasso('componentes')
    else if (passo==='resumo') setPasso('execucao')
  }

  const progressoPct = compSel.length>0 ? Math.round((compFeitos.length/compSel.length)*100) : 0

  // Modal identidade
  const abrirModalId = () => {
    setModalNome(nome)
    setModalCampos(Object.entries(campos).map(([chave,valor])=>({chave,valor})))
    setModalId(true)
  }

  const guardarIdentidade = () => {
    const novoNome    = modalNome.trim()
    const novosCampos = Object.fromEntries(modalCampos.filter(c=>c.chave.trim()).map(c=>[c.chave.trim(), c.valor]))
    setNome(novoNome); setCampos(novosCampos); setModalId(false)
    if (projId && user) {
      setDoc(projListaRef(projId), { nome: novoNome, campos: novosCampos, ts: Date.now() }, { merge: true }).catch(() => {})
    }
    showToast(novoNome ? `Projecto: ${novoNome}` : 'Identidade guardada')
  }

  const saveTipos = (t) => {
    setTipos(t)
    if (user) setDoc(prefsRef(user.uid), { projTipos: t }, { merge: true }).catch(() => {})
  }

  const noGuia = ['componentes','execucao','resumo'].includes(passo)
  const titulo = passo === 'lista' ? 'Projectos'
    : passo === 'novo_nome' ? 'Novo Projecto'
    : passo === 'ver_proj' ? (tipoActual?.label || 'Projecto')
    : 'Novo Projecto'

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--neo-bg)', color:'var(--neo-text)', fontFamily:"'Barlow',sans-serif" }}>

      {/* TOPBAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:52, flexShrink:0, background:'var(--neo-bg)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {passo !== 'lista' && (
            <button
              onClick={noGuia ? pedirSairGuia : voltarALista}
              style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:18, padding:'4px 8px', lineHeight:1 }}>
              &#8592;
            </button>
          )}
          <div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text)' }}>
              {titulo}
            </div>
            {(noGuia || passo === 'ver_proj') && tipoActual && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:tipoActual.cor, marginTop:1 }}>{tipoActual.icon} {tipoActual.label}</div>
                {nome && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', color:'var(--neo-text2)', marginTop:1 }}>· {nome}</div>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {totalOrc > 0 && passo !== 'lista' && passo !== 'novo_nome' && (
            <div style={{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.08em' }}>
              {f2(totalOrc)} EUR
            </div>
          )}
          {(noGuia || passo === 'ver_proj') && (
            <button onClick={abrirModalId} title="Identificar projecto"
              style={{ background: nome ? 'rgba(200,169,110,0.1)' : 'transparent', border:`1px solid ${nome ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'var(--neo-radius-pill)', padding:'5px 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', color: nome ? 'var(--neo-gold)' : 'var(--neo-text2)', transition:'all .15s' }}>
              ✎
            </button>
          )}
        </div>
      </div>

      {/* BARRA PROGRESSO */}
      {['execucao','resumo'].includes(passo) && compSel.length>0 && (
        <div style={{ height:3, background:'var(--neo-bg2)', flexShrink:0 }}>
          <div style={{ height:'100%', width:`${progressoPct}%`, background:'linear-gradient(90deg,var(--neo-gold2),var(--neo-gold))', transition:'width .4s ease' }}/>
        </div>
      )}

      <div className="neo-scroll" style={{ flex:1, overflowY:'auto', padding:'20px 16px 40px' }}>

        {/* LISTA DE PROJECTOS */}
        {passo === 'lista' && (
          <div>
            {projectos.length > 0 && (
              <div style={{ marginBottom:28 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--neo-gold)', marginBottom:10 }}>
                  Os teus projectos
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {projectos.map(proj => {
                    const tObj = tipos.find(t => t.id === proj.tipo)
                    const camposArr = Object.entries(proj.campos || {})
                    const emGuia = proj.passo === 'componentes' || proj.passo === 'execucao'
                    return (
                      <div key={proj.projId}
                        style={{ background:'var(--neo-bg2)', border:'1px solid rgba(200,169,110,0.18)', borderLeft:'3px solid var(--neo-gold)', borderRadius:'var(--neo-radius)', overflow:'hidden' }}>
                        <div style={{ padding:'14px 16px 10px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                            <span style={{ fontSize:20, flexShrink:0 }}>{tObj?.icon || '*'}</span>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {proj.nome || tObj?.label || 'Projecto'}
                              </div>
                              {proj.nome && tObj && (
                                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', color:'var(--neo-text2)', marginTop:2 }}>
                                  {tObj.icon} {tObj.label}
                                </div>
                              )}
                            </div>
                            {(proj.total||0) > 0 && (
                              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, color:'var(--neo-gold)', flexShrink:0 }}>
                                {f2(proj.total)} EUR
                              </div>
                            )}
                          </div>
                          {camposArr.length > 0 && (
                            <div style={{ display:'flex', gap:12, flexWrap:'wrap', paddingLeft:30, marginTop:6 }}>
                              {camposArr.map(([k,v]) => (
                                <span key={k} style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)' }}>
                                  <span style={{ opacity:0.6 }}>{k}:</span> {v}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns: emGuia ? '1fr 1fr auto' : '1fr auto', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                          <button onClick={() => abrirProjecto(proj.projId)}
                            style={{ background:'transparent', border:'none', borderRight:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', padding:'11px 16px', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-gold)', textAlign:'left' }}>
                            Abrir projecto
                          </button>
                          {emGuia && (
                            <button onClick={() => retomarGuia(proj.projId)}
                              style={{ background:'transparent', border:'none', borderRight:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', padding:'11px 16px', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)', textAlign:'left' }}>
                              Continuar guia
                            </button>
                          )}
                          <button onClick={() => setConfirmApagar(proj.projId)}
                            style={{ background:'transparent', border:'none', cursor:'pointer', padding:'11px 16px', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)', opacity:0.6 }}>
                            X
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <PassoHeader numero={null} titulo="Novo projecto" sub="Selecciona o tipo para comecar"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginTop:16 }}>
              {tiposActivos.map(t => (
                <button key={t.id} onClick={() => iniciarNovoProjecto(t)} className="proj-tipo-card"
                  style={{ background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'22px 16px', cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:32, lineHeight:1 }}>{t.icon}</span>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text)' }}>{t.label}</span>
                </button>
              ))}
            </div>

            <div style={{ marginTop:20 }}>
              <button onClick={()=>setEditTipos(o=>!o)}
                style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', padding:'4px 0', opacity:0.6 }}>
                {editTipos ? '✓ Fechar' : '* Gerir tipos'}
              </button>
              {editTipos && (
                <div style={{ marginTop:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', border:'1px solid rgba(255,255,255,0.07)', padding:'14px' }}>
                  {tipos.map((t,i) => (
                    <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom: i<tipos.length-1?'1px solid rgba(255,255,255,0.05)':'none' }}>
                      <span style={{ fontSize:16 }}>{t.icon}</span>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.08em', textTransform:'uppercase', color:t.activo?'var(--neo-text)':'var(--neo-text2)', flex:1 }}>{t.label}</span>
                      <button onClick={()=>saveTipos(tipos.map((x,j)=>j===i?{...x,activo:!x.activo}:x))}
                        style={{ background: t.activo?'rgba(200,169,110,0.1)':'transparent', border:`1px solid ${t.activo?'rgba(200,169,110,0.3)':'rgba(255,255,255,0.08)'}`, borderRadius:'var(--neo-radius-pill)', padding:'3px 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', color: t.activo?'var(--neo-gold)':'var(--neo-text2)' }}>
                        {t.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* NOVO PROJECTO - NOME */}
        {passo === 'novo_nome' && novoTipoSel && (
          <div>
            <div style={{ textAlign:'center', marginBottom:32 }}>
              <div style={{ fontSize:52, marginBottom:12 }}>{novoTipoSel.icon}</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:20, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:novoTipoSel.cor }}>
                {novoTipoSel.label}
              </div>
            </div>
            <div style={{ marginBottom:24 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:8 }}>
                Nome do cliente (opcional)
              </div>
              <input
                value={novoNomeInput}
                onChange={e=>setNovoNomeInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') confirmarNovoProjecto() }}
                placeholder="ex: Joao Silva"
                autoFocus
                style={{ width:'100%', background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'var(--neo-radius)', padding:'14px 16px', fontFamily:"'Barlow'", fontSize:16, color:'var(--neo-text)', outline:'none', boxSizing:'border-box' }}
              />
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.08em', marginTop:8, opacity:0.6 }}>
                Podes identificar o projecto agora ou mais tarde
              </div>
            </div>
            <button onClick={confirmarNovoProjecto} className="neo-btn neo-btn-gold"
              style={{ width:'100%', height:52, fontSize:12, letterSpacing:'0.12em', borderRadius:'var(--neo-radius)' }}>
              Comecar projecto
            </button>
          </div>
        )}

        {/* VER PROJECTO EXISTENTE */}
        {passo === 'ver_proj' && (
          <div>
            {/* Cabecalho */}
            <div style={{ background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--neo-radius)', padding:'16px 20px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: totalOrc > 0 ? 8 : 0 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
                  {tipoActual?.icon} {tipoActual?.label}
                </div>
                {totalOrc > 0 && (
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:20, fontWeight:700, color:'var(--neo-gold)' }}>
                    {f2(totalOrc)} EUR
                  </div>
                )}
              </div>
              {orcItems.length > 0 && (
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.08em' }}>
                  {orcItems.length} item{orcItems.length!==1?'s':''} no orcamento
                </div>
              )}
            </div>

            {/* Categorias ja tratadas */}
            {compFeitos.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                  Categorias tratadas
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {compFeitos.map(id => {
                    const c = COMPONENTES.find(x=>x.id===id)
                    const itensDaCategoria = orcItems.filter(i => {
                      if (c?.sempreCalculadora) return i.origem === 'Tampos'
                      if (c?.destCat) return i.cat === c.destCat || i.origem === c.destCat
                      if (c?.destino === 'maodeobra') return i.origem === 'Mao de Obra'
                      // kit base - itens do kit
                      return kitSelId && kits.find(k=>k.id===kitSelId)?.name === i.origem
                    })
                    const subtotal = itensDaCategoria.reduce((s,i) => s+(i.price||0)*(i.qty||1), 0)
                    return (
                      <button key={id}
                        onClick={() => { iniciarComp(id) }}
                        style={{ display:'flex', alignItems:'center', gap:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:`3px solid ${c?.cor||'var(--neo-gold)'}`, padding:'10px 14px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                        <span style={{ fontSize:18, flexShrink:0 }}>{c?.icon}</span>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c?.cor||'var(--neo-gold)' }}>{c?.label}</div>
                          {itensDaCategoria.length > 0 && (
                            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', marginTop:2 }}>
                              {itensDaCategoria.length} item{itensDaCategoria.length!==1?'s':''}{subtotal>0?` · ${f2(subtotal)} EUR`:''}
                            </div>
                          )}
                        </div>
                        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em' }}>ver</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Acoes */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={() => setPasso('componentes')} className="neo-btn neo-btn-gold"
                style={{ width:'100%', height:48, fontSize:11 }}>
                + Adicionar componente
              </button>
              <button onClick={() => onNavegar?.('orcamentos')} className="neo-btn neo-btn-ghost"
                style={{ width:'100%', height:44, fontSize:10 }}>
                Ver orcamento completo
              </button>
            </div>
          </div>
        )}

        {/* COMPONENTES */}
        {passo === 'componentes' && tipoActual && (
          <div>
            <PassoHeader numero={null} titulo="O que inclui este projecto?" sub="Selecciona tudo o que o cliente pretende"/>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:20 }}>
              {COMPONENTES.map(comp => {
                const sel = compSel.includes(comp.id)
                const corR = hexToRgb(comp.cor)
                const nKits = kitsParaComp(comp, kits, tipoActual.label).length
                const temKits = nKits > 0
                const jaFeito = compFeitos.includes(comp.id)
                return (
                  <button key={comp.id} onClick={()=>toggleComp(comp.id)} className="proj-comp-card"
                    style={{ display:'flex', alignItems:'center', gap:14, background:sel?`rgba(${corR},0.1)`:jaFeito?'rgba(200,169,110,0.05)':'var(--neo-bg2)', border:sel?`1px solid ${comp.cor}55`:jaFeito?'1px solid rgba(200,169,110,0.2)':'1px solid rgba(255,255,255,0.06)', borderLeft:sel?`3px solid ${comp.cor}`:jaFeito?'3px solid rgba(200,169,110,0.4)':'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                    <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, border:sel?`2px solid ${comp.cor}`:jaFeito?'2px solid rgba(200,169,110,0.6)':'2px solid rgba(255,255,255,0.15)', background:sel?comp.cor:jaFeito?'rgba(200,169,110,0.3)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#0f0d08', fontWeight:700 }}>
                      {sel&&'v'}{!sel&&jaFeito&&'v'}
                    </div>
                    <span style={{ fontSize:20, flexShrink:0 }}>{comp.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:sel?comp.cor:jaFeito?'rgba(200,169,110,0.7)':'var(--neo-text)' }}>
                        {comp.label}
                      </div>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>
                        {jaFeito ? 'ja tratado - selecciona para rever'
                          : comp.sempreCalculadora ? 'Calculadora ANIGRACO'
                          : temKits ? `${nKits} kit${nKits!==1?'s':''} disponivel${nKits!==1?'is':''}`
                          : comp.desc}
                      </div>
                    </div>
                    {temKits && !comp.sempreCalculadora && !jaFeito && (
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 8px', borderRadius:'var(--neo-radius-pill)', background:`rgba(${corR},0.15)`, color:comp.cor, border:`1px solid ${comp.cor}33`, flexShrink:0 }}>
                        {nKits} kit{nKits!==1?'s':''}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
            {compSel.length > 0 && (
              <div style={{ marginTop:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                  Vais tratar por esta ordem:
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                  {compSel.map((id,i) => {
                    const c = COMPONENTES.find(x=>x.id===id)
                    return (
                      <span key={id} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', background:`rgba(${hexToRgb(c?.cor||'#c8943a')},0.15)`, color:c?.cor||'var(--neo-gold)', border:`1px solid ${c?.cor||'#c8943a'}33` }}>
                        {i+1}. {c?.label}
                      </span>
                    )
                  })}
                </div>
                <button onClick={avancarDeComponentes} className="neo-btn neo-btn-gold"
                  style={{ width:'100%', height:48, fontSize:11, letterSpacing:'0.12em', borderRadius:'var(--neo-radius)' }}>
                  Comecar
                </button>
              </div>
            )}
          </div>
        )}

        {/* EXECUCAO */}
        {passo === 'execucao' && compActual && compObjActual && (() => {
          const comp = compObjActual
          const corR = hexToRgb(comp.cor)
          const proximo = compSel.find(c=>c!==compActual&&!compFeitos.includes(c))
          const temKits = kitsEncontrados.length > 0

          return (
            <div>
              <PassoHeader numero={compFeitos.length+1} titulo={comp.label} sub={''} cor={comp.cor} icon={comp.icon}/>

              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12, marginBottom:24 }}>
                {compSel.map(id => {
                  const c=COMPONENTES.find(x=>x.id===id)
                  const feito=compFeitos.includes(id); const actual=id===compActual
                  return (
                    <span key={id} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', fontWeight:actual?700:400, background:feito?'rgba(200,169,110,0.12)':actual?`rgba(${hexToRgb(c?.cor||'#c8943a')},0.18)`:'var(--neo-bg2)', color:feito?'var(--neo-gold)':actual?(c?.cor||'var(--neo-gold)'):'var(--neo-text2)', border:actual?`1px solid ${c?.cor||'var(--neo-gold)'}44`:'1px solid rgba(255,255,255,0.06)' }}>
                      {feito?'v ':actual?'> ':''}{c?.label||id}
                    </span>
                  )
                })}
              </div>

              {comp.sempreCalculadora && (
                <CompCard comp={comp} corR={corR}>
                  <p>Abre a calculadora ANIGRACO, faz o calculo e guarda - depois volta aqui para continuar.</p>
                  <button onClick={()=>onNavegar?.('tampos',null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11, letterSpacing:'0.12em' }}>
                    Abrir calculadora
                  </button>
                </CompCard>
              )}

              {!comp.sempreCalculadora && temKits && (
                <div>
                  {kitsEncontrados.length>1 && !kitSel && (
                    <div style={{ marginBottom:16 }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                        Varios kits disponiveis - escolhe qual usar:
                      </div>
                      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {kitsEncontrados.map(kit => {
                          const nIt=(kit.items||[]).length
                          const tot=(kit.items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)
                          return (
                            <button key={kit.id} onClick={()=>escolherKit(kit)} className="proj-kit-card"
                              style={{ display:'flex', alignItems:'center', gap:14, background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)' }}>{kit.name}</div>
                                {kit.notas&&<div style={{ fontSize:11, fontWeight:300, color:'var(--neo-text2)', marginTop:2 }}>{kit.notas}</div>}
                                <div style={{ display:'flex', gap:10, marginTop:4 }}>
                                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)' }}>{nIt} artigo{nIt!==1?'s':''}</span>
                                  {tot>0&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:'var(--neo-gold)' }}>{f2(tot)} EUR</span>}
                                </div>
                              </div>
                              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:comp.cor, letterSpacing:'0.1em' }}>Usar</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {kitSel && (
                    <div>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:comp.cor }}>
                          {kitSel.name}
                        </div>
                        {kitsEncontrados.length>1 && (
                          <button onClick={()=>{setKitSelId(null);setKitItems([])}} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
                            trocar kit
                          </button>
                        )}
                      </div>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                        X remove · sub substitui por outro da mesma categoria
                      </div>
                      <div style={{ background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', overflow:'hidden' }}>
                        {kitItems.map((item,idx) => (
                          <KitItemRow key={item.artId||idx} item={item}
                            onChange={inc=>setKitItems(p=>p.map((x,i)=>i===idx?{...x,incluido:inc}:x))}
                            onSubstituir={()=>setSubst({idx,cat:item.cat,sub:item.sub||''})}/>
                        ))}
                      </div>
                      <div style={{ display:'flex', gap:8, marginTop:14 }}>
                        <button onClick={tentarSaltar} className="neo-btn neo-btn-ghost" style={{ flex:1, height:44, fontSize:10 }}>Saltar</button>
                        <button onClick={confirmarKit} disabled={loading} className="neo-btn neo-btn-gold" style={{ flex:2, height:44, fontSize:10 }}>
                          {loading?'A adicionar...':`Adicionar (${kitItems.filter(i=>i.incluido).length} artigos)`}
                        </button>
                      </div>
                    </div>
                  )}

                  {!kitSel && kitsEncontrados.length===1 && (
                    <div style={{ padding:'20px', textAlign:'center', color:'var(--neo-text2)', fontFamily:"'Barlow Condensed'", fontSize:10 }}>A carregar kit...</div>
                  )}
                </div>
              )}

              {!comp.sempreCalculadora && !temKits && (
                <CompCard comp={comp} corR={corR}>
                  <p>
                    {comp.destCat
                      ? `Selecciona os artigos de "${comp.destCat}" na Biblioteca e volta aqui.`
                      : 'Selecciona os servicos na Mao de Obra e volta aqui.'}
                  </p>
                  <div style={{ background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.15)', borderRadius:'var(--neo-radius-sm)', padding:'10px 14px', marginBottom:20, fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', color:'var(--neo-text2)' }}>
                    Podes criar um kit de <strong style={{color:'var(--neo-gold)'}}>{comp.label}</strong> na seccao <strong style={{color:'var(--neo-gold)'}}>Kits</strong> para nao teres de seleccionar manualmente da proxima vez.
                  </div>
                  <button onClick={()=>onNavegar?.(comp.destino||'biblioteca', comp.destCat||null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11, letterSpacing:'0.12em' }}>
                    Abrir {comp.label}
                  </button>
                </CompCard>
              )}

              {!comp.sempreCalculadora && (
                <button onClick={tentarSaltar} className="neo-btn neo-btn-ghost"
                  style={{ width:'100%', height:44, fontSize:10, marginTop: temKits&&kitSel ? 0 : 12 }}>
                  {compPorFazer.length===1
                    ? 'Concluido - ver resumo'
                    : `Feito - proximo: ${COMPONENTES.find(c=>c.id===proximo)?.label||''}`}
                </button>
              )}
              {comp.sempreCalculadora && (
                <button onClick={tentarSaltar} className="neo-btn neo-btn-ghost"
                  style={{ width:'100%', height:44, fontSize:10, marginTop:12 }}>
                  {compPorFazer.length===1
                    ? 'Tampos calculados - ver resumo'
                    : `Tampos calculados - proximo: ${COMPONENTES.find(c=>c.id===proximo)?.label||''}`}
                </button>
              )}
            </div>
          )
        })()}

        {/* RESUMO */}
        {passo === 'resumo' && (
          <div>
            <PassoHeader numero="v" titulo="Projecto concluido" sub={tipoActual?`${tipoActual.icon} ${tipoActual.label}`:''} cor="var(--neo-gold)"/>
            {totalOrc > 0 && (
              <div style={{ background:'rgba(200,169,110,0.08)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius)', padding:'20px 24px', textAlign:'center', marginTop:20, marginBottom:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:8 }}>Total PVP indicativo</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:36, fontWeight:700, color:'var(--neo-gold)' }}>{f2(totalOrc)} EUR</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text2)', letterSpacing:'0.1em', marginTop:6 }}>{orcItems.length} item{orcItems.length!==1?'s':''} no orcamento</div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
              {compFeitos.map(id => {
                const c = COMPONENTES.find(x=>x.id===id)
                return (
                  <div key={id} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:`3px solid ${c?.cor||'var(--neo-gold)'}`, padding:'10px 14px' }}>
                    <span style={{ fontSize:16 }}>{c?.icon}</span>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c?.cor||'var(--neo-gold)' }}>{c?.label}</span>
                    <span style={{ marginLeft:'auto', fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-gold)', letterSpacing:'0.1em' }}>v</span>
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button onClick={()=>onNavegar?.('orcamentos')} className="neo-btn neo-btn-gold"
                style={{ width:'100%', height:48, fontSize:11 }}>
                Ver orcamento completo
              </button>
              <button onClick={voltarALista} className="neo-btn neo-btn-ghost"
                style={{ width:'100%', height:44, fontSize:10 }}>
                Voltar a lista de projectos
              </button>
            </div>
          </div>
        )}

      </div>

      {/* MODAL APAGAR */}
      {confirmApagar && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmApagar(null)}}>
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head">
              Apagar projecto
              <button className="neo-modal-close" onClick={()=>setConfirmApagar(null)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              Tens a certeza? Esta accao apaga o projecto e o seu orcamento.<br/>
              <span style={{ fontSize:10 }}>Nao e possivel recuperar.</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="neo-btn neo-btn-danger" onClick={()=>apagarProjecto(confirmApagar)} style={{ width:'100%', height:44, fontSize:10 }}>
                Apagar definitivamente
              </button>
              <button className="neo-btn neo-btn-ghost" onClick={()=>setConfirmApagar(null)} style={{ width:'100%', height:40, fontSize:9, opacity:0.6 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SALTAR */}
      {confirmSaltar && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmSaltar(false)}}>
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head">
              Sem artigos adicionados
              <button className="neo-modal-close" onClick={()=>setConfirmSaltar(false)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              Nao adicionaste nenhum artigo para este componente.<br/>
              <span style={{ fontSize:10 }}>Queres avançar sem adicionar nada?</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="neo-btn neo-btn-ghost" onClick={()=>{ setConfirmSaltar(false); marcarFeitoEAvancar(compActual) }} style={{ width:'100%', height:44, fontSize:10 }}>
                Sim, avançar
              </button>
              <button className="neo-btn neo-btn-gold" onClick={()=>setConfirmSaltar(false)} style={{ width:'100%', height:44, fontSize:10 }}>
                Voltar e adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SAIR DO GUIA */}
      {confirmSairGuia && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmSairGuia(false)}}>
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head">
              Sair do guia
              <button className="neo-modal-close" onClick={()=>setConfirmSairGuia(false)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              O progresso sera guardado automaticamente.<br/>
              <span style={{ fontSize:10 }}>Podes retomar este projecto a qualquer momento.</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="neo-btn neo-btn-gold" onClick={()=>{ setConfirmSairGuia(false); voltarALista() }} style={{ width:'100%', height:44, fontSize:10 }}>
                Guardar e voltar a lista
              </button>
              <button className="neo-btn neo-btn-ghost" onClick={()=>setConfirmSairGuia(false)} style={{ width:'100%', height:40, fontSize:9, opacity:0.6 }}>
                Continuar no guia
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IDENTIDADE */}
      {modalId && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setModalId(false)}}>
          <div className="neo-modal" style={{ maxWidth:380 }}>
            <div className="neo-modal-head">
              Identificar projecto
              <button className="neo-modal-close" onClick={()=>setModalId(false)}>X</button>
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:6 }}>Nome do cliente</div>
              <input
                value={modalNome}
                onChange={e=>setModalNome(e.target.value)}
                placeholder="ex: Joao Silva"
                autoFocus
                style={{ width:'100%', background:'var(--neo-bg)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--neo-radius-sm)', padding:'10px 12px', fontFamily:"'Barlow'", fontSize:14, color:'var(--neo-text)', outline:'none', boxSizing:'border-box' }}
              />
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)' }}>Campos adicionais</div>
                <button onClick={()=>setModalCampos(p=>[...p,{chave:'',valor:''}])}
                  style={{ background:'transparent', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius-pill)', padding:'3px 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', color:'var(--neo-gold)' }}>
                  + Adicionar
                </button>
              </div>
              {modalCampos.length === 0 && (
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.08em', opacity:0.6 }}>
                  ex: Processo, Nr de obra, Nota...
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {modalCampos.map((c,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <input value={c.chave} onChange={e=>setModalCampos(p=>p.map((x,j)=>j===i?{...x,chave:e.target.value}:x))} placeholder="Campo"
                      style={{ width:100, flexShrink:0, background:'var(--neo-bg)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--neo-radius-sm)', padding:'7px 10px', fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text2)', outline:'none' }}/>
                    <input value={c.valor} onChange={e=>setModalCampos(p=>p.map((x,j)=>j===i?{...x,valor:e.target.value}:x))} placeholder="Valor"
                      style={{ flex:1, background:'var(--neo-bg)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--neo-radius-sm)', padding:'7px 10px', fontFamily:"'Barlow'", fontSize:13, color:'var(--neo-text)', outline:'none' }}/>
                    <button onClick={()=>setModalCampos(p=>p.filter((_,j)=>j!==i))}
                      style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:14, padding:'4px 6px', lineHeight:1, flexShrink:0 }}>X</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="neo-btn neo-btn-ghost" onClick={()=>setModalId(false)} style={{ flex:1, height:42, fontSize:10 }}>Cancelar</button>
              <button className="neo-btn neo-btn-gold" onClick={guardarIdentidade} style={{ flex:2, height:42, fontSize:10 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SUBSTITUICAO */}
      {subst && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setSubst(null)}}>
          <div className="neo-modal" style={{ maxWidth:480 }}>
            <div className="neo-modal-head">
              Substituir artigo
              <button className="neo-modal-close" onClick={()=>setSubst(null)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
              {subst.sub || subst.cat} - escolhe o artigo substituto
            </div>
            {kitItems[subst.idx] && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--neo-radius-sm)', marginBottom:14 }}>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', flexShrink:0 }}>ACTUAL</span>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{kitItems[subst.idx].ref}</span>
                <span style={{ fontSize:12, fontWeight:300, color:'var(--neo-text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{kitItems[subst.idx].desc}</span>
                {kitItems[subst.idx].price>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(kitItems[subst.idx].price)} EUR</span>}
              </div>
            )}
            <div className="neo-scroll" style={{ maxHeight:'50vh', overflowY:'auto' }}>
              {artsCat.length===0
                ? <div style={{ padding:'30px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Sem artigos em {subst.sub||subst.cat}</div>
                : (() => {
                    const precoActual = kitItems[subst.idx]?.price || 0
                    const renderArt = (art) => {
                      const diff = precoActual>0 ? art.price - precoActual : null
                      return (
                        <div key={art.id} className="tampo-ref-row" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{art.ref}</span>
                              {art.price>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(art.price)} EUR</span>}
                              {diff!==null&&diff!==0&&(
                                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, color:diff>0?'#f87171':'#4ade80', flexShrink:0 }}>
                                  {diff>0?'+':''}{f2(diff)} EUR
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:1 }}>
                              {art.supplier&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)' }}>{art.supplier}</span>}
                              {art.link&&<a href={art.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-gold2)', textDecoration:'none', letterSpacing:'0.08em' }}>link</a>}
                            </div>
                          </div>
                          <button onClick={()=>substituir(art)} className="neo-btn neo-btn-gold" style={{ height:30, padding:'0 14px', fontSize:9, flexShrink:0 }}>
                            Usar este
                          </button>
                        </div>
                      )
                    }
                    return (
                      <>
                        {artsSub.length>0 && artsSub.map(renderArt)}
                        {artsSub.length>0 && artsResto.length>0 && (
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', margin:'4px 0' }}>
                            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
                            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#4a4a42', flexShrink:0 }}>Outros em {subst.cat}</span>
                            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
                          </div>
                        )}
                        {artsResto.map(renderArt)}
                      </>
                    )
                  })()
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CompCard({ comp, corR, children }) {
  return (
    <div style={{ background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', border:`1px solid rgba(${corR},0.2)`, padding:'28px 20px', textAlign:'center', marginBottom:14 }}>
      <div style={{ fontSize:44, marginBottom:14 }}>{comp.icon}</div>
      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:comp.cor, marginBottom:10 }}>{comp.label}</div>
      <div style={{ fontSize:13, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.7, marginBottom:20, maxWidth:300, margin:'0 auto 20px' }}>
        {children}
      </div>
    </div>
  )
}

function PassoHeader({ numero, titulo, sub, cor, icon }) {
  const mostrarCirculo = icon != null || numero != null
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
        {mostrarCirculo && (
          <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:cor?`${cor}22`:'rgba(200,169,110,0.15)', border:`1px solid ${cor||'var(--neo-gold)'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:cor||'var(--neo-gold)' }}>
            {icon||numero}
          </div>
        )}
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--neo-text)' }}>{titulo}</div>
      </div>
      {sub && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', color:'var(--neo-text2)', paddingLeft: mostrarCirculo ? 38 : 0, lineHeight:1.6 }}>{sub}</div>}
    </div>
  )
}

function KitItemRow({ item, onChange, onSubstituir }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:item.incluido?'transparent':'rgba(0,0,0,0.12)', opacity:item.incluido?1:0.45, transition:'all .15s' }}>
      <button onClick={()=>onChange(!item.incluido)} style={{ width:20, height:20, borderRadius:4, border:item.incluido?'2px solid var(--neo-gold)':'2px solid rgba(255,255,255,0.15)', background:item.incluido?'var(--neo-gold)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer', fontSize:11, color:'#0f0d08', fontWeight:700 }}>
        {item.incluido&&'v'}
      </button>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.06em', color:'var(--neo-gold)', flexShrink:0, minWidth:65 }}>{item.ref}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.desc}</div>
        {item.cat && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)', marginTop:1 }}>{item.cat}{item.sub?' · '+item.sub:''}</div>}
      </div>
      {item.price>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(item.price)} EUR</span>}
      {item.link && (
        <a href={item.link} target="_blank" rel="noreferrer" title="Abrir link do artigo"
          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'var(--neo-radius-pill)', background:'var(--neo-bg)', boxShadow:'var(--neo-shadow-out-sm)', textDecoration:'none', color:'var(--neo-gold2)', fontSize:11, flexShrink:0 }}
          onClick={e=>e.stopPropagation()}>&#8599;</a>
      )}
      {item.cat && (
        <button onClick={onSubstituir} title={`Substituir - ver outros em ${item.cat}`}
          style={{ background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-pill)', width:26, height:26, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--neo-shadow-out-sm)', color:'var(--neo-text2)', fontSize:9, flexShrink:0 }}>
          sub
        </button>
      )}
    </div>
  )
}

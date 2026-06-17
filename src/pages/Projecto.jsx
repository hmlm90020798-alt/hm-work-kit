import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, deleteDoc, getDoc, setDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { addToOrcamento, orcRef } from '../hooks/useOrcamento'

// ── Tipos ─────────────────────────────────────────────────────────────────
const TIPOS = [
  { id:'cozinha',    label:'Cozinha',       icon:'🍳', cor:'#c8943a' },
  { id:'banho',      label:'Casa de Banho', icon:'🚿', cor:'#4a8fa8' },
  { id:'closet',     label:'Closet',        icon:'👕', cor:'#8a9e6e' },
  { id:'suite',      label:'Suite',         icon:'🛏', cor:'#b07acc' },
  { id:'escritorio', label:'Escritorio',    icon:'💼', cor:'#7a9e9a' },
  { id:'outro',      label:'Outro',         icon:'✦',  cor:'#7a7a72' },
]

const PALETA = ['#c8943a','#8a9e6e','#7a9e9a','#b07acc','#d4b87a','#4a8fa8','#9a6e8a','#6e8a9e','#c07070']
const COR_FIXA = { 'Tampos':'#4a8fa8', 'Mao de Obra':'#b07acc', 'Bundle':'#8a9e6e' }
function corOrigem(o, i) { return COR_FIXA[o] || PALETA[i % PALETA.length] }
function f2(n) { return parseFloat(n||0).toFixed(2) }
function fEur(n) { return parseFloat(n||0).toLocaleString('pt-PT',{minimumFractionDigits:2,maximumFractionDigits:2}) + ' \u20AC' }
function gerarId() { return 'proj_' + Date.now() }

const projRef  = (id) => doc(db, 'projectos', id)
const activoRef = (uid) => doc(db, 'projecto_ativo', uid)

// ── Estilos base ──────────────────────────────────────────────────────────
const S = {
  // Inputs
  input: { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:5, padding:'7px 10px', fontFamily:"'Barlow',sans-serif", fontSize:12, fontWeight:300, color:'#e8e4dc', outline:'none' },
  textarea: { width:'100%', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:5, padding:'7px 10px', fontFamily:"'Barlow',sans-serif", fontSize:11, fontWeight:300, color:'#e8e4dc', outline:'none', resize:'vertical', lineHeight:1.6, minHeight:70 },
  label: { fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)', display:'block', marginBottom:4 },
  btnGhost: { background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:5, padding:'7px 14px', fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)', cursor:'pointer', transition:'all .15s' },
  btnGold: { background:'linear-gradient(135deg,#c8a96e,#b8924a)', border:'none', borderRadius:5, padding:'7px 16px', fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#0c0c0b', cursor:'pointer', transition:'all .15s' },
}

// ── Componente principal ──────────────────────────────────────────────────
export default function Projecto({ showToast, onNavegar }) {
  const { user } = useAuth()

  // Lista de projectos
  const [projectos,  setProjectos]  = useState([])
  const [carregado,  setCarregado]  = useState(false)

  // Projecto aberto
  const [projId,     setProjId]     = useState(null)
  const [projData,   setProjData]   = useState(null) // { nome, tipo, ref, notas }
  const [orc,        setOrc]        = useState(null)
  const [artigos,    setArtigos]    = useState([])

  // UI estado
  const [vista,      setVista]      = useState('lista') // 'lista' | 'workspace'
  const [novoModal,  setNovoModal]  = useState(false)
  const [novoNome,   setNovoNome]   = useState('')
  const [novoTipo,   setNovoTipo]   = useState('cozinha')
  const [editInfo,   setEditInfo]   = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [searchBib,  setSearchBib]  = useState('')
  const [rightTab,   setRightTab]   = useState('biblioteca') // 'biblioteca' | 'maodeobra'
  const [moData,     setMoData]     = useState([])
  const [moSearch,   setMoSearch]   = useState('')
  const [altModal,   setAltModal]   = useState(null) // { idx } — adicionar alternativa
  const [altSearch,  setAltSearch]  = useState('')

  // ── Carregar lista de projectos ────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'projectos'), orderBy('ts', 'desc'))
    return onSnapshot(q, snap => {
      setProjectos(snap.docs
        .map(d => ({ projId:d.id, ...d.data() }))
        .filter(p => p.uid === user.uid)
      )
      setCarregado(true)
    }, () => setCarregado(true))
  }, [user])

  // ── Carregar artigos da Biblioteca ─────────────────────────────────────
  useEffect(() => {
    return onSnapshot(collection(db, 'artigos'), snap => {
      setArtigos(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    }, () => {})
  }, [])

  // ── Carregar Mao de Obra ────────────────────────────────────────────────
  useEffect(() => {
    getDocs(collection(db, 'modelos')).then(snap => {
      // Usar artigos de MO directamente da biblioteca (cat Mao de Obra)
    }).catch(() => {})
  }, [])

  // ── Orçamento em tempo real ─────────────────────────────────────────────
  useEffect(() => {
    if (!projId) { setOrc(null); return }
    return onSnapshot(orcRef(projId), snap => {
      setOrc(snap.exists() ? snap.data() : { items:[] })
    }, () => {})
  }, [projId])

  // ── Abrir projecto ──────────────────────────────────────────────────────
  const abrirProjeto = async (p) => {
    setProjId(p.projId)
    setProjData({ nome:p.nome||'', tipo:p.tipo||'outro', ref:p.ref||'', notas:p.notas||'' })
    // Marcar como activo
    if (user) {
      await setDoc(activoRef(user.uid), { projId:p.projId }).catch(() => {})
    }
    setVista('workspace')
  }

  // ── Criar projecto ──────────────────────────────────────────────────────
  const criarProjeto = async () => {
    if (!novoNome.trim()) { showToast('Indica o nome do cliente'); return }
    if (!user) return
    const id = gerarId()
    const tipo = TIPOS.find(t => t.id === novoTipo) || TIPOS[0]
    const data = { uid:user.uid, projId:id, nome:novoNome.trim(), tipo:novoTipo, ref:'', notas:'', total:0, ts:Date.now() }
    await setDoc(projRef(id), data)
    setNovoModal(false)
    setNovoNome('')
    setNovoTipo('cozinha')
    abrirProjeto({ projId:id, ...data })
  }

  // ── Guardar info do projecto ────────────────────────────────────────────
  const guardarInfo = async () => {
    if (!projId || !projData) return
    await setDoc(projRef(projId), { ...projectos.find(p=>p.projId===projId), ...projData }, { merge:true }).catch(() => showToast('Erro ao guardar'))
    setEditInfo(false)
    showToast('Informação guardada')
  }

  // ── Eliminar projecto ───────────────────────────────────────────────────
  const eliminarProjeto = async (id) => {
    await deleteDoc(projRef(id)).catch(() => showToast('Erro ao eliminar'))
    setConfirmDel(null)
    if (id === projId) { setProjId(null); setVista('lista') }
  }

  // ── Orçamento: operações ────────────────────────────────────────────────
  const orcItems = orc?.items || []
  const total = orcItems.reduce((s, i) => s + (parseFloat(i.price)||0) * (parseFloat(i.qty)||1), 0)

  const removerItem = async (idx) => {
    if (!projId || !orc) return
    const items = orcItems.filter((_, i) => i !== idx)
    await setDoc(orcRef(projId), { ...orc, items }, { merge:false }).catch(() => showToast('Erro'))
  }

  const updateQty = async (idx, qty) => {
    if (!projId || !orc) return
    const val = parseFloat(qty)
    if (isNaN(val) || val <= 0) return
    const items = orcItems.map((i, n) => n===idx ? {...i, qty:val} : i)
    await setDoc(orcRef(projId), { ...orc, items }).catch(() => {})
  }

  const updatePrice = async (idx, price) => {
    if (!projId || !orc) return
    const val = parseFloat(price)
    if (isNaN(val) || val < 0) return
    const items = orcItems.map((i, n) => n===idx ? {...i, price:val} : i)
    await setDoc(orcRef(projId), { ...orc, items }).catch(() => {})
  }

  const addArtigo = async (art) => {
    if (!projId) { showToast('Sem projecto activo'); return }
    await addToOrcamento(projId, {
      ref: art.ref, desc: art.desc,
      cat: art.cat||'', sub: art.sub||'',
      price: art.price||0, supplier: art.supplier||'',
      link: art.link||'', origem: art.cat||'Biblioteca',
    }, showToast)
    // Actualizar total no projecto
    const newTotal = orcItems.reduce((s,i) => s+(parseFloat(i.price)||0)*(parseFloat(i.qty)||1), 0) + (parseFloat(art.price)||0)
    await setDoc(projRef(projId), { total:newTotal }, { merge:true }).catch(() => {})
  }

  const adicionarAlternativa = async (idx, art) => {
    if (!projId || !orc) return
    const items = orcItems.map((item, i) => {
      if (i !== idx) return item
      const alts = item.alternativas || []
      if (alts.find(a => a.ref === art.ref)) return item
      return { ...item, alternativas: [...alts, { ref:art.ref, desc:art.desc, price:art.price||0 }] }
    })
    await setDoc(orcRef(projId), { ...orc, items }).catch(() => showToast('Erro'))
    setAltModal(null)
    setAltSearch('')
    showToast('Alternativa adicionada')
  }

  const usarAlternativa = async (idx, alt) => {
    if (!projId || !orc) return
    const item = orcItems[idx]
    const antigas = item.alternativas?.filter(a => a.ref !== alt.ref) || []
    const items = orcItems.map((i, n) => n===idx ? {
      ...i,
      ref: alt.ref, desc: alt.desc, price: alt.price,
      alternativas: [...antigas, { ref:item.ref, desc:item.desc, price:item.price }]
    } : i)
    await setDoc(orcRef(projId), { ...orc, items }).catch(() => showToast('Erro'))
    showToast('Alternativa aplicada')
  }

  const removerAlternativa = async (idx, altRef) => {
    if (!projId || !orc) return
    const items = orcItems.map((item, i) => i!==idx ? item : {
      ...item, alternativas: (item.alternativas||[]).filter(a => a.ref !== altRef)
    })
    await setDoc(orcRef(projId), { ...orc, items }).catch(() => {})
  }

  // ── Agrupar orçamento por origem ────────────────────────────────────────
  const grupos = React.useMemo(() => {
    const map = new Map()
    orcItems.forEach((item, idx) => {
      const key = item.origem || 'Outros'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push({ ...item, _idx:idx })
    })
    return Array.from(map.entries()).map(([origem, items], gi) => ({
      origem, items,
      cor: corOrigem(origem, gi),
      total: items.reduce((s, i) => s + (parseFloat(i.price)||0)*(parseFloat(i.qty)||1), 0)
    }))
  }, [orcItems])

  // ── Filtrar artigos direito ─────────────────────────────────────────────
  const artigosFiltrados = React.useMemo(() => {
    const q = searchBib.toLowerCase()
    if (!q) return artigos.slice(0, 40)
    return artigos.filter(a =>
      (a.ref && a.ref.toLowerCase().includes(q)) ||
      (a.desc && a.desc.toLowerCase().includes(q))
    ).slice(0, 40)
  }, [artigos, searchBib])

  const moFiltrados = React.useMemo(() => {
    const q = moSearch.toLowerCase()
    return artigos.filter(a => a.cat === 'Mão de Obra' || a.cat === 'Instalação').filter(a =>
      !q || (a.ref && a.ref.toLowerCase().includes(q)) || (a.desc && a.desc.toLowerCase().includes(q))
    ).slice(0, 40)
  }, [artigos, moSearch])

  const altFiltrados = React.useMemo(() => {
    const q = altSearch.toLowerCase()
    if (!q) return artigos.slice(0, 20)
    return artigos.filter(a =>
      (a.ref && a.ref.toLowerCase().includes(q)) ||
      (a.desc && a.desc.toLowerCase().includes(q))
    ).slice(0, 20)
  }, [artigos, altSearch])

  const tipoActual = TIPOS.find(t => t.id === projData?.tipo)

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  // ── VISTA: LISTA ────────────────────────────────────────────────────────
  if (vista === 'lista') return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', background:'#0c0c0b', overflow:'hidden' }}>

      {/* Header lista */}
      <div style={{ display:'flex', alignItems:'center', gap:12, padding:'0 20px', height:48, borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#e8e4dc' }}>Projectos</div>
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'rgba(255,255,255,0.25)', letterSpacing:'0.06em' }}>{projectos.length} projectos</div>
        <div style={{ flex:1 }} />
        <button onClick={() => setNovoModal(true)} style={S.btnGold}>+ Novo projecto</button>
      </div>

      {/* Lista */}
      <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
        {!carregado && (
          <div style={{ textAlign:'center', padding:'60px 0', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)' }}>A carregar…</div>
        )}
        {carregado && projectos.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.15)', marginBottom:16 }}>Sem projectos</div>
            <button onClick={() => setNovoModal(true)} style={S.btnGold}>Criar primeiro projecto</button>
          </div>
        )}
        {projectos.map(p => {
          const tipo = TIPOS.find(t => t.id === p.tipo) || TIPOS[TIPOS.length-1]
          return (
            <div key={p.projId} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 16px', marginBottom:6, background:'#111110', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid ' + tipo.cor, borderRadius:8, cursor:'pointer', transition:'all .15s' }}
              onMouseOver={e => e.currentTarget.style.background='#161614'}
              onMouseOut={e => e.currentTarget.style.background='#111110'}>
              <div style={{ fontSize:20, flexShrink:0 }}>{tipo.icon}</div>
              <div style={{ flex:1, minWidth:0 }} onClick={() => abrirProjeto(p)}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.06em', color:'#e8e4dc', marginBottom:3 }}>{p.nome || 'Sem nome'}</div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:tipo.cor, opacity:0.8 }}>{tipo.label}</span>
                  {p.ref && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'rgba(255,255,255,0.25)' }}>{p.ref}</span>}
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'rgba(255,255,255,0.2)' }}>{new Date(p.ts).toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
              {p.total > 0 && (
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700, color:'rgba(200,148,58,0.8)', flexShrink:0 }} onClick={() => abrirProjeto(p)}>
                  {fEur(p.total)}
                </div>
              )}
              <button onClick={() => setConfirmDel(p.projId)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.15)', fontSize:16, padding:'4px 6px', flexShrink:0, transition:'color .15s' }}
                onMouseOver={e => e.currentTarget.style.color='rgba(255,80,80,0.6)'}
                onMouseOut={e => e.currentTarget.style.color='rgba(255,255,255,0.15)'}>✕</button>
            </div>
          )
        })}
      </div>

      {/* Modal novo projecto */}
      {novoModal && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#111110', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', width:'100%', maxWidth:420, padding:'24px 24px 20px' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#e8e4dc', marginBottom:20 }}>Novo projecto</div>
            <div style={{ marginBottom:14 }}>
              <label style={S.label}>Nome do cliente</label>
              <input autoFocus value={novoNome} onChange={e=>setNovoNome(e.target.value)} onKeyDown={e=>e.key==='Enter'&&criarProjeto()} placeholder="ex: A. Borges" style={S.input} />
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={S.label}>Tipo</label>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6 }}>
                {TIPOS.map(t => (
                  <button key={t.id} onClick={() => setNovoTipo(t.id)} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 10px', borderRadius:6, border:'1px solid ' + (novoTipo===t.id ? t.cor+'55' : 'rgba(255,255,255,0.07)'), background: novoTipo===t.id ? t.cor+'15' : 'transparent', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', color: novoTipo===t.id ? t.cor : 'rgba(255,255,255,0.35)', transition:'all .15s' }}>
                    <span>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setNovoModal(false)} style={S.btnGhost}>Cancelar</button>
              <button onClick={criarProjeto} style={S.btnGold}>Criar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm eliminar */}
      {confirmDel && (
        <div style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#111110', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', padding:'24px', maxWidth:360, width:'100%' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.06em', color:'#e8e4dc', marginBottom:16 }}>Eliminar este projecto permanentemente?</div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setConfirmDel(null)} style={S.btnGhost}>Cancelar</button>
              <button onClick={() => eliminarProjeto(confirmDel)} style={{ ...S.btnGold, background:'rgba(200,60,60,0.8)' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // ── VISTA: WORKSPACE ────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'#0c0c0b' }}>

      {/* Topbar workspace */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'0 16px', height:46, background:'#0f0f0e', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
        <button onClick={() => setVista('lista')} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', display:'flex', alignItems:'center', gap:5, padding:0, transition:'color .15s' }}
          onMouseOver={e=>e.currentTarget.style.color='#c8a96e'}
          onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.3)'}>
          ← Projectos
        </button>
        <div style={{ width:1, height:16, background:'rgba(255,255,255,0.08)' }} />
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.06em', color:'#e8e4dc' }}>{projData?.nome || 'Projecto'}</div>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:tipoActual?.cor || '#c8943a', letterSpacing:'0.1em', textTransform:'uppercase' }}>{tipoActual?.icon} {tipoActual?.label}</div>
        </div>
        {total > 0 && (
          <div style={{ background:'rgba(200,148,58,0.1)', border:'1px solid rgba(200,148,58,0.25)', borderRadius:99, padding:'4px 14px', fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'#c8a96e', letterSpacing:'0.06em', flexShrink:0 }}>
            {fEur(total)}
          </div>
        )}
        <button onClick={() => { onNavegar?.('proposta') }} style={{ ...S.btnGhost, fontSize:9, padding:'5px 10px' }}>Proposta</button>
      </div>

      {/* Workspace body */}
      <div style={{ display:'grid', gridTemplateColumns:'186px 1fr 210px', flex:1, overflow:'hidden' }}>

        {/* ── PAINEL ESQUERDO — Info ── */}
        <div style={{ background:'#0f0f0e', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:1, overflowY:'auto', padding:'14px 12px', display:'flex', flexDirection:'column', gap:14 }}>

            <div>
              <label style={S.label}>Cliente</label>
              <input value={projData?.nome||''} onChange={e=>setProjData(p=>({...p,nome:e.target.value}))} onBlur={guardarInfo} style={S.input} />
            </div>

            <div>
              <label style={S.label}>Tipo</label>
              <div style={{ display:'flex', flexDirection:'column', gap:3 }}>
                {TIPOS.map(t => (
                  <button key={t.id} onClick={async ()=>{ setProjData(p=>({...p,tipo:t.id})); await setDoc(projRef(projId),{tipo:t.id},{merge:true}) }}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:5, border:'1px solid ' + (projData?.tipo===t.id ? t.cor+'55' : 'rgba(255,255,255,0.06)'), background: projData?.tipo===t.id ? t.cor+'12' : 'transparent', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.06em', textTransform:'uppercase', color: projData?.tipo===t.id ? t.cor : 'rgba(255,255,255,0.3)', transition:'all .15s', textAlign:'left' }}>
                    <span style={{ fontSize:14 }}>{t.icon}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />

            <div>
              <label style={S.label}>Referência</label>
              <input value={projData?.ref||''} onChange={e=>setProjData(p=>({...p,ref:e.target.value}))} onBlur={guardarInfo} placeholder="ex: OS 4521" style={S.input} />
            </div>

            <div>
              <label style={S.label}>Notas</label>
              <textarea value={projData?.notas||''} onChange={e=>setProjData(p=>({...p,notas:e.target.value}))} onBlur={guardarInfo} placeholder="Notas do projecto, pedidos do cliente…" style={S.textarea} />
            </div>

          </div>
        </div>

        {/* ── CENTRO — Orçamento ── */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden', background:'#0c0c0b' }}>

          <div style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)' }}>
              Orçamento · {orcItems.length} artigo{orcItems.length!==1?'s':''}
            </div>
          </div>

          <div style={{ flex:1, overflowY:'auto' }}>
            {orcItems.length === 0 && (
              <div style={{ textAlign:'center', padding:'60px 20px', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.12)' }}>
                Adiciona artigos da Biblioteca →
              </div>
            )}
            {grupos.map(grupo => (
              <div key={grupo.origem} style={{ marginBottom:2 }}>
                {/* Cabeçalho do grupo */}
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(255,255,255,0.02)', borderBottom:'1px solid rgba(255,255,255,0.04)', borderLeft:'2px solid ' + grupo.cor }}>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:grupo.cor, opacity:0.8 }}>{grupo.origem}</div>
                  <div style={{ marginLeft:'auto', fontFamily:"'Barlow Condensed'", fontSize:9, color:'rgba(255,255,255,0.2)' }}>{fEur(grupo.total)}</div>
                </div>
                {/* Itens do grupo */}
                {grupo.items.map(item => (
                  <React.Fragment key={item._idx}>
                    <OrcItem item={item} idx={item._idx} onRemove={removerItem} onQty={updateQty} onPrice={updatePrice} onAlt={() => { setAltModal(item._idx); setAltSearch('') }} />
                    {/* Alternativas */}
                    {(item.alternativas||[]).map(alt => (
                      <div key={alt.ref} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 16px 6px 30px', borderBottom:'1px solid rgba(255,255,255,0.02)', background:'rgba(0,0,0,0.15)' }}>
                        <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(200,148,58,0.45)', width:72, flexShrink:0 }}>{alt.ref}</div>
                        <div style={{ fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.3)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{alt.desc}</div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'rgba(255,255,255,0.2)', width:58, textAlign:'right', flexShrink:0 }}>{fEur(alt.price)}</div>
                        <button onClick={() => usarAlternativa(item._idx, alt)} style={{ background:'transparent', border:'1px solid rgba(200,148,58,0.2)', borderRadius:3, padding:'2px 8px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(200,148,58,0.5)', flexShrink:0, transition:'all .15s' }}
                          onMouseOver={e=>{e.currentTarget.style.borderColor='rgba(200,148,58,0.5)';e.currentTarget.style.color='#c8943a'}}
                          onMouseOut={e=>{e.currentTarget.style.borderColor='rgba(200,148,58,0.2)';e.currentTarget.style.color='rgba(200,148,58,0.5)'}}>
                          Usar
                        </button>
                        <button onClick={() => removerAlternativa(item._idx, alt.ref)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.1)', fontSize:11, padding:'2px 4px', transition:'color .15s' }}
                          onMouseOver={e=>e.currentTarget.style.color='rgba(255,80,80,0.5)'}
                          onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.1)'}>✕</button>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>

          {/* Footer total */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', marginBottom:2 }}>Total</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:20, fontWeight:700, color:'#c8a96e' }}>{fEur(total)}</div>
            </div>
            <button onClick={() => onNavegar?.('orcamentos')} style={S.btnGhost}>Ver orçamento completo</button>
          </div>
        </div>

        {/* ── DIREITA — Biblioteca rápida ── */}
        <div style={{ background:'#0f0f0e', borderLeft:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', overflow:'hidden' }}>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
            {[['biblioteca','Biblioteca'],['maodeobra','Mão Obra']].map(([id,label]) => (
              <button key={id} onClick={() => setRightTab(id)} style={{ flex:1, padding:'8px 6px', background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color: rightTab===id ? '#c8943a' : 'rgba(255,255,255,0.25)', borderBottom: rightTab===id ? '2px solid #c8943a' : '2px solid transparent', transition:'all .15s' }}>
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ padding:'8px 10px', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
            <input
              value={rightTab==='biblioteca' ? searchBib : moSearch}
              onChange={e => rightTab==='biblioteca' ? setSearchBib(e.target.value) : setMoSearch(e.target.value)}
              placeholder="Pesquisar artigo..."
              style={{ ...S.input, padding:'6px 10px', fontSize:11 }}
            />
          </div>

          {/* Lista */}
          <div style={{ flex:1, overflowY:'auto' }}>
            {(rightTab==='biblioteca' ? artigosFiltrados : moFiltrados).map(art => (
              <div key={art.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderBottom:'1px solid rgba(255,255,255,0.03)', cursor:'pointer', transition:'background .1s' }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'#c8943a', width:58, flexShrink:0 }}>{art.ref}</div>
                <div style={{ fontSize:11, fontWeight:300, color:'rgba(255,255,255,0.6)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                <button onClick={() => addArtigo(art)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(200,148,58,0.4)', fontSize:16, padding:'2px', flexShrink:0, transition:'color .15s', lineHeight:1 }}
                  onMouseOver={e=>e.currentTarget.style.color='#c8943a'}
                  onMouseOut={e=>e.currentTarget.style.color='rgba(200,148,58,0.4)'}>+</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal alternativa */}
      {altModal !== null && (
        <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,0.65)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div style={{ background:'#111110', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', width:'100%', maxWidth:460, display:'flex', flexDirection:'column', maxHeight:'70vh' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 18px', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#e8e4dc' }}>Adicionar alternativa</div>
              <button onClick={() => setAltModal(null)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:18 }}>✕</button>
            </div>
            <div style={{ padding:'10px 18px', borderBottom:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
              <input value={altSearch} onChange={e=>setAltSearch(e.target.value)} placeholder="Pesquisar artigo alternativo..." style={{ ...S.input }} autoFocus />
            </div>
            <div style={{ flex:1, overflowY:'auto' }}>
              {altFiltrados.map(art => (
                <div key={art.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 18px', borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer', transition:'background .1s' }}
                  onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                  onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#c8943a', width:72, flexShrink:0 }}>{art.ref}</div>
                  <div style={{ fontSize:12, fontWeight:300, color:'#e8e4dc', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'rgba(255,255,255,0.3)', width:52, textAlign:'right', flexShrink:0 }}>{fEur(art.price)}</div>
                  <button onClick={() => adicionarAlternativa(altModal, art)} style={S.btnGold}>+ Alt</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Componente OrcItem ────────────────────────────────────────────────────
function OrcItem({ item, idx, onRemove, onQty, onPrice, onAlt }) {
  const [editQty,   setEditQty]   = useState(false)
  const [editPrice, setEditPrice] = useState(false)
  const [qtyVal,    setQtyVal]    = useState(item.qty||1)
  const [priceVal,  setPriceVal]  = useState(item.price||0)

  const subtotal = (parseFloat(item.price)||0) * (parseFloat(item.qty)||1)

  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, padding:'9px 16px', borderBottom:'1px solid rgba(255,255,255,0.03)', transition:'background .1s' }}
      onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
      onMouseOut={e=>e.currentTarget.style.background='transparent'}>

      <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'#c8943a', width:72, flexShrink:0 }}>{item.ref}</div>

      <div style={{ fontSize:12, fontWeight:300, color:'#e8e4dc', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.desc}</div>

      {/* Qty */}
      {editQty ? (
        <input type="number" value={qtyVal} onChange={e=>setQtyVal(e.target.value)}
          onBlur={()=>{ onQty(idx, qtyVal); setEditQty(false) }}
          onKeyDown={e=>e.key==='Enter'&&(onQty(idx,qtyVal),setEditQty(false))}
          autoFocus style={{ width:40, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(200,148,58,0.3)', borderRadius:4, padding:'2px 4px', color:'#e8e4dc', fontSize:11, textAlign:'center', outline:'none' }} />
      ) : (
        <div onClick={()=>{ setQtyVal(item.qty||1); setEditQty(true) }} style={{ fontSize:10, color:'rgba(255,255,255,0.25)', width:20, textAlign:'center', cursor:'pointer', flexShrink:0 }} title="Editar quantidade">×{item.qty||1}</div>
      )}

      {/* Price */}
      {editPrice ? (
        <input type="number" value={priceVal} onChange={e=>setPriceVal(e.target.value)}
          onBlur={()=>{ onPrice(idx, priceVal); setEditPrice(false) }}
          onKeyDown={e=>e.key==='Enter'&&(onPrice(idx,priceVal),setEditPrice(false))}
          autoFocus style={{ width:60, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(200,148,58,0.3)', borderRadius:4, padding:'2px 4px', color:'#c8a96e', fontSize:11, textAlign:'right', outline:'none' }} />
      ) : (
        <div onClick={()=>{ setPriceVal(item.price||0); setEditPrice(true) }} style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.45)', width:58, textAlign:'right', cursor:'pointer', flexShrink:0 }} title="Editar preço">
          {parseFloat(item.price||0).toFixed(2)} €
        </div>
      )}

      <button onClick={() => onAlt(idx)} title="Adicionar alternativa" style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.12)', fontSize:13, padding:'2px 3px', flexShrink:0, transition:'color .15s', lineHeight:1 }}
        onMouseOver={e=>e.currentTarget.style.color='rgba(200,148,58,0.6)'}
        onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.12)'}>⇄</button>

      <button onClick={() => onRemove(idx)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.1)', fontSize:13, padding:'2px 4px', flexShrink:0, transition:'color .15s' }}
        onMouseOver={e=>e.currentTarget.style.color='rgba(255,80,80,0.5)'}
        onMouseOut={e=>e.currentTarget.style.color='rgba(255,255,255,0.1)'}>✕</button>
    </div>
  )
}

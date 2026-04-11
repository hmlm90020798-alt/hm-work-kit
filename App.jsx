import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import Biblioteca from './pages/Biblioteca'
import Modelos from './pages/Modelos'
import Orcamentos from './pages/Orcamentos'
import Tampos from './pages/Tampos'
import MaoDeObra from './pages/MaoDeObra'
import IA from './pages/IA'
import KC from './pages/KC'
import Proposta from './pages/Proposta'
import Projecto from './pages/Projecto'
import Login from './pages/Login'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

const PAGES = [
  { id:'projecto',   label:'Novo Projecto', sub:'Guia passo a passo'        },
  { id:'biblioteca', label:'Biblioteca',    sub:'Artigos e referências'      },
  { id:'modelos',    label:'Kits',          sub:'Templates de projecto'      },
  { id:'orcamentos', label:'Orçamentos',    sub:'Cálculo de material'        },
  { id:'tampos',     label:'Tampos',        sub:'Calculadora ANIGRACO'       },
  { id:'maodeobra',  label:'Mão de Obra',   sub:'Serviços e instalações'     },
  { id:'ia',         label:'IA',            sub:'Assistente de orçamentação' },
  { id:'kc',         label:'KC',            sub:'Cozinhas Centralizadas'     },
  { id:'proposta',   label:'Proposta',      sub:'Decomposição do orçamento'  },
]

const DEFAULT_ORDER = PAGES.map(p => p.id)
const prefsRef = (uid) => doc(db, 'preferencias', uid)

function Shell() {
  const { user, loading, logout } = useAuth()
  const [page, setPage]             = useState('projecto')   // abre no guia
  const [menuOpen, setMenuOpen]     = useState(true)
  const [editMenu, setEditMenu]     = useState(false)
  const [menuOrder, setMenuOrder]   = useState(DEFAULT_ORDER)
  const [prefsLoaded, setPrefsLoaded] = useState(false)
  const [tampoParaAbrir, setTampoParaAbrir] = useState(null)
  // filtro de categoria para quando o Projecto navega para a Biblioteca
  const [bibCatFiltro, setBibCatFiltro] = useState(null)
  const { msg, visible, showToast } = useToast()

  // Estado global de referências copiadas
  const [copiedRefs, setCopiedRefs] = useState(new Set())
  const markCopied  = (ref) => setCopiedRefs(prev => new Set([...prev, ref]))
  const clearCopied = () => setCopiedRefs(new Set())

  // Carregar preferências do Firestore
  useEffect(() => {
    if (!user) return
    getDoc(prefsRef(user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        if (Array.isArray(data.menuOrder) && data.menuOrder.length === PAGES.length) {
          setMenuOrder(data.menuOrder)
        }
      } else {
        try {
          const saved = JSON.parse(localStorage.getItem('hm_menu_order'))
          if (Array.isArray(saved) && saved.length === PAGES.length) {
            setMenuOrder(saved)
            setDoc(prefsRef(user.uid), { menuOrder: saved }, { merge: true }).catch(() => {})
            localStorage.removeItem('hm_menu_order')
          }
        } catch {}
      }
      setPrefsLoaded(true)
    }).catch(() => {
      try {
        const saved = JSON.parse(localStorage.getItem('hm_menu_order'))
        if (Array.isArray(saved) && saved.length === PAGES.length) setMenuOrder(saved)
      } catch {}
      setPrefsLoaded(true)
    })
  }, [user])

  const orderedPages = menuOrder.map(id => PAGES.find(p => p.id === id)).filter(Boolean)

  const moveMenuItem = (idx, dir) => {
    setMenuOrder(prev => {
      const arr = [...prev]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= arr.length) return prev
      const tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp
      setDoc(prefsRef(user.uid), { menuOrder: arr }, { merge: true }).catch(() => {
        localStorage.setItem('hm_menu_order', JSON.stringify(arr))
      })
      return arr
    })
  }

  if (loading || (!prefsLoaded && user)) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a09' }}>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.24em', color:'#2e2e2b', textTransform:'uppercase' }}>A carregar</span>
    </div>
  )

  if (!user) return <Login />

  const goTo = (id) => { setPage(id); setMenuOpen(false) }

  // Navegação a partir do Projecto — permite passar filtro de categoria
  const navegarDeProjecto = (destino, catFiltro = null) => {
    setBibCatFiltro(catFiltro)
    setPage(destino)
    setMenuOpen(false)
  }

  const copyProps = { copiedRefs, markCopied, clearCopied }

  // Cor de destaque por página — "Novo Projecto" tem cor especial
  const corPagina = (id) => {
    if (id === 'projecto') return '#e8cc8a'
    return '#f0ede8'
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#0a0a09' }}>

      {/* HEADER */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', height:52,
        background:'#0a0a09', flexShrink:0, position:'relative', zIndex:10,
        boxShadow: menuOpen ? 'none' : '0 1px 0 rgba(255,255,255,0.04)'
      }}>
        <button onClick={() => setMenuOpen(o=>!o)} style={{ background:'transparent', border:'none', cursor:'pointer', padding:'6px', display:'flex', flexDirection:'column', gap:5 }}>
          <span style={{ display:'block', width:22, height:1, background:'rgba(255,255,255,0.4)', transition:'all .25s', transform: menuOpen ? 'rotate(45deg) translateY(3px)' : 'none' }}/>
          <span style={{ display:'block', width:14, height:1, background:'rgba(255,255,255,0.4)', transition:'all .25s', opacity: menuOpen ? 0 : 1 }}/>
          {!menuOpen && <span style={{ display:'block', width:22, height:1, background:'rgba(255,255,255,0.4)', transition:'all .25s' }}/>}
          {menuOpen  && <span style={{ display:'block', width:22, height:1, background:'rgba(255,255,255,0.4)', transform:'rotate(-45deg) translateY(-3px)', transition:'all .25s' }}/>}
        </button>

        <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'#f0ede8', whiteSpace:'nowrap', pointerEvents:'none' }}>
          HM·<span style={{ color:'#c8a96e' }}>WK</span>
        </div>

        {copiedRefs.size > 0 && (
          <button onClick={clearCopied}
            style={{ position:'absolute', right:60, top:'50%', transform:'translateY(-50%)',
              background:'rgba(200,169,110,0.12)', border:'1px solid rgba(200,169,110,0.3)',
              borderRadius:'var(--neo-radius-pill)', padding:'4px 10px', cursor:'pointer',
              fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.1em',
              textTransform:'uppercase', color:'#c8a96e', display:'flex', alignItems:'center', gap:5,
              whiteSpace:'nowrap' }}>
            ✓ {copiedRefs.size} <span style={{ opacity:.6, fontWeight:400 }}>limpar</span>
          </button>
        )}

        {user.photoURL
          ? <img src={user.photoURL} alt="" style={{ width:30, height:30, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)' }}/>
          : <div style={{ width:30, height:30, borderRadius:'50%', background:'#c8a96e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'#1a1610' }}>{(user.displayName||'U')[0].toUpperCase()}</div>
        }
      </header>

      {/* MENU */}
      {menuOpen && (
        <div style={{ position:'fixed', inset:0, top:52, background:'#0a0a09', zIndex:9, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ height:1, background:'linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.3) 50%, transparent 100%)', flexShrink:0 }}/>

          <nav style={{ flex:1, overflowY:'auto', padding:'16px 20px' }}>
            {/* Layout fixo em cartões — ignora menuOrder em modo normal, usa-o só no editMenu */}
            {editMenu ? (
              /* MODO EDIÇÃO — lista linear para reordenar */
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {orderedPages.map((p, i) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10,
                    background:'#0f0f0e', border:'1px solid rgba(255,255,255,0.07)',
                    borderRadius:6, padding:'10px 14px' }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:2, flexShrink:0 }}>
                      <button onClick={() => moveMenuItem(i,-1)} disabled={i===0}
                        style={{ background:'transparent', border:'none', cursor:i===0?'default':'pointer',
                          color:i===0?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.35)', fontSize:10, lineHeight:1, padding:'2px 4px' }}>▲</button>
                      <button onClick={() => moveMenuItem(i,1)} disabled={i===orderedPages.length-1}
                        style={{ background:'transparent', border:'none', cursor:i===orderedPages.length-1?'default':'pointer',
                          color:i===orderedPages.length-1?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.35)', fontSize:10, lineHeight:1, padding:'2px 4px' }}>▼</button>
                    </div>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700,
                      letterSpacing:'0.06em', textTransform:'uppercase', color:'#f0ede8' }}>{p.label}</span>
                  </div>
                ))}
              </div>
            ) : (
              /* MODO NORMAL — grid de cartões */
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>

                {/* Hero — Novo Projecto */}
                {(() => {
                  const p = PAGES.find(x => x.id === 'projecto')
                  const isActive = page === 'projecto'
                  return (
                    <button key="projecto" onClick={() => goTo('projecto')}
                      className="proj-kit-card"
                      style={{
                        width:'100%', background:'#0f0f0e', border:`1px solid ${isActive ? '#c8a96e' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius:6, padding:'16px 20px', cursor:'pointer', textAlign:'left',
                        display:'flex', alignItems:'center', justifyContent:'space-between',
                        transition:'all .15s',
                      }}>
                      <div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:24, fontWeight:700,
                          letterSpacing:'0.07em', textTransform:'uppercase',
                          color: isActive ? '#e8cc8a' : '#c8a96e', lineHeight:1, marginBottom:4 }}>
                          <span style={{
                            display:'inline-block', width:7, height:7, borderRadius:'50%',
                            background:'#e8cc8a', boxShadow:'0 0 8px rgba(232,204,138,0.6)',
                            marginRight:9, verticalAlign:'middle', position:'relative', top:-1,
                          }}/>
                          {p.label}
                        </div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em',
                          textTransform:'uppercase', color: isActive ? '#b8943a' : '#4a4a42' }}>{p.sub}</div>
                      </div>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14,
                        color: isActive ? '#b8943a' : '#2a2a27', transition:'color .2s' }}>→</span>
                    </button>
                  )
                })()}

                {/* Linha 1 — Biblioteca, Kits, Tampos */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {['biblioteca','modelos','tampos'].map(id => {
                    const p = PAGES.find(x => x.id === id)
                    const isActive = page === id
                    return (
                      <button key={id} onClick={() => goTo(id)}
                        className="proj-kit-card"
                        style={{
                          background:'#0f0f0e', border:`1px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius:6, padding:'12px 14px', cursor:'pointer', textAlign:'left',
                          transition:'all .15s',
                        }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700,
                          letterSpacing:'0.06em', textTransform:'uppercase',
                          color: isActive ? '#38bdf8' : '#f0ede8', lineHeight:1, marginBottom:3 }}>{p.label}</div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.14em',
                          textTransform:'uppercase', color: isActive ? '#1a8ab8' : '#3a3a35' }}>{p.sub}</div>
                      </button>
                    )
                  })}
                </div>

                {/* Linha 2 — Mão de Obra, IA, KC */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
                  {['maodeobra','ia','kc'].map(id => {
                    const p = PAGES.find(x => x.id === id)
                    const isActive = page === id
                    return (
                      <button key={id} onClick={() => goTo(id)}
                        className="proj-kit-card"
                        style={{
                          background:'#0f0f0e', border:`1px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius:6, padding:'12px 14px', cursor:'pointer', textAlign:'left',
                          transition:'all .15s',
                        }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700,
                          letterSpacing:'0.06em', textTransform:'uppercase',
                          color: isActive ? '#38bdf8' : '#f0ede8', lineHeight:1, marginBottom:3 }}>{p.label}</div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.14em',
                          textTransform:'uppercase', color: isActive ? '#1a8ab8' : '#3a3a35' }}>{p.sub}</div>
                      </button>
                    )
                  })}
                </div>

                {/* Linha 3 — Orçamentos + Proposta */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {['orcamentos','proposta'].map(id => {
                    const p = PAGES.find(x => x.id === id)
                    const isActive = page === id
                    return (
                      <button key={id} onClick={() => goTo(id)}
                        className="proj-kit-card"
                        style={{
                          background:'#0f0f0e', border:`1px solid ${isActive ? '#c8a96e' : 'rgba(255,255,255,0.07)'}`,
                          borderRadius:6, padding:'12px 14px', cursor:'pointer', textAlign:'left',
                          transition:'all .15s',
                        }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700,
                          letterSpacing:'0.06em', textTransform:'uppercase',
                          color: isActive ? '#c8a96e' : '#f0ede8', lineHeight:1, marginBottom:3 }}>{p.label}</div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.14em',
                          textTransform:'uppercase', color: isActive ? '#8a6e3a' : '#3a3a35' }}>{p.sub}</div>
                      </button>
                    )
                  })}
                </div>

              </div>
            )}
          </nav>

          <div style={{ padding:'12px 28px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#f0ede8', marginBottom:2 }}>{user.displayName || ''}</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'#6a6762' }}>{user.email}</div>
            </div>
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={() => setEditMenu(o=>!o)} style={{ background: editMenu ? 'rgba(200,169,110,0.15)' : 'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'6px 12px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color: editMenu ? '#c8a96e' : '#6a6762', transition:'all .15s' }}>
                {editMenu ? '✓ Feito' : '⇅ Ordenar'}
              </button>
              <button onClick={logout} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'6px 14px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6a6762', transition:'all .15s' }}>
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PÁGINA */}
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>

        {/* Banner "← Voltar ao Projecto" — visível em todas as páginas excepto no próprio Projecto */}
        {page !== 'projecto' && (() => {
          const estado = (() => { try { return JSON.parse(localStorage.getItem('hm_proj_estado')) } catch { return null } })()
          const temProjecto = estado && estado.passo && estado.passo !== 'tipo'
          if (!temProjecto) return null
          const tipoLabel = estado.tipo
            ? (['cozinha','banho','closet','suite','escritorio','outro'].includes(estado.tipo)
                ? {cozinha:'🍳 Cozinha',banho:'🚿 Casa de Banho',closet:'👕 Closet',suite:'🛏 Suíte',escritorio:'💼 Escritório',outro:'✦ Outro'}[estado.tipo]
                : estado.tipo)
            : null
          return (
            <button onClick={() => goTo('projecto')} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'8px 16px', background:'rgba(200,169,110,0.07)',
              border:'none', borderBottom:'1px solid rgba(200,169,110,0.15)',
              cursor:'pointer', width:'100%', textAlign:'left',
              flexShrink:0, transition:'background .15s',
            }}
            onMouseOver={e=>e.currentTarget.style.background='rgba(200,169,110,0.12)'}
            onMouseOut={e=>e.currentTarget.style.background='rgba(200,169,110,0.07)'}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-gold)', letterSpacing:'0.1em' }}>←</span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-gold)' }}>
                Voltar ao Projecto
              </span>
              {tipoLabel && (
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'rgba(200,169,110,0.6)', marginLeft:4 }}>
                  — {tipoLabel}
                </span>
              )}
              <span style={{ marginLeft:'auto', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', color:'rgba(200,169,110,0.5)', textTransform:'uppercase' }}>
                em curso
              </span>
            </button>
          )
        })()}

        {page === 'projecto'   && <Projecto   showToast={showToast} onNavegar={navegarDeProjecto} />}
        {page === 'biblioteca' && <Biblioteca showToast={showToast} {...copyProps} catFiltroInicial={bibCatFiltro} onCatFiltroUsado={()=>setBibCatFiltro(null)} />}
        {page === 'modelos'    && <Modelos    showToast={showToast} {...copyProps} />}
        {page === 'orcamentos' && <Orcamentos showToast={showToast} {...copyProps} onOpenTampo={(c)=>{ setTampoParaAbrir(c); setPage('tampos') }} />}
        {page === 'tampos'     && <Tampos     showToast={showToast} {...copyProps} abrirCalculo={tampoParaAbrir} onAbrirCalculoDone={()=>setTampoParaAbrir(null)} />}
        {page === 'maodeobra'  && <MaoDeObra  showToast={showToast} {...copyProps} userId={user.uid} />}
        {page === 'ia'         && <IA         showToast={showToast} {...copyProps} />}
        {page === 'kc'         && <KC         showToast={showToast} {...copyProps} />}
        {page === 'proposta'   && <Proposta   showToast={showToast} />}
      </main>

      <Toast msg={msg} visible={visible} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}

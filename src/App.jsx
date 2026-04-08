import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Biblioteca from './pages/Biblioteca'
import Modelos from './pages/Modelos'
import Orcamentos from './pages/Orcamentos'
import Tampos from './pages/Tampos'
import MaoDeObra from './pages/MaoDeObra'
import IA from './pages/IA'
import KC from './pages/KC'
import Login from './pages/Login'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

const PAGES = [
  { id:'biblioteca', label:'Biblioteca', sub:'Artigos e referências' },
  { id:'modelos',    label:'Modelos',    sub:'Templates de projecto' },
  { id:'orcamentos', label:'Orçamentos', sub:'Cálculo de material' },
  { id:'tampos',     label:'Tampos',     sub:'Calculadora ANIGRACO' },
  { id:'maodeobra',  label:'Mão de Obra',sub:'Serviços e instalações' },
  { id:'ia',         label:'IA',         sub:'Assistente de orçamentação' },
  { id:'kc',         label:'KC',         sub:'Cozinhas Centralizadas' },
]

function Shell() {
  const { user, loading, logout } = useAuth()
  const [page, setPage]       = useState('biblioteca')
  const [menuOpen, setMenuOpen] = useState(true)
  const [tampoParaAbrir, setTampoParaAbrir] = useState(null)
  const { msg, visible, showToast } = useToast()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a09' }}>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.24em', color:'#2e2e2b', textTransform:'uppercase' }}>A carregar</span>
    </div>
  )

  if (!user) return <Login />

  const goTo = (id) => { setPage(id); setMenuOpen(false) }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#0a0a09' }}>

      {/* HEADER */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', height:52,
        background:'#0a0a09', flexShrink:0, position:'relative', zIndex:10,
        boxShadow: menuOpen ? 'none' : '0 1px 0 rgba(255,255,255,0.04)'
      }}>
        {/* Hambúrguer */}
        <button onClick={() => setMenuOpen(o=>!o)} style={{ background:'transparent', border:'none', cursor:'pointer', padding:'6px', display:'flex', flexDirection:'column', gap:5 }}>
          <span style={{ display:'block', width:22, height:1, background:'rgba(255,255,255,0.4)', transition:'all .25s',
            transform: menuOpen ? 'rotate(45deg) translateY(3px)' : 'none' }}/>
          <span style={{ display:'block', width:14, height:1, background:'rgba(255,255,255,0.4)', transition:'all .25s',
            opacity: menuOpen ? 0 : 1 }}/>
          {!menuOpen && <span style={{ display:'block', width:22, height:1, background:'rgba(255,255,255,0.4)', transform: menuOpen ? 'rotate(-45deg) translateY(-3px)' : 'none', transition:'all .25s' }}/>}
          {menuOpen  && <span style={{ display:'block', width:22, height:1, background:'rgba(255,255,255,0.4)', transform:'rotate(-45deg) translateY(-3px)', transition:'all .25s' }}/>}
        </button>

        {/* Logo */}
        <div style={{ position:'absolute', left:'50%', transform:'translateX(-50%)', fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'#f0ede8', whiteSpace:'nowrap', pointerEvents:'none' }}>
          HM·<span style={{ color:'#c8a96e' }}>WK</span>
        </div>

        {/* Avatar */}
        {user.photoURL
          ? <img src={user.photoURL} alt="" style={{ width:30, height:30, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)' }}/>
          : <div style={{ width:30, height:30, borderRadius:'50%', background:'#c8a96e', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'#1a1610' }}>{(user.displayName||'U')[0].toUpperCase()}</div>
        }
      </header>

      {/* MENU — ocupa o ecrã todo */}
      {menuOpen && (
        <div style={{
          position:'fixed', inset:0, top:52, background:'#0a0a09', zIndex:9,
          display:'flex', flexDirection:'column', overflow:'hidden'
        }}>
          {/* Linha decorativa */}
          <div style={{ height:1, background:'linear-gradient(90deg, transparent 0%, rgba(200,169,110,0.3) 50%, transparent 100%)', flexShrink:0 }}/>

          {/* Nav */}
          <nav style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 28px' }}>
            {PAGES.map((p, i) => {
              const isActive = page === p.id
              return (
                <button key={p.id} onClick={() => goTo(p.id)}
                  style={{
                    background:'transparent', border:'none',
                    borderBottom:'1px solid rgba(255,255,255,0.05)',
                    padding:'20px 0', cursor:'pointer',
                    textAlign:'left', display:'flex', alignItems:'center', justifyContent:'space-between',
                    gap:16, transition:'all .15s'
                  }}>
                  <div>
                    <div style={{
                      fontFamily:"'Barlow Condensed'",
                      fontSize: isActive ? 40 : 34,
                      fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
                      color: isActive ? '#c8a96e' : '#f0ede8',
                      lineHeight:1, transition:'all .2s'
                    }}>
                      {p.label}
                    </div>
                    <div style={{
                      fontFamily:"'Barlow Condensed'",
                      fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase',
                      color: isActive ? '#8a6e3a' : '#3d3d39',
                      marginTop:4, transition:'color .2s'
                    }}>
                      {p.sub}
                    </div>
                  </div>
                  <span style={{
                    fontFamily:"'Barlow Condensed'", fontSize:14,
                    color: isActive ? '#8a6e3a' : '#2a2a27',
                    transition:'color .2s'
                  }}>→</span>
                </button>
              )
            })}
          </nav>

          {/* Rodapé */}
          <div style={{ padding:'20px 28px', borderTop:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase', color:'#f0ede8', marginBottom:2 }}>
                {user.displayName || ''}
              </div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'#3d3d39' }}>
                {user.email}
              </div>
            </div>
            <button onClick={logout} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:20, padding:'6px 14px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'#6a6762', transition:'all .15s' }}>
              Sair
            </button>
          </div>
        </div>
      )}

      {/* PÁGINA */}
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {page === 'biblioteca' && <Biblioteca showToast={showToast} />}
        {page === 'modelos'    && <Modelos    showToast={showToast} />}
        {page === 'orcamentos' && <Orcamentos showToast={showToast} onOpenTampo={(c)=>{ setTampoParaAbrir(c); setPage('tampos') }} />}
        {page === 'tampos'     && <Tampos     showToast={showToast} abrirCalculo={tampoParaAbrir} onAbrirCalculoDone={()=>setTampoParaAbrir(null)} />}
        {page === 'maodeobra'  && <MaoDeObra  showToast={showToast} />}
        {page === 'ia'         && <IA         showToast={showToast} />}
        {page === 'kc'         && <KC         showToast={showToast} />}
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

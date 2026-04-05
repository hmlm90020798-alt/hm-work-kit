import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Biblioteca from './pages/Biblioteca'
import Modelos from './pages/Modelos'
import Orcamentos from './pages/Orcamentos'
import Login from './pages/Login'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

function Shell() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState('biblioteca')
  const [menuOpen, setMenuOpen] = useState(false)
  const { msg, visible, showToast } = useToast()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <span style={{ fontFamily:'Barlow Condensed', fontSize:'10px', letterSpacing:'0.24em', color:'var(--text3)', textTransform:'uppercase' }}>A carregar</span>
    </div>
  )

  if (!user) return <Login />

  const pages = [
    { id:'biblioteca', label:'Biblioteca' },
    { id:'modelos',    label:'Modelos' },
    { id:'orcamentos', label:'Orçamentos' },
    { id:'ia',         label:'IA' },
  ]

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' }}>

      {/* HEADER */}
      <header style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 20px', height:'52px',
        borderBottom:'1px solid var(--line)', background:'var(--bg)', flexShrink:0,
        position:'relative', zIndex:10
      }}>
        {/* Hamburger mobile */}
        <button onClick={() => setMenuOpen(o => !o)} style={{
          background:'transparent', border:'none', cursor:'pointer',
          display:'flex', flexDirection:'column', gap:'5px', padding:'4px',
        }}>
          <span style={{ display:'block', width:'22px', height:'1px', background: menuOpen ? 'var(--text2)' : 'var(--text2)', transition:'all .2s' }} />
          <span style={{ display:'block', width:'14px', height:'1px', background:'var(--text2)', transition:'all .2s' }} />
        </button>

        {/* Logo centro */}
        <div style={{
          position:'absolute', left:'50%', transform:'translateX(-50%)',
          fontFamily:"'Barlow Condensed', sans-serif", fontSize:'14px', fontWeight:700,
          letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--text)',
          whiteSpace:'nowrap'
        }}>
          HM·<span style={{ color:'var(--gold)' }}>WK</span>
        </div>

        {/* Avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {user.photoURL
            ? <img src={user.photoURL} alt="" style={{ width:28, height:28, borderRadius:'50%', border:'1px solid var(--line2)' }} />
            : <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--line2)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text2)' }}>{(user.displayName||'U')[0]}</div>
          }
        </div>
      </header>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <div style={{
          position:'fixed', inset:0, background:'var(--bg)', zIndex:50,
          display:'flex', flexDirection:'column',
          paddingTop:'52px'
        }}>
          {/* fechar */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:52, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', borderBottom:'1px solid var(--line)' }}>
            <button onClick={() => setMenuOpen(false)} style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', gap:'5px', padding:'4px' }}>
              <span style={{ display:'block', width:'22px', height:'1px', background:'var(--text2)', transform:'rotate(45deg) translateY(3px)' }} />
              <span style={{ display:'block', width:'22px', height:'1px', background:'var(--text2)', transform:'rotate(-45deg) translateY(-3px)' }} />
            </button>
            <div style={{ fontFamily:"'Barlow Condensed', sans-serif", fontSize:'14px', fontWeight:700, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--text)', position:'absolute', left:'50%', transform:'translateX(-50%)' }}>
              HM·<span style={{ color:'var(--gold)' }}>WK</span>
            </div>
            <div style={{ width:30 }} />
          </div>

          {/* nav items */}
          <nav style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'0 32px' }}>
            {pages.map((p, i) => (
              <button key={p.id} onClick={() => { setPage(p.id); setMenuOpen(false);  }}
                style={{
                  background:'transparent', border:'none', borderBottom:'1px solid var(--line)',
                  padding:'24px 0', cursor:'pointer', textAlign:'left',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontSize:'32px', fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase',
                  color: page === p.id ? 'var(--gold)' : 'var(--text)',
                  transition:'color .15s'
                }}>
                <span>{p.label}</span>
                <span style={{ fontSize:'14px', color:'var(--text3)' }}>→</span>
              </button>
            ))}
          </nav>

          {/* logout */}
          <div style={{ padding:'24px 32px', borderTop:'1px solid var(--line)' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', marginBottom:8 }}>
              {user.displayName || user.email}
            </div>
            <button onClick={logout} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:'10px', letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text2)', padding:0 }}>
              Terminar sessão →
            </button>
          </div>
        </div>
      )}

      {/* PAGE */}
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {page === 'biblioteca' && <Biblioteca showToast={showToast} />}
        {page === 'modelos'    && <Modelos    showToast={showToast} />}
        {page === 'orcamentos' && <Orcamentos  showToast={showToast} />}
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

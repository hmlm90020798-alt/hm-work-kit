import React, { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Biblioteca from './pages/Biblioteca'
import Login from './pages/Login'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

function Shell() {
  const { user, loading, logout } = useAuth()
  const [page, setPage] = useState('biblioteca')
  const { msg, visible, showToast } = useToast()

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <span style={{ fontFamily:'var(--head)', fontSize:'11px', letterSpacing:'0.2em', color:'var(--text3)', textTransform:'uppercase' }}>A carregar…</span>
    </div>
  )

  if (!user) return <Login />

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh' }}>

      {/* HEADER */}
      <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:'52px', borderBottom:'1px solid var(--line)', background:'var(--bg)', flexShrink:0 }}>
        <div style={{ fontFamily:'var(--head)', fontSize:'18px', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'#fff' }}>
          HM·<span style={{ color:'var(--gold)' }}>Work</span>·Kit
        </div>

        <nav style={{ display:'flex', alignItems:'center' }}>
          {['biblioteca','modelos','orcamentos','ia'].map(p => (
            <button key={p} onClick={() => p === 'biblioteca' ? setPage(p) : showToast('Em desenvolvimento')}
              style={{
                padding:'0 16px', height:'52px', display:'flex', alignItems:'center',
                fontFamily:'var(--head)', fontSize:'11px', fontWeight:500,
                letterSpacing:'0.12em', textTransform:'uppercase',
                color: page === p ? 'var(--gold)' : 'var(--text2)',
                background:'transparent', border:'none', borderBottom: page === p ? '2px solid var(--gold)' : '2px solid transparent',
                cursor:'pointer', transition:'all .15s'
              }}>
              {p === 'orcamentos' ? 'Orçamentos' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </nav>

        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontFamily:'var(--head)', fontSize:'10px', letterSpacing:'0.08em', color:'var(--text3)' }}>
            {user.displayName || user.email}
          </span>
          <button className="btn btn-outline" onClick={logout} style={{ height:'26px', fontSize:'9px' }}>
            Sair
          </button>
        </div>
      </header>

      {/* PAGE */}
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {page === 'biblioteca' && <Biblioteca showToast={showToast} />}
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

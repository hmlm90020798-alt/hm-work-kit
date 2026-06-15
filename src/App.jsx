import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { db } from './firebase'
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore'
import Biblioteca from './pages/Biblioteca'
import Modelos from './pages/Modelos'
import Orcamentos from './pages/Orcamentos'
import Tampos from './pages/Tampos'
import MaoDeObra from './pages/MaoDeObra'
import IA from './pages/IA'
import KC from './pages/KC'
import Proposta from './pages/Proposta'
import Projecto from './pages/Projecto'
import Bundles from './pages/Bundles'
import Login from './pages/Login'
import Toast from './components/Toast'
import { useToast } from './hooks/useToast'

const prefsRef  = (uid) => doc(db, 'preferencias', uid)
const activoRef = (uid) => doc(db, 'projecto_ativo', uid)

const TIPO_LABELS = {
  cozinha:'Cozinha', banho:'Casa de Banho', closet:'Closet',
  suite:'Suite', escritorio:'Escritorio', outro:'Outro',
}

const NAV = [
  {
    label: 'Enciclopedia',
    items: [
      { id:'biblioteca', label:'Biblioteca',  icon:'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25' },
      { id:'tampos',     label:'Tampos',      icon:'M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z' },
      { id:'maodeobra',  label:'Mao de Obra', icon:'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z' },
      { id:'bundles',    label:'Bundles',     icon:'M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244' },
      { id:'modelos',    label:'Kits',        icon:'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z' },
    ]
  },
  {
    label: 'Trabalho',
    items: [
      { id:'projecto',   label:'Projectos',   icon:'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z' },
      { id:'orcamentos', label:'Orcamento',   icon:'M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z' },
      { id:'proposta',   label:'Proposta',    icon:'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z' },
    ]
  },
  {
    label: 'Ferramentas',
    items: [
      { id:'ia',  label:'IA',  icon:'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z' },
      { id:'kc',  label:'KC',  icon:'M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016 2.993 2.993 0 002.25-1.016 3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z' },
    ]
  },
]

function NavIcon({ path }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}>
      <path d={path} />
    </svg>
  )
}

function Shell() {
  const { user, loading, logout } = useAuth()
  const [page, setPage]               = useState('biblioteca')
  const [tampoParaAbrir, setTampoParaAbrir] = useState(null)
  const [bibCatFiltro, setBibCatFiltro]     = useState(null)
  const [activoProjId, setActivoProjId]     = useState(null)
  const [projectoActivo, setProjectoActivo] = useState(null)
  const [prefsLoaded, setPrefsLoaded]       = useState(false)

  const { msg, visible, showToast } = useToast()
  const [copiedRefs, setCopiedRefs] = useState(new Set())
  const markCopied  = (ref) => setCopiedRefs(prev => new Set([...prev, ref]))
  const clearCopied = () => setCopiedRefs(new Set())

  useEffect(() => {
    if (!user) return
    getDoc(prefsRef(user.uid))
      .then(() => setPrefsLoaded(true))
      .catch(() => setPrefsLoaded(true))
  }, [user])

  useEffect(() => {
    if (!user) return
    const unsub = onSnapshot(activoRef(user.uid), snap => {
      setActivoProjId(snap.exists() ? (snap.data().projId || null) : null)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!activoProjId) { setProjectoActivo(null); return }
    const unsub = onSnapshot(doc(db, 'projectos', activoProjId), snap => {
      setProjectoActivo(snap.exists() ? snap.data() : null)
    })
    return () => unsub()
  }, [activoProjId])

  if (loading || (!prefsLoaded && user)) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a09' }}>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.24em', color:'#2e2e2b', textTransform:'uppercase' }}>A carregar</span>
    </div>
  )

  if (!user) return <Login />

  const goTo = (id) => {
    setPage(id)
    if (id !== 'biblioteca') setBibCatFiltro(null)
  }

  const navegarDeProjecto = (destino, catFiltro = null) => {
    setBibCatFiltro(catFiltro)
    setPage(destino)
  }

  const copyProps = { copiedRefs, markCopied, clearCopied }
  const tipoLabel = projectoActivo?.tipo ? (TIPO_LABELS[projectoActivo.tipo] || projectoActivo.tipo) : null

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden', background:'#0a0a09' }}>

      {/* TOPBAR */}
      <header style={{ display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:48, background:'#111110', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, zIndex:20 }}>
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.18em', color:'#f0ede8' }}>
          HM<span style={{ color:'#c8a96e' }}>·</span>WK
        </div>

        {/* Projecto activo */}
        {projectoActivo && (
          <button onClick={() => goTo('projecto')} style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.22)', borderRadius:99, padding:'4px 12px', cursor:'pointer', transition:'all .15s' }}
            onMouseOver={e => e.currentTarget.style.background='rgba(200,169,110,0.16)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(200,169,110,0.1)'}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:'#c8943a', display:'inline-block', flexShrink:0 }}/>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'#c8a96e', letterSpacing:'0.06em' }}>
              {projectoActivo.nome || tipoLabel || 'Projecto'}
              {tipoLabel && projectoActivo.nome ? ' · ' + tipoLabel : ''}
            </span>
            {projectoActivo.total > 0 && (
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:'rgba(200,169,110,0.7)', marginLeft:4, letterSpacing:'0.06em' }}>
                {parseFloat(projectoActivo.total).toFixed(2)} €
              </span>
            )}
          </button>
        )}

        <div style={{ flex:1 }} />

        {copiedRefs.size > 0 && (
          <button onClick={clearCopied} style={{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:99, padding:'4px 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'#c8a96e' }}>
            {copiedRefs.size} copiado(s) · limpar
          </button>
        )}

        {user.photoURL
          ? <img src={user.photoURL} alt="" style={{ width:28, height:28, borderRadius:'50%', border:'1px solid rgba(255,255,255,0.08)', cursor:'pointer' }} onClick={logout} title="Sair" />
          : <button onClick={logout} title="Sair" style={{ width:28, height:28, borderRadius:'50%', background:'rgba(200,169,110,0.15)', border:'1px solid rgba(200,169,110,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:'#c8a96e', cursor:'pointer' }}>
              {(user.displayName||user.email||'U')[0].toUpperCase()}
            </button>
        }
      </header>

      {/* LAYOUT */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* SIDEBAR */}
        <aside style={{ width:188, background:'#0f0f0e', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', flexShrink:0, overflowY:'auto' }}>
          <div style={{ padding:'10px 0 16px', flex:1 }}>
            {NAV.map((group, gi) => (
              <div key={gi} style={{ marginBottom:4 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)', padding:'10px 18px 5px' }}>
                  {group.label}
                </div>
                {group.items.map(item => {
                  const active = page === item.id
                  return (
                    <button key={item.id} onClick={() => goTo(item.id)}
                      style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'7px 10px', margin:'1px 8px', width:'calc(100% - 16px)', background: active ? 'rgba(200,169,110,0.09)' : 'transparent', border: active ? '1px solid rgba(200,169,110,0.18)' : '1px solid transparent', borderRadius:6, cursor:'pointer', textAlign:'left', transition:'all .12s', color: active ? '#c8a96e' : 'rgba(255,255,255,0.38)' }}
                      onMouseOver={e => { if (!active) { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.62)' }}}
                      onMouseOut={e => { if (!active) { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.38)' }}}>
                      <NavIcon path={item.icon} />
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.04em', fontWeight: active ? 600 : 400 }}>
                        {item.label}
                      </span>
                      {item.id === 'projecto' && projectoActivo && (
                        <span style={{ marginLeft:'auto', width:6, height:6, borderRadius:'50%', background:'#c8943a', flexShrink:0 }} />
                      )}
                    </button>
                  )
                })}
                {gi < NAV.length - 1 && (
                  <div style={{ height:1, background:'rgba(255,255,255,0.04)', margin:'8px 16px' }} />
                )}
              </div>
            ))}
          </div>

          {/* User footer */}
          <div style={{ padding:'12px 16px', borderTop:'1px solid rgba(255,255,255,0.05)', flexShrink:0 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.08em', color:'rgba(255,255,255,0.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {user.displayName || user.email}
            </div>
          </div>
        </aside>

        {/* CONTEUDO */}
        <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
          {page === 'projecto'   && <Projecto   showToast={showToast} onNavegar={navegarDeProjecto} />}
          {page === 'biblioteca' && <Biblioteca showToast={showToast} {...copyProps} catFiltroInicial={bibCatFiltro} activoProjId={activoProjId} />}
          {page === 'modelos'    && <Modelos    showToast={showToast} {...copyProps} userId={user.uid} />}
          {page === 'orcamentos' && <Orcamentos showToast={showToast} {...copyProps} onOpenTampo={(c)=>{ setTampoParaAbrir(c); setPage('tampos') }} activoProjId={activoProjId} />}
          {page === 'tampos'     && <Tampos     showToast={showToast} {...copyProps} abrirCalculo={tampoParaAbrir} onAbrirCalculoDone={()=>setTampoParaAbrir(null)} activoProjId={activoProjId} />}
          {page === 'maodeobra'  && <MaoDeObra  showToast={showToast} {...copyProps} userId={user.uid} activoProjId={activoProjId} />}
          {page === 'ia'         && <IA         showToast={showToast} {...copyProps} activoProjId={activoProjId} />}
          {page === 'kc'         && <KC         showToast={showToast} {...copyProps} />}
          {page === 'proposta'   && <Proposta   showToast={showToast} activoProjId={activoProjId} />}
          {page === 'bundles'    && <Bundles    showToast={showToast} />}
        </main>
      </div>

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

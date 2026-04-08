import React, { useState } from 'react'
import { KC_DATA, GUIA } from '../data/kcData'


// flatten todos os itens com cat+sub
const ALL_ITEMS = KC_DATA.flatMap(g => g.items.map(i => ({ ...i, cat: g.cat, sub: g.sub })))
const CATS = ['Todas', ...new Set(KC_DATA.map(g => g.cat))]

export default function KC({ showToast }) {
  const [tab,       setTab]       = useState('guia')
  const [search,    setSearch]    = useState('')
  const [activeCat, setActiveCat] = useState('Todas')
  const [activeSub, setActiveSub] = useState('')
  const [catOpen,   setCatOpen]   = useState(false)

  const KC_BLUE     = '#4a9ec0'
  const KC_BLUE_DIM = 'rgba(74,158,192,0.15)'
  const KC_GOLD     = '#c8a96e'

  // subs da categoria activa
  const subsForCat = activeCat === 'Todas' ? [] :
    [...new Set(KC_DATA.filter(g => g.cat === activeCat).map(g => g.sub))]

  const filtered = ALL_ITEMS.filter(i => {
    const mc  = activeCat === 'Todas' ? true : i.cat === activeCat
    const ms  = !activeSub || i.sub === activeSub
    const q   = search.toLowerCase()
    const mq  = !q || i.ref.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)
    return mc && ms && mq
  })

  const grouped = filtered.reduce((acc, i) => {
    const key = i.cat + '||' + i.sub
    if (!acc[key]) acc[key] = { cat: i.cat, sub: i.sub, items: [] }
    acc[key].items.push(i)
    return acc
  }, {})

  const selectCat = (c) => { setActiveCat(c); setActiveSub(''); setCatOpen(false) }
  const copy = (ref) => {
    navigator.clipboard.writeText(ref).catch(() => {})
    showToast('Referência copiada — ' + ref)
  }

  const TAB_BTN = (id, label) => (
    <button onClick={() => setTab(id)} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      padding: '10px 20px', borderBottom: tab === id ? `2px solid ${id === 'guia' ? KC_GOLD : KC_BLUE}` : '2px solid transparent',
      fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: tab === id ? (id === 'guia' ? KC_GOLD : KC_BLUE) : 'var(--neo-text2)',
      transition: 'all .15s', whiteSpace: 'nowrap',
    }}>{label}</button>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--neo-bg)' }}>

      {/* TABS */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.06)', flexShrink:0, paddingLeft:8 }}>
        {TAB_BTN('guia', '📋 Guia Operacional')}
        {TAB_BTN('refs', '🔍 Referências KC')}
      </div>

      {/* ── TAB GUIA ── */}
      {tab === 'guia' && (
        <div style={{ flex:1, overflowY:'auto', padding:'16px' }} className="neo-scroll">
          {GUIA.map(fase => (
            <div key={fase.fase} style={{ marginBottom: 28 }}>
              {/* Cabeçalho fase */}
              <div style={{
                display:'flex', alignItems:'center', gap:10, marginBottom:16,
                paddingBottom:8, borderBottom:`2px solid ${fase.cor}44`
              }}>
                <div style={{ width:3, height:22, background:fase.cor, borderRadius:2, flexShrink:0 }}/>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:16, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:fase.cor }}>
                  {fase.fase}
                </span>
              </div>

              {fase.seccoes.map((sec, si) => (
                <div key={si} style={{
                  marginBottom:14, padding:'12px 14px',
                  background: sec.destaque ? `${fase.cor}0f` : 'var(--neo-bg2)',
                  borderRadius:'var(--neo-radius-sm)',
                  border: sec.destaque ? `1px solid ${fase.cor}33` : '1px solid rgba(255,255,255,0.04)',
                  boxShadow:'var(--neo-shadow-out-sm)',
                }}>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color: sec.destaque ? fase.cor : 'var(--neo-text)', marginBottom:10 }}>
                    {sec.titulo}
                  </div>

                  {sec.passos && sec.passos.map((p, pi) => (
                    <div key={pi} style={{ display:'flex', gap:8, marginBottom:6, alignItems:'flex-start' }}>
                      <span style={{ color:fase.cor, fontSize:10, flexShrink:0, marginTop:3, opacity:.7 }}>▸</span>
                      <span style={{ fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--neo-text)', lineHeight:1.6 }}>{p}</span>
                    </div>
                  ))}

                  {sec.subseccoes && sec.subseccoes.map((ss, ssi) => (
                    <div key={ssi} style={{ marginTop:10, paddingLeft:12, borderLeft:`2px solid ${fase.cor}33` }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:fase.cor, marginBottom:6, opacity:.8 }}>
                        {ss.sub}
                      </div>
                      {ss.passos.map((p, pi) => (
                        <div key={pi} style={{ display:'flex', gap:8, marginBottom:5, alignItems:'flex-start' }}>
                          <span style={{ color:fase.cor, fontSize:10, flexShrink:0, marginTop:3, opacity:.5 }}>·</span>
                          <span style={{ fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.6 }}>{p}</span>
                        </div>
                      ))}
                    </div>
                  ))}

                  {sec.nota && (
                    <div style={{ marginTop:8, padding:'8px 10px', background:'rgba(255,255,255,0.03)', borderRadius:6, borderLeft:`2px solid ${fase.cor}55` }}>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:fase.cor, opacity:.7 }}>Nota </span>
                      <span style={{ fontFamily:"'Barlow'", fontSize:11, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.5 }}>{sec.nota}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB REFERÊNCIAS ── */}
      {tab === 'refs' && (
        <>
      {/* TOPBAR refs */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ position:'relative', flexShrink:0 }}>
          <button onClick={() => setCatOpen(o => !o)} style={{
            background: activeCat !== 'Todas' ? KC_BLUE_DIM : 'var(--neo-bg2)',
            border: activeCat !== 'Todas' ? `1px solid ${KC_BLUE}44` : '1px solid transparent',
            borderRadius:'var(--neo-radius-pill)', padding:'0 14px', height:34, cursor:'pointer',
            fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, letterSpacing:'0.12em',
            textTransform:'uppercase', color: activeCat !== 'Todas' ? KC_BLUE : 'var(--neo-text2)',
            boxShadow:'var(--neo-shadow-out-sm)', display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap',
          }}>
            {activeCat === 'Todas' ? 'Categoria' : activeCat.replace('KC · ','')}
            <span style={{ fontSize:8, opacity:.6 }}>▼</span>
          </button>
          {catOpen && (
            <div className="neo-dropdown" style={{ position:'absolute', top:'calc(100% + 6px)', left:0, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', boxShadow:'var(--neo-shadow-out)', zIndex:50, minWidth:200, overflow:'hidden' }}>
              {CATS.map(c => (
                <button key={c} onClick={() => selectCat(c)} style={{
                  display:'block', width:'100%', padding:'10px 14px', background: activeCat===c ? 'var(--neo-bg)' : 'transparent',
                  border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10,
                  letterSpacing:'0.1em', textTransform:'uppercase',
                  color: activeCat===c ? KC_BLUE : 'var(--neo-text2)', textAlign:'left',
                }}>
                  {c === 'Todas' ? 'Todas as categorias' : c.replace('KC · ','')}
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex:1, position:'relative' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar ref. ou descrição…"
            style={{ width:'100%', background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-sm)', boxShadow:'var(--neo-shadow-in-sm)', padding:'9px 36px 9px 14px', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--neo-text)', outline:'none', boxSizing:'border-box' }}
          />
          {search
            ? <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:13 }}>✕</button>
            : <span style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', color:'var(--neo-text2)', fontSize:14, pointerEvents:'none' }}>⌕</span>
          }
        </div>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', flexShrink:0 }}>
          {filtered.length} ref.
        </span>
      </div>

      {/* SUBS */}
      {subsForCat.length > 0 && (
        <div style={{ display:'flex', gap:6, padding:'8px 16px', overflowX:'auto', flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={() => setActiveSub('')} style={{
            flexShrink:0, background: activeSub==='' ? KC_BLUE_DIM : 'var(--neo-bg2)',
            border: activeSub==='' ? `1px solid ${KC_BLUE}55` : '1px solid transparent',
            borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', cursor:'pointer',
            fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.12em',
            textTransform:'uppercase', color: activeSub==='' ? KC_BLUE : 'var(--neo-text2)',
          }}>Todas</button>
          {subsForCat.map(s => (
            <button key={s} onClick={() => setActiveSub(s)} style={{
              flexShrink:0, background: activeSub===s ? KC_BLUE_DIM : 'var(--neo-bg2)',
              border: activeSub===s ? `1px solid ${KC_BLUE}55` : '1px solid transparent',
              borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', cursor:'pointer',
              fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.12em',
              textTransform:'uppercase', color: activeSub===s ? KC_BLUE : 'var(--neo-text2)',
            }}>{s}</button>
          ))}
        </div>
      )}

      {/* LISTA */}
      <div style={{ flex:1, overflowY:'auto', padding:'8px 16px 16px' }} className="neo-scroll">
        {Object.values(grouped).length === 0 && (
          <div style={{ textAlign:'center', padding:'48px 0', fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
            Nenhum resultado
          </div>
        )}
        {Object.values(grouped).map(group => (
          <div key={group.cat + group.sub} style={{ marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, paddingBottom:6, borderBottom:`1px solid ${KC_BLUE}22` }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color: KC_BLUE, opacity:.7 }}>
                {group.cat.replace('KC · ','')}
              </span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-text)' }}>
                {group.sub}
              </span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em', marginLeft:'auto' }}>
                {group.items.length}
              </span>
            </div>
            {group.items.map(item => (
              <KCRow key={item.ref} item={item} onCopy={copy} kcBlue={KC_BLUE} />
            ))}
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  )
}

function KCRow({ item, onCopy, kcBlue }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    onCopy(item.ref)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div style={{
      display:'flex', alignItems:'center', gap:10,
      padding:'8px 10px', marginBottom:3,
      background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)',
      borderLeft:`2px solid ${kcBlue}44`,
      boxShadow:'var(--neo-shadow-out-sm)',
    }}>
      {/* Ref */}
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700, letterSpacing:'0.06em', color: kcBlue, flexShrink:0, minWidth:80 }}>
        {item.ref}
      </span>

      {/* Desc */}
      <span style={{ fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--neo-text)', flex:1, lineHeight:1.3 }}>
        {item.desc}
      </span>

      {/* Copy */}
      <button onClick={handleCopy} style={{
        flexShrink:0, background: copied ? `linear-gradient(145deg,${kcBlue},#2a6a8a)` : 'var(--neo-bg)',
        border:'none', borderRadius:'var(--neo-radius-pill)', width:28, height:28,
        cursor:'pointer', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: copied ? 'var(--neo-shadow-in-sm)' : 'var(--neo-shadow-out-sm)',
        color: copied ? '#fff' : 'var(--neo-text2)', transition:'all .15s',
      }}>
        {copied ? '✓' : '⎘'}
      </button>
    </div>
  )
}

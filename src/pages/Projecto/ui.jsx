import React from 'react'
import { f2 } from './constantes'

export function PassoHeader({ numero, titulo, sub, cor, icon }) {
  const mostrarCirculo = icon != null || numero != null
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
        {mostrarCirculo && (
          <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0,
            background:cor?`${cor}22`:'rgba(200,169,110,0.15)',
            border:`1px solid ${cor||'var(--neo-gold)'}44`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:cor||'var(--neo-gold)' }}>
            {icon||numero}
          </div>
        )}
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--neo-text)' }}>{titulo}</div>
      </div>
      {sub && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', color:'var(--neo-text2)', paddingLeft: mostrarCirculo ? 38 : 0, lineHeight:1.6 }}>{sub}</div>}
    </div>
  )
}

export function CompCard({ comp, corR, children }) {
  return (
    <div style={{ background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', border:`1px solid rgba(${corR},0.2)`, padding:'28px 20px', textAlign:'center', marginBottom:14 }}>
      <div style={{ fontSize:44, marginBottom:14 }}>{comp.icon}</div>
      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:comp.cor, marginBottom:10 }}>{comp.label}</div>
      <div style={{ fontSize:13, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.7, maxWidth:300, margin:'0 auto 20px' }}>
        {children}
      </div>
    </div>
  )
}

export function KitItemRow({ item, onChange, onSubstituir }) {
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
        <a href={item.link} target="_blank" rel="noreferrer"
          style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:26, height:26, borderRadius:'var(--neo-radius-pill)', background:'var(--neo-bg)', boxShadow:'var(--neo-shadow-out-sm)', textDecoration:'none', color:'var(--neo-gold2)', fontSize:11, flexShrink:0 }}
          onClick={e=>e.stopPropagation()}>lnk</a>
      )}
      {item.cat && (
        <button onClick={onSubstituir}
          style={{ background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-pill)', width:26, height:26, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--neo-shadow-out-sm)', color:'var(--neo-text2)', fontSize:11, flexShrink:0 }}>
          sub
        </button>
      )}
    </div>
  )
}

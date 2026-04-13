import React, { useState } from 'react'
import { f2 } from './constantes'
import { PassoHeader } from './ui'

export default function Lista({ projectos, tipos, tiposActivos, onAbrir, onOrcamento, onNovo, onApagar, saveTipos }) {
  const [editTipos, setEditTipos] = useState(false)

  return (
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
              return (
                <div key={proj.projId} style={{ background:'var(--neo-bg2)', border:'1px solid rgba(200,169,110,0.18)', borderLeft:'3px solid var(--neo-gold)', borderRadius:'var(--neo-radius)', overflow:'hidden' }}>
                  <div style={{ padding:'14px 16px 10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontSize:20, flexShrink:0 }}>{tObj?.icon || '*'}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {proj.nome || tObj?.label || 'Projecto'}
                        </div>
                        {proj.nome && tObj && (
                          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', color:'var(--neo-text2)', marginTop:2 }}>{tObj.icon} {tObj.label}</div>
                        )}
                      </div>
                      {(proj.total||0) > 0 && (
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, color:'var(--neo-gold)', flexShrink:0 }}>{f2(proj.total)} EUR</div>
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
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => onAbrir(proj.projId)}
                      style={{ background:'transparent', border:'none', borderRight:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', padding:'11px 16px', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-gold)', textAlign:'left' }}>
                      Abrir
                    </button>
                    <button onClick={() => onOrcamento(proj.projId)}
                      style={{ background:'transparent', border:'none', borderRight:'1px solid rgba(255,255,255,0.06)', cursor:'pointer', padding:'11px 16px', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)', textAlign:'left' }}>
                      Orcamento
                    </button>
                    <button onClick={() => onApagar(proj.projId)}
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
          <button key={t.id} onClick={() => onNovo(t)} className="proj-tipo-card"
            style={{ background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'22px 16px', cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <span style={{ fontSize:32, lineHeight:1 }}>{t.icon}</span>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text)' }}>{t.label}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop:20 }}>
        <button onClick={()=>setEditTipos(o=>!o)}
          style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', padding:'4px 0', opacity:0.6 }}>
          {editTipos ? 'v Fechar' : 'Gerir tipos'}
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
  )
}

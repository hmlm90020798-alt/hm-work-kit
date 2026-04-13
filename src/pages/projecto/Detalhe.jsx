import React from 'react'
import { f2 } from './constantes'

// Agrupa itens do orcamento por origem
function agruparPorOrigem(orcItems) {
  const grupos = {}
  for (const item of orcItems) {
    const origem = item.origem || 'Outros'
    if (!grupos[origem]) grupos[origem] = []
    grupos[origem].push(item)
  }
  return Object.entries(grupos).map(([origem, items]) => ({
    origem,
    items,
    total: items.reduce((s,i) => s + (i.price||0)*(i.qty||1), 0),
  }))
}

export default function Detalhe({ orcItems, totalOrc, onAdicionar, onVerOrcamento, onEditarGrupo }) {
  const grupos = agruparPorOrigem(orcItems)

  return (
    <div>
      {/* TOTAL */}
      {totalOrc > 0 && (
        <div style={{ background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.15)', borderRadius:'var(--neo-radius)', padding:'16px 20px', marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)' }}>Total PVP indicativo</div>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:700, color:'var(--neo-gold)' }}>{f2(totalOrc)} EUR</div>
        </div>
      )}

      {/* GRUPOS */}
      {grupos.length === 0 && (
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--neo-text2)', letterSpacing:'0.08em', padding:'24px 0 16px' }}>
          Projecto vazio. Clica em "+ Adicionar" para comecar.
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {grupos.map(g => (
          <div key={g.origem}
            style={{ display:'flex', alignItems:'center', gap:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid var(--neo-gold)', padding:'12px 14px' }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-gold)' }}>
                {g.origem}
              </div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', marginTop:2 }}>
                {g.items.length} artigo{g.items.length!==1?'s':''}
              </div>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', flexShrink:0 }}>
              {f2(g.total)} EUR
            </div>
          </div>
        ))}
      </div>

      <button onClick={onAdicionar} className="neo-btn neo-btn-ghost"
        style={{ width:'100%', height:44, fontSize:10, marginBottom:8 }}>
        + Adicionar
      </button>
      <button onClick={onVerOrcamento} className="neo-btn neo-btn-gold"
        style={{ width:'100%', height:44, fontSize:10 }}>
        Ver orcamento completo
      </button>
    </div>
  )
}

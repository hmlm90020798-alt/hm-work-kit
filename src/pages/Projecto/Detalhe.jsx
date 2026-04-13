import React from 'react'
import { COMPONENTES } from './constantes'

export default function Detalhe({ compFeitos, orcItems, onEditarComp, onAdicionarCategoria, onVerOrcamento }) {
  return (
    <div>
      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--neo-gold)', marginBottom:14 }}>
        Categorias deste projecto
      </div>

      {compFeitos.length === 0 && (
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--neo-text2)', letterSpacing:'0.08em', padding:'20px 0' }}>
          Ainda sem categorias tratadas.
        </div>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
        {compFeitos.map(id => {
          const c = COMPONENTES.find(x=>x.id===id)
          const itensDaOrigem = orcItems.filter(i => {
            if (c?.sempreCalculadora) return i.origem === 'Tampos'
            if (c?.destino === 'maodeobra') return i.origem === 'Mao de Obra'
            const cat = (c?.destCat||'').toLowerCase()
            return (i.cat||'').toLowerCase() === cat ||
                   (i.origem||'').toLowerCase() === cat ||
                   (i.origem||'').toLowerCase().includes(c?.id||'')
          })
          return (
            <button key={id} onClick={() => onEditarComp(id)}
              style={{ display:'flex', alignItems:'center', gap:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:`3px solid ${c?.cor||'var(--neo-gold)'}`, padding:'12px 14px', cursor:'pointer', textAlign:'left', width:'100%' }}>
              <span style={{ fontSize:18 }}>{c?.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c?.cor||'var(--neo-gold)' }}>{c?.label}</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', marginTop:2 }}>
                  {itensDaOrigem.length > 0 ? `${itensDaOrigem.length} artigo${itensDaOrigem.length!==1?'s':''}` : 'Ver ou alterar'}
                </div>
              </div>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em' }}>editar</span>
            </button>
          )
        })}
      </div>

      <button onClick={onAdicionarCategoria} className="neo-btn neo-btn-ghost"
        style={{ width:'100%', height:44, fontSize:10, marginBottom:8 }}>
        + Adicionar categoria
      </button>
      <button onClick={onVerOrcamento} className="neo-btn neo-btn-gold"
        style={{ width:'100%', height:44, fontSize:10 }}>
        Ver orcamento completo
      </button>
    </div>
  )
}

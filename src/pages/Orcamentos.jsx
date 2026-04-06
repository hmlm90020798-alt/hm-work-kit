import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'

const ORC_ID  = 'ativo'
const ORC_REF = () => doc(db, 'orcamento_ativo', ORC_ID)

function f2(n) { return parseFloat(n || 0).toFixed(2) }

export default function Orcamentos({ showToast }) {
  const [orc,    setOrc]    = useState(null)
  const [copied, setCopied] = useState({})
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    const unsub = onSnapshot(ORC_REF(), snap => {
      setOrc(snap.exists() ? snap.data() : { items: [] })
    })
    return unsub
  }, [])

  const items   = orc?.items || []
  const total   = items.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0)
  const isEmpty = items.length === 0

  const setQty = async (ref, qty) => {
    const newItems = items.map(i => i.ref === ref ? { ...i, qty: Math.max(1, qty) } : i)
    await setDoc(ORC_REF(), { ...orc, items: newItems })
  }

  const remove = async (ref) => {
    const newItems = items.filter(i => i.ref !== ref)
    await setDoc(ORC_REF(), { ...orc, items: newItems })
    showToast('Artigo removido')
  }

  const clearAll = async () => {
    await deleteDoc(ORC_REF())
    setConfirmClear(false)
    showToast('Orçamento limpo')
  }

  const copyRef = (ref) => {
    navigator.clipboard.writeText(ref).catch(() => {})
    setCopied(p => ({ ...p, [ref]: true }))
    setTimeout(() => setCopied(p => ({ ...p, [ref]: false })), 1600)
    showToast('Copiado — ' + ref)
  }

  const copyAll = () => {
    const txt = items.map(i => `${i.ref}  ×${i.qty || 1}  ${i.desc}`).join('\n')
    navigator.clipboard.writeText(txt).catch(() => {})
    showToast('Todas as referências copiadas')
  }

  const grupos = items.reduce((acc, i) => {
    const k = i.origem || 'Biblioteca'
    if (!acc[k]) acc[k] = []
    acc[k].push(i)
    return acc
  }, {})

  const origemColor = {
    'Biblioteca': 'var(--neo-gold)',
    'Tampos':     '#4a8fa8',
    'Modelos':    '#8a9e6e',
  }

  return (
    <div className="neo-screen">

      {/* TOPBAR */}
      <div className="neo-topbar">
        <div>
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text)' }}>
            Orçamento
          </span>
          {!isEmpty && (
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text3)', letterSpacing:'0.1em', marginLeft:10 }}>
              {items.length} artigo{items.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {!isEmpty && (
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={copyAll} style={{ background:'transparent', border:'1px solid var(--neo-gold2)', borderRadius:'var(--neo-radius-pill)', padding:'6px 12px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-gold2)', transition:'color .15s' }}>
              ⎘ Copiar tudo
            </button>
            <button onClick={() => setConfirmClear(true)} className="neo-btn neo-btn-danger" style={{ height:28, padding:'0 12px', fontSize:9, borderRadius:'var(--neo-radius-pill)' }}>
              Limpar
            </button>
          </div>
        )}
      </div>

      {/* VAZIO */}
      {isEmpty && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'40px 20px' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--neo-bg2)', boxShadow:'var(--neo-shadow-in)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, opacity:.3 }}>
            ◻
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-text3)', marginBottom:8 }}>
              Orçamento vazio
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text3)', letterSpacing:'0.08em', lineHeight:2 }}>
              Adiciona artigos a partir da Biblioteca,<br/>Tampos ou Modelos usando o botão<br/>
              <span style={{ color:'var(--neo-gold2)' }}>+ Orç</span>
            </div>
          </div>
        </div>
      )}

      {/* LISTA */}
      {!isEmpty && (
        <>
          <div className="neo-scroll" style={{ flex:1, overflowY:'auto', padding:'10px 0 8px' }}>
            {Object.entries(grupos).map(([origem, gItems]) => (
              <div key={origem} style={{ marginBottom:8 }}>
                <div style={{ padding:'2px 16px 6px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color: origemColor[origem] || 'var(--neo-text3)' }}>
                    {origem}
                  </span>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text3)' }}>{gItems.length}</span>
                </div>
                {gItems.map(item => (
                  <ItemRow
                    key={item.ref}
                    item={item}
                    copied={!!copied[item.ref]}
                    onCopy={() => copyRef(item.ref)}
                    onQty={(q) => setQty(item.ref, q)}
                    onRemove={() => remove(item.ref)}
                    cor={origemColor[origem]}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div style={{ flexShrink:0, padding:'14px 16px 18px', background:'var(--neo-bg)', boxShadow:'0 -2px 8px rgba(0,0,0,0.35)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-text3)' }}>
                Total material
              </span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:26, fontWeight:700, color:'var(--neo-gold)' }}>
                {f2(total)} €
              </span>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text3)', letterSpacing:'0.1em', textAlign:'right' }}>
              Valores indicativos — sujeitos a confirmação
            </div>
          </div>
        </>
      )}

      {/* CONFIRM LIMPAR */}
      {confirmClear && (
        <div className="neo-overlay open">
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head" style={{ fontSize:15 }}>
              Limpar orçamento
              <button className="neo-modal-close" onClick={() => setConfirmClear(false)}>✕</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              Tens a certeza? Vão ser removidos {items.length} artigo{items.length !== 1 ? 's' : ''}.<br/>
              <span style={{ color:'var(--neo-text3)', fontSize:10 }}>Esta acção não pode ser desfeita.</span>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="neo-btn neo-btn-ghost" onClick={() => setConfirmClear(false)}>Cancelar</button>
              <button className="neo-btn neo-btn-danger" onClick={clearAll}>Limpar tudo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ItemRow({ item, copied, onCopy, onQty, onRemove, cor }) {
  const subtotal = (item.price || 0) * (item.qty || 1)
  return (
    <div style={{ margin:'0 12px 5px', background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)' }}>
      <div style={{ padding:'11px 14px', display:'flex', alignItems:'center', gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:600, letterSpacing:'0.1em', color: cor || 'var(--neo-gold)' }}>
              {item.ref}
            </span>
            <button onClick={onCopy} style={{ background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-pill)', padding:'2px 8px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, color: copied ? 'var(--neo-gold)' : 'var(--neo-text3)', boxShadow: copied ? 'var(--neo-shadow-in-sm), var(--neo-glow-gold)' : 'var(--neo-shadow-out-sm)', transition:'all .15s' }}>
              {copied ? '✓' : '⎘'}
            </button>
          </div>
          <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {item.desc}
          </div>
          {item.cat && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text3)', letterSpacing:'0.08em', marginTop:2 }}>{item.cat}</div>}
        </div>

        <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:5 }}>
          <div className="neo-qty">
            <button className="neo-qty-btn" onClick={() => onQty((item.qty || 1) - 1)} style={{ width:24, height:24, fontSize:14 }}>−</button>
            <span className="neo-qty-val" style={{ fontSize:14, minWidth:20 }}>{item.qty || 1}</span>
            <button className="neo-qty-btn" onClick={() => onQty((item.qty || 1) + 1)} style={{ width:24, height:24, fontSize:14 }}>+</button>
          </div>
          {item.price > 0 && (
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--neo-text2)', letterSpacing:'0.04em' }}>
              {f2(subtotal)} €
            </span>
          )}
        </div>

        <button onClick={onRemove} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text3)', fontSize:13, padding:'4px', lineHeight:1, flexShrink:0 }}>✕</button>
      </div>
    </div>
  )
}

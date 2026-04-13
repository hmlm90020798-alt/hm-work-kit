import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { onSnapshot, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore'
import { orcRef as makeOrcRef } from '../hooks/useOrcamento'
function f2(n) { return parseFloat(n || 0).toFixed(2) }

// Origens com cor fixa
const COR_FIXA = {
  'Tampos':      '#4a8fa8',
  'Mão de Obra': '#b07acc',
}

// Paleta de cores para origens dinâmicas (kits e categorias)
const PALETA = [
  '#c8943a', '#8a9e6e', '#7a9e9a', '#b07acc',
  '#d4b87a', '#4a8fa8', '#9a6e8a', '#6e8a9e',
  '#8a9e6e', '#c07070',
]

function corParaOrigem(origem, index) {
  if (COR_FIXA[origem]) return COR_FIXA[origem]
  return PALETA[index % PALETA.length]
}

// Origens sem qty — o valor já está calculado
const SEM_QTY = new Set(['Tampos', 'Mão de Obra'])

export default function Orcamentos({ showToast, onOpenTampo, copiedRefs, markCopied, onAbrirProposta, activoProjId }) {
  const [orc,          setOrc]          = useState(null)
  const [copied,       setCopied]       = useState({})
  const [confirmClear, setConfirmClear] = useState(false)
  const [collapsed,    setCollapsed]    = useState({}) // chave ausente = recolhido; true = expandido
  const [propostaOpen, setPropostaOpen] = useState(false)
  // Painel de substituição
  const [subst,        setSubst]        = useState(null) // { item, cat }
  const [artigos,      setArtigos]      = useState([])

  useEffect(() => {
    if (!activoProjId) { setOrc({ items: [] }); return }
    const unsub = onSnapshot(makeOrcRef(activoProjId), snap => {
      setOrc(snap.exists() ? snap.data() : { items: [] })
    }, () => showToast('Erro ao carregar orçamento'))
    return unsub
  }, [activoProjId])

  // Carregar artigos para o painel de substituição
  useEffect(() => {
    getDocs(collection(db, 'artigos')).then(snap =>
      setArtigos(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ).catch(() => {})
    // Manter actualizado
    const unsub = onSnapshot(collection(db, 'artigos'), snap =>
      setArtigos(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
    return unsub
  }, [])

  const items   = orc?.items || []
  const total   = items.reduce((s, i) =>
    SEM_QTY.has(i.origem) ? s+(i.price||0) : s+(i.price||0)*(i.qty||1), 0)
  const isEmpty = items.length === 0

  const setQty = async (idx, qty) => {
    if (!activoProjId) return
    const val = parseFloat(qty)
    if (isNaN(val) || val <= 0) return
    const newItems = items.map((i, n) => n===idx ? {...i, qty:val} : i)
    try { await setDoc(makeOrcRef(activoProjId), {...orc, items:newItems}) }
    catch { showToast('Erro ao actualizar quantidade') }
  }

  const setPrice = async (idx, price) => {
    if (!activoProjId) return
    const val = parseFloat(price)
    if (isNaN(val) || val < 0) return
    const newItems = items.map((i, n) => n===idx ? {...i, price:val} : i)
    try { await setDoc(makeOrcRef(activoProjId), {...orc, items:newItems}) }
    catch { showToast('Erro ao actualizar preço') }
  }

  const remove = async (idx) => {
    if (!activoProjId) return
    const newItems = items.filter((_, n) => n!==idx)
    try { await setDoc(makeOrcRef(activoProjId), {...orc, items:newItems}); showToast('Removido') }
    catch { showToast('Erro ao remover item') }
  }

  const removeGrupo = async (origem) => {
    if (!activoProjId) return
    const newItems = items.filter(i => i.origem !== origem)
    try { await setDoc(makeOrcRef(activoProjId), {...orc, items:newItems}); showToast(origem+' removido') }
    catch { showToast('Erro ao remover categoria') }
  }

  // Substituir artigo no orçamento
  const substituir = async (itemIdx, artNovo) => {
    if (!activoProjId) return
    const newItems = items.map((i, n) => n===itemIdx
      ? { ...i,
          ref:      artNovo.ref,
          desc:     artNovo.desc,
          cat:      artNovo.cat || '',
          sub:      artNovo.sub || '',
          price:    artNovo.price || 0,
          supplier: artNovo.supplier || '',
          link:     artNovo.link || '',
        }
      : i)
    try {
      await setDoc(makeOrcRef(activoProjId), {...orc, items:newItems})
      setSubst(null)
      showToast(`Substituído por ${artNovo.ref}`)
    } catch { showToast('Erro ao substituir') }
  }

  const clearAll = async () => {
    if (!activoProjId) return
    try { await deleteDoc(makeOrcRef(activoProjId)); setConfirmClear(false); showToast('Orçamento limpo') }
    catch { showToast('Erro ao limpar orçamento') }
  }

  const copyVal = (val, label, chipKey) => {
    navigator.clipboard.writeText(val).catch(() => {})
    const key = chipKey || val
    setCopied(p => ({...p, [key]:true}))
    setTimeout(() => setCopied(p => ({...p, [key]:false})), 1600)
    if (label==='Referência'||label==='C1'||label==='Anigraco') markCopied?.(val)
    showToast(`${label} copiado — ${val}`)
  }

  const copyAll = () => {
    const txt = items.map(i => {
      const parts = [i.ref, i.desc]
      if (!SEM_QTY.has(i.origem) && (i.qty||1)>1) parts.push(`×${i.qty}`)
      return parts.join('  ')
    }).join('\n')
    navigator.clipboard.writeText(txt).catch(() => {})
    items.forEach(i => markCopied?.(i.ref))
    showToast('Referências copiadas')
  }

  const handleItemClick = async (item) => {
    if (item.origem!=='Tampos'||!item.tampoId) return
    try {
      const { getDoc, doc: fsDoc } = await import('firebase/firestore')
      const snap = await getDoc(fsDoc(db,'tampos',item.tampoId))
      if (snap.exists()&&onOpenTampo) onOpenTampo({id:snap.id,...snap.data()})
      else showToast('Cálculo não encontrado')
    } catch { showToast('Erro ao abrir calculadora') }
  }

  const toggleCollapse = (origem) => setCollapsed(p => ({...p,[origem]:!p[origem]}))

  // Agrupar por origem — preservar ordem de inserção
  const grupos = items.reduce((acc, i) => {
    const k = i.origem || 'Outros'
    if (!acc[k]) acc[k] = []
    acc[k].push(i)
    return acc
  }, {})

  // Ordem dos grupos: Kits primeiro, depois categorias, depois Tampos e MO no fim
  const ordemGrupos = Object.keys(grupos).sort((a, b) => {
    const peso = (o) => {
      if (o==='Tampos') return 90
      if (o==='Mão de Obra') return 91
      return 0
    }
    return peso(a) - peso(b)
  })

  const totalGrupo = (gItems) => gItems.reduce((s, i) =>
    SEM_QTY.has(i.origem) ? s+(i.price||0) : s+(i.price||0)*(i.qty||1), 0)

  // Artigos para substituição — mesma categoria que o item seleccionado
  // Painel substituição — estratificado: mesma sub-cat primeiro, depois restantes da cat
  const artsSub = subst
    ? artigos.filter(a => a.cat===subst.item.cat && subst.item.sub && a.sub===subst.item.sub && a.ref!==subst.item.ref)
        .sort((a,b) => (a.ref||'').localeCompare(b.ref||''))
    : []
  const artsResto = subst
    ? artigos.filter(a => a.cat===subst.item.cat && !(subst.item.sub && a.sub===subst.item.sub) && a.ref!==subst.item.ref)
        .sort((a,b) => (a.ref||'').localeCompare(b.ref||''))
    : []
  const artsCat = subst ? [...artsSub, ...artsResto] : []

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden' }}>

    {/* ── PAINEL ORÇAMENTO ── */}
    <div className="neo-screen" style={{ flex:1, minWidth:0, borderRight: propostaOpen ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>

      {/* TOPBAR */}
      <div className="neo-topbar">
        <div>
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text)' }}>
            Orçamento
          </span>
          {!isEmpty && (
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em', marginLeft:10 }}>
              {items.length} item{items.length!==1?'s':''}
            </span>
          )}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {!isEmpty && (<>
            <button onClick={copyAll} style={{ background:'transparent', border:'1px solid var(--neo-gold2)', borderRadius:'var(--neo-radius-pill)', padding:'6px 12px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-gold)' }}>
              ⎘ Copiar tudo
            </button>
            <button onClick={() => setConfirmClear(true)} className="neo-btn neo-btn-danger" style={{ height:28, padding:'0 12px', fontSize:9, borderRadius:'var(--neo-radius-pill)' }}>
              Limpar
            </button>
          </>)}
          {/* Botão split-screen proposta */}
          <button
            onClick={() => {
              if (onAbrirProposta) { setPropostaOpen(o => !o) }
            }}
            title={propostaOpen ? 'Fechar proposta' : 'Ver proposta lado a lado'}
            style={{
              background: propostaOpen ? 'rgba(200,169,110,0.15)' : 'transparent',
              border: `1px solid ${propostaOpen ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.1)'}`,
              borderRadius:'var(--neo-radius-pill)', padding:'6px 12px', cursor:'pointer',
              fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600,
              letterSpacing:'0.12em', textTransform:'uppercase',
              color: propostaOpen ? 'var(--neo-gold)' : 'var(--neo-text2)',
              transition:'all .15s', display:'flex', alignItems:'center', gap:5,
            }}>
            ⊟ Proposta
          </button>
        </div>
      </div>

      {/* VAZIO — sem projecto activo */}
      {!activoProjId && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'40px 20px' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--neo-bg2)', boxShadow:'var(--neo-shadow-in)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, opacity:0.4 }}>◻</div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:8 }}>Sem projecto activo</div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.08em', lineHeight:2 }}>
              Abre ou cria um projecto em <span style={{color:'var(--neo-gold)'}}>Projectos</span>
            </div>
          </div>
        </div>
      )}

      {/* VAZIO — projecto activo mas orçamento vazio */}
      {activoProjId && isEmpty && (
        <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'40px 20px' }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--neo-bg2)', boxShadow:'var(--neo-shadow-in)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, opacity:0.4 }}>◻</div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:8 }}>Orçamento vazio</div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.08em', lineHeight:2 }}>
              Começa por <span style={{color:'var(--neo-gold)'}}>Novo Projecto</span> no menu<br/>
              ou adiciona artigos com <span style={{color:'var(--neo-gold)'}}>+ Orç</span>
            </div>
          </div>
        </div>
      )}

      {/* LISTA */}
      {activoProjId && !isEmpty && (
        <>
          <div className="neo-scroll" style={{ flex:1, overflowY:'auto', padding:'8px 0' }}>
            {ordemGrupos.map((origem, idx) => {
              const gItems = grupos[origem]
              const cor    = corParaOrigem(origem, idx)
              const isCol  = collapsed[origem] !== true
              const gtotal = totalGrupo(gItems)
              return (
                <div key={origem} style={{ marginBottom:10 }}>
                  {/* Header do grupo */}
                  <button onClick={()=>toggleCollapse(origem)}
                    style={{ display:'flex', alignItems:'center', gap:8, padding:'4px 14px 6px', background:'transparent', border:'none', cursor:'pointer', width:'100%', textAlign:'left' }}>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:cor }}>
                      {origem}
                    </span>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)' }}>
                      {gItems.length}
                    </span>
                    {gtotal>0 && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginLeft:'auto' }}>
                        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:cor }}>
                          {f2(gtotal)} €
                        </span>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(f2(gtotal)).catch(()=>{})
                            showToast(`${origem} — ${f2(gtotal)} € copiado`)
                          }}
                          title="Copiar subtotal"
                          style={{ background:'transparent', border:'none', cursor:'pointer', padding:'2px 5px', borderRadius:'var(--neo-radius-pill)', color:'var(--neo-text2)', fontSize:10, lineHeight:1, opacity:0.6, transition:'opacity .15s' }}
                          onMouseOver={e=>e.currentTarget.style.opacity='1'}
                          onMouseOut={e=>e.currentTarget.style.opacity='.6'}
                        >⎘</button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (window.confirm('Remover todos os artigos de "'+origem+'"?')) removeGrupo(origem)
                          }}
                          title="Remover categoria"
                          style={{ background:'transparent', border:'none', cursor:'pointer', padding:'2px 6px', borderRadius:'var(--neo-radius-pill)', color:'var(--neo-text2)', fontSize:11, lineHeight:1, opacity:0.5, transition:'opacity .15s' }}
                          onMouseOver={e=>e.currentTarget.style.opacity='1'}
                          onMouseOut={e=>e.currentTarget.style.opacity='.5'}
                        >✕</button>
                      </div>
                    )}
                    <span style={{ fontSize:10, color:'var(--neo-text2)', marginLeft:gtotal>0?0:0, transform:isCol?'rotate(-90deg)':'rotate(0deg)', transition:'transform .2s', display:'inline-block' }}>▾</span>
                  </button>

                  {/* Itens */}
                  {!isCol && gItems.map(item => {
                    const itemIdx = items.indexOf(item)
                    return (
                      <OrcItem
                        key={itemIdx}
                        item={item}
                        copied={copied}
                        onCopy={copyVal}
                        onRemove={() => remove(itemIdx)}
                        onOpen={() => handleItemClick(item)}
                        onQty={(qty) => setQty(itemIdx, qty)}
                        onPrice={(price) => setPrice(itemIdx, price)}
                        onSubstituir={() => setSubst({ item, idx: itemIdx })}
                        cor={cor}
                        wasCopied={copiedRefs?.has(item.ref)}
                      />
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* TOTAL */}
          <div style={{ flexShrink:0, padding:'14px 16px 18px', background:'var(--neo-bg)', boxShadow:'0 -2px 8px rgba(0,0,0,0.4)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
                Total PVP indicativo
              </span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:26, fontWeight:700, color:'var(--neo-gold)' }}>
                {f2(total)} €
              </span>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text2)', letterSpacing:'0.1em', textAlign:'right' }}>
              Valores sujeitos a confirmação
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
              Tens a certeza? Serão removidos {items.length} item{items.length!==1?'s':''}.<br/>
              <span style={{ fontSize:10 }}>Esta acção não pode ser desfeita.</span>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button className="neo-btn neo-btn-ghost" onClick={() => setConfirmClear(false)}>Cancelar</button>
              <button className="neo-btn neo-btn-danger" onClick={clearAll}>Limpar tudo</button>
            </div>
          </div>
        </div>
      )}

      {/* PAINEL SUBSTITUIÇÃO */}
      {subst && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setSubst(null)}}>
          <div className="neo-modal" style={{ maxWidth:480 }}>
            <div className="neo-modal-head">
              Substituir artigo
              <button className="neo-modal-close" onClick={()=>setSubst(null)}>✕</button>
            </div>

            {/* Artigo actual */}
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--neo-radius-sm)', marginBottom:14 }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', flexShrink:0, letterSpacing:'0.1em' }}>ACTUAL</span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{subst.item.ref}</span>
              <span style={{ fontSize:12, fontWeight:300, color:'var(--neo-text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{subst.item.desc}</span>
              {subst.item.price>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(subst.item.price)} €</span>}
            </div>

            {subst.item.cat ? (
              <>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                  {subst.item.sub || subst.item.cat} — escolhe o artigo substituto
                </div>
                <div className="neo-scroll" style={{ maxHeight:'50vh', overflowY:'auto' }}>
                  {artsCat.length===0 ? (
                    <div style={{ padding:'30px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.14em', textTransform:'uppercase' }}>
                      Sem outros artigos em {subst.item.sub || subst.item.cat}
                    </div>
                  ) : (() => {
                    const precoActual = subst.item.price || 0
                    const renderArt = (art) => {
                      const diff = precoActual > 0 ? art.price - precoActual : null
                      return (
                        <div key={art.id} className="tampo-ref-row"
                          style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{art.ref}</span>
                              {art.price>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(art.price)} €</span>}
                              {diff!==null && diff!==0 && (
                                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, color:diff>0?'#f87171':'#4ade80', flexShrink:0 }}>
                                  {diff>0?'+':''}{f2(diff)} €
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                            <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:1 }}>
                              {art.supplier && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)' }}>{art.supplier}</span>}
                              {art.link && <a href={art.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-gold2)', textDecoration:'none', letterSpacing:'0.08em' }}>↗ link</a>}
                            </div>
                          </div>
                          <button onClick={()=>substituir(subst.idx, art)} className="neo-btn neo-btn-gold"
                            style={{ height:30, padding:'0 14px', fontSize:9, flexShrink:0 }}>
                            Usar este
                          </button>
                        </div>
                      )
                    }
                    return (
                      <>
                        {artsSub.length>0 && artsSub.map(renderArt)}
                        {artsSub.length>0 && artsResto.length>0 && (
                          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', margin:'4px 0' }}>
                            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
                            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text3,#4a4a42)', flexShrink:0 }}>Outros em {subst.item.cat}</span>
                            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
                          </div>
                        )}
                        {artsResto.map(renderArt)}
                      </>
                    )
                  })()}
                </div>
              </>
            ) : (
              <div style={{ padding:'20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.12em' }}>
                Este artigo não tem categoria — não é possível encontrar alternativas.
              </div>
            )}
          </div>
        </div>
      )}
    </div>{/* fim painel orçamento */}

    {/* ── PAINEL PROPOSTA (split-screen) ── */}
    {propostaOpen && onAbrirProposta && (
      <div style={{ width:'45%', flexShrink:0, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--neo-bg)' }}>
        {/* Header do painel proposta */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:52, flexShrink:0, boxShadow:'0 2px 8px rgba(0,0,0,0.4)', background:'var(--neo-bg)' }}>
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-gold)' }}>
            Proposta
          </span>
          <button onClick={() => setPropostaOpen(false)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:16, padding:'4px 6px', lineHeight:1 }}>✕</button>
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>
          {onAbrirProposta()}
        </div>
      </div>
    )}

    </div>
  )
}

// ── OrcItem ───────────────────────────────────────────────────────────────
function OrcItem({ item, copied, onCopy, onRemove, onOpen, onQty, onPrice, onSubstituir, cor, wasCopied }) {
  const isTampo = item.origem==='Tampos'
  const isMO    = item.origem==='Mão de Obra'
  const semQty  = SEM_QTY.has(item.origem)
  const subtotal = semQty ? (item.price||0) : (item.price||0)*(item.qty||1)

  return (
    <div className="neo-hover" style={{
      margin:'0 12px 6px', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', overflow:'hidden',
      background: wasCopied ? 'rgba(200,169,110,0.06)' : 'var(--neo-bg2)',
      borderLeft: wasCopied ? '2px solid rgba(200,169,110,0.4)' : '2px solid transparent',
      transition:'background .2s, border-color .2s',
    }}>
      <div style={{ padding:'12px 14px' }}>

        {/* Linha 1: ref + acções */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
          <CopyChip val={item.ref} copied={!!copied[item.ref+'_ref']||wasCopied} onCopy={()=>onCopy(item.ref,'Referência',item.ref+'_ref')} mainRef cor={cor}/>
          {isTampo && (
            <button onClick={onOpen} style={{ padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', border:'1px solid rgba(74,143,168,0.4)', background:'transparent', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'#4a8fa8' }}>
               Calculadora
            </button>
          )}
          <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:6 }}>
            {/* Substituir — só para artigos com categoria */}
            {item.cat && !isTampo && !isMO && (
              <button onClick={onSubstituir} title="Substituir por outro artigo da mesma categoria"
                style={{ background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-pill)', width:24, height:24, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--neo-shadow-out-sm)', color:'var(--neo-text2)', fontSize:11, flexShrink:0, transition:'all .15s' }}>
                ↗
              </button>
            )}
            <button onClick={onRemove} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:13, padding:'2px 4px', lineHeight:1, flexShrink:0 }}>✕</button>
          </div>
        </div>

        {/* Linha 2: descrição */}
        <div style={{ fontSize:13, fontWeight:300, color:wasCopied?'#c4c0b8':'var(--neo-text)', marginBottom:8, lineHeight:1.4 }}>
          {item.desc}
        </div>

        {/* Linha 3: refs copiáveis + qty + preço */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          {item.c1Ref && <CopyChip label="C1" val={item.c1Ref} copied={!!copied[item.ref+'_c1']} onCopy={()=>onCopy(item.c1Ref,'C1',item.ref+'_c1')}/>}
          {item.refAnigraco && <CopyChip label="Anigraco" val={item.refAnigraco} copied={!!copied[item.ref+'_an']} onCopy={()=>onCopy(item.refAnigraco,'Ref Anigraco',item.ref+'_an')} gold/>}
          {item.cat && !isTampo && (
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'#8a8a82', letterSpacing:'0.08em', textTransform:'uppercase' }}>
              {item.cat}{item.sub?' · '+item.sub:''}
            </span>
          )}
          {item.link && (
            <a href={item.link} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'3px 8px', borderRadius:'var(--neo-radius-pill)', background:'var(--neo-bg)', boxShadow:'var(--neo-shadow-out-sm)', textDecoration:'none', color:'var(--neo-gold2)', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', flexShrink:0, transition:'color .15s' }}
              onMouseOver={e=>e.currentTarget.style.color='var(--neo-gold)'}
              onMouseOut={e=>e.currentTarget.style.color='var(--neo-gold2)'}>
              ↗
            </a>
          )}

          {/* Qty — input editável com decimais */}
          {!semQty && (
            <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }}>
              <button onClick={()=>onQty((parseFloat(item.qty)||1)-1)} style={{ width:22,height:22,borderRadius:'50%',border:'none',background:'var(--neo-bg)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',color:'var(--neo-text2)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1 }}>−</button>
              <input
                type="number" min="0.01" step="0.01"
                defaultValue={item.qty||1}
                key={item.qty}
                onBlur={e=>onQty(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') { e.target.blur() } }}
                style={{ fontFamily:"'Barlow Condensed'",fontWeight:600,color:'var(--neo-text)',background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,0.12)',outline:'none',width:44,textAlign:'center',padding:'1px 2px',fontSize:16 }}
              />
              <button onClick={()=>onQty((parseFloat(item.qty)||1)+1)} style={{ width:22,height:22,borderRadius:'50%',border:'none',background:'var(--neo-bg)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',color:'var(--neo-text2)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1 }}>+</button>
              {item.price>0&&<span style={{ fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)',marginLeft:4 }}>{subtotal.toFixed(2)} €</span>}
            </div>
          )}

          {/* Preço editável — só Mão de Obra; Tampos é sempre via calculadora */}
          {semQty && !isTampo && (
            <div style={{ display:'flex', alignItems:'center', gap:4, marginLeft:'auto' }}>
              <input
                type="number" min="0" step="0.01"
                defaultValue={f2(item.price||0)}
                key={item.price}
                onBlur={e=>onPrice(e.target.value)}
                onKeyDown={e=>{ if(e.key==='Enter') { e.target.blur() } }}
                style={{ fontFamily:"'Barlow Condensed'",fontWeight:600,color:cor||'var(--neo-text2)',background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,0.12)',outline:'none',width:72,textAlign:'right',padding:'1px 2px',fontSize:16 }}
              />
              <span style={{ fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)' }}>€</span>
            </div>
          )}
          {/* Preço fixo Tampos — só via calculadora */}
          {isTampo && item.price>0 && (
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, color:cor||'var(--neo-text2)', marginLeft:'auto' }}>
              {f2(item.price)} €
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── CopyChip ──────────────────────────────────────────────────────────────
function CopyChip({ label, val, copied, onCopy, gold, mainRef, cor }) {
  if (mainRef) {
    return (
      <button onClick={onCopy} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'transparent', border:'none', cursor:'pointer', padding:0 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:700, letterSpacing:'0.1em', color:cor||'var(--neo-gold)' }}>{val}</span>
        <span style={{ background:'var(--neo-bg)', borderRadius:'var(--neo-radius-pill)', padding:'2px 7px', boxShadow:copied?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)', fontFamily:"'Barlow Condensed'", fontSize:9, color:copied?'var(--neo-gold)':'var(--neo-text2)', transition:'all .15s' }}>
          {copied?'✓':'⎘'}
        </span>
      </button>
    )
  }
  return (
    <button onClick={onCopy} style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:'var(--neo-radius-pill)', background:'var(--neo-bg)', border:'none', boxShadow:copied?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)', cursor:'pointer', transition:'all .15s' }}>
      {label&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.14em', textTransform:'uppercase', color:copied?'var(--neo-gold)':'var(--neo-text2)' }}>{label}</span>}
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, letterSpacing:'0.06em', color:copied?'var(--neo-gold)':(gold?'var(--neo-gold)':'var(--neo-text)') }}>{val}</span>
      <span style={{ fontSize:9, color:copied?'var(--neo-gold)':'var(--neo-text2)' }}>{copied?'✓':'⎘'}</span>
    </button>
  )
}

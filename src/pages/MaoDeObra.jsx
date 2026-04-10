import React, { useState, useMemo, useEffect } from 'react'
import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { MAO_DE_OBRA } from '../data/maoDeObra'
import { addToOrcamento } from '../hooks/useOrcamento'

// ── Serviços transversais sempre disponíveis ──────────────────────────────────
const TRANSVERSAIS = [
  { id:'49013101', nome:'Deslocação Instalações', pvp:30, un:'un', tipo:'opcional', seccao:'Transversal', sub:'', inc:'Deslocação até 30km entre a loja e local de instalação', exc:'', cond:'' },
  { id:'49013106', nome:'Deslocação Manutenção e Reparação', pvp:30, un:'un', tipo:'opcional', seccao:'Transversal', sub:'', inc:'Deslocação até 30km entre a loja e local de instalação', exc:'', cond:'' },
  { id:'49013102', nome:'KM Extra Instalações', pvp:1, un:'km', tipo:'opcional', seccao:'Transversal', sub:'', inc:'O valor de 1€ por KM extra é calculado apenas na ida, após os 30km', exc:'', cond:'' },
]

const SECCOES = [...new Set(MAO_DE_OBRA.map(s=>s.seccao))].sort()

const TIPO_LABEL = { standard:'Standard', visita:'Visita Orç.', opcional:'Opcional' }
const TIPO_COLOR = { standard:'var(--neo-text2)', visita:'#4a8fa8', opcional:'var(--neo-gold2)' }

function f2(n) { return parseFloat(n||0).toFixed(2) }

// Referência Firestore — preferências MO por utilizador
const moPrefsRef = (uid) => doc(db, 'preferencias', uid)

export default function MaoDeObra({ showToast, copiedRefs, markCopied, userId }) {
  const [seccao,    setSeccao]    = useState('Todos')
  const [search,    setSearch]    = useState('')
  const [tipo,      setTipo]      = useState('Todos')
  const [showTrans, setShowTrans] = useState(false)
  const [collapsed, setCollapsed] = useState({})
  const [subOrder,  setSubOrder]  = useState([])

  // ── Carregar preferências do Firestore ──────────────────────────────────
  useEffect(() => {
    if (!userId) return
    getDoc(moPrefsRef(userId)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        if (data.moCollapsed) setCollapsed(data.moCollapsed)
        if (Array.isArray(data.moSubOrder)) setSubOrder(data.moSubOrder)
      } else {
        // Migrar do localStorage se existir
        try {
          const savedOrder     = JSON.parse(localStorage.getItem('hm_mo_sub_order')) || []
          const savedCollapsed = JSON.parse(localStorage.getItem('hm_mo_collapsed'))  || {}
          if (savedOrder.length || Object.keys(savedCollapsed).length) {
            setSubOrder(savedOrder)
            setCollapsed(savedCollapsed)
            setDoc(moPrefsRef(userId), { moSubOrder: savedOrder, moCollapsed: savedCollapsed }, { merge: true }).catch(() => {})
            localStorage.removeItem('hm_mo_sub_order')
            localStorage.removeItem('hm_mo_collapsed')
          }
        } catch {}
      }
    }).catch(() => {
      // Fallback localStorage se Firestore falhar
      try {
        setSubOrder(JSON.parse(localStorage.getItem('hm_mo_sub_order')) || [])
        setCollapsed(JSON.parse(localStorage.getItem('hm_mo_collapsed')) || {})
      } catch {}
    })
  }, [userId])

  // ── Persistir collapsed ────────────────────────────────────────────────
  const toggleCollapsed = (sub) => setCollapsed(p => {
    const next = {...p, [sub]: !p[sub]}
    if (userId) {
      setDoc(moPrefsRef(userId), { moCollapsed: next }, { merge: true }).catch(() => {
        localStorage.setItem('hm_mo_collapsed', JSON.stringify(next))
      })
    }
    return next
  })

  // ── Persistir subOrder ─────────────────────────────────────────────────
  const moveGroup = (sub, dir, currentSubs) => {
    setSubOrder(prev => {
      const subs = prev.length > 0 ? [...prev] : [...currentSubs]
      const idx = subs.indexOf(sub)
      if (idx < 0) return prev
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= subs.length) return prev
      const arr = [...subs]
      const tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp
      if (userId) {
        setDoc(moPrefsRef(userId), { moSubOrder: arr }, { merge: true }).catch(() => {
          localStorage.setItem('hm_mo_sub_order', JSON.stringify(arr))
        })
      }
      return arr
    })
  }

  const filtered = useMemo(() => {
    return MAO_DE_OBRA.filter(s => {
      const secOk  = seccao === 'Todos' || s.seccao === seccao
      const tipoOk = tipo   === 'Todos' || s.tipo   === tipo
      const q      = search.toLowerCase()
      const srchOk = !q || s.nome.toLowerCase().includes(q)
                        || s.id.includes(q)
                        || s.sub.toLowerCase().includes(q)
      return secOk && tipoOk && srchOk
    })
  }, [seccao, search, tipo])

  // Agrupar por sub-secção
  const grupos = useMemo(() => {
    const g = {}
    filtered.forEach(s => {
      const k = s.sub || '—'
      if (!g[k]) g[k] = []
      g[k].push(s)
    })
    return g
  }, [filtered])

  return (
    <div className="neo-screen">

      {/* TOPBAR */}
      <div className="neo-topbar" style={{flexWrap:'wrap',gap:6,height:'auto',padding:'10px 14px'}}>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text)',flexShrink:0}}>
          Mão de Obra
        </span>

        {/* Pesquisa */}
        <div style={{flex:1,position:'relative',minWidth:140}}>
          <input className="neo-input" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Pesquisar serviço ou código…" style={{paddingRight:32,height:34}}/>
          {search
            ? <button onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13}}>✕</button>
            : <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:'var(--neo-text2)',fontSize:13,pointerEvents:'none'}}>⌕</span>
          }
        </div>

        {/* Transversais */}
        <button onClick={()=>setShowTrans(true)}
          style={{flexShrink:0,background:'var(--neo-bg2)',border:'1px solid var(--neo-gold2)',borderRadius:'var(--neo-radius-pill)',padding:'0 12px',height:34,cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--neo-gold)',boxShadow:'var(--neo-shadow-out-sm)'}}>
          Deslocação
        </button>
      </div>

      {/* FILTROS */}
      <div style={{padding:'8px 14px',background:'var(--neo-bg2)',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}>
        {/* Tipo */}
        {['Todos','standard','visita','opcional'].map(t=>(
          <button key={t} className={`neo-chip-sm ${tipo===t?'active':''}`} onClick={()=>setTipo(t)}>
            {t==='Todos'?'Todos os tipos':TIPO_LABEL[t]||t}
          </button>
        ))}
        <div style={{width:1,height:16,background:'rgba(255,255,255,0.08)',margin:'0 4px'}}/>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'var(--neo-text2)',letterSpacing:'0.1em'}}>
          {filtered.length} serviço{filtered.length!==1?'s':''}
        </span>
      </div>

      {/* SECÇÕES — scroll horizontal */}
      <div style={{display:'flex',gap:5,padding:'8px 14px',overflowX:'auto',flexShrink:0,background:'var(--neo-bg)',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
        <button className={`neo-chip-sm ${seccao==='Todos'?'active':''}`} onClick={()=>setSeccao('Todos')} style={{whiteSpace:'nowrap'}}>Todas</button>
        {SECCOES.map(s=>(
          <button key={s} className={`neo-chip-sm ${seccao===s?'active':''}`} onClick={()=>setSeccao(s)} style={{whiteSpace:'nowrap'}}>
            {s.replace(/^\d+ · /,'')}
          </button>
        ))}
      </div>

      {/* LISTA */}
      <div className="neo-scroll" style={{flex:1,overflowY:'auto',padding:'8px 12px 32px'}}>
        {filtered.length===0&&(
          <div style={{padding:'50px 20px',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
            Sem resultados
          </div>
        )}
        {(() => {
          const allSubs = Object.keys(grupos)
          const orderedSubs = subOrder.length > 0
            ? [...subOrder.filter(s => allSubs.includes(s)), ...allSubs.filter(s => !subOrder.includes(s))]
            : allSubs
          return orderedSubs.map((sub, idx) => {
            const items = grupos[sub]
            if (!items) return null
            const isOpen = !collapsed[sub]
            return (
              <div key={sub} style={{marginBottom:6,borderRadius:'var(--neo-radius-sm)',overflow:'hidden',border:'1px solid rgba(255,255,255,0.05)'}}>
                {/* Header subsecção */}
                <div style={{display:'flex',alignItems:'center',background:'var(--neo-bg2)',padding:'8px 12px',gap:8}}>
                  {/* Reordenação */}
                  <div style={{display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
                    <button onClick={()=>moveGroup(sub,-1,orderedSubs)} disabled={idx===0} style={{background:'transparent',border:'none',cursor:idx===0?'default':'pointer',color:idx===0?'var(--neo-text3)':'var(--neo-text2)',fontSize:9,lineHeight:1,padding:'1px 3px'}}>▲</button>
                    <button onClick={()=>moveGroup(sub,1,orderedSubs)} disabled={idx===orderedSubs.length-1} style={{background:'transparent',border:'none',cursor:idx===orderedSubs.length-1?'default':'pointer',color:idx===orderedSubs.length-1?'var(--neo-text3)':'var(--neo-text2)',fontSize:9,lineHeight:1,padding:'1px 3px'}}>▼</button>
                  </div>
                  {/* Nome + colapsar */}
                  <button onClick={()=>toggleCollapsed(sub)} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'space-between',background:'transparent',border:'none',cursor:'pointer',textAlign:'left',gap:8}}>
                    <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-gold2)'}}>
                      {sub}
                    </span>
                    <div style={{display:'flex',alignItems:'center',gap:6}}>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'var(--neo-text2)',letterSpacing:'0.08em'}}>
                        {items.length} serviço{items.length!==1?'s':''}
                      </span>
                      <span style={{fontSize:9,color:'var(--neo-text2)',display:'inline-block',transform:isOpen?'rotate(0deg)':'rotate(-90deg)',transition:'transform .2s'}}>▾</span>
                    </div>
                  </button>
                </div>
                {/* Itens */}
                {isOpen&&(
                  <div style={{padding:'6px 6px 4px'}}>
                    {items.map(s=>(
                      <ServicoCard key={s.id} s={s} showToast={showToast}
                        wasCopied={copiedRefs?.has(s.id)}
                        markCopied={markCopied}/>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        })()}
      </div>

      {/* Modal transversais */}
      {showTrans&&(
        <div className="neo-overlay open" onClick={e=>e.target===e.currentTarget&&setShowTrans(false)}>
          <div className="neo-modal" style={{maxWidth:440}}>
            <div className="neo-modal-head">
              Códigos Transversais
              <button className="neo-modal-close" onClick={()=>setShowTrans(false)}>✕</button>
            </div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',letterSpacing:'0.1em',marginBottom:14}}>
              Adicionados automaticamente — deslocação e KM extra
            </div>
            {TRANSVERSAIS.map(s=>(
              <ServicoCard key={s.id} s={s} showToast={showToast}
                wasCopied={copiedRefs?.has(s.id)}
                markCopied={markCopied}/>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ServicoCard({ s, showToast, wasCopied, markCopied }) {
  const [open,    setOpen]    = useState(false)
  const [qty,     setQty]     = useState('')
  const [copiedId, setCopiedId] = useState(false)
  const [copiedPvp, setCopiedPvp] = useState(false)
  const [added,   setAdded]   = useState(false)

  const isMedida = s.un !== 'un'
  const qtyNum   = parseFloat(qty) || 0
  const total    = isMedida && qtyNum > 0 ? s.pvp * qtyNum : s.pvp

  const copyId = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(s.id).catch(()=>{})
    setCopiedId(true); setTimeout(()=>setCopiedId(false),1600)
    markCopied?.(s.id)
    showToast('Código copiado — '+s.id)
  }

  const copyPvp = (e) => {
    e.stopPropagation()
    const val = isMedida && qtyNum>0 ? f2(total) : f2(s.pvp)
    navigator.clipboard.writeText(val).catch(()=>{})
    setCopiedPvp(true); setTimeout(()=>setCopiedPvp(false),1600)
    showToast('PVP copiado — '+val+' €')
  }

  const addOrc = (e) => {
    e.stopPropagation()
    const finalQty = isMedida ? qtyNum : 1
    if (isMedida && finalQty <= 0) { showToast('Introduz a quantidade primeiro'); return }
    addToOrcamento({
      ref:    s.id,
      desc:   s.nome + (isMedida && finalQty>0 ? ` (${finalQty} ${s.un})` : ''),
      cat:    s.seccao,
      price:  total,
      origem: 'Mão de Obra',
    }, showToast)
    setAdded(true); setTimeout(()=>setAdded(false),1800)
  }

  const isMarked = wasCopied || copiedId

  return (
    <div onClick={()=>setOpen(o=>!o)}
      className="mo-card"
      style={{borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-out-sm)',marginBottom:5,cursor:'pointer',overflow:'hidden',
        background: isMarked ? 'rgba(200,169,110,0.05)' : 'var(--neo-bg2)',
        borderLeft: s.tipo==='visita' ? '2px solid #4a8fa8'
          : s.tipo==='opcional' ? '2px solid var(--neo-gold2)'
          : isMarked ? '2px solid rgba(200,169,110,0.45)'
          : '2px solid transparent',
      }}>
      <div style={{padding:'10px 12px'}}>

        {/* Linha principal */}
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:400,color: isMarked ? '#c4c0b8' : 'var(--neo-text)',lineHeight:1.3,marginBottom:3,whiteSpace:open?'normal':'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
              {s.nome}
            </div>
            <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'nowrap'}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.1em',textTransform:'uppercase',color:TIPO_COLOR[s.tipo]||'var(--neo-text2)'}}>
                {TIPO_LABEL[s.tipo]||s.tipo}
              </span>
              <span style={{color:'rgba(255,255,255,0.1)'}}>·</span>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.08em',textTransform:'uppercase',color:'#8a8a82'}}>
                {f2(s.pvp)} €/{s.un}
              </span>
            </div>
          </div>

          {/* Ações direita */}
          <div style={{display:'flex',gap:6,alignItems:'center',flexShrink:0}} onClick={e=>e.stopPropagation()}>

            {/* Quantidade (só para m²/ml/km) */}
            {isMedida && open && (
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <input type="number" value={qty} onChange={e=>setQty(e.target.value)}
                  placeholder={s.un} min="0" step="0.1"
                  onClick={e=>e.stopPropagation()}
                  style={{width:64,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-in-sm)',padding:'5px 8px',fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-text)',outline:'none',textAlign:'right'}}/>
                <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)'}}>{s.un}</span>
              </div>
            )}

            {/* Código copiável */}
            <button onClick={copyId} style={{display:'flex',alignItems:'center',gap:4,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-pill)',padding:'4px 9px',cursor:'pointer',
              boxShadow: isMarked ? 'var(--neo-shadow-in-sm),var(--neo-glow-gold)' : 'var(--neo-shadow-out-sm)',
              transition:'all .15s'}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:600,letterSpacing:'0.06em',color: isMarked ? 'var(--neo-gold)' : 'var(--neo-text)'}}>{s.id}</span>
              <span style={{fontSize:9,color: isMarked ? 'var(--neo-gold)' : 'var(--neo-text2)'}}>{isMarked?'✓':'⎘'}</span>
            </button>

            {/* PVP copiável */}
            <button onClick={copyPvp} style={{display:'flex',alignItems:'center',gap:3,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-pill)',padding:'4px 9px',cursor:'pointer',boxShadow:copiedPvp?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',transition:'all .15s',minWidth:60,justifyContent:'center'}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,color:'var(--neo-gold)'}}>{f2(isMedida&&qtyNum>0?total:s.pvp)} €</span>
              <span style={{fontSize:9,color:copiedPvp?'var(--neo-gold)':'var(--neo-text2)'}}>{copiedPvp?'✓':'⎘'}</span>
            </button>

            {/* + Orç */}
            <button onClick={addOrc} style={{padding:'4px 10px',borderRadius:'var(--neo-radius-pill)',border:'none',background:added?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg2)',boxShadow:added?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:added?'#1a1610':'var(--neo-text2)',transition:'all .2s',whiteSpace:'nowrap'}}>
              {added?'✓':'+ Orç'}
            </button>
          </div>
        </div>

        {/* Detalhe expandido */}
        {open&&(s.inc||s.exc||s.cond)&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.06)',display:'grid',gap:8}}>
            {s.inc&&<DetailBlock label="Incluído" text={s.inc} color='rgba(100,200,100,0.6)'/>}
            {s.exc&&<DetailBlock label="Excluído" text={s.exc} color='rgba(200,80,80,0.6)'/>}
            {s.cond&&<DetailBlock label="Condições" text={s.cond} color='rgba(200,169,110,0.6)'/>}
          </div>
        )}
      </div>
    </div>
  )
}

function DetailBlock({ label, text, color }) {
  return (
    <div style={{borderLeft:`2px solid ${color}`,paddingLeft:10}}>
      <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:3}}>{label}</div>
      <div style={{fontSize:11,fontWeight:300,color:'var(--neo-text2)',lineHeight:1.6,whiteSpace:'pre-line'}}>{text}</div>
    </div>
  )
}

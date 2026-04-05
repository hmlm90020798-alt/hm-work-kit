import React, { useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'

// ── Drum Picker ────────────────────────────────────────────────────────────
function DrumPicker({ items, selected, onSelect, width = 160 }) {
  const ITEM_H = 36
  const VISIBLE = 5
  const CENTER = Math.floor(VISIBLE / 2)

  const idx = items.findIndex(i => i === selected)
  const [offset, setOffset] = useState(idx >= 0 ? idx : 0)
  const [dragging, setDragging] = useState(false)
  const startY = useRef(0)
  const startOffset = useRef(0)
  const velY = useRef(0)
  const lastY = useRef(0)
  const lastT = useRef(0)
  const animRef = useRef(null)

  useEffect(() => {
    const i = items.findIndex(x => x === selected)
    if (i >= 0 && Math.abs(i - offset) > 0.5) setOffset(i)
  }, [selected, items])

  const clamp = (v) => Math.max(0, Math.min(items.length - 1, v))

  const snapTo = useCallback((targetIdx) => {
    const target = clamp(Math.round(targetIdx))
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const animate = () => {
      setOffset(prev => {
        const diff = target - prev
        if (Math.abs(diff) < 0.01) {
          onSelect(items[target])
          return target
        }
        animRef.current = requestAnimationFrame(animate)
        return prev + diff * 0.18
      })
    }
    animRef.current = requestAnimationFrame(animate)
  }, [items, onSelect])

  const onPointerDown = (e) => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    setDragging(true)
    startY.current = e.clientY
    startOffset.current = offset
    velY.current = 0
    lastY.current = e.clientY
    lastT.current = Date.now()
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    if (!dragging) return
    const dy = e.clientY - startY.current
    const now = Date.now()
    const dt = now - lastT.current
    if (dt > 0) velY.current = (e.clientY - lastY.current) / dt
    lastY.current = e.clientY
    lastT.current = now
    setOffset(clamp(startOffset.current - dy / ITEM_H))
  }

  const onPointerUp = () => {
    if (!dragging) return
    setDragging(false)
    const momentum = -velY.current * 80
    snapTo(offset + momentum)
  }

  const containerH = VISIBLE * ITEM_H

  return (
    <div
      style={{ width, height: containerH, position: 'relative', cursor: 'grab', userSelect: 'none', overflow: 'hidden', touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* Fade top/bottom */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: ITEM_H * 1.8, background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: ITEM_H * 1.8, background: 'linear-gradient(to top, var(--bg) 0%, transparent 100%)', zIndex: 2, pointerEvents: 'none' }} />

      {/* Centre highlight */}
      <div style={{ position: 'absolute', top: CENTER * ITEM_H, left: 0, right: 0, height: ITEM_H, borderTop: '1px solid rgba(200,169,110,0.25)', borderBottom: '1px solid rgba(200,169,110,0.25)', zIndex: 1, pointerEvents: 'none' }} />

      {/* Items */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, transform: `translateY(${(CENTER - offset) * ITEM_H}px)`, transition: dragging ? 'none' : 'transform 0.05s' }}>
        {items.map((item, i) => {
          const dist = Math.abs(i - offset)
          const opacity = dist < 0.5 ? 1 : dist < 1.5 ? 0.55 : dist < 2.5 ? 0.2 : 0
          const scale = dist < 0.5 ? 1 : dist < 1.5 ? 0.82 : 0.65
          const isActive = dist < 0.5
          return (
            <div key={item} onClick={() => snapTo(i)}
              style={{
                height: ITEM_H, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: isActive ? 13 : 11,
                fontWeight: isActive ? 700 : 400,
                letterSpacing: isActive ? '0.12em' : '0.08em',
                textTransform: 'uppercase',
                color: isActive ? 'var(--gold)' : 'var(--text2)',
                opacity,
                transform: `scale(${scale})`,
                transition: dragging ? 'none' : 'all 0.15s',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: width - 8,
              }}>
              {item}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Biblioteca principal ────────────────────────────────────────────────────
export default function Biblioteca({ showToast }) {
  const [cats, setCats]         = useState([])
  const [arts, setArts]         = useState([])
  const [activeCat, setActiveCat] = useState('Todos')
  const [activeSub, setActiveSub] = useState('')
  const [search, setSearch]     = useState('')
  const [searching, setSearching] = useState(false)
  const [artModal, setArtModal] = useState(false)
  const [catModal, setCatModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ ref:'', desc:'', cat:'', sub:'', price:'', supplier:'', link:'', notes:'' })

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'categorias'), snap => {
      if (snap.empty) {
        const defaults = [
          { id:'ferragens', name:'Ferragens', subs:['Ferragens de Cozinha','Puxadores','Calhas'] },
          { id:'iluminacao', name:'Iluminação', subs:[] },
          { id:'colas', name:'Colas · Tintas · Vernizes', subs:[] },
          { id:'eletro', name:'Eletrodomésticos', subs:[] },
          { id:'tampos', name:'Tampos', subs:[] },
          { id:'sanitarios', name:'Sanitários', subs:[] },
          { id:'caixilharia', name:'Caixilharia', subs:[] },
          { id:'decoracao', name:'Decoração', subs:[] },
          { id:'aquecimento', name:'Aquecimento', subs:[] },
          { id:'materialpro', name:'Material PRO', subs:[] },
          { id:'limpeza', name:'Limpeza', subs:[] },
          { id:'acessorios', name:'Acessórios', subs:[] },
        ]
        defaults.forEach(c => setDoc(doc(db, 'categorias', c.id), { name: c.name, subs: c.subs }))
      } else {
        setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
    })
    const u2 = onSnapshot(collection(db, 'artigos'), snap => {
      setArts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { u1(); u2() }
  }, [])

  // Lista de categorias para o drum
  const catNames = ['Todos', ...cats.map(c => c.name)]
  const activeCatObj = cats.find(c => c.name === activeCat)
  const subNames = activeCatObj?.subs?.length > 0 ? ['Todas', ...activeCatObj.subs] : []

  // Quando muda categoria, reset subcategoria
  const handleCatSelect = (name) => {
    setActiveCat(name)
    setActiveSub('')
  }
  const handleSubSelect = (sub) => {
    setActiveSub(sub === 'Todas' ? '' : sub)
  }

  // Filtrar artigos
  const filtered = arts.filter(a => {
    const mc = activeCat === 'Todos' ? true : activeSub ? (a.cat === activeCat && a.sub === activeSub) : a.cat === activeCat
    const q = search.toLowerCase()
    const mq = !q || [a.ref, a.desc, a.cat, a.sub, a.supplier, a.notes].some(v => v && v.toLowerCase().includes(q))
    return mc && mq
  })

  const countFor = (catName, subName) =>
    arts.filter(a => subName ? (a.cat === catName && a.sub === subName) : a.cat === catName).length

  // Formulário
  const catOptions = cats.flatMap(c => [
    <option key={c.id} value={c.name + '|'}>{c.name}</option>,
    ...(c.subs || []).map(s => <option key={c.id+s} value={c.name+'|'+s}>&nbsp;&nbsp;↳ {s}</option>)
  ])

  const openAdd = () => {
    setEditId(null)
    setForm({ ref:'', desc:'', cat: activeCat !== 'Todos' ? activeCat : '', sub: activeSub, price:'', supplier:'', link:'', notes:'' })
    setArtModal(true)
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ ref:a.ref, desc:a.desc, cat:a.cat, sub:a.sub||'', price:a.price||'', supplier:a.supplier||'', link:a.link||'', notes:a.notes||'' })
    setArtModal(true)
  }

  const saveArt = async () => {
    if (!form.ref.trim() || !form.desc.trim()) { showToast('Referência e descrição obrigatórias'); return }
    const cv = form.cat.includes('|') ? form.cat.split('|') : [form.cat, form.sub||'']
    const data = { ref:form.ref.trim(), desc:form.desc.trim(), cat:cv[0], sub:cv[1]||'', price:parseFloat(form.price)||0, supplier:form.supplier.trim(), link:form.link.trim(), notes:form.notes.trim() }
    try {
      if (editId) { await updateDoc(doc(db,'artigos',editId), data); showToast('Artigo atualizado') }
      else { await addDoc(collection(db,'artigos'), data); showToast('Artigo adicionado') }
      setArtModal(false)
    } catch(e) { showToast('Erro ao guardar') }
  }

  const delArt = async (id, desc) => {
    if (!confirm('Eliminar "' + desc + '"?')) return
    await deleteDoc(doc(db,'artigos',id))
    showToast('Eliminado')
  }

  const saveCat = async (cat) => {
    await setDoc(doc(db,'categorias',cat.id), { name:cat.name, subs:cat.subs })
  }

  const S = {
    label: { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text2)', display:'block', marginBottom:8 },
    inp: { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' },
  }

  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg)' }}>

      {/* DRUM SELECTOR — categoria */}
      <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', paddingTop:8, background:'var(--bg)', borderBottom: subNames.length > 0 ? 'none' : '1px solid var(--line)', position:'relative' }}>
        <DrumPicker items={catNames} selected={activeCat} onSelect={handleCatSelect} width={Math.min(320, window.innerWidth - 80)} />

        {/* Contagem */}
        <div style={{ position:'absolute', right:20, top:'50%', transform:'translateY(-50%)', fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)', letterSpacing:'0.1em' }}>
          {activeCat === 'Todos' ? arts.length : countFor(activeCat, activeSub)} artigos
        </div>

        {/* Acções */}
        <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', display:'flex', gap:6 }}>
          <button onClick={() => { setSearching(s=>!s); if(searching) setSearch('') }}
            style={{ background:'transparent', border:'none', cursor:'pointer', color: searching?'var(--gold)':'var(--text3)', fontSize:16, padding:'4px', lineHeight:1 }}>
            {searching ? '✕' : '⌕'}
          </button>
        </div>
      </div>

      {/* DRUM SELECTOR — subcategoria (quando existe) */}
      {subNames.length > 0 && (
        <div style={{ flexShrink:0, display:'flex', justifyContent:'center', borderBottom:'1px solid var(--line)', background:'var(--bg2)', paddingTop:0 }}>
          <DrumPicker items={subNames} selected={activeSub || 'Todas'} onSelect={handleSubSelect} width={Math.min(280, window.innerWidth - 80)} />
        </div>
      )}

      {/* SEARCH */}
      {searching && (
        <div style={{ padding:'8px 20px', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
          <input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar…"
            style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--gold)', padding:'6px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' }} />
        </div>
      )}

      {/* TOOLBAR */}
      <div style={{ padding:'0 20px', height:38, display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setCatModal(true)}
            style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>
            ⊕ Categorias
          </button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setImportModal(true)} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>Importar</button>
          <button onClick={openAdd} style={{ background:'var(--gold)', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--bg)', padding:'5px 12px', borderRadius:2 }}>+ Artigo</button>
        </div>
      </div>

      {/* LISTA ARTIGOS */}
      <div style={{ flex:1, overflowY:'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding:'60px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
            Nenhum artigo
          </div>
        )}
        {filtered.map(a => (
          <ArtCard key={a.id} art={a} onEdit={openEdit} onDel={delArt} showToast={showToast} />
        ))}
      </div>
    </div>

    {/* MODAL ARTIGO */}
    <div className={`overlay ${artModal?'open':''}`}>
      <div className="modal">
        <div className="modal-head">{editId?'Editar artigo':'Novo artigo'}<button className="modal-close" onClick={()=>setArtModal(false)}>✕</button></div>
        <div className="frow"><label style={S.label}>Referência</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="ex: 96652314" style={{...S.inp,fontFamily:"'Barlow Condensed'",letterSpacing:'0.1em'}}/></div>
        <div className="frow"><label style={S.label}>Descrição</label><input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="ex: Puxador barra inox 160mm" style={S.inp}/></div>
        <div className="frow"><label style={S.label}>Categoria</label>
          <select value={(form.cat||'')+'|'+(form.sub||'')} onChange={e=>{const[c,s]=e.target.value.split('|');setForm(f=>({...f,cat:c,sub:s||''}))}} style={S.inp}>
            <option value="|">— selecionar —</option>{catOptions}
          </select>
        </div>
        <div className="frow half">
          <div><label style={S.label}>Preço (€)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" step="0.01" min="0" style={S.inp}/></div>
          <div><label style={S.label}>Fornecedor</label><input value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} placeholder="ex: Hafele" style={S.inp}/></div>
        </div>
        <div className="frow"><label style={S.label}>Link</label><input type="url" value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://…" style={S.inp}/></div>
        <div className="frow"><label style={S.label}>Notas</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Observações…" style={{...S.inp,resize:'vertical',minHeight:52}}/></div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={()=>setArtModal(false)}>Cancelar</button>
          <button className="btn btn-gold" onClick={saveArt}>Guardar</button>
        </div>
      </div>
    </div>

    {/* MODAL CATEGORIAS */}
    <CatModal open={catModal} cats={cats} arts={arts} onClose={()=>setCatModal(false)} onSave={saveCat} showToast={showToast} />

    {/* MODAL IMPORTAR */}
    <div className={`overlay ${importModal?'open':''}`}>
      <div className="modal">
        <div className="modal-head">Importar artigos<button className="modal-close" onClick={()=>setImportModal(false)}>✕</button></div>
        <div style={{color:'var(--text2)',fontSize:13,fontWeight:300,lineHeight:1.9,marginBottom:24}}>Importa a partir de CSV ou Excel. Colunas:</div>
        <div style={{background:'var(--bg)',padding:'14px 18px',fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.1em',color:'var(--gold)',lineHeight:2.4,borderLeft:'2px solid var(--gold2)'}}>
          REFERÊNCIA · DESCRIÇÃO · CATEGORIA · SUBCATEGORIA<br/>PREÇO · FORNECEDOR · LINK · NOTAS
        </div>
        <div style={{marginTop:20,padding:32,border:'1px solid var(--line2)',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text3)'}}>Próximo módulo</div>
        <div className="modal-actions"><button className="btn btn-outline" onClick={()=>setImportModal(false)}>Fechar</button></div>
      </div>
    </div>
    </>
  )
}

// ── ArtCard ─────────────────────────────────────────────────────────────────
function ArtCard({ art, onEdit, onDel, showToast }) {
  const [copied, setCopied] = useState(false)
  const label = art.sub ? art.cat + ' · ' + art.sub : art.cat

  const copy = () => {
    navigator.clipboard.writeText(art.ref).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
    showToast('Referência copiada — ' + art.ref)
  }

  return (
    <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:600, letterSpacing:'0.1em', color:'var(--gold)', flexShrink:0 }}>{art.ref}</span>
          <button onClick={copy} style={{ flexShrink:0, display:'inline-flex', alignItems:'center', padding:'2px 8px', border:'1px solid', borderColor:copied?'var(--gold)':'var(--line2)', borderRadius:2, background:'transparent', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:copied?'var(--gold)':'var(--text3)', transition:'all .12s' }}>
            {copied ? '✓' : '⎘'}
          </button>
        </div>
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          {art.link && <a href={art.link} target="_blank" rel="noreferrer" style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', textDecoration:'none', padding:'4px 0' }}>↗</a>}
          <button onClick={() => onEdit(art)} style={{ background:'transparent', border:'1px solid var(--line2)', width:26, height:26, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
          <button onClick={() => onDel(art.id, art.desc)} style={{ background:'transparent', border:'1px solid var(--line2)', width:26, height:26, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
      </div>
      <div style={{ fontSize:13, fontWeight:400, color:'var(--text)', lineHeight:1.4 }}>{art.desc}</div>
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <span className="badge">{label}</span>
        {art.price > 0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:500, color:'var(--text2)', letterSpacing:'0.06em' }}>{art.price.toFixed(2)} €</span>}
        {art.supplier && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.08em', color:'var(--text3)', textTransform:'uppercase' }}>{art.supplier}</span>}
        {art.notes && <span style={{ fontSize:11, color:'var(--text3)', fontWeight:300 }}>{art.notes}</span>}
      </div>
    </div>
  )
}

// ── CatModal ─────────────────────────────────────────────────────────────────
function CatModal({ open, cats, arts, onClose, onSave, showToast }) {
  const [newCat, setNewCat] = useState('')

  const addCat = async () => {
    const v = newCat.trim()
    if (!v) return
    if (cats.some(c => c.name === v)) { showToast('Já existe'); return }
    const id = v.toLowerCase().replace(/[^a-z0-9]/g,'') + (Date.now()%10000)
    await onSave({ id, name:v, subs:[] })
    setNewCat('')
    showToast('Categoria criada')
  }

  const removeCat = async (cat) => {
    const n = arts.filter(a => a.cat === cat.name).length
    if (n > 0 && !confirm('"' + cat.name + '" tem ' + n + ' artigo(s). Confirmar?')) return
    await deleteDoc(doc(db,'categorias',cat.id))
    showToast('Removida')
  }

  const addSub = async (cat, val) => {
    if (!val || !val.trim()) return
    if ((cat.subs||[]).includes(val.trim())) { showToast('Já existe'); return }
    await onSave({ ...cat, subs:[...(cat.subs||[]), val.trim()] })
    showToast('Subcategoria adicionada')
  }

  const removeSub = async (cat, sub) => {
    await onSave({ ...cat, subs:(cat.subs||[]).filter(s=>s!==sub) })
  }

  return (
    <div className={`overlay ${open?'open':''}`}>
      <div className="modal" style={{width:500}}>
        <div className="modal-head">Categorias<button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{maxHeight:'50vh',overflowY:'auto',marginBottom:16}}>
          {cats.map(cat => <CatEditBlock key={cat.id} cat={cat} arts={arts} onRemove={removeCat} onAddSub={addSub} onRemSub={removeSub}/>)}
        </div>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--text3)',marginBottom:8}}>Nova categoria</div>
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()} placeholder="ex: Ferragens de Quarto"
            style={{flex:1,background:'transparent',border:'none',borderBottom:'1px solid var(--line2)',padding:'8px 0',fontFamily:"'Barlow'",fontSize:13,fontWeight:300,color:'var(--text)',outline:'none'}}/>
          <button className="btn btn-gold" onClick={addCat} style={{height:32}}>Adicionar</button>
        </div>
        <div className="modal-actions"><button className="btn btn-gold" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  )
}

function CatEditBlock({ cat, arts, onRemove, onAddSub, onRemSub }) {
  const [newSub, setNewSub] = useState('')
  return (
    <div style={{marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--line)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text)'}}>{cat.name}</span>
        <button onClick={()=>onRemove(cat)} style={{background:'transparent',border:'1px solid var(--line2)',width:24,height:24,cursor:'pointer',color:'var(--text3)',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
      </div>
      {(cat.subs||[]).map(s=>(
        <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0 5px 12px',borderBottom:'1px solid var(--line)'}}>
          <span style={{fontSize:12,fontWeight:300,color:'var(--text2)'}}>↳ {s}</span>
          <button onClick={()=>onRemSub(cat,s)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:11}}>✕</button>
        </div>
      ))}
      <div style={{display:'flex',gap:8,marginTop:8,paddingLeft:12}}>
        <input value={newSub} onChange={e=>setNewSub(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){onAddSub(cat,newSub);setNewSub('')}}} placeholder="+ subcategoria"
          style={{flex:1,background:'transparent',border:'none',borderBottom:'1px solid var(--line2)',padding:'5px 0',fontFamily:"'Barlow'",fontSize:12,fontWeight:300,color:'var(--text)',outline:'none'}}/>
        <button onClick={()=>{onAddSub(cat,newSub);setNewSub('')}} style={{background:'transparent',border:'1px solid var(--line2)',padding:'0 10px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',color:'var(--text2)'}}>Add</button>
      </div>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import {
  collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc
} from 'firebase/firestore'

const DEFAULT_CATS = [
  { id: 'ferragens',    name: 'Ferragens',               subs: ['Ferragens de Cozinha', 'Puxadores', 'Calhas'] },
  { id: 'iluminacao',  name: 'Iluminação',               subs: [] },
  { id: 'colas',       name: 'Colas · Tintas · Vernizes',subs: [] },
  { id: 'eletro',      name: 'Eletrodomésticos',         subs: [] },
  { id: 'tampos',      name: 'Tampos',                   subs: [] },
  { id: 'sanitarios',  name: 'Sanitários',               subs: [] },
  { id: 'caixilharia', name: 'Caixilharia',              subs: [] },
  { id: 'decoracao',   name: 'Decoração',                subs: [] },
  { id: 'aquecimento', name: 'Aquecimento',              subs: [] },
  { id: 'materialpro', name: 'Material PRO',             subs: [] },
  { id: 'limpeza',     name: 'Limpeza',                  subs: [] },
  { id: 'acessorios',  name: 'Acessórios',               subs: [] },
]

export default function Biblioteca({ showToast }) {
  const [cats, setCats]         = useState(DEFAULT_CATS)
  const [arts, setArts]         = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [activeSub, setActiveSub] = useState('')
  const [openCatId, setOpenCatId] = useState(null)
  const [search, setSearch]     = useState('')
  const [artModal, setArtModal] = useState(false)
  const [catModal, setCatModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ ref:'', desc:'', cat:'', sub:'', price:'', supplier:'', link:'', notes:'' })

  // ── Firebase: categorias ──────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categorias'), snap => {
      if (snap.empty) {
        DEFAULT_CATS.forEach(c => setDoc(doc(db, 'categorias', c.id), { name: c.name, subs: c.subs }))
      } else {
        setCats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      }
    })
    return unsub
  }, [])

  // ── Firebase: artigos ─────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'artigos'), snap => {
      setArts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  // ── Helpers ───────────────────────────────────────────────────────────
  const countFor = (catName, subName) =>
    arts.filter(a => subName ? (a.cat === catName && a.sub === subName) : a.cat === catName).length

  const filteredArts = arts.filter(a => {
    const mc = activeCat === 'all' ? true : activeSub ? (a.cat === activeCat && a.sub === activeSub) : a.cat === activeCat
    const q  = search.toLowerCase()
    const mq = !q || [a.ref, a.desc, a.cat, a.sub, a.supplier, a.notes].some(v => v && v.toLowerCase().includes(q))
    return mc && mq
  })

  // ── Copy ref ─────────────────────────────────────────────────────────
  const copyRef = (ref, id) => {
    navigator.clipboard.writeText(ref).catch(() => {})
    showToast('Referência copiada — ' + ref)
  }

  // ── Save article ──────────────────────────────────────────────────────
  const saveArt = async () => {
    if (!form.ref.trim() || !form.desc.trim()) { showToast('Referência e descrição obrigatórias'); return }
    const data = {
      ref: form.ref.trim(), desc: form.desc.trim(),
      cat: form.cat, sub: form.sub || '',
      price: parseFloat(form.price) || 0,
      supplier: form.supplier.trim(), link: form.link.trim(), notes: form.notes.trim()
    }
    try {
      if (editId) { await updateDoc(doc(db, 'artigos', editId), data); showToast('Artigo atualizado') }
      else        { await addDoc(collection(db, 'artigos'), data);      showToast('Artigo adicionado') }
      setArtModal(false)
    } catch(e) { showToast('Erro ao guardar') }
  }

  const delArt = async (id, desc) => {
    if (!confirm('Eliminar "' + desc + '"?')) return
    await deleteDoc(doc(db, 'artigos', id))
    showToast('Eliminado')
  }

  const openAdd = () => {
    setEditId(null)
    setForm({ ref:'', desc:'', cat: activeCat !== 'all' ? activeCat : '', sub: activeSub, price:'', supplier:'', link:'', notes:'' })
    setArtModal(true)
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ ref:a.ref, desc:a.desc, cat:a.cat, sub:a.sub||'', price:a.price||'', supplier:a.supplier||'', link:a.link||'', notes:a.notes||'' })
    setArtModal(true)
  }

  // ── Category helpers ──────────────────────────────────────────────────
  const saveCat = async (cat) => {
    await setDoc(doc(db, 'categorias', cat.id), { name: cat.name, subs: cat.subs })
  }

  const addSubPrompt = async (cat) => {
    const name = prompt('Nova subcategoria em "' + cat.name + '":')
    if (!name || !name.trim()) return
    const v = name.trim()
    if (cat.subs.includes(v)) { showToast('Já existe'); return }
    await saveCat({ ...cat, subs: [...cat.subs, v] })
    setOpenCatId(cat.id)
    showToast('Subcategoria criada')
  }

  // ── Sidebar click ─────────────────────────────────────────────────────
  const clickCat = (cat) => {
    if (cat.subs.length > 0) setOpenCatId(openCatId === cat.id ? null : cat.id)
    setActiveCat(cat.name)
    setActiveSub('')
  }

  const clickSub = (catName, sub) => {
    setActiveCat(catName)
    setActiveSub(sub)
  }

  // ── Cat select options ────────────────────────────────────────────────
  const catOptions = cats.flatMap(c => [
    <option key={c.id} value={c.name + '|'}>{c.name}</option>,
    ...c.subs.map(s => <option key={c.id + s} value={c.name + '|' + s}>&nbsp;&nbsp;↳ {s}</option>)
  ])

  // ── Section title ─────────────────────────────────────────────────────
  const sectionTitle = activeCat === 'all' ? 'Todos' : activeCat
  const sectionSub   = activeSub ? '/ ' + activeSub : ''

  return (
    <>
      {/* TOOLBAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', height:'44px', borderBottom:'1px solid var(--line)', background:'var(--bg2)', flexShrink:0 }}>
        <div style={{ position:'relative', width:'320px' }}>
          <span style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:'13px' }}>⌕</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar artigo, referência, fornecedor…"
            style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'4px 0 4px 20px', fontFamily:'var(--body)', fontSize:'12px', fontWeight:300, color:'var(--text)', outline:'none', letterSpacing:'0.04em' }} />
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
          {search && <span style={{ fontFamily:'var(--head)', fontSize:'9px', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)' }}>{filteredArts.length} resultado{filteredArts.length !== 1 ? 's' : ''}</span>}
          <button className="btn btn-outline" onClick={() => setImportModal(true)}>Importar</button>
          <button className="btn btn-gold"    onClick={openAdd}>+ Artigo</button>
        </div>
      </div>

      {/* MAIN */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ width:200, flexShrink:0, borderRight:'1px solid var(--line)', display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg)' }}>
          <div style={{ padding:'16px 20px 10px', fontFamily:'var(--head)', fontSize:'9px', fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>Categorias</div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {/* Todos */}
            <SideItem label="Todos" count={arts.length} active={activeCat==='all'} onClick={() => { setActiveCat('all'); setActiveSub('') }} indent={false} />
            {cats.map(c => (
              <div key={c.id}>
                <SideItem
                  label={c.name} count={countFor(c.name, '')}
                  active={activeCat === c.name && activeSub === ''}
                  hasArrow={c.subs.length > 0} arrowOpen={openCatId === c.id}
                  onClick={() => clickCat(c)} indent={false}
                />
                {c.subs.length > 0 && openCatId === c.id && (
                  <>
                    {c.subs.map(s => (
                      <SideItem key={s} label={s} count={countFor(c.name, s)}
                        active={activeCat === c.name && activeSub === s}
                        onClick={() => clickSub(c.name, s)} indent={true} />
                    ))}
                    <div onClick={() => addSubPrompt(c)}
                      style={{ padding:'5px 20px 5px 34px', fontSize:'10px', fontFamily:'var(--head)', letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text3)', cursor:'pointer' }}
                      onMouseEnter={e => e.target.style.color='var(--gold)'}
                      onMouseLeave={e => e.target.style.color='var(--text3)'}>
                      + subcategoria
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div onClick={() => setCatModal(true)}
            style={{ padding:'12px 20px', borderTop:'1px solid var(--line)', fontFamily:'var(--head)', fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', cursor:'pointer', display:'flex', alignItems:'center', gap:6 }}
            onMouseEnter={e => e.currentTarget.style.color='var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color='var(--text3)'}>
            ⊕ &nbsp;Gerir categorias
          </div>
        </div>

        {/* TABLE */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--bg2)' }}>
          <div style={{ padding:'0 28px', height:38, display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--head)', fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase' }}>{sectionTitle}</span>
            <span style={{ fontFamily:'var(--head)', fontSize:10, color:'var(--text3)', letterSpacing:'0.06em' }}>{filteredArts.length} artigo{filteredArts.length !== 1 ? 's' : ''}</span>
            {sectionSub && <span style={{ fontFamily:'var(--head)', fontSize:10, color:'var(--text3)', letterSpacing:'0.06em' }}>{sectionSub}</span>}
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Referência','Artigo','Categoria','Preço','Fornecedor','Link',''].map((h, i) => (
                    <th key={i} style={{ padding:'9px 14px', textAlign: h === 'Preço' ? 'right' : 'left', fontFamily:'var(--head)', fontSize:9, fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', background:'var(--bg)', borderBottom:'1px solid var(--line)', position:'sticky', top:0, zIndex:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredArts.map(a => (
                  <ArtRow key={a.id} art={a} onCopy={copyRef} onEdit={openEdit} onDel={delArt} />
                ))}
              </tbody>
            </table>
            {!filteredArts.length && (
              <div style={{ padding:'80px 28px', textAlign:'center', fontFamily:'var(--head)', fontSize:10, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)' }}>
                Nenhum artigo encontrado
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL ARTIGO */}
      <div className={`overlay ${artModal ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setArtModal(false)}>
        <div className="modal">
          <div className="modal-head">{editId ? 'Editar artigo' : 'Novo artigo'}</div>
          <div className="frow">
            <label>Referência</label>
            <input value={form.ref} onChange={e => setForm(f => ({...f, ref:e.target.value}))} placeholder="ex: 96652314" style={{ fontFamily:'var(--head)', letterSpacing:'0.1em' }} />
          </div>
          <div className="frow">
            <label>Descrição</label>
            <input value={form.desc} onChange={e => setForm(f => ({...f, desc:e.target.value}))} placeholder="ex: Puxador barra inox 160mm" />
          </div>
          <div className="frow">
            <label>Categoria</label>
            <select value={form.cat + '|' + (form.sub||'')} onChange={e => { const [c,s] = e.target.value.split('|'); setForm(f => ({...f, cat:c, sub:s||''})) }}>
              <option value="|">— selecionar —</option>
              {catOptions}
            </select>
          </div>
          <div className="frow half">
            <div>
              <label>Preço unitário (€)</label>
              <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price:e.target.value}))} placeholder="0.00" step="0.01" min="0" />
            </div>
            <div>
              <label>Fornecedor</label>
              <input value={form.supplier} onChange={e => setForm(f => ({...f, supplier:e.target.value}))} placeholder="ex: Hafele" />
            </div>
          </div>
          <div className="frow">
            <label>Link</label>
            <input type="url" value={form.link} onChange={e => setForm(f => ({...f, link:e.target.value}))} placeholder="https://…" />
          </div>
          <div className="frow">
            <label>Notas</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes:e.target.value}))} placeholder="Observações, variantes…" />
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setArtModal(false)}>Cancelar</button>
            <button className="btn btn-gold"    onClick={saveArt}>Guardar</button>
          </div>
        </div>
      </div>

      {/* MODAL CATEGORIAS */}
      <CatModal open={catModal} cats={cats} arts={arts} onClose={() => setCatModal(false)} onSave={saveCat} showToast={showToast} />

      {/* MODAL IMPORTAR */}
      <div className={`overlay ${importModal ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && setImportModal(false)}>
        <div className="modal">
          <div className="modal-head">Importar Artigos</div>
          <div style={{ color:'var(--text2)', fontSize:13, fontWeight:300, lineHeight:1.9, marginBottom:24 }}>Importa uma lista a partir de CSV ou Excel. Colunas esperadas:</div>
          <div style={{ background:'var(--bg)', padding:'14px 18px', fontFamily:'var(--head)', fontSize:11, letterSpacing:'0.1em', color:'var(--gold)', lineHeight:2.2, borderLeft:'2px solid var(--gold2)' }}>
            REFERÊNCIA · DESCRIÇÃO · CATEGORIA · SUBCATEGORIA<br />
            PREÇO · FORNECEDOR · LINK · NOTAS
          </div>
          <div style={{ marginTop:20, padding:32, border:'1px solid var(--line2)', textAlign:'center', fontFamily:'var(--head)', fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
            Próximo passo de desenvolvimento
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setImportModal(false)}>Fechar</button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function SideItem({ label, count, active, hasArrow, arrowOpen, onClick, indent }) {
  const [hover, setHover] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding: indent ? '6px 20px 6px 34px' : '8px 20px',
        cursor:'pointer', transition:'all .12s', fontSize: indent ? 11 : 12,
        fontWeight:300, letterSpacing:'0.03em',
        color: active ? 'var(--gold)' : hover ? 'var(--text)' : indent ? 'var(--text3)' : 'var(--text2)',
        background: active || hover ? 'var(--bg2)' : 'transparent',
        borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
        userSelect:'none'
      }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
        {hasArrow && <span style={{ fontSize:8, transition:'transform .15s', display:'inline-block', transform: arrowOpen ? 'rotate(90deg)' : 'none', color:'var(--text3)' }}>▶</span>}
        {!hasArrow && !indent && <span style={{ width:15, display:'inline-block' }} />}
        <span>{label}</span>
      </div>
      <span style={{ fontFamily:'var(--head)', fontSize:9, color: active ? 'var(--gold2)' : 'var(--text3)' }}>{count}</span>
    </div>
  )
}

function ArtRow({ art, onCopy, onEdit, onDel }) {
  const [hover, setHover] = useState(false)
  const [copied, setCopied] = useState(false)
  const label = art.sub ? art.cat + ' · ' + art.sub : art.cat

  const handleCopy = () => {
    onCopy(art.ref, art.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <tr onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ borderBottom:'1px solid var(--line)', background: hover ? 'var(--bg3)' : 'transparent', transition:'background .1s' }}>
      <td style={{ padding:'11px 14px', verticalAlign:'middle', whiteSpace:'nowrap' }}>
        <span style={{ fontFamily:'var(--head)', fontSize:14, fontWeight:500, letterSpacing:'0.1em', color:'var(--gold)' }}>{art.ref}</span>
        <button onClick={handleCopy}
          style={{ marginLeft:8, padding:'2px 8px', border:'1px solid', borderColor: copied ? 'var(--gold)' : 'var(--line2)', borderRadius:2, background:'transparent', cursor:'pointer', fontFamily:'var(--head)', fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color: copied ? 'var(--gold)' : 'var(--text3)', transition:'all .12s' }}>
          {copied ? '✓ copiado' : '⎘ copiar'}
        </button>
      </td>
      <td style={{ padding:'11px 14px', verticalAlign:'middle' }}>
        <div style={{ fontSize:13, fontWeight:400, color:'var(--text)', letterSpacing:'0.02em' }}>{art.desc}</div>
        {art.notes && <div style={{ fontSize:11, color:'var(--text3)', marginTop:2, fontWeight:300 }}>{art.notes}</div>}
      </td>
      <td style={{ padding:'11px 14px', verticalAlign:'middle' }}><span className="badge">{label}</span></td>
      <td style={{ padding:'11px 14px', verticalAlign:'middle', fontFamily:'var(--head)', fontSize:13, fontWeight:500, textAlign:'right', color:'var(--text)', whiteSpace:'nowrap' }}>
        {art.price > 0 ? art.price.toFixed(2) + ' €' : '—'}
      </td>
      <td style={{ padding:'11px 14px', verticalAlign:'middle', fontSize:11, fontWeight:300, color:'var(--text2)' }}>{art.supplier || '—'}</td>
      <td style={{ padding:'11px 14px', verticalAlign:'middle' }}>
        {art.link ? <a href={art.link} target="_blank" rel="noreferrer" style={{ fontFamily:'var(--head)', fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', textDecoration:'none' }}>↗ ver</a> : '—'}
      </td>
      <td style={{ padding:'11px 14px', verticalAlign:'middle' }}>
        <div style={{ display:'flex', gap:4, alignItems:'center', justifyContent:'flex-end', opacity: hover ? 1 : 0, transition:'opacity .12s' }}>
          <IBtn onClick={() => onEdit(art)} title="Editar">✎</IBtn>
          <IBtn onClick={() => onDel(art.id, art.desc)} title="Eliminar" danger>✕</IBtn>
        </div>
      </td>
    </tr>
  )
}

function IBtn({ onClick, children, title, danger }) {
  const [h, setH] = useState(false)
  return (
    <button onClick={onClick} title={title} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width:26, height:26, border:'1px solid', borderRadius:2, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, transition:'all .12s',
        borderColor: h ? (danger ? 'var(--danger)' : 'var(--text2)') : 'var(--line2)',
        color: h ? (danger ? 'var(--danger)' : 'var(--text)') : 'var(--text3)' }}>
      {children}
    </button>
  )
}

function CatModal({ open, cats, arts, onClose, onSave, showToast }) {
  const [newCat, setNewCat] = useState('')

  const addCat = async () => {
    const v = newCat.trim()
    if (!v) return
    if (cats.some(c => c.name === v)) { showToast('Já existe'); return }
    const id = v.toLowerCase().replace(/[^a-z0-9]/g, '')
    await onSave({ id, name: v, subs: [] })
    setNewCat('')
    showToast('Categoria criada')
  }

  const renCat = async (cat, newName) => {
    await onSave({ ...cat, name: newName })
    const batch = arts.filter(a => a.cat === cat.name)
    // update arts with old cat name — handled via Firebase rules or batch
  }

  const removeCat = async (cat) => {
    const n = arts.filter(a => a.cat === cat.name).length
    if (n > 0 && !confirm('"' + cat.name + '" tem ' + n + ' artigo(s). Confirmar?')) return
    await deleteDoc(doc(db, 'categorias', cat.id))
    showToast('Categoria removida')
  }

  const addSub = async (cat, val) => {
    if (!val.trim()) return
    if (cat.subs.includes(val.trim())) { showToast('Já existe'); return }
    await onSave({ ...cat, subs: [...cat.subs, val.trim()] })
    showToast('Subcategoria adicionada')
  }

  const removeSub = async (cat, sub) => {
    const n = arts.filter(a => a.cat === cat.name && a.sub === sub).length
    if (n > 0 && !confirm('"' + sub + '" tem ' + n + ' artigo(s). Confirmar?')) return
    await onSave({ ...cat, subs: cat.subs.filter(s => s !== sub) })
  }

  return (
    <div className={`overlay ${open ? 'open' : ''}`} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width:500 }}>
        <div className="modal-head">Gerir Categorias</div>
        <div style={{ maxHeight:400, overflowY:'auto' }}>
          {cats.map(cat => (
            <CatEditBlock key={cat.id} cat={cat} arts={arts} onRen={renCat} onRemove={removeCat} onAddSub={addSub} onRemSub={removeSub} />
          ))}
        </div>
        <div style={{ fontFamily:'var(--head)', fontSize:'9px', fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)', margin:'16px 0 8px' }}>Nova categoria principal</div>
        <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
          <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="ex: Ferragens de Quarto"
            style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:'var(--body)', fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' }} />
          <button className="btn btn-gold" onClick={addCat}>Adicionar</button>
        </div>
        <div className="modal-actions">
          <button className="btn btn-gold" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function CatEditBlock({ cat, arts, onRen, onRemove, onAddSub, onRemSub }) {
  const [name, setName]   = useState(cat.name)
  const [newSub, setNewSub] = useState('')

  useEffect(() => setName(cat.name), [cat.name])

  return (
    <div style={{ marginBottom:12, paddingBottom:10, borderBottom:'1px solid var(--line)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, paddingBottom:6 }}>
        <input value={name} onChange={e => setName(e.target.value)} onBlur={() => name !== cat.name && onRen(cat, name)}
          style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid transparent', padding:'3px 0', fontFamily:'var(--body)', fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' }}
          onFocus={e => e.target.style.borderBottomColor='var(--gold)'}
          onBlurCapture={e => e.target.style.borderBottomColor='transparent'} />
        <IBtn onClick={() => onRemove(cat)} danger>✕</IBtn>
      </div>
      {cat.subs.length > 0 && (
        <div style={{ paddingLeft:14, borderLeft:'1px solid var(--line2)', marginBottom:6 }}>
          {cat.subs.map(s => (
            <div key={s} style={{ display:'flex', alignItems:'center', gap:8, padding:'5px 0', borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontSize:10, color:'var(--text3)', marginRight:4 }}>↳</span>
              <span style={{ flex:1, fontSize:12, fontWeight:300, color:'var(--text2)' }}>{s}</span>
              <IBtn onClick={() => onRemSub(cat, s)} danger>✕</IBtn>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:'flex', gap:8, paddingLeft:14, alignItems:'flex-end', marginTop:4 }}>
        <input value={newSub} onChange={e => setNewSub(e.target.value)} onKeyDown={e => { if(e.key==='Enter'){ onAddSub(cat,newSub); setNewSub('') } }} placeholder={'+ subcategoria em ' + cat.name + '…'}
          style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'5px 0', fontFamily:'var(--body)', fontSize:12, fontWeight:300, color:'var(--text)', outline:'none' }} />
        <button className="btn btn-outline" style={{ height:26, fontSize:9, padding:'0 10px' }} onClick={() => { onAddSub(cat,newSub); setNewSub('') }}>Add</button>
      </div>
    </div>
  )
}

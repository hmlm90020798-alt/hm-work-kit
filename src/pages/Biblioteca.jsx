import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'

const DEFAULT_CATS = [
  { id:'ferragens',    name:'Ferragens',                subs:['Ferragens de Cozinha','Puxadores','Calhas'] },
  { id:'iluminacao',   name:'Iluminação',               subs:[] },
  { id:'colas',        name:'Colas · Tintas · Vernizes',subs:[] },
  { id:'eletro',       name:'Eletrodomésticos',         subs:[] },
  { id:'tampos',       name:'Tampos',                   subs:[] },
  { id:'sanitarios',   name:'Sanitários',               subs:[] },
  { id:'caixilharia',  name:'Caixilharia',              subs:[] },
  { id:'decoracao',    name:'Decoração',                subs:[] },
  { id:'aquecimento',  name:'Aquecimento',              subs:[] },
  { id:'materialpro',  name:'Material PRO',             subs:[] },
  { id:'limpeza',      name:'Limpeza',                  subs:[] },
  { id:'acessorios',   name:'Acessórios',               subs:[] },
]

export default function Biblioteca({ showToast }) {
  const [cats, setCats]         = useState(DEFAULT_CATS)
  const [arts, setArts]         = useState([])
  const [activeCat, setActiveCat] = useState('all')
  const [activeSub, setActiveSub] = useState('')
  const [openCatId, setOpenCatId] = useState(null)
  const [search, setSearch]     = useState('')
  const [searching, setSearching] = useState(false)
  const [artModal, setArtModal] = useState(false)
  const [catModal, setCatModal] = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ ref:'',desc:'',cat:'',sub:'',price:'',supplier:'',link:'',notes:'' })
  const [view, setView]         = useState('list') // 'list' | 'cat'

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categorias'), snap => {
      if (snap.empty) DEFAULT_CATS.forEach(c => setDoc(doc(db,'categorias',c.id),{name:c.name,subs:c.subs}))
      else setCats(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'artigos'), snap => {
      setArts(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    })
    return unsub
  }, [])

  const countFor = (catName, subName) =>
    arts.filter(a => subName ? (a.cat===catName && a.sub===subName) : a.cat===catName).length

  const filtered = arts.filter(a => {
    const mc = activeCat==='all' ? true : activeSub ? (a.cat===activeCat && a.sub===activeSub) : a.cat===activeCat
    const q  = search.toLowerCase()
    const mq = !q || [a.ref,a.desc,a.cat,a.sub,a.supplier,a.notes].some(v => v&&v.toLowerCase().includes(q))
    return mc && mq
  })

  const saveCat = async (cat) => {
    await setDoc(doc(db,'categorias',cat.id),{name:cat.name,subs:cat.subs})
  }

  const saveArt = async () => {
    if (!form.ref.trim()||!form.desc.trim()) { showToast('Referência e descrição obrigatórias'); return }
    const data = { ref:form.ref.trim(), desc:form.desc.trim(), cat:form.cat, sub:form.sub||'', price:parseFloat(form.price)||0, supplier:form.supplier.trim(), link:form.link.trim(), notes:form.notes.trim() }
    try {
      if (editId) { await updateDoc(doc(db,'artigos',editId),data); showToast('Artigo atualizado') }
      else        { await addDoc(collection(db,'artigos'),data);     showToast('Artigo adicionado') }
      setArtModal(false)
    } catch(e) { showToast('Erro ao guardar') }
  }

  const delArt = async (id, desc) => {
    if (!confirm('Eliminar "'+desc+'"?')) return
    await deleteDoc(doc(db,'artigos',id))
    showToast('Eliminado')
  }

  const openAdd = () => {
    setEditId(null)
    setForm({ ref:'',desc:'',cat:activeCat!=='all'?activeCat:'',sub:activeSub,price:'',supplier:'',link:'',notes:'' })
    setArtModal(true)
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ ref:a.ref,desc:a.desc,cat:a.cat,sub:a.sub||'',price:a.price||'',supplier:a.supplier||'',link:a.link||'',notes:a.notes||'' })
    setArtModal(true)
  }

  const catOptions = cats.flatMap(c => [
    <option key={c.id} value={c.name+'|'}>{c.name}</option>,
    ...c.subs.map(s => <option key={c.id+s} value={c.name+'|'+s}>&nbsp;&nbsp;↳ {s}</option>)
  ])

  const sectionLabel = activeCat==='all' ? 'Todos' : activeSub ? activeSub : activeCat

  // ── RENDER ─────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* BARRA SUPERIOR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:'48px', borderBottom:'1px solid var(--line)', flexShrink:0, gap:12 }}>

        {/* Filtro activo */}
        {!searching && (
          <button onClick={() => setView(v => v==='cat'?'list':'cat')}
            style={{ background:'transparent', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:8, padding:0 }}>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>{sectionLabel}</span>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)', letterSpacing:'0.08em' }}>{filtered.length}</span>
            <span style={{ fontSize:9, color:'var(--text3)', marginLeft:2 }}>▼</span>
          </button>
        )}

        {/* Search activo */}
        {searching && (
          <input autoFocus value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Pesquisar…"
            style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--gold)', padding:'4px 0', fontFamily:"'Barlow'", fontSize:14, fontWeight:300, color:'var(--text)', outline:'none' }} />
        )}

        <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
          <button onClick={() => { setSearching(s=>!s); if(searching) setSearch('') }}
            style={{ background:'transparent', border:'none', cursor:'pointer', color: searching?'var(--gold)':'var(--text3)', fontSize:16, padding:'4px', lineHeight:1 }}>
            {searching ? '✕' : '⌕'}
          </button>
          <button onClick={openAdd} className="btn btn-gold" style={{ height:30, padding:'0 14px', fontSize:9 }}>+ Artigo</button>
        </div>
      </div>

      {/* PAINEL CATEGORIAS (dropdown) */}
      {view==='cat' && (
        <div style={{ background:'var(--bg2)', borderBottom:'1px solid var(--line)', overflowY:'auto', maxHeight:'60vh', flexShrink:0 }}>
          <CatItem label="Todos" count={arts.length} active={activeCat==='all'}
            onClick={() => { setActiveCat('all'); setActiveSub(''); setView('list') }} />
          {cats.map(c => (
            <div key={c.id}>
              <CatItem label={c.name} count={countFor(c.name,'')}
                active={activeCat===c.name && !activeSub}
                hasArrow={c.subs.length>0} arrowOpen={openCatId===c.id}
                onClick={() => {
                  if (c.subs.length>0) setOpenCatId(openCatId===c.id?null:c.id)
                  setActiveCat(c.name); setActiveSub(''); setView('list')
                }} />
              {c.subs.length>0 && openCatId===c.id && c.subs.map(s => (
                <CatItem key={s} label={s} count={countFor(c.name,s)}
                  active={activeCat===c.name && activeSub===s} indent
                  onClick={() => { setActiveCat(c.name); setActiveSub(s); setView('list') }} />
              ))}
            </div>
          ))}
          <div onClick={() => { setCatModal(true); setView('list') }}
            style={{ padding:'14px 20px', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)', cursor:'pointer', borderTop:'1px solid var(--line)' }}>
            ⊕ &nbsp;Gerir categorias
          </div>
        </div>
      )}

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

      {/* BOTTOM BAR */}
      <div style={{ padding:'10px 20px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'flex-end', flexShrink:0, background:'var(--bg)' }}>
        <button onClick={() => setImportModal(true)}
          style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>
          Importar artigos
        </button>
      </div>
    </div>

    {/* MODAL ARTIGO */}
    <div className={`overlay ${artModal?'open':''}`}>
      <div className="modal">
        <div className="modal-head">
          {editId ? 'Editar artigo' : 'Novo artigo'}
          <button className="modal-close" onClick={() => setArtModal(false)}>✕</button>
        </div>
        <div className="frow">
          <label>Referência</label>
          <input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="96652314" style={{ fontFamily:"'Barlow Condensed'", letterSpacing:'0.12em', fontSize:18 }} />
        </div>
        <div className="frow">
          <label>Descrição</label>
          <input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="ex: Puxador barra inox 160mm" />
        </div>
        <div className="frow">
          <label>Categoria</label>
          <select value={form.cat+'|'+(form.sub||'')} onChange={e=>{ const[c,s]=e.target.value.split('|'); setForm(f=>({...f,cat:c,sub:s||''})) }}>
            <option value="|">— selecionar —</option>
            {catOptions}
          </select>
        </div>
        <div className="frow half">
          <div>
            <label>Preço (€)</label>
            <input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" step="0.01" min="0" />
          </div>
          <div>
            <label>Fornecedor</label>
            <input value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} placeholder="ex: Hafele" />
          </div>
        </div>
        <div className="frow">
          <label>Link</label>
          <input type="url" value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://…" />
        </div>
        <div className="frow">
          <label>Notas</label>
          <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Observações…" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setArtModal(false)}>Cancelar</button>
          <button className="btn btn-gold" onClick={saveArt}>Guardar</button>
        </div>
      </div>
    </div>

    {/* MODAL CATEGORIAS */}
    <CatModal open={catModal} cats={cats} arts={arts} onClose={() => setCatModal(false)} onSave={saveCat} showToast={showToast} />

    {/* MODAL IMPORTAR */}
    <div className={`overlay ${importModal?'open':''}`}>
      <div className="modal">
        <div className="modal-head">
          Importar artigos
          <button className="modal-close" onClick={() => setImportModal(false)}>✕</button>
        </div>
        <div style={{ color:'var(--text2)', fontSize:13, fontWeight:300, lineHeight:1.9, marginBottom:24 }}>
          Importa a partir de CSV ou Excel. Colunas esperadas:
        </div>
        <div style={{ background:'var(--bg)', padding:'14px 18px', fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.1em', color:'var(--gold)', lineHeight:2.4, borderLeft:'2px solid var(--gold2)' }}>
          REFERÊNCIA · DESCRIÇÃO · CATEGORIA · SUBCATEGORIA<br/>
          PREÇO · FORNECEDOR · LINK · NOTAS
        </div>
        <div style={{ marginTop:24, padding:32, border:'1px solid var(--line2)', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
          Próximo módulo
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={() => setImportModal(false)}>Fechar</button>
        </div>
      </div>
    </div>
    </>
  )
}

// ── ArtCard ────────────────────────────────────────────────────────────────
function ArtCard({ art, onEdit, onDel, showToast }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(art.ref).catch(()=>{})
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
    showToast('Referência copiada — ' + art.ref)
  }

  const label = art.sub ? art.cat + ' · ' + art.sub : art.cat

  return (
    <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:10 }}>
      {/* linha 1: ref + acções */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:20, fontWeight:500, letterSpacing:'0.1em', color:'var(--gold)', flexShrink:0 }}>{art.ref}</span>
          <button onClick={copy} style={{
            background:'transparent', border:'1px solid', flexShrink:0,
            borderColor: copied ? 'var(--gold)' : 'var(--line2)',
            padding:'3px 9px', cursor:'pointer',
            fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase',
            color: copied ? 'var(--gold)' : 'var(--text3)', transition:'all .15s'
          }}>
            {copied ? '✓' : '⎘'}
          </button>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0 }}>
          {art.link && (
            <a href={art.link} target="_blank" rel="noreferrer" style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)', textDecoration:'none', padding:'4px 0' }}>↗</a>
          )}
          <button onClick={() => onEdit(art)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>✎</button>
          <button onClick={() => onDel(art.id, art.desc)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>✕</button>
        </div>
      </div>
      {/* linha 2: nome */}
      <div style={{ fontSize:14, fontWeight:400, color:'var(--text)', lineHeight:1.4 }}>{art.desc}</div>
      {/* linha 3: meta */}
      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <span className="badge">{label}</span>
        {art.price > 0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:500, color:'var(--text2)', letterSpacing:'0.06em' }}>{art.price.toFixed(2)} €</span>}
        {art.supplier && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.08em', color:'var(--text3)', textTransform:'uppercase' }}>{art.supplier}</span>}
        {art.notes && <span style={{ fontSize:11, color:'var(--text3)', fontWeight:300 }}>{art.notes}</span>}
      </div>
    </div>
  )
}

// ── CatItem ────────────────────────────────────────────────────────────────
function CatItem({ label, count, active, hasArrow, arrowOpen, onClick, indent }) {
  return (
    <div onClick={onClick} style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding: indent ? '11px 20px 11px 36px' : '14px 20px',
      cursor:'pointer', borderBottom:'1px solid var(--line)',
      background: active ? 'var(--bg3)' : 'transparent',
      borderLeft: active ? '2px solid var(--gold)' : '2px solid transparent',
      transition:'all .12s'
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        {hasArrow && <span style={{ fontSize:8, color:'var(--text3)', display:'inline-block', transform: arrowOpen?'rotate(90deg)':'none', transition:'transform .15s' }}>▶</span>}
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize: indent?11:13, fontWeight: active?500:400, letterSpacing:'0.08em', textTransform:'uppercase', color: active?'var(--gold)':'var(--text2)' }}>{label}</span>
      </div>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color: active?'var(--gold2)':'var(--text3)' }}>{count}</span>
    </div>
  )
}

// ── CatModal ───────────────────────────────────────────────────────────────
function CatModal({ open, cats, arts, onClose, onSave, showToast }) {
  const [newCat, setNewCat] = useState('')

  const addCat = async () => {
    const v = newCat.trim()
    if (!v) return
    if (cats.some(c => c.name===v)) { showToast('Já existe'); return }
    const id = v.toLowerCase().replace(/[^a-z0-9]/g,'')+(Date.now()%10000)
    await onSave({ id, name:v, subs:[] })
    setNewCat('')
    showToast('Categoria criada')
  }

  const removeCat = async (cat) => {
    const n = arts.filter(a => a.cat===cat.name).length
    if (n>0 && !confirm('"'+cat.name+'" tem '+n+' artigo(s). Confirmar?')) return
    await deleteDoc(doc(db,'categorias',cat.id))
    showToast('Removida')
  }

  const addSub = async (cat, val) => {
    if (!val||!val.trim()) return
    if (cat.subs.includes(val.trim())) { showToast('Já existe'); return }
    await onSave({ ...cat, subs:[...cat.subs, val.trim()] })
    showToast('Subcategoria adicionada')
  }

  const removeSub = async (cat, sub) => {
    const n = arts.filter(a => a.cat===cat.name && a.sub===sub).length
    if (n>0 && !confirm('"'+sub+'" tem '+n+' artigo(s). Confirmar?')) return
    await onSave({ ...cat, subs:cat.subs.filter(s=>s!==sub) })
  }

  return (
    <div className={`overlay ${open?'open':''}`}>
      <div className="modal" style={{ maxWidth:500 }}>
        <div className="modal-head">
          Categorias
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ maxHeight:'50vh', overflowY:'auto', marginBottom:24 }}>
          {cats.map(cat => (
            <CatEditBlock key={cat.id} cat={cat} arts={arts} onRemove={removeCat} onAddSub={addSub} onRemSub={removeSub} />
          ))}
        </div>
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)', marginBottom:10 }}>Nova categoria</div>
        <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()} placeholder="ex: Ferragens de Quarto"
            style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:14, fontWeight:300, color:'var(--text)', outline:'none' }} />
          <button className="btn btn-gold" onClick={addCat} style={{ height:34 }}>Adicionar</button>
        </div>
        <div className="modal-actions">
          <button className="btn btn-gold" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function CatEditBlock({ cat, arts, onRemove, onAddSub, onRemSub }) {
  const [newSub, setNewSub] = useState('')
  return (
    <div style={{ marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--line)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>{cat.name}</span>
        <button onClick={() => onRemove(cat)} style={{ background:'transparent', border:'1px solid var(--line2)', width:26, height:26, cursor:'pointer', color:'var(--text3)', fontSize:11, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
      </div>
      {cat.subs.map(s => (
        <div key={s} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'7px 0 7px 14px', borderBottom:'1px solid var(--line)' }}>
          <span style={{ fontSize:12, fontWeight:300, color:'var(--text2)' }}>↳ {s}</span>
          <button onClick={() => onRemSub(cat,s)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:11 }}>✕</button>
        </div>
      ))}
      <div style={{ display:'flex', gap:8, marginTop:8, paddingLeft:14 }}>
        <input value={newSub} onChange={e=>setNewSub(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ onAddSub(cat,newSub); setNewSub('') } }} placeholder="+ subcategoria"
          style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'5px 0', fontFamily:"'Barlow'", fontSize:12, fontWeight:300, color:'var(--text)', outline:'none' }} />
        <button onClick={() => { onAddSub(cat,newSub); setNewSub('') }} style={{ background:'transparent', border:'1px solid var(--line2)', padding:'0 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--text2)' }}>Add</button>
      </div>
    </div>
  )
}

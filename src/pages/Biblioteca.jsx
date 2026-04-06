import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'

export default function Biblioteca({ showToast }) {
  const [cats, setCats]           = useState([])
  const [arts, setArts]           = useState([])
  const [activeCat, setActiveCat] = useState('Todos')
  const [activeSub, setActiveSub] = useState('')
  const [search, setSearch]       = useState('')
  const [catOpen, setCatOpen]     = useState(false)
  const [artModal, setArtModal]   = useState(false)
  const [catModal, setCatModal]   = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm]           = useState({ ref:'', desc:'', cat:'', sub:'', price:'', supplier:'', link:'', notes:'' })
  const searchRef = useRef(null)

  useEffect(() => {
    const u1 = onSnapshot(collection(db, 'categorias'), snap => {
      if (snap.empty) {
        const defaults = [
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
        defaults.forEach(c => setDoc(doc(db,'categorias',c.id), { name:c.name, subs:c.subs }))
      } else {
        setCats(snap.docs.map(d => ({ id:d.id, ...d.data() })))
      }
    })
    const u2 = onSnapshot(collection(db,'artigos'), snap => {
      setArts(snap.docs.map(d => ({ id:d.id, ...d.data() })))
    })
    return () => { u1(); u2() }
  }, [])

  const catNames  = ['Todos', ...cats.map(c => c.name)]
  const activeCatObj = cats.find(c => c.name === activeCat)
  const subs = activeCatObj?.subs?.length > 0 ? activeCatObj.subs : []

  const selectCat = (name) => {
    setActiveCat(name)
    setActiveSub('')
    setCatOpen(false)
  }

  const countFor = (name) => arts.filter(a => a.cat === name).length

  const filtered = arts.filter(a => {
    const mc = activeCat === 'Todos' ? true
      : activeSub ? (a.cat === activeCat && a.sub === activeSub)
      : a.cat === activeCat
    const q  = search.toLowerCase()
    const mq = !q || [a.ref, a.desc, a.cat, a.sub, a.supplier, a.notes].some(v => v && v.toLowerCase().includes(q))
    return mc && mq
  })

  const catOptions = cats.flatMap(c => [
    <option key={c.id} value={c.name+'|'}>{c.name}</option>,
    ...(c.subs||[]).map(s => <option key={c.id+s} value={c.name+'|'+s}>&nbsp;&nbsp;↳ {s}</option>)
  ])

  const openAdd = () => {
    setEditId(null)
    setForm({ ref:'', desc:'', cat: activeCat!=='Todos'?activeCat:'', sub:activeSub, price:'', supplier:'', link:'', notes:'' })
    setArtModal(true)
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ ref:a.ref, desc:a.desc, cat:a.cat, sub:a.sub||'', price:a.price||'', supplier:a.supplier||'', link:a.link||'', notes:a.notes||'' })
    setArtModal(true)
  }

  const saveArt = async () => {
    if (!form.ref.trim() || !form.desc.trim()) { showToast('Referência e descrição obrigatórias'); return }
    const [cat, sub] = (form.cat+'|'+(form.sub||'')).split('|')
    const data = { ref:form.ref.trim(), desc:form.desc.trim(), cat, sub:sub||'', price:parseFloat(form.price)||0, supplier:form.supplier.trim(), link:form.link.trim(), notes:form.notes.trim() }
    try {
      if (editId) { await updateDoc(doc(db,'artigos',editId), data); showToast('Artigo atualizado') }
      else        { await addDoc(collection(db,'artigos'), data);      showToast('Artigo adicionado') }
      setArtModal(false)
    } catch(e) { showToast('Erro ao guardar') }
  }

  const delArt = async (id, desc) => {
    if (!confirm('Eliminar "'+desc+'"?')) return
    await deleteDoc(doc(db,'artigos',id))
    showToast('Eliminado')
  }

  const saveCat = async (cat) => {
    await setDoc(doc(db,'categorias',cat.id), { name:cat.name, subs:cat.subs })
  }

  const L = { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text2)', display:'block', marginBottom:8 }
  const I = { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' }

  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg)' }}>

      {/* ── BARRA PRINCIPAL ── */}
      <div style={{ flexShrink:0, background:'var(--bg)', borderBottom:'1px solid var(--line)', zIndex:10 }}>

        {/* Linha 1 — filtro + pesquisa */}
        <div style={{ display:'flex', alignItems:'center', height:48, padding:'0 16px', gap:10 }}>

          {/* Botão categoria activa */}
          <button onClick={() => setCatOpen(o => !o)}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background: catOpen ? 'var(--bg3)' : 'var(--bg2)',
              border:'1px solid', borderColor: catOpen ? 'var(--gold)' : 'var(--line2)',
              borderRadius:4, padding:'6px 12px', cursor:'pointer',
              transition:'all .15s', flexShrink:0
            }}>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color: catOpen ? 'var(--gold)' : 'var(--text)', whiteSpace:'nowrap' }}>
              {activeCat}
            </span>
            {activeSub && (
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--gold2)', letterSpacing:'0.08em' }}>
                / {activeSub}
              </span>
            )}
            <span style={{ fontSize:8, color: catOpen ? 'var(--gold)' : 'var(--text3)', transition:'transform .15s', transform: catOpen ? 'rotate(180deg)' : 'none' }}>▼</span>
          </button>

          {/* Pesquisa */}
          <div style={{ flex:1, position:'relative' }}>
            <input
              ref={searchRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar…"
              style={{
                width:'100%', background:'var(--bg2)', border:'1px solid var(--line2)',
                borderRadius:4, padding:'7px 32px 7px 12px',
                fontFamily:"'Barlow'", fontSize:13, fontWeight:300,
                color:'var(--text)', outline:'none', transition:'border-color .15s'
              }}
              onFocus={e => e.target.style.borderColor='var(--gold)'}
              onBlur={e  => e.target.style.borderColor='var(--line2)'}
            />
            {search
              ? <button onClick={() => setSearch('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:13, lineHeight:1 }}>✕</button>
              : <span style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', color:'var(--text3)', fontSize:14, pointerEvents:'none' }}>⌕</span>
            }
          </div>

          {/* + Artigo */}
          <button onClick={openAdd}
            style={{ background:'var(--gold)', border:'none', borderRadius:4, cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--bg)', padding:'7px 14px', flexShrink:0, whiteSpace:'nowrap' }}>
            + Artigo
          </button>
        </div>

        {/* Linha 2 — subcategorias (quando existem) */}
        {subs.length > 0 && !catOpen && (
          <div style={{ display:'flex', gap:6, padding:'6px 16px 10px', overflowX:'auto' }}>
            <SubChip label="Todas" active={activeSub===''} onClick={() => setActiveSub('')} />
            {subs.map(s => (
              <SubChip key={s} label={s} active={activeSub===s} onClick={() => setActiveSub(s)} />
            ))}
          </div>
        )}
      </div>

      {/* ── PAINEL CATEGORIAS (dropdown) ── */}
      {catOpen && (
        <>
          {/* Overlay invisível para fechar */}
          <div style={{ position:'fixed', inset:0, zIndex:8 }} onClick={() => setCatOpen(false)} />

          <div style={{
            position:'absolute', top:49, left:0, right:0, zIndex:9,
            background:'var(--bg2)', borderBottom:'1px solid var(--line)',
            padding:'12px 16px 16px',
            boxShadow:'0 8px 24px rgba(0,0,0,0.4)'
          }}>
            {/* Contagem */}
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', marginBottom:10 }}>
              {filtered.length} artigo{filtered.length!==1?'s':''}
            </div>

            {/* Grelha de categorias */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:6 }}>
              <CatChip
                label="Todos"
                count={arts.length}
                active={activeCat==='Todos'}
                onClick={() => selectCat('Todos')}
              />
              {cats.map(c => (
                <CatChip
                  key={c.id}
                  label={c.name}
                  count={countFor(c.name)}
                  active={activeCat===c.name}
                  onClick={() => selectCat(c.name)}
                />
              ))}
            </div>

            {/* Rodapé */}
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12, paddingTop:10, borderTop:'1px solid var(--line)' }}>
              <button onClick={() => { setCatModal(true); setCatOpen(false) }}
                style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>
                ⊕ Gerir categorias
              </button>
              <button onClick={() => { setImportModal(true); setCatOpen(false) }}
                style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>
                ⬆ Importar
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── LISTA ARTIGOS ── */}
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
        <div className="frow"><label style={L}>Referência</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="ex: 96652314" style={{...I,fontFamily:"'Barlow Condensed'",letterSpacing:'0.1em'}}/></div>
        <div className="frow"><label style={L}>Descrição</label><input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="ex: Puxador barra inox 160mm" style={I}/></div>
        <div className="frow">
          <label style={L}>Categoria</label>
          <select value={(form.cat||'')+'|'+(form.sub||'')} onChange={e=>{const[c,s]=e.target.value.split('|');setForm(f=>({...f,cat:c,sub:s||''}))}} style={I}>
            <option value="|">— selecionar —</option>
            {catOptions}
          </select>
        </div>
        <div className="frow half">
          <div><label style={L}>Preço (€)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" step="0.01" min="0" style={I}/></div>
          <div><label style={L}>Fornecedor</label><input value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} placeholder="ex: Hafele" style={I}/></div>
        </div>
        <div className="frow"><label style={L}>Link</label><input type="url" value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://…" style={I}/></div>
        <div className="frow"><label style={L}>Notas</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Observações…" style={{...I,resize:'vertical',minHeight:52}}/></div>
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
        <div style={{color:'var(--text2)',fontSize:13,fontWeight:300,lineHeight:1.9,marginBottom:24}}>Importa a partir de CSV ou Excel. Colunas esperadas:</div>
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

// ── CatChip ─────────────────────────────────────────────────────────────────
function CatChip({ label, count, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      display:'flex', flexDirection:'column', alignItems:'flex-start',
      padding:'10px 12px', border:'1px solid', borderRadius:4,
      borderColor: active ? 'var(--gold)' : 'var(--line2)',
      background: active ? 'rgba(200,169,110,0.08)' : 'var(--bg)',
      cursor:'pointer', transition:'all .12s', textAlign:'left'
    }}>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color: active ? 'var(--gold)' : 'var(--text2)', lineHeight:1.3 }}>{label}</span>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color: active ? 'var(--gold2)' : 'var(--text3)', marginTop:3 }}>{count}</span>
    </button>
  )
}

// ── SubChip ──────────────────────────────────────────────────────────────────
function SubChip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      flexShrink:0, padding:'4px 12px', border:'1px solid',
      borderColor: active ? 'var(--gold)' : 'var(--line2)',
      borderRadius:20, background: active ? 'rgba(200,169,110,0.08)' : 'transparent',
      cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:500,
      letterSpacing:'0.08em', textTransform:'uppercase',
      color: active ? 'var(--gold)' : 'var(--text3)', transition:'all .12s', whiteSpace:'nowrap'
    }}>
      {label}
    </button>
  )
}

// ── ArtCard ──────────────────────────────────────────────────────────────────
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
    <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--line)', display:'flex', flexDirection:'column', gap:7 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:600, letterSpacing:'0.1em', color:'var(--gold)', flexShrink:0 }}>{art.ref}</span>
          <button onClick={copy} style={{ flexShrink:0, padding:'3px 9px', border:'1px solid', borderColor:copied?'var(--gold)':'var(--line2)', borderRadius:2, background:'transparent', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', textTransform:'uppercase', color:copied?'var(--gold)':'var(--text3)', transition:'all .12s' }}>
            {copied?'✓':'⎘'}
          </button>
        </div>
        <div style={{ display:'flex', gap:5, flexShrink:0 }}>
          {art.link && <a href={art.link} target="_blank" rel="noreferrer" style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)', textDecoration:'none', padding:'4px 2px' }}>↗</a>}
          <button onClick={() => onEdit(art)} style={{ background:'transparent', border:'1px solid var(--line2)', width:26, height:26, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
          <button onClick={() => onDel(art.id, art.desc)} style={{ background:'transparent', border:'1px solid var(--line2)', width:26, height:26, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
      </div>
      <div style={{ fontSize:13, fontWeight:400, color:'var(--text)', lineHeight:1.4 }}>{art.desc}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span className="badge">{label}</span>
        {art.price > 0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--text2)', letterSpacing:'0.04em' }}>{art.price.toFixed(2)} €</span>}
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
    if ((cat.subs||[]).includes(val.trim())) { showToast('Já existe'); return }
    await onSave({ ...cat, subs:[...(cat.subs||[]),val.trim()] })
    showToast('Subcategoria adicionada')
  }

  const removeSub = async (cat, sub) => {
    await onSave({ ...cat, subs:(cat.subs||[]).filter(s=>s!==sub) })
  }

  const L = { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text2)', display:'block', marginBottom:8 }
  const I = { flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' }

  return (
    <div className={`overlay ${open?'open':''}`}>
      <div className="modal" style={{width:500}}>
        <div className="modal-head">Categorias<button className="modal-close" onClick={onClose}>✕</button></div>
        <div style={{maxHeight:'50vh',overflowY:'auto',marginBottom:16}}>
          {cats.map(cat=>(
            <div key={cat.id} style={{marginBottom:14,paddingBottom:12,borderBottom:'1px solid var(--line)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:500,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text)'}}>{cat.name}</span>
                <button onClick={()=>removeCat(cat)} style={{background:'transparent',border:'1px solid var(--line2)',width:24,height:24,cursor:'pointer',color:'var(--text3)',fontSize:11,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
              </div>
              {(cat.subs||[]).map(s=>(
                <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0 5px 12px',borderBottom:'1px solid var(--line)'}}>
                  <span style={{fontSize:12,fontWeight:300,color:'var(--text2)'}}>↳ {s}</span>
                  <button onClick={()=>removeSub(cat,s)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--text3)',fontSize:11}}>✕</button>
                </div>
              ))}
              <SubAdd onAdd={(v)=>addSub(cat,v)} catName={cat.name}/>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()} placeholder="Nova categoria…" style={{...I}}/>
          <button className="btn btn-gold" onClick={addCat} style={{height:32,flexShrink:0}}>Adicionar</button>
        </div>
        <div className="modal-actions"><button className="btn btn-gold" onClick={onClose}>Fechar</button></div>
      </div>
    </div>
  )
}

function SubAdd({ onAdd, catName }) {
  const [v, setV] = useState('')
  return (
    <div style={{display:'flex',gap:8,marginTop:8,paddingLeft:12}}>
      <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){onAdd(v);setV('')}}} placeholder={'+ subcategoria em '+catName+'…'}
        style={{flex:1,background:'transparent',border:'none',borderBottom:'1px solid var(--line2)',padding:'5px 0',fontFamily:"'Barlow'",fontSize:12,fontWeight:300,color:'var(--text)',outline:'none'}}/>
      <button onClick={()=>{onAdd(v);setV('')}} style={{background:'transparent',border:'1px solid var(--line2)',padding:'0 10px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',color:'var(--text2)'}}>Add</button>
    </div>
  )
}

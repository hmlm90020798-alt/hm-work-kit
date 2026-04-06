import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'
import '../styles/biblioteca.css'

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

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'categorias'), snap => {
      if (snap.empty) {
        const defs = [
          {id:'ferragens',   name:'Ferragens',                subs:['Ferragens de Cozinha','Puxadores','Calhas']},
          {id:'iluminacao',  name:'Iluminação',               subs:[]},
          {id:'colas',       name:'Colas · Tintas · Vernizes',subs:[]},
          {id:'eletro',      name:'Eletrodomésticos',         subs:[]},
          {id:'tampos',      name:'Tampos',                   subs:[]},
          {id:'sanitarios',  name:'Sanitários',               subs:[]},
          {id:'caixilharia', name:'Caixilharia',              subs:[]},
          {id:'decoracao',   name:'Decoração',                subs:[]},
          {id:'aquecimento', name:'Aquecimento',              subs:[]},
          {id:'materialpro', name:'Material PRO',             subs:[]},
          {id:'limpeza',     name:'Limpeza',                  subs:[]},
          {id:'acessorios',  name:'Acessórios',               subs:[]},
        ]
        defs.forEach(c => setDoc(doc(db,'categorias',c.id), {name:c.name,subs:c.subs}))
      } else {
        setCats(snap.docs.map(d => ({id:d.id,...d.data()})))
      }
    })
    const u2 = onSnapshot(collection(db,'artigos'), snap => {
      setArts(snap.docs.map(d => ({id:d.id,...d.data()})))
    })
    return () => { u1(); u2() }
  }, [])

  const activeCatObj = cats.find(c => c.name === activeCat)
  const subs = activeCatObj?.subs?.length > 0 ? activeCatObj.subs : []
  const countFor = (name) => name === 'Todos' ? arts.length : arts.filter(a => a.cat === name).length

  const selectCat = (name) => {
    setActiveCat(name)
    setActiveSub('')
    setCatOpen(false)
  }

  const filtered = arts.filter(a => {
    const mc = activeCat === 'Todos' ? true
      : activeSub ? (a.cat === activeCat && a.sub === activeSub)
      : a.cat === activeCat
    const q = search.toLowerCase()
    const mq = !q || [a.ref,a.desc,a.cat,a.sub,a.supplier,a.notes].some(v => v && v.toLowerCase().includes(q))
    return mc && mq
  })

  const catOptions = cats.flatMap(c => [
    <option key={c.id} value={c.name+'|'}>{c.name}</option>,
    ...(c.subs||[]).map(s => <option key={c.id+s} value={c.name+'|'+s}>&nbsp;&nbsp;↳ {s}</option>)
  ])

  const openAdd = () => {
    setEditId(null)
    setForm({ref:'',desc:'',cat:activeCat!=='Todos'?activeCat:'',sub:activeSub,price:'',supplier:'',link:'',notes:''})
    setArtModal(true)
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ref:a.ref,desc:a.desc,cat:a.cat,sub:a.sub||'',price:a.price||'',supplier:a.supplier||'',link:a.link||'',notes:a.notes||''})
    setArtModal(true)
  }

  const saveArt = async () => {
    if (!form.ref.trim()||!form.desc.trim()) { showToast('Referência e descrição obrigatórias'); return }
    const parts = (form.cat+(form.sub?'|'+form.sub:'|')).split('|')
    const data = {ref:form.ref.trim(),desc:form.desc.trim(),cat:parts[0],sub:parts[1]||'',price:parseFloat(form.price)||0,supplier:form.supplier.trim(),link:form.link.trim(),notes:form.notes.trim()}
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

  const saveCat = async (cat) => {
    await setDoc(doc(db,'categorias',cat.id), {name:cat.name,subs:cat.subs})
  }

  const L = { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)', display:'block', marginBottom:8 }
  const I = { width:'100%', background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-sm)', boxShadow:'var(--neo-shadow-in-sm)', padding:'10px 14px', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--neo-text)', outline:'none', transition:'box-shadow .2s' }

  return (
    <>
    <div className="bib-screen">

      {/* TOPBAR */}
      <div className="bib-topbar">

        {/* Botão categoria */}
        <button className={`bib-cat-btn ${catOpen?'open':''}`} onClick={() => setCatOpen(o=>!o)}>
          <span className="bib-cat-btn-label">
            {activeCat}{activeSub ? ' · '+activeSub : ''}
          </span>
          <span className="bib-cat-btn-arrow">▼</span>
        </button>

        {/* Pesquisa */}
        <div style={{flex:1,position:'relative'}}>
          <input className="bib-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar artigo, referência…"/>
          {search
            ? <button onClick={()=>setSearch('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:13,lineHeight:1}}>✕</button>
            : <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--neo-text3)',fontSize:14,pointerEvents:'none'}}>⌕</span>
          }
        </div>

        {/* + Artigo */}
        <button className="bib-add-btn" onClick={openAdd}>+ Artigo</button>
      </div>

      {/* PAINEL CATEGORIAS — integrado no layout, empurra o conteúdo */}
      <div className={`bib-cat-panel ${catOpen?'open':''}`}>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:10}}>
          {filtered.length} artigo{filtered.length!==1?'s':''}
        </div>
        <div className="bib-cat-grid">
          {['Todos',...cats.map(c=>c.name)].map(name => (
            <button key={name} className={`bib-cat-card ${activeCat===name?'active':''}`} onClick={()=>selectCat(name)}>
              <span className="bib-cat-card-name">{name}</span>
              <span className="bib-cat-card-count">{countFor(name)}</span>
            </button>
          ))}
        </div>
        <div className="bib-cat-footer">
          <button className="bib-cat-footer-btn" onClick={()=>{setCatModal(true);setCatOpen(false)}}>⊕ Gerir categorias</button>
          <button className="bib-cat-footer-btn" onClick={()=>{setImportModal(true);setCatOpen(false)}}>⬆ Importar</button>
        </div>
      </div>

      {/* SUBCATEGORIAS */}
      {subs.length>0 && !catOpen && (
        <div className="bib-subs">
          <button className={`bib-sub-chip ${activeSub===''?'active':''}`} onClick={()=>setActiveSub('')}>Todas</button>
          {subs.map(s => (
            <button key={s} className={`bib-sub-chip ${activeSub===s?'active':''}`} onClick={()=>setActiveSub(s)}>{s}</button>
          ))}
        </div>
      )}

      {/* LISTA */}
      <div className="neo-scroll" style={{flex:1,overflowY:'auto'}}>
        {filtered.length===0 && <div className="bib-empty">Nenhum artigo</div>}
        {filtered.map(a => (
          <ArtCard key={a.id} art={a} onEdit={openEdit} onDel={delArt} showToast={showToast}/>
        ))}
      </div>
    </div>

    {/* MODAL ARTIGO */}
    <div className={`neo-overlay ${artModal?'open':''}`}>
      <div className="neo-modal">
        <div className="neo-modal-head">{editId?'Editar artigo':'Novo artigo'}<button className="neo-modal-close" onClick={()=>setArtModal(false)}>✕</button></div>
        <div className="frow"><label style={L}>Referência</label><input value={form.ref} onChange={e=>setForm(f=>({...f,ref:e.target.value}))} placeholder="ex: 96652314" style={{...I,fontFamily:"'Barlow Condensed'",letterSpacing:'0.1em',fontSize:16}}/></div>
        <div className="frow"><label style={L}>Descrição</label><input value={form.desc} onChange={e=>setForm(f=>({...f,desc:e.target.value}))} placeholder="ex: Puxador barra inox 160mm" style={I}/></div>
        <div className="frow">
          <label style={L}>Categoria</label>
          <select value={(form.cat||'')+'|'+(form.sub||'')} onChange={e=>{const[c,s]=e.target.value.split('|');setForm(f=>({...f,cat:c,sub:s||''}))}} style={I}>
            <option value="|">— selecionar —</option>{catOptions}
          </select>
        </div>
        <div className="frow half">
          <div><label style={L}>Preço (€)</label><input type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0.00" step="0.01" min="0" style={I}/></div>
          <div><label style={L}>Fornecedor</label><input value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))} placeholder="ex: Hafele" style={I}/></div>
        </div>
        <div className="frow"><label style={L}>Link</label><input type="url" value={form.link} onChange={e=>setForm(f=>({...f,link:e.target.value}))} placeholder="https://…" style={I}/></div>
        <div className="frow"><label style={L}>Notas</label><textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Observações…" style={{...I,resize:'vertical',minHeight:52}}/></div>
        <div className="modal-actions">
          <button className="neo-btn neo-btn-ghost" onClick={()=>setArtModal(false)}>Cancelar</button>
          <button className="neo-btn neo-btn-gold" onClick={saveArt}>Guardar</button>
        </div>
      </div>
    </div>

    {/* MODAL CATEGORIAS */}
    <CatModal open={catModal} cats={cats} arts={arts} onClose={()=>setCatModal(false)} onSave={saveCat} showToast={showToast}/>

    {/* MODAL IMPORTAR */}
    <div className={`neo-overlay ${importModal?'open':''}`}>
      <div className="neo-modal">
        <div className="neo-modal-head">Importar artigos<button className="neo-modal-close" onClick={()=>setImportModal(false)}>✕</button></div>
        <div style={{color:'var(--neo-text2)',fontSize:13,fontWeight:300,lineHeight:1.9,marginBottom:20}}>Importa a partir de CSV ou Excel. Colunas esperadas:</div>
        <div style={{background:'var(--neo-bg)',padding:'14px 16px',fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.1em',color:'var(--neo-gold)',lineHeight:2.4,borderLeft:'2px solid var(--neo-gold2)'}}>
          REFERÊNCIA · DESCRIÇÃO · CATEGORIA · SUBCATEGORIA<br/>PREÇO · FORNECEDOR · LINK · NOTAS
        </div>
        <div style={{marginTop:20,padding:28,background:'var(--neo-bg)',borderRadius:'var(--neo-radius)',boxShadow:'var(--neo-shadow-in)',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Próximo módulo</div>
        <div className="modal-actions"><button className="neo-btn neo-btn-ghost" onClick={()=>setImportModal(false)}>Fechar</button></div>
      </div>
    </div>
    </>
  )
}

// ── ArtCard ──────────────────────────────────────────────────────────────────
function ArtCard({ art, onEdit, onDel, showToast }) {
  const [copied, setCopied] = useState(false)
  const label = art.sub ? art.cat+' · '+art.sub : art.cat

  const copy = () => {
    navigator.clipboard.writeText(art.ref).catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false),1600)
    showToast('Referência copiada — '+art.ref)
  }

  return (
    <div className="bib-art-card">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:10,minWidth:0}}>
          <span className="bib-art-ref">{art.ref}</span>
          <button className={`bib-copy-btn ${copied?'copied':''}`} onClick={copy}>{copied?'✓':'⎘'}</button>
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}}>
          {art.link && <a href={art.link} target="_blank" rel="noreferrer" style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-text3)',textDecoration:'none',padding:'6px 2px'}}>↗</a>}
          <button className="bib-act-btn" onClick={()=>onEdit(art)}>✎</button>
          <button className="bib-act-btn del" onClick={()=>onDel(art.id,art.desc)}>✕</button>
        </div>
      </div>
      <div className="bib-art-name">{art.desc}</div>
      <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
        <span className="bib-badge">{label}</span>
        {art.price>0 && <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)',letterSpacing:'0.04em'}}>{art.price.toFixed(2)} €</span>}
        {art.supplier && <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.08em',color:'var(--neo-text3)',textTransform:'uppercase'}}>{art.supplier}</span>}
        {art.notes && <span className="bib-art-note">{art.notes}</span>}
      </div>
    </div>
  )
}

// ── CatModal ─────────────────────────────────────────────────────────────────
function CatModal({ open, cats, arts, onClose, onSave, showToast }) {
  const [newCat, setNewCat] = useState('')

  const addCat = async () => {
    const v=newCat.trim(); if(!v)return
    if(cats.some(c=>c.name===v)){showToast('Já existe');return}
    const id=v.toLowerCase().replace(/[^a-z0-9]/g,'')+(Date.now()%10000)
    await onSave({id,name:v,subs:[]}); setNewCat(''); showToast('Categoria criada')
  }
  const removeCat = async (cat) => {
    const n=arts.filter(a=>a.cat===cat.name).length
    if(n>0&&!confirm('"'+cat.name+'" tem '+n+' artigo(s). Confirmar?'))return
    await deleteDoc(doc(db,'categorias',cat.id)); showToast('Removida')
  }
  const addSub = async (cat,val) => {
    if(!val||!val.trim())return
    if((cat.subs||[]).includes(val.trim())){showToast('Já existe');return}
    await onSave({...cat,subs:[...(cat.subs||[]),val.trim()]}); showToast('Subcategoria adicionada')
  }
  const removeSub = async (cat,sub) => {
    await onSave({...cat,subs:(cat.subs||[]).filter(s=>s!==sub)})
  }

  const L = {fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-text2)',display:'block',marginBottom:8}
  const I = {flex:1,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-in-sm)',padding:'8px 12px',fontFamily:"'Barlow'",fontSize:13,fontWeight:300,color:'var(--neo-text)',outline:'none'}

  return (
    <div className={`neo-overlay ${open?'open':''}`}>
      <div className="neo-modal" style={{maxWidth:500}}>
        <div className="neo-modal-head">Categorias<button className="neo-modal-close" onClick={onClose}>✕</button></div>
        <div style={{maxHeight:'50vh',overflowY:'auto',marginBottom:16}} className="neo-scroll">
          {cats.map(cat=>(
            <div key={cat.id} style={{marginBottom:14,paddingBottom:12,borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-text)'}}>{cat.name}</span>
                <button className="bib-act-btn del" onClick={()=>removeCat(cat)}>✕</button>
              </div>
              {(cat.subs||[]).map(s=>(
                <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'5px 0 5px 12px',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <span style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)'}}>↳ {s}</span>
                  <button onClick={()=>removeSub(cat,s)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:11}}>✕</button>
                </div>
              ))}
              <SubAdd onAdd={(v)=>addSub(cat,v)} catName={cat.name}/>
            </div>
          ))}
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input value={newCat} onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==='Enter'&&addCat()} placeholder="Nova categoria…" style={I}/>
          <button className="neo-btn neo-btn-gold" onClick={addCat} style={{height:36,flexShrink:0}}>Adicionar</button>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
          <button className="neo-btn neo-btn-gold" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )
}

function SubAdd({ onAdd, catName }) {
  const [v,setV]=useState('')
  const I = {flex:1,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-in-sm)',padding:'6px 10px',fontFamily:"'Barlow'",fontSize:12,fontWeight:300,color:'var(--neo-text)',outline:'none'}
  return(
    <div style={{display:'flex',gap:8,marginTop:8,paddingLeft:12}}>
      <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){onAdd(v);setV('')}}} placeholder={'+ subcategoria…'} style={I}/>
      <button onClick={()=>{onAdd(v);setV('')}} className="neo-btn neo-btn-ghost" style={{height:30,fontSize:9,flexShrink:0}}>Add</button>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'
import '../styles/biblioteca.css'
import ImportModal from '../components/ImportModal'
import { addToOrcamento } from '../hooks/useOrcamento'

const SORT_OPTS = [
  { value:'ref',      label:'Referência' },
  { value:'desc',     label:'Nome A-Z'   },
  { value:'price_asc',label:'Preço ↑'   },
  { value:'price_desc',label:'Preço ↓'  },
  { value:'supplier', label:'Fornecedor' },
]

function sortArts(arts, sort) {
  return [...arts].sort((a,b) => {
    if (sort==='star') {
      if (b.star && !a.star) return 1
      if (a.star && !b.star) return -1
    }
    if (sort==='price_asc')  return (a.price||0)-(b.price||0)
    if (sort==='price_desc') return (b.price||0)-(a.price||0)
    if (sort==='supplier')   return (a.supplier||'').localeCompare(b.supplier||'')
    if (sort==='desc')       return (a.desc||'').localeCompare(b.desc||'')
    return (a.ref||'').localeCompare(b.ref||'')
  })
}

export default function Biblioteca({ showToast }) {
  const [cats, setCats]           = useState([])
  const [arts, setArts]           = useState([])
  const [activeCat, setActiveCat] = useState('Todos')
  const [activeSub, setActiveSub] = useState('')
  const [search, setSearch]       = useState('')
  const [sort, setSort]           = useState('ref')
  const [sortOpen, setSortOpen]   = useState(false)
  const [supplierFilter, setSupplierFilter] = useState('')
  const [supplierOpen, setSupplierOpen] = useState(false)
  const [onlyStars, setOnlyStars] = useState(false)
  const [onlyKC,    setOnlyKC]    = useState(false)
  const [catOpen, setCatOpen]     = useState(false)
  const [artModal, setArtModal]   = useState(false)
  const [catModal, setCatModal]   = useState(false)
  const [importModal, setImportModal] = useState(false)
  const [editId, setEditId]       = useState(null)
  const [form, setForm] = useState({ ref:'', desc:'', cat:'', sub:'', price:'', supplier:'', link:'', notes:'', notaIA:'' })
  // Refs copiadas na sessão actual — persiste até limpar filtro/categoria ou fechar app
  const [copiedRefs, setCopiedRefs] = useState(new Set())

  const markCopied = (ref) => setCopiedRefs(prev => new Set([...prev, ref]))
  const clearCopied = () => setCopiedRefs(new Set())

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
        defs.forEach(c => setDoc(doc(db,'categorias',c.id), {name:c.name,subs:c.subs}).catch(()=>{}))
      } else {
        setCats(snap.docs.map(d => ({id:d.id,...d.data()})))
      }
    }, () => showToast('Erro ao carregar categorias'))
    const u2 = onSnapshot(collection(db,'artigos'), snap => {
      setArts(snap.docs.map(d => ({id:d.id,...d.data()})))
    }, () => showToast('Erro ao carregar artigos'))
    return () => { u1(); u2() }
  }, [])

  const activeCatObj = cats.find(c => c.name === activeCat)
  const subs = activeCatObj?.subs?.length > 0 ? activeCatObj.subs : []
  const countFor = (name) => name === 'Todos' ? arts.length : arts.filter(a => a.cat === name).length
  const catsSorted = [...cats].sort((a,b)=>(a.order??999)-(b.order??999))

  const selectCat = (name) => { setActiveCat(name); setActiveSub(''); setSupplierFilter(''); setCatOpen(false) }

  // Fornecedores disponíveis na categoria/sub actual
  const suppliersAvailable = [...new Set(
    arts.filter(a => {
      if(activeCat==='Todos') return true
      return activeSub ? (a.cat===activeCat&&a.sub===activeSub) : a.cat===activeCat
    }).map(a=>a.supplier).filter(Boolean)
  )].sort()

  const baseFiltered = arts.filter(a => {
    const mc = activeCat === 'Todos' ? true
      : activeSub ? (a.cat === activeCat && a.sub === activeSub)
      : a.cat === activeCat
    const q = search.toLowerCase()
    const mq = !q || [a.ref,a.desc,a.cat,a.sub,a.supplier,a.notes].some(v => v && v.toLowerCase().includes(q))
    const ms = !supplierFilter || a.supplier === supplierFilter
    const mstar = !onlyStars || a.star
    const mkc   = !onlyKC   || a.kc
    return mc && mq && ms && mstar && mkc
  })
  const filtered = sortArts(baseFiltered, sort)

  const catOptions = catsSorted.flatMap(c => [
    <option key={c.id} value={c.name+'|'}>{c.name}</option>,
    ...(c.subs||[]).map(s => <option key={c.id+s} value={c.name+'|'+s}>&nbsp;&nbsp;↳ {s}</option>)
  ])

  const openAdd = () => {
    setEditId(null)
    setForm({ref:'',desc:'',cat:activeCat!=='Todos'?activeCat:'',sub:activeSub,price:'',supplier:'',link:'',notes:'',notaIA:'',kc:false})
    setArtModal(true)
  }

  const openEdit = (a) => {
    setEditId(a.id)
    setForm({ref:a.ref,desc:a.desc,cat:a.cat,sub:a.sub||'',price:a.price||'',supplier:a.supplier||'',link:a.link||'',notes:a.notes||'',notaIA:a.notaIA||'',kc:a.kc||false})
    setArtModal(true)
  }

  const saveArt = async () => {
    if (!form.ref.trim()||!form.desc.trim()) { showToast('Referência e descrição obrigatórias'); return }
    const parts = (form.cat+(form.sub?'|'+form.sub:'|')).split('|')
    const data = {ref:form.ref.trim(),desc:form.desc.trim(),cat:parts[0],sub:parts[1]||'',price:parseFloat(form.price)||0,supplier:form.supplier.trim(),link:form.link.trim(),notes:form.notes.trim(),notaIA:form.notaIA?.trim()||'',star:false,kc:form.kc||false}
    try {
      if (editId) {
        const prev = arts.find(a=>a.id===editId)
        await updateDoc(doc(db,'artigos',editId),{...data,star:prev?.star||false,kc:form.kc||false})
        showToast('Artigo atualizado')
      } else {
        await addDoc(collection(db,'artigos'),data)
        showToast('Artigo adicionado')
      }
      setArtModal(false)
    } catch(e) { showToast('Erro ao guardar') }
  }

  const delArt = async (id, desc) => {
    if (!confirm('Eliminar "'+desc+'"?')) return
    try {
      await deleteDoc(doc(db,'artigos',id))
      showToast('Eliminado')
    } catch { showToast('Erro ao eliminar — verifica a ligação') }
  }

  const toggleStar = async (a) => {
    try {
      await updateDoc(doc(db,'artigos',a.id), {star:!a.star})
    } catch { showToast('Erro ao actualizar favorito') }
  }

  const toggleKC = async (a) => {
    try {
      await updateDoc(doc(db,'artigos',a.id), {kc:!a.kc})
    } catch { showToast('Erro ao actualizar KC') }
  }

  const saveCat = async (cat) => {
    try {
      await setDoc(doc(db,'categorias',cat.id), {name:cat.name, subs:cat.subs||[], order:cat.order??999})
    } catch { showToast('Erro ao guardar categoria') }
  }

  const L = { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)', display:'block', marginBottom:8 }
  const I = { width:'100%', background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-sm)', boxShadow:'var(--neo-shadow-in-sm)', padding:'10px 14px', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--neo-text)', outline:'none', transition:'box-shadow .2s' }
  const sortLabel = SORT_OPTS.find(o=>o.value===sort)?.label || 'Ordenar'

  return (
    <>
    <div className="bib-screen">

      {/* TOPBAR */}
      <div className="bib-topbar">
        <button className={`bib-cat-btn ${catOpen?'open':''}`} onClick={() => { setCatOpen(o=>!o); setSortOpen(false); setSupplierOpen(false) }}>
          <span className="bib-cat-btn-label">{activeCat}{activeSub ? ' · '+activeSub : ''}</span>
          <span className="bib-cat-btn-arrow">▼</span>
        </button>

        <div style={{flex:1,position:'relative'}}>
          <input className="bib-search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar artigo, referência…"/>
          {search
            ? <button onClick={()=>setSearch('')} style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13,lineHeight:1}}>✕</button>
            : <span style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',color:'var(--neo-text2)',fontSize:14,pointerEvents:'none'}}>⌕</span>
          }
        </div>

        {/* Estrelas — filtro toggle */}
        <button onClick={()=>setOnlyStars(o=>!o)} title="Só estrelas" style={{
          flexShrink:0,background:onlyStars?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg2)',
          border:'none',borderRadius:'var(--neo-radius-pill)',width:34,height:34,
          cursor:'pointer',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',
          boxShadow:onlyStars?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
          color:onlyStars?'#1a1610':'var(--neo-text2)',transition:'all .2s',
        }}>★</button>

        {/* KC — filtro toggle */}
        <button onClick={()=>setOnlyKC(o=>!o)} title="Só artigos KC" style={{
          flexShrink:0,
          background:onlyKC?'linear-gradient(145deg,#6ec6e8,#3a7a9e)':'var(--neo-bg2)',
          border:'none',borderRadius:'var(--neo-radius-pill)',padding:'0 10px',height:34,
          cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:700,
          letterSpacing:'0.14em',
          boxShadow:onlyKC?'var(--neo-shadow-in-sm),0 0 8px rgba(110,198,232,0.4)':'var(--neo-shadow-out-sm)',
          color:onlyKC?'#0f1e26':'var(--neo-text2)',transition:'all .2s',whiteSpace:'nowrap',
        }}>KC</button>

        {/* Marca */}
        <div style={{position:'relative',flexShrink:0}}>
          <button onClick={()=>{setSupplierOpen(o=>!o);setSortOpen(false);setCatOpen(false)}} style={{
            background:supplierFilter?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg2)',
            border:'none',borderRadius:'var(--neo-radius-pill)',padding:'0 12px',height:34,
            cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,
            letterSpacing:'0.1em',textTransform:'uppercase',
            color:supplierFilter?'#1a1610':'var(--neo-text2)',
            boxShadow:supplierFilter?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
            display:'flex',alignItems:'center',gap:5,whiteSpace:'nowrap',transition:'all .2s',
          }}>
            {supplierFilter ? <>{supplierFilter} <span onClick={e=>{e.stopPropagation();setSupplierFilter('');setSupplierOpen(false)}} style={{opacity:.7}}>✕</span></> : 'Marca'}
          </button>
          {supplierOpen&&suppliersAvailable.length>0&&(
            <div className="neo-dropdown" style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:'var(--neo-bg2)',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-out)',zIndex:50,minWidth:150,overflow:'hidden'}}>
              <button onClick={()=>{setSupplierFilter('');setSupplierOpen(false)}} style={{display:'block',width:'100%',padding:'9px 14px',background:!supplierFilter?'var(--neo-bg)':'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:!supplierFilter?'var(--neo-gold)':'var(--neo-text2)',textAlign:'left'}}>Todas</button>
              {suppliersAvailable.map(s=>(
                <button key={s} onClick={()=>{setSupplierFilter(s);setSupplierOpen(false)}} style={{display:'block',width:'100%',padding:'9px 14px',background:supplierFilter===s?'var(--neo-bg)':'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:supplierFilter===s?'var(--neo-gold)':'var(--neo-text2)',textAlign:'left',transition:'background .12s'}}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Ordenar */}
        <div style={{position:'relative',flexShrink:0}}>
          <button onClick={()=>{setSortOpen(o=>!o);setSupplierOpen(false);setCatOpen(false)}} style={{background:'var(--neo-bg2)',border:'none',borderRadius:'var(--neo-radius-pill)',width:34,height:34,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)',color:'var(--neo-text2)'}}>⇅</button>
          {sortOpen&&(
            <div className="neo-dropdown" style={{position:'absolute',top:'calc(100% + 6px)',right:0,background:'var(--neo-bg2)',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-out)',zIndex:50,minWidth:140,overflow:'hidden'}}>
              {SORT_OPTS.filter(o=>o.value!=='star').map(o=>(
                <button key={o.value} onClick={()=>{setSort(o.value);setSortOpen(false)}} style={{display:'block',width:'100%',padding:'10px 14px',background:sort===o.value?'var(--neo-bg)':'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',color:sort===o.value?'var(--neo-gold)':'var(--neo-text2)',textAlign:'left',transition:'background .12s'}}>{o.label}</button>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setImportModal(true)} style={{flexShrink:0,background:'transparent',border:'1px solid var(--neo-gold2)',borderRadius:'var(--neo-radius-pill)',padding:'0 12px',height:34,cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--neo-gold)',whiteSpace:'nowrap'}}>
          ↑ Import
        </button>
        {copiedRefs.size > 0 && (
          <button onClick={clearCopied} title="Limpar marcações de copiado" style={{flexShrink:0,background:'rgba(200,169,110,0.12)',border:'1px solid rgba(200,169,110,0.3)',borderRadius:'var(--neo-radius-pill)',padding:'0 10px',height:34,cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-gold)',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:5}}>
            ✓ {copiedRefs.size} <span style={{opacity:.6,fontWeight:400}}>limpar</span>
          </button>
        )}
        <button className="bib-add-btn" onClick={openAdd}>+ Artigo</button>
      </div>

      {/* PAINEL CATEGORIAS */}
      <div className={`bib-cat-panel ${catOpen?'open':''}`}>
        <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:10}}>
          {filtered.length} artigo{filtered.length!==1?'s':''}
        </div>
        <div className="bib-cat-grid">
          {['Todos',...catsSorted.map(c=>c.name)].map(name => (
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
          <ArtCard key={a.id} art={a}
            onEdit={openEdit}
            onDel={delArt}
            onStar={toggleStar}
            onToggleKC={toggleKC}
            showToast={showToast}
            wasCopied={copiedRefs.has(a.ref)}
            onCopied={markCopied}
            onAddOrc={() => addToOrcamento({ ref:a.ref, desc:a.desc, cat:a.cat, price:a.price||0, origem:'Biblioteca' }, showToast)}/>
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
        <div className="frow">
          <label style={{...L, color:'#7ec8a0'}}>⚑ Instrução para IA</label>
          <textarea
            value={form.notaIA||''}
            onChange={e=>setForm(f=>({...f,notaIA:e.target.value}))}
            placeholder={'ex: considerar sempre como base, excepto se indicado outro artigo\nex: usar apenas em cozinhas com tampo de pedra\nex: incluir sempre que houver lava-loiça'}
            style={{...I, resize:'vertical', minHeight:64, borderLeft:'2px solid #7ec8a044', color:'#7ec8a0'}}
          />
        </div>
        <div className="frow" style={{flexDirection:'row',alignItems:'center',gap:12,cursor:'pointer'}} onClick={()=>setForm(f=>({...f,kc:!f.kc}))}>
          <div style={{
            width:36,height:20,borderRadius:10,transition:'background .2s',flexShrink:0,position:'relative',
            background:form.kc?'linear-gradient(145deg,#6ec6e8,#3a7a9e)':'var(--neo-bg)',
            boxShadow:form.kc?'0 0 6px rgba(110,198,232,0.4)':'var(--neo-shadow-in-sm)',
          }}>
            <div style={{
              position:'absolute',top:3,left:form.kc?18:3,width:14,height:14,borderRadius:'50%',
              background:form.kc?'#0f1e26':'var(--neo-text2)',transition:'left .2s',
            }}/>
          </div>
          <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:form.kc?'#6ec6e8':'var(--neo-text2)'}}>
            Artigo KC — Cozinhas Centralizadas
          </span>
        </div>
        <div className="modal-actions">
          <button className="neo-btn neo-btn-ghost" onClick={()=>setArtModal(false)}>Cancelar</button>
          <button className="neo-btn neo-btn-gold" onClick={saveArt}>Guardar</button>
        </div>
      </div>
    </div>

    <CatModal open={catModal} cats={cats} arts={arts} onClose={()=>setCatModal(false)} onSave={saveCat} showToast={showToast}/>
    <ImportModal open={importModal} onClose={() => setImportModal(false)} mode="biblioteca" showToast={showToast} />
    </>
  )
}

// ── ArtCard — card expansível com estrela, link alinhado, contraste melhorado ──
function ArtCard({ art, onEdit, onDel, onStar, onToggleKC, showToast, onAddOrc, wasCopied, onCopied }) {
  const [open,   setOpen]   = useState(false)
  const [copied, setCopied] = useState(false)
  const [added,  setAdded]  = useState(false)
  const label = art.sub ? art.cat+' · '+art.sub : art.cat

  const copy = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(art.ref).catch(()=>{})
    setCopied(true); setTimeout(()=>setCopied(false),1600)
    onCopied?.(art.ref)
    showToast('Referência copiada — '+art.ref)
  }

  const handleAddOrc = (e) => {
    e.stopPropagation()
    onAddOrc()
    setAdded(true); setTimeout(()=>setAdded(false),1600)
  }

  const handleStar = (e) => {
    e.stopPropagation()
    onStar(art)
  }

  const handleKC = (e) => {
    e.stopPropagation()
    onToggleKC(art)
  }

  return (
    <div className={`bib-art-card ${open?'expanded':''} ${art.star?'starred':''}`}
      onClick={()=>setOpen(o=>!o)}
      style={{
        ...(art.kc ? {borderLeft:'3px solid #4a9ec0', boxShadow:'var(--neo-shadow-out), -2px 0 10px rgba(74,158,192,0.18)'} : {}),
        ...(wasCopied && !art.kc ? {borderLeft:'3px solid rgba(200,169,110,0.5)', background:'rgba(200,169,110,0.04)'} : {}),
        ...(wasCopied && art.kc  ? {background:'rgba(200,169,110,0.04)'} : {}),
      }}
    >

      {/* ── LINHA PRINCIPAL (sempre visível) ── */}
      <div style={{display:'flex',alignItems:'center',gap:8}}>

        {/* Estrela */}
        <button onClick={handleStar} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:14,lineHeight:1,padding:'2px',flexShrink:0,color:art.star?'#f0c040':'var(--neo-text3)',transition:'color .15s'}}>
          {art.star?'★':'☆'}
        </button>

        {/* Badge KC */}
        {art.kc&&(
          <button onClick={handleKC} title="Remover KC" style={{
            background:'linear-gradient(135deg,#3a7a9e,#2a5a76)',
            border:'none',borderRadius:4,padding:'2px 6px',cursor:'pointer',flexShrink:0,
            fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.14em',
            color:'#c8eaf8',boxShadow:'0 0 6px rgba(74,158,192,0.35)',lineHeight:1.4,
          }}>KC</button>
        )}

        {/* Ref + copy — badge ✓ quando wasCopied */}
        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0,flex:'0 0 auto'}}>
          <span className="bib-art-ref" style={{color: wasCopied ? 'var(--neo-gold)' : 'var(--neo-gold)',fontSize:16, opacity: wasCopied ? 1 : 0.85}}>{art.ref}</span>
          <button onClick={copy} className={`bib-copy-btn ${copied?'copied':''}`}
            style={{color: copied ? 'var(--neo-gold)' : wasCopied ? 'rgba(200,169,110,0.7)' : '#7a7a72',
                    background: wasCopied && !copied ? 'rgba(200,169,110,0.08)' : undefined}}>
            {copied ? '✓' : wasCopied ? '✓' : '⎘'}
          </button>
        </div>

        {/* Descrição (truncada quando fechado) */}
        <div style={{flex:1,minWidth:0,overflow:'hidden'}}>
          <div style={{fontSize:13,color: wasCopied ? '#c4c0b8' : 'var(--neo-text)',fontWeight:300,whiteSpace:open?'normal':'nowrap',overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.4}}>
            {art.desc}
          </div>
          {/* Badges linha compacta (fechado) */}
          {!open&&<div style={{display:'flex',alignItems:'center',gap:6,marginTop:2,flexWrap:'nowrap',overflow:'hidden'}}>
            {label&&<span className="bib-badge" style={{color:'#8a8a82',borderColor:'rgba(255,255,255,0.14)'}}>{label}</span>}
            {art.price>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,color:'var(--neo-gold)',letterSpacing:'0.04em',whiteSpace:'nowrap'}}>{art.price.toFixed(2)} €</span>}
            {art.supplier&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.08em',color:'#8a8a82',textTransform:'uppercase',whiteSpace:'nowrap'}}>{art.supplier}</span>}
          </div>}
        </div>

        {/* Ícones direita */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
          <button onClick={handleAddOrc} style={{padding:'4px 10px',borderRadius:'var(--neo-radius-pill)',border:'none',background:added?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg2)',boxShadow:added?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:added?'#1a1610':'var(--neo-text2)',transition:'all .2s',whiteSpace:'nowrap'}}>
            {added?'✓ Orç':'+ Orç'}
          </button>
          {art.link&&(
            <a href={art.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
              style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:28,height:28,borderRadius:'var(--neo-radius-pill)',background:'var(--neo-bg2)',boxShadow:'var(--neo-shadow-out-sm)',color:'var(--neo-text2)',fontSize:12,textDecoration:'none',transition:'all .15s',flexShrink:0}}
              title={art.link}>↗</a>
          )}
          <button className="bib-act-btn" onClick={e=>{e.stopPropagation();onEdit(art)}} style={{color:'var(--neo-text2)'}}>✎</button>
          <button className="bib-act-btn del" onClick={e=>{e.stopPropagation();onDel(art.id,art.desc)}}>✕</button>
        </div>
      </div>

      {/* ── DETALHE EXPANDIDO ── */}
      {open&&(
        <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:art.notes?8:0}}>
            <span className="bib-badge" style={{color:'var(--neo-text2)',borderColor:'rgba(255,255,255,0.12)'}}>{label}</span>
            {art.price>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)',letterSpacing:'0.04em'}}>{art.price.toFixed(2)} €</span>}
            {art.supplier&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.1em',color:'var(--neo-text2)',textTransform:'uppercase',padding:'3px 8px',background:'var(--neo-bg)',borderRadius:'var(--neo-radius-pill)',boxShadow:'var(--neo-shadow-in-sm)'}}>{art.supplier}</span>}
          </div>
          {art.notes&&<div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',lineHeight:1.6,marginTop:6}}>{art.notes}</div>}
          {art.link&&<div style={{marginTop:6}}><a href={art.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.1em',color:'var(--neo-gold2)',textDecoration:'none'}}>{art.link}</a></div>}
        </div>
      )}
    </div>
  )
}

// ── CatModal ──────────────────────────────────────────────────────────────────
function CatModal({ open, cats, arts, onClose, onSave, showToast }) {
  const [newCat, setNewCat] = useState('')
  const [saving, setSaving] = useState(false)
  const catsRef = useRef(cats)
  useEffect(() => { catsRef.current = cats }, [cats])

  const I = {flex:1,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-in-sm)',padding:'8px 12px',fontFamily:"'Barlow'",fontSize:13,fontWeight:300,color:'var(--neo-text)',outline:'none'}

  const getSorted = () => [...catsRef.current].sort((a,b)=>(a.order??999)-(b.order??999))

  const saveOrder = async (newOrder) => {
    setSaving(true)
    try {
      for (let i=0; i<newOrder.length; i++) {
        await onSave({...newOrder[i], order:i})
      }
    } finally { setSaving(false) }
  }

  const move = (idx, dir) => {
    const arr = getSorted()
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= arr.length) return
    const tmp = arr[idx]; arr[idx] = arr[newIdx]; arr[newIdx] = tmp
    saveOrder(arr)
  }

  const addCat = async () => {
    const v=newCat.trim(); if(!v)return
    if(catsRef.current.some(c=>c.name===v)){showToast('Já existe');return}
    const id=v.toLowerCase().replace(/[^a-z0-9]/g,'')+(Date.now()%10000)
    const order=catsRef.current.length
    await onSave({id,name:v,subs:[],order})
    setNewCat(''); showToast('Categoria criada')
  }
  const removeCat = async (cat) => {
    const n=arts.filter(a=>a.cat===cat.name).length
    if(n>0&&!confirm('"'+cat.name+'" tem '+n+' artigo(s). Confirmar?'))return
    await deleteDoc(doc(db,'categorias',cat.id)); showToast('Removida')
  }
  const addSub = async (cat,val) => {
    if(!val?.trim())return
    if((cat.subs||[]).includes(val.trim())){showToast('Já existe');return}
    await onSave({...cat,subs:[...(cat.subs||[]),val.trim()]}); showToast('Subcategoria adicionada')
  }
  const removeSub = async (cat,sub) => { await onSave({...cat,subs:(cat.subs||[]).filter(s=>s!==sub)}) }

  const sorted = getSorted()

  return (
    <div className={`neo-overlay ${open?'open':''}`}>
      <div className="neo-modal" style={{maxWidth:500}}>
        <div className="neo-modal-head">
          Categorias {saving&&<span style={{fontSize:10,color:'var(--neo-gold)',fontWeight:400,letterSpacing:'0.1em'}}>↻</span>}
          <button className="neo-modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{maxHeight:'52vh',overflowY:'auto',marginBottom:16}} className="neo-scroll">
          {sorted.map((cat,idx)=>(
            <div key={cat.id} style={{display:'flex',gap:4,marginBottom:8,alignItems:'stretch'}}>

              {/* Coluna de setas — separada do card */}
              <div style={{display:'flex',flexDirection:'column',gap:4,flexShrink:0,justifyContent:'center'}}>
                <button
                  onClick={()=>{ if(!saving&&idx>0) move(idx,-1) }}
                  style={{
                    width:28,height:28,border:'1px solid rgba(255,255,255,0.08)',borderRadius:4,
                    background:idx===0||saving?'transparent':'var(--neo-bg2)',
                    cursor:idx===0||saving?'default':'pointer',
                    color:idx===0||saving?'rgba(255,255,255,0.12)':'var(--neo-text)',
                    fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,
                  }}>▲</button>
                <button
                  onClick={()=>{ if(!saving&&idx<sorted.length-1) move(idx,1) }}
                  style={{
                    width:28,height:28,border:'1px solid rgba(255,255,255,0.08)',borderRadius:4,
                    background:idx===sorted.length-1||saving?'transparent':'var(--neo-bg2)',
                    cursor:idx===sorted.length-1||saving?'default':'pointer',
                    color:idx===sorted.length-1||saving?'rgba(255,255,255,0.12)':'var(--neo-text)',
                    fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,
                  }}>▼</button>
              </div>

              {/* Card da categoria */}
              <div style={{flex:1,padding:'10px 12px',borderRadius:6,background:'var(--neo-bg2)',border:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:(cat.subs||[]).length>0?6:0}}>
                  <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-text)'}}>{cat.name}</span>
                  <button className="bib-act-btn del" onClick={()=>removeCat(cat)}>✕</button>
                </div>
                {(cat.subs||[]).length>0&&<div style={{paddingLeft:4,marginBottom:4}}>
                  {(cat.subs||[]).map(s=>(
                    <div key={s} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'3px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                      <span style={{fontSize:11,fontWeight:300,color:'var(--neo-text2)'}}>↳ {s}</span>
                      <button onClick={()=>removeSub(cat,s)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:10,padding:'2px'}}>✕</button>
                    </div>
                  ))}
                </div>}
                <SubAdd onAdd={(v)=>addSub(cat,v)}/>
              </div>
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

function SubAdd({ onAdd }) {
  const [v,setV]=useState('')
  const I={flex:1,background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-in-sm)',padding:'5px 10px',fontFamily:"'Barlow'",fontSize:12,fontWeight:300,color:'var(--neo-text)',outline:'none'}
  return(
    <div style={{display:'flex',gap:6,marginTop:6,paddingLeft:8}}>
      <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){onAdd(v);setV('')}}} placeholder='+ subcategoria…' style={I}/>
      <button onClick={()=>{onAdd(v);setV('')}} className="neo-btn neo-btn-ghost" style={{height:28,fontSize:9,flexShrink:0,padding:'0 10px'}}>Add</button>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { addToOrcamento } from '../hooks/useOrcamento'

const CONTEXTOS = ['Cozinha','Casa de Banho','Quarto','Escritório','Parceiro','Outro']

export default function Modelos({ showToast }) {
  const [modelos, setModelos] = useState([])
  const [artigos, setArtigos] = useState([])
  const [detailId, setDetailId] = useState(null)  // só guardamos o ID
  const [modal,    setModal]    = useState(false)
  const [editId,   setEditId]   = useState(null)
  const [form,     setForm]     = useState({ name:'', contexto:'', notas:'' })
  const [artSearch, setArtSearch] = useState('')
  const [artModal,  setArtModal]  = useState(false)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), snap =>
      setModelos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), snap =>
      setArtigos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  // Modelo activo — sempre actualizado do Firestore via onSnapshot
  const modelo = modelos.find(m => m.id === detailId) || null

  // ── CRUD modelo ──────────────────────────────────────────────────────────
  const saveModelo = async () => {
    if (!form.name.trim()) { showToast('Nome obrigatório'); return }
    const data = { name:form.name.trim(), contexto:form.contexto.trim(), notas:form.notas.trim() }
    if (editId) {
      const prev = modelos.find(m=>m.id===editId)
      await setDoc(doc(db,'modelos',editId), {...data, items: prev?.items||[]})
      showToast('Modelo atualizado')
    } else {
      const ref = await addDoc(collection(db,'modelos'), {...data, items:[]})
      setDetailId(ref.id)  // abre directamente o modelo novo
      showToast('Modelo criado — adiciona artigos agora')
    }
    setModal(false)
  }

  const delModelo = async (id, name) => {
    if (!confirm('Eliminar modelo "'+name+'"?')) return
    await deleteDoc(doc(db,'modelos',id))
    if (detailId===id) setDetailId(null)
    showToast('Eliminado')
  }

  const openEdit = (m) => {
    setEditId(m.id)
    setForm({name:m.name, contexto:m.contexto||'', notas:m.notas||''})
    setModal(true)
  }

  // ── Itens — usa sempre o estado fresco do Firestore ──────────────────────
  const addItem = async (art) => {
    if (!modelo) return
    if ((modelo.items||[]).find(i=>i.artId===art.id)) { showToast('Artigo já existe'); return }
    const items = [...(modelo.items||[]), {
      artId:    art.id,
      ref:      art.ref,
      desc:     art.desc,
      cat:      art.cat||'',
      sub:      art.sub||'',
      price:    art.price||0,
      supplier: art.supplier||'',
      link:     art.link||'',
      notes:    art.notes||'',
      qty:      1
    }]
    await setDoc(doc(db,'modelos',modelo.id), {...modelo, items})
    showToast('Artigo adicionado')
  }

  const updateQty = async (artId, qty) => {
    if (!modelo) return
    const items = (modelo.items||[]).map(i => i.artId===artId ? {...i, qty:Math.max(1,qty)} : i)
    await setDoc(doc(db,'modelos',modelo.id), {...modelo, items})
  }

  const removeItem = async (artId) => {
    if (!modelo) return
    const items = (modelo.items||[]).filter(i => i.artId!==artId)
    await setDoc(doc(db,'modelos',modelo.id), {...modelo, items})
    showToast('Removido')
  }

  const toggleStar = async (artId) => {
    if (!modelo) return
    const items = (modelo.items||[]).map(i => i.artId===artId ? {...i,star:!i.star} : i)
    await setDoc(doc(db,'modelos',modelo.id), {...modelo, items})
  }

  // ── Adicionar tudo ao orçamento ─────────────────────────────────────────
  const addAllToOrc = async (m) => {
    const items = m.items||[]
    if (!items.length) { showToast('Modelo sem artigos'); return }
    for (const item of items) {
      await addToOrcamento({
        ref:      item.ref,
        desc:     item.desc,
        cat:      item.cat||'',
        sub:      item.sub||'',
        price:    item.price||0,
        supplier: item.supplier||'',
        link:     item.link||'',
        notes:    item.notes||'',
        origem:   'Modelos'
      }, ()=>{})
    }
    showToast(`${items.length} artigo${items.length!==1?'s':''} adicionado${items.length!==1?'s':''} ao orçamento`)
  }

  const total = (items) => (items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)
  const [artCat,    setArtCat]    = useState('Todos')
  const [artSub,    setArtSub]    = useState('')

  const artFiltered = artigos.filter(a=>{
    const catOk = artCat==='Todos' ? true : artSub ? (a.cat===artCat&&a.sub===artSub) : a.cat===artCat
    const q=artSearch.toLowerCase()
    const searchOk = !q||[a.ref,a.desc,a.cat,a.supplier].some(v=>v&&v.toLowerCase().includes(q))
    return catOk && searchOk
  })

  // Categorias disponíveis nos artigos
  const artCats = ['Todos',...[...new Set(artigos.map(a=>a.cat).filter(Boolean))].sort()]
  const artSubs = artCat==='Todos' ? [] :
    [...new Set(artigos.filter(a=>a.cat===artCat).map(a=>a.sub).filter(Boolean))].sort()

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (detailId) {
    // Enquanto o onSnapshot ainda não trouxe o modelo, mostrar loading
    if (!modelo) return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',background:'var(--neo-bg)'}}>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.2em',color:'var(--neo-text2)',textTransform:'uppercase'}}>A carregar…</span>
      </div>
    )
    const items = modelo.items||[]
    return (
      <>
      <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:'var(--neo-bg)'}}>

        {/* Topbar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',height:52,borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <button onClick={()=>setDetailId(null)} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
            ← Modelos
          </button>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <OrcBtn items={items} onAdd={()=>addAllToOrc(modelo)} showToast={showToast}/>
            <button onClick={()=>openEdit(modelo)} style={{background:'var(--neo-bg2)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',color:'var(--neo-text2)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)'}}>✎</button>
            <button onClick={()=>setArtModal(true)} className="neo-btn neo-btn-gold" style={{height:32,padding:'0 16px',fontSize:9,borderRadius:'var(--neo-radius-pill)'}}>
              + Artigo
            </button>
          </div>
        </div>

        {/* Header do modelo */}
        <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:2}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)'}}>{modelo.name}</span>
            {modelo.contexto&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-gold2)'}}>{modelo.contexto}</span>}
          </div>
          {modelo.notas&&<div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',marginTop:4,lineHeight:1.5}}>{modelo.notas}</div>}
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',marginTop:6,letterSpacing:'0.1em'}}>
            {items.length} artigo{items.length!==1?'s':''}{items.length>0?<> · <span style={{color:'var(--neo-gold)'}}>{total(items).toFixed(2)} €</span></>:''}
          </div>
        </div>

        {/* Lista de artigos */}
        <div className="neo-scroll" style={{flex:1,overflowY:'auto'}}>
          {items.length===0 && (
            <div style={{padding:'50px 20px',textAlign:'center'}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:10}}>Modelo vazio</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)',letterSpacing:'0.08em',lineHeight:2}}>
                Clica em <span style={{color:'var(--neo-gold)'}}>+ Artigo</span> para adicionar<br/>artigos da Biblioteca a este kit.
              </div>
            </div>
          )}
          {items.map(item => (
            <ItemRow key={item.artId} item={item}
              onQty={(qty)=>updateQty(item.artId,qty)}
              onRemove={()=>removeItem(item.artId)}
              onStar={()=>toggleStar(item.artId)}
              showToast={showToast}/>
          ))}
        </div>

        {/* Rodapé */}
        {items.length>0&&(
          <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)'}}>Total estimado</span>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,color:'var(--neo-gold)'}}>{total(items).toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* Modal adicionar artigo — com navegação por categorias */}
      <div className={`neo-overlay ${artModal?'open':''}`}>
        <div className="neo-modal" style={{maxWidth:520}}>
          <div className="neo-modal-head">
            Adicionar artigo
            <button className="neo-modal-close" onClick={()=>{setArtModal(false);setArtSearch('');setArtCat('Todos');setArtSub('')}}>✕</button>
          </div>

          {/* Pesquisa */}
          <input autoFocus value={artSearch} onChange={e=>setArtSearch(e.target.value)}
            placeholder="Pesquisar referência, descrição…" className="neo-input" style={{marginBottom:10}}/>

          {/* Chips de categoria */}
          <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:artSubs.length>0?6:10}}>
            {artCats.map(c=>(
              <button key={c} onClick={()=>{setArtCat(c);setArtSub('')}}
                style={{padding:'4px 10px',borderRadius:'var(--neo-radius-pill)',border:'none',
                  background:artCat===c?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg)',
                  boxShadow:artCat===c?'var(--neo-shadow-in-sm)':'var(--neo-shadow-out-sm)',
                  cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:600,
                  letterSpacing:'0.1em',textTransform:'uppercase',
                  color:artCat===c?'#1a1610':'var(--neo-text2)',transition:'all .15s'}}>
                {c}
              </button>
            ))}
          </div>

          {/* Chips de subcategoria */}
          {artSubs.length>0&&(
            <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10}}>
              <button onClick={()=>setArtSub('')}
                style={{padding:'3px 9px',borderRadius:'var(--neo-radius-pill)',border:'none',
                  background:artSub===''?'var(--neo-bg)':'transparent',
                  boxShadow:artSub===''?'var(--neo-shadow-in-sm)':'none',
                  cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:8,fontWeight:600,
                  letterSpacing:'0.1em',textTransform:'uppercase',
                  color:artSub===''?'var(--neo-gold)':'var(--neo-text2)'}}>Todas</button>
              {artSubs.map(s=>(
                <button key={s} onClick={()=>setArtSub(s)}
                  style={{padding:'3px 9px',borderRadius:'var(--neo-radius-pill)',border:'none',
                    background:artSub===s?'var(--neo-bg)':'transparent',
                    boxShadow:artSub===s?'var(--neo-shadow-in-sm)':'none',
                    cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:8,fontWeight:600,
                    letterSpacing:'0.1em',textTransform:'uppercase',
                    color:artSub===s?'var(--neo-gold)':'var(--neo-text2)'}}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Contador */}
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:6}}>
            {artFiltered.length} artigo{artFiltered.length!==1?'s':''}
          </div>

          {/* Lista */}
          <div style={{maxHeight:'46vh',overflowY:'auto'}} className="neo-scroll">
            {artigos.length===0&&(
              <div style={{padding:'30px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
                Biblioteca vazia — adiciona artigos primeiro
              </div>
            )}
            {artFiltered.length===0&&artigos.length>0&&(
              <div style={{padding:'20px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
                Sem resultados
              </div>
            )}
            {artFiltered.map(a=>{
              const jaExiste = (modelo?.items||[]).find(i=>i.artId===a.id)
              return(
                <div key={a.id} onClick={()=>{ if(!jaExiste){addItem(a);setArtModal(false);setArtSearch('');setArtCat('Todos');setArtSub('')} }}
                  style={{padding:'10px 4px',borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:jaExiste?'default':'pointer',
                    display:'flex',alignItems:'center',gap:10,opacity:jaExiste?.5:1}}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-gold)',letterSpacing:'0.08em',fontWeight:600}}>{a.ref}</span>
                      {a.cat&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-text2)'}}>{a.sub?a.cat+' · '+a.sub:a.cat}</span>}
                    </div>
                    <span style={{fontSize:12,color:'var(--neo-text)',fontWeight:300}}>{a.desc}</span>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    {a.price>0&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:600,color:'var(--neo-gold)'}}>{a.price.toFixed(2)} €</div>}
                    {jaExiste
                      ? <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'var(--neo-text2)',letterSpacing:'0.1em',marginTop:2}}>já adicionado</div>
                      : <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'var(--neo-text2)',letterSpacing:'0.1em',marginTop:2}}>+ adicionar</div>
                    }
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
            <button className="neo-btn neo-btn-ghost" onClick={()=>{setArtModal(false);setArtSearch('');setArtCat('Todos');setArtSub('')}}>Fechar</button>
          </div>
        </div>
      </div>

      <ModeloFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveModelo} onClose={()=>{setModal(false);setEditId(null)}}/>
      </>
    )
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  const grupos = {}
  modelos.forEach(m => {
    const k = m.contexto||'Geral'
    if (!grupos[k]) grupos[k]=[]
    grupos[k].push(m)
  })

  return (
    <>
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:'var(--neo-bg)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',height:52,borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text)'}}>
          Modelos <span style={{fontSize:9,color:'var(--neo-text2)',marginLeft:8,fontWeight:400}}>{modelos.length}</span>
        </span>
        <button onClick={()=>{setEditId(null);setForm({name:'',contexto:'',notas:''});setModal(true)}}
          className="neo-btn neo-btn-gold" style={{height:32,padding:'0 16px',fontSize:9,borderRadius:'var(--neo-radius-pill)'}}>
          + Modelo
        </button>
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto',padding:'10px 14px 32px'}}>
        {modelos.length===0 && (
          <div style={{padding:'60px 20px',textAlign:'center'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:10}}>
              Nenhum modelo criado
            </div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)',letterSpacing:'0.08em',lineHeight:2}}>
              Cria kits de artigos base para cada contexto —<br/>Cozinha, WC, Parceiro, ou o que precisares.
            </div>
          </div>
        )}
        {Object.entries(grupos).map(([ctx,mods])=>(
          <div key={ctx} style={{marginBottom:18}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-gold2)',marginBottom:8,paddingLeft:2}}>
              {ctx}
            </div>
            {mods.map(m=>(
              <ModelCard key={m.id} m={m} total={total(m.items)}
                onOpen={()=>setDetailId(m.id)}
                onDel={()=>delModelo(m.id,m.name)}
                onAdd={()=>addAllToOrc(m)}
                onEdit={()=>openEdit(m)}/>
            ))}
          </div>
        ))}
      </div>
    </div>
    <ModeloFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveModelo} onClose={()=>{setModal(false);setEditId(null)}}/>
    </>
  )
}

// ── ModelCard ─────────────────────────────────────────────────────────────────
function ModelCard({m,total,onOpen,onDel,onAdd,onEdit}){
  const [added,setAdded]=useState(false)
  const items=m.items||[]
  return(
    <div onClick={onOpen} style={{background:'var(--neo-bg2)',borderRadius:'var(--neo-radius)',boxShadow:'var(--neo-shadow-out-sm)',padding:'14px 16px',marginBottom:8,cursor:'pointer'}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)',marginBottom:2}}>{m.name}</div>
          {m.notas&&<div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.notas}</div>}
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',letterSpacing:'0.1em'}}>
              {items.length} artigo{items.length!==1?'s':''}
            </span>
            {total>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:600,color:'var(--neo-gold)'}}>{total.toFixed(2)} €</span>}
          </div>
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
          <button onClick={e=>{e.stopPropagation();onAdd();setAdded(true);setTimeout(()=>setAdded(false),1800)}} style={{
            padding:'5px 12px',borderRadius:'var(--neo-radius-pill)',border:'none',
            background:added?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg)',
            boxShadow:added?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
            cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,
            letterSpacing:'0.12em',textTransform:'uppercase',color:added?'#1a1610':'var(--neo-text2)',
            transition:'all .2s',whiteSpace:'nowrap',
          }}>{added?'✓ Orç':'+ Orç'}</button>
          <button onClick={e=>{e.stopPropagation();onEdit()}} style={{background:'var(--neo-bg)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'var(--neo-text2)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)'}}>✎</button>
          <button onClick={e=>{e.stopPropagation();onDel()}} style={{background:'var(--neo-bg)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'var(--neo-text2)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)'}}>✕</button>
        </div>
      </div>
    </div>
  )
}

// ── ItemRow ───────────────────────────────────────────────────────────────────
function ItemRow({item,onQty,onRemove,onStar,showToast}){
  const [copied,setCopied]=useState(false)
  const copy=(e)=>{
    e.stopPropagation()
    navigator.clipboard.writeText(item.ref).catch(()=>{})
    setCopied(true);setTimeout(()=>setCopied(false),1600)
    showToast('Copiado — '+item.ref)
  }
  const label = item.sub ? item.cat+' · '+item.sub : item.cat
  return(
    <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'flex-start',gap:10}}>
      <button onClick={onStar} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:13,color:item.star?'#f0c040':'var(--neo-text2)',flexShrink:0,padding:'2px',marginTop:1}}>
        {item.star?'★':'☆'}
      </button>
      <div style={{flex:1,minWidth:0}}>
        {/* Ref + copy */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
          <span style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,letterSpacing:'0.08em',color:'var(--neo-gold)'}}>{item.ref}</span>
          <button onClick={copy} style={{background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-pill)',padding:'2px 7px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,color:copied?'var(--neo-gold)':'var(--neo-text2)',boxShadow:copied?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',transition:'all .15s'}}>
            {copied?'✓':'⎘'}
          </button>
        </div>
        {/* Descrição */}
        <div style={{fontSize:12,fontWeight:300,color:'var(--neo-text)',marginBottom:4,lineHeight:1.4}}>{item.desc}</div>
        {/* Meta — cat, supplier, price */}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          {label&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--neo-text2)',background:'var(--neo-bg)',padding:'2px 7px',borderRadius:'var(--neo-radius-pill)'}}>{label}</span>}
          {item.supplier&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text2)'}}>{item.supplier}</span>}
          {item.price>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:600,color:'var(--neo-gold)'}}>{item.price.toFixed(2)} €</span>}
        </div>
        {/* Notas */}
        {item.notes&&<div style={{fontSize:11,fontWeight:300,color:'var(--neo-text2)',marginTop:4,lineHeight:1.4}}>{item.notes}</div>}
        {/* Link */}
        {item.link&&<a href={item.link} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()}
          style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.08em',color:'var(--neo-gold2)',textDecoration:'none',display:'inline-block',marginTop:4}}>
          ↗ {item.link.replace(/^https?:\/\//,'').slice(0,40)}{item.link.length>47?'…':''}
        </a>}
      </div>
      {/* Qty + remover */}
      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:6,flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <button onClick={()=>onQty((item.qty||1)-1)} style={{width:24,height:24,borderRadius:'50%',border:'none',background:'var(--neo-bg)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',color:'var(--neo-text2)',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>−</button>
          <span style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,color:'var(--neo-text)',minWidth:22,textAlign:'center'}}>{item.qty||1}</span>
          <button onClick={()=>onQty((item.qty||1)+1)} style={{width:24,height:24,borderRadius:'50%',border:'none',background:'var(--neo-bg)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',color:'var(--neo-text2)',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>+</button>
        </div>
        {item.price>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--neo-text2)'}}>{((item.price||0)*(item.qty||1)).toFixed(2)} €</span>}
        <button onClick={onRemove} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13,padding:'2px'}}>✕</button>
      </div>
    </div>
  )
}

// ── OrcBtn ────────────────────────────────────────────────────────────────────
function OrcBtn({items,onAdd}){
  const [added,setAdded]=useState(false)
  return(
    <button onClick={()=>{onAdd();setAdded(true);setTimeout(()=>setAdded(false),1800)}} style={{
      padding:'0 14px',height:32,borderRadius:'var(--neo-radius-pill)',border:'none',
      background:added?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg2)',
      boxShadow:added?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
      cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,
      letterSpacing:'0.12em',textTransform:'uppercase',color:added?'#1a1610':'var(--neo-text2)',
      transition:'all .2s',whiteSpace:'nowrap',
    }}>{added?'✓ Orç':'+ Orç'}</button>
  )
}

// ── ModeloFormModal ───────────────────────────────────────────────────────────
function ModeloFormModal({open,editId,form,setForm,onSave,onClose}){
  const I={width:'100%',background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-in-sm)',padding:'10px 14px',fontFamily:"'Barlow'",fontSize:14,fontWeight:300,color:'var(--neo-text)',outline:'none',transition:'box-shadow .2s'}
  const L={fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-text2)',display:'block',marginBottom:8}
  return(
    <div className={`neo-overlay ${open?'open':''}`}>
      <div className="neo-modal" style={{maxWidth:480}}>
        <div className="neo-modal-head">
          {editId?'Editar modelo':'Novo modelo'}
          <button className="neo-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="frow">
          <label style={L}>Nome do modelo</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}
            placeholder="ex: Cozinha Base, WC Parceiro X…"
            style={{...I,fontFamily:"'Barlow Condensed'",fontSize:18,letterSpacing:'0.06em'}}/>
        </div>
        <div className="frow">
          <label style={L}>Contexto</label>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
            {CONTEXTOS.map(c=>(
              <button key={c} onClick={()=>setForm(f=>({...f,contexto:c}))}
                style={{padding:'5px 12px',borderRadius:'var(--neo-radius-pill)',border:'none',
                  background:form.contexto===c?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg)',
                  boxShadow:form.contexto===c?'var(--neo-shadow-in-sm)':'var(--neo-shadow-out-sm)',
                  cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,
                  letterSpacing:'0.1em',textTransform:'uppercase',
                  color:form.contexto===c?'#1a1610':'var(--neo-text2)',transition:'all .15s'}}>
                {c}
              </button>
            ))}
          </div>
          <input value={form.contexto} onChange={e=>setForm(f=>({...f,contexto:e.target.value}))}
            placeholder="ou escreve um contexto personalizado…" style={I}/>
        </div>
        <div className="frow">
          <label style={L}>Notas</label>
          <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))}
            placeholder="Descrição, parceiro, observações…" style={{...I,resize:'vertical',minHeight:60}}/>
        </div>
        <div className="modal-actions">
          <button className="neo-btn neo-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="neo-btn neo-btn-gold" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

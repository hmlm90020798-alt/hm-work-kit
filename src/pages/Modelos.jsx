import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore'
import { addToOrcamento } from '../hooks/useOrcamento'

// ── Contextos sugeridos para novos modelos ────────────────────────────────────
const CONTEXTOS = ['Cozinha','Casa de Banho','Quarto','Escritório','Parceiro','Outro']

export default function Modelos({ showToast }) {
  const [modelos, setModelos] = useState([])
  const [artigos, setArtigos] = useState([])
  const [detail,  setDetail]  = useState(null)   // modelo aberto
  const [modal,   setModal]   = useState(false)
  const [editId,  setEditId]  = useState(null)
  const [form,    setForm]    = useState({ name:'', contexto:'', notas:'' })
  const [artSearch, setArtSearch] = useState('')
  const [artModal, setArtModal]  = useState(false)
  const [addedAll, setAddedAll]  = useState(false)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), snap =>
      setModelos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), snap =>
      setArtigos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  // ── CRUD modelo ──────────────────────────────────────────────────────────
  const saveModelo = async () => {
    if (!form.name.trim()) { showToast('Nome obrigatório'); return }
    const data = { name:form.name.trim(), contexto:form.contexto.trim(), notas:form.notas.trim(), items:[] }
    if (editId) {
      const prev = modelos.find(m=>m.id===editId)
      await setDoc(doc(db,'modelos',editId), {...data, items: prev?.items||[]})
      if (detail?.id===editId) setDetail(d=>({...d,...data,items:prev?.items||[]}))
      showToast('Modelo atualizado')
    } else {
      const ref = await addDoc(collection(db,'modelos'), data)
      showToast('Modelo criado')
      setDetail({id:ref.id,...data})
    }
    setModal(false)
  }

  const delModelo = async (id, name) => {
    if (!confirm('Eliminar modelo "'+name+'"?')) return
    await deleteDoc(doc(db,'modelos',id))
    if (detail?.id===id) setDetail(null)
    showToast('Eliminado')
  }

  const openEdit = (m) => {
    setEditId(m.id); setForm({name:m.name,contexto:m.contexto||'',notas:m.notas||''}); setModal(true)
  }

  // ── Itens dentro do modelo ───────────────────────────────────────────────
  const getModelo = () => modelos.find(m=>m.id===detail?.id) || detail

  const addItem = async (art) => {
    const m = getModelo(); if(!m) return
    if((m.items||[]).find(i=>i.artId===art.id)) { showToast('Artigo já existe'); return }
    const items=[...( m.items||[]),{artId:art.id,ref:art.ref,desc:art.desc,cat:art.cat,price:art.price||0,qty:1}]
    await setDoc(doc(db,'modelos',m.id),{...m,items})
    setDetail(d=>({...d,items}))
    showToast('Adicionado')
  }

  const updateQty = async (artId, qty) => {
    const m=getModelo(); if(!m) return
    const items=(m.items||[]).map(i=>i.artId===artId?{...i,qty:Math.max(1,qty)}:i)
    await setDoc(doc(db,'modelos',m.id),{...m,items})
    setDetail(d=>({...d,items}))
  }

  const removeItem = async (artId) => {
    const m=getModelo(); if(!m) return
    const items=(m.items||[]).filter(i=>i.artId!==artId)
    await setDoc(doc(db,'modelos',m.id),{...m,items})
    setDetail(d=>({...d,items}))
    showToast('Removido')
  }

  const toggleStar = async (artId) => {
    const m=getModelo(); if(!m) return
    const items=(m.items||[]).map(i=>i.artId===artId?{...i,star:!i.star}:i)
    await setDoc(doc(db,'modelos',m.id),{...m,items})
    setDetail(d=>({...d,items}))
  }

  // ── Adicionar modelo inteiro ao orçamento ────────────────────────────────
  const addAllToOrc = async (m) => {
    const items = m.items||[]
    if(!items.length){ showToast('Modelo sem artigos'); return }
    for(const item of items){
      await addToOrcamento({ref:item.ref,desc:item.desc,cat:item.cat||'',price:item.price||0,origem:'Modelos'},()=>{})
    }
    showToast(`${items.length} artigo${items.length!==1?'s':''} adicionado${items.length!==1?'s':''} ao orçamento`)
    setAddedAll(true); setTimeout(()=>setAddedAll(false),1800)
  }

  const total = (items) => (items||[]).reduce((s,i)=>(s+(i.price||0)*(i.qty||1)),0)

  const artFiltered = artigos.filter(a=>{
    const q=artSearch.toLowerCase()
    return !q||[a.ref,a.desc,a.cat,a.supplier].some(v=>v&&v.toLowerCase().includes(q))
  })

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if(detail){
    const m = getModelo()
    const items = m?.items||[]
    return(
      <>
      <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:'var(--neo-bg)'}}>
        {/* Topbar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',height:52,borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <button onClick={()=>setDetail(null)} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)',display:'flex',alignItems:'center',gap:6}}>
            ← Modelos
          </button>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <AddOrcBtn m={m} onAdd={addAllToOrc} added={addedAll}/>
            <button onClick={()=>openEdit(m)} style={{background:'var(--neo-bg2)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',color:'var(--neo-text2)',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)'}}>✎</button>
            <button onClick={()=>setArtModal(true)} className="neo-btn neo-btn-gold" style={{height:32,padding:'0 14px',fontSize:9,borderRadius:'var(--neo-radius-pill)'}}>+ Artigo</button>
          </div>
        </div>

        {/* Header */}
        <div style={{padding:'16px',borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:4}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)'}}>{m.name}</span>
            {m.contexto&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-gold2)'}}>{m.contexto}</span>}
          </div>
          {m.notas&&<div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',lineHeight:1.5}}>{m.notas}</div>}
          {items.length>0&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',marginTop:6,letterSpacing:'0.1em'}}>
            {items.length} artigo{items.length!==1?'s':''} · Total estimado: <span style={{color:'var(--neo-gold)'}}>{total(items).toFixed(2)} €</span>
          </div>}
        </div>

        {/* Lista de itens */}
        <div className="neo-scroll" style={{flex:1,overflowY:'auto'}}>
          {items.length===0&&(
            <div style={{padding:'60px 20px',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
              Nenhum artigo neste modelo
            </div>
          )}
          {items.map(item=>(
            <ItemRow key={item.artId} item={item}
              onQty={(qty)=>updateQty(item.artId,qty)}
              onRemove={()=>removeItem(item.artId)}
              onStar={()=>toggleStar(item.artId)}
              showToast={showToast}/>
          ))}
        </div>

        {/* Rodapé total */}
        {items.length>0&&(
          <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,0.06)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0,background:'var(--neo-bg)'}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)'}}>Total estimado</span>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,color:'var(--neo-gold)'}}>{total(items).toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* Modal adicionar artigo */}
      <div className={`neo-overlay ${artModal?'open':''}`}>
        <div className="neo-modal" style={{maxWidth:500}}>
          <div className="neo-modal-head">
            Adicionar artigo
            <button className="neo-modal-close" onClick={()=>{setArtModal(false);setArtSearch('')}}>✕</button>
          </div>
          <input autoFocus value={artSearch} onChange={e=>setArtSearch(e.target.value)}
            placeholder="Pesquisar referência ou descrição…" className="neo-input" style={{marginBottom:14}}/>
          <div style={{maxHeight:'52vh',overflowY:'auto'}} className="neo-scroll">
            {artFiltered.map(a=>(
              <div key={a.id} onClick={()=>{addItem(a);setArtModal(false);setArtSearch('')}}
                style={{padding:'11px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',cursor:'pointer',display:'flex',alignItems:'center',gap:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-gold)',letterSpacing:'0.08em',marginRight:10}}>{a.ref}</span>
                  <span style={{fontSize:12,color:'var(--neo-text)',fontWeight:300}}>{a.desc}</span>
                </div>
                {a.price>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)',flexShrink:0}}>{a.price.toFixed(2)} €</span>}
              </div>
            ))}
            {artFiltered.length===0&&<div style={{padding:'30px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)'}}>Sem resultados</div>}
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
            <button className="neo-btn neo-btn-ghost" onClick={()=>{setArtModal(false);setArtSearch('')}}>Fechar</button>
          </div>
        </div>
      </div>

      <ModeloFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveModelo} onClose={()=>setModal(false)}/>
      </>
    )
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  // Agrupar por contexto
  const grupos = {}
  modelos.forEach(m=>{
    const k = m.contexto||'Geral'
    if(!grupos[k]) grupos[k]=[]
    grupos[k].push(m)
  })

  return(
    <>
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden',background:'var(--neo-bg)'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',height:52,borderBottom:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text)'}}>
          Modelos <span style={{fontSize:9,color:'var(--neo-text2)',marginLeft:8,fontWeight:400}}>{modelos.length}</span>
        </span>
        <button onClick={()=>{setEditId(null);setForm({name:'',contexto:'',notas:''});setModal(true)}} className="neo-btn neo-btn-gold" style={{height:32,padding:'0 16px',fontSize:9,borderRadius:'var(--neo-radius-pill)'}}>
          + Modelo
        </button>
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto',padding:'10px 14px 32px'}}>
        {modelos.length===0&&(
          <div style={{padding:'60px 20px',textAlign:'center'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:10}}>
              Nenhum modelo criado
            </div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)',letterSpacing:'0.08em',lineHeight:2}}>
              Cria kits de artigos base para cada contexto —<br/>
              Cozinha, WC, Parceiro, ou o que precisares.
            </div>
          </div>
        )}

        {Object.entries(grupos).map(([ctx,mods])=>(
          <div key={ctx} style={{marginBottom:18}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-gold2)',marginBottom:8,paddingLeft:2}}>
              {ctx}
            </div>
            {mods.map(m=>(
              <ModelCard key={m.id} m={m} total={total(m.items)} onOpen={()=>setDetail(m)} onDel={()=>delModelo(m.id,m.name)} onAdd={()=>addAllToOrc(m)} onEdit={()=>openEdit(m)} showToast={showToast}/>
            ))}
          </div>
        ))}
      </div>
    </div>

    <ModeloFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveModelo} onClose={()=>setModal(false)}/>
    </>
  )
}

// ── ModelCard ─────────────────────────────────────────────────────────────────
function ModelCard({m,total,onOpen,onDel,onAdd,onEdit,showToast}){
  const [added,setAdded]=useState(false)
  const items=m.items||[]
  const handleAdd=(e)=>{e.stopPropagation();onAdd();setAdded(true);setTimeout(()=>setAdded(false),1800)}
  return(
    <div onClick={onOpen} style={{background:'var(--neo-bg2)',borderRadius:'var(--neo-radius)',boxShadow:'var(--neo-shadow-out-sm)',padding:'14px 16px',marginBottom:8,cursor:'pointer',transition:'box-shadow .15s'}}
      onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--neo-shadow-out)'}
      onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--neo-shadow-out-sm)'}>
      <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)',marginBottom:3}}>{m.name}</div>
          {m.notas&&<div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',marginBottom:6,lineHeight:1.4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.notas}</div>}
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',letterSpacing:'0.1em'}}>
              {items.length} artigo{items.length!==1?'s':''}
            </span>
            {total>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:600,color:'var(--neo-gold)'}}>
              {total.toFixed(2)} €
            </span>}
          </div>
        </div>
        <div style={{display:'flex',gap:6,flexShrink:0}} onClick={e=>e.stopPropagation()}>
          <button onClick={handleAdd} style={{
            padding:'5px 12px',borderRadius:'var(--neo-radius-pill)',border:'none',
            background:added?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg)',
            boxShadow:added?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
            cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,
            letterSpacing:'0.12em',textTransform:'uppercase',
            color:added?'#1a1610':'var(--neo-text2)',transition:'all .2s',whiteSpace:'nowrap',
          }}>{added?'✓ Orç':'+ Orç'}</button>
          <button onClick={e=>{e.stopPropagation();onEdit()}} style={{background:'var(--neo-bg)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'var(--neo-text2)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)'}}>✎</button>
          <button onClick={e=>{e.stopPropagation();onDel()}} style={{background:'var(--neo-bg)',border:'none',borderRadius:'50%',width:30,height:30,cursor:'pointer',color:'var(--neo-text2)',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'var(--neo-shadow-out-sm)'}}>✕</button>
        </div>
      </div>
    </div>
  )
}

// ── ItemRow — artigo dentro do modelo (detail view) ───────────────────────────
function ItemRow({item,onQty,onRemove,onStar,showToast}){
  const [copied,setCopied]=useState(false)
  const copy=(e)=>{
    e.stopPropagation()
    navigator.clipboard.writeText(item.ref).catch(()=>{})
    setCopied(true);setTimeout(()=>setCopied(false),1600)
    showToast('Copiado — '+item.ref)
  }
  return(
    <div style={{padding:'12px 16px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:10}}>
      <button onClick={e=>{e.stopPropagation();onStar()}} style={{background:'transparent',border:'none',cursor:'pointer',fontSize:13,color:item.star?'#f0c040':'var(--neo-text2)',flexShrink:0,padding:'2px'}}>
        {item.star?'★':'☆'}
      </button>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
          <span style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:600,letterSpacing:'0.08em',color:'var(--neo-gold)'}}>{item.ref}</span>
          <button onClick={copy} style={{background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-pill)',padding:'2px 7px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,color:copied?'var(--neo-gold)':'var(--neo-text2)',boxShadow:copied?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',transition:'all .15s'}}>
            {copied?'✓':'⎘'}
          </button>
        </div>
        <div style={{fontSize:12,fontWeight:300,color:'var(--neo-text)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{item.desc}</div>
        {item.cat&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',letterSpacing:'0.08em',marginTop:2}}>{item.cat}</div>}
      </div>
      {/* Qty */}
      <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
        <button onClick={()=>onQty((item.qty||1)-1)} style={{width:22,height:22,borderRadius:'50%',border:'none',background:'var(--neo-bg)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',color:'var(--neo-text2)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>−</button>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,color:'var(--neo-text)',minWidth:20,textAlign:'center'}}>{item.qty||1}</span>
        <button onClick={()=>onQty((item.qty||1)+1)} style={{width:22,height:22,borderRadius:'50%',border:'none',background:'var(--neo-bg)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',color:'var(--neo-text2)',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1}}>+</button>
      </div>
      {item.price>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-text2)',minWidth:60,textAlign:'right',flexShrink:0}}>{((item.price||0)*(item.qty||1)).toFixed(2)} €</span>}
      <button onClick={onRemove} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13,flexShrink:0}}>✕</button>
    </div>
  )
}

// ── AddOrcBtn ─────────────────────────────────────────────────────────────────
function AddOrcBtn({m,onAdd,added}){
  return(
    <button onClick={()=>onAdd(m)} style={{
      padding:'0 14px',height:32,borderRadius:'var(--neo-radius-pill)',border:'none',
      background:added?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg2)',
      boxShadow:added?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
      cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,
      letterSpacing:'0.12em',textTransform:'uppercase',
      color:added?'#1a1610':'var(--neo-text2)',transition:'all .2s',whiteSpace:'nowrap',
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
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="ex: Cozinha Base, WC Parceiro X…" style={{...I,fontFamily:"'Barlow Condensed'",fontSize:18,letterSpacing:'0.06em'}}/>
        </div>
        <div className="frow">
          <label style={L}>Contexto</label>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
            {CONTEXTOS.map(c=>(
              <button key={c} onClick={()=>setForm(f=>({...f,contexto:c}))}
                style={{padding:'5px 12px',borderRadius:'var(--neo-radius-pill)',border:'none',background:form.contexto===c?'linear-gradient(145deg,#d4b87a,#b8924a)':'var(--neo-bg)',boxShadow:form.contexto===c?'var(--neo-shadow-in-sm)':'var(--neo-shadow-out-sm)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,letterSpacing:'0.1em',textTransform:'uppercase',color:form.contexto===c?'#1a1610':'var(--neo-text2)',transition:'all .15s'}}>
                {c}
              </button>
            ))}
          </div>
          <input value={form.contexto} onChange={e=>setForm(f=>({...f,contexto:e.target.value}))} placeholder="ou escreve um contexto personalizado…" style={I}/>
        </div>
        <div className="frow">
          <label style={L}>Notas</label>
          <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Descrição, parceiro, observações…" style={{...I,resize:'vertical',minHeight:60}}/>
        </div>
        <div className="modal-actions">
          <button className="neo-btn neo-btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="neo-btn neo-btn-gold" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

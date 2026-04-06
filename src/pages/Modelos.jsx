import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore'
import { addToOrcamento } from '../hooks/useOrcamento'

export default function Modelos({ showToast }) {
  const [modelos, setModelos] = useState([])
  const [artigos, setArtigos] = useState([])
  const [modal, setModal]     = useState(false)
  const [detail, setDetail]   = useState(null) // modelo aberto
  const [editId, setEditId]   = useState(null)
  const [form, setForm]       = useState({ name:'', tipo:'', notas:'' })
  const [addArtModal, setAddArtModal] = useState(false)
  const [artSearch, setArtSearch]     = useState('')

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), snap => setModelos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), snap => setArtigos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  const saveModelo = async () => {
    if (!form.name.trim()) { showToast('Nome obrigatório'); return }
    const data = { name:form.name.trim(), tipo:form.tipo.trim(), notas:form.notas.trim(), items:editId ? (modelos.find(m=>m.id===editId)?.items||[]) : [] }
    if (editId) {
      await setDoc(doc(db,'modelos',editId), data)
      showToast('Modelo atualizado')
      if (detail?.id===editId) setDetail({id:editId,...data})
    } else {
      const ref = await addDoc(collection(db,'modelos'), data)
      showToast('Modelo criado')
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
    setEditId(m.id)
    setForm({ name:m.name, tipo:m.tipo||'', notas:m.notas||'' })
    setModal(true)
  }

  const addItemToModelo = async (art) => {
    const m = modelos.find(x=>x.id===detail.id)
    if (!m) return
    const exists = (m.items||[]).find(i=>i.artId===art.id)
    if (exists) { showToast('Artigo já existe no modelo'); return }
    const items = [...(m.items||[]), { artId:art.id, ref:art.ref, desc:art.desc, cat:art.cat, price:art.price||0, qty:1 }]
    await setDoc(doc(db,'modelos',detail.id), {...m, items})
    setDetail({...m, items})
    showToast('Artigo adicionado')
  }

  const updateQty = async (artId, qty) => {
    const m = modelos.find(x=>x.id===detail.id)
    if (!m) return
    const items = (m.items||[]).map(i => i.artId===artId ? {...i, qty:Math.max(1,qty)} : i)
    await setDoc(doc(db,'modelos',detail.id), {...m, items})
    setDetail({...m, items})
  }

  const removeItem = async (artId) => {
    const m = modelos.find(x=>x.id===detail.id)
    if (!m) return
    const items = (m.items||[]).filter(i=>i.artId!==artId)
    await setDoc(doc(db,'modelos',detail.id), {...m, items})
    setDetail({...m, items})
    showToast('Artigo removido')
  }

  const total = (items) => (items||[]).reduce((s,i) => s + (i.price||0)*(i.qty||1), 0)

  const artFiltered = artigos.filter(a => {
    const q = artSearch.toLowerCase()
    return !q || [a.ref,a.desc,a.cat,a.supplier].some(v=>v&&v.toLowerCase().includes(q))
  })

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (detail) {
    const m = modelos.find(x=>x.id===detail.id) || detail
    return (
      <>
      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        {/* barra */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
          <button onClick={() => setDetail(null)} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', display:'flex', alignItems:'center', gap:6 }}>
            ← Modelos
          </button>
          <div style={{ display:'flex', gap:8 }}>
            <AddOrcBtn items={m.items} name={m.name} showToast={showToast}/>
            <button onClick={() => openEdit(m)} style={{ background:'transparent', border:'1px solid var(--line2)', width:32, height:32, cursor:'pointer', color:'var(--text3)', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
            <button onClick={() => setAddArtModal(true)} className="btn btn-gold" style={{ height:32, padding:'0 14px', fontSize:9 }}>+ Artigo</button>
          </div>
        </div>

        {/* header modelo */}
        <div style={{ padding:'20px 20px 16px', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)', marginBottom:4 }}>{m.name}</div>
          {m.tipo && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', marginBottom:4 }}>{m.tipo}</div>}
          {m.notas && <div style={{ fontSize:12, fontWeight:300, color:'var(--text2)' }}>{m.notas}</div>}
        </div>

        {/* itens */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {(!m.items||m.items.length===0) && (
            <div style={{ padding:'60px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
              Nenhum artigo neste modelo
            </div>
          )}
          {(m.items||[]).map(item => (
            <div key={item.artId} style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--gold)', letterSpacing:'0.08em' }}>{item.ref}</div>
                <div style={{ fontSize:13, color:'var(--text)', marginTop:2, fontWeight:300 }}>{item.desc}</div>
              </div>
              {/* qty */}
              <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                <button onClick={() => updateQty(item.artId,(item.qty||1)-1)} style={{ width:26, height:26, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--text)', minWidth:20, textAlign:'center' }}>{item.qty||1}</span>
                <button onClick={() => updateQty(item.artId,(item.qty||1)+1)} style={{ width:26, height:26, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
              </div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--text2)', minWidth:60, textAlign:'right', flexShrink:0 }}>
                {((item.price||0)*(item.qty||1)).toFixed(2)} €
              </div>
              <button onClick={() => removeItem(item.artId)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:13, flexShrink:0 }}>✕</button>
            </div>
          ))}
        </div>

        {/* total */}
        {m.items && m.items.length > 0 && (
          <div style={{ padding:'14px 20px', borderTop:'1px solid var(--line)', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, background:'var(--bg)' }}>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>Total estimado</span>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:600, color:'var(--gold)' }}>{total(m.items).toFixed(2)} €</span>
          </div>
        )}
      </div>

      {/* MODAL ADD ARTIGO AO MODELO */}
      <div className={`overlay ${addArtModal?'open':''}`}>
        <div className="modal">
          <div className="modal-head">
            Adicionar artigo
            <button className="modal-close" onClick={() => { setAddArtModal(false); setArtSearch('') }}>✕</button>
          </div>
          <input autoFocus value={artSearch} onChange={e=>setArtSearch(e.target.value)} placeholder="Pesquisar artigo ou referência…"
            style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--gold)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:14, fontWeight:300, color:'var(--text)', outline:'none', marginBottom:16 }} />
          <div style={{ maxHeight:'50vh', overflowY:'auto' }}>
            {artFiltered.map(a => (
              <div key={a.id} onClick={() => addItemToModelo(a)}
                style={{ padding:'12px 0', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--gold)', letterSpacing:'0.08em', marginRight:10 }}>{a.ref}</span>
                  <span style={{ fontSize:12, color:'var(--text)', fontWeight:300 }}>{a.desc}</span>
                </div>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text3)' }}>{a.price>0?a.price.toFixed(2)+' €':''}</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => { setAddArtModal(false); setArtSearch('') }}>Fechar</button>
          </div>
        </div>
      </div>

      {/* MODAL EDITAR MODELO */}
      <ModeloFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveModelo} onClose={() => setModal(false)} />
      </>
    )
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>
          Modelos <span style={{ fontSize:9, color:'var(--text3)', marginLeft:8 }}>{modelos.length}</span>
        </span>
        <button onClick={() => { setEditId(null); setForm({name:'',tipo:'',notas:''}); setModal(true) }} className="btn btn-gold" style={{ height:30, padding:'0 14px', fontSize:9 }}>
          + Modelo
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {modelos.length===0 && (
          <div style={{ padding:'60px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
            Nenhum modelo criado
          </div>
        )}
        {modelos.map(m => (
          <div key={m.id} style={{ padding:'18px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12 }}>
            <div onClick={() => setDetail(m)} style={{ flex:1, cursor:'pointer' }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:16, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)', marginBottom:4 }}>{m.name}</div>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                {m.tipo && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)' }}>{m.tipo}</span>}
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)' }}>{(m.items||[]).length} artigo{(m.items||[]).length!==1?'s':''}</span>
                {(m.items||[]).length>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--gold2)' }}>{total(m.items).toFixed(2)} €</span>}
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <AddOrcBtn items={m.items} name={m.name} showToast={showToast}/>
              <button onClick={() => openEdit(m)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
              <button onClick={() => delModelo(m.id,m.name)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <ModeloFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveModelo} onClose={() => setModal(false)} />
    </>
  )
}

// ── AddOrcBtn — adiciona todos os artigos do modelo ao orçamento ativo ───────
function AddOrcBtn({ items, name, showToast }) {
  const [added, setAdded] = React.useState(false)

  const handle = async () => {
    if (!items || items.length === 0) { showToast('Modelo sem artigos'); return }
    for (const item of items) {
      await addToOrcamento({
        ref:    item.ref,
        desc:   item.desc,
        cat:    item.cat || '',
        price:  item.price || 0,
        origem: 'Modelos',
      }, () => {})
    }
    showToast(`${items.length} artigo${items.length !== 1 ? 's' : ''} adicionado${items.length !== 1 ? 's' : ''} ao orçamento`)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <button onClick={handle} style={{
      padding:'0 12px', height:32,
      background: added ? 'linear-gradient(145deg,#d4b87a,#b8924a)' : 'transparent',
      border:'1px solid var(--line2)',
      cursor:'pointer',
      fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700,
      letterSpacing:'0.12em', textTransform:'uppercase',
      color: added ? '#1a1610' : 'var(--text3)',
      transition:'all .2s', whiteSpace:'nowrap',
    }}>
      {added ? '✓ Orç' : '+ Orç'}
    </button>
  )
}

function ModeloFormModal({ open, editId, form, setForm, onSave, onClose }) {
  return (
    <div className={`overlay ${open?'open':''}`}>
      <div className="modal">
        <div className="modal-head">
          {editId ? 'Editar modelo' : 'Novo modelo'}
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="frow">
          <label>Nome do modelo</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="ex: Cozinha base" style={{ fontFamily:"'Barlow Condensed'", fontSize:18, letterSpacing:'0.06em' }} />
        </div>
        <div className="frow">
          <label>Tipo de projecto</label>
          <input value={form.tipo} onChange={e=>setForm(f=>({...f,tipo:e.target.value}))} placeholder="ex: Cozinha, Renovação, WC…" />
        </div>
        <div className="frow">
          <label>Notas</label>
          <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Descrição ou observações sobre este modelo…" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

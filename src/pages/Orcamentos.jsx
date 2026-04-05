import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore'

export default function Orcamentos({ showToast }) {
  const [orcamentos, setOrcamentos] = useState([])
  const [artigos, setArtigos]       = useState([])
  const [modelos, setModelos]       = useState([])
  const [modal, setModal]           = useState(false)
  const [detail, setDetail]         = useState(null)
  const [editId, setEditId]         = useState(null)
  const [form, setForm]             = useState({ name:'', cliente:'', notas:'' })
  const [addArtModal, setAddArtModal] = useState(false)
  const [addModModal, setAddModModal] = useState(false)
  const [artSearch, setArtSearch]     = useState('')

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'orcamentos'), snap => setOrcamentos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'),    snap => setArtigos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u3 = onSnapshot(collection(db,'modelos'),    snap => setModelos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2(); u3() }
  }, [])

  const saveOrc = async () => {
    if (!form.name.trim()) { showToast('Nome obrigatório'); return }
    const data = { name:form.name.trim(), cliente:form.cliente.trim(), notas:form.notas.trim(), items: editId ? (orcamentos.find(o=>o.id===editId)?.items||[]) : [], data: new Date().toISOString().split('T')[0], estado:'rascunho' }
    if (editId) {
      await setDoc(doc(db,'orcamentos',editId), data)
      showToast('Orçamento atualizado')
      if (detail?.id===editId) setDetail({id:editId,...data})
    } else {
      await addDoc(collection(db,'orcamentos'), data)
      showToast('Orçamento criado')
    }
    setModal(false)
  }

  const delOrc = async (id, name) => {
    if (!confirm('Eliminar orçamento "'+name+'"?')) return
    await deleteDoc(doc(db,'orcamentos',id))
    if (detail?.id===id) setDetail(null)
    showToast('Eliminado')
  }

  const openEdit = (o) => {
    setEditId(o.id)
    setForm({ name:o.name, cliente:o.cliente||'', notas:o.notas||'' })
    setModal(true)
  }

  const getOrc = () => orcamentos.find(x=>x.id===detail?.id) || detail

  const addItem = async (art, qty=1) => {
    const o = getOrc()
    if (!o) return
    const exists = (o.items||[]).find(i=>i.artId===art.id)
    if (exists) { showToast('Artigo já existe no orçamento'); return }
    const items = [...(o.items||[]), { artId:art.id, ref:art.ref, desc:art.desc, cat:art.cat, price:art.price||0, qty }]
    await setDoc(doc(db,'orcamentos',o.id), {...o, items})
    setDetail({...o, items})
    showToast('Artigo adicionado')
  }

  const importModelo = async (modelo) => {
    const o = getOrc()
    if (!o) return
    const existing = new Set((o.items||[]).map(i=>i.artId))
    const newItems = (modelo.items||[]).filter(i=>!existing.has(i.artId))
    if (!newItems.length) { showToast('Todos os artigos já existem'); return }
    const items = [...(o.items||[]), ...newItems]
    await setDoc(doc(db,'orcamentos',o.id), {...o, items})
    setDetail({...o, items})
    showToast(newItems.length+' artigo(s) importados do modelo')
    setAddModModal(false)
  }

  const updateQty = async (artId, qty) => {
    const o = getOrc()
    if (!o) return
    const items = (o.items||[]).map(i => i.artId===artId ? {...i, qty:Math.max(1,qty)} : i)
    await setDoc(doc(db,'orcamentos',o.id), {...o, items})
    setDetail({...o, items})
  }

  const updatePrice = async (artId, price) => {
    const o = getOrc()
    if (!o) return
    const items = (o.items||[]).map(i => i.artId===artId ? {...i, price:parseFloat(price)||0} : i)
    await setDoc(doc(db,'orcamentos',o.id), {...o, items})
    setDetail({...o, items})
  }

  const removeItem = async (artId) => {
    const o = getOrc()
    if (!o) return
    const items = (o.items||[]).filter(i=>i.artId!==artId)
    await setDoc(doc(db,'orcamentos',o.id), {...o, items})
    setDetail({...o, items})
    showToast('Artigo removido')
  }

  const toggleEstado = async () => {
    const o = getOrc()
    if (!o) return
    const estado = o.estado==='final' ? 'rascunho' : 'final'
    await setDoc(doc(db,'orcamentos',o.id), {...o, estado})
    setDetail({...o, estado})
    showToast(estado==='final' ? 'Marcado como final' : 'Voltou a rascunho')
  }

  const total = (items) => (items||[]).reduce((s,i) => s+(i.price||0)*(i.qty||1), 0)

  const artFiltered = artigos.filter(a => {
    const q = artSearch.toLowerCase()
    return !q || [a.ref,a.desc,a.cat,a.supplier].some(v=>v&&v.toLowerCase().includes(q))
  })

  // ── DETAIL VIEW ──────────────────────────────────────────────────────────
  if (detail) {
    const o = getOrc()
    return (
      <>
      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        {/* barra */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
          <button onClick={() => setDetail(null)} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>
            ← Orçamentos
          </button>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={() => setAddModModal(true)} className="btn btn-outline" style={{ height:30, padding:'0 10px', fontSize:9 }}>+ Modelo</button>
            <button onClick={() => setAddArtModal(true)} className="btn btn-gold" style={{ height:30, padding:'0 12px', fontSize:9 }}>+ Artigo</button>
          </div>
        </div>

        {/* header */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10 }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:20, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>{o.name}</div>
              {o.cliente && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)', marginTop:3 }}>{o.cliente}</div>}
            </div>
            <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
              <button onClick={() => openEdit(o)} style={{ background:'transparent', border:'1px solid var(--line2)', width:30, height:30, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
              <button onClick={toggleEstado}
                style={{ background: o.estado==='final'?'var(--gold)':'transparent', border:'1px solid var(--line2)', padding:'0 10px', height:30, cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color: o.estado==='final'?'var(--bg)':'var(--text2)' }}>
                {o.estado==='final' ? 'Final' : 'Rascunho'}
              </button>
            </div>
          </div>
          {o.notas && <div style={{ fontSize:12, fontWeight:300, color:'var(--text2)', marginTop:8 }}>{o.notas}</div>}
        </div>

        {/* itens */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {(!o.items||o.items.length===0) && (
            <div style={{ padding:'60px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
              Nenhum artigo — adiciona ou importa um modelo
            </div>
          )}
          {(o.items||[]).map(item => (
            <div key={item.artId} style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--gold)', letterSpacing:'0.08em', flex:1 }}>{item.ref}</span>
                <button onClick={() => removeItem(item.artId)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>✕</button>
              </div>
              <div style={{ fontSize:13, color:'var(--text)', fontWeight:300, marginBottom:10 }}>{item.desc}</div>
              <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                {/* qty */}
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <button onClick={() => updateQty(item.artId,(item.qty||1)-1)} style={{ width:28, height:28, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:16, color:'var(--text)', minWidth:24, textAlign:'center' }}>{item.qty||1}</span>
                  <button onClick={() => updateQty(item.artId,(item.qty||1)+1)} style={{ width:28, height:28, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                </div>
                {/* preço editável */}
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <input type="number" value={item.price||0} onChange={e=>updatePrice(item.artId,e.target.value)} step="0.01" min="0"
                    style={{ width:72, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'3px 0', fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--text)', outline:'none', textAlign:'right' }} />
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text3)' }}>€</span>
                </div>
                {/* subtotal */}
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:500, color:'var(--text2)', marginLeft:'auto' }}>
                  {((item.price||0)*(item.qty||1)).toFixed(2)} €
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* total */}
        {o.items && o.items.length>0 && (
          <div style={{ padding:'16px 20px', borderTop:'1px solid var(--line)', flexShrink:0, background:'var(--bg)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)' }}>Total material</span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:600, color:'var(--gold)' }}>{total(o.items).toFixed(2)} €</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)' }}>{(o.items||[]).length} artigo{(o.items||[]).length!==1?'s':''} · {o.data||''}</span>
            </div>
          </div>
        )}
      </div>

      {/* MODAL ADD ARTIGO */}
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
              <div key={a.id} onClick={() => { addItem(a); setAddArtModal(false); setArtSearch('') }}
                style={{ padding:'12px 0', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--gold)', letterSpacing:'0.08em', marginRight:10 }}>{a.ref}</span>
                  <span style={{ fontSize:12, color:'var(--text)', fontWeight:300 }}>{a.desc}</span>
                </div>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text3)', flexShrink:0 }}>{a.price>0?a.price.toFixed(2)+' €':''}</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => { setAddArtModal(false); setArtSearch('') }}>Fechar</button>
          </div>
        </div>
      </div>

      {/* MODAL IMPORTAR MODELO */}
      <div className={`overlay ${addModModal?'open':''}`}>
        <div className="modal">
          <div className="modal-head">
            Importar modelo
            <button className="modal-close" onClick={() => setAddModModal(false)}>✕</button>
          </div>
          <div style={{ maxHeight:'55vh', overflowY:'auto' }}>
            {modelos.length===0 && <div style={{ padding:'30px 0', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>Nenhum modelo disponível</div>}
            {modelos.map(m => (
              <div key={m.id} onClick={() => importModelo(m)}
                style={{ padding:'16px 0', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)' }}>{m.name}</div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', color:'var(--text3)', marginTop:3 }}>{(m.items||[]).length} artigo{(m.items||[]).length!==1?'s':''}</div>
                </div>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--gold2)' }}>→</span>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setAddModModal(false)}>Fechar</button>
          </div>
        </div>
      </div>

      <OrcFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveOrc} onClose={() => setModal(false)} />
      </>
    )
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────
  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>
          Orçamentos <span style={{ fontSize:9, color:'var(--text3)', marginLeft:8 }}>{orcamentos.length}</span>
        </span>
        <button onClick={() => { setEditId(null); setForm({name:'',cliente:'',notas:''}); setModal(true) }} className="btn btn-gold" style={{ height:30, padding:'0 14px', fontSize:9 }}>
          + Orçamento
        </button>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {orcamentos.length===0 && (
          <div style={{ padding:'60px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
            Nenhum orçamento criado
          </div>
        )}
        {orcamentos.map(o => (
          <div key={o.id} style={{ padding:'18px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12 }}>
            <div onClick={() => setDetail(o)} style={{ flex:1, cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:16, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)' }}>{o.name}</span>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', padding:'2px 6px', border:'1px solid', borderColor: o.estado==='final'?'var(--gold2)':'var(--line2)', color: o.estado==='final'?'var(--gold)':'var(--text3)' }}>{o.estado||'rascunho'}</span>
              </div>
              <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                {o.cliente && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)' }}>{o.cliente}</span>}
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)' }}>{(o.items||[]).length} artigo{(o.items||[]).length!==1?'s':''}</span>
                {(o.items||[]).length>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--gold2)' }}>{total(o.items).toFixed(2)} €</span>}
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <button onClick={() => openEdit(o)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✎</button>
              <button onClick={() => delOrc(o.id,o.name)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <OrcFormModal open={modal} editId={editId} form={form} setForm={setForm} onSave={saveOrc} onClose={() => setModal(false)} />
    </>
  )
}

function OrcFormModal({ open, editId, form, setForm, onSave, onClose }) {
  return (
    <div className={`overlay ${open?'open':''}`}>
      <div className="modal">
        <div className="modal-head">
          {editId ? 'Editar orçamento' : 'Novo orçamento'}
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="frow">
          <label>Nome do projecto</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="ex: Cozinha Apt. Lisboa" style={{ fontFamily:"'Barlow Condensed'", fontSize:18, letterSpacing:'0.06em' }} />
        </div>
        <div className="frow">
          <label>Cliente</label>
          <input value={form.cliente} onChange={e=>setForm(f=>({...f,cliente:e.target.value}))} placeholder="Nome do cliente ou referência" />
        </div>
        <div className="frow">
          <label>Notas</label>
          <textarea value={form.notas} onChange={e=>setForm(f=>({...f,notas:e.target.value}))} placeholder="Observações sobre o projecto…" />
        </div>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={onSave}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

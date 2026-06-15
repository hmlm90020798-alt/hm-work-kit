import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { subscribeBundles, saveBundle, deleteBundle } from '../hooks/useBundles'

const F = {
  fontFamily: "'Barlow Condensed'",
  fontSize: 11, fontWeight: 600,
  letterSpacing: '0.16em', textTransform: 'uppercase',
  color: '#9a9690',
  display: 'block', marginBottom: 6,
}
const I = {
  width: '100%',
  background: '#0f0f0e',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 6,
  padding: '9px 12px',
  fontFamily: "'Barlow', sans-serif",
  fontSize: 13, fontWeight: 300,
  color: '#e8e4dc',
  outline: 'none',
  transition: 'border-color .15s',
}

const BUNDLE_VAZIO = { triggerRef: '', triggerDesc: '', complementos: [], nota: '' }
const COMP_VAZIO = { ref: '', desc: '', price: '', qty: 1, obrigatorio: true, cat: '', sub: '', supplier: '', link: '' }

function ArtSearch({ artigos, value, desc, onSelect, placeholder }) {
  const [q, setQ] = useState(value || '')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => { setQ(value || '') }, [value])

  const sugestoes = q.trim().length < 1 ? [] : artigos.filter(function(a) {
    var t = q.toLowerCase()
    return (a.ref && a.ref.toLowerCase().indexOf(t) >= 0) || (a.desc && a.desc.toLowerCase().indexOf(t) >= 0)
  }).slice(0, 8)

  var seleccionar = function(art) {
    setQ(art.ref)
    setOpen(false)
    onSelect(art)
  }

  return (
    React.createElement('div', { style: { position: 'relative', width: '100%' } },
      React.createElement('input', {
        value: q,
        onChange: function(e) { setQ(e.target.value); setOpen(true) },
        onFocus: function() { setFocused(true); setOpen(true) },
        onBlur: function() { setFocused(false); setTimeout(function() { setOpen(false) }, 150) },
        placeholder: placeholder || 'Pesquisar ref ou nome...',
        style: Object.assign({}, I, {
          fontFamily: "'Barlow Condensed'", letterSpacing: '0.08em', fontSize: 13,
          borderColor: focused ? 'rgba(200,169,110,0.4)' : 'rgba(255,255,255,0.08)',
        })
      }),
      desc ? React.createElement('div', {
        style: { fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.06em', color: '#c8943a', marginTop: 4 }
      }, desc) : null,
      open && sugestoes.length > 0 ? React.createElement('div', {
        style: {
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: '#1a1a18', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6, zIndex: 500, overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
        }
      }, sugestoes.map(function(a) {
        return React.createElement('button', {
          key: a.id,
          onMouseDown: function() { seleccionar(a) },
          style: {
            width: '100%', textAlign: 'left', padding: '9px 12px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }
        },
          React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
            React.createElement('span', {
              style: { fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#c8943a', flexShrink: 0 }
            }, a.ref),
            React.createElement('span', {
              style: { fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#9a9690', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
            }, a.desc),
            a.price > 0 ? React.createElement('span', {
              style: { fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#4a4a48', flexShrink: 0 }
            }, parseFloat(a.price).toFixed(2) + ' EUR') : null
          ),
          a.cat ? React.createElement('div', {
            style: { fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.1em', color: '#4a4a48', marginTop: 2 }
          }, a.cat + (a.sub ? ' - ' + a.sub : '')) : null
        )
      })) : null
    )
  )
}

export default function Bundles({ showToast }) {
  const [bundles, setBundles] = useState([])
  const [artigos, setArtigos] = useState([])
  const [modal, setModal] = useState(false)
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(BUNDLE_VAZIO)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(function() {
    return subscribeBundles(setBundles, function() { showToast('Erro ao carregar bundles') })
  }, [])

  useEffect(function() {
    var unsub = onSnapshot(collection(db, 'artigos'), function(snap) {
      setArtigos(snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()) }))
    }, function() {})
    return unsub
  }, [])

  var abrirNovo = function() {
    setEditId(null)
    setForm(Object.assign({}, BUNDLE_VAZIO, { complementos: [] }))
    setModal(true)
  }

  var abrirEditar = function(b) {
    setEditId(b.id)
    setForm({
      triggerRef: b.triggerRef || '',
      triggerDesc: b.triggerDesc || '',
      complementos: (b.complementos || []).map(function(c) {
        return Object.assign({}, c, { price: c.price != null ? c.price : '', qty: c.qty != null ? c.qty : 1 })
      }),
      nota: b.nota || '',
    })
    setModal(true)
  }

  var guardar = async function() {
    if (!form.triggerRef.trim()) { showToast('Referencia do artigo gatilho obrigatoria'); return }
    if (!form.triggerDesc.trim()) { showToast('Descricao do artigo gatilho obrigatoria'); return }
    if (!form.complementos.length) { showToast('Adiciona pelo menos um complemento'); return }
    var compsValidos = form.complementos.filter(function(c) { return c.ref.trim() && c.desc.trim() })
    if (!compsValidos.length) { showToast('Preenche ref e descricao dos complementos'); return }
    setSaving(true)
    try {
      await saveBundle({
        id: editId || undefined,
        triggerRef: form.triggerRef.trim(),
        triggerDesc: form.triggerDesc.trim(),
        nota: form.nota.trim(),
        complementos: compsValidos.map(function(c) {
          return {
            ref: c.ref.trim(), desc: c.desc.trim(),
            price: parseFloat(c.price) || 0, qty: parseInt(c.qty) || 1,
            obrigatorio: !!c.obrigatorio,
            cat: c.cat || '', sub: c.sub || '', supplier: c.supplier || '', link: c.link || '',
          }
        }),
      })
      showToast(editId ? 'Bundle actualizado' : 'Bundle criado')
      setModal(false)
    } catch(e) {
      console.error(e)
      showToast('Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  var eliminar = async function(b) {
    if (!confirm('Eliminar bundle de "' + b.triggerDesc + '"?')) return
    try { await deleteBundle(b.id); showToast('Bundle eliminado') }
    catch(e) { showToast('Erro ao eliminar') }
  }

  var addComp = function() {
    setForm(function(f) { return Object.assign({}, f, { complementos: f.complementos.concat([Object.assign({}, COMP_VAZIO)]) }) })
  }

  var updateComp = function(idx, field, val) {
    setForm(function(f) {
      return Object.assign({}, f, {
        complementos: f.complementos.map(function(c, i) {
          return i === idx ? Object.assign({}, c, { [field]: val }) : c
        })
      })
    })
  }

  var removeComp = function(idx) {
    setForm(function(f) {
      return Object.assign({}, f, { complementos: f.complementos.filter(function(_, i) { return i !== idx }) })
    })
  }

  var filtrados = bundles.filter(function(b) {
    var q = search.toLowerCase()
    return !q || (b.triggerRef && b.triggerRef.indexOf(q) >= 0) || (b.triggerDesc && b.triggerDesc.toLowerCase().indexOf(q) >= 0)
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a09', fontFamily: "'Barlow', sans-serif" }}>

      {/* TOPBAR */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 17, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e8e4dc' }}>Bundles</div>
        <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6a6760' }}>Artigo principal para complementos automaticos</div>
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={function(e) { setSearch(e.target.value) }}
          placeholder="Pesquisar..."
          style={Object.assign({}, I, { width: 220, padding: '7px 12px', fontSize: 12 })}
        />
        <button onClick={abrirNovo} style={{ flexShrink: 0, background: 'linear-gradient(135deg,#c8a96e,#b8924a)', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0a0a09' }}>
          + Bundle
        </button>
      </div>

      {/* LISTA */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {filtrados.length === 0 && (
          <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: "'Barlow Condensed'", fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#3a3a38' }}>
            {search ? 'Sem resultados' : 'Nenhum bundle criado ainda'}
          </div>
        )}
        {filtrados.map(function(b) {
          return (
            <div key={b.id} style={{ marginBottom: 8, borderRadius: 8, background: '#0f0f0e', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: b.complementos && b.complementos.length ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: '#e8e4dc', lineHeight: 1.2, marginBottom: 3 }}>{b.triggerDesc}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.12em', color: '#c8943a', fontWeight: 600 }}>{b.triggerRef}</span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.1em', color: '#3a3a38' }}>
                      {(b.complementos ? b.complementos.length : 0) + ' complemento(s)'}
                    </span>
                  </div>
                </div>
                <button onClick={function() { abrirEditar(b) }} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6a6760' }}>Editar</button>
                <button onClick={function() { eliminar(b) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a3a3a', fontSize: 15, padding: '4px 6px', lineHeight: 1 }}>X</button>
              </div>
              {(b.complementos || []).map(function(c, i) {
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 16px', borderBottom: i < b.complementos.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: c.obrigatorio ? '#c8a96e' : '#3a3a38', display: 'inline-block' }} />
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.1em', color: '#c8943a', fontWeight: 600, flexShrink: 0 }}>{c.ref}</span>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: '#6a6760', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.desc}</span>
                    {c.price > 0 && <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: '#4a4a48', flexShrink: 0 }}>{parseFloat(c.price).toFixed(2)} EUR</span>}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* MODAL */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#111110', borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)', width: '100%', maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            {/* Header modal */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#e8e4dc' }}>
                {editId ? 'Editar bundle' : 'Novo bundle'}
              </span>
              <button onClick={function() { setModal(false) }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6a6760', fontSize: 18, lineHeight: 1, padding: 4 }}>X</button>
            </div>

            {/* Body modal */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px' }}>

              {/* Gatilho */}
              <div style={{ padding: '12px 14px', borderRadius: 8, marginBottom: 18, background: 'rgba(200,169,110,0.05)', border: '1px solid rgba(200,169,110,0.12)' }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(200,169,110,0.6)', marginBottom: 10 }}>
                  Artigo gatilho
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={F}>Pesquisar artigo da Biblioteca</label>
                  <ArtSearch
                    artigos={artigos}
                    value={form.triggerRef}
                    desc={form.triggerDesc && form.triggerRef ? form.triggerDesc : ''}
                    placeholder="Ref ou nome do artigo gatilho..."
                    onSelect={function(art) { setForm(function(f) { return Object.assign({}, f, { triggerRef: art.ref, triggerDesc: art.desc || '' }) }) }}
                  />
                </div>
                <div>
                  <label style={F}>Nota interna (opcional)</label>
                  <input value={form.nota} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { nota: e.target.value }) }) }} placeholder="ex: Confirmar diametro do sifao" style={I} />
                </div>
              </div>

              {/* Label complementos */}
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6a6760', marginBottom: 10 }}>
                Sugerir estes complementos
              </div>

              {/* Lista complementos */}
              {form.complementos.map(function(c, idx) {
                return (
                  <div key={idx} style={{ padding: '12px 14px', borderRadius: 8, marginBottom: 8, background: '#0f0f0e', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ marginBottom: 8 }}>
                      <label style={F}>Pesquisar artigo complemento</label>
                      <ArtSearch
                        artigos={artigos}
                        value={c.ref}
                        desc={c.desc && c.ref ? c.desc : ''}
                        placeholder="Ref ou nome do complemento..."
                        onSelect={function(art) {
                          updateComp(idx, 'ref', art.ref)
                          updateComp(idx, 'desc', art.desc || '')
                          updateComp(idx, 'price', art.price || '')
                          updateComp(idx, 'cat', art.cat || '')
                          updateComp(idx, 'sub', art.sub || '')
                          updateComp(idx, 'supplier', art.supplier || '')
                          updateComp(idx, 'link', art.link || '')
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ flex: '0 0 80px' }}>
                        <label style={F}>Preco EUR</label>
                        <input type="number" min="0" step="0.01" value={c.price} onChange={function(e) { updateComp(idx, 'price', e.target.value) }} placeholder="0.00" style={Object.assign({}, I, { fontSize: 12 })} />
                      </div>
                      <div style={{ flex: '0 0 60px' }}>
                        <label style={F}>Qty</label>
                        <input type="number" min="1" step="1" value={c.qty} onChange={function(e) { updateComp(idx, 'qty', e.target.value) }} style={Object.assign({}, I, { fontSize: 12 })} />
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 18 }} onClick={function() { updateComp(idx, 'obrigatorio', !c.obrigatorio) }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, flexShrink: 0, border: '1.5px solid ' + (c.obrigatorio ? '#c8a96e' : 'rgba(255,255,255,0.2)'), background: c.obrigatorio ? '#c8a96e' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                          {c.obrigatorio && <span style={{ color: '#0a0a09', fontSize: 8, fontWeight: 900 }}>v</span>}
                        </div>
                        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.obrigatorio ? 'rgba(200,169,110,0.7)' : '#4a4a48' }}>pre-seleccionado</span>
                      </div>
                      <button onClick={function() { removeComp(idx) }} style={{ marginTop: 18, background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a3a3a', fontSize: 16, padding: '8px 4px', lineHeight: 1, flexShrink: 0 }}>X</button>
                    </div>
                  </div>
                )
              })}

              <button onClick={addComp} style={{ width: '100%', padding: '9px 0', borderRadius: 6, background: 'transparent', border: '1px dashed rgba(255,255,255,0.1)', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4a4a48' }}>
                + Complemento
              </button>
            </div>
            </div>

            {/* Footer modal */}
            <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 10, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={function() { setModal(false) }} style={{ padding: '9px 20px', borderRadius: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6a6760', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ padding: '9px 24px', borderRadius: 6, background: saving ? 'rgba(200,169,110,0.3)' : 'linear-gradient(135deg,#c8a96e,#b8924a)', border: 'none', fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#0a0a09', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'A guardar...' : (editId ? 'Actualizar' : 'Criar bundle')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

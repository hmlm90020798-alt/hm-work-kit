import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { subscribeBundles, saveBundle, deleteBundle } from '../hooks/useBundles'

var F = { fontFamily: "Barlow Condensed", fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#9a9690", display: "block", marginBottom: 6 }
var I = { width: "100%", background: "#0f0f0e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "9px 12px", fontFamily: "Barlow", fontSize: 13, fontWeight: 300, color: "#e8e4dc", outline: "none", transition: "border-color .15s" }
var BUNDLE_VAZIO = { triggerRef: "", triggerDesc: "", complementos: [], nota: "" }
var COMP_VAZIO = { ref: "", desc: "", price: "", qty: 1, obrigatorio: true, cat: "", sub: "", supplier: "", link: "" }

function ArtSearch(props) {
  var artigos = props.artigos || []
  var onSelect = props.onSelect
  var placeholder = props.placeholder || "Pesquisar..."
  var q = props.value || ""
  var setQ = function() {}
  var stateQ = React.useState(q)
  var realQ = stateQ[0]
  var setRealQ = stateQ[1]
  var stateOpen = React.useState(false)
  var open = stateOpen[0]
  var setOpen = stateOpen[1]
  var stateFocus = React.useState(false)
  var focused = stateFocus[0]
  var setFocused = stateFocus[1]

  React.useEffect(function() { setRealQ(props.value || "") }, [props.value])

  var sugestoes = realQ.trim().length < 1 ? [] : artigos.filter(function(a) {
    var t = realQ.toLowerCase()
    return (a.ref && a.ref.toLowerCase().indexOf(t) >= 0) || (a.desc && a.desc.toLowerCase().indexOf(t) >= 0)
  }).slice(0, 8)

  return React.createElement("div", { style: { position: "relative", width: "100%" } },
    React.createElement("input", {
      value: realQ,
      onChange: function(e) { setRealQ(e.target.value); setOpen(true) },
      onFocus: function() { setFocused(true); setOpen(true) },
      onBlur: function() { setFocused(false); setTimeout(function() { setOpen(false) }, 150) },
      placeholder: placeholder,
      style: Object.assign({}, I, { borderColor: focused ? "rgba(200,169,110,0.4)" : "rgba(255,255,255,0.08)" })
    }),
    props.desc ? React.createElement("div", { style: { fontFamily: "Barlow Condensed", fontSize: 10, color: "#c8943a", marginTop: 4 } }, props.desc) : null,
    open && sugestoes.length > 0 ? React.createElement("div", {
      style: { position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#1a1a18", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, zIndex: 500, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.6)" }
    }, sugestoes.map(function(a) {
      return React.createElement("button", {
        key: a.id,
        onMouseDown: function() { setRealQ(a.ref); setOpen(false); onSelect(a) },
        style: { width: "100%", textAlign: "left", padding: "9px 12px", background: "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)" }
      },
        React.createElement("div", { style: { display: "flex", alignItems: "center", gap: 10 } },
          React.createElement("span", { style: { fontFamily: "Barlow Condensed", fontSize: 12, fontWeight: 700, color: "#c8943a", flexShrink: 0 } }, a.ref),
          React.createElement("span", { style: { fontFamily: "Barlow Condensed", fontSize: 11, color: "#9a9690", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, a.desc),
          a.price > 0 ? React.createElement("span", { style: { fontFamily: "Barlow Condensed", fontSize: 10, color: "#4a4a48", flexShrink: 0 } }, parseFloat(a.price).toFixed(2) + " EUR") : null
        )
      )
    })) : null
  )
}

export default function Bundles(props) {
  var showToast = props.showToast
  var sBundles = React.useState([])
  var bundles = sBundles[0]; var setBundles = sBundles[1]
  var sArtigos = React.useState([])
  var artigos = sArtigos[0]; var setArtigos = sArtigos[1]
  var sModal = React.useState(false)
  var modal = sModal[0]; var setModal = sModal[1]
  var sEditId = React.useState(null)
  var editId = sEditId[0]; var setEditId = sEditId[1]
  var sForm = React.useState(BUNDLE_VAZIO)
  var form = sForm[0]; var setForm = sForm[1]
  var sSearch = React.useState("")
  var search = sSearch[0]; var setSearch = sSearch[1]
  var sSaving = React.useState(false)
  var saving = sSaving[0]; var setSaving = sSaving[1]

  React.useEffect(function() {
    return subscribeBundles(setBundles, function() { showToast("Erro ao carregar bundles") })
  }, [])

  React.useEffect(function() {
    var unsub = onSnapshot(collection(db, "artigos"), function(snap) {
      setArtigos(snap.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()) }))
    }, function() {})
    return unsub
  }, [])

  function abrirNovo() {
    setEditId(null)
    setForm(Object.assign({}, BUNDLE_VAZIO, { complementos: [] }))
    setModal(true)
  }

  function abrirEditar(b) {
    setEditId(b.id)
    setForm({
      triggerRef: b.triggerRef || "", triggerDesc: b.triggerDesc || "",
      complementos: (b.complementos || []).map(function(c) { return Object.assign({}, c, { price: c.price != null ? c.price : "", qty: c.qty != null ? c.qty : 1 }) }),
      nota: b.nota || "",
    })
    setModal(true)
  }

  async function guardar() {
    if (!form.triggerRef.trim()) { showToast("Referencia obrigatoria"); return }
    if (!form.triggerDesc.trim()) { showToast("Descricao obrigatoria"); return }
    var compsValidos = form.complementos.filter(function(c) { return c.ref.trim() && c.desc.trim() })
    if (!compsValidos.length) { showToast("Adiciona pelo menos um complemento valido"); return }
    setSaving(true)
    try {
      await saveBundle({
        id: editId || undefined,
        triggerRef: form.triggerRef.trim(), triggerDesc: form.triggerDesc.trim(), nota: form.nota.trim(),
        complementos: compsValidos.map(function(c) {
          return { ref: c.ref.trim(), desc: c.desc.trim(), price: parseFloat(c.price) || 0, qty: parseInt(c.qty) || 1, obrigatorio: !!c.obrigatorio, cat: c.cat || "", sub: c.sub || "", supplier: c.supplier || "", link: c.link || "" }
        }),
      })
      showToast(editId ? "Bundle actualizado" : "Bundle criado")
      setModal(false)
    } catch(e) { showToast("Erro ao guardar") }
    finally { setSaving(false) }
  }

  async function eliminar(b) {
    if (!confirm("Eliminar bundle?")) return
    try { await deleteBundle(b.id); showToast("Bundle eliminado") }
    catch(e) { showToast("Erro ao eliminar") }
  }

  function addComp() { setForm(function(f) { return Object.assign({}, f, { complementos: f.complementos.concat([Object.assign({}, COMP_VAZIO)]) }) }) }
  function updateComp(idx, field, val) { setForm(function(f) { return Object.assign({}, f, { complementos: f.complementos.map(function(c, i) { return i === idx ? Object.assign({}, c, { [field]: val }) : c }) }) }) }
  function removeComp(idx) { setForm(function(f) { return Object.assign({}, f, { complementos: f.complementos.filter(function(_, i) { return i !== idx }) }) }) }

  var filtrados = bundles.filter(function(b) {
    var q = search.toLowerCase()
    return !q || (b.triggerRef && b.triggerRef.indexOf(q) >= 0) || (b.triggerDesc && b.triggerDesc.toLowerCase().indexOf(q) >= 0)
  })

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0a0a09" }}>
      <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <div style={{ fontFamily: "Barlow Condensed", fontSize: 17, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#e8e4dc" }}>Bundles</div>
        <div style={{ flex: 1 }} />
        <input value={search} onChange={function(e) { setSearch(e.target.value) }} placeholder="Pesquisar..." style={Object.assign({}, I, { width: 220, padding: "7px 12px", fontSize: 12 })} />
        <button onClick={abrirNovo} style={{ background: "linear-gradient(135deg,#c8a96e,#b8924a)", border: "none", borderRadius: 6, padding: "8px 16px", cursor: "pointer", fontFamily: "Barlow Condensed", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#0a0a09" }}>+ Bundle</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {filtrados.length === 0 && <div style={{ padding: "60px 0", textAlign: "center", color: "#3a3a38", fontFamily: "Barlow Condensed", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase" }}>{search ? "Sem resultados" : "Nenhum bundle criado"}</div>}
        {filtrados.map(function(b) {
          return (
            <div key={b.id} style={{ marginBottom: 8, borderRadius: 8, background: "#0f0f0e", border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "Barlow Condensed", fontSize: 13, fontWeight: 700, color: "#e8e4dc", marginBottom: 3 }}>{b.triggerDesc}</div>
                  <div style={{ fontFamily: "Barlow Condensed", fontSize: 10, color: "#c8943a" }}>{b.triggerRef} <span style={{ color: "#3a3a38" }}>{(b.complementos || []).length} complemento(s)</span></div>
                </div>
                <button onClick={function() { abrirEditar(b) }} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "Barlow Condensed", fontSize: 9, color: "#6a6760" }}>Editar</button>
                <button onClick={function() { eliminar(b) }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#4a3a3a", fontSize: 15, padding: "4px 6px" }}>X</button>
              </div>
              {(b.complementos || []).map(function(c, i) {
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 16px", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: c.obrigatorio ? "#c8a96e" : "#3a3a38", display: "inline-block" }} />
                    <span style={{ fontFamily: "Barlow Condensed", fontSize: 10, color: "#c8943a", fontWeight: 600, flexShrink: 0 }}>{c.ref}</span>
                    <span style={{ fontFamily: "Barlow Condensed", fontSize: 11, color: "#6a6760", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.desc}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: "#111110", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", width: "100%", maxWidth: 580, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <span style={{ fontFamily: "Barlow Condensed", fontSize: 14, fontWeight: 700, textTransform: "uppercase", color: "#e8e4dc" }}>{editId ? "Editar bundle" : "Novo bundle"}</span>
              <button onClick={function() { setModal(false) }} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6a6760", fontSize: 18 }}>X</button>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
              <div style={{ padding: "12px 14px", borderRadius: 8, marginBottom: 18, background: "rgba(200,169,110,0.05)", border: "1px solid rgba(200,169,110,0.12)" }}>
                <div style={{ fontFamily: "Barlow Condensed", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(200,169,110,0.6)", marginBottom: 10 }}>Artigo gatilho</div>
                <div style={{ marginBottom: 10 }}>
                  <label style={F}>Pesquisar artigo</label>
                  <ArtSearch artigos={artigos} value={form.triggerRef} desc={form.triggerDesc && form.triggerRef ? form.triggerDesc : ""} placeholder="Ref ou nome..." onSelect={function(art) { setForm(function(f) { return Object.assign({}, f, { triggerRef: art.ref, triggerDesc: art.desc || "" }) }) }} />
                </div>
                <div>
                  <label style={F}>Nota (opcional)</label>
                  <input value={form.nota} onChange={function(e) { setForm(function(f) { return Object.assign({}, f, { nota: e.target.value }) }) }} placeholder="ex: Confirmar diametro" style={I} />
                </div>
              </div>
              <div style={{ fontFamily: "Barlow Condensed", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "#6a6760", marginBottom: 10 }}>Complementos</div>
              {form.complementos.map(function(c, idx) {
                return (
                  <div key={idx} style={{ padding: "12px 14px", borderRadius: 8, marginBottom: 8, background: "#0f0f0e", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ marginBottom: 8 }}>
                      <label style={F}>Pesquisar complemento</label>
                      <ArtSearch artigos={artigos} value={c.ref} desc={c.desc && c.ref ? c.desc : ""} placeholder="Ref ou nome..." onSelect={function(art) { updateComp(idx, "ref", art.ref); updateComp(idx, "desc", art.desc || ""); updateComp(idx, "price", art.price || ""); updateComp(idx, "cat", art.cat || ""); updateComp(idx, "sub", art.sub || ""); updateComp(idx, "supplier", art.supplier || ""); updateComp(idx, "link", art.link || "") }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div><label style={F}>Preco</label><input type="number" min="0" step="0.01" value={c.price} onChange={function(e) { updateComp(idx, "price", e.target.value) }} style={Object.assign({}, I, { width: 80, fontSize: 12 })} /></div>
                      <div><label style={F}>Qty</label><input type="number" min="1" value={c.qty} onChange={function(e) { updateComp(idx, "qty", e.target.value) }} style={Object.assign({}, I, { width: 60, fontSize: 12 })} /></div>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginTop: 18 }} onClick={function() { updateComp(idx, "obrigatorio", !c.obrigatorio) }}>
                        <div style={{ width: 14, height: 14, borderRadius: 3, border: "1.5px solid " + (c.obrigatorio ? "#c8a96e" : "rgba(255,255,255,0.2)"), background: c.obrigatorio ? "#c8a96e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {c.obrigatorio && React.createElement("span", { style: { color: "#0a0a09", fontSize: 8, fontWeight: 900 } }, "v")}
                        </div>
                        <span style={{ fontFamily: "Barlow Condensed", fontSize: 9, textTransform: "uppercase", color: c.obrigatorio ? "rgba(200,169,110,0.7)" : "#4a4a48" }}>pre-seleccionado</span>
                      </div>
                      <button onClick={function() { removeComp(idx) }} style={{ marginTop: 18, background: "transparent", border: "none", cursor: "pointer", color: "#4a3a3a", fontSize: 16, flexShrink: 0 }}>X</button>
                    </div>
                  </div>
                )
              })}
              <button onClick={addComp} style={{ width: "100%", padding: "9px 0", borderRadius: 6, background: "transparent", border: "1px dashed rgba(255,255,255,0.1)", cursor: "pointer", fontFamily: "Barlow Condensed", fontSize: 10, textTransform: "uppercase", color: "#4a4a48" }}>+ Complemento</button>
            </div>
            </div>
            <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
              <button onClick={function() { setModal(false) }} style={{ padding: "9px 20px", borderRadius: 6, background: "transparent", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "Barlow Condensed", fontSize: 11, textTransform: "uppercase", color: "#6a6760", cursor: "pointer" }}>Cancelar</button>
              <button onClick={guardar} disabled={saving} style={{ padding: "9px 24px", borderRadius: 6, background: saving ? "rgba(200,169,110,0.3)" : "linear-gradient(135deg,#c8a96e,#b8924a)", border: "none", fontFamily: "Barlow Condensed", fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#0a0a09", cursor: "pointer" }}>
                {saving ? "A guardar..." : (editId ? "Actualizar" : "Criar bundle")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

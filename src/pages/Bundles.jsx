import React from 'react'
import { db } from '../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { subscribeBundles, saveBundle, deleteBundle } from '../hooks/useBundles'

var stBg = { display:"flex", flexDirection:"column", height:"100%", background:"#0a0a09" }
var stTopbar = { padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.05)", display:"flex", alignItems:"center", gap:12, flexShrink:0 }
var stTitle = { fontFamily:"Barlow Condensed,sans-serif", fontSize:17, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#e8e4dc" }
var stSub = { fontFamily:"Barlow Condensed,sans-serif", fontSize:9, letterSpacing:"0.14em", textTransform:"uppercase", color:"#6a6760" }
var stList = { flex:1, overflowY:"auto", padding:"16px 20px" }
var stEmpty = { padding:"60px 0", textAlign:"center", color:"#3a3a38", fontFamily:"Barlow Condensed,sans-serif", fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase" }
var stCard = { marginBottom:8, borderRadius:8, background:"#0f0f0e", border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }
var stCardHead = { display:"flex", alignItems:"center", gap:12, padding:"12px 16px" }
var stCardInfo = { flex:1 }
var stCardTitle = { fontFamily:"Barlow Condensed,sans-serif", fontSize:13, fontWeight:700, color:"#e8e4dc", marginBottom:3 }
var stCardRef = { fontFamily:"Barlow Condensed,sans-serif", fontSize:10, color:"#c8943a" }
var stCardCount = { color:"#3a3a38" }
var stBtnEdit = { background:"transparent", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontFamily:"Barlow Condensed,sans-serif", fontSize:9, color:"#6a6760" }
var stBtnDel = { background:"transparent", border:"none", cursor:"pointer", color:"#4a3a3a", fontSize:15, padding:"4px 6px" }
var stCompRow = { display:"flex", alignItems:"center", gap:10, padding:"7px 16px", borderTop:"1px solid rgba(255,255,255,0.03)" }
var stDot = { width:6, height:6, borderRadius:"50%", flexShrink:0, display:"inline-block" }
var stCompRef = { fontFamily:"Barlow Condensed,sans-serif", fontSize:10, color:"#c8943a", fontWeight:600, flexShrink:0 }
var stCompDesc = { fontFamily:"Barlow Condensed,sans-serif", fontSize:11, color:"#6a6760", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }
var stOverlay = { position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }
var stModal = { background:"#111110", borderRadius:10, border:"1px solid rgba(255,255,255,0.08)", width:"100%", maxWidth:580, maxHeight:"90vh", display:"flex", flexDirection:"column" }
var stModalHead = { padding:"16px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }
var stModalTitle = { fontFamily:"Barlow Condensed,sans-serif", fontSize:14, fontWeight:700, textTransform:"uppercase", color:"#e8e4dc" }
var stModalClose = { background:"transparent", border:"none", cursor:"pointer", color:"#6a6760", fontSize:18 }
var stModalBody = { flex:1, overflowY:"auto", padding:"18px 20px" }
var stModalFoot = { padding:"14px 20px", borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:10, justifyContent:"flex-end", flexShrink:0 }
var stGatilho = { padding:"12px 14px", borderRadius:8, marginBottom:18, background:"rgba(200,169,110,0.05)", border:"1px solid rgba(200,169,110,0.12)" }
var stGatilhoLabel = { fontFamily:"Barlow Condensed,sans-serif", fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"rgba(200,169,110,0.6)", marginBottom:10 }
var stSectionLabel = { fontFamily:"Barlow Condensed,sans-serif", fontSize:9, fontWeight:700, letterSpacing:"0.18em", textTransform:"uppercase", color:"#6a6760", marginBottom:10 }
var stCompCard = { padding:"12px 14px", borderRadius:8, marginBottom:8, background:"#0f0f0e", border:"1px solid rgba(255,255,255,0.06)" }
var stCompSearch = { marginBottom:8 }
var stCompActions = { display:"flex", gap:10, alignItems:"center" }
var stFieldLabel = { fontFamily:"Barlow Condensed,sans-serif", fontSize:11, fontWeight:600, letterSpacing:"0.16em", textTransform:"uppercase", color:"#9a9690", display:"block", marginBottom:6 }
var stInput = { width:"100%", background:"#0f0f0e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6, padding:"9px 12px", fontFamily:"Barlow,sans-serif", fontSize:13, fontWeight:300, color:"#e8e4dc", outline:"none" }
var stAddComp = { width:"100%", padding:"9px 0", borderRadius:6, background:"transparent", border:"1px dashed rgba(255,255,255,0.1)", cursor:"pointer", fontFamily:"Barlow Condensed,sans-serif", fontSize:10, textTransform:"uppercase", color:"#4a4a48" }
var stBtnCancel = { padding:"9px 20px", borderRadius:6, background:"transparent", border:"1px solid rgba(255,255,255,0.08)", fontFamily:"Barlow Condensed,sans-serif", fontSize:11, textTransform:"uppercase", color:"#6a6760", cursor:"pointer" }
var stBtnSave = { padding:"9px 24px", borderRadius:6, border:"none", fontFamily:"Barlow Condensed,sans-serif", fontSize:11, fontWeight:700, textTransform:"uppercase", color:"#0a0a09", cursor:"pointer" }
var stBtnAdd = { flexShrink:0, background:"linear-gradient(135deg,#c8a96e,#b8924a)", border:"none", borderRadius:6, padding:"8px 16px", cursor:"pointer", fontFamily:"Barlow Condensed,sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.14em", textTransform:"uppercase", color:"#0a0a09" }
var stSearch = { width:220, background:"#0f0f0e", border:"1px solid rgba(255,255,255,0.08)", borderRadius:6, padding:"7px 12px", fontFamily:"Barlow,sans-serif", fontSize:12, fontWeight:300, color:"#e8e4dc", outline:"none" }

var BUNDLE_VAZIO = { triggerRef:"", triggerDesc:"", complementos:[], nota:"" }
var COMP_VAZIO = { ref:"", desc:"", price:"", qty:1, obrigatorio:true, cat:"", sub:"", supplier:"", link:"" }

function ArtSearch(props) {
  var artigos = props.artigos || []
  var sq = React.useState(props.value || "")
  var q = sq[0]; var setQ = sq[1]
  var so = React.useState(false)
  var open = so[0]; var setOpen = so[1]
  var sf = React.useState(false)
  var focused = sf[0]; var setFocused = sf[1]

  React.useEffect(function() { setQ(props.value || "") }, [props.value])

  var sugestoes = q.trim().length < 1 ? [] : artigos.filter(function(a) {
    var t = q.toLowerCase()
    var inRef = a.ref && a.ref.toLowerCase().indexOf(t) >= 0
    var inDesc = a.desc && a.desc.toLowerCase().indexOf(t) >= 0
    return inRef || inDesc
  }).slice(0, 8)

  function selectArt(a) {
    setQ(a.ref)
    setOpen(false)
    props.onSelect(a)
  }

  var inputStyle = Object.assign({}, stInput, { borderColor: focused ? "rgba(200,169,110,0.4)" : "rgba(255,255,255,0.08)" })

  return React.createElement("div", { style:{ position:"relative", width:"100%" } },
    React.createElement("input", {
      value: q,
      onChange: function(e) { setQ(e.target.value); setOpen(true) },
      onFocus: function() { setFocused(true); setOpen(true) },
      onBlur: function() { setFocused(false); setTimeout(function() { setOpen(false) }, 150) },
      placeholder: props.placeholder || "Pesquisar...",
      style: inputStyle
    }),
    props.desc ? React.createElement("div", { style:{ fontFamily:"Barlow Condensed,sans-serif", fontSize:10, color:"#c8943a", marginTop:4 } }, props.desc) : null,
    open && sugestoes.length > 0 ? React.createElement("div", {
      style:{ position:"absolute", top:"calc(100% + 4px)", left:0, right:0, background:"#1a1a18", border:"1px solid rgba(255,255,255,0.1)", borderRadius:6, zIndex:500, overflow:"hidden", boxShadow:"0 8px 24px rgba(0,0,0,0.6)" }
    },
      sugestoes.map(function(a) {
        return React.createElement("button", {
          key: a.id,
          onMouseDown: function() { selectArt(a) },
          style:{ width:"100%", textAlign:"left", padding:"9px 12px", background:"transparent", border:"none", cursor:"pointer", borderBottom:"1px solid rgba(255,255,255,0.04)" }
        },
          React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:10 } },
            React.createElement("span", { style:{ fontFamily:"Barlow Condensed,sans-serif", fontSize:12, fontWeight:700, color:"#c8943a", flexShrink:0 } }, a.ref),
            React.createElement("span", { style:{ fontFamily:"Barlow Condensed,sans-serif", fontSize:11, color:"#9a9690", flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, a.desc),
            a.price > 0 ? React.createElement("span", { style:{ fontFamily:"Barlow Condensed,sans-serif", fontSize:10, color:"#4a4a48", flexShrink:0 } }, parseFloat(a.price).toFixed(2) + "EUR") : null
          )
        )
      })
    ) : null
  )
}

export default function Bundles(props) {
  var showToast = props.showToast

  var s1 = React.useState([]); var bundles = s1[0]; var setBundles = s1[1]
  var s2 = React.useState([]); var artigos = s2[0]; var setArtigos = s2[1]
  var s3 = React.useState(false); var modal = s3[0]; var setModal = s3[1]
  var s4 = React.useState(null); var editId = s4[0]; var setEditId = s4[1]
  var s5 = React.useState(BUNDLE_VAZIO); var form = s5[0]; var setForm = s5[1]
  var s6 = React.useState(""); var search = s6[0]; var setSearch = s6[1]
  var s7 = React.useState(false); var saving = s7[0]; var setSaving = s7[1]

  React.useEffect(function() {
    return subscribeBundles(setBundles, function() { showToast("Erro ao carregar bundles") })
  }, [])

  React.useEffect(function() {
    var unsub = onSnapshot(collection(db, "artigos"), function(snap) {
      setArtigos(snap.docs.map(function(d) { return Object.assign({ id:d.id }, d.data()) }))
    }, function() {})
    return unsub
  }, [])

  function abrirNovo() {
    setEditId(null)
    setForm(Object.assign({}, BUNDLE_VAZIO, { complementos:[] }))
    setModal(true)
  }

  function abrirEditar(b) {
    setEditId(b.id)
    setForm({
      triggerRef: b.triggerRef || "",
      triggerDesc: b.triggerDesc || "",
      complementos: (b.complementos || []).map(function(c) {
        return Object.assign({}, c, { price: c.price != null ? c.price : "", qty: c.qty != null ? c.qty : 1 })
      }),
      nota: b.nota || ""
    })
    setModal(true)
  }

  function guardar() {
    if (!form.triggerRef.trim()) { showToast("Referencia obrigatoria"); return }
    var validos = form.complementos.filter(function(c) { return c.ref.trim() && c.desc.trim() })
    if (!validos.length) { showToast("Adiciona pelo menos um complemento"); return }
    setSaving(true)
    var data = {
      id: editId || undefined,
      triggerRef: form.triggerRef.trim(),
      triggerDesc: form.triggerDesc.trim(),
      nota: form.nota.trim(),
      complementos: validos.map(function(c) {
        return { ref:c.ref.trim(), desc:c.desc.trim(), price:parseFloat(c.price)||0, qty:parseInt(c.qty)||1, obrigatorio:!!c.obrigatorio, cat:c.cat||"", sub:c.sub||"", supplier:c.supplier||"", link:c.link||"" }
      })
    }
    saveBundle(data).then(function() {
      showToast(editId ? "Bundle actualizado" : "Bundle criado")
      setModal(false)
      setSaving(false)
    }).catch(function() {
      showToast("Erro ao guardar")
      setSaving(false)
    })
  }

  function eliminar(b) {
    if (!confirm("Eliminar bundle?")) return
    deleteBundle(b.id).then(function() { showToast("Bundle eliminado") }).catch(function() { showToast("Erro ao eliminar") })
  }

  function addComp() {
    setForm(function(f) { return Object.assign({}, f, { complementos: f.complementos.concat([Object.assign({}, COMP_VAZIO)]) }) })
  }

  function updateComp(idx, field, val) {
    setForm(function(f) {
      var comps = f.complementos.map(function(c, i) { return i === idx ? Object.assign({}, c, { [field]:val }) : c })
      return Object.assign({}, f, { complementos:comps })
    })
  }

  function removeComp(idx) {
    setForm(function(f) {
      return Object.assign({}, f, { complementos: f.complementos.filter(function(_, i) { return i !== idx }) })
    })
  }

  function selectTrigger(art) {
    setForm(function(f) { return Object.assign({}, f, { triggerRef:art.ref, triggerDesc:art.desc||"" }) })
  }

  function selectComp(idx, art) {
    updateComp(idx, "ref", art.ref)
    updateComp(idx, "desc", art.desc||"")
    updateComp(idx, "price", art.price||"")
    updateComp(idx, "cat", art.cat||"")
    updateComp(idx, "sub", art.sub||"")
    updateComp(idx, "supplier", art.supplier||"")
    updateComp(idx, "link", art.link||"")
  }

  var filtrados = bundles.filter(function(b) {
    var q = search.toLowerCase()
    if (!q) return true
    return (b.triggerRef && b.triggerRef.indexOf(q) >= 0) || (b.triggerDesc && b.triggerDesc.toLowerCase().indexOf(q) >= 0)
  })

  return React.createElement("div", { style:stBg },

    React.createElement("div", { style:stTopbar },
      React.createElement("div", { style:stTitle }, "Bundles"),
      React.createElement("div", { style:stSub }, "Artigo principal para complementos automaticos"),
      React.createElement("div", { style:{ flex:1 } }),
      React.createElement("input", { value:search, onChange:function(e){setSearch(e.target.value)}, placeholder:"Pesquisar...", style:stSearch }),
      React.createElement("button", { onClick:abrirNovo, style:stBtnAdd }, "+ Bundle")
    ),

    React.createElement("div", { style:stList },
      filtrados.length === 0
        ? React.createElement("div", { style:stEmpty }, search ? "Sem resultados" : "Nenhum bundle criado")
        : filtrados.map(function(b) {
            return React.createElement("div", { key:b.id, style:stCard },
              React.createElement("div", { style:stCardHead },
                React.createElement("div", { style:stCardInfo },
                  React.createElement("div", { style:stCardTitle }, b.triggerDesc),
                  React.createElement("div", { style:stCardRef },
                    b.triggerRef,
                    React.createElement("span", { style:stCardCount }, " " + (b.complementos||[]).length + " complemento(s)")
                  )
                ),
                React.createElement("button", { onClick:function(){abrirEditar(b)}, style:stBtnEdit }, "Editar"),
                React.createElement("button", { onClick:function(){eliminar(b)}, style:stBtnDel }, "X")
              ),
              (b.complementos||[]).map(function(c, i) {
                return React.createElement("div", { key:i, style:stCompRow },
                  React.createElement("span", { style:Object.assign({}, stDot, { background: c.obrigatorio ? "#c8a96e" : "#3a3a38" }) }),
                  React.createElement("span", { style:stCompRef }, c.ref),
                  React.createElement("span", { style:stCompDesc }, c.desc)
                )
              })
            )
          })
    ),

    modal ? React.createElement("div", { style:stOverlay },
      React.createElement("div", { style:stModal },

        React.createElement("div", { style:stModalHead },
          React.createElement("span", { style:stModalTitle }, editId ? "Editar bundle" : "Novo bundle"),
          React.createElement("button", { onClick:function(){setModal(false)}, style:stModalClose }, "X")
        ),

        React.createElement("div", { style:stModalBody },

          React.createElement("div", { style:stGatilho },
            React.createElement("div", { style:stGatilhoLabel }, "Artigo gatilho"),
            React.createElement("div", { style:stCompSearch },
              React.createElement("label", { style:stFieldLabel }, "Pesquisar artigo"),
              React.createElement(ArtSearch, { artigos:artigos, value:form.triggerRef, desc:form.triggerDesc && form.triggerRef ? form.triggerDesc : "", placeholder:"Ref ou nome...", onSelect:selectTrigger })
            ),
            React.createElement("div", null,
              React.createElement("label", { style:stFieldLabel }, "Nota (opcional)"),
              React.createElement("input", { value:form.nota, onChange:function(e){setForm(function(f){return Object.assign({},f,{nota:e.target.value})})}, placeholder:"ex: Confirmar diametro", style:stInput })
            )
          ),

          React.createElement("div", { style:stSectionLabel }, "Complementos"),

          form.complementos.map(function(c, idx) {
            return React.createElement("div", { key:idx, style:stCompCard },
              React.createElement("div", { style:stCompSearch },
                React.createElement("label", { style:stFieldLabel }, "Pesquisar complemento"),
                React.createElement(ArtSearch, { artigos:artigos, value:c.ref, desc:c.desc && c.ref ? c.desc : "", placeholder:"Ref ou nome...", onSelect:function(art){ selectComp(idx, art) } })
              ),
              React.createElement("div", { style:stCompActions },
                React.createElement("div", null,
                  React.createElement("label", { style:stFieldLabel }, "Preco"),
                  React.createElement("input", { type:"number", min:"0", step:"0.01", value:c.price, onChange:function(e){updateComp(idx,"price",e.target.value)}, style:Object.assign({},stInput,{width:80,fontSize:12}) })
                ),
                React.createElement("div", null,
                  React.createElement("label", { style:stFieldLabel }, "Qty"),
                  React.createElement("input", { type:"number", min:"1", value:c.qty, onChange:function(e){updateComp(idx,"qty",e.target.value)}, style:Object.assign({},stInput,{width:60,fontSize:12}) })
                ),
                React.createElement("div", {
                  style:{ flex:1, display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginTop:18 },
                  onClick:function(){updateComp(idx,"obrigatorio",!c.obrigatorio)}
                },
                  React.createElement("div", {
                    style:{ width:14, height:14, borderRadius:3, border:"1.5px solid " + (c.obrigatorio ? "#c8a96e" : "rgba(255,255,255,0.2)"), background: c.obrigatorio ? "#c8a96e" : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }
                  }, c.obrigatorio ? React.createElement("span", { style:{ color:"#0a0a09", fontSize:8, fontWeight:900 } }, "v") : null),
                  React.createElement("span", { style:{ fontFamily:"Barlow Condensed,sans-serif", fontSize:9, textTransform:"uppercase", color: c.obrigatorio ? "rgba(200,169,110,0.7)" : "#4a4a48" } }, "pre-seleccionado")
                ),
                React.createElement("button", { onClick:function(){removeComp(idx)}, style:{ marginTop:18, background:"transparent", border:"none", cursor:"pointer", color:"#4a3a3a", fontSize:16, flexShrink:0 } }, "X")
              )
            )
          }),

          React.createElement("button", { onClick:addComp, style:stAddComp }, "+ Complemento")
        ),

        React.createElement("div", { style:stModalFoot },
          React.createElement("button", { onClick:function(){setModal(false)}, style:stBtnCancel }, "Cancelar"),
          React.createElement("button", {
            onClick:guardar,
            disabled:saving,
            style:Object.assign({}, stBtnSave, { background: saving ? "rgba(200,169,110,0.3)" : "linear-gradient(135deg,#c8a96e,#b8924a)", opacity: saving ? 0.6 : 1 })
          }, saving ? "A guardar..." : (editId ? "Actualizar" : "Criar bundle"))
        )
      )
    ) : null
  )
}

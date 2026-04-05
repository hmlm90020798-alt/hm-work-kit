import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'

const TIPOS_FURO_DEFAULT = [
  { id:'placa',     label:'Furo placa',      preco:25 },
  { id:'lavalouça', label:'Furo lava-loiça', preco:30 },
  { id:'torneira',  label:'Furo torneira',   preco:20 },
  { id:'sifao',     label:'Furo sifão',      preco:20 },
  { id:'outro',     label:'Outro',           preco:15 },
]

function uuid() { return Math.random().toString(36).slice(2,9) }

export default function Tampos({ showToast }) {
  const [calculos, setCalculos]   = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [tiposFuro, setTiposFuro] = useState(TIPOS_FURO_DEFAULT)
  const [view, setView]           = useState('list') // list | calc | config
  const [current, setCurrent]     = useState(null)
  const [configModal, setConfigModal] = useState(false)
  const [exportModal, setExportModal] = useState(false)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'tampos_calculos'), snap => setCalculos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'orcamentos'), snap => setOrcamentos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u3 = onSnapshot(doc(db,'config','tiposFuro'), snap => {
      if (snap.exists()) setTiposFuro(snap.data().lista || TIPOS_FURO_DEFAULT)
    })
    return () => { u1(); u2(); u3() }
  }, [])

  const novoCalculo = () => {
    setCurrent({
      id: null,
      nome: '',
      material: '',
      modelo: '',
      precoPorM2: 0,
      precoRodaM: 0,
      segmentos: [{ id:uuid(), comp:0, larg:0.6, label:'Bancada 1' }],
      rodaMetros: 0,
      furos: [],
      notas: '',
    })
    setView('calc')
  }

  const abrirCalculo = (c) => { setCurrent({...c}); setView('calc') }

  const delCalculo = async (id, nome) => {
    if (!confirm('Eliminar "'+nome+'"?')) return
    await deleteDoc(doc(db,'tampos_calculos',id))
    showToast('Eliminado')
  }

  const saveCalculo = async () => {
    if (!current.nome.trim()) { showToast('Nome obrigatório'); return }
    const data = { ...current }
    delete data.id
    if (current.id) {
      await setDoc(doc(db,'tampos_calculos',current.id), data)
      showToast('Guardado')
    } else {
      const ref = await addDoc(collection(db,'tampos_calculos'), data)
      setCurrent(c => ({...c, id:ref.id}))
      showToast('Cálculo guardado')
    }
  }

  const exportarParaOrc = async (orcId) => {
    const orc = orcamentos.find(o=>o.id===orcId)
    if (!orc) return
    const res = calcResultado(current)
    const items = [...(orc.items||[])]
    const addItem = (desc, preco, qty=1) => {
      const id = 'tampo_'+uuid()
      items.push({ artId:id, ref:'TAMPO', desc, cat:'Tampos', price:preco, qty })
    }
    if (res.totalM2 > 0) addItem(`Tampo ${current.material} ${current.modelo} — ${res.totalM2.toFixed(3)} m²`, current.precoPorM2, res.totalM2)
    if (current.rodaMetros > 0) addItem(`Rodatampo — ${current.rodaMetros} ml`, current.precoRodaM, current.rodaMetros)
    current.furos.forEach(f => {
      if (f.qty > 0) addItem(`${f.label} (×${f.qty})`, f.preco, f.qty)
    })
    await setDoc(doc(db,'orcamentos',orcId), {...orc, items})
    showToast('Exportado para "'+orc.name+'"')
    setExportModal(false)
  }

  const saveTiposFuro = async (lista) => {
    await setDoc(doc(db,'config','tiposFuro'), { lista })
    setTiposFuro(lista)
    showToast('Tipos de furo guardados')
  }

  if (view==='calc' && current) {
    return <Calculadora
      current={current} setCurrent={setCurrent}
      tiposFuro={tiposFuro}
      onSave={saveCalculo}
      onBack={() => setView('list')}
      onExport={() => setExportModal(true)}
      onConfig={() => setConfigModal(true)}
      showToast={showToast}
      exportModal={exportModal} setExportModal={setExportModal}
      orcamentos={orcamentos} exportarParaOrc={exportarParaOrc}
      configModal={configModal} setConfigModal={setConfigModal}
      tiposFuroState={tiposFuro} saveTiposFuro={saveTiposFuro}
    />
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>
          Tampos <span style={{ fontSize:9, color:'var(--text3)', marginLeft:8 }}>{calculos.length}</span>
        </span>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={() => setConfigModal(true)} className="btn btn-outline" style={{ height:30, padding:'0 12px', fontSize:9 }}>Furos</button>
          <button onClick={novoCalculo} className="btn btn-gold" style={{ height:30, padding:'0 14px', fontSize:9 }}>+ Cálculo</button>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        {calculos.length===0 && (
          <div style={{ padding:'60px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text3)' }}>
            Nenhum cálculo guardado
          </div>
        )}
        {calculos.map(c => {
          const res = calcResultado(c)
          return (
            <div key={c.id} style={{ padding:'18px 20px', borderBottom:'1px solid var(--line)', display:'flex', alignItems:'center', gap:12 }}>
              <div onClick={() => abrirCalculo(c)} style={{ flex:1, cursor:'pointer' }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:16, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)', marginBottom:4 }}>{c.nome}</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {c.material && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text3)' }}>{c.material} {c.modelo}</span>}
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)' }}>{res.totalM2.toFixed(3)} m²</span>
                  {res.total>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--gold2)' }}>{res.total.toFixed(2)} €</span>}
                </div>
              </div>
              <button onClick={() => delCalculo(c.id,c.nome)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
            </div>
          )
        })}
      </div>

      <ConfigFurosModal open={configModal} tipos={tiposFuro} onSave={saveTiposFuro} onClose={() => setConfigModal(false)} />
    </div>
  )
}

// ── Calculadora ────────────────────────────────────────────────────────────
function Calculadora({ current, setCurrent, tiposFuro, onSave, onBack, onExport, showToast, exportModal, setExportModal, orcamentos, exportarParaOrc, configModal, setConfigModal, tiposFuroState, saveTiposFuro }) {

  const upd = (key, val) => setCurrent(c => ({...c, [key]:val}))

  const addSegmento = () => {
    const n = current.segmentos.length + 1
    upd('segmentos', [...current.segmentos, { id:uuid(), comp:0, larg:0.6, label:'Bancada '+n }])
  }

  const updSeg = (id, key, val) => {
    upd('segmentos', current.segmentos.map(s => s.id===id ? {...s, [key]:val} : s))
  }

  const delSeg = (id) => {
    if (current.segmentos.length===1) { showToast('Mínimo 1 segmento'); return }
    upd('segmentos', current.segmentos.filter(s => s.id!==id))
  }

  const toggleFuro = (tf) => {
    const exists = current.furos.find(f => f.id===tf.id)
    if (exists) upd('furos', current.furos.filter(f => f.id!==tf.id))
    else upd('furos', [...current.furos, { ...tf, qty:1 }])
  }

  const updFuroQty = (id, qty) => {
    upd('furos', current.furos.map(f => f.id===id ? {...f, qty:Math.max(1,parseInt(qty)||1)} : f))
  }

  const updFuroPreco = (id, preco) => {
    upd('furos', current.furos.map(f => f.id===id ? {...f, preco:parseFloat(preco)||0} : f))
  }

  const res = calcResultado(current)

  const S = { // estilos reutilizáveis
    label: { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text2)', display:'block', marginBottom:8 },
    input: { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:14, fontWeight:300, color:'var(--text)', outline:'none', transition:'border-color .15s' },
    numInput: { background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'6px 0', fontFamily:"'Barlow Condensed'", fontSize:15, color:'var(--text)', outline:'none', textAlign:'right', width:'100%' },
    section: { padding:'20px 20px 0' },
    sectionTitle: { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--text3)', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' },
  }

  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* BARRA */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>
          ← Tampos
        </button>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={onExport} className="btn btn-outline" style={{ height:30, padding:'0 12px', fontSize:9 }}>↗ Orçamento</button>
          <button onClick={onSave} className="btn btn-gold" style={{ height:30, padding:'0 14px', fontSize:9 }}>Guardar</button>
        </div>
      </div>

      {/* TOTAL FIXO */}
      <div style={{ padding:'12px 20px', background:'var(--bg)', borderBottom:'1px solid var(--line)', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:20 }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)', marginBottom:2 }}>Área total</div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:600, color:'var(--text)' }}>{res.totalM2.toFixed(3)} m²</div>
          </div>
          {current.rodaMetros>0 && (
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)', marginBottom:2 }}>Rodatampo</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:600, color:'var(--text)' }}>{parseFloat(current.rodaMetros||0).toFixed(2)} ml</div>
            </div>
          )}
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)', marginBottom:2 }}>Total estimado</div>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:700, color:'var(--gold)' }}>{res.total.toFixed(2)} €</div>
        </div>
      </div>

      {/* SCROLL */}
      <div style={{ flex:1, overflowY:'auto' }}>

        {/* IDENTIFICAÇÃO */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Identificação</div>
          <div style={{ marginBottom:16 }}>
            <label style={S.label}>Nome / Referência</label>
            <input value={current.nome} onChange={e=>upd('nome',e.target.value)} placeholder="ex: Cozinha Apt. Lisboa" style={S.input} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
            <div>
              <label style={S.label}>Material</label>
              <input value={current.material} onChange={e=>upd('material',e.target.value)} placeholder="ex: Silestone" style={S.input} />
            </div>
            <div>
              <label style={S.label}>Modelo / Cor</label>
              <input value={current.modelo} onChange={e=>upd('modelo',e.target.value)} placeholder="ex: Eternal Calacatta" style={S.input} />
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, paddingBottom:20, borderBottom:'1px solid var(--line)' }}>
            <div>
              <label style={S.label}>Preço / m² (€)</label>
              <input type="number" value={current.precoPorM2||''} onChange={e=>upd('precoPorM2',parseFloat(e.target.value)||0)} placeholder="0.00" step="0.01" min="0" style={S.numInput} />
            </div>
            <div>
              <label style={S.label}>Preço rodatampo / ml (€)</label>
              <input type="number" value={current.precoRodaM||''} onChange={e=>upd('precoRodaM',parseFloat(e.target.value)||0)} placeholder="0.00" step="0.01" min="0" style={S.numInput} />
            </div>
          </div>
        </div>

        {/* SEGMENTOS */}
        <div style={S.section}>
          <div style={S.sectionTitle}>
            <span>Segmentos de bancada</span>
            <button onClick={addSegmento} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gold)' }}>+ Segmento</button>
          </div>
          {current.segmentos.map((seg, idx) => (
            <div key={seg.id} style={{ marginBottom:16, padding:'14px', background:'var(--bg3)', borderLeft:'2px solid var(--line2)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <input value={seg.label} onChange={e=>updSeg(seg.id,'label',e.target.value)}
                  style={{ background:'transparent', border:'none', fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text2)', outline:'none', flex:1 }} />
                {current.segmentos.length>1 && (
                  <button onClick={()=>delSeg(seg.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>✕</button>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                <div>
                  <label style={{...S.label, fontSize:8}}>Comp. (mm)</label>
                  <input type="number" value={seg.comp||''} onChange={e=>updSeg(seg.id,'comp',parseFloat(e.target.value)||0)} placeholder="2400" min="0" style={S.numInput} />
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--text3)', marginTop:3, textAlign:'right' }}>{(seg.comp/1000).toFixed(3)} m</div>
                </div>
                <div>
                  <label style={{...S.label, fontSize:8}}>Larg. (mm)</label>
                  <input type="number" value={seg.larg||''} onChange={e=>updSeg(seg.id,'larg',parseFloat(e.target.value)||0)} placeholder="600" min="0" style={S.numInput} />
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--text3)', marginTop:3, textAlign:'right' }}>{(seg.larg/1000).toFixed(3)} m</div>
                </div>
                <div>
                  <label style={{...S.label, fontSize:8}}>Área (m²)</label>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:600, color:'var(--gold)', textAlign:'right', paddingTop:10 }}>
                    {((seg.comp/1000)*(seg.larg/1000)).toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* subtotal segmentos */}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'1px solid var(--line)', marginBottom:4 }}>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>Total área</span>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:600, color:'var(--text)' }}>{res.totalM2.toFixed(4)} m²</span>
          </div>
          {current.precoPorM2>0 && (
            <div style={{ display:'flex', justifyContent:'space-between', paddingBottom:16, borderBottom:'1px solid var(--line)' }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>{res.totalM2.toFixed(3)} m² × {current.precoPorM2} €</span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--gold2)' }}>{res.custoTampo.toFixed(2)} €</span>
            </div>
          )}
        </div>

        {/* RODATAMPO */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Rodatampo</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, paddingBottom:20, borderBottom:'1px solid var(--line)' }}>
            <div>
              <label style={S.label}>Metros lineares</label>
              <input type="number" value={current.rodaMetros||''} onChange={e=>upd('rodaMetros',parseFloat(e.target.value)||0)} placeholder="0.00" step="0.01" min="0" style={S.numInput} />
            </div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'flex-end' }}>
              {current.rodaMetros>0 && current.precoRodaM>0 && (
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--gold2)', paddingBottom:6 }}>
                  {(current.rodaMetros*current.precoRodaM).toFixed(2)} €
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FUROS */}
        <div style={S.section}>
          <div style={S.sectionTitle}>
            <span>Furos</span>
            <button onClick={()=>setConfigModal(true)} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text3)' }}>configurar</button>
          </div>
          {tiposFuro.map(tf => {
            const active = current.furos.find(f=>f.id===tf.id)
            return (
              <div key={tf.id} style={{ borderBottom:'1px solid var(--line)' }}>
                <div style={{ display:'flex', alignItems:'center', padding:'12px 0', gap:12 }}>
                  {/* toggle */}
                  <div onClick={() => toggleFuro(tf)} style={{ width:32, height:20, borderRadius:10, background: active?'var(--gold)':'var(--line2)', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                    <div style={{ position:'absolute', top:3, left: active?13:3, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
                  </div>
                  <span style={{ flex:1, fontFamily:"'Barlow Condensed'", fontSize:12, letterSpacing:'0.06em', color: active?'var(--text)':'var(--text2)' }}>{tf.label}</span>
                  {!active && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text3)' }}>{tf.preco} €/un</span>}
                </div>
                {active && (
                  <div style={{ display:'flex', gap:16, paddingBottom:12, paddingLeft:44 }}>
                    <div>
                      <label style={{...S.label, fontSize:8}}>Quantidade</label>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <button onClick={()=>updFuroQty(tf.id,(active.qty||1)-1)} style={{ width:26, height:26, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:16, color:'var(--text)', minWidth:24, textAlign:'center' }}>{active.qty||1}</span>
                        <button onClick={()=>updFuroQty(tf.id,(active.qty||1)+1)} style={{ width:26, height:26, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                      </div>
                    </div>
                    <div>
                      <label style={{...S.label, fontSize:8}}>Preço / un (€)</label>
                      <input type="number" value={active.preco||0} onChange={e=>updFuroPreco(tf.id,e.target.value)} step="0.01" min="0"
                        style={{ width:72, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'4px 0', fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--text)', outline:'none', textAlign:'right' }} />
                    </div>
                    <div style={{ display:'flex', alignItems:'flex-end', marginLeft:'auto' }}>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--gold2)', paddingBottom:4 }}>{((active.preco||0)*(active.qty||1)).toFixed(2)} €</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
          <div style={{ height:16 }} />
        </div>

        {/* NOTAS */}
        <div style={{ padding:'0 20px 32px' }}>
          <div style={S.sectionTitle}>Notas</div>
          <textarea value={current.notas||''} onChange={e=>upd('notas',e.target.value)} placeholder="Observações, acabamentos, referências adicionais…"
            style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none', resize:'none', minHeight:60 }} />
        </div>

      </div>
    </div>

    {/* MODAL EXPORTAR */}
    <div className={`overlay ${exportModal?'open':''}`}>
      <div className="modal">
        <div className="modal-head">
          Exportar para orçamento
          <button className="modal-close" onClick={()=>setExportModal(false)}>✕</button>
        </div>
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', marginBottom:16 }}>
          Selecciona o orçamento de destino
        </div>
        {orcamentos.length===0 && (
          <div style={{ padding:'20px 0', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>Nenhum orçamento disponível</div>
        )}
        {orcamentos.map(o => (
          <div key={o.id} onClick={()=>exportarParaOrc(o.id)}
            style={{ padding:'16px 0', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)' }}>{o.name}</div>
              {o.cliente && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)', marginTop:2 }}>{o.cliente}</div>}
            </div>
            <span style={{ color:'var(--gold)', fontFamily:"'Barlow Condensed'", fontSize:11 }}>→</span>
          </div>
        ))}
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={()=>setExportModal(false)}>Cancelar</button>
        </div>
      </div>
    </div>

    {/* MODAL CONFIG FUROS */}
    <ConfigFurosModal open={configModal} tipos={tiposFuroState} onSave={saveTiposFuro} onClose={()=>setConfigModal(false)} />
    </>
  )
}

// ── Cálculo resultado ──────────────────────────────────────────────────────
function calcResultado(c) {
  const totalM2 = (c.segmentos||[]).reduce((s,seg) => s + (seg.comp/1000)*(seg.larg/1000), 0)
  const custoTampo = totalM2 * (c.precoPorM2||0)
  const custoRoda  = (c.rodaMetros||0) * (c.precoRodaM||0)
  const custoFuros = (c.furos||[]).reduce((s,f) => s + (f.preco||0)*(f.qty||1), 0)
  return { totalM2, custoTampo, custoRoda, custoFuros, total: custoTampo+custoRoda+custoFuros }
}

// ── Config Furos Modal ─────────────────────────────────────────────────────
function ConfigFurosModal({ open, tipos, onSave, onClose }) {
  const [lista, setLista] = useState(tipos)
  useEffect(() => setLista(tipos), [tipos, open])

  const upd = (id, key, val) => setLista(l => l.map(t => t.id===id ? {...t,[key]:val} : t))
  const add = () => setLista(l => [...l, { id:uuid(), label:'Novo furo', preco:0 }])
  const rem = (id) => setLista(l => l.filter(t => t.id!==id))

  return (
    <div className={`overlay ${open?'open':''}`}>
      <div className="modal">
        <div className="modal-head">
          Tipos de furo
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div style={{ maxHeight:'50vh', overflowY:'auto', marginBottom:16 }}>
          {lista.map(t => (
            <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid var(--line)' }}>
              <input value={t.label} onChange={e=>upd(t.id,'label',e.target.value)}
                style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'4px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none' }} />
              <input type="number" value={t.preco||0} onChange={e=>upd(t.id,'preco',parseFloat(e.target.value)||0)}
                style={{ width:60, background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'4px 0', fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--text)', outline:'none', textAlign:'right' }} />
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--text3)' }}>€</span>
              <button onClick={()=>rem(t.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={add} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--gold)' }}>+ Tipo de furo</button>
        <div className="modal-actions">
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-gold" onClick={()=>onSave(lista)}>Guardar</button>
        </div>
      </div>
    </div>
  )
}

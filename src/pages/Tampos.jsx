import React, { useState, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc } from 'firebase/firestore'

// ── Dados ANIGRACO embutidos ───────────────────────────────────────────────
const ANIGRACO = {
  GRANITOS: {
    materiais: [
      { desc:'VERDE LAVRADOR',   espessuras:{ '2cm':{c1:27022,pvp:475}, '3cm':{c1:29444,pvp:517} } },
      { desc:'NEGRO ZIMBABWE',   espessuras:{ '2cm':{c1:26656,pvp:468}, '3cm':{c1:29912,pvp:526} } },
      { desc:'AZUL LAVRADOR',    espessuras:{ '2cm':{c1:24132,pvp:424}, '3cm':{c1:30889,pvp:543} } },
      { desc:'SHIVAKASHY',       espessuras:{ '2cm':{c1:21599,pvp:380}, '3cm':{c1:28679,pvp:504} } },
      { desc:'PATAS DE GATO',    espessuras:{ '2cm':{c1:19261,pvp:338}, '3cm':{c1:25041,pvp:440} } },
      { desc:'NEGRO ANGOLA',     espessuras:{ '2cm':{c1:16218,pvp:285}, '3cm':{c1:19975,pvp:351} } },
      { desc:'NEGRO IMPALA',     espessuras:{ '2cm':{c1:14476,pvp:254}, '3cm':{c1:20579,pvp:362} } },
      { desc:'AMARELO FIGUEIRA', espessuras:{ '2cm':{c1:11407,pvp:200}, '3cm':{c1:12365,pvp:217} } },
      { desc:'AMARELO MACIEIRA', espessuras:{ '2cm':{c1:10651,pvp:187}, '3cm':{c1:11713,pvp:206} } },
      { desc:'AMARELO VIMIEIRO', espessuras:{ '2cm':{c1:12551,pvp:221}, '3cm':{c1:13613,pvp:239} } },
      { desc:'BRANCO CORAL',     espessuras:{ '2cm':{c1:10651,pvp:187}, '3cm':{c1:11713,pvp:206} } },
      { desc:'CINZA EVORA',      espessuras:{ '2cm':{c1:14551,pvp:256}, '3cm':{c1:15613,pvp:274} } },
      { desc:'PEDRAS SALGADAS',  espessuras:{ '2cm':{c1:12551,pvp:221}, '3cm':{c1:13613,pvp:239} } },
      { desc:'CINZA PENALVA',    espessuras:{ '2cm':{c1:8874,pvp:156},  '3cm':{c1:10999,pvp:193} } },
      { desc:'CINZA ANTAS',      espessuras:{ '2cm':{c1:8874,pvp:156},  '3cm':{c1:10999,pvp:193} } },
      { desc:'CINZA PINHEL',     espessuras:{ '2cm':{c1:8874,pvp:156},  '3cm':{c1:10617,pvp:187} } },
      { desc:'ROSA PORRINHO',    espessuras:{ '2cm':{c1:8874,pvp:156},  '3cm':{c1:10141,pvp:178} } },
      { desc:'ROSA MONÇÃO',      espessuras:{ '2cm':{c1:8874,pvp:156},  '3cm':{c1:10141,pvp:178} } },
    ],
    acabamentos: [
      { nome:'RODATAMPO',              c1:1160, pvp:21,  unidade:'ml' },
      { nome:'CORTE BRUTO',            c1:1260, pvp:23,  unidade:'un' },
      { nome:'REBAIXO À FACE',         c1:4410, pvp:80,  unidade:'un' },
      { nome:'TRANSFORMAÇÃO POLIDO',   c1:3500, pvp:56,  unidade:'un' },
      { nome:'FURO',                   c1:950,  pvp:17,  unidade:'un' },
      { nome:'CORTE 1/2 ESQUADRIA',    c1:2310, pvp:47,  unidade:'un' },
    ]
  },
  SILESTONES: {
    materiais: [
      { desc:'LINEN CREAM',      espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'MOTION GREY',      espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'MIAMI WHITE',      espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'LIME DELIGHT',     espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'PERSIAN WHITE',    espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'SIBERIAN',         espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'LAGOON',           espessuras:{ '2cm':{c1:20272,pvp:356}, '1.2cm':{c1:17872,pvp:314} } },
      { desc:'BLANCO MAPLE 14',  espessuras:{ '2cm':{c1:23064,pvp:405} } },
      { desc:'BLANCO NORTE 14',  espessuras:{ '2cm':{c1:23064,pvp:405} } },
      { desc:'WHITE STORM 14',   espessuras:{ '2cm':{c1:23064,pvp:405} } },
      { desc:'GRIS EXPO',        espessuras:{ '2cm':{c1:23064,pvp:405} } },
      { desc:'MIAMI WHITE 17',   espessuras:{ '2cm':{c1:26784,pvp:471} } },
      { desc:'MIAMI VENA',       espessuras:{ '2cm':{c1:29672,pvp:521} } },
    ],
    acabamentos: [
      { nome:'RODATAMPO',             c1:1320, pvp:24,  unidade:'ml' },
      { nome:'CORTE BRUTO',           c1:1260, pvp:23,  unidade:'un' },
      { nome:'REBAIXO À FACE',        c1:4410, pvp:80,  unidade:'un' },
      { nome:'TRANSFORMAÇÃO POLIDO',  c1:35,   pvp:56,  unidade:'un' },
      { nome:'FURO',                  c1:950,  pvp:17,  unidade:'un' },
      { nome:'CORTE 1/2 ESQUADRIA',   c1:2310, pvp:47,  unidade:'un' },
      { nome:'SILICONE',              c1:10,   pvp:18,  unidade:'un' },
    ]
  },
  COMPAC: {
    materiais: [
      { desc:'GLACIAR',    espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'LUNA',       espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'ALASKA',     espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'ARENA',      espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'CENIZA',     espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'PLOMO',      espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'NOCTURNO',   espessuras:{ '2cm':{c1:20856,pvp:366} } },
      { desc:'SNOW',       espessuras:{ '2cm':{c1:24512,pvp:431} } },
      { desc:'MOON',       espessuras:{ '2cm':{c1:24512,pvp:431} } },
      { desc:'SMOKE GREY', espessuras:{ '2cm':{c1:24512,pvp:431} } },
    ],
    acabamentos: [
      { nome:'RODATAMPO',             c1:1320, pvp:24,  unidade:'ml' },
      { nome:'CORTE BRUTO',           c1:1260, pvp:26,  unidade:'un' },
      { nome:'REBAIXO À FACE',        c1:4410, pvp:90,  unidade:'un' },
      { nome:'TRANSFORMAÇÃO POLIDO',  c1:35,   pvp:56,  unidade:'un' },
      { nome:'FURO',                  c1:950,  pvp:19,  unidade:'un' },
      { nome:'CORTE 1/2 ESQUADRIA',   c1:2310, pvp:47,  unidade:'un' },
      { nome:'SILICONE',              c1:10,   pvp:18,  unidade:'un' },
    ]
  },
  DEKTON: {
    materiais: [
      { desc:'KEENA',      espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'MARINA',     espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'THALA',      espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'EVOK',       espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'NACRE',      espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'ARGENTIUM',  espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'KELYA',      espessuras:{ '2cm':{c1:26584,pvp:467}, '1.2cm':{c1:21952,pvp:386} } },
      { desc:'MONNÉ KC',   espessuras:{ '2cm':{c1:30320,pvp:533}, '1.2cm':{c1:25792,pvp:453} } },
      { desc:'LUNAR 22 KC',espessuras:{ '2cm':{c1:30320,pvp:533}, '1.2cm':{c1:25792,pvp:453} } },
      { desc:'AERIS KC',   espessuras:{ '2cm':{c1:30320,pvp:533}, '1.2cm':{c1:25792,pvp:453} } },
      { desc:'DANAE KC',   espessuras:{ '2cm':{c1:30320,pvp:533}, '1.2cm':{c1:25792,pvp:453} } },
      { desc:'HALO KC',    espessuras:{ '2cm':{c1:44112,pvp:775}, '1.2cm':{c1:37912,pvp:666} } },
      { desc:'KRETA',      espessuras:{ '2cm':{c1:44112,pvp:775}, '1.2cm':{c1:37912,pvp:666} } },
    ],
    acabamentos: [
      { nome:'RODATAMPO',             c1:3200, pvp:59,  unidade:'ml' },
      { nome:'CORTE BRUTO',           c1:3200, pvp:66,  unidade:'un' },
      { nome:'REBAIXO À FACE',        c1:5670, pvp:116, unidade:'un' },
      { nome:'TRANSFORMAÇÃO POLIDO',  c1:5000, pvp:90,  unidade:'un' },
      { nome:'FURO',                  c1:1260, pvp:26,  unidade:'un' },
      { nome:'CORTE 1/2 ESQUADRIA',   c1:2840, pvp:58,  unidade:'un' },
      { nome:'SILICONE',              c1:10,   pvp:18,  unidade:'un' },
    ]
  }
}

const TRANSPORTE = [
  { label:'VISEU',   c1:19000, pvp:300 },
  { label:'> 30 KM', c1:30000, pvp:480 },
  { label:'> 50 KM', c1:45000, pvp:720 },
]

const MATERIAIS_LIST = ['GRANITOS','SILESTONES','COMPAC','DEKTON']

function uuid() { return Math.random().toString(36).slice(2,9) }
function c1fmt(c1) { return (c1/100).toFixed(2) }
function pvpfmt(pvp) { return parseFloat(pvp).toFixed(2) }

// ── Lista de cálculos ──────────────────────────────────────────────────────
export default function Tampos({ showToast }) {
  const [calculos, setCalculos] = useState([])
  const [orcamentos, setOrcamentos] = useState([])
  const [view, setView] = useState('list')
  const [current, setCurrent] = useState(null)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'tampos'), snap => setCalculos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'orcamentos'), snap => setOrcamentos(snap.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  const novoCalculo = () => {
    setCurrent({
      id: null, nome:'', cliente:'',
      pecas: [novaPeca(1)],
      transporte: null,
      desconto: 0, descontoTipo: '%',
      notas: ''
    })
    setView('calc')
  }

  const novaPeca = (n) => ({
    id: uuid(), label:`Peça ${n}`,
    tipo: 'SILESTONES', desc:'', espessura:'2cm',
    segmentos: [{ id:uuid(), label:'Seg. 1', comp:0, larg:0 }],
    acabamentos: []
  })

  const abrirCalculo = (c) => { setCurrent({...c}); setView('calc') }

  const delCalculo = async (id, nome) => {
    if (!confirm(`Eliminar "${nome}"?`)) return
    await deleteDoc(doc(db,'tampos',id))
    showToast('Eliminado')
  }

  const limparTudo = async () => {
    if (!confirm('Eliminar todos os cálculos de tampo?')) return
    for (const c of calculos) await deleteDoc(doc(db,'tampos',c.id))
    showToast('Dados limpos')
  }

  const totalProjeto = (c) => {
    let pvp = 0, c1 = 0
    ;(c.pecas||[]).forEach(p => {
      const mat = ANIGRACO[p.tipo]
      const ref = mat?.materiais.find(m=>m.desc===p.desc)
      const esp = ref?.espessuras[p.espessura]
      const m2 = (p.segmentos||[]).reduce((s,sg)=>(s+(sg.comp/1000)*(sg.larg/1000)),0)
      if (esp) { pvp += esp.pvp*m2; c1 += esp.c1/100*m2 }
      ;(p.acabamentos||[]).forEach(a => {
        pvp += (a.pvp||0)*(a.qty||1)
        c1 += (a.c1/100||0)*(a.qty||1)
      })
    })
    if (c.transporte) { pvp += c.transporte.pvp; c1 += c.transporte.c1/100 }
    let desc = 0
    if (c.desconto>0) {
      desc = c.descontoTipo==='%' ? pvp*(c.desconto/100) : c.desconto
    }
    return { pvp: pvp-desc, c1, desconto: desc }
  }

  if (view==='calc' && current) {
    return <Calculadora
      current={current} setCurrent={setCurrent}
      orcamentos={orcamentos}
      onBack={() => setView('list')}
      showToast={showToast}
      novaPeca={novaPeca}
    />
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text)' }}>
          Tampos <span style={{ fontSize:9, color:'var(--text3)', marginLeft:8 }}>{calculos.length}</span>
        </span>
        <div style={{ display:'flex', gap:8 }}>
          {calculos.length>0 && (
            <button onClick={limparTudo} className="btn btn-outline" style={{ height:30, padding:'0 12px', fontSize:9, color:'var(--danger)', borderColor:'var(--danger)' }}>Limpar</button>
          )}
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
          const res = totalProjeto(c)
          return (
            <div key={c.id} style={{ padding:'18px 20px', borderBottom:'1px solid var(--line)', display:'flex', gap:12, alignItems:'center' }}>
              <div onClick={() => abrirCalculo(c)} style={{ flex:1, cursor:'pointer' }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:16, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)', marginBottom:4 }}>{c.nome||'Sem nome'}</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {c.cliente && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text3)' }}>{c.cliente}</span>}
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)' }}>{(c.pecas||[]).length} peça{(c.pecas||[]).length!==1?'s':''}</span>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--gold2)' }}>{pvpfmt(res.pvp)} €</span>
                </div>
              </div>
              <button onClick={() => delCalculo(c.id, c.nome)} style={{ background:'transparent', border:'1px solid var(--line2)', width:28, height:28, cursor:'pointer', color:'var(--text3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>✕</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Calculadora ────────────────────────────────────────────────────────────
function Calculadora({ current, setCurrent, orcamentos, onBack, showToast, novaPeca }) {
  const [tab, setTab] = useState('pecas') // pecas | resumo
  const [matModal, setMatModal] = useState(null) // peca id a escolher material
  const [exportModal, setExportModal] = useState(false)
  const [pdfModal, setPdfModal] = useState(false)

  const upd = (key, val) => setCurrent(c=>({...c,[key]:val}))

  const save = async () => {
    if (!current.nome.trim()) { showToast('Nome obrigatório'); return }
    const data = { ...current }; delete data.id
    if (current.id) {
      await setDoc(doc(db,'tampos',current.id), data)
    } else {
      const ref = await addDoc(collection(db,'tampos'), data)
      setCurrent(c=>({...c,id:ref.id}))
    }
    showToast('Guardado')
  }

  const addPeca = () => {
    upd('pecas', [...(current.pecas||[]), novaPeca((current.pecas||[]).length+1)])
  }

  const updPeca = (id, key, val) => {
    upd('pecas', current.pecas.map(p => p.id===id ? {...p,[key]:val} : p))
  }

  const delPeca = (id) => {
    if (current.pecas.length===1) { showToast('Mínimo 1 peça'); return }
    upd('pecas', current.pecas.filter(p=>p.id!==id))
  }

  const addSeg = (pecaId) => {
    const p = current.pecas.find(p=>p.id===pecaId)
    const n = (p.segmentos||[]).length+1
    updPeca(pecaId, 'segmentos', [...(p.segmentos||[]), { id:uuid(), label:`Seg. ${n}`, comp:0, larg:0 }])
  }

  const updSeg = (pecaId, segId, key, val) => {
    const p = current.pecas.find(p=>p.id===pecaId)
    updPeca(pecaId, 'segmentos', p.segmentos.map(s=>s.id===segId?{...s,[key]:val}:s))
  }

  const delSeg = (pecaId, segId) => {
    const p = current.pecas.find(p=>p.id===pecaId)
    if ((p.segmentos||[]).length<=1) { showToast('Mínimo 1 segmento'); return }
    updPeca(pecaId, 'segmentos', p.segmentos.filter(s=>s.id!==segId))
  }

  const toggleAcab = (pecaId, acab) => {
    const p = current.pecas.find(p=>p.id===pecaId)
    const exists = (p.acabamentos||[]).find(a=>a.nome===acab.nome)
    if (exists) updPeca(pecaId,'acabamentos',(p.acabamentos||[]).filter(a=>a.nome!==acab.nome))
    else updPeca(pecaId,'acabamentos',[...(p.acabamentos||[]), {...acab, qty:1}])
  }

  const updAcabQty = (pecaId, nome, qty) => {
    const p = current.pecas.find(p=>p.id===pecaId)
    updPeca(pecaId,'acabamentos',(p.acabamentos||[]).map(a=>a.nome===nome?{...a,qty:Math.max(1,qty)}:a))
  }

  // totais
  const calcPeca = (p) => {
    const mat = ANIGRACO[p.tipo]
    const ref = mat?.materiais.find(m=>m.desc===p.desc)
    const esp = ref?.espessuras[p.espessura]
    const m2 = (p.segmentos||[]).reduce((s,sg)=>s+(sg.comp/1000)*(sg.larg/1000),0)
    const pvpTampo = esp ? esp.pvp*m2 : 0
    const c1Tampo  = esp ? esp.c1/100*m2 : 0
    const pvpAcab  = (p.acabamentos||[]).reduce((s,a)=>s+(a.pvp||0)*(a.qty||1),0)
    const c1Acab   = (p.acabamentos||[]).reduce((s,a)=>s+(a.c1/100||0)*(a.qty||1),0)
    return { m2, pvpTampo, c1Tampo, pvpAcab, c1Acab, pvp:pvpTampo+pvpAcab, c1:c1Tampo+c1Acab, esp }
  }

  const totalGeral = () => {
    let pvp=0, c1=0
    current.pecas.forEach(p=>{ const r=calcPeca(p); pvp+=r.pvp; c1+=r.c1 })
    if (current.transporte) { pvp+=current.transporte.pvp; c1+=current.transporte.c1/100 }
    let desc=0
    if (current.desconto>0) desc = current.descontoTipo==='%' ? pvp*(current.desconto/100) : current.desconto
    return { pvp:pvp-desc, c1, desconto:desc, pvpBruto:pvp }
  }

  const tot = totalGeral()

  const S = {
    label: { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--text2)', display:'block', marginBottom:8 },
    inp: { width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:14, fontWeight:300, color:'var(--text)', outline:'none' },
    num: { background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'6px 0', fontFamily:"'Barlow Condensed'", fontSize:15, color:'var(--text)', outline:'none', textAlign:'right', width:'100%' },
    sec: { padding:'18px 20px 0', borderBottom:'1px solid var(--line)', paddingBottom:18 },
    secT: { fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--text3)', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' },
    gold: { fontFamily:"'Barlow Condensed'", color:'var(--gold)', letterSpacing:'0.08em' },
    muted: { fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase' },
  }

  // ── exportar para orçamento ───────────────────────────────────────────
  const exportarOrc = async (orcId) => {
    const orc = orcamentos.find(o=>o.id===orcId)
    if (!orc) return
    const items = [...(orc.items||[])]
    current.pecas.forEach(p => {
      const res = calcPeca(p)
      if (res.m2>0 && p.desc) {
        items.push({ artId:'t_'+uuid(), ref:p.tipo[0]+'_'+p.espessura, desc:`${p.label} — ${p.desc} ${p.espessura} (${res.m2.toFixed(3)} m²)`, cat:'Tampos', price:res.pvpTampo, qty:1 })
      }
      ;(p.acabamentos||[]).forEach(a => {
        items.push({ artId:'t_'+uuid(), ref:'ACAB', desc:`${p.label} — ${a.nome} ×${a.qty}`, cat:'Tampos', price:(a.pvp||0)*(a.qty||1), qty:1 })
      })
    })
    if (current.transporte) items.push({ artId:'t_'+uuid(), ref:'TRANSP', desc:`Transporte — ${current.transporte.label}`, cat:'Tampos', price:current.transporte.pvp, qty:1 })
    await setDoc(doc(db,'orcamentos',orcId), {...orc, items})
    showToast('Exportado para "'+orc.name+'"')
    setExportModal(false)
  }

  // ── PDF ───────────────────────────────────────────────────────────────
  const gerarPDF = () => {
    const tot = totalGeral()
    const hoje = new Date().toLocaleDateString('pt-PT')
    let html = `<html><head><meta charset="UTF-8">
<style>
  body { font-family: 'Arial', sans-serif; background:#fff; color:#111; margin:0; padding:32px; font-size:13px; }
  .header { border-bottom:2px solid #111; padding-bottom:16px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-end; }
  .logo { font-size:20px; font-weight:700; letter-spacing:0.15em; text-transform:uppercase; }
  .logo span { color:#c8a96e; }
  .meta { font-size:11px; color:#666; text-align:right; }
  .section { margin-bottom:20px; }
  .section-title { font-size:10px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#666; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:10px; }
  .peca-title { font-size:13px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:6px; }
  .peca-sub { font-size:11px; color:#666; margin-bottom:8px; }
  .row { display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid #f0f0f0; }
  .row-label { color:#444; }
  .row-val { font-weight:600; }
  .total-box { background:#f5f5f5; padding:16px; margin-top:24px; display:flex; justify-content:space-between; align-items:center; }
  .total-label { font-size:11px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#666; }
  .total-val { font-size:24px; font-weight:700; }
  .note { font-size:11px; color:#888; margin-top:20px; font-style:italic; }
  .indicativo { background:#fff8e8; border:1px solid #c8a96e; padding:8px 12px; font-size:11px; color:#8a6e3a; margin-bottom:20px; text-align:center; letter-spacing:0.06em; }
</style></head><body>`

    html += `<div class="header">
  <div class="logo">HM·<span>Work</span>·Kit</div>
  <div class="meta"><div><strong>${current.nome||'Projecto de Tampo'}</strong></div>${current.cliente?`<div>${current.cliente}</div>`:''}<div>${hoje}</div></div>
</div>`
    html += `<div class="indicativo">DOCUMENTO INDICATIVO — SUJEITO A CONFIRMAÇÃO</div>`

    current.pecas.forEach((p,i) => {
      const res = calcPeca(p)
      html += `<div class="section">`
      html += `<div class="section-title">${p.label}</div>`
      html += `<div class="peca-title">${p.desc||'—'}</div>`
      html += `<div class="peca-sub">${p.tipo.charAt(0)+p.tipo.slice(1).toLowerCase()} · ${p.espessura} · ${res.m2.toFixed(3)} m²</div>`
      if (res.esp) {
        html += `<div class="row"><span class="row-label">Tampo (${res.m2.toFixed(3)} m² × ${pvpfmt(res.esp.pvp)} €/m²)</span><span class="row-val">${pvpfmt(res.pvpTampo)} €</span></div>`
      }
      ;(p.acabamentos||[]).forEach(a => {
        html += `<div class="row"><span class="row-label">${a.nome} ×${a.qty}</span><span class="row-val">${pvpfmt((a.pvp||0)*(a.qty||1))} €</span></div>`
      })
      html += `</div>`
    })

    if (current.transporte) {
      html += `<div class="section"><div class="section-title">Transporte e Montagem</div>`
      html += `<div class="row"><span class="row-label">Transporte — ${current.transporte.label}</span><span class="row-val">${pvpfmt(current.transporte.pvp)} €</span></div>`
      html += `</div>`
    }

    if (current.desconto>0) {
      html += `<div class="row"><span class="row-label">Desconto ${current.descontoTipo==='%'?current.desconto+'%':''}</span><span class="row-val">− ${pvpfmt(tot.desconto)} €</span></div>`
    }

    html += `<div class="total-box"><span class="total-label">Total PVP (IVA incl.)</span><span class="total-val">${pvpfmt(tot.pvp)} €</span></div>`
    if (current.notas) html += `<div class="note">${current.notas}</div>`
    html += `</body></html>`

    const w = window.open('','_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => { w.print() }, 500)
  }

  return (
    <>
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>

      {/* BARRA */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 20px', height:48, borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        <button onClick={onBack} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>
          ← Tampos
        </button>
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={gerarPDF} className="btn btn-outline" style={{ height:30, padding:'0 10px', fontSize:9 }}>PDF</button>
          <button onClick={() => setExportModal(true)} className="btn btn-outline" style={{ height:30, padding:'0 10px', fontSize:9 }}>↗ Orc.</button>
          <button onClick={save} className="btn btn-gold" style={{ height:30, padding:'0 14px', fontSize:9 }}>Guardar</button>
        </div>
      </div>

      {/* TOTAL */}
      <div style={{ padding:'10px 20px', background:'var(--bg)', borderBottom:'1px solid var(--line)', flexShrink:0, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', gap:16 }}>
          <div>
            <div style={S.muted}>C1 total</div>
            <div style={{ ...S.gold, fontSize:14, fontWeight:500 }}>{c1fmt(tot.c1*100)} €</div>
          </div>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={S.muted}>PVP total</div>
          <div style={{ ...S.gold, fontSize:22, fontWeight:700 }}>{pvpfmt(tot.pvp)} €</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ display:'flex', borderBottom:'1px solid var(--line)', flexShrink:0 }}>
        {[['pecas','Peças'],['resumo','Resumo C1']].map(([id,label]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, height:38, background:'transparent', border:'none', borderBottom: tab===id?'2px solid var(--gold)':'2px solid transparent', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color: tab===id?'var(--gold)':'var(--text3)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* SCROLL */}
      <div style={{ flex:1, overflowY:'auto' }}>

        {/* ── TAB PEÇAS ── */}
        {tab==='pecas' && <>
          {/* Identificação */}
          <div style={S.sec}>
            <div style={S.secT}>Identificação</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div><label style={S.label}>Nome do projecto</label><input value={current.nome} onChange={e=>upd('nome',e.target.value)} placeholder="ex: Cozinha Lisboa" style={S.inp} /></div>
              <div><label style={S.label}>Cliente</label><input value={current.cliente||''} onChange={e=>upd('cliente',e.target.value)} placeholder="Nome do cliente" style={S.inp} /></div>
            </div>
          </div>

          {/* Peças */}
          {current.pecas.map((p,pi) => {
            const res = calcPeca(p)
            const mat = ANIGRACO[p.tipo]
            const espDisp = p.desc ? Object.keys(mat?.materiais.find(m=>m.desc===p.desc)?.espessuras||{}) : []
            const acabDisp = mat?.acabamentos || []

            return (
              <div key={p.id} style={{ ...S.sec, background: pi%2===0?'transparent':'var(--bg2)' }}>
                <div style={S.secT}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <input value={p.label} onChange={e=>updPeca(p.id,'label',e.target.value)}
                      style={{ background:'transparent', border:'none', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text2)', outline:'none', width:80 }} />
                    {res.m2>0 && <span style={{ fontSize:10, color:'var(--text3)' }}>{res.m2.toFixed(3)} m²</span>}
                    {res.pvp>0 && <span style={{ fontSize:11, color:'var(--gold2)' }}>{pvpfmt(res.pvp)} €</span>}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {current.pecas.length>1 && <button onClick={()=>delPeca(p.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:12 }}>✕</button>}
                  </div>
                </div>

                {/* escolha material */}
                <button onClick={() => setMatModal(p.id)}
                  style={{ width:'100%', background:'var(--bg3)', border:'1px solid var(--line2)', padding:'12px 16px', cursor:'pointer', textAlign:'left', marginBottom:14, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--text3)', marginBottom:4 }}>Material</div>
                    <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:600, color: p.desc?'var(--text)':'var(--text3)', letterSpacing:'0.06em' }}>
                      {p.desc ? `${p.tipo.charAt(0)+p.tipo.slice(1).toLowerCase()} · ${p.desc}` : 'Seleccionar material →'}
                    </div>
                  </div>
                  {p.desc && res.esp && (
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)' }}>PVP/m²</div>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--gold)' }}>{pvpfmt(res.esp.pvp)} €</div>
                    </div>
                  )}
                </button>

                {/* espessura */}
                {espDisp.length>0 && (
                  <div style={{ marginBottom:14 }}>
                    <label style={S.label}>Espessura</label>
                    <div style={{ display:'flex', gap:8 }}>
                      {espDisp.map(e => {
                        const ed = mat.materiais.find(m=>m.desc===p.desc)?.espessuras[e]
                        return (
                          <button key={e} onClick={() => updPeca(p.id,'espessura',e)}
                            style={{ flex:1, padding:'10px 8px', background: p.espessura===e?'var(--gold)':'transparent', border:'1px solid', borderColor: p.espessura===e?'var(--gold)':'var(--line2)', cursor:'pointer' }}>
                            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, color: p.espessura===e?'var(--bg)':'var(--text)' }}>{e}</div>
                            {ed && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color: p.espessura===e?'var(--bg)':'var(--text3)', marginTop:2 }}>{pvpfmt(ed.pvp)} €/m²</div>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* segmentos */}
                <div style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                    <label style={{...S.label, marginBottom:0}}>Segmentos</label>
                    <button onClick={()=>addSeg(p.id)} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--gold)' }}>+ Seg.</button>
                  </div>
                  {(p.segmentos||[]).map(seg => (
                    <div key={seg.id} style={{ display:'grid', gridTemplateColumns:'auto 1fr 1fr 1fr auto', gap:8, alignItems:'center', marginBottom:8, padding:'10px 12px', background:'var(--bg3)', borderLeft:'2px solid var(--line2)' }}>
                      <input value={seg.label} onChange={e=>updSeg(p.id,seg.id,'label',e.target.value)}
                        style={{ background:'transparent', border:'none', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--text3)', outline:'none', width:50 }} />
                      <div>
                        <div style={{...S.label, fontSize:8, marginBottom:4}}>Comp. (mm)</div>
                        <input type="number" value={seg.comp||''} onChange={e=>updSeg(p.id,seg.id,'comp',parseFloat(e.target.value)||0)} placeholder="2400" min="0" style={{...S.num, fontSize:13}} />
                      </div>
                      <div>
                        <div style={{...S.label, fontSize:8, marginBottom:4}}>Larg. (mm)</div>
                        <input type="number" value={seg.larg||''} onChange={e=>updSeg(p.id,seg.id,'larg',parseFloat(e.target.value)||0)} placeholder="600" min="0" style={{...S.num, fontSize:13}} />
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{...S.label, fontSize:8, marginBottom:4}}>m²</div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, color:'var(--gold)', paddingTop:2 }}>
                          {((seg.comp/1000)*(seg.larg/1000)).toFixed(4)}
                        </div>
                      </div>
                      {(p.segmentos||[]).length>1 && (
                        <button onClick={()=>delSeg(p.id,seg.id)} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:11 }}>✕</button>
                      )}
                    </div>
                  ))}
                  <div style={{ display:'flex', justifyContent:'flex-end', padding:'6px 0' }}>
                    <span style={{...S.muted, marginRight:8}}>Total</span>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:600, color:'var(--text)' }}>{res.m2.toFixed(4)} m²</span>
                  </div>
                </div>

                {/* acabamentos */}
                {acabDisp.length>0 && (
                  <div>
                    <label style={S.label}>Acabamentos</label>
                    {acabDisp.map(acab => {
                      const active = (p.acabamentos||[]).find(a=>a.nome===acab.nome)
                      return (
                        <div key={acab.nome} style={{ borderBottom:'1px solid var(--line)' }}>
                          <div style={{ display:'flex', alignItems:'center', padding:'10px 0', gap:10 }}>
                            <div onClick={()=>toggleAcab(p.id,acab)} style={{ width:30, height:18, borderRadius:9, background:active?'var(--gold)':'var(--line2)', position:'relative', cursor:'pointer', transition:'background .2s', flexShrink:0 }}>
                              <div style={{ position:'absolute', top:2, left:active?13:2, width:14, height:14, borderRadius:'50%', background:'#fff', transition:'left .2s' }} />
                            </div>
                            <span style={{ flex:1, fontFamily:"'Barlow Condensed'", fontSize:12, color:active?'var(--text)':'var(--text2)' }}>{acab.nome}</span>
                            {!active && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--text3)' }}>{pvpfmt(acab.pvp)} €/{acab.unidade}</span>}
                          </div>
                          {active && (
                            <div style={{ display:'flex', gap:16, paddingBottom:10, paddingLeft:40, alignItems:'flex-end' }}>
                              <div>
                                <label style={{...S.label, fontSize:8}}>Qtd.</label>
                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                  <button onClick={()=>updAcabQty(p.id,acab.nome,(active.qty||1)-1)} style={{ width:24, height:24, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:15, color:'var(--text)', minWidth:20, textAlign:'center' }}>{active.qty||1}</span>
                                  <button onClick={()=>updAcabQty(p.id,acab.nome,(active.qty||1)+1)} style={{ width:24, height:24, background:'transparent', border:'1px solid var(--line2)', cursor:'pointer', color:'var(--text2)', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                                </div>
                              </div>
                              <div style={{ marginLeft:'auto', textAlign:'right' }}>
                                <div style={S.muted}>PVP</div>
                                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--gold2)' }}>{pvpfmt((acab.pvp||0)*(active.qty||1))} €</div>
                              </div>
                              <div style={{ textAlign:'right' }}>
                                <div style={S.muted}>C1</div>
                                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text3)' }}>{c1fmt(acab.c1*(active.qty||1))}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* + Peça */}
          <div style={{ padding:'14px 20px', borderBottom:'1px solid var(--line)' }}>
            <button onClick={addPeca} style={{ width:'100%', background:'transparent', border:'1px dashed var(--line2)', padding:'12px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)', transition:'all .15s' }}>
              + Adicionar peça
            </button>
          </div>

          {/* Transporte */}
          <div style={S.sec}>
            <div style={S.secT}>Transporte e Montagem</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              {TRANSPORTE.map(t => (
                <button key={t.label} onClick={() => upd('transporte', current.transporte?.label===t.label?null:t)}
                  style={{ padding:'12px 8px', background:current.transporte?.label===t.label?'var(--gold)':'transparent', border:'1px solid', borderColor:current.transporte?.label===t.label?'var(--gold)':'var(--line2)', cursor:'pointer', textAlign:'center' }}>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:current.transporte?.label===t.label?'var(--bg)':'var(--text)' }}>{t.label}</div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:current.transporte?.label===t.label?'var(--bg)':'var(--text3)', marginTop:2 }}>{pvpfmt(t.pvp)} €</div>
                </button>
              ))}
            </div>
          </div>

          {/* Desconto */}
          <div style={S.sec}>
            <div style={S.secT}>Desconto</div>
            <div style={{ display:'flex', gap:10, alignItems:'flex-end' }}>
              <div style={{ flex:1 }}>
                <label style={S.label}>Valor</label>
                <input type="number" value={current.desconto||''} onChange={e=>upd('desconto',parseFloat(e.target.value)||0)} placeholder="0" min="0" style={S.num} />
              </div>
              <div style={{ display:'flex', gap:6, paddingBottom:6 }}>
                {['%','€'].map(t => (
                  <button key={t} onClick={()=>upd('descontoTipo',t)}
                    style={{ width:36, height:32, background:current.descontoTipo===t?'var(--gold)':'transparent', border:'1px solid', borderColor:current.descontoTipo===t?'var(--gold)':'var(--line2)', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:current.descontoTipo===t?'var(--bg)':'var(--text2)' }}>
                    {t}
                  </button>
                ))}
              </div>
              {current.desconto>0 && (
                <div style={{ textAlign:'right', paddingBottom:6 }}>
                  <div style={S.muted}>Desconto</div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, color:'var(--text2)' }}>− {pvpfmt(tot.desconto)} €</div>
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div style={{ padding:'16px 20px 32px' }}>
            <label style={S.label}>Notas</label>
            <textarea value={current.notas||''} onChange={e=>upd('notas',e.target.value)} placeholder="Observações, acabamentos especiais…"
              style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--line2)', padding:'6px 0', fontFamily:"'Barlow'", fontSize:13, fontWeight:300, color:'var(--text)', outline:'none', resize:'none', minHeight:52 }} />
          </div>
        </>}

        {/* ── TAB RESUMO C1 ── */}
        {tab==='resumo' && (
          <div style={{ padding:'0 0 32px' }}>
            {current.pecas.map(p => {
              const res = calcPeca(p)
              if (!p.desc) return null
              return (
                <div key={p.id} style={{ borderBottom:'1px solid var(--line)' }}>
                  <div style={{ padding:'14px 20px 8px', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text2)' }}>{p.label} — {p.desc} {p.espessura}</div>
                  {res.esp && res.m2>0 && (
                    <ResumoRow
                      label={`Tampo ${res.m2.toFixed(3)} m²`}
                      c1raw={res.esp.c1}
                      pvp={res.pvpTampo}
                      extra={`${c1fmt(res.esp.c1)} €/m² × ${res.m2.toFixed(3)}`}
                      showToast={showToast}
                    />
                  )}
                  {(p.acabamentos||[]).map(a => (
                    <ResumoRow key={a.nome}
                      label={`${a.nome} ×${a.qty}`}
                      c1raw={a.c1*(a.qty||1)}
                      pvp={(a.pvp||0)*(a.qty||1)}
                      showToast={showToast}
                    />
                  ))}
                </div>
              )
            })}
            {current.transporte && (
              <div style={{ borderBottom:'1px solid var(--line)' }}>
                <div style={{ padding:'14px 20px 8px', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--text2)' }}>Transporte</div>
                <ResumoRow label={current.transporte.label} c1raw={current.transporte.c1} pvp={current.transporte.pvp} showToast={showToast} />
              </div>
            )}
            {current.desconto>0 && (
              <div style={{ padding:'12px 20px', display:'flex', justifyContent:'space-between' }}>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--text2)' }}>Desconto</span>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, color:'var(--text2)' }}>− {pvpfmt(tot.desconto)} €</span>
              </div>
            )}
            <div style={{ padding:'16px 20px', background:'var(--bg3)', margin:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={S.muted}>C1 total</div>
                <CopyVal val={c1fmt(tot.c1*100)} label="C1 total" showToast={showToast} large />
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={S.muted}>PVP total</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:22, fontWeight:700, color:'var(--gold)' }}>{pvpfmt(tot.pvp)} €</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* MODAL ESCOLHA MATERIAL */}
    {matModal && (
      <MaterialModal
        pecaId={matModal}
        onSelect={(tipo, desc) => {
          const p = current.pecas.find(p=>p.id===matModal)
          const espDisp = Object.keys(ANIGRACO[tipo].materiais.find(m=>m.desc===desc)?.espessuras||{})
          const pecas = current.pecas.map(p2 => p2.id===matModal ? {...p2, tipo, desc, espessura:espDisp[0]||'2cm', acabamentos:[]} : p2)
          upd('pecas', pecas)
          setMatModal(null)
        }}
        onClose={() => setMatModal(null)}
      />
    )}

    {/* MODAL EXPORTAR */}
    <div className={`overlay ${exportModal?'open':''}`}>
      <div className="modal">
        <div className="modal-head">Exportar para orçamento<button className="modal-close" onClick={()=>setExportModal(false)}>✕</button></div>
        {orcamentos.length===0 && <div style={{ padding:'20px 0', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--text3)' }}>Nenhum orçamento disponível</div>}
        {orcamentos.map(o => (
          <div key={o.id} onClick={()=>exportarOrc(o.id)} style={{ padding:'16px 0', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:15, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--text)' }}>{o.name}</div>
              {o.cliente && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)', marginTop:2 }}>{o.cliente}</div>}
            </div>
            <span style={{ color:'var(--gold)' }}>→</span>
          </div>
        ))}
        <div className="modal-actions"><button className="btn btn-outline" onClick={()=>setExportModal(false)}>Cancelar</button></div>
      </div>
    </div>
    </>
  )
}

// ── Material Modal ─────────────────────────────────────────────────────────
function MaterialModal({ onSelect, onClose }) {
  const [tipo, setTipo] = useState('SILESTONES')
  const [search, setSearch] = useState('')
  const materiais = ANIGRACO[tipo].materiais.filter(m =>
    !search || m.desc.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <div className="overlay open">
      <div className="modal" style={{ width:'100%', maxWidth:480 }}>
        <div className="modal-head">Escolher material<button className="modal-close" onClick={onClose}>✕</button></div>
        {/* tipo */}
        <div style={{ display:'flex', gap:6, marginBottom:16, flexWrap:'wrap' }}>
          {MATERIAIS_LIST.map(t => (
            <button key={t} onClick={()=>setTipo(t)}
              style={{ padding:'6px 12px', background:tipo===t?'var(--gold)':'transparent', border:'1px solid', borderColor:tipo===t?'var(--gold)':'var(--line2)', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', textTransform:'uppercase', color:tipo===t?'var(--bg)':'var(--text2)' }}>
              {t.charAt(0)+t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {/* search */}
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar modelo…"
          style={{ width:'100%', background:'transparent', border:'none', borderBottom:'1px solid var(--gold)', padding:'8px 0', fontFamily:"'Barlow'", fontSize:14, fontWeight:300, color:'var(--text)', outline:'none', marginBottom:12 }} />
        {/* lista */}
        <div style={{ maxHeight:'45vh', overflowY:'auto' }}>
          {materiais.map(m => (
            <div key={m.desc} onClick={()=>onSelect(tipo,m.desc)}
              style={{ padding:'12px 0', borderBottom:'1px solid var(--line)', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:500, letterSpacing:'0.06em', color:'var(--text)' }}>{m.desc}</span>
              <div style={{ textAlign:'right' }}>
                {Object.entries(m.espessuras).map(([e,v]) => (
                  <div key={e} style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--text3)' }}>{e}: {pvpfmt(v.pvp)} €/m²</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="modal-actions"><button className="btn btn-outline" onClick={onClose}>Cancelar</button></div>
      </div>
    </div>
  )
}

// ── ResumoRow com cópia C1 ─────────────────────────────────────────────────
function ResumoRow({ label, c1raw, pvp, extra, showToast }) {
  const c1val = c1fmt(c1raw)
  return (
    <div style={{ display:'flex', alignItems:'center', padding:'10px 20px', gap:10, borderBottom:'1px solid var(--line)' }}>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:12, color:'var(--text)', fontWeight:300 }}>{label}</div>
        {extra && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--text3)', marginTop:2 }}>{extra}</div>}
      </div>
      <CopyVal val={c1val} label="C1" showToast={showToast} />
      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:500, color:'var(--text2)', minWidth:70, textAlign:'right' }}>{pvpfmt(pvp)} €</div>
    </div>
  )
}

// ── CopyVal ────────────────────────────────────────────────────────────────
function CopyVal({ val, label, showToast, large }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(val).catch(()=>{})
    setCopied(true)
    setTimeout(()=>setCopied(false),1600)
    showToast(`${label} copiado — ${val}`)
  }
  return (
    <button onClick={copy} style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'1px solid', borderColor:copied?'var(--gold)':'var(--line2)', padding: large?'6px 12px':'3px 8px', cursor:'pointer', transition:'all .15s' }}>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:large?16:12, fontWeight:large?600:400, color:copied?'var(--gold)':'var(--text)', letterSpacing:'0.08em' }}>{val}</span>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:copied?'var(--gold)':'var(--text3)', letterSpacing:'0.1em' }}>{copied?'✓':'⎘'}</span>
    </button>
  )
}

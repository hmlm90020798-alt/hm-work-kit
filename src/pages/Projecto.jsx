import React, { useState, useEffect, useCallback } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot } from 'firebase/firestore'
import { addToOrcamento } from '../hooks/useOrcamento'

// ── Tipos de projecto por defeito ─────────────────────────────────────────
const TIPOS_DEFAULT = [
  { id:'cozinha',    label:'Cozinha',       icon:'🍳', cor:'#c8943a', activo:true,  componentes:['kit','tampos','eletro','acessorios','iluminacao','ferragens','instalacao'] },
  { id:'banho',      label:'Casa de Banho', icon:'🚿', cor:'#4a8fa8', activo:true,  componentes:['kit','acessorios','iluminacao','ferragens','instalacao'] },
  { id:'closet',     label:'Closet',        icon:'👕', cor:'#8a9e6e', activo:true,  componentes:['kit','iluminacao','ferragens','instalacao'] },
  { id:'suite',      label:'Suíte',         icon:'🛏', cor:'#b07acc', activo:false, componentes:['kit','iluminacao','ferragens','instalacao'] },
  { id:'escritorio', label:'Escritório',    icon:'💼', cor:'#7a9e9a', activo:false, componentes:['kit','iluminacao','ferragens','instalacao'] },
  { id:'outro',      label:'Outro',         icon:'✦',  cor:'#7a7a72', activo:true,  componentes:['kit','tampos','eletro','acessorios','iluminacao','ferragens','instalacao'] },
]

const COMPONENTES = {
  kit:        { label:'Kit base',         icon:'📦', desc:'Artigos essenciais pré-seleccionados', cor:'#c8943a' },
  tampos:     { label:'Tampos',           icon:'⬛', desc:'Calculadora ANIGRACO',                 cor:'#4a8fa8' },
  eletro:     { label:'Eletrodomésticos', icon:'⚡', desc:'Seleccionar da Biblioteca',            cor:'#8a9e6e' },
  acessorios: { label:'Acessórios',       icon:'🔩', desc:'Seleccionar da Biblioteca',            cor:'#b07acc' },
  iluminacao: { label:'Iluminação',       icon:'💡', desc:'Seleccionar da Biblioteca',            cor:'#d4b87a' },
  ferragens:  { label:'Ferragens',        icon:'🔧', desc:'Seleccionar da Biblioteca',            cor:'#7a9e9a' },
  instalacao: { label:'Instalação',       icon:'🛠',  desc:'Serviços de mão de obra',             cor:'#9a7acc' },
}

const COMP_CAT = { eletro:'Eletrodomésticos', acessorios:'Acessórios', iluminacao:'Iluminação', ferragens:'Ferragens' }
const COMP_DESTINO = { tampos:'tampos', instalacao:'maodeobra', eletro:'biblioteca', acessorios:'biblioteca', iluminacao:'biblioteca', ferragens:'biblioteca' }

const TIPOS_KEY  = 'hm_proj_tipos'
const ESTADO_KEY = 'hm_proj_estado'

function f2(n) { return parseFloat(n||0).toFixed(2) }

function hexToRgb(hex) {
  if (!hex || hex.startsWith('var')) return '56,189,248'
  try { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }
  catch { return '56,189,248' }
}

function loadLS(key, def) {
  try { const v = JSON.parse(localStorage.getItem(key)); return v ?? def } catch { return def }
}
function saveLS(key, val) { try { localStorage.setItem(key, JSON.stringify(val)) } catch {} }

// ── Componente principal ──────────────────────────────────────────────────
export default function Projecto({ showToast, onNavegar }) {
  // Tipos configuráveis
  const [tipos,     setTipos]     = useState(() => {
    const saved = loadLS(TIPOS_KEY, null)
    if (Array.isArray(saved) && saved.length) return saved
    return TIPOS_DEFAULT
  })
  const [editTipos, setEditTipos] = useState(false)

  // Estado do guia — carregado do localStorage para persistir entre navegações
  const [passo,      setPasso]      = useState(() => loadLS(ESTADO_KEY, {})?.passo      || 'tipo')
  const [tipo,       setTipo]       = useState(() => loadLS(ESTADO_KEY, {})?.tipo       || null)
  const [compSel,    setCompSel]    = useState(() => loadLS(ESTADO_KEY, {})?.compSel    || [])
  const [compFeitos, setCompFeitos] = useState(() => loadLS(ESTADO_KEY, {})?.compFeitos || [])
  const [compActual, setCompActual] = useState(() => loadLS(ESTADO_KEY, {})?.compActual || null)
  const [kitItems,   setKitItems]   = useState(() => loadLS(ESTADO_KEY, {})?.kitItems   || [])
  const [kitSelId,   setKitSelId]   = useState(() => loadLS(ESTADO_KEY, {})?.kitSelId   || null)

  // Dados Firestore
  const [kits,     setKits]     = useState([])
  const [artigos,  setArtigos]  = useState([])
  const [orcItems, setOrcItems] = useState([])
  const [loading,  setLoading]  = useState(false)

  // Painel substituição
  const [subst, setSubst] = useState(null) // { idx, cat }

  // Persistir estado
  useEffect(() => {
    saveLS(ESTADO_KEY, { passo, tipo, compSel, compFeitos, compActual, kitItems, kitSelId })
  }, [passo, tipo, compSel, compFeitos, compActual, kitItems, kitSelId])

  // Guardar tipos
  const saveTipos = (t) => { setTipos(t); saveLS(TIPOS_KEY, t) }

  // Firestore
  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), s => setKits(s.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), s => setArtigos(s.docs.map(d=>({id:d.id,...d.data()}))))
    const u3 = onSnapshot(doc(db,'orcamento_ativo','ativo'), s => setOrcItems(s.exists()?(s.data().items||[]):[]))
    return () => { u1(); u2(); u3() }
  }, [])

  const tipoActual   = tipos.find(t => t.id === tipo)
  const tiposActivos = tipos.filter(t => t.activo)
  const totalOrc     = orcItems.reduce((s,i) => s + (['Tampos','Mão de Obra'].includes(i.origem) ? (i.price||0) : (i.price||0)*(i.qty||1)), 0)
  const compPorFazer = compSel.filter(c => !compFeitos.includes(c))
  const kitSel       = kits.find(k => k.id === kitSelId) || null
  const kitsFiltrados = kits.filter(k => {
    if (!tipo) return true
    const ctx = (k.contexto||'').toLowerCase()
    return !k.contexto || ctx.includes((tipoActual?.label||'').toLowerCase()) || ctx===''
  })

  // ── Acções ────────────────────────────────────────────────────────────
  const escolherTipo = (t) => {
    setTipo(t.id); setCompSel([]); setCompFeitos([])
    setCompActual(null); setKitSelId(null); setKitItems([])
    setPasso('componentes')
  }

  const toggleComp = (id) => setCompSel(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])

  const avancarDeComponentes = () => {
    if (!compSel.length) { showToast('Selecciona pelo menos um componente'); return }
    if (compSel.includes('kit')) setPasso('kits')
    else { setCompActual(compSel[0]); setPasso('execucao') }
  }

  const escolherKit = (kit) => {
    setKitSelId(kit.id)
    setKitItems((kit.items||[]).map(i=>({...i,incluido:true})))
  }

  const confirmarKit = async () => {
    if (!kitSel) { showToast('Escolhe um kit primeiro'); return }
    setLoading(true)
    const para = kitItems.filter(i=>i.incluido)
    for (const item of para) {
      await addToOrcamento({ ref:item.ref, desc:item.desc, cat:item.cat||'', sub:item.sub||'', price:item.price||0, supplier:item.supplier||'', link:item.link||'', origem:'Kits' }, ()=>{})
    }
    setLoading(false)
    showToast(`Kit "${kitSel.name}" — ${para.length} artigos adicionados`)
    marcarFeitoEAvancar('kit')
  }

  const marcarFeitoEAvancar = useCallback((comp) => {
    const novos = [...compFeitos, comp]
    setCompFeitos(novos)
    const rest = compSel.filter(c => !novos.includes(c))
    if (!rest.length) setPasso('resumo')
    else { setCompActual(rest[0]); setPasso('execucao') }
  }, [compFeitos, compSel])

  const substituir = (artigo) => {
    setKitItems(p => p.map((item,i) => i===subst.idx
      ? {...item, artId:artigo.id, ref:artigo.ref, desc:artigo.desc, cat:artigo.cat||'', sub:artigo.sub||'', price:artigo.price||0, supplier:artigo.supplier||'', link:artigo.link||'', notes:artigo.notes||'', incluido:true}
      : item))
    setSubst(null)
    showToast(`Substituído por ${artigo.ref}`)
  }

  const recomecar = () => {
    setTipo(null); setCompSel([]); setCompFeitos([])
    setCompActual(null); setKitSelId(null); setKitItems([])
    setPasso('tipo')
  }

  const voltarPasso = () => {
    if (passo==='componentes') setPasso('tipo')
    else if (passo==='kits') setPasso('componentes')
    else if (passo==='execucao') {
      if (compFeitos.length===0 && compSel.includes('kit')) setPasso('kits')
      else setPasso('componentes')
    }
    else if (passo==='resumo') setPasso('execucao')
  }

  const progressoPct = compSel.length > 0 ? Math.round((compFeitos.length/compSel.length)*100) : 0
  const artsCat = subst ? artigos.filter(a=>a.cat===subst.cat).sort((a,b)=>(a.ref||'').localeCompare(b.ref||'')) : []

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--neo-bg)', color:'var(--neo-text)', fontFamily:"'Barlow',sans-serif" }}>

      {/* TOPBAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:52, flexShrink:0, background:'var(--neo-bg)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {passo!=='tipo' && (
            <button onClick={voltarPasso} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:18, padding:'4px 6px', lineHeight:1 }}>←</button>
          )}
          <div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text)' }}>Novo Projecto</div>
            {tipoActual && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:tipoActual.cor, marginTop:1 }}>{tipoActual.icon} {tipoActual.label}</div>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {totalOrc>0 && (
            <div style={{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.08em' }}>
              {f2(totalOrc)} €
            </div>
          )}
          {passo!=='tipo' && (
            <button onClick={recomecar} style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--neo-radius-pill)', padding:'5px 12px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
              Recomeçar
            </button>
          )}
        </div>
      </div>

      {/* BARRA PROGRESSO */}
      {['execucao','resumo'].includes(passo) && compSel.length>0 && (
        <div style={{ height:3, background:'var(--neo-bg2)', flexShrink:0 }}>
          <div style={{ height:'100%', width:`${progressoPct}%`, background:'linear-gradient(90deg,var(--neo-gold2),var(--neo-gold))', transition:'width .4s ease', boxShadow:'0 0 8px rgba(200,169,110,0.4)' }}/>
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="neo-scroll" style={{ flex:1, overflowY:'auto', padding:'20px 16px 40px' }}>

        {/* ══ TIPO ══ */}
        {passo==='tipo' && (
          <div>
            <PassoHeader numero={1} titulo="Que tipo de projecto?" sub="Selecciona para começar"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:10, marginTop:20 }}>
              {tiposActivos.map(t => (
                <button key={t.id} onClick={()=>escolherTipo(t)} className="proj-tipo-card" style={{ background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'22px 16px', cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:32, lineHeight:1 }}>{t.icon}</span>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text)' }}>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Editar tipos */}
            <button onClick={()=>setEditTipos(o=>!o)} style={{ display:'flex', alignItems:'center', gap:6, marginTop:20, background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase', color:editTipos?'var(--neo-gold)':'var(--neo-text2)', padding:'4px 0' }}>
              ⚙ {editTipos ? 'Fechar' : 'Personalizar tipos de projecto'}
            </button>

            {editTipos && (
              <div style={{ marginTop:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', overflow:'hidden' }}>
                {tipos.map((t,idx)=>(
                  <div key={t.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <input value={t.icon} onChange={e=>saveTipos(tipos.map((x,i)=>i===idx?{...x,icon:e.target.value}:x))}
                      style={{ width:40, background:'transparent', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--neo-radius-sm)', textAlign:'center', fontFamily:'serif', fontSize:18, color:'var(--neo-text)', outline:'none', padding:'3px', flexShrink:0 }}/>
                    <input value={t.label} onChange={e=>saveTipos(tipos.map((x,i)=>i===idx?{...x,label:e.target.value}:x))}
                      style={{ flex:1, background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.1)', fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)', outline:'none', padding:'2px 4px' }}/>
                    <button onClick={()=>saveTipos(tipos.map((x,i)=>i===idx?{...x,activo:!x.activo}:x))} style={{ width:40, height:22, borderRadius:11, border:'none', cursor:'pointer', background:t.activo?'linear-gradient(145deg,#e8cc8a,#c8943a)':'var(--neo-bg)', boxShadow:t.activo?'var(--neo-shadow-in-sm)':'var(--neo-shadow-out-sm)', position:'relative', transition:'all .2s', flexShrink:0 }}>
                      <div style={{ position:'absolute', top:3, left:t.activo?21:3, width:16, height:16, borderRadius:'50%', background:t.activo?'#0f0d08':'var(--neo-text2)', transition:'left .2s' }}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ COMPONENTES ══ */}
        {passo==='componentes' && tipoActual && (
          <div>
            <PassoHeader numero={2} titulo="O que inclui este projecto?" sub="Selecciona TUDO o que o cliente pretende — depois tratas cada um por sua vez"/>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:20 }}>
              {tipoActual.componentes.map(id=>{
                const comp=COMPONENTES[id]; const sel=compSel.includes(id); const corR=hexToRgb(comp.cor)
                return (
                  <button key={id} onClick={()=>toggleComp(id)} className="proj-comp-card" style={{ display:'flex', alignItems:'center', gap:14, background:sel?`rgba(${corR},0.1)`:'var(--neo-bg2)', border:sel?`1px solid ${comp.cor}55`:'1px solid rgba(255,255,255,0.06)', borderLeft:sel?`3px solid ${comp.cor}`:'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                    <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, border:sel?`2px solid ${comp.cor}`:'2px solid rgba(255,255,255,0.15)', background:sel?comp.cor:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#0f0d08', fontWeight:700 }}>{sel&&'✓'}</div>
                    <span style={{ fontSize:20, flexShrink:0 }}>{comp.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:sel?comp.cor:'var(--neo-text)' }}>{comp.label}</div>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>{comp.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
            {compSel.length>0 && (
              <div style={{ marginTop:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>Vais tratar por esta ordem:</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
                  {compSel.map((c,i)=>(
                    <span key={c} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', background:`rgba(${hexToRgb(COMPONENTES[c]?.cor||'#c8943a')},0.15)`, color:COMPONENTES[c]?.cor||'var(--neo-gold)', border:`1px solid ${COMPONENTES[c]?.cor||'#c8943a'}33` }}>
                      {i+1}. {COMPONENTES[c]?.label}
                    </span>
                  ))}
                </div>
                <button onClick={avancarDeComponentes} className="neo-btn neo-btn-gold" style={{ width:'100%', height:48, fontSize:11, letterSpacing:'0.12em', borderRadius:'var(--neo-radius)' }}>
                  Começar →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ══ KIT ══ */}
        {passo==='kits' && (
          <div>
            <PassoHeader numero={3} titulo="Escolhe o kit base" sub="Artigos essenciais pré-seleccionados — remove ou substitui o que não se aplicar"/>
            {kitsFiltrados.length===0 ? (
              <div style={{ marginTop:24, padding:'40px 20px', textAlign:'center', background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)' }}>
                <div style={{ fontSize:28, marginBottom:12, opacity:.4 }}>📦</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)' }}>Nenhum kit disponível</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', marginTop:8, letterSpacing:'0.08em', lineHeight:1.8 }}>Cria kits em <strong style={{color:'var(--neo-gold)'}}>Kits</strong> no menu</div>
              </div>
            ) : (
              <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:8 }}>
                {kitsFiltrados.map(kit=>{
                  const sel=kitSelId===kit.id; const nItems=(kit.items||[]).length
                  const totalKit=(kit.items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)
                  return (
                    <button key={kit.id} onClick={()=>escolherKit(kit)} className="proj-kit-card" style={{ display:'flex', alignItems:'center', gap:14, background:sel?'rgba(200,169,110,0.08)':'var(--neo-bg2)', border:sel?'1px solid rgba(200,169,110,0.4)':'1px solid rgba(255,255,255,0.06)', borderLeft:sel?'3px solid var(--neo-gold)':'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:sel?'var(--neo-shadow-out-sm),0 0 14px rgba(200,169,110,0.15)':'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                      <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, border:sel?'2px solid var(--neo-gold)':'2px solid rgba(255,255,255,0.2)', background:sel?'var(--neo-gold)':'transparent', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        {sel&&<div style={{ width:6, height:6, borderRadius:'50%', background:'#0f0d08' }}/>}
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:sel?'var(--neo-gold)':'var(--neo-text)' }}>{kit.name}</div>
                        {kit.notas&&<div style={{ fontSize:11, fontWeight:300, color:'var(--neo-text2)', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{kit.notas}</div>}
                        <div style={{ display:'flex', gap:10, alignItems:'center', marginTop:4 }}>
                          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em' }}>{nItems} artigo{nItems!==1?'s':''}</span>
                          {totalKit>0&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:'var(--neo-gold)' }}>{f2(totalKit)} €</span>}
                          {kit.contexto&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-text2)', background:'var(--neo-bg)', padding:'2px 7px', borderRadius:'var(--neo-radius-pill)' }}>{kit.contexto}</span>}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {kitSel && kitItems.length>0 && (
              <div style={{ marginTop:24 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                  Ajusta os artigos — ✕ remove, ↗ substitui por outro da mesma categoria
                </div>
                <div style={{ background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', overflow:'hidden' }}>
                  {kitItems.map((item,idx)=>(
                    <KitItemRow key={item.artId||idx} item={item}
                      onChange={inc=>setKitItems(p=>p.map((x,i)=>i===idx?{...x,incluido:inc}:x))}
                      onSubstituir={()=>setSubst({idx,cat:item.cat})}/>
                  ))}
                </div>
                <div style={{ display:'flex', gap:8, marginTop:14 }}>
                  <button onClick={()=>marcarFeitoEAvancar('kit')} className="neo-btn neo-btn-ghost" style={{ flex:1, height:44, fontSize:10 }}>Saltar kit</button>
                  <button onClick={confirmarKit} disabled={loading} className="neo-btn neo-btn-gold" style={{ flex:2, height:44, fontSize:10, letterSpacing:'0.1em' }}>
                    {loading?'A adicionar…':`Adicionar kit (${kitItems.filter(i=>i.incluido).length} artigos) →`}
                  </button>
                </div>
              </div>
            )}
            {!kitSel&&kitsFiltrados.length>0&&(
              <button onClick={()=>marcarFeitoEAvancar('kit')} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:44, marginTop:20, fontSize:10 }}>
                Continuar sem kit →
              </button>
            )}
          </div>
        )}

        {/* ══ EXECUÇÃO ══ */}
        {passo==='execucao'&&compActual&&(()=>{
          const comp=COMPONENTES[compActual]; const corR=hexToRgb(comp?.cor)
          const proximo=compSel.find(c=>c!==compActual&&!compFeitos.includes(c))
          return (
            <div>
              <PassoHeader numero={compFeitos.length+1} titulo={comp?.label||compActual} sub={comp?.desc||''} cor={comp?.cor} icon={comp?.icon}/>
              {/* Pills progresso */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:16, marginBottom:24 }}>
                {compSel.map(c=>(
                  <span key={c} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', fontWeight:c===compActual?700:400, background:compFeitos.includes(c)?'rgba(200,169,110,0.12)':c===compActual?`rgba(${hexToRgb(COMPONENTES[c]?.cor||'#c8943a')},0.18)`:'var(--neo-bg2)', color:compFeitos.includes(c)?'var(--neo-gold)':c===compActual?(COMPONENTES[c]?.cor||'var(--neo-gold)'):'var(--neo-text2)', border:c===compActual?`1px solid ${COMPONENTES[c]?.cor||'var(--neo-gold)'}44`:'1px solid rgba(255,255,255,0.06)' }}>
                    {compFeitos.includes(c)?'✓ ':c===compActual?'▶ ':''}{COMPONENTES[c]?.label||c}
                  </span>
                ))}
              </div>
              {/* Card acção */}
              <div style={{ background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', border:`1px solid rgba(${corR},0.2)`, padding:'28px 20px', textAlign:'center', marginBottom:14 }}>
                <div style={{ fontSize:44, marginBottom:14 }}>{comp?.icon}</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:comp?.cor||'var(--neo-gold)', marginBottom:10 }}>{comp?.label}</div>
                <div style={{ fontSize:13, fontWeight:300, color:'var(--neo-text2)', lineHeight:1.7, marginBottom:24, maxWidth:300, margin:'0 auto 24px' }}>
                  {compActual==='tampos'&&'Abre a calculadora ANIGRACO, faz o cálculo, guarda — e volta aqui para continuar.'}
                  {compActual==='instalacao'&&'Selecciona os serviços de instalação na Mão de Obra e volta aqui.'}
                  {['eletro','acessorios','iluminacao','ferragens'].includes(compActual)&&`Selecciona os artigos de "${COMP_CAT[compActual]}" na Biblioteca e volta aqui.`}
                </div>
                <button onClick={()=>onNavegar?.(COMP_DESTINO[compActual]||'biblioteca',COMP_CAT[compActual]||null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11, letterSpacing:'0.12em' }}>
                  Abrir {comp?.label} →
                </button>
              </div>
              <button onClick={()=>marcarFeitoEAvancar(compActual)} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:44, fontSize:10 }}>
                {compPorFazer.length===1?'✓ Concluído — ver resumo':`✓ Feito — próximo: ${COMPONENTES[proximo]?.label||''}`}
              </button>
            </div>
          )
        })()}

        {/* ══ RESUMO ══ */}
        {passo==='resumo'&&(
          <div>
            <PassoHeader numero="✓" titulo="Projecto concluído" sub={tipoActual?`${tipoActual.icon} ${tipoActual.label}`:''} cor="var(--neo-gold)"/>
            {totalOrc>0&&(
              <div style={{ background:'rgba(200,169,110,0.08)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius)', padding:'20px 24px', textAlign:'center', marginTop:20, marginBottom:20 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:8 }}>Total PVP indicativo</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:36, fontWeight:700, color:'var(--neo-gold)', textShadow:'0 0 20px rgba(200,169,110,0.3)' }}>{f2(totalOrc)} €</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text2)', letterSpacing:'0.1em', marginTop:6 }}>{orcItems.length} item{orcItems.length!==1?'s':''} no orçamento</div>
              </div>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
              {compFeitos.map(c=>(
                <div key={c} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:`3px solid ${COMPONENTES[c]?.cor||'var(--neo-gold)'}`, padding:'10px 14px' }}>
                  <span style={{ fontSize:16 }}>{COMPONENTES[c]?.icon}</span>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:COMPONENTES[c]?.cor||'var(--neo-gold)', flex:1 }}>{COMPONENTES[c]?.label}</span>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-gold)' }}>✓</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button onClick={()=>{setCompSel([]);setCompFeitos([]);setCompActual(null);setPasso('componentes')}} style={{ width:'100%', height:44, background:'transparent', border:'1px solid rgba(200,169,110,0.3)', borderRadius:'var(--neo-radius)', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:600, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-gold)' }}>
                + Adicionar mais componentes
              </button>
              <button onClick={()=>onNavegar?.('orcamentos')} className="neo-btn neo-btn-gold" style={{ width:'100%', height:50, fontSize:11, letterSpacing:'0.12em' }}>Ver orçamento completo →</button>
              <button onClick={()=>onNavegar?.('proposta')} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:44, fontSize:10 }}>Criar proposta para o cliente →</button>
              <button onClick={recomecar} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:40, fontSize:9, opacity:.6 }}>Novo projecto</button>
            </div>
          </div>
        )}
      </div>

      {/* ══ PAINEL SUBSTITUIÇÃO ══ */}
      {subst&&(
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setSubst(null)}}>
          <div className="neo-modal" style={{ maxWidth:480 }}>
            <div className="neo-modal-head">
              Substituir artigo
              <button className="neo-modal-close" onClick={()=>setSubst(null)}>✕</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
              {subst.cat} — escolhe o artigo substituto
            </div>
            {kitItems[subst.idx]&&(
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--neo-radius-sm)', marginBottom:14 }}>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em', flexShrink:0 }}>ACTUAL</span>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{kitItems[subst.idx].ref}</span>
                <span style={{ fontSize:12, fontWeight:300, color:'var(--neo-text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{kitItems[subst.idx].desc}</span>
              </div>
            )}
            <div className="neo-scroll" style={{ maxHeight:'50vh', overflowY:'auto' }}>
              {artsCat.length===0?(
                <div style={{ padding:'30px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.14em', textTransform:'uppercase' }}>Sem artigos em {subst.cat}</div>
              ):artsCat.map(art=>(
                <div key={art.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)', transition:'background .15s' }}
                  className="tampo-ref-row">
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{art.ref}</span>
                      {art.price>0&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(art.price)} €</span>}
                    </div>
                    <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                    {art.supplier&&<div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)', marginTop:1 }}>{art.supplier}</div>}
                  </div>
                  <button onClick={()=>substituir(art)} className="neo-btn neo-btn-gold" style={{ height:30, padding:'0 14px', fontSize:9, flexShrink:0 }}>Usar este</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PassoHeader({ numero, titulo, sub, cor, icon }) {
  return (
    <div style={{ marginBottom:4 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
        <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:cor?`${cor}22`:'rgba(200,169,110,0.15)', border:`1px solid ${cor||'var(--neo-gold)'}44`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:cor||'var(--neo-gold)' }}>
          {icon||numero}
        </div>
        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--neo-text)' }}>{titulo}</div>
      </div>
      {sub&&<div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', color:'var(--neo-text2)', paddingLeft:38, lineHeight:1.6 }}>{sub}</div>}
    </div>
  )
}

function KitItemRow({ item, onChange, onSubstituir }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderBottom:'1px solid rgba(255,255,255,0.05)', background:item.incluido?'transparent':'rgba(0,0,0,0.12)', opacity:item.incluido?1:0.45, transition:'all .15s' }}>
      <button onClick={()=>onChange(!item.incluido)} style={{ width:20, height:20, borderRadius:4, border:item.incluido?'2px solid var(--neo-gold)':'2px solid rgba(255,255,255,0.15)', background:item.incluido?'var(--neo-gold)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer', fontSize:11, color:'#0f0d08', fontWeight:700 }}>
        {item.incluido&&'✓'}
      </button>
      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.06em', color:'var(--neo-gold)', flexShrink:0, minWidth:65 }}>{item.ref}</span>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.desc}</div>
        {item.cat&&<div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)', marginTop:1 }}>{item.cat}{item.sub?' · '+item.sub:''}</div>}
      </div>
      {item.price>0&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:600, color:'var(--neo-text2)', flexShrink:0 }}>{f2(item.price)} €</span>}
      {item.cat&&(
        <button onClick={onSubstituir} title={`Substituir — ver outros em ${item.cat}`} style={{ background:'var(--neo-bg)', border:'none', borderRadius:'var(--neo-radius-pill)', width:26, height:26, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'var(--neo-shadow-out-sm)', color:'var(--neo-text2)', fontSize:11, flexShrink:0 }}>↗</button>
      )}
    </div>
  )
}

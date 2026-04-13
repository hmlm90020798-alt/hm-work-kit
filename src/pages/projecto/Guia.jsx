import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { addToOrcamento } from '../../hooks/useOrcamento'
import { ESPECIAIS, CATS_IGNORADAS, f2, hexToRgb, resolverComp, kitsParaComp, temItensParaComp } from './constantes'
import { PassoHeader, CompCard, KitItemRow } from './ui'

export default function Guia({
  projId, tipo, tipos, nome,
  passo, setPasso,
  compSel, setCompSel,
  compFeitos, setCompFeitos,
  compActual, setCompActual,
  kitSelId, setKitSelId,
  kitItems, setKitItems,
  orcItems,
  cats,
  showToast, onNavegar,
  onVoltarDetalhe,
}) {
  const [kits,            setKits]            = useState([])
  const [artigos,         setArtigos]         = useState([])
  const [loading,         setLoading]         = useState(false)
  const [kitsEncontrados, setKitsEncontrados] = useState([])
  const [subst,           setSubst]           = useState(null)
  const [confirmSaltar,   setConfirmSaltar]   = useState(false)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), s => setKits(s.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), s => setArtigos(s.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  useEffect(() => {
    if (!compActual || !kits.length) return
    const compObj = resolverComp(compActual, cats)
    if (!compObj) return
    const tipoLabel = tipos.find(t => t.id === tipo)?.label || ''
    const enc = kitsParaComp(compObj, kits, tipoLabel)
    setKitsEncontrados(enc)
    if (enc.length === 1 && !kitSelId) {
      setKitSelId(enc[0].id)
      setKitItems((enc[0].items||[]).map(i=>({...i,incluido:true})))
    }
  }, [compActual, kits, cats, tipo])

  function iniciarComp(nome) {
    setCompActual(nome); setKitSelId(null); setKitItems([]); setPasso('execucao')
  }

  function avancarDeComponentes() {
    if (!compSel.length) { showToast('Selecciona pelo menos um componente'); return }
    const porFazer = compSel.filter(c => !compFeitos.includes(c))
    if (!porFazer.length) { setPasso('resumo'); return }
    iniciarComp(porFazer[0])
  }

  function marcarFeitoEAvancar(nomeComp) {
    const novos = [...compFeitos, nomeComp]
    setCompFeitos(novos)
    const rest = compSel.filter(c => !novos.includes(c))
    if (!rest.length) { setPasso('resumo') }
    else { iniciarComp(rest[0]) }
  }

  function tentarSaltar() {
    const compObj = resolverComp(compActual, cats)
    if (!temItensParaComp(compObj, orcItems, kits, kitSelId)) {
      setConfirmSaltar(true)
    } else {
      marcarFeitoEAvancar(compActual)
    }
  }

  async function confirmarKit() {
    const kitSel = kits.find(k => k.id === kitSelId)
    if (!kitSel) { showToast('Escolhe um kit primeiro'); return }
    setLoading(true)
    for (const item of kitItems.filter(i=>i.incluido)) {
      await addToOrcamento(projId, {
        ref:item.ref, desc:item.desc, cat:item.cat||'', sub:item.sub||'',
        price:item.price||0, supplier:item.supplier||'', link:item.link||'',
        origem: kitSel.name,
      }, ()=>{})
    }
    setLoading(false)
    showToast('"'+kitSel.name+'" - '+kitItems.filter(i=>i.incluido).length+' artigos adicionados')
    marcarFeitoEAvancar(compActual)
  }

  function substituir(artigo) {
    setKitItems(p => p.map((item,i) => i===subst.idx
      ? {...item, artId:artigo.id, ref:artigo.ref, desc:artigo.desc, cat:artigo.cat||'', sub:artigo.sub||'',
          price:artigo.price||0, supplier:artigo.supplier||'', link:artigo.link||'', notes:artigo.notes||'', incluido:true}
      : item))
    setSubst(null)
    showToast('Substituido por '+artigo.ref)
  }

  const progressoPct  = compSel.length > 0 ? Math.round((compFeitos.length/compSel.length)*100) : 0
  const tipoLabel     = tipos.find(t => t.id === tipo)?.label || ''
  const catsFiltradas = cats.filter(cat => !CATS_IGNORADAS.includes(cat.name) && !CATS_IGNORADAS.includes(cat.id))

  function renderCompCard(comp, sel, feito, nKits) {
    const corR = hexToRgb(comp.cor)
    const toggle = () => setCompSel(p => p.includes(comp.label) ? p.filter(x=>x!==comp.label) : [...p,comp.label])
    return (
      <button key={comp.id} onClick={toggle} className="proj-comp-card"
        style={{ display:'flex', alignItems:'center', gap:14, background:sel?'rgba('+corR+',0.1)':'var(--neo-bg2)', border:sel?'1px solid '+comp.cor+'55':'1px solid rgba(255,255,255,0.06)', borderLeft:sel?'3px solid '+comp.cor:'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
        <div style={{ width:20, height:20, borderRadius:5, flexShrink:0, border:sel?'2px solid '+comp.cor:'2px solid rgba(255,255,255,0.15)', background:sel?comp.cor:'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#0f0d08', fontWeight:700 }}>
          {sel && 'v'}
        </div>
        <span style={{ fontSize:18, flexShrink:0 }}>{comp.icon}</span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:sel?comp.cor:'var(--neo-text)' }}>{comp.label}</div>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>
            {nKits > 0 ? nKits+' kit'+(nKits!==1?'s':'')+' disponivel'+(nKits!==1?'s':'') : comp.desc}
          </div>
        </div>
        {feito && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, padding:'2px 8px', borderRadius:'var(--neo-radius-pill)', background:'rgba(200,169,110,0.12)', color:'var(--neo-gold)', border:'1px solid rgba(200,169,110,0.3)', flexShrink:0 }}>feito</span>}
        {!feito && nKits > 0 && (
          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'2px 8px', borderRadius:'var(--neo-radius-pill)', background:'rgba('+corR+',0.15)', color:comp.cor, border:'1px solid '+comp.cor+'33', flexShrink:0 }}>
            {nKits} kit{nKits!==1?'s':''}
          </span>
        )}
      </button>
    )
  }

  function renderSubstModal() {
    if (!subst) return null
    const artsSub   = artigos.filter(a=>a.cat===subst.cat&&subst.sub&&a.sub===subst.sub).sort((a,b)=>(a.ref||'').localeCompare(b.ref||''))
    const artsResto = artigos.filter(a=>a.cat===subst.cat&&!(subst.sub&&a.sub===subst.sub)).sort((a,b)=>(a.ref||'').localeCompare(b.ref||''))
    const artsCat   = [...artsSub, ...artsResto]
    const precoActual = kitItems[subst.idx]?.price || 0
    return (
      <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setSubst(null)}}>
        <div className="neo-modal" style={{ maxWidth:480 }}>
          <div className="neo-modal-head">
            Substituir artigo
            <button className="neo-modal-close" onClick={()=>setSubst(null)}>X</button>
          </div>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
            {subst.sub || subst.cat} - escolhe o artigo substituto
          </div>
          {kitItems[subst.idx] && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--neo-radius-sm)', marginBottom:14 }}>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', flexShrink:0 }}>ACTUAL</span>
              <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{kitItems[subst.idx].ref}</span>
              <span style={{ fontSize:12, fontWeight:300, color:'var(--neo-text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{kitItems[subst.idx].desc}</span>
            </div>
          )}
          <div className="neo-scroll" style={{ maxHeight:'50vh', overflowY:'auto' }}>
            {artsCat.length === 0
              ? <div style={{ padding:'30px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)' }}>Sem artigos em {subst.sub||subst.cat}</div>
              : artsCat.map(art => {
                  const diff = precoActual > 0 ? art.price - precoActual : null
                  return (
                    <div key={art.id} className="tampo-ref-row" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.06em', flexShrink:0 }}>{art.ref}</span>
                          {art.price > 0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--neo-text2)', flexShrink:0 }}>{f2(art.price)} EUR</span>}
                          {diff!==null && diff!==0 && (
                            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, color:diff>0?'#f87171':'#4ade80', flexShrink:0 }}>
                              {diff>0?'+':''}{f2(diff)} EUR
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                      </div>
                      <button onClick={()=>substituir(art)} className="neo-btn neo-btn-gold" style={{ height:30, padding:'0 14px', fontSize:9, flexShrink:0 }}>
                        Usar este
                      </button>
                    </div>
                  )
                })
            }
          </div>
        </div>
      </div>
    )
  }

  function renderSaltarModal() {
    if (!confirmSaltar) return null
    return (
      <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmSaltar(false)}}>
        <div className="neo-modal" style={{ maxWidth:340 }}>
          <div className="neo-modal-head">
            Sem artigos adicionados
            <button className="neo-modal-close" onClick={()=>setConfirmSaltar(false)}>X</button>
          </div>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
            Nao adicionaste nenhum artigo para este componente.<br/>
            <span style={{ fontSize:10 }}>Queres avancar mesmo assim?</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <button className="neo-btn neo-btn-ghost" onClick={()=>{ setConfirmSaltar(false); marcarFeitoEAvancar(compActual) }} style={{ width:'100%', height:44, fontSize:10 }}>
              Sim, avancar sem adicionar
            </button>
            <button className="neo-btn neo-btn-gold" onClick={()=>setConfirmSaltar(false)} style={{ width:'100%', height:44, fontSize:10 }}>
              Voltar e adicionar
            </button>
          </div>
        </div>
      </div>
    )
  }

  function renderPills() {
    return (
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:12, marginBottom:24 }}>
        {compSel.map(n => {
          const c = resolverComp(n, cats)
          const feito  = compFeitos.includes(n)
          const actual = n === compActual
          return (
            <span key={n} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', fontWeight:actual?700:400, background:feito?'rgba(200,169,110,0.12)':actual?'rgba('+hexToRgb(c?.cor||'#c8943a')+',0.18)':'var(--neo-bg2)', color:feito?'var(--neo-gold)':actual?(c?.cor||'var(--neo-gold)'):'var(--neo-text2)', border:actual?'1px solid '+(c?.cor||'var(--neo-gold)')+'44':'1px solid rgba(255,255,255,0.06)' }}>
              {feito?'v ':actual?'> ':''}{c?.label||n}
            </span>
          )
        })}
      </div>
    )
  }

  function renderKitSection(comp, kitSel) {
    const corR = hexToRgb(comp.cor)
    if (kitsEncontrados.length > 1 && !kitSel) {
      return (
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
            Varios kits disponiveis - escolhe qual usar:
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {kitsEncontrados.map(kit => {
              const nIt = (kit.items||[]).length
              const tot = (kit.items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)
              return (
                <button key={kit.id} onClick={()=>{ setKitSelId(kit.id); setKitItems((kit.items||[]).map(i=>({...i,incluido:true}))) }} className="proj-kit-card"
                  style={{ display:'flex', alignItems:'center', gap:14, background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)' }}>{kit.name}</div>
                    {kit.notas && <div style={{ fontSize:11, fontWeight:300, color:'var(--neo-text2)', marginTop:2 }}>{kit.notas}</div>}
                    <div style={{ display:'flex', gap:10, marginTop:4 }}>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)' }}>{nIt} artigo{nIt!==1?'s':''}</span>
                      {tot > 0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:'var(--neo-gold)' }}>{f2(tot)} EUR</span>}
                    </div>
                  </div>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:comp.cor, letterSpacing:'0.1em' }}>Usar</span>
                </button>
              )
            })}
          </div>
        </div>
      )
    }
    if (kitSel) {
      return (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:comp.cor }}>{kitSel.name}</div>
            {kitsEncontrados.length > 1 && (
              <button onClick={()=>{setKitSelId(null);setKitItems([])}} style={{ background:'transparent', border:'none', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
                trocar kit
              </button>
            )}
          </div>
          <div style={{ background:'var(--neo-bg2)', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', overflow:'hidden' }}>
            {kitItems.map((item,idx) => (
              <KitItemRow key={item.artId||idx} item={item}
                onChange={inc=>setKitItems(p=>p.map((x,i)=>i===idx?{...x,incluido:inc}:x))}
                onSubstituir={()=>setSubst({idx,cat:item.cat,sub:item.sub||''})}/>
            ))}
          </div>
          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <button onClick={tentarSaltar} className="neo-btn neo-btn-ghost" style={{ flex:1, height:44, fontSize:10 }}>Saltar</button>
            <button onClick={confirmarKit} disabled={loading} className="neo-btn neo-btn-gold" style={{ flex:2, height:44, fontSize:10 }}>
              {loading ? 'A adicionar...' : 'Adicionar ('+kitItems.filter(i=>i.incluido).length+' artigos)'}
            </button>
          </div>
        </div>
      )
    }
    if (kitsEncontrados.length === 1) {
      return <div style={{ padding:'20px', textAlign:'center', color:'var(--neo-text2)', fontFamily:"'Barlow Condensed'", fontSize:10 }}>A carregar kit...</div>
    }
    return null
  }

  // RENDER COMPONENTES
  if (passo === 'componentes') {
    return (
      <div>
        <PassoHeader numero={2} titulo="O que inclui este projecto?" sub="Selecciona as categorias a tratar"/>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:20 }}>

          {ESPECIAIS.map(comp => {
            const nKits = kitsParaComp(comp, kits, tipoLabel).length
            const sel   = compSel.includes(comp.label)
            const feito = compFeitos.includes(comp.label)
            return renderCompCard(comp, sel, feito, nKits)
          })}

          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'4px 0' }}>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
            <span style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.16em', textTransform:'uppercase', color:'#4a4a42', flexShrink:0 }}>Categorias</span>
            <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.06)' }}/>
          </div>

          {catsFiltradas.map(cat => {
            const nKits = kitsParaComp({ destCat: cat.name, sempreCalculadora: false }, kits, tipoLabel).length
            const comp  = { id:cat.id||cat.name, label:cat.name, icon:cat.icon||'📋', desc:cat.name, cor:cat.cor||'#c8943a' }
            const sel   = compSel.includes(cat.name)
            const feito = compFeitos.includes(cat.name)
            return renderCompCard(comp, sel, feito, nKits)
          })}
        </div>

        {compSel.length > 0 && (
          <div style={{ marginTop:20 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
              Vais tratar por esta ordem:
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
              {compSel.filter(n => !compFeitos.includes(n)).map((n,i) => {
                const c = resolverComp(n, cats)
                return (
                  <span key={n} style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', textTransform:'uppercase', padding:'3px 10px', borderRadius:'var(--neo-radius-pill)', background:'rgba('+hexToRgb(c?.cor||'#c8943a')+',0.15)', color:c?.cor||'var(--neo-gold)', border:'1px solid '+(c?.cor||'#c8943a')+'33' }}>
                    {i+1}. {c?.label||n}
                  </span>
                )
              })}
            </div>
            <button onClick={avancarDeComponentes} className="neo-btn neo-btn-gold"
              style={{ width:'100%', height:48, fontSize:11, letterSpacing:'0.12em', borderRadius:'var(--neo-radius)' }}>
              Comecar
            </button>
          </div>
        )}
      </div>
    )
  }

  // RENDER EXECUCAO
  if (passo === 'execucao' && compActual) {
    const comp      = resolverComp(compActual, cats)
    const kitSel    = kits.find(k => k.id === kitSelId) || null
    const corR      = hexToRgb(comp?.cor || '#c8943a')
    const proximo   = compSel.find(c => c !== compActual && !compFeitos.includes(c))
    const proxLabel = proximo ? (resolverComp(proximo, cats)?.label || proximo) : ''
    const temKits   = kitsEncontrados.length > 0
    const compPorFazer = compSel.filter(c => !compFeitos.includes(c))

    if (!comp) return null

    return (
      <div>
        {compSel.length > 0 && (
          <div style={{ height:3, background:'var(--neo-bg2)', margin:'0 -16px 20px' }}>
            <div style={{ height:'100%', width:progressoPct+'%', background:'linear-gradient(90deg,var(--neo-gold2),var(--neo-gold))', transition:'width .4s ease' }}/>
          </div>
        )}

        <PassoHeader numero={compFeitos.length+1} titulo={comp.label} sub={''} cor={comp.cor} icon={comp.icon}/>

        {renderPills()}

        {comp.sempreCalculadora && (
          <CompCard comp={comp} corR={corR}>
            <p>Abre a calculadora ANIGRACO, faz o calculo e guarda - depois volta aqui para continuar.</p>
            <button onClick={()=>onNavegar?.('tampos',null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11, letterSpacing:'0.12em' }}>
              Abrir calculadora
            </button>
          </CompCard>
        )}

        {comp.destino === 'maodeobra' && (
          <CompCard comp={comp} corR={corR}>
            <p>Selecciona os servicos de instalacao na Mao de Obra e volta aqui.</p>
            <button onClick={()=>onNavegar?.('maodeobra', null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11, letterSpacing:'0.12em' }}>
              Abrir Mao de Obra
            </button>
          </CompCard>
        )}

        {!comp.sempreCalculadora && comp.destino !== 'maodeobra' && temKits && renderKitSection(comp, kitSel)}

        {!comp.sempreCalculadora && comp.destino !== 'maodeobra' && !temKits && (
          <CompCard comp={comp} corR={corR}>
            {comp.kitBase
              ? <p>Nao existem kits para este tipo de projecto. Cria um kit em "Kits" com o contexto "{tipoLabel}".</p>
              : <p>Selecciona os artigos de "{comp.destCat||comp.label}" na Biblioteca e volta aqui.</p>
            }
            {!comp.kitBase && (
              <button onClick={()=>onNavegar?.('biblioteca', comp.destCat||comp.label)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11, letterSpacing:'0.12em' }}>
                Abrir {comp.label}
              </button>
            )}
          </CompCard>
        )}

        {!comp.sempreCalculadora && comp.destino !== 'maodeobra' && (
          <button onClick={tentarSaltar} className="neo-btn neo-btn-ghost"
            style={{ width:'100%', height:44, fontSize:10, marginTop:(temKits && kitSel) ? 0 : 12 }}>
            {compPorFazer.length === 1 ? 'v Concluido - ver resumo' : 'v Feito - proximo: '+proxLabel}
          </button>
        )}
        {(comp.sempreCalculadora || comp.destino === 'maodeobra') && (
          <button onClick={tentarSaltar} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:44, fontSize:10, marginTop:12 }}>
            {compPorFazer.length === 1 ? 'v Concluido - ver resumo' : 'v Feito - proximo: '+proxLabel}
          </button>
        )}

        {renderSubstModal()}
        {renderSaltarModal()}
      </div>
    )
  }

  // RENDER RESUMO
  if (passo === 'resumo') {
    const tipoActual2 = tipos.find(t => t.id === tipo)
    const totalOrc    = orcItems.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0)
    return (
      <div>
        <PassoHeader numero="v" titulo="Projecto concluido" sub={tipoActual2 ? tipoActual2.icon+' '+tipoActual2.label : ''} cor="var(--neo-gold)"/>
        {totalOrc > 0 && (
          <div style={{ background:'rgba(200,169,110,0.08)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius)', padding:'20px 24px', textAlign:'center', marginTop:20, marginBottom:20 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:8 }}>Total PVP indicativo</div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:36, fontWeight:700, color:'var(--neo-gold)', textShadow:'0 0 20px rgba(200,169,110,0.3)' }}>{f2(totalOrc)} EUR</div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text2)', letterSpacing:'0.1em', marginTop:6 }}>{orcItems.length} item{orcItems.length!==1?'s':''} no orcamento</div>
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:24 }}>
          {compFeitos.map(n => {
            const c = resolverComp(n, cats)
            return (
              <div key={n} style={{ display:'flex', alignItems:'center', gap:12, background:'var(--neo-bg2)', borderRadius:'var(--neo-radius-sm)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid '+(c?.cor||'var(--neo-gold)'), padding:'10px 14px' }}>
                <span style={{ fontSize:16 }}>{c?.icon}</span>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:c?.cor||'var(--neo-gold)' }}>{c?.label||n}</span>
                <span style={{ marginLeft:'auto', fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-gold)' }}>v</span>
              </div>
            )
          })}
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={()=>onNavegar?.('orcamentos')} className="neo-btn neo-btn-gold" style={{ width:'100%', height:48, fontSize:11 }}>
            Ver orcamento completo
          </button>
          <button onClick={onVoltarDetalhe} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:44, fontSize:10 }}>
            Voltar ao projecto
          </button>
        </div>
      </div>
    )
  }

  return null
}

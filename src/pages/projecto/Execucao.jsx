import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { addToOrcamento } from '../../hooks/useOrcamento'
import { f2, hexToRgb, kitsParaCategoria } from './constantes'
import { CompCard, KitItemRow } from './ui'

// Ecrã de execucao de uma tarefa
// tarefa: { tipo, ref, nome, kitId?, kitItems?, destCat?, destino?, sempreCalculadora? }

export default function Execucao({
  projId, tarefa,
  kitSelId, setKitSelId,
  kitItems, setKitItems,
  orcItems,
  showToast, onNavegar,
  onConcluir, // volta ao detalhe
}) {
  const [kits,    setKits]    = useState([])
  const [artigos, setArtigos] = useState([])
  const [loading, setLoading] = useState(false)
  const [kitsDisponiveis, setKitsDisponiveis] = useState([])
  const [subst,   setSubst]   = useState(null)
  const [confirmSaltar, setConfirmSaltar] = useState(false)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'), s => setKits(s.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'artigos'), s => setArtigos(s.docs.map(d=>({id:d.id,...d.data()}))))
    return () => { u1(); u2() }
  }, [])

  // Carregar kit se for kit directo ou encontrar kits para categoria
  useEffect(() => {
    if (!tarefa || !kits.length) return
    if (tarefa.tipo === 'kit' && tarefa.kitId) {
      const kit = kits.find(k => k.id === tarefa.kitId)
      if (kit) {
        setKitsDisponiveis([kit])
        if (!kitSelId) {
          setKitSelId(kit.id)
          setKitItems((kit.items||[]).map(i=>({...i,incluido:true})))
        }
      }
    } else if (tarefa.tipo === 'categoria' && tarefa.destCat) {
      const enc = kitsParaCategoria(tarefa.destCat, kits, '')
      setKitsDisponiveis(enc)
      if (enc.length === 1 && !kitSelId) {
        setKitSelId(enc[0].id)
        setKitItems((enc[0].items||[]).map(i=>({...i,incluido:true})))
      }
    }
  }, [tarefa, kits])

  if (!tarefa) return null

  const kitSel = kits.find(k => k.id === kitSelId) || null
  const cor    = tarefa.tipo === 'kit' ? '#c8943a'
               : tarefa.destino === 'maodeobra' ? '#9a7acc'
               : tarefa.sempreCalculadora ? '#4a8fa8'
               : '#c8943a'
  const corR   = hexToRgb(cor)
  const icon   = tarefa.tipo === 'kit' ? '📦'
               : tarefa.destino === 'maodeobra' ? '🛠'
               : tarefa.sempreCalculadora ? '⬛'
               : '📋'

  const compFake = { id:tarefa.ref, label:tarefa.nome, icon, cor, desc:tarefa.nome }
  const temKits  = kitsDisponiveis.length > 0

  function temItens() {
    if (tarefa.sempreCalculadora) return orcItems.some(i => i.origem === 'Tampos')
    if (tarefa.destino === 'maodeobra') return orcItems.some(i =>
      (i.origem||'').toLowerCase().includes('mao') || (i.origem||'').toLowerCase().includes('instalac'))
    if (kitSel) return orcItems.some(i => i.origem === kitSel.name)
    if (tarefa.destCat) {
      const cat = tarefa.destCat.toLowerCase()
      return orcItems.some(i =>
        (i.cat||'').toLowerCase() === cat || (i.origem||'').toLowerCase() === cat)
    }
    return false
  }

  async function confirmarKit() {
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
    onConcluir()
  }

  function substituir(artigo) {
    setKitItems(p => p.map((item,i) => i===subst.idx
      ? {...item, artId:artigo.id, ref:artigo.ref, desc:artigo.desc, cat:artigo.cat||'', sub:artigo.sub||'',
          price:artigo.price||0, supplier:artigo.supplier||'', link:artigo.link||'', notes:artigo.notes||'', incluido:true}
      : item))
    setSubst(null)
    showToast('Substituido por '+artigo.ref)
  }

  return (
    <div>
      {/* CALCULADORA */}
      {tarefa.sempreCalculadora && (
        <CompCard comp={compFake} corR={corR}>
          <p>Abre a calculadora ANIGRACO, faz o calculo e guarda - depois volta aqui.</p>
          <button onClick={()=>onNavegar?.('tampos',null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11 }}>
            Abrir calculadora
          </button>
        </CompCard>
      )}

      {/* MAO DE OBRA */}
      {tarefa.destino === 'maodeobra' && (
        <CompCard comp={compFake} corR={corR}>
          <p>Selecciona os servicos de instalacao na Mao de Obra e volta aqui.</p>
          <button onClick={()=>onNavegar?.('maodeobra',null)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11 }}>
            Abrir Mao de Obra
          </button>
        </CompCard>
      )}

      {/* KIT */}
      {!tarefa.sempreCalculadora && tarefa.destino !== 'maodeobra' && temKits && (
        <div>
          {kitsDisponiveis.length > 1 && !kitSel && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
                Varios kits disponiveis:
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {kitsDisponiveis.map(kit => {
                  const nIt=(kit.items||[]).length
                  const tot=(kit.items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)
                  return (
                    <button key={kit.id} onClick={()=>{ setKitSelId(kit.id); setKitItems((kit.items||[]).map(i=>({...i,incluido:true}))) }} className="proj-kit-card"
                      style={{ display:'flex', alignItems:'center', gap:14, background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.06)', borderLeft:'3px solid transparent', borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)', padding:'14px 16px', cursor:'pointer', textAlign:'left', width:'100%' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)' }}>{kit.name}</div>
                        {kit.notas && <div style={{ fontSize:11, fontWeight:300, color:'var(--neo-text2)', marginTop:2 }}>{kit.notas}</div>}
                        <div style={{ display:'flex', gap:10, marginTop:4 }}>
                          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)' }}>{nIt} artigo{nIt!==1?'s':''}</span>
                          {tot>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:600, color:'var(--neo-gold)' }}>{f2(tot)} EUR</span>}
                        </div>
                      </div>
                      <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:cor, letterSpacing:'0.1em' }}>Usar</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          {kitSel && (
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:cor }}>{kitSel.name}</div>
                {kitsDisponiveis.length > 1 && (
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
                <button onClick={()=>setConfirmSaltar(true)} className="neo-btn neo-btn-ghost" style={{ flex:1, height:44, fontSize:10 }}>Saltar</button>
                <button onClick={confirmarKit} disabled={loading} className="neo-btn neo-btn-gold" style={{ flex:2, height:44, fontSize:10 }}>
                  {loading ? 'A adicionar...' : 'Adicionar ('+kitItems.filter(i=>i.incluido).length+' artigos)'}
                </button>
              </div>
            </div>
          )}
          {!kitSel && kitsDisponiveis.length === 1 && (
            <div style={{ padding:'20px', textAlign:'center', color:'var(--neo-text2)', fontFamily:"'Barlow Condensed'", fontSize:10 }}>A carregar kit...</div>
          )}
        </div>
      )}

      {/* SEM KITS - vai a biblioteca */}
      {!tarefa.sempreCalculadora && tarefa.destino !== 'maodeobra' && !temKits && tarefa.destCat && (
        <CompCard comp={compFake} corR={corR}>
          <p>Selecciona os artigos de "{tarefa.destCat}" na Biblioteca e volta aqui.</p>
          <button onClick={()=>onNavegar?.('biblioteca', tarefa.destCat)} className="neo-btn neo-btn-gold" style={{ height:48, padding:'0 32px', fontSize:11 }}>
            Abrir {tarefa.nome}
          </button>
        </CompCard>
      )}

      {/* BOTAO CONCLUIR */}
      {!tarefa.sempreCalculadora && tarefa.destino !== 'maodeobra' && (
        <button onClick={()=>{ if(!temItens()){ setConfirmSaltar(true) } else { onConcluir() } }}
          className="neo-btn neo-btn-ghost"
          style={{ width:'100%', height:44, fontSize:10, marginTop:(temKits && kitSel) ? 0 : 12 }}>
          v Concluido - voltar ao projecto
        </button>
      )}
      {(tarefa.sempreCalculadora || tarefa.destino === 'maodeobra') && (
        <button onClick={onConcluir} className="neo-btn neo-btn-ghost" style={{ width:'100%', height:44, fontSize:10, marginTop:12 }}>
          v Concluido - voltar ao projecto
        </button>
      )}

      {/* MODAL SUBSTITUICAO */}
      {subst && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setSubst(null)}}>
          <div className="neo-modal" style={{ maxWidth:480 }}>
            <div className="neo-modal-head">
              Substituir artigo
              <button className="neo-modal-close" onClick={()=>setSubst(null)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:10 }}>
              {subst.sub || subst.cat}
            </div>
            {kitItems[subst.idx] && (
              <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background:'rgba(200,169,110,0.06)', border:'1px solid rgba(200,169,110,0.2)', borderRadius:'var(--neo-radius-sm)', marginBottom:14 }}>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', flexShrink:0 }}>ACTUAL</span>
                <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', flexShrink:0 }}>{kitItems[subst.idx].ref}</span>
                <span style={{ fontSize:12, fontWeight:300, color:'var(--neo-text2)', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{kitItems[subst.idx].desc}</span>
              </div>
            )}
            <div className="neo-scroll" style={{ maxHeight:'50vh', overflowY:'auto' }}>
              {(() => {
                const precoActual = kitItems[subst.idx]?.price || 0
                const artsSub   = artigos.filter(a=>a.cat===subst.cat&&subst.sub&&a.sub===subst.sub).sort((a,b)=>(a.ref||'').localeCompare(b.ref||''))
                const artsResto = artigos.filter(a=>a.cat===subst.cat&&!(subst.sub&&a.sub===subst.sub)).sort((a,b)=>(a.ref||'').localeCompare(b.ref||''))
                const artsCat   = [...artsSub, ...artsResto]
                if (artsCat.length === 0) return <div style={{ padding:'30px 20px', textAlign:'center', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)' }}>Sem artigos em {subst.cat}</div>
                return artsCat.map(art => {
                  const diff = precoActual > 0 ? art.price - precoActual : null
                  return (
                    <div key={art.id} className="tampo-ref-row" style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
                          <span style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, color:'var(--neo-gold)', flexShrink:0 }}>{art.ref}</span>
                          {art.price>0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:11, color:'var(--neo-text2)', flexShrink:0 }}>{f2(art.price)} EUR</span>}
                          {diff!==null&&diff!==0&&<span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:700, color:diff>0?'#f87171':'#4ade80', flexShrink:0 }}>{diff>0?'+':''}{f2(diff)} EUR</span>}
                        </div>
                        <div style={{ fontSize:12, fontWeight:300, color:'var(--neo-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{art.desc}</div>
                      </div>
                      <button onClick={()=>substituir(art)} className="neo-btn neo-btn-gold" style={{ height:30, padding:'0 14px', fontSize:9, flexShrink:0 }}>Usar este</button>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SALTAR */}
      {confirmSaltar && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmSaltar(false)}}>
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head">
              Sem artigos adicionados
              <button className="neo-modal-close" onClick={()=>setConfirmSaltar(false)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              Nao adicionaste nenhum artigo.<br/>
              <span style={{ fontSize:10 }}>Queres voltar mesmo assim?</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="neo-btn neo-btn-ghost" onClick={()=>{ setConfirmSaltar(false); onConcluir() }} style={{ width:'100%', height:44, fontSize:10 }}>
                Sim, voltar sem adicionar
              </button>
              <button className="neo-btn neo-btn-gold" onClick={()=>setConfirmSaltar(false)} style={{ width:'100%', height:44, fontSize:10 }}>
                Continuar a adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

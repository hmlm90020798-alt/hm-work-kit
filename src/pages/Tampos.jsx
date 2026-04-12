import React, { useState, useEffect } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, setDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore'
import '../styles/tampos.css'
import ImportModal from '../components/ImportModal'
import { addToOrcamento } from '../hooks/useOrcamento'
import { ANIGRACO, TRANSPORTE, TIPOS_PEDRA, TIPOS_ALL } from '../data/anigracoData'
import { calcPeca, novoProjeto, totProj, uuid, f2, c1fmt } from '../hooks/useTampos'

export default function Tampos({showToast, abrirCalculo, onAbrirCalculoDone, copiedRefs, markCopied}){
  const [calculos,setCalculos]=useState([])
  const [orcamentos,setOrcamentos]=useState([])
  const [current,setCurrent]=useState(null)
  const [importModal,setImportModal]=useState(false)
  const [filtroTipo,setFiltroTipo]=useState('TODOS')
  const [matSearch,setMatSearch]=useState('')
  const [matSort,setMatSort]=useState('pvp_asc')

  // Abrir calculo vindo de Orçamentos
  useEffect(()=>{
    if(abrirCalculo){
      setCurrent(abrirCalculo)
      onAbrirCalculoDone?.()
    }
  },[abrirCalculo])

  useEffect(()=>{
    const u1=onSnapshot(collection(db,'tampos'),snap=>setCalculos(snap.docs.map(d=>({id:d.id,...d.data()}))),
      ()=>showToast('Erro ao carregar cálculos'))
    const u2=onSnapshot(collection(db,'orcamentos'),snap=>setOrcamentos(snap.docs.map(d=>({id:d.id,...d.data()}))),
      ()=>{})
    return()=>{u1();u2()}
  },[])

  // Materiais filtrados para a listagem
  const todosOsMateriais = TIPOS_ALL.flatMap(tipo=>
    (ANIGRACO[tipo]?.materiais||[]).map(m=>({...m,tipo}))
  )
  const matsFiltrados = todosOsMateriais
    .filter(m=>{
      const tipoOk = filtroTipo==='TODOS' || m.tipo===filtroTipo
      const searchOk = !matSearch || m.desc.toLowerCase().includes(matSearch.toLowerCase()) || m.tipo.toLowerCase().includes(matSearch.toLowerCase()) || (m.grupo||'').toLowerCase().includes(matSearch.toLowerCase())
      return tipoOk && searchOk
    })
    .sort((a,b)=>{
      const pvpA=Math.min(...Object.values(a.espessuras).map(e=>e.pvp))
      const pvpB=Math.min(...Object.values(b.espessuras).map(e=>e.pvp))
      return matSort==='pvp_desc'?pvpB-pvpA:pvpA-pvpB
    })

  // Actualizar item do tampo no orçamento se já existir
  const sincronizarComOrcamento=async(tampoId,pvp,pecas,nome)=>{
    try{
      const orcRef=doc(db,'orcamento_ativo','ativo')
      const snap=await getDoc(orcRef)
      if(!snap.exists())return
      const orc=snap.data()
      const items=orc.items||[]
      const idx=items.findIndex(i=>i.tampoId===tampoId)
      if(idx===-1)return
      const item=items[idx]
      const newItems=items.map((i,n)=>n===idx?{
        ...i,
        price: pvp,
        desc: (pecas||[]).map(p=>p.desc||p.label).filter(Boolean).join(' + '),
        ref: nome||item.ref,
      }:i)
      await setDoc(orcRef,{...orc,items:newItems})
    }catch{}
  }

  if(current) return <Calculadora current={current} setCurrent={setCurrent}
    orcamentos={orcamentos} showToast={showToast} markCopied={markCopied} copiedRefs={copiedRefs}
    sincronizarComOrcamento={sincronizarComOrcamento}
    onBack={async(dadosActuais)=>{
      // dadosActuais vem da Calculadora com o estado mais recente
      const c = dadosActuais || current
      if(c.nome?.trim()||(c.pecas||[]).some(p=>p.desc)){
        try {
          const data={...c};delete data.id
          if(c.id){
            await setDoc(doc(db,'tampos',c.id),data)
            await sincronizarComOrcamento(c.id, dadosActuais?.pvp||0, c.pecas, c.nome)
          }
          else{const r=await addDoc(collection(db,'tampos'),data);setCurrent(c=>({...c,id:r.id}))}
        } catch { showToast('Erro ao guardar cálculo') }
      }
      setCurrent(null)
    }}/>

  return(<>
    <div className="neo-screen">
      <div className="neo-topbar">
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text)'}}>Tampos</span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <AnigracoRef showToast={showToast}/>
          <button className="neo-btn neo-btn-ghost" style={{height:26,fontSize:9,border:'1px solid var(--neo-gold2)',color:'var(--neo-gold)',borderRadius:'var(--neo-radius-pill)',padding:'0 12px'}}
            onClick={()=>setImportModal(true)}>↑ Import</button>
          {calculos.length>0&&(
            <button className="neo-btn neo-btn-danger" style={{height:26,fontSize:8}}
              onClick={async()=>{
                if(confirm('Limpar todos os cálculos?')){
                  try {
                    await Promise.all(calculos.map(c=>deleteDoc(doc(db,'tampos',c.id))))
                  } catch { showToast('Erro ao limpar cálculos') }
                }
              }}>
              Limpar tudo
            </button>
          )}
        </div>
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto'}}>

        {/* ── Cálculos guardados ── */}
        {calculos.length>0&&(
          <div style={{padding:'10px 14px 4px'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:8}}>
              Cálculos guardados
            </div>
            {calculos.map(c=>{
              const res=totProj(c)
              return(
                <div key={c.id} className="neo-surface tampo-calc" style={{padding:'11px 14px',marginBottom:6,display:'flex',alignItems:'center',gap:10,cursor:'pointer'}}
                  onClick={()=>setCurrent({...c})}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--neo-text)',marginBottom:1}}>{c.nome||'Sem nome'}</div>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',letterSpacing:'0.08em'}}>{c.tipo}{c.contacto?' · '+c.contacto:''}</div>
                  </div>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,color:'var(--neo-gold)',flexShrink:0}}>{f2(res.pvp)} €</div>
                  <button onClick={e=>{e.stopPropagation();if(confirm('Eliminar?'))deleteDoc(doc(db,'tampos',c.id)).catch(()=>showToast('Erro ao eliminar'))}}
                    style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13,padding:'4px',lineHeight:1,flexShrink:0}}>✕</button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Catálogo de materiais ── */}
        <div style={{padding:'10px 14px 4px'}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:10}}>
            Catálogo Anigraco
          </div>

          {/* Filtro por tipo + ordenação */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
            {['TODOS',...TIPOS_ALL].map(t=>(
              <button key={t} className={`neo-chip-sm ${filtroTipo===t?'active':''}`}
                onClick={()=>setFiltroTipo(t)}>
                {t==='TODOS'?'Todos':t.charAt(0)+t.slice(1).toLowerCase()}
              </button>
            ))}
            <div style={{marginLeft:'auto',display:'flex',gap:4}}>
              {[{v:'pvp_asc',l:'Preço ↑'},{v:'pvp_desc',l:'Preço ↓'}].map(o=>(
                <button key={o.v} className={`neo-chip-sm ${matSort===o.v?'active':''}`}
                  onClick={()=>setMatSort(o.v)}>{o.l}</button>
              ))}
            </div>
          </div>

          {/* Pesquisa */}
          <div style={{position:'relative',marginBottom:10}}>
            <input className="neo-input" value={matSearch} onChange={e=>setMatSearch(e.target.value)}
              placeholder="Pesquisar material…" style={{paddingRight:36}}/>
            {matSearch&&<button onClick={()=>setMatSearch('')}
              style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13}}>✕</button>}
          </div>

          {/* Lista de materiais */}
          <div style={{marginBottom:20}}>
            {matsFiltrados.map((m,i)=>{
              const esps=Object.entries(m.espessuras)
              const pvpMin=Math.min(...esps.map(([,v])=>v.pvp))
              const pvpMax=Math.max(...esps.map(([,v])=>v.pvp))
              return(
                <div key={i} className="tampo-mat" style={{
                  background:'var(--neo-bg2)',borderRadius:'var(--neo-radius-sm)',
                  boxShadow:'var(--neo-shadow-out-sm)',marginBottom:5,
                  padding:'11px 14px',display:'flex',alignItems:'center',gap:12
                }}>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--neo-text)',marginBottom:2}}>
                      {m.desc}
                    </div>
                    <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
                      <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-gold2)',background:'var(--neo-bg)',padding:'2px 7px',borderRadius:'var(--neo-radius-pill)'}}>
                        {m.tipo.charAt(0)+m.tipo.slice(1).toLowerCase()}
                      </span>
                      {m.grupo&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'var(--neo-text2)',letterSpacing:'0.1em'}}>
                        Grupo {m.grupo}
                      </span>}
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:600,color:'var(--neo-gold)'}}>
                      {pvpMin===pvpMax?f2(pvpMin):`${f2(pvpMin)}–${f2(pvpMax)}`} €/m²
                    </div>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'var(--neo-text2)',marginTop:2}}>
                      {esps.map(([e])=>e).join(' · ')}
                    </div>
                  </div>
                  <button className="neo-btn neo-btn-ghost" style={{height:26,fontSize:9,flexShrink:0,borderRadius:'var(--neo-radius-pill)',border:'1px solid rgba(255,255,255,0.1)',padding:'0 10px'}}
                    onClick={()=>{const p=novoProjeto(m.tipo);p.pecas[0].desc=m.desc;p.pecas[0].grupo=m.grupo;setCurrent(p)}}>
                    Calcular
                  </button>
                </div>
              )
            })}
            {matsFiltrados.length===0&&(
              <div style={{padding:'30px 0',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
                Sem resultados
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <ImportModal open={importModal} onClose={()=>setImportModal(false)} mode="tampos" showToast={showToast}/>
  </>)
}

// ── Calculadora ────────────────────────────────────────────────────────────
function Calculadora({current,setCurrent,showToast,onBack,sincronizarComOrcamento,markCopied,copiedRefs}){
  const [tab,setTab]=useState('pecas')
  const [matModal,setMatModal]=useState(null) // 'A' | 'B'
  const [formulaOpen,setFormulaOpen]=useState(false)
  const [margem,setMargem]=useState(25)
  const [modoComp,setModoComp]=useState(false)

  const upd=(k,v)=>setCurrent(c=>({...c,[k]:v}))
  const updPeca=(id,k,v)=>upd('pecas',current.pecas.map(p=>p.id===id?{...p,[k]:v}:p))
  const addPeca=()=>{const n=(current.pecas||[]).length+1;upd('pecas',[...current.pecas,{id:uuid(),label:`Peça ${n}`,tipo:current.tipo,desc:'',grupo:null,espessura:'2cm',segmentos:[{id:uuid(),label:'Seg.1',comp:'',larg:''}],acabamentos:[]}])}
  const delPeca=(id)=>{if(current.pecas.length<=1){showToast('Mínimo 1 peça');return};upd('pecas',current.pecas.filter(p=>p.id!==id))}
  const addSeg=(pid)=>{const p=current.pecas.find(x=>x.id===pid);const n=(p.segmentos||[]).length+1;updPeca(pid,'segmentos',[...(p.segmentos||[]),{id:uuid(),label:`Seg.${n}`,comp:'',larg:''}])}
  const updSeg=(pid,sid,k,v)=>{const p=current.pecas.find(x=>x.id===pid);updPeca(pid,'segmentos',p.segmentos.map(s=>s.id===sid?{...s,[k]:v}:s))}
  const delSeg=(pid,sid)=>{const p=current.pecas.find(x=>x.id===pid);if((p.segmentos||[]).length<=1){showToast('Mín. 1');return};updPeca(pid,'segmentos',p.segmentos.filter(s=>s.id!==sid))}
  const toggleAcab=(pid,acab)=>{const p=current.pecas.find(x=>x.id===pid);const ex=(p.acabamentos||[]).find(a=>a.nome===acab.nome);updPeca(pid,'acabamentos',ex?(p.acabamentos||[]).filter(a=>a.nome!==acab.nome):[...(p.acabamentos||[]),{...acab,qty:''}])}
  const updAcabQty=(pid,nome,qty)=>{const p=current.pecas.find(x=>x.id===pid);updPeca(pid,'acabamentos',(p.acabamentos||[]).map(a=>a.nome===nome?{...a,qty}:a))}

  // Opção B (comparação) — herda segmentos da Opção A
  const activarCompB=()=>{
    const pecasB=current.pecas.map(p=>({...p,id:uuid(),desc:'',grupo:null,espessura:'2cm',acabamentos:[...p.acabamentos]}))
    upd('opcaoB',{pecas:pecasB,tipo:current.tipo})
  }
  const updPecaB=(id,k,v)=>upd('opcaoB',{...current.opcaoB,pecas:(current.opcaoB?.pecas||[]).map(p=>p.id===id?{...p,[k]:v}:p)})

  const totGeral=(pecas,transporte,desconto,descontoTipo)=>{
    let pvp=0,c1=0
    ;(pecas||[]).forEach(p=>{const r=calcPeca(p);pvp+=r.pvp;c1+=r.c1raw})
    if(transporte){pvp+=transporte.pvp;c1+=transporte.c1}
    const desc=parseFloat(desconto)>0?(descontoTipo==='%'?pvp*(parseFloat(desconto)/100):parseFloat(desconto)):0
    return{pvp:pvp-desc,c1,desc,pvpBruto:pvp}
  }
  const TA=totGeral(current.pecas,current.transporte,current.desconto,current.descontoTipo)
  const TB=current.opcaoB?totGeral(current.opcaoB?.pecas,current.transporte,current.desconto,current.descontoTipo):null

  const save=async()=>{
    if(!current.nome.trim()){showToast('Nome obrigatório');return}
    const data={...current};delete data.id
    if(current.id){
      await setDoc(doc(db,'tampos',current.id),data)
      await sincronizarComOrcamento?.(current.id, TA.pvp, current.pecas, current.nome)
    }
    else{const r=await addDoc(collection(db,'tampos'),data);setCurrent(c=>({...c,id:r.id}))}
    showToast('Guardado')
  }

  const limparDados=()=>{
    if(!confirm('Limpar todos os dados deste cálculo?'))return
    setCurrent(novoProjeto(current.tipo))
  }

  const gerarPDF=()=>{
    const hoje=new Date().toLocaleDateString('pt-PT')
    const linhas=(pecas,label)=>{
      let h=''
      ;(pecas||[]).forEach(p=>{
        const r=calcPeca(p)
        h+=`<div class="sec"><div class="sec-t">${p.label}${p.desc?' — '+p.desc:''}</div>`
        if(r.m2>0&&r.esp)h+=`<div class="row"><span>Tampo ${p.espessura} · ${r.m2.toFixed(3)} m² × ${f2(r.esp.pvp)} €/m²</span><span><b>${f2(r.pvpTampo)} €</b></span></div>`
        ;(p.acabamentos||[]).filter(a=>parseFloat(a.qty)>0).forEach(a=>h+=`<div class="row"><span>${a.nome} ${a.unidade==='ml'?a.qty+' ml':'×'+a.qty}</span><span><b>${f2((a.pvp||0)*(parseFloat(a.qty)||0))} €</b></span></div>`)
        h+=`</div>`
      })
      return h
    }
    let h=`<html><head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;margin:0;padding:32px;font-size:13px;color:#111;background:#fff}
.hdr{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:20px}
.logo{font-size:22px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase}
.logo span{color:#c8a96e}
.ind{background:#fff8e8;border:1px solid #c8a96e;padding:8px;text-align:center;font-size:11px;color:#8a6e3a;margin-bottom:20px}
.sec{margin-bottom:16px}
.sec-t{font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#888;border-bottom:1px solid #eee;padding-bottom:4px;margin-bottom:8px}
.row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f5f5f5;font-size:12px}
.tot-box{background:#f5f5f5;padding:16px 20px;display:flex;justify-content:space-between;align-items:center;margin-top:20px}
.comp{display:grid;grid-template-columns:1fr 1fr;gap:24px}
.comp-head{font-weight:700;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:12px;color:#333}
</style></head><body>`
    h+=`<div class="hdr"><div class="logo">HM·<span>Work</span>·Kit</div><div style="font-size:11px;color:#666;text-align:right"><b>${current.nome||'Projecto de Tampo'}</b>${current.contacto?`<br>${current.contacto}`:''}<br>${hoje}</div></div>`
    h+=`<div class="ind">DOCUMENTO INDICATIVO — SUJEITO A CONFIRMAÇÃO</div>`
    if(current.opcaoB){
      h+=`<div class="comp"><div><div class="comp-head">Opção A</div>${linhas(current.pecas,'A')}</div><div><div class="comp-head">Opção B</div>${linhas(current.opcaoB?.pecas,'B')}</div></div>`
      if(current.transporte)h+=`<div class="sec"><div class="sec-t">Transporte</div><div class="row"><span>${current.transporte.label}</span><span><b>${f2(current.transporte.pvp)} €</b></span></div></div>`
      h+=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:16px">
        <div class="tot-box"><span style="font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#888">Total Opção A</span><span style="font-size:22px;font-weight:800">${f2(TA.pvp)} €</span></div>
        <div class="tot-box"><span style="font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#888">Total Opção B</span><span style="font-size:22px;font-weight:800">${f2(TB.pvp)} €</span></div>
      </div>`
    }else{
      h+=linhas(current.pecas,'')
      if(current.transporte)h+=`<div class="sec"><div class="sec-t">Transporte</div><div class="row"><span>${current.transporte.label}</span><span><b>${f2(current.transporte.pvp)} €</b></span></div></div>`
      if(TA.desc>0)h+=`<div class="row"><span>Desconto${current.descontoTipo==='%'?' ('+current.desconto+'%)':''}</span><span>− ${f2(TA.desc)} €</span></div>`
      h+=`<div class="tot-box"><span style="font-size:9px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#888">Total PVP</span><span style="font-size:26px;font-weight:800">${f2(TA.pvp)} €</span></div>`
    }
    if(current.notas)h+=`<div style="font-size:11px;color:#888;margin-top:16px;font-style:italic">${current.notas}</div>`
    h+=`</body></html>`
    const w=window.open('','_blank');w.document.write(h);w.document.close();setTimeout(()=>w.print(),400)
  }

  // ── Render peça ──────────────────────────────────────────────────────────
  const renderPeca=(p,isB=false)=>{
    const res=calcPeca(p)
    const isPedra=TIPOS_PEDRA.includes(p.tipo)
    const mat=ANIGRACO[p.tipo]
    const ref=mat?.materiais.find(m=>m.desc===p.desc&&m.grupo===p.grupo)||mat?.materiais.find(m=>m.desc===p.desc)
    const espDisp=ref?Object.keys(ref.espessuras):[]
    const acabDisp=mat?.acabamentos||[]
    const updFn=isB?updPecaB:updPeca

    return(
      <div key={p.id} className="neo-peca">
        <div className="neo-peca-header">
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <input value={p.label} onChange={e=>updFn(p.id,'label',e.target.value)}
              style={{background:'transparent',border:'none',fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)',outline:'none',width:70}}/>
            {res.m2>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)'}}>{res.m2.toFixed(3)} m²</span>}
            {res.pvp>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:12,color:'var(--neo-gold)'}}>{f2(res.pvp)} €</span>}
          </div>
          {!isB&&current.pecas.length>1&&<button onClick={()=>delPeca(p.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:13}}>✕</button>}
        </div>

        <div className="neo-peca-body">
          {/* Material */}
          <button className="neo-mat-btn" onClick={()=>setMatModal(isB?'B':p.id)} style={{marginBottom:12}}>
            <div>
              <label className="neo-label" style={{marginBottom:4,pointerEvents:'none'}}>Material</label>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:15,fontWeight:600,letterSpacing:'0.08em',textTransform:'uppercase',color:p.desc?'var(--neo-text)':'var(--neo-text3)'}}>
                {p.desc?`${p.tipo.charAt(0)+p.tipo.slice(1).toLowerCase()} — ${p.desc}`:'Seleccionar →'}
              </div>
              {p.grupo&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:2}}>Grupo {p.grupo}</div>}
            </div>
            {res.esp&&<div style={{textAlign:'right',flexShrink:0}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)'}}>PVP/m²</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,color:'var(--neo-gold)',fontWeight:600}}>{f2(res.esp.pvp)} €</div>
            </div>}
          </button>

          {/* Espessuras */}
          {espDisp.length>0&&<div style={{marginBottom:12}}>
            <label className="neo-label">Espessura</label>
            <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
              {espDisp.map(e=>{
                const ed=ref.espessuras[e]
                return<button key={e} className={`neo-chip ${p.espessura===e?'active':''}`} onClick={()=>updFn(p.id,'espessura',e)}>
                  {e}{ed&&<span style={{fontWeight:300,marginLeft:6,fontSize:9}}>{f2(ed.pvp)} €/m²</span>}
                </button>
              })}
            </div>
          </div>}

          {/* Preços manuais */}
          {!isPedra&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
            <div><label className="neo-label">PVP/m² (€)</label><input type="number" className="neo-input-num" value={p.precoPvp||''} onChange={e=>updFn(p.id,'precoPvp',e.target.value)} placeholder="0.00"/></div>
            <div><label className="neo-label">C1/m² (€)</label><input type="number" className="neo-input-num" value={p.precoC1||''} onChange={e=>updFn(p.id,'precoC1',e.target.value)} placeholder="0.00"/></div>
          </div>}

          {/* Segmentos */}
          {!isB&&<div style={{marginBottom:14}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
              <label className="neo-label" style={{marginBottom:0}}>Segmentos (metros)</label>
              <button onClick={()=>addSeg(p.id)} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-gold)'}}>+ Seg.</button>
            </div>
            {(p.segmentos||[]).map(seg=>(
              <div key={seg.id} className="neo-seg" style={{gridTemplateColumns:'auto 1fr 1fr 60px'+(p.segmentos.length>1?' auto':'')}}>
                <input value={seg.label} onChange={e=>updSeg(p.id,seg.id,'label',e.target.value)}
                  style={{background:'transparent',border:'none',fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',outline:'none',width:40,alignSelf:'end',paddingBottom:2}}/>
                <div><label className="neo-label" style={{fontSize:8}}>Comp. (m)</label><input type="number" className="neo-input-num" value={seg.comp} onChange={e=>updSeg(p.id,seg.id,'comp',e.target.value)} placeholder="2.40" step="0.01" min="0"/></div>
                <div><label className="neo-label" style={{fontSize:8}}>Larg. (m)</label><input type="number" className="neo-input-num" value={seg.larg} onChange={e=>updSeg(p.id,seg.id,'larg',e.target.value)} placeholder="0.60" step="0.01" min="0"/></div>
                <div style={{textAlign:'right'}}>
                  <label className="neo-label" style={{fontSize:8}}>m²</label>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:15,fontWeight:700,color:'var(--neo-gold)',paddingTop:2}}>{f2((parseFloat(seg.comp)||0)*(parseFloat(seg.larg)||0))}</div>
                </div>
                {p.segmentos.length>1&&<button onClick={()=>delSeg(p.id,seg.id)} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text3)',fontSize:11,alignSelf:'end',paddingBottom:2}}>✕</button>}
              </div>
            ))}
            {(p.segmentos||[]).length>1&&<div style={{display:'flex',justifyContent:'flex-end',padding:'4px 0',gap:8}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Total</span>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,color:'var(--neo-text)'}}>{res.m2.toFixed(4)} m²</span>
            </div>}
          </div>}

          {/* Rodatampo */}
          {acabDisp.length>0&&(()=>{
            const ra=acabDisp.find(a=>a.nome==='RODATAMPO')
            const rActive=(p.acabamentos||[]).find(a=>a.nome==='RODATAMPO')
            if(!ra)return null
            return<div style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className={`neo-toggle ${rActive?'on':''}`} onClick={()=>toggleAcab(p.id,ra)}><div className="neo-toggle-knob"/></div>
                <span style={{flex:1,fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.04em',color:rActive?'var(--neo-text)':'var(--neo-text2)'}}>RODATAMPO</span>
                {rActive?(
                  <>
                  <input type="number" className="neo-input-num" value={rActive.qty} onChange={e=>updAcabQty(p.id,'RODATAMPO',e.target.value)} placeholder="ml" step="0.01" min="0" style={{width:64}}/>
                  <span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)'}}>ml</span>
                  {parseFloat(rActive.qty)>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-gold)',minWidth:55,textAlign:'right'}}>{f2(ra.pvp*parseFloat(rActive.qty))} €</span>}
                  </>
                ):<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)'}}>{f2(ra.pvp)} €/ml</span>}
              </div>
            </div>
          })()}

          {/* Acabamentos */}
          {acabDisp.filter(a=>a.nome!=='RODATAMPO').map(acab=>{
            const active=(p.acabamentos||[]).find(a=>a.nome===acab.nome)
            return<div key={acab.nome} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div className={`neo-toggle ${active?'on':''}`} onClick={()=>toggleAcab(p.id,acab)}><div className="neo-toggle-knob"/></div>
                <span style={{flex:1,fontFamily:"'Barlow Condensed'",fontSize:11,letterSpacing:'0.04em',color:active?'var(--neo-text)':'var(--neo-text2)'}}>{acab.nome}</span>
                {active?(
                  <>
                  <div className="neo-qty">
                    <button className="neo-qty-btn" onClick={()=>updAcabQty(p.id,acab.nome,Math.max(0,(parseInt(active.qty)||0)-1))}>−</button>
                    <span className="neo-qty-val">{parseInt(active.qty)||0}</span>
                    <button className="neo-qty-btn" onClick={()=>updAcabQty(p.id,acab.nome,(parseInt(active.qty)||0)+1)}>+</button>
                  </div>
                  {(parseInt(active.qty)||0)>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-gold)',minWidth:55,textAlign:'right'}}>{f2(acab.pvp*(parseInt(active.qty)||0))} €</span>}
                  </>
                ):<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)'}}>{f2(acab.pvp)} €/un</span>}
              </div>
            </div>
          })}
        </div>
      </div>
    )
  }

  return(
    <div className="neo-screen">
      {/* Topbar */}
      <div className="neo-topbar">
        <button className="neo-btn neo-btn-ghost" style={{padding:'0 10px',fontSize:10}} onClick={()=>onBack({...current, pvp:TA.pvp})}>← Tampos</button>
        <div style={{display:'flex',gap:6}}>
          <button className="neo-btn neo-btn-ghost" style={{height:28,padding:'0 10px',fontSize:9}} onClick={limparDados}>Limpar</button>
          <button className="neo-btn neo-btn-ghost" style={{height:28,padding:'0 10px',fontSize:9}} onClick={gerarPDF}>PDF</button>
          <button className="neo-btn neo-btn-ghost" style={{height:28,padding:'0 10px',fontSize:9,border:'1px solid var(--neo-gold2)',color:'var(--neo-gold)',borderRadius:'var(--neo-radius-pill)'}}
            onClick={async()=>{
              const nome=current.nome||current.tipo||'Tampo'
              // Guardar primeiro para ter ID
              let tampoId=current.id
              if(!tampoId){
                const data={...current};delete data.id
                const {addDoc,collection:col}=await import('firebase/firestore')
                const r=await addDoc(col(db,'tampos'),data)
                tampoId=r.id
                setCurrent(c=>({...c,id:tampoId}))
              }
              // Calcular C1 da primeira peça (representativo)
              const primeiraPeca=current.pecas?.[0]
              let c1Ref=null, refAnigraco=null
              if(primeiraPeca?.desc&&primeiraPeca?.tipo){
                const mat=ANIGRACO[primeiraPeca.tipo]
                const ref=mat?.materiais.find(m=>m.desc===primeiraPeca.desc&&m.grupo===primeiraPeca.grupo)||mat?.materiais.find(m=>m.desc===primeiraPeca.desc)
                const esp=ref?.espessuras[primeiraPeca.espessura]
                if(esp){c1Ref=c1fmt(esp.c1);refAnigraco=esp.refAnigraco||null}
              }
              addToOrcamento({
                ref: nome,
                desc: current.pecas.map(p=>p.desc||p.label).filter(Boolean).join(' + '),
                cat:'Tampos',
                price: TA.pvp,
                origem:'Tampos',
                tampoId,
                c1Ref,
                refAnigraco
              }, showToast)
            }}>
            + Orç
          </button>
          <button className="neo-btn neo-btn-gold" style={{height:28,padding:'0 12px',fontSize:9}} onClick={save}>Guardar</button>
        </div>
      </div>

      {/* Total + comparação + ref Anigraco */}
      <div className="neo-total-bar">
        <div style={{display:'flex',gap:20,alignItems:'center'}}>
          <div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:3}}>{current.opcaoB?'Opção A':'PVP total'}</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,color:'var(--neo-gold)'}}>{f2(TA.pvp)} €</div>
          </div>
          {TB&&<div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:3}}>Opção B</div>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,color:'var(--neo-blue,#4a8fa8)'}}>{f2(TB.pvp)} €</div>
          </div>}
          {TB&&<div style={{display:'flex',alignItems:'center'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',textAlign:'center'}}>
              <div>Δ</div>
              <div style={{color:TA.pvp<TB.pvp?'var(--neo-gold)':'var(--neo-text2)',fontSize:12,fontWeight:600}}>{f2(Math.abs(TA.pvp-TB.pvp))} €</div>
            </div>
          </div>}

          {/* Ref Anigraco — sempre visível na calculadora */}
          <AnigracoRef showToast={showToast}/>
        </div>
        <button onClick={()=>{ if(!current.opcaoB) activarCompB(); else upd('opcaoB',null) }}
          style={{background:'transparent',border:'1px solid',borderColor:current.opcaoB?'var(--neo-gold)':'rgba(255,255,255,0.1)',borderRadius:20,padding:'5px 12px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.12em',textTransform:'uppercase',color:current.opcaoB?'var(--neo-gold)':'var(--neo-text2)',transition:'all .2s'}}>
          {current.opcaoB?'Modo simples':'Comparar'}
        </button>
      </div>

      {/* Tabs */}
      <div className="neo-tabs">
        <button className={`neo-tab ${tab==='pecas'?'active':''}`} onClick={()=>setTab('pecas')}>Peças</button>
        <button className={`neo-tab ${tab==='resumo'?'active':''}`} onClick={()=>setTab('resumo')}>Referências</button>
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto'}}>

      {tab==='pecas'&&<>
        {/* Identificação */}
        <div style={{padding:'0 16px 4px'}}>
          <div className="neo-surface" style={{padding:'14px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
              <div><label className="neo-label">Nome do projecto</label><input className="neo-input" value={current.nome} onChange={e=>upd('nome',e.target.value)} placeholder="ex: Cozinha Lisboa"/></div>
              <div><label className="neo-label">Nome / Contacto</label><input className="neo-input" value={current.contacto||''} onChange={e=>upd('contacto',e.target.value)} placeholder="Nome ou telefone"/></div>
            </div>
          </div>
        </div>

        {/* Fórmula */}
        <div style={{padding:'6px 16px 2px'}}>
          <button onClick={()=>setFormulaOpen(o=>!o)}
            style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-gold)',display:'flex',alignItems:'center',gap:6,padding:'8px 0',opacity:0.7}}>
            <span style={{fontSize:10}}>{formulaOpen?'▼':'▶'}</span> Fórmula PVP
          </button>
          {formulaOpen&&<FormulaPanel margem={margem} setMargem={setMargem} c1Auto={TA.c1} showToast={showToast}/>}
        </div>

        {/* Modo simples — peças */}
        {!current.opcaoB&&<>
          {(current.pecas||[]).map(p=>renderPeca(p,false))}
          <div style={{padding:'8px 16px'}}>
            <button className="neo-btn neo-btn-ghost" style={{width:'100%',height:36,border:'1px dashed rgba(255,255,255,0.08)'}} onClick={addPeca}>+ Peça</button>
          </div>
        </>}

        {/* Modo comparação */}
        {current.opcaoB&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0}}>
          <div style={{borderRight:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{padding:'8px 12px',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-gold)',borderBottom:'1px solid rgba(200,169,110,0.2)',background:'rgba(200,169,110,0.05)'}}>Opção A</div>
            {(current.pecas||[]).map(p=>renderPeca(p,false))}
          </div>
          <div>
            <div style={{padding:'8px 12px',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'var(--neo-blue,#4a8fa8)',borderBottom:'1px solid rgba(74,143,168,0.2)',background:'rgba(74,143,168,0.05)'}}>Opção B</div>
            {(current.opcaoB?.pecas||[]).map(p=>renderPeca(p,true))}
          </div>
        </div>}

        {/* Transporte */}
        <div style={{padding:'8px 16px'}}>
          <div className="neo-surface" style={{padding:'14px'}}>
            <label className="neo-label">Transporte e Montagem</label>
            <div style={{display:'flex',gap:8}}>
              {TRANSPORTE.map(t=>(
                <button key={t.label} className={`neo-transp ${current.transporte?.label===t.label?'active':''}`}
                  onClick={()=>upd('transporte',current.transporte?.label===t.label?null:t)}>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,letterSpacing:'0.08em',color:current.transporte?.label===t.label?'var(--neo-gold)':'var(--neo-text)'}}>{t.label}</div>
                  <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text3)',marginTop:2}}>{f2(t.pvp)} €</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Desconto */}
        {!current.opcaoB&&<div style={{padding:'4px 16px'}}>
          <div className="neo-surface" style={{padding:'14px'}}>
            <label className="neo-label">Desconto</label>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              <input type="number" className="neo-input-num" value={current.desconto||''} onChange={e=>upd('desconto',e.target.value)} placeholder="0" min="0" style={{width:80}}/>
              {['%','€'].map(t=>(
                <button key={t} className={`neo-chip ${current.descontoTipo===t?'active':''}`} style={{padding:'5px 12px'}} onClick={()=>upd('descontoTipo',t)}>{t}</button>
              ))}
              {parseFloat(current.desconto)>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:13,color:'var(--neo-text2)',marginLeft:'auto'}}>− {f2(TA.desc)} €</span>}
            </div>
          </div>
        </div>}

        {/* Notas */}
        <div style={{padding:'4px 16px 32px'}}>
          <label className="neo-label">Notas</label>
          <textarea className="neo-input" value={current.notas||''} onChange={e=>upd('notas',e.target.value)} placeholder="Observações…" style={{resize:'none',minHeight:44}}/>
        </div>
      </>}

      {/* ── TAB REFERÊNCIAS ── */}
      {tab==='resumo'&&<div style={{padding:'8px 0 32px'}}>
        <div style={{padding:'8px 16px 12px',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
          Referências por unidade — copiáveis para o programa de orçamentação
        </div>

        {(current.pecas||[]).map(p=>{
          const isPedra=TIPOS_PEDRA.includes(p.tipo)
          const mat=ANIGRACO[p.tipo]
          const matRef=mat?.materiais.find(m=>m.desc===p.desc&&m.grupo===p.grupo)||mat?.materiais.find(m=>m.desc===p.desc)
          const esp=matRef?.espessuras[p.espessura]
          const acabDisp=mat?.acabamentos||[]
          const res=calcPeca(p)
          if(!p.desc&&isPedra)return null
          return<div key={p.id} style={{marginBottom:8}}>
            <div style={{padding:'10px 16px 4px',display:'flex',alignItems:'baseline',gap:10}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text)'}}>{p.label}{p.desc?' — '+p.desc:''}{p.espessura?' '+p.espessura:''}</span>
              {res.m2>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-gold)',letterSpacing:'0.06em'}}>{res.m2.toFixed(3)} m²</span>}
              {res.pvp>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)',marginLeft:'auto'}}>{f2(res.pvp)} €</span>}
            </div>
            {esp&&<RefRow label="Tampo / m²" c1={esp.c1} pvp={esp.pvp} refAnigraco={esp.refAnigraco||null} calc={res.m2>0?`${res.m2.toFixed(3)} m² × ${f2(esp.pvp)} = ${f2(res.pvpTampo)} €`:null} showToast={showToast} markCopied={markCopied} copiedRefs={copiedRefs}/>}
            {(p.acabamentos||[]).map(a=>{
              const base=acabDisp.find(x=>x.nome===a.nome)
              if(!base)return null
              const qty=base.unidade==='ml'?parseFloat(a.qty)||0:parseInt(a.qty)||0
              const tot=qty>0?base.pvp*qty:null
              return<RefRow key={a.nome} label={a.nome} c1={base.c1} pvp={base.pvp} unidade={base.unidade} refAnigraco={base.refAnigraco||null} calc={qty>0?`${qty} ${base.unidade} = ${f2(tot)} €`:null} showToast={showToast} markCopied={markCopied} copiedRefs={copiedRefs}/>
            })}
          </div>
        })}

        {/* Opção B */}
        {current.opcaoB&&(current.opcaoB?.pecas||[]).map(p=>{
          const mat=ANIGRACO[p.tipo]
          const matRef=mat?.materiais.find(m=>m.desc===p.desc&&m.grupo===p.grupo)||mat?.materiais.find(m=>m.desc===p.desc)
          const esp=matRef?.espessuras[p.espessura]
          const acabDisp=mat?.acabamentos||[]
          const res=calcPeca(p)
          if(!p.desc)return null
          return<div key={p.id} style={{marginBottom:8}}>
            <div style={{padding:'10px 16px 4px',display:'flex',alignItems:'baseline',gap:10}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'#4a8fa8'}}>B: {p.label}{p.desc?' — '+p.desc:''}{p.espessura?' '+p.espessura:''}</span>
              {res.m2>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'#4a8fa8',letterSpacing:'0.06em'}}>{res.m2.toFixed(3)} m²</span>}
              {res.pvp>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)',marginLeft:'auto'}}>{f2(res.pvp)} €</span>}
            </div>
            {esp&&<RefRow label="Tampo / m²" c1={esp.c1} pvp={esp.pvp} refAnigraco={esp.refAnigraco||null} calc={res.m2>0?`${res.m2.toFixed(3)} m² × ${f2(esp.pvp)} = ${f2(res.pvpTampo)} €`:null} showToast={showToast} markCopied={markCopied} copiedRefs={copiedRefs}/>}
            {(p.acabamentos||[]).map(a=>{
              const base=acabDisp.find(x=>x.nome===a.nome)
              if(!base)return null
              const qty=base.unidade==='ml'?parseFloat(a.qty)||0:parseInt(a.qty)||0
              const tot=qty>0?base.pvp*qty:null
              return<RefRow key={a.nome} label={a.nome} c1={base.c1} pvp={base.pvp} unidade={base.unidade} refAnigraco={base.refAnigraco||null} calc={qty>0?`${qty} ${base.unidade} = ${f2(tot)} €`:null} showToast={showToast} markCopied={markCopied} copiedRefs={copiedRefs}/>
            })}
          </div>
        })}

        {/* Transporte */}
        {current.transporte&&<>
          <div style={{padding:'10px 16px 4px',fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text)'}}>Transporte</div>
          <RefRow label={current.transporte.label} c1={current.transporte.c1} pvp={current.transporte.pvp} showToast={showToast} markCopied={markCopied} copiedRefs={copiedRefs}/>
        </>}

        {/* Total PVP para referência */}
        <div style={{margin:'16px 16px 0'}}>
          <div className="neo-surface" style={{padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            {current.opcaoB?<>
              <div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:4}}>Total PVP — Opção A</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,color:'var(--neo-gold)'}}>{f2(TA.pvp)} €</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)',marginBottom:4}}>Total PVP — Opção B</div>
                <div style={{fontFamily:"'Barlow Condensed'",fontSize:20,fontWeight:700,color:'var(--neo-blue,#4a8fa8)'}}>{f2(TB.pvp)} €</div>
              </div>
            </>:<>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Total PVP</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:22,fontWeight:700,color:'var(--neo-gold)'}}>{f2(TA.pvp)} €</div>
            </>}
          </div>
        </div>
      </div>}

      </div>

      {/* Modal material */}
      {matModal&&<MaterialModal tipoProjeto={current.tipo}
        onSelect={(tipo,desc,grupo,espessura)=>{
          // Actualizar pvp/c1 dos acabamentos existentes para os valores do novo material
          const actualizarAcabamentos=(acabamentosActuais)=>{
            const novoMat=ANIGRACO[tipo]
            const novosAcabDisp=novoMat?.acabamentos||[]
            if(!acabamentosActuais||acabamentosActuais.length===0) return []
            // Para cada acabamento activo, procurar o equivalente no novo material pelo nome
            return acabamentosActuais.map(a=>{
              const equiv=novosAcabDisp.find(x=>x.nome===a.nome)
              // Se existe no novo material → actualizar pvp/c1; se não → remover
              return equiv ? {...a, pvp:equiv.pvp, c1:equiv.c1, unidade:equiv.unidade} : null
            }).filter(Boolean)
          }
          if(matModal==='B'){
            const pecaB=(current.opcaoB?.pecas||[])[0]
            const acabActualizados=actualizarAcabamentos(pecaB?.acabamentos)
            upd('opcaoB',{...current.opcaoB,pecas:(current.opcaoB?.pecas||[]).map((p,i)=>i===0?{...p,tipo,desc,grupo,espessura,acabamentos:acabActualizados}:p)})
          }else{
            upd('pecas',current.pecas.map(p=>p.id===matModal
              ?{...p,tipo,desc,grupo,espessura,acabamentos:actualizarAcabamentos(p.acabamentos)}
              :p))
          }
          setMatModal(null)
        }}
        onClose={()=>setMatModal(null)}/>}
    </div>
  )
}

// ── AnigracoRef — ref fixa do fornecedor Anigraco, sempre copiável ────────────
const REF_ANIGRACO = '207849'
function AnigracoRef({showToast}){
  const [copied,setCopied]=useState(false)
  const copy=()=>{
    navigator.clipboard.writeText(REF_ANIGRACO).catch(()=>{})
    setCopied(true);setTimeout(()=>setCopied(false),1600)
    showToast('Ref Anigraco copiada — '+REF_ANIGRACO)
  }
  return(
    <button onClick={copy} style={{
      display:'flex',flexDirection:'column',alignItems:'flex-start',
      background:'var(--neo-bg)',border:'none',
      borderRadius:'var(--neo-radius-sm)',
      boxShadow:copied?'var(--neo-shadow-in-sm),var(--neo-glow-gold)':'var(--neo-shadow-out-sm)',
      padding:'5px 12px',cursor:'pointer',transition:'all .15s',
      borderLeft:`2px solid ${copied?'var(--neo-gold)':'var(--neo-gold2)'}`,
    }}>
      <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',color:copied?'var(--neo-gold)':'var(--neo-text2)',marginBottom:2}}>
        Ref Anigraco {copied?'✓':'⎘'}
      </span>
      <span style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:700,letterSpacing:'0.08em',color:copied?'var(--neo-gold)':'var(--neo-text)'}}>
        {REF_ANIGRACO}
      </span>
    </button>
  )
}

// ── FormulaPanel — cálculo PVP com C1 automático ou manual ───────────────────
function FormulaPanel({margem,setMargem,c1Auto,showToast}){
  const [modo,setModo]=useState('auto')   // 'auto' | 'manual'
  const [c1Manual,setC1Manual]=useState('')

  const c1Val = modo==='auto' ? c1Auto/100 : (parseFloat(c1Manual)||0)
  const pvpCalc = c1Val>0 && margem<100 ? (c1Val/(1-margem/100))*1.23 : 0

  const copyPvp=()=>{
    if(!pvpCalc){showToast('Sem valor para copiar');return}
    navigator.clipboard.writeText(f2(pvpCalc)).catch(()=>{})
    showToast('PVP copiado — '+f2(pvpCalc)+' €')
  }

  return(
    <div className="neo-well" style={{padding:'14px',marginBottom:8}}>
      <div style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--neo-text2)',letterSpacing:'0.08em',marginBottom:12}}>
        PVP = (C1 ÷ (1 − margem)) × 1.23
      </div>

      {/* Toggle modo */}
      <div style={{display:'flex',gap:6,marginBottom:12}}>
        {['auto','manual'].map(m=>(
          <button key={m} className={`neo-chip-sm ${modo===m?'active':''}`} onClick={()=>setModo(m)}>
            {m==='auto'?'C1 do cálculo':'C1 manual'}
          </button>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',alignItems:'center',gap:10}}>
        {/* C1 */}
        <div>
          <label className="neo-label" style={{marginBottom:4}}>C1 (€)</label>
          {modo==='manual'
            ? <input type="number" className="neo-input-num" value={c1Manual}
                onChange={e=>setC1Manual(e.target.value)}
                placeholder="0.00" style={{width:90}}/>
            : <div style={{fontFamily:"'Barlow Condensed'",fontSize:16,fontWeight:600,color:'var(--neo-text)',textAlign:'right',minWidth:80}}>
                {c1Val>0?f2(c1Val):'—'}
              </div>
          }
        </div>

        {/* Margem */}
        <div>
          <label className="neo-label" style={{marginBottom:4}}>Margem %</label>
          <input type="number" className="neo-input-num" value={margem}
            onChange={e=>setMargem(parseFloat(e.target.value)||0)}
            min={0} max={99} style={{width:'100%'}}/>
        </div>

        {/* Resultado */}
        <div style={{textAlign:'right'}}>
          <label className="neo-label" style={{marginBottom:4}}>PVP</label>
          <button onClick={copyPvp} className={`neo-copy ${pvpCalc?'':''}` }
            style={{fontSize:18,fontWeight:700,color:pvpCalc?'var(--neo-gold)':'var(--neo-text3)',background:'transparent',border:'none',cursor:pvpCalc?'pointer':'default',padding:'4px 0',fontFamily:"'Barlow Condensed'",letterSpacing:'0.06em'}}>
            {pvpCalc?f2(pvpCalc)+' €':'—'}
            {pvpCalc?<span style={{fontSize:10,marginLeft:6,opacity:.6}}>⎘</span>:null}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── RefRow — linha de referência com C1, PVP, ref Anigraco e cálculo ─────────
function RefRow({label,c1,pvp,unidade,refAnigraco,calc,showToast,markCopied,copiedRefs}){
  const c1Key       = c1fmt(c1)
  // Chave composta: label::valor — evita highlight cruzado entre linhas com o mesmo C1
  const c1CopiedKey = label + '::' + c1Key
  const anCopiedKey = label + '::' + (refAnigraco||'')
  const wasCopiedC1 = copiedRefs?.has(c1CopiedKey)
  const wasCopiedAn = refAnigraco ? copiedRefs?.has(anCopiedKey) : false
  const anyWasCopied = wasCopiedC1 || wasCopiedAn

  return<div className="tampo-ref-row" style={{
    borderBottom:'1px solid rgba(255,255,255,0.05)',
    background: anyWasCopied ? 'rgba(200,169,110,0.04)' : 'transparent',
    borderLeft: anyWasCopied ? '2px solid rgba(200,169,110,0.4)' : '2px solid transparent',
    transition:'background .2s, border-color .2s, padding-left .18s',
  }}>
    <div style={{display:'flex',alignItems:'center',padding:'9px 16px',gap:10}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,color: anyWasCopied ? '#c4c0b8' : 'var(--neo-text)',fontWeight:400}}>
          {label}{unidade&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'#8a8a82',marginLeft:6}}>/{unidade}</span>}
        </div>
        {refAnigraco&&(
          <div style={{display:'flex',alignItems:'center',gap:6,marginTop:3}}>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.12em',textTransform:'uppercase',color:'#8a8a82'}}>Anigraco</span>
            <CopyVal val={refAnigraco} label="Ref Anigraco" showToast={showToast} markCopied={markCopied} copiedKey={anCopiedKey} wasCopied={wasCopiedAn}/>
          </div>
        )}
        {calc&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-gold)',letterSpacing:'0.06em',marginTop:3}}>{calc}</div>}
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'#8a8a82',letterSpacing:'0.1em',marginBottom:2}}>C1</div>
          <CopyVal val={c1Key} label="C1" showToast={showToast} markCopied={markCopied} copiedKey={c1CopiedKey} wasCopied={wasCopiedC1}/>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,color:'#8a8a82',letterSpacing:'0.1em',marginBottom:2}}>PVP</div>
          <CopyVal val={f2(pvp)} label="PVP" showToast={showToast} gold/>
        </div>
      </div>
    </div>
  </div>
}

// ── Modal material ─────────────────────────────────────────────────────────
function MaterialModal({tipoProjeto,onSelect,onClose}){
  const [tipo,setTipo]=useState(TIPOS_PEDRA.includes(tipoProjeto)?tipoProjeto:'SILESTONES')
  const [grupo,setGrupo]=useState('TODOS')
  const [search,setSearch]=useState('')
  const mat=ANIGRACO[tipo]
  const grupos=['TODOS',...new Set(mat.materiais.map(m=>m.grupo||'SEM GRUPO'))]
  const lista=mat.materiais.filter(m=>{
    const mg=grupo==='TODOS'||(m.grupo||'SEM GRUPO')===grupo
    const ms=!search||m.desc.toLowerCase().includes(search.toLowerCase())
    return mg&&ms
  })
  return<div className="neo-overlay open">
    <div className="neo-modal" style={{maxWidth:480}}>
      <div className="neo-modal-head">Material<button className="neo-modal-close" onClick={onClose}>✕</button></div>
      <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>
        {TIPOS_PEDRA.map(t=><button key={t} className={`neo-chip-sm ${tipo===t?'active':''}`} onClick={()=>{setTipo(t);setGrupo('TODOS');setSearch('')}}>{t.charAt(0)+t.slice(1).toLowerCase()}</button>)}
      </div>
      {grupos.length>2&&<div style={{display:'flex',gap:4,marginBottom:10,flexWrap:'wrap'}}>
        {grupos.map(g=><button key={g} className={`neo-chip-sm ${grupo===g?'active':''}`} onClick={()=>setGrupo(g)}>{g}</button>)}
      </div>}
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Pesquisar…" className="neo-input" style={{marginBottom:10}}/>
      <div className="neo-scroll neo-well" style={{maxHeight:'42vh',overflowY:'auto',padding:'4px 0'}}>
        {lista.map((m,i)=>{
          const esps=Object.entries(m.espessuras)
          return<div key={i} className="tampo-modal-item" onClick={()=>onSelect(tipo,m.desc,m.grupo,esps[0][0])}
            style={{padding:'11px 14px',borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--neo-text)'}}>{m.desc}</div>
              {m.grupo&&<div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text3)',marginTop:1}}>Grupo {m.grupo}</div>}
            </div>
            <div style={{textAlign:'right'}}>
              {esps.map(([e,v])=><div key={e} style={{fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-text2)'}}>{e}: {f2(v.pvp)} €/m²</div>)}
            </div>
          </div>
        })}
        {lista.length===0&&<div style={{padding:'20px',textAlign:'center',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text3)'}}>Sem resultados</div>}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}>
        <button className="neo-btn neo-btn-ghost" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  </div>
}

// ── CopyVal ────────────────────────────────────────────────────────────────
function CopyVal({val,label,showToast,gold,large,markCopied,copiedKey,wasCopied}){
  const [justCopied,setJustCopied]=useState(false)
  // justCopied — este chip específico foi copiado agora (1.6s)
  // wasCopied  — o valor já foi copiado nesta sessão (highlight global de row)
  const showCheck = justCopied  // só mostra ✓ se foi ESTE chip
  const isActive  = justCopied || wasCopied
  return<button className={`neo-copy ${isActive?'copied':''}`} onClick={()=>{
    navigator.clipboard.writeText(val).catch(()=>{})
    setJustCopied(true);setTimeout(()=>setJustCopied(false),1600)
    if(markCopied && label!=='PVP') markCopied(copiedKey || val)
    showToast(`${label} copiado — ${val}`)
  }} style={{
    ...(gold && !isActive ? {color:'var(--neo-gold)'} : {}),
    ...(wasCopied && !justCopied ? {
      color:'var(--neo-gold)',
      boxShadow:'var(--neo-shadow-in-sm), var(--neo-glow-gold)',
    } : {}),
  }}>
    <span style={{fontSize:large?16:12,fontWeight:large?700:400}}>{val}</span>
    <span className="neo-copy-icon">{showCheck?'✓':'⎘'}</span>
  </button>
}

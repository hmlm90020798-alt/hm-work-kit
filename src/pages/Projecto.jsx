import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { orcRef } from '../hooks/useOrcamento'
import { db } from '../firebase'
import { onSnapshot } from 'firebase/firestore'
import { useProjectos } from '../hooks/useProjectos'
import { f2 } from './projecto/constantes'
import Lista    from './projecto/Lista'
import Detalhe  from './projecto/Detalhe'
import Guia     from './projecto/Guia'

export default function Projecto({ showToast, onNavegar }) {
  const { user } = useAuth()

  const proj = useProjectos(user)

  const [orcItems,      setOrcItems]      = useState([])
  const [novoTipo,      setNovoTipo]      = useState(null)
  const [novoNomeInput, setNovoNomeInput] = useState('')
  const [confirmSaida,  setConfirmSaida]  = useState(false)
  const [confirmApagar, setConfirmApagar] = useState(null)
  const [modalId,       setModalId]       = useState(false)
  const [modalNome,     setModalNome]     = useState('')
  const [modalCampos,   setModalCampos]   = useState([])

  // Orçamento em tempo real
  useEffect(() => {
    if (!proj.projId) { setOrcItems([]); return }
    const unsub = onSnapshot(orcRef(proj.projId), snap => {
      setOrcItems(snap.exists() ? (snap.data().items||[]) : [])
    })
    return () => unsub()
  }, [proj.projId])

  // Actualizar total quando orcamento muda
  useEffect(() => {
    if (!proj.projId) return
    const total = orcItems.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0)
    proj.actualizarTotal(total)
  }, [orcItems, proj.projId])

  // Guardar guia com debounce
  useEffect(() => {
    if (!proj.projId || !proj.guiaCarregado) return
    if (['lista','nome','detalhe'].includes(proj.passo)) return
    proj.guardarGuia({
      projId: proj.projId, uid: user?.uid,
      nome: proj.nome, tipo: proj.tipo, campos: proj.campos,
      passo: proj.passo, compSel: proj.compSel, compFeitos: proj.compFeitos,
      compActual: proj.compActual, kitSelId: proj.kitSelId, kitItems: proj.kitItems,
      total: orcItems.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0),
    })
  }, [proj.passo, proj.compSel, proj.compFeitos, proj.compActual, proj.kitSelId, proj.kitItems, proj.nome, proj.campos])

  const totalOrc = orcItems.reduce((s,i) => s + (i.price||0) * (i.qty||1), 0)
  const tipoActual = proj.tipos.find(t => t.id === proj.tipo)

  const iniciarNovo = (tipoObj) => {
    setNovoTipo(tipoObj); setNovoNomeInput(''); proj.setPasso('nome')
  }

  const confirmarNomeECriar = async () => {
    if (!novoTipo) return
    await proj.criarProjecto(novoTipo, novoNomeInput)
    setNovoTipo(null); setNovoNomeInput('')
  }

  const clicarInicio = () => {
    if (proj.passo === 'lista') return
    if (proj.passo === 'nome' || proj.passo === 'detalhe') { proj.resetarEstado(true); return }
    setConfirmSaida(true)
  }

  const voltarPasso = () => {
    if (proj.passo === 'nome')         { proj.setPasso('lista'); setNovoTipo(null) }
    else if (proj.passo === 'detalhe')      { proj.resetarEstado(true) }
    else if (proj.passo === 'componentes')  { proj.setPasso('detalhe') }
    else if (proj.passo === 'execucao')     { proj.setPasso('componentes') }
    else if (proj.passo === 'resumo')       { proj.setPasso('execucao') }
  }

  const abrirModalId = () => {
    setModalNome(proj.nome)
    setModalCampos(Object.entries(proj.campos).map(([chave,valor])=>({chave,valor})))
    setModalId(true)
  }

  const guardarIdentidade = () => {
    const novoNome    = modalNome.trim()
    const novosCampos = Object.fromEntries(modalCampos.filter(c=>c.chave.trim()).map(c=>[c.chave.trim(), c.valor]))
    proj.guardarIdentidade(novoNome, novosCampos)
    setModalId(false)
    showToast(novoNome ? `Projecto: ${novoNome}` : 'Identidade guardada')
  }

  const topoTitulo = () => {
    if (proj.passo === 'lista')   return 'Projectos'
    if (proj.passo === 'nome')    return 'Novo Projecto'
    if (proj.passo === 'detalhe') return proj.nome || tipoActual?.label || 'Projecto'
    return 'Novo Projecto'
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--neo-bg)', color:'var(--neo-text)', fontFamily:"'Barlow',sans-serif" }}>

      {/* TOPBAR */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', height:52, flexShrink:0, background:'var(--neo-bg)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {proj.passo !== 'lista' && (
            <button onClick={voltarPasso} style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:18, padding:'4px 6px', lineHeight:1 }}>{'<'}</button>
          )}
          <div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text)' }}>
              {topoTitulo()}
            </div>
            {(proj.passo !== 'lista' && proj.passo !== 'nome') && tipoActual && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:tipoActual.cor, marginTop:1 }}>{tipoActual.icon} {tipoActual.label}</div>
                {proj.nome && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.08em', color:'var(--neo-text2)', marginTop:1 }}>· {proj.nome}</div>}
              </div>
            )}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {totalOrc > 0 && proj.passo !== 'lista' && proj.passo !== 'nome' && (
            <div style={{ background:'rgba(200,169,110,0.1)', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius-pill)', padding:'4px 12px', fontFamily:"'Barlow Condensed'", fontSize:11, fontWeight:700, color:'var(--neo-gold)', letterSpacing:'0.08em' }}>
              {f2(totalOrc)} EUR
            </div>
          )}
          {proj.passo !== 'lista' && proj.passo !== 'nome' && (
            <button onClick={abrirModalId}
              style={{ background: proj.nome ? 'rgba(200,169,110,0.1)' : 'transparent', border:`1px solid ${proj.nome ? 'rgba(200,169,110,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius:'var(--neo-radius-pill)', padding:'5px 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', color: proj.nome ? 'var(--neo-gold)' : 'var(--neo-text2)', transition:'all .15s' }}>
              edit
            </button>
          )}
          {proj.passo !== 'lista' && (
            <button onClick={clicarInicio}
              style={{ background:'transparent', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--neo-radius-pill)', padding:'5px 12px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--neo-text2)' }}>
              Inicio
            </button>
          )}
        </div>
      </div>

      <div className="neo-scroll" style={{ flex:1, overflowY:'auto', padding:'20px 16px 40px' }}>

        {/* LISTA */}
        {proj.passo === 'lista' && (
          <Lista
            projectos={proj.projectos}
            tipos={proj.tipos}
            tiposActivos={proj.tiposActivos}
            onAbrir={proj.abrirProjecto}
            onOrcamento={async (id) => { await proj.abrirProjecto(id); onNavegar?.('orcamentos') }}
            onNovo={iniciarNovo}
            onApagar={(id) => setConfirmApagar(id)}
            saveTipos={proj.saveTipos}
          />
        )}

        {/* NOME */}
        {proj.passo === 'nome' && novoTipo && (
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
              <span style={{ fontSize:40 }}>{novoTipo.icon}</span>
              <div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:20, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:novoTipo.cor }}>{novoTipo.label}</div>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)', letterSpacing:'0.1em', marginTop:2 }}>Novo projecto</div>
              </div>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:18, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase', color:'var(--neo-text)', marginBottom:6 }}>
              Como se chama o cliente?
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, letterSpacing:'0.1em', color:'var(--neo-text2)', marginBottom:20 }}>
              O nome ajuda a distinguir os projectos. Podes alterar depois.
            </div>
            <input
              value={novoNomeInput}
              onChange={e=>setNovoNomeInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter') confirmarNomeECriar() }}
              placeholder="ex: Joao Silva"
              autoFocus
              style={{ width:'100%', background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--neo-radius)', padding:'14px 16px', fontFamily:"'Barlow'", fontSize:16, color:'var(--neo-text)', outline:'none', boxSizing:'border-box', marginBottom:12 }}
            />
            <button onClick={confirmarNomeECriar} className="neo-btn neo-btn-gold"
              style={{ width:'100%', height:48, fontSize:11, letterSpacing:'0.12em', borderRadius:'var(--neo-radius)' }}>
              {novoNomeInput.trim() ? `Comecar - ${novoNomeInput.trim()}` : 'Comecar sem nome'}
            </button>
          </div>
        )}

        {/* DETALHE */}
        {proj.passo === 'detalhe' && proj.projId && (
          <Detalhe
            compFeitos={proj.compFeitos}
            orcItems={orcItems}
            onEditarComp={(id) => { proj.setCompActual(id); proj.setPasso('execucao') }}
            onAdicionarCategoria={() => {
              proj.setCompSel(prev => [...new Set([...proj.compFeitos, ...prev])])
              proj.setPasso('componentes')
            }}
            onVerOrcamento={() => onNavegar?.('orcamentos')}
          />
        )}

        {/* GUIA (componentes + execucao + resumo) */}
        {['componentes','execucao','resumo'].includes(proj.passo) && (
          <Guia
            projId={proj.projId}
            tipo={proj.tipo}
            tipos={proj.tipos}
            nome={proj.nome}
            passo={proj.passo}
            setPasso={proj.setPasso}
            compSel={proj.compSel}
            setCompSel={proj.setCompSel}
            compFeitos={proj.compFeitos}
            setCompFeitos={proj.setCompFeitos}
            compActual={proj.compActual}
            setCompActual={proj.setCompActual}
            kitSelId={proj.kitSelId}
            setKitSelId={proj.setKitSelId}
            kitItems={proj.kitItems}
            setKitItems={proj.setKitItems}
            orcItems={orcItems}
            showToast={showToast}
            onNavegar={onNavegar}
            onVoltarDetalhe={() => proj.setPasso('detalhe')}
          />
        )}

      </div>

      {/* MODAL SAIDA DO GUIA */}
      {confirmSaida && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmSaida(false)}}>
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head">
              Sair do guia
              <button className="neo-modal-close" onClick={()=>setConfirmSaida(false)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              Queres guardar o progresso antes de sair?<br/>
              <span style={{ fontSize:10 }}>Podes retomar este projecto mais tarde.</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="neo-btn neo-btn-gold" onClick={()=>{ setConfirmSaida(false); proj.resetarEstado(true) }} style={{ width:'100%', height:44, fontSize:10 }}>
                Guardar e ir ao inicio
              </button>
              <button className="neo-btn neo-btn-ghost" onClick={()=>{ setConfirmSaida(false); proj.resetarEstado(false) }} style={{ width:'100%', height:40, fontSize:9, opacity:0.6 }}>
                Sair sem guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL APAGAR */}
      {confirmApagar && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setConfirmApagar(null)}}>
          <div className="neo-modal" style={{ maxWidth:340 }}>
            <div className="neo-modal-head">
              Apagar projecto
              <button className="neo-modal-close" onClick={()=>setConfirmApagar(null)}>X</button>
            </div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, color:'var(--neo-text2)', letterSpacing:'0.06em', lineHeight:1.9, marginBottom:24 }}>
              Tens a certeza? Esta accao apaga o projecto e o seu orcamento.<br/>
              <span style={{ fontSize:10 }}>Nao e possivel recuperar.</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <button className="neo-btn neo-btn-danger" onClick={async ()=>{ await proj.apagarProjecto(confirmApagar); showToast('Projecto apagado'); setConfirmApagar(null) }} style={{ width:'100%', height:44, fontSize:10 }}>
                Apagar definitivamente
              </button>
              <button className="neo-btn neo-btn-ghost" onClick={()=>setConfirmApagar(null)} style={{ width:'100%', height:40, fontSize:9, opacity:0.6 }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IDENTIDADE */}
      {modalId && (
        <div className="neo-overlay open" onClick={e=>{if(e.target===e.currentTarget)setModalId(false)}}>
          <div className="neo-modal" style={{ maxWidth:380 }}>
            <div className="neo-modal-head">
              Identificar projecto
              <button className="neo-modal-close" onClick={()=>setModalId(false)}>X</button>
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)', marginBottom:6 }}>Nome do cliente</div>
              <input value={modalNome} onChange={e=>setModalNome(e.target.value)} placeholder="ex: Joao Silva" autoFocus
                style={{ width:'100%', background:'var(--neo-bg)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'var(--neo-radius-sm)', padding:'10px 12px', fontFamily:"'Barlow'", fontSize:14, color:'var(--neo-text)', outline:'none', boxSizing:'border-box' }}/>
            </div>
            <div style={{ marginBottom:18 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.16em', textTransform:'uppercase', color:'var(--neo-text2)' }}>Campos adicionais</div>
                <button onClick={()=>setModalCampos(p=>[...p,{chave:'',valor:''}])}
                  style={{ background:'transparent', border:'1px solid rgba(200,169,110,0.25)', borderRadius:'var(--neo-radius-pill)', padding:'3px 10px', cursor:'pointer', fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.1em', color:'var(--neo-gold)' }}>
                  + Adicionar
                </button>
              </div>
              {modalCampos.length === 0 && (
                <div style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)', letterSpacing:'0.08em', opacity:0.6 }}>ex: Processo, Nr de obra, Nota...</div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {modalCampos.map((c,i)=>(
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <input value={c.chave} onChange={e=>setModalCampos(p=>p.map((x,j)=>j===i?{...x,chave:e.target.value}:x))} placeholder="Campo"
                      style={{ width:100, flexShrink:0, background:'var(--neo-bg)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--neo-radius-sm)', padding:'7px 10px', fontFamily:"'Barlow Condensed'", fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text2)', outline:'none' }}/>
                    <input value={c.valor} onChange={e=>setModalCampos(p=>p.map((x,j)=>j===i?{...x,valor:e.target.value}:x))} placeholder="Valor"
                      style={{ flex:1, background:'var(--neo-bg)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'var(--neo-radius-sm)', padding:'7px 10px', fontFamily:"'Barlow'", fontSize:13, color:'var(--neo-text)', outline:'none' }}/>
                    <button onClick={()=>setModalCampos(p=>p.filter((_,j)=>j!==i))}
                      style={{ background:'transparent', border:'none', cursor:'pointer', color:'var(--neo-text2)', fontSize:14, padding:'4px 6px', lineHeight:1, flexShrink:0 }}>X</button>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button className="neo-btn neo-btn-ghost" onClick={()=>setModalId(false)} style={{ flex:1, height:42, fontSize:10 }}>Cancelar</button>
              <button className="neo-btn neo-btn-gold" onClick={guardarIdentidade} style={{ flex:2, height:42, fontSize:10 }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

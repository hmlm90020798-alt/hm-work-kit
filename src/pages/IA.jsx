import React, { useState, useRef, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { MAO_DE_OBRA } from '../data/maoDeObra'
import { addToOrcamento } from '../hooks/useOrcamento'

// ── Groq API ──────────────────────────────────────────────────────────────────
const GROQ_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'llama3-70b-8192',
]
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'

// Secções MO agrupadas para selector
const MO_SECCOES = [...new Set(MAO_DE_OBRA.map(s => s.seccao))].sort()

// MO filtrado por secções seleccionadas (ou todas se vazio)
function getMOContext(seccoesSel) {
  return MAO_DE_OBRA
    .filter(s => s.tipo === 'standard' && s.pvp >= 5 &&
      (seccoesSel.length === 0 || seccoesSel.includes(s.seccao)))
    .map(s => `[${s.id}] ${s.nome} | ${s.pvp}€/${s.un} | ${s.seccao.replace(/^\d+ · /,'')}`)
    .join('\n')
}

function buildPrompt(descricao, artigos, catsSelBib, seccoesMO) {
  // Biblioteca — filtrar por categorias seleccionadas (ou todas se vazio)
  const artigosFiltrados = catsSelBib.length > 0
    ? artigos.filter(a => catsSelBib.includes(a.cat))
    : artigos

  // Limitar a 60 artigos para não exceder tokens Groq
  const bib = artigosFiltrados.length > 0
    ? artigosFiltrados.slice(0, 60).map(a => {
        const base = `[${a.ref}] ${a.desc} | ${a.price>0?a.price+'€':''} | ${a.cat}${a.sub?' · '+a.sub:''}`
        return a.notaIA ? `${base} — ⚑ IA: ${a.notaIA}` : base
      }).join('\n')
    : '(biblioteca vazia)'

  // MO — limitar a 80 serviços
  const moContext = getMOContext(seccoesMO).split('\n').slice(0, 80).join('\n')

  return `És um assistente especializado em orçamentação de obras e instalações.
Respondes SEMPRE em português de Portugal.

BIBLIOTECA DE ARTIGOS (ref | descrição | preço | categoria):
${bib}

SERVIÇOS DE MÃO DE OBRA (código | nome | preço | secção):
${moContext}

INSTRUÇÕES OBRIGATÓRIAS:
- Usa APENAS itens das listas acima. Usa referências e preços exactos.
- Artigos com ⚑ IA: têm instruções específicas — segue-as rigorosamente.
- Responde APENAS com JSON válido. ZERO texto fora do JSON.
- Formato exacto:

{
  "resumo": "análise do projecto em 1-2 frases",
  "categorias": [
    {
      "nome": "Materiais",
      "items": [{"ref":"referência","desc":"descrição","pvp":0.00,"origem":"Biblioteca"}]
    },
    {
      "nome": "Mão de Obra",
      "items": [{"ref":"código","desc":"nome do serviço","pvp":0.00,"origem":"Mão de Obra"}]
    }
  ],
  "notas": "observações ou itens que precisam de visita técnica"
}

Projecto: ${descricao}`
}

// ── Chave Gemini guardada no localStorage ────────────────────────────────────
const KEY_STORAGE = 'hm_groq_key'

export default function IA({ showToast }) {
  const [apiKey,    setApiKey]    = useState(() => localStorage.getItem(KEY_STORAGE) || '')
  const [showKey,   setShowKey]   = useState(!localStorage.getItem(KEY_STORAGE))
  const [descricao, setDescricao] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [resultado, setResultado] = useState(null)
  const [erro,      setErro]      = useState('')
  const [aceites,   setAceites]   = useState({})
  const [enviando,  setEnviando]  = useState(false)
  const [artigos,   setArtigos]   = useState([])

  useEffect(() => {
    getDocs(collection(db,'artigos')).then(snap =>
      setArtigos(snap.docs.map(d=>({id:d.id,...d.data()})))
    ).catch(()=>{})
  }, [])

  const saveKey = (k) => {
    const trimmed = k.trim()
    setApiKey(trimmed)
    if (trimmed) { localStorage.setItem(KEY_STORAGE, trimmed); setShowKey(false) }
  }

  const [modelUsado,  setModelUsado]  = useState('')
  const [catsSelBib,  setCatsSelBib]  = useState([])
  const [seccoesMO,   setSeccoesMO]   = useState([])
  const [showFiltros, setShowFiltros] = useState(false)
  const [catsBib,     setCatsBib]     = useState([])
  const [bibDropOpen, setBibDropOpen] = useState(false)
  const [moDropOpen,  setMoDropOpen]  = useState(false)

  // Carregar categorias do Firestore (todas, não só as com artigos)
  useEffect(() => {
    getDocs(collection(db,'categorias')).then(snap => {
      const sorted = snap.docs
        .map(d => ({id:d.id, ...d.data()}))
        .sort((a,b) => (a.order??999) - (b.order??999))
        .map(c => c.name)
      setCatsBib(sorted)
    }).catch(() => {
      // fallback: categorias dos artigos
      setCatsBib([...new Set(artigos.map(a => a.cat))].sort())
    })
  }, [])

  const analisar = async () => {
    if (!descricao.trim()) { showToast('Descreve o projecto primeiro'); return }
    if (!apiKey) { setShowKey(true); showToast('Configura a API key primeiro'); return }
    setLoading(true); setResultado(null); setErro(''); setAceites({}); setModelUsado('')

    const prompt = buildPrompt(descricao, artigos, catsSelBib, seccoesMO)
    let lastErr = ''
    const sleep = (ms) => new Promise(r => setTimeout(r, ms))

    for (const model of GROQ_MODELS) {
      try {
        const res = await fetch(GROQ_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 2048,
          })
        })

        if (res.status === 401) { lastErr = 'API key inválida — verifica a key Groq'; break }
        if (res.status === 404) { lastErr = `${model} não disponível`; continue }
        if (res.status === 429) {
          lastErr = `${model} — limite atingido, a aguardar 10s…`
          setErro(lastErr)
          await sleep(10000)
          setErro('')
          continue
        }
        if (res.status === 503) {
          lastErr = `${model} — serviço indisponível, a aguardar 5s…`
          setErro(lastErr)
          await sleep(5000)
          setErro('')
          continue
        }
        if (!res.ok) {
          const e = await res.json().catch(()=>({}))
          lastErr = e?.error?.message || `HTTP ${res.status}`
          continue
        }

        const data = await res.json()
        const text = data.choices?.[0]?.message?.content || ''
        const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
        const parsed = JSON.parse(clean)
        setResultado(parsed)
        setModelUsado(model)
        const init = {}
        ;(parsed.categorias||[]).forEach(c => { init[c.nome] = true })
        setAceites(init)
        setLoading(false)
        return
      } catch(e) {
        lastErr = e.message || 'Erro desconhecido'
      }
    }

    setErro(lastErr || 'Não foi possível conectar ao Groq. Verifica a API key.')
    setLoading(false)
  }

  const enviarParaOrc = async () => {
    if (!resultado) return
    setEnviando(true)
    let total = 0
    for (const cat of resultado.categorias || []) {
      if (!aceites[cat.nome]) continue
      for (const item of cat.items || []) {
        await addToOrcamento({ ref:item.ref, desc:item.desc, cat:cat.nome, price:item.pvp||0, origem:item.origem||cat.nome }, ()=>{})
        total++
      }
    }
    showToast(`${total} item${total!==1?'s':''} adicionado${total!==1?'s':''} ao orçamento`)
    setEnviando(false); setResultado(null); setDescricao('')
  }

  const totalAceite = (resultado?.categorias||[])
    .filter(c=>aceites[c.nome])
    .flatMap(c=>c.items||[])
    .reduce((s,i)=>s+(i.pvp||0),0)

  return (
    <div className="neo-screen">
      {/* TOPBAR */}
      <div className="neo-topbar">
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text)'}}>
          Assistente IA
        </span>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {resultado&&<>
            <span style={{fontFamily:"'Barlow Condensed'",fontSize:11,color:'var(--neo-gold)',fontWeight:600}}>
              {totalAceite.toFixed(2)} €
            </span>
            <button onClick={enviarParaOrc} disabled={enviando||totalAceite===0}
              className="neo-btn neo-btn-gold" style={{height:30,padding:'0 16px',fontSize:9,borderRadius:'var(--neo-radius-pill)',opacity:totalAceite===0?.4:1}}>
              {enviando?'A enviar…':'→ Orçamento'}
            </button>
            <button onClick={()=>{setResultado(null);setErro('')}} style={{background:'transparent',border:'none',cursor:'pointer',color:'var(--neo-text2)',fontSize:13,padding:'4px'}}>✕</button>
          </>}
          {/* Botão configurar key */}
          <button onClick={()=>setShowKey(v=>!v)}
            style={{background:'transparent',border:'none',cursor:'pointer',color:apiKey?'var(--neo-text2)':'var(--neo-gold)',fontSize:13,padding:'4px'}}
            title="Configurar API key">⚙</button>
        </div>
      </div>

      <div className="neo-scroll" style={{flex:1,overflowY:'auto',padding:'16px 14px 32px'}}>

        {/* ── PAINEL API KEY ── */}
        {showKey&&(
          <div style={{background:'var(--neo-bg2)',borderRadius:'var(--neo-radius)',boxShadow:'var(--neo-shadow-out-sm)',padding:'16px',marginBottom:16,borderLeft:'2px solid var(--neo-gold)'}}>
            <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-gold)',marginBottom:10}}>
              Groq API Key
            </div>
            <div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',lineHeight:1.8,marginBottom:12}}>
              1. Vai a <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" style={{color:'var(--neo-gold)',textDecoration:'none'}}>console.groq.com/keys ↗</a><br/>
              2. Clica em <strong style={{color:'var(--neo-text)'}}>Create API key</strong><br/>
              3. Copia e cola aqui — é gratuito e não precisa de cartão
            </div>
            <KeyInput onSave={saveKey} current={apiKey}/>
          </div>
        )}

        {/* ── INPUT ── */}
        {!resultado&&!loading&&(
          <div>
            <div style={{marginBottom:16}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:10,fontWeight:600,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:10}}>
                Descreve o projecto
              </div>
              <textarea value={descricao} onChange={e=>setDescricao(e.target.value)}
                placeholder={'Exemplo:\n"Remodelação de cozinha — cliente quer lava-louça de encastrar inox, placa de indução 4 zonas, e instalação de módulos novos. Aprox. 6 metros lineares de móveis."'}
                className="neo-input"
                style={{width:'100%',minHeight:140,resize:'vertical',lineHeight:1.7,fontSize:13,padding:'14px'}}/>
            </div>
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:8}}>Sugestões rápidas</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {[
                  'Remodelação completa de casa de banho com troca de banheira por duche',
                  'Instalação de cozinha nova com eletrodomésticos e tampo de granito',
                  'Renovação de pavimento cerâmico em sala de estar 20m²',
                  'Instalação de sistema de ar condicionado em apartamento T3',
                ].map(s=>(
                  <button key={s} onClick={()=>setDescricao(s)}
                    style={{padding:'6px 12px',borderRadius:'var(--neo-radius-pill)',border:'none',background:'var(--neo-bg2)',boxShadow:'var(--neo-shadow-out-sm)',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:500,letterSpacing:'0.08em',color:'var(--neo-text2)',textAlign:'left',lineHeight:1.4}}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {/* ── FILTROS DE CONTEXTO ── */}
            <div style={{marginBottom:16}}>
              <button onClick={()=>setShowFiltros(o=>!o)} style={{
                display:'flex',alignItems:'center',gap:6,background:'transparent',border:'none',
                cursor:'pointer',padding:'0 0 8px',
                fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.18em',
                textTransform:'uppercase',color: (catsSelBib.length||seccoesMO.length) ? 'var(--neo-gold)' : 'var(--neo-text2)',
              }}>
                ⚙ Contexto da IA
                {(catsSelBib.length > 0 || seccoesMO.length > 0) && (
                  <span style={{background:'var(--neo-gold)',color:'#1a1610',borderRadius:10,padding:'1px 6px',fontSize:8,fontWeight:700}}>
                    {catsSelBib.length + seccoesMO.length}
                  </span>
                )}
                <span style={{fontSize:8,opacity:.5}}>{showFiltros?'▲':'▼'}</span>
              </button>

              {showFiltros && (
                <div style={{background:'var(--neo-bg2)',borderRadius:'var(--neo-radius-sm)',padding:'12px',boxShadow:'var(--neo-shadow-out-sm)',display:'flex',gap:10}}>

                  {/* Dropdown Biblioteca */}
                  <div style={{flex:1,position:'relative'}}>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:5}}>
                      Biblioteca {catsSelBib.length>0&&<span style={{color:'var(--neo-gold)',fontWeight:700}}>({catsSelBib.length})</span>}
                    </div>
                    <button onClick={()=>{setBibDropOpen(o=>!o);setMoDropOpen(false)}} style={{
                      width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
                      background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',
                      boxShadow:'var(--neo-shadow-out-sm)',padding:'8px 12px',cursor:'pointer',
                      fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',
                      color: catsSelBib.length>0 ? 'var(--neo-gold)' : 'var(--neo-text2)',
                    }}>
                      <span>{catsSelBib.length===0 ? 'Todas as categorias' : catsSelBib.join(', ').substring(0,28)+(catsSelBib.join(', ').length>28?'…':'')}</span>
                      <span style={{fontSize:8,opacity:.5}}>{bibDropOpen?'▲':'▼'}</span>
                    </button>
                    {bibDropOpen&&(
                      <div className="neo-dropdown" style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--neo-bg2)',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-out)',zIndex:50}}>
                        <button onClick={()=>setCatsSelBib([])} style={{display:'block',width:'100%',padding:'9px 12px',background:catsSelBib.length===0?'var(--neo-bg)':'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:catsSelBib.length===0?'var(--neo-gold)':'var(--neo-text2)',textAlign:'left'}}>
                          Todas
                        </button>
                        {catsBib.map(c=>(
                          <button key={c} onClick={()=>setCatsSelBib(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c])} style={{
                            display:'flex',alignItems:'center',gap:8,width:'100%',padding:'9px 12px',
                            background:catsSelBib.includes(c)?'var(--neo-bg)':'transparent',
                            border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",
                            fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',
                            color:catsSelBib.includes(c)?'var(--neo-gold)':'var(--neo-text2)',textAlign:'left',
                          }}>
                            <span style={{width:10,height:10,borderRadius:2,border:`1px solid ${catsSelBib.includes(c)?'var(--neo-gold)':'var(--neo-text2)'}`,background:catsSelBib.includes(c)?'var(--neo-gold)':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'#1a1610'}}>
                              {catsSelBib.includes(c)&&'✓'}
                            </span>
                            {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Dropdown MO */}
                  <div style={{flex:1,position:'relative'}}>
                    <div style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:5}}>
                      Mão de Obra {seccoesMO.length>0&&<span style={{color:'#b07acc',fontWeight:700}}>({seccoesMO.length})</span>}
                    </div>
                    <button onClick={()=>{setMoDropOpen(o=>!o);setBibDropOpen(false)}} style={{
                      width:'100%',display:'flex',alignItems:'center',justifyContent:'space-between',
                      background:'var(--neo-bg)',border:'none',borderRadius:'var(--neo-radius-sm)',
                      boxShadow:'var(--neo-shadow-out-sm)',padding:'8px 12px',cursor:'pointer',
                      fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',
                      color: seccoesMO.length>0 ? '#b07acc' : 'var(--neo-text2)',
                    }}>
                      <span>{seccoesMO.length===0 ? 'Todas as secções' : seccoesMO.map(s=>s.replace(/^\d+ · /,'')).join(', ').substring(0,28)+(seccoesMO.map(s=>s.replace(/^\d+ · /,'')).join(', ').length>28?'…':'')}</span>
                      <span style={{fontSize:8,opacity:.5}}>{moDropOpen?'▲':'▼'}</span>
                    </button>
                    {moDropOpen&&(
                      <div className="neo-dropdown" style={{position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'var(--neo-bg2)',borderRadius:'var(--neo-radius-sm)',boxShadow:'var(--neo-shadow-out)',zIndex:50}}>
                        <button onClick={()=>setSeccoesMO([])} style={{display:'block',width:'100%',padding:'9px 12px',background:seccoesMO.length===0?'var(--neo-bg)':'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',color:seccoesMO.length===0?'#b07acc':'var(--neo-text2)',textAlign:'left'}}>
                          Todas
                        </button>
                        {MO_SECCOES.map(s=>(
                          <button key={s} onClick={()=>setSeccoesMO(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s])} style={{
                            display:'flex',alignItems:'center',gap:8,width:'100%',padding:'9px 12px',
                            background:seccoesMO.includes(s)?'var(--neo-bg)':'transparent',
                            border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",
                            fontSize:9,letterSpacing:'0.1em',textTransform:'uppercase',
                            color:seccoesMO.includes(s)?'#b07acc':'var(--neo-text2)',textAlign:'left',
                          }}>
                            <span style={{width:10,height:10,borderRadius:2,border:`1px solid ${seccoesMO.includes(s)?'#b07acc':'var(--neo-text2)'}`,background:seccoesMO.includes(s)?'#b07acc':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:7,color:'#1a1610'}}>
                              {seccoesMO.includes(s)&&'✓'}
                            </span>
                            {s.replace(/^\d+ · /,'')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {(catsSelBib.length>0||seccoesMO.length>0)&&(
                    <button onClick={()=>{setCatsSelBib([]);setSeccoesMO([]);setBibDropOpen(false);setMoDropOpen(false)}} style={{alignSelf:'flex-end',marginBottom:2,background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--neo-text2)',whiteSpace:'nowrap'}}>
                      ✕ Limpar
                    </button>
                  )}
                </div>
              )}
            </div>
            <button onClick={analisar} disabled={!descricao.trim()||!apiKey}
              className="neo-btn neo-btn-gold" style={{width:'100%',height:44,fontSize:11,borderRadius:'var(--neo-radius-pill)',opacity:(!descricao.trim()||!apiKey)?.4:1}}>
              {!apiKey ? 'Configura a API key (⚙)' : 'Analisar projecto'}
            </button>
            {erro&&(
              <div style={{marginTop:16,padding:'12px 14px',background:'rgba(139,48,48,0.15)',borderLeft:'2px solid #8b3030',borderRadius:4,fontSize:12,fontWeight:300,color:'#c07070',lineHeight:1.6}}>
                {erro}
                <div style={{marginTop:8}}>
                  <button onClick={analisar} style={{background:'transparent',border:'none',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:10,color:'var(--neo-gold2)',letterSpacing:'0.1em',textTransform:'uppercase'}}>Tentar novamente →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── LOADING ── */}
        {loading&&(
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'60px 20px',gap:20}}>
            <div style={{width:48,height:48,borderRadius:'50%',border:'2px solid rgba(200,169,110,0.2)',borderTopColor:'var(--neo-gold)',animation:'spin 1s linear infinite'}}/>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:12,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-text2)',marginBottom:6}}>A analisar o projecto</div>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)',letterSpacing:'0.08em'}}>A IA está a seleccionar materiais e serviços…</div>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        )}

        {/* ── RESULTADO ── */}
        {resultado&&!loading&&(
          <div>
            <div style={{background:'var(--neo-bg2)',borderRadius:'var(--neo-radius)',boxShadow:'var(--neo-shadow-out-sm)',padding:'14px 16px',marginBottom:16,borderLeft:'2px solid var(--neo-gold)'}}>
              <div style={{fontFamily:"'Barlow Condensed'",fontSize:9,fontWeight:700,letterSpacing:'0.18em',textTransform:'uppercase',color:'var(--neo-gold)',marginBottom:8}}>Análise</div>
              <div style={{fontSize:13,fontWeight:300,color:'var(--neo-text)',lineHeight:1.7}}>{resultado.resumo}</div>
              {resultado.notas&&<div style={{marginTop:10,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.06)',fontSize:12,fontWeight:300,color:'var(--neo-text2)',lineHeight:1.6}}>
                <span style={{fontFamily:"'Barlow Condensed'",fontSize:8,letterSpacing:'0.14em',textTransform:'uppercase',color:'var(--neo-text2)',marginRight:8}}>Notas</span>
                {resultado.notas}
              </div>}
            </div>
            {(resultado.categorias||[]).map(cat=>(
              <CatCard key={cat.nome} cat={cat} aceite={!!aceites[cat.nome]}
                onToggle={()=>setAceites(p=>({...p,[cat.nome]:!p[cat.nome]}))}/>
            ))}
            <button onClick={()=>{setResultado(null);setErro('');setDescricao('')}}
              style={{width:'100%',marginTop:8,background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'var(--neo-radius-pill)',padding:'10px',cursor:'pointer',fontFamily:"'Barlow Condensed'",fontSize:9,letterSpacing:'0.16em',textTransform:'uppercase',color:'var(--neo-text2)'}}>
              ← Nova análise
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── KeyInput ──────────────────────────────────────────────────────────────────
function KeyInput({ onSave, current }) {
  const [val, setVal] = useState(current||'')
  return(
    <div style={{display:'flex',gap:8}}>
      <input value={val} onChange={e=>setVal(e.target.value)}
        type="password" placeholder="gsk_…"
        className="neo-input" style={{flex:1,fontFamily:'monospace',fontSize:12}}/>
      <button onClick={()=>onSave(val)}
        className="neo-btn neo-btn-gold" style={{height:36,padding:'0 16px',fontSize:9,borderRadius:'var(--neo-radius-pill)',flexShrink:0}}>
        Guardar
      </button>
    </div>
  )
}

// ── CatCard ───────────────────────────────────────────────────────────────────
function CatCard({ cat, aceite, onToggle }) {
  const total = (cat.items||[]).reduce((s,i)=>s+(i.pvp||0),0)
  const COR = { 'Materiais':'var(--neo-gold)', 'Mão de Obra':'#b07acc', 'Tampos':'#4a8fa8' }
  const cor = COR[cat.nome] || 'var(--neo-text2)'
  const borderCol = aceite
    ? cor==='var(--neo-gold)' ? 'rgba(200,169,110,0.35)' : cor==='#b07acc' ? 'rgba(176,122,204,0.35)' : 'rgba(74,143,168,0.35)'
    : 'rgba(255,255,255,0.05)'
  return(
    <div style={{marginBottom:12,borderRadius:'var(--neo-radius)',overflow:'hidden',boxShadow:'var(--neo-shadow-out-sm)',border:`1px solid ${borderCol}`,opacity:aceite?1:.5,transition:'opacity .2s,border .2s'}}>
      <div style={{display:'flex',alignItems:'center',padding:'12px 14px',background:'var(--neo-bg2)',gap:10}}>
        <button onClick={onToggle} style={{width:36,height:20,borderRadius:10,border:'none',cursor:'pointer',background:aceite?cor:'var(--neo-bg)',boxShadow:aceite?'var(--neo-shadow-in-sm)':'var(--neo-shadow-out-sm)',position:'relative',transition:'all .2s',flexShrink:0}}>
          <div style={{position:'absolute',top:2,width:16,height:16,borderRadius:'50%',background:'#fff',left:aceite?18:2,transition:'left .2s',boxShadow:'0 1px 3px rgba(0,0,0,0.4)'}}/>
        </button>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:cor,flex:1}}>{cat.nome}</span>
        <span style={{fontFamily:"'Barlow Condensed'",fontSize:9,color:'var(--neo-text2)'}}>{(cat.items||[]).length} item{(cat.items||[]).length!==1?'s':''}</span>
        {total>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:14,fontWeight:700,color:cor}}>{total.toFixed(2)} €</span>}
      </div>
      {(cat.items||[]).map((item,i)=>(
        <div key={i} style={{padding:'10px 14px',borderTop:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:10,background:'var(--neo-bg)'}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
              <span style={{fontFamily:"'Barlow Condensed'",fontSize:12,fontWeight:700,letterSpacing:'0.08em',color:cor}}>{item.ref}</span>
            </div>
            <div style={{fontSize:12,fontWeight:300,color:'var(--neo-text)',lineHeight:1.4}}>{item.desc}</div>
          </div>
          {item.pvp>0&&<span style={{fontFamily:"'Barlow Condensed'",fontSize:13,fontWeight:600,color:'var(--neo-text2)',flexShrink:0}}>{item.pvp.toFixed(2)} €</span>}
        </div>
      ))}
    </div>
  )
}

import React, { useState, useRef, useEffect } from 'react'
import { db } from '../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { MAO_DE_OBRA } from '../data/maoDeObra'
import { addToOrcamento } from '../hooks/useOrcamento'

// ── Gemini 1.5 Flash — gratuito, sem CORS ────────────────────────────────────
const GEMINI_MODEL = 'gemini-1.5-flash-latest'
const GEMINI_URL   = (key) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

// Contexto MO compacto — só standard com PVP ≥ 5€
const MO_CONTEXT = MAO_DE_OBRA
  .filter(s => s.tipo === 'standard' && s.pvp >= 5)
  .map(s => `[${s.id}] ${s.nome} | ${s.pvp}€/${s.un} | ${s.seccao.replace(/^\d+ · /,'')}`)
  .join('\n')

function buildPrompt(descricao, artigos) {
  const bib = artigos.length > 0
    ? artigos.slice(0,200).map(a =>
        `[${a.ref}] ${a.desc} | ${a.price>0?a.price+'€':''} | ${a.cat}${a.sub?' · '+a.sub:''}`
      ).join('\n')
    : '(biblioteca vazia)'

  return `És um assistente especializado em orçamentação de obras e instalações.
Respondes SEMPRE em português de Portugal.

BIBLIOTECA DE ARTIGOS (ref | descrição | preço | categoria):
${bib}

SERVIÇOS DE MÃO DE OBRA (código | nome | preço | secção):
${MO_CONTEXT}

INSTRUÇÕES OBRIGATÓRIAS:
- Usa APENAS itens das listas acima. Usa referências e preços exactos.
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
const KEY_STORAGE = 'hm_gemini_key'

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

  const analisar = async () => {
    if (!descricao.trim()) { showToast('Descreve o projecto primeiro'); return }
    if (!apiKey) { setShowKey(true); showToast('Configura a API key primeiro'); return }
    setLoading(true); setResultado(null); setErro(''); setAceites({})
    try {
      const prompt = buildPrompt(descricao, artigos)
      const res = await fetch(GEMINI_URL(apiKey), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2048 }
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(()=>({}))
        throw new Error(err?.error?.message || `HTTP ${res.status}`)
      }
      const data = await res.json()
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      const clean = text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()
      const parsed = JSON.parse(clean)
      setResultado(parsed)
      const init = {}
      ;(parsed.categorias||[]).forEach(c => { init[c.nome] = true })
      setAceites(init)
    } catch(e) {
      console.error(e)
      if (e.message?.includes('API_KEY') || e.message?.includes('400')) {
        setErro('API key inválida. Verifica a chave em aistudio.google.com.')
        setShowKey(true)
      } else {
        setErro('Não foi possível analisar o projecto. ' + (e.message||'Tenta novamente.'))
      }
    } finally { setLoading(false) }
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
              Gemini API Key
            </div>
            <div style={{fontSize:12,fontWeight:300,color:'var(--neo-text2)',lineHeight:1.8,marginBottom:12}}>
              1. Vai a <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{color:'var(--neo-gold)',textDecoration:'none'}}>aistudio.google.com/app/apikey ↗</a><br/>
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
        type="password" placeholder="AIza…"
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

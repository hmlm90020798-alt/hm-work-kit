import React, { useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import { ESPECIAIS, CATS_IGNORADAS, f2, kitsDoTipo, kitsParaCategoria } from './constantes'

// Ecrã "Adicionar ao projecto"
// Mostra 4 opcoes: Kit Base (dropdown), Instalacao, Tampos, Biblioteca (dropdown)
// Ao seleccionar uma opcao chama onIniciar(tarefa)
// tarefa: { tipo:'kit'|'especial'|'categoria', ref, nome, kitId?, kitItems? }

export default function Adicionar({ tipo, tipos, onIniciar, onVoltar }) {
  const [kits,        setKits]        = useState([])
  const [cats,        setCats]        = useState([])
  const [kitBaseOpen, setKitBaseOpen] = useState(false)
  const [bibOpen,     setBibOpen]     = useState(false)

  useEffect(() => {
    const u1 = onSnapshot(collection(db,'modelos'),   s => setKits(s.docs.map(d=>({id:d.id,...d.data()}))))
    const u2 = onSnapshot(collection(db,'categorias'),s => {
      const lista = s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??999)-(b.order??999))
      setCats(lista)
    })
    return () => { u1(); u2() }
  }, [])

  const tipoLabel    = tipos.find(t => t.id === tipo)?.label || ''
  const kitsBase     = kitsDoTipo(kits, tipoLabel)
  const catsFiltradas = cats.filter(c => !CATS_IGNORADAS.includes(c.name) && !CATS_IGNORADAS.includes(c.id))

  function escolherKit(kit) {
    onIniciar({
      tipo: 'kit',
      ref: 'kit::'+kit.id,
      nome: kit.name,
      kitId: kit.id,
      kitItems: (kit.items||[]).map(i=>({...i,incluido:true})),
    })
    setKitBaseOpen(false)
  }

  function escolherCategoria(cat) {
    const nKits = kitsParaCategoria(cat.name, kits, tipoLabel)
    onIniciar({
      tipo: 'categoria',
      ref: cat.name,
      nome: cat.name,
      destCat: cat.name,
      destino: 'biblioteca',
      kitsDisponiveis: nKits,
    })
    setBibOpen(false)
  }

  function escolherEspecial(esp) {
    onIniciar({
      tipo: 'especial',
      ref: esp.id,
      nome: esp.label,
      destino: esp.destino,
      sempreCalculadora: esp.sempreCalculadora,
    })
  }

  const btnStyle = (cor, sel) => ({
    display:'flex', alignItems:'center', gap:14,
    background: sel ? 'rgba('+rgbDoCor(cor)+',0.1)' : 'var(--neo-bg2)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderLeft: '3px solid '+cor,
    borderRadius:'var(--neo-radius)', boxShadow:'var(--neo-shadow-out-sm)',
    padding:'16px 16px', cursor:'pointer', textAlign:'left', width:'100%',
  })

  function rgbDoCor(cor) {
    if (!cor || cor.startsWith('var')) return '56,189,248'
    try { return parseInt(cor.slice(1,3),16)+','+parseInt(cor.slice(3,5),16)+','+parseInt(cor.slice(5,7),16) }
    catch { return '56,189,248' }
  }

  return (
    <div>
      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, letterSpacing:'0.22em', textTransform:'uppercase', color:'var(--neo-gold)', marginBottom:16 }}>
        O que pretendes adicionar?
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>

        {/* KIT BASE */}
        <div>
          <button onClick={()=>{ setKitBaseOpen(o=>!o); setBibOpen(false) }} style={btnStyle('#c8943a', kitBaseOpen)}>
            <span style={{ fontSize:22, flexShrink:0 }}>📦</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:14, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#c8943a' }}>Kit Base</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>
                {kitsBase.length > 0
                  ? kitsBase.length+' kit'+(kitsBase.length!==1?'s':'')+' disponiveis para '+tipoLabel
                  : 'Sem kits para '+tipoLabel+' - cria em "Kits"'}
              </div>
            </div>
            <span style={{ fontSize:10, color:'#c8943a', display:'inline-block', transform:kitBaseOpen?'rotate(180deg)':'rotate(0)', transition:'transform .2s' }}>v</span>
          </button>
          {kitBaseOpen && (
            <div style={{ background:'var(--neo-bg2)', border:'1px solid rgba(200,148,58,0.2)', borderTop:'none', borderRadius:'0 0 var(--neo-radius) var(--neo-radius)', overflow:'hidden' }}>
              {kitsBase.length === 0 && (
                <div style={{ padding:'14px 16px', fontFamily:"'Barlow Condensed'", fontSize:10, color:'var(--neo-text2)' }}>
                  Sem kits. Cria um kit em "Kits" com contexto "{tipoLabel}".
                </div>
              )}
              {kitsBase.map(kit => {
                const nIt = (kit.items||[]).length
                const tot = (kit.items||[]).reduce((s,i)=>s+(i.price||0)*(i.qty||1),0)
                return (
                  <button key={kit.id} onClick={()=>escolherKit(kit)}
                    style={{ display:'flex', alignItems:'center', gap:12, width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'13px 16px', cursor:'pointer', textAlign:'left' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)' }}>{kit.name}</div>
                      {kit.notas && <div style={{ fontSize:11, color:'var(--neo-text2)', marginTop:2 }}>{kit.notas}</div>}
                      <div style={{ display:'flex', gap:10, marginTop:3 }}>
                        <span style={{ fontFamily:"'Barlow Condensed'", fontSize:9, color:'var(--neo-text2)' }}>{nIt} artigo{nIt!==1?'s':''}</span>
                        {tot > 0 && <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, fontWeight:600, color:'var(--neo-gold)' }}>{f2(tot)} EUR</span>}
                      </div>
                    </div>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontSize:10, color:'#c8943a', letterSpacing:'0.1em', flexShrink:0 }}>Usar</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* INSTALACAO */}
        {ESPECIAIS.filter(e=>e.id==='instalacao').map(esp => (
          <button key={esp.id} onClick={()=>escolherEspecial(esp)} style={btnStyle(esp.cor, false)}>
            <span style={{ fontSize:20, flexShrink:0 }}>{esp.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:esp.cor }}>{esp.label}</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>{esp.desc}</div>
            </div>
          </button>
        ))}

        {/* TAMPOS */}
        {ESPECIAIS.filter(e=>e.id==='tampos').map(esp => (
          <button key={esp.id} onClick={()=>escolherEspecial(esp)} style={btnStyle(esp.cor, false)}>
            <span style={{ fontSize:20, flexShrink:0 }}>{esp.icon}</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:esp.cor }}>{esp.label}</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>{esp.desc}</div>
            </div>
          </button>
        ))}

        {/* BIBLIOTECA */}
        <div>
          <button onClick={()=>{ setBibOpen(o=>!o); setKitBaseOpen(false) }} style={btnStyle('rgba(56,189,248,0.8)', bibOpen)}>
            <span style={{ fontSize:20, flexShrink:0 }}>📚</span>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:13, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)' }}>Biblioteca</div>
              <div style={{ fontFamily:"'Barlow Condensed'", fontSize:9, letterSpacing:'0.1em', color:'var(--neo-text2)', marginTop:2 }}>Selecciona uma categoria para adicionar</div>
            </div>
            <span style={{ fontSize:10, color:'var(--neo-text2)', display:'inline-block', transform:bibOpen?'rotate(180deg)':'rotate(0)', transition:'transform .2s' }}>v</span>
          </button>
          {bibOpen && (
            <div style={{ background:'var(--neo-bg2)', border:'1px solid rgba(255,255,255,0.08)', borderTop:'none', borderRadius:'0 0 var(--neo-radius) var(--neo-radius)', overflow:'hidden', maxHeight:320, overflowY:'auto' }}>
              {catsFiltradas.map(cat => {
                const nKits = kitsParaCategoria(cat.name, kits, tipoLabel).length
                return (
                  <button key={cat.id} onClick={()=>escolherCategoria(cat)}
                    style={{ display:'flex', alignItems:'center', gap:12, width:'100%', background:'transparent', border:'none', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'11px 16px', cursor:'pointer', textAlign:'left' }}>
                    <span style={{ fontSize:16, flexShrink:0 }}>{cat.icon||'📋'}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:"'Barlow Condensed'", fontSize:12, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'var(--neo-text)' }}>{cat.name}</div>
                      {nKits > 0 && <div style={{ fontFamily:"'Barlow Condensed'", fontSize:8, color:'var(--neo-text2)', marginTop:1 }}>{nKits} kit{nKits!==1?'s':''}</div>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

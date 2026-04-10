import React, { useState, useEffect, useCallback } from 'react'
import { db } from '../firebase'
import { collection, doc, onSnapshot, getDoc, setDoc } from 'firebase/firestore'
import { addToOrcamento } from '../hooks/useOrcamento'

// ── Tipos de projecto com ícone, cor e componentes disponíveis ─────────────
const TIPOS_PROJECTO = [
  {
    id: 'cozinha',
    label: 'Cozinha',
    icon: '🍳',
    cor: '#c8943a',
    componentes: ['kit', 'tampos', 'eletro', 'acessorios', 'iluminacao', 'ferragens', 'instalacao'],
  },
  {
    id: 'banho',
    label: 'Casa de Banho',
    icon: '🚿',
    cor: '#4a8fa8',
    componentes: ['kit', 'acessorios', 'iluminacao', 'ferragens', 'instalacao'],
  },
  {
    id: 'quarto',
    label: 'Quarto',
    icon: '🛏',
    cor: '#8a9e6e',
    componentes: ['kit', 'iluminacao', 'ferragens', 'instalacao'],
  },
  {
    id: 'escritorio',
    label: 'Escritório',
    icon: '💼',
    cor: '#b07acc',
    componentes: ['kit', 'iluminacao', 'ferragens', 'instalacao'],
  },
  {
    id: 'outro',
    label: 'Outro',
    icon: '✦',
    cor: '#7a7a72',
    componentes: ['kit', 'tampos', 'eletro', 'acessorios', 'iluminacao', 'ferragens', 'instalacao'],
  },
]

// ── Componentes disponíveis — mapeamento para categoria da Biblioteca ──────
const COMPONENTES = {
  kit:        { label: 'Kit base',         icon: '📦', desc: 'Artigos essenciais pré-seleccionados',  cor: '#c8943a' },
  tampos:     { label: 'Tampos',           icon: '⬛', desc: 'Calculadora ANIGRACO',                  cor: '#4a8fa8' },
  eletro:     { label: 'Eletrodomésticos', icon: '⚡', desc: 'Da biblioteca de artigos',              cor: '#8a9e6e' },
  acessorios: { label: 'Acessórios',       icon: '🔩', desc: 'Da biblioteca de artigos',              cor: '#b07acc' },
  iluminacao: { label: 'Iluminação',       icon: '💡', desc: 'Da biblioteca de artigos',              cor: '#d4b87a' },
  ferragens:  { label: 'Ferragens',        icon: '🔧', desc: 'Da biblioteca de artigos',              cor: '#7a9e9a' },
  instalacao: { label: 'Instalação',       icon: '🛠',  desc: 'Mão de obra e serviços',               cor: '#b07acc' },
}

// Mapeamento componente → categoria Biblioteca / secção MO
const COMP_CATEGORIA = {
  eletro:     'Eletrodomésticos',
  acessorios: 'Acessórios',
  iluminacao: 'Iluminação',
  ferragens:  'Ferragens',
}

// ── Passos do guia ────────────────────────────────────────────────────────
const PASSOS = ['tipo', 'componentes', 'kits', 'execucao', 'resumo']

function f2(n) { return parseFloat(n || 0).toFixed(2) }

// ── Componente principal ──────────────────────────────────────────────────
export default function Projecto({ showToast, onNavegar }) {
  const [passo,         setPasso]         = useState('tipo')
  const [tipo,          setTipo]          = useState(null)
  const [compSel,       setCompSel]       = useState([])   // componentes seleccionados
  const [compActual,    setCompActual]    = useState(null) // componente em execução
  const [compFeitos,    setCompFeitos]    = useState([])   // componentes já tratados
  const [kits,          setKits]          = useState([])   // kits/modelos do Firestore
  const [kitSel,        setKitSel]        = useState(null) // kit escolhido
  const [kitItems,      setKitItems]      = useState([])   // itens do kit para ajustar
  const [orcItems,      setOrcItems]      = useState([])   // orçamento actual
  const [loading,       setLoading]       = useState(false)

  // ── Carregar kits do Firestore ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'modelos'), snap => {
      setKits(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return unsub
  }, [])

  // ── Carregar orçamento actual ──────────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'orcamento_ativo', 'ativo'), snap => {
      setOrcItems(snap.exists() ? (snap.data().items || []) : [])
    })
    return unsub
  }, [])

  const tipoActual = TIPOS_PROJECTO.find(t => t.id === tipo)

  // Kits filtrados pelo contexto do tipo de projecto
  const kitsFiltrados = kits.filter(k => {
    if (!tipo) return true
    const ctx = (k.contexto || '').toLowerCase()
    return ctx.includes(tipoActual?.label?.toLowerCase() || '') || ctx === '' || !k.contexto
  })

  // Total do orçamento actual
  const totalOrc = orcItems.reduce((s, i) => {
    const semQty = ['Tampos', 'Mão de Obra'].includes(i.origem)
    return s + (semQty ? (i.price || 0) : (i.price || 0) * (i.qty || 1))
  }, 0)

  // Componentes que ainda faltam executar
  const compPorFazer = compSel.filter(c => !compFeitos.includes(c))

  // ── PASSO: tipo ────────────────────────────────────────────────────────
  const escolherTipo = (t) => {
    setTipo(t.id)
    setCompSel([])
    setCompFeitos([])
    setKitSel(null)
    setKitItems([])
    setPasso('componentes')
  }

  // ── PASSO: componentes ─────────────────────────────────────────────────
  const toggleComp = (id) => {
    setCompSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  const avancarParaExecucao = () => {
    if (!compSel.length) { showToast('Selecciona pelo menos um componente'); return }
    // Se tem kit, vai primeiro para escolher kit
    if (compSel.includes('kit')) {
      setPasso('kits')
    } else {
      // Vai directamente para o primeiro componente
      setCompActual(compSel[0])
      setPasso('execucao')
    }
  }

  // ── PASSO: kits ────────────────────────────────────────────────────────
  const escolherKit = (kit) => {
    setKitSel(kit)
    // Clonar os itens para permitir ajustes
    setKitItems((kit.items || []).map(i => ({ ...i, incluido: true })))
  }

  const confirmarKit = async () => {
    if (!kitSel) { showToast('Escolhe um kit primeiro'); return }
    setLoading(true)
    const itensParaAdicionar = kitItems.filter(i => i.incluido)
    for (const item of itensParaAdicionar) {
      await addToOrcamento({
        ref:      item.ref,
        desc:     item.desc,
        cat:      item.cat || '',
        sub:      item.sub || '',
        price:    item.price || 0,
        supplier: item.supplier || '',
        link:     item.link || '',
        origem:   'Kits',
      }, () => {})
    }
    setLoading(false)
    showToast(`Kit "${kitSel.name}" adicionado — ${itensParaAdicionar.length} artigos`)
    marcarFeitoEAvancar('kit')
  }

  const saltarKit = () => marcarFeitoEAvancar('kit')

  // ── PASSO: execução — marcar feito e ir para próximo ──────────────────
  const marcarFeitoEAvancar = useCallback((comp) => {
    const novosFeitos = [...compFeitos, comp]
    setCompFeitos(novosFeitos)

    const restantes = compSel.filter(c => !novosFeitos.includes(c))
    if (restantes.length === 0) {
      setPasso('resumo')
    } else {
      const proximo = restantes[0]
      setCompActual(proximo)
      setPasso('execucao')
    }
  }, [compFeitos, compSel])

  // Navegar para secção e voltar ao guia
  const irParaSecção = (comp) => {
    const destinos = {
      tampos:     'tampos',
      eletro:     'biblioteca',
      acessorios: 'biblioteca',
      iluminacao: 'biblioteca',
      ferragens:  'biblioteca',
      instalacao: 'maodeobra',
    }
    const destino = destinos[comp]
    if (destino && onNavegar) {
      onNavegar(destino, COMP_CATEGORIA[comp] || null)
    }
  }

  // ── Reset completo ─────────────────────────────────────────────────────
  const recomecar = () => {
    setTipo(null)
    setCompSel([])
    setCompFeitos([])
    setCompActual(null)
    setKitSel(null)
    setKitItems([])
    setPasso('tipo')
  }

  // ── Progresso visual ───────────────────────────────────────────────────
  const progressoPct = compSel.length > 0
    ? Math.round((compFeitos.length / compSel.length) * 100)
    : 0

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', overflow: 'hidden',
      background: 'var(--neo-bg)', color: 'var(--neo-text)',
      fontFamily: "'Barlow', sans-serif",
    }}>

      {/* ── TOPBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 52, flexShrink: 0,
        background: 'var(--neo-bg)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {passo !== 'tipo' && (
            <button onClick={() => {
              if (passo === 'componentes') setPasso('tipo')
              else if (passo === 'kits') setPasso('componentes')
              else if (passo === 'execucao') setPasso(compSel.includes('kit') && !compFeitos.includes('kit') ? 'kits' : 'componentes')
              else if (passo === 'resumo') setPasso('execucao')
            }} style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: 'var(--neo-text2)', fontSize: 18, padding: '4px 6px',
              lineHeight: 1, transition: 'color .15s',
            }}>←</button>
          )}
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--neo-text)',
            }}>
              Novo Projecto
            </div>
            {tipoActual && (
              <div style={{
                fontFamily: "'Barlow Condensed'", fontSize: 9,
                letterSpacing: '0.12em', color: tipoActual.cor, marginTop: 1,
              }}>
                {tipoActual.icon} {tipoActual.label}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Total orçamento actual */}
          {totalOrc > 0 && (
            <div style={{
              background: 'rgba(200,169,110,0.1)',
              border: '1px solid rgba(200,169,110,0.25)',
              borderRadius: 'var(--neo-radius-pill)',
              padding: '4px 12px',
              fontFamily: "'Barlow Condensed'",
              fontSize: 11, fontWeight: 700,
              color: 'var(--neo-gold)',
              letterSpacing: '0.08em',
            }}>
              {f2(totalOrc)} €
            </div>
          )}
          {passo !== 'tipo' && (
            <button onClick={recomecar} style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 'var(--neo-radius-pill)',
              padding: '5px 12px', cursor: 'pointer',
              fontFamily: "'Barlow Condensed'",
              fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--neo-text2)',
            }}>
              Recomeçar
            </button>
          )}
        </div>
      </div>

      {/* ── BARRA DE PROGRESSO (só quando em execução) ── */}
      {['execucao', 'resumo'].includes(passo) && compSel.length > 0 && (
        <div style={{ height: 3, background: 'var(--neo-bg2)', flexShrink: 0 }}>
          <div style={{
            height: '100%',
            width: `${progressoPct}%`,
            background: 'linear-gradient(90deg, var(--neo-gold2), var(--neo-gold))',
            transition: 'width .4s ease',
            boxShadow: '0 0 8px rgba(200,169,110,0.4)',
          }}/>
        </div>
      )}

      {/* ── CONTEÚDO por passo ── */}
      <div className="neo-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 40px' }}>

        {/* ════════ PASSO 1: TIPO DE PROJECTO ════════ */}
        {passo === 'tipo' && (
          <div>
            <PassoHeader
              numero={1}
              titulo="Que tipo de projecto?"
              sub="Selecciona para começar"
            />
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 12, marginTop: 20,
            }}>
              {TIPOS_PROJECTO.map(t => (
                <button key={t.id} onClick={() => escolherTipo(t)}
                  className="proj-tipo-card"
                  style={{
                    background: 'var(--neo-bg2)',
                    border: `1px solid rgba(255,255,255,0.06)`,
                    borderRadius: 'var(--neo-radius)',
                    boxShadow: 'var(--neo-shadow-out-sm)',
                    padding: '22px 16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all .2s',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: 10,
                  }}>
                  <span style={{ fontSize: 32, lineHeight: 1 }}>{t.icon}</span>
                  <span style={{
                    fontFamily: "'Barlow Condensed'",
                    fontSize: 12, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--neo-text)',
                  }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ════════ PASSO 2: COMPONENTES ════════ */}
        {passo === 'componentes' && tipoActual && (
          <div>
            <PassoHeader
              numero={2}
              titulo="O que inclui este projecto?"
              sub="Selecciona tudo o que o cliente pretende"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              {tipoActual.componentes.map(id => {
                const comp = COMPONENTES[id]
                const sel  = compSel.includes(id)
                return (
                  <button key={id} onClick={() => toggleComp(id)}
                    className="proj-comp-card"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      background: sel
                        ? `linear-gradient(135deg, rgba(${hexToRgb(comp.cor)},0.12), rgba(${hexToRgb(comp.cor)},0.06))`
                        : 'var(--neo-bg2)',
                      border: sel
                        ? `1px solid ${comp.cor}55`
                        : '1px solid rgba(255,255,255,0.06)',
                      borderLeft: sel ? `3px solid ${comp.cor}` : '3px solid transparent',
                      borderRadius: 'var(--neo-radius)',
                      boxShadow: sel
                        ? `var(--neo-shadow-out-sm), 0 0 12px ${comp.cor}22`
                        : 'var(--neo-shadow-out-sm)',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .2s',
                      width: '100%',
                    }}>
                    {/* Checkbox */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 5,
                      border: sel ? `2px solid ${comp.cor}` : '2px solid rgba(255,255,255,0.15)',
                      background: sel ? comp.cor : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, transition: 'all .15s',
                      fontSize: 11, color: '#0f0d08', fontWeight: 700,
                    }}>
                      {sel && '✓'}
                    </div>
                    {/* Ícone */}
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{comp.icon}</span>
                    {/* Texto */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed'",
                        fontSize: 13, fontWeight: 700,
                        letterSpacing: '0.08em', textTransform: 'uppercase',
                        color: sel ? comp.cor : 'var(--neo-text)',
                        transition: 'color .15s',
                      }}>
                        {comp.label}
                      </div>
                      <div style={{
                        fontFamily: "'Barlow Condensed'",
                        fontSize: 9, letterSpacing: '0.1em',
                        color: 'var(--neo-text2)', marginTop: 2,
                      }}>
                        {comp.desc}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            {compSel.length > 0 && (
              <button onClick={avancarParaExecucao}
                className="neo-btn neo-btn-gold"
                style={{
                  width: '100%', height: 48, marginTop: 24,
                  fontSize: 11, letterSpacing: '0.14em',
                  borderRadius: 'var(--neo-radius)',
                }}>
                Continuar com {compSel.length} componente{compSel.length !== 1 ? 's' : ''} →
              </button>
            )}
          </div>
        )}

        {/* ════════ PASSO 3: ESCOLHER KIT ════════ */}
        {passo === 'kits' && (
          <div>
            <PassoHeader
              numero={3}
              titulo="Escolhe o kit base"
              sub="Artigos essenciais já pré-seleccionados — ajusta o que precisares"
            />

            {kitsFiltrados.length === 0 ? (
              <div style={{
                marginTop: 24, padding: '40px 20px', textAlign: 'center',
                background: 'var(--neo-bg2)', borderRadius: 'var(--neo-radius)',
                boxShadow: 'var(--neo-shadow-out-sm)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 12, opacity: .4 }}>📦</div>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase',
                  color: 'var(--neo-text2)', marginBottom: 8,
                }}>
                  Nenhum kit disponível
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 10, color: 'var(--neo-text2)', letterSpacing: '0.08em', lineHeight: 1.8,
                }}>
                  Cria kits em <strong style={{ color: 'var(--neo-gold)' }}>Kits</strong> no menu principal
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {kitsFiltrados.map(kit => {
                  const sel = kitSel?.id === kit.id
                  const nItems = (kit.items || []).length
                  const totalKit = (kit.items || []).reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0)
                  return (
                    <button key={kit.id} onClick={() => escolherKit(kit)}
                      className="proj-kit-card"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        background: sel ? 'rgba(200,169,110,0.08)' : 'var(--neo-bg2)',
                        border: sel ? '1px solid rgba(200,169,110,0.4)' : '1px solid rgba(255,255,255,0.06)',
                        borderLeft: sel ? '3px solid var(--neo-gold)' : '3px solid transparent',
                        borderRadius: 'var(--neo-radius)',
                        boxShadow: sel
                          ? 'var(--neo-shadow-out-sm), 0 0 14px rgba(200,169,110,0.15)'
                          : 'var(--neo-shadow-out-sm)',
                        padding: '14px 16px',
                        cursor: 'pointer', textAlign: 'left',
                        width: '100%', transition: 'all .2s',
                      }}>
                      {/* Radio */}
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%',
                        border: sel ? '2px solid var(--neo-gold)' : '2px solid rgba(255,255,255,0.2)',
                        background: sel ? 'var(--neo-gold)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, transition: 'all .15s',
                      }}>
                        {sel && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#0f0d08' }}/>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: "'Barlow Condensed'",
                          fontSize: 14, fontWeight: 700,
                          letterSpacing: '0.08em', textTransform: 'uppercase',
                          color: sel ? 'var(--neo-gold)' : 'var(--neo-text)',
                          transition: 'color .15s',
                        }}>
                          {kit.name}
                        </div>
                        {kit.notas && (
                          <div style={{
                            fontSize: 11, fontWeight: 300,
                            color: 'var(--neo-text2)', marginTop: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {kit.notas}
                          </div>
                        )}
                        <div style={{
                          display: 'flex', gap: 10, alignItems: 'center', marginTop: 4,
                        }}>
                          <span style={{
                            fontFamily: "'Barlow Condensed'", fontSize: 9,
                            color: 'var(--neo-text2)', letterSpacing: '0.1em',
                          }}>
                            {nItems} artigo{nItems !== 1 ? 's' : ''}
                          </span>
                          {totalKit > 0 && (
                            <span style={{
                              fontFamily: "'Barlow Condensed'", fontSize: 12,
                              fontWeight: 600, color: 'var(--neo-gold)',
                            }}>
                              {f2(totalKit)} €
                            </span>
                          )}
                          {kit.contexto && (
                            <span style={{
                              fontFamily: "'Barlow Condensed'", fontSize: 8,
                              letterSpacing: '0.12em', textTransform: 'uppercase',
                              color: 'var(--neo-text2)', background: 'var(--neo-bg)',
                              padding: '2px 7px', borderRadius: 'var(--neo-radius-pill)',
                              boxShadow: 'var(--neo-shadow-in-sm)',
                            }}>
                              {kit.contexto}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Ajuste de itens do kit seleccionado */}
            {kitSel && kitItems.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'var(--neo-text2)', marginBottom: 12,
                }}>
                  Ajusta os artigos do kit — desactiva o que o cliente não precisa
                </div>
                <div style={{
                  background: 'var(--neo-bg2)',
                  borderRadius: 'var(--neo-radius)',
                  boxShadow: 'var(--neo-shadow-out-sm)',
                  overflow: 'hidden',
                }}>
                  {kitItems.map((item, idx) => (
                    <KitItemRow
                      key={item.artId || idx}
                      item={item}
                      onChange={(inc) => setKitItems(p => p.map((x, i) => i === idx ? { ...x, incluido: inc } : x))}
                      onIrParaCategoria={() => {
                        if (onNavegar) onNavegar('biblioteca', item.cat || null)
                      }}
                    />
                  ))}
                </div>
                <div style={{
                  display: 'flex', gap: 8, marginTop: 16,
                }}>
                  <button onClick={saltarKit}
                    className="neo-btn neo-btn-ghost"
                    style={{ flex: 1, height: 44, fontSize: 10 }}>
                    Saltar kit
                  </button>
                  <button onClick={confirmarKit} disabled={loading}
                    className="neo-btn neo-btn-gold"
                    style={{ flex: 2, height: 44, fontSize: 11, letterSpacing: '0.12em' }}>
                    {loading ? 'A adicionar…' : `Adicionar kit (${kitItems.filter(i => i.incluido).length} artigos) →`}
                  </button>
                </div>
              </div>
            )}

            {/* Botão saltar kit se nenhum seleccionado */}
            {!kitSel && (
              <button onClick={saltarKit}
                className="neo-btn neo-btn-ghost"
                style={{ width: '100%', height: 44, marginTop: 20, fontSize: 10 }}>
                Continuar sem kit →
              </button>
            )}
          </div>
        )}

        {/* ════════ PASSO 4: EXECUÇÃO DE COMPONENTE ════════ */}
        {passo === 'execucao' && compActual && (
          <div>
            <PassoHeader
              numero={compFeitos.length + 1}
              titulo={COMPONENTES[compActual]?.label || compActual}
              sub={COMPONENTES[compActual]?.desc || ''}
              cor={COMPONENTES[compActual]?.cor}
              icon={COMPONENTES[compActual]?.icon}
            />

            {/* Indicador de progresso dos componentes */}
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 16, marginBottom: 24,
            }}>
              {compSel.map(c => (
                <span key={c} style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 8, letterSpacing: '0.12em', textTransform: 'uppercase',
                  padding: '3px 10px', borderRadius: 'var(--neo-radius-pill)',
                  background: compFeitos.includes(c)
                    ? 'rgba(200,169,110,0.15)'
                    : c === compActual
                      ? `rgba(${hexToRgb(COMPONENTES[c]?.cor || '#c8943a')},0.2)`
                      : 'var(--neo-bg2)',
                  color: compFeitos.includes(c)
                    ? 'var(--neo-gold)'
                    : c === compActual
                      ? (COMPONENTES[c]?.cor || 'var(--neo-gold)')
                      : 'var(--neo-text2)',
                  border: c === compActual
                    ? `1px solid ${COMPONENTES[c]?.cor || 'var(--neo-gold)'}44`
                    : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: compFeitos.includes(c) ? 'var(--neo-shadow-in-sm)' : 'var(--neo-shadow-out-sm)',
                }}>
                  {compFeitos.includes(c) ? '✓ ' : c === compActual ? '▶ ' : ''}{COMPONENTES[c]?.label || c}
                </span>
              ))}
            </div>

            {/* Acção principal para cada componente */}
            <div style={{
              background: 'var(--neo-bg2)',
              borderRadius: 'var(--neo-radius)',
              boxShadow: 'var(--neo-shadow-out-sm)',
              border: `1px solid ${COMPONENTES[compActual]?.cor || 'var(--neo-gold)'}22`,
              padding: '24px 20px',
              textAlign: 'center',
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>
                {COMPONENTES[compActual]?.icon}
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed'",
                fontSize: 13, fontWeight: 700,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: COMPONENTES[compActual]?.cor || 'var(--neo-gold)',
                marginBottom: 8,
              }}>
                {COMPONENTES[compActual]?.label}
              </div>
              <div style={{
                fontSize: 13, fontWeight: 300,
                color: 'var(--neo-text2)', lineHeight: 1.7,
                marginBottom: 24,
              }}>
                {compActual === 'tampos' && 'Abre a calculadora ANIGRACO, faz o cálculo e guarda — volta automaticamente ao guia.'}
                {compActual === 'instalacao' && 'Abre a secção de Mão de Obra para seleccionar os serviços de instalação.'}
                {['eletro','acessorios','iluminacao','ferragens'].includes(compActual) && `Abre a Biblioteca filtrada por "${COMP_CATEGORIA[compActual]}" para seleccionar os artigos.`}
              </div>

              <button
                onClick={() => irParaSecção(compActual)}
                className="neo-btn neo-btn-gold"
                style={{ height: 48, padding: '0 32px', fontSize: 11, letterSpacing: '0.12em', marginBottom: 8 }}>
                Abrir {COMPONENTES[compActual]?.label} →
              </button>
            </div>

            {/* Botão "já tratei" — marca como feito e avança */}
            <button onClick={() => marcarFeitoEAvancar(compActual)}
              className="neo-btn neo-btn-ghost"
              style={{ width: '100%', height: 44, fontSize: 10 }}>
              {compPorFazer.length === 1
                ? '✓ Concluído — ver resumo'
                : `✓ Feito — próximo: ${COMPONENTES[compSel.find(c => c !== compActual && !compFeitos.includes(c))]?.label || ''}`
              }
            </button>
          </div>
        )}

        {/* ════════ PASSO 5: RESUMO ════════ */}
        {passo === 'resumo' && (
          <div>
            <PassoHeader
              numero="✓"
              titulo="Projecto concluído"
              sub={tipoActual ? `${tipoActual.icon} ${tipoActual.label} — todos os componentes tratados` : 'Todos os componentes tratados'}
              cor="var(--neo-gold)"
            />

            {/* Total do orçamento */}
            {totalOrc > 0 && (
              <div style={{
                background: 'rgba(200,169,110,0.08)',
                border: '1px solid rgba(200,169,110,0.25)',
                borderRadius: 'var(--neo-radius)',
                padding: '20px 24px',
                textAlign: 'center',
                marginTop: 20, marginBottom: 20,
              }}>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: 'var(--neo-text2)', marginBottom: 8,
                }}>
                  Total PVP indicativo
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 36, fontWeight: 700,
                  color: 'var(--neo-gold)',
                  textShadow: '0 0 20px rgba(200,169,110,0.3)',
                }}>
                  {f2(totalOrc)} €
                </div>
                <div style={{
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 8, color: 'var(--neo-text2)',
                  letterSpacing: '0.1em', marginTop: 6,
                }}>
                  {orcItems.length} item{orcItems.length !== 1 ? 's' : ''} no orçamento
                </div>
              </div>
            )}

            {/* Componentes tratados */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24,
            }}>
              {compFeitos.map(c => (
                <div key={c} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--neo-bg2)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${COMPONENTES[c]?.cor || 'var(--neo-gold)'}`,
                  borderRadius: 'var(--neo-radius-sm)',
                  padding: '10px 14px',
                }}>
                  <span style={{ fontSize: 16 }}>{COMPONENTES[c]?.icon}</span>
                  <span style={{
                    fontFamily: "'Barlow Condensed'",
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: COMPONENTES[c]?.cor || 'var(--neo-gold)',
                    flex: 1,
                  }}>
                    {COMPONENTES[c]?.label}
                  </span>
                  <span style={{
                    fontFamily: "'Barlow Condensed'",
                    fontSize: 9, color: 'var(--neo-gold)',
                    letterSpacing: '0.1em',
                  }}>
                    ✓
                  </span>
                </div>
              ))}
            </div>

            {/* Acções finais */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => onNavegar && onNavegar('orcamentos')}
                className="neo-btn neo-btn-gold"
                style={{ width: '100%', height: 50, fontSize: 11, letterSpacing: '0.12em' }}>
                Ver orçamento completo →
              </button>
              <button onClick={() => onNavegar && onNavegar('proposta')}
                style={{
                  width: '100%', height: 44,
                  background: 'transparent',
                  border: '1px solid rgba(200,169,110,0.3)',
                  borderRadius: 'var(--neo-radius)',
                  cursor: 'pointer',
                  fontFamily: "'Barlow Condensed'",
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: 'var(--neo-gold)',
                  transition: 'all .18s',
                }}>
                Criar proposta para o cliente →
              </button>
              <button onClick={recomecar}
                className="neo-btn neo-btn-ghost"
                style={{ width: '100%', height: 40, fontSize: 10 }}>
                Novo projecto
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Cabeçalho de passo ────────────────────────────────────────────────────
function PassoHeader({ numero, titulo, sub, cor, icon }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: cor ? `${cor}22` : 'rgba(200,169,110,0.15)',
          border: `1px solid ${cor || 'var(--neo-gold)'}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Barlow Condensed'",
          fontSize: 11, fontWeight: 700,
          color: cor || 'var(--neo-gold)',
          flexShrink: 0,
        }}>
          {icon || numero}
        </div>
        <div style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 18, fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          color: 'var(--neo-text)',
        }}>
          {titulo}
        </div>
      </div>
      {sub && (
        <div style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 10, letterSpacing: '0.12em',
          color: 'var(--neo-text2)', paddingLeft: 38,
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

// ── Linha de item do kit para ajuste ─────────────────────────────────────
function KitItemRow({ item, onChange, onIrParaCategoria }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      transition: 'background .15s',
      background: item.incluido ? 'transparent' : 'rgba(0,0,0,0.15)',
      opacity: item.incluido ? 1 : 0.5,
    }}>
      {/* Toggle incluído */}
      <button onClick={() => onChange(!item.incluido)} style={{
        width: 20, height: 20, borderRadius: 4,
        border: item.incluido
          ? '2px solid var(--neo-gold)'
          : '2px solid rgba(255,255,255,0.15)',
        background: item.incluido ? 'var(--neo-gold)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, cursor: 'pointer', transition: 'all .15s',
        fontSize: 11, color: '#0f0d08', fontWeight: 700,
      }}>
        {item.incluido && '✓'}
      </button>

      {/* Ref */}
      <span style={{
        fontFamily: "'Barlow Condensed'",
        fontSize: 12, fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--neo-gold)',
        flexShrink: 0, minWidth: 70,
      }}>
        {item.ref}
      </span>

      {/* Desc + categoria */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12, fontWeight: 300,
          color: 'var(--neo-text)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.desc}
        </div>
        {item.cat && (
          <div style={{
            fontFamily: "'Barlow Condensed'",
            fontSize: 8, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--neo-text2)', marginTop: 2,
          }}>
            {item.cat}{item.sub ? ' · ' + item.sub : ''}
          </div>
        )}
      </div>

      {/* Preço */}
      {item.price > 0 && (
        <span style={{
          fontFamily: "'Barlow Condensed'",
          fontSize: 11, fontWeight: 600,
          color: 'var(--neo-text2)',
          flexShrink: 0,
        }}>
          {f2(item.price)} €
        </span>
      )}

      {/* Atalho para categoria */}
      {item.cat && (
        <button onClick={onIrParaCategoria} title={`Ver outros em ${item.cat}`}
          style={{
            background: 'var(--neo-bg)',
            border: 'none',
            borderRadius: 'var(--neo-radius-pill)',
            width: 26, height: 26,
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--neo-shadow-out-sm)',
            color: 'var(--neo-text2)',
            fontSize: 11, flexShrink: 0,
            transition: 'all .15s',
          }}>
          ↗
        </button>
      )}
    </div>
  )
}

// ── Utilitário: hex para rgb (para transparências) ─────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16)
  const g = parseInt(hex.slice(3,5), 16)
  const b = parseInt(hex.slice(5,7), 16)
  return `${r},${g},${b}`
}

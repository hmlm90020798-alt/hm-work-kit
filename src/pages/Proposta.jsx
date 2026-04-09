import React, { useState, useCallback, useEffect, useRef } from 'react'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'

// ── Firestore — documento único ───────────────────────────────────────────────
const PROPOSTA_REF = () => doc(db, 'proposta_ativa', 'ativa')

function uid() { return 'x' + Math.random().toString(36).slice(2, 8) }
function fv(v) { return parseFloat(v) || 0 }
function fmt(n) {
  return n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}

function defaultState() {
  return {
    total: '',
    cats: [
      { id: uid(), name: 'Tampos',          items: [{ id: uid(), desc: '', val: '' }] },
      { id: uid(), name: 'Eletrodomésticos', items: [{ id: uid(), desc: '', val: '' }] },
      { id: uid(), name: 'Acessórios',       items: [{ id: uid(), desc: '', val: '' }] },
      { id: uid(), name: 'Outros',           items: [{ id: uid(), desc: '', val: '' }] },
    ],
    collapsed: {},
  }
}

// Debounce para não escrever no Firestore a cada tecla
function useDebounce(fn, delay) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export default function Proposta({ showToast }) {
  const [state,   setState]   = useState(defaultState)
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)

  // ── Carregar do Firestore (onSnapshot) ─────────────────────────────────────
  useEffect(() => {
    const unsub = onSnapshot(PROPOSTA_REF(), snap => {
      if (snap.exists()) {
        const data = snap.data()
        // Garantir que cats e collapsed existem
        if (data.cats && Array.isArray(data.cats)) {
          setState(data)
        } else {
          setState(defaultState())
        }
      } else {
        setState(defaultState())
      }
      setLoading(false)
    }, () => {
      // Erro de leitura — usa estado local em memória
      setLoading(false)
      showToast('Sem ligação — a trabalhar localmente')
    })
    return unsub
  }, [])

  // ── Guardar no Firestore (com debounce 800ms) ─────────────────────────────
  const persistRaw = useCallback(async (next) => {
    setSaving(true)
    try {
      await setDoc(PROPOSTA_REF(), { ...next, updatedAt: Date.now() })
    } catch (e) {
      console.error('Erro ao guardar proposta:', e)
      showToast('Erro ao guardar — verifica a ligação')
    } finally {
      setSaving(false)
    }
  }, [])

  const persist = useDebounce(persistRaw, 800)

  const update = useCallback(fn => {
    setState(prev => {
      const next = fn(prev)
      persist(next)
      return next
    })
  }, [persist])

  // ── Cálculos ───────────────────────────────────────────────────────────────
  const catSum = cat => cat.items.reduce((s, i) => s + fv(i.val), 0)
  const known  = state.cats.reduce((s, c) => s + catSum(c), 0)
  const total  = fv(state.total)
  const moveis = total - known
  const isOver = total > 0 && moveis < -0.005

  // ── Handlers ──────────────────────────────────────────────────────────────
  const setTotal    = e => update(p => ({ ...p, total: e.target.value }))
  const toggleCat   = id => update(p => ({ ...p, collapsed: { ...p.collapsed, [id]: !p.collapsed[id] } }))
  const setCatName  = (id, name) => update(p => ({ ...p, cats: p.cats.map(c => c.id === id ? { ...c, name } : c) }))
  const addCat      = () => update(p => ({ ...p, cats: [...p.cats, { id: uid(), name: '', items: [{ id: uid(), desc: '', val: '' }] }] }))
  const delCat      = id => update(p => ({ ...p, cats: p.cats.filter(c => c.id !== id) }))
  const addItem     = catId => update(p => ({ ...p, cats: p.cats.map(c => c.id === catId ? { ...c, items: [...c.items, { id: uid(), desc: '', val: '' }] } : c) }))
  const delItem     = (catId, itemId) => update(p => ({
    ...p, cats: p.cats.map(c => {
      if (c.id !== catId) return c
      const items = c.items.filter(i => i.id !== itemId)
      return { ...c, items: items.length ? items : [{ id: uid(), desc: '', val: '' }] }
    })
  }))
  const setItemDesc = (catId, itemId, desc) => update(p => ({ ...p, cats: p.cats.map(c => c.id !== catId ? c : { ...c, items: c.items.map(i => i.id === itemId ? { ...i, desc } : i) }) }))
  const setItemVal  = (catId, itemId, val)  => update(p => ({ ...p, cats: p.cats.map(c => c.id !== catId ? c : { ...c, items: c.items.map(i => i.id === itemId ? { ...i, val  } : i) }) }))

  const copyVal = (val) => {
    navigator.clipboard.writeText(val.toFixed(2).replace('.', ',')).catch(() => {})
    showToast('Copiado — ' + fmt(val))
  }

  const resetAll = async () => {
    if (!confirm('Limpar toda a proposta?')) return
    const s = defaultState()
    setState(s)
    try {
      await setDoc(PROPOSTA_REF(), { ...s, updatedAt: Date.now() })
      showToast('Proposta limpa')
    } catch {
      showToast('Erro ao limpar — verifica a ligação')
    }
  }

  // ── Estilos ────────────────────────────────────────────────────────────────
  const S = {
    screen: { display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', background: 'var(--neo-bg)', color: 'var(--neo-text)', fontFamily: "'Barlow', sans-serif" },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 52, background: 'var(--neo-bg)', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.4)' },
    scroll: { flex: 1, overflowY: 'auto', padding: '12px 14px 32px' },
    card:   { background: 'var(--neo-bg2)', borderRadius: 'var(--neo-radius-sm)', boxShadow: 'var(--neo-shadow-out-sm)', marginBottom: 8, overflow: 'hidden' },
    label:  { fontFamily: "'Barlow Condensed'", fontSize: 9, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--neo-text2)' },
    input:  { background: 'var(--neo-bg)', border: 'none', borderRadius: 'var(--neo-radius-sm)', boxShadow: 'var(--neo-shadow-in-sm)', padding: '9px 12px', fontFamily: "'Barlow Condensed'", fontSize: 14, color: 'var(--neo-text)', outline: 'none', transition: 'box-shadow .15s' },
  }

  if (loading) {
    return (
      <div style={{ ...S.screen, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px solid rgba(200,169,110,0.2)', borderTopColor: 'var(--neo-gold)', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--neo-text2)' }}>A carregar proposta…</span>
      </div>
    )
  }

  return (
    <div style={S.screen}>

      {/* TOPBAR */}
      <div style={S.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--neo-text)' }}>
            Proposta
          </span>
          {/* Indicador de sincronização */}
          {saving && (
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.12em', color: 'var(--neo-gold)', opacity: 0.7 }}>↻ a guardar…</span>
          )}
          {!saving && !loading && (
            <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.1em', color: 'var(--neo-text2)', opacity: 0.5 }} title="Guardado na nuvem">☁</span>
          )}
        </div>
        <button onClick={resetAll} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--neo-radius-pill)', padding: '5px 12px', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--neo-text2)' }}>
          Limpar
        </button>
      </div>

      <div style={S.scroll} className="neo-scroll">

        {/* TOTAL */}
        <div style={{ ...S.card, borderLeft: '2px solid var(--neo-gold)', marginBottom: 16 }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ ...S.label, marginBottom: 8 }}>Total orçamento (€)</div>
            <input
              type="number" value={state.total} onChange={setTotal}
              placeholder="0,00" step="0.01" min="0"
              style={{ ...S.input, width: '100%', fontSize: 22, fontWeight: 700, textAlign: 'right', color: 'var(--neo-gold)' }}
            />
          </div>
        </div>

        {/* MÓVEIS — por diferença */}
        <div style={{ ...S.card, borderLeft: `2px solid ${isOver ? '#c07070' : '#4a8fa8'}`, marginBottom: 16 }}>
          <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...S.label, marginBottom: 4, color: isOver ? '#c07070' : '#4a8fa8' }}>
                Móveis — por diferença
              </div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, letterSpacing: '0.08em', color: 'var(--neo-text2)' }}>
                Total − Σ categorias
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 700, color: isOver ? '#c07070' : '#4a8fa8' }}>
                {isOver ? '⚠ ' : ''}{fmt(Math.max(0, moveis))}
              </span>
              <button onClick={() => copyVal(Math.max(0, moveis))} style={{ background: 'var(--neo-bg)', border: 'none', borderRadius: 'var(--neo-radius-pill)', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neo-shadow-out-sm)', color: 'var(--neo-text2)', fontSize: 12, flexShrink: 0 }}>
                ⎘
              </button>
            </div>
          </div>
          {isOver && (
            <div style={{ padding: '6px 14px 10px', fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.1em', color: '#c07070' }}>
              As categorias excedem o total em {fmt(Math.abs(moveis))}
            </div>
          )}
        </div>

        {/* CATEGORIAS */}
        {state.cats.map(cat => {
          const sum    = catSum(cat)
          const isOpen = !state.collapsed[cat.id]
          return (
            <div key={cat.id} style={S.card}>

              {/* Header categoria */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: isOpen ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <input
                  value={cat.name}
                  onChange={e => setCatName(cat.id, e.target.value)}
                  placeholder="Nome da categoria…"
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Barlow Condensed'", fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--neo-gold2)' }}
                />
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 700, color: 'var(--neo-text)' }}>
                  {fmt(sum)}
                </span>
                <button onClick={() => copyVal(sum)} style={{ background: 'var(--neo-bg)', border: 'none', borderRadius: 'var(--neo-radius-pill)', width: 26, height: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--neo-shadow-out-sm)', color: 'var(--neo-text2)', fontSize: 11, flexShrink: 0 }} title="Copiar valor">
                  ⎘
                </button>
                <button onClick={() => toggleCat(cat.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--neo-text2)', fontSize: 10, padding: '2px 4px', flexShrink: 0 }}>
                  {isOpen ? '▲' : '▼'}
                </button>
                <button onClick={() => delCat(cat.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--neo-text2)', fontSize: 13, padding: '2px 4px', opacity: 0.4, flexShrink: 0 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.4}>
                  ✕
                </button>
              </div>

              {/* Itens */}
              {isOpen && (
                <div>
                  {cat.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <input
                        value={item.desc}
                        onChange={e => setItemDesc(cat.id, item.id, e.target.value)}
                        placeholder="Descrição…"
                        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: "'Barlow'", fontSize: 12, fontWeight: 300, color: 'var(--neo-text)' }}
                      />
                      <input
                        type="number" value={item.val}
                        onChange={e => setItemVal(cat.id, item.id, e.target.value)}
                        placeholder="0,00" step="0.01" min="0"
                        style={{ ...S.input, width: 100, fontSize: 13, textAlign: 'right', padding: '5px 8px' }}
                      />
                      <button onClick={() => delItem(cat.id, item.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--neo-text2)', fontSize: 13, padding: '2px 4px', opacity: 0.35, flexShrink: 0 }} onMouseOver={e => e.target.style.opacity = 1} onMouseOut={e => e.target.style.opacity = 0.35}>
                        ✕
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addItem(cat.id)} style={{ display: 'block', width: '100%', padding: '7px 12px', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--neo-text2)', textAlign: 'left', transition: 'color .12s' }} onMouseOver={e => e.currentTarget.style.color = 'var(--neo-gold)'} onMouseOut={e => e.currentTarget.style.color = 'var(--neo-text2)'}>
                    + Linha
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {/* Adicionar categoria */}
        <button onClick={addCat} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '10px 14px', background: 'transparent', border: '1px dashed rgba(200,169,110,0.25)', borderRadius: 'var(--neo-radius-sm)', cursor: 'pointer', fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--neo-text2)', marginBottom: 20, transition: 'all .15s' }} onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.5)'; e.currentTarget.style.color = 'var(--neo-gold)' }} onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(200,169,110,0.25)'; e.currentTarget.style.color = 'var(--neo-text2)' }}>
          + Nova categoria
        </button>

        {/* RESUMO */}
        <div style={{ ...S.card, borderTop: '2px solid var(--neo-gold)' }}>
          <div style={{ padding: '12px 14px' }}>
            <div style={{ ...S.label, marginBottom: 12 }}>Resumo</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'var(--neo-text2)', letterSpacing: '0.06em' }}>Móveis</span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'var(--neo-text)', fontWeight: 600 }}>{fmt(Math.max(0, moveis))}</span>
            </div>
            {state.cats.map(cat => (
              <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'var(--neo-text2)', letterSpacing: '0.06em' }}>{cat.name || '—'}</span>
                <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'var(--neo-text)', fontWeight: 600 }}>{fmt(catSum(cat))}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neo-text)' }}>Total</span>
              <span style={{ fontFamily: "'Barlow Condensed'", fontSize: 18, fontWeight: 700, color: 'var(--neo-gold)' }}>{fmt(total)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

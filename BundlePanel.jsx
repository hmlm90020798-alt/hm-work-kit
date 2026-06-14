import React, { useState, useEffect } from 'react'

/**
 * BundlePanel
 *
 * Aparece quando o utilizador clica "+ Orç" num artigo que tem bundles.
 * Mostra o artigo principal + complementos checkáveis.
 * Ao confirmar, adiciona tudo ao orçamento de uma vez.
 *
 * Props:
 *   open         boolean
 *   artPrincipal { ref, desc, price, cat, sub, supplier, link }
 *   bundles      Array<bundle>  — bundles do artigo gatilho
 *   onConfirm    (itensSelecionados) => void
 *   onClose      () => void
 */
export default function BundlePanel({ open, artPrincipal, bundles, onConfirm, onClose }) {
  // Estado de selecção: ref → boolean
  const [sel, setSel] = useState({})

  // Reset quando abre com novos bundles
  useEffect(() => {
    if (!open || !bundles?.length) return
    const inicial = {}
    bundles.forEach(b => {
      b.complementos?.forEach(c => {
        // pré-seleccionar os marcados como obrigatório
        inicial[c.ref] = !!c.obrigatorio
      })
    })
    setSel(inicial)
  }, [open, bundles])

  if (!open || !artPrincipal) return null

  const toggle = (ref) => setSel(p => ({ ...p, [ref]: !p[ref] }))

  const handleConfirm = () => {
    // Sempre adiciona o artigo principal
    const itens = [{ ...artPrincipal, fromBundle: false }]
    // Adiciona complementos seleccionados
    bundles.forEach(b => {
      b.complementos?.forEach(c => {
        if (sel[c.ref]) {
          itens.push({
            ref:      c.ref,
            desc:     c.desc,
            price:    c.price || 0,
            qty:      c.qty   || 1,
            cat:      c.cat   || '',
            sub:      c.sub   || '',
            supplier: c.supplier || '',
            link:     c.link  || '',
            fromBundle: true,
            bundleTrigger: artPrincipal.ref,
          })
        }
      })
    })
    onConfirm(itens)
  }

  const totalSelecionados = Object.values(sel).filter(Boolean).length
  const nota = bundles[0]?.nota

  return (
    <>
      {/* Overlay escuro */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Painel */}
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0,
        width: 'min(420px, 100vw)',
        zIndex: 201,
        background: '#111110',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        fontFamily: "'Barlow', sans-serif",
      }}>

        {/* Cabeçalho */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12, flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: "'Barlow Condensed'", fontSize: 9, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: '#c8a96e', marginBottom: 4,
            }}>
              Complementos sugeridos
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed'", fontSize: 14, fontWeight: 600,
              letterSpacing: '0.04em', color: '#e8e4dc', lineHeight: 1.2,
            }}>
              {artPrincipal.desc}
            </div>
            <div style={{
              fontFamily: "'Barlow Condensed'", fontSize: 10,
              letterSpacing: '0.1em', color: '#6a6760', marginTop: 2,
            }}>
              {artPrincipal.ref}
              {artPrincipal.price > 0 && ` · ${artPrincipal.price.toFixed(2)} €`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#6a6760', fontSize: 18, lineHeight: 1, flexShrink: 0,
              padding: 4,
            }}
          >✕</button>
        </div>

        {/* Lista de complementos */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>

          {nota && (
            <div style={{
              padding: '8px 12px', borderRadius: 6, marginBottom: 14,
              background: 'rgba(200,169,110,0.07)',
              border: '1px solid rgba(200,169,110,0.15)',
              fontFamily: "'Barlow Condensed'", fontSize: 10,
              letterSpacing: '0.06em', color: 'rgba(200,169,110,0.8)',
              lineHeight: 1.5,
            }}>
              💡 {nota}
            </div>
          )}

          {bundles.map(b => (
            <div key={b.id}>
              {b.complementos?.map(c => {
                const checked = !!sel[c.ref]
                return (
                  <button
                    key={c.ref}
                    onClick={() => toggle(c.ref)}
                    style={{
                      width: '100%', textAlign: 'left',
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '11px 12px', marginBottom: 6,
                      borderRadius: 6, cursor: 'pointer',
                      background: checked
                        ? 'rgba(200,169,110,0.08)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${checked
                        ? 'rgba(200,169,110,0.3)'
                        : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all .15s',
                    }}
                  >
                    {/* Checkbox visual */}
                    <div style={{
                      width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                      border: `1.5px solid ${checked ? '#c8a96e' : 'rgba(255,255,255,0.2)'}`,
                      background: checked ? '#c8a96e' : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all .15s',
                    }}>
                      {checked && (
                        <span style={{ color: '#0a0a09', fontSize: 9, fontWeight: 900, lineHeight: 1 }}>✓</span>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "'Barlow Condensed'", fontSize: 13, fontWeight: 600,
                        letterSpacing: '0.03em',
                        color: checked ? '#e8e4dc' : '#9a9690',
                        lineHeight: 1.2, marginBottom: 3,
                        transition: 'color .15s',
                      }}>
                        {c.desc}
                      </div>
                      <div style={{
                        display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontFamily: "'Barlow Condensed'", fontSize: 10,
                          letterSpacing: '0.12em', color: '#c8943a', fontWeight: 600,
                        }}>{c.ref}</span>
                        {c.price > 0 && (
                          <span style={{
                            fontFamily: "'Barlow Condensed'", fontSize: 10,
                            color: '#6a6760', letterSpacing: '0.06em',
                          }}>{c.price.toFixed(2)} €</span>
                        )}
                        {c.obrigatorio && (
                          <span style={{
                            fontFamily: "'Barlow Condensed'", fontSize: 8,
                            letterSpacing: '0.14em', textTransform: 'uppercase',
                            color: 'rgba(200,169,110,0.6)',
                            padding: '1px 6px', borderRadius: 99,
                            background: 'rgba(200,169,110,0.08)',
                            border: '1px solid rgba(200,169,110,0.15)',
                          }}>sugerido</span>
                        )}
                        {c.qty > 1 && (
                          <span style={{
                            fontFamily: "'Barlow Condensed'", fontSize: 9,
                            color: '#6a6760', letterSpacing: '0.1em',
                          }}>×{c.qty}</span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Rodapé — acções */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 6,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: '#6a6760', cursor: 'pointer', transition: 'all .15s',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            style={{
              flex: 2, padding: '10px 0', borderRadius: 6,
              background: 'linear-gradient(135deg, #c8a96e, #b8924a)',
              border: 'none',
              fontFamily: "'Barlow Condensed'", fontSize: 11, fontWeight: 700,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: '#0a0a09', cursor: 'pointer', transition: 'all .15s',
            }}
          >
            Adicionar ao orçamento
            {totalSelecionados > 0 && (
              <span style={{
                marginLeft: 8, opacity: 0.7, fontWeight: 400, fontSize: 10,
              }}>
                +{totalSelecionados} complemento{totalSelecionados !== 1 ? 's' : ''}
              </span>
            )}
          </button>
        </div>
      </div>
    </>
  )
}

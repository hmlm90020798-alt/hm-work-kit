import React, { useState, useRef, useCallback } from 'react'
import { db } from '../firebase'
import { collection, doc, addDoc, setDoc, getDocs, query, where } from 'firebase/firestore'

/**
 * ImportModal — importação universal Excel/CSV
 *
 * Props:
 *   open       {boolean}
 *   onClose    {function}
 *   mode       {'biblioteca' | 'tampos'}
 *   showToast  {function}
 *
 * Colunas esperadas — Biblioteca:
 *   REFERÊNCIA | DESCRIÇÃO | CATEGORIA | SUBCATEGORIA | PREÇO | FORNECEDOR | LINK | NOTAS
 *
 * Colunas esperadas — Tampos (catálogo de referências à peça):
 *   REFERÊNCIA | DESCRIÇÃO | TIPO | PREÇO_C1 | PREÇO_PVP | UNIDADE | NOTAS
 */

// ── Leitores de ficheiro ────────────────────────────────────────────────────

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const headers = lines[0].split(/[;,\t]/).map(h => h.trim().replace(/^"|"$/g, '').toUpperCase())
  return lines.slice(1).map(line => {
    const vals = line.split(/[;,\t]/).map(v => v.trim().replace(/^"|"$/g, ''))
    const obj = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  }).filter(row => Object.values(row).some(v => v))
}

async function parseXLSX(file) {
  // usa SheetJS via CDN se disponível, senão trata como CSV
  if (typeof window.XLSX !== 'undefined') {
    const buf = await file.arrayBuffer()
    const wb  = window.XLSX.read(buf, { type: 'array' })
    const ws  = wb.Sheets[wb.SheetNames[0]]
    const raw = window.XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
    if (raw.length < 2) return []
    const headers = raw[0].map(h => String(h).trim().toUpperCase())
    return raw.slice(1).map(row => {
      const obj = {}
      headers.forEach((h, i) => { obj[h] = String(row[i] || '').trim() })
      return obj
    }).filter(row => Object.values(row).some(v => v))
  }
  // fallback: ler como texto CSV
  const text = await file.text()
  return parseCSV(text)
}

// ── Mapeamento de colunas ────────────────────────────────────────────────────

const COL_ALIASES = {
  // Biblioteca
  REF:         ['REF','REFERÊNCIA','REFERENCIA','CÓDIGO','CODIGO','SKU','CODE'],
  DESC:        ['DESC','DESCRIÇÃO','DESCRICAO','NOME','DESIGNAÇÃO','DESIGNACAO','DESCRIPTION'],
  CAT:         ['CAT','CATEGORIA','CATEGORY'],
  SUB:         ['SUB','SUBCATEGORIA','SUBCATEGORY','SUBCAT'],
  PRICE:       ['PREÇO','PRECO','PRICE','PVP_VENDA','PREÇO_VENDA','PRECO_VENDA'],
  SUPPLIER:    ['FORNECEDOR','SUPPLIER','MARCA','BRAND'],
  LINK:        ['LINK','URL','WWW'],
  NOTES:       ['NOTAS','NOTES','OBS','OBSERVAÇÕES','OBSERVACOES'],
  // Tampos
  TIPO:        ['TIPO','TYPE','MATERIAL'],
  PRECO_C1:    ['PREÇO_C1','PRECO_C1','C1','CUSTO','COST'],
  PRECO_PVP:   ['PREÇO_PVP','PRECO_PVP','PVP','VENDA'],
  UNIDADE:     ['UNIDADE','UNIT','UN'],
}

function findCol(headers, key) {
  const aliases = COL_ALIASES[key] || [key]
  return headers.find(h => aliases.includes(h.toUpperCase())) || null
}

function mapRow(row, mode) {
  const headers = Object.keys(row)
  const g = key => {
    const col = findCol(headers, key)
    return col ? (row[col] || '').trim() : ''
  }
  if (mode === 'tampos') {
    return {
      ref:      g('REF'),
      desc:     g('DESC'),
      tipo:     g('TIPO'),
      precoC1:  parseFloat(g('PRECO_C1')) || 0,
      precoPvp: parseFloat(g('PRECO_PVP')) || 0,
      unidade:  g('UNIDADE') || 'un',
      notes:    g('NOTES'),
    }
  }
  // biblioteca
  return {
    ref:      g('REF'),
    desc:     g('DESC'),
    cat:      g('CAT'),
    sub:      g('SUB'),
    price:    parseFloat(g('PRICE')) || 0,
    supplier: g('SUPPLIER'),
    link:     g('LINK'),
    notes:    g('NOTES'),
  }
}

function isValid(row, mode) {
  if (mode === 'tampos') return !!(row.ref && row.desc)
  return !!(row.ref && row.desc)
}

// ── Componente principal ─────────────────────────────────────────────────────

export default function ImportModal({ open, onClose, mode = 'biblioteca', showToast }) {
  const [step, setStep]         = useState('upload')   // upload | preview | done
  const [rows, setRows]         = useState([])
  const [errors, setErrors]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [progress, setProgress] = useState(0)
  const [drag, setDrag]         = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()

  const reset = () => {
    setStep('upload'); setRows([]); setErrors([])
    setLoading(false); setProgress(0); setFileName('')
  }

  const handleClose = () => { reset(); onClose() }

  const processFile = async (file) => {
    if (!file) return
    setFileName(file.name)
    try {
      let raw = []
      if (file.name.match(/\.xlsx?$/i)) {
        // Carregar SheetJS se não estiver disponível
        if (typeof window.XLSX === 'undefined') {
          await new Promise((res, rej) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
            s.onload = res; s.onerror = rej
            document.head.appendChild(s)
          })
        }
        raw = await parseXLSX(file)
      } else {
        const text = await file.text()
        raw = parseCSV(text)
      }

      if (raw.length === 0) { showToast('Ficheiro vazio ou sem dados'); return }

      const mapped  = raw.map(r => mapRow(r, mode))
      const valid   = mapped.filter(r => isValid(r, mode))
      const invalid = mapped.length - valid.length

      if (valid.length === 0) { showToast('Nenhuma linha válida encontrada'); return }

      const errs = []
      if (invalid > 0) errs.push(`${invalid} linha(s) ignorada(s) por falta de referência/descrição`)

      setRows(valid)
      setErrors(errs)
      setStep('preview')
    } catch (e) {
      console.error(e)
      showToast('Erro ao ler ficheiro')
    }
  }

  const onFileInput = (e) => processFile(e.target.files?.[0])

  const onDrop = useCallback((e) => {
    e.preventDefault(); setDrag(false)
    processFile(e.dataTransfer.files?.[0])
  }, [])

  const doImport = async () => {
    setLoading(true)
    setProgress(0)
    try {
      const colRef = collection(db, mode === 'tampos' ? 'tampos_catalogo' : 'artigos')

      // Buscar existentes para detetar duplicados por ref
      const snap = await getDocs(colRef)
      const existingByRef = {}
      snap.docs.forEach(d => { existingByRef[d.data().ref] = d.id })

      let done = 0
      for (const row of rows) {
        if (existingByRef[row.ref]) {
          // Substituir — a versão do ficheiro prevalece
          await setDoc(doc(db, mode === 'tampos' ? 'tampos_catalogo' : 'artigos', existingByRef[row.ref]), row)
        } else {
          await addDoc(colRef, row)
        }
        done++
        setProgress(Math.round((done / rows.length) * 100))
      }

      showToast(`${rows.length} artigo(s) importado(s)`)
      setStep('done')
    } catch (e) {
      console.error(e)
      showToast('Erro na importação')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  const isBib = mode === 'biblioteca'

  return (
    <div className="neo-overlay open" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="neo-modal" style={{ maxWidth: 500 }}>

        {/* Cabeçalho */}
        <div className="neo-modal-head">
          Importar {isBib ? 'artigos' : 'catálogo'}
          <button className="neo-modal-close" onClick={handleClose}>✕</button>
        </div>

        {/* ── STEP: UPLOAD ── */}
        {step === 'upload' && (
          <>
            {/* Descrição das colunas */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--neo-text3)', marginBottom: 10 }}>
                Colunas esperadas
              </div>
              <div style={{ background: 'var(--neo-bg)', padding: '12px 14px', borderLeft: '2px solid var(--neo-gold2)', fontFamily: "'Barlow Condensed'", fontSize: 11, letterSpacing: '0.08em', color: 'var(--neo-gold)', lineHeight: 2 }}>
                {isBib
                  ? 'REFERÊNCIA · DESCRIÇÃO · CATEGORIA · SUBCATEGORIA\nPREÇO · FORNECEDOR · LINK · NOTAS'
                  : 'REFERÊNCIA · DESCRIÇÃO · TIPO · PREÇO_C1 · PREÇO_PVP · UNIDADE · NOTAS'
                }
              </div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: 'var(--neo-text3)', marginTop: 8, letterSpacing: '0.08em' }}>
                Aceita Excel (.xlsx) e CSV (.csv). Cabeçalhos na primeira linha. Separador: vírgula, ponto e vírgula ou tab.
              </div>
            </div>

            {/* Zona de drop */}
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                padding: '36px 20px',
                borderRadius: 'var(--neo-radius)',
                background: 'var(--neo-bg)',
                boxShadow: drag ? 'var(--neo-shadow-in), var(--neo-glow-gold)' : 'var(--neo-shadow-in)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'box-shadow .2s',
                border: drag ? '1px dashed var(--neo-gold)' : '1px dashed transparent',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.4 }}>⬆</div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase', color: drag ? 'var(--neo-gold)' : 'var(--neo-text2)' }}>
                {drag ? 'Largar aqui' : 'Clica ou arrasta o ficheiro'}
              </div>
              <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: 'var(--neo-text3)', marginTop: 6, letterSpacing: '0.1em' }}>
                .xlsx · .xls · .csv
              </div>
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileInput} style={{ display: 'none' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="neo-btn neo-btn-ghost" onClick={handleClose}>Cancelar</button>
            </div>
          </>
        )}

        {/* ── STEP: PREVIEW ── */}
        {step === 'preview' && (
          <>
            {/* Resumo */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ flex: 1, background: 'var(--neo-bg)', borderRadius: 'var(--neo-radius-sm)', padding: '10px 14px', boxShadow: 'var(--neo-shadow-in-sm)' }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--neo-text3)', marginBottom: 4 }}>Ficheiro</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 11, color: 'var(--neo-text2)', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileName}</div>
              </div>
              <div style={{ background: 'var(--neo-bg)', borderRadius: 'var(--neo-radius-sm)', padding: '10px 16px', boxShadow: 'var(--neo-shadow-in-sm)', textAlign: 'center', flexShrink: 0 }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--neo-text3)', marginBottom: 4 }}>A importar</div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 22, fontWeight: 700, color: 'var(--neo-gold)' }}>{rows.length}</div>
              </div>
            </div>

            {errors.length > 0 && (
              <div style={{ background: 'rgba(139,48,48,0.15)', borderLeft: '2px solid var(--neo-danger)', padding: '10px 14px', marginBottom: 14, fontFamily: "'Barlow Condensed'", fontSize: 10, letterSpacing: '0.1em', color: '#c07070' }}>
                {errors.map((e, i) => <div key={i}>{e}</div>)}
              </div>
            )}

            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--neo-text3)', marginBottom: 8 }}>
              Pré-visualização (primeiros 5)
            </div>

            {/* Tabela preview */}
            <div className="neo-scroll" style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16 }}>
              {rows.slice(0, 5).map((row, i) => (
                <div key={i} style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 12, color: 'var(--neo-gold)', letterSpacing: '0.08em', minWidth: 90, flexShrink: 0 }}>{row.ref}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: 'var(--neo-text)', fontWeight: 300, marginBottom: 2 }}>{row.desc}</div>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: 'var(--neo-text3)', letterSpacing: '0.08em' }}>
                      {isBib
                        ? [row.cat, row.sub, row.price > 0 ? row.price.toFixed(2) + ' €' : '', row.supplier].filter(Boolean).join(' · ')
                        : [row.tipo, row.precoC1 > 0 ? 'C1: ' + row.precoC1 : '', row.precoPvp > 0 ? 'PVP: ' + row.precoPvp : '', row.unidade].filter(Boolean).join(' · ')
                      }
                    </div>
                  </div>
                </div>
              ))}
              {rows.length > 5 && (
                <div style={{ padding: '10px 12px', fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.14em', color: 'var(--neo-text3)', textAlign: 'center' }}>
                  + {rows.length - 5} mais…
                </div>
              )}
            </div>

            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, color: 'var(--neo-text3)', letterSpacing: '0.08em', marginBottom: 20, lineHeight: 1.8 }}>
              Artigos com referência já existente serão <span style={{ color: 'var(--neo-gold)' }}>substituídos</span> pela versão do ficheiro.
            </div>

            {/* Barra de progresso */}
            {loading && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ background: 'var(--neo-bg)', borderRadius: 4, height: 4, overflow: 'hidden', boxShadow: 'var(--neo-shadow-in-sm)' }}>
                  <div style={{ height: '100%', width: progress + '%', background: 'linear-gradient(90deg, #b8924a, #d4b87a)', transition: 'width .2s', borderRadius: 4 }} />
                </div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 9, letterSpacing: '0.12em', color: 'var(--neo-text3)', marginTop: 6, textAlign: 'right' }}>
                  {progress}%
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
              <button className="neo-btn neo-btn-ghost" onClick={reset} disabled={loading}>← Voltar</button>
              <button className="neo-btn neo-btn-gold" onClick={doImport} disabled={loading} style={{ minWidth: 120 }}>
                {loading ? 'A importar…' : `Importar ${rows.length}`}
              </button>
            </div>
          </>
        )}

        {/* ── STEP: DONE ── */}
        {step === 'done' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 20, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--neo-gold)', marginBottom: 8 }}>
              {rows.length} artigo{rows.length !== 1 ? 's' : ''} importado{rows.length !== 1 ? 's' : ''}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed'", fontSize: 10, color: 'var(--neo-text3)', letterSpacing: '0.14em', marginBottom: 32 }}>
              A biblioteca foi atualizada
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <button className="neo-btn neo-btn-ghost" onClick={reset}>Importar mais</button>
              <button className="neo-btn neo-btn-gold" onClick={handleClose}>Fechar</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

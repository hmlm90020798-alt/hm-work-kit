// Especiais fixos - sempre disponiveis em qualquer projecto
export const ESPECIAIS = [
  {
    id: 'instalacao',
    label: 'Instalacao',
    icon: '🛠',
    desc: 'Servicos de montagem',
    cor: '#9a7acc',
    destino: 'maodeobra',
    destCat: null,
  },
  {
    id: 'tampos',
    label: 'Tampos',
    icon: '⬛',
    desc: 'Calculadora ANIGRACO',
    cor: '#4a8fa8',
    destino: 'tampos',
    destCat: null,
    sempreCalculadora: true,
  },
]

// Categorias da Biblioteca que nao devem aparecer no dropdown da Biblioteca
// (ja estao representadas pelos especiais)
export const CATS_IGNORADAS = ['Tampos', 'tampos']

export function f2(n) { return parseFloat(n||0).toFixed(2) }

export function hexToRgb(hex) {
  if (!hex || hex.startsWith('var')) return '56,189,248'
  try { return parseInt(hex.slice(1,3),16)+','+parseInt(hex.slice(3,5),16)+','+parseInt(hex.slice(5,7),16) }
  catch { return '56,189,248' }
}

// Dado um nome resolve para objecto completo
export function resolverComp(catName, cats) {
  const esp = ESPECIAIS.find(e => e.label === catName || e.id === catName)
  if (esp) return esp
  const cat = cats.find(c => c.name === catName)
  if (cat) return {
    id: cat.id || catName,
    label: cat.name,
    icon: cat.icon || '📋',
    desc: cat.name,
    cor: cat.cor || '#c8943a',
    destino: 'biblioteca',
    destCat: cat.name,
    sempreCalculadora: false,
  }
  return {
    id: catName, label: catName, icon: '📋', desc: catName,
    cor: '#7a7a72', destino: 'biblioteca', destCat: catName, sempreCalculadora: false,
  }
}

// Kits para uma categoria (por campo categoria ou fallback por nome)
export function kitsParaCategoria(catName, kits, tipoLabel) {
  const cat = (catName||'').toLowerCase()
  const tipo = (tipoLabel||'').toLowerCase()
  return kits.filter(k => {
    if (k.categoria) return (k.categoria||'').toLowerCase() === cat
    const kn = (k.name||'').toLowerCase()
    if (kn.includes(cat)) return true
    return false
  })
}

// Kits do tipo do projecto (para Kit Base dropdown)
export function kitsDoTipo(kits, tipoLabel) {
  const tipo = (tipoLabel||'').toLowerCase()
  return kits.filter(k => {
    const kc = (k.contexto||'').toLowerCase()
    return kc === tipo || tipo.includes(kc) || kc.includes(tipo)
  })
}

// Verifica se ja existem itens no orcamento para este componente
export function temItensParaComp(comp, orcItems, kits, kitSelId) {
  if (!comp) return false
  if (comp.sempreCalculadora) return orcItems.some(i => i.origem === 'Tampos')
  if (comp.destino === 'maodeobra') return orcItems.some(i =>
    (i.origem||'').toLowerCase().includes('mao') || (i.origem||'').toLowerCase().includes('instalac')
  )
  if (kitSelId) {
    const kit = kits.find(k => k.id === kitSelId)
    if (kit) return orcItems.some(i => i.origem === kit.name)
  }
  if (comp.destCat) {
    const cat = comp.destCat.toLowerCase()
    return orcItems.some(i =>
      (i.cat||'').toLowerCase() === cat ||
      (i.origem||'').toLowerCase() === cat ||
      (i.origem||'').toLowerCase().includes(cat.split(' ')[0])
    )
  }
  return false
}

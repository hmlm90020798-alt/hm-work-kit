// Componentes especiais - nao sao categorias da Biblioteca
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

// Sugestoes por defeito para cada tipo de projecto (nomes de categorias)
// Estas sao apenas sugestoes - o utilizador pode alterar em preferencias
export const SUGESTOES_DEFEITO = {
  cozinha:    ['Eletrodomesticos', 'Acessorios', 'Ferragens', 'Iluminacao', 'Instalacao', 'Tampos'],
  banho:      ['Sanitarios', 'Material PRO', 'Pavimento e Revestimento', 'Colas e Tintas', 'Iluminacao', 'Instalacao'],
  closet:     ['Acessorios', 'Iluminacao', 'Instalacao'],
  suite:      ['Sanitarios', 'Acessorios', 'Iluminacao', 'Instalacao', 'Tampos'],
  escritorio: ['Iluminacao', 'Instalacao'],
  outro:      [],
}

export function f2(n) { return parseFloat(n||0).toFixed(2) }

export function hexToRgb(hex) {
  if (!hex||hex.startsWith('var')) return '56,189,248'
  try { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }
  catch { return '56,189,248' }
}

// Dado um nome de componente (categoria ou especial), devolve o objecto completo
// catName: string (ex: 'Eletrodomesticos', 'Instalacao', 'Tampos')
// cats: array de categorias do Firestore [{id, name, subs, cor?, icon?}]
export function resolverComp(catName, cats) {
  // Verificar se e um especial
  const esp = ESPECIAIS.find(e => e.label === catName || e.id === catName)
  if (esp) return esp
  // Procurar nas categorias da Biblioteca
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
  // Fallback - nao encontrado
  return {
    id: catName,
    label: catName,
    icon: '📋',
    desc: catName,
    cor: '#7a7a72',
    destino: 'biblioteca',
    destCat: catName,
    sempreCalculadora: false,
  }
}

// Kits que correspondem a um componente
export function kitsParaComp(comp, kits) {
  if (!comp || comp.sempreCalculadora) return []
  if (!comp.destCat) return []
  const cat = comp.destCat.toLowerCase()
  return kits.filter(k => {
    const kn = (k.name||'').toLowerCase()
    const kc = (k.contexto||'').toLowerCase()
    return kn.includes(cat) || kc.includes(cat) || cat.includes(kn)
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

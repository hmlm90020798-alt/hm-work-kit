// Componentes especiais - nao sao categorias da Biblioteca
export const ESPECIAIS = [
  {
    id: 'base',
    label: 'Kit base',
    icon: '📦',
    desc: 'Artigos essenciais do projecto',
    cor: '#c8943a',
    destino: null,
    destCat: null,
    kitBase: true,  // kits ligados pelo contexto = tipo do projecto
  },
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

// Categorias da Biblioteca que NAO devem aparecer na lista do guia
// (ja estao representadas pelos especiais)
export const CATS_IGNORADAS = ['Tampos', 'tampos']

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
// Kit base: kits cujo contexto bate com o tipo do projecto
// Outros: campo categoria do kit bate com destCat, ou fallback por nome
export function kitsParaComp(comp, kits, tipoLabel) {
  if (!comp || comp.sempreCalculadora) return []
  const tipo = (tipoLabel||'').toLowerCase()

  // Kit base - usa contexto do kit para bater com tipo do projecto
  if (comp.kitBase) {
    return kits.filter(k => {
      const kc = (k.contexto||'').toLowerCase()
      return kc === tipo || tipo.includes(kc) || kc.includes(tipo)
    })
  }

  if (!comp.destCat) return []
  const cat = comp.destCat.toLowerCase()

  return kits.filter(k => {
    // 1. Campo categoria do kit (ligacao directa)
    if (k.categoria) {
      return (k.categoria||'').toLowerCase() === cat
    }
    // 2. Fallback: nome do kit contém a categoria
    const kn = (k.name||'').toLowerCase()
    if (kn.includes(cat)) return true
    return false
  })
}

// Verifica se ja existem itens no orcamento para este componente
export function temItensParaComp(comp, orcItems, kits, kitSelId) {
  if (!comp) return false
  if (comp.sempreCalculadora) return orcItems.some(i => i.origem === 'Tampos')
  if (comp.kitBase) return orcItems.some(i => i.origem && !['Tampos','Mao de Obra'].includes(i.origem))
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

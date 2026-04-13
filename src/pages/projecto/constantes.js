export const COMPONENTES = [
  { id:'base',       label:'Kit base',         icon:'📦', desc:'Artigos essenciais do projecto',  cor:'#c8943a',
    match:(n,c,t)=>{ const nl=n.toLowerCase(),cl=(c||'').toLowerCase(),tl=(t||'').toLowerCase(); return nl.includes('base')||(cl&&cl.includes(tl)) }, destino:null },
  { id:'eletro',     label:'Eletrodomesticos', icon:'⚡', desc:'Electrodomesticos encastraveis',   cor:'#8a9e6e',
    match:(n)=>n.toLowerCase().includes('eletro')||n.toLowerCase().includes('electro'), destino:'biblioteca', destCat:'Eletrodomesticos' },
  { id:'acessorios', label:'Acessorios',        icon:'🔩', desc:'Puxadores, calhas e outros',       cor:'#b07acc',
    match:(n)=>n.toLowerCase().includes('acess'), destino:'biblioteca', destCat:'Acessorios' },
  { id:'ferragens',  label:'Ferragens',          icon:'🔧', desc:'Ferragens de cozinha e montagem',  cor:'#7a9e9a',
    match:(n)=>n.toLowerCase().includes('ferragem')||n.toLowerCase().includes('ferrag'), destino:'biblioteca', destCat:'Ferragens' },
  { id:'iluminacao', label:'Iluminacao',         icon:'💡', desc:'Iluminacao embutida e decorativa', cor:'#d4b87a',
    match:(n)=>n.toLowerCase().includes('ilumina')||n.toLowerCase().includes('luz'), destino:'biblioteca', destCat:'Iluminacao' },
  { id:'instalacao', label:'Instalacao',         icon:'🛠', desc:'Servicos de montagem',             cor:'#9a7acc',
    match:(n)=>n.toLowerCase().includes('instala')||n.toLowerCase().includes('montagem'), destino:'maodeobra', destCat:null },
  { id:'tampos',     label:'Tampos',             icon:'⬛', desc:'Calculadora ANIGRACO',             cor:'#4a8fa8',
    match:(n)=>n.toLowerCase().includes('tampo'), destino:'tampos', destCat:null, sempreCalculadora:true },
]

// Labels reais das categorias no Firestore (com acentos)
export const DESTCAT_REAL = {
  'Eletrodomesticos': 'Eletrodomesticos',
  'Acessorios':       'Acessorios',
  'Ferragens':        'Ferragens',
  'Iluminacao':       'Iluminacao',
}

export function f2(n) { return parseFloat(n||0).toFixed(2) }

export function hexToRgb(hex) {
  if (!hex||hex.startsWith('var')) return '56,189,248'
  try { return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}` }
  catch { return '56,189,248' }
}

export function kitsParaComp(comp, kits, tipoLabel) {
  if (comp.sempreCalculadora) return []
  return kits.filter(k => comp.match(k.name, k.contexto, tipoLabel))
}

export function temItensParaComp(comp, orcItems, kits, kitSelId) {
  if (!comp) return false
  if (comp.sempreCalculadora) return orcItems.some(i => i.origem === 'Tampos')
  if (kitSelId) {
    const kit = kits.find(k => k.id === kitSelId)
    if (kit) return orcItems.some(i => i.origem === kit.name)
  }
  if (comp.destCat) {
    const cat = comp.destCat.toLowerCase()
    return orcItems.some(i =>
      (i.cat||'').toLowerCase() === cat ||
      (i.origem||'').toLowerCase() === cat ||
      (i.origem||'').toLowerCase().includes(comp.id)
    )
  }
  if (comp.destino === 'maodeobra') return orcItems.some(i => i.origem === 'Mao de Obra')
  return false
}

import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const ORC_ID = 'ativo' // documento único na colecção orcamento_ativo

/**
 * Adiciona um item ao orçamento ativo.
 * Se o artigo já existe, incrementa qty +1.
 *
 * @param {object} item  { ref, desc, cat, price, origem, origemId }
 * @param {function} showToast
 */
export async function addToOrcamento(item, showToast) {
  try {
    const ref  = doc(db, 'orcamento_ativo', ORC_ID)
    const snap = await getDoc(ref)
    const data = snap.exists() ? snap.data() : { items: [] }
    const items = data.items || []

    // Tampos identificam-se por tampoId — nunca incrementar qty
    // Artigos normais: deduplicar por ref (excepto se origens diferentes)
    let idx = -1
    if (!item.tampoId) {
      idx = items.findIndex(i => i.ref === item.ref && i.origem === item.origem)
    }
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 }
      showToast(`+1 — ${item.ref}`)
    } else {
      items.push({ ...item, qty: 1, addedAt: Date.now() })
      showToast(`Adicionado — ${item.ref}`)
    }

    await setDoc(ref, { ...data, items, updatedAt: Date.now() })
  } catch (e) {
    console.error(e)
    showToast('Erro ao adicionar ao orçamento')
  }
}

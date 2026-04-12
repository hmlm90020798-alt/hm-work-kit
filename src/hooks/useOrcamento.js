import { db } from '../firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

/**
 * Devolve a referência Firestore para o orçamento de um projecto.
 * Path: projectos/{projId}/orcamento/ativo
 */
export function orcRef(projId) {
  if (!projId) throw new Error('projId obrigatório em orcRef')
  return doc(db, 'projectos', projId, 'orcamento', 'ativo')
}

/**
 * Adiciona um item ao orçamento do projecto activo.
 * Se o artigo já existe (mesma ref + mesma origem), incrementa qty +1.
 * Tampos identificam-se por tampoId e nunca incrementam.
 *
 * @param {string}   projId
 * @param {object}   item   { ref, desc, cat, sub, price, supplier, link, origem, tampoId? }
 * @param {function} showToast
 */
export async function addToOrcamento(projId, item, showToast) {
  if (!projId) { showToast?.('Sem projecto activo'); return }
  try {
    const ref  = orcRef(projId)
    const snap = await getDoc(ref)
    const data = snap.exists() ? snap.data() : { items: [] }
    const items = data.items || []

    let idx = -1
    if (!item.tampoId) {
      idx = items.findIndex(i => i.ref === item.ref && i.origem === item.origem)
    }
    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: (items[idx].qty || 1) + 1 }
      showToast?.(`+1 — ${item.ref}`)
    } else {
      items.push({ ...item, qty: 1, addedAt: Date.now() })
      showToast?.(`Adicionado — ${item.ref}`)
    }

    await setDoc(ref, { ...data, items, updatedAt: Date.now() })
  } catch (e) {
    console.error(e)
    showToast?.('Erro ao adicionar ao orçamento')
  }
}

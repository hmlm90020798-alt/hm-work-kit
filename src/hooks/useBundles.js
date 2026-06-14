import { db } from '../firebase'
import {
  collection, doc, onSnapshot,
  setDoc, deleteDoc, addDoc, getDocs
} from 'firebase/firestore'

// ── Colecção Firestore ─────────────────────────────
// bundles/{id}
//   triggerRef:   string   — ref do artigo gatilho
//   triggerDesc:  string   — descrição (display)
//   complementos: Array<{
//     ref:         string
//     desc:        string
//     price:       number
//     qty:         number   — qty sugerida (default 1)
//     obrigatorio: boolean  — pré-seleccionado no painel
//   }>
//   nota:         string   — nota interna opcional

export const BUNDLES_COL = 'bundles'

/** Referência da colecção */
export const bundlesCol = () => collection(db, BUNDLES_COL)

/** Referência de um bundle individual */
export const bundleRef = (id) => doc(db, BUNDLES_COL, id)

/**
 * Subscrever todos os bundles em tempo real.
 * Devolve a função de cancelamento.
 */
export function subscribeBundles(cb, onErr) {
  return onSnapshot(bundlesCol(), snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, onErr)
}

/**
 * Guardar bundle (criar ou actualizar).
 * Se não tiver id, cria com addDoc.
 */
export async function saveBundle(bundle) {
  const { id, ...data } = bundle
  if (id) {
    await setDoc(bundleRef(id), data)
    return id
  } else {
    const ref = await addDoc(bundlesCol(), data)
    return ref.id
  }
}

/**
 * Eliminar bundle.
 */
export async function deleteBundle(id) {
  await deleteDoc(bundleRef(id))
}

/**
 * Carregar todos os bundles uma única vez (para lookup rápido).
 * Devolve Map<triggerRef, bundle[]>
 */
export async function getBundlesMap() {
  const snap = await getDocs(bundlesCol())
  const map = new Map()
  snap.docs.forEach(d => {
    const b = { id: d.id, ...d.data() }
    const key = b.triggerRef
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(b)
  })
  return map
}

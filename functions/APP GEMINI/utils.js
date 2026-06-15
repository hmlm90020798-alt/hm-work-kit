// ════════════════════════════════════════════════
// utils.js · Work Kit · Hélder Melo
// Utilitários partilhados — importar em todos os módulos
// ════════════════════════════════════════════════

// ── Acesso ao Firestore e estado global ──────────
export function getDb()  { return window._wkDb  || null; }
export function getST()  { return window._wkST; }

// ── Formatação de valores monetários ─────────────
export function fmt(v) {
  const n = parseFloat(v);
  return isNaN(n)
    ? '—'
    : n.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

// ── Toast (delega para o sistema global) ─────────
export function toast(msg, dur = 2800) {
  window.wkToast?.(msg, dur);
}

// ── Gerador de IDs únicos ─────────────────────────
export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Diagnóstico de erros Firebase ─────────────────
export function fbErroMsg(e) {
  const code = e?.code || '';
  if (code === 'permission-denied')
    return '🔒 Sem permissão — verifica as Firestore Rules do projecto hm-work-kit.';
  if (code === 'unauthenticated')
    return '🔐 Sessão expirada — faz logout e login novamente.';
  if (code.includes('unavailable') || code.includes('network'))
    return '📡 Sem ligação à internet.';
  return `⚠️ Erro Firebase: ${code || e?.message || 'desconhecido'}`;
}

export function mostrarErroDB(e) {
  const msg = fbErroMsg(e);
  console.error('[Firebase]', e);
  const sync = document.getElementById('app-sync');
  if (sync) {
    sync.textContent = '⚠️ Sem sincronização';
    sync.style.color = '#ff8a80';
    sync.title = msg;
    sync.style.cursor = 'pointer';
    sync.onclick = () => alert(msg);
  }
  toast(msg.split('\n')[0]);
}

// ── Indicador de sincronização (sucesso) ──────────
export function setSyncOk() {
  const sync = document.getElementById('app-sync');
  if (!sync) return;
  const ts = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  sync.textContent = `✓ Sincronizado ${ts}`;
  sync.style.color = '';
  sync.style.cursor = '';
  sync.title = '';
  sync.onclick = null;
}

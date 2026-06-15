// ════════════════════════════════════════════════
// main.js · Work Kit · Hélder Melo
// v5 — versão consolidada e corrigida
// ════════════════════════════════════════════════

import { tampoInit, tampoCarregarCalc }            from './tampos.js';
import { eletroInit, switchEletroTab,
         eletroCarregarOrcamento }                 from './eletros.js';
import { moRender, moCarregarOrcamento }           from './maoobra.js';
import { matInit, matCarregar }                    from './materiais.js';
import { iaInit }                                  from './ia.js';
import { fmt, toast, mostrarErroDB, setSyncOk }   from './utils.js';
import { initializeApp }                           from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getFirestore }                            from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword,
         signOut, onAuthStateChanged }             from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

// ── Firebase — projecto hm-work-kit ──────────────
const _cfg = {
  apiKey:            'AIzaSyAyaMa6BymV9g80SrCKd4WqAh-sp3y1N-c',
  authDomain:        'hm-work-kit.firebaseapp.com',
  projectId:         'hm-work-kit',
  storageBucket:     'hm-work-kit.firebasestorage.app',
  messagingSenderId: '181782197272',
  appId:             '1:181782197272:web:85bc80bb6f60ddc6f47f6d',
};
const _app  = initializeApp(_cfg);
const _db   = getFirestore(_app);
const _auth = getAuth(_app);

// Injectar globalmente antes de qualquer módulo usar
window._wkDb  = _db;
window._wkApp = _app;

// ════════════════════════════════════════════════
// ESTADO GLOBAL
// ════════════════════════════════════════════════
const ST = {
  tab: 'tampos',
  // MO
  moOrc: [],
  moSeccao: 'Cozinhas e Roupeiros',
  moCat: 'Remodelação de Cozinha',
  moPesquisa: '',
  // Tampos
  tampoCat: '',
  tampoTab: 'catalogo',
};
window._wkST = ST;

// ════════════════════════════════════════════════
// UTILS GLOBAIS (usados por onclick inline no HTML)
// ════════════════════════════════════════════════
window.wkToast = function(msg, dur = 2800) {
  const t = document.getElementById('wk-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), dur);
};

window.wkConfirm = function(msg, cb) {
  const overlay = document.getElementById('modal-confirm');
  const msgEl   = document.getElementById('modal-confirm-msg');
  const btnOk   = document.getElementById('modal-confirm-ok');
  const btnCan  = document.getElementById('modal-confirm-cancel');
  if (!overlay) { if (confirm(msg)) cb(); return; }
  msgEl.textContent = msg;
  overlay.classList.add('active');
  const close = () => overlay.classList.remove('active');
  btnOk.onclick  = () => { close(); cb(); };
  btnCan.onclick = close;
  // Fechar com ESC
  overlay.onkeydown = (e) => { if (e.key === 'Escape') close(); };
  // Fechar ao clicar fora
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
};

window.copiarTexto = function(txt, btnEl) {
  navigator.clipboard.writeText(txt).then(() => {
    window.wkToast('✓ Copiado: ' + txt);
    if (btnEl) {
      const o = btnEl.textContent;
      btnEl.textContent = '✓';
      setTimeout(() => btnEl.textContent = o, 1500);
    }
  }).catch(() => window.wkToast('⚠️ Erro ao copiar'));
};

// ════════════════════════════════════════════════
// VISTAS
// ════════════════════════════════════════════════
function setView(id) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById('view-' + id);
  if (el) el.classList.add('active');
}

// ════════════════════════════════════════════════
// NAVEGAÇÃO
// ════════════════════════════════════════════════
window.switchTab = function(tabId, btnEl) {
  ST.tab = tabId;
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  const tab = document.getElementById('tab-' + tabId);
  if (tab) tab.classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  if (tabId === 'tampos')    tampoInit();
  if (tabId === 'eletros') {
    if (!document.getElementById('eletro-header')?.innerHTML) eletroInit();
    else switchEletroTab('catalogo');
  }
  if (tabId === 'maoobra')   moRender();
  if (tabId === 'materiais') matInit();
  if (tabId === 'ia')        iaInit();
};

// ════════════════════════════════════════════════
// AUTENTICAÇÃO
// ════════════════════════════════════════════════
window.doLogin = async function() {
  const email = document.getElementById('login-email')?.value?.trim();
  const pass  = document.getElementById('login-pass')?.value;
  const errEl = document.getElementById('login-error');
  const btn   = document.querySelector('.login-btn');
  if (!email || !pass) return;
  if (btn) { btn.disabled = true; btn.textContent = 'A entrar…'; }
  if (errEl) errEl.style.display = 'none';
  try {
    await signInWithEmailAndPassword(_auth, email, pass);
  } catch (e) {
    const msg = e?.code === 'auth/invalid-credential'
      ? 'Email ou palavra-passe incorrectos.'
      : 'Erro ao entrar — tenta novamente.';
    if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
    if (btn) { btn.disabled = false; btn.textContent = 'Entrar'; }
  }
};

window.doLogout = async function() {
  await signOut(_auth);
  setView('login');
};

// ════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════
(async function init() {
  // Overlay de carregamento
  const ov = document.createElement('div');
  ov.id = 'loading-overlay';
  ov.innerHTML = `
    <div style="width:36px;height:36px;border:3px solid rgba(255,190,152,.2);border-top-color:var(--peach-dark);border-radius:50%;animation:spin .8s linear infinite"></div>
    <div style="font-family:var(--sans);font-size:11px;font-weight:600;color:rgba(122,46,10,.7);letter-spacing:2px;text-transform:uppercase">Work Kit</div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;
  document.body.appendChild(ov);

  onAuthStateChanged(_auth, async user => {
    if (user) {
      try {
        // Forçar refresh do token para garantir que o Firestore o reconhece
        await user.getIdToken(true);

        // Carregar dados de todos os módulos em paralelo
        const resultados = await Promise.allSettled([
          moCarregarOrcamento(),
          matCarregar(),
          eletroCarregarOrcamento(),
          tampoCarregarCalc(),
        ]);

        // Verificar se algum falhou
        const falhou = resultados.find(r => r.status === 'rejected');
        if (falhou) {
          mostrarErroDB(falhou.reason);
        } else {
          setSyncOk();
        }

        setView('app');
        // Activar tab inicial
        const btnTampos = document.querySelector('[data-tab="tampos"]');
        if (btnTampos) btnTampos.classList.add('active');
        tampoInit();
      } catch (e) {
        mostrarErroDB(e);
        setView('app');
        tampoInit();
      } finally {
        ov.remove();
      }
    } else {
      ov.remove();
      setView('login');
    }
  });
})();

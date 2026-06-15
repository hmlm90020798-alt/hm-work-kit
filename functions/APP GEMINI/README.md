# Work Kit · Hélder Melo
**Ferramentas de Projecto — Leroy Merlin Viseu**

Aplicação web de uso interno para gestão de orçamentos de cozinhas:
tampos Anigraco, electrodomésticos, materiais de remodelação, mão de obra LM e assistente IA.

---

## ⚡ Deploy rápido

```bash
# Na pasta do projecto (onde está este README)
firebase deploy --only hosting
```

Para actualizar as regras do Firestore:
```bash
firebase deploy --only firestore:rules
```

Para tudo ao mesmo tempo:
```bash
firebase deploy
```

---

## 🔒 Segurança — acção obrigatória

### 1. Revogar a chave Groq exposta
O ficheiro `assistente.js` (código morto, já removido) continha uma chave Groq hardcoded.
**Revoga-a imediatamente** em: https://console.groq.com/keys

### 2. O `ia.js` usa a Anthropic API via proxy — não precisa de chave
O módulo `ia.js` chama `https://api.anthropic.com/v1/messages` directamente,
usando o sistema de autenticação do contexto onde a app corre. Não há chave exposta.

### 3. Se precisares de guardar outras chaves no futuro
Usa o Firestore em vez do código:

```javascript
// Guardar (uma vez, via consola Firebase ou script de setup)
// Colecção: wk_configuracoes / doc: apiKeys
// { groq: "gsk_...", outraChave: "..." }

// Ler na app (em qualquer módulo autenticado)
import { getDb } from './utils.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const snap = await getDoc(doc(getDb(), 'wk_configuracoes', 'apiKeys'));
const chave = snap.data()?.groq;
```

---

## 🏗️ Arquitectura (v5)

```
index.html          ← ponto de entrada único
main.js             ← Auth Firebase + navegação + init
utils.js            ← fmt, toast, getDb, getST, setSyncOk, fbErroMsg  ← PARTILHADO
tampos.js           ← catálogo Anigraco + calculadora
eletros.js          ← catálogo electrodomésticos
materiais.js        ← catálogo materiais remodelação
maoobra.js          ← serviços LM + orçamento
ia.js               ← assistente IA (Anthropic API)
style.css           ← estilos globais
firestore.rules     ← regras de segurança Firestore
firebase.json       ← configuração de hosting + firestore
.firebaserc         ← projecto: hm-work-kit
```

### Firebase — projecto correcto
A app usa **exclusivamente** o projecto `hm-work-kit`.
O projecto `hm-projetos-lm` é para a app de clientes (partilha de orçamentos).
Os dois não devem ser misturados.

### Comunicação entre módulos
- `window._wkDb` — instância Firestore (injectada pelo `main.js` antes de qualquer módulo carregar)
- `window._wkST` — estado global (tab activa, orçamento MO, filtros)
- `window.wkToast()` — sistema de notificações
- `window.wkConfirm()` — modal de confirmação (substitui `confirm()` nativo)
- `window.copiarTexto()` — cópia para clipboard com feedback

---

## 📁 Ficheiros e o que fazem

| Ficheiro | Função |
|---|---|
| `main.js` | Auth, navegação, init de todos os módulos |
| `utils.js` | Utilitários partilhados — **importar em vez de copiar** |
| `tampos.js` | Catálogo Anigraco, calculadora de tampos, persistência |
| `eletros.js` | Catálogo de electrodomésticos (sessionStorage) |
| `materiais.js` | Catálogo de materiais com overrides Firestore |
| `maoobra.js` | 253 serviços LM, orçamento com drag-and-drop, persistência |
| `ia.js` | Upload PDF / texto → Anthropic API → referências LM |
| `style.css` | Todos os estilos (dark theme, variáveis CSS) |

---

## ⌨️ Atalhos de teclado

| Atalho | Acção |
|---|---|
| `Alt + 1` | Tab Tampos |
| `Alt + 2` | Tab Eletros |
| `Alt + 3` | Tab Materiais |
| `Alt + 4` | Tab Mão de Obra |
| `Alt + 5` | Tab IA |
| `Enter` no login | Avançar campo / entrar |
| `Esc` no modal | Fechar confirmação |

---

## 🔧 Manutenção frequente

### Actualizar preços de tampos
Editar directamente `tampos.js` → array `TAMPOS_DB` → `c1` e `pvp`.
Ou, a longo prazo, migrar para `wk_tampos_overrides` no Firestore (edição sem código).

### Adicionar artigo ao catálogo de materiais
Na tab Materiais → botão "Novo Artigo" → preencher → guardar.
O artigo fica guardado em `wk_materiais_overrides` no Firestore.

### Actualizar preços de mão de obra
Editar `maoobra.js` → array `MO_SECCOES` → campo `pvp` do serviço pretendido.

### Fazer deploy de novas regras Firestore
```bash
firebase deploy --only firestore:rules
# Confirmar que o .firebaserc aponta para hm-work-kit antes de correr
cat .firebaserc
```

---

## 🐛 Resolução de problemas comuns

**"🔒 Sem permissão"** — Firestore rules não foram deployadas ou expiraram.
```bash
firebase deploy --only firestore:rules
```

**Ecrã em branco depois do login** — Race condition resolvida na v5 com `getIdToken(true)`.
Se persistir: fazer logout → limpar cache do browser → login novamente.

**"⚠️ Sem sincronização"** — Clicar no indicador mostra o erro detalhado.
Causas mais comuns: sem internet, sessão expirada, rules não deployadas.

**Tab IA não identifica referências** — Verificar que o catálogo de materiais tem artigos
(a tab Materiais deve mostrar artigos carregados).

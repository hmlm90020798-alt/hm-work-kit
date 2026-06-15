// ════════════════════════════════════════════════
// ia.js · Work Kit · Hélder Melo
// Tab IA — interpreta orçamentos (PDF ou texto)
// e devolve referências LM do catálogo de Materiais
// ════════════════════════════════════════════════

import { MATERIAIS_DB } from './materiais.js';
import { toast } from './utils.js';

// ════════════════════════════════════════════════
// ESTADO
// ════════════════════════════════════════════════
const IA = {
  textoExtraido: '',
  resultado:     null,
  carregando:    false,
};

// ════════════════════════════════════════════════
// INIT — render da tab
// ════════════════════════════════════════════════
export function iaInit() {
  const header = document.getElementById('ia-header');
  const body   = document.getElementById('ia-body');
  if (!header || !body) return;

  if (document.getElementById('ia-drop')) return; // já renderizado

  header.innerHTML = `
    <div class="page-header page-header-flex" style="margin-bottom:20px">
      <div>
        <div class="page-titulo">Assistente IA</div>
        <div class="page-sub">Carrega um orçamento · a IA identifica as referências LM certas</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <span style="font-family:var(--mono);font-size:9px;color:var(--t4);letter-spacing:.08em">
          ${MATERIAIS_DB.length} artigos no catálogo
        </span>
      </div>
    </div>`;

  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;max-width:1100px">

      <!-- ── Coluna esquerda: input ── -->
      <div style="display:flex;flex-direction:column;gap:12px">

        <!-- Drop zone PDF -->
        <div id="ia-drop"
          style="border:2px dashed rgba(255,190,152,.25);border-radius:14px;padding:28px 20px;
            text-align:center;cursor:pointer;transition:all .2s;background:rgba(255,255,255,.03)"
          ondragover="event.preventDefault();this.style.borderColor='rgba(255,190,152,.6)'"
          ondragleave="this.style.borderColor='rgba(255,190,152,.25)'"
          ondrop="window.iaHandleDrop(event)"
          onclick="document.getElementById('ia-file-input').click()">
          <div style="font-size:28px;margin-bottom:8px">📄</div>
          <div style="font-family:var(--sans);font-size:13px;font-weight:600;color:var(--t2);margin-bottom:4px">
            Arrasta o PDF aqui ou clica para escolher
          </div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--t4)">
            Suporta PDF · máx. 10MB
          </div>
          <input type="file" id="ia-file-input" accept=".pdf" style="display:none"
            onchange="window.iaHandleFile(this.files[0])">
        </div>

        <!-- Separador -->
        <div style="display:flex;align-items:center;gap:10px">
          <div style="flex:1;height:1px;background:rgba(255,255,255,.07)"></div>
          <span style="font-family:var(--mono);font-size:10px;color:var(--t4)">ou escreve / cola</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,.07)"></div>
        </div>

        <!-- Textarea -->
        <textarea id="ia-texto"
          placeholder="Cola aqui o texto do orçamento do técnico…
Ex:
- Pladur hidrófugo cozinha
- Fita juntas
- Buchas e parafusos para módulos
- Silicone branco cozinha
- Foco IP44 para teto pladur"
          style="min-height:180px;padding:14px;border-radius:10px;
            background:rgba(255,255,255,.05);border:1.5px solid rgba(255,190,152,.15);
            color:var(--t1);font-family:var(--sans);font-size:13px;line-height:1.6;
            resize:vertical;outline:none;transition:border-color .15s"
          onfocus="this.style.borderColor='rgba(255,190,152,.4)'"
          onblur="this.style.borderColor='rgba(255,190,152,.15)'"
          oninput="window.iaTextoChange(this.value)"></textarea>

        <!-- Ficheiro carregado -->
        <div id="ia-file-info" style="display:none;padding:10px 14px;border-radius:8px;
          background:rgba(58,122,68,.1);border:1px solid rgba(58,122,68,.2);
          font-family:var(--mono);font-size:11px;color:rgba(120,220,120,.8)">
        </div>

        <!-- Botão analisar -->
        <button id="ia-btn-analisar" onclick="window.iaAnalisar()"
          style="padding:13px 20px;border-radius:10px;border:none;cursor:pointer;
            background:linear-gradient(135deg,rgba(196,97,42,.8),rgba(255,140,60,.6));
            color:#fff;font-family:var(--sans);font-size:14px;font-weight:700;
            letter-spacing:.03em;transition:all .2s;
            box-shadow:0 4px 16px rgba(196,97,42,.3)">
          ✦ Identificar Referências LM
        </button>

        <!-- Limpar -->
        <button onclick="window.iaLimpar()"
          style="padding:8px;border-radius:8px;background:none;
            border:1px solid rgba(255,255,255,.08);color:var(--t4);
            font-family:var(--sans);font-size:11px;cursor:pointer">
          × Limpar tudo
        </button>
      </div>

      <!-- ── Coluna direita: resultado ── -->
      <div id="ia-resultado-wrap"
        style="border-radius:14px;background:rgba(255,255,255,.03);
          border:1px solid rgba(255,255,255,.07);padding:20px;
          min-height:300px;display:flex;flex-direction:column">
        <div id="ia-resultado-inner"
          style="flex:1;display:flex;align-items:center;justify-content:center">
          <div style="text-align:center;color:var(--t4)">
            <div style="font-size:32px;margin-bottom:12px">🔍</div>
            <div style="font-family:var(--sans);font-size:12px">
              O resultado aparece aqui
            </div>
          </div>
        </div>
      </div>

    </div>`;
}

// ════════════════════════════════════════════════
// HANDLERS DE FICHEIRO
// ════════════════════════════════════════════════
window.iaHandleDrop = function(e) {
  e.preventDefault();
  document.getElementById('ia-drop').style.borderColor = 'rgba(255,190,152,.25)';
  const file = e.dataTransfer.files[0];
  if (file?.type === 'application/pdf') window.iaHandleFile(file);
  else toast('⚠️ Só são aceites ficheiros PDF');
};

window.iaHandleFile = async function(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) { toast('⚠️ Ficheiro demasiado grande — máx. 10MB'); return; }

  const info = document.getElementById('ia-file-info');
  info.textContent = `📄 ${file.name} (${(file.size/1024).toFixed(0)} KB) — a extrair texto…`;
  info.style.display = 'block';

  // Converter para base64
  const base64 = await new Promise((res, rej) => {
    const r = new FileReader();
    r.onload  = () => res(r.result.split(',')[1]);
    r.onerror = () => rej(new Error('Erro ao ler ficheiro'));
    r.readAsDataURL(file);
  });

  IA.textoExtraido = '';
  IA._pdfBase64    = base64;
  IA._pdfNome      = file.name;

  info.textContent = `📄 ${file.name} — pronto para analisar`;
  toast('✓ PDF carregado — clica em Identificar Referências LM');
};

window.iaTextoChange = function(val) {
  IA.textoExtraido  = val;
  IA._pdfBase64     = null;
  const info = document.getElementById('ia-file-info');
  if (info) info.style.display = 'none';
};

// ════════════════════════════════════════════════
// ANÁLISE PRINCIPAL
// ════════════════════════════════════════════════
window.iaAnalisar = async function() {
  const textoManual = document.getElementById('ia-texto')?.value?.trim();
  const temPdf      = !!IA._pdfBase64;
  const temTexto    = !!(textoManual || IA.textoExtraido);

  if (!temPdf && !temTexto) {
    toast('⚠️ Carrega um PDF ou escreve o texto do orçamento');
    return;
  }
  if (IA.carregando) return;

  IA.carregando = true;
  renderResultadoLoading();

  const btn = document.getElementById('ia-btn-analisar');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ A analisar…'; }

  try {
    // Construir catálogo resumido para o contexto
    const catalogo = MATERIAIS_DB.map(a =>
      `${a.ref} | ${a.nome} | ${a.familia} | ${a.preco}€/${a.unid} | ${a.quando || ''}`
    ).join('\n');

    // Construir mensagem para a API
    const mensagemUser = temPdf
      ? [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: IA._pdfBase64 },
          },
          {
            type: 'text',
            text: `Analisa este orçamento/lista de materiais e identifica as referências LM correspondentes usando o catálogo abaixo.\n\nCATÁLOGO DISPONÍVEL:\n${catalogo}`,
          },
        ]
      : textoManual || IA.textoExtraido;

    const systemPrompt = `És o assistente interno de Hélder Melo, consultor de vendas de cozinhas na Leroy Merlin Viseu, Portugal.
O teu trabalho é interpretar listas de materiais ou orçamentos escritos por técnicos de instalação (linguagem informal, abreviada, ou com gíria do sector) e encontrar as referências LM exactas do catálogo fornecido.

CONTEXTO:
- Os projetos são principalmente remodelações de cozinhas e casas de banho.
- Os técnicos escrevem de forma abreviada: "pladur hidro" = gesso cartonado hidrófugo, "buchas cozinha" = buchas para módulos, "silicone tr" = silicone transparente, etc.
- Prioriza sempre artigos da família correcta (ex: para "foco IP44" procura em Iluminação).
- Para instalações de cozinha considera sempre os artigos de fixação e vedação habituais.

REGRAS:
1. Para cada item do orçamento, encontra a referência LM mais adequada no catálogo.
2. Se houver múltiplas opções válidas (ex: silicone branco vs transparente), lista ambas com nota a explicar quando usar cada uma.
3. Se um item não tiver correspondência no catálogo, indica sem_referencia: true e sugere o que procurar ou a família de produto.
4. Nunca inventes referências — usa APENAS as do catálogo fornecido.
5. Se o item menciona quantidade (ex: "100m de fio"), inclui qty_sugerida com o número de unidades/rolos necessários.
6. Responde SEMPRE em JSON com este formato exacto:

{
  "itens": [
    {
      "item_original": "texto original do orçamento",
      "referencias": [
        {
          "ref": "12345678",
          "nome": "Nome do artigo",
          "preco": 9.99,
          "unid": "un",
          "qty_sugerida": 2,
          "nota": "nota opcional — quando usar, quantidade recomendada, etc."
        }
      ],
      "sem_referencia": false
    }
  ],
  "resumo": "frase curta com total de referências encontradas e observações relevantes"
}

Se sem_referencia for true, o array referencias fica vazio e adiciona "sugestao": "o que procurar ou categoria de produto".
O campo qty_sugerida é opcional — omite se a quantidade não for clara no texto.
Responde APENAS com o JSON, sem texto antes ou depois, sem blocos de código markdown.`;

    const body = temPdf
      ? {
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{ role: 'user', content: mensagemUser }],
        }
      : {
          model: 'claude-sonnet-4-6',
          max_tokens: 4000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `Analisa este orçamento/lista de materiais e identifica as referências LM correspondentes usando o catálogo abaixo.\n\nTEXTO DO ORÇAMENTO:\n${textoManual || IA.textoExtraido}\n\nCATÁLOGO DISPONÍVEL:\n${catalogo}`,
          }],
        };

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${resp.status}`);
    }

    const data = await resp.json();
    const texto = data.content?.map(c => c.text || '').join('') || '';

    // Parse JSON da resposta
    let resultado;
    try {
      const clean = texto.replace(/```json|```/g, '').trim();
      resultado = JSON.parse(clean);
    } catch {
      throw new Error('A IA devolveu uma resposta inesperada — tenta novamente');
    }

    IA.resultado = resultado;
    renderResultado(resultado);

  } catch(e) {
    console.error('[IA]', e);
    renderResultadoErro(e.message);
    toast('⚠️ ' + (e.message || 'Erro na análise'));
  } finally {
    IA.carregando = false;
    if (btn) { btn.disabled = false; btn.textContent = '✦ Identificar Referências LM'; }
  }
};

// ════════════════════════════════════════════════
// RENDER RESULTADO
// ════════════════════════════════════════════════
function renderResultadoLoading() {
  const el = document.getElementById('ia-resultado-inner');
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center;color:var(--t3)">
      <div style="width:36px;height:36px;border:3px solid rgba(255,190,152,.15);
        border-top-color:rgba(255,190,152,.7);border-radius:50%;
        animation:spin .8s linear infinite;margin:0 auto 16px"></div>
      <div style="font-family:var(--sans);font-size:12px">A analisar o orçamento…</div>
      <div style="font-family:var(--mono);font-size:10px;color:var(--t4);margin-top:4px">
        A IA está a cruzar com o catálogo de ${MATERIAIS_DB.length} artigos
      </div>
    </div>`;
}

function renderResultadoErro(msg) {
  const el = document.getElementById('ia-resultado-inner');
  if (!el) return;
  el.innerHTML = `
    <div style="text-align:center;color:rgba(255,150,140,.7)">
      <div style="font-size:28px;margin-bottom:12px">⚠️</div>
      <div style="font-family:var(--sans);font-size:13px;font-weight:600;margin-bottom:6px">
        Erro na análise
      </div>
      <div style="font-family:var(--mono);font-size:10px;color:var(--t4);max-width:260px;margin:0 auto">
        ${msg}
      </div>
    </div>`;
}

function renderResultado(res) {
  const el = document.getElementById('ia-resultado-inner');
  if (!el) return;

  const itens    = res.itens || [];
  const comRef   = itens.filter(i => !i.sem_referencia).length;
  const semRef   = itens.filter(i => i.sem_referencia).length;

  // Montar lista de todas as referências encontradas para copiar
  const todasRefs = [];
  itens.forEach(item => {
    item.referencias?.forEach(r => {
      if (r.ref) todasRefs.push({ ...r, item_original: item.item_original });
    });
  });

  el.style.alignItems = 'flex-start';
  el.innerHTML = `
    <!-- Cabeçalho resultado -->
    <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.07);width:100%">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
        <div style="font-family:var(--serif);font-size:16px;color:var(--t1)">
          Resultado da Análise
        </div>
        <div style="display:flex;gap:6px">
          <span style="font-size:10px;padding:2px 8px;border-radius:99px;font-family:var(--mono);font-weight:700;
            background:rgba(58,122,68,.15);border:1px solid rgba(58,122,68,.3);color:rgba(120,220,120,.8)">
            ${comRef} encontrado${comRef !== 1 ? 's' : ''}
          </span>
          ${semRef ? `<span style="font-size:10px;padding:2px 8px;border-radius:99px;font-family:var(--mono);font-weight:700;
            background:rgba(255,140,60,.1);border:1px solid rgba(255,140,60,.2);color:rgba(255,190,120,.8)">
            ${semRef} sem ref.
          </span>` : ''}
        </div>
      </div>
      ${res.resumo ? `<div style="font-family:var(--sans);font-size:11px;color:var(--t3);font-style:italic">${res.resumo}</div>` : ''}
    </div>

    <!-- Lista de itens -->
    <div style="width:100%;display:flex;flex-direction:column;gap:10px;overflow-y:auto;max-height:420px;padding-right:4px">
      ${itens.map(item => renderItemIA(item)).join('')}
    </div>

    <!-- Acções globais -->
    ${todasRefs.length ? `
    <div style="width:100%;margin-top:14px;padding-top:12px;border-top:1px solid rgba(255,255,255,.07);display:flex;gap:8px;flex-wrap:wrap">
      <button onclick="window.iaCopiarLista()"
        style="flex:1;padding:10px;border-radius:8px;border:none;cursor:pointer;
          background:rgba(196,97,42,.15);border:1px solid rgba(196,97,42,.25);
          color:rgba(255,190,152,.9);font-family:var(--sans);font-size:12px;font-weight:600">
        📋 Copiar Lista Completa
      </button>
      <button onclick="window.iaCopiarRefs()"
        style="flex:1;padding:10px;border-radius:8px;border:none;cursor:pointer;
          background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
          color:var(--t3);font-family:var(--sans);font-size:12px;font-weight:600">
        ⎘ Só Referências
      </button>
    </div>` : ''}`;
}

function renderItemIA(item) {
  const temRef = !item.sem_referencia && item.referencias?.length > 0;
  return `
    <div style="padding:10px 12px;border-radius:10px;
      background:${temRef ? 'rgba(255,255,255,.04)' : 'rgba(255,140,60,.05)'};
      border:1px solid ${temRef ? 'rgba(255,255,255,.07)' : 'rgba(255,140,60,.15)'}">

      <!-- Item original -->
      <div style="font-family:var(--mono);font-size:10px;color:var(--t4);
        margin-bottom:7px;font-style:italic">
        ← ${item.item_original}
      </div>

      ${temRef
        ? item.referencias.map(r => `
          <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:5px">
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
                <span style="font-family:var(--mono);font-size:11px;font-weight:700;
                  color:var(--peach-dark)">${r.ref}</span>
                <button onclick="window.copiarTexto('${r.ref}',this)"
                  style="padding:1px 5px;border-radius:4px;background:rgba(196,97,42,.08);
                  border:1px solid rgba(196,97,42,.18);color:var(--t4);font-size:9px;cursor:pointer">⎘</button>
                ${r.qty_sugerida ? `<span style="font-family:var(--mono);font-size:9px;padding:1px 6px;
                  border-radius:4px;background:rgba(58,122,68,.12);border:1px solid rgba(58,122,68,.2);
                  color:rgba(120,220,120,.8)">× ${r.qty_sugerida}</span>` : ''}
                ${r.preco ? `<span style="font-family:var(--mono);font-size:10px;font-weight:700;
                  color:var(--t2);margin-left:auto">${r.preco}€/${r.unid || 'un'}</span>` : ''}
              </div>
              <div style="font-size:11px;font-weight:600;color:var(--t2);margin-top:2px;line-height:1.3">
                ${r.nome}
              </div>
              ${r.nota ? `<div style="font-size:10px;color:var(--t4);margin-top:2px;font-style:italic">
                💡 ${r.nota}
              </div>` : ''}
            </div>
          </div>`).join('')
        : `<div style="font-size:11px;color:rgba(255,190,120,.7);font-family:var(--sans)">
            Sem referência no catálogo
            ${item.sugestao ? `<span style="color:var(--t4)"> — ${item.sugestao}</span>` : ''}
          </div>`
      }
    </div>`;
}

// ════════════════════════════════════════════════
// COPIAR
// ════════════════════════════════════════════════
window.iaCopiarLista = function() {
  if (!IA.resultado) return;
  const linhas = ['REFERÊNCIAS LM — IDENTIFICADAS POR IA', '─'.repeat(50)];
  IA.resultado.itens?.forEach(item => {
    linhas.push(`\n▸ ${item.item_original}`);
    if (item.sem_referencia) {
      linhas.push('  Sem referência no catálogo' + (item.sugestao ? ` — ${item.sugestao}` : ''));
    } else {
      item.referencias?.forEach(r => {
        linhas.push(`  ${r.ref}  ${r.nome}  ${r.preco ? r.preco + '€/' + (r.unid||'un') : ''}`);
      });
    }
  });
  navigator.clipboard.writeText(linhas.join('\n')).then(() => toast('✓ Lista copiada'));
};

window.iaCopiarRefs = function() {
  if (!IA.resultado) return;
  const refs = [];
  IA.resultado.itens?.forEach(item => {
    item.referencias?.forEach(r => { if (r.ref) refs.push(r.ref); });
  });
  if (!refs.length) { toast('⚠️ Sem referências para copiar'); return; }
  navigator.clipboard.writeText(refs.join('\n')).then(() => toast(`✓ ${refs.length} referências copiadas`));
};

// ════════════════════════════════════════════════
// LIMPAR
// ════════════════════════════════════════════════
window.iaLimpar = function() {
  IA.textoExtraido = '';
  IA._pdfBase64    = null;
  IA._pdfNome      = null;
  IA.resultado     = null;
  const ta   = document.getElementById('ia-texto');
  const info = document.getElementById('ia-file-info');
  const fi   = document.getElementById('ia-file-input');
  if (ta)   ta.value = '';
  if (info) info.style.display = 'none';
  if (fi)   fi.value = '';
  const el = document.getElementById('ia-resultado-inner');
  if (el) {
    el.style.alignItems = 'center';
    el.innerHTML = `
      <div style="text-align:center;color:var(--t4)">
        <div style="font-size:32px;margin-bottom:12px">🔍</div>
        <div style="font-family:var(--sans);font-size:12px">O resultado aparece aqui</div>
      </div>`;
  }
};

window.iaInit = iaInit;
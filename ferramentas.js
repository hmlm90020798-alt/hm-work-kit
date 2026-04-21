import { MAO_DE_OBRA } from './maoDeObra.js';
import { ANIGRACO, TIPOS_PEDRA, TIPOS_ALL, TRANSPORTE } from './anigracoData.js';
import { calcPeca, totProj, novoProjeto, uuid, f2, c1fmt } from './useTampos.js';
import { Projetos } from './db.js';
import { navegarPara } from './app.js';

/* ── Utilitários ─────────────────────────────── */
const TIPO_LABEL = { standard:'Standard', visita:'Visita Orç.', opcional:'Opcional' };
const TIPO_COR   = { standard:'var(--ink3)', visita:'var(--blue-mid)', opcional:'var(--amber-mid)' };
const SECCOES    = [...new Set(MAO_DE_OBRA.map(s => s.seccao))].sort();
const TRANSVERSAIS = [
  { id:'49013101', nome:'Deslocação Instalações',           pvp:30, un:'un', tipo:'opcional', seccao:'Transversal', sub:'', inc:'Deslocação até 30km entre a loja e local de instalação', exc:'', cond:'' },
  { id:'49013106', nome:'Deslocação Manutenção e Reparação', pvp:30, un:'un', tipo:'opcional', seccao:'Transversal', sub:'', inc:'Deslocação até 30km', exc:'', cond:'' },
  { id:'49013102', nome:'KM Extra Instalações',             pvp:1,  un:'km', tipo:'opcional', seccao:'Transversal', sub:'', inc:'1€ por KM extra após os 30km', exc:'', cond:'' },
];

/* ═══════════════════════════════════════════════
   RENDER PRINCIPAL — 3 sub-secções em tabs
═══════════════════════════════════════════════ */
export function renderFerramentas(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Ferramentas</h1>
    </div>
    <div class="filter-bar mb-16">
      <div class="filter-tab active" data-tab="mao-de-obra">Mão de Obra</div>
      <div class="filter-tab" data-tab="tampos">Calculadora Tampos</div>
      <div class="filter-tab" data-tab="biblioteca">Biblioteca KC</div>
    </div>
    <div id="ferramentas-content"></div>
  `;

  const content = container.querySelector('#ferramentas-content');

  container.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTab(tab.dataset.tab, content);
    });
  });

  renderTab('mao-de-obra', content);
}

function renderTab(tab, container) {
  if (tab === 'mao-de-obra')  renderMaoDeObra(container);
  if (tab === 'tampos')       renderTampos(container);
  if (tab === 'biblioteca')   renderBiblioteca(container);
}

/* ═══════════════════════════════════════════════
   MÃO DE OBRA
═══════════════════════════════════════════════ */
function renderMaoDeObra(container) {
  let seccao = 'Todos', search = '', tipo = 'Todos', transOpen = false;

  function filtrar() {
    return MAO_DE_OBRA.filter(s => {
      const secOk  = seccao === 'Todos' || s.seccao === seccao;
      const tipoOk = tipo   === 'Todos' || s.tipo   === tipo;
      const q      = search.toLowerCase();
      const srchOk = !q || s.nome.toLowerCase().includes(q) || s.id.includes(q) || (s.sub||'').toLowerCase().includes(q);
      return secOk && tipoOk && srchOk;
    });
  }

  function agrupar(lista) {
    const g = {};
    lista.forEach(s => { const k = s.sub || '—'; if (!g[k]) g[k] = []; g[k].push(s); });
    return g;
  }

  function render() {
    const filtrados = filtrar();
    const grupos    = agrupar(filtrados);

    container.innerHTML = `
      <div class="card mb-16">
        <div class="card-header">
          <div style="display:flex;align-items:center;gap:10px;flex:1;flex-wrap:wrap;">
            <div class="topbar-search" style="flex:1;min-width:200px;">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0;opacity:.4"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              <input id="mo-search" type="text" placeholder="Pesquisar serviço ou código…" value="${search}" style="border:none;background:none;outline:none;font-family:var(--sans);font-size:13px;color:var(--ink);width:100%;">
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-transversais">Deslocação</button>
          </div>
        </div>
        <div style="padding:10px 16px;border-bottom:1px solid var(--paper3);display:flex;gap:6px;flex-wrap:wrap;">
          ${['Todos','standard','visita','opcional'].map(t =>
            `<div class="filter-tab btn-sm ${tipo===t?'active':''}" data-tipo="${t}" style="cursor:pointer;">${t==='Todos'?'Todos os tipos':TIPO_LABEL[t]||t}</div>`
          ).join('')}
          <span style="margin-left:auto;font-size:11px;color:var(--ink4);font-family:var(--mono);align-self:center;">${filtrados.length} serviços</span>
        </div>
        <div style="padding:8px 16px;border-bottom:1px solid var(--paper3);display:flex;gap:5px;overflow-x:auto;">
          <div class="filter-tab btn-sm ${seccao==='Todos'?'active':''}" data-sec="Todos" style="cursor:pointer;white-space:nowrap;">Todas</div>
          ${SECCOES.map(s =>
            `<div class="filter-tab btn-sm ${seccao===s?'active':''}" data-sec="${s}" style="cursor:pointer;white-space:nowrap;">${s.replace(/^\d+ · /,'')}</div>`
          ).join('')}
        </div>
        <div class="card-body" style="padding:0;max-height:60vh;overflow-y:auto;">
          ${Object.keys(grupos).length === 0 ? `<div class="empty-state" style="padding:30px"><div class="empty-state-sub">Sem resultados para esta pesquisa</div></div>` :
            Object.entries(grupos).map(([sub, servicos]) => `
              <details open>
                <summary style="padding:8px 16px;cursor:pointer;font-size:11px;font-weight:500;color:var(--ink3);font-family:var(--mono);letter-spacing:.5px;text-transform:uppercase;background:var(--paper2);border-bottom:1px solid var(--paper3);list-style:none;display:flex;align-items:center;gap:6px;">
                  <span style="font-size:9px;opacity:.5;">▸</span> ${sub} <span style="opacity:.5;">(${servicos.length})</span>
                </summary>
                <div style="padding:6px 12px;">
                  ${servicos.map(s => renderServicoCard(s)).join('')}
                </div>
              </details>
            `).join('')
          }
        </div>
      </div>
      ${transOpen ? renderTransversaisModal() : ''}
    `;

    bindMOEvents();
  }

  function bindMOEvents() {
    container.querySelector('#mo-search')?.addEventListener('input', e => {
      search = e.target.value; render();
    });
    container.querySelectorAll('[data-tipo]').forEach(el => {
      el.addEventListener('click', () => { tipo = el.dataset.tipo; render(); });
    });
    container.querySelectorAll('[data-sec]').forEach(el => {
      el.addEventListener('click', () => { seccao = el.dataset.sec; render(); });
    });
    container.querySelector('#btn-transversais')?.addEventListener('click', () => {
      transOpen = true; render();
    });
    container.querySelector('#btn-close-trans')?.addEventListener('click', () => {
      transOpen = false; render();
    });
    container.querySelectorAll('.mo-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.closest('button') || e.target.closest('input')) return;
        card.querySelector('.mo-detail')?.classList.toggle('hidden');
        const arr = card.querySelector('.mo-arr');
        if (arr) arr.textContent = card.querySelector('.mo-detail')?.classList.contains('hidden') ? '▸' : '▾';
      });
    });
    container.querySelectorAll('.btn-copy-mo').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.val).catch(() => {});
        const orig = btn.textContent;
        btn.textContent = '✓'; btn.style.color = 'var(--green-mid)';
        setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
      });
    });
    container.querySelectorAll('.btn-add-orc-mo').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        adicionarAoOrcamento(btn.dataset);
        btn.textContent = '✓ Adicionado'; btn.style.background = 'var(--green-lite)';
        setTimeout(() => { btn.textContent = '+ Orç'; btn.style.background = ''; }, 1800);
      });
    });
  }

  render();
}

function renderServicoCard(s) {
  const tipoCor = TIPO_COR[s.tipo] || 'var(--ink4)';
  const isMedida = s.un !== 'un';
  return `
    <div class="mo-card" style="border-radius:var(--r);border:1px solid var(--paper3);margin-bottom:5px;overflow:hidden;cursor:pointer;background:var(--paper);">
      <div style="padding:10px 12px;">
        <div style="display:flex;align-items:flex-start;gap:8px;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:500;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.nome}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
              <span style="font-size:11px;color:${tipoCor};font-family:var(--mono);">${TIPO_LABEL[s.tipo]||s.tipo}</span>
              <span style="color:var(--paper3);">·</span>
              <span style="font-size:11px;color:var(--ink4);font-family:var(--mono);">${f2(s.pvp)} €/${s.un}</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <span class="mo-arr" style="font-size:10px;color:var(--ink4);">▸</span>
            <button class="btn btn-secondary btn-sm btn-copy-mo" data-val="${s.id}" style="font-family:var(--mono);font-size:11px;">${s.id} ⎘</button>
            <button class="btn btn-secondary btn-sm" style="font-weight:600;color:var(--green);">${f2(s.pvp)} €</button>
            <button class="btn btn-primary btn-sm btn-add-orc-mo"
              data-ref="${s.id}" data-desc="${s.nome.replace(/"/g,"'")}" data-pvp="${s.pvp}" data-un="${s.un}" data-origem="Mão de Obra">
              + Orç
            </button>
          </div>
        </div>
        <div class="mo-detail hidden" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--paper3);">
          ${s.inc ? `<div style="margin-bottom:6px;"><div style="font-size:10px;font-weight:500;color:var(--green);font-family:var(--mono);margin-bottom:3px;">INCLUÍDO</div><div style="font-size:12px;color:var(--ink2);line-height:1.6;white-space:pre-line;">${s.inc}</div></div>` : ''}
          ${s.exc ? `<div style="margin-bottom:6px;"><div style="font-size:10px;font-weight:500;color:var(--red);font-family:var(--mono);margin-bottom:3px;">EXCLUÍDO</div><div style="font-size:12px;color:var(--ink2);line-height:1.6;white-space:pre-line;">${s.exc}</div></div>` : ''}
          ${s.cond ? `<div><div style="font-size:10px;font-weight:500;color:var(--amber);font-family:var(--mono);margin-bottom:3px;">CONDIÇÕES</div><div style="font-size:12px;color:var(--ink2);line-height:1.6;white-space:pre-line;">${s.cond}</div></div>` : ''}
          ${s.un !== 'un' ? `
            <div style="margin-top:10px;display:flex;align-items:center;gap:8px;">
              <label style="font-size:12px;color:var(--ink3);">Quantidade (${s.un})</label>
              <input type="number" class="form-input mo-qty" data-pvp="${s.pvp}" style="width:80px;" min="0" step="0.1" placeholder="0">
              <span class="mo-total" style="font-size:13px;font-weight:500;color:var(--ink);font-family:var(--mono);">—</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderTransversaisModal() {
  return `
    <div style="position:fixed;inset:0;background:rgba(28,25,23,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;">
      <div class="card" style="max-width:440px;width:100%;">
        <div class="card-header">
          <div class="card-title">Códigos Transversais</div>
          <button class="btn btn-secondary btn-sm" id="btn-close-trans">✕</button>
        </div>
        <div class="card-body">
          <p style="font-size:12px;color:var(--ink3);margin-bottom:14px;">Deslocação e KM extra — adicionados separadamente ao orçamento.</p>
          ${TRANSVERSAIS.map(s => renderServicoCard(s)).join('')}
        </div>
      </div>
    </div>
  `;
}

/* ═══════════════════════════════════════════════
   CALCULADORA DE TAMPOS
═══════════════════════════════════════════════ */
function renderTampos(container) {
  let proj = novoProjeto('SILESTONES');
  let paginaTampos = 'lista';
  let calculos = JSON.parse(localStorage.getItem('hmops_tampos') || '[]');

  function guardarLocal() {
    localStorage.setItem('hmops_tampos', JSON.stringify(calculos));
  }

  function render() {
    if (paginaTampos === 'calc') renderCalculadora();
    else renderListaTampos();
  }

  function renderListaTampos() {
    container.innerHTML = `
      <div class="card mb-16">
        <div class="card-header">
          <div class="card-title">Cálculos guardados</div>
          <button class="btn btn-primary btn-sm" id="btn-novo-tampo">+ Novo cálculo</button>
        </div>
        <div class="card-body" style="padding:0;">
          ${calculos.length === 0 ? `
            <div class="empty-state" style="padding:30px;">
              <div class="empty-state-sub">Sem cálculos guardados</div>
            </div>
          ` : calculos.map((c, i) => {
            const res = totProj(c);
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--paper3);cursor:pointer;" data-idx="${i}" class="tampo-row">
                <div style="flex:1;">
                  <div style="font-size:13px;font-weight:500;color:var(--ink);">${c.nome || 'Sem nome'}</div>
                  <div style="font-size:11px;color:var(--ink4);font-family:var(--mono);">${c.tipo}${c.contacto?' · '+c.contacto:''}</div>
                </div>
                <div style="font-size:18px;font-weight:300;color:var(--green-mid);font-family:var(--serif);">${f2(res.pvp)} €</div>
                <button class="btn btn-secondary btn-sm btn-del-tampo" data-idx="${i}">✕</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    container.querySelector('#btn-novo-tampo')?.addEventListener('click', () => {
      proj = novoProjeto('SILESTONES');
      paginaTampos = 'calc';
      render();
    });
    container.querySelectorAll('.tampo-row').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('.btn-del-tampo')) return;
        proj = { ...calculos[parseInt(row.dataset.idx)] };
        paginaTampos = 'calc';
        render();
      });
    });
    container.querySelectorAll('.btn-del-tampo').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (confirm('Eliminar este cálculo?')) {
          calculos.splice(parseInt(btn.dataset.idx), 1);
          guardarLocal();
          render();
        }
      });
    });
  }

  function renderCalculadora() {
    const res = totProj(proj);
    container.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        <button class="btn btn-secondary btn-sm" id="btn-back-tampo">← Voltar</button>
        <input class="form-input" id="tampo-nome" placeholder="Nome do cálculo" value="${proj.nome||''}" style="flex:1;">
        <button class="btn btn-primary" id="btn-guardar-tampo">Guardar</button>
      </div>

      <!-- Tipo de pedra -->
      <div class="card mb-16">
        <div class="card-header"><div class="card-title">Material</div></div>
        <div class="card-body">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
            ${TIPOS_ALL.map(t =>
              `<div class="filter-tab ${proj.tipo===t?'active':''} btn-tipo-pedra" data-tipo="${t}" style="cursor:pointer;">${t.charAt(0)+t.slice(1).toLowerCase()}</div>`
            ).join('')}
          </div>
          <div class="form-group">
            <label class="form-label">Material</label>
            <select class="form-select" id="tampo-material">
              <option value="">Seleccionar material…</option>
              ${(ANIGRACO[proj.tipo]?.materiais || []).map(m =>
                `<option value="${m.desc}|${m.grupo||''}" ${proj.desc===m.desc?'selected':''}>${m.desc}${m.grupo?' ('+m.grupo+')':''}</option>`
              ).join('')}
            </select>
          </div>
          ${proj.desc ? `
            <div class="form-group">
              <label class="form-label">Espessura</label>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${Object.keys(ANIGRACO[proj.tipo]?.materiais.find(m=>m.desc===proj.desc)?.espessuras||{}).map(e =>
                  `<div class="filter-tab ${proj.espessura===e?'active':''} btn-esp" data-esp="${e}" style="cursor:pointer;">${e}</div>`
                ).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Peças -->
      <div class="card mb-16">
        <div class="card-header">
          <div class="card-title">Peças</div>
          <button class="btn btn-secondary btn-sm" id="btn-add-peca">+ Peça</button>
        </div>
        <div class="card-body" style="padding:0;">
          ${(proj.pecas||[]).map((p, pi) => {
            const r = calcPeca({...p, tipo:proj.tipo, desc:proj.desc, grupo:proj.grupo, espessura:proj.espessura});
            return `
              <div style="padding:14px 16px;border-bottom:1px solid var(--paper3);">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                  <input class="form-input" style="flex:1;" placeholder="Nome da peça" value="${p.label||''}"
                    data-pi="${pi}" data-field="label">
                  <span style="font-size:13px;font-weight:500;color:var(--green-mid);font-family:var(--serif);white-space:nowrap;">${f2(r.pvp)} €</span>
                  ${(proj.pecas||[]).length > 1 ? `<button class="btn btn-secondary btn-sm btn-rm-peca" data-pi="${pi}">✕</button>` : ''}
                </div>
                ${(p.segmentos||[]).map((sg, si) => `
                  <div style="display:grid;grid-template-columns:1fr auto auto auto;gap:8px;align-items:center;margin-bottom:6px;">
                    <input class="form-input" placeholder="Comprimento (m)" value="${sg.comp||''}" type="number" min="0" step="0.01"
                      data-pi="${pi}" data-si="${si}" data-field="comp" class="seg-input">
                    <span style="font-size:12px;color:var(--ink3);">×</span>
                    <input class="form-input" placeholder="Largura (m)" value="${sg.larg||''}" type="number" min="0" step="0.01" style="width:100px;"
                      data-pi="${pi}" data-si="${si}" data-field="larg" class="seg-input">
                    <span style="font-size:12px;color:var(--ink3);font-family:var(--mono);">${f2(r.m2)} m²</span>
                  </div>
                `).join('')}
                <button class="btn btn-secondary btn-sm btn-add-seg" data-pi="${pi}" style="margin-top:4px;">+ Segmento</button>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Transporte -->
      <div class="card mb-16">
        <div class="card-header"><div class="card-title">Transporte</div></div>
        <div class="card-body">
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            <div class="filter-tab ${!proj.transporte?'active':''} btn-transp" data-idx="-1" style="cursor:pointer;">Sem transporte</div>
            ${TRANSPORTE.map((t,i) =>
              `<div class="filter-tab ${proj.transporte?.label===t.label?'active':''} btn-transp" data-idx="${i}" style="cursor:pointer;">${t.label} — ${f2(t.pvp)} €</div>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- Total -->
      <div class="card" style="border-color:var(--green-brd);background:var(--green-lite);">
        <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-size:12px;color:var(--green);font-family:var(--mono);letter-spacing:.5px;margin-bottom:4px;">TOTAL PVP</div>
            <div style="font-size:32px;font-weight:300;font-family:var(--serif);color:var(--green);">${f2(res.pvp)} €</div>
          </div>
          <button class="btn btn-secondary btn-sm" id="btn-copy-pvp">Copiar PVP ⎘</button>
        </div>
      </div>
    `;

    bindTamposEvents();
  }

  function bindTamposEvents() {
    container.querySelector('#btn-back-tampo')?.addEventListener('click', () => {
      paginaTampos = 'lista'; render();
    });

    container.querySelector('#tampo-nome')?.addEventListener('input', e => {
      proj.nome = e.target.value;
    });

    container.querySelector('#btn-guardar-tampo')?.addEventListener('click', () => {
      proj.nome = container.querySelector('#tampo-nome')?.value || proj.nome;
      const idx = calculos.findIndex(c => c._id === proj._id);
      if (idx >= 0) calculos[idx] = proj;
      else { proj._id = uuid(); calculos.push(proj); }
      guardarLocal();
      mostrarToast('Cálculo guardado', 'success');
    });

    container.querySelectorAll('.btn-tipo-pedra').forEach(btn => {
      btn.addEventListener('click', () => {
        proj.tipo = btn.dataset.tipo; proj.desc = ''; proj.grupo = null;
        proj.pecas.forEach(p => { p.tipo = proj.tipo; });
        render();
      });
    });

    container.querySelector('#tampo-material')?.addEventListener('change', e => {
      const [desc, grupo] = e.target.value.split('|');
      proj.desc = desc; proj.grupo = grupo || null;
      const mat = ANIGRACO[proj.tipo]?.materiais.find(m => m.desc === desc);
      if (mat) proj.espessura = Object.keys(mat.espessuras)[0];
      render();
    });

    container.querySelectorAll('.btn-esp').forEach(btn => {
      btn.addEventListener('click', () => { proj.espessura = btn.dataset.esp; render(); });
    });

    container.querySelector('#btn-add-peca')?.addEventListener('click', () => {
      const n = (proj.pecas||[]).length + 1;
      proj.pecas.push({ id:uuid(), label:`Peça ${n}`, tipo:proj.tipo, desc:proj.desc, grupo:proj.grupo, espessura:proj.espessura, segmentos:[{id:uuid(),label:'Seg.1',comp:'',larg:''}], acabamentos:[] });
      render();
    });

    container.querySelectorAll('.btn-rm-peca').forEach(btn => {
      btn.addEventListener('click', () => { proj.pecas.splice(parseInt(btn.dataset.pi),1); render(); });
    });

    container.querySelectorAll('.btn-add-seg').forEach(btn => {
      btn.addEventListener('click', () => {
        const pi = parseInt(btn.dataset.pi);
        const n = (proj.pecas[pi].segmentos||[]).length + 1;
        proj.pecas[pi].segmentos.push({id:uuid(),label:`Seg.${n}`,comp:'',larg:''});
        render();
      });
    });

    container.querySelectorAll('[data-field="comp"],[data-field="larg"]').forEach(inp => {
      inp.addEventListener('input', e => {
        const pi = parseInt(inp.dataset.pi), si = parseInt(inp.dataset.si);
        proj.pecas[pi].segmentos[si][inp.dataset.field] = inp.value;
        const r = calcPeca({...proj.pecas[pi], tipo:proj.tipo, desc:proj.desc, grupo:proj.grupo, espessura:proj.espessura});
        const res = totProj(proj);
        inp.closest('[style*="border-bottom"]')?.querySelector('[style*="green-mid"]')
          && (inp.closest('[style*="border-bottom"]').querySelector('[style*="green-mid"]').textContent = f2(r.pvp) + ' €');
        container.querySelector('[style*="TOTAL PVP"]')?.closest('.card')?.querySelector('[style*="32px"]')
          && (container.querySelector('[style*="TOTAL PVP"]').closest('.card').querySelector('[style*="32px"]').textContent = f2(res.pvp) + ' €');
      });
    });

    container.querySelectorAll('[data-field="label"]').forEach(inp => {
      inp.addEventListener('input', e => {
        proj.pecas[parseInt(inp.dataset.pi)].label = inp.value;
      });
    });

    container.querySelectorAll('.btn-transp').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx);
        proj.transporte = idx >= 0 ? TRANSPORTE[idx] : null;
        render();
      });
    });

    container.querySelector('#btn-copy-pvp')?.addEventListener('click', () => {
      const res = totProj(proj);
      navigator.clipboard.writeText(f2(res.pvp)).catch(() => {});
      mostrarToast('PVP copiado — ' + f2(res.pvp) + ' €', 'success');
    });
  }

  render();
}

/* ═══════════════════════════════════════════════
   BIBLIOTECA KC
═══════════════════════════════════════════════ */
function renderBiblioteca(container) {
  let search = '', catActiva = 'Todos', sort = 'ref', onlyKC = false;
  const CATS_DEFAULT = ['Ferragens','Iluminação','Colas · Tintas · Vernizes','Eletrodomésticos','Tampos','Sanitários','Caixilharia','Decoração','Aquecimento','Material PRO','Limpeza','Acessórios'];

  function getArtigos() {
    try { return JSON.parse(localStorage.getItem('hmops_biblioteca') || '[]'); }
    catch { return []; }
  }

  function guardar(arts) {
    localStorage.setItem('hmops_biblioteca', JSON.stringify(arts));
  }

  function filtrar(arts) {
    return arts.filter(a => {
      const mc = catActiva === 'Todos' || a.cat === catActiva;
      const q  = search.toLowerCase();
      const mq = !q || [a.ref,a.desc,a.cat,a.supplier,a.notes].some(v => v && v.toLowerCase().includes(q));
      const mk = !onlyKC || a.kc;
      return mc && mq && mk;
    }).sort((a,b) => {
      if (sort === 'price_asc')  return (a.price||0)-(b.price||0);
      if (sort === 'price_desc') return (b.price||0)-(a.price||0);
      if (sort === 'desc')       return (a.desc||'').localeCompare(b.desc||'');
      return (a.ref||'').localeCompare(b.ref||'');
    });
  }

  function render() {
    const arts     = getArtigos();
    const filtrados = filtrar(arts);
    const cats      = [...new Set(arts.map(a=>a.cat).filter(Boolean))].sort();

    container.innerHTML = `
      <div style="display:grid;grid-template-columns:180px 1fr;gap:16px;">
        <!-- Sidebar categorias -->
        <div>
          <div class="card">
            <div class="card-body" style="padding:8px 0;">
              <div class="nav-item ${catActiva==='Todos'?'active':''}" data-cat="Todos" style="font-size:12px;">
                Todos <span class="nav-count">${arts.length}</span>
              </div>
              ${cats.map(c =>
                `<div class="nav-item ${catActiva===c?'active':''}" data-cat="${c}" style="font-size:12px;">
                  ${c} <span class="nav-count">${arts.filter(a=>a.cat===c).length}</span>
                </div>`
              ).join('')}
            </div>
          </div>
          <button class="btn btn-primary w-full mt-8" id="btn-add-art" style="font-size:12px;">+ Artigo</button>
          <button class="btn btn-secondary w-full mt-8" id="btn-import-art" style="font-size:12px;">↑ Importar CSV</button>
          <input type="file" id="input-csv" accept=".csv,.json" style="display:none;">
        </div>

        <!-- Lista artigos -->
        <div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px;flex-wrap:wrap;">
            <div class="topbar-search" style="flex:1;">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style="flex-shrink:0;opacity:.4"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.3"/><path d="M9 9l2.5 2.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
              <input id="bib-search" type="text" placeholder="Referência, descrição, fornecedor…" value="${search}"
                style="border:none;background:none;outline:none;font-family:var(--sans);font-size:13px;color:var(--ink);width:100%;">
            </div>
            <select class="form-select" id="bib-sort" style="width:auto;font-size:12px;">
              <option value="ref"        ${sort==='ref'?'selected':''}>Referência</option>
              <option value="desc"       ${sort==='desc'?'selected':''}>Nome A-Z</option>
              <option value="price_asc"  ${sort==='price_asc'?'selected':''}>Preço ↑</option>
              <option value="price_desc" ${sort==='price_desc'?'selected':''}>Preço ↓</option>
            </select>
            <label style="display:flex;align-items:center;gap:5px;font-size:12px;color:var(--ink3);cursor:pointer;">
              <input type="checkbox" id="bib-kc" ${onlyKC?'checked':''}> Só KC
            </label>
            <span style="font-size:11px;color:var(--ink4);font-family:var(--mono);">${filtrados.length} artigos</span>
          </div>

          ${filtrados.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-icon">◻</div>
              <div class="empty-state-title">${arts.length === 0 ? 'Sem artigos ainda' : 'Nenhum resultado'}</div>
              <div class="empty-state-sub">${arts.length === 0 ? 'Adiciona o primeiro artigo ou importa um CSV' : 'Experimenta outra pesquisa'}</div>
            </div>
          ` : `
            <div style="display:flex;flex-direction:column;gap:6px;" id="bib-list">
              ${filtrados.map(a => renderArtRow(a)).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    bindBibEvents(arts);
  }

  function renderArtRow(a) {
    return `
      <div class="card" style="border-radius:var(--r);cursor:pointer;" data-art-id="${a.id}">
        <div style="padding:12px 14px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <button class="btn btn-secondary btn-sm btn-copy-ref" data-val="${a.ref}"
              style="font-family:var(--mono);font-size:12px;font-weight:500;">${a.ref} ⎘</button>
            ${a.kc ? `<span class="badge badge-blue">KC</span>` : ''}
            ${a.star ? `<span style="color:var(--amber-mid);">★</span>` : ''}
            <div style="flex:1;font-size:13px;font-weight:500;color:var(--ink);">${a.desc}</div>
            ${a.price > 0 ? `<span style="font-size:12px;color:var(--ink3);font-family:var(--mono);">${a.price.toFixed(2)} €</span>` : ''}
            <button class="btn btn-secondary btn-sm btn-edit-art" data-id="${a.id}" style="font-size:11px;">✎</button>
            <button class="btn btn-secondary btn-sm btn-del-art" data-id="${a.id}" style="font-size:11px;">✕</button>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${a.cat ? `<span class="badge badge-gray">${a.cat}${a.sub?' · '+a.sub:''}</span>` : ''}
            ${a.supplier ? `<span class="badge badge-gray">${a.supplier}</span>` : ''}
            ${a.notes ? `<span style="font-size:12px;color:var(--ink3);">${a.notes}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }

  function abrirModalArtigo(art = null) {
    const isEdit = !!art;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <div class="modal-title">${isEdit ? 'Editar artigo' : 'Novo artigo'}</div>
          <button class="modal-close btn-close-modal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Referência *</label>
              <input class="form-input" id="art-ref" value="${art?.ref||''}" placeholder="ex: 79012345">
            </div>
            <div class="form-group">
              <label class="form-label">Preço (€)</label>
              <input class="form-input" id="art-price" type="number" value="${art?.price||''}" placeholder="0.00" step="0.01" min="0">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descrição *</label>
            <input class="form-input" id="art-desc" value="${art?.desc||''}" placeholder="Descrição do artigo">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Categoria</label>
              <select class="form-select" id="art-cat">
                <option value="">Sem categoria</option>
                ${CATS_DEFAULT.map(c => `<option value="${c}" ${art?.cat===c?'selected':''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Fornecedor</label>
              <input class="form-input" id="art-supplier" value="${art?.supplier||''}" placeholder="Nome do fornecedor">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Notas</label>
            <textarea class="form-textarea" id="art-notes" placeholder="Notas internas…">${art?.notes||''}</textarea>
          </div>
          <div style="display:flex;gap:16px;">
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="art-kc" ${art?.kc?'checked':''}> Artigo KC
            </label>
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;">
              <input type="checkbox" id="art-star" ${art?.star?'checked':''}> Favorito ★
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary btn-close-modal">Cancelar</button>
          <button class="btn btn-primary" id="btn-save-art">Guardar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });
    overlay.querySelector('#btn-save-art')?.addEventListener('click', () => {
      const ref   = overlay.querySelector('#art-ref').value.trim();
      const desc  = overlay.querySelector('#art-desc').value.trim();
      if (!ref || !desc) { alert('Referência e descrição são obrigatórias'); return; }
      const arts = getArtigos();
      const data = {
        id:       art?.id || uuid(),
        ref, desc,
        cat:      overlay.querySelector('#art-cat').value,
        price:    parseFloat(overlay.querySelector('#art-price').value) || 0,
        supplier: overlay.querySelector('#art-supplier').value.trim(),
        notes:    overlay.querySelector('#art-notes').value.trim(),
        kc:       overlay.querySelector('#art-kc').checked,
        star:     overlay.querySelector('#art-star').checked,
      };
      if (isEdit) {
        const idx = arts.findIndex(a => a.id === art.id);
        if (idx >= 0) arts[idx] = data; else arts.push(data);
      } else {
        arts.push(data);
      }
      guardar(arts);
      overlay.remove();
      render();
      mostrarToast(isEdit ? 'Artigo actualizado' : 'Artigo adicionado', 'success');
    });
  }

  function bindBibEvents(arts) {
    container.querySelector('#bib-search')?.addEventListener('input', e => { search = e.target.value; render(); });
    container.querySelector('#bib-sort')?.addEventListener('change', e => { sort = e.target.value; render(); });
    container.querySelector('#bib-kc')?.addEventListener('change', e => { onlyKC = e.target.checked; render(); });
    container.querySelectorAll('[data-cat]').forEach(el => {
      el.addEventListener('click', () => { catActiva = el.dataset.cat; render(); });
    });
    container.querySelector('#btn-add-art')?.addEventListener('click', () => abrirModalArtigo());
    container.querySelectorAll('.btn-copy-ref').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.val).catch(()=>{});
        const orig = btn.innerHTML; btn.innerHTML = '✓ copiado'; btn.style.color = 'var(--green-mid)';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
      });
    });
    container.querySelectorAll('.btn-edit-art').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const art = arts.find(a => a.id === btn.dataset.id);
        if (art) abrirModalArtigo(art);
      });
    });
    container.querySelectorAll('.btn-del-art').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const art = arts.find(a => a.id === btn.dataset.id);
        if (art && confirm(`Eliminar "${art.desc}"?`)) {
          const novas = arts.filter(a => a.id !== btn.dataset.id);
          guardar(novas);
          render();
        }
      });
    });
    container.querySelector('#btn-import-art')?.addEventListener('click', () => {
      container.querySelector('#input-csv').click();
    });
    container.querySelector('#input-csv')?.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          let importados = [];
          if (file.name.endsWith('.json')) {
            const data = JSON.parse(ev.target.result);
            importados = Array.isArray(data) ? data : (data.artigos || []);
          } else {
            const linhas = ev.target.result.split('\n').filter(Boolean);
            const headers = linhas[0].split(',').map(h => h.trim().replace(/"/g,''));
            importados = linhas.slice(1).map(linha => {
              const vals = linha.split(',').map(v => v.trim().replace(/"/g,''));
              const obj = {};
              headers.forEach((h,i) => obj[h] = vals[i]||'');
              return { id:uuid(), ref:obj.ref||'', desc:obj.desc||obj.descricao||'', cat:obj.cat||obj.categoria||'', price:parseFloat(obj.price||obj.preco)||0, supplier:obj.supplier||obj.fornecedor||'', kc:obj.kc==='true'||obj.kc===true, star:false, notes:obj.notes||obj.notas||'' };
            }).filter(a => a.ref && a.desc);
          }
          const arts = getArtigos();
          let novos = 0;
          importados.forEach(imp => {
            if (!arts.find(a => a.ref === imp.ref)) { arts.push({...imp, id:uuid()}); novos++; }
          });
          guardar(arts);
          render();
          mostrarToast(`${novos} artigos importados`, 'success');
        } catch { mostrarToast('Erro ao importar ficheiro', 'error'); }
      };
      reader.readAsText(file);
      e.target.value = '';
    });
  }

  render();
}

/* ═══════════════════════════════════════════════
   HELPER — Adicionar ao orçamento do projecto activo
═══════════════════════════════════════════════ */
async function adicionarAoOrcamento(data) {
  const projetos = await Projetos.listar();
  const activos  = projetos.filter(p => !p.concluido);
  if (activos.length === 0) {
    mostrarToast('Cria primeiro um projecto activo', '');
    return;
  }
  if (activos.length === 1) {
    await appendItem(activos[0], data);
    return;
  }
  // Mais de 1 projecto — pedir selecção
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal" style="max-width:360px;">
      <div class="modal-header"><div class="modal-title">Adicionar a que projecto?</div></div>
      <div class="modal-body" style="padding:0;">
        ${activos.map(p => `
          <div class="proj-row" data-pid="${p.id}" style="cursor:pointer;margin:0;border-radius:0;border-left:none;border-right:none;border-top:none;">
            <div>
              <div class="proj-name">${p.nome}</div>
              <div class="proj-client">${p.cliente||'—'}</div>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="modal-footer"><button class="btn btn-secondary" id="btn-cancel-orc">Cancelar</button></div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('#btn-cancel-orc')?.addEventListener('click', () => overlay.remove());
  overlay.querySelectorAll('[data-pid]').forEach(row => {
    row.addEventListener('click', async () => {
      const proj = activos.find(p => p.id === row.dataset.pid);
      if (proj) await appendItem(proj, data);
      overlay.remove();
    });
  });
}

async function appendItem(proj, data) {
  const item = {
    ref:    data.ref || '',
    desc:   data.desc || '',
    price:  parseFloat(data.pvp) || 0,
    qty:    1,
    origem: data.origem || 'Biblioteca',
    cat:    data.cat || '',
  };
  proj.orcamento = proj.orcamento || [];
  proj.orcamento.push(item);
  await Projetos.guardar(proj);
  mostrarToast(`Adicionado ao projecto ${proj.nome}`, 'success');
}

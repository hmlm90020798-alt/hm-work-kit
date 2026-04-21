import { Projetos } from './db.js';
import { f2 } from './useTampos.js';

const SEM_QTY  = new Set(['Tampos', 'Mão de Obra']);
const COR_FASE = {
  'Tampos':      'var(--blue-mid)',
  'Mão de Obra': 'var(--purple-mid)',
  'Biblioteca':  'var(--green-mid)',
  'KC':          'var(--amber-mid)',
};

export function renderOrcamento(container, projetoId) {
  let proj = null;

  async function load() {
    proj = await Projetos.obter(projetoId);
    render();
  }

  function getItems()  { return proj?.orcamento || []; }

  function calcTotal(items) {
    return items.reduce((s, i) =>
      SEM_QTY.has(i.origem) ? s + (i.price||0) : s + (i.price||0) * (i.qty||1), 0
    );
  }

  function agrupar(items) {
    const grupos = {};
    items.forEach((item, idx) => {
      const k = item.origem || 'Outros';
      if (!grupos[k]) grupos[k] = [];
      grupos[k].push({ ...item, _idx: idx });
    });
    return grupos;
  }

  function render() {
    const items  = getItems();
    const total  = calcTotal(items);
    const grupos = agrupar(items);

    container.innerHTML = `
      <div class="section-header mb-16">
        <div class="section-title">Orçamento</div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-secondary btn-sm" id="btn-copy-all-orc">Copiar referências ⎘</button>
          <button class="btn btn-secondary btn-sm" id="btn-add-item">+ Item manual</button>
          ${items.length > 0 ? `<button class="btn btn-secondary btn-sm" id="btn-limpar-orc" style="color:var(--red);">Limpar</button>` : ''}
        </div>
      </div>

      ${items.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">◻</div>
          <div class="empty-state-title">Orçamento vazio</div>
          <div class="empty-state-sub">Adiciona artigos na secção Ferramentas ou manualmente aqui</div>
        </div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px;">
          ${Object.entries(grupos).map(([origem, oitems]) => {
            const subtotal = calcTotal(oitems);
            const cor = COR_FASE[origem] || 'var(--ink3)';
            return `
              <details open>
                <summary style="display:flex;align-items:center;gap:8px;padding:10px 14px;cursor:pointer;background:var(--paper);border:1px solid var(--paper3);border-radius:var(--r-lg);list-style:none;">
                  <span style="width:10px;height:10px;border-radius:50%;background:${cor};flex-shrink:0;"></span>
                  <span style="font-size:13px;font-weight:500;color:var(--ink);flex:1;">${origem}</span>
                  <span style="font-size:11px;color:var(--ink3);font-family:var(--mono);">${oitems.length} item${oitems.length!==1?'s':''}</span>
                  <span style="font-size:14px;font-weight:500;color:var(--ink);font-family:var(--serif);">${f2(subtotal)} €</span>
                  <button class="btn btn-secondary btn-sm btn-rm-grupo" data-origem="${origem}" style="font-size:10px;padding:3px 8px;">✕ grupo</button>
                </summary>
                <div style="margin-top:4px;display:flex;flex-direction:column;gap:5px;">
                  ${oitems.map(item => renderItemRow(item, cor)).join('')}
                </div>
              </details>
            `;
          }).join('')}
        </div>

        <!-- Total -->
        <div class="card" style="border-color:var(--green-brd);">
          <div class="card-body" style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:11px;color:var(--ink3);font-family:var(--mono);letter-spacing:.5px;margin-bottom:4px;">TOTAL ORÇAMENTO</div>
              <div style="font-size:28px;font-weight:300;font-family:var(--serif);color:var(--ink);">${f2(total)} €</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm" id="btn-copy-total">Copiar total ⎘</button>
            </div>
          </div>
        </div>
      `}
    `;

    bindEvents();
  }

  function renderItemRow(item, cor) {
    const semQty = SEM_QTY.has(item.origem);
    const subtotal = semQty ? (item.price||0) : (item.price||0) * (item.qty||1);
    return `
      <div style="display:flex;align-items:center;gap:8px;padding:10px 14px;background:var(--paper);border:1px solid var(--paper3);border-radius:var(--r);border-left:3px solid ${cor};">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;">
            <button class="btn btn-secondary btn-sm btn-copy-ref" data-val="${item.ref}"
              style="font-family:var(--mono);font-size:12px;font-weight:500;">${item.ref} ⎘</button>
            ${item.cat ? `<span class="badge badge-gray" style="font-size:10px;">${item.cat}</span>` : ''}
          </div>
          <div style="font-size:13px;color:var(--ink2);">${item.desc}</div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          ${!semQty ? `
            <div style="display:flex;align-items:center;gap:4px;">
              <button class="btn btn-secondary btn-sm btn-qty-dec" data-idx="${item._idx}" style="padding:4px 8px;font-size:14px;">−</button>
              <input type="number" class="form-input inp-qty" data-idx="${item._idx}" value="${item.qty||1}" min="1" step="1"
                style="width:50px;text-align:center;padding:4px;font-size:13px;">
              <button class="btn btn-secondary btn-sm btn-qty-inc" data-idx="${item._idx}" style="padding:4px 8px;font-size:14px;">+</button>
            </div>
          ` : ''}
          <input type="number" class="form-input inp-price" data-idx="${item._idx}" value="${f2(item.price||0)}" min="0" step="0.01"
            style="width:80px;text-align:right;padding:4px;font-size:13px;font-family:var(--mono);">
          <span style="font-size:12px;color:var(--ink3);font-family:var(--mono);">€</span>
          ${!semQty && (item.qty||1) > 1 ? `<span style="font-size:12px;color:var(--ink2);font-family:var(--mono);min-width:60px;text-align:right;">${f2(subtotal)} €</span>` : ''}
          <button class="btn btn-secondary btn-sm btn-rm-item" data-idx="${item._idx}" style="font-size:11px;">✕</button>
        </div>
      </div>
    `;
  }

  async function saveItems(items) {
    proj.orcamento = items;
    await Projetos.guardar(proj);
    render();
  }

  function bindEvents() {
    container.querySelector('#btn-copy-all-orc')?.addEventListener('click', () => {
      const txt = getItems().map(i => `${i.ref}  ${i.desc}${(i.qty||1)>1?' ×'+i.qty:''}`).join('\n');
      navigator.clipboard.writeText(txt).catch(()=>{});
      mostrarToast('Referências copiadas', 'success');
    });

    container.querySelector('#btn-copy-total')?.addEventListener('click', () => {
      const t = calcTotal(getItems());
      navigator.clipboard.writeText(f2(t)).catch(()=>{});
      mostrarToast('Total copiado — ' + f2(t) + ' €', 'success');
    });

    container.querySelector('#btn-limpar-orc')?.addEventListener('click', () => {
      if (confirm('Limpar todo o orçamento?')) saveItems([]);
    });

    container.querySelector('#btn-add-item')?.addEventListener('click', () => {
      abrirModalItem();
    });

    container.querySelectorAll('.btn-rm-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const items = [...getItems()];
        items.splice(parseInt(btn.dataset.idx), 1);
        saveItems(items);
      });
    });

    container.querySelectorAll('.btn-rm-grupo').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm(`Remover todo o grupo "${btn.dataset.origem}"?`)) return;
        saveItems(getItems().filter(i => (i.origem||'Outros') !== btn.dataset.origem));
      });
    });

    container.querySelectorAll('.btn-qty-dec,.btn-qty-inc').forEach(btn => {
      btn.addEventListener('click', () => {
        const items = [...getItems()];
        const idx   = parseInt(btn.dataset.idx);
        const delta = btn.classList.contains('btn-qty-dec') ? -1 : 1;
        const newQty = Math.max(1, (parseFloat(items[idx].qty)||1) + delta);
        items[idx] = { ...items[idx], qty: newQty };
        saveItems(items);
      });
    });

    container.querySelectorAll('.inp-qty').forEach(inp => {
      inp.addEventListener('change', () => {
        const items = [...getItems()];
        const idx   = parseInt(inp.dataset.idx);
        const qty   = Math.max(1, parseFloat(inp.value)||1);
        items[idx]  = { ...items[idx], qty };
        saveItems(items);
      });
    });

    container.querySelectorAll('.inp-price').forEach(inp => {
      inp.addEventListener('change', () => {
        const items = [...getItems()];
        const idx   = parseInt(inp.dataset.idx);
        const price = Math.max(0, parseFloat(inp.value)||0);
        items[idx]  = { ...items[idx], price };
        saveItems(items);
      });
    });

    container.querySelectorAll('.btn-copy-ref').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        navigator.clipboard.writeText(btn.dataset.val).catch(()=>{});
        const orig = btn.innerHTML; btn.innerHTML = '✓'; btn.style.color = 'var(--green-mid)';
        setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
      });
    });
  }

  function abrirModalItem() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay open';
    overlay.innerHTML = `
      <div class="modal" style="max-width:460px;">
        <div class="modal-header"><div class="modal-title">Adicionar item</div></div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Referência *</label>
              <input class="form-input" id="ni-ref" placeholder="ex: 79012345">
            </div>
            <div class="form-group">
              <label class="form-label">Quantidade</label>
              <input class="form-input" id="ni-qty" type="number" value="1" min="1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Descrição *</label>
            <input class="form-input" id="ni-desc" placeholder="Descrição do artigo">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Preço (€)</label>
              <input class="form-input" id="ni-price" type="number" value="0" step="0.01" min="0">
            </div>
            <div class="form-group">
              <label class="form-label">Origem</label>
              <select class="form-select" id="ni-origem">
                <option value="Biblioteca">Biblioteca</option>
                <option value="KC">KC</option>
                <option value="Mão de Obra">Mão de Obra</option>
                <option value="Tampos">Tampos</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="btn-cancel-item">Cancelar</button>
          <button class="btn btn-primary" id="btn-save-item">Adicionar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#btn-cancel-item')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#btn-save-item')?.addEventListener('click', () => {
      const ref   = overlay.querySelector('#ni-ref').value.trim();
      const desc  = overlay.querySelector('#ni-desc').value.trim();
      if (!ref || !desc) { alert('Referência e descrição são obrigatórias'); return; }
      const items = [...getItems()];
      items.push({
        ref, desc,
        qty:    parseFloat(overlay.querySelector('#ni-qty').value)||1,
        price:  parseFloat(overlay.querySelector('#ni-price').value)||0,
        origem: overlay.querySelector('#ni-origem').value,
      });
      saveItems(items);
      overlay.remove();
      mostrarToast('Item adicionado', 'success');
    });
  }

  load();
}

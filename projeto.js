import { Projetos } from './db.js';
import { navegarPara, badgeFase, fases, formatarDataCompleta, diasAte } from './app.js';
import { renderOrcamento } from './orcamento.js';
export async function renderProjeto(container, id) {
  const p = await Projetos.obter(id);
  if (!p) { navegarPara('projetos'); return; }

  container.innerHTML = `
    <div class="page-header">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <button class="btn btn-secondary btn-sm" onclick="navegarPara('projetos')">← Projectos</button>
          ${badgeFase(p.fase)}
          ${p.concluido ? '<span class="badge badge-gray">Concluído</span>' : ''}
        </div>
        <h1 class="page-title">${p.nome}</h1>
        <p class="page-sub">${p.cliente || '—'} ${p.telefone ? '· ' + p.telefone : ''}</p>
      </div>
      <div style="display:flex;gap:8px;align-items:flex-start">
        <button class="btn btn-secondary btn-sm" id="btn-fase">Mudar fase ▾</button>
        ${!p.concluido ? `<button class="btn btn-primary btn-sm" id="btn-guardar-versao">Guardar versão</button>` : ''}
      </div>
    </div>

    <!-- Grid de 2 colunas -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">

      <!-- Notas -->
      <div class="card">
        <div class="card-header"><div class="card-title">Notas e informações</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Medidas da divisão</label>
            <textarea class="form-textarea" id="proj-medidas" placeholder="ex: 3.20m × 2.80m, pé-direito 2.60m...">${p.medidas || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Notas e observações</label>
            <textarea class="form-textarea" id="proj-notas" style="min-height:100px" placeholder="Preferências do cliente, restrições, ideias...">${p.notas || ''}</textarea>
          </div>
          <button class="btn btn-primary btn-sm" id="btn-guardar-notas">Guardar</button>
        </div>
      </div>

      <!-- Imagem 3D -->
      <div class="card">
        <div class="card-header"><div class="card-title">Desenho 3D aprovado</div></div>
        <div class="card-body">
          ${p.imagem3d ? `
            <img src="${p.imagem3d}" style="width:100%;border-radius:8px;margin-bottom:12px;border:1px solid var(--paper-3)">
            <button class="btn btn-secondary btn-sm" id="btn-trocar-3d">Substituir imagem</button>
          ` : `
            <div style="border:2px dashed var(--paper-3);border-radius:8px;padding:32px;text-align:center;cursor:pointer;transition:border-color .15s" id="drop-3d">
              <div style="font-size:24px;margin-bottom:8px;opacity:.3">◻</div>
              <div style="font-size:13px;color:var(--ink-3)">Clica para inserir o 3D aprovado</div>
              <div style="font-size:12px;color:var(--ink-4);margin-top:4px">PNG, JPG ou WEBP</div>
            </div>
          `}
          <input type="file" id="input-3d" accept="image/*" style="display:none">
        </div>
      </div>
    </div>

    <!-- Orçamento -->
    <div class="card mb-16">
      <div class="card-header"><div class="card-title">Orçamento</div></div>
      <div class="card-body" id="orc-container" style="padding:0;"></div>
    </div>

    <!-- Datas -->
    <div class="card mb-16">
      <div class="card-header">
        <div class="card-title">Datas do projecto</div>
        <button class="btn btn-secondary btn-sm" id="btn-add-data">+ Adicionar data</button>
      </div>
      <div class="card-body" id="lista-datas">
        ${renderDatas(p)}
      </div>
    </div>

    <!-- Ocorrências -->
    <div class="card mb-16">
      <div class="card-header">
        <div class="card-title">Ocorrências</div>
        <button class="btn btn-secondary btn-sm" id="btn-add-ocorrencia">+ Registar ocorrência</button>
      </div>
      <div class="card-body" id="lista-ocorrencias">
        ${renderOcorrencias(p)}
      </div>
    </div>

    <!-- Versões -->
    ${p.versoes?.length > 0 ? `
    <div class="card mb-16">
      <div class="card-header"><div class="card-title">Histórico de versões</div></div>
      <div class="card-body">
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${p.versoes.slice().reverse().map((v, i) => `
            <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--paper-2);border-radius:8px;border:1px solid var(--paper-3);">
              <span class="badge badge-gray">v${p.versoes.length - i}</span>
              <span style="font-size:13px;color:var(--ink-2);flex:1">${v.nota || 'Versão sem nota'}</span>
              <span style="font-size:11px;color:var(--ink-4);font-family:var(--mono)">${formatarDataCompleta(v.ts)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>` : ''}

    <!-- Fecho -->
    ${!p.concluido ? `
    <div class="card" style="border-color:var(--green-brd)">
      <div class="card-header" style="background:var(--green-lite)">
        <div class="card-title" style="color:var(--green)">Fechar projecto</div>
      </div>
      <div class="card-body">
        <p style="font-size:13px;color:var(--ink-2);margin-bottom:12px;">Só disponível quando todas as ocorrências estiverem resolvidas e o projecto tiver fotos da obra concluída.</p>
        <button class="btn btn-secondary btn-sm" id="btn-iniciar-fecho">Iniciar processo de fecho →</button>
      </div>
    </div>` : ''}
  `;

  bindEventsProjeto(p, container);

  // Inicializar orçamento
  const orcContainer = container.querySelector('#orc-container');
  if (orcContainer) renderOrcamento(orcContainer, p.id);
}

function renderDatas(p) {
  if (!p.datas?.length) return `<div class="empty-state" style="padding:20px"><div class="empty-state-sub">Sem datas definidas</div></div>`;
  return p.datas.map((d, i) => {
    const dias = diasAte(d.data);
    const alerta = dias !== null && dias <= 14;
    return `
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--paper-2);">
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500;color:var(--ink)">${d.descricao}</div>
          <div style="font-size:12px;color:var(--ink-3);font-family:var(--mono)">${d.data ? new Date(d.data).toLocaleDateString('pt-PT') : '—'}</div>
        </div>
        ${alerta ? `<span class="badge badge-red">⚡ ${dias}d</span>` : dias !== null ? `<span class="badge badge-gray">${dias}d</span>` : ''}
        <button class="btn btn-secondary btn-sm btn-rm-data" data-idx="${i}" style="padding:4px 8px;font-size:11px;">✕</button>
      </div>
    `;
  }).join('');
}

function renderOcorrencias(p) {
  if (!p.ocorrencias?.length) return `<div class="empty-state" style="padding:20px"><div class="empty-state-sub">Sem ocorrências registadas</div></div>`;
  return p.ocorrencias.map((o, i) => `
    <div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid var(--paper-2);">
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500;color:var(--ink);margin-bottom:2px">${o.titulo}</div>
        <div style="font-size:12px;color:var(--ink-3)">${o.descricao || ''}</div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <span class="badge ${o.resolvida ? 'badge-green' : 'badge-red'}">${o.resolvida ? 'Resolvida' : 'Por resolver'}</span>
          <span class="badge ${o.visivelCliente ? 'badge-blue' : 'badge-gray'}">${o.visivelCliente ? 'Visível ao cliente' : 'Interna'}</span>
        </div>
      </div>
      <button class="btn btn-secondary btn-sm btn-toggle-ocorrencia" data-idx="${i}" style="padding:4px 8px;font-size:11px;">${o.resolvida ? 'Reabrir' : 'Resolver'}</button>
    </div>
  `).join('');
}

function bindEventsProjeto(p, container) {
  container.querySelector('#btn-guardar-notas')?.addEventListener('click', async () => {
    p.notas   = document.getElementById('proj-notas').value;
    p.medidas = document.getElementById('proj-medidas').value;
    await Projetos.guardar(p);
    mostrarToast('Guardado', 'success');
  });

  const input3d = container.querySelector('#input-3d');
  const drop3d  = container.querySelector('#drop-3d') || container.querySelector('#btn-trocar-3d');
  drop3d?.addEventListener('click', () => input3d.click());
  input3d?.addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      p.imagem3d = ev.target.result;
      await Projetos.guardar(p);
      renderProjeto(container, p.id);
      mostrarToast('Imagem guardada', 'success');
    };
    reader.readAsDataURL(file);
  });

  container.querySelector('#btn-add-data')?.addEventListener('click', () => {
    abrirModalData(p, container);
  });

  container.querySelector('#btn-add-ocorrencia')?.addEventListener('click', () => {
    abrirModalOcorrencia(p, container);
  });

  container.querySelectorAll('.btn-rm-data').forEach(btn => {
    btn.addEventListener('click', async () => {
      p.datas.splice(parseInt(btn.dataset.idx), 1);
      await Projetos.guardar(p);
      container.querySelector('#lista-datas').innerHTML = renderDatas(p);
      bindDatasEvents(p, container);
    });
  });

  container.querySelectorAll('.btn-toggle-ocorrencia').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      p.ocorrencias[idx].resolvida = !p.ocorrencias[idx].resolvida;
      await Projetos.guardar(p);
      container.querySelector('#lista-ocorrencias').innerHTML = renderOcorrencias(p);
      bindOcorrenciasEvents(p, container);
    });
  });

  container.querySelector('#btn-guardar-versao')?.addEventListener('click', async () => {
    const nota = prompt('Nota para esta versão (opcional):') || '';
    p.versoes = p.versoes || [];
    p.versoes.push({ ts: Date.now(), nota, orcamento: JSON.parse(JSON.stringify(p.orcamento || [])) });
    await Projetos.guardar(p);
    mostrarToast(`v${p.versoes.length} guardada`, 'success');
    renderProjeto(container, p.id);
  });

  container.querySelector('#btn-fase')?.addEventListener('click', e => {
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu open';
    menu.style.cssText = 'position:absolute;z-index:200;';
    Object.entries(fases).filter(([k]) => k !== 'concluido').forEach(([key, val]) => {
      const item = document.createElement('div');
      item.className = 'dropdown-item';
      item.textContent = val.label;
      item.addEventListener('click', async () => {
        p.fase = key;
        await Projetos.guardar(p);
        menu.remove();
        mostrarToast('Fase actualizada', 'success');
        renderProjeto(container, p.id);
      });
      menu.appendChild(item);
    });
    e.currentTarget.parentElement.style.position = 'relative';
    e.currentTarget.parentElement.appendChild(menu);
    setTimeout(() => document.addEventListener('click', () => menu.remove(), { once: true }), 10);
  });

  container.querySelector('#btn-iniciar-fecho')?.addEventListener('click', () => {
    abrirModalFecho(p, container);
  });
}

function bindDatasEvents(p, container) {
  container.querySelectorAll('.btn-rm-data').forEach(btn => {
    btn.addEventListener('click', async () => {
      p.datas.splice(parseInt(btn.dataset.idx), 1);
      await Projetos.guardar(p);
      container.querySelector('#lista-datas').innerHTML = renderDatas(p);
      bindDatasEvents(p, container);
    });
  });
}

function bindOcorrenciasEvents(p, container) {
  container.querySelectorAll('.btn-toggle-ocorrencia').forEach(btn => {
    btn.addEventListener('click', async () => {
      const idx = parseInt(btn.dataset.idx);
      p.ocorrencias[idx].resolvida = !p.ocorrencias[idx].resolvida;
      await Projetos.guardar(p);
      container.querySelector('#lista-ocorrencias').innerHTML = renderOcorrencias(p);
      bindOcorrenciasEvents(p, container);
    });
  });
}

function abrirModalData(p, container) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal" style="max-width:400px">
      <div class="modal-header"><div class="modal-title">Adicionar data</div></div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Descrição *</label>
          <input class="form-input" id="md-desc" placeholder="ex: Entrega de material">
        </div>
        <div class="form-group">
          <label class="form-label">Data *</label>
          <input class="form-input" id="md-data" type="date">
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-cancel">Cancelar</button>
        <button class="btn btn-primary btn-confirm">Adicionar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.btn-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.btn-confirm').addEventListener('click', async () => {
    const desc = overlay.querySelector('#md-desc').value.trim();
    const data = overlay.querySelector('#md-data').value;
    if (!desc || !data) return;
    p.datas = p.datas || [];
    p.datas.push({ descricao: desc, data });
    await Projetos.guardar(p);
    overlay.remove();
    container.querySelector('#lista-datas').innerHTML = renderDatas(p);
    bindDatasEvents(p, container);
    mostrarToast('Data adicionada', 'success');
  });
}

function abrirModalOcorrencia(p, container) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal" style="max-width:460px">
      <div class="modal-header"><div class="modal-title">Registar ocorrência</div></div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Título *</label>
          <input class="form-input" id="oc-titulo" placeholder="ex: Rodapé danificado na entrega">
        </div>
        <div class="form-group">
          <label class="form-label">Descrição</label>
          <textarea class="form-textarea" id="oc-desc" placeholder="Detalha o que aconteceu..."></textarea>
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:var(--ink-2)">
            <input type="checkbox" id="oc-visivel"> Visível ao cliente no link
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-cancel">Cancelar</button>
        <button class="btn btn-primary btn-confirm">Registar</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('.btn-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.btn-confirm').addEventListener('click', async () => {
    const titulo = overlay.querySelector('#oc-titulo').value.trim();
    if (!titulo) return;
    p.ocorrencias = p.ocorrencias || [];
    p.ocorrencias.push({
      titulo,
      descricao: overlay.querySelector('#oc-desc').value.trim(),
      visivelCliente: overlay.querySelector('#oc-visivel').checked,
      resolvida: false,
      ts: Date.now(),
    });
    await Projetos.guardar(p);
    overlay.remove();
    container.querySelector('#lista-ocorrencias').innerHTML = renderOcorrencias(p);
    bindOcorrenciasEvents(p, container);
    mostrarToast('Ocorrência registada', 'success');
  });
}

function abrirModalFecho(p, container) {
  const ocAbertas = (p.ocorrencias || []).filter(o => !o.resolvida);
  if (ocAbertas.length > 0) {
    alert(`Tens ${ocAbertas.length} ocorrência(s) por resolver. Resolve-as antes de fechar o projecto.`);
    return;
  }
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay open';
  overlay.innerHTML = `
    <div class="modal" style="max-width:480px">
      <div class="modal-header"><div class="modal-title" style="font-family:var(--serif)">Fechar projecto ◎</div></div>
      <div class="modal-body">
        <p style="font-size:13px;color:var(--ink-2);margin-bottom:16px;">Todas as condições verificadas. Adiciona as fotos da obra concluída para finalizar.</p>
        <div class="form-group">
          <label class="form-label">Fotos da obra concluída *</label>
          <div style="border:2px dashed var(--paper-3);border-radius:8px;padding:20px;text-align:center;cursor:pointer" id="drop-fotos">
            <div style="font-size:13px;color:var(--ink-3)">Clica para adicionar fotos</div>
          </div>
          <input type="file" id="input-fotos" accept="image/*" multiple style="display:none">
          <div id="preview-fotos" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;"></div>
        </div>
        <div class="form-group">
          <label class="form-label">Nota final do projecto</label>
          <textarea class="form-textarea" id="fecho-nota" placeholder="Reflexão sobre o projecto, aprendizagens, observações..."></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-cancel">Cancelar</button>
        <button class="btn btn-primary btn-confirm" style="background:var(--green-mid)">Concluir projecto</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  let fotosBase64 = [];
  overlay.querySelector('#drop-fotos').addEventListener('click', () => overlay.querySelector('#input-fotos').click());
  overlay.querySelector('#input-fotos').addEventListener('change', e => {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        fotosBase64.push(ev.target.result);
        const img = document.createElement('img');
        img.src = ev.target.result;
        img.style.cssText = 'width:64px;height:64px;object-fit:cover;border-radius:6px;border:1px solid var(--paper-3)';
        overlay.querySelector('#preview-fotos').appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
  overlay.querySelector('.btn-cancel').addEventListener('click', () => overlay.remove());
  overlay.querySelector('.btn-confirm').addEventListener('click', async () => {
    if (fotosBase64.length === 0) { alert('Adiciona pelo menos uma foto da obra concluída.'); return; }
    p.fotos     = fotosBase64;
    p.notaFinal = overlay.querySelector('#fecho-nota').value.trim();
    p.concluido = true;
    p.fase      = 'concluido';
    p.fechadoEm = Date.now();
    await Projetos.guardar(p);
    overlay.remove();
    mostrarToast('Projecto concluído ◎', 'success');
    renderProjeto(container, p.id);
  });
}

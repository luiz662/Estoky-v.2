/**
 * STOCKSYS — app.js
 * Lógica principal do sistema de estoque
 * Armazenamento: localStorage | Sem dependências externas
 */

/* ══════════════════════════════════════════
   STORAGE — Gerenciamento de dados
══════════════════════════════════════════ */
const DB_KEY = 'stocksys_produtos';

function getProducts() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
  catch { return []; }
}

function saveProducts(products) {
  localStorage.setItem(DB_KEY, JSON.stringify(products));
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/* ══════════════════════════════════════════
   HOME PAGE — Dashboard
══════════════════════════════════════════ */
function initHome() {
  if (!document.getElementById('stat-total')) return;

  updateHomeStats();
  renderHomeProductList();
  renderCategoryChart();
  animateCounters();
}

function updateHomeStats() {
  const products = getProducts();
  const totalQty = products.reduce((s, p) => s + Number(p.quantidade || 0), 0);
  const categorias = new Set(products.map(p => p.categoria)).size;
  const valor = products.reduce((s, p) => s + (Number(p.precoVenda || 0) * Number(p.quantidade || 0)), 0);

  document.getElementById('stat-total').textContent = products.length;
  document.getElementById('stat-categorias').textContent = categorias;
  document.getElementById('stat-estoque').textContent = totalQty;
  document.getElementById('stat-valor').textContent = 'R$ ' + valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function animateCounters() {
  document.querySelectorAll('.stat-value').forEach(el => {
    const raw = el.textContent;
    const isNumber = /^[\d.,]+$/.test(raw.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
    if (!isNumber) return;
    el.style.opacity = 0;
    setTimeout(() => {
      el.style.transition = 'opacity 0.4s';
      el.style.opacity = 1;
    }, 200);
  });
}

function renderHomeProductList() {
  const container = document.getElementById('home-product-list');
  if (!container) return;
  const products = getProducts().slice(-5).reverse();

  if (!products.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">◌</span>
        <p>Nenhum produto cadastrado ainda.</p>
        <a href="registro.html" class="btn-mini">Cadastrar agora</a>
      </div>`;
    return;
  }

  container.innerHTML = products.map(p => {
    const status = getStatus(p);
    const statusColor = { ok: '#00ff99', low: '#ffb700', zero: '#ff3a5e' }[status];
    return `
      <div class="product-row">
        <span class="prod-name">${esc(p.nome)}</span>
        <span class="prod-code">${esc(p.codigo)}</span>
        <span class="prod-cat">${esc(p.categoria)}</span>
        <span class="prod-qty" style="color:${statusColor}">${p.quantidade} ${p.unidade || 'un'}</span>
        <span class="badge badge-${status}">${{ ok: 'OK', low: 'BAIXO', zero: 'ZERO' }[status]}</span>
      </div>`;
  }).join('');

  // Alertas
  const products_all = getProducts();
  const low = products_all.filter(p => Number(p.quantidade) > 0 && Number(p.quantidade) <= Number(p.minimo || 5));
  const zero = products_all.filter(p => Number(p.quantidade) === 0);

  const alertEl = document.getElementById('alert-low');
  if (alertEl) {
    if (zero.length > 0) alertEl.textContent = `${zero.length} produto(s) sem estoque`;
    else if (low.length > 0) alertEl.textContent = `${low.length} produto(s) com estoque baixo`;
    else alertEl.textContent = 'Estoque dentro do esperado';
  }
}

function renderCategoryChart() {
  const canvas = document.getElementById('chart-categorias');
  if (!canvas) return;
  const products = getProducts();
  if (!products.length) { canvas.style.display = 'none'; return; }

  const catMap = {};
  products.forEach(p => { catMap[p.categoria] = (catMap[p.categoria] || 0) + 1; });
  const labels = Object.keys(catMap);
  const values = Object.values(catMap);
  const colors = ['#00d4ff','#7b2fff','#00ff99','#ffb700','#ff3a5e','#ff6b35','#a0f0ff'];

  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.parentElement.offsetWidth - 48;
  const H = canvas.height = 160;
  const cx = W / 2, cy = H / 2 - 10, r = Math.min(cx, cy) - 10;

  ctx.clearRect(0, 0, W, H);
  const total = values.reduce((a, b) => a + b, 0);
  let startAngle = -Math.PI / 2;

  values.forEach((v, i) => {
    const slice = (v / total) * 2 * Math.PI;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = colors[i % colors.length];
    ctx.shadowColor = colors[i % colors.length];
    ctx.shadowBlur = 8;
    ctx.fill();
    startAngle += slice;
  });

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.52, 0, 2 * Math.PI);
  ctx.fillStyle = '#0b1525';
  ctx.shadowBlur = 0;
  ctx.fill();

  // Center text
  ctx.fillStyle = '#00d4ff';
  ctx.font = `bold 18px 'Orbitron', sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(total, cx, cy + 4);
  ctx.fillStyle = '#4a6a8a';
  ctx.font = `10px 'Share Tech Mono', monospace`;
  ctx.fillText('PRODUTOS', cx, cy + 18);

  // Legend
  const legend = document.getElementById('chart-legend');
  if (legend) {
    legend.innerHTML = labels.map((l, i) => `
      <div class="legend-item">
        <div class="legend-color" style="background:${colors[i % colors.length]}"></div>
        <span>${l} (${values[i]})</span>
      </div>`).join('');
  }
}

/* ══════════════════════════════════════════
   REGISTRO PAGE — CRUD
══════════════════════════════════════════ */
let deleteTarget = null;

function initRegistro() {
  const form = document.getElementById('product-form');
  if (!form) return;

  renderTable();
  populateCategoryFilter();

  form.addEventListener('submit', handleSubmit);
  document.getElementById('search-input').addEventListener('input', renderTable);
  document.getElementById('filter-categoria').addEventListener('change', renderTable);
  document.getElementById('filter-status').addEventListener('change', renderTable);
}

function handleSubmit(e) {
  e.preventDefault();
  const msg = document.getElementById('form-msg');
  msg.className = 'form-msg';

  const nome     = val('prod-nome').trim();
  const codigo   = val('prod-codigo').trim();
  const categoria = val('prod-categoria');
  const quantidade = val('prod-quantidade');

  if (!nome || !codigo || !categoria || quantidade === '') {
    showMsg(msg, 'error', '⚠ Preencha todos os campos obrigatórios (*).');
    return;
  }

  const products = getProducts();
  const editId = val('edit-id');

  if (editId) {
    // UPDATE
    const idx = products.findIndex(p => p.id === editId);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...buildProduct() };
      saveProducts(products);
      showMsg(msg, 'success', '✓ Produto atualizado com sucesso!');
      cancelEdit();
    }
  } else {
    // CREATE — check duplicate code
    if (products.find(p => p.codigo.toLowerCase() === codigo.toLowerCase())) {
      showMsg(msg, 'error', '⚠ Já existe um produto com esse código.');
      return;
    }
    const product = { id: genId(), criadoEm: new Date().toISOString(), ...buildProduct() };
    products.unshift(product);
    saveProducts(products);
    showMsg(msg, 'success', '✓ Produto cadastrado com sucesso!');
    e.target.reset();
  }

  renderTable();
  populateCategoryFilter();
  updateHomeStats && updateHomeStats();
}

function buildProduct() {
  return {
    nome:       val('prod-nome').trim(),
    codigo:     val('prod-codigo').trim(),
    categoria:  val('prod-categoria'),
    unidade:    val('prod-unidade') || 'un',
    quantidade: Number(val('prod-quantidade')) || 0,
    minimo:     Number(val('prod-minimo')) || 5,
    precoCusto: Number(val('prod-preco-custo')) || 0,
    precoVenda: Number(val('prod-preco-venda')) || 0,
    fornecedor: val('prod-fornecedor').trim(),
    descricao:  val('prod-descricao').trim(),
    atualizadoEm: new Date().toISOString(),
  };
}

function renderTable() {
  const tbody = document.getElementById('product-tbody');
  if (!tbody) return;

  const search = (document.getElementById('search-input')?.value || '').toLowerCase();
  const catFilter = document.getElementById('filter-categoria')?.value || '';
  const statusFilter = document.getElementById('filter-status')?.value || '';

  let products = getProducts().filter(p => {
    const matchSearch = !search ||
      p.nome.toLowerCase().includes(search) ||
      p.codigo.toLowerCase().includes(search) ||
      (p.categoria || '').toLowerCase().includes(search) ||
      (p.fornecedor || '').toLowerCase().includes(search);
    const matchCat = !catFilter || p.categoria === catFilter;
    const matchStatus = !statusFilter || getStatus(p) === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  document.getElementById('table-count').textContent = `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`;

  if (!products.length) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7"><div class="empty-state"><span class="empty-icon">◌</span><p>Nenhum produto encontrado.</p></div></td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => {
    const status = getStatus(p);
    const statusLabel = { ok: 'Normal', low: 'Estoque Baixo', zero: 'Sem Estoque' }[status];
    const preco = p.precoVenda ? 'R$ ' + Number(p.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—';
    return `
      <tr>
        <td class="code-cell">${esc(p.codigo)}</td>
        <td>${esc(p.nome)}</td>
        <td class="cat-cell">${esc(p.categoria)}</td>
        <td>${p.quantidade} ${p.unidade || 'un'}</td>
        <td>${preco}</td>
        <td><span class="badge badge-${status}">${statusLabel}</span></td>
        <td>
          <button class="action-btn" onclick="editProduct('${p.id}')">✏ Editar</button>
          <button class="action-btn del" onclick="confirmDelete('${p.id}', '${esc(p.nome)}')">✕ Excluir</button>
        </td>
      </tr>`;
  }).join('');
}

function editProduct(id) {
  const products = getProducts();
  const p = products.find(x => x.id === id);
  if (!p) return;

  setVal('edit-id', p.id);
  setVal('prod-nome', p.nome);
  setVal('prod-codigo', p.codigo);
  setVal('prod-categoria', p.categoria);
  setVal('prod-unidade', p.unidade);
  setVal('prod-quantidade', p.quantidade);
  setVal('prod-minimo', p.minimo);
  setVal('prod-preco-custo', p.precoCusto);
  setVal('prod-preco-venda', p.precoVenda);
  setVal('prod-fornecedor', p.fornecedor);
  setVal('prod-descricao', p.descricao);

  document.getElementById('form-title').textContent = 'EDITAR PRODUTO';
  document.getElementById('btn-submit').textContent = 'SALVAR ALTERAÇÕES';
  document.getElementById('btn-cancel').style.display = 'inline-flex';
  document.querySelector('.form-panel').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  document.getElementById('product-form').reset();
  setVal('edit-id', '');
  document.getElementById('form-title').textContent = 'CADASTRAR PRODUTO';
  document.getElementById('btn-submit').textContent = 'SALVAR PRODUTO';
  document.getElementById('btn-cancel').style.display = 'none';
  document.getElementById('form-msg').className = 'form-msg';
}

function confirmDelete(id, nome) {
  deleteTarget = id;
  document.getElementById('modal-msg').innerHTML = `Tem certeza que deseja remover <strong>"${esc(nome)}"</strong>?<br/>Esta ação não pode ser desfeita.`;
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('btn-confirm-delete').onclick = () => {
    const products = getProducts().filter(p => p.id !== deleteTarget);
    saveProducts(products);
    closeModal();
    renderTable();
    populateCategoryFilter();
  };
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  deleteTarget = null;
}

function populateCategoryFilter() {
  const sel = document.getElementById('filter-categoria');
  if (!sel) return;
  const cats = [...new Set(getProducts().map(p => p.categoria))].filter(Boolean).sort();
  const current = sel.value;
  sel.innerHTML = '<option value="">TODAS AS CATEGORIAS</option>' +
    cats.map(c => `<option value="${esc(c)}" ${c === current ? 'selected' : ''}>${esc(c)}</option>`).join('');
}

/* ══════════════════════════════════════════
   EXPORT CSV
══════════════════════════════════════════ */
function exportData() {
  const products = getProducts();
  if (!products.length) { alert('Nenhum produto para exportar.'); return; }

  const headers = ['ID','Nome','Código','Categoria','Unidade','Quantidade','Estoque Mínimo','Preço Custo','Preço Venda','Fornecedor','Descrição','Criado Em'];
  const rows = products.map(p => [
    p.id, p.nome, p.codigo, p.categoria, p.unidade, p.quantidade,
    p.minimo, p.precoCusto, p.precoVenda, p.fornecedor, p.descricao,
    new Date(p.criadoEm).toLocaleDateString('pt-BR')
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `stocksys_export_${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}


/* ══════════════════════════════════════════
   UTILITÁRIOS
══════════════════════════════════════════ */
function getStatus(p) {
  const qty = Number(p.quantidade);
  const min = Number(p.minimo) || 5;
  if (qty === 0) return 'zero';
  if (qty <= min) return 'low';
  return 'ok';
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function setVal(id, v) {
  const el = document.getElementById(id);
  if (el) el.value = v ?? '';
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showMsg(el, type, text) {
  el.className = `form-msg ${type}`;
  el.textContent = text;
  setTimeout(() => { el.className = 'form-msg'; }, 5000);
}

/* ══════════════════════════════════════════
   INIT — Detecta página e inicializa
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initHome();
  initRegistro();
});

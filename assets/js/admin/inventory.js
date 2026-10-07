/* =========================================================
   AUTOCARE — admin/inventory.js
   Inventory dashboard (SKU level): value, low/out-of-stock,
   search & filters, stock adjustment with reason, edit /
   delete, add product, CSV export.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store, H = AC.data.productHelpers;

  function adjust(r, onDone) {
    const m = AC.ui.modal({
      title: 'Stock adjustment', sub: r.p.title + ' · ' + r.v.label, size: 'sm',
      body: '<div class="flex items-center gap-12 mb-16"><div class="thumb" style="width:56px;height:56px">' + AC.art.product(r.p) + '</div><div><div class="xs muted">Current stock</div><div class="h3" data-cur>' + r.v.stock + '</div></div><div class="ml-auto text-right"><div class="xs muted">After</div><div class="h3 text-blue" data-after>' + r.v.stock + '</div></div></div>' +
        '<form class="col gap-12" data-f><div class="seg w-full" data-type style="display:flex"><button type="button" class="active grow" data-value="in">Stock in (+)</button><button type="button" class="grow" data-value="out">Stock out (−)</button><button type="button" class="grow" data-value="set">Set count</button></div>' +
        AC.ui.field('Quantity', '<div class="qty" style="width:100%"><button type="button" data-d="-1" aria-label="Decrease">' + AC.icon('minus') + '</button><input type="number" min="0" value="1" name="qty" style="flex:1;width:auto"><button type="button" data-d="1" aria-label="Increase">' + AC.icon('plus') + '</button></div>') +
        AC.ui.field('Reason', AC.ui.select('reason', ['Supplier delivery', 'Customer return', 'Physical count correction', 'Damaged / defective', 'Used in service', 'Transfer to branch'], 'Supplier delivery')) +
        AC.ui.field('Reference (PO / DR no.)', '<input class="input" name="ref" placeholder="e.g. DR-55821">') + '</form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>Apply adjustment</button>'
    });
    let type = 'in';
    const f = m.el.querySelector('[data-f]');
    const calc = () => { const q = Math.max(0, +f.qty.value || 0); const after = type === 'in' ? r.v.stock + q : type === 'out' ? Math.max(0, r.v.stock - q) : q; m.el.querySelector('[data-after]').textContent = after; return after; };
    AC.ui.tabs(m.el.querySelector('[data-type]'), (v) => { type = v; f.reason.value = v === 'in' ? 'Supplier delivery' : v === 'out' ? 'Damaged / defective' : 'Physical count correction'; calc(); });
    m.el.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => { f.qty.value = Math.max(0, (+f.qty.value || 0) + +b.dataset.d); calc(); }));
    f.qty.oninput = calc;
    m.el.querySelector('[data-s]').onclick = () => { const after = calc(); const delta = after - r.v.stock; if (!delta) return AC.ui.toast('No change to apply', null, 'info'); st.adjustStock(r.p.id, r.v.key, delta, f.reason.value + (f.ref.value ? ' · ' + f.ref.value : '')); m.close(); AC.ui.toast('Stock updated', r.v.label + ': ' + (delta > 0 ? '+' : '') + delta + ' → ' + after, 'success'); onDone(); };
  }
  AC.stockAdjust = adjust;

  AC.adminViews.inventory = function (el) {
    const qs = u.qsParam('status');
    const f = { q: '', cat: '', brand: '', status: qs === 'Low' ? 'Low Stock' : qs || '' };
    el.innerHTML = AC.shell.pageHead('Inventory', 'Stock levels across all SKUs and suppliers.', '<button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export</button><button class="btn btn-primary" data-add>' + AC.icon('plus') + 'Add Product</button>') +
      '<div class="grid-4 mb-20" data-kpi></div><div class="card"><div class="tabs" style="padding:0 12px" data-tabs></div>' +
      AC.kit.toolbar({ placeholder: 'Search product, SKU, supplier…', filters: AC.ui.select('cat', [{ value: '', label: 'All categories' }].concat(AC.data.categories.map((c) => ({ value: c.id, label: c.name }))), '', 'data-cat aria-label="Category"') + '<select class="select" data-brand aria-label="Brand"></select>' }) + '<div data-t></div></div>';
    const t = AC.kit.table(el.querySelector('[data-t]'), {
      per: 12, empty: ['archive', 'No SKUs match', 'Adjust your filters.'],
      columns: [
        { label: 'Product', main: true, render: (r) => '<div class="cell-main"><div class="thumb">' + AC.art.product(r.p) + '</div><div style="min-width:0"><div class="cell-title truncate" style="max-width:240px">' + u.esc(r.p.title) + '</div><div class="cell-sub mono">' + u.esc(r.v.label) + '</div></div></div>', sort: (r) => r.p.title },
        { label: 'SKU', render: (r) => '<span class="mono xs">' + u.esc(r.v.sku) + '</span>', sort: (r) => r.v.sku },
        { label: 'Category', render: (r) => '<span class="small">' + H.catName(r.p.cat) + '</span>', sort: (r) => r.p.cat },
        { label: 'Brand', render: (r) => u.esc(r.p.brand), sort: (r) => r.p.brand },
        { label: 'Stock', render: (r) => '<div style="min-width:90px"><b>' + r.v.stock + '</b><div class="progress mt-4" style="height:5px"><div class="progress-bar ' + (r.status === 'In Stock' ? 'green' : r.status === 'Low Stock' ? 'orange' : 'red') + '" style="width:' + Math.min(100, r.v.stock / Math.max(1, (r.p.minStock || 4) * 4) * 100) + '%"></div></div></div>', sort: (r) => r.v.stock },
        { label: 'Min', cls: 'num', render: (r) => r.p.minStock || 4 },
        { label: 'Price', cls: 'num', render: (r) => u.peso(r.v.price), sort: (r) => r.v.price },
        { label: 'Supplier', render: (r) => '<span class="small">' + u.esc(r.p.supplier) + '</span>', sort: (r) => r.p.supplier },
        { label: 'Status', render: (r) => AC.ui.badge(r.status), sort: (r) => ['Out of Stock', 'Low Stock', 'In Stock'].indexOf(r.status) },
        { label: '', cls: 'text-right', render: (r) => '<div class="actions"><button class="btn btn-soft btn-sm" data-adj="' + u.esc(r.p.id + '|' + r.v.key) + '">' + AC.icon('refresh') + 'Adjust</button><button class="btn btn-ghost btn-icon btn-sm" data-edit="' + r.p.id + '" aria-label="Edit">' + AC.icon('edit') + '</button><button class="btn btn-danger-ghost btn-icon btn-sm" data-del="' + u.esc(r.p.id + '|' + r.v.key) + '" aria-label="Delete">' + AC.icon('trash') + '</button></div>' }
      ]
    });
    function brands() { const b = Array.from(new Set(st.s.products.filter((p) => !f.cat || p.cat === f.cat).map((p) => p.brand))).sort(); el.querySelector('[data-brand]').innerHTML = '<option value="">All brands</option>' + b.map((x) => '<option>' + u.esc(x) + '</option>').join(''); f.brand = ''; }
    const rows = () => st.inventoryRows().filter((r) => (!f.cat || r.p.cat === f.cat) && (!f.brand || r.p.brand === f.brand) && (!f.status || r.status === f.status) && u.match([r.p.title, r.v.sku, r.v.label, r.p.supplier], f.q));
    function draw(keep) {
      const all = st.inventoryRows();
      const value = u.sum(all, (r) => r.v.stock * r.v.price * .72);
      el.querySelector('[data-kpi]').innerHTML = AC.ui.statCard({ label: 'Total SKUs', value: u.num(all.length), icon: 'archive', foot: st.s.products.length + ' products' }) +
        AC.ui.statCard({ label: 'Inventory value (cost)', value: u.pesoShort(value), icon: 'wallet', foot: u.num(u.sum(all, (r) => r.v.stock)) + ' units on hand' }) +
        AC.ui.statCard({ label: 'Low stock', value: all.filter((r) => r.status === 'Low Stock').length, icon: 'alert', foot: 'At or below minimum' }) +
        AC.ui.statCard({ label: 'Out of stock', value: all.filter((r) => r.status === 'Out of Stock').length, icon: 'x-circle', foot: 'Reorder recommended' });
      el.querySelector('[data-tabs]').innerHTML = [['', 'All'], ['In Stock', 'In Stock'], ['Low Stock', 'Low Stock'], ['Out of Stock', 'Out of Stock']].map((x) => '<button class="tab ' + (f.status === x[0] ? 'active' : '') + '" data-tab="' + x[0] + '">' + x[1] + ' <span class="count">' + (x[0] ? all.filter((r) => r.status === x[0]).length : all.length) + '</span></button>').join('');
      t.set(rows(), keep);
    }
    brands();
    AC.ui.tabs(el.querySelector('[data-tabs]'), (v) => { f.status = v; draw(); });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); draw(); }, 150));
    el.querySelector('[data-cat]').onchange = (e) => { f.cat = e.target.value; brands(); draw(); };
    el.querySelector('[data-brand]').onchange = (e) => { f.brand = e.target.value; draw(); };
    el.addEventListener('click', async (e) => {
      const a = e.target.closest('[data-adj]'); if (a) { const [pid, vk] = a.dataset.adj.split('|'); adjust({ p: st.product(pid), v: st.variant(pid, vk) }, () => draw(true)); }
      const ed = e.target.closest('[data-edit]'); if (ed) AC.productForm(st.product(ed.dataset.edit), () => draw(true));
      const dl = e.target.closest('[data-del]');
      if (dl) { const [pid, vk] = dl.dataset.del.split('|'); const p = st.product(pid); if (await AC.ui.confirm({ title: 'Delete SKU?', message: '<b>' + u.esc(p.title) + ' · ' + u.esc(vk) + '</b> will be removed from inventory and the shop.', danger: true, confirmText: 'Delete' })) { p.variants = p.variants.filter((v) => v.key !== vk); if (!p.variants.length) st.s.products = st.s.products.filter((x) => x.id !== pid); st.log('Admin', st.s.staff.name, 'Deleted SKU', p.title + ' ' + vk); st.save(); AC.ui.toast('SKU deleted', null, 'success'); draw(true); } }
      if (e.target.closest('[data-add]')) AC.productForm(null, () => draw());
      if (e.target.closest('[data-export]')) AC.kit.csv('inventory', ['Product', 'Variant', 'SKU', 'Category', 'Brand', 'Stock', 'Min Stock', 'Price', 'Supplier', 'Status'], rows().map((r) => [r.p.title, r.v.label, r.v.sku, H.catName(r.p.cat), r.p.brand, r.v.stock, r.p.minStock, r.v.price, r.p.supplier, r.status]));
    });
    draw();
  };
})();

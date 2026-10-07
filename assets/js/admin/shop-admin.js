/* =========================================================
   AUTOCARE — admin/shop-admin.js
   Shop administration: categories, brands, bulk pricing,
   promotions, vehicle compatibility (fitment database),
   tire size matrix and wheel specification coverage.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store, H = AC.data.productHelpers, VD = AC.data.vehicles;
  const TABS = [['categories', 'Categories', 'grid'], ['brands', 'Brands', 'tag'], ['pricing', 'Prices', 'wallet'], ['promos', 'Promotions', 'percent'], ['compat', 'Vehicle Compatibility', 'car'], ['tires', 'Tire Sizes', 'tire'], ['wheels', 'Wheel Specs', 'wheel']];

  AC.adminViews.shop = function (el) {
    let tab = u.qsParam('tab') || 'categories';
    const S = st.s;
    const shopRev = u.sum(S.orders.filter((o) => o.status !== 'Cancelled'), (o) => o.total);
    el.innerHTML = AC.shell.pageHead('Shop', 'Manage what customers see in the AutoCare Shop.', '<a class="btn btn-outline" href="#/orders">' + AC.icon('bag') + 'Orders</a><a class="btn btn-outline" href="#/inventory">' + AC.icon('archive') + 'Stock</a><a class="btn btn-primary" href="#/products">' + AC.icon('box') + 'Products</a>') +
      '<div class="grid-4 mb-20">' + AC.ui.statCard({ label: 'Products', value: S.products.length, icon: 'box', foot: st.inventoryRows().length + ' SKUs' }) + AC.ui.statCard({ label: 'Brands', value: new Set(S.products.map((p) => p.brand)).size, icon: 'tag', foot: AC.data.categories.length + ' categories' }) +
      AC.ui.statCard({ label: 'Shop revenue', value: u.pesoShort(shopRev), icon: 'wallet', foot: S.orders.length + ' orders' }) + AC.ui.statCard({ label: 'Active promotions', value: S.promotions.filter((p) => p.status === 'Active').length, icon: 'percent', foot: 'Running now' }) + '</div>' +
      '<div class="card"><div class="tabs" style="padding:0 12px" data-tabs>' + TABS.map((t) => '<button class="tab ' + (t[0] === tab ? 'active' : '') + '" data-tab="' + t[0] + '">' + AC.icon(t[2]) + t[1] + '</button>').join('') + '</div><div data-panel class="tab-panel"></div></div>';
    const P = el.querySelector('[data-panel]');

    const views = {
      categories() {
        S.shopCats = S.shopCats || {};
        P.innerHTML = '<div class="card-body"><div class="grid-auto" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">' + AC.data.categories.map((c) => { const ps = S.products.filter((p) => p.cat === c.id); const on = S.shopCats[c.id] !== false; return '<div class="card card-hover" style="padding:16px;display:flex;gap:12px;align-items:center"><div class="thumb" style="width:56px;height:56px">' + AC.art.product(ps[0]) + '</div><div class="grow" style="min-width:0"><div class="strong">' + c.name + '</div><div class="xs muted">' + ps.length + ' products · ' + u.num(u.sum(ps, H.totalStock)) + ' units</div></div><label class="switch"><input type="checkbox" data-cat="' + c.id + '" ' + (on ? 'checked' : '') + ' aria-label="Visible in shop"><span class="switch-track"></span></label></div>'; }).join('') + '</div></div>';
        P.onchange = (e) => { const c = e.target.closest('[data-cat]'); if (!c) return; S.shopCats[c.dataset.cat] = c.checked; st.save(); AC.ui.toast(H.catName(c.dataset.cat) + (c.checked ? ' visible' : ' hidden') + ' in shop', null, 'success'); };
      },
      brands() {
        const g = u.groupBy(S.products, (p) => p.brand);
        const list = Object.keys(g).sort().map((b) => ({ b, n: g[b].length, cats: Array.from(new Set(g[b].map((p) => H.catName(p.cat)))).join(', '), stock: u.sum(g[b], H.totalStock), rating: u.sum(g[b], (p) => p.rating) / g[b].length }));
        P.innerHTML = '<div data-t></div>';
        AC.kit.table(P.querySelector('[data-t]'), { per: 12, columns: [
          { label: 'Brand', main: true, render: (r) => '<div class="cell-main"><span class="avatar avatar-sm c' + (u.hash(r.b) % 6) + '">' + u.esc(r.b.slice(0, 2).toUpperCase()) + '</span><b>' + u.esc(r.b) + '</b></div>', sort: (r) => r.b },
          { label: 'Categories', render: (r) => '<span class="small muted">' + r.cats + '</span>' },
          { label: 'Products', cls: 'num', render: (r) => r.n, sort: (r) => r.n },
          { label: 'Units', cls: 'num', render: (r) => u.num(r.stock), sort: (r) => r.stock },
          { label: 'Avg rating', render: (r) => '<span class="rating">' + AC.icon('star') + r.rating.toFixed(1) + '</span>', sort: (r) => r.rating },
          { label: '', cls: 'text-right', render: (r) => '<a class="btn btn-ghost btn-sm" href="#/products">View products</a>' }] }).set(list);
      },
      pricing() {
        const brands = Array.from(new Set(S.products.map((p) => p.brand))).sort();
        P.innerHTML = '<div class="card-body"><div class="alert mb-16">' + AC.icon('info') + '<div>Bulk-update prices by category and/or brand. Changes apply instantly to the shop.</div></div><form class="form-grid-3" data-f style="max-width:820px">' +
          AC.ui.field('Category', AC.ui.select('cat', [{ value: '', label: 'All categories' }].concat(AC.data.categories.map((c) => ({ value: c.id, label: c.name }))), '')) + AC.ui.field('Brand', AC.ui.select('brand', [{ value: '', label: 'All brands' }].concat(brands), '')) +
          AC.ui.field('Adjustment', '<div class="flex gap-8">' + AC.ui.select('dir', [{ value: '1', label: 'Increase' }, { value: '-1', label: 'Decrease' }], '1', 'style="width:120px"') + '<input class="input" type="number" min="0" max="50" step="0.5" name="pct" value="5" aria-label="Percent"><span class="center muted">%</span></div>') +
          '</form><div class="flex items-center gap-12 mt-16 wrap"><button class="btn btn-primary" data-apply>' + AC.icon('check') + 'Apply price update</button><span class="small muted" data-aff></span></div></div>';
        const f = P.querySelector('[data-f]');
        const aff = () => S.products.filter((p) => (!f.cat.value || p.cat === f.cat.value) && (!f.brand.value || p.brand === f.brand.value));
        const upd = () => { const a = aff(); P.querySelector('[data-aff]').textContent = a.length + ' products · ' + u.sum(a, (p) => p.variants.length) + ' SKUs affected'; };
        f.oninput = f.onchange = upd; upd();
        P.querySelector('[data-apply]').onclick = async () => {
          const a = aff(), pct = (+f.pct.value || 0) * +f.dir.value / 100;
          if (!pct) return AC.ui.toast('Enter a percentage', null, 'warning');
          if (!(await AC.ui.confirm({ title: 'Update ' + a.length + ' products?', message: 'Prices will ' + (pct > 0 ? 'increase' : 'decrease') + ' by ' + Math.abs(pct * 100) + '%, rounded to the nearest ₱50.', confirmText: 'Apply' }))) return;
          a.forEach((p) => p.variants.forEach((v) => { v.price = Math.max(50, Math.round(v.price * (1 + pct) / 50) * 50); }));
          st.log('Admin', S.staff.name, 'Bulk price update ' + (pct > 0 ? '+' : '') + (pct * 100) + '%', a.length + ' products'); st.save(); AC.ui.toast('Prices updated', a.length + ' products', 'success');
        };
      },
      promos() {
        P.innerHTML = '<div class="toolbar"><span class="strong">Promotions</span><button class="btn btn-primary btn-sm ml-auto" data-addp>' + AC.icon('plus') + 'New promotion</button></div><div data-t></div>';
        const t = AC.kit.table(P.querySelector('[data-t]'), { per: 10, columns: [
          { label: 'Promotion', main: true, render: (p) => '<div class="cell-title">' + u.esc(p.name) + '</div><div class="cell-sub">' + u.esc(p.scope) + '</div>' },
          { label: 'Type', render: (p) => '<span class="tag">' + p.type + '</span>' }, { label: 'Value', render: (p) => '<b>' + u.esc(p.value) + '</b>' },
          { label: 'Period', render: (p) => '<span class="small nowrap">' + u.fmtDate(p.start, 'md') + ' – ' + u.fmtDate(p.end) + '</span>', sort: (p) => p.start },
          { label: 'Status', render: (p) => AC.ui.badge(p.status === 'Scheduled Promo' ? 'Scheduled' : p.status) },
          { label: '', cls: 'text-right', render: (p) => p.status === 'Active' ? '<button class="btn btn-danger-ghost btn-sm" data-end="' + p.id + '">End now</button>' : '' }] });
        const draw = () => t.set(S.promotions); draw();
        P.onclick = async (e) => {
          const en = e.target.closest('[data-end]'); if (en) { const p = S.promotions.find((x) => x.id === en.dataset.end); if (await AC.ui.confirm({ title: 'End “' + p.name + '”?', message: 'Prices revert immediately.', danger: true, confirmText: 'End promotion' })) { p.status = 'Expired'; p.end = u.today(); st.save(); draw(); AC.ui.toast('Promotion ended', null, 'success'); } }
          if (e.target.closest('[data-addp]')) {
            const m = AC.ui.modal({ title: 'New promotion', body: '<form class="form-grid" data-f>' + AC.ui.field('Name', '<input class="input" name="name" required placeholder="e.g. Rainy Season Tire Sale">', 'span-2') + AC.ui.field('Applies to', '<input class="input" name="scope" required placeholder="e.g. All Michelin tires">', 'span-2') + AC.ui.field('Type', AC.ui.select('type', ['Percent', 'Fixed', 'Bundle', 'Freebie'], 'Percent')) + AC.ui.field('Value', '<input class="input" name="value" required placeholder="10%">') + AC.ui.field('Start', '<input class="input" type="date" name="start" required value="' + u.today() + '">') + AC.ui.field('End', '<input class="input" type="date" name="end" required value="' + u.addDays(u.today(), 30) + '">') + '</form>', foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>Create</button>' });
            m.el.querySelector('[data-s]').onclick = () => { const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return; const d = AC.ui.formData(f); d.id = u.uid('PRM'); d.status = d.start > u.today() ? 'Scheduled Promo' : 'Active'; S.promotions.unshift(d); st.log('Admin', S.staff.name, 'Created promotion', d.name); st.save(); m.close(); draw(); AC.ui.toast('Promotion created', d.name, 'success'); };
          }
        };
      },
      compat() {
        P.innerHTML = AC.kit.toolbar({ placeholder: 'Search make/model…', filters: AC.ui.select('b', [{ value: '', label: 'All makes' }].concat(VD.brands()), '', 'data-b aria-label="Make"') }) + '<div data-t></div>';
        const counts = (v) => ({ t: S.products.filter((p) => p.cat === 'tires' && p.variants.some((x) => x.key === v.tire)).length, w: S.products.filter((p) => p.cat === 'wheels' && p.variants.some((x) => x.attrs.pcd === v.pcd)).length });
        const t = AC.kit.table(P.querySelector('[data-t]'), { per: 12, columns: [
          { label: 'Vehicle', main: true, render: (v) => '<div class="cell-main"><div class="thumb" style="width:58px;height:36px">' + AC.art.car({ body: v.body, color: '#c0c6cd' }) + '</div><div><div class="cell-title">' + v.brand + ' ' + v.model + '</div><div class="cell-sub">' + v.body + ' · ' + v.fuel + '</div></div></div>', sort: (v) => v.brand + v.model },
          { label: 'OEM tire', render: (v) => '<span class="mono">' + v.tire + '</span>', sort: (v) => v.tire },
          { label: 'PCD', render: (v) => '<span class="mono">' + v.pcd + '</span>', sort: (v) => v.pcd },
          { label: 'Center bore', cls: 'num', render: (v) => v.cb + ' mm' }, { label: 'Offset range', render: (v) => '<span class="mono">ET' + v.etMin + ' – ' + v.etMax + '</span>' },
          { label: 'Tires in stock', cls: 'num', render: (v) => counts(v).t, sort: (v) => counts(v).t }, { label: 'Wheels (PCD match)', cls: 'num', render: (v) => counts(v).w, sort: (v) => counts(v).w },
          { label: '', cls: 'text-right', render: (v) => '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="shop.html#/wheels?brand=' + encodeURIComponent(v.brand) + '&model=' + encodeURIComponent(v.model) + '">Test fitment</a>' }] });
        let q = '', b = '';
        const draw = () => t.set(VD.catalog.filter((v) => (!b || v.brand === b) && u.match(v.brand + ' ' + v.model, q)));
        P.querySelector('[data-q]').oninput = (e) => { q = e.target.value; draw(); };
        P.querySelector('[data-b]').onchange = (e) => { b = e.target.value; draw(); };
        draw();
      },
      tires() {
        const rows = {};
        S.products.filter((p) => p.cat === 'tires').forEach((p) => p.variants.forEach((v) => { const r = rows[v.key] = rows[v.key] || { size: v.key, rim: v.attrs.rim, skus: 0, stock: 0, min: Infinity, brands: new Set() }; r.skus++; r.stock += v.stock; r.min = Math.min(r.min, v.price); r.brands.add(p.brand); }));
        const list = Object.values(rows).sort((a, b) => a.rim - b.rim || a.size.localeCompare(b.size));
        const demand = new Set(VD.catalog.map((v) => v.tire));
        P.innerHTML = '<div class="card-body"><div class="chips mb-16">' + Array.from(new Set(list.map((r) => r.rim))).map((r) => '<span class="tag">R' + r + ' · ' + list.filter((x) => x.rim === r).length + ' sizes</span>').join('') + '</div></div><div data-t></div>';
        AC.kit.table(P.querySelector('[data-t]'), { per: 15, columns: [
          { label: 'Tire size', main: true, render: (r) => '<b class="mono">' + r.size + '</b>' + (demand.has(r.size) ? ' <span class="badge badge-blue no-dot">OEM size</span>' : ''), sort: (r) => r.rim * 1000 + parseInt(r.size) },
          { label: 'Brands', render: (r) => '<span class="small muted">' + Array.from(r.brands).join(', ') + '</span>' },
          { label: 'SKUs', cls: 'num', render: (r) => r.skus, sort: (r) => r.skus }, { label: 'Units', cls: 'num', render: (r) => r.stock, sort: (r) => r.stock },
          { label: 'From', cls: 'num', render: (r) => u.peso(r.min), sort: (r) => r.min },
          { label: 'Status', render: (r) => AC.ui.badge(r.stock === 0 ? 'Out of Stock' : r.stock < 10 ? 'Low Stock' : 'In Stock') }] }).set(list);
      },
      wheels() {
        const pcds = Array.from(new Set(S.products.filter((p) => p.cat === 'wheels').flatMap((p) => p.variants.map((v) => v.attrs.pcd)))).sort();
        const dias = [15, 16, 17, 18, 19, 20];
        const cell = (pcd, d) => { const vs = S.products.filter((p) => p.cat === 'wheels').flatMap((p) => p.variants.filter((v) => v.attrs.pcd === pcd && v.attrs.diameter === d)); const n = u.sum(vs, (v) => v.stock); return { skus: vs.length, n }; };
        P.innerHTML = '<div class="card-body"><p class="small muted mb-16">Wheel SKU coverage by bolt pattern (PCD) × diameter. Darker = more units in stock. Click a cell to view matching wheels.</p><div class="table-wrap"><table class="table"><thead><tr><th>PCD</th>' + dias.map((d) => '<th class="num">' + d + '″</th>').join('') + '<th>Vehicles using PCD</th></tr></thead><tbody>' +
          pcds.map((pcd) => '<tr><td class="mono strong">' + pcd + '</td>' + dias.map((d) => { const c = cell(pcd, d); const a = Math.min(1, c.n / 20); return '<td class="num"><a href="shop.html#/category/wheels" target="_blank" rel="noopener" title="' + c.skus + ' SKUs · ' + c.n + ' sets" style="display:inline-grid;place-items:center;min-width:52px;height:34px;border-radius:8px;font-weight:650;font-size:12px;background:' + (c.skus ? 'rgba(42,120,214,' + (0.1 + a * 0.75).toFixed(2) + ')' : 'var(--gray-bg)') + ';color:' + (a > .5 ? '#fff' : c.skus ? 'var(--blue-600)' : 'var(--gray-2)') + '">' + (c.skus ? c.n : '—') + '</a></td>'; }).join('') + '<td class="small muted">' + VD.catalog.filter((v) => v.pcd === pcd).map((v) => v.model).slice(0, 6).join(', ') + '</td></tr>').join('') + '</tbody></table></div></div>';
      }
    };
    const show = (k) => { tab = k; P.onclick = P.onchange = null; P.classList.remove('tab-panel'); void P.offsetWidth; P.classList.add('tab-panel'); views[k](); };
    AC.ui.tabs(el.querySelector('[data-tabs]'), show);
    show(tab);
  };
})();

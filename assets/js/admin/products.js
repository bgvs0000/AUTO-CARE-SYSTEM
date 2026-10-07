/* =========================================================
   AUTOCARE — admin/products.js
   Product catalog management + reusable product editor:
   category, brand, description, specs, tire/wheel specs,
   variants (size/PCD/offset, SKU, price, stock).
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store, H = AC.data.productHelpers, VD = AC.data.vehicles;
  const ART = { tires: { kind: 'tire' }, wheels: { kind: 'wheel', finish: 'Silver', style: 'five' }, batteries: { kind: 'battery', color: '#111' }, oils: { kind: 'bottle', color: '#2563eb', label: 'OIL' }, lubricants: { kind: 'bottle', color: '#374151', label: 'FLUID' }, brakes: { kind: 'brake', part: 'pads' }, filters: { kind: 'filter', color: '#2563eb' }, suspension: { kind: 'shock', color: '#3b82f6' }, lighting: { kind: 'bulb' }, carcare: { kind: 'bottle', color: '#111827', label: 'CARE' }, detailing: { kind: 'bottle', color: '#111', label: 'PRO' } };

  function parseWheel(s) {
    const m = String(s).match(/(\d{2})\s*[x×]\s*([\d.]+)\s+(\d x[\d.]+|\dx[\d.]+)\s+ET\s*([+-]?\d+)/i);
    return m ? { diameter: +m[1], width: +m[2], pcd: m[3].replace(/\s/g, ''), offset: +m[4], cb: 73.1 } : null;
  }

  AC.productForm = function (p, onSave) {
    const isEdit = !!p;
    const d = p ? JSON.parse(JSON.stringify(p)) : { cat: 'tires', brand: '', name: '', desc: '', supplier: '', minStock: 4, specs: {}, variants: [{ key: '', label: '', sku: '', price: '', stock: 0 }], tags: [] };
    const m = AC.ui.modal({
      title: isEdit ? 'Edit product' : 'Add product', sub: isEdit ? d.id + ' · ' + d.title : 'Create a new shop & inventory item', size: 'xl',
      body: '<form data-f novalidate><div class="grid-main-side" style="grid-template-columns:minmax(0,1fr) 260px;gap:20px"><div class="col gap-16">' +
        '<div class="form-grid">' + AC.ui.field('Category <span class="req">*</span>', AC.ui.select('cat', AC.data.categories.map((c) => ({ value: c.id, label: c.name })), d.cat, isEdit ? 'disabled' : '')) +
        AC.ui.field('Brand <span class="req">*</span>', '<input class="input" name="brand" required value="' + u.esc(d.brand) + '" list="brandlist"><datalist id="brandlist">' + Array.from(new Set(st.s.products.map((x) => x.brand))).map((b) => '<option value="' + u.esc(b) + '">').join('') + '</datalist>') +
        AC.ui.field('Product name / model <span class="req">*</span>', '<input class="input" name="name" required value="' + u.esc(d.name) + '">', 'span-2') +
        AC.ui.field('Description', '<textarea class="textarea" name="desc" style="min-height:70px">' + u.esc(d.desc) + '</textarea>', 'span-2') +
        AC.ui.field('Supplier', '<input class="input" name="supplier" value="' + u.esc(d.supplier) + '">') + AC.ui.field('Minimum stock (alert level)', '<input class="input" type="number" min="0" name="minStock" value="' + d.minStock + '">') +
        AC.ui.field('Tags (comma-separated)', '<input class="input" name="tags" placeholder="Best Seller, Premium" value="' + u.esc((d.tags || []).join(', ')) + '">', 'span-2') + '</div>' +
        '<div data-specs></div>' +
        '<div><div class="flex between items-center mb-8"><div class="label" data-vlabel>Variants</div><button type="button" class="btn btn-soft btn-sm" data-addv>' + AC.icon('plus') + 'Add variant</button></div><div class="table-wrap card"><table class="table"><thead><tr><th data-vh>Option</th><th>SKU</th><th class="num">Price (₱)</th><th class="num">Stock</th><th></th></tr></thead><tbody data-vrows></tbody></table></div><div class="help mt-8" data-vhelp></div></div>' +
        '</div><div><div class="label mb-8">Preview</div><div class="card card-soft" style="aspect-ratio:1;display:grid;place-items:center" data-prev></div><div class="small muted mt-8">Images are generated from category &amp; specs in this prototype. In production, upload product photos here.</div>' +
        '<button type="button" class="btn btn-outline btn-block mt-12" data-upload>' + AC.icon('upload') + 'Upload images</button></div></div></form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>' + (isEdit ? 'Save product' : 'Create product') + '</button>'
    });
    const f = m.el.querySelector('[data-f]'), vrows = m.el.querySelector('[data-vrows]');
    const cat = () => f.cat.value;
    function specs() {
      const c = cat();
      let h = '';
      if (c === 'tires') h = '<div class="form-grid">' + AC.ui.field('Tire type', AC.ui.select('s_Tire Type', ['Touring', 'Comfort', 'Performance', 'Eco / Fuel Saver', 'SUV / Highway', 'All-Terrain', 'Hybrid Terrain'], d.specs['Tire Type'] || 'Touring')) + AC.ui.field('Season', AC.ui.select('s_Season', ['All-Season', 'Summer'], d.specs.Season || 'All-Season')) + '</div>';
      else if (c === 'wheels') h = '<div class="form-grid-3">' + AC.ui.field('Finish', AC.ui.select('s_Finish', Object.keys(AC.art.FINISH), d.specs.Finish || 'Silver')) + AC.ui.field('Material', AC.ui.select('s_Material', ['Aluminum Alloy', 'Forged Aluminum', 'Steel'], d.specs.Material || 'Aluminum Alloy')) + AC.ui.field('Construction', AC.ui.select('s_Construction', ['Low-pressure Cast', 'Gravity Cast', 'Flow Formed', 'MAT Flow Forming', 'Forged (One-piece)', 'Forged (Two-piece)', 'Cast (One-piece)'], d.specs.Construction || 'Flow Formed')) + '</div>';
      else h = '<div class="form-grid">' + Object.keys(d.specs).filter((k) => k !== 'Brand').slice(0, 4).map((k) => AC.ui.field(u.esc(k), '<input class="input" name="s_' + u.esc(k) + '" value="' + u.esc(d.specs[k]) + '">')).join('') + '</div>';
      m.el.querySelector('[data-specs]').innerHTML = h ? '<div class="label mb-8">Specifications</div>' + h : '';
      m.el.querySelector('[data-vh]').textContent = c === 'tires' ? 'Tire size (e.g. 205/55 R16)' : c === 'wheels' ? 'Size (e.g. 17x8 5x114.3 ET+45)' : 'Option / size';
      m.el.querySelector('[data-vhelp]').textContent = c === 'tires' ? 'Load index & speed rating are auto-assigned. Fitment search uses the tire size.' : c === 'wheels' ? 'Use the format DIAxWIDTH PCD ET±offset so the wheel fitment tool can match vehicles.' : 'Each variant is a separate SKU with its own price and stock.';
    }
    function preview() {
      const c = cat(), a = Object.assign({}, d.art || ART[c] || { kind: 'generic', icon: 'box', color: '#111' });
      if (c === 'wheels' && f['s_Finish']) a.finish = f['s_Finish'].value;
      m.el.querySelector('[data-prev]').innerHTML = '<div style="width:80%">' + AC.art.product({ cat: c, brand: f.brand.value || 'Brand', name: f.name.value, art: a, variants: [{ label: (vrows.querySelector('[name=v_label]') || {}).value || '' }] }) + '</div>';
    }
    function vrow(v) { return '<tr><td><input class="input input-sm mono" name="v_label" required value="' + u.esc(v.label || v.key || '') + '"></td><td><input class="input input-sm mono" name="v_sku" value="' + u.esc(v.sku || '') + '" placeholder="Auto"></td><td><input class="input input-sm" type="number" min="0" name="v_price" required value="' + (v.price === '' ? '' : v.price) + '" style="text-align:right;width:110px"></td><td><input class="input input-sm" type="number" min="0" name="v_stock" value="' + (v.stock || 0) + '" style="text-align:right;width:80px"></td><td><button type="button" class="btn btn-danger-ghost btn-icon btn-sm" data-rmv aria-label="Remove variant">' + AC.icon('trash') + '</button></td></tr>'; }
    vrows.innerHTML = d.variants.map((v) => vrow(Object.assign({}, v, { label: d.cat === 'wheels' && v.attrs ? v.key : v.label }))).join('');
    specs(); preview();
    f.cat.onchange = () => { specs(); preview(); };
    f.addEventListener('input', u.debounce(preview, 250));
    m.el.querySelector('[data-addv]').onclick = () => vrows.insertAdjacentHTML('beforeend', vrow({ label: '', price: '', stock: 0 }));
    vrows.addEventListener('click', (e) => { const r = e.target.closest('[data-rmv]'); if (r) { if (vrows.children.length === 1) return AC.ui.toast('At least one variant is required', null, 'warning'); r.closest('tr').remove(); } });
    m.el.querySelector('[data-upload]').onclick = () => AC.ui.toast('Image upload', 'Connect storage (e.g. S3/Cloudinary) in production.', 'info');
    m.el.querySelector('[data-s]').onclick = async (e) => {
      if (!AC.ui.validate(f)) return;
      const c = cat(), out = [];
      const old = {}; (d.variants || []).forEach((v) => { old[v.key] = v; });
      const trs = Array.from(vrows.children);
      for (const tr of trs) {
        const label = tr.querySelector('[name=v_label]').value.trim(), price = +tr.querySelector('[name=v_price]').value, stock = +tr.querySelector('[name=v_stock]').value || 0;
        let sku = tr.querySelector('[name=v_sku]').value.trim();
        let key = label, attrs;
        if (c === 'tires') { const t = VD.parseTire(label); if (!t) return AC.ui.toast('Invalid tire size: ' + label, 'Use 205/55 R16 format.', 'error'); key = t.label; attrs = (old[key] && old[key].attrs) || { width: t.width, aspect: t.aspect, rim: t.rim, load: String(80 + Math.round((t.width - 175) / 10)), speed: 'H' }; }
        if (c === 'wheels') { const w = parseWheel(label); if (!w) return AC.ui.toast('Invalid wheel spec: ' + label, 'Use 17x8 5x114.3 ET+45 format.', 'error'); attrs = w; key = w.diameter + 'x' + w.width + ' ' + w.pcd + ' ET' + (w.offset >= 0 ? '+' : '') + w.offset; }
        if (!sku) sku = (f.brand.value.replace(/[^A-Za-z]/g, '').slice(0, 3) + '-' + f.name.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 5) + '-' + key.replace(/[^0-9A-Za-z]/g, '').slice(0, 8)).toUpperCase();
        out.push({ key, label: c === 'wheels' ? attrs.diameter + '×' + attrs.width + ' · ' + attrs.pcd + ' · ET' + (attrs.offset >= 0 ? '+' : '') + attrs.offset : key, sku, price, stock, attrs });
      }
      const specsObj = Object.assign({}, d.specs);
      f.querySelectorAll('[name^="s_"]').forEach((i) => { specsObj[i.name.slice(2)] = i.value; });
      await AC.ui.busy(e.currentTarget, 500);
      const data = { cat: c, brand: f.brand.value.trim(), name: f.name.value.trim(), desc: f.desc.value, supplier: f.supplier.value, minStock: +f.minStock.value || 0, tags: f.tags.value.split(',').map((x) => x.trim()).filter(Boolean), specs: specsObj, variants: out };
      data.title = data.brand + ' ' + data.name;
      if (isEdit) { Object.assign(p, data); if (c === 'wheels') p.art.finish = specsObj.Finish; st.log('Admin', st.s.staff.name, 'Edited product', p.title); }
      else {
        const pre = { tires: 'TR', wheels: 'WH', batteries: 'BT', oils: 'OL', lubricants: 'LB', brakes: 'BR', filters: 'FL', suspension: 'SU', accessories: 'AC', lighting: 'LT', carcare: 'CC', detailing: 'DT', performance: 'PF' }[c];
        const np = Object.assign({ id: pre + '-' + (900 + st.s.products.length), rating: 5, reviews: 0, unit: c === 'tires' ? 'per tire' : c === 'wheels' ? 'per set of 4' : '', art: Object.assign({}, ART[c] || { kind: 'generic', icon: 'box', color: '#111' }, c === 'wheels' ? { finish: specsObj.Finish } : {}) }, data);
        st.s.products.unshift(np); st.log('Admin', st.s.staff.name, 'Added new ' + H.catName(c).toLowerCase().replace(/s$/, '') + ' product', np.title);
      }
      st.save(); m.close(); AC.ui.toast(isEdit ? 'Product saved' : 'Product created', data.title, 'success'); onSave && onSave();
    };
  };

  AC.adminViews.products = function (el) {
    const f = { cat: '', q: '' };
    el.innerHTML = AC.shell.pageHead('Products', 'Catalog shown in the AutoCare Shop.', '<a class="btn btn-outline" href="shop.html" target="_blank" rel="noopener">' + AC.icon('globe') + 'View shop</a><button class="btn btn-primary" data-add>' + AC.icon('plus') + 'Add Product</button>') +
      '<div class="chips mb-16" data-cats>' + [{ id: '', name: 'All' }].concat(AC.data.categories).map((c) => '<button class="chip ' + (c.id === '' ? 'active' : '') + '" data-c="' + c.id + '">' + c.name + ' <span class="count">' + (c.id ? st.s.products.filter((p) => p.cat === c.id).length : st.s.products.length) + '</span></button>').join('') + '</div>' +
      '<div class="card">' + AC.kit.toolbar({ placeholder: 'Search product or brand…' }) + '<div data-t></div></div>';
    const t = AC.kit.table(el.querySelector('[data-t]'), {
      per: 10, columns: [
        { label: 'Product', main: true, render: (p) => '<div class="cell-main"><div class="thumb">' + AC.art.product(p) + '</div><div style="min-width:0"><div class="cell-title truncate" style="max-width:260px">' + u.esc(p.title) + '</div><div class="cell-sub mono">' + p.id + '</div></div></div>', sort: (p) => p.title },
        { label: 'Category', render: (p) => '<span class="tag">' + H.catName(p.cat) + '</span>', sort: (p) => p.cat },
        { label: 'Variants', cls: 'num', render: (p) => p.variants.length, sort: (p) => p.variants.length },
        { label: 'Price range', cls: 'num', render: (p) => { const ps = p.variants.map((v) => v.price); const a = Math.min.apply(null, ps), b = Math.max.apply(null, ps); return '<span class="nowrap">' + u.peso(a) + (b > a ? ' – ' + u.peso(b) : '') + '</span>'; }, sort: (p) => H.minPrice(p) },
        { label: 'Stock', cls: 'num', render: (p) => H.totalStock(p), sort: (p) => H.totalStock(p) },
        { label: 'Rating', render: (p) => '<span class="rating">' + AC.icon('star') + p.rating.toFixed(1) + '</span>', sort: (p) => p.rating },
        { label: 'Status', render: (p) => AC.ui.badge(H.totalStock(p) ? 'Published' : 'Out of Stock') },
        { label: '', cls: 'text-right', render: (p) => '<div class="actions"><a class="btn btn-ghost btn-icon btn-sm" href="shop.html#/product/' + p.id + '" target="_blank" rel="noopener" aria-label="Preview">' + AC.icon('eye') + '</a><button class="btn btn-ghost btn-icon btn-sm" data-edit="' + p.id + '" aria-label="Edit">' + AC.icon('edit') + '</button><button class="btn btn-ghost btn-icon btn-sm" data-dup="' + p.id + '" aria-label="Duplicate">' + AC.icon('copy') + '</button><button class="btn btn-danger-ghost btn-icon btn-sm" data-del="' + p.id + '" aria-label="Delete">' + AC.icon('trash') + '</button></div>' }
      ]
    });
    const draw = (keep) => t.set(st.s.products.filter((p) => (!f.cat || p.cat === f.cat) && u.match([p.title, p.brand, p.id], f.q)), keep);
    el.querySelector('[data-cats]').addEventListener('click', (e) => { const c = e.target.closest('[data-c]'); if (!c) return; f.cat = c.dataset.c; el.querySelectorAll('[data-cats] .chip').forEach((x) => x.classList.toggle('active', x === c)); draw(); });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); draw(); }, 150));
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-add]')) AC.productForm(null, () => draw());
      const ed = e.target.closest('[data-edit]'); if (ed) AC.productForm(st.product(ed.dataset.edit), () => draw(true));
      const du = e.target.closest('[data-dup]'); if (du) { const p = JSON.parse(JSON.stringify(st.product(du.dataset.dup))); p.id = p.id.split('-')[0] + '-' + (900 + st.s.products.length); p.name += ' (Copy)'; p.title += ' (Copy)'; p.variants.forEach((v) => { v.sku += '-C'; v.stock = 0; }); st.s.products.unshift(p); st.save(); AC.ui.toast('Product duplicated', p.title, 'success'); draw(); }
      const dl = e.target.closest('[data-del]'); if (dl) { const p = st.product(dl.dataset.del); if (await AC.ui.confirm({ title: 'Delete ' + p.title + '?', message: 'All ' + p.variants.length + ' SKUs will be removed from the shop and inventory.', danger: true, confirmText: 'Delete product' })) { st.s.products = st.s.products.filter((x) => x.id !== p.id); st.log('Admin', st.s.staff.name, 'Deleted product', p.title); st.save(); AC.ui.toast('Product deleted', null, 'success'); draw(true); } }
    });
    draw();
    const id = u.qsParam('id'); if (id && st.product(id)) AC.productForm(st.product(id), () => draw(true));
  };
})();

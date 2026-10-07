/* =========================================================
   AUTOCARE — shop/product.js
   Product detail page: gallery, variant (size) selector,
   price/stock, quantity, add to cart, buy now, fitment
   check modal, specifications, compatibility, related.
   ========================================================= */
window.AC = window.AC || {};
AC.shopViews = AC.shopViews || {};

AC.shopViews.product = function (el, id) {
  const u = AC.u, H = AC.data.productHelpers, VD = AC.data.vehicles;
  const p = AC.store.product(id);
  if (!p) { el.innerHTML = AC.ui.empty('box', 'Product not found', 'It may have been removed.', '<a class="btn btn-primary mt-8" href="#/all">Back to shop</a>'); return; }
  let v = p.variants.find((x) => x.key === u.qsParam('v')) || p.variants.find((x) => x.stock > 0) || p.variants[0];
  let qty = p.cat === 'tires' ? 4 : 1;

  const compat = () => {
    if (p.cat === 'tires') return VD.catalog.filter((c) => VD.tireSizesFor(c, v.attrs.rim).options.some((o) => o.label === v.key) || c.tire === v.key);
    if (p.cat === 'wheels') return VD.catalog.filter((c) => c.pcd === v.attrs.pcd);
    return [];
  };

  function specRows() {
    const rows = Object.assign({}, p.specs);
    if (p.cat === 'tires') Object.assign(rows, { 'Tire Size': v.key, Width: v.attrs.width + ' mm', 'Aspect Ratio': v.attrs.aspect + '%', 'Rim Diameter': v.attrs.rim + '″', 'Load Index': v.attrs.load, 'Speed Rating': v.attrs.speed });
    if (p.cat === 'wheels') Object.assign(rows, { Diameter: v.attrs.diameter + '″', Width: v.attrs.width + 'J', PCD: v.attrs.pcd, Offset: 'ET' + (v.attrs.offset >= 0 ? '+' : '') + v.attrs.offset });
    rows.SKU = v.sku;
    return Object.keys(rows).map((k) => '<tr><td>' + u.esc(k) + '</td><td>' + u.esc(rows[k]) + '</td></tr>').join('');
  }

  function render() {
    const st = H.stockStatus(v.stock, p.minStock);
    const list = compat();
    const related = AC.store.s.products.filter((x) => x.cat === p.cat && x.id !== p.id).sort((a, b) => b.rating - a.rating).slice(0, 4);
    el.innerHTML =
      '<div class="pdp">' +
      '<div class="pdp-gallery"><div class="pdp-main" data-main>' + AC.art.product(p) + '</div>' +
      '<div class="pdp-thumbs">' + [0, 1, 2, 3].map((i) => '<button class="' + (i ? '' : 'active') + '" data-th="' + i + '" aria-label="View ' + (i + 1) + '" style="transform:rotate(' + (i * 8 - 8) + 'deg)">' + AC.art.product(p) + '</button>').join('') + '</div></div>' +
      '<div>' +
      '<div class="flex items-center gap-8 wrap"><span class="tag">' + u.esc(H.catName(p.cat)) + '</span>' + (p.tags || []).map((t) => '<span class="badge badge-dark no-dot">' + u.esc(t) + '</span>').join('') + '</div>' +
      '<div class="small muted strong mt-16" style="letter-spacing:.08em;text-transform:uppercase">' + u.esc(p.brand) + '</div>' +
      '<h1 class="mt-4">' + u.esc(p.name) + '</h1>' +
      '<div class="flex items-center gap-12 mt-8 wrap">' + AC.ui.stars(p.rating) + '<b>' + p.rating.toFixed(1) + '</b><span class="muted small">' + p.reviews + ' reviews</span><span class="muted">·</span>' + AC.shopUI.stockLabel(v.stock, p.minStock) + '</div>' +
      '<div class="flex items-end gap-8 mt-20"><div class="price-lg">' + u.peso(v.price) + '</div><div class="muted mb-4">' + (p.unit || '') + '</div></div>' +
      (p.cat === 'tires' ? '<div class="small muted mt-4">Set of 4: <b style="color:var(--black)">' + u.peso(v.price * 4) + '</b> · Free mounting &amp; balancing</div>' : '') +
      '<div class="divider"></div>' +
      '<div class="label mb-8">' + (p.cat === 'tires' ? 'Tire size' : p.cat === 'wheels' ? 'Size · PCD · Offset' : 'Option') + ' <span class="muted" style="font-weight:500">(' + p.variants.length + ' available)</span></div>' +
      '<div class="variant-list" style="max-height:180px;overflow:auto">' + p.variants.map((x) => '<button class="variant ' + (x.key === v.key ? 'active' : '') + (x.stock <= 0 ? ' oos' : '') + '" data-vk="' + u.esc(x.key) + '">' + u.esc(x.label) + '</button>').join('') + '</div>' +
      '<div class="pdp-actions mt-20">' +
      '<div class="qty"><button data-q="-1" aria-label="Decrease quantity">' + AC.icon('minus') + '</button><input type="number" value="' + qty + '" min="1" max="' + Math.max(1, v.stock) + '" data-qty aria-label="Quantity"><button data-q="1" aria-label="Increase quantity">' + AC.icon('plus') + '</button></div>' +
      '<button class="btn btn-outline btn-lg" data-addcart ' + (v.stock <= 0 ? 'disabled' : '') + '>' + AC.icon('cart') + 'Add to Cart</button>' +
      '<button class="btn btn-primary btn-lg" data-buynow ' + (v.stock <= 0 ? 'disabled' : '') + '>Buy Now</button></div>' +
      ((p.cat === 'tires' || p.cat === 'wheels') ? '<button class="btn btn-soft btn-block mt-12" data-fit>' + AC.icon('target') + 'Check Fitment for my vehicle</button>' : '') +
      '<div class="pdp-perks mt-20"><div class="perk">' + AC.icon('shield-check') + '<span>Genuine &amp; warranty-backed</span></div><div class="perk">' + AC.icon('truck') + '<span>Free delivery over ₱10,000 (Metro Manila)</span></div><div class="perk">' + AC.icon('wrench') + '<span>Installation at any branch</span></div></div>' +
      '</div></div>' +
      '<div class="card mt-32"><div class="tabs" style="padding:0 12px" data-tabs><button class="tab active" data-tab="specs">Specifications</button><button class="tab" data-tab="compat">Compatibility <span class="count">' + (list.length || '—') + '</span></button><button class="tab" data-tab="desc">Description</button></div>' +
      '<div class="card-body" data-panel></div></div>' +
      '<h2 class="h3 mt-32 mb-16">You may also like</h2><div class="product-grid">' + related.map((x) => AC.shopUI.card(x)).join('') + '</div>';

    const panel = el.querySelector('[data-panel]');
    const panels = {
      specs: () => '<table class="spec-table">' + specRows() + '</table>',
      compat: () => (p.cat === 'tires' || p.cat === 'wheels') ? (list.length ? '<p class="muted small mb-12">' + (p.cat === 'tires' ? 'Vehicles that can run ' + v.key + ' (OEM or ±3% plus-size):' : 'Vehicles with a ' + v.attrs.pcd + ' bolt pattern:') + '</p><div class="chips">' + list.map((c) => '<span class="tag">' + AC.icon('car') + c.brand + ' ' + c.model + '</span>').join('') + '</div>' : AC.ui.empty('car', 'No common vehicles matched', 'This size suits specialty or imported vehicles.')) :
        '<p class="muted">Universal fit or vehicle-specific per option selected. Not sure? <a class="link" href="index.html#contact">Ask our team</a>.</p>',
      desc: () => '<p style="max-width:760px;line-height:1.75">' + u.esc(p.desc) + '</p><ul class="mt-16" style="list-style:disc;padding-left:20px;color:var(--gray);line-height:1.9"><li>Sourced from ' + u.esc(p.supplier) + '</li><li>Official receipt &amp; manufacturer warranty</li><li>7-day return for unused, unopened items</li></ul>'
    };
    panel.innerHTML = panels.specs();
    AC.ui.tabs(el.querySelector('[data-tabs]'), (t) => { panel.innerHTML = panels[t](); panel.classList.remove('tab-panel'); void panel.offsetWidth; panel.classList.add('tab-panel'); });

    el.querySelectorAll('[data-vk]').forEach((b) => (b.onclick = () => { v = p.variants.find((x) => x.key === b.dataset.vk); qty = Math.min(qty, Math.max(1, v.stock)); render(); }));
    const qi = el.querySelector('[data-qty]');
    el.querySelectorAll('[data-q]').forEach((b) => (b.onclick = () => { qty = u.clamp(qty + +b.dataset.q, 1, Math.max(1, v.stock)); qi.value = qty; }));
    qi.onchange = () => { qty = u.clamp(+qi.value || 1, 1, Math.max(1, v.stock)); qi.value = qty; };
    el.querySelector('[data-addcart]').onclick = (e) => { if (AC.store.addToCart(p.id, v.key, qty)) { AC.ui.toast('Added to cart', qty + ' × ' + p.title + ' · ' + v.label, 'success'); e.currentTarget.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 260 }); } };
    el.querySelector('[data-buynow]').onclick = () => { if (AC.store.addToCart(p.id, v.key, qty)) AC.router.go('checkout'); };
    const fb = el.querySelector('[data-fit]'); if (fb) fb.onclick = fitModal;
    const main = el.querySelector('[data-main]');
    el.querySelectorAll('[data-th]').forEach((b) => (b.onclick = () => { el.querySelectorAll('[data-th]').forEach((x) => x.classList.toggle('active', x === b)); main.firstElementChild.style.transform = 'rotate(' + (b.dataset.th * 8 - 8) + 'deg)'; }));
  }

  function fitModal() {
    const garage = AC.store.s.vehicles.filter((x) => x.customerId === AC.session.customerId());
    const m = AC.ui.modal({
      title: 'Check fitment', sub: p.title + ' · ' + v.label,
      body: (garage.length ? '<div class="label mb-8">From your garage</div><div class="grid" style="gap:8px">' + garage.map((g) => '<button class="option" data-g="' + g.id + '"><div class="thumb" style="width:64px">' + AC.art.car({ body: g.body, color: g.colorHex }) + '</div><div><div class="strong">' + AC.store.vName(g) + '</div><div class="small muted">' + g.plate + '</div></div><span class="opt-check">' + AC.icon('check') + '</span></button>').join('') + '</div><div class="auth-divider mt-16 mb-8" style="display:flex;align-items:center;gap:12px;color:var(--gray-2);font-size:12px">or pick any vehicle</div>' : '') +
        '<div class="form-grid" data-mf>' + AC.ui.field('Brand', '<select class="select" name="b">' + VD.brands().map((b) => '<option>' + b + '</option>').join('') + '</select>') + AC.ui.field('Model', '<select class="select" name="m"></select>') + '</div><div data-out class="mt-16"></div>',
      foot: '<button class="btn btn-outline" data-close>Close</button><button class="btn btn-primary" data-check>Check</button>'
    });
    const f = m.el.querySelector('[data-mf]'), b = f.querySelector('[name=b]'), mm = f.querySelector('[name=m]'), out = m.el.querySelector('[data-out]');
    const fillM = () => { mm.innerHTML = VD.models(b.value).map((x) => '<option>' + x + '</option>').join(''); };
    b.onchange = fillM; fillM();
    const check = (brand, model) => {
      const c = VD.find(brand, model);
      let ok, msg;
      if (p.cat === 'tires') {
        const opts = VD.tireSizesFor(c, v.attrs.rim).options.map((o) => o.label);
        ok = c.tire === v.key || opts.includes(v.key);
        msg = ok ? (c.tire === v.key ? 'Exact OEM size match.' : 'Plus-size fit within ±3% of OEM diameter.') : 'Not recommended. OEM size is ' + c.tire + (opts.length ? '; on ' + v.attrs.rim + '″ try ' + opts.join(', ') : '') + '.';
      } else {
        const fit = VD.wheelFitment(c, v.attrs.diameter);
        ok = c.pcd === v.attrs.pcd;
        const etOk = v.attrs.offset >= c.etMin - 5 && v.attrs.offset <= c.etMax + 5;
        msg = ok ? 'PCD ' + c.pcd + ' matches. ' + (etOk ? 'Offset is within the safe range.' : 'Offset ET' + v.attrs.offset + ' is outside ET' + c.etMin + '–' + c.etMax + ' — may need fender work.') + ' Pair with ' + fit.tire + ' tires.' : 'PCD mismatch: your vehicle uses ' + c.pcd + '.';
      }
      out.innerHTML = '<div class="alert ' + (ok ? 'success' : 'warning') + '">' + AC.icon(ok ? 'check-circle' : 'alert') + '<div><b>' + (ok ? 'Fits your ' : 'Does not fit your ') + brand + ' ' + model + '</b><div class="small mt-4">' + msg + '</div></div></div>';
    };
    m.el.querySelectorAll('[data-g]').forEach((g) => (g.onclick = () => { m.el.querySelectorAll('[data-g]').forEach((x) => x.classList.toggle('selected', x === g)); const gv = AC.store.vehicle(g.dataset.g); check(gv.brand, gv.model); }));
    m.el.querySelector('[data-check]').onclick = () => check(b.value, mm.value);
  }

  render();
};

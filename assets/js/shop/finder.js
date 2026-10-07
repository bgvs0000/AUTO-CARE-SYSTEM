/* =========================================================
   AUTOCARE — shop/finder.js
   Smart Tire Finder (by vehicle / size / brand / budget)
   and Wheel Fitment (brand → model → year → diameter).
   ========================================================= */
window.AC = window.AC || {};
AC.shopViews = AC.shopViews || {};

(function () {
  const u = AC.u, VD = AC.data.vehicles;
  const opts = (arr, sel) => arr.map((x) => { const v = typeof x === 'object' ? x.value : x, l = typeof x === 'object' ? x.label : x; return '<option value="' + u.esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + u.esc(l) + '</option>'; }).join('');
  const products = (cat) => AC.store.s.products.filter((p) => p.cat === cat);

  function vehicleSelects(prefix, b, m, y) {
    b = b && VD.brands().includes(b) ? b : 'Toyota';
    const models = VD.models(b); m = models.includes(m) ? m : models[0];
    const veh = VD.find(b, m);
    return AC.ui.field('Brand', '<select class="select" name="brand" id="' + prefix + 'b">' + opts(VD.brands(), b) + '</select>') +
      AC.ui.field('Model', '<select class="select" name="model" id="' + prefix + 'm">' + opts(models, m) + '</select>') +
      AC.ui.field('Year', '<select class="select" name="year" id="' + prefix + 'y">' + opts(veh.years.slice().reverse(), y || 2023) + '</select>');
  }
  function wireVehicle(form) {
    form.brand.onchange = () => { form.model.innerHTML = opts(VD.models(form.brand.value)); form.model.onchange(); };
    form.model.onchange = () => { const v = VD.find(form.brand.value, form.model.value); form.year.innerHTML = opts(v.years.slice().reverse(), 2023); };
  }
  function sizeDiagram(s) {
    const t = VD.parseTire(s); if (!t) return '';
    return '<div class="size-diagram"><span class="hl" title="Width (mm)">' + t.width + '</span>/<span title="Aspect ratio">' + t.aspect + '</span><span style="background:none">R</span><span class="hl" title="Rim diameter (in)">' + t.rim + '</span></div>' +
      '<div class="flex gap-16 small muted mt-8 wrap"><span>Width ' + t.width + ' mm</span><span>Aspect ' + t.aspect + '%</span><span>Rim ' + t.rim + '″</span><span>Overall Ø ' + Math.round(VD.diameter(t)) + ' mm</span></div>';
  }
  function tireCardsForSize(size) {
    const list = [];
    products('tires').forEach((p) => { const v = p.variants.find((x) => x.key === size); if (v) list.push({ p, v }); });
    return list.sort((a, b) => (b.v.stock > 0) - (a.v.stock > 0) || a.v.price - b.v.price);
  }

  /* ---------------- Tire Finder ---------------- */
  AC.shopViews.tireFinder = function (el) {
    const qp = (k) => u.qsParam(k);
    let mode = qp('size') ? 'size' : qp('budget') ? 'budget' : qp('tbrand') ? 'brand' : 'vehicle';
    const widths = []; for (let w = 155; w <= 285; w += 10) widths.push(w);
    const aspects = []; for (let a = 30; a <= 80; a += 5) aspects.push(a);
    const rims = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
    const tSize = VD.parseTire(qp('size') || '195/55 R16') || { width: 195, aspect: 55, rim: 16 };
    const tBrands = Array.from(new Set(products('tires').map((p) => p.brand))).sort();

    el.innerHTML =
      '<div class="flex between items-center wrap gap-12 mb-16"><div class="finder-tabs" role="tablist">' +
      [['vehicle', 'car', 'By Vehicle'], ['size', 'ruler', 'By Tire Size'], ['brand', 'tag', 'By Brand'], ['budget', 'wallet', 'By Budget']].map((t) => '<button role="tab" data-mode="' + t[0] + '" class="' + (mode === t[0] ? 'active' : '') + '">' + AC.icon(t[1]) + t[2] + '</button>').join('') +
      '</div><a class="link small" href="#/wheels">Looking for mags? Try Wheel Fitment →</a></div>' +
      '<form class="card finder-panel" data-form novalidate></form>' +
      '<div data-result class="mt-24"></div>';
    const form = el.querySelector('[data-form]'), res = el.querySelector('[data-result]');

    function drawForm() {
      el.querySelectorAll('[data-mode]').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
      if (mode === 'vehicle') { form.innerHTML = vehicleSelects('tf', qp('brand'), qp('model'), qp('year')) + AC.ui.field('Rim size', '<select class="select" name="rim"><option value="">Stock (OEM)</option>' + opts([15, 16, 17, 18, 19, 20].map((r) => ({ value: r, label: r + '″ (plus-size)' }))) + '</select>') + '<button class="btn btn-primary btn-lg" type="submit">' + AC.icon('search') + 'Find tires</button>'; wireVehicle(form); }
      if (mode === 'size') form.innerHTML = AC.ui.field('Width', '<select class="select" name="w">' + opts(widths, tSize.width) + '</select>') + AC.ui.field('Aspect ratio', '<select class="select" name="a">' + opts(aspects, tSize.aspect) + '</select>') + AC.ui.field('Rim diameter', '<select class="select" name="r">' + opts(rims.map((r) => ({ value: r, label: 'R' + r })), tSize.rim) + '</select>') + AC.ui.field('…or type size', '<input class="input mono" name="typed" placeholder="e.g. 195/55 R16">') + '<button class="btn btn-primary btn-lg" type="submit">' + AC.icon('search') + 'Search</button>';
      if (mode === 'brand') form.innerHTML = AC.ui.field('Tire brand', '<select class="select" name="brand">' + opts(tBrands, qp('tbrand') || 'Michelin') + '</select>') + AC.ui.field('Rim size', '<select class="select" name="rim"><option value="">Any</option>' + opts(rims.slice(1, 8).map((r) => ({ value: r, label: 'R' + r }))) + '</select>') + AC.ui.field('Type', '<select class="select" name="type"><option value="">Any type</option>' + opts(Array.from(new Set(products('tires').map((p) => p.specs['Tire Type'])))) + '</select>') + '<div></div><button class="btn btn-primary btn-lg" type="submit">' + AC.icon('search') + 'Show tires</button>';
      if (mode === 'budget') form.innerHTML = AC.ui.field('Max price per tire', '<select class="select" name="max">' + opts([[4000, 'Up to ₱4,000'], [5000, 'Up to ₱5,000'], [6500, 'Up to ₱6,500'], [8000, 'Up to ₱8,000'], [10000, 'Up to ₱10,000'], [99999, 'No limit']].map((x) => ({ value: x[0], label: x[1] })), qp('budget') || 6500) + '</select>') + AC.ui.field('Rim size', '<select class="select" name="rim">' + opts(rims.slice(1, 8).map((r) => ({ value: r, label: 'R' + r })), 16) + '</select>') + AC.ui.field('Priority', '<select class="select" name="pri"><option value="value">Best value</option><option value="rating">Highest rated</option></select>') + '<div></div><button class="btn btn-primary btn-lg" type="submit">' + AC.icon('search') + 'Show tires</button>';
    }

    function resultBlock(title, sub, rows, side) {
      return '<div class="flex between items-end wrap gap-16 mb-16"><div><h2 class="h3">' + title + '</h2><p class="muted mt-4">' + sub + '</p></div>' + (side || '') + '</div>' +
        (rows.length ? '<div class="product-grid stagger">' + rows.map((r) => AC.shopUI.card(r.p, { variant: r.v })).join('') + '</div>' : AC.ui.empty('tire', 'No tires found', 'Try a different size or check back soon — new stock arrives weekly.'));
    }

    function search() {
      const d = AC.ui.formData(form);
      if (mode === 'vehicle') {
        const v = VD.find(d.brand, d.model);
        const fit = VD.tireSizesFor(v, d.rim ? +d.rim : null);
        const sizes = d.rim ? fit.options.map((o) => o.label) : [v.tire];
        const rows = []; sizes.forEach((s) => rows.push.apply(rows, tireCardsForSize(s)));
        res.innerHTML =
          '<div class="card card-body mb-24"><div class="grid-main-side" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);align-items:center">' +
          '<div class="flex items-center gap-16"><div style="width:180px;flex-shrink:0">' + AC.art.car({ body: v.body, color: '#c0c6cd' }) + '</div><div><div class="xs muted strong">YOUR VEHICLE</div><div class="h4">' + d.year + ' ' + v.brand + ' ' + v.model + '</div><div class="small muted">' + v.fuel + ' · ' + v.pcd + ' · CB ' + v.cb + ' mm</div></div></div>' +
          '<div class="fit-result">' +
          '<div class="fit-spec' + (d.rim ? '' : ' primary') + '"><div class="l">OEM tire size</div><div class="v">' + v.tire + '</div></div>' +
          (d.rim ? fit.options.map((o, i) => '<div class="fit-spec' + (i === 1 || fit.options.length === 1 ? ' primary' : '') + '"><div class="l">' + d.rim + '″ option</div><div class="v">' + o.label + '</div><div class="xs muted mt-4">' + (o.dev >= 0 ? '+' : '') + o.dev.toFixed(1) + '% diameter</div></div>').join('') : '') +
          '</div></div></div>' +
          resultBlock(rows.length + ' compatible tire' + (rows.length === 1 ? '' : 's'), 'Matched to ' + sizes.join(', ') + ' — within ±3% of OEM overall diameter.', rows, '<a class="btn btn-outline" href="#/wheels?brand=' + encodeURIComponent(v.brand) + '&model=' + encodeURIComponent(v.model) + '">' + AC.icon('wheel') + 'Check mags for this car</a>');
      } else if (mode === 'size') {
        let size = d.w + '/' + d.a + ' R' + d.r;
        if (d.typed) { const t = VD.parseTire(d.typed); if (!t) { AC.ui.toast('Invalid tire size', 'Use the format 195/55 R16.', 'warning'); return; } size = t.label; }
        const rows = tireCardsForSize(size);
        res.innerHTML = '<div class="card card-body mb-24 flex between items-center wrap gap-16"><div>' + sizeDiagram(size) + '</div><div class="small muted" style="max-width:360px">Tip: the size is printed on your tire’s sidewall — e.g. <b class="mono">195/55 R16 87V</b>.</div></div>' +
          resultBlock(rows.length + ' tire' + (rows.length === 1 ? '' : 's') + ' in ' + size, 'Sorted by availability and price.', rows);
      } else if (mode === 'brand') {
        const rows = [];
        products('tires').filter((p) => p.brand === d.brand && (!d.type || p.specs['Tire Type'] === d.type)).forEach((p) => {
          const v = d.rim ? p.variants.find((x) => x.attrs.rim === +d.rim) : null;
          if (!d.rim || v) rows.push({ p, v });
        });
        res.innerHTML = resultBlock(d.brand + ' tires', rows.length + ' model' + (rows.length === 1 ? '' : 's') + (d.rim ? ' available in R' + d.rim : ''), rows);
      } else {
        const rows = [];
        products('tires').forEach((p) => { const v = p.variants.filter((x) => x.attrs.rim === +d.rim && x.price <= +d.max && x.stock > 0).sort((a, b) => a.price - b.price)[0]; if (v) rows.push({ p, v }); });
        rows.sort(d.pri === 'rating' ? (a, b) => b.p.rating - a.p.rating : (a, b) => (a.v.price / a.p.rating) - (b.v.price / b.p.rating));
        res.innerHTML = resultBlock('Best tires under ' + (+d.max > 99998 ? 'any budget' : u.peso(d.max)), 'R' + d.rim + ' · in stock · ' + (d.pri === 'rating' ? 'highest rated first' : 'best value (price ÷ rating) first'), rows);
      }
    }

    el.querySelector('.finder-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (!b) return; mode = b.dataset.mode; drawForm(); search(); });
    form.addEventListener('submit', (e) => { e.preventDefault(); search(); res.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    drawForm(); search();
  };

  /* ---------------- Wheel Fitment ---------------- */
  AC.shopViews.wheelFinder = function (el) {
    el.innerHTML =
      '<div class="card card-body mb-24"><div class="flex items-center gap-12 mb-16"><div class="icon-tile">' + AC.icon('wheel') + '</div><div><div class="h4">Wheel compatibility check</div><div class="small muted">Vehicle Brand → Model → Year → Wheel Diameter</div></div></div>' +
      '<form class="finder-panel" style="padding:0" data-form novalidate>' + vehicleSelects('wf', u.qsParam('brand') || 'Toyota', u.qsParam('model') || 'Vios', u.qsParam('year') || 2022) +
      AC.ui.field('Wheel diameter', '<select class="select" name="dia">' + opts([15, 16, 17, 18, 19, 20].map((d) => ({ value: d, label: d + '-inch' })), u.qsParam('dia') || 17) + '</select>') +
      '<button class="btn btn-primary btn-lg" type="submit">' + AC.icon('search') + 'Check fitment</button></form></div>' +
      '<div data-result></div>';
    const form = el.querySelector('[data-form]'), res = el.querySelector('[data-result]');
    wireVehicle(form);

    function run() {
      const d = AC.ui.formData(form);
      const v = VD.find(d.brand, d.model), fit = VD.wheelFitment(v, +d.dia);
      const stock = VD.parseTire(v.tire);
      const wheels = [];
      products('wheels').forEach((p) => {
        const match = p.variants.filter((x) => x.attrs.pcd === v.pcd && x.attrs.diameter === +d.dia);
        if (!match.length) return;
        match.sort((a, b) => Math.abs(a.attrs.offset - fit.offset) - Math.abs(b.attrs.offset - fit.offset));
        wheels.push({ p, v: match[0], ok: match[0].attrs.offset >= v.etMin - 5 && match[0].attrs.offset <= v.etMax + 5 });
      });
      wheels.sort((a, b) => b.ok - a.ok || (b.v.stock > 0) - (a.v.stock > 0));
      const tires = tireCardsForSize(fit.tire).slice(0, 4);
      const et = (n) => (n >= 0 ? '+' : '') + n;
      res.innerHTML =
        '<div class="grid-main-side mb-24" style="grid-template-columns:minmax(0,1.4fr) minmax(0,1fr)">' +
        '<div class="card card-body"><div class="flex between items-start wrap gap-12 mb-16"><div><div class="xs muted strong">RECOMMENDED FITMENT</div><div class="h3 mt-4">' + d.year + ' ' + v.brand + ' ' + v.model + ' · ' + d.dia + '-inch</div></div>' +
        (+d.dia < stock.rim ? '<span class="badge badge-orange">Below OEM rim — check brake clearance</span>' : +d.dia - stock.rim >= 3 ? '<span class="badge badge-orange">Aggressive plus-size</span>' : '<span class="badge badge-green">Recommended</span>') + '</div>' +
        '<div class="fit-result">' +
        '<div class="fit-spec primary"><div class="l">Wheel size</div><div class="v">' + d.dia + 'x' + fit.width + '</div></div>' +
        '<div class="fit-spec"><div class="l">PCD (bolt pattern)</div><div class="v">' + fit.pcd + '</div></div>' +
        '<div class="fit-spec"><div class="l">Offset</div><div class="v">ET ' + et(fit.offset) + '</div><div class="xs muted mt-4">Range ' + et(fit.offsetRange[0]) + ' to ' + et(fit.offsetRange[1]) + '</div></div>' +
        '<div class="fit-spec"><div class="l">Center bore</div><div class="v">' + fit.cb + '</div><div class="xs muted mt-4">mm · hub rings if larger</div></div>' +
        '<div class="fit-spec primary"><div class="l">Recommended tire</div><div class="v">' + fit.tire + '</div></div>' +
        '</div></div>' +
        '<div class="card card-body"><div class="strong mb-8">Alternative tire sizes</div>' +
        (fit.tireOptions.length ? fit.tireOptions.map((o) => '<div class="list-row"><span class="mono strong">' + o.label + '</span><span class="small muted ml-auto">' + (o.dev >= 0 ? '+' : '') + o.dev.toFixed(1) + '% Ø</span></div>').join('') : '<p class="muted small">No safe sizes within ±3%.</p>') +
        '<div class="alert mt-12">' + AC.icon('info') + '<div class="small">OEM: <b class="mono">' + v.tire + '</b> on ' + stock.rim + '″. Width range ' + fit.widthRange[0] + '–' + fit.widthRange[1] + 'J.</div></div></div></div>' +
        '<div class="flex between items-end wrap gap-12 mb-16"><div><h2 class="h3">' + wheels.length + ' compatible wheel' + (wheels.length === 1 ? '' : 's') + '</h2><p class="muted mt-4">' + d.dia + '″ · ' + v.pcd + ' · sorted by closest offset</p></div></div>' +
        (wheels.length ? '<div class="product-grid stagger">' + wheels.map((w) => AC.shopUI.card(w.p, { variant: w.v })).join('') + '</div>' : AC.ui.empty('wheel', 'No ' + d.dia + '″ ' + v.pcd + ' wheels in stock', 'Try another diameter or ask us about special orders.')) +
        '<h2 class="h3 mt-32 mb-16">Tires for this setup · ' + fit.tire + '</h2>' +
        (tires.length ? '<div class="product-grid">' + tires.map((t) => AC.shopUI.card(t.p, { variant: t.v })).join('') + '</div>' : AC.ui.empty('tire', 'No tires in ' + fit.tire + ' yet', '<a class="link" href="#/tires?size=' + encodeURIComponent(fit.tire) + '">Search similar sizes</a>'));
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
    run();
  };
})();

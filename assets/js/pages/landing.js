/* =========================================================
   AUTOCARE — pages/landing.js
   Public landing page: hero visual, quick booking, services,
   vehicle directory (search + brand filter), shop categories,
   featured products, fitment search, contact form.
   ========================================================= */
(function () {
  const u = AC.u, V = AC.data.vehicles, S = AC.store.s;

  AC.shell.site({ active: 'Home', dark: true });
  AC.ui.hydrate();

  /* Hero car */
  u.$('[data-hero-car]').innerHTML = AC.art.car({ body: 'suv', color: '#d9dee5', hero: true, label: 'Premium SUV' });
  u.$('[data-about-art]').innerHTML = AC.art.car({ body: 'sedan', color: '#3b82f6', label: 'Sedan' });

  /* Brand strip */
  u.$('[data-brands]').innerHTML = ['Michelin', 'Bridgestone', 'Yokohama', 'Continental', 'Enkei', 'RAYS', 'BBS', 'Motolite'].map((b) => '<span>' + b + '</span>').join('');

  /* Selects helpers */
  const opts = (arr, sel) => arr.map((x) => '<option' + (x === sel ? ' selected' : '') + '>' + u.esc(x) + '</option>').join('');
  function linkBrandModel(brandSel, modelSel, yearSel) {
    brandSel.innerHTML = opts(V.brands(), 'Toyota');
    const fill = () => {
      modelSel.innerHTML = opts(V.models(brandSel.value));
      if (yearSel) { const v = V.find(brandSel.value, modelSel.value); yearSel.innerHTML = opts(v.years.slice().reverse().map(String)); }
    };
    brandSel.onchange = fill;
    if (yearSel) modelSel.onchange = () => { const v = V.find(brandSel.value, modelSel.value); yearSel.innerHTML = opts(v.years.slice().reverse().map(String)); };
    fill();
  }

  /* Quick book */
  const qb = u.$('[data-quickbook]');
  linkBrandModel(qb.brand, qb.model);
  qb.service.innerHTML = AC.data.services.map((s) => '<option value="' + s.id + '">' + u.esc(s.name) + ' — from ' + u.peso(s.price) + '</option>').join('');
  qb.addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = 'customer.html#/book?service=' + encodeURIComponent(qb.service.value) + '&brand=' + encodeURIComponent(qb.brand.value) + '&model=' + encodeURIComponent(qb.model.value);
  });

  /* Services */
  u.$('[data-services]').innerHTML = AC.data.serviceCategories.map((s) =>
    '<a class="card card-hover service-card ' + (s.feature ? 'feature' : '') + '" href="customer.html#/book">' +
    '<div class="icon-tile">' + AC.icon(s.icon) + '</div><h3>' + u.esc(s.name) + '</h3><p>' + u.esc(s.desc) + '</p>' +
    '<span class="more">Book this service ' + AC.icon('arrow-right') + '</span></a>').join('');

  /* Vehicles directory */
  let vBrand = 'All', vQuery = '', vLimit = 12;
  const brandChips = u.$('[data-veh-brands]');
  brandChips.innerHTML = ['All'].concat(V.brands()).map((b) => '<button class="chip ' + (b === 'All' ? 'active' : '') + '" data-b="' + b + '" role="tab">' + b +
    ' <span class="count">' + (b === 'All' ? V.catalog.length : V.models(b).length) + '</span></button>').join('');
  const BODY = { sedan: 'Sedan', hatch: 'Hatchback', suv: 'SUV / MPV', pickup: 'Pickup', van: 'Van' };
  function renderVehicles() {
    const list = V.catalog.filter((v) => (vBrand === 'All' || v.brand === vBrand) && u.match(v.brand + ' ' + v.model + ' ' + v.body, vQuery));
    const grid = u.$('[data-veh-grid]');
    grid.innerHTML = list.slice(0, vLimit).map((v) =>
      '<div class="card card-hover" style="padding:16px;display:flex;flex-direction:column;gap:10px">' +
      '<div style="background:var(--gray-bg);border-radius:10px;padding:10px 6px">' + AC.art.car({ body: v.body, color: ['#c0c6cd', '#eef0f2', '#1f2329', '#7b828b', '#1e3a6e'][u.hash(v.model) % 5], label: v.brand + ' ' + v.model }) + '</div>' +
      '<div class="flex between items-center gap-8"><div><div class="xs muted strong" style="letter-spacing:.06em;text-transform:uppercase">' + v.brand + '</div><div class="strong">' + u.esc(v.model) + '</div></div><span class="tag">' + BODY[v.body] + '</span></div>' +
      '<div class="small muted mono">' + v.tire + ' · ' + v.pcd + ' · ' + v.fuel + '</div>' +
      '<div class="flex gap-8"><a class="btn btn-outline btn-sm grow" href="shop.html#/tires?brand=' + encodeURIComponent(v.brand) + '&model=' + encodeURIComponent(v.model) + '">Find tires</a><a class="btn btn-primary btn-sm grow" href="customer.html#/book?brand=' + encodeURIComponent(v.brand) + '&model=' + encodeURIComponent(v.model) + '">Book</a></div></div>').join('') ||
      '<div style="grid-column:1/-1">' + AC.ui.empty('car', 'No vehicles match', 'Try another make or model.') + '</div>';
    u.$('[data-veh-more]').style.display = list.length > vLimit ? '' : 'none';
  }
  brandChips.addEventListener('click', (e) => {
    const c = e.target.closest('[data-b]'); if (!c) return;
    vBrand = c.dataset.b; vLimit = 12;
    brandChips.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === c));
    renderVehicles();
  });
  u.$('[data-veh-search]').addEventListener('input', u.debounce((e) => { vQuery = e.target.value.trim(); renderVehicles(); }, 150));
  u.$('[data-veh-more]').onclick = () => { vLimit += 12; renderVehicles(); };
  renderVehicles();

  /* Shop categories + featured */
  const H = AC.data.productHelpers;
  u.$('[data-cats]').innerHTML = AC.data.categories.map((c) => {
    const p = S.products.find((x) => x.cat === c.id);
    const n = S.products.filter((x) => x.cat === c.id).length;
    return '<a class="card card-hover cat-tile" href="shop.html#/category/' + c.id + '"><div class="art">' + AC.art.product(p) + '</div><div><b>' + c.name + '</b><br><span>' + n + ' products</span></div></a>';
  }).join('');
  const featured = ['Michelin', 'Enkei', 'Bridgestone', 'RAYS'].map((b) => S.products.find((p) => p.brand === b));
  u.$('[data-featured]').innerHTML = featured.filter(Boolean).map((p) => AC.shopUI.card(p, { base: 'shop.html#/product/' })).join('');
  void H;

  /* Fitment form */
  const ff = u.$('[data-fitform]');
  linkBrandModel(ff.brand, ff.model, ff.year);
  ff.addEventListener('submit', (e) => {
    e.preventDefault();
    location.href = 'shop.html#/' + ff.type.value + '?brand=' + encodeURIComponent(ff.brand.value) + '&model=' + encodeURIComponent(ff.model.value) + '&year=' + ff.year.value;
  });

  /* Contact info + form */
  u.$$('[data-set]').forEach((el) => { el.textContent = S.settings[el.dataset.set]; });
  const cf = u.$('[data-contact]');
  cf.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!AC.ui.validate(cf)) return;
    await AC.ui.busy(cf.querySelector('button[type=submit]'), 800);
    AC.ui.toast('Message sent', 'Our team will get back to you within 1 business day.', 'success');
    cf.reset();
  });

  /* Smooth anchor + active nav on scroll */
  const navLinks = u.$$('.site-nav a');
  const sections = ['home', 'services', 'vehicles', 'about', 'contact'].map((id) => document.getElementById(id));
  window.addEventListener('scroll', u.debounce(() => {
    let cur = 'home';
    sections.forEach((s) => { if (s && s.getBoundingClientRect().top < 140) cur = s.id; });
    navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === 'index.html#' + cur));
  }, 50), { passive: true });

  AC.ui.reveal();
})();

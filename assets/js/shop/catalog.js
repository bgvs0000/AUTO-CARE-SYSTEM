/* =========================================================
   AUTOCARE — shop/catalog.js
   Product listing with live filters (brand, price, stock,
   rating, tire rim/type, wheel diameter/PCD), search,
   sorting and "load more" pagination.
   ========================================================= */
window.AC = window.AC || {};
AC.shopViews = AC.shopViews || {};

AC.shopViews.catalog = function (el, cat) {
  const u = AC.u, H = AC.data.productHelpers;
  const all = AC.store.s.products.filter((p) => !cat || p.cat === cat);
  const f = { q: u.qsParam('q') || '', brands: new Set(), min: '', max: '', inStock: false, rating: 0, rim: '', type: '', dia: '', pcd: '', sort: 'popular', limit: 16 };

  const brands = Array.from(new Set(all.map((p) => p.brand))).sort();
  const count = (fn) => all.filter(fn).length;
  const uniq = (arr) => Array.from(new Set(arr)).sort((a, b) => (+a || a) > (+b || b) ? 1 : -1);

  let extra = '';
  if (cat === 'tires') {
    const rims = uniq(all.flatMap((p) => p.variants.map((v) => v.attrs.rim)));
    const types = uniq(all.map((p) => p.specs['Tire Type']));
    extra = group('Rim size', '<div class="chips" data-rim>' + rims.map((r) => '<button class="chip" data-v="' + r + '">R' + r + '</button>').join('') + '</div>') +
      group('Tire type', '<div class="filter-list">' + types.map((t) => '<label class="check"><input type="radio" name="ttype" value="' + u.esc(t) + '"> ' + u.esc(t) + '</label>').join('') + '<label class="check"><input type="radio" name="ttype" value="" checked> Any type</label></div>');
  } else if (cat === 'wheels') {
    const dias = uniq(all.flatMap((p) => p.variants.map((v) => v.attrs.diameter)));
    const pcds = uniq(all.flatMap((p) => p.variants.map((v) => v.attrs.pcd)));
    extra = group('Diameter', '<div class="chips" data-dia>' + dias.map((r) => '<button class="chip" data-v="' + r + '">' + r + '"</button>').join('') + '</div>') +
      group('Bolt pattern (PCD)', AC.ui.select('pcd', [{ value: '', label: 'Any PCD' }].concat(pcds.map((p) => ({ value: p, label: p }))), '', 'data-pcd'));
  }

  function group(title, inner) { return '<div class="filter-group"><div class="filter-title">' + title + '</div>' + inner + '</div>'; }

  el.innerHTML =
    '<div class="shop-layout">' +
    '<aside class="filters" data-filters aria-label="Filters">' +
    '<div class="filters-drawer-head"><b>Filters</b><button class="icon-btn" data-close-filters aria-label="Close filters">' + AC.icon('x') + '</button></div>' +
    group('Category', '<div class="filter-list" style="max-height:none">' + '<a class="check" href="#/all" style="' + (!cat ? 'font-weight:700' : '') + '">All products <span class="c">' + AC.store.s.products.length + '</span></a>' +
      AC.data.categories.map((c) => '<a class="check" href="#/category/' + c.id + '" style="' + (cat === c.id ? 'font-weight:700;color:var(--blue-600)' : '') + '">' + c.name + '<span class="c">' + AC.store.s.products.filter((p) => p.cat === c.id).length + '</span></a>').join('') + '</div>') +
    extra +
    group('Brand', '<div class="filter-list" data-brands>' + brands.map((b) => '<label class="check"><input type="checkbox" value="' + u.esc(b) + '"> ' + u.esc(b) + '<span class="c">' + count((p) => p.brand === b) + '</span></label>').join('') + '</div>') +
    group('Price (₱)', '<div class="price-inputs"><input class="input input-sm" type="number" min="0" placeholder="Min" data-min aria-label="Minimum price"><input class="input input-sm" type="number" min="0" placeholder="Max" data-max aria-label="Maximum price"></div>' +
      '<div class="chips mt-8" data-budget>' + (cat === 'wheels' ? [[0, 40000], [40000, 80000], [80000, 999999]] : cat === 'tires' ? [[0, 5000], [5000, 8000], [8000, 99999]] : [[0, 1000], [1000, 5000], [5000, 999999]]).map((r) => '<button class="chip" style="height:28px;font-size:12px" data-r="' + r.join('-') + '">' + (r[1] > 99998 ? u.pesoShort(r[0]) + '+' : u.pesoShort(r[0]) + '–' + u.pesoShort(r[1])) + '</button>').join('') + '</div>') +
    group('Availability & rating', '<label class="check mb-8"><input type="checkbox" data-instock> In stock only</label><div class="filter-list">' + [4.8, 4.5, 4].map((r) => '<label class="check"><input type="radio" name="rating" value="' + r + '"> ' + AC.ui.stars(r) + ' ' + r + '+</label>').join('') + '<label class="check"><input type="radio" name="rating" value="0" checked> Any rating</label></div>') +
    '<button class="btn btn-outline btn-block mt-8" data-clear>Clear all filters</button>' +
    '</aside>' +
    '<section>' +
    '<div class="shop-toolbar">' +
    '<button class="btn btn-outline filter-toggle" data-open-filters>' + AC.icon('sliders') + 'Filters</button>' +
    '<div class="searchbar">' + AC.icon('search') + '<input class="input" type="search" placeholder="Search ' + (cat ? AC.data.productHelpers.catName(cat).toLowerCase() : 'products') + ', brands, sizes…" value="' + u.esc(f.q) + '" data-q aria-label="Search products"></div>' +
    '<div class="flex items-center gap-10"><span class="small muted nowrap" data-count></span>' +
    AC.ui.select('sort', [{ value: 'popular', label: 'Most popular' }, { value: 'rating', label: 'Top rated' }, { value: 'low', label: 'Price: Low to High' }, { value: 'high', label: 'Price: High to Low' }, { value: 'name', label: 'Name A–Z' }], 'popular', 'data-sort style="width:auto;height:38px" aria-label="Sort products"') +
    '</div></div>' +
    '<div class="chips mb-16" data-active></div>' +
    '<div class="product-grid" data-grid></div>' +
    '<div class="text-center mt-24"><button class="btn btn-outline" data-more>Load more products</button></div>' +
    '</section></div><div class="page-overlay" data-fov></div>';

  const $ = (s) => el.querySelector(s);
  const grid = $('[data-grid]');

  function filtered() {
    let list = all.filter((p) => {
      if (f.brands.size && !f.brands.has(p.brand)) return false;
      if (f.type && p.specs['Tire Type'] !== f.type) return false;
      if (f.rating && p.rating < f.rating) return false;
      if (f.q && !u.match([p.title, p.brand, p.cat, p.variants.map((v) => v.label).join(' '), Object.values(p.specs).join(' ')], f.q)) return false;
      const vs = p.variants.filter((v) => (!f.rim || v.attrs && v.attrs.rim === +f.rim) && (!f.dia || v.attrs && v.attrs.diameter === +f.dia) && (!f.pcd || v.attrs && v.attrs.pcd === f.pcd) &&
        (!f.inStock || v.stock > 0) && (f.min === '' || v.price >= +f.min) && (f.max === '' || v.price <= +f.max));
      if (!vs.length) return false;
      p._v = (f.rim || f.dia || f.pcd || f.min !== '' || f.max !== '') ? vs[0] : null;
      return true;
    });
    const price = (p) => (p._v ? p._v.price : H.minPrice(p));
    const sorts = { popular: (a, b) => b.reviews - a.reviews, rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews, low: (a, b) => price(a) - price(b), high: (a, b) => price(b) - price(a), name: (a, b) => a.title.localeCompare(b.title) };
    return list.sort(sorts[f.sort]);
  }

  function renderActive() {
    const chips = [];
    if (f.q) chips.push(['q', '“' + f.q + '”']);
    f.brands.forEach((b) => chips.push(['brand:' + b, b]));
    if (f.rim) chips.push(['rim', 'R' + f.rim]);
    if (f.type) chips.push(['type', f.type]);
    if (f.dia) chips.push(['dia', f.dia + '"']);
    if (f.pcd) chips.push(['pcd', f.pcd]);
    if (f.min !== '' || f.max !== '') chips.push(['price', (f.min !== '' ? u.peso(f.min) : '₱0') + ' – ' + (f.max !== '' ? u.peso(f.max) : 'any')]);
    if (f.inStock) chips.push(['stock', 'In stock']);
    if (f.rating) chips.push(['rating', f.rating + '+ stars']);
    $('[data-active]').innerHTML = chips.map((c) => '<button class="chip" style="height:30px" data-rm="' + u.esc(c[0]) + '">' + u.esc(c[1]) + AC.icon('x') + '</button>').join('');
  }

  function render() {
    const list = filtered();
    $('[data-count]').textContent = list.length + ' product' + (list.length === 1 ? '' : 's');
    grid.innerHTML = list.length ? list.slice(0, f.limit).map((p) => AC.shopUI.card(p, { variant: p._v })).join('') :
      '<div style="grid-column:1/-1">' + AC.ui.empty('search', 'No products match your filters', 'Try removing a filter or searching for something else.', '<button class="btn btn-outline mt-8" data-clear>Clear filters</button>') + '</div>';
    grid.classList.remove('stagger'); void grid.offsetWidth; grid.classList.add('stagger');
    $('[data-more]').style.display = list.length > f.limit ? '' : 'none';
    renderActive();
  }

  /* Events */
  $('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); f.limit = 16; render(); }, 180));
  $('[data-sort]').onchange = (e) => { f.sort = e.target.value; render(); };
  $('[data-more]').onclick = () => { f.limit += 16; render(); };
  $('[data-brands]').addEventListener('change', (e) => { e.target.checked ? f.brands.add(e.target.value) : f.brands.delete(e.target.value); f.limit = 16; render(); });
  $('[data-min]').addEventListener('input', u.debounce((e) => { f.min = e.target.value; render(); }, 250));
  $('[data-max]').addEventListener('input', u.debounce((e) => { f.max = e.target.value; render(); }, 250));
  $('[data-instock]').onchange = (e) => { f.inStock = e.target.checked; render(); };
  el.querySelectorAll('input[name=rating]').forEach((r) => (r.onchange = () => { f.rating = +r.value; render(); }));
  el.querySelectorAll('input[name=ttype]').forEach((r) => (r.onchange = () => { f.type = r.value; render(); }));
  const chipToggle = (sel, key) => { const c = $(sel); if (!c) return; c.addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; f[key] = f[key] === b.dataset.v ? '' : b.dataset.v; c.querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x.dataset.v === f[key])); render(); }); };
  chipToggle('[data-rim]', 'rim'); chipToggle('[data-dia]', 'dia');
  if ($('[data-pcd]')) $('[data-pcd]').onchange = (e) => { f.pcd = e.target.value; render(); };
  $('[data-budget]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-r]'); if (!b) return;
    const [a, z] = b.dataset.r.split('-');
    f.min = a; f.max = z; $('[data-min]').value = a; $('[data-max]').value = z;
    $('[data-budget]').querySelectorAll('.chip').forEach((x) => x.classList.toggle('active', x === b));
    render();
  });
  function clearAll() {
    Object.assign(f, { q: '', brands: new Set(), min: '', max: '', inStock: false, rating: 0, rim: '', type: '', dia: '', pcd: '', limit: 16 });
    el.querySelectorAll('[data-filters] input[type=checkbox]').forEach((c) => (c.checked = false));
    el.querySelectorAll('input[name=rating][value="0"], input[name=ttype][value=""]').forEach((c) => (c.checked = true));
    el.querySelectorAll('[data-filters] .chip').forEach((c) => c.classList.remove('active'));
    el.querySelectorAll('[data-min],[data-max],[data-q]').forEach((i) => (i.value = ''));
    if ($('[data-pcd]')) $('[data-pcd]').value = '';
    render();
  }
  el.addEventListener('click', (e) => {
    if (e.target.closest('[data-clear]')) clearAll();
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      const k = rm.dataset.rm;
      if (k === 'q') { f.q = ''; $('[data-q]').value = ''; }
      else if (k.startsWith('brand:')) { const b = k.slice(6); f.brands.delete(b); const cb = el.querySelector('[data-brands] input[value="' + CSS.escape(b) + '"]'); if (cb) cb.checked = false; }
      else if (k === 'price') { f.min = f.max = ''; $('[data-min]').value = $('[data-max]').value = ''; $('[data-budget]').querySelectorAll('.chip').forEach((x) => x.classList.remove('active')); }
      else if (k === 'stock') { f.inStock = false; $('[data-instock]').checked = false; }
      else if (k === 'rating') { f.rating = 0; el.querySelector('input[name=rating][value="0"]').checked = true; }
      else if (k === 'type') { f.type = ''; el.querySelector('input[name=ttype][value=""]').checked = true; }
      else { f[k] = ''; if (k === 'pcd') $('[data-pcd]').value = ''; el.querySelectorAll('[data-' + k + '] .chip').forEach((x) => x.classList.remove('active')); }
      render();
    }
  });
  const fl = $('[data-filters]'), fov = $('[data-fov]');
  $('[data-open-filters]').onclick = () => { fl.classList.add('open'); fov.classList.add('show'); };
  const closeF = () => { fl.classList.remove('open'); fov.classList.remove('show'); };
  $('[data-close-filters]').onclick = closeF; fov.onclick = closeF;

  render();
};

/* =========================================================
   AUTOCARE — shop/shop-app.js
   Shop bootstrapper: site header, category nav, hero text
   per route, and hash routes for every shop view.
   ========================================================= */
(function () {
  const u = AC.u, V = AC.shopViews;

  AC.shell.site({ active: 'Shop' });
  AC.ui.hydrate();

  const nav = u.$('[data-catnav]');
  nav.innerHTML = '<a class="chip" href="#/all" data-c="all">' + AC.icon('grid') + 'All Products</a>' +
    AC.data.categories.filter((c) => (AC.store.s.shopCats || {})[c.id] !== false).map((c) => '<a class="chip" href="#/category/' + c.id + '" data-c="' + c.id + '">' + AC.icon(c.icon) + c.name + '</a>').join('');

  const HERO = {
    all: ['AutoCare Shop', 'Tires, mags, parts & accessories — guaranteed fitment.'],
    tires: ['Tire Finder', 'Search by vehicle, tire size, brand or budget.'],
    wheels: ['Wheel Fitment', 'Find mags that bolt on right — PCD, offset & center bore checked.'],
    cart: ['Your Cart', 'Review items before checkout.'],
    checkout: ['Checkout', 'Secure checkout · Store pickup or local delivery.'],
    success: ['Order Confirmed', 'Thank you for shopping with AutoCare.']
  };

  function setHero(name, params) {
    let t = HERO[name] || HERO.all, crumbs = [['Home', 'index.html'], ['Shop', '#/all']];
    if (name === 'category') {
      const c = AC.data.categories.find((x) => x.id === params[0]);
      if (c) { t = [c.name, c.desc + ' · ' + AC.store.s.products.filter((p) => p.cat === c.id).length + ' products']; crumbs.push([c.name]); }
    } else if (name === 'product') {
      const p = AC.store.product(params[0]);
      if (p) { t = [p.brand, AC.data.productHelpers.catName(p.cat)]; crumbs.push([AC.data.productHelpers.catName(p.cat), '#/category/' + p.cat], [p.name]); }
    } else if (HERO[name] && name !== 'all') crumbs.push([HERO[name][0]]);
    u.$('[data-shop-title]').textContent = t[0];
    u.$('[data-shop-sub]').textContent = t[1];
    u.$('[data-crumbs]').innerHTML = crumbs.map((c, i) => (i ? AC.icon('chevron-right') : '') + (c[1] ? '<a href="' + c[1] + '">' + u.esc(c[0]) + '</a>' : '<span style="color:#fff">' + u.esc(c[0]) + '</span>')).join('');
    const active = name === 'category' ? params[0] : name === 'product' ? (AC.store.product(params[0]) || {}).cat : name === 'all' ? 'all' : '';
    nav.querySelectorAll('.chip').forEach((c) => c.classList.toggle('active', c.dataset.c === active));
    const a = nav.querySelector('.chip.active'); if (a) a.scrollIntoView({ block: 'nearest', inline: 'center' });
    document.title = t[0] + ' · AutoCare Shop';
  }

  AC.router.start({
    all: (el) => V.catalog(el, null),
    category: (el, p) => V.catalog(el, p[0]),
    tires: (el) => V.tireFinder(el),
    wheels: (el) => V.wheelFinder(el),
    product: (el, p) => V.product(el, p[0]),
    cart: (el) => V.cart(el),
    checkout: (el) => V.checkout(el),
    success: (el, p) => V.success(el, p[0])
  }, 'all', setHero);
})();

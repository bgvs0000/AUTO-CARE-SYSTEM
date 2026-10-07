/* =========================================================
   AUTOCARE — core/shell.js
   Layout builders:
   - AC.shell.app()   → sidebar + topbar app shell (admin/customer)
   - AC.shell.site()  → public website header, mobile menu, footer
   - AC.router        → tiny hash router with page transitions
   ========================================================= */
window.AC = window.AC || {};

AC.logo = function (light) {
  return '<a href="index.html" class="logo ' + (light ? 'light' : '') + '" aria-label="AutoCare home"><span class="logo-mark">' + AC.icon('wrench') + '</span><span class="logo-text">AUTO<b>CARE</b></span></a>';
};

/* ---------------- Router ---------------- */
AC.router = (function () {
  let routes = {}, def = 'dashboard', hook = null, viewEl = null;
  function parse() {
    const h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    const parts = h.split('/').filter(Boolean).map(decodeURIComponent);
    return { name: parts[0] || def, params: parts.slice(1) };
  }
  function render() {
    const r = parse();
    const fn = routes[r.name] || routes[def];
    const name = routes[r.name] ? r.name : def;
    if (!viewEl) viewEl = document.getElementById('view');
    viewEl.classList.remove('page-enter');
    void viewEl.offsetWidth;
    viewEl.innerHTML = '';
    // Fresh page node per route so view-level event listeners never accumulate
    const page = document.createElement('div');
    viewEl.appendChild(page);
    try { fn(page, r.params); } catch (e) { console.error(e); page.innerHTML = AC.ui.empty('alert', 'Something went wrong', AC.u.esc(e.message)); }
    viewEl.classList.add('page-enter');
    window.scrollTo(0, 0);
    hook && hook(name, r.params);
  }
  return {
    start(map, defaultName, onRoute) { routes = map; def = defaultName; hook = onRoute; window.addEventListener('hashchange', render); render(); },
    go(path) { if (location.hash === '#/' + path) render(); else location.hash = '#/' + path; },
    refresh: render,
    current: parse
  };
})();

AC.shell = (function () {
  const u = AC.u;

  /* ---------- App shell (admin / customer) ---------- */
  function app(o) {
    const s = AC.store.s;
    const aud = o.role === 'admin' ? 'admin' : 'customer';
    const navHtml = o.nav.map((sec) =>
      (sec.label ? '<div class="nav-label">' + sec.label + '</div>' : '') +
      sec.items.map((it) => '<a class="nav-link" href="' + (it.href || '#/' + it.id) + '" data-nav="' + it.id + '" data-tip="' + it.label + '">' + AC.icon(it.icon) +
        '<span class="nav-text">' + it.label + '</span>' + (it.count ? '<span class="nav-count" data-count="' + it.id + '"></span>' : '') + '</a>').join('')
    ).join('');

    document.body.innerHTML =
      '<div class="app ' + (o.bottomNav ? 'has-bottom-nav' : '') + '" id="app">' +
      '<aside class="sidebar" aria-label="Main navigation">' +
      '<div class="sidebar-brand">' + AC.logo() + '<span class="sidebar-tag">' + o.tag + '</span></div>' +
      '<nav class="sidebar-nav">' + navHtml + (o.promo || '') + '</nav>' +
      '<div class="sidebar-foot">' +
      '<a class="nav-link" href="' + o.settingsHref + '" data-nav="settings" data-tip="Settings">' + AC.icon('settings') + '<span class="nav-text">Settings</span></a>' +
      '<button class="nav-link" data-logout data-tip="Logout">' + AC.icon('logout') + '<span class="nav-text">Logout</span></button>' +
      '<div class="divider" style="margin:8px 0"></div>' +
      '<button class="user-chip" data-go="' + o.profileHref + '">' + AC.ui.avatar(o.user.name) + '<div class="meta"><div class="name">' + u.esc(o.user.name) + '</div><div class="role">' + u.esc(o.user.role) + '</div></div></button>' +
      '</div></aside>' +
      '<div class="overlay" data-overlay></div>' +
      '<div class="main">' +
      '<header class="topbar">' +
      '<button class="icon-btn menu-btn" data-menu aria-label="Open menu">' + AC.icon('menu') + '</button>' +
      '<button class="icon-btn collapse-btn" data-collapse aria-label="Collapse sidebar">' + AC.icon('sidebar') + '</button>' +
      '<div class="topbar-title" data-title></div>' +
      '<div class="dropdown searchbar" style="flex:0 1 400px">' + AC.icon('search') + '<input class="input" type="search" placeholder="' + o.searchPlaceholder + '" aria-label="Search" data-global-search><kbd class="hide-sm">/</kbd>' +
      '<div class="dropdown-menu left" style="width:100%;max-height:420px;overflow:auto" data-search-results></div></div>' +
      '<div class="topbar-right">' + (o.topExtra || '') +
      '<div class="dropdown"><button class="icon-btn" data-dropdown aria-label="Notifications" aria-expanded="false">' + AC.icon('bell') + '<span class="dot-badge ping" data-notif-count></span></button>' +
      '<div class="dropdown-menu notif-panel" data-notif-panel></div></div>' +
      '<div class="dropdown"><button class="user-btn" data-dropdown aria-label="Account menu">' + AC.ui.avatar(o.user.name, 'sm') + '<span class="name hide-sm">' + u.esc(o.user.name.split(' ')[0]) + '</span>' + AC.icon('chevron-down') + '</button>' +
      '<div class="dropdown-menu">' +
      '<div class="dropdown-header"><div class="strong">' + u.esc(o.user.name) + '</div><div class="small muted">' + u.esc(o.user.email || o.user.role) + '</div></div><div class="dropdown-sep"></div>' +
      o.userMenu.map((m) => m === '-' ? '<div class="dropdown-sep"></div>' : '<a class="dropdown-item ' + (m.danger ? 'danger' : '') + '" href="' + (m.href || '#') + '" ' + (m.attr || '') + '>' + AC.icon(m.icon) + m.label + '</a>').join('') +
      '</div></div></div></header>' +
      '<main class="content" id="view" tabindex="-1"></main></div>' +
      (o.bottomNav ? '<nav class="bottom-nav" aria-label="Quick navigation">' + o.bottomNav.map((b) => '<a href="#/' + b.id + '" data-bnav="' + b.id + '">' + (b.fab ? '<span class="fab">' + AC.icon(b.icon) + '</span>' : AC.icon(b.icon)) + (b.fab ? '' : '<span>' + b.label + '</span>') + '</a>').join('') + '</nav>' : '') +
      '</div>';

    const appEl = document.getElementById('app');
    const isTablet = () => window.innerWidth <= 1024 && window.innerWidth > 768;
    let saved = null; try { saved = localStorage.getItem('autocare.sb.' + o.role); } catch (e) { /* ignore */ }
    if (saved === '1' || (saved === null && isTablet())) appEl.classList.add('collapsed');

    appEl.querySelector('[data-collapse]').onclick = () => {
      appEl.classList.toggle('collapsed');
      try { localStorage.setItem('autocare.sb.' + o.role, appEl.classList.contains('collapsed') ? '1' : '0'); } catch (e) { /* ignore */ }
    };
    const closeNav = () => appEl.classList.remove('nav-open');
    appEl.querySelector('[data-menu]').onclick = () => appEl.classList.add('nav-open');
    appEl.querySelector('[data-overlay]').onclick = closeNav;
    appEl.querySelectorAll('.sidebar .nav-link').forEach((a) => a.addEventListener('click', closeNav));
    appEl.querySelector('[data-go]').onclick = (e) => { location.hash = e.currentTarget.dataset.go; closeNav(); };
    appEl.querySelectorAll('[data-logout]').forEach((b) => b.addEventListener('click', async (e) => {
      e.preventDefault();
      if (await AC.ui.confirm({ title: 'Log out?', message: 'You will be returned to the login screen.', confirmText: 'Logout', icon: 'logout' })) {
        AC.session.logout(o.role === 'admin' ? 'admin' : 'customer');
        location.href = o.role === 'admin' ? 'admin-login.html' : 'login.html';
      }
    }));
    appEl.addEventListener('click', (e) => { const l = e.target.closest('[data-logout-link]'); if (l) { e.preventDefault(); appEl.querySelector('.sidebar [data-logout]').click(); } });

    /* Notifications */
    const ICON = { booking: ['calendar', 'blue'], stock: ['alert', 'orange'], order: ['bag', 'blue'], done: ['check-circle', 'green'], payment: ['wallet', 'green'], service: ['wrench', 'blue'], reminder: ['clock', 'orange'], promo: ['gift', ''] };
    function renderNotifs() {
      const list = AC.store.s.notifications[aud];
      const unread = AC.store.unread(aud);
      const c = appEl.querySelector('[data-notif-count]');
      c.textContent = unread; c.style.display = unread ? '' : 'none';
      appEl.querySelector('[data-notif-panel]').innerHTML =
        '<div class="notif-head"><div><div class="strong">Notifications</div><div class="xs muted">' + unread + ' unread</div></div><button class="btn btn-ghost btn-sm" data-mark-all>Mark all read</button></div>' +
        '<div class="notif-list">' + (list.length ? list.slice(0, 8).map((n) => {
          const ic = ICON[n.type] || ['bell', ''];
          return '<button class="notif-item ' + (n.read ? '' : 'unread') + '" data-notif="' + n.id + '" data-link="' + u.esc(n.link || '') + '"><span class="notif-ico ' + ic[1] + '">' + AC.icon(ic[0]) + '</span><span class="grow"><div class="notif-title">' + u.esc(n.title) + '</div><div class="notif-msg">' + u.esc(n.msg) + '</div><div class="notif-time">' + u.relTime(n.at) + '</div></span></button>';
        }).join('') : AC.ui.empty('bell', 'You\'re all caught up', 'No notifications yet.')) + '</div>' +
        '<div class="notif-foot"><a class="link small" href="#/notifications">View all notifications</a></div>';
    }
    appEl.querySelector('[data-notif-panel]').addEventListener('click', (e) => {
      if (e.target.closest('[data-mark-all]')) { e.stopPropagation(); AC.store.markRead(aud); AC.ui.toast('All notifications marked as read', null, 'success'); return; }
      const it = e.target.closest('[data-notif]');
      if (it) { AC.store.markRead(aud, it.dataset.notif); const l = it.dataset.link; if (l) { if (l.startsWith('#')) location.hash = l; else location.href = l; } }
    });

    /* Counts in sidebar */
    function renderCounts() {
      appEl.querySelectorAll('[data-count]').forEach((el) => {
        const it = o.nav.flatMap((s2) => s2.items).find((x) => x.id === el.dataset.count);
        const n = it && typeof it.count === 'function' ? it.count() : 0;
        el.textContent = n; el.style.display = n ? '' : 'none';
      });
    }

    /* Global search */
    const sInput = appEl.querySelector('[data-global-search]'), sRes = appEl.querySelector('[data-search-results]');
    const runSearch = u.debounce(() => {
      const q = sInput.value.trim();
      const dd = sInput.closest('.dropdown');
      if (q.length < 2) { dd.classList.remove('open'); return; }
      const res = o.search(q).slice(0, 9);
      sRes.innerHTML = res.length ? res.map((r) => '<a class="dropdown-item" href="' + r.href + '">' + AC.icon(r.icon) + '<span class="grow" style="min-width:0"><span class="truncate" style="display:block">' + u.esc(r.title) + '</span><span class="xs muted truncate" style="display:block">' + u.esc(r.sub) + '</span></span></a>').join('') : '<div class="small muted" style="padding:14px">No results for “' + u.esc(q) + '”</div>';
      dd.classList.add('open');
    }, 160);
    sInput.addEventListener('input', runSearch);
    sInput.addEventListener('focus', runSearch);
    sRes.addEventListener('click', () => { sInput.value = ''; sInput.closest('.dropdown').classList.remove('open'); });
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); sInput.focus(); }
    });

    function refresh() { renderNotifs(); renderCounts(); o.onChange && o.onChange(); }
    refresh();
    AC.store.on(refresh);

    function setActive(name) {
      const map = o.alias || {};
      const key = map[name] || name;
      appEl.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === key));
      appEl.querySelectorAll('[data-bnav]').forEach((a) => a.classList.toggle('active', a.dataset.bnav === key));
      const it = o.nav.flatMap((s2) => s2.items).find((x) => x.id === key);
      appEl.querySelector('[data-title]').textContent = it ? it.label : (o.titles && o.titles[name]) || '';
      document.title = (it ? it.label : (o.titles && o.titles[name]) || 'AutoCare') + ' · AutoCare ' + o.tag;
    }
    return { el: appEl, setActive, refresh };
  }

  /* ---------- Page header helper ---------- */
  function pageHead(title, sub, actions, crumbs) {
    return '<div class="page-head"><div>' +
      (crumbs ? '<nav class="breadcrumb" aria-label="Breadcrumb">' + crumbs.map((c, i) => (i ? AC.icon('chevron-right') : '') + (c[1] ? '<a href="' + c[1] + '">' + u.esc(c[0]) + '</a>' : '<span>' + u.esc(c[0]) + '</span>')).join('') + '</nav>' : '') +
      '<h1 class="page-title">' + title + '</h1>' + (sub ? '<p class="page-sub">' + sub + '</p>' : '') + '</div>' +
      (actions ? '<div class="btn-group">' + actions + '</div>' : '') + '</div>';
  }

  /* ---------- Public site header + footer ---------- */
  function site(o) {
    o = o || {};
    const links = [['Home', 'index.html#home', 'home'], ['Services', 'index.html#services', 'wrench'], ['Vehicles', 'index.html#vehicles', 'car'], ['Shop', 'shop.html', 'store'], ['About', 'index.html#about', 'info'], ['Contact', 'index.html#contact', 'phone']];
    const sess = AC.session.get();
    const loggedIn = !!sess.customer;
    const cartBtn = '<a class="icon-btn" href="shop.html#/cart" aria-label="Cart">' + AC.icon('cart') + '<span class="dot-badge" data-cart-count style="display:none"></span></a>';
    const header = document.createElement('header');
    header.className = 'site-header' + (o.dark ? ' on-dark' : '');
    header.innerHTML = '<div class="container">' + AC.logo() +
      '<nav class="site-nav" aria-label="Primary">' + links.map((l) => '<a href="' + l[1] + '" class="' + (o.active === l[0] ? 'active' : '') + '">' + l[0] + '</a>').join('') + '</nav>' +
      '<div class="header-actions">' + cartBtn +
      (loggedIn ? '<a class="btn btn-ghost hide-md" href="customer.html">' + AC.icon('user') + 'My Account</a>' :
        '<a class="btn btn-ghost hide-md" href="login.html">Login</a><a class="btn btn-ghost hide-md" href="register.html">Register</a>') +
      '<a class="btn btn-primary hide-sm" href="customer.html#/book">Book a Service ' + AC.icon('arrow-right', 'i-arrow') + '</a>' +
      '<button class="icon-btn mobile-nav-btn" aria-label="Open menu" data-mnav>' + AC.icon('menu') + '</button></div></div>';
    document.body.prepend(header);

    const ov = document.createElement('div'); ov.className = 'page-overlay';
    const panel = document.createElement('div'); panel.className = 'mobile-panel'; panel.setAttribute('aria-label', 'Mobile menu');
    panel.innerHTML = '<div class="mobile-panel-head">' + AC.logo() + '<button class="icon-btn" data-mclose aria-label="Close menu">' + AC.icon('x') + '</button></div>' +
      '<nav>' + links.map((l) => '<a href="' + l[1] + '" class="' + (o.active === l[0] ? 'active' : '') + '">' + AC.icon(l[2]) + l[0] + '</a>').join('') +
      '<a href="shop.html#/tires">' + AC.icon('tire') + 'Tire Finder</a><a href="shop.html#/wheels">' + AC.icon('wheel') + 'Wheel Fitment</a></nav>' +
      '<div class="mobile-panel-foot"><a class="btn btn-primary btn-block" href="customer.html#/book">Book a Service</a>' +
      (loggedIn ? '<a class="btn btn-outline btn-block" href="customer.html">My Account</a>' : '<div class="grid-2" style="gap:8px"><a class="btn btn-outline" href="login.html">Login</a><a class="btn btn-outline" href="register.html">Register</a></div>') + '</div>';
    document.body.append(ov, panel);
    const open = () => { panel.classList.add('open'); ov.classList.add('show'); };
    const close = () => { panel.classList.remove('open'); ov.classList.remove('show'); };
    header.querySelector('[data-mnav]').onclick = open;
    panel.querySelector('[data-mclose]').onclick = close; ov.onclick = close;
    panel.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', close));

    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

    const updCart = () => { const n = AC.store.cartCount(); header.querySelectorAll('[data-cart-count]').forEach((b) => { b.textContent = n; b.style.display = n ? '' : 'none'; }); };
    updCart(); AC.store.on(updCart);

    if (o.footer !== false) {
      const f = document.createElement('footer');
      f.className = 'site-footer';
      f.innerHTML = '<div class="container"><div class="footer-grid">' +
        '<div>' + AC.logo(true) + '<p class="mt-16" style="color:#a1a1aa;max-width:320px;font-size:14px">Professional automotive services, maintenance, tires, wheels, and vehicle care — all in one platform.</p>' +
        '<div class="mt-16 small" style="color:#a1a1aa">' + u.esc(AC.store.s.settings.address) + '<br>' + u.esc(AC.store.s.settings.phone) + ' · ' + u.esc(AC.store.s.settings.hours) + '</div></div>' +
        '<div><h4>Services</h4><a href="customer.html#/book">Book a Service</a><a href="index.html#services">Preventive Maintenance</a><a href="index.html#services">Tire & Wheel Services</a><a href="index.html#services">Detailing</a><a href="customer.html#/tracking">Track My Service</a></div>' +
        '<div><h4>Shop</h4><a href="shop.html#/category/tires">Tires</a><a href="shop.html#/category/wheels">Mags / Alloy Wheels</a><a href="shop.html#/category/batteries">Batteries</a><a href="shop.html#/tires">Tire Finder</a><a href="shop.html#/wheels">Wheel Fitment</a></div>' +
        '<div><h4>Company</h4><a href="index.html#about">About AutoCare</a><a href="index.html#contact">Contact Us</a><a href="customer.html">Customer Portal</a><a href="admin-login.html">Staff / Admin Login</a></div>' +
        '</div><div class="footer-bottom"><span>© ' + new Date().getFullYear() + ' AutoCare Automotive Services. UI/UX prototype — demo data only.</span><span>Prices in Philippine Peso (₱), VAT inclusive.</span></div></div>';
      document.body.append(f);
    }
    return { header };
  }

  return { app, pageHead, site };
})();

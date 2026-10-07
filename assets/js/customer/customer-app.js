/* =========================================================
   AUTOCARE — customer/customer-app.js
   Customer portal bootstrapper: shell, navigation, global
   search, shared helpers (AC.cust) and hash routes.
   ========================================================= */
(function () {
  const u = AC.u, st = AC.store;

  /* Shared helpers for customer views */
  AC.cust = {
    me: () => AC.session.customer(),
    vehicles: () => st.s.vehicles.filter((v) => v.customerId === AC.session.customerId()),
    appts: () => st.s.appointments.filter((a) => a.customerId === AC.session.customerId()),
    records: () => st.s.records.filter((r) => r.customerId === AC.session.customerId()),
    orders: () => st.s.orders.filter((o) => o.customerId === AC.session.customerId()),
    wos: () => st.s.workOrders.filter((w) => w.customerId === AC.session.customerId()),
    payments: () => st.s.payments.filter((p) => p.customerId === AC.session.customerId()),
    activeWOs: () => AC.cust.wos().filter((w) => w.status !== 'Completed'),
    upcoming: () => AC.cust.appts().filter((a) => a.date >= u.today() && ['Pending', 'Approved', 'Rescheduled'].includes(a.status)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    vehicleArt: (v, hero) => AC.art.car({ body: v.body, color: v.colorHex, hero, label: AC.store.vName(v) })
  };

  const me = AC.cust.me();
  const shell = AC.shell.app({
    role: 'customer', tag: 'MY GARAGE',
    user: { name: me.name, role: me.tier === 'VIP' ? 'VIP Member' : 'Customer', email: me.email },
    nav: [
      { label: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard' }, { id: 'vehicles', label: 'My Vehicles', icon: 'car', count: () => AC.cust.vehicles().length }] },
      { label: 'Service', items: [{ id: 'book', label: 'Book a Service', icon: 'calendar-check' }, { id: 'tracking', label: 'Service Tracking', icon: 'activity', count: () => AC.cust.activeWOs().length }, { id: 'history', label: 'Service History', icon: 'clock' }] },
      { label: 'Shop', items: [{ id: 'orders', label: 'My Orders', icon: 'bag', count: () => AC.cust.orders().filter((o) => !['Completed', 'Cancelled'].includes(o.status)).length }, { id: 'shop', label: 'Shop', icon: 'store', href: 'shop.html' }] },
      { label: 'Account', items: [{ id: 'notifications', label: 'Notifications', icon: 'bell', count: () => st.unread('customer') }, { id: 'profile', label: 'Profile', icon: 'user' }] }
    ],
    promo: '<div class="sidebar-promo"><b>Tire Month Promo</b><p>Buy 3, get 1 on selected Bridgestone &amp; Yokohama tires.</p><a class="btn btn-white btn-sm" href="shop.html#/category/tires">Shop tires</a></div>',
    settingsHref: '#/profile/settings', profileHref: '#/profile',
    searchPlaceholder: 'Search vehicles, bookings, orders…',
    topExtra: '<a class="icon-btn hide-sm" href="shop.html#/cart" aria-label="Cart">' + AC.icon('cart') + '<span class="dot-badge" data-cart-badge style="display:none"></span></a>',
    userMenu: [
      { label: 'My Profile', icon: 'user', href: '#/profile' }, { label: 'My Vehicles', icon: 'car', href: '#/vehicles' }, { label: 'My Orders', icon: 'bag', href: '#/orders' },
      { label: 'Account Settings', icon: 'settings', href: '#/profile/settings' }, '-', { label: 'Visit Website', icon: 'globe', href: 'index.html' },
      { label: 'Logout', icon: 'logout', danger: true, attr: 'data-logout-link' }
    ],
    bottomNav: [{ id: 'dashboard', label: 'Home', icon: 'home' }, { id: 'vehicles', label: 'Vehicles', icon: 'car' }, { id: 'book', label: 'Book', icon: 'plus', fab: true }, { id: 'tracking', label: 'Tracking', icon: 'activity' }, { id: 'orders', label: 'Orders', icon: 'bag' }],
    alias: { vehicle: 'vehicles', order: 'orders', settings: 'profile' },
    titles: { vehicle: 'Vehicle Details', order: 'Order Details' },
    search(q) {
      const r = [];
      AC.cust.vehicles().forEach((v) => { if (u.match([v.brand, v.model, v.plate, v.year], q)) r.push({ icon: 'car', title: AC.store.vName(v), sub: v.plate + ' · ' + u.km(v.mileage), href: '#/vehicle/' + v.id }); });
      AC.cust.appts().forEach((a) => { if (u.match([a.id, a.service, a.status], q)) r.push({ icon: 'calendar', title: a.service, sub: a.id + ' · ' + u.fmtDate(a.date) + ' · ' + a.status, href: '#/dashboard' }); });
      AC.cust.orders().forEach((o) => { if (u.match([o.id, o.status, o.items.map((i) => i.name)], q)) r.push({ icon: 'bag', title: o.id, sub: o.items.length + ' item(s) · ' + o.status, href: '#/order/' + o.id }); });
      st.s.products.forEach((p) => { if (u.match([p.title, p.cat], q)) r.push({ icon: 'store', title: p.title, sub: 'Shop · ' + AC.data.productHelpers.catName(p.cat), href: 'shop.html#/product/' + p.id }); });
      return r;
    },
    onChange() {
      const n = st.cartCount();
      document.querySelectorAll('[data-cart-badge]').forEach((b) => { b.textContent = n; b.style.display = n ? '' : 'none'; });
    }
  });

  const CV = AC.custViews;
  AC.router.start({
    dashboard: CV.dashboard, vehicles: CV.vehicles, vehicle: CV.vehicle, book: CV.book, tracking: CV.tracking,
    history: CV.history, orders: CV.orders, order: CV.order, notifications: CV.notifications, profile: CV.profile
  }, 'dashboard', shell.setActive);
})();

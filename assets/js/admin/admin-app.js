/* =========================================================
   AUTOCARE — admin/admin-app.js
   Admin console bootstrapper: shell, sidebar navigation
   (with live counts), global search and hash routes.
   ========================================================= */
(function () {
  const u = AC.u, st = AC.store, s = () => st.s;

  const sess = AC.session.get();
  if (!sess.admin) AC.session.loginAdmin(s().staff.name); // demo: allow direct access

  const lowStock = () => st.inventoryRows().filter((r) => r.status !== 'In Stock').length;
  const shell = AC.shell.app({
    role: 'admin', tag: 'ADMIN',
    user: { name: s().staff.name, role: s().staff.role, email: s().staff.email },
    nav: [
      { label: 'Main', items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
        { id: 'appointments', label: 'Appointments', icon: 'calendar', count: () => s().appointments.filter((a) => a.status === 'Pending').length },
        { id: 'customers', label: 'Customers', icon: 'users' },
        { id: 'vehicles', label: 'Vehicles', icon: 'car' }] },
      { label: 'Service', items: [
        { id: 'services', label: 'Service Management', icon: 'wrench' },
        { id: 'workorders', label: 'Work Orders', icon: 'clipboard', count: () => s().workOrders.filter((w) => w.status !== 'Completed').length },
        { id: 'technicians', label: 'Technicians', icon: 'badge' }] },
      { label: 'Commerce', items: [
        { id: 'inventory', label: 'Inventory', icon: 'archive', count: lowStock },
        { id: 'shop', label: 'Shop', icon: 'store' },
        { id: 'products', label: 'Products', icon: 'box' },
        { id: 'orders', label: 'Orders', icon: 'bag', count: () => s().orders.filter((o) => o.status === 'Pending').length },
        { id: 'payments', label: 'Payments', icon: 'wallet' }] },
      { label: 'Insights & System', items: [
        { id: 'reports', label: 'Reports', icon: 'chart' },
        { id: 'notifications', label: 'Notifications', icon: 'bell', count: () => st.unread('admin') },
        { id: 'activity', label: 'Activity Log', icon: 'activity' },
        { id: 'components', label: 'UI Components', icon: 'layers' }] }
    ],
    settingsHref: '#/settings', profileHref: '#/settings',
    searchPlaceholder: 'Search customers, plates, orders, products…',
    topExtra: '<a class="btn btn-outline btn-sm hide-sm" href="customer.html" title="Open customer portal">' + AC.icon('user') + 'Customer view</a>',
    userMenu: [
      { label: 'Account Settings', icon: 'settings', href: '#/settings' }, { label: 'Activity Log', icon: 'activity', href: '#/activity' },
      { label: 'Customer Portal', icon: 'user', href: 'customer.html' }, { label: 'Public Website', icon: 'globe', href: 'index.html' }, '-',
      { label: 'Logout', icon: 'logout', danger: true, attr: 'data-logout-link' }
    ],
    alias: { customer: 'customers', vehicle: 'vehicles', workorder: 'workorders', order: 'orders' },
    titles: { settings: 'Settings' },
    search(q) {
      const r = [];
      s().customers.forEach((c) => { if (u.match([c.name, c.email, c.phone, c.id], q)) r.push({ icon: 'user', title: c.name, sub: c.id + ' · ' + c.email, href: '#/customer/' + c.id }); });
      s().vehicles.forEach((v) => { if (u.match([v.plate, v.brand, v.model, v.vin], q)) r.push({ icon: 'car', title: st.vName(v), sub: v.plate + ' · ' + (st.customer(v.customerId) || {}).name, href: '#/vehicle/' + v.id }); });
      s().orders.forEach((o) => { if (u.match([o.id, o.customer], q)) r.push({ icon: 'bag', title: o.id, sub: o.customer + ' · ' + o.status, href: '#/order/' + o.id }); });
      s().workOrders.forEach((w) => { if (u.match([w.id, w.plate, w.service], q)) r.push({ icon: 'clipboard', title: w.id, sub: w.service + ' · ' + w.status, href: '#/workorder/' + w.id }); });
      s().appointments.forEach((a) => { if (u.match([a.id], q)) r.push({ icon: 'calendar', title: a.id, sub: a.service + ' · ' + u.fmtDate(a.date), href: '#/appointments' }); });
      s().products.forEach((p) => { if (u.match([p.title, p.variants.map((v) => v.sku)], q)) r.push({ icon: 'box', title: p.title, sub: AC.data.productHelpers.catName(p.cat), href: '#/products?id=' + p.id }); });
      return r;
    }
  });

  const A = AC.adminViews;
  AC.router.start({
    dashboard: A.dashboard, appointments: A.appointments, customers: A.customers, customer: A.customer, vehicles: A.vehicles, vehicle: A.vehicle,
    services: A.services, workorders: A.workorders, workorder: A.workorder, technicians: A.technicians, inventory: A.inventory, shop: A.shop,
    products: A.products, orders: A.orders, order: A.order, payments: A.payments, reports: A.reports,
    notifications: (el) => AC.notificationsView(el, 'admin'), activity: A.activity, settings: A.settings, components: A.components
  }, 'dashboard', shell.setActive);
})();

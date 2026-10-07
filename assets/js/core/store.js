/* =========================================================
   AUTOCARE — core/store.js
   Frontend-only persistence (localStorage) + domain actions
   (cart, orders, bookings, work orders, inventory, vehicles)
   and session handling for customer/admin demo logins.
   ========================================================= */
window.AC = window.AC || {};

AC.store = (function () {
  const u = AC.u;
  const KEY = 'autocare.state.v1';
  let state = null;
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.version === AC.demo.VERSION && s.seededOn === u.today()) { state = s; return state; }
        // Keep the user's cart/garage across days, but refresh relative demo dates
        if (s && s.version === AC.demo.VERSION) {
          state = AC.demo.build();
          state.cart = s.cart || [];
          const mine = (s.vehicles || []).filter((v) => v.custom);
          state.vehicles = state.vehicles.concat(mine);
          return state;
        }
      }
    } catch (e) { /* storage unavailable or corrupted */ }
    state = AC.demo.build();
    return state;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore quota/private mode */ }
    listeners.forEach((fn) => { try { fn(state); } catch (e) { console.warn(e); } });
  }
  function reset() { state = AC.demo.build(); save(); }
  function on(fn) { listeners.push(fn); }

  load();
  /* Service catalog lives in state so admin price/duration edits persist */
  if (!state.services) state.services = JSON.parse(JSON.stringify(AC.data.services));
  AC.data.services = state.services;

  /* Cross-tab sync: when admin updates a work order in another tab, customer views refresh */
  const external = [];
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY || !e.newValue) return;
    try { state = JSON.parse(e.newValue); } catch (err) { return; }
    listeners.forEach((fn) => { try { fn(state); } catch (er) { console.warn(er); } });
    external.forEach((fn) => { try { fn(state); } catch (er) { console.warn(er); } });
  });

  const find = (arr, id) => (state[arr] || []).find((x) => x.id === id);
  const api = {
    get s() { return state; },
    save, reset, on,
    onExternal: (fn) => external.push(fn),
    customer: (id) => find('customers', id),
    vehicle: (id) => find('vehicles', id),
    tech: (id) => find('technicians', id),
    product: (id) => find('products', id),
    appt: (id) => find('appointments', id),
    wo: (id) => find('workOrders', id),
    order: (id) => find('orders', id),
    service: (id) => AC.data.services.find((s) => s.id === id),
    variant(pid, vkey) { const p = api.product(pid); return p ? p.variants.find((v) => v.key === vkey) : null; },
    vName(v) { return v ? v.year + ' ' + v.brand + ' ' + v.model : '—'; },
    techName(id) { const t = api.tech(id); return t ? t.name : 'Unassigned'; },

    /* ---------- Notifications & activity ---------- */
    notify(aud, n) {
      state.notifications[aud].unshift(Object.assign({ id: u.uid('N'), at: new Date().toISOString(), read: false }, n));
      state.notifications[aud] = state.notifications[aud].slice(0, 40);
    },
    log(actor, name, action, target) {
      state.activity.unshift({ actor, name, action, target, at: new Date().toISOString() });
      state.activity = state.activity.slice(0, 80);
    },
    markRead(aud, id) {
      state.notifications[aud].forEach((n) => { if (!id || n.id === id) n.read = true; });
      save();
    },
    unread(aud) { return state.notifications[aud].filter((n) => !n.read).length; },

    /* ---------- Cart ---------- */
    addToCart(pid, vkey, qty) {
      const p = api.product(pid); if (!p) return false;
      const v = vkey ? p.variants.find((x) => x.key === vkey) : p.variants.find((x) => x.stock > 0) || p.variants[0];
      if (!v || v.stock <= 0) return false;
      const line = state.cart.find((l) => l.pid === pid && l.vkey === v.key);
      if (line) line.qty = Math.min(v.stock, line.qty + (qty || 1));
      else state.cart.push({ pid, vkey: v.key, qty: Math.min(v.stock, qty || 1) });
      save();
      return true;
    },
    setQty(i, qty) {
      const l = state.cart[i]; if (!l) return;
      const v = api.variant(l.pid, l.vkey);
      l.qty = u.clamp(qty, 1, v ? Math.max(1, v.stock) : 99);
      save();
    },
    removeLine(i) { state.cart.splice(i, 1); save(); },
    clearCart() { state.cart = []; save(); },
    cartItems() {
      return state.cart.map((l, i) => {
        const p = api.product(l.pid), v = p && p.variants.find((x) => x.key === l.vkey);
        return p && v ? { i, p, v, qty: l.qty, price: v.price, subtotal: v.price * l.qty } : null;
      }).filter(Boolean);
    },
    cartCount() { return u.sum(state.cart, (l) => l.qty); },
    cartTotals(delivery) {
      const items = api.cartItems();
      const sub = u.sum(items, (x) => x.subtotal);
      const ship = delivery === 'pickup' || !items.length ? 0 : sub >= state.settings.freeDeliveryMin ? 0 : state.settings.deliveryFee;
      return { items, sub, ship, total: sub + ship, count: u.sum(items, (x) => x.qty) };
    },
    placeOrder(info) {
      const t = api.cartTotals(info.delivery);
      if (!t.items.length) return null;
      const last = state.orders.reduce((m, o) => Math.max(m, +o.id.split('-')[1]), 10470);
      const now = new Date().toISOString();
      const o = {
        id: 'ORD-' + (last + 1), customerId: info.customerId, customer: info.name, date: now,
        items: t.items.map((x) => ({ pid: x.p.id, vkey: x.v.key, name: x.p.title, variant: x.v.label, price: x.price, qty: x.qty })),
        subtotal: t.sub, shipping: t.ship, discount: 0, total: t.total, delivery: info.delivery, payment: info.payment,
        paymentStatus: info.payment === 'Cash on Delivery' || info.payment === 'Bank Transfer' ? 'Unpaid' : 'Paid',
        status: 'Pending', address: info.delivery === 'pickup' ? 'Store Pickup — ' + state.settings.shopName : info.address,
        phone: info.phone, email: info.email, timeline: [{ status: 'Pending', at: now }], notes: info.notes || ''
      };
      t.items.forEach((x) => { x.v.stock = Math.max(0, x.v.stock - x.qty); });
      state.orders.unshift(o);
      state.payments.unshift({ id: u.uid('PAY'), ref: o.id, type: 'Shop Order', customerId: o.customerId, amount: o.total, method: o.payment, status: o.paymentStatus === 'Paid' ? 'Paid' : 'Pending', date: now });
      state.cart = [];
      api.notify('admin', { type: 'order', title: 'New Order', msg: 'Order #' + o.id + ' has been placed by ' + o.customer + '.', link: '#/orders' });
      api.notify('customer', { type: 'order', title: 'Order Placed', msg: o.id + ' received. We\'ll confirm it shortly.', link: '#/orders' });
      api.log('System', 'AutoCare Shop', 'Received new order', o.id);
      t.items.forEach((x) => { if (x.v.stock <= (x.p.minStock || 4)) api.notify('admin', { type: 'stock', title: 'Low Stock Alert', msg: x.p.title + ' (' + x.v.label + ') has only ' + x.v.stock + ' units remaining.', link: '#/inventory' }); });
      save();
      return o;
    },
    setOrderStatus(id, status, actor) {
      const o = api.order(id); if (!o) return;
      o.status = status;
      o.timeline.push({ status, at: new Date().toISOString() });
      if (status === 'Completed') o.paymentStatus = 'Paid';
      const pay = state.payments.find((p) => p.ref === id);
      if (pay) pay.status = status === 'Cancelled' ? 'Refunded' : o.paymentStatus === 'Paid' ? 'Paid' : 'Pending';
      if (status === 'Cancelled') o.items.forEach((it) => { const v = api.variant(it.pid, it.vkey); if (v) v.stock += it.qty; });
      api.notify('customer', { type: 'order', title: 'Order ' + status, msg: id + ' is now ' + status.toLowerCase() + '.', link: '#/orders' });
      api.log(actor || 'Staff', state.staff.name, 'Updated order to ' + status, id);
      save();
    },

    /* ---------- Appointments ---------- */
    book(b) {
      const v = api.vehicle(b.vehicleId), s = api.service(b.serviceId);
      const last = state.appointments.reduce((m, a) => Math.max(m, +a.id.split('-')[1]), 5100);
      const a = {
        id: 'APT-' + (last + 1), customerId: v.customerId, vehicleId: v.id, serviceId: s.id, service: s.name, date: b.date, time: b.time,
        status: 'Pending', techId: null, notes: b.notes || '', estimate: s.price, createdAt: new Date().toISOString()
      };
      state.appointments.push(a);
      const c = api.customer(v.customerId);
      api.notify('admin', { type: 'booking', title: 'New Service Booking', msg: c.name + ' booked ' + s.short + ' for ' + v.brand + ' ' + v.model + '.', link: '#/appointments' });
      api.notify('customer', { type: 'booking', title: 'Booking Received', msg: s.short + ' for ' + v.brand + ' ' + v.model + ' on ' + u.fmtDate(b.date) + ' at ' + u.fmtTime(b.time) + '.', link: '#/dashboard' });
      api.log('Customer', c.name, 'Booked ' + s.short, a.id);
      save();
      return a;
    },
    setApptStatus(id, status, patch) {
      const a = api.appt(id); if (!a) return;
      a.status = status; Object.assign(a, patch || {});
      if (status === 'In Progress' && !state.workOrders.find((w) => w.apptId === id)) api.createWO(a);
      const v = api.vehicle(a.vehicleId);
      api.notify('customer', { type: 'booking', title: 'Appointment ' + status, msg: a.service + ' for ' + (v ? v.brand + ' ' + v.model : '') + ' — ' + u.fmtDate(a.date) + ' ' + u.fmtTime(a.time) + '.', link: '#/dashboard' });
      api.log('Staff', state.staff.name, (status === 'Approved' ? 'Approved' : 'Set ' + status.toLowerCase() + ' on') + ' appointment', id);
      save();
    },

    /* ---------- Work orders ---------- */
    createWO(a, extra) {
      const v = api.vehicle(a.vehicleId), s = api.service(a.serviceId);
      const last = state.workOrders.reduce((m, w) => Math.max(m, +w.id.split('-')[1]), 1035);
      const w = Object.assign({
        id: 'WO-' + (last + 1), apptId: a.id, customerId: a.customerId, vehicleId: v.id, plate: v.plate, techId: a.techId || null,
        service: a.service, diagnosis: '', parts: [], labor: s ? s.price : 0, estimate: s ? s.price : 0, final: null, status: 'Pending',
        started: new Date().toISOString(), completed: null, stageTimes: { 0: new Date().toISOString() }
      }, extra || {});
      state.workOrders.unshift(w);
      api.log('Staff', state.staff.name, 'Created work order', w.id);
      return w;
    },
    setWOStatus(id, status) {
      const w = api.wo(id); if (!w) return;
      const idx = AC.data.woStatuses.indexOf(status);
      w.status = status;
      w.stageTimes = w.stageTimes || {};
      if (idx > -1 && !w.stageTimes[idx]) w.stageTimes[idx] = new Date().toISOString();
      const v = api.vehicle(w.vehicleId);
      if (status === 'Completed') {
        w.completed = new Date().toISOString(); w.final = w.final || w.estimate;
        const a = api.appt(w.apptId); if (a) a.status = 'Completed';
        if (v) { v.condition = 'Good Condition'; v.lastService = u.today(); v.nextService = u.addMonths(u.today(), 6); }
        state.records.unshift({ id: u.uid('SR'), date: u.today(), vehicleId: w.vehicleId, customerId: w.customerId, serviceId: a ? a.serviceId : '', service: w.service, techId: w.techId, mileage: v ? v.mileage : 0, cost: w.final, status: 'Completed', invoice: 'INV-' + new Date().getFullYear() + '-' + (4200 + state.records.length), notes: w.diagnosis, paid: false });
        const pay = state.payments.find((p) => p.ref === id); if (pay) pay.amount = w.final;
        api.notify('admin', { type: 'done', title: 'Service Completed', msg: (v ? v.brand + ' ' + v.model : 'Vehicle') + ' is ready for release.', link: '#/workorders' });
        api.notify('customer', { type: 'service', title: 'Ready for Release', msg: 'Your ' + (v ? v.brand + ' ' + v.model : 'vehicle') + ' is ready for pick-up.', link: '#/tracking' });
      } else {
        if (v) v.condition = 'In Service';
        api.notify('customer', { type: 'service', title: AC.data.trackerStages[Math.max(0, idx)], msg: 'Update on your ' + (v ? v.brand + ' ' + v.model : 'vehicle') + ' (' + w.id + ').', link: '#/tracking' });
      }
      api.log('Staff', state.staff.name, 'Updated work order to ' + status, id);
      save();
    },
    woStage(w) { const i = AC.data.woStatuses.indexOf(w.status); return i < 0 ? 0 : i; },

    /* ---------- Vehicles ---------- */
    addVehicle(data) {
      const last = state.vehicles.reduce((m, v) => Math.max(m, +v.id.split('-')[1]), 2000);
      const cat = AC.data.vehicles.find(data.brand, data.model) || {};
      const col = AC.data.vehicles.COLORS.find((c) => c.name === data.color) || AC.data.vehicles.COLORS[0];
      const v = Object.assign({
        id: 'VEH-' + (last + 1), body: cat.body || 'sedan', fuel: cat.fuel || 'Gasoline', colorHex: col.hex, condition: 'Good Condition',
        lastService: null, nextService: u.addMonths(u.today(), 6), regDate: u.today(), custom: true
      }, data);
      v.year = +v.year; v.mileage = +v.mileage || 0;
      state.vehicles.push(v);
      api.log('Customer', (api.customer(v.customerId) || {}).name || 'Customer', 'Registered vehicle', v.plate);
      save();
      return v;
    },
    updateVehicle(id, patch) {
      const v = api.vehicle(id); if (!v) return;
      Object.assign(v, patch);
      if (patch.brand || patch.model) { const cat = AC.data.vehicles.find(v.brand, v.model) || {}; v.body = cat.body || v.body; }
      if (patch.color) { const col = AC.data.vehicles.COLORS.find((c) => c.name === patch.color); if (col) v.colorHex = col.hex; }
      v.year = +v.year; v.mileage = +v.mileage || 0;
      save();
    },
    removeVehicle(id) { state.vehicles = state.vehicles.filter((v) => v.id !== id); save(); },

    /* ---------- Inventory ---------- */
    adjustStock(pid, vkey, delta, reason) {
      const v = api.variant(pid, vkey), p = api.product(pid); if (!v) return;
      v.stock = Math.max(0, v.stock + delta);
      api.log('Admin', state.staff.name, 'Adjusted stock (' + (delta > 0 ? '+' : '') + delta + ')' + (reason ? ' · ' + reason : ''), p.title + ' ' + v.label);
      if (v.stock <= (p.minStock || 4)) api.notify('admin', { type: 'stock', title: v.stock ? 'Low Stock Alert' : 'Out of Stock', msg: p.title + ' (' + v.label + ') has ' + v.stock + ' units remaining.', link: '#/inventory' });
      save();
    },
    inventoryRows() {
      const rows = [];
      state.products.forEach((p) => p.variants.forEach((v) => rows.push({ p, v, status: AC.data.productHelpers.stockStatus(v.stock, p.minStock) })));
      return rows;
    }
  };
  return api;
})();

/* ---------------- Session (demo auth) ---------------- */
AC.session = (function () {
  const KEY = 'autocare.session.v1';
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const write = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* ignore */ } };
  return {
    get: read,
    loginCustomer(id, remember) { const s = read(); s.customer = { id, remember: !!remember, at: Date.now() }; write(s); },
    loginAdmin(name) { const s = read(); s.admin = { name, at: Date.now() }; write(s); },
    logout(role) { const s = read(); delete s[role]; write(s); },
    customerId() { const s = read(); return (s.customer && AC.store.customer(s.customer.id)) ? s.customer.id : 'CUS-1001'; },
    customer() { return AC.store.customer(this.customerId()); }
  };
})();

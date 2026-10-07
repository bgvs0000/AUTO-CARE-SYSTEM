/* =========================================================
   AUTOCARE — customer/dashboard.js
   Customer dashboard: welcome, live service status, KPI
   cards, upcoming appointments, vehicles, purchases,
   spending chart and notifications.
   ========================================================= */
window.AC = window.AC || {};
AC.custViews = AC.custViews || {};

AC.custViews.dashboard = function (el) {
  const u = AC.u, C = AC.cust, st = AC.store;
  const me = C.me(), vehicles = C.vehicles(), upcoming = C.upcoming(), records = C.records(), orders = C.orders();
  const active = C.activeWOs()[0];
  const pendingPay = C.payments().filter((p) => p.status === 'Pending');
  const spent = u.sum(records, (r) => r.cost) + u.sum(orders.filter((o) => o.status !== 'Cancelled'), (o) => o.total);
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const hero = active ? st.vehicle(active.vehicleId) : vehicles[0];

  el.innerHTML =
    '<div class="welcome">' +
    '<div><div class="small" style="color:#93c5fd;font-weight:600">' + u.fmtDate(u.today(), 'long') + '</div>' +
    '<h1 class="mt-4">' + greet + ', ' + u.esc(me.name.split(' ')[0]) + '</h1>' +
    '<p>You have ' + vehicles.length + ' registered vehicle' + (vehicles.length === 1 ? '' : 's') + (upcoming.length ? ' and ' + upcoming.length + ' upcoming appointment' + (upcoming.length === 1 ? '' : 's') : '') + '.</p>' +
    (active ? '<a class="status-pill" href="#/tracking"><span class="live"></span>' + u.esc(st.vName(st.vehicle(active.vehicleId))) + ' — ' + AC.data.trackerStages[st.woStage(active)] + AC.icon('chevron-right') + '</a>' : '') +
    '<div class="actions"><a class="btn btn-blue" href="#/book">' + AC.icon('calendar-check') + 'Book a Service</a><a class="btn btn-glass" href="shop.html">' + AC.icon('store') + 'Shop Parts</a></div></div>' +
    (hero ? '<div class="car">' + C.vehicleArt(hero, true) + '</div>' : '') + '</div>' +

    '<div class="grid-stats six section-gap stagger">' +
    AC.ui.statCard({ label: 'My Vehicles', value: vehicles.length, icon: 'car', foot: vehicles.filter((v) => v.condition === 'Service Due').length + ' due for service' }) +
    AC.ui.statCard({ label: 'Upcoming Service', value: upcoming[0] ? u.fmtDate(upcoming[0].date, 'md') : '—', icon: 'calendar', foot: upcoming[0] ? upcoming[0].service.split(' (')[0] + ' · ' + u.fmtTime(upcoming[0].time) : 'No bookings yet' }) +
    AC.ui.statCard({ label: 'Service History', value: records.length, icon: 'clock', foot: 'Completed services' }) +
    AC.ui.statCard({ label: 'Shop Orders', value: orders.length, icon: 'bag', foot: orders.filter((o) => !['Completed', 'Cancelled'].includes(o.status)).length + ' in progress' }) +
    AC.ui.statCard({ label: 'Total Spent', value: u.pesoShort(spent), icon: 'wallet', foot: 'Lifetime, services + shop' }) +
    AC.ui.statCard({ label: 'Pending Payments', value: u.peso(u.sum(pendingPay, (p) => p.amount)), icon: 'card', foot: pendingPay.length + ' unpaid item' + (pendingPay.length === 1 ? '' : 's') }) +
    '</div>' +

    '<div class="grid-main-side section-gap">' +
    '<div class="card"><div class="card-head"><div><div class="card-title">' + AC.icon('activity') + 'Current Service Status</div><div class="card-sub">' + (active ? active.id + ' · ' + u.esc(active.service) : 'No active service') + '</div></div>' + (active ? '<a class="btn btn-outline btn-sm" href="#/tracking">Open tracker</a>' : '') + '</div>' +
    '<div class="card-body">' + (active ? AC.trackerHtml(active) : AC.ui.empty('check-circle', 'All vehicles are with you', 'When your car is in the shop, you’ll see live progress here.', '<a class="btn btn-primary btn-sm mt-8" href="#/book">Book a service</a>')) + '</div></div>' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('calendar') + 'Upcoming Appointments</div><a class="link small" href="#/book">+ New</a></div>' +
    (upcoming.length ? upcoming.slice(0, 4).map((a) => { const v = st.vehicle(a.vehicleId); const d = u.toDate(a.date); return '<div class="mini-row"><div class="date-box"><span class="m">' + u.MONTHS[d.getMonth()] + '</span><span class="d">' + d.getDate() + '</span></div><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(a.service) + '</div><div class="small muted truncate">' + u.fmtTime(a.time) + ' · ' + u.esc(v ? v.brand + ' ' + v.model : '') + '</div></div>' + AC.ui.badge(a.status) + '</div>'; }).join('') : AC.ui.empty('calendar', 'No upcoming bookings', '')) + '</div></div>' +

    '<div class="grid-3 section-gap" style="grid-template-columns:minmax(0,1.2fr) minmax(0,1fr) minmax(0,1fr)">' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('car') + 'Registered Vehicles</div><a class="link small" href="#/vehicles">View all</a></div>' +
    vehicles.slice(0, 4).map((v) => '<a class="mini-row" href="#/vehicle/' + v.id + '"><div class="thumb" style="width:72px;height:46px;background:var(--gray-bg)">' + C.vehicleArt(v) + '</div><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(st.vName(v)) + '</div><div class="small muted"><span class="plate sm">' + v.plate + '</span> · ' + u.km(v.mileage) + '</div></div>' + AC.ui.badge(v.condition) + '</a>').join('') + '</div>' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('bag') + 'Recent Purchases</div><a class="link small" href="#/orders">All orders</a></div>' +
    (orders.length ? orders.slice(0, 4).map((o) => '<a class="mini-row" href="#/order/' + o.id + '"><div class="thumb">' + AC.art.product(st.product(o.items[0].pid)) + '</div><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(o.items[0].name) + '</div><div class="small muted">' + o.id + ' · ' + u.peso(o.total) + '</div></div>' + AC.ui.badge(o.status) + '</a>').join('') : AC.ui.empty('bag', 'No orders yet', '<a class="link" href="shop.html">Visit the shop</a>')) + '</div>' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('bell') + 'Notifications</div><a class="link small" href="#/notifications">View all</a></div>' +
    st.s.notifications.customer.slice(0, 4).map((n) => '<div class="mini-row"><span class="notif-ico ' + (n.read ? '' : 'blue') + '">' + AC.icon(n.type === 'order' ? 'bag' : n.type === 'service' ? 'wrench' : n.type === 'promo' ? 'gift' : 'calendar') + '</span><div class="grow" style="min-width:0"><div class="strong small truncate">' + u.esc(n.title) + '</div><div class="xs muted truncate">' + u.esc(n.msg) + '</div></div></div>').join('') + '</div></div>' +

    '<div class="card section-gap"><div class="card-head"><div><div class="card-title">' + AC.icon('chart') + 'Spending Overview</div><div class="card-sub">Last 6 months · services vs. shop</div></div></div><div class="card-body"><div id="cust-spend"></div></div></div>';

  /* Spending chart from this customer's data */
  const labels = [], svc = [], shop = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    const key = d.getFullYear() + '-' + u.pad(d.getMonth() + 1);
    labels.push(u.MONTHS[d.getMonth()]);
    svc.push(u.sum(records.filter((r) => r.date.startsWith(key)), (r) => r.cost));
    shop.push(u.sum(orders.filter((o) => o.status !== 'Cancelled' && u.iso(new Date(o.date)).startsWith(key)), (o) => o.total));
  }
  AC.charts.bar(el.querySelector('#cust-spend'), { labels, series: [{ name: 'Services', data: svc }, { name: 'Shop', data: shop }], format: (v) => u.peso(v), axisFormat: (v) => u.pesoShort(v), height: 220, label: 'Monthly spending' });
};

/* Shared 6-stage service tracker markup (also used by tracking.js) */
AC.trackerHtml = function (w) {
  const u = AC.u, st = AC.store, C = AC.cust;
  const stage = st.woStage(w), v = st.vehicle(w.vehicleId);
  return '<div class="flex items-center gap-12 mb-24"><div class="thumb" style="width:84px;height:52px">' + C.vehicleArt(v) + '</div><div><div class="strong">' + u.esc(st.vName(v)) + '</div><div class="small muted"><span class="plate sm">' + v.plate + '</span> · Tech: ' + u.esc(st.techName(w.techId)) + '</div></div></div>' +
    '<div class="tracker">' + AC.data.trackerStages.map((s, i) => '<div class="tracker-step ' + (i < stage ? 'done' : i === stage ? 'current' : '') + '"><div class="tracker-dot">' + AC.icon(i < stage ? 'check' : ['car', 'search', 'gauge', 'wrench', 'shield-check', 'check-circle'][i]) + '</div><div><div class="tracker-label">' + s + '</div><div class="tracker-time">' + (w.stageTimes && w.stageTimes[i] ? u.fmtTime(w.stageTimes[i]) : i === stage ? 'In progress' : '—') + '</div></div></div>').join('') + '</div>';
};

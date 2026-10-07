/* =========================================================
   AUTOCARE — admin/dashboard.js
   Admin dashboard: 8 live KPIs, revenue / appointment /
   service-mix / product-sales charts, today's schedule,
   recent orders and recent activity.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

AC.adminViews.dashboard = function (el) {
  const u = AC.u, st = AC.store, S = st.s, T = u.today();
  const an = S.analytics;
  const todays = S.appointments.filter((a) => a.date === T).sort((a, b) => a.time.localeCompare(b.time));
  const activeWO = S.workOrders.filter((w) => w.status !== 'Completed');
  const pendingOrders = S.orders.filter((o) => ['Pending', 'Confirmed', 'Processing'].includes(o.status));
  const low = st.inventoryRows().filter((r) => r.status !== 'In Stock');
  const liveOrders = u.sum(S.orders.filter((o) => o.idx === undefined && o.status !== 'Cancelled'), (o) => o.total);
  const liveSvc = u.sum(S.workOrders.filter((w) => w.status === 'Completed' && w.completed && u.iso(new Date(w.completed)) === T), (w) => w.final || 0);
  const mtd = an.serviceRev[11] + an.productRev[11] + liveOrders + liveSvc;
  const lastFull = an.serviceRev[10] + an.productRev[10];
  const completedMonth = S.records.filter((r) => r.date.slice(0, 7) === T.slice(0, 7)).length + S.workOrders.filter((w) => w.status === 'Completed').length;
  const hr = new Date().getHours();

  el.innerHTML = AC.shell.pageHead((hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening') + ', ' + u.esc(S.staff.name.split(' ')[0]), u.fmtDate(T, 'long') + ' · Here’s what’s happening at ' + u.esc(S.settings.shopName.split(' — ')[1] || 'your shop') + ' today.',
    '<button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export</button><a class="btn btn-primary" href="#/appointments?new=1">' + AC.icon('plus') + 'New Appointment</a>') +
    '<div class="grid-stats eight stagger">' +
    AC.ui.statCard({ label: 'Total Customers', value: u.num(S.customers.length), icon: 'users', delta: 7.8, foot: '+' + an.newCustomers[11] + ' this month' }) +
    AC.ui.statCard({ label: 'Total Vehicles', value: u.num(S.vehicles.length), icon: 'car', delta: 5.2, foot: 'Registered in system' }) +
    AC.ui.statCard({ label: "Today's Appointments", value: todays.length, icon: 'calendar', foot: todays.filter((a) => a.status === 'Pending').length + ' awaiting approval' }) +
    AC.ui.statCard({ label: 'Active Services', value: activeWO.length, icon: 'wrench', foot: activeWO.filter((w) => w.status === 'Quality Check').length + ' in quality check' }) +
    AC.ui.statCard({ label: 'Pending Orders', value: pendingOrders.length, icon: 'bag', foot: u.peso(u.sum(pendingOrders, (o) => o.total)) + ' value' }) +
    AC.ui.statCard({ label: 'Monthly Revenue', value: u.pesoShort(mtd), icon: 'wallet', delta: +(((mtd / (new Date().getDate())) * 30 / lastFull - 1) * 100).toFixed(1), foot: 'Month-to-date' }) +
    AC.ui.statCard({ label: 'Low Stock Products', value: low.length, icon: 'alert', foot: low.filter((r) => r.status === 'Out of Stock').length + ' out of stock' }) +
    AC.ui.statCard({ label: 'Completed Services', value: completedMonth, icon: 'check-circle', delta: 12.4, foot: 'This month' }) +
    '</div>' +

    '<div class="grid-main-side section-gap" style="grid-template-columns:minmax(0,1fr) 380px">' +
    '<div class="card"><div class="card-head"><div><div class="card-title">' + AC.icon('trending-up') + 'Revenue</div><div class="card-sub">Last 11 completed months · services vs. product sales</div></div><div class="seg" data-rv><button class="active" data-value="both">All</button><button data-value="svc">Service</button><button data-value="prod">Products</button></div></div><div class="card-body"><div id="ch-rev"></div></div></div>' +
    '<div class="card"><div class="card-head"><div><div class="card-title">' + AC.icon('pie') + 'Service Mix</div><div class="card-sub">Completed jobs by type</div></div></div><div class="card-body"><div id="ch-mix"></div></div></div></div>' +

    '<div class="grid-2 section-gap">' +
    '<div class="card"><div class="card-head"><div><div class="card-title">' + AC.icon('calendar') + 'Appointments</div><div class="card-sub">Daily bookings · last 14 days</div></div></div><div class="card-body"><div id="ch-appt"></div></div></div>' +
    '<div class="card"><div class="card-head"><div><div class="card-title">' + AC.icon('chart') + 'Product Sales</div><div class="card-sub">By category · all orders</div></div><a class="link small" href="#/reports">Reports</a></div><div class="card-body" id="ch-prod"></div></div></div>' +

    '<div class="grid-3 section-gap" style="grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,.9fr)">' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('clock') + 'Today’s Schedule</div><a class="link small" href="#/appointments">View all</a></div>' +
    (todays.length ? todays.map((a) => { const c = st.customer(a.customerId), v = st.vehicle(a.vehicleId); return '<div class="mini-row"><span class="time-col small">' + u.fmtTime(a.time) + '</span><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(a.service) + '</div><div class="small muted truncate">' + u.esc(c.name) + ' · ' + u.esc(v.brand + ' ' + v.model) + ' · ' + v.plate + '</div></div>' + AC.ui.badge(a.status) + '</div>'; }).join('') : AC.ui.empty('calendar', 'No appointments today', '')) + '</div>' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('bag') + 'Recent Orders</div><a class="link small" href="#/orders">View all</a></div>' +
    S.orders.slice(0, 6).map((o) => '<a class="mini-row" href="#/order/' + o.id + '"><div class="thumb" style="width:40px;height:40px">' + AC.art.product(st.product(o.items[0].pid)) + '</div><div class="grow" style="min-width:0"><div class="strong mono small">' + o.id + '</div><div class="xs muted truncate">' + u.esc(o.customer) + ' · ' + u.relTime(o.date) + '</div></div><div class="text-right"><div class="strong small">' + u.peso(o.total) + '</div>' + AC.ui.badge(o.status) + '</div></a>').join('') + '</div>' +
    '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('activity') + 'Recent Activity</div><a class="link small" href="#/activity">Log</a></div><div class="card-body" style="padding-top:4px;padding-bottom:4px">' +
    S.activity.slice(0, 6).map((a) => '<div class="feed-item">' + AC.ui.avatar(a.name, 'sm') + '<div style="min-width:0"><div class="feed-text"><b>' + u.esc(a.actor) + '</b> ' + u.esc(a.action.toLowerCase()) + ' <span class="strong">' + u.esc(a.target) + '</span></div><div class="feed-time">' + u.relTime(a.at) + '</div></div></div>').join('') + '</div></div></div>' +

    (low.length ? '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('alert') + 'Stock alerts <span class="badge badge-orange">' + low.length + '</span></div><a class="btn btn-outline btn-sm" href="#/inventory?status=Low">Manage inventory</a></div><div class="flex gap-12" style="overflow-x:auto;padding:16px 20px">' +
      low.slice(0, 10).map((r) => '<div class="card card-hover" style="min-width:220px;padding:12px;display:flex;gap:10px;align-items:center"><div class="thumb">' + AC.art.product(r.p) + '</div><div style="min-width:0"><div class="small strong truncate">' + u.esc(r.p.title) + '</div><div class="xs muted mono truncate">' + u.esc(r.v.label) + '</div>' + AC.ui.badge(r.status) + ' <b class="small">' + r.v.stock + '</b></div></div>').join('') + '</div></div>' : '');

  /* Charts */
  let mode = 'both';
  const drawRev = () => {
    const series = [];
    if (mode !== 'prod') series.push({ name: 'Service revenue', data: an.serviceRev, color: AC.charts.PALETTE[0] });
    if (mode !== 'svc') series.push({ name: 'Product sales', data: an.productRev, color: AC.charts.PALETTE[1] });
    AC.charts.line(el.querySelector('#ch-rev'), { labels: an.months.slice(0, 11), series: series.map((x) => Object.assign({}, x, { data: x.data.slice(0, 11) })), format: (v) => u.peso(v), axisFormat: u.pesoShort, height: 270, label: 'Monthly revenue' });
  };
  drawRev();
  AC.ui.tabs(el.querySelector('[data-rv]'), (v) => { mode = v; drawRev(); });

  const mix = u.groupBy(S.records, (r) => r.service.split(' (')[0]);
  const mixItems = Object.keys(mix).map((k) => ({ label: k, value: mix[k].length })).sort((a, b) => b.value - a.value);
  const top = mixItems.slice(0, 3), other = u.sum(mixItems.slice(3), (x) => x.value);
  AC.charts.donut(el.querySelector('#ch-mix'), { items: top.concat([{ label: 'Other services', value: other }]), center: { value: String(S.records.length), label: 'Total jobs' }, size: 170, label: 'Service mix' });

  AC.charts.bar(el.querySelector('#ch-appt'), { labels: an.daily.map((d) => u.fmtDate(d.date, 'md')), series: [{ name: 'Appointments', data: an.daily.map((d, i) => i === an.daily.length - 1 ? todays.length : d.appts) }], height: 240, label: 'Daily appointments' });

  const byCat = {};
  S.orders.filter((o) => o.status !== 'Cancelled').forEach((o) => o.items.forEach((i) => { const p = st.product(i.pid); if (p) byCat[p.cat] = (byCat[p.cat] || 0) + i.qty * i.price; }));
  AC.charts.hbars(el.querySelector('#ch-prod'), Object.keys(byCat).map((k) => ({ label: AC.data.productHelpers.catName(k), value: byCat[k] })).sort((a, b) => b.value - a.value).slice(0, 7), { format: u.pesoShort });

  el.querySelector('[data-export]').onclick = () => AC.kit.csv('autocare-dashboard', ['Metric', 'Value'], [
    ['Total Customers', S.customers.length], ['Total Vehicles', S.vehicles.length], ["Today's Appointments", todays.length], ['Active Services', activeWO.length],
    ['Pending Orders', pendingOrders.length], ['Monthly Revenue (MTD)', mtd], ['Low Stock SKUs', low.length], ['Completed Services (month)', completedMonth]]);
};

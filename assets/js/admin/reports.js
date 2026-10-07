/* =========================================================
   AUTOCARE — admin/reports.js
   Reporting dashboard: daily & monthly sales, service and
   product revenue, tire & wheel sales, most serviced
   vehicles, most purchased products, customer growth and
   inventory movement — each with chart, table and CSV.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store, C = AC.charts, P = AC.charts.PALETTE;

  function tableHtml(head, rows, numCols) {
    numCols = numCols || [];
    return '<div class="table-wrap"><table class="table table-responsive"><thead><tr>' + head.map((h, i) => '<th class="' + (numCols.includes(i) ? 'num' : '') + '">' + h + '</th>').join('') + '</tr></thead><tbody>' +
      rows.map((r) => '<tr>' + r.map((c, i) => '<td data-label="' + head[i] + '" class="' + (numCols.includes(i) ? 'num' : '') + '">' + c + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
  }

  function defs() {
    const S = st.s, an = S.analytics;
    const total = an.months.map((_, i) => an.serviceRev[i] + an.productRev[i]);
    const itemsBy = (cat) => { const m = {}; S.orders.filter((o) => o.status !== 'Cancelled').forEach((o) => o.items.forEach((i) => { const p = st.product(i.pid); if (p && (!cat || p.cat === cat)) { const k = cat ? p.brand : p.title; m[k] = m[k] || { qty: 0, rev: 0 }; m[k].qty += i.qty; m[k].rev += i.qty * i.price; } })); return Object.keys(m).map((k) => ({ k, qty: m[k].qty, rev: m[k].rev })).sort((a, b) => b.rev - a.rev); };
    const units = (share, avg) => an.productRev.map((v) => Math.round(v * share / avg));
    return [
      { id: 'daily', name: 'Daily Sales', icon: 'calendar', desc: 'Last 14 days',
        kpis: () => [['Total (14d)', u.peso(u.sum(an.daily, (d) => d.sales))], ['Daily average', u.peso(Math.round(u.sum(an.daily, (d) => d.sales) / 14))], ['Best day', u.fmtDate(an.daily.slice().sort((a, b) => b.sales - a.sales)[0].date, 'day')]],
        chart: (el) => C.line(el, { labels: an.daily.map((d) => u.fmtDate(d.date, 'md')), series: [{ name: 'Sales', data: an.daily.map((d) => d.sales) }], format: (v) => u.peso(v), axisFormat: u.pesoShort, height: 280 }),
        table: () => [['Date', 'Appointments', 'Sales'], an.daily.slice().reverse().map((d) => [u.fmtDate(d.date, 'day'), d.appts, u.peso(d.sales)]), [1, 2]] },
      { id: 'monthly', name: 'Monthly Sales', icon: 'chart', desc: 'Last 12 months',
        kpis: () => [['12-month total', u.pesoShort(u.sum(total))], ['Monthly avg.', u.pesoShort(u.sum(total.slice(0, 11)) / 11)], ['Growth (YoY)', '+' + Math.round((total[10] / total[0] - 1) * 100) + '%']],
        chart: (el) => C.bar(el, { labels: an.months, series: [{ name: 'Services', data: an.serviceRev }, { name: 'Products', data: an.productRev }], format: (v) => u.peso(v), axisFormat: u.pesoShort, height: 280 }),
        table: () => [['Month', 'Services', 'Products', 'Total'], an.months.map((m, i) => [m, u.peso(an.serviceRev[i]), u.peso(an.productRev[i]), '<b>' + u.peso(total[i]) + '</b>']).reverse(), [1, 2, 3]] },
      { id: 'service', name: 'Service Revenue', icon: 'wrench', desc: 'Labor & parts from work orders',
        kpis: () => [['12-month', u.pesoShort(u.sum(an.serviceRev))], ['Jobs recorded', S.records.length], ['Avg. ticket', u.peso(Math.round(u.sum(S.records, (r) => r.cost) / S.records.length))]],
        chart: (el) => C.line(el, { labels: an.months, series: [{ name: 'Service revenue', data: an.serviceRev }], format: (v) => u.peso(v), axisFormat: u.pesoShort, height: 280 }),
        table: () => { const g = u.groupBy(S.records, (r) => r.service); return [['Service', 'Jobs', 'Revenue', 'Avg. ticket'], Object.keys(g).map((k) => [k, g[k].length, u.sum(g[k], (r) => r.cost), 0]).sort((a, b) => b[2] - a[2]).map((r) => [u.esc(r[0]), r[1], u.peso(r[2]), u.peso(Math.round(r[2] / r[1]))]), [1, 2, 3]]; } },
      { id: 'product', name: 'Product Revenue', icon: 'bag', desc: 'Shop sales by category',
        kpis: () => [['12-month', u.pesoShort(u.sum(an.productRev))], ['Orders', S.orders.length], ['Avg. order', u.peso(Math.round(u.sum(S.orders, (o) => o.total) / S.orders.length))]],
        chart: (el) => C.line(el, { labels: an.months, series: [{ name: 'Product revenue', data: an.productRev, color: P[1] }], format: (v) => u.peso(v), axisFormat: u.pesoShort, height: 280 }),
        table: () => { const m = {}; S.orders.filter((o) => o.status !== 'Cancelled').forEach((o) => o.items.forEach((i) => { const p = st.product(i.pid); if (p) { m[p.cat] = (m[p.cat] || 0) + i.qty * i.price; } })); return [['Category', 'Revenue', 'Share'], Object.keys(m).sort((a, b) => m[b] - m[a]).map((k) => [AC.data.productHelpers.catName(k), u.peso(m[k]), Math.round(m[k] / u.sum(Object.values(m)) * 100) + '%']), [1, 2]]; } },
      { id: 'tires', name: 'Tire Sales', icon: 'tire', desc: 'Units & revenue by brand',
        kpis: () => [['Units (12m)', u.num(u.sum(units(.38, 6900)))], ['Top brand', (itemsBy('tires')[0] || { k: '—' }).k], ['Avg. price', '₱6,900']],
        chart: (el) => C.bar(el, { labels: an.months, series: [{ name: 'Tires sold (units)', data: units(.38, 6900) }], height: 280 }),
        table: () => [['Brand', 'Units', 'Revenue'], itemsBy('tires').map((r) => [r.k, r.qty, u.peso(r.rev)]), [1, 2]] },
      { id: 'wheels', name: 'Wheel Sales', icon: 'wheel', desc: 'Sets sold by brand',
        kpis: () => [['Sets (12m)', u.num(u.sum(units(.22, 52000)))], ['Top brand', (itemsBy('wheels')[0] || { k: '—' }).k], ['Avg. set price', '₱52,000']],
        chart: (el) => C.bar(el, { labels: an.months, series: [{ name: 'Wheel sets sold', data: units(.22, 52000), color: P[2] }], height: 280 }),
        table: () => [['Brand', 'Sets', 'Revenue'], itemsBy('wheels').map((r) => [r.k, r.qty, u.peso(r.rev)]), [1, 2]] },
      { id: 'vehicles', name: 'Most Serviced Vehicles', icon: 'car', desc: 'Jobs by make & model',
        kpis: () => { const g = u.groupBy(S.records, (r) => { const v = st.vehicle(r.vehicleId); return v ? v.brand : '—'; }); const top = Object.keys(g).sort((a, b) => g[b].length - g[a].length)[0]; return [['Vehicles in system', S.vehicles.length], ['Top make', top], ['Makes serviced', Object.keys(g).length]]; },
        chart: (el) => { const g = u.groupBy(S.records, (r) => { const v = st.vehicle(r.vehicleId); return v ? v.brand + ' ' + v.model : '—'; }); C.hbars(el, Object.keys(g).map((k) => ({ label: k, value: g[k].length })).sort((a, b) => b.value - a.value).slice(0, 10)); },
        table: () => { const g = u.groupBy(S.records, (r) => { const v = st.vehicle(r.vehicleId); return v ? v.brand + ' ' + v.model : '—'; }); return [['Vehicle', 'Jobs', 'Revenue'], Object.keys(g).map((k) => [k, g[k].length, u.sum(g[k], (r) => r.cost)]).sort((a, b) => b[1] - a[1]).map((r) => [r[0], r[1], u.peso(r[2])]), [1, 2]]; } },
      { id: 'products', name: 'Most Purchased Products', icon: 'award', desc: 'By units sold',
        kpis: () => { const l = itemsBy(); return [['Products sold', l.length], ['Units', u.sum(l, (x) => x.qty)], ['Top seller', (l.slice().sort((a, b) => b.qty - a.qty)[0] || { k: '—' }).k.split(' ').slice(0, 3).join(' ')]]; },
        chart: (el) => C.hbars(el, itemsBy().sort((a, b) => b.qty - a.qty).slice(0, 10).map((x) => ({ label: x.k, value: x.qty })), { color: P[1] }),
        table: () => [['Product', 'Units', 'Revenue'], itemsBy().sort((a, b) => b.qty - a.qty).map((r) => [u.esc(r.k), r.qty, u.peso(r.rev)]), [1, 2]] },
      { id: 'growth', name: 'Customer Growth', icon: 'users', desc: 'New sign-ups per month',
        kpis: () => [['Total customers', S.customers.length + 1180], ['New (12m)', u.sum(an.newCustomers)], ['Retention', '78%']],
        chart: (el) => { let c = 1180 - u.sum(an.newCustomers.slice(0, 11)); C.line(el, { labels: an.months, series: [{ name: 'Total customers', data: an.newCustomers.map((n) => (c += n)) }], height: 280 }); },
        table: () => [['Month', 'New customers'], an.months.map((m, i) => [m, an.newCustomers[i]]).reverse(), [1]] },
      { id: 'inventory', name: 'Inventory Movement', icon: 'archive', desc: 'Units in vs. out',
        kpis: () => [['Units on hand', u.num(u.sum(st.inventoryRows(), (r) => r.v.stock))], ['Stock-ins (12m)', u.num(u.sum(an.productRev.map((v) => Math.round(v / 2400))))], ['Turnover', '6.4×']],
        chart: (el) => C.bar(el, { labels: an.months, series: [{ name: 'Stock in', data: an.productRev.map((v, i) => Math.round(v / 2400) + (i % 3) * 12) }, { name: 'Stock out', data: an.productRev.map((v) => Math.round(v / 2600)) }], height: 280 }),
        table: () => [['Category', 'On hand', 'Low / out SKUs'], AC.data.categories.map((c) => { const rs = st.inventoryRows().filter((r) => r.p.cat === c.id); return [c.name, u.num(u.sum(rs, (r) => r.v.stock)), rs.filter((r) => r.status !== 'In Stock').length]; }), [1, 2]] }
    ];
  }

  AC.adminViews.reports = function (el) {
    const D = defs();
    let cur = u.qsParam('r') || 'monthly';
    el.innerHTML = AC.shell.pageHead('Reports', 'Business performance across services, shop and inventory.', '<button class="btn btn-outline" data-print>' + AC.icon('printer') + 'Print</button><button class="btn btn-primary" data-export>' + AC.icon('download') + 'Export CSV</button>') +
      '<div class="grid-side-main"><div class="card" style="padding:8px;align-self:start"><div class="settings-nav" data-list>' + D.map((d) => '<button class="' + (d.id === cur ? 'active' : '') + '" data-r="' + d.id + '">' + AC.icon(d.icon) + d.name + '</button>').join('') + '</div></div><div data-out></div></div>';
    const out = el.querySelector('[data-out]');
    function show() {
      const d = D.find((x) => x.id === cur) || D[0];
      const tb = d.table();
      out.innerHTML = '<div class="card print-area"><div class="card-head"><div><div class="card-title">' + AC.icon(d.icon) + d.name + '</div><div class="card-sub">' + d.desc + ' · generated ' + u.fmtDateTime(new Date().toISOString()) + '</div></div></div>' +
        '<div class="card-body"><div class="grid-3 mb-20" style="gap:12px">' + d.kpis().map((k) => '<div class="card card-soft" style="padding:14px 16px"><div class="stat-label">' + k[0] + '</div><div class="h3 mt-4">' + k[1] + '</div></div>').join('') + '</div><div id="rep-chart"></div></div>' +
        tableHtml(tb[0], tb[1], tb[2]) + '</div>';
      d.chart(out.querySelector('#rep-chart'));
      el.querySelectorAll('[data-r]').forEach((b) => b.classList.toggle('active', b.dataset.r === cur));
    }
    el.querySelector('[data-list]').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) { cur = b.dataset.r; show(); } });
    el.querySelector('[data-print]').onclick = () => window.print();
    el.querySelector('[data-export]').onclick = () => { const d = D.find((x) => x.id === cur); const tb = d.table(); AC.kit.csv('report-' + d.id, tb[0], tb[1].map((r) => r.map((c) => String(c).replace(/<[^>]+>/g, '')))); };
    show();
  };
})();

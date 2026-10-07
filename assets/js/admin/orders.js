/* =========================================================
   AUTOCARE — admin/orders.js
   Order management (status tabs, advance/cancel, details
   with timeline & receipt) and Payments (collections,
   mark paid, refunds, method breakdown).
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store;
  const TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'];
  const flow = (o) => o.delivery === 'pickup' ? ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Completed'] : ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Completed'];
  const next = (o) => { const f = flow(o), i = f.indexOf(o.status); return i > -1 && i < f.length - 1 ? f[i + 1] : null; };

  AC.adminViews.orders = function (el) {
    const f = { tab: 'All', q: '', delivery: '' };
    el.innerHTML = AC.shell.pageHead('Orders', 'Shop orders for pickup and delivery.', '<button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export</button>') +
      '<div class="grid-4 mb-20" data-kpi></div><div class="card"><div class="tabs" style="padding:0 12px" data-tabs></div>' +
      AC.kit.toolbar({ placeholder: 'Search order no., customer, product…', filters: AC.ui.select('d', [{ value: '', label: 'All fulfillment' }, { value: 'pickup', label: 'Store Pickup' }, { value: 'delivery', label: 'Local Delivery' }], '', 'data-del aria-label="Fulfillment"') }) + '<div data-t></div></div>';
    const t = AC.kit.table(el.querySelector('[data-t]'), {
      per: 10, empty: ['bag', 'No orders found', ''],
      columns: [
        { label: 'Order', main: true, render: (o) => '<a class="cell-title mono" href="#/order/' + o.id + '">' + o.id + '</a><div class="cell-sub">' + u.fmtDateTime(o.date) + '</div>', sort: (o) => o.date },
        { label: 'Customer', render: (o) => AC.kit.cellUser(o.customer, o.phone || ''), sort: (o) => o.customer },
        { label: 'Items', render: (o) => '<div class="flex items-center gap-8"><div class="thumb" style="width:36px;height:36px">' + AC.art.product(st.product(o.items[0].pid)) + '</div><span class="small">' + u.sum(o.items, (i) => i.qty) + ' item(s)</span></div>' },
        { label: 'Total', cls: 'num', render: (o) => '<b>' + u.peso(o.total) + '</b>', sort: (o) => o.total },
        { label: 'Payment', render: (o) => '<div class="small">' + o.payment + '</div>' + AC.ui.badge(o.paymentStatus) },
        { label: 'Fulfillment', render: (o) => '<span class="tag">' + AC.icon(o.delivery === 'pickup' ? 'store' : 'truck') + (o.delivery === 'pickup' ? 'Pickup' : 'Delivery') + '</span>' },
        { label: 'Status', render: (o) => AC.ui.badge(o.status), sort: (o) => TABS.indexOf(o.status) },
        { label: '', cls: 'text-right', render: (o) => '<div class="actions">' + (next(o) ? '<button class="btn btn-soft btn-sm nowrap" data-next="' + o.id + '">' + AC.icon('arrow-right') + next(o) + '</button>' : '') + '<a class="btn btn-ghost btn-icon btn-sm" href="#/order/' + o.id + '" aria-label="View">' + AC.icon('eye') + '</a></div>' }
      ]
    });
    const rows = () => st.s.orders.filter((o) => (f.tab === 'All' || o.status === f.tab) && (!f.delivery || o.delivery === f.delivery) && u.match([o.id, o.customer, o.items.map((i) => i.name)], f.q));
    function draw(keep) {
      const O = st.s.orders;
      el.querySelector('[data-kpi]').innerHTML = AC.ui.statCard({ label: 'Pending orders', value: O.filter((o) => o.status === 'Pending').length, icon: 'clock', foot: 'Need confirmation' }) + AC.ui.statCard({ label: 'To fulfill', value: O.filter((o) => ['Confirmed', 'Processing'].includes(o.status)).length, icon: 'box', foot: 'Picking & packing' }) +
        AC.ui.statCard({ label: 'Out / ready', value: O.filter((o) => ['Out for Delivery', 'Ready for Pickup'].includes(o.status)).length, icon: 'truck', foot: 'With rider or at counter' }) + AC.ui.statCard({ label: 'Sales (all time)', value: u.pesoShort(u.sum(O.filter((o) => o.status !== 'Cancelled'), (o) => o.total)), icon: 'wallet', foot: O.length + ' orders' });
      el.querySelector('[data-tabs]').innerHTML = TABS.map((x) => '<button class="tab ' + (x === f.tab ? 'active' : '') + '" data-tab="' + x + '">' + x + ' <span class="count">' + (x === 'All' ? O.length : O.filter((o) => o.status === x).length) + '</span></button>').join('');
      t.set(rows(), keep);
    }
    AC.ui.tabs(el.querySelector('[data-tabs]'), (x) => { f.tab = x; draw(); });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); draw(); }, 150));
    el.querySelector('[data-del]').onchange = (e) => { f.delivery = e.target.value; draw(); };
    el.addEventListener('click', (e) => {
      const n = e.target.closest('[data-next]'); if (n) { const o = st.order(n.dataset.next), to = next(o); st.setOrderStatus(o.id, to); AC.ui.toast(o.id + ' → ' + to, 'Customer notified.', 'success'); draw(true); }
      if (e.target.closest('[data-export]')) AC.kit.csv('orders', ['Order', 'Date', 'Customer', 'Items', 'Subtotal', 'Shipping', 'Total', 'Payment', 'Payment Status', 'Fulfillment', 'Status'], rows().map((o) => [o.id, o.date, o.customer, o.items.map((i) => i.qty + 'x ' + i.name + ' (' + i.variant + ')').join('; '), o.subtotal, o.shipping, o.total, o.payment, o.paymentStatus, o.delivery, o.status]));
    });
    draw();
  };

  AC.adminViews.order = function (el, params) {
    const o = st.order(params[0]);
    if (!o) { el.innerHTML = AC.ui.empty('bag', 'Order not found', '', '<a class="btn btn-primary mt-8" href="#/orders">Back</a>'); return; }
    function render() {
      const F = o.status === 'Cancelled' ? ['Pending', 'Cancelled'] : flow(o), cur = F.indexOf(o.status), nx = next(o);
      el.innerHTML = AC.shell.pageHead('Order ' + o.id, u.fmtDateTime(o.date) + ' · ' + AC.ui.badge(o.status), '<button class="btn btn-outline" data-rcpt>' + AC.icon('printer') + 'Receipt</button>' + (['Completed', 'Cancelled'].includes(o.status) ? '' : '<button class="btn btn-danger-ghost" data-cancel>' + AC.icon('x-circle') + 'Cancel</button>') + (nx ? '<button class="btn btn-primary" data-next>' + AC.icon('arrow-right') + 'Mark as ' + nx + '</button>' : ''), [['Orders', '#/orders'], [o.id]]) +
        '<div class="grid-main-side"><div class="col gap-20"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('box') + 'Items (' + u.sum(o.items, (i) => i.qty) + ')</div></div>' +
        o.items.map((i) => { const p = st.product(i.pid), v = st.variant(i.pid, i.vkey); return '<div class="mini-row"><div class="thumb" style="width:56px;height:56px">' + AC.art.product(p) + '</div><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(i.name) + '</div><div class="small muted mono">' + u.esc(i.variant) + (v ? ' · SKU ' + u.esc(v.sku) + ' · ' + v.stock + ' left' : '') + '</div></div><span class="small muted">' + i.qty + ' × ' + u.peso(i.price) + '</span><b>' + u.peso(i.qty * i.price) + '</b></div>'; }).join('') +
        '<div class="card-foot" style="justify-content:flex-end"><div style="width:min(280px,100%)"><div class="sum-line"><span>Subtotal</span><span>' + u.peso(o.subtotal) + '</span></div><div class="sum-line"><span>Shipping</span><span>' + (o.shipping ? u.peso(o.shipping) : 'Free') + '</span></div><div class="sum-line" style="border:0"><span>Total</span><span class="h4">' + u.peso(o.total) + '</span></div></div></div></div>' +
        '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('activity') + 'Status timeline</div></div><div class="card-body"><div class="timeline">' +
        F.map((s, k) => { const tl = o.timeline.find((x) => x.status === s); const cls = s === 'Cancelled' ? 'cancel' : k < cur || (k === cur && s === 'Completed') ? 'done' : k === cur ? 'current' : ''; return '<div class="tl-item ' + cls + '"><span class="tl-dot">' + AC.icon(cls === 'cancel' ? 'x' : cls === 'done' ? 'check' : 'clock') + '</span><div><div class="tl-title">' + s + '</div><div class="tl-sub">' + (tl ? u.fmtDateTime(tl.at) : 'Pending') + '</div></div></div>'; }).join('') + '</div></div></div></div>' +
        '<div class="col gap-20"><div class="card card-body"><div class="xs muted strong mb-8">CUSTOMER</div>' + AC.kit.cellUser(o.customer, o.email || '') + '<dl class="kv mt-12" style="grid-template-columns:80px 1fr"><dt>Phone</dt><dd>' + u.esc(o.phone || '—') + '</dd><dt>' + (o.delivery === 'pickup' ? 'Pickup' : 'Address') + '</dt><dd>' + u.esc(o.address) + '</dd>' + (o.notes ? '<dt>Notes</dt><dd>' + u.esc(o.notes) + '</dd>' : '') + '</dl>' + (st.customer(o.customerId) ? '<a class="link small mt-8" style="display:inline-block" href="#/customer/' + o.customerId + '">Customer profile →</a>' : '') + '</div>' +
        '<div class="card card-body"><div class="xs muted strong mb-8">PAYMENT</div><div class="flex between items-center"><b>' + o.payment + '</b>' + AC.ui.badge(o.paymentStatus) + '</div>' + (o.paymentStatus !== 'Paid' && o.status !== 'Cancelled' ? '<button class="btn btn-outline btn-block mt-12" data-paid>' + AC.icon('check') + 'Mark as paid</button>' : '') + '</div>' +
        '<div class="card card-body">' + AC.ui.field('Update status', AC.ui.select('status', TABS.slice(1), o.status, 'data-status')) + '<button class="btn btn-primary btn-block mt-12" data-set>Update</button></div></div></div>';
    }
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-rcpt]')) AC.docs.fromOrder(o);
      if (e.target.closest('[data-next]')) { st.setOrderStatus(o.id, next(o)); AC.ui.toast('Order updated', o.status, 'success'); render(); }
      if (e.target.closest('[data-set]')) { const s = el.querySelector('[data-status]').value; if (s !== o.status) { if (s === 'Cancelled' && !(await AC.ui.confirm({ title: 'Cancel order?', message: 'Stock will be restored and payment refunded.', danger: true, confirmText: 'Cancel order' }))) return; st.setOrderStatus(o.id, s); AC.ui.toast('Status set to ' + s, null, 'success'); render(); } }
      if (e.target.closest('[data-cancel]')) { if (await AC.ui.confirm({ title: 'Cancel ' + o.id + '?', message: 'Stock will be restored and any payment refunded.', danger: true, confirmText: 'Cancel order' })) { st.setOrderStatus(o.id, 'Cancelled'); AC.ui.toast('Order cancelled', null, 'success'); render(); } }
      if (e.target.closest('[data-paid]')) { o.paymentStatus = 'Paid'; const p = st.s.payments.find((x) => x.ref === o.id); if (p) p.status = 'Paid'; st.log('Staff', st.s.staff.name, 'Recorded payment', o.id); st.save(); AC.ui.toast('Payment recorded', u.peso(o.total), 'success'); render(); }
    });
    render();
  };

  /* ---------------- Payments ---------------- */
  AC.adminViews.payments = function (el) {
    const f = { q: '', status: '', type: '', method: '' };
    el.innerHTML = AC.shell.pageHead('Payments', 'Collections from services and shop orders.', '<button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export</button>') +
      '<div class="grid-main-side mb-20" style="grid-template-columns:minmax(0,1fr) 380px"><div class="grid-2" style="gap:16px" data-kpi></div><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('pie') + 'By method (paid)</div></div><div class="card-body" id="pay-mix"></div></div></div>' +
      '<div class="card">' + AC.kit.toolbar({ placeholder: 'Search payment, reference, customer…', filters: AC.ui.select('s', [{ value: '', label: 'All statuses' }, 'Paid', 'Pending', 'Refunded'], '', 'data-s aria-label="Status"') + AC.ui.select('t', [{ value: '', label: 'All types' }, 'Service', 'Shop Order'], '', 'data-t2 aria-label="Type"') }) + '<div data-t></div></div>';
    const t = AC.kit.table(el.querySelector('[data-t]'), {
      per: 12, columns: [
        { label: 'Payment', main: true, render: (p) => '<div class="cell-title mono">' + p.id + '</div><div class="cell-sub">' + u.fmtDateTime(p.date) + '</div>', sort: (p) => p.date },
        { label: 'Reference', render: (p) => '<a class="link mono small" href="' + (p.type === 'Service' ? '#/workorder/' : '#/order/') + p.ref + '">' + p.ref + '</a>' },
        { label: 'Type', render: (p) => '<span class="tag">' + AC.icon(p.type === 'Service' ? 'wrench' : 'bag') + p.type + '</span>', sort: (p) => p.type },
        { label: 'Customer', render: (p) => u.esc((st.customer(p.customerId) || {}).name || '—') },
        { label: 'Method', render: (p) => u.esc(p.method), sort: (p) => p.method },
        { label: 'Amount', cls: 'num', render: (p) => '<b>' + u.peso(p.amount) + '</b>', sort: (p) => p.amount },
        { label: 'Status', render: (p) => AC.ui.badge(p.status), sort: (p) => p.status },
        { label: '', cls: 'text-right', render: (p) => '<div class="actions">' + (p.status === 'Pending' ? '<button class="btn btn-soft btn-sm" data-pay="' + p.id + '">Mark paid</button>' : '') + (p.status === 'Paid' ? '<button class="btn btn-ghost btn-sm" data-ref="' + p.id + '">Refund</button>' : '') + '</div>' }
      ]
    });
    const rows = () => st.s.payments.filter((p) => (!f.status || p.status === f.status) && (!f.type || p.type === f.type) && u.match([p.id, p.ref, p.method, (st.customer(p.customerId) || {}).name], f.q));
    function draw(keep) {
      const P = st.s.payments, paid = P.filter((p) => p.status === 'Paid');
      el.querySelector('[data-kpi]').innerHTML = AC.ui.statCard({ label: 'Collected', value: u.pesoShort(u.sum(paid, (p) => p.amount)), icon: 'wallet', foot: paid.length + ' payments' }) + AC.ui.statCard({ label: 'Outstanding', value: u.pesoShort(u.sum(P.filter((p) => p.status === 'Pending'), (p) => p.amount)), icon: 'clock', foot: P.filter((p) => p.status === 'Pending').length + ' pending' }) +
        AC.ui.statCard({ label: 'Service payments', value: u.pesoShort(u.sum(paid.filter((p) => p.type === 'Service'), (p) => p.amount)), icon: 'wrench', foot: 'Paid work orders' }) + AC.ui.statCard({ label: 'Refunded', value: u.pesoShort(u.sum(P.filter((p) => p.status === 'Refunded'), (p) => p.amount)), icon: 'refresh', foot: P.filter((p) => p.status === 'Refunded').length + ' refunds' });
      const g = u.groupBy(paid.filter((p) => p.method !== '—'), (p) => p.method);
      const items = Object.keys(g).map((k) => ({ label: k, value: u.sum(g[k], (p) => p.amount) })).sort((a, b) => b.value - a.value);
      const top = items.slice(0, 3); if (items.length > 3) top.push({ label: 'Others', value: u.sum(items.slice(3), (x) => x.value) });
      AC.charts.donut(el.querySelector('#pay-mix'), { items: top, format: u.pesoShort, size: 150, center: { value: u.pesoShort(u.sum(items, (x) => x.value)), label: 'Collected' } });
      t.set(rows(), keep);
    }
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); draw(); }, 150));
    el.querySelector('[data-s]').onchange = (e) => { f.status = e.target.value; draw(); };
    el.querySelector('[data-t2]').onchange = (e) => { f.type = e.target.value; draw(); };
    el.addEventListener('click', async (e) => {
      const pp = e.target.closest('[data-pay]');
      if (pp) {
        const p = st.s.payments.find((x) => x.id === pp.dataset.pay);
        const m = AC.ui.modal({ title: 'Record payment', sub: p.ref + ' · ' + u.peso(p.amount), size: 'sm', body: AC.ui.field('Payment method', AC.ui.select('m', ['Cash', 'GCash', 'Maya', 'Card', 'Bank Transfer'], p.method === '—' ? 'Cash' : p.method)) + '<div class="mt-12">' + AC.ui.field('Reference no.', '<input class="input" placeholder="Optional">') + '</div>', foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-ok>Confirm payment</button>' });
        m.el.querySelector('[data-ok]').onclick = () => { p.method = m.el.querySelector('[name=m]').value; p.status = 'Paid'; const o = st.order(p.ref); if (o) o.paymentStatus = 'Paid'; st.log('Staff', st.s.staff.name, 'Recorded ' + p.method + ' payment', p.ref); st.save(); m.close(); AC.ui.toast('Payment recorded', u.peso(p.amount), 'success'); draw(true); };
      }
      const rf = e.target.closest('[data-ref]');
      if (rf) { const p = st.s.payments.find((x) => x.id === rf.dataset.ref); if (await AC.ui.confirm({ title: 'Refund ' + u.peso(p.amount) + '?', message: 'Refund to the original ' + p.method + ' payment for ' + p.ref + '.', danger: true, confirmText: 'Issue refund' })) { p.status = 'Refunded'; st.log('Admin', st.s.staff.name, 'Issued refund', p.ref); st.save(); AC.ui.toast('Refund issued', null, 'success'); draw(true); } }
      if (e.target.closest('[data-export]')) AC.kit.csv('payments', ['Payment', 'Date', 'Reference', 'Type', 'Customer', 'Method', 'Amount', 'Status'], rows().map((p) => [p.id, p.date, p.ref, p.type, (st.customer(p.customerId) || {}).name, p.method, p.amount, p.status]));
    });
    draw();
  };
})();

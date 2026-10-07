/* =========================================================
   AUTOCARE — customer/orders.js
   My Orders (status tabs + search) and order details with
   tracking timeline, items, receipt, cancel & re-order.
   ========================================================= */
window.AC = window.AC || {};
AC.custViews = AC.custViews || {};

(function () {
  const u = AC.u, st = AC.store;
  const TABS = ['All', 'Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'];

  AC.custViews.orders = function (el) {
    let tab = 'All', q = '';
    el.innerHTML = AC.shell.pageHead('My Orders', 'Track your shop purchases and download receipts.', '<a class="btn btn-primary" href="shop.html">' + AC.icon('store') + 'Shop Now</a>') +
      '<div class="card"><div class="tabs" style="padding:0 12px" data-tabs></div><div class="toolbar"><div class="searchbar">' + AC.icon('search') + '<input class="input" placeholder="Search order no. or product…" data-q aria-label="Search orders"></div></div><div data-list></div></div>';
    function render() {
      const all = AC.cust.orders();
      el.querySelector('[data-tabs]').innerHTML = TABS.map((t) => { const n = t === 'All' ? all.length : all.filter((o) => o.status === t).length; return '<button class="tab ' + (t === tab ? 'active' : '') + '" data-tab="' + t + '">' + t + (n ? ' <span class="count">' + n + '</span>' : '') + '</button>'; }).join('');
      const list = all.filter((o) => (tab === 'All' || o.status === tab) && u.match([o.id, o.items.map((i) => i.name + ' ' + i.variant)], q));
      el.querySelector('[data-list]').innerHTML = list.length ? list.map((o) =>
        '<a class="mini-row" href="#/order/' + o.id + '" style="padding:16px 20px;align-items:flex-start">' +
        '<div class="flex" style="gap:-8px">' + o.items.slice(0, 2).map((i, k) => '<div class="thumb" style="width:56px;height:56px;' + (k ? 'margin-left:-14px;box-shadow:-3px 0 0 #fff' : '') + '">' + AC.art.product(st.product(i.pid)) + '</div>').join('') + '</div>' +
        '<div class="grow" style="min-width:0"><div class="flex items-center gap-8 wrap"><b class="mono">' + o.id + '</b>' + AC.ui.badge(o.status) + '</div>' +
        '<div class="small truncate mt-4">' + o.items.map((i) => i.qty + '× ' + u.esc(i.name)).join(', ') + '</div>' +
        '<div class="xs muted mt-4">' + u.fmtDateTime(o.date) + ' · ' + (o.delivery === 'pickup' ? 'Store Pickup' : 'Delivery') + ' · ' + o.payment + '</div></div>' +
        '<div class="text-right"><div class="strong">' + u.peso(o.total) + '</div><div class="xs mt-4">' + AC.ui.badge(o.paymentStatus) + '</div></div></a>').join('') :
        AC.ui.empty('bag', tab === 'All' ? 'No orders yet' : 'No ' + tab.toLowerCase() + ' orders', 'Orders you place in the shop appear here.', '<a class="btn btn-primary btn-sm mt-8" href="shop.html">Visit shop</a>');
    }
    AC.ui.tabs(el.querySelector('[data-tabs]'), (t) => { tab = t; render(); });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { q = e.target.value.trim(); render(); }, 150));
    render();
  };

  AC.custViews.order = function (el, params) {
    const o = st.order(params[0]);
    if (!o || o.customerId !== AC.session.customerId()) { el.innerHTML = AC.ui.empty('bag', 'Order not found', '', '<a class="btn btn-primary mt-8" href="#/orders">Back to orders</a>'); return; }
    const flow = o.status === 'Cancelled' ? ['Pending', 'Cancelled'] : o.delivery === 'pickup' ? ['Pending', 'Confirmed', 'Processing', 'Ready for Pickup', 'Completed'] : ['Pending', 'Confirmed', 'Processing', 'Out for Delivery', 'Completed'];
    const cur = flow.indexOf(o.status);
    const DESC = { Pending: 'Order received — awaiting confirmation', Confirmed: 'Payment & stock verified', Processing: 'Items being prepared & quality-checked', 'Ready for Pickup': 'Ready at ' + st.s.settings.shopName, 'Out for Delivery': 'With our rider — please keep your phone on', Completed: o.delivery === 'pickup' ? 'Picked up. Thank you!' : 'Delivered. Thank you!', Cancelled: 'Order was cancelled' };
    el.innerHTML = AC.shell.pageHead('Order ' + o.id, 'Placed ' + u.fmtDateTime(o.date), (o.status === 'Pending' ? '<button class="btn btn-danger-ghost" data-cancel>' + AC.icon('x-circle') + 'Cancel order</button>' : '') + '<button class="btn btn-outline" data-rcpt>' + AC.icon('file') + 'Receipt</button><button class="btn btn-primary" data-reorder>' + AC.icon('repeat') + 'Buy again</button>', [['My Orders', '#/orders'], [o.id]]) +
      '<div class="grid-main-side"><div class="col gap-20">' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('truck') + 'Order Tracking</div>' + AC.ui.badge(o.status, 'badge-lg') + '</div><div class="card-body"><div class="timeline">' +
      flow.map((s, i) => { const t = o.timeline.find((x) => x.status === s); const cls = o.status === 'Cancelled' && s === 'Cancelled' ? 'cancel' : i < cur || (i === cur && s === 'Completed') ? 'done' : i === cur ? 'current' : ''; return '<div class="tl-item ' + cls + '"><span class="tl-dot">' + AC.icon(cls === 'cancel' ? 'x' : cls === 'done' ? 'check' : cls === 'current' ? 'clock' : 'chevron-right') + '</span><div><div class="tl-title">' + s + '</div><div class="tl-sub">' + DESC[s] + (t ? ' · ' + u.relTime(t.at) : '') + '</div></div></div>'; }).join('') +
      '</div></div></div>' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('box') + 'Items</div></div>' +
      o.items.map((i) => { const p = st.product(i.pid); return '<div class="mini-row"><a class="thumb" style="width:60px;height:60px" href="shop.html#/product/' + i.pid + '">' + AC.art.product(p) + '</a><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(i.name) + '</div><div class="small muted mono">' + u.esc(i.variant) + '</div><div class="small">' + i.qty + ' × ' + u.peso(i.price) + '</div></div><b>' + u.peso(i.qty * i.price) + '</b></div>'; }).join('') + '</div></div>' +
      '<div class="col gap-20"><div class="card card-body"><div class="h4 mb-12">Summary</div>' +
      '<div class="sum-line"><span>Subtotal</span><span>' + u.peso(o.subtotal) + '</span></div><div class="sum-line"><span>Shipping</span><span>' + (o.shipping ? u.peso(o.shipping) : 'Free') + '</span></div><div class="sum-line" style="border:0"><span>Total</span><span class="h4">' + u.peso(o.total) + '</span></div>' +
      '<div class="divider"></div><dl class="kv" style="grid-template-columns:100px 1fr"><dt>Payment</dt><dd>' + o.payment + ' ' + AC.ui.badge(o.paymentStatus) + '</dd><dt>' + (o.delivery === 'pickup' ? 'Pickup' : 'Ship to') + '</dt><dd>' + u.esc(o.address) + '</dd><dt>Contact</dt><dd>' + u.esc(o.phone || '') + '</dd></dl></div>' +
      '<div class="card card-body"><div class="strong mb-8">Need help with this order?</div><p class="small muted">Our shop team is available ' + u.esc(st.s.settings.hours) + '.</p><div class="btn-group mt-12"><a class="btn btn-outline btn-sm" href="index.html#contact">' + AC.icon('headset') + 'Contact us</a><a class="btn btn-ghost btn-sm" href="#/book">Book installation</a></div></div></div></div>';
    el.querySelector('[data-rcpt]').onclick = () => AC.docs.fromOrder(o);
    el.querySelector('[data-reorder]').onclick = () => { let n = 0; o.items.forEach((i) => { if (st.addToCart(i.pid, i.vkey, i.qty)) n++; }); AC.ui.toast(n ? 'Added to cart' : 'Items unavailable', n + ' item(s) added.', n ? 'success' : 'warning'); if (n) setTimeout(() => (location.href = 'shop.html#/cart'), 600); };
    const c = el.querySelector('[data-cancel]');
    if (c) c.onclick = async () => { if (await AC.ui.confirm({ title: 'Cancel ' + o.id + '?', message: 'Items will be returned to stock and any payment refunded within 3–5 banking days.', danger: true, confirmText: 'Cancel order' })) { st.setOrderStatus(o.id, 'Cancelled', 'Customer'); AC.ui.toast('Order cancelled', o.id, 'success'); AC.router.refresh(); } };
  };
})();

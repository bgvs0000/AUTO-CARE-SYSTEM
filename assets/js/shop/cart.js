/* =========================================================
   AUTOCARE — shop/cart.js
   Shopping cart, checkout (customer info, delivery,
   payment UI) and order confirmation.
   ========================================================= */
window.AC = window.AC || {};
AC.shopViews = AC.shopViews || {};

(function () {
  const u = AC.u, H = AC.data.productHelpers;

  function itemRow(x, compact) {
    return '<div class="cart-item" data-line="' + x.i + '">' +
      '<a class="thumb" href="#/product/' + x.p.id + '?v=' + encodeURIComponent(x.v.key) + '">' + AC.art.product(x.p) + '</a>' +
      '<div style="min-width:0"><div class="xs muted strong" style="letter-spacing:.06em;text-transform:uppercase">' + u.esc(x.p.brand) + '</div>' +
      '<a class="strong" href="#/product/' + x.p.id + '">' + u.esc(x.p.name) + '</a>' +
      '<div class="small muted mono truncate">' + u.esc(H.variantSpec(x.p, x.v)) + '</div>' +
      '<div class="small mt-4">' + u.peso(x.price) + ' <span class="muted">' + AC.shopUI.unitShort(x.p) + '</span></div></div>' +
      '<div class="ci-right">' +
      (compact ? '<span class="small muted">× ' + x.qty + '</span>' : '<div class="qty"><button data-dq="-1" aria-label="Decrease">' + AC.icon('minus') + '</button><input type="number" value="' + x.qty + '" min="1" data-qi aria-label="Quantity"><button data-dq="1" aria-label="Increase">' + AC.icon('plus') + '</button></div>') +
      '<div class="flex items-center gap-8"><b>' + u.peso(x.subtotal) + '</b>' + (compact ? '' : '<button class="icon-btn" style="width:32px;height:32px" data-rm aria-label="Remove">' + AC.icon('trash') + '</button>') + '</div></div></div>';
  }

  /* ---------------- Cart ---------------- */
  AC.shopViews.cart = function (el) {
    let promo = null;
    function render() {
      const t = AC.store.cartTotals('delivery');
      if (!t.items.length) {
        el.innerHTML = '<div class="card">' + AC.ui.empty('cart', 'Your cart is empty', 'Browse tires, mags and accessories — or use the finder to get parts that fit your car.', '<div class="btn-group mt-8"><a class="btn btn-primary" href="#/all">Continue Shopping</a><a class="btn btn-outline" href="#/tires">Tire Finder</a></div>') + '</div>';
        return;
      }
      const disc = promo ? Math.round(t.sub * .05) : 0;
      el.innerHTML = '<div class="cart-layout"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('cart') + 'Cart <span class="badge">' + t.count + ' items</span></div><button class="btn btn-ghost btn-sm" data-clear>' + AC.icon('trash') + 'Clear cart</button></div>' +
        t.items.map((x) => itemRow(x)).join('') + '</div>' +
        '<aside class="summary"><div class="card card-body"><div class="h4 mb-12">Order Summary</div>' +
        '<div class="summary-row"><span class="muted">Subtotal</span><b>' + u.peso(t.sub) + '</b></div>' +
        '<div class="summary-row"><span class="muted">Estimated shipping</span><b>' + (t.ship ? u.peso(t.ship) : '<span class="text-green">Free</span>') + '</b></div>' +
        (disc ? '<div class="summary-row"><span class="muted">Promo (' + promo + ')</span><b class="text-green">−' + u.peso(disc) + '</b></div>' : '') +
        (t.ship ? '<div class="progress mt-8"><div class="progress-bar" style="width:' + Math.min(100, (t.sub / AC.store.s.settings.freeDeliveryMin) * 100) + '%"></div></div><div class="xs muted mt-4">Add ' + u.peso(AC.store.s.settings.freeDeliveryMin - t.sub) + ' more for free delivery</div>' : '') +
        '<div class="summary-row total"><span>Total</span><span>' + u.peso(t.total - disc) + '</span></div><div class="xs muted">VAT inclusive. Store pickup is always free.</div>' +
        '<div class="flex gap-8 mt-16"><input class="input input-sm" placeholder="Promo code" data-promo aria-label="Promo code" value="' + (promo || '') + '"><button class="btn btn-outline btn-sm" data-apply>Apply</button></div>' +
        '<a class="btn btn-primary btn-lg btn-block mt-16" href="#/checkout">Proceed to Checkout ' + AC.icon('arrow-right', 'i-arrow') + '</a>' +
        '<a class="btn btn-ghost btn-block mt-8" href="#/all">' + AC.icon('arrow-left') + 'Continue Shopping</a></div>' +
        '<div class="flex gap-8 mt-12 small muted items-center" style="padding:0 4px">' + AC.icon('lock') + ' Secure checkout · GCash · Maya · Card · COD</div></aside></div>';
      el.querySelectorAll('[data-line]').forEach((row) => {
        const i = +row.dataset.line, line = AC.store.s.cart[i];
        row.querySelectorAll('[data-dq]').forEach((b) => (b.onclick = () => { AC.store.setQty(i, line.qty + +b.dataset.dq); render(); }));
        row.querySelector('[data-qi]').onchange = (e) => { AC.store.setQty(i, +e.target.value || 1); render(); };
        row.querySelector('[data-rm]').onclick = () => { row.classList.add('removing'); setTimeout(() => { AC.store.removeLine(i); AC.ui.toast('Item removed', null, 'info'); render(); }, 230); };
      });
      el.querySelector('[data-clear]').onclick = async () => { if (await AC.ui.confirm({ title: 'Clear your cart?', message: 'All items will be removed.', danger: true, confirmText: 'Clear cart' })) { AC.store.clearCart(); render(); } };
      el.querySelector('[data-apply]').onclick = () => {
        const c = el.querySelector('[data-promo]').value.trim().toUpperCase();
        if (c === 'AUTOCARE5') { promo = c; AC.ui.toast('Promo applied', '5% off your order.', 'success'); render(); }
        else AC.ui.toast('Invalid promo code', 'Try AUTOCARE5 (demo).', 'warning');
      };
    }
    render();
  };

  /* ---------------- Checkout ---------------- */
  AC.shopViews.checkout = function (el) {
    const c = AC.session.customer();
    let delivery = 'delivery', payment = 'GCash';
    if (!AC.store.cartItems().length) { el.innerHTML = '<div class="card">' + AC.ui.empty('cart', 'Nothing to check out', 'Your cart is empty.', '<a class="btn btn-primary mt-8" href="#/all">Shop now</a>') + '</div>'; return; }
    const PAY = [['Cash on Delivery', 'cod', 'COD'], ['GCash', 'gcash', 'G'], ['Maya', 'maya', 'maya'], ['Card', 'card', 'VISA'], ['Bank Transfer', 'bank', 'BANK']];
    el.innerHTML = '<form class="cart-layout" data-co novalidate>' +
      '<div class="col gap-20">' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('user') + '1. Customer information</div><span class="small muted">Logged in as ' + u.esc(c.name) + '</span></div><div class="card-body form-grid">' +
      AC.ui.field('Full name <span class="req">*</span>', '<input class="input" name="name" required value="' + u.esc(c.name) + '">') +
      AC.ui.field('Phone <span class="req">*</span>', '<input class="input" name="phone" required value="' + u.esc(c.phone) + '">') +
      AC.ui.field('Email <span class="req">*</span>', '<input class="input" type="email" name="email" required value="' + u.esc(c.email) + '">', 'span-2') +
      AC.ui.field('Delivery address <span class="req">*</span>', '<textarea class="textarea" name="address" required style="min-height:70px">' + u.esc(c.address) + '</textarea>', 'span-2') + '</div></div>' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('truck') + '2. Delivery option</div></div><div class="card-body grid-2" style="gap:10px" data-deliv>' +
      '<button type="button" class="option" data-d="pickup"><div class="icon-tile">' + AC.icon('store') + '</div><div><div class="strong">Store Pickup</div><div class="small muted">Ready in 2–4 hours · Free</div></div><span class="opt-check">' + AC.icon('check') + '</span></button>' +
      '<button type="button" class="option selected" data-d="delivery"><div class="icon-tile">' + AC.icon('truck') + '</div><div><div class="strong">Local Delivery</div><div class="small muted">Metro Manila 1–2 days · ₱250 (free ≥ ₱10k)</div></div><span class="opt-check">' + AC.icon('check') + '</span></button></div></div>' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('card') + '3. Payment method</div><span class="small muted">' + AC.icon('lock') + '</span></div><div class="card-body"><div class="pay-grid" data-pay>' +
      PAY.map((x) => '<button type="button" class="option ' + (x[0] === payment ? 'selected' : '') + '" data-p="' + x[0] + '"><span class="pay-logo ' + x[1] + '">' + x[2] + '</span><span class="strong small">' + x[0] + '</span><span class="opt-check">' + AC.icon('check') + '</span></button>').join('') +
      '</div><div class="mt-16" data-payfields></div></div></div>' +
      '<div class="card card-body">' + AC.ui.field('Order notes (optional)', '<textarea class="textarea" name="notes" placeholder="e.g. Please call before delivery. Install at Quezon Ave. branch on Saturday."></textarea>') + '</div>' +
      '</div>' +
      '<aside class="summary"><div class="card card-body" data-sum></div></aside></form>';

    const form = el.querySelector('[data-co]');
    function payFields() {
      const pf = el.querySelector('[data-payfields]');
      pf.innerHTML = payment === 'Card' ? '<div class="form-grid">' + AC.ui.field('Card number', '<input class="input mono" name="card" required placeholder="4242 4242 4242 4242" inputmode="numeric" maxlength="19">', 'span-2') + AC.ui.field('Expiry', '<input class="input mono" name="exp" required placeholder="MM/YY" maxlength="5">') + AC.ui.field('CVC', '<input class="input mono" name="cvc" required placeholder="123" maxlength="4">') + '</div>' :
        payment === 'GCash' || payment === 'Maya' ? '<div class="alert">' + AC.icon('phone') + '<div>You’ll be redirected to <b>' + payment + '</b> to authorize the payment. Registered number: <b class="mono">' + u.esc(c.phone) + '</b></div></div>' :
          payment === 'Bank Transfer' ? '<div class="alert">' + AC.icon('info') + '<div>Transfer to <b>BPI · AutoCare Automotive Services · 1234-5678-90</b>. Upload proof of payment in My Orders within 24 hours.</div></div>' :
            '<div class="alert">' + AC.icon('wallet') + '<div>Pay in cash when your order is delivered or picked up. Please prepare the exact amount.</div></div>';
      const card = pf.querySelector('[name=card]');
      if (card) card.oninput = () => { card.value = card.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); };
    }
    function summary() {
      const t = AC.store.cartTotals(delivery);
      el.querySelector('[data-sum]').innerHTML = '<div class="h4 mb-12">Order Summary</div><div style="margin:0 -20px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);max-height:320px;overflow:auto">' + t.items.map((x) => itemRow(x, true)).join('') + '</div>' +
        '<div class="mt-12"><div class="summary-row"><span class="muted">Subtotal (' + t.count + ' items)</span><b>' + u.peso(t.sub) + '</b></div>' +
        '<div class="summary-row"><span class="muted">' + (delivery === 'pickup' ? 'Store pickup' : 'Delivery fee') + '</span><b>' + (t.ship ? u.peso(t.ship) : '<span class="text-green">Free</span>') + '</b></div>' +
        '<div class="summary-row"><span class="muted">VAT (12%, included)</span><span class="muted">' + u.peso(t.total - t.total / 1.12) + '</span></div>' +
        '<div class="summary-row total"><span>Total</span><span>' + u.peso(t.total) + '</span></div></div>' +
        '<button class="btn btn-primary btn-lg btn-block mt-16" type="submit">' + AC.icon('lock') + 'Place Order</button>' +
        '<a class="btn btn-ghost btn-block mt-8" href="#/cart">Back to cart</a><p class="xs muted text-center mt-8">By placing your order you agree to AutoCare’s terms of sale.</p>';
    }
    el.querySelector('[data-deliv]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-d]'); if (!b) return;
      delivery = b.dataset.d;
      el.querySelectorAll('[data-d]').forEach((x) => x.classList.toggle('selected', x === b));
      form.address.required = delivery === 'delivery';
      form.address.closest('.field').style.opacity = delivery === 'delivery' ? 1 : .5;
      summary();
    });
    el.querySelector('[data-pay]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-p]'); if (!b) return;
      payment = b.dataset.p;
      el.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('selected', x === b));
      payFields();
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!AC.ui.validate(form)) return;
      const btn = form.querySelector('[type=submit]');
      await AC.ui.busy(btn, 1100);
      const d = AC.ui.formData(form);
      const o = AC.store.placeOrder({ customerId: c.id, name: d.name, phone: d.phone, email: d.email, address: d.address, delivery, payment, notes: d.notes });
      if (o) AC.router.go('success/' + o.id);
    });
    payFields(); summary();
  };

  /* ---------------- Success ---------------- */
  AC.shopViews.success = function (el, id) {
    const o = AC.store.order(id);
    if (!o) { el.innerHTML = AC.ui.empty('bag', 'Order not found', '', '<a class="btn btn-primary mt-8" href="#/all">Back to shop</a>'); return; }
    el.innerHTML = '<div class="success-wrap"><div class="success-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
      '<h2 class="h2">Order placed!</h2><p class="lead mt-8">Thanks, ' + u.esc(o.customer.split(' ')[0]) + '. We’ve sent a confirmation to ' + u.esc(o.email) + '.</p>' +
      '<div class="card card-body mt-24" style="text-align:left"><div class="flex between items-center wrap gap-12"><div><div class="xs muted strong">ORDER NUMBER</div><div class="h3 mono">' + o.id + '</div></div>' + AC.ui.badge(o.status, 'badge-lg') + '</div><div class="divider"></div>' +
      '<dl class="kv"><dt>Date</dt><dd>' + u.fmtDateTime(o.date) + '</dd><dt>Items</dt><dd>' + o.items.map((i) => i.qty + ' × ' + u.esc(i.name) + ' <span class="muted">(' + u.esc(i.variant) + ')</span>').join('<br>') + '</dd>' +
      '<dt>Delivery</dt><dd>' + (o.delivery === 'pickup' ? 'Store Pickup' : 'Local Delivery') + '</dd><dt>Payment</dt><dd>' + o.payment + ' · ' + AC.ui.badge(o.paymentStatus) + '</dd><dt>Total</dt><dd class="h4">' + u.peso(o.total) + '</dd></dl></div>' +
      '<div class="btn-group mt-24" style="justify-content:center"><a class="btn btn-primary btn-lg" href="customer.html#/order/' + o.id + '">' + AC.icon('activity') + 'Track Order</a><a class="btn btn-outline btn-lg" href="#/all">Continue Shopping</a></div></div>';
  };
})();

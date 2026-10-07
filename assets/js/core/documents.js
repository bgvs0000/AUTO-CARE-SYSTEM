/* =========================================================
   AUTOCARE — core/documents.js
   Printable documents: service invoice, work-order sheet,
   shop order receipt. Shared by customer & admin portals.
   ========================================================= */
window.AC = window.AC || {};

AC.docs = (function () {
  const u = AC.u;

  function render(d) {
    const sub = u.sum(d.lines, (l) => l.qty * l.price);
    const vat = sub - sub / 1.12;
    const S = AC.store.s.settings;
    return '<div class="invoice print-area">' +
      '<div class="invoice-head"><div>' + AC.logo() + '<div class="small muted mt-8">' + u.esc(S.address) + '<br>' + u.esc(S.phone) + ' · ' + u.esc(S.email) + '<br>VAT Reg. TIN 008-123-456-000</div></div>' +
      '<div class="text-right"><div class="xs muted strong" style="letter-spacing:.1em">' + u.esc(d.title) + '</div><div class="h3 mono mt-4">' + u.esc(d.no) + '</div><div class="small muted mt-4">' + u.esc(d.date) + '</div>' +
      '<div class="mt-8"><span class="stamp ' + (d.paid ? '' : 'unpaid') + '">' + (d.paid ? 'PAID' : 'UNPAID') + '</span></div></div></div>' +
      '<div class="grid-2 mt-16" style="gap:16px"><div><div class="xs muted strong">BILL TO</div><div class="strong mt-4">' + u.esc(d.to.name) + '</div><div class="small muted">' + u.esc(d.to.address || '') + '<br>' + u.esc(d.to.phone || '') + ' · ' + u.esc(d.to.email || '') + '</div></div>' +
      (d.vehicle ? '<div><div class="xs muted strong">VEHICLE</div><div class="strong mt-4">' + u.esc(AC.store.vName(d.vehicle)) + '</div><div class="small muted">Plate ' + u.esc(d.vehicle.plate) + ' · VIN ' + u.esc(d.vehicle.vin || '—') + '<br>' + (d.mileage ? 'Odometer ' + u.km(d.mileage) : '') + (d.tech ? ' · Technician: ' + u.esc(d.tech) : '') + '</div></div>' : '<div><div class="xs muted strong">FULFILLMENT</div><div class="strong mt-4">' + u.esc(d.fulfil || '') + '</div><div class="small muted">' + u.esc(d.payment || '') + '</div></div>') + '</div>' +
      '<table><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead><tbody>' +
      d.lines.map((l) => '<tr><td>' + u.esc(l.desc) + (l.sub ? '<div class="xs muted">' + u.esc(l.sub) + '</div>' : '') + '</td><td class="num">' + l.qty + '</td><td class="num">' + u.peso(l.price, true) + '</td><td class="num">' + u.peso(l.qty * l.price, true) + '</td></tr>').join('') +
      '</tbody></table>' +
      '<div class="invoice-total"><div><span class="muted">VATable sales</span><span>' + u.peso(sub - vat, true) + '</span></div><div><span class="muted">VAT (12%)</span><span>' + u.peso(vat, true) + '</span></div>' +
      (d.shipping ? '<div><span class="muted">Delivery</span><span>' + u.peso(d.shipping, true) + '</span></div>' : '') +
      '<div class="grand"><span>Total</span><span>' + u.peso(sub + (d.shipping || 0), true) + '</span></div></div>' +
      (d.notes ? '<div class="small muted mt-16"><b style="color:var(--black)">Notes:</b> ' + u.esc(d.notes) + '</div>' : '') +
      '<p class="xs muted mt-24 text-center">Thank you for choosing AutoCare. Parts & labor warranty: 6 months / 10,000 km, whichever comes first.</p></div>';
  }

  function open(d) {
    const m = AC.ui.modal({
      title: d.title, sub: d.no, size: 'lg', body: render(d),
      foot: '<button class="btn btn-outline" data-close>Close</button><button class="btn btn-outline" data-dl>' + AC.icon('download') + 'Download PDF</button><button class="btn btn-primary" data-print>' + AC.icon('printer') + 'Print</button>'
    });
    m.el.querySelector('[data-print]').onclick = () => window.print();
    m.el.querySelector('[data-dl]').onclick = () => AC.ui.toast('Preparing PDF…', 'Use Print → “Save as PDF” in this demo.', 'info');
  }

  function fromRecord(r) {
    const v = AC.store.vehicle(r.vehicleId), c = AC.store.customer(r.customerId), s = AC.store.service(r.serviceId);
    const labor = Math.round(r.cost * .45 / 10) * 10;
    return open({
      title: 'SERVICE INVOICE', no: r.invoice, date: u.fmtDate(r.date, 'long'), paid: r.paid !== false, to: c, vehicle: v, mileage: r.mileage, tech: AC.store.techName(r.techId),
      lines: [{ desc: (s ? s.name : r.service) + ' — labor', sub: s ? s.desc : '', qty: 1, price: labor }, { desc: 'Parts & consumables', sub: r.notes || 'Per work order', qty: 1, price: r.cost - labor }],
      notes: r.notes
    });
  }
  function fromWO(w) {
    const v = AC.store.vehicle(w.vehicleId), c = AC.store.customer(w.customerId);
    return open({
      title: w.status === 'Completed' ? 'SERVICE INVOICE' : 'WORK ORDER ESTIMATE', no: w.id, date: u.fmtDateTime(w.started), paid: w.status === 'Completed', to: c, vehicle: v, mileage: v && v.mileage, tech: AC.store.techName(w.techId),
      lines: w.parts.map((p) => ({ desc: p.name, qty: p.qty, price: p.price })).concat([{ desc: 'Labor — ' + w.service, qty: 1, price: w.labor }]),
      notes: w.diagnosis
    });
  }
  function fromOrder(o) {
    const c = AC.store.customer(o.customerId) || { name: o.customer, address: o.address, phone: o.phone, email: o.email };
    return open({
      title: 'OFFICIAL RECEIPT', no: o.id, date: u.fmtDateTime(o.date), paid: o.paymentStatus === 'Paid', to: Object.assign({}, c, { address: o.address }),
      fulfil: o.delivery === 'pickup' ? 'Store Pickup' : 'Local Delivery', payment: 'Payment: ' + o.payment, shipping: o.shipping,
      lines: o.items.map((i) => ({ desc: i.name, sub: i.variant, qty: i.qty, price: i.price })), notes: o.notes
    });
  }
  return { open, fromRecord, fromWO, fromOrder };
})();

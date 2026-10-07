/* =========================================================
   AUTOCARE — admin/customers.js
   Customer management: searchable/sortable table, add,
   edit, suspend/reactivate, delete, CSV export, and a
   full customer profile (vehicles, services, purchases).
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store;
  const stats = (c) => {
    const S = st.s;
    return {
      vehicles: S.vehicles.filter((v) => v.customerId === c.id).length,
      services: S.records.filter((r) => r.customerId === c.id).length,
      purchases: u.sum(S.orders.filter((o) => o.customerId === c.id && o.status !== 'Cancelled'), (o) => o.total)
    };
  };

  function form(c, onSave) {
    const isEdit = !!c; c = c || { status: 'Active', tier: 'Regular' };
    const m = AC.ui.modal({
      title: isEdit ? 'Edit customer' : 'Add customer', sub: isEdit ? c.id : 'Create a customer account (walk-in or phone)',
      body: '<form class="form-grid" data-f novalidate>' + AC.ui.field('Full name <span class="req">*</span>', '<input class="input" name="name" required value="' + u.esc(c.name || '') + '">', 'span-2') +
        AC.ui.field('Email <span class="req">*</span>', '<input class="input" type="email" name="email" required value="' + u.esc(c.email || '') + '">') + AC.ui.field('Phone <span class="req">*</span>', '<input class="input" name="phone" required placeholder="+63 9XX XXX XXXX" value="' + u.esc(c.phone || '') + '">') +
        AC.ui.field('City', '<input class="input" name="city" value="' + u.esc(c.city || '') + '">') + AC.ui.field('Tier', AC.ui.select('tier', ['Regular', 'VIP'], c.tier)) +
        AC.ui.field('Address', '<textarea class="textarea" name="address" style="min-height:64px">' + u.esc(c.address || '') + '</textarea>', 'span-2') +
        AC.ui.field('Status', AC.ui.select('status', ['Active', 'Inactive', 'Suspended'], c.status)) + '</form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>' + (isEdit ? 'Save changes' : 'Add customer') + '</button>'
    });
    m.el.querySelector('[data-s]').onclick = async (e) => {
      const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return;
      const d = AC.ui.formData(f);
      if (st.s.customers.some((x) => x.email.toLowerCase() === d.email.toLowerCase() && x.id !== c.id)) return AC.ui.toast('Email already in use', null, 'error');
      await AC.ui.busy(e.currentTarget, 400); m.close(); onSave(d);
    };
  }
  AC.customerForm = form;

  AC.adminViews.customers = function (el) {
    const f = { q: '', status: '', tier: '' };
    el.innerHTML = AC.shell.pageHead('Customers', st.s.customers.length + ' registered customers', '<button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export CSV</button><button class="btn btn-primary" data-add>' + AC.icon('user-plus') + 'Add Customer</button>') +
      '<div class="card">' + AC.kit.toolbar({ placeholder: 'Search name, email, phone, ID…', filters: AC.ui.select('status', [{ value: '', label: 'All statuses' }, 'Active', 'Inactive', 'Suspended'], '', 'data-status aria-label="Status"') + AC.ui.select('tier', [{ value: '', label: 'All tiers' }, 'Regular', 'VIP'], '', 'data-tier aria-label="Tier"') }) + '<div data-t></div></div>';
    const t = AC.kit.table(el.querySelector('[data-t]'), {
      per: 10, empty: ['users', 'No customers found', 'Try a different search.'],
      columns: [
        { label: 'Customer ID', render: (c) => '<span class="mono small">' + c.id + '</span>', sort: (c) => c.id },
        { label: 'Name', main: true, render: (c) => '<a href="#/customer/' + c.id + '">' + AC.kit.cellUser(c.name, c.city + (c.tier === 'VIP' ? ' · <b style="color:var(--blue-600)">VIP</b>' : '')) + '</a>', sort: (c) => c.name },
        { label: 'Email', render: (c) => '<span class="small">' + u.esc(c.email) + '</span>', sort: (c) => c.email },
        { label: 'Phone', render: (c) => '<span class="small nowrap">' + u.esc(c.phone) + '</span>' },
        { label: 'Vehicles', cls: 'num', render: (c) => stats(c).vehicles, sort: (c) => stats(c).vehicles },
        { label: 'Services', cls: 'num', render: (c) => stats(c).services, sort: (c) => stats(c).services },
        { label: 'Purchases', cls: 'num', render: (c) => u.peso(stats(c).purchases), sort: (c) => stats(c).purchases },
        { label: 'Status', render: (c) => AC.ui.badge(c.status), sort: (c) => c.status },
        { label: 'Registered', render: (c) => '<span class="small nowrap">' + u.fmtDate(c.joined) + '</span>', sort: (c) => c.joined },
        { label: '', cls: 'text-right', render: (c) => '<div class="actions"><a class="btn btn-ghost btn-icon btn-sm" href="#/customer/' + c.id + '" title="View" aria-label="View">' + AC.icon('eye') + '</a><button class="btn btn-ghost btn-icon btn-sm" data-edit="' + c.id + '" title="Edit" aria-label="Edit">' + AC.icon('edit') + '</button>' +
          '<button class="btn btn-ghost btn-icon btn-sm" data-susp="' + c.id + '" title="' + (c.status === 'Suspended' ? 'Reactivate' : 'Suspend') + '" aria-label="Suspend">' + AC.icon(c.status === 'Suspended' ? 'refresh' : 'lock') + '</button><button class="btn btn-danger-ghost btn-icon btn-sm" data-del="' + c.id + '" title="Delete" aria-label="Delete">' + AC.icon('trash') + '</button></div>' }
      ]
    });
    const rows = () => st.s.customers.filter((c) => (!f.status || c.status === f.status) && (!f.tier || c.tier === f.tier) && u.match([c.id, c.name, c.email, c.phone, c.city], f.q));
    const draw = (keep) => t.set(rows(), keep);
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); draw(); }, 150));
    el.querySelector('[data-status]').onchange = (e) => { f.status = e.target.value; draw(); };
    el.querySelector('[data-tier]').onchange = (e) => { f.tier = e.target.value; draw(); };
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-add]')) form(null, (d) => { const last = st.s.customers.reduce((m, c) => Math.max(m, +c.id.split('-')[1]), 1000); const c = Object.assign({ id: 'CUS-' + (last + 1), joined: u.today() }, d); st.s.customers.push(c); st.log('Admin', st.s.staff.name, 'Added customer', c.name); st.save(); AC.ui.toast('Customer added', c.id, 'success'); draw(); });
      const ed = e.target.closest('[data-edit]'); if (ed) { const c = st.customer(ed.dataset.edit); form(c, (d) => { Object.assign(c, d); st.log('Admin', st.s.staff.name, 'Edited customer', c.id); st.save(); AC.ui.toast('Customer updated', null, 'success'); draw(true); }); }
      const sp = e.target.closest('[data-susp]');
      if (sp) { const c = st.customer(sp.dataset.susp); const to = c.status === 'Suspended' ? 'Active' : 'Suspended'; if (await AC.ui.confirm({ title: (to === 'Active' ? 'Reactivate ' : 'Suspend ') + c.name + '?', message: to === 'Active' ? 'They will regain access to the customer portal.' : 'They will not be able to log in or book until reactivated.', danger: to !== 'Active', confirmText: to === 'Active' ? 'Reactivate' : 'Suspend' })) { c.status = to; st.log('Admin', st.s.staff.name, to === 'Active' ? 'Reactivated customer' : 'Suspended customer', c.id); st.save(); AC.ui.toast('Customer ' + to.toLowerCase(), c.name, 'success'); draw(true); } }
      const dl = e.target.closest('[data-del]');
      if (dl) { const c = st.customer(dl.dataset.del); if (await AC.ui.confirm({ title: 'Delete ' + c.name + '?', message: 'This permanently removes the customer and their ' + stats(c).vehicles + ' vehicle(s). Service and order history is archived.', danger: true, confirmText: 'Delete customer' })) { st.s.customers = st.s.customers.filter((x) => x.id !== c.id); st.s.vehicles = st.s.vehicles.filter((v) => v.customerId !== c.id); st.log('Admin', st.s.staff.name, 'Deleted customer', c.id); st.save(); AC.ui.toast('Customer deleted', null, 'success'); draw(true); } }
      if (e.target.closest('[data-export]')) AC.kit.csv('customers', ['Customer ID', 'Name', 'Email', 'Phone', 'City', 'Vehicles', 'Services', 'Total Purchases', 'Status', 'Registered'], rows().map((c) => { const s = stats(c); return [c.id, c.name, c.email, c.phone, c.city, s.vehicles, s.services, s.purchases, c.status, c.joined]; }));
    });
    draw();
  };

  AC.adminViews.customer = function (el, params) {
    const c = st.customer(params[0]);
    if (!c) { el.innerHTML = AC.ui.empty('user', 'Customer not found', '', '<a class="btn btn-primary mt-8" href="#/customers">Back</a>'); return; }
    const S = st.s, s = stats(c);
    const vehicles = S.vehicles.filter((v) => v.customerId === c.id), recs = S.records.filter((r) => r.customerId === c.id), orders = S.orders.filter((o) => o.customerId === c.id), appts = S.appointments.filter((a) => a.customerId === c.id).sort((a, b) => b.date.localeCompare(a.date));
    el.innerHTML = AC.shell.pageHead(u.esc(c.name), c.id + ' · Customer since ' + u.fmtDate(c.joined, 'long'), '<button class="btn btn-outline" data-edit>' + AC.icon('edit') + 'Edit</button><a class="btn btn-primary" href="#/appointments?new=1">' + AC.icon('plus') + 'New Appointment</a>', [['Customers', '#/customers'], [c.name]]) +
      '<div class="grid-main-side" style="grid-template-columns:340px minmax(0,1fr)"><div class="col gap-20"><div class="card card-body text-center">' + AC.ui.avatar(c.name, 'xl') + '<div class="h3 mt-12">' + u.esc(c.name) + '</div><div class="flex gap-8 mt-8" style="justify-content:center">' + AC.ui.badge(c.status) + (c.tier === 'VIP' ? '<span class="badge badge-dark">VIP</span>' : '') + '</div>' +
      '<div class="divider"></div><dl class="kv" style="text-align:left;grid-template-columns:80px 1fr"><dt>Email</dt><dd>' + u.esc(c.email) + '</dd><dt>Phone</dt><dd>' + u.esc(c.phone) + '</dd><dt>Address</dt><dd>' + u.esc(c.address) + '</dd></dl></div>' +
      '<div class="grid-3" style="grid-template-columns:repeat(3,1fr);gap:10px">' + [['Vehicles', s.vehicles], ['Services', s.services], ['Spent', u.pesoShort(s.purchases + u.sum(recs, (r) => r.cost))]].map((x) => '<div class="card card-body text-center" style="padding:14px 6px"><div class="h4">' + x[1] + '</div><div class="xs muted">' + x[0] + '</div></div>').join('') + '</div></div>' +
      '<div class="col gap-20"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('car') + 'Vehicles</div></div>' + (vehicles.length ? vehicles.map((v) => '<a class="mini-row" href="#/vehicle/' + v.id + '">' + AC.kit.cellVehicle(v) + '<span class="small muted ml-auto">' + u.km(v.mileage) + '</span>' + AC.ui.badge(v.condition) + '</a>').join('') : AC.ui.empty('car', 'No vehicles', '')) + '</div>' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('calendar') + 'Appointments</div></div>' + (appts.length ? appts.slice(0, 5).map((a) => '<div class="mini-row"><div class="grow"><b>' + u.esc(a.service) + '</b><div class="small muted">' + a.id + ' · ' + u.fmtDate(a.date) + ' ' + u.fmtTime(a.time) + '</div></div>' + AC.ui.badge(a.status) + '</div>').join('') : AC.ui.empty('calendar', 'No appointments', '')) + '</div>' +
      '<div class="grid-2"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('clock') + 'Service History</div></div>' + (recs.slice(0, 5).map((r) => '<div class="mini-row"><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(r.service) + '</div><div class="xs muted">' + u.fmtDate(r.date) + '</div></div><b class="small">' + u.peso(r.cost) + '</b></div>').join('') || AC.ui.empty('clock', 'No records', '')) + '</div>' +
      '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('bag') + 'Orders</div></div>' + (orders.slice(0, 5).map((o) => '<a class="mini-row" href="#/order/' + o.id + '"><div class="grow"><div class="strong mono small">' + o.id + '</div><div class="xs muted">' + u.fmtDate(u.iso(new Date(o.date))) + '</div></div>' + AC.ui.badge(o.status) + '<b class="small">' + u.peso(o.total) + '</b></a>').join('') || AC.ui.empty('bag', 'No orders', '')) + '</div></div></div></div>';
    el.querySelector('[data-edit]').onclick = () => form(c, (d) => { Object.assign(c, d); st.save(); AC.ui.toast('Customer updated', null, 'success'); AC.router.refresh(); });
  };
})();

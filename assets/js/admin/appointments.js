/* =========================================================
   AUTOCARE — admin/appointments.js
   Appointment management: list + calendar (Day / Week /
   Month), approve, reschedule, cancel, assign technician,
   update status, create walk-in appointment.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store;
  const TABS = ['All', 'Pending', 'Approved', 'In Progress', 'Rescheduled', 'Completed', 'Cancelled'];

  /* ---------- Shared modals ---------- */
  function detail(a, onDone) {
    const c = st.customer(a.customerId), v = st.vehicle(a.vehicleId);
    const techs = st.s.technicians.filter((t) => t.status !== 'Off Duty');
    const m = AC.ui.modal({
      title: a.service, sub: a.id + ' · ' + u.fmtDate(a.date, 'day') + ' · ' + u.fmtTime(a.time), size: 'lg',
      body: '<div class="grid-2" style="gap:16px">' +
        '<div class="card card-soft card-body"><div class="xs muted strong mb-8">CUSTOMER</div>' + AC.kit.cellUser(c.name, c.email) + '<div class="small muted mt-8">' + u.esc(c.phone) + '<br>' + u.esc(c.address) + '</div><a class="link small mt-8" style="display:inline-block" href="#/customer/' + c.id + '" data-close>View customer →</a></div>' +
        '<div class="card card-soft card-body"><div class="xs muted strong mb-8">VEHICLE</div>' + AC.kit.cellVehicle(v) + '<div class="small muted mt-8">' + u.esc(v.variant || '') + ' · ' + u.km(v.mileage) + '<br>' + u.esc(v.engine || '') + '</div><a class="link small mt-8" style="display:inline-block" href="#/vehicle/' + v.id + '" data-close>View vehicle →</a></div></div>' +
        '<div class="form-grid mt-16">' +
        AC.ui.field('Status', AC.ui.select('status', AC.data.apptStatuses, a.status)) +
        AC.ui.field('Assigned technician', AC.ui.select('tech', [{ value: '', label: 'Unassigned' }].concat(techs.map((t) => ({ value: t.id, label: t.name + ' · ' + t.spec + ' (' + t.status + ')' }))), a.techId || '')) +
        AC.ui.field('Estimated cost', '<input class="input" readonly value="' + u.peso(a.estimate) + '">') +
        AC.ui.field('Booked', '<input class="input" readonly value="' + u.esc(u.fmtDateTime(a.createdAt)) + '">') +
        AC.ui.field('Customer notes', '<textarea class="textarea" readonly style="min-height:60px">' + u.esc(a.notes || '—') + '</textarea>', 'span-2') + '</div>',
      foot: '<button class="btn btn-danger-ghost" data-cancel style="margin-right:auto" ' + (a.status === 'Cancelled' || a.status === 'Completed' ? 'disabled' : '') + '>' + AC.icon('x-circle') + 'Cancel</button>' +
        '<button class="btn btn-outline" data-resched>' + AC.icon('calendar') + 'Reschedule</button>' +
        (a.status === 'Pending' || a.status === 'Rescheduled' ? '<button class="btn btn-blue" data-approve>' + AC.icon('check') + 'Approve</button>' : '') +
        '<button class="btn btn-primary" data-save>Save</button>'
    });
    const q = (s) => m.el.querySelector(s);
    q('[data-save]').onclick = () => {
      const status = q('[name=status]').value, tech = q('[name=tech]').value || null;
      if (status === 'In Progress' && !tech) return AC.ui.toast('Assign a technician first', 'Work orders need a technician.', 'warning');
      if (tech !== a.techId) { a.techId = tech; st.log('Staff', st.s.staff.name, 'Assigned ' + st.techName(tech), a.id); }
      if (status !== a.status) st.setApptStatus(a.id, status, { techId: tech }); else st.save();
      m.close(); AC.ui.toast('Appointment updated', a.id + ' · ' + status, 'success'); onDone && onDone();
    };
    const ap = q('[data-approve]');
    if (ap) ap.onclick = () => { a.techId = q('[name=tech]').value || a.techId; st.setApptStatus(a.id, 'Approved'); m.close(); AC.ui.toast('Appointment approved', 'Customer has been notified.', 'success'); onDone && onDone(); };
    q('[data-resched]').onclick = () => { m.close(); reschedule(a, onDone); };
    q('[data-cancel]').onclick = async () => { if (await AC.ui.confirm({ title: 'Cancel ' + a.id + '?', message: 'The customer will be notified of the cancellation.', danger: true, confirmText: 'Cancel appointment' })) { st.setApptStatus(a.id, 'Cancelled'); m.close(); AC.ui.toast('Appointment cancelled', null, 'success'); onDone && onDone(); } };
  }

  function reschedule(a, onDone) {
    const m = AC.ui.modal({
      title: 'Reschedule ' + a.id, sub: 'Currently ' + u.fmtDate(a.date, 'day') + ' at ' + u.fmtTime(a.time), size: 'sm',
      body: '<form class="col gap-12" data-f>' + AC.ui.field('New date', '<input class="input" type="date" name="date" required min="' + u.today() + '" value="' + a.date + '">') +
        AC.ui.field('New time', AC.ui.select('time', AC.data.timeSlots.map((t) => ({ value: t, label: u.fmtTime(t) })), a.time)) +
        AC.ui.field('Reason (sent to customer)', '<input class="input" name="reason" placeholder="e.g. Parts arriving tomorrow">') + '</form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>Reschedule</button>'
    });
    m.el.querySelector('[data-s]').onclick = () => {
      const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return;
      if (new Date(f.date.value).getDay() === 0) return AC.ui.toast('Shop is closed on Sundays', null, 'warning');
      st.setApptStatus(a.id, 'Rescheduled', { date: f.date.value, time: f.time.value });
      m.close(); AC.ui.toast('Appointment rescheduled', u.fmtDate(f.date.value) + ' · ' + u.fmtTime(f.time.value), 'success'); onDone && onDone();
    };
  }

  function create(onDone) {
    const S = st.s;
    const m = AC.ui.modal({
      title: 'New appointment', sub: 'Walk-in or phone booking', size: 'lg',
      body: '<form class="form-grid" data-f novalidate>' +
        AC.ui.field('Customer <span class="req">*</span>', AC.ui.select('customer', S.customers.filter((c) => c.status === 'Active').map((c) => ({ value: c.id, label: c.name + ' · ' + c.phone })), '')) +
        AC.ui.field('Vehicle <span class="req">*</span>', '<select class="select" name="vehicle" required></select>') +
        AC.ui.field('Service <span class="req">*</span>', AC.ui.select('service', AC.data.services.map((s) => ({ value: s.id, label: s.name + ' — ' + u.peso(s.price) })), 'SV-PMS')) +
        AC.ui.field('Technician', AC.ui.select('tech', [{ value: '', label: 'Assign later' }].concat(S.technicians.filter((t) => t.status !== 'Off Duty').map((t) => ({ value: t.id, label: t.name + ' · ' + t.spec }))), '')) +
        AC.ui.field('Date <span class="req">*</span>', '<input class="input" type="date" name="date" required min="' + u.today() + '" value="' + u.addDays(u.today(), 1) + '">') +
        AC.ui.field('Time <span class="req">*</span>', AC.ui.select('time', AC.data.timeSlots.map((t) => ({ value: t, label: u.fmtTime(t) })), '09:00')) +
        AC.ui.field('Notes', '<textarea class="textarea" name="notes" style="min-height:70px" placeholder="Customer concern, requested parts…"></textarea>', 'span-2') + '</form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>' + AC.icon('plus') + 'Create appointment</button>'
    });
    const f = m.el.querySelector('[data-f]');
    const fillV = () => { const vs = S.vehicles.filter((v) => v.customerId === f.customer.value); f.vehicle.innerHTML = vs.map((v) => '<option value="' + v.id + '">' + u.esc(st.vName(v)) + ' · ' + v.plate + '</option>').join('') || '<option value="">No vehicles registered</option>'; };
    f.customer.onchange = fillV; fillV();
    m.el.querySelector('[data-s]').onclick = async (e) => {
      if (!AC.ui.validate(f)) return;
      if (!f.vehicle.value) return AC.ui.toast('Customer has no vehicle', 'Register a vehicle first.', 'warning');
      await AC.ui.busy(e.currentTarget, 500);
      const a = st.book({ vehicleId: f.vehicle.value, serviceId: f.service.value, date: f.date.value, time: f.time.value, notes: f.notes.value });
      if (f.tech.value) { a.techId = f.tech.value; st.setApptStatus(a.id, 'Approved'); }
      m.close(); AC.ui.toast('Appointment created', a.id, 'success'); onDone && onDone();
    };
  }
  AC.apptModals = { detail, reschedule, create };

  /* ---------- View ---------- */
  AC.adminViews.appointments = function (el) {
    const f = { tab: 'All', q: '', view: 'list', cal: 'month', anchor: u.today() };
    el.innerHTML = AC.shell.pageHead('Appointments', 'Approve, schedule and assign service bookings.', '<div class="seg" data-view><button class="active" data-value="list">' + AC.icon('list') + ' List</button><button data-value="calendar">' + AC.icon('calendar') + ' Calendar</button></div><button class="btn btn-primary" data-new>' + AC.icon('plus') + 'New Appointment</button>') +
      '<div class="grid-stats mb-20" data-mini></div><div data-body></div>';
    const body = el.querySelector('[data-body]');

    function mini() {
      const A = st.s.appointments, T = u.today();
      el.querySelector('[data-mini]').innerHTML = [['Today', A.filter((a) => a.date === T).length, 'calendar'], ['Pending approval', A.filter((a) => a.status === 'Pending').length, 'clock'], ['This week', A.filter((a) => a.date >= T && a.date <= u.addDays(T, 6)).length, 'calendar-check'], ['Cancelled (30d)', A.filter((a) => a.status === 'Cancelled').length, 'x-circle']]
        .map((x) => '<div class="card card-hover stat" style="padding:14px 16px;flex-direction:row;align-items:center"><div class="stat-icon">' + AC.icon(x[2]) + '</div><div><div class="stat-label">' + x[0] + '</div><div class="h3">' + x[1] + '</div></div></div>').join('');
    }

    let table;
    function listView() {
      body.innerHTML = '<div class="card"><div class="tabs" style="padding:0 12px" data-tabs>' + TABS.map((t) => '<button class="tab ' + (t === f.tab ? 'active' : '') + '" data-tab="' + t + '">' + t + ' <span class="count">' + (t === 'All' ? st.s.appointments.length : st.s.appointments.filter((a) => a.status === t).length) + '</span></button>').join('') + '</div>' +
        AC.kit.toolbar({ placeholder: 'Search ID, customer, plate, service…', filters: AC.ui.select('when', [{ value: '', label: 'All dates' }, { value: 'today', label: 'Today' }, { value: 'upcoming', label: 'Upcoming' }, { value: 'past', label: 'Past' }], '', 'data-when aria-label="Date filter"') }) + '<div data-t></div></div>';
      table = AC.kit.table(body.querySelector('[data-t]'), {
        per: 10, empty: ['calendar', 'No appointments found', 'Try another status or date filter.'],
        columns: [
          { label: 'Booking', main: true, render: (a) => '<div class="cell-title mono">' + a.id + '</div><div class="cell-sub">' + u.esc(a.service) + '</div>', sort: (a) => a.id },
          { label: 'Date & Time', render: (a) => '<div class="strong nowrap">' + u.fmtDate(a.date, 'md') + '</div><div class="cell-sub">' + u.fmtTime(a.time) + '</div>', sort: (a) => a.date + a.time },
          { label: 'Customer', render: (a) => AC.kit.cellUser(st.customer(a.customerId).name, st.customer(a.customerId).phone), sort: (a) => st.customer(a.customerId).name },
          { label: 'Vehicle', render: (a) => AC.kit.cellVehicle(st.vehicle(a.vehicleId)) },
          { label: 'Technician', render: (a) => a.techId ? u.esc(st.techName(a.techId)) : '<button class="btn btn-soft btn-sm" data-assign="' + a.id + '">' + AC.icon('user-plus') + 'Assign</button>' },
          { label: 'Status', render: (a) => AC.ui.badge(a.status), sort: (a) => a.status },
          { label: '', cls: 'text-right', render: (a) => '<div class="actions">' + (a.status === 'Pending' ? '<button class="btn btn-blue btn-sm" data-approve="' + a.id + '">Approve</button>' : '') + '<button class="btn btn-outline btn-sm" data-open="' + a.id + '">Manage</button></div>' }
        ]
      });
      AC.ui.tabs(body.querySelector('[data-tabs]'), (t) => { f.tab = t; filter(); });
      body.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); filter(); }, 150));
      body.querySelector('[data-when]').onchange = (e) => { f.when = e.target.value; filter(); };
      filter();
    }
    function filter(keep) {
      const T = u.today();
      const rows = st.s.appointments.filter((a) => {
        if (f.tab !== 'All' && a.status !== f.tab) return false;
        if (f.when === 'today' && a.date !== T) return false;
        if (f.when === 'upcoming' && a.date < T) return false;
        if (f.when === 'past' && a.date >= T) return false;
        const c = st.customer(a.customerId), v = st.vehicle(a.vehicleId);
        return u.match([a.id, a.service, c && c.name, v && v.plate, v && v.model], f.q);
      }).sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
      table.set(rows, keep);
    }

    function calendarView() {
      const A = st.s.appointments, anchor = u.toDate(f.anchor), T = u.today();
      const ev = (a) => '<button class="cal-ev s-' + a.status.replace(/\s/g, '') + '" data-open="' + a.id + '" title="' + u.esc(u.fmtTime(a.time) + ' ' + a.service) + '">' + u.fmtTime(a.time).replace(':00', '').replace(' ', '').toLowerCase() + ' ' + u.esc(st.vehicle(a.vehicleId).model) + '</button>';
      let title = '', grid = '';
      if (f.cal === 'month') {
        const y = anchor.getFullYear(), mo = anchor.getMonth(), first = new Date(y, mo, 1), start = new Date(first); start.setDate(1 - first.getDay());
        title = u.MONTHS_L[mo] + ' ' + y;
        grid = '<div class="cal-month">' + u.DAYS.map((d) => '<div class="dow">' + d + '</div>').join('');
        for (let i = 0; i < 42; i++) {
          const d = new Date(start); d.setDate(start.getDate() + i);
          const iso = u.iso(d), evs = A.filter((a) => a.date === iso).sort((a, b) => a.time.localeCompare(b.time));
          grid += '<div class="cal-cell ' + (d.getMonth() !== mo ? 'other ' : '') + (iso === T ? 'today' : '') + '"><span class="dn">' + d.getDate() + '</span>' + evs.slice(0, 3).map(ev).join('') + (evs.length > 3 ? '<button class="cal-more" data-day="' + iso + '">+' + (evs.length - 3) + ' more</button>' : '') + '</div>';
        }
        grid += '</div>';
      } else if (f.cal === 'week') {
        const start = new Date(anchor); start.setDate(anchor.getDate() - anchor.getDay());
        const days = [...Array(7)].map((_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return u.iso(d); });
        title = u.fmtDate(days[0], 'md') + ' – ' + u.fmtDate(days[6]);
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
        grid = '<div class="cal-week"><div class="hcell"></div>' + days.map((d) => '<div class="hcell ' + (d === T ? 'today' : '') + '">' + u.fmtDate(d, 'day').split(',')[0] + '<br><span class="h4">' + u.toDate(d).getDate() + '</span></div>').join('') +
          hours.map((h) => '<div class="tcell">' + u.fmtTime(u.pad(h) + ':00') + '</div>' + days.map((d) => '<div class="slot">' + A.filter((a) => a.date === d && +a.time.split(':')[0] === h).map(ev).join('') + '</div>').join('')).join('') + '</div>';
      } else {
        const iso = f.anchor, evs = A.filter((a) => a.date === iso).sort((a, b) => a.time.localeCompare(b.time));
        title = u.fmtDate(iso, 'day') + ', ' + anchor.getFullYear();
        grid = '<div class="day-list">' + (evs.length ? evs.map((a) => { const c = st.customer(a.customerId), v = st.vehicle(a.vehicleId); return '<div class="mini-row"><span class="time-col">' + u.fmtTime(a.time) + '</span><div class="grow" style="min-width:0"><div class="strong">' + u.esc(a.service) + '</div><div class="small muted truncate">' + u.esc(c.name) + ' · ' + u.esc(st.vName(v)) + ' · ' + v.plate + ' · Tech: ' + u.esc(st.techName(a.techId)) + '</div></div>' + AC.ui.badge(a.status) + '<button class="btn btn-outline btn-sm" data-open="' + a.id + '">Manage</button></div>'; }).join('') : AC.ui.empty('calendar', 'No appointments on this day', '')) + '</div>';
      }
      body.innerHTML = '<div class="card"><div class="card-head"><div class="flex items-center gap-8"><button class="icon-btn" data-calnav="-1" aria-label="Previous">' + AC.icon('chevron-left') + '</button><button class="icon-btn" data-calnav="1" aria-label="Next">' + AC.icon('chevron-right') + '</button><button class="btn btn-ghost btn-sm" data-today>Today</button><div class="h4">' + title + '</div></div>' +
        '<div class="seg" data-cal>' + ['day', 'week', 'month'].map((x) => '<button class="' + (f.cal === x ? 'active' : '') + '" data-value="' + x + '">' + x.charAt(0).toUpperCase() + x.slice(1) + '</button>').join('') + '</div></div>' + grid +
        '<div class="card-foot"><div class="legend">' + [['Pending', 'var(--orange)'], ['Approved', 'var(--blue)'], ['In Progress', 'var(--black)'], ['Completed', 'var(--green)'], ['Cancelled', 'var(--red)']].map((l) => '<span class="legend-item"><span class="legend-key" style="background:' + l[1] + '"></span>' + l[0] + '</span>').join('') + '</div></div></div>';
      AC.ui.tabs(body.querySelector('[data-cal]'), (v) => { f.cal = v; calendarView(); });
    }

    function render() { mini(); f.view === 'list' ? listView() : calendarView(); }
    const refresh = () => { mini(); if (f.view === 'list') { filter(true); body.querySelectorAll('[data-tabs] .tab').forEach((t) => { const n = t.dataset.tab === 'All' ? st.s.appointments.length : st.s.appointments.filter((a) => a.status === t.dataset.tab).length; t.querySelector('.count').textContent = n; }); } else calendarView(); };

    AC.ui.tabs(el.querySelector('[data-view]'), (v) => { f.view = v; render(); });
    el.querySelector('[data-new]').onclick = () => create(refresh);
    el.addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]'); if (o) detail(st.appt(o.dataset.open), refresh);
      const ap = e.target.closest('[data-approve]'); if (ap) { const a = st.appt(ap.dataset.approve); if (!a.techId) { detail(a, refresh); return AC.ui.toast('Assign a technician', 'then approve the booking.', 'info'); } st.setApptStatus(a.id, 'Approved'); AC.ui.toast('Approved', a.id + ' · customer notified', 'success'); refresh(); }
      const as = e.target.closest('[data-assign]'); if (as) detail(st.appt(as.dataset.assign), refresh);
      const nv = e.target.closest("[data-calnav]");
      if (nv && body.contains(nv)) { const d = u.toDate(f.anchor), k = +nv.dataset.calnav; if (f.cal === 'month') d.setMonth(d.getMonth() + k); else d.setDate(d.getDate() + (f.cal === 'week' ? 7 : 1) * k); f.anchor = u.iso(d); calendarView(); }
      if (e.target.closest('[data-today]')) { f.anchor = u.today(); calendarView(); }
      const dy = e.target.closest('[data-day]'); if (dy) { f.anchor = dy.dataset.day; f.cal = 'day'; calendarView(); }
    });
    render();
    if (u.qsParam('new')) create(refresh);
  };
})();

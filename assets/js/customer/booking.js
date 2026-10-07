/* =========================================================
   AUTOCARE — customer/booking.js
   6-step service booking flow:
   Vehicle → Service → Date → Time → Review → Confirm
   ========================================================= */
window.AC = window.AC || {};
AC.custViews = AC.custViews || {};

AC.custViews.book = function (el) {
  const u = AC.u, st = AC.store, SV = AC.data.services.filter((s) => s.active !== false);
  const STEPS = ['Vehicle', 'Service', 'Date', 'Time', 'Review', 'Confirm'];
  const qp = u.qsParam;
  const mine = AC.cust.vehicles();
  const b = { step: 0, vehicleId: null, serviceId: qp('service') || null, date: null, time: null, notes: '', calMonth: null, svcQ: '' };

  if (qp('vehicle') && st.vehicle(qp('vehicle'))) b.vehicleId = qp('vehicle');
  let hint = '';
  if (!b.vehicleId && qp('brand')) {
    const match = mine.find((v) => v.brand === qp('brand') && v.model === qp('model'));
    if (match) b.vehicleId = match.id;
    else hint = '<div class="alert mb-16">' + AC.icon('info') + '<div class="grow">You don’t have a <b>' + u.esc(qp('brand') + ' ' + qp('model')) + '</b> in your garage yet. <button class="link" data-add-pref>Register it now</button> to book for it.</div></div>';
  }
  if (b.vehicleId) b.step = b.serviceId ? 2 : 1;
  const t0 = u.toDate(u.today()); b.calMonth = new Date(t0.getFullYear(), t0.getMonth(), 1);

  el.innerHTML = AC.shell.pageHead('Book a Service', 'Schedule maintenance or repairs in a few quick steps.', '', [['Dashboard', '#/dashboard'], ['Book a Service']]) +
    '<div class="card card-body mb-20"><div class="stepper" data-stepper></div></div>' +
    '<div class="wizard"><div class="card"><div class="card-body" data-body style="min-height:360px"></div><div class="wizard-foot" data-foot></div></div>' +
    '<aside class="wizard-side"><div class="card card-body" data-side></div></aside></div>';
  const body = el.querySelector('[data-body]'), foot = el.querySelector('[data-foot]'), side = el.querySelector('[data-side]');

  function bookedSlots(date) {
    const taken = st.s.appointments.filter((a) => a.date === date && a.status !== 'Cancelled').map((a) => a.time);
    const h = u.hash(date);
    AC.data.timeSlots.forEach((s, i) => { if ((h >> i) % 5 === 0) taken.push(s); });
    if (date === u.today()) { const now = new Date(); AC.data.timeSlots.forEach((s) => { const [hh, mm] = s.split(':').map(Number); if (hh * 60 + mm <= now.getHours() * 60 + now.getMinutes() + 60) taken.push(s); }); }
    return taken;
  }

  function stepper() {
    el.querySelector('[data-stepper]').innerHTML = STEPS.map((s, i) => (i ? '<span class="step-line ' + (i <= b.step ? 'done' : '') + '"></span>' : '') +
      '<button class="step ' + (i < b.step ? 'done' : i === b.step ? 'active' : '') + '" data-goto="' + i + '" ' + (i > maxStep() || b.step === 5 ? 'disabled' : '') + ' aria-label="Step ' + (i + 1) + ': ' + s + '"><span class="step-num">' + (i < b.step ? AC.icon('check') : i + 1) + '</span><span class="step-text">' + s + '</span></button>').join('');
  }
  function maxStep() { return !b.vehicleId ? 0 : !b.serviceId ? 1 : !b.date ? 2 : !b.time ? 3 : 4; }

  function summary() {
    const v = st.vehicle(b.vehicleId), s = st.service(b.serviceId);
    side.innerHTML = '<div class="h4 mb-12">Booking summary</div>' +
      (v ? '<div class="card-soft" style="border-radius:12px;padding:10px;border:1px solid var(--line)">' + AC.cust.vehicleArt(v) + '</div>' : '') +
      '<div class="mt-12"><div class="sum-line"><span>Vehicle</span><span>' + (v ? u.esc(st.vName(v)) + '<br><span class="plate sm mt-4">' + v.plate + '</span>' : '—') + '</span></div>' +
      '<div class="sum-line"><span>Service</span><span>' + (s ? u.esc(s.name) : '—') + '</span></div>' +
      '<div class="sum-line"><span>Date</span><span>' + (b.date ? u.fmtDate(b.date, 'day') : '—') + '</span></div>' +
      '<div class="sum-line"><span>Time</span><span>' + (b.time ? u.fmtTime(b.time) : '—') + '</span></div>' +
      '<div class="sum-line"><span>Duration</span><span>' + (s ? '~' + (s.dur >= 60 ? Math.round(s.dur / 60 * 10) / 10 + ' hrs' : s.dur + ' min') : '—') + '</span></div>' +
      '<div class="sum-line" style="border:0"><span>Estimated cost</span><span class="h4">' + (s ? u.peso(s.price) : '—') + '</span></div></div>' +
      '<div class="xs muted mt-8">Final cost depends on inspection & parts used. You approve all work before it starts.</div>';
  }

  function nav(back, nextLabel, nextOk) {
    foot.innerHTML = (back ? '<button class="btn btn-outline" data-back>' + AC.icon('arrow-left') + 'Back</button>' : '<a class="btn btn-ghost" href="#/dashboard">Cancel</a>') +
      '<button class="btn btn-primary" data-next ' + (nextOk ? '' : 'disabled') + '>' + nextLabel + ' ' + AC.icon('arrow-right', 'i-arrow') + '</button>';
  }

  function render() {
    stepper(); summary();
    body.classList.remove('tab-panel'); void body.offsetWidth; body.classList.add('tab-panel');
    foot.style.display = '';
    if (b.step === 0) {
      body.innerHTML = '<div class="h4">Step 1 · Select vehicle</div><p class="muted small mt-4 mb-16">Choose which car you’re bringing in.</p>' + hint +
        '<div class="grid" style="gap:10px">' + mine.map((v) => '<button class="option ' + (b.vehicleId === v.id ? 'selected' : '') + '" data-veh="' + v.id + '"><div class="thumb" style="width:96px;height:56px;background:var(--gray-bg)">' + AC.cust.vehicleArt(v) + '</div><div style="min-width:0"><div class="strong">' + u.esc(st.vName(v)) + '</div><div class="small muted"><span class="plate sm">' + v.plate + '</span> · ' + u.km(v.mileage) + ' · ' + u.esc(v.variant || '') + '</div></div>' + AC.ui.badge(v.condition, 'hide-sm') + '<span class="opt-check">' + AC.icon('check') + '</span></button>').join('') +
        '<button class="option" data-newveh style="border-style:dashed;justify-content:center;color:var(--gray)">' + AC.icon('plus') + 'Register a new vehicle</button></div>';
      nav(false, 'Continue', !!b.vehicleId);
    } else if (b.step === 1) {
      const list = SV.filter((s) => u.match([s.name, s.desc], b.svcQ));
      body.innerHTML = '<div class="flex between items-end gap-12 wrap mb-16"><div><div class="h4">Step 2 · Select service</div><p class="muted small mt-4">Prices are starting estimates.</p></div><div class="searchbar" style="width:min(260px,100%)">' + AC.icon('search') + '<input class="input" placeholder="Search services…" data-sq value="' + u.esc(b.svcQ) + '" aria-label="Search services"></div></div>' +
        '<div class="svc-grid" data-svcs>' + list.map((s) => '<button class="option svc-opt ' + (b.serviceId === s.id ? 'selected' : '') + '" data-svc="' + s.id + '"><span class="opt-check">' + AC.icon('check') + '</span><div class="icon-tile">' + AC.icon(s.icon) + '</div><div class="strong">' + u.esc(s.name) + '</div><div class="small muted" style="line-height:1.45">' + u.esc(s.desc) + '</div><div class="flex between w-full mt-4"><b>' + u.peso(s.price) + '</b><span class="xs muted">' + AC.icon('clock') + ' ' + (s.dur >= 60 ? Math.round(s.dur / 6) / 10 + ' hr' : s.dur + ' min') + '</span></div></button>').join('') + '</div>';
      const sq = body.querySelector('[data-sq]');
      sq.oninput = u.debounce(() => { b.svcQ = sq.value; const pos = sq.selectionStart; render(); const n = body.querySelector('[data-sq]'); n.focus(); n.setSelectionRange(pos, pos); }, 200);
      nav(true, 'Continue', !!b.serviceId);
    } else if (b.step === 2) {
      const m = b.calMonth, y = m.getFullYear(), mo = m.getMonth();
      const first = new Date(y, mo, 1).getDay(), days = new Date(y, mo + 1, 0).getDate();
      const today = u.today(), maxD = u.addDays(today, 60);
      let cells = '';
      for (let i = 0; i < first; i++) cells += '<span class="cal-day muted-day"></span>';
      for (let d = 1; d <= days; d++) {
        const iso = y + '-' + u.pad(mo + 1) + '-' + u.pad(d), dow = new Date(y, mo, d).getDay();
        const dis = iso < today || iso > maxD || dow === 0;
        cells += '<button class="cal-day ' + (iso === today ? 'today ' : '') + (iso === b.date ? 'selected' : '') + '" data-date="' + iso + '" ' + (dis ? 'disabled' : '') + ' aria-label="' + u.fmtDate(iso, 'long') + '">' + d + '</button>';
      }
      const canPrev = new Date(y, mo, 1) > new Date(u.toDate(today).getFullYear(), u.toDate(today).getMonth(), 1);
      body.innerHTML = '<div class="h4">Step 3 · Select date</div><p class="muted small mt-4 mb-16">Open Monday–Saturday. Book up to 60 days ahead.</p>' +
        '<div style="max-width:420px"><div class="flex between items-center mb-12"><button class="icon-btn" data-cm="-1" ' + (canPrev ? '' : 'disabled style="opacity:.3"') + ' aria-label="Previous month">' + AC.icon('chevron-left') + '</button><b>' + u.MONTHS_L[mo] + ' ' + y + '</b><button class="icon-btn" data-cm="1" aria-label="Next month">' + AC.icon('chevron-right') + '</button></div>' +
        '<div class="calendar-mini">' + u.DAYS.map((d) => '<span class="cal-dow">' + d.slice(0, 2) + '</span>').join('') + cells + '</div></div>' +
        '<div class="flex gap-16 mt-16 small muted wrap"><span class="flex items-center gap-6"><span class="color-dot" style="background:var(--black)"></span>Selected</span><span class="flex items-center gap-6"><span class="color-dot" style="background:#fff;border-color:var(--light-gray)"></span>Today</span><span class="flex items-center gap-6"><span class="color-dot" style="background:#e5e7eb"></span>Unavailable (Sundays / past)</span></div>';
      nav(true, 'Continue', !!b.date);
    } else if (b.step === 3) {
      const taken = bookedSlots(b.date);
      const block = (label, slots) => '<div class="label mt-16 mb-8">' + label + '</div><div class="time-grid">' + slots.map((s) => '<button class="time-slot ' + (b.time === s ? 'selected' : '') + '" data-time="' + s + '" ' + (taken.includes(s) ? 'disabled' : '') + '>' + u.fmtTime(s) + '</button>').join('') + '</div>';
      body.innerHTML = '<div class="h4">Step 4 · Select time</div><p class="muted small mt-4">' + u.fmtDate(b.date, 'day') + ' · ' + (AC.data.timeSlots.length - taken.filter((x, i, a) => a.indexOf(x) === i).length) + ' slots available</p>' +
        block('Morning', AC.data.timeSlots.filter((s) => s < '12:00')) + block('Afternoon', AC.data.timeSlots.filter((s) => s >= '12:00'));
      nav(true, 'Review booking', !!b.time);
    } else if (b.step === 4) {
      const v = st.vehicle(b.vehicleId), s = st.service(b.serviceId);
      body.innerHTML = '<div class="h4">Step 5 · Review booking</div><p class="muted small mt-4 mb-16">Please confirm the details below.</p>' +
        '<dl class="kv"><dt>Customer</dt><dd>' + u.esc(AC.cust.me().name) + ' · ' + u.esc(AC.cust.me().phone) + '</dd><dt>Vehicle</dt><dd>' + u.esc(st.vName(v)) + ' <span class="plate sm">' + v.plate + '</span></dd><dt>Service</dt><dd>' + u.esc(s.name) + '</dd><dt>Schedule</dt><dd>' + u.fmtDate(b.date, 'long') + ' · ' + u.fmtTime(b.time) + '</dd><dt>Branch</dt><dd>' + u.esc(st.s.settings.shopName) + '</dd><dt>Estimated cost</dt><dd class="h4">' + u.peso(s.price) + '</dd></dl>' +
        '<div class="field mt-20"><label class="label" for="bk-notes">Notes for the service advisor (optional)</label><textarea class="textarea" id="bk-notes" data-notes placeholder="Describe any symptoms, noises, or requests…">' + u.esc(b.notes) + '</textarea></div>' +
        '<label class="check mt-16"><input type="checkbox" data-agree checked> Send me SMS & email reminders for this appointment</label>';
      body.querySelector('[data-notes]').oninput = (e) => (b.notes = e.target.value);
      nav(true, 'Confirm booking', true);
    } else {
      const a = st.appt(b.apptId), v = st.vehicle(a.vehicleId);
      foot.style.display = 'none';
      body.innerHTML = '<div class="confirm-card"><div class="success-check" style="width:72px;height:72px;border-radius:50%;background:var(--black);color:#fff;display:grid;place-items:center;margin:8px auto 18px;box-shadow:0 0 0 10px var(--blue-soft);animation:scaleIn .5s var(--ease)">' + AC.icon('check') + '</div>' +
        '<h2 class="h3">Booking Confirmed</h2><p class="muted mt-4">We’ve received your request. You’ll get a notification once it’s approved.</p>' +
        '<div class="card card-soft card-body mt-20"><dl class="kv"><dt>Booking ID</dt><dd class="mono h4">' + a.id + '</dd><dt>Date</dt><dd>' + u.fmtDate(a.date, 'long') + '</dd><dt>Time</dt><dd>' + u.fmtTime(a.time) + '</dd><dt>Vehicle</dt><dd>' + u.esc(st.vName(v)) + ' · ' + v.plate + '</dd><dt>Service</dt><dd>' + u.esc(a.service) + '</dd><dt>Estimated Cost</dt><dd>' + u.peso(a.estimate) + '</dd><dt>Status</dt><dd>' + AC.ui.badge(a.status) + '</dd></dl></div>' +
        '<div class="btn-group mt-20" style="justify-content:center"><a class="btn btn-primary" href="#/dashboard">Go to Dashboard</a><button class="btn btn-outline" data-ics>' + AC.icon('calendar') + 'Add to Calendar</button><button class="btn btn-ghost" data-again>Book another</button></div></div>';
      body.querySelector('[data-ics]').onclick = () => AC.ui.toast('Added to calendar', a.service + ' · ' + u.fmtDate(a.date) + ' ' + u.fmtTime(a.time), 'success');
      body.querySelector('[data-again]').onclick = () => { Object.assign(b, { step: 0, vehicleId: null, serviceId: null, date: null, time: null, notes: '' }); render(); };
    }
  }

  el.addEventListener('click', async (e) => {
    const t = e.target;
    const veh = t.closest('[data-veh]'); if (veh) { b.vehicleId = veh.dataset.veh; render(); return; }
    if (t.closest('[data-newveh]') || t.closest('[data-add-pref]')) {
      AC.vehicleForm(t.closest('[data-add-pref]') ? { brand: qp('brand'), model: qp('model'), year: 2023, mileage: '', color: 'Pearl White', fuel: 'Gasoline', transmission: 'Automatic' } : null, (d) => {
        d.customerId = AC.session.customerId(); const v = st.addVehicle(d); mine.push(v); b.vehicleId = v.id; hint = ''; AC.ui.toast('Vehicle registered', st.vName(v), 'success'); render();
      }, { hideDelete: true });
      return;
    }
    const sv = t.closest('[data-svc]'); if (sv) { b.serviceId = sv.dataset.svc; render(); return; }
    const cm = t.closest('[data-cm]'); if (cm && !cm.disabled) { b.calMonth = new Date(b.calMonth.getFullYear(), b.calMonth.getMonth() + +cm.dataset.cm, 1); render(); return; }
    const dt = t.closest('[data-date]'); if (dt && !dt.disabled) { if (b.date !== dt.dataset.date) b.time = null; b.date = dt.dataset.date; render(); return; }
    const tm = t.closest('[data-time]'); if (tm && !tm.disabled) { b.time = tm.dataset.time; render(); return; }
    const go = t.closest('[data-goto]'); if (go && !go.disabled) { b.step = +go.dataset.goto; render(); return; }
    if (t.closest('[data-back]')) { b.step = Math.max(0, b.step - 1); render(); return; }
    const nx = t.closest('[data-next]');
    if (nx && !nx.disabled) {
      if (b.step === 4) {
        await AC.ui.busy(nx, 900);
        const a = st.book({ vehicleId: b.vehicleId, serviceId: b.serviceId, date: b.date, time: b.time, notes: b.notes });
        b.apptId = a.id; b.step = 5;
        AC.ui.toast('Booking confirmed', a.id + ' · ' + u.fmtDate(a.date), 'success');
      } else b.step++;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  render();
};

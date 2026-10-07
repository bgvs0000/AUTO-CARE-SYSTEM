/* =========================================================
   AUTOCARE — customer/tracking.js
   Live service tracking (6-stage animated tracker) and
   service history table with details + invoice.
   ========================================================= */
window.AC = window.AC || {};
AC.custViews = AC.custViews || {};

(function () {
  const u = AC.u, st = AC.store;

  /* ---------------- Tracking ---------------- */
  AC.custViews.tracking = function (el) {
    const active = AC.cust.activeWOs();
    const done = AC.cust.wos().filter((w) => w.status === 'Completed').slice(0, 3);
    el.innerHTML = AC.shell.pageHead('Service Tracking', 'Follow your vehicle through every stage — updates in real time.', '<button class="btn btn-outline" data-refresh>' + AC.icon('refresh') + 'Refresh</button>') +
      (active.length ? active.map((w) => {
        const v = st.vehicle(w.vehicleId), stage = st.woStage(w), svc = AC.data.services.find((s) => s.name === w.service);
        const eta = new Date(w.started); eta.setMinutes(eta.getMinutes() + (svc ? svc.dur : 120) + 60);
        const pct = Math.round((stage / 5) * 100);
        return '<div class="card track-card mb-20">' +
          '<div class="track-head"><div><div class="flex items-center gap-8 wrap"><span class="mono strong">' + w.id + '</span>' + AC.ui.badge(AC.data.trackerStages[stage] === 'Ready for Release' ? 'Ready for Release' : 'In Service') + '</div>' +
          '<h2 class="h3 mt-8">' + u.esc(w.service) + '</h2><div class="small muted mt-4">Started ' + u.relTime(w.started) + ' · Technician: <b style="color:var(--black)">' + u.esc(st.techName(w.techId)) + '</b></div></div>' +
          '<div class="eta"><div class="l">Estimated release</div><div class="v">' + u.fmtTime(eta.toISOString()) + '</div><div class="xs muted">' + u.fmtDate(u.iso(eta), 'day') + '</div></div></div>' +
          AC.trackerHtml(w) +
          '<div class="flex items-center gap-12 mt-24"><span class="small muted nowrap">Overall progress</span><div class="progress grow"><div class="progress-bar striped" style="width:' + Math.max(6, pct) + '%"></div></div><b class="small">' + pct + '%</b></div>' +
          '<div class="grid-2 mt-24">' +
          '<div class="card card-soft card-body"><div class="strong mb-8">' + AC.icon('gauge') + ' Diagnosis & notes</div><p class="small muted">' + u.esc(w.diagnosis || 'Inspection in progress — findings will appear here.') + '</p>' +
          (w.parts.length ? '<div class="divider"></div><div class="strong small mb-8">Parts</div>' + w.parts.map((p) => '<div class="flex between small" style="padding:4px 0"><span>' + p.qty + ' × ' + u.esc(p.name) + '</span><span>' + u.peso(p.qty * p.price) + '</span></div>').join('') : '') +
          '<div class="flex between small" style="padding:4px 0"><span>Labor</span><span>' + u.peso(w.labor) + '</span></div><div class="flex between strong mt-8"><span>Estimated total</span><span>' + u.peso(w.estimate) + '</span></div></div>' +
          '<div class="card card-soft card-body"><div class="strong mb-12">' + AC.icon('clock') + ' Activity</div><div class="timeline">' +
          AC.data.trackerStages.map((s, i) => '<div class="tl-item ' + (i < stage ? 'done' : i === stage ? 'current' : '') + '"><span class="tl-dot">' + AC.icon(i < stage ? 'check' : 'clock') + '</span><div><div class="tl-title">' + s + '</div><div class="tl-sub">' + (w.stageTimes && w.stageTimes[i] ? u.relTime(w.stageTimes[i]) : i === stage ? 'Now' : 'Pending') + '</div></div></div>').join('') + '</div></div></div>' +
          '<div class="btn-group mt-20"><button class="btn btn-outline" data-est="' + w.id + '">' + AC.icon('file') + 'View estimate</button><button class="btn btn-outline" data-msg>' + AC.icon('headset') + 'Message advisor</button><a class="btn btn-ghost" href="#/vehicle/' + v.id + '">Vehicle details</a></div></div>';
      }).join('') :
        '<div class="card">' + AC.ui.empty('activity', 'No vehicles in service right now', 'When you drop off your car, each stage — from inspection to release — will show here live.', '<a class="btn btn-primary mt-8" href="#/book">Book a service</a>') + '</div>') +
      (done.length ? '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('check-circle') + 'Recently completed</div><a class="link small" href="#/history">Full history</a></div>' +
        done.map((w) => { const v = st.vehicle(w.vehicleId); return '<div class="mini-row"><div class="thumb" style="width:72px;height:46px">' + AC.cust.vehicleArt(v) + '</div><div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(w.service) + '</div><div class="small muted">' + w.id + ' · ' + u.fmtDate(u.iso(new Date(w.completed))) + '</div></div>' + AC.ui.badge('Ready for Release') + '</div>'; }).join('') + '</div>' : '');
    el.querySelector('[data-refresh]').onclick = async (e) => { await AC.ui.busy(e.currentTarget, 500); AC.router.refresh(); AC.ui.toast('Status up to date', null, 'success'); };
    el.querySelectorAll('[data-est]').forEach((b) => (b.onclick = () => AC.docs.fromWO(st.wo(b.dataset.est))));
    el.querySelectorAll('[data-msg]').forEach((b) => (b.onclick = () => {
      const m = AC.ui.modal({ title: 'Message your service advisor', sub: 'Typical reply time: 10 minutes', size: 'sm', body: '<textarea class="textarea" placeholder="Type your message…" data-t></textarea>', foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-send>' + AC.icon('send') + 'Send</button>' });
      m.el.querySelector('[data-send]').onclick = () => { if (!m.el.querySelector('[data-t]').value.trim()) return AC.ui.toast('Message is empty', null, 'warning'); m.close(); AC.ui.toast('Message sent', 'Your advisor will reply shortly.', 'success'); };
    }));
  };

  /* ---------------- History ---------------- */
  AC.custViews.history = function (el) {
    const vehicles = AC.cust.vehicles();
    const f = { q: '', vehicle: u.qsParam('vehicle') || '', page: 1 };
    el.innerHTML = AC.shell.pageHead('Service History', 'Every service performed on your vehicles, with invoices.', '<button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export</button>') +
      '<div class="card"><div class="toolbar"><div class="searchbar">' + AC.icon('search') + '<input class="input" placeholder="Search service, technician, invoice…" data-q aria-label="Search history"></div>' +
      AC.ui.select('vehicle', [{ value: '', label: 'All vehicles' }].concat(vehicles.map((v) => ({ value: v.id, label: v.brand + ' ' + v.model + ' · ' + v.plate }))), f.vehicle, 'data-veh aria-label="Filter by vehicle"') +
      '<span class="small muted ml-auto" data-total></span></div>' +
      '<div class="table-wrap"><table class="table table-responsive"><thead><tr><th>Date</th><th>Vehicle</th><th>Service</th><th>Technician</th><th class="num">Mileage</th><th class="num">Cost</th><th>Status</th><th>Invoice</th><th></th></tr></thead><tbody data-rows></tbody></table></div>' +
      '<div class="card-foot" data-pager></div></div>';
    function render() {
      const rows = AC.cust.records().filter((r) => (!f.vehicle || r.vehicleId === f.vehicle) && u.match([r.service, st.techName(r.techId), r.invoice, r.notes], f.q));
      const p = AC.ui.paginate(rows, f.page, 8);
      el.querySelector('[data-total]').textContent = 'Total: ' + u.peso(u.sum(rows, (r) => r.cost));
      el.querySelector('[data-rows]').innerHTML = p.rows.map((r) => {
        const v = st.vehicle(r.vehicleId);
        return '<tr><td data-label="Date" class="nowrap">' + u.fmtDate(r.date) + '</td><td data-label="Vehicle"><div class="strong">' + u.esc(v ? v.brand + ' ' + v.model : '—') + '</div><div class="cell-sub">' + (v ? v.plate : '') + '</div></td>' +
          '<td data-label="Service">' + u.esc(r.service) + '</td><td data-label="Technician">' + u.esc(st.techName(r.techId)) + '</td><td data-label="Mileage" class="num">' + u.km(r.mileage) + '</td><td data-label="Cost" class="num strong">' + u.peso(r.cost) + '</td>' +
          '<td data-label="Status">' + AC.ui.badge(r.status) + '</td><td data-label="Invoice" class="mono small">' + r.invoice + '</td>' +
          '<td><div class="actions"><button class="btn btn-ghost btn-sm" data-det="' + r.id + '">' + AC.icon('eye') + 'Details</button><button class="btn btn-outline btn-sm" data-inv="' + r.id + '">' + AC.icon('file') + 'Invoice</button></div></td></tr>';
      }).join('') || '<tr><td colspan="9">' + AC.ui.empty('clock', 'No service records', 'Try another filter.') + '</td></tr>';
      el.querySelector('[data-pager]').innerHTML = AC.ui.pager(p);
    }
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); f.page = 1; render(); }, 150));
    el.querySelector('[data-veh]').onchange = (e) => { f.vehicle = e.target.value; f.page = 1; render(); };
    el.addEventListener('click', (e) => {
      const pg = e.target.closest('[data-page]'); if (pg && !pg.disabled) { f.page = +pg.dataset.page; render(); }
      const inv = e.target.closest('[data-inv]'); if (inv) AC.docs.fromRecord(st.s.records.find((r) => r.id === inv.dataset.inv));
      const det = e.target.closest('[data-det]');
      if (det) {
        const r = st.s.records.find((x) => x.id === det.dataset.det), v = st.vehicle(r.vehicleId), s = st.service(r.serviceId);
        const m = AC.ui.modal({
          title: r.service, sub: u.fmtDate(r.date, 'long') + ' · ' + r.invoice,
          body: '<div class="flex items-center gap-12 mb-16"><div class="thumb" style="width:96px;height:58px">' + AC.cust.vehicleArt(v) + '</div><div><div class="strong">' + u.esc(st.vName(v)) + '</div><span class="plate sm">' + v.plate + '</span></div></div>' +
            '<dl class="kv"><dt>Service</dt><dd>' + u.esc(r.service) + '</dd><dt>Description</dt><dd>' + u.esc(s ? s.desc : '—') + '</dd><dt>Technician</dt><dd>' + u.esc(st.techName(r.techId)) + '</dd><dt>Odometer</dt><dd>' + u.km(r.mileage) + '</dd><dt>Work notes</dt><dd>' + u.esc(r.notes || '—') + '</dd><dt>Total cost</dt><dd class="h4">' + u.peso(r.cost) + '</dd><dt>Status</dt><dd>' + AC.ui.badge(r.status) + '</dd></dl>',
          foot: '<button class="btn btn-outline" data-close>Close</button><a class="btn btn-outline" href="#/book?vehicle=' + v.id + '&service=' + (r.serviceId || '') + '">Book again</a><button class="btn btn-primary" data-i>' + AC.icon('file') + 'View Invoice</button>'
        });
        m.el.querySelector('[data-i]').onclick = () => { m.close(); AC.docs.fromRecord(r); };
        m.el.querySelector('a').addEventListener('click', () => m.close());
      }
      if (e.target.closest('[data-export]')) AC.ui.toast('Export started', 'Your service history CSV is downloading.', 'success');
    });
    render();
  };
})();

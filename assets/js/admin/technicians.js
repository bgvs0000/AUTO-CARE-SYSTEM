/* =========================================================
   AUTOCARE — admin/technicians.js
   Technician management: profiles (employee ID,
   specialization, current/completed jobs, rating, status),
   specialization filter, assign jobs, add / edit staff.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store;
  const SPECS = ['Mechanical', 'Electrical', 'Tires', 'Wheels', 'Aircon', 'Detailing', 'Body Repair'];
  const SPEC_ICON = { Mechanical: 'wrench', Electrical: 'zap', Tires: 'tire', Wheels: 'wheel', Aircon: 'wind', Detailing: 'sparkles', 'Body Repair': 'paint' };

  function form(t, onSave) {
    const isEdit = !!t; t = t || { spec: 'Mechanical', status: 'Available' };
    const m = AC.ui.modal({
      title: isEdit ? 'Edit technician' : 'Add technician', sub: isEdit ? t.empId : 'New team member',
      body: '<form class="form-grid" data-f novalidate>' + AC.ui.field('Full name <span class="req">*</span>', '<input class="input" name="name" required value="' + u.esc(t.name || '') + '">', 'span-2') +
        AC.ui.field('Employee ID <span class="req">*</span>', '<input class="input mono" name="empId" required value="' + u.esc(t.empId || 'EMP-' + (2200 + st.s.technicians.length)) + '">') + AC.ui.field('Phone', '<input class="input" name="phone" value="' + u.esc(t.phone || '') + '">') +
        AC.ui.field('Specialization', AC.ui.select('spec', SPECS, t.spec)) + AC.ui.field('Status', AC.ui.select('status', ['Available', 'On Job', 'Off Duty'], t.status)) + '</form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>' + (isEdit ? 'Save' : 'Add technician') + '</button>'
    });
    m.el.querySelector('[data-s]').onclick = () => { const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return; m.close(); onSave(AC.ui.formData(f)); };
  }

  function assign(t, onDone) {
    const open = st.s.appointments.filter((a) => !a.techId && a.date >= u.today() && ['Pending', 'Approved', 'Rescheduled'].includes(a.status)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const m = AC.ui.modal({
      title: 'Assign job to ' + t.name, sub: t.spec + ' specialist · ' + t.current + ' active job(s)', size: 'lg',
      body: open.length ? '<div class="grid" style="gap:8px">' + open.map((a) => { const v = st.vehicle(a.vehicleId); return '<button class="option" data-a="' + a.id + '">' + AC.kit.cellVehicle(v) + '<div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(a.service) + '</div><div class="small muted">' + a.id + ' · ' + u.fmtDate(a.date, 'day') + ' · ' + u.fmtTime(a.time) + '</div></div>' + AC.ui.badge(a.status) + '<span class="opt-check">' + AC.icon('check') + '</span></button>'; }).join('') + '</div>' : AC.ui.empty('check-circle', 'Every upcoming booking has a technician', ''),
      foot: '<button class="btn btn-outline" data-close>Close</button>' + (open.length ? '<button class="btn btn-primary" data-s disabled>Assign</button>' : '')
    });
    let sel;
    m.el.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => { sel = b.dataset.a; m.el.querySelectorAll('[data-a]').forEach((x) => x.classList.toggle('selected', x === b)); m.el.querySelector('[data-s]').disabled = false; }));
    const s = m.el.querySelector('[data-s]');
    if (s) s.onclick = () => { const a = st.appt(sel); a.techId = t.id; if (a.status === 'Pending') a.status = 'Approved'; st.log('Staff', st.s.staff.name, 'Assigned ' + t.name, a.id); st.save(); m.close(); AC.ui.toast('Job assigned', a.service + ' → ' + t.name, 'success'); onDone(); };
  }

  AC.adminViews.technicians = function (el) {
    let spec = 'All', q = '';
    el.innerHTML = AC.shell.pageHead('Technicians', 'Team availability, workload and performance.', '<button class="btn btn-primary" data-add>' + AC.icon('user-plus') + 'Add Technician</button>') +
      '<div class="grid-4 mb-20" data-kpi></div><div class="flex between items-center gap-12 wrap mb-16"><div class="chips" data-spec>' + ['All'].concat(SPECS).map((s) => '<button class="chip ' + (s === 'All' ? 'active' : '') + '" data-v="' + s + '">' + (SPEC_ICON[s] ? AC.icon(SPEC_ICON[s]) : '') + s + '</button>').join('') + '</div>' +
      '<div class="searchbar" style="width:min(260px,100%)">' + AC.icon('search') + '<input class="input" placeholder="Search name or ID…" data-q aria-label="Search technicians" style="background:#fff;border-color:var(--light-gray)"></div></div><div class="grid-auto stagger" data-grid></div>';
    function render() {
      const T = st.s.technicians;
      T.forEach((t) => { t.current = st.s.workOrders.filter((w) => w.techId === t.id && w.status !== 'Completed').length; });
      el.querySelector('[data-kpi]').innerHTML = AC.ui.statCard({ label: 'Total technicians', value: T.length, icon: 'badge', foot: SPECS.length + ' specializations' }) + AC.ui.statCard({ label: 'Available now', value: T.filter((t) => t.status === 'Available').length, icon: 'check-circle', foot: 'Ready for new jobs' }) +
        AC.ui.statCard({ label: 'On job', value: T.filter((t) => t.status === 'On Job').length, icon: 'wrench', foot: u.sum(T, (t) => t.current) + ' active work orders' }) + AC.ui.statCard({ label: 'Avg. rating', value: (u.sum(T, (t) => t.rating) / T.length).toFixed(2), icon: 'star', foot: 'Customer feedback' });
      const list = T.filter((t) => (spec === 'All' || t.spec === spec) && u.match([t.name, t.empId], q));
      el.querySelector('[data-grid]').innerHTML = list.map((t) => '<div class="card card-hover tech-card"><div class="tech-top"><div class="relative">' + AC.ui.avatar(t.name, 'lg') + '<span class="status-dot ' + t.status.replace(/\s/g, '') + '"></span></div><div style="min-width:0" class="grow"><div class="strong truncate">' + u.esc(t.name) + '</div><div class="small muted mono">' + t.empId + '</div><span class="tag mt-4">' + AC.icon(SPEC_ICON[t.spec] || 'wrench') + t.spec + '</span></div>' + AC.ui.badge(t.status) + '</div>' +
        '<div class="tech-stats"><div><b>' + t.current + '</b><span>Current</span></div><div><b>' + u.num(t.completed) + '</b><span>Completed</span></div><div><b>' + t.rating.toFixed(1) + '</b><span>Rating</span></div></div>' +
        '<div class="health"><span class="muted xs nowrap">Workload</span><div class="progress"><div class="progress-bar ' + (t.current >= 3 ? 'orange' : 'dark') + '" style="width:' + Math.min(100, t.current * 30 + 6) + '%"></div></div></div>' +
        '<div class="flex gap-8"><button class="btn btn-primary btn-sm grow" data-assign="' + t.id + '" ' + (t.status === 'Off Duty' ? 'disabled' : '') + '>' + AC.icon('plus') + 'Assign job</button><button class="btn btn-outline btn-sm" data-edit="' + t.id + '" aria-label="Edit">' + AC.icon('edit') + '</button><a class="btn btn-outline btn-sm" href="#/workorders" aria-label="Work orders">' + AC.icon('clipboard') + '</a></div></div>').join('') || '<div style="grid-column:1/-1">' + AC.ui.empty('badge', 'No technicians found', '') + '</div>';
    }
    el.addEventListener('click', (e) => {
      const c = e.target.closest('[data-spec] [data-v]'); if (c) { spec = c.dataset.v; el.querySelectorAll('[data-spec] .chip').forEach((x) => x.classList.toggle('active', x === c)); render(); }
      const as = e.target.closest('[data-assign]'); if (as) assign(st.tech(as.dataset.assign), render);
      const ed = e.target.closest('[data-edit]'); if (ed) { const t = st.tech(ed.dataset.edit); form(t, (d) => { Object.assign(t, d); st.log('Admin', st.s.staff.name, 'Updated technician', t.name); st.save(); AC.ui.toast('Technician updated', null, 'success'); render(); }); }
      if (e.target.closest('[data-add]')) form(null, (d) => { st.s.technicians.push(Object.assign({ id: 'TEC-' + u.pad(st.s.technicians.length + 1), rating: 5, completed: 0, current: 0, joined: u.today() }, d)); st.log('Admin', st.s.staff.name, 'Added technician', d.name); st.save(); AC.ui.toast('Technician added', d.name, 'success'); render(); });
    });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { q = e.target.value.trim(); render(); }, 150));
    render();
  };
})();

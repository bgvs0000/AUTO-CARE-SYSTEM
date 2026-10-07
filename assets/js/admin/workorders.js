/* =========================================================
   AUTOCARE — admin/workorders.js
   Work order system: Kanban board (drag & drop between
   stages) + table view, create from appointment, and a
   full work-order editor (technician, diagnosis, parts,
   labor, estimate/final cost, stage progression, print).
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store, STAT = AC.data.woStatuses;
  const COLORS = { Pending: 'var(--orange)', Inspection: '#60a5fa', Diagnosis: '#3b82f6', 'In Progress': 'var(--black)', 'Quality Check': '#6b7280', Completed: 'var(--green)' };

  function createFromAppt(onDone) {
    const S = st.s;
    const avail = S.appointments.filter((a) => ['Approved', 'Pending', 'Rescheduled'].includes(a.status) && !S.workOrders.some((w) => w.apptId === a.id)).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const m = AC.ui.modal({
      title: 'New work order', sub: 'Open a job card from a booking', size: 'lg',
      body: avail.length ? '<div class="grid" style="gap:8px;max-height:420px;overflow:auto">' + avail.map((a) => { const v = st.vehicle(a.vehicleId), c = st.customer(a.customerId); return '<button class="option" data-a="' + a.id + '">' + AC.kit.cellVehicle(v) + '<div class="grow" style="min-width:0"><div class="strong truncate">' + u.esc(a.service) + '</div><div class="small muted truncate">' + a.id + ' · ' + u.esc(c.name) + ' · ' + u.fmtDate(a.date, 'md') + ' ' + u.fmtTime(a.time) + '</div></div>' + AC.ui.badge(a.status) + '<span class="opt-check">' + AC.icon('check') + '</span></button>'; }).join('') + '</div>' +
        '<div class="mt-16">' + AC.ui.field('Assign technician', AC.ui.select('tech', S.technicians.filter((t) => t.status !== 'Off Duty').map((t) => ({ value: t.id, label: t.name + ' · ' + t.spec + ' (' + t.current + ' active)' })), '', 'data-tech')) + '</div>' : AC.ui.empty('calendar', 'No open bookings', 'All approved appointments already have work orders.'),
      foot: '<button class="btn btn-outline" data-close>Cancel</button>' + (avail.length ? '<button class="btn btn-primary" data-s disabled>Create work order</button>' : '')
    });
    let sel = null;
    m.el.querySelectorAll('[data-a]').forEach((b) => (b.onclick = () => { sel = b.dataset.a; m.el.querySelectorAll('[data-a]').forEach((x) => x.classList.toggle('selected', x === b)); m.el.querySelector('[data-s]').disabled = false; }));
    const s = m.el.querySelector('[data-s]');
    if (s) s.onclick = () => {
      const a = st.appt(sel); a.techId = m.el.querySelector('[data-tech]').value;
      a.status = 'In Progress';
      const w = st.createWO(a, { techId: a.techId });
      const t = st.tech(a.techId); if (t) { t.current++; t.status = 'On Job'; }
      st.save(); m.close(); AC.ui.toast('Work order created', w.id + ' · ' + w.service, 'success'); onDone ? onDone(w) : AC.router.go('workorder/' + w.id);
    };
  }

  AC.adminViews.workorders = function (el) {
    const f = { view: 'board', q: '', tech: '' };
    el.innerHTML = AC.shell.pageHead('Work Orders', 'Track every job from drop-off to release.', '<div class="seg" data-view><button class="active" data-value="board">' + AC.icon('grid') + ' Board</button><button data-value="table">' + AC.icon('list') + ' Table</button></div><button class="btn btn-primary" data-new>' + AC.icon('plus') + 'New Work Order</button>') +
      '<div class="flex gap-10 wrap mb-16"><div class="searchbar" style="flex:1 1 240px;max-width:360px">' + AC.icon('search') + '<input class="input" placeholder="Search WO #, plate, customer, service…" data-q aria-label="Search work orders" style="background:#fff;border-color:var(--light-gray)"></div>' +
      AC.ui.select('tech', [{ value: '', label: 'All technicians' }].concat(st.s.technicians.map((t) => ({ value: t.id, label: t.name }))), '', 'data-techf style="width:auto" aria-label="Technician"') + '</div><div data-body></div>';
    const body = el.querySelector('[data-body]');
    const rows = () => st.s.workOrders.filter((w) => (!f.tech || w.techId === f.tech) && u.match([w.id, w.plate, w.service, (st.customer(w.customerId) || {}).name], f.q));
    let t;
    function render() {
      if (f.view === 'board') {
        const list = rows();
        body.innerHTML = '<div class="kanban">' + STAT.map((s) => { const col = list.filter((w) => w.status === s); return '<div class="kan-col" data-col="' + s + '"><div class="kan-head"><span><span class="dot" style="background:' + COLORS[s] + '"></span>' + s + '</span><span class="badge no-dot">' + col.length + '</span></div><div class="kan-body">' +
          col.map((w) => { const v = st.vehicle(w.vehicleId), c = st.customer(w.customerId); return '<div class="kan-card" draggable="true" data-wo="' + w.id + '"><div class="flex between items-center"><span class="mono xs strong">' + w.id + '</span><span class="plate sm">' + w.plate + '</span></div><div class="t mt-8">' + u.esc(w.service) + '</div><div class="s">' + u.esc(v ? v.brand + ' ' + v.model : '') + ' · ' + u.esc(c ? c.name : '') + '</div><div class="flex between items-center mt-12"><span class="flex items-center gap-6 xs muted">' + AC.ui.avatar(st.techName(w.techId), 'sm') + u.esc(st.techName(w.techId).split(' ')[0]) + '</span><b class="small">' + u.peso(w.final || w.estimate) + '</b></div></div>'; }).join('') +
          (col.length ? '' : '<div class="xs muted text-center" style="padding:16px">Drop here</div>') + '</div></div>'; }).join('') + '</div><p class="xs muted mt-8">Tip: drag cards between columns to update their stage. Customers see changes instantly in Service Tracking.</p>';
        wireDrag();
      } else {
        body.innerHTML = '<div class="card" data-t></div>';
        t = AC.kit.table(body.querySelector('[data-t]'), {
          per: 10, columns: [
            { label: 'Work Order', main: true, render: (w) => '<a class="cell-title mono" href="#/workorder/' + w.id + '">' + w.id + '</a><div class="cell-sub">' + u.esc(w.service) + '</div>', sort: (w) => w.id },
            { label: 'Customer', render: (w) => u.esc((st.customer(w.customerId) || {}).name || ''), sort: (w) => (st.customer(w.customerId) || {}).name || '' },
            { label: 'Vehicle', render: (w) => AC.kit.cellVehicle(st.vehicle(w.vehicleId)) },
            { label: 'Technician', render: (w) => u.esc(st.techName(w.techId)), sort: (w) => st.techName(w.techId) },
            { label: 'Started', render: (w) => '<span class="small nowrap">' + u.fmtDateTime(w.started) + '</span>', sort: (w) => w.started },
            { label: 'Estimate', cls: 'num', render: (w) => u.peso(w.estimate), sort: (w) => w.estimate },
            { label: 'Final', cls: 'num', render: (w) => w.final ? '<b>' + u.peso(w.final) + '</b>' : '—', sort: (w) => w.final || 0 },
            { label: 'Status', render: (w) => AC.ui.badge(w.status), sort: (w) => STAT.indexOf(w.status) },
            { label: '', cls: 'text-right', render: (w) => '<div class="actions"><a class="btn btn-outline btn-sm" href="#/workorder/' + w.id + '">Open</a></div>' }
          ]
        });
        t.set(rows().sort((a, b) => b.started.localeCompare(a.started)));
      }
    }
    function wireDrag() {
      let dragId = null;
      body.querySelectorAll('[data-wo]').forEach((c) => {
        c.addEventListener('dragstart', (e) => { dragId = c.dataset.wo; c.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move'; try { e.dataTransfer.setData('text/plain', dragId); } catch (er) { /* ignore */ } });
        c.addEventListener('dragend', () => c.classList.remove('dragging'));
        c.addEventListener('click', () => AC.router.go('workorder/' + c.dataset.wo));
      });
      body.querySelectorAll('[data-col]').forEach((col) => {
        col.addEventListener('dragover', (e) => { e.preventDefault(); col.classList.add('drag-over'); });
        col.addEventListener('dragleave', () => col.classList.remove('drag-over'));
        col.addEventListener('drop', (e) => {
          e.preventDefault(); col.classList.remove('drag-over');
          const w = st.wo(dragId); if (!w || w.status === col.dataset.col) return;
          if (w.status === 'Completed') return AC.ui.toast('Completed work orders are locked', null, 'warning');
          st.setWOStatus(w.id, col.dataset.col);
          AC.ui.toast(w.id + ' → ' + col.dataset.col, 'Customer notified.', 'success'); render();
        });
      });
    }
    AC.ui.tabs(el.querySelector('[data-view]'), (v) => { f.view = v; render(); });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); render(); }, 150));
    el.querySelector('[data-techf]').onchange = (e) => { f.tech = e.target.value; render(); };
    el.querySelector('[data-new]').onclick = () => createFromAppt();
    render();
  };

  AC.adminViews.workorder = function (el, params) {
    const w = st.wo(params[0]);
    if (!w) { el.innerHTML = AC.ui.empty('clipboard', 'Work order not found', '', '<a class="btn btn-primary mt-8" href="#/workorders">Back</a>'); return; }
    const S = st.s, v = st.vehicle(w.vehicleId), c = st.customer(w.customerId);
    const locked = w.status === 'Completed';
    function totals() { const parts = u.sum(w.parts, (p) => p.qty * p.price); return { parts, est: parts + (+w.labor || 0) }; }
    function render() {
      const i = STAT.indexOf(w.status), tt = totals();
      el.innerHTML = AC.shell.pageHead('Work Order ' + w.id, u.esc(w.service) + ' · ' + AC.ui.badge(w.status), '<button class="btn btn-outline" data-print>' + AC.icon('printer') + 'Print</button>' + (!locked ? '<button class="btn btn-primary" data-adv>' + (i === 4 ? AC.icon('check-circle') + 'Complete & Release' : AC.icon('arrow-right') + 'Move to ' + STAT[i + 1]) + '</button>' : ''), [['Work Orders', '#/workorders'], [w.id]]) +
        '<div class="card card-body mb-20"><div class="stepper">' + STAT.map((s, k) => (k ? '<span class="step-line ' + (k <= i ? 'done' : '') + '"></span>' : '') + '<button class="step ' + (k < i || (k === i && locked) ? 'done' : k === i ? 'active' : '') + '" data-stage="' + s + '" ' + (locked ? 'disabled' : '') + '><span class="step-num">' + (k < i || (k === i && locked) ? AC.icon('check') : k + 1) + '</span><span class="step-text">' + s + '</span></button>').join('') + '</div></div>' +
        '<div class="grid-main-side"><div class="col gap-20">' +
        '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('clipboard') + 'Job details</div></div><div class="card-body form-grid">' +
        AC.ui.field('Work Order Number', '<input class="input mono" readonly value="' + w.id + '">') + AC.ui.field('Service', '<input class="input" readonly value="' + u.esc(w.service) + '">') +
        AC.ui.field('Technician', AC.ui.select('tech', [{ value: '', label: 'Unassigned' }].concat(S.technicians.map((t) => ({ value: t.id, label: t.name + ' · ' + t.spec }))), w.techId || '', locked ? 'disabled data-f' : 'data-f')) +
        AC.ui.field('Status', AC.ui.select('status', STAT, w.status, locked ? 'disabled data-f' : 'data-f')) +
        AC.ui.field('Date Started', '<input class="input" readonly value="' + u.fmtDateTime(w.started) + '">') + AC.ui.field('Date Completed', '<input class="input" readonly value="' + (w.completed ? u.fmtDateTime(w.completed) : '—') + '">') +
        AC.ui.field('Diagnosis', '<textarea class="textarea" name="diagnosis" data-f ' + (locked ? 'readonly' : '') + ' placeholder="Findings, root cause, recommendations…">' + u.esc(w.diagnosis) + '</textarea>', 'span-2') + '</div></div>' +
        '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('box') + 'Parts used</div>' + (!locked ? '<button class="btn btn-soft btn-sm" data-addpart>' + AC.icon('plus') + 'Add part</button>' : '') + '</div>' +
        '<div class="table-wrap"><table class="table table-responsive"><thead><tr><th>Part</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th><th></th></tr></thead><tbody>' +
        (w.parts.length ? w.parts.map((p, k) => '<tr><td data-label="Part">' + u.esc(p.name) + '</td><td data-label="Qty" class="num">' + p.qty + '</td><td data-label="Unit" class="num">' + u.peso(p.price) + '</td><td data-label="Amount" class="num strong">' + u.peso(p.qty * p.price) + '</td><td class="text-right">' + (!locked ? '<button class="btn btn-danger-ghost btn-icon btn-sm" data-rmpart="' + k + '" aria-label="Remove part">' + AC.icon('trash') + '</button>' : '') + '</td></tr>').join('') : '<tr><td colspan="5" class="muted small text-center" style="padding:20px">No parts added yet</td></tr>') +
        '</tbody></table></div></div></div>' +
        '<div class="col gap-20"><div class="card card-body"><div class="xs muted strong mb-8">CUSTOMER & VEHICLE</div>' + AC.kit.cellUser(c.name, c.phone) + '<div class="divider"></div>' + AC.kit.cellVehicle(v) + '<div class="small muted mt-8">' + u.esc(v.engine || '') + ' · ' + u.km(v.mileage) + '</div><a class="link small mt-8" style="display:inline-block" href="#/vehicle/' + v.id + '">Vehicle history →</a></div>' +
        '<div class="card card-body"><div class="h4 mb-12">Costing</div><div class="sum-line"><span>Parts</span><span>' + u.peso(tt.parts) + '</span></div>' +
        '<div class="field mt-8"><label class="label">Labor (₱)</label><input class="input" type="number" min="0" data-labor value="' + w.labor + '" ' + (locked ? 'readonly' : '') + '></div>' +
        '<div class="sum-line mt-8"><span>Estimated Cost</span><span class="h4">' + u.peso(tt.est) + '</span></div>' +
        '<div class="field mt-8"><label class="label">Final Cost (₱)</label><input class="input" type="number" min="0" data-final value="' + (w.final || '') + '" placeholder="Set on completion" ' + (locked ? 'readonly' : '') + '></div>' +
        (!locked ? '<button class="btn btn-primary btn-block mt-16" data-save>' + AC.icon('check') + 'Save work order</button>' : '<div class="alert success mt-16">' + AC.icon('check-circle') + '<div>Completed &amp; released. Invoice ' + u.peso(w.final) + '.</div></div>') + '</div></div></div>';
    }
    function collect() {
      const sel = (n) => el.querySelector('[name=' + n + ']');
      w.techId = sel('tech').value || null; w.diagnosis = sel('diagnosis').value;
      w.labor = +el.querySelector('[data-labor]').value || 0; w.estimate = totals().est;
      const fv = el.querySelector('[data-final]').value; w.final = fv ? +fv : null;
      return sel('status').value;
    }
    el.addEventListener('click', async (e) => {
      if (e.target.closest('[data-print]')) return AC.docs.fromWO(w);
      if (e.target.closest('[data-save]')) { const s = collect(); if (s !== w.status) st.setWOStatus(w.id, s); else { st.log('Staff', S.staff.name, 'Updated work order', w.id); st.save(); } AC.ui.toast('Work order saved', w.id, 'success'); render(); }
      const adv = e.target.closest('[data-adv]');
      if (adv) {
        collect(); const next = STAT[STAT.indexOf(w.status) + 1];
        if (next === 'Completed' && !(await AC.ui.confirm({ title: 'Complete & release ' + w.id + '?', message: 'Final cost: <b>' + u.peso(w.final || w.estimate) + '</b>. The customer will be notified their vehicle is ready.', confirmText: 'Complete job', icon: 'check-circle' }))) return;
        if (!w.techId) return AC.ui.toast('Assign a technician first', null, 'warning');
        await AC.ui.busy(adv, 400); st.setWOStatus(w.id, next);
        if (next === 'Completed') { const t = st.tech(w.techId); if (t) { t.current = Math.max(0, t.current - 1); t.completed++; } st.save(); }
        AC.ui.toast(w.id + ' → ' + next, 'Customer notified in Service Tracking.', 'success'); render();
      }
      const stg = e.target.closest('[data-stage]'); if (stg && !stg.disabled) { collect(); if (stg.dataset.stage === 'Completed') { el.querySelector('[data-adv]') && STAT.indexOf(w.status) === 4 ? el.querySelector('[data-adv]').click() : AC.ui.toast('Move through Quality Check first', null, 'info'); return; } st.setWOStatus(w.id, stg.dataset.stage); AC.ui.toast('Stage updated', stg.dataset.stage, 'success'); render(); }
      const rm = e.target.closest('[data-rmpart]'); if (rm) { w.parts.splice(+rm.dataset.rmpart, 1); collect(); st.save(); render(); }
      if (e.target.closest('[data-addpart]')) {
        const inv = st.inventoryRows().filter((r) => ['oils', 'filters', 'brakes', 'lubricants', 'batteries', 'suspension', 'lighting'].includes(r.p.cat) && r.v.stock > 0);
        const m = AC.ui.modal({
          title: 'Add part', sub: 'From inventory or custom', body: '<form class="form-grid" data-pf>' + AC.ui.field('From inventory', '<select class="select" name="inv"><option value="">— Custom part —</option>' + inv.map((r, k) => '<option value="' + k + '">' + u.esc(r.p.title + ' · ' + r.v.label) + ' (' + r.v.stock + ' in stock)</option>').join('') + '</select>', 'span-2') +
            AC.ui.field('Part name', '<input class="input" name="name" required>', 'span-2') + AC.ui.field('Quantity', '<input class="input" type="number" min="1" name="qty" value="1" required>') + AC.ui.field('Unit price (₱)', '<input class="input" type="number" min="0" name="price" required>') + '</form>',
          foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-ok>Add part</button>'
        });
        const pf = m.el.querySelector('[data-pf]');
        pf.inv.onchange = () => { const r = inv[+pf.inv.value]; if (r) { pf.name.value = r.p.title + ' · ' + r.v.label; pf.price.value = r.v.price; } };
        m.el.querySelector('[data-ok]').onclick = () => {
          if (!AC.ui.validate(pf)) return;
          const r = inv[+pf.inv.value]; const qty = +pf.qty.value;
          if (r) { if (qty > r.v.stock) return AC.ui.toast('Not enough stock', r.v.stock + ' available', 'warning'); st.adjustStock(r.p.id, r.v.key, -qty, 'Used on ' + w.id); }
          w.parts.push({ name: pf.name.value, qty, price: +pf.price.value }); collect(); st.save(); m.close(); AC.ui.toast('Part added', pf.name.value, 'success'); render();
        };
      }
    });
    el.addEventListener('input', (e) => { if (e.target.matches('[data-labor]')) { const lab = +e.target.value || 0; const est = totals().parts + lab; const line = el.querySelectorAll('.sum-line')[1]; if (line) line.lastElementChild.textContent = u.peso(est); } });
    render();
  };
  AC.woCreate = createFromAppt;
})();

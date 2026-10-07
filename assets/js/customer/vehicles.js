/* =========================================================
   AUTOCARE — customer/vehicles.js
   My Vehicles: card grid, search/filter, add/edit vehicle
   (searchable PH make/model catalog), vehicle details with
   specs, maintenance status and full service history.
   ========================================================= */
window.AC = window.AC || {};
AC.custViews = AC.custViews || {};

(function () {
  const u = AC.u, st = AC.store, VD = AC.data.vehicles;

  function health(v) {
    const days = v.nextService ? u.daysBetween(u.today(), v.nextService) : 180;
    const pct = u.clamp(Math.round((days / 180) * 100), 4, 100);
    const cls = days < 0 ? 'red' : days < 30 ? 'orange' : 'green';
    const txt = days < 0 ? 'Overdue by ' + Math.abs(days) + ' days' : days === 0 ? 'Due today' : 'Next service in ' + days + ' days';
    return '<div class="health"><span class="muted nowrap">' + txt + '</span><div class="progress"><div class="progress-bar ' + cls + '" style="width:' + pct + '%"></div></div></div>';
  }

  function card(v) {
    return '<article class="card card-hover veh-card">' +
      '<div class="veh-media">' + AC.ui.badge(v.condition) + '<span class="plate">' + u.esc(v.plate) + '</span>' + AC.cust.vehicleArt(v) + '</div>' +
      '<div class="veh-body"><div class="flex between items-start gap-8"><div><div class="h4">' + u.esc(v.brand + ' ' + v.model) + ' ' + v.year + '</div><div class="small muted">' + u.esc(v.variant || '') + '</div></div><span class="mono xs muted">' + v.id + '</span></div>' +
      '<div class="veh-meta"><div><div class="l">Mileage</div><div class="v">' + u.km(v.mileage) + '</div></div><div><div class="l">Fuel</div><div class="v">' + u.esc(v.fuel) + '</div></div><div><div class="l">Trans.</div><div class="v">' + u.esc(v.transmission || '—') + '</div></div></div>' +
      health(v) +
      '<div class="veh-actions"><a class="btn btn-outline btn-sm" href="#/vehicle/' + v.id + '">' + AC.icon('eye') + 'View Vehicle</a><a class="btn btn-outline btn-sm" href="#/history?vehicle=' + v.id + '">' + AC.icon('clock') + 'Service History</a>' +
      '<a class="btn btn-primary btn-sm" href="#/book?vehicle=' + v.id + '">' + AC.icon('calendar-check') + 'Book Service</a><button class="btn btn-ghost btn-sm" data-edit="' + v.id + '">' + AC.icon('edit') + 'Edit</button></div></div></article>';
  }

  /* ---------- Vehicle form modal (add / edit) ---------- */
  AC.vehicleForm = function (v, onSave, opts) {
    opts = opts || {};
    const isEdit = !!v;
    v = v || { brand: 'Toyota', model: 'Vios', year: 2023, transmission: 'Automatic', fuel: 'Gasoline', color: 'Pearl White', mileage: '' };
    const years = []; for (let y = 2026; y >= 2005; y--) years.push(y);
    const m = AC.ui.modal({
      title: isEdit ? 'Edit vehicle' : 'Register a vehicle', sub: isEdit ? v.id + ' · ' + v.plate : 'Search from the most common vehicles in the Philippines', size: 'lg',
      body: '<div class="searchbar dropdown mb-16">' + AC.icon('search') + '<input class="input" placeholder="Quick search: e.g. “Fortuner”, “Honda City”, “Ranger”…" data-vs aria-label="Search vehicle catalog"><div class="dropdown-menu left" style="width:100%;max-height:260px;overflow:auto" data-vsr></div></div>' +
        '<form class="form-grid-3" data-vf novalidate>' +
        AC.ui.field('Brand <span class="req">*</span>', '<select class="select" name="brand" required>' + VD.brands().map((b) => '<option' + (b === v.brand ? ' selected' : '') + '>' + b + '</option>').join('') + '</select>') +
        AC.ui.field('Model <span class="req">*</span>', '<select class="select" name="model" required></select>') +
        AC.ui.field('Year <span class="req">*</span>', '<select class="select" name="year">' + years.map((y) => '<option' + (+v.year === y ? ' selected' : '') + '>' + y + '</option>').join('') + '</select>') +
        AC.ui.field('Plate Number <span class="req">*</span>', '<input class="input mono" name="plate" required placeholder="ABC 1234" value="' + u.esc(v.plate || '') + '" style="text-transform:uppercase">') +
        AC.ui.field('Variant', '<input class="input" name="variant" placeholder="e.g. 1.3 XLE CVT" value="' + u.esc(v.variant || '') + '">') +
        AC.ui.field('Engine', '<input class="input" name="engine" placeholder="e.g. 1.3L Dual VVT-i" value="' + u.esc(v.engine || '') + '">') +
        AC.ui.field('Transmission', AC.ui.select('transmission', ['Automatic', 'Manual', 'CVT', 'DCT', 'IVT', 'e-CVT', 'Single-speed'], v.transmission)) +
        AC.ui.field('Fuel Type', AC.ui.select('fuel', ['Gasoline', 'Diesel', 'Hybrid', 'Electric'], v.fuel)) +
        AC.ui.field('Color', AC.ui.select('color', VD.COLORS.map((c) => c.name), v.color)) +
        AC.ui.field('Mileage (km) <span class="req">*</span>', '<input class="input" type="number" min="0" name="mileage" required placeholder="e.g. 25000" value="' + u.esc(v.mileage) + '">') +
        AC.ui.field('VIN / Chassis No.', '<input class="input mono" name="vin" maxlength="17" placeholder="17 characters" value="' + u.esc(v.vin || '') + '" style="text-transform:uppercase">') +
        AC.ui.field('Registration Date', '<input class="input" type="date" name="regDate" value="' + u.esc(v.regDate || '') + '">') +
        '</form><div class="flex items-center gap-16 mt-16 card card-soft" style="padding:12px 16px"><div style="width:140px" data-prev></div><div class="small muted" data-spec></div></div>',
      foot: (isEdit && !opts.hideDelete ? '<button class="btn btn-danger-ghost" data-del style="margin-right:auto">' + AC.icon('trash') + 'Delete</button>' : '') + '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-save>' + (isEdit ? 'Save changes' : 'Register vehicle') + '</button>'
    });
    const f = m.el.querySelector('[data-vf]');
    const fillModels = (sel) => { f.model.innerHTML = VD.models(f.brand.value).map((x) => '<option' + (x === sel ? ' selected' : '') + '>' + x + '</option>').join(''); preview(); };
    function preview() {
      const c = VD.find(f.brand.value, f.model.value) || {};
      const col = VD.COLORS.find((x) => x.name === f.color.value) || VD.COLORS[0];
      m.el.querySelector('[data-prev]').innerHTML = AC.art.car({ body: c.body, color: col.hex });
      m.el.querySelector('[data-spec]').innerHTML = 'OEM tire <b class="mono" style="color:var(--black)">' + (c.tire || '—') + '</b> · PCD <b class="mono" style="color:var(--black)">' + (c.pcd || '—') + '</b> · ' + (c.fuel || '') + ' · ' + ({ sedan: 'Sedan', hatch: 'Hatchback', suv: 'SUV / MPV', pickup: 'Pickup', van: 'Van' }[c.body] || '');
      if (!isEdit && c.fuel) f.fuel.value = c.fuel;
    }
    f.brand.onchange = () => fillModels();
    f.model.onchange = preview; f.color.onchange = preview;
    fillModels(v.model);
    const vs = m.el.querySelector('[data-vs]'), vsr = m.el.querySelector('[data-vsr]');
    vs.addEventListener('input', () => {
      const q = vs.value.trim();
      const res = q ? VD.catalog.filter((c) => u.match(c.brand + ' ' + c.model, q)).slice(0, 10) : [];
      vsr.innerHTML = res.map((c) => '<button type="button" class="dropdown-item" data-pick="' + u.esc(c.brand + '|' + c.model) + '">' + AC.icon('car') + '<span class="grow">' + c.brand + ' <b>' + c.model + '</b></span><span class="xs muted mono">' + c.tire + '</span></button>').join('') || (q ? '<div class="small muted" style="padding:12px">No match in catalog</div>' : '');
      vs.parentElement.classList.toggle('open', !!q);
    });
    vsr.addEventListener('click', (e) => {
      const b = e.target.closest('[data-pick]'); if (!b) return;
      const [br, mo] = b.dataset.pick.split('|');
      f.brand.value = br; fillModels(mo); vs.value = ''; vs.parentElement.classList.remove('open');
    });
    m.el.querySelector('[data-save]').onclick = async (e) => {
      if (!AC.ui.validate(f)) return;
      const d = AC.ui.formData(f);
      d.plate = d.plate.toUpperCase(); d.vin = (d.vin || '').toUpperCase();
      if (st.s.vehicles.some((x) => x.plate === d.plate && (!isEdit || x.id !== v.id))) { f.plate.classList.add('is-invalid'); return AC.ui.toast('Plate number already registered', null, 'error'); }
      await AC.ui.busy(e.currentTarget, 500);
      m.close(); onSave && onSave(d);
    };
    const del = m.el.querySelector('[data-del]');
    if (del) del.onclick = async () => {
      if (await AC.ui.confirm({ title: 'Delete ' + v.brand + ' ' + v.model + '?', message: 'This removes the vehicle from your garage. Service records are kept by AutoCare.', danger: true, confirmText: 'Delete vehicle' })) {
        st.removeVehicle(v.id); m.close(); AC.ui.toast('Vehicle removed', v.plate, 'success'); opts.onDelete && opts.onDelete();
      }
    };
  };

  /* ---------- List ---------- */
  AC.custViews.vehicles = function (el) {
    let q = '', filter = 'All';
    el.innerHTML = AC.shell.pageHead('My Vehicles', 'Manage your registered vehicles, mileage and maintenance schedule.', '<button class="btn btn-primary" data-add>' + AC.icon('plus') + 'Add Vehicle</button>') +
      '<div class="flex between items-center gap-12 wrap mb-16"><div class="chips" data-f>' + ['All', 'Good Condition', 'Service Due', 'In Service'].map((x) => '<button class="chip ' + (x === 'All' ? 'active' : '') + '" data-v="' + x + '">' + x + '</button>').join('') + '</div>' +
      '<div class="searchbar" style="width:min(300px,100%)">' + AC.icon('search') + '<input class="input" placeholder="Search plate, make, model…" data-q aria-label="Search vehicles" style="background:#fff;border-color:var(--light-gray)"></div></div>' +
      '<div class="veh-grid stagger" data-grid></div>';
    const grid = el.querySelector('[data-grid]');
    function render() {
      const list = AC.cust.vehicles().filter((v) => (filter === 'All' || v.condition === filter) && u.match([v.plate, v.brand, v.model, v.year, v.variant], q));
      grid.innerHTML = list.map(card).join('') + (filter === 'All' && !q ? '<button class="veh-add" data-add><div><div class="icon-tile">' + AC.icon('plus') + '</div><div class="strong" style="color:var(--black)">Add a vehicle</div><div class="small">Register another car to your garage</div></div></button>' : '') +
        (!list.length && (q || filter !== 'All') ? '<div style="grid-column:1/-1">' + AC.ui.empty('car', 'No vehicles match', 'Try a different filter.') + '</div>' : '');
    }
    const add = () => AC.vehicleForm(null, (d) => { d.customerId = AC.session.customerId(); const v = st.addVehicle(d); AC.ui.toast('Vehicle registered', st.vName(v) + ' · ' + v.plate, 'success'); render(); });
    el.addEventListener('click', (e) => {
      if (e.target.closest('[data-add]')) add();
      const ed = e.target.closest('[data-edit]');
      if (ed) { const v = st.vehicle(ed.dataset.edit); AC.vehicleForm(v, (d) => { st.updateVehicle(v.id, d); AC.ui.toast('Vehicle updated', null, 'success'); render(); }, { onDelete: render }); }
      const c = e.target.closest('[data-f] [data-v]');
      if (c) { filter = c.dataset.v; el.querySelectorAll('[data-f] .chip').forEach((x) => x.classList.toggle('active', x === c)); render(); }
    });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { q = e.target.value.trim(); render(); }, 150));
    render();
  };

  /* ---------- Detail ---------- */
  AC.custViews.vehicle = function (el, params) {
    const v = st.vehicle(params[0]);
    if (!v || v.customerId !== AC.session.customerId()) { el.innerHTML = AC.ui.empty('car', 'Vehicle not found', '', '<a class="btn btn-primary mt-8" href="#/vehicles">Back to My Vehicles</a>'); return; }
    const recs = st.s.records.filter((r) => r.vehicleId === v.id);
    const appts = st.s.appointments.filter((a) => a.vehicleId === v.id && a.date >= u.today() && a.status !== 'Cancelled' && a.status !== 'Completed');
    const cat = VD.find(v.brand, v.model) || {};
    const wo = st.s.workOrders.find((w) => w.vehicleId === v.id && w.status !== 'Completed');
    el.innerHTML = AC.shell.pageHead(u.esc(st.vName(v)), u.esc(v.variant || ''), '<button class="btn btn-outline" data-edit>' + AC.icon('edit') + 'Edit</button><a class="btn btn-primary" href="#/book?vehicle=' + v.id + '">' + AC.icon('calendar-check') + 'Book Service</a>', [['My Vehicles', '#/vehicles'], [v.plate]]) +
      '<div class="card veh-hero"><div class="media">' + AC.cust.vehicleArt(v) + '</div><div class="info">' +
      '<div class="flex gap-8 wrap mb-16"><span class="plate">' + v.plate + '</span>' + AC.ui.badge(v.condition) + '<span class="tag mono">' + v.id + '</span></div>' +
      '<dl class="kv"><dt>Make / Model</dt><dd>' + u.esc(v.brand + ' ' + v.model) + '</dd><dt>Year</dt><dd>' + v.year + '</dd><dt>Variant</dt><dd>' + u.esc(v.variant || '—') + '</dd><dt>Engine</dt><dd>' + u.esc(v.engine || '—') + '</dd>' +
      '<dt>Transmission</dt><dd>' + u.esc(v.transmission || '—') + '</dd><dt>Fuel Type</dt><dd>' + u.esc(v.fuel) + '</dd><dt>Color</dt><dd><span class="flex items-center gap-8"><span class="color-dot" style="background:' + v.colorHex + '"></span>' + u.esc(v.color) + '</span></dd>' +
      '<dt>Mileage</dt><dd>' + u.km(v.mileage) + '</dd><dt>VIN</dt><dd class="mono">' + u.esc(v.vin || '—') + '</dd><dt>Registered</dt><dd>' + u.fmtDate(v.regDate) + '</dd></dl></div></div>' +
      '<div class="grid-3 section-gap">' +
      '<div class="card card-body"><div class="stat-label">Last Service</div><div class="h3 mt-4">' + u.fmtDate(v.lastService) + '</div><div class="small muted mt-4">' + (recs[0] ? u.esc(recs[0].service) : 'No records yet') + '</div></div>' +
      '<div class="card card-body"><div class="stat-label">Next Recommended Service</div><div class="h3 mt-4">' + u.fmtDate(v.nextService) + '</div><div class="mt-8">' + health(v) + '</div></div>' +
      '<div class="card card-body"><div class="stat-label">OEM Fitment</div><div class="h3 mt-4 mono">' + (cat.tire || '—') + '</div><div class="small muted mt-4">PCD ' + (cat.pcd || '—') + ' · CB ' + (cat.cb || '—') + ' mm · <a class="link" href="shop.html#/tires?brand=' + encodeURIComponent(v.brand) + '&model=' + encodeURIComponent(v.model) + '">Find tires</a></div></div></div>' +
      (wo ? '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('activity') + 'Currently in service · ' + wo.id + '</div><a class="btn btn-outline btn-sm" href="#/tracking">Track</a></div><div class="card-body">' + AC.trackerHtml(wo) + '</div></div>' : '') +
      (appts.length ? '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('calendar') + 'Upcoming</div></div>' + appts.map((a) => '<div class="mini-row"><div class="grow"><b>' + u.esc(a.service) + '</b><div class="small muted">' + u.fmtDate(a.date, 'day') + ' · ' + u.fmtTime(a.time) + '</div></div>' + AC.ui.badge(a.status) + '</div>').join('') + '</div>' : '') +
      '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('clock') + 'Service History <span class="badge">' + recs.length + '</span></div></div>' +
      (recs.length ? '<div class="table-wrap"><table class="table table-responsive"><thead><tr><th>Date</th><th>Service</th><th>Technician</th><th class="num">Mileage</th><th class="num">Cost</th><th>Status</th><th></th></tr></thead><tbody>' +
        recs.map((r) => '<tr><td data-label="Date" class="nowrap">' + u.fmtDate(r.date) + '</td><td data-label="Service">' + u.esc(r.service) + '</td><td data-label="Technician">' + u.esc(st.techName(r.techId)) + '</td><td data-label="Mileage" class="num">' + u.km(r.mileage) + '</td><td data-label="Cost" class="num">' + u.peso(r.cost) + '</td><td data-label="Status">' + AC.ui.badge(r.status) + '</td><td><div class="actions"><button class="btn btn-ghost btn-sm" data-inv="' + r.id + '">' + AC.icon('file') + 'Invoice</button></div></td></tr>').join('') + '</tbody></table></div>' : AC.ui.empty('clock', 'No service records yet', 'Book your first service with AutoCare.')) + '</div>';
    el.querySelector('[data-edit]').onclick = () => AC.vehicleForm(v, (d) => { st.updateVehicle(v.id, d); AC.ui.toast('Vehicle updated', null, 'success'); AC.router.refresh(); }, { onDelete: () => AC.router.go('vehicles') });
    el.querySelectorAll('[data-inv]').forEach((b) => (b.onclick = () => AC.docs.fromRecord(st.s.records.find((r) => r.id === b.dataset.inv))));
  };
})();

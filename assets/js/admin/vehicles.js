/* =========================================================
   AUTOCARE — admin/vehicles.js
   All customer vehicles: filters (brand, model, year,
   service status, customer), table/grid toggle, and vehicle
   details with complete service history & work orders.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store, VD = AC.data.vehicles;
  const CONDS = ['Good Condition', 'Service Due', 'In Service', 'Needs Attention'];

  AC.adminViews.vehicles = function (el) {
    const S = st.s, f = { q: '', brand: '', model: '', year: '', cond: '', cust: '', view: 'table' };
    const brands = Array.from(new Set(S.vehicles.map((v) => v.brand))).sort();
    const years = Array.from(new Set(S.vehicles.map((v) => v.year))).sort().reverse();
    el.innerHTML = AC.shell.pageHead('Vehicles', S.vehicles.length + ' vehicles across ' + S.customers.length + ' customers', '<div class="seg" data-view><button class="active" data-value="table">' + AC.icon('list') + ' Table</button><button data-value="grid">' + AC.icon('grid') + ' Grid</button></div><button class="btn btn-outline" data-export>' + AC.icon('download') + 'Export</button>') +
      '<div class="chips mb-16" data-brandchips>' + ['All'].concat(brands).map((b) => '<button class="chip ' + (b === 'All' ? 'active' : '') + '" data-b="' + b + '">' + b + ' <span class="count">' + (b === 'All' ? S.vehicles.length : S.vehicles.filter((v) => v.brand === b).length) + '</span></button>').join('') + '</div>' +
      '<div class="card">' + AC.kit.toolbar({ placeholder: 'Search plate, VIN, model, owner…', filters: '<select class="select" data-model aria-label="Model"><option value="">All models</option></select>' + AC.ui.select('year', [{ value: '', label: 'All years' }].concat(years.map(String)), '', 'data-year aria-label="Year"') + AC.ui.select('cond', [{ value: '', label: 'Any service status' }].concat(CONDS), '', 'data-cond aria-label="Service status"') + AC.ui.select('cust', [{ value: '', label: 'All customers' }].concat(S.customers.map((c) => ({ value: c.id, label: c.name }))), '', 'data-cust aria-label="Customer"') }) + '<div data-t></div></div>';
    const wrap = el.querySelector('[data-t]');
    let t;
    const rows = () => st.s.vehicles.filter((v) => (!f.brand || v.brand === f.brand) && (!f.model || v.model === f.model) && (!f.year || String(v.year) === f.year) && (!f.cond || v.condition === f.cond) && (!f.cust || v.customerId === f.cust) && u.match([v.plate, v.vin, v.brand, v.model, (st.customer(v.customerId) || {}).name], f.q));
    function setup() {
      if (f.view === 'grid') { wrap.innerHTML = '<div class="veh-grid" style="padding:16px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))" data-g></div>'; t = null; return; }
      t = AC.kit.table(wrap, {
        per: 10, empty: ['car', 'No vehicles match', 'Adjust the filters above.'],
        columns: [
          { label: 'Vehicle', main: true, render: (v) => '<a href="#/vehicle/' + v.id + '">' + AC.kit.cellVehicle(v) + '</a>', sort: (v) => v.brand + v.model },
          { label: 'ID', render: (v) => '<span class="mono small">' + v.id + '</span>', sort: (v) => v.id },
          { label: 'Owner', render: (v) => { const c = st.customer(v.customerId); return c ? '<a class="link" href="#/customer/' + c.id + '">' + u.esc(c.name) + '</a>' : '—'; }, sort: (v) => (st.customer(v.customerId) || {}).name || '' },
          { label: 'Fuel / Trans.', render: (v) => '<span class="small">' + u.esc(v.fuel) + ' · ' + u.esc(v.transmission || '') + '</span>' },
          { label: 'Mileage', cls: 'num', render: (v) => u.km(v.mileage), sort: (v) => v.mileage },
          { label: 'Last Service', render: (v) => '<span class="small nowrap">' + u.fmtDate(v.lastService) + '</span>', sort: (v) => v.lastService || '' },
          { label: 'Next Service', render: (v) => { const d = v.nextService ? u.daysBetween(u.today(), v.nextService) : null; return '<span class="small nowrap ' + (d !== null && d < 0 ? 'text-red strong' : d !== null && d < 30 ? 'text-orange strong' : '') + '">' + u.fmtDate(v.nextService) + '</span>'; }, sort: (v) => v.nextService || '' },
          { label: 'Status', render: (v) => AC.ui.badge(v.condition), sort: (v) => v.condition },
          { label: '', cls: 'text-right', render: (v) => '<div class="actions"><a class="btn btn-outline btn-sm" href="#/vehicle/' + v.id + '">View</a></div>' }
        ]
      });
    }
    function draw(keep) {
      const list = rows();
      if (t) t.set(list, keep);
      else wrap.querySelector('[data-g]').innerHTML = list.map((v) => { const c = st.customer(v.customerId); return '<a class="card card-hover veh-card" href="#/vehicle/' + v.id + '"><div class="veh-media" style="padding-top:34px">' + AC.ui.badge(v.condition) + '<span class="plate">' + v.plate + '</span>' + AC.art.car({ body: v.body, color: v.colorHex }) + '</div><div class="veh-body"><div><div class="strong">' + u.esc(st.vName(v)) + '</div><div class="small muted">' + u.esc(c ? c.name : '') + ' · ' + u.km(v.mileage) + '</div></div></div></a>'; }).join('') || AC.ui.empty('car', 'No vehicles match', '');
    }
    const fillModels = () => { const ms = Array.from(new Set(st.s.vehicles.filter((v) => !f.brand || v.brand === f.brand).map((v) => v.model))).sort(); el.querySelector('[data-model]').innerHTML = '<option value="">All models</option>' + ms.map((m) => '<option>' + u.esc(m) + '</option>').join(''); f.model = ''; };
    fillModels(); setup();
    AC.ui.tabs(el.querySelector('[data-view]'), (v) => { f.view = v; setup(); draw(); });
    el.querySelector('[data-brandchips]').addEventListener('click', (e) => { const c = e.target.closest('[data-b]'); if (!c) return; f.brand = c.dataset.b === 'All' ? '' : c.dataset.b; el.querySelectorAll('[data-brandchips] .chip').forEach((x) => x.classList.toggle('active', x === c)); fillModels(); draw(); });
    el.querySelector('[data-q]').addEventListener('input', u.debounce((e) => { f.q = e.target.value.trim(); draw(); }, 150));
    [['model', 'model'], ['year', 'year'], ['cond', 'cond'], ['cust', 'cust']].forEach(([s, k]) => (el.querySelector('[data-' + s + ']').onchange = (e) => { f[k] = e.target.value; draw(); }));
    el.querySelector('[data-export]').onclick = () => AC.kit.csv('vehicles', ['Vehicle ID', 'Plate', 'Make', 'Model', 'Year', 'Variant', 'Engine', 'Transmission', 'Fuel', 'Color', 'Mileage', 'VIN', 'Owner', 'Last Service', 'Next Service', 'Status'], rows().map((v) => [v.id, v.plate, v.brand, v.model, v.year, v.variant, v.engine, v.transmission, v.fuel, v.color, v.mileage, v.vin, (st.customer(v.customerId) || {}).name, v.lastService, v.nextService, v.condition]));
    draw();
  };

  AC.adminViews.vehicle = function (el, params) {
    const v = st.vehicle(params[0]);
    if (!v) { el.innerHTML = AC.ui.empty('car', 'Vehicle not found', '', '<a class="btn btn-primary mt-8" href="#/vehicles">Back</a>'); return; }
    const c = st.customer(v.customerId), S = st.s, cat = VD.find(v.brand, v.model) || {};
    const recs = S.records.filter((r) => r.vehicleId === v.id), wos = S.workOrders.filter((w) => w.vehicleId === v.id);
    el.innerHTML = AC.shell.pageHead(u.esc(st.vName(v)), u.esc(v.variant || '') + ' · ' + v.id, '<button class="btn btn-outline" data-edit>' + AC.icon('edit') + 'Update</button><a class="btn btn-primary" href="#/appointments?new=1">' + AC.icon('calendar') + 'Book Service</a>', [['Vehicles', '#/vehicles'], [v.plate]]) +
      '<div class="card veh-hero"><div class="media">' + AC.art.car({ body: v.body, color: v.colorHex }) + '</div><div class="info"><div class="flex gap-8 wrap mb-16"><span class="plate">' + v.plate + '</span>' + AC.ui.badge(v.condition) + '</div>' +
      '<dl class="kv"><dt>Owner</dt><dd><a class="link" href="#/customer/' + c.id + '">' + u.esc(c.name) + '</a> · ' + u.esc(c.phone) + '</dd><dt>Engine</dt><dd>' + u.esc(v.engine || '—') + '</dd><dt>Transmission</dt><dd>' + u.esc(v.transmission || '—') + '</dd><dt>Fuel</dt><dd>' + u.esc(v.fuel) + '</dd><dt>Color</dt><dd>' + u.esc(v.color) + '</dd><dt>Mileage</dt><dd>' + u.km(v.mileage) + '</dd><dt>VIN</dt><dd class="mono">' + u.esc(v.vin || '—') + '</dd><dt>Registered</dt><dd>' + u.fmtDate(v.regDate) + '</dd>' +
      '<dt>OEM Fitment</dt><dd class="mono">' + (cat.tire || '—') + ' · ' + (cat.pcd || '') + ' · CB ' + (cat.cb || '') + '</dd><dt>Last / Next</dt><dd>' + u.fmtDate(v.lastService) + ' → <b>' + u.fmtDate(v.nextService) + '</b></dd></dl></div></div>' +
      '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('clipboard') + 'Work Orders <span class="badge">' + wos.length + '</span></div></div>' +
      (wos.length ? wos.map((w) => '<a class="mini-row" href="#/workorder/' + w.id + '"><span class="mono strong small">' + w.id + '</span><div class="grow" style="min-width:0"><div class="truncate">' + u.esc(w.service) + '</div><div class="xs muted">' + u.fmtDateTime(w.started) + ' · ' + u.esc(st.techName(w.techId)) + '</div></div>' + AC.ui.badge(w.status) + '<b class="small">' + u.peso(w.final || w.estimate) + '</b></a>').join('') : AC.ui.empty('clipboard', 'No work orders', '')) + '</div>' +
      '<div class="card section-gap"><div class="card-head"><div class="card-title">' + AC.icon('clock') + 'Complete Service History <span class="badge">' + recs.length + '</span></div><span class="small muted">Lifetime: <b style="color:var(--black)">' + u.peso(u.sum(recs, (r) => r.cost)) + '</b></span></div>' +
      (recs.length ? '<div class="table-wrap"><table class="table table-responsive"><thead><tr><th>Date</th><th>Service</th><th>Technician</th><th class="num">Mileage</th><th class="num">Cost</th><th>Invoice</th><th>Notes</th></tr></thead><tbody>' + recs.map((r) => '<tr><td data-label="Date" class="nowrap">' + u.fmtDate(r.date) + '</td><td data-label="Service">' + u.esc(r.service) + '</td><td data-label="Technician">' + u.esc(st.techName(r.techId)) + '</td><td data-label="Mileage" class="num">' + u.km(r.mileage) + '</td><td data-label="Cost" class="num">' + u.peso(r.cost) + '</td><td data-label="Invoice"><button class="link mono small" data-inv="' + r.id + '">' + r.invoice + '</button></td><td data-label="Notes" class="small muted">' + u.esc(r.notes || '—') + '</td></tr>').join('') + '</tbody></table></div>' : AC.ui.empty('clock', 'No service records yet', '')) + '</div>';
    el.querySelectorAll('[data-inv]').forEach((b) => (b.onclick = () => AC.docs.fromRecord(S.records.find((r) => r.id === b.dataset.inv))));
    el.querySelector('[data-edit]').onclick = () => {
      const m = AC.ui.modal({
        title: 'Update vehicle', sub: v.plate, body: '<form class="form-grid" data-f>' + AC.ui.field('Plate number', '<input class="input mono" name="plate" required value="' + u.esc(v.plate) + '">') + AC.ui.field('Mileage (km)', '<input class="input" type="number" name="mileage" required value="' + v.mileage + '">') +
          AC.ui.field('Service status', AC.ui.select('condition', CONDS, v.condition)) + AC.ui.field('Next recommended service', '<input class="input" type="date" name="nextService" value="' + (v.nextService || '') + '">') + AC.ui.field('Color', AC.ui.select('color', VD.COLORS.map((x) => x.name), v.color)) + AC.ui.field('VIN', '<input class="input mono" name="vin" value="' + u.esc(v.vin || '') + '">') + '</form>',
        foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>Save</button>'
      });
      m.el.querySelector('[data-s]').onclick = () => { const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return; st.updateVehicle(v.id, AC.ui.formData(f)); st.log('Staff', S.staff.name, 'Updated vehicle', v.plate); st.save(); m.close(); AC.ui.toast('Vehicle updated', null, 'success'); AC.router.refresh(); };
    };
  };
})();

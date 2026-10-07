/* =========================================================
   AUTOCARE — admin/services.js
   Service Management: service catalog (price, duration,
   availability), bookings & revenue per service, service
   bay utilization, add / edit / disable services.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

(function () {
  const u = AC.u, st = AC.store;
  const ICONS = ['wrench', 'droplet', 'disc', 'tire', 'target', 'wheel', 'battery', 'gauge', 'wind', 'spring', 'sparkles', 'paint', 'tint', 'zap', 'settings'];

  function form(s, onSave) {
    const isEdit = !!s; s = s || { icon: 'wrench', price: '', dur: 60, active: true };
    const m = AC.ui.modal({
      title: isEdit ? 'Edit service' : 'Add service', sub: isEdit ? s.id : 'New service offering',
      body: '<form class="form-grid" data-f novalidate>' + AC.ui.field('Service name <span class="req">*</span>', '<input class="input" name="name" required value="' + u.esc(s.name || '') + '">', 'span-2') +
        AC.ui.field('Short name', '<input class="input" name="short" value="' + u.esc(s.short || '') + '">') + AC.ui.field('Icon', AC.ui.select('icon', ICONS, s.icon)) +
        AC.ui.field('Base price (₱) <span class="req">*</span>', '<input class="input" type="number" min="0" name="price" required value="' + s.price + '">') + AC.ui.field('Duration (minutes) <span class="req">*</span>', '<input class="input" type="number" min="15" step="15" name="dur" required value="' + s.dur + '">') +
        AC.ui.field('Description', '<textarea class="textarea" name="desc" style="min-height:70px">' + u.esc(s.desc || '') + '</textarea>', 'span-2') +
        '<label class="switch span-2"><input type="checkbox" name="active" ' + (s.active !== false ? 'checked' : '') + '><span class="switch-track"></span><span>Available for online booking</span></label></form>',
      foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>' + (isEdit ? 'Save changes' : 'Add service') + '</button>'
    });
    m.el.querySelector('[data-s]').onclick = () => {
      const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return;
      const d = AC.ui.formData(f); d.price = +d.price; d.dur = +d.dur; d.active = f.active.checked; d.short = d.short || d.name;
      m.close(); onSave(d);
    };
  }

  AC.adminViews.services = function (el) {
    const S = st.s, T = u.today();
    function render() {
      const svcs = AC.data.services;
      const booked = (id) => S.appointments.filter((a) => a.serviceId === id).length;
      const rev = (id) => u.sum(S.records.filter((r) => r.serviceId === id), (r) => r.cost);
      const today = S.appointments.filter((a) => a.date === T && a.status !== 'Cancelled');
      const bayMins = u.sum(today, (a) => (st.service(a.serviceId) || { dur: 60 }).dur);
      const util = Math.min(100, Math.round(bayMins / (8 * 9 * 60) * 100));
      el.innerHTML = AC.shell.pageHead('Service Management', 'Configure services, pricing and capacity.', '<a class="btn btn-outline" href="#/workorders">' + AC.icon('clipboard') + 'Work Orders</a><button class="btn btn-primary" data-add>' + AC.icon('plus') + 'Add Service</button>') +
        '<div class="grid-4 mb-20">' +
        AC.ui.statCard({ label: 'Active services', value: svcs.filter((s) => s.active !== false).length + ' / ' + svcs.length, icon: 'wrench', foot: 'Bookable online' }) +
        AC.ui.statCard({ label: 'Jobs today', value: today.length, icon: 'calendar', foot: Math.round(bayMins / 60) + ' bay-hours scheduled' }) +
        AC.ui.statCard({ label: 'Bay utilization', value: util + '%', icon: 'gauge', foot: '8 bays · 9-hour shift' }) +
        AC.ui.statCard({ label: 'Avg. ticket', value: u.peso(Math.round(u.sum(S.records, (r) => r.cost) / Math.max(1, S.records.length))), icon: 'wallet', foot: 'Per completed service' }) + '</div>' +
        '<div class="grid-main-side" style="grid-template-columns:minmax(0,1fr) 340px"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('list') + 'Service Catalog</div><div class="searchbar" style="width:220px">' + AC.icon('search') + '<input class="input input-sm" placeholder="Filter…" data-q aria-label="Filter services"></div></div><div data-t></div></div>' +
        '<div class="col gap-20"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('gauge') + 'Bay utilization today</div></div><div class="card-body">' +
        [1, 2, 3, 4, 5, 6, 7, 8].map((b) => { const p = Math.min(100, Math.round(((u.hash(T + b) % 70) + (today[b - 1] ? 30 : 0)))); return '<div class="flex items-center gap-12 mb-12"><span class="small strong" style="width:48px">Bay ' + b + '</span><div class="progress grow"><div class="progress-bar ' + (p > 85 ? 'orange' : 'dark') + '" style="width:' + p + '%"></div></div><span class="small muted" style="width:36px;text-align:right">' + p + '%</span></div>'; }).join('') + '</div></div>' +
        '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('award') + 'Top services by revenue</div></div><div class="card-body" id="svc-top"></div></div></div></div>';
      const t = AC.kit.table(el.querySelector('[data-t]'), {
        per: 20, columns: [
          { label: 'Service', main: true, render: (s) => '<div class="cell-main"><div class="stat-icon" style="width:36px;height:36px">' + AC.icon(s.icon) + '</div><div style="min-width:0"><div class="cell-title">' + u.esc(s.name) + '</div><div class="cell-sub truncate" style="max-width:280px">' + u.esc(s.desc || '') + '</div></div></div>', sort: (s) => s.name },
          { label: 'Price', cls: 'num', render: (s) => '<b>' + u.peso(s.price) + '</b>', sort: (s) => s.price },
          { label: 'Duration', cls: 'num', render: (s) => (s.dur >= 60 ? (s.dur / 60).toFixed(s.dur % 60 ? 1 : 0) + ' hr' : s.dur + ' min'), sort: (s) => s.dur },
          { label: 'Bookings', cls: 'num', render: (s) => booked(s.id), sort: (s) => booked(s.id) },
          { label: 'Revenue', cls: 'num', render: (s) => u.peso(rev(s.id)), sort: (s) => rev(s.id) },
          { label: 'Online', render: (s) => '<label class="switch"><input type="checkbox" data-tog="' + s.id + '" ' + (s.active !== false ? 'checked' : '') + ' aria-label="Available online"><span class="switch-track"></span></label>' },
          { label: '', cls: 'text-right', render: (s) => '<div class="actions"><button class="btn btn-ghost btn-sm" data-edit="' + s.id + '">' + AC.icon('edit') + 'Edit</button></div>' }
        ]
      });
      const draw = (q) => t.set(svcs.filter((s) => u.match([s.name, s.desc], q)));
      draw('');
      el.querySelector('[data-q]').addEventListener('input', (e) => draw(e.target.value.trim()));
      AC.charts.hbars(el.querySelector('#svc-top'), svcs.map((s) => ({ label: s.short || s.name, value: rev(s.id) })).sort((a, b) => b.value - a.value).slice(0, 6), { format: u.pesoShort });
    }
    el.addEventListener('change', (e) => { const tg = e.target.closest('[data-tog]'); if (tg) { const s = st.service(tg.dataset.tog); s.active = tg.checked; st.log('Admin', S.staff.name, (s.active ? 'Enabled' : 'Disabled') + ' online booking', s.name); st.save(); AC.ui.toast(s.name + (s.active ? ' is bookable' : ' hidden from booking'), null, 'success'); } });
    el.addEventListener('click', (e) => {
      const ed = e.target.closest('[data-edit]'); if (ed) { const s = st.service(ed.dataset.edit); form(s, (d) => { Object.assign(s, d); st.log('Admin', S.staff.name, 'Updated service pricing', s.name); st.save(); AC.ui.toast('Service updated', s.name + ' · ' + u.peso(s.price), 'success'); render(); }); }
      if (e.target.closest('[data-add]')) form(null, (d) => { d.id = 'SV-' + d.short.replace(/[^A-Za-z]/g, '').slice(0, 5).toUpperCase() + Math.floor(Math.random() * 90 + 10); AC.data.services.push(d); st.log('Admin', S.staff.name, 'Added service', d.name); st.save(); AC.ui.toast('Service added', d.name, 'success'); render(); });
    });
    render();
  };
})();

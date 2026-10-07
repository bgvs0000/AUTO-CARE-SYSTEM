/* =========================================================
   AUTOCARE — admin/admin-kit.js
   Admin helpers: data table (search-ready, sortable,
   paginated, responsive), CSV export, row action menus.
   ========================================================= */
window.AC = window.AC || {};
AC.adminViews = AC.adminViews || {};

AC.kit = (function () {
  const u = AC.u;

  /* Data table
     opts: { columns:[{label, render(r), sort(r)?, cls?, main?}], per, empty:[icon,title,text], rowAttr(r) } */
  function table(container, opts) {
    const state = { rows: [], page: 1, sortI: -1, dir: 1 };
    container.innerHTML = '<div class="table-wrap"><table class="table table-responsive"><thead><tr>' +
      opts.columns.map((c, i) => '<th class="' + (c.cls || '') + (c.sort ? ' sortable' : '') + '" data-si="' + i + '">' + c.label + (c.sort ? ' <span data-arrow></span>' : '') + '</th>').join('') +
      '</tr></thead><tbody></tbody></table></div><div class="card-foot" data-pager></div>';
    const tbody = container.querySelector('tbody'), pager = container.querySelector('[data-pager]');
    function draw() {
      let rows = state.rows.slice();
      if (state.sortI > -1) {
        const fn = opts.columns[state.sortI].sort;
        rows.sort((a, b) => { const x = fn(a), y = fn(b); return (x > y ? 1 : x < y ? -1 : 0) * state.dir; });
      }
      const p = AC.ui.paginate(rows, state.page, opts.per || 10);
      state.page = p.page;
      tbody.innerHTML = p.rows.length ? p.rows.map((r) => '<tr ' + (opts.rowAttr ? opts.rowAttr(r) : '') + '>' + opts.columns.map((c) =>
        '<td class="' + (c.cls || '') + (c.main ? ' td-main' : '') + '" data-label="' + (c.main ? '' : u.esc(c.label.replace(/<[^>]+>/g, ''))) + '">' + c.render(r) + '</td>').join('') + '</tr>').join('') :
        '<tr><td colspan="' + opts.columns.length + '">' + AC.ui.empty.apply(null, opts.empty || ['inbox', 'No records found', 'Try adjusting your search or filters.']) + '</td></tr>';
      pager.innerHTML = AC.ui.pager(p);
      container.querySelectorAll('[data-arrow]').forEach((a) => (a.textContent = ''));
      if (state.sortI > -1) { const a = container.querySelector('th[data-si="' + state.sortI + '"] [data-arrow]'); if (a) a.textContent = state.dir > 0 ? '↑' : '↓'; }
    }
    container.querySelector('thead').addEventListener('click', (e) => {
      const th = e.target.closest('th.sortable'); if (!th) return;
      const i = +th.dataset.si;
      state.dir = state.sortI === i ? -state.dir : 1; state.sortI = i; draw();
    });
    pager.addEventListener('click', (e) => { const b = e.target.closest('[data-page]'); if (b && !b.disabled) { state.page = +b.dataset.page; draw(); } });
    return { set(rows, keepPage) { state.rows = rows; if (!keepPage) state.page = 1; draw(); }, redraw: draw };
  }

  /* Row "more" menu */
  function menu(items) {
    return '<div class="dropdown"><button class="icon-btn" style="width:32px;height:32px" data-dropdown aria-label="More actions">' + AC.icon('more') + '</button><div class="dropdown-menu">' +
      items.map((it) => it === '-' ? '<div class="dropdown-sep"></div>' : '<button class="dropdown-item ' + (it.danger ? 'danger' : '') + '" ' + it.attr + '>' + AC.icon(it.icon) + it.label + '</button>').join('') + '</div></div>';
  }

  function csv(name, header, rows) {
    const esc = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const text = [header.map(esc).join(',')].concat(rows.map((r) => r.map(esc).join(','))).join('\r\n');
    const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name + '-' + u.today() + '.csv';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    AC.ui.toast('Export ready', a.download + ' downloaded.', 'success');
  }

  function toolbar(o) {
    return '<div class="toolbar"><div class="searchbar">' + AC.icon('search') + '<input class="input" placeholder="' + (o.placeholder || 'Search…') + '" data-q aria-label="Search"></div>' + (o.filters || '') +
      '<div class="flex gap-8 ml-auto">' + (o.right || '') + '</div></div>';
  }

  function cellUser(name, sub) {
    return '<div class="cell-main">' + AC.ui.avatar(name, 'sm') + '<div style="min-width:0"><div class="cell-title truncate">' + u.esc(name) + '</div>' + (sub ? '<div class="cell-sub truncate">' + sub + '</div>' : '') + '</div></div>';
  }
  function cellVehicle(v) {
    if (!v) return '—';
    return '<div class="cell-main"><div class="thumb" style="width:58px;height:38px">' + AC.art.car({ body: v.body, color: v.colorHex }) + '</div><div style="min-width:0"><div class="cell-title truncate">' + u.esc(v.year + ' ' + v.brand + ' ' + v.model) + '</div><div class="cell-sub"><span class="plate sm">' + u.esc(v.plate) + '</span></div></div></div>';
  }

  return { table, menu, csv, toolbar, cellUser, cellVehicle };
})();

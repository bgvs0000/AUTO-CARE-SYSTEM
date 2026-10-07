/* =========================================================
   AUTOCARE — core/ui.js
   Utilities (AC.u) + UI primitives (AC.ui):
   toast, modal, confirm, dropdown, tabs, pagination,
   badges, avatars, empty/loading states, form helpers
   ========================================================= */
window.AC = window.AC || {};

/* ---------------- Utilities ---------------- */
AC.u = (function () {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTHS_L = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const pad = (n) => String(n).padStart(2, '0');

  const u = {
    MONTHS, MONTHS_L, DAYS, pad,
    $: (s, r) => (r || document).querySelector(s),
    $$: (s, r) => Array.from((r || document).querySelectorAll(s)),
    esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },
    peso(n, dec) {
      const v = Number(n || 0);
      return '₱' + v.toLocaleString('en-PH', { minimumFractionDigits: dec ? 2 : 0, maximumFractionDigits: dec ? 2 : 0 });
    },
    pesoShort(n) {
      const v = Number(n || 0);
      if (v >= 1e6) return '₱' + (v / 1e6).toFixed(v >= 1e7 ? 1 : 2).replace(/\.0+$/, '') + 'M';
      if (v >= 1e3) return '₱' + (v / 1e3).toFixed(v >= 1e5 ? 0 : 1).replace(/\.0$/, '') + 'K';
      return '₱' + v;
    },
    num(n) { return Number(n || 0).toLocaleString('en-PH'); },
    km(n) { return u.num(n) + ' km'; },
    toDate(iso) {
      if (iso instanceof Date) return iso;
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); }
      return new Date(iso);
    },
    iso(d) { d = d || new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); },
    today() { return u.iso(new Date()); },
    addDays(iso, n) { const d = u.toDate(iso); d.setDate(d.getDate() + n); return u.iso(d); },
    addMonths(iso, n) { const d = u.toDate(iso); d.setMonth(d.getMonth() + n); return u.iso(d); },
    dateTime(iso, hhmm) { const d = u.toDate(iso); const [h, m] = (hhmm || '09:00').split(':').map(Number); d.setHours(h, m, 0, 0); return d.toISOString(); },
    fmtDate(iso, style) {
      if (!iso) return '—';
      const d = u.toDate(iso);
      if (isNaN(d)) return '—';
      if (style === 'long') return MONTHS_L[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
      if (style === 'day') return DAYS[d.getDay()] + ', ' + MONTHS[d.getMonth()] + ' ' + d.getDate();
      if (style === 'md') return MONTHS[d.getMonth()] + ' ' + d.getDate();
      return MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    },
    fmtTime(hhmm) {
      if (!hhmm) return '—';
      if (hhmm.indexOf('T') > -1) { const d = new Date(hhmm); hhmm = pad(d.getHours()) + ':' + pad(d.getMinutes()); }
      let [h, m] = hhmm.split(':').map(Number);
      const ap = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12;
      return h + ':' + pad(m) + ' ' + ap;
    },
    fmtDateTime(isoStr) { const d = new Date(isoStr); return u.fmtDate(u.iso(d)) + ', ' + u.fmtTime(pad(d.getHours()) + ':' + pad(d.getMinutes())); },
    relTime(isoStr) {
      const d = new Date(isoStr), diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return 'Just now';
      if (diff < 3600) return Math.floor(diff / 60) + ' min ago';
      const todayIso = u.today(), dIso = u.iso(d);
      const t = u.fmtTime(pad(d.getHours()) + ':' + pad(d.getMinutes()));
      if (dIso === todayIso) return 'Today, ' + t;
      if (dIso === u.addDays(todayIso, -1)) return 'Yesterday, ' + t;
      if (diff < 86400 * 7) return DAYS[d.getDay()] + ', ' + t;
      return u.fmtDate(dIso) + ', ' + t;
    },
    daysBetween(a, b) { return Math.round((u.toDate(b) - u.toDate(a)) / 86400000); },
    initials(name) { return String(name || '?').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase(); },
    hash(str) { let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return Math.abs(h); },
    rng(seed) { let a = seed >>> 0; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; },
    debounce(fn, ms) { let t; return function () { const a = arguments, c = this; clearTimeout(t); t = setTimeout(() => fn.apply(c, a), ms || 200); }; },
    uid(prefix) { return (prefix || 'ID') + '-' + Date.now().toString(36).slice(-5).toUpperCase() + Math.floor(Math.random() * 90 + 10); },
    sum(arr, fn) { return arr.reduce((s, x) => s + (fn ? fn(x) : x), 0); },
    groupBy(arr, fn) { return arr.reduce((m, x) => { const k = fn(x); (m[k] = m[k] || []).push(x); return m; }, {}); },
    clamp(n, a, b) { return Math.max(a, Math.min(b, n)); },
    match(obj, q) { if (!q) return true; q = q.toLowerCase(); return JSON.stringify(obj).toLowerCase().indexOf(q) > -1; },
    sleep(ms) { return new Promise((r) => setTimeout(r, ms)); },
    qsParam(name) { const h = location.hash.split('?')[1] || ''; return new URLSearchParams(h).get(name); }
  };
  return u;
})();

/* ---------------- UI primitives ---------------- */
AC.ui = (function () {
  const u = AC.u;
  const STATUS = {
    blue: ['Approved', 'Confirmed', 'Processing', 'In Progress', 'Inspection', 'Diagnosis', 'Scheduled', 'On Job', 'Ready for Pickup', 'Out for Delivery', 'Quality Check', 'Rescheduled', 'Service In Progress', 'Vehicle Received', 'New', 'Upcoming', 'Partially Paid', 'Running'],
    green: ['Completed', 'Paid', 'In Stock', 'Active', 'Available', 'Delivered', 'Good Condition', 'Ready for Release', 'Released', 'Excellent', 'Published', 'Verified'],
    orange: ['Pending', 'Low Stock', 'Service Due', 'Unpaid', 'Due Soon', 'Awaiting Parts', 'Draft', 'Needs Attention', 'Scheduled Promo'],
    red: ['Cancelled', 'Out of Stock', 'Suspended', 'Overdue', 'Failed', 'Refunded', 'Expired', 'Inactive'],
    dark: ['In Service', 'VIP']
  };
  const MAP = {};
  Object.keys(STATUS).forEach((k) => STATUS[k].forEach((s) => { MAP[s.toLowerCase()] = k; }));

  function badge(status, extra) {
    const c = MAP[String(status).toLowerCase()] || 'gray';
    const pulse = ['In Progress', 'Service In Progress', 'Out for Delivery', 'In Service', 'Processing', 'On Job'].indexOf(status) > -1 ? ' pulse' : '';
    return '<span class="badge ' + (c === 'gray' ? '' : 'badge-' + c) + pulse + (extra ? ' ' + extra : '') + '">' + u.esc(status) + '</span>';
  }

  /* Toasts */
  let stack;
  function toast(title, msg, type, ms) {
    if (!stack) { stack = document.createElement('div'); stack.className = 'toast-stack'; stack.setAttribute('aria-live', 'polite'); document.body.appendChild(stack); }
    type = type || 'info'; ms = ms || 3400;
    const ic = { success: 'check-circle', error: 'x-circle', warning: 'alert', info: 'info' }[type] || 'info';
    const el = document.createElement('div');
    el.className = 'toast ' + type; el.setAttribute('role', 'status');
    el.innerHTML = '<div class="toast-ico">' + AC.icon(ic) + '</div><div class="grow"><div class="toast-title">' + u.esc(title) + '</div>' +
      (msg ? '<div class="toast-msg">' + u.esc(msg) + '</div>' : '') + '</div><button class="toast-close" aria-label="Dismiss">' + AC.icon('x') + '</button>' +
      '<div class="toast-bar" style="animation-duration:' + ms + 'ms"></div>';
    stack.appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 260); };
    const t = setTimeout(kill, ms);
    el.querySelector('.toast-close').onclick = () => { clearTimeout(t); kill(); };
    while (stack.children.length > 4) stack.firstChild.remove();
  }

  /* Modal */
  const openModals = [];
  function modal(o) {
    o = o || {};
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop';
    bd.innerHTML = '<div class="modal ' + (o.size ? 'modal-' + o.size : '') + '" role="dialog" aria-modal="true" aria-label="' + u.esc(o.title || 'Dialog') + '">' +
      (o.title ? '<div class="modal-head"><div><div class="modal-title">' + u.esc(o.title) + '</div>' + (o.sub ? '<div class="modal-sub">' + o.sub + '</div>' : '') + '</div>' +
        '<button class="icon-btn" data-close aria-label="Close">' + AC.icon('x') + '</button></div>' : '') +
      '<div class="modal-body">' + (o.body || '') + '</div>' +
      (o.foot ? '<div class="modal-foot">' + o.foot + '</div>' : '') + '</div>';
    document.body.appendChild(bd);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => bd.classList.add('show'));
    const api = {
      el: bd, body: bd.querySelector('.modal-body'),
      close() {
        if (!bd.isConnected) return;
        bd.classList.remove('show');
        setTimeout(() => { bd.remove(); if (!document.querySelector('.modal-backdrop')) document.body.style.overflow = ''; }, 220);
        const i = openModals.indexOf(api); if (i > -1) openModals.splice(i, 1);
        if (o.onClose) o.onClose();
      }
    };
    bd.addEventListener('mousedown', (e) => { if (e.target === bd && o.dismissible !== false) api.close(); });
    bd.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) api.close(); });
    openModals.push(api);
    if (o.onOpen) o.onOpen(bd, api);
    setTimeout(() => { const f = bd.querySelector('[autofocus], .modal-body input:not([type=hidden]), .modal-body select'); if (f && window.innerWidth > 640) f.focus(); }, 60);
    return api;
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openModals.length) openModals[openModals.length - 1].close(); });

  function confirm(o) {
    o = o || {};
    return new Promise((resolve) => {
      let done = false;
      const m = modal({
        size: 'sm',
        body: '<div class="confirm-ico ' + (o.danger ? 'danger' : '') + '">' + AC.icon(o.icon || (o.danger ? 'alert' : 'info')) + '</div>' +
          '<div class="modal-title">' + u.esc(o.title || 'Are you sure?') + '</div><p class="muted mt-8">' + (o.message || '') + '</p>',
        foot: '<button class="btn btn-outline" data-close>' + u.esc(o.cancelText || 'Cancel') + '</button>' +
          '<button class="btn ' + (o.danger ? 'btn-danger' : 'btn-primary') + '" data-ok>' + u.esc(o.confirmText || 'Confirm') + '</button>',
        onClose() { if (!done) resolve(false); }
      });
      m.el.querySelector('[data-ok]').onclick = () => { done = true; resolve(true); m.close(); };
    });
  }

  /* Dropdowns (delegated) */
  document.addEventListener('click', (e) => {
    const tog = e.target.closest('[data-dropdown]');
    const all = document.querySelectorAll('.dropdown.open');
    if (tog) {
      const dd = tog.closest('.dropdown');
      const wasOpen = dd.classList.contains('open');
      all.forEach((d) => d.classList.remove('open'));
      if (!wasOpen) dd.classList.add('open');
      tog.setAttribute('aria-expanded', String(!wasOpen));
      e.preventDefault();
      return;
    }
    if (!e.target.closest('.dropdown-menu') || e.target.closest('.dropdown-item')) all.forEach((d) => d.classList.remove('open'));
  });

  /* Tabs: container with .tab[data-tab] */
  function tabs(container, onChange) {
    container.addEventListener('click', (e) => {
      const t = e.target.closest('.tab, .seg button');
      if (!t || !container.contains(t)) return;
      const group = t.parentElement;
      group.querySelectorAll('.tab, button').forEach((x) => x.classList.toggle('active', x === t));
      onChange && onChange(t.dataset.tab || t.dataset.value, t);
    });
  }

  function paginate(rows, page, per) {
    per = per || 10;
    const pages = Math.max(1, Math.ceil(rows.length / per));
    page = u.clamp(page || 1, 1, pages);
    return { rows: rows.slice((page - 1) * per, page * per), page, pages, total: rows.length, from: rows.length ? (page - 1) * per + 1 : 0, to: Math.min(page * per, rows.length) };
  }
  function pager(p) {
    if (p.pages <= 1) return '<div class="small muted">Showing ' + p.total + ' result' + (p.total === 1 ? '' : 's') + '</div>';
    let h = '<div class="small muted">Showing ' + p.from + '–' + p.to + ' of ' + p.total + '</div><div class="pagination">';
    h += '<button class="page-btn" data-page="' + (p.page - 1) + '" ' + (p.page === 1 ? 'disabled' : '') + ' aria-label="Previous">' + AC.icon('chevron-left') + '</button>';
    for (let i = 1; i <= p.pages; i++) {
      if (p.pages > 7 && i > 2 && i < p.pages - 1 && Math.abs(i - p.page) > 1) { if (i === 3 || i === p.pages - 2) h += '<span class="muted-2 small">…</span>'; continue; }
      h += '<button class="page-btn ' + (i === p.page ? 'active' : '') + '" data-page="' + i + '">' + i + '</button>';
    }
    h += '<button class="page-btn" data-page="' + (p.page + 1) + '" ' + (p.page === p.pages ? 'disabled' : '') + ' aria-label="Next">' + AC.icon('chevron-right') + '</button></div>';
    return h;
  }

  function avatar(name, size) {
    return '<span class="avatar ' + (size ? 'avatar-' + size : '') + ' c' + (u.hash(name || '') % 6) + '" aria-hidden="true">' + u.initials(name) + '</span>';
  }
  function stars(r) {
    let h = '<span class="stars" aria-label="' + r + ' out of 5">';
    for (let i = 1; i <= 5; i++) h += AC.icon('star', i <= Math.round(r) ? 'on' : '');
    return h + '</span>';
  }
  function empty(icon, title, text, action) {
    return '<div class="empty"><div class="empty-ico">' + AC.icon(icon || 'inbox') + '</div><div class="empty-title">' + u.esc(title) + '</div>' +
      (text ? '<div class="empty-text">' + text + '</div>' : '') + (action || '') + '</div>';
  }
  function skeleton(rows) {
    let h = '<div class="card card-body">';
    for (let i = 0; i < (rows || 4); i++) h += '<div class="skeleton sk-line" style="width:' + (60 + (i * 13) % 40) + '%"></div>';
    return h + '</div>';
  }
  function formData(form) {
    const o = {};
    new FormData(form).forEach((v, k) => { o[k] = typeof v === 'string' ? v.trim() : v; });
    return o;
  }
  function validate(form) {
    let ok = true;
    form.querySelectorAll('[required]').forEach((el) => {
      const bad = !String(el.value || '').trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value));
      el.classList.toggle('is-invalid', bad);
      if (bad && ok) { el.focus(); ok = false; }
    });
    if (!ok) toast('Please complete the required fields', null, 'warning');
    return ok;
  }
  async function busy(btn, ms) {
    if (!btn) return u.sleep(ms || 600);
    btn.classList.add('is-loading');
    await u.sleep(ms || 650);
    btn.classList.remove('is-loading');
  }
  function select(name, options, value, attrs) {
    return '<select class="select" name="' + name + '" ' + (attrs || '') + '>' + options.map((o) => {
      const v = typeof o === 'object' ? o.value : o, l = typeof o === 'object' ? o.label : o;
      return '<option value="' + u.esc(v) + '"' + (String(v) === String(value) ? ' selected' : '') + '>' + u.esc(l) + '</option>';
    }).join('') + '</select>';
  }
  function field(label, inner, cls) {
    return '<div class="field ' + (cls || '') + '"><label class="label">' + label + '</label>' + inner + '</div>';
  }
  function statCard(o) {
    return '<div class="card card-hover stat">' +
      '<div class="stat-top"><div><div class="stat-label">' + o.label + '</div><div class="stat-value mt-8">' + o.value + '</div></div>' +
      '<div class="stat-icon">' + AC.icon(o.icon) + '</div></div>' +
      (o.foot !== undefined ? '<div class="stat-foot">' + (o.delta !== undefined ? '<span class="delta ' + (o.delta >= 0 ? 'up' : 'down') + '">' + AC.icon(o.delta >= 0 ? 'trending-up' : 'trending-down') + Math.abs(o.delta) + '%</span>' : '') + '<span>' + o.foot + '</span></div>' : '') +
      '</div>';
  }

  /* Reveal-on-scroll */
  function reveal(root) {
    const els = (root || document).querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
    const io = new IntersectionObserver((ents) => ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
    els.forEach((e) => io.observe(e));
  }

  /* Hydrate declarative icons: data-icon / data-icon-before / data-icon-after */
  function hydrate(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => { if (!el.dataset.hyd) { el.innerHTML = AC.icon(el.dataset.icon); el.dataset.hyd = 1; } });
    (root || document).querySelectorAll('[data-icon-before]').forEach((el) => { if (!el.dataset.hyd) { el.insertAdjacentHTML('afterbegin', AC.icon(el.dataset.iconBefore)); el.dataset.hyd = 1; } });
    (root || document).querySelectorAll('[data-icon-after]').forEach((el) => { if (!el.dataset.hyd) { el.insertAdjacentHTML('beforeend', AC.icon(el.dataset.iconAfter, el.dataset.iconAfter === 'arrow-right' ? 'i-arrow' : '')); el.dataset.hyd = 1; } });
  }

  return { badge, toast, modal, confirm, tabs, paginate, pager, avatar, stars, empty, skeleton, formData, validate, busy, select, field, statCard, reveal, hydrate, STATUS };
})();

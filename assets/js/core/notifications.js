/* =========================================================
   AUTOCARE — core/notifications.js
   Full-page notification center shared by the customer
   portal and the admin console (filter tabs, mark read).
   ========================================================= */
window.AC = window.AC || {};

(function () {
  const u = AC.u, st = AC.store;
  AC.notificationsView = function (el, aud) {
    let f = 'all';
    const ICON = { booking: ['calendar', 'blue'], stock: ['alert', 'orange'], order: ['bag', 'blue'], done: ['check-circle', 'green'], payment: ['wallet', 'green'], service: ['wrench', 'blue'], reminder: ['clock', 'orange'], promo: ['gift', ''] };
    el.innerHTML = AC.shell.pageHead('Notifications', 'All alerts and updates in one place.', '<button class="btn btn-outline" data-all>' + AC.icon('check') + 'Mark all as read</button>') +
      '<div class="card"><div class="tabs" style="padding:0 12px" data-tabs><button class="tab active" data-tab="all">All</button><button class="tab" data-tab="unread">Unread</button>' + Array.from(new Set(st.s.notifications[aud].map((n) => n.type))).map((t) => '<button class="tab" data-tab="' + t + '">' + t.charAt(0).toUpperCase() + t.slice(1) + '</button>').join('') + '</div><div data-list></div></div>';
    function render() {
      const list = st.s.notifications[aud].filter((n) => f === 'all' || (f === 'unread' ? !n.read : n.type === f));
      el.querySelector('[data-list]').innerHTML = list.length ? list.map((n) => { const ic = ICON[n.type] || ['bell', '']; return '<div class="notif-item ' + (n.read ? '' : 'unread') + '" style="padding:16px 20px"><span class="notif-ico ' + ic[1] + '">' + AC.icon(ic[0]) + '</span><span class="grow"><div class="notif-title">' + u.esc(n.title) + '</div><div class="notif-msg">' + u.esc(n.msg) + '</div><div class="notif-time">' + u.relTime(n.at) + '</div></span><span class="flex gap-4" style="margin-right:18px">' + (n.link ? '<a class="btn btn-ghost btn-sm" href="' + u.esc(n.link) + '" data-read="' + n.id + '">Open</a>' : '') + (n.read ? '' : '<button class="btn btn-ghost btn-sm" data-read="' + n.id + '">Mark read</button>') + '</span></div>'; }).join('') : AC.ui.empty('bell', 'Nothing here', 'You’re all caught up.');
    }
    AC.ui.tabs(el.querySelector('[data-tabs]'), (t) => { f = t; render(); });
    el.addEventListener('click', (e) => { const r = e.target.closest('[data-read]'); if (r) { st.markRead(aud, r.dataset.read); render(); } if (e.target.closest('[data-all]')) { st.markRead(aud); render(); AC.ui.toast('All caught up', null, 'success'); } });
    render();
  };
})();

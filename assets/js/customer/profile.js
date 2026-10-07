/* =========================================================
   AUTOCARE — customer/profile.js
   Customer profile (edit profile, change password, logout),
   account settings and the full notifications center.
   ========================================================= */
window.AC = window.AC || {};
AC.custViews = AC.custViews || {};

(function () {
  const u = AC.u, st = AC.store;

  AC.custViews.profile = function (el, params) {
    const me = AC.cust.me();
    const tab = params[0] === 'settings' ? 'settings' : 'overview';
    const vehicles = AC.cust.vehicles(), recs = AC.cust.records(), orders = AC.cust.orders();
    el.innerHTML = AC.shell.pageHead('My Profile', 'Manage your personal information and account security.') +
      '<div class="card"><div class="profile-cover"></div><div class="profile-main">' +
      '<div class="relative">' + AC.ui.avatar(me.name, 'xl') + '<button class="avatar-edit" data-photo aria-label="Change profile picture">' + AC.icon('camera') + '</button></div>' +
      '<div class="grow" style="padding-bottom:6px;min-width:200px"><div class="flex items-center gap-8 wrap"><h2 class="h3">' + u.esc(me.name) + '</h2>' + AC.ui.badge(me.status) + (me.tier === 'VIP' ? '<span class="badge badge-dark">VIP</span>' : '') + '</div><div class="muted small mt-4">' + me.id + ' · Member since ' + u.fmtDate(me.joined, 'long') + '</div></div>' +
      '<div class="btn-group" style="padding-bottom:6px"><button class="btn btn-outline" data-edit>' + AC.icon('edit') + 'Edit Profile</button><button class="btn btn-outline" data-pass>' + AC.icon('lock') + 'Change Password</button><button class="btn btn-danger-ghost" data-out>' + AC.icon('logout') + 'Logout</button></div></div>' +
      '<div class="tabs" style="padding:0 16px"><a class="tab ' + (tab === 'overview' ? 'active' : '') + '" href="#/profile">Overview</a><a class="tab ' + (tab === 'settings' ? 'active' : '') + '" href="#/profile/settings">Settings</a></div></div>' +
      '<div class="section-gap" data-tab></div>';
    const T = el.querySelector('[data-tab]');
    if (tab === 'overview') {
      T.innerHTML = '<div class="grid-main-side"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('user') + 'Personal Information</div></div><div class="card-body"><dl class="kv">' +
        '<dt>Full Name</dt><dd>' + u.esc(me.name) + '</dd><dt>Email</dt><dd>' + u.esc(me.email) + '</dd><dt>Phone</dt><dd>' + u.esc(me.phone) + '</dd><dt>Address</dt><dd>' + u.esc(me.address) + '</dd>' +
        '<dt>Registered Date</dt><dd>' + u.fmtDate(me.joined, 'long') + '</dd><dt>Account Status</dt><dd>' + AC.ui.badge(me.status) + '</dd><dt>Customer ID</dt><dd class="mono">' + me.id + '</dd></dl></div></div>' +
        '<div class="col gap-20"><div class="grid-3" style="grid-template-columns:repeat(3,1fr);gap:10px">' +
        [['Vehicles', vehicles.length, 'car'], ['Services', recs.length, 'wrench'], ['Orders', orders.length, 'bag']].map((x) => '<div class="card card-hover card-body text-center" style="padding:16px 8px"><div class="stat-icon" style="margin:0 auto 8px">' + AC.icon(x[2]) + '</div><div class="h3">' + x[1] + '</div><div class="xs muted">' + x[0] + '</div></div>').join('') + '</div>' +
        '<div class="card card-body"><div class="strong mb-8">' + AC.icon('award') + ' Loyalty points</div><div class="flex items-end gap-8"><div class="h2" style="font-size:30px">' + u.num(Math.round((u.sum(recs, (r) => r.cost) + u.sum(orders, (o) => o.total)) / 100)) + '</div><span class="muted mb-4">pts</span></div><div class="progress mt-12"><div class="progress-bar" style="width:68%"></div></div><div class="xs muted mt-8">1 point per ₱100 spent · redeem on your next PMS</div></div></div></div>';
    } else {
      const pref = (k, label, sub, on) => '<div class="list-row"><div class="grow"><div class="strong">' + label + '</div><div class="small muted">' + sub + '</div></div><label class="switch"><input type="checkbox" data-pref="' + k + '"' + (on ? ' checked' : '') + '><span class="switch-track"></span></label></div>';
      T.innerHTML = '<div class="grid-2"><div class="card"><div class="card-head"><div class="card-title">' + AC.icon('bell') + 'Notification preferences</div></div><div class="card-body" style="padding-top:4px;padding-bottom:4px">' +
        pref('svc', 'Service status updates', 'Each stage of your vehicle’s service', true) + pref('rem', 'Maintenance reminders', 'PMS and due-date reminders', true) + pref('ord', 'Order updates', 'Confirmation, shipping and delivery', true) + pref('promo', 'Promotions', 'Deals on tires, mags and services', false) + pref('sms', 'SMS notifications', 'Text alerts to ' + u.esc(me.phone), true) + '</div></div>' +
        '<div class="card"><div class="card-head"><div class="card-title">' + AC.icon('shield') + 'Security</div></div><div class="card-body" style="padding-top:4px;padding-bottom:4px">' +
        pref('2fa', 'Two-step verification', 'Require a code when logging in on a new device', false) +
        '<div class="list-row"><div class="grow"><div class="strong">Password</div><div class="small muted">Last changed 3 months ago</div></div><button class="btn btn-outline btn-sm" data-pass>Change</button></div>' +
        '<div class="list-row"><div class="grow"><div class="strong">Active sessions</div><div class="small muted">This browser · Metro Manila, PH</div></div><button class="btn btn-ghost btn-sm" data-signout-all>Sign out others</button></div>' +
        '<div class="list-row"><div class="grow"><div class="strong text-red">Delete account</div><div class="small muted">Permanently remove your data</div></div><button class="btn btn-danger-ghost btn-sm" data-delacc>Delete</button></div></div></div></div>' +
        '<div class="card section-gap card-body flex between items-center wrap gap-12"><div><div class="strong">Reset demo data</div><div class="small muted">Restore all demo customers, vehicles, orders and bookings.</div></div><button class="btn btn-outline" data-reset>' + AC.icon('refresh') + 'Reset demo</button></div>';
      T.querySelectorAll('[data-pref]').forEach((c) => (c.onchange = () => AC.ui.toast('Preference saved', c.closest('.list-row').querySelector('.strong').textContent + ' ' + (c.checked ? 'on' : 'off'), 'success')));
      T.querySelector('[data-signout-all]').onclick = () => AC.ui.toast('Other sessions signed out', null, 'success');
      T.querySelector('[data-delacc]').onclick = () => AC.ui.confirm({ title: 'Delete your account?', message: 'This is disabled in the demo.', danger: true, confirmText: 'I understand' });
      T.querySelector('[data-reset]').onclick = async () => { if (await AC.ui.confirm({ title: 'Reset all demo data?', message: 'Your changes (bookings, orders, vehicles, cart) will be cleared.', danger: true, confirmText: 'Reset' })) { st.reset(); location.reload(); } };
    }

    el.querySelectorAll('[data-edit]').forEach((b) => (b.onclick = () => {
      const m = AC.ui.modal({
        title: 'Edit profile', body: '<form class="form-grid" data-f novalidate>' + AC.ui.field('Full Name', '<input class="input" name="name" required value="' + u.esc(me.name) + '">', 'span-2') +
          AC.ui.field('Email', '<input class="input" type="email" name="email" required value="' + u.esc(me.email) + '">') + AC.ui.field('Phone', '<input class="input" name="phone" required value="' + u.esc(me.phone) + '">') +
          AC.ui.field('Address', '<textarea class="textarea" name="address" style="min-height:70px">' + u.esc(me.address) + '</textarea>', 'span-2') + '</form>',
        foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>Save changes</button>'
      });
      m.el.querySelector('[data-s]').onclick = async (e) => { const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return; await AC.ui.busy(e.currentTarget, 500); Object.assign(me, AC.ui.formData(f)); st.save(); m.close(); AC.ui.toast('Profile updated', null, 'success'); AC.router.refresh(); };
    }));
    el.querySelectorAll('[data-pass]').forEach((b) => (b.onclick = () => {
      const m = AC.ui.modal({
        title: 'Change password', size: 'sm', body: '<form class="col gap-12" data-f novalidate>' + AC.ui.field('Current password', '<input class="input" type="password" name="cur" required>') + AC.ui.field('New password', '<input class="input" type="password" name="np" required minlength="8">') + AC.ui.field('Confirm new password', '<input class="input" type="password" name="cp" required>') + '</form>',
        foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-s>Update password</button>'
      });
      m.el.querySelector('[data-s]').onclick = async (e) => {
        const f = m.el.querySelector('[data-f]'); if (!AC.ui.validate(f)) return;
        if (f.np.value.length < 8) return AC.ui.toast('Use at least 8 characters', null, 'warning');
        if (f.np.value !== f.cp.value) { f.cp.classList.add('is-invalid'); return AC.ui.toast('Passwords do not match', null, 'warning'); }
        await AC.ui.busy(e.currentTarget, 600); me.password = f.np.value; st.save(); m.close(); AC.ui.toast('Password updated', 'Use your new password next time you log in.', 'success');
      };
    }));
    el.querySelector('[data-out]').onclick = () => document.querySelector('.sidebar [data-logout]').click();
    el.querySelector('[data-photo]').onclick = () => AC.ui.toast('Upload a photo', 'Profile photo upload is simulated in this demo.', 'info');
  };

  AC.custViews.notifications = (el) => AC.notificationsView(el, 'customer');
})();

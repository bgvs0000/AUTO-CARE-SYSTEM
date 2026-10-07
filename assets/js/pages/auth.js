/* =========================================================
   AUTOCARE — pages/auth.js
   Customer login, customer registration and secure
   admin login (with demo 2-step verification).
   ========================================================= */
(function () {
  const u = AC.u, ui = AC.ui, S = AC.store.s;
  const DEMO_PASS = 'autocare123';

  ui.hydrate();
  u.$$('[data-logo]').forEach((el) => (el.innerHTML = AC.logo()));
  u.$$('[data-logo-light]').forEach((el) => (el.innerHTML = AC.logo(true)));
  u.$$('[data-auth-car]').forEach((el) => (el.innerHTML = AC.art.car({ body: el.dataset.body || 'suv', color: '#d9dee5', hero: true })));

  /* Password visibility */
  u.$$('[data-pw]').forEach((b) => {
    b.innerHTML = AC.icon('eye');
    b.onclick = () => {
      const inp = b.parentElement.querySelector('input');
      const show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      b.innerHTML = AC.icon(show ? 'eye-off' : 'eye');
      b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    };
  });

  /* ---------- Customer login ---------- */
  const login = u.$('[data-login]');
  if (login) {
    const sess = AC.session.get();
    if (sess.customer && sess.customer.remember) {
      const c = AC.store.customer(sess.customer.id);
      if (c) login.email.value = c.email;
    }
    login.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!ui.validate(login)) return;
      const email = login.email.value.trim().toLowerCase();
      const c = S.customers.find((x) => x.email.toLowerCase() === email);
      const btn = login.querySelector('[type=submit]');
      await ui.busy(btn, 700);
      if (!c || (login.password.value !== DEMO_PASS && login.password.value !== c.password)) {
        login.password.classList.add('is-invalid');
        ui.toast('Invalid email or password', 'Use the demo account shown below.', 'error');
        return;
      }
      if (c.status === 'Suspended') { ui.toast('Account suspended', 'Please contact AutoCare support.', 'error'); return; }
      AC.session.loginCustomer(c.id, login.remember.checked);
      ui.toast('Welcome back, ' + c.name.split(' ')[0] + '!', 'Redirecting to your dashboard…', 'success');
      setTimeout(() => (location.href = 'customer.html'), 650);
    });
    u.$('[data-forgot]').onclick = (e) => {
      e.preventDefault();
      const m = ui.modal({
        title: 'Reset your password', sub: 'We’ll email you a secure reset link.', size: 'sm',
        body: '<form data-reset novalidate>' + ui.field('Email address', '<input class="input" type="email" name="email" required placeholder="you@email.com" value="' + u.esc(login.email.value) + '">') + '</form>',
        foot: '<button class="btn btn-outline" data-close>Cancel</button><button class="btn btn-primary" data-send>Send reset link</button>'
      });
      m.el.querySelector('[data-send]').onclick = async (ev) => {
        const f = m.el.querySelector('[data-reset]');
        if (!ui.validate(f)) return;
        await ui.busy(ev.currentTarget, 700);
        m.close();
        ui.toast('Reset link sent', 'Check ' + f.email.value + ' for instructions.', 'success');
      };
    };
    u.$$('[data-social]').forEach((b) => (b.onclick = () => ui.toast('Social login is not enabled in the demo', 'Please use the demo account.', 'info')));
  }

  /* ---------- Registration ---------- */
  const reg = u.$('[data-register]');
  if (reg) {
    const meter = u.$('[data-meter]'), mt = u.$('[data-meter-text]');
    reg.password.addEventListener('input', () => {
      const p = reg.password.value;
      let s = 0;
      if (p.length >= 8) s++;
      if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
      if (/\d/.test(p)) s++;
      if (/[^A-Za-z0-9]/.test(p)) s++;
      meter.className = 'pw-meter ' + (p ? 's' + Math.max(1, s) : '');
      mt.textContent = !p ? 'Use 8+ characters with a number and a symbol.' : ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'][s] + ' password';
    });
    reg.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!ui.validate(reg)) return;
      if (reg.password.value.length < 8) { reg.password.classList.add('is-invalid'); return ui.toast('Password too short', 'Use at least 8 characters.', 'warning'); }
      if (reg.password.value !== reg.confirm.value) { reg.confirm.classList.add('is-invalid'); return ui.toast('Passwords do not match', null, 'warning'); }
      if (!reg.terms.checked) return ui.toast('Please accept the terms to continue', null, 'warning');
      if (S.customers.some((c) => c.email.toLowerCase() === reg.email.value.trim().toLowerCase())) { reg.email.classList.add('is-invalid'); return ui.toast('Email already registered', 'Try logging in instead.', 'error'); }
      await ui.busy(reg.querySelector('[type=submit]'), 800);
      const last = S.customers.reduce((m, c) => Math.max(m, +c.id.split('-')[1]), 1000);
      const c = { id: 'CUS-' + (last + 1), name: reg.name.value.trim(), email: reg.email.value.trim(), phone: reg.phone.value.trim(), city: 'Metro Manila', address: '—', joined: u.today(), status: 'Active', tier: 'Regular', password: reg.password.value };
      S.customers.push(c);
      AC.store.notify('admin', { type: 'booking', title: 'New Customer', msg: c.name + ' created an account.', link: '#/customers' });
      AC.store.log('Customer', c.name, 'Registered an account', c.id);
      AC.store.save();
      AC.session.loginCustomer(c.id, true);
      ui.toast('Account created!', 'Next, add your first vehicle.', 'success');
      setTimeout(() => (location.href = 'customer.html#/vehicles'), 700);
    });
  }

  /* ---------- Admin login ---------- */
  const adm = u.$('[data-admin-login]');
  if (adm) {
    let attempts = 0;
    adm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!ui.validate(adm)) return;
      await ui.busy(adm.querySelector('[type=submit]'), 800);
      const id = adm.id.value.trim().toLowerCase();
      const ok = (id === 'admin@autocare.ph' || /^emp-\d{4}$/.test(id)) && adm.password.value === 'admin123';
      if (!ok) {
        attempts++;
        adm.password.value = ''; adm.password.classList.add('is-invalid');
        ui.toast('Access denied', attempts >= 3 ? 'Too many attempts — account will lock after 5 tries.' : 'Invalid credentials.', 'error');
        return;
      }
      adm.classList.add('hidden');
      u.$('[data-otp-step]').classList.remove('hidden');
      sendCode(false);
    });

    /* ---- One-time password (simulated SMS) ---- */
    const otpInputs = u.$$('[data-otp] input');
    const resendBtn = u.$('[data-resend]');
    let otp = null, expiresAt = 0, tick = null, otpTries = 0;

    function sendCode(isResend) {
      otp = String(Math.floor(100000 + Math.random() * 900000));
      expiresAt = Date.now() + 5 * 60 * 1000;
      otpTries = 0;
      otpInputs.forEach((x) => { x.value = ''; x.classList.remove('is-invalid', 'filled'); });
      u.$('[data-otp-code]').textContent = '------';
      const sms = u.$('[data-sms]'); sms.style.opacity = '.5';
      // Simulate network delay before the SMS "arrives"
      setTimeout(() => {
        u.$('[data-otp-code]').textContent = otp;
        sms.style.opacity = '1';
        sms.style.animation = 'none'; void sms.offsetWidth; sms.style.animation = '';
        ui.toast(isResend ? 'New code sent' : 'Verification code sent', 'AutoCare: your code is ' + otp, 'info', 6000);
      }, 900);
      otpInputs[0].focus();
      // Resend cooldown 30s
      let cd = 30;
      resendBtn.disabled = true;
      resendBtn.innerHTML = 'Resend code in <span data-resend-t>' + cd + '</span>s';
      clearInterval(tick);
      tick = setInterval(() => {
        cd = Math.max(0, cd - 1);
        const left = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
        u.$('[data-otp-timer]').textContent = Math.floor(left / 60) + ':' + u.pad(left % 60);
        if (cd > 0) resendBtn.querySelector('[data-resend-t]').textContent = cd;
        else if (resendBtn.disabled) { resendBtn.disabled = false; resendBtn.textContent = 'Resend code'; }
        if (!left) { clearInterval(tick); resendBtn.disabled = false; resendBtn.textContent = 'Resend code'; }
      }, 1000);
    }

    resendBtn.onclick = () => { if (!resendBtn.disabled) sendCode(true); };
    u.$('[data-autofill]').onclick = () => {
      if (!otp || u.$('[data-otp-code]').textContent !== otp) return ui.toast('Code not received yet', 'Please wait a moment.', 'info');
      otpInputs.forEach((x, k) => { x.value = otp[k]; x.classList.add('filled'); });
      otpInputs[5].focus();
    };
    u.$('[data-otp-back]').onclick = () => {
      clearInterval(tick); otp = null;
      u.$('[data-otp-step]').classList.add('hidden'); adm.classList.remove('hidden');
      adm.password.value = ''; adm.password.focus();
    };

    otpInputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        inp.value = inp.value.replace(/\D/g, '').slice(0, 1);
        inp.classList.toggle('filled', !!inp.value); inp.classList.remove('is-invalid');
        if (inp.value && otpInputs[i + 1]) otpInputs[i + 1].focus();
        if (otpInputs.every((x) => x.value)) u.$('[data-otp]').requestSubmit();
      });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Backspace' && !inp.value && otpInputs[i - 1]) otpInputs[i - 1].focus(); });
      inp.addEventListener('paste', (e) => {
        const t = (e.clipboardData.getData('text') || '').replace(/\D/g, '');
        if (t.length >= 6) { e.preventDefault(); otpInputs.forEach((x, k) => { x.value = t[k]; x.classList.add('filled'); }); otpInputs[5].focus(); u.$('[data-otp]').requestSubmit(); }
      });
    });

    u.$('[data-otp]').addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = otpInputs.map((x) => x.value).join('');
      if (code.length < 6) { otpInputs.forEach((x) => x.classList.toggle('is-invalid', !x.value)); return ui.toast('Enter all 6 digits', null, 'warning'); }
      const btn = e.target.querySelector('[type=submit]');
      await ui.busy(btn, 600);
      if (!otp || Date.now() > expiresAt) { otpInputs.forEach((x) => x.classList.add('is-invalid')); return ui.toast('Code expired', 'Tap “Resend code” to get a new one.', 'error'); }
      if (code !== otp) {
        otpTries++;
        otpInputs.forEach((x) => { x.classList.add('is-invalid'); x.value = ''; });
        otpInputs[0].focus();
        if (otpTries >= 3) { otp = null; clearInterval(tick); resendBtn.disabled = false; resendBtn.textContent = 'Resend code'; return ui.toast('Too many wrong attempts', 'Request a new code to continue.', 'error'); }
        return ui.toast('Incorrect code', (3 - otpTries) + ' attempt(s) left.', 'error');
      }
      clearInterval(tick);
      AC.session.loginAdmin(S.staff.name);
      AC.store.log('Admin', S.staff.name, 'Signed in with 2-step verification (' + adm.role.value + ')', 'Admin Console');
      AC.store.save();
      ui.toast('Verified', 'Opening the Admin Console…', 'success');
      setTimeout(() => (location.href = 'admin.html'), 600);
    });
  }
})();

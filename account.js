/* ================================================================
   ACCOUNT.JS — Shared customer-account module (session-backed)
   Water Boy Delivery — loaded on pages that don't carry shop.js's
   own auth overlay (order.html, my-orders.html, water-delivery.html).

   Talks to /api/auth (httpOnly cookie sessions — JS never sees the
   session token). Mirrors the signed-in profile into localStorage
   key wb_user_v1 so shop.js-powered pages show the same signed-in
   state, and reads it as a fallback for legacy sign-ins.

   Public API (window.WBAccount):
     .user                 — profile object or null (after .ready)
     .ready(cb)            — cb(user) once the session check finishes
     .openModal(mode,opts) — 'signin'|'signup'; opts.prefill {firstName,
                             lastName,email,phone,addr,city,zip},
                             opts.onAuth(user)
     .login(email, pass)   — Promise<user>
     .signup(data)         — Promise<user>
     .signOut()            — clears session + legacy key, reloads page
   Also defines window.openAuthModal if no other module has.
   Fires document event 'wb:auth' with {detail:{user}} on changes.
   ================================================================ */
(function () {
  'use strict';

  var API = '/api/auth';
  var user = null;
  var readyCbs = [];
  var isReady = false;

  function api(payload) {
    return fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify(payload),
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
        return data;
      });
    });
  }

  function syncLegacy(u) {
    try {
      if (u) {
        localStorage.setItem('wb_user_v1', JSON.stringify({
          name: ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || (u.email || '').split('@')[0],
          email: u.email, phone: u.phone || '', addr: u.addr || '', city: u.city || '', zip: u.zip || '',
        }));
      } else {
        localStorage.removeItem('wb_user_v1');
      }
    } catch (e) {}
  }

  function announce() {
    document.dispatchEvent(new CustomEvent('wb:auth', { detail: { user: user } }));
  }

  function setUser(u) {
    user = u;
    if (u) syncLegacy(u);
    updateNavState();
    announce();
  }

  /* ── Navbar Sign In button (all pages) ─────────────────────── */
  function knownUser() {
    if (user) return user;
    try { return JSON.parse(localStorage.getItem('wb_user_v1')) || null; } catch (e) { return null; }
  }

  function navClick(e) {
    e.preventDefault();
    if (knownUser()) { location.href = '/my-orders'; return; }
    openModal('signin', { onAuth: function () { updateNavState(); } });
  }

  function updateNavState() {
    var u = knownUser();
    var label = u ? (((u.firstName || u.name || '').split(' ')[0]) || 'Account') : 'Sign In';
    ['wba-nav-btn', 'wba-nav-btn-m'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = label;
      el.setAttribute('aria-label', u ? 'My account' : 'Sign in');
    });
  }

  function injectNavButton() {
    var right = document.querySelector('#navbar .nav-right');
    if (right && !document.getElementById('wba-nav-btn')) {
      var btn = document.createElement('a');
      btn.id = 'wba-nav-btn';
      btn.className = 'wba-nav-signin';
      btn.href = '/my-orders';
      btn.textContent = 'Sign In';
      btn.addEventListener('click', navClick);
      right.insertBefore(btn, right.querySelector('.nav-order-btn') || right.firstChild);
    }
    var mobileLinks = document.querySelector('#mobile-menu .mobile-nav-links');
    if (mobileLinks && !document.getElementById('wba-nav-btn-m')) {
      var m = document.createElement('a');
      m.id = 'wba-nav-btn-m';
      m.className = 'mobile-nav-link';
      m.href = '/my-orders';
      m.textContent = 'Sign In';
      m.addEventListener('click', navClick);
      mobileLinks.appendChild(m);
    }
    updateNavState();
  }

  /* ── Modal ─────────────────────────────────────────────────── */
  var CSS = [
    '#wba-overlay{position:fixed;inset:0;z-index:99999;background:rgba(10,31,68,0.55);display:none;align-items:center;justify-content:center;padding:20px;}',
    '#wba-overlay.wba-open{display:flex;}',
    '#wba-modal{background:#FFFFFF;border:1px solid var(--color-border,#E2E8F0);border-radius:20px;padding:36px 32px;max-width:440px;width:100%;position:relative;max-height:92vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,0.18);animation:wbaIn 0.22s ease;}',
    '@keyframes wbaIn{from{opacity:0;transform:translateY(-12px) scale(0.98);}to{opacity:1;transform:none;}}',
    '#wba-close{position:absolute;top:14px;right:14px;background:none;border:none;color:var(--color-text-muted,#64748B);font-size:24px;cursor:pointer;width:34px;height:34px;border-radius:8px;line-height:1;padding:0;transition:background 0.2s;}',
    '#wba-close:hover{background:rgba(0,0,0,0.05);}',
    '.wba-h{font-family:"Poppins",sans-serif;font-size:24px;font-weight:700;color:var(--color-text,#0A1F44);margin:0 0 4px;}',
    '.wba-sub{font-family:"Poppins",sans-serif;font-size:13.5px;color:var(--color-text-muted,#64748B);margin:0 0 22px;line-height:1.5;}',
    '.wba-form{display:flex;flex-direction:column;gap:13px;}',
    '.wba-row{display:flex;gap:10px;}.wba-row .wba-field{flex:1;}',
    '.wba-field{display:flex;flex-direction:column;gap:5px;}',
    '.wba-label{font-family:"Poppins",sans-serif;font-size:12.5px;font-weight:500;color:var(--color-text,#0A1F44);}',
    '.wba-input{background:#FFFFFF;border:1.5px solid var(--color-border,#E2E8F0);border-radius:10px;color:var(--color-text,#0A1F44);padding:12px 14px;font-family:"Poppins",sans-serif;font-size:16px;width:100%;outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;}',
    '.wba-input:focus{border-color:var(--color-primary,#0D47A1);box-shadow:0 0 0 3px rgba(13,71,161,0.1);}',
    '.wba-pw{position:relative;}.wba-pw .wba-input{padding-right:56px;}',
    '.wba-eye{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--color-text-muted,#64748B);cursor:pointer;font-family:"Poppins",sans-serif;font-size:12.5px;font-weight:500;padding:4px 6px;border-radius:4px;}',
    '.wba-err{background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.25);border-radius:8px;padding:10px 13px;font-family:"Poppins",sans-serif;font-size:13px;color:#dc2626;display:none;line-height:1.45;}',
    '.wba-err.wba-show{display:block;}',
    '.wba-submit{width:100%;min-height:48px;background:var(--color-primary,#0D47A1);color:#FFFFFF;border:none;border-radius:10px;font-family:"Poppins",sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:transform 0.15s,box-shadow 0.2s;margin-top:2px;}',
    '.wba-submit:hover{transform:scale(1.01);box-shadow:0 6px 18px rgba(13,71,161,0.25);}',
    '.wba-submit:disabled{opacity:0.6;cursor:default;transform:none;box-shadow:none;}',
    '.wba-switch{text-align:center;margin-top:14px;font-family:"Poppins",sans-serif;font-size:13.5px;color:var(--color-text-muted,#64748B);}',
    '.wba-switch a{color:var(--color-primary,#0D47A1);cursor:pointer;font-weight:600;text-decoration:none;}',
    '.wba-switch a:hover{text-decoration:underline;}',
    '@media(max-width:480px){#wba-modal{padding:26px 18px;}}',
    /* Navbar Sign In button — outline twin of .nav-order-btn; the mobile
       menu link covers ≤768px where the navbar collapses to hamburger. */
    '.wba-nav-signin{background:none;color:var(--color-primary,#0D47A1) !important;font-family:"Poppins",sans-serif;font-weight:600;font-size:15px;border-radius:12px;padding:9px 18px;border:1.5px solid var(--color-primary,#0D47A1);cursor:pointer;text-decoration:none !important;min-height:44px;display:flex;align-items:center;justify-content:center;transition:background 0.2s ease,color 0.2s ease;white-space:nowrap;box-sizing:border-box;}',
    '.wba-nav-signin:hover{background:var(--color-primary,#0D47A1);color:#FFFFFF !important;}',
    '@media(max-width:768px){.wba-nav-signin{display:none !important;}}',
  ].join('');

  function buildModal() {
    return '<div id="wba-overlay" role="dialog" aria-modal="true" aria-label="Sign in to Water Boy Delivery">' +
      '<div id="wba-modal">' +
        '<button id="wba-close" aria-label="Close">&times;</button>' +
        '<div id="wba-si">' +
          '<h2 class="wba-h">Sign In</h2>' +
          '<p class="wba-sub">Welcome back! Sign in to see your orders and saved info.</p>' +
          '<form class="wba-form" id="wba-si-form" novalidate>' +
            '<div class="wba-field"><label class="wba-label" for="wba-si-email">Email</label><input class="wba-input" type="email" id="wba-si-email" placeholder="you@example.com" autocomplete="email"></div>' +
            '<div class="wba-field"><label class="wba-label" for="wba-si-pw">Password</label><div class="wba-pw"><input class="wba-input" type="password" id="wba-si-pw" placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;" autocomplete="current-password"><button type="button" class="wba-eye" data-t="wba-si-pw">Show</button></div></div>' +
            '<div class="wba-err" id="wba-si-err"></div>' +
            '<button type="submit" class="wba-submit" id="wba-si-btn">Sign In</button>' +
          '</form>' +
          '<div class="wba-switch">New here? <a id="wba-to-su">Create an account</a></div>' +
        '</div>' +
        '<div id="wba-su" style="display:none;">' +
          '<h2 class="wba-h">Create Account</h2>' +
          '<p class="wba-sub">Save your info for faster checkout and track every order.</p>' +
          '<form class="wba-form" id="wba-su-form" novalidate>' +
            '<div class="wba-row">' +
              '<div class="wba-field"><label class="wba-label" for="wba-su-first">First Name</label><input class="wba-input" type="text" id="wba-su-first" placeholder="Jane" autocomplete="given-name"></div>' +
              '<div class="wba-field"><label class="wba-label" for="wba-su-last">Last Name</label><input class="wba-input" type="text" id="wba-su-last" placeholder="Smith" autocomplete="family-name"></div>' +
            '</div>' +
            '<div class="wba-field"><label class="wba-label" for="wba-su-email">Email</label><input class="wba-input" type="email" id="wba-su-email" placeholder="you@example.com" autocomplete="email"></div>' +
            '<div class="wba-field"><label class="wba-label" for="wba-su-phone">Phone</label><input class="wba-input" type="tel" id="wba-su-phone" placeholder="(916) 555-1234" autocomplete="tel"></div>' +
            '<div class="wba-field"><label class="wba-label" for="wba-su-pw">Password <span style="font-weight:400;color:var(--color-text-muted,#64748B)">(8+ characters)</span></label><div class="wba-pw"><input class="wba-input" type="password" id="wba-su-pw" autocomplete="new-password"><button type="button" class="wba-eye" data-t="wba-su-pw">Show</button></div></div>' +
            '<div class="wba-err" id="wba-su-err"></div>' +
            '<button type="submit" class="wba-submit" id="wba-su-btn">Create Account</button>' +
          '</form>' +
          '<div class="wba-switch">Already have an account? <a id="wba-to-si">Sign In</a></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  var modalOpts = {};

  function openModal(mode, opts) {
    modalOpts = opts || {};
    var ov = document.getElementById('wba-overlay');
    if (!ov) return;
    showPanel(mode === 'signup' ? 'signup' : 'signin');
    var p = modalOpts.prefill || {};
    ['first', 'last', 'email', 'phone'].forEach(function (f, i) {
      var el = document.getElementById('wba-su-' + f);
      var v = [p.firstName, p.lastName, p.email, p.phone][i];
      if (el && v && !el.value) el.value = v;
    });
    if (p.email) {
      var si = document.getElementById('wba-si-email');
      if (si && !si.value) si.value = p.email;
    }
    ov.classList.add('wba-open');
    setTimeout(function () {
      var first = ov.querySelector((mode === 'signup' ? '#wba-su' : '#wba-si') + ' input');
      if (first) first.focus();
    }, 80);
  }

  function closeModal() {
    var ov = document.getElementById('wba-overlay');
    if (ov) ov.classList.remove('wba-open');
  }

  function showPanel(which) {
    var si = document.getElementById('wba-si');
    var su = document.getElementById('wba-su');
    if (!si || !su) return;
    si.style.display = which === 'signup' ? 'none' : 'block';
    su.style.display = which === 'signup' ? 'block' : 'none';
    ['wba-si-err', 'wba-su-err'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.classList.remove('wba-show'); el.textContent = ''; }
    });
  }

  function showErr(id, msg) {
    var el = document.getElementById(id);
    if (el) { el.textContent = msg; el.classList.add('wba-show'); }
  }

  /* ── Auth actions ──────────────────────────────────────────── */
  function login(email, password) {
    return api({ action: 'login', email: email, password: password }).then(function (d) {
      setUser(d.user);
      return d.user;
    });
  }

  function signup(data) {
    var payload = Object.assign({ action: 'signup' }, data);
    return api(payload).then(function (d) {
      setUser(d.user);
      return d.user;
    });
  }

  function signOut() {
    api({ action: 'logout' }).catch(function () {}).then(function () {
      user = null;
      syncLegacy(null);
      location.reload();
    });
  }

  /* ── Wiring ────────────────────────────────────────────────── */
  function bind() {
    document.getElementById('wba-close').addEventListener('click', closeModal);
    document.getElementById('wba-overlay').addEventListener('click', function (e) {
      if (e.target === this) closeModal();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    document.getElementById('wba-to-su').addEventListener('click', function () { showPanel('signup'); });
    document.getElementById('wba-to-si').addEventListener('click', function () { showPanel('signin'); });

    Array.prototype.forEach.call(document.querySelectorAll('.wba-eye'), function (btn) {
      btn.addEventListener('click', function () {
        var inp = document.getElementById(this.dataset.t);
        if (!inp) return;
        inp.type = inp.type === 'password' ? 'text' : 'password';
        this.textContent = inp.type === 'password' ? 'Show' : 'Hide';
      });
    });

    document.getElementById('wba-si-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (document.getElementById('wba-si-email').value || '').trim().toLowerCase();
      var pw = document.getElementById('wba-si-pw').value || '';
      if (!email || !pw) { showErr('wba-si-err', 'Please enter your email and password.'); return; }
      var btn = document.getElementById('wba-si-btn');
      btn.disabled = true; btn.textContent = 'Signing in…';
      login(email, pw).then(function (u) {
        closeModal();
        if (modalOpts.onAuth) modalOpts.onAuth(u);
      }).catch(function (err) {
        showErr('wba-si-err', err.message);
      }).then(function () {
        btn.disabled = false; btn.textContent = 'Sign In';
      });
    });

    document.getElementById('wba-su-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var p = modalOpts.prefill || {};
      var data = {
        firstName: (document.getElementById('wba-su-first').value || '').trim(),
        lastName: (document.getElementById('wba-su-last').value || '').trim(),
        email: (document.getElementById('wba-su-email').value || '').trim().toLowerCase(),
        phone: (document.getElementById('wba-su-phone').value || '').trim(),
        password: document.getElementById('wba-su-pw').value || '',
        // Address may ride along from checkout — no duplicate typing.
        addr: p.addr || '', city: p.city || '', zip: p.zip || '',
      };
      if (!data.firstName || !data.email) { showErr('wba-su-err', 'Please enter your name and email.'); return; }
      if (data.password.length < 8) { showErr('wba-su-err', 'Password must be at least 8 characters.'); return; }
      var btn = document.getElementById('wba-su-btn');
      btn.disabled = true; btn.textContent = 'Creating account…';
      signup(data).then(function (u) {
        closeModal();
        if (modalOpts.onAuth) modalOpts.onAuth(u);
      }).catch(function (err) {
        showErr('wba-su-err', err.message);
      }).then(function () {
        btn.disabled = false; btn.textContent = 'Create Account';
      });
    });
  }

  function init() {
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);
    var div = document.createElement('div');
    div.innerHTML = buildModal();
    document.body.appendChild(div.firstChild);
    bind();
    injectNavButton();

    api({ action: 'me' }).then(function (d) {
      setUser(d.user || null);
    }).catch(function () {
      // API unreachable — fall back to any legacy localStorage profile so
      // pages can still show a name; server data simply won't load.
      user = null;
      announce();
    }).then(function () {
      isReady = true;
      readyCbs.forEach(function (cb) { try { cb(user); } catch (e) {} });
      readyCbs = [];
    });
  }

  window.WBAccount = {
    get user() { return user; },
    ready: function (cb) { if (isReady) { cb(user); } else { readyCbs.push(cb); } },
    openModal: openModal,
    login: login,
    signup: signup,
    signOut: signOut,
    legacyUser: function () {
      try { return JSON.parse(localStorage.getItem('wb_user_v1')) || null; } catch (e) { return null; }
    },
  };

  // Back-compat: pages with inline onclick="openAuthModal('signin')" work
  // as long as shop.js (which defines its own) isn't also on the page.
  if (typeof window.openAuthModal === 'undefined') {
    window.openAuthModal = function (mode) { openModal(mode); };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

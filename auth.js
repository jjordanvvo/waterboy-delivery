/* ================================================================
   AUTH.JS — Sign In & Sign Up modal system
   Waterboy Delivery — shared across all pages
   ================================================================ */
(function () {
  'use strict';

  var MODAL_CSS = [
    '#wb-auth-overlay{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.8);',
    'display:none;align-items:center;justify-content:center;padding:20px;}',
    '#wb-auth-overlay.wbao-open{display:flex;}',
    '#wb-auth-modal{background:#132236;border:1px solid rgba(0,212,255,0.2);',
    'border-radius:16px;padding:40px;max-width:420px;width:100%;position:relative;',
    'box-shadow:0 32px 80px rgba(0,0,0,0.6);animation:wbModalIn 0.25s ease;}',
    '@keyframes wbModalIn{from{opacity:0;transform:translateY(-14px) scale(0.97);}to{opacity:1;transform:none;}}',
    '#wb-auth-close{position:absolute;top:14px;right:14px;background:none;border:none;',
    'color:rgba(255,255,255,0.45);font-size:26px;cursor:pointer;width:34px;height:34px;',
    'display:flex;align-items:center;justify-content:center;border-radius:6px;',
    'transition:color 0.2s,background 0.2s;line-height:1;padding:0;}',
    '#wb-auth-close:hover{color:#fff;background:rgba(255,255,255,0.08);}',
    '.wb-auth-h{font-family:"Outfit",sans-serif;font-size:28px;font-weight:700;color:#F0F7FF;margin:0 0 26px;}',
    '.wb-auth-form{display:flex;flex-direction:column;gap:14px;}',
    '.wb-auth-row{display:flex;gap:12px;}',
    '.wb-auth-row .wb-auth-field{flex:1;}',
    '.wb-auth-field{display:flex;flex-direction:column;gap:6px;}',
    '.wb-auth-label{font-family:"Inter",sans-serif;font-size:13px;font-weight:500;color:rgba(176,210,240,0.8);}',
    '.wb-auth-input{background:#0B1B2B;border:1px solid rgba(0,212,255,0.2);border-radius:8px;',
    'color:#F0F7FF;padding:14px 16px;font-family:"Inter",sans-serif;font-size:16px;',
    'width:100%;outline:none;transition:border-color 0.2s,box-shadow 0.2s;box-sizing:border-box;}',
    '.wb-auth-input::placeholder{color:#B8E6FF;opacity:0.4;}',
    '.wb-auth-input:focus{border-color:#00D4FF;box-shadow:0 0 0 3px rgba(0,212,255,0.1);}',
    '.wb-pw-wrap{position:relative;}',
    '.wb-pw-wrap .wb-auth-input{padding-right:56px;}',
    '.wb-pw-toggle{position:absolute;right:12px;top:50%;transform:translateY(-50%);',
    'background:none;border:none;color:rgba(184,230,255,0.5);cursor:pointer;',
    'font-family:"Inter",sans-serif;font-size:13px;font-weight:500;padding:4px 6px;',
    'border-radius:4px;transition:color 0.2s;}',
    '.wb-pw-toggle:hover{color:#B8E6FF;}',
    '.wb-auth-err{background:rgba(255,80,80,0.1);border:1px solid rgba(255,80,80,0.3);',
    'border-radius:8px;padding:10px 14px;font-family:"Inter",sans-serif;font-size:13px;',
    'color:#FF8080;display:none;}',
    '.wb-auth-err.wbae-show{display:block;}',
    '.wb-auth-ok{background:rgba(0,212,100,0.1);border:1px solid rgba(0,212,100,0.3);',
    'border-radius:8px;padding:10px 14px;font-family:"Inter",sans-serif;font-size:13px;',
    'color:#4DFFA0;display:none;text-align:center;}',
    '.wb-auth-ok.wbao-show{display:block;}',
    '.wb-auth-submit{width:100%;height:50px;background:#00D4FF;color:#0B1B2B;border:none;',
    'border-radius:8px;font-family:"Outfit",sans-serif;font-size:16px;font-weight:700;',
    'cursor:pointer;transition:background 0.2s;margin-top:4px;}',
    '.wb-auth-submit:hover{background:#38BDF8;}',
    '.wb-auth-switch{text-align:center;margin-top:14px;font-family:"Inter",sans-serif;',
    'font-size:14px;color:rgba(184,230,255,0.6);}',
    '.wb-auth-switch a{color:#00D4FF;text-decoration:none;cursor:pointer;font-weight:500;}',
    '.wb-auth-switch a:hover{text-decoration:underline;}',
    '@media(max-width:480px){#wb-auth-modal{padding:28px 20px;}}'
  ].join('');

  function buildHTML() {
    return '<div id="wb-auth-overlay" role="dialog" aria-modal="true" aria-label="Sign in to Waterboy Delivery">' +
      '<div id="wb-auth-modal">' +
        '<button id="wb-auth-close" aria-label="Close">×</button>' +
        '<div id="wb-si-panel">' +
          '<h2 class="wb-auth-h">Sign In</h2>' +
          '<form class="wb-auth-form" id="wb-si-form" novalidate>' +
            '<div class="wb-auth-field">' +
              '<label class="wb-auth-label" for="wb-si-email">Email</label>' +
              '<input class="wb-auth-input" type="email" id="wb-si-email" placeholder="you@example.com" autocomplete="email" />' +
            '</div>' +
            '<div class="wb-auth-field">' +
              '<label class="wb-auth-label" for="wb-si-pw">Password</label>' +
              '<div class="wb-pw-wrap">' +
                '<input class="wb-auth-input" type="password" id="wb-si-pw" placeholder="••••••••" autocomplete="current-password" />' +
                '<button type="button" class="wb-pw-toggle" data-target="wb-si-pw">Show</button>' +
              '</div>' +
            '</div>' +
            '<div class="wb-auth-err" id="wb-si-err"></div>' +
            '<button type="submit" class="wb-auth-submit">Sign In</button>' +
          '</form>' +
          '<div class="wb-auth-switch">Don\'t have an account? <a id="wb-to-signup">Get Started</a></div>' +
        '</div>' +
        '<div id="wb-su-panel" style="display:none;">' +
          '<h2 class="wb-auth-h">Create Account</h2>' +
          '<form class="wb-auth-form" id="wb-su-form" novalidate>' +
            '<div class="wb-auth-row">' +
              '<div class="wb-auth-field">' +
                '<label class="wb-auth-label" for="wb-su-first">First Name</label>' +
                '<input class="wb-auth-input" type="text" id="wb-su-first" placeholder="Jane" autocomplete="given-name" />' +
              '</div>' +
              '<div class="wb-auth-field">' +
                '<label class="wb-auth-label" for="wb-su-last">Last Name</label>' +
                '<input class="wb-auth-input" type="text" id="wb-su-last" placeholder="Doe" autocomplete="family-name" />' +
              '</div>' +
            '</div>' +
            '<div class="wb-auth-field">' +
              '<label class="wb-auth-label" for="wb-su-email">Email</label>' +
              '<input class="wb-auth-input" type="email" id="wb-su-email" placeholder="you@example.com" autocomplete="email" />' +
            '</div>' +
            '<div class="wb-auth-field">' +
              '<label class="wb-auth-label" for="wb-su-phone">Phone</label>' +
              '<input class="wb-auth-input" type="tel" id="wb-su-phone" placeholder="(555) 000-0000" autocomplete="tel" />' +
            '</div>' +
            '<div class="wb-auth-field">' +
              '<label class="wb-auth-label" for="wb-su-pw">Password</label>' +
              '<div class="wb-pw-wrap">' +
                '<input class="wb-auth-input" type="password" id="wb-su-pw" placeholder="••••••••" autocomplete="new-password" />' +
                '<button type="button" class="wb-pw-toggle" data-target="wb-su-pw">Show</button>' +
              '</div>' +
            '</div>' +
            '<div class="wb-auth-field">' +
              '<label class="wb-auth-label" for="wb-su-confirm">Confirm Password</label>' +
              '<div class="wb-pw-wrap">' +
                '<input class="wb-auth-input" type="password" id="wb-su-confirm" placeholder="••••••••" autocomplete="new-password" />' +
                '<button type="button" class="wb-pw-toggle" data-target="wb-su-confirm">Show</button>' +
              '</div>' +
            '</div>' +
            '<div class="wb-auth-err" id="wb-su-err"></div>' +
            '<div class="wb-auth-ok" id="wb-su-ok"></div>' +
            '<button type="submit" class="wb-auth-submit">Create Account</button>' +
          '</form>' +
          '<div class="wb-auth-switch">Already have an account? <a id="wb-to-signin">Sign In</a></div>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ── localStorage helpers ──────────────────────────────────── */
  function getUsers() {
    try { return JSON.parse(localStorage.getItem('wb_users') || '[]'); } catch (e) { return []; }
  }
  function saveUsers(arr) {
    try { localStorage.setItem('wb_users', JSON.stringify(arr)); } catch (e) {}
  }
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('wb_user') || 'null'); } catch (e) { return null; }
  }
  function setCurrentUser(u) {
    try {
      var val = u ? JSON.stringify(u) : 'null';
      localStorage.setItem('wb_user', val);
      // Also write wb_user_v1 for shop.js compatibility
      if (u) {
        var v1 = { name: (u.firstName || '') + ' ' + (u.lastName || ''), email: u.email, phone: u.phone };
        localStorage.setItem('wb_user_v1', JSON.stringify(v1));
      } else {
        localStorage.removeItem('wb_user_v1');
      }
    } catch (e) {}
  }

  /* ── Modal open/close ──────────────────────────────────────── */
  function openModal(type) {
    var ov = document.getElementById('wb-auth-overlay');
    if (!ov) return;
    ov.classList.add('wbao-open');
    showPanel(type || 'signin');
    setTimeout(function () {
      var first = ov.querySelector('input:not([type=hidden])');
      if (first) first.focus();
    }, 80);
  }

  function closeModal() {
    var ov = document.getElementById('wb-auth-overlay');
    if (ov) ov.classList.remove('wbao-open');
  }

  function showPanel(type) {
    var si = document.getElementById('wb-si-panel');
    var su = document.getElementById('wb-su-panel');
    if (!si || !su) return;
    si.style.display = type === 'signup' ? 'none' : 'block';
    su.style.display = type === 'signup' ? 'block' : 'none';
    clearErrors();
    if (type === 'signup') {
      var first = document.getElementById('wb-su-first');
      if (first) setTimeout(function () { first.focus(); }, 60);
    } else {
      var email = document.getElementById('wb-si-email');
      if (email) setTimeout(function () { email.focus(); }, 60);
    }
  }

  function clearErrors() {
    ['wb-si-err', 'wb-su-err', 'wb-su-ok'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.classList.remove('wbae-show', 'wbao-show'); el.textContent = ''; }
    });
  }

  function showErr(id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    el.textContent = msg;
    el.classList.add('wbae-show');
  }

  /* ── Nav update ────────────────────────────────────────────── */
  function updateNavForUser(user) {
    if (!user) return;
    var name = ((user.firstName || user.name || '').split(' ')[0]) || 'Account';

    // Sign In buttons → user first name linking to My Orders
    document.querySelectorAll('[onclick*="openAuthModal"][onclick*="signin"]').forEach(function (el) {
      el.textContent = name;
      el.removeAttribute('onclick');
      el.href = '/my-orders';
    });

    // Also handle index.html Sign In (hn-sign-in class)
    document.querySelectorAll('.hn-sign-in[onclick*="signin"]').forEach(function (el) {
      el.textContent = name;
      el.removeAttribute('onclick');
      el.href = '/my-orders';
    });

    // Hide Get Started buttons
    document.querySelectorAll('[onclick*="openAuthModal"][onclick*="signup"]').forEach(function (el) {
      el.style.display = 'none';
    });
    document.querySelectorAll('.hn-get-started[onclick*="signup"]').forEach(function (el) {
      el.style.display = 'none';
    });

    // Update left drawer sign-in link
    var ldLink = document.getElementById('ld-signin-link');
    if (ldLink) {
      ldLink.textContent = name + "’s Account";
      ldLink.href = '/my-orders';
      ldLink.removeAttribute('onclick');
    }

    // Update my-orders hero email line
    var moEmail = document.getElementById('mo-email');
    if (moEmail) moEmail.textContent = user.email || '';
  }

  /* ── Sign In handler ───────────────────────────────────────── */
  function handleSignIn(e) {
    e.preventDefault();
    var email = (document.getElementById('wb-si-email').value || '').trim().toLowerCase();
    var pw = document.getElementById('wb-si-pw').value || '';

    if (!email || !pw) {
      showErr('wb-si-err', 'Please enter your email and password.');
      return;
    }

    var users = getUsers();
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if ((users[i].email || '').toLowerCase() === email && users[i].password === pw) {
        user = users[i];
        break;
      }
    }

    if (!user) {
      showErr('wb-si-err', 'No account found with that email. Please check your details or create an account.');
      return;
    }

    setCurrentUser(user);
    closeModal();
    updateNavForUser(user);
  }

  /* ── Sign Up handler ───────────────────────────────────────── */
  function handleSignUp(e) {
    e.preventDefault();
    var firstName = (document.getElementById('wb-su-first').value || '').trim();
    var lastName  = (document.getElementById('wb-su-last').value || '').trim();
    var email     = (document.getElementById('wb-su-email').value || '').trim().toLowerCase();
    var phone     = (document.getElementById('wb-su-phone').value || '').trim();
    var pw        = document.getElementById('wb-su-pw').value || '';
    var confirm   = document.getElementById('wb-su-confirm').value || '';

    if (!firstName || !lastName || !email || !phone || !pw || !confirm) {
      showErr('wb-su-err', 'Please fill in all fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showErr('wb-su-err', 'Please enter a valid email address.');
      return;
    }
    if (pw !== confirm) {
      showErr('wb-su-err', 'Passwords do not match.');
      return;
    }
    if (pw.length < 6) {
      showErr('wb-su-err', 'Password must be at least 6 characters.');
      return;
    }

    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
      if ((users[i].email || '').toLowerCase() === email) {
        showErr('wb-su-err', 'An account with that email already exists. Please sign in.');
        return;
      }
    }

    var newUser = {
      firstName: firstName,
      lastName:  lastName,
      email:     email,
      phone:     phone,
      password:  pw,
      createdAt: Date.now()
    };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);

    var okEl = document.getElementById('wb-su-ok');
    if (okEl) {
      okEl.textContent = 'Account created! Signing you in…';
      okEl.classList.add('wbao-show');
    }
    setTimeout(function () {
      closeModal();
      updateNavForUser(newUser);
    }, 1100);
  }

  /* ── Bind events ───────────────────────────────────────────── */
  function bindEvents() {
    var closeBtn = document.getElementById('wb-auth-close');
    var overlay  = document.getElementById('wb-auth-overlay');
    var toSignup = document.getElementById('wb-to-signup');
    var toSignin = document.getElementById('wb-to-signin');
    var siForm   = document.getElementById('wb-si-form');
    var suForm   = document.getElementById('wb-su-form');

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (overlay)  overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });

    if (toSignup) toSignup.addEventListener('click', function (e) { e.preventDefault(); showPanel('signup'); });
    if (toSignin) toSignin.addEventListener('click', function (e) { e.preventDefault(); showPanel('signin'); });

    if (siForm) siForm.addEventListener('submit', handleSignIn);
    if (suForm) suForm.addEventListener('submit', handleSignUp);

    // Password show/hide toggles
    document.querySelectorAll('.wb-pw-toggle').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var inp = document.getElementById(this.dataset.target);
        if (!inp) return;
        if (inp.type === 'password') {
          inp.type = 'text';
          this.textContent = 'Hide';
        } else {
          inp.type = 'password';
          this.textContent = 'Show';
        }
      });
    });
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    // Inject CSS
    var style = document.createElement('style');
    style.textContent = MODAL_CSS;
    document.head.appendChild(style);

    // Inject HTML
    var div = document.createElement('div');
    div.innerHTML = buildHTML();
    document.body.appendChild(div.firstChild);

    // Bind
    bindEvents();

    // Check existing session
    var user = getCurrentUser();
    if (user) updateNavForUser(user);
  }

  /* ── Public API ────────────────────────────────────────────── */
  window.openAuthModal = function (type) { openModal(type || 'signin'); };
  window.signOutWaterboy = function () { setCurrentUser(null); location.reload(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

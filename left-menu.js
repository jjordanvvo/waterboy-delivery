(function () {
  'use strict';
  var btn = document.getElementById('nav-menu-btn');
  var drawer = document.getElementById('left-drawer');
  var overlay = document.getElementById('left-drawer-overlay');
  var closeBtn = document.getElementById('left-drawer-close');
  if (!btn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  btn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
  drawer.querySelectorAll('.left-drawer-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (link.getAttribute('href') && link.getAttribute('href') !== '#') closeDrawer();
    });
  });

  var signinLink = document.getElementById('ld-signin-link');
  var cartLink = document.getElementById('ld-cart-link');
  if (signinLink) signinLink.addEventListener('click', function (e) {
    e.preventDefault();
    closeDrawer();
    if (typeof openAuthModal === 'function') openAuthModal('signin');
    else if (typeof openOverlay === 'function') openOverlay('auth-overlay');
  });
  if (cartLink) cartLink.addEventListener('click', function (e) {
    e.preventDefault();
    closeDrawer();
    if (typeof openCartDrawer === 'function') openCartDrawer();
    else if (typeof openCartSidebar === 'function') openCartSidebar();
  });

  var current = window.location.pathname.replace(/\/$/, '').split('/').pop().replace(/\.html$/, '');
  drawer.querySelectorAll('.left-drawer-link[href]').forEach(function (a) {
    var href = (a.getAttribute('href') || '').replace(/^\//, '').replace(/\.html$/, '');
    if (href === current) a.classList.add('active');
  });
})();

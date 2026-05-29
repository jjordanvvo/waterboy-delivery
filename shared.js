/* ============================================================
   SHARED.JS — Nav hamburger, More dropdown, active page highlight
   Runs on every page of the multi-page site.
   ============================================================ */
(function () {
  'use strict';

  function init() {
    initHamburger();
    initMoreDropdown();
    highlightActivePage();
  }

  /* Mobile hamburger ↔ #mobile-menu */
  function initHamburger() {
    var btn = document.getElementById('nav-hamburger');
    var menu = document.getElementById('mobile-menu');
    var closeBtn = document.getElementById('mobile-menu-close');
    if (!btn || !menu) return;

    function openMenu() {
      menu.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', function () {
      menu.classList.contains('open') ? closeMenu() : openMenu();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    // Close on backdrop click (click outside the menu panel)
    menu.addEventListener('click', function (e) {
      if (e.target === menu) closeMenu();
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
    });
  }

  /* "More" dropdown toggle */
  function initMoreDropdown() {
    var item = document.querySelector('.nav-more-item');
    var btn = document.querySelector('.nav-more-btn');
    if (!item || !btn) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = item.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });

    // Close when clicking outside
    document.addEventListener('click', function () {
      if (item.classList.contains('open')) {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        item.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* Highlight current page in the nav */
  function highlightActivePage() {
    var current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#navbar a[href], .nav-more-dropdown a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === current || (current === '' && href === 'index.html')) {
        a.classList.add('nav-active');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

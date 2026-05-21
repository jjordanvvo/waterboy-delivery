(function () {
  'use strict';

  var STORAGE_KEY = 'wb_water_type';

  function isSignedIn() {
    try { return !!localStorage.getItem('wb_user'); } catch (_) { return false; }
  }

  function getStore() {
    return isSignedIn() ? localStorage : sessionStorage;
  }

  function getSaved() {
    try { return getStore().getItem(STORAGE_KEY); } catch (_) { return null; }
  }

  function setSaved(type) {
    try { getStore().setItem(STORAGE_KEY, type); } catch (_) {}
  }

  function dispatchChange(type) {
    try {
      document.dispatchEvent(new CustomEvent('waterTypeChanged', {
        detail: type,
        bubbles: true
      }));
    } catch (_) {}
  }

  function updateBar(type) {
    document.querySelectorAll('.wt-bar-btn').forEach(function (btn) {
      var active = btn.dataset.type === type;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function hideModal() {
    var modal = document.getElementById('wt-modal');
    if (!modal || modal.classList.contains('wt-modal-out')) return;
    modal.classList.add('wt-modal-out');
    setTimeout(function () { modal.style.display = 'none'; }, 380);
  }

  function select(type) {
    setSaved(type);
    updateBar(type);
    dispatchChange(type);
    hideModal();
  }

  function init() {
    // Sticky bar pill buttons
    document.querySelectorAll('.wt-bar-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { select(btn.dataset.type); });
    });

    // Modal option cards — click and keyboard
    document.querySelectorAll('.wt-modal-option').forEach(function (opt) {
      opt.addEventListener('click', function () { select(opt.dataset.type); });
      opt.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select(opt.dataset.type);
        }
      });
    });

    var saved = getSaved();
    if (saved) {
      // User already chose this session/account — apply immediately, skip modal
      updateBar(saved);
      var modal = document.getElementById('wt-modal');
      if (modal) modal.style.display = 'none';
    } else {
      // First visit — show modal, pre-highlight regular in bar
      updateBar('regular');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

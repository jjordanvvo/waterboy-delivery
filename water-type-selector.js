(function () {
  'use strict';

  var STORAGE_KEY = 'wb_water_type';
  var VALID_TYPES = ['ro', 'alkaline', 'hydrogen'];

  function isSignedIn() {
    try { return !!localStorage.getItem('wb_user'); } catch (_) { return false; }
  }

  function getStore() {
    return isSignedIn() ? localStorage : sessionStorage;
  }

  function getSaved() {
    try {
      var v = getStore().getItem(STORAGE_KEY);
      if (v === 'regular') return 'hydrogen'; // backward compat
      return VALID_TYPES.indexOf(v) !== -1 ? v : null;
    } catch (_) { return null; }
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

  function updateNav(type) {
    document.querySelectorAll('.nav-wt-btn').forEach(function (btn) {
      var active = btn.dataset.type === type;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function select(type) {
    setSaved(type);
    updateNav(type);
    dispatchChange(type);
  }

  function init() {
    document.querySelectorAll('.nav-wt-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { select(btn.dataset.type); });
    });

    var saved = getSaved();
    if (saved) {
      updateNav(saved);
    } else {
      select('hydrogen');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

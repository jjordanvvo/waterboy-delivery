/* ============================================================
   WATERBOY DELIVERY - COOKIE CONSENT BANNER
   ============================================================ */

(function () {
  'use strict';

  var KEY = 'wb_cookie_consent';

  function getConsent() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function saveConsent(val) {
    try { localStorage.setItem(KEY, val); } catch (e) {}
  }

  function dismiss() {
    var el = document.getElementById('wb-consent-banner');
    if (!el) return;
    el.style.transform = 'translateY(110%)';
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 380);
  }

  function accept() { saveConsent('accepted'); dismiss(); }
  function decline() { saveConsent('declined'); dismiss(); }

  function createBanner() {
    if (getConsent()) return;
    if (document.getElementById('wb-consent-banner')) return;

    var privacyHref = (function () {
      var path = window.location.pathname;
      if (path.indexOf('/app/') !== -1) return 'privacy.html';
      return 'app/privacy.html';
    })();

    var banner = document.createElement('div');
    banner.id = 'wb-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0', 'z-index:100000',
      'background:#0D1F3C', 'border-top:1px solid #1C2D4A',
      'padding:14px 20px',
      'display:flex', 'align-items:center', 'justify-content:space-between',
      'gap:14px', 'flex-wrap:wrap',
      'box-shadow:0 -4px 24px rgba(0,0,0,0.45)',
      'transition:transform 0.35s cubic-bezier(0.4,0,0.2,1)'
    ].join(';');

    banner.innerHTML =
      '<p style="flex:1;min-width:0;font-family:Inter,sans-serif;font-size:.875rem;' +
      'color:rgba(255,255,255,0.85);line-height:1.55;margin:0">' +
      'This site uses cookies for order processing and analytics. ' +
      '<a href="' + privacyHref + '" style="color:#00D4FF">Privacy Policy</a>' +
      '</p>' +
      '<div style="display:flex;gap:10px;flex-shrink:0">' +
      '<button id="wb-consent-decline" style="font-family:Inter,sans-serif;font-size:.875rem;' +
      'font-weight:600;padding:8px 16px;border-radius:8px;' +
      'background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);' +
      'color:rgba(255,255,255,0.7);cursor:pointer">Decline</button>' +
      '<button id="wb-consent-accept" style="font-family:Inter,sans-serif;font-size:.875rem;' +
      'font-weight:600;padding:8px 20px;border-radius:8px;' +
      'background:#00D4FF;border:none;color:#0A1628;cursor:pointer">Accept</button>' +
      '</div>';

    document.body.appendChild(banner);

    document.getElementById('wb-consent-accept').addEventListener('click', accept);
    document.getElementById('wb-consent-decline').addEventListener('click', decline);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createBanner);
  } else {
    createBanner();
  }

  window.WBConsent = { accept: accept, decline: decline, getConsent: getConsent };
})();

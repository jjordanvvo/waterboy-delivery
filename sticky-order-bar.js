/* ================================================================
   sticky-order-bar.js - Reusable sticky bottom order bar
   Waterboy Delivery
   ----------------------------------------------------------------
   Injects a slim fixed bottom bar with a water-type selector, a
   size selector, and a Continue button that links to the order
   page with ?water=&size= parameters.

   Show / hide:
   - Hidden on load and while the hero is in view.
   - Slides up once the hero has scrolled out of view.
   - Hides again when the final CTA band or the footer enters view
     so it never covers them.
   - A subtle dismiss (X) hides it for the rest of the session
     (sessionStorage), reappearing on a fresh visit.

   To use on another page later, just include this script. It looks
   for ".hero-section" or ".page-hero" as the hero, and ".cta-section"
   or "#footer" as the end markers, and no-ops gracefully if absent.
   ================================================================ */
(function () {
  if (window.__sobInit) return;
  window.__sobInit = true;

  var KEY = 'sob_dismissed';
  try {
    if (sessionStorage.getItem(KEY) === '1') return; // dismissed this session
  } catch (e) { /* sessionStorage unavailable, continue */ }

  function build() {
    var bar = document.createElement('div');
    bar.id = 'sticky-order-bar';
    bar.className = 'sticky-order-bar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Quick order');
    bar.innerHTML =
      '<span class="sob-label">Ready to order?</span>' +
      '<select id="sob-water" class="sob-select" aria-label="Water type">' +
        '<option value="ro">Reverse Osmosis</option>' +
        '<option value="alkaline">Alkaline</option>' +
        '<option value="hydrogen">Hydrogen</option>' +
      '</select>' +
      '<select id="sob-size" class="sob-select" aria-label="Bottle size">' +
        '<option value="3gallon">3 Gallon</option>' +
        '<option value="5gallon" selected>5 Gallon</option>' +
      '</select>' +
      '<a id="sob-continue" class="btn-primary sob-continue" href="water-delivery.html?water=ro&size=5gallon">Continue</a>' +
      '<span class="sob-spacer"></span>' +
      '<button id="sob-dismiss" class="sob-dismiss" type="button" aria-label="Dismiss order bar">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
      '</button>';
    document.body.appendChild(bar);

    var waterSel = bar.querySelector('#sob-water');
    var sizeSel = bar.querySelector('#sob-size');
    var cont = bar.querySelector('#sob-continue');

    function updateLink() {
      cont.setAttribute('href',
        'water-delivery.html?water=' + encodeURIComponent(waterSel.value) +
        '&size=' + encodeURIComponent(sizeSel.value));
    }
    waterSel.addEventListener('change', updateLink);
    sizeSel.addEventListener('change', updateLink);
    updateLink();

    // ---- show / hide state ----
    var dismissed = false;
    var heroVisible = true;   // assume hero is in view at load
    var endVisible = false;

    function update() {
      var show = !dismissed && !heroVisible && !endVisible;
      bar.classList.toggle('sob-visible', show);
      document.body.classList.toggle('sob-bar-open', show);
    }

    var hero = document.querySelector('.hero-section') || document.querySelector('.page-hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        update();
      }, { threshold: 0 }).observe(hero);
    } else {
      heroVisible = false; // no hero to wait on
    }

    // Final CTA band and footer: hide the bar once either enters view so it
    // never covers them. Track each target's state on the element itself and
    // recompute, so order of observer callbacks can never desync the result.
    var endTargets = [];
    var cta = document.querySelector('.cta-section');
    var footer = document.getElementById('footer');
    if (cta) endTargets.push(cta);
    if (footer) endTargets.push(footer);
    if (endTargets.length && 'IntersectionObserver' in window) {
      var endObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.target.__sobInView = e.isIntersecting; });
        endVisible = endTargets.some(function (t) { return t.__sobInView === true; });
        update();
      }, { root: null, rootMargin: '0px 0px 80px 0px', threshold: 0 });
      endTargets.forEach(function (t) { t.__sobInView = false; endObs.observe(t); });
    }

    bar.querySelector('#sob-dismiss').addEventListener('click', function () {
      dismissed = true;
      try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* ignore */ }
      update();
    });

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();

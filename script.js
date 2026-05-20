/* ============================================================
   WATERBOY DELIVERY — MAIN SCRIPT
   ============================================================ */

'use strict';

// ============================================================
// LOADING SCREEN
// ============================================================
(function initLoadingScreen() {
  const screen = document.getElementById('loading-screen');
  if (!screen) return;

  const alreadyLoaded = sessionStorage.getItem('wb_loaded');

  if (alreadyLoaded) {
    screen.style.display = 'none';
    return;
  }

  sessionStorage.setItem('wb_loaded', '1');

  // After 2.9s, crack the curtains open
  setTimeout(() => {
    screen.classList.add('hide');
  }, 2900);

  // After curtain animation completes (0.7s transition), hide entirely
  setTimeout(() => {
    screen.classList.add('done');
    document.body.classList.add('loaded');
  }, 3650);
})();

// ============================================================
// DOM READY
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initMobileMenu();
  initParticles();
  initRipple();
  initScrollReveal();
  initCounters();
  initFAQ();
  initBackToTop();
  initSmoothScroll();
  initCursorTrail();
});

// ============================================================
// NAVBAR — transparent → solid on scroll
// ============================================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ============================================================
// MOBILE MENU — left menu now handled by shop.js wireLeftMenu()
// This stub prevents errors if old mobile-menu HTML is absent
// ============================================================
function initMobileMenu() {
  // Left menu is wired in shop.js wireLeftMenu(); nothing to do here.
}

// ============================================================
// WATER DROPLET PARTICLES (Canvas)
// ============================================================
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isMobile = window.innerWidth < 768;
  const COUNT = isMobile ? 5 : 11; // reduced 40% from original 8/18
  let particles = [];
  let animId;

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle(startAtTop) {
    const size = Math.random() * 4 + 2.5; // 2.5–6.5px
    return {
      x: Math.random() * canvas.width,
      y: startAtTop ? -20 : Math.random() * canvas.height,
      size,
      speedY: Math.random() * 0.6 + 0.25,
      speedX: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.18 + 0.05,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.018 + 0.008,
      swayAmp: Math.random() * 0.4 + 0.1,
    };
  }

  function drawDroplet(x, y, size, opacity) {
    ctx.save();
    ctx.globalAlpha = opacity;
    const grad = ctx.createRadialGradient(x, y - size * 0.2, size * 0.1, x, y, size * 1.4);
    grad.addColorStop(0, 'rgba(100, 230, 255, 0.9)');
    grad.addColorStop(1, 'rgba(0, 140, 200, 0.3)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 1.6);
    ctx.bezierCurveTo(x + size * 1.1, y - size * 0.4, x + size * 1.1, y + size * 0.6, x, y + size * 0.8);
    ctx.bezierCurveTo(x - size * 1.1, y + size * 0.6, x - size * 1.1, y - size * 0.4, x, y - size * 1.6);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p, i) => {
      p.swayAngle += p.swaySpeed;
      p.x += Math.sin(p.swayAngle) * p.swayAmp + p.speedX;
      p.y += p.speedY;
      if (p.y > canvas.height + 20) {
        particles[i] = createParticle(true);
      }
      drawDroplet(p.x, p.y, p.size, p.opacity);
    });
    animId = requestAnimationFrame(animate);
  }

  resize();
  for (let i = 0; i < COUNT; i++) particles.push(createParticle(false));
  animate();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resize();
    }, 200);
  }, { passive: true });
}

// ============================================================
// HERO RIPPLE EFFECT (mouse move)
// ============================================================
function initRipple() {
  const hero = document.getElementById('hero');
  const canvas = document.getElementById('ripple-canvas');
  if (!canvas || !hero || window.matchMedia('(pointer: coarse)').matches) return;

  const ctx = canvas.getContext('2d');
  const ripples = [];

  function resize() {
    canvas.width = hero.offsetWidth;
    canvas.height = hero.offsetHeight;
  }
  resize();

  let lastRippleTime = 0;
  hero.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastRippleTime < 250) return; // one ripple per 250ms max
    lastRippleTime = now;
    const rect = hero.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripples.push({ x, y, r: 0, opacity: 0.06 });
    if (ripples.length > 6) ripples.shift();
  });

  function animRipples() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      rp.r += 0.45;        // half the radius over 2x the duration
      rp.opacity -= 0.00047; // slow fade: ~128 frames to fully disappear
      if (rp.opacity <= 0) { ripples.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,212,255,${rp.opacity})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    requestAnimationFrame(animRipples);
  }
  animRipples();

  window.addEventListener('resize', resize, { passive: true });
}

// ============================================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================================
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

// ============================================================
// NUMBER COUNTERS
// ============================================================
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const isFloat = el.dataset.float === 'true';
      const duration = 1800;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const val = eased * target;
        el.textContent = prefix + (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

// ============================================================
// FAQ ACCORDION
// ============================================================
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      items.forEach(i => i.classList.remove('open'));
      // Open clicked if it was closed
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ============================================================
// BACK TO TOP
// ============================================================
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============================================================
// SMOOTH SCROLL for anchor links
// ============================================================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const navH = document.getElementById('navbar')?.offsetHeight || 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

// ============================================================
// ICE CURSOR TRAIL (desktop only, very subtle)
// ============================================================
function initCursorTrail() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.innerWidth < 1024) return;

  const dots = [];
  const MAX = 12;

  function createDot(x, y) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;
      left:${x}px;top:${y}px;
      width:3px;height:3px;
      border-radius:50%;
      background:rgba(180,230,255,0.55);
      pointer-events:none;
      z-index:9998;
      transform:translate(-50%,-50%);
      transition:opacity 0.45s ease;
    `;
    document.body.appendChild(dot);
    dots.push(dot);
    if (dots.length > MAX) {
      const old = dots.shift();
      old.remove();
    }
    requestAnimationFrame(() => { dot.style.opacity = '0'; });
    setTimeout(() => dot.remove(), 480);
  }

  let lastTrail = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastTrail < 55) return;
    lastTrail = now;
    createDot(e.clientX, e.clientY);
  });
}

// ============================================================
// CONTACT FORM — Netlify success handling
// ============================================================
(function initContactForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form || !success) return;

  form.addEventListener('submit', async (e) => {
    // Netlify handles the form; show success message after brief delay
    const btn = form.querySelector('.btn-submit');
    if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }
    setTimeout(() => {
      form.style.display = 'none';
      success.style.display = 'block';
    }, 1200);
  });
})();

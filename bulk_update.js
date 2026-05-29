const fs = require('fs');
const path = require('path');
const BASE = 'C:\\Users\\silly\\Desktop\\waterboy-delivery\\';

// Nav HTML builders
function navLinks(active) {
  const pages = [
    { href: 'water-delivery.html', label: 'Delivery', key: 'delivery' },
    { href: 'shop.html', label: 'Shop', key: 'shop' },
    { href: 'products.html', label: 'Add-Ons', key: 'addons' },
    { href: 'dispensers.html', label: 'Dispensers', key: 'dispensers' },
    { href: 'about.html', label: 'About', key: 'about' },
  ];
  return pages.map(p => {
    const cls = p.key === active ? 'nav-link active' : 'nav-link';
    return `      <a href="${p.href}" class="${cls}">${p.label}</a>`;
  }).join('\n');
}

function navCenterLinksDiv(active) {
  return `<div class="nav-center-links">\n${navLinks(active)}\n    </div>`;
}

// og block builder
function ogBlock(title, desc, url) {
  return `  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://waterboydelivery.com/${url}" />
  <meta property="og:image" content="https://waterboydelivery.com/social-share.png" />`;
}

// Page configs
const pages = [
  {
    file: 'about.html',
    activeNav: 'about',
    og: ogBlock(
      'About Us | Waterboy Delivery Elk Grove',
      'Learn about Waterboy Delivery — Elk Grove\'s local 5-gallon water delivery service. Family-owned, community-focused, and the only local source for alkaline water.',
      'about.html'
    ),
  },
  {
    file: 'alkaline-water.html',
    activeNav: 'delivery',
    og: ogBlock(
      'Alkaline Water Delivery in Elk Grove | Waterboy Delivery',
      'Elk Grove\'s only alkaline pH 8.5+ water delivery. Starting at $7.99/bottle. Smoother taste, health-conscious hydration delivered to your door.',
      'alkaline-water.html'
    ),
  },
  {
    file: 'bottle-pickup.html',
    activeNav: null,
    og: ogBlock(
      'Free Bottle Pickup | Waterboy Delivery Elk Grove',
      'Schedule free empty 5-gallon bottle pickup in Elk Grove. We collect your empty bottles and return fresh ones — no hassle, no extra cost.',
      'bottle-pickup.html'
    ),
  },
  {
    file: 'contact.html',
    activeNav: null,
    og: ogBlock(
      'Contact Us | Waterboy Delivery Elk Grove',
      'Get in touch with Waterboy Delivery. Call, text, or use our contact form. Located at 7119 Elk Grove Blvd, Elk Grove, CA.',
      'contact.html'
    ),
  },
  {
    file: 'delivery-areas.html',
    activeNav: 'delivery',
    og: ogBlock(
      'Delivery Areas | Waterboy Delivery Elk Grove & Sacramento',
      'Waterboy Delivery serves Elk Grove, Sacramento, and surrounding Sacramento County. Check if we deliver to your address.',
      'delivery-areas.html'
    ),
  },
  {
    file: 'dispensers.html',
    activeNav: 'dispensers',
    og: ogBlock(
      'Water Dispensers — Buy or Rent | Waterboy Delivery Elk Grove',
      'Buy or rent a Brio water dispenser in Elk Grove. Top-load from $129.99 or $10/mo. Bottom-load from $279.99 or $25/mo. Free maintenance with rentals.',
      'dispensers.html'
    ),
    fixFooter: true,
  },
  {
    file: 'faq.html',
    activeNav: null,
    og: ogBlock(
      'FAQ | Waterboy Delivery Elk Grove',
      'Answers to common questions about Waterboy Delivery — water types, delivery scheduling, bottle returns, pricing, and more.',
      'faq.html'
    ),
  },
  {
    file: 'how-it-works.html',
    activeNav: null,
    og: ogBlock(
      'How It Works | Waterboy Delivery Elk Grove',
      'See how Waterboy Delivery works — order online, we deliver 5-gallon bottles to your door, and pick up empties for free. Simple, fast, local.',
      'how-it-works.html'
    ),
  },
  {
    file: 'reverse-osmosis-water.html',
    activeNav: 'delivery',
    og: ogBlock(
      'Reverse Osmosis Water Delivery | Waterboy Delivery Elk Grove',
      'Pure reverse osmosis water delivered to your home or business in Elk Grove. 5-gallon bottles starting at $6.99. Same-day and next-day delivery available.',
      'reverse-osmosis-water.html'
    ),
  },
  {
    file: 'shop.html',
    activeNav: 'shop',
    og: ogBlock(
      'Shop In-Store Products | Waterboy Delivery Elk Grove',
      'Browse in-store products at Waterboy Delivery\'s Elk Grove location. Water, accessories, and more available for pickup at 7119 Elk Grove Blvd.',
      'shop.html'
    ),
  },
  {
    file: 'water-delivery.html',
    activeNav: 'delivery',
    fixOgDesc: true, // fix existing og description (hydrogen price)
  },
  {
    file: 'water-filtration.html',
    activeNav: null,
    og: ogBlock(
      'Water Filtration Process | Waterboy Delivery Elk Grove',
      'Learn how Waterboy Delivery filters and purifies its water. Multi-stage reverse osmosis, alkaline ionization, and hydrogen infusion processes explained.',
      'water-filtration.html'
    ),
  },
  {
    file: 'my-orders.html',
    activeNav: null,
    skipOg: true, // noindex page, skip og
  },
];

let report = [];

for (const cfg of pages) {
  const filePath = BASE + cfg.file;
  let html = fs.readFileSync(filePath, 'utf8');
  let changes = [];

  // 1. Nav update
  if (html.includes('<div class="nav-center-links">')) {
    // Replace existing nav-center-links content
    const oldBlock = html.match(/<div class="nav-center-links">[\s\S]*?<\/div>/);
    if (oldBlock) {
      const newBlock = navCenterLinksDiv(cfg.activeNav);
      html = html.replace(oldBlock[0], newBlock);
      changes.push('Updated nav-center-links');
    }
  } else if (html.includes('<ul class="nav-links"')) {
    // Replace empty nav-links ul with nav-center-links div
    const oldUl = html.match(/<ul class="nav-links"[^>]*><\/ul>/);
    if (oldUl) {
      const newDiv = navCenterLinksDiv(cfg.activeNav);
      html = html.replace(oldUl[0], newDiv);
      changes.push('Replaced nav-links with nav-center-links');
    }
  }

  // 2. og block
  if (!cfg.skipOg && !cfg.fixOgDesc) {
    if (!html.includes('og:title') && cfg.og) {
      // Insert after canonical link
      const canonicalMatch = html.match(/<link rel="canonical"[^>]*\/>/);
      if (canonicalMatch) {
        const insertAfter = canonicalMatch[0];
        const insertIdx = html.indexOf(insertAfter) + insertAfter.length;
        html = html.slice(0, insertIdx) + '\n\n' + cfg.og + html.slice(insertIdx);
      }
      changes.push('Added og: block');
    }
  }

  // 3. Fix water-delivery.html og description (hydrogen price)
  if (cfg.fixOgDesc) {
    if (html.includes('Hydrogen from $12.99')) {
      html = html.replace('Hydrogen from $12.99', 'Hydrogen from $9.99');
      changes.push('Fixed og:description hydrogen price $12.99 → $9.99');
    }
  }

  // 4. Fix footer links for pages with # placeholders
  if (cfg.fixFooter) {
    if (html.includes('<a href="#">Privacy Policy</a>')) {
      html = html.replace('<a href="#">Privacy Policy</a>', '<a href="privacy.html">Privacy Policy</a>');
      changes.push('Fixed footer privacy link');
    }
    if (html.includes('<a href="#">Terms of Service</a>')) {
      html = html.replace('<a href="#">Terms of Service</a>', '<a href="terms.html">Terms of Service</a>');
      changes.push('Fixed footer terms link');
    }
  }

  // 5. Add Add-Ons to left drawer (after Shop Products link)
  if (html.includes('<a href="shop.html" class="left-drawer-link">Shop Products</a>') &&
      !html.includes('<a href="products.html" class="left-drawer-link">Add-Ons</a>')) {
    html = html.replace(
      '<a href="shop.html" class="left-drawer-link">Shop Products</a>',
      '<a href="shop.html" class="left-drawer-link">Shop Products</a>\n      <a href="products.html" class="left-drawer-link">Add-Ons</a>'
    );
    changes.push('Added Add-Ons to left drawer');
  }

  fs.writeFileSync(filePath, html, 'utf8');
  report.push(cfg.file + ': ' + (changes.length ? changes.join(', ') : 'no changes'));
}

console.log('=== BULK UPDATE REPORT ===');
report.forEach(r => console.log(r));

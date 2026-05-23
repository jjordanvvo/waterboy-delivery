#!/usr/bin/env python3
"""
Waterboy Delivery — Patch Script
Run from: C:\\Users\\silly\\Desktop\\waterboy-delivery
Usage:    python fix_waterboy.py
"""
import os, sys, re

def patch(filename, replacements, label=""):
    path = filename
    if not os.path.exists(path):
        print(f"  SKIP (not found): {filename}")
        return False
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"  WARNING: pattern not found in {filename}: {repr(old[:60])}...")
    if content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  OK  {filename}{' — ' + label if label else ''}")
        return True
    else:
        print(f"  SKIP {filename} (already patched or no match)")


print("\n=== Waterboy Delivery Patch Script ===\n")

# ─── 1. netlify.toml ──────────────────────────────────────────────────────────
print("[1/6] netlify.toml — fix SPA redirect to per-page + 404 fallback")
NETLIFY = '''[build]
  publish = "."

# Clean URLs
[[redirects]]
  from = "/products"
  to = "/products.html"
  status = 200

[[redirects]]
  from = "/shop"
  to = "/shop.html"
  status = 200

[[redirects]]
  from = "/dispensers"
  to = "/dispensers.html"
  status = 200

[[redirects]]
  from = "/about"
  to = "/about.html"
  status = 200

[[redirects]]
  from = "/contact"
  to = "/contact.html"
  status = 200

[[redirects]]
  from = "/how-it-works"
  to = "/how-it-works.html"
  status = 200

[[redirects]]
  from = "/faq"
  to = "/faq.html"
  status = 200

[[redirects]]
  from = "/order"
  to = "/order.html"
  status = 200

[[redirects]]
  from = "/water-delivery"
  to = "/water-delivery.html"
  status = 200

[[redirects]]
  from = "/delivery-areas"
  to = "/delivery-areas.html"
  status = 200

[[redirects]]
  from = "/bottle-pickup"
  to = "/bottle-pickup.html"
  status = 200

[[redirects]]
  from = "/my-orders"
  to = "/my-orders.html"
  status = 200

[[redirects]]
  from = "/water-filtration"
  to = "/water-filtration.html"
  status = 200

[[redirects]]
  from = "/alkaline-water"
  to = "/alkaline-water.html"
  status = 200

[[redirects]]
  from = "/reverse-osmosis-water"
  to = "/reverse-osmosis-water.html"
  status = 200

[[redirects]]
  from = "/app/customer"
  to = "/app/customer.html"
  status = 200

[[redirects]]
  from = "/app/driver"
  to = "/app/driver.html"
  status = 200

[[redirects]]
  from = "/app/admin"
  to = "/app/admin.html"
  status = 200

# 404 fallback — NOT an SPA, status must be 404
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 404

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/styles.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/script.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.png"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.jpg"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
'''
with open('netlify.toml', 'w', encoding='utf-8') as f:
    f.write(NETLIFY)
print("  OK  netlify.toml")


# ─── 2. products.html ─────────────────────────────────────────────────────────
print("\n[2/6] products.html — names, images, dispenser links, cart button, css")
patch('products.html', [
    # 3-Gallon Alkaline Water (was "5-Gallon Jug (Empty)")
    ('alt="3-Gallon Tall Bottle"',         'alt="3-Gallon Alkaline Water"'),
    ('>5-Gallon Jug (Empty)<',             '>3-Gallon Alkaline Water<'),
    ('BPA-free polycarbonate jug. Reusable for years.',
     'Alkaline ionized water, pH 8.5–9.5. Electrolyte enhanced, compact size.'),
    ('<p class="catalog-price" style="font-family:\'Inter\',sans-serif;font-weight:600;color:#00D4FF;">$12.99 each</p>',
     '<p class="catalog-price" style="font-family:\'Inter\',sans-serif;font-weight:600;color:#00D4FF;">$5.99 per bottle</p>'),
    # 3-Gallon Hydrogen Water (was "3-Gallon Jug (Empty)")
    ('alt="3-Gallon Jug with Spigot"',     'alt="3-Gallon Hydrogen Water"'),
    ('>3-Gallon Jug (Empty)<',             '>3-Gallon Hydrogen Water<'),
    ('Compact BPA-free jug. Fits small countertop dispensers.',
     'Hydrogen-infused antioxidant water in a compact 3-gallon size. Premium wellness choice.'),
    ('<p class="catalog-price" style="font-family:\'Inter\',sans-serif;font-weight:600;color:#00D4FF;">$9.99 each</p>',
     '<p class="catalog-price" style="font-family:\'Inter\',sans-serif;font-weight:600;color:#00D4FF;">$7.99 per bottle</p>'),
    # Dispenser rent links
    ('href="/dispensers"',                 'href="dispensers.html"'),
    # Image CSS
    ('.catalog-img-wrap img{object-fit:cover;padding:0;}',
     '.catalog-img-wrap img{object-fit:cover;width:100%;height:100%;padding:0;}'),
    # Cart button
    ("onclick=\"document.getElementById('cart-modal').style.display='flex'\"",
     'onclick="window.openCartSidebar&&window.openCartSidebar()"'),
])


# ─── 3. shop.html ─────────────────────────────────────────────────────────────
print("\n[3/6] shop.html — JS reads price from HTML, cart button")
patch('shop.html', [
    # Fix JS to read price from .menu-card-price span
    ("      var name=nameEl?nameEl.textContent.trim():'?';\n      var rc=reviews[i]||99;",
     "      var priceEl=info.querySelector('.menu-card-price');\n"
     "      var name=nameEl?nameEl.textContent.trim():'?';\n"
     "      var price=priceEl?priceEl.textContent.trim():'?';\n"
     "      var rc=reviews[i]||99;"),
    ("'<div class=\"mca-price\">?</div>'+",
     "'<div class=\"mca-price\">'+price+'</div>'+"),
    # Cart button
    ("onclick=\"document.getElementById('cart-modal').style.display='flex'\"",
     'onclick="window.openCartSidebar&&window.openCartSidebar()"'),
])


# ─── 4. index.html ────────────────────────────────────────────────────────────
print("\n[4/6] index.html — remove duplicate nav button, fix featured section, remove app section, cart button")

with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# Remove duplicate "My Orders" from nav-right (it's already in center links)
idx = idx.replace(
    '    <a href="my-orders.html" class="hn-sign-in">My Orders</a>\n',
    ''
)

# Fix cart button
idx = idx.replace(
    "onclick=\"document.getElementById('cart-modal').style.display='flex'\"",
    'onclick="window.openCartSidebar&&window.openCartSidebar()"'
)

# Replace old featured cards 3-6 with correct items
OLD_CARDS = (
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/5%20Gallon%20Bottle.jpg" alt="5-Gallon Jug (Empty)" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">5-Gallon Jug (Empty)</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(67)</span></div>\n'
    '              <div class="hn-pc-price">$12.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>\n\n'
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/3%20Gallon%20Bottle%20.jpg" alt="3-Gallon RO Water" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">3-Gallon RO Water</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(212)</span></div>\n'
    '              <div class="hn-pc-price">$4.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>\n\n'
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/Cans.jpg" alt="LMNT Electrolyte Cans" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">LMNT Electrolyte Cans</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(312)</span></div>\n'
    '              <div class="hn-pc-price">$4.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>\n\n'
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/Pack1.PNG" alt="LMNT Electrolyte Packets" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">LMNT Electrolyte Packets</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(187)</span></div>\n'
    '              <div class="hn-pc-price">$2.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>'
)
NEW_CARDS = (
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/Cans.jpg" alt="LMNT Electrolyte Cans" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">LMNT Electrolyte Cans</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(312)</span></div>\n'
    '              <div class="hn-pc-price">$4.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>\n\n'
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/Pack1.PNG" alt="LMNT Electrolyte Packets" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">LMNT Electrolyte Packets</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(187)</span></div>\n'
    '              <div class="hn-pc-price">$2.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>\n\n'
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/Box.PNG" alt="Zipfizz Energy Drink Mix" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">Zipfizz Energy Drink Mix</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(134)</span></div>\n'
    '              <div class="hn-pc-price">$34.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>\n\n'
    '          <a href="products.html" class="hn-pc">\n'
    '            <div class="hn-pc-img">\n'
    '              <img src="Images%20for%20Menu/Images%20for%20Menu/Hyd.PNG" alt="Echo Hydrogen Prebiotic Packet" loading="lazy">\n'
    '            </div>\n'
    '            <div class="hn-pc-info">\n'
    '              <div class="hn-pc-name">Echo Hydrogen Prebiotic Packet</div>\n'
    '              <div class="hn-pc-stars">★★★★★ <span style="opacity:.5;font-size:10px;">(89)</span></div>\n'
    '              <div class="hn-pc-price">$1.99</div>\n'
    '              <span class="hn-pc-atc">Shop Now</span>\n'
    '            </div>\n'
    '          </a>'
)
if OLD_CARDS in idx:
    idx = idx.replace(OLD_CARDS, NEW_CARDS)
    print("  OK  index.html — featured cards replaced")
else:
    print("  WARN index.html — featured cards pattern not found; check manually")

# Remove App Store / Google Play section
idx = re.sub(
    r'<!--\s*={10,}\s*\n\s*APP / MANAGE SECTION.*?</section>\s*\n',
    '',
    idx,
    flags=re.DOTALL
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)
print("  OK  index.html — done")


# ─── 5. cart-modal.js ─────────────────────────────────────────────────────────
print("\n[5/6] cart-modal.js — Customers Also Bought, Checkout button, subtotal row")

OLD_SIDEBAR = (
    "    var aside = document.createElement('div');\n"
    "    aside.id = 'wb-cart-sidebar';\n"
    "    aside.innerHTML =\n"
    "      '<div class=\"wbcs-header\">' +\n"
    "        '<span class=\"wbcs-title\">Your Cart</span>' +\n"
    "        '<button class=\"wbcs-close\" onclick=\"window.closeCartSidebar()\" aria-label=\"Close cart\">✕</button>' +\n"
    "      '</div>' +\n"
    "      '<div class=\"wbcs-body\" id=\"cart-sidebar-items\"></div>' +\n"
    "      '<div class=\"wbcs-footer\">' +\n"
    "        '<div class=\"wbcs-total-row\"><span>Total</span><span id=\"cart-total\">$0.00</span></div>' +\n"
    "        '<a href=\"shop.html\" class=\"wbcs-shop-btn\">Shop Products</a>' +\n"
    "      '</div>';\n"
    "    document.body.appendChild(aside);"
)

NEW_SIDEBAR = (
    "    var aside = document.createElement('div');\n"
    "    aside.id = 'wb-cart-sidebar';\n"
    "    aside.innerHTML =\n"
    "      '<div class=\"wbcs-header\">' +\n"
    "        '<span class=\"wbcs-title\">Your Cart</span>' +\n"
    "        '<button class=\"wbcs-close\" onclick=\"window.closeCartSidebar()\" aria-label=\"Close cart\">✕</button>' +\n"
    "      '</div>' +\n"
    "      '<div class=\"wbcs-body\" id=\"cart-sidebar-items\"></div>' +\n"
    "      '<div class=\"wbcs-footer\">' +\n"
    "        '<div class=\"wbcs-total-row\"><span>Subtotal</span><span id=\"cart-subtotal\">$0.00</span></div>' +\n"
    "        '<div class=\"wbcs-total-row\"><span>Total</span><span id=\"cart-total\">$0.00</span></div>' +\n"
    "        '<a href=\"order.html\" class=\"wbcs-shop-btn\" style=\"margin-bottom:12px;\">Checkout →</a>' +\n"
    "        '<div id=\"wbcs-also-bought\" style=\"margin-top:4px;\">' +\n"
    "          '<div style=\"font-family:\\'Inter\\',sans-serif;font-size:11px;font-weight:700;color:rgba(184,230,255,0.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;\">Customers Also Bought</div>' +\n"
    "          '<div style=\"display:flex;flex-direction:column;gap:8px;\" id=\"wbcs-also-items\"></div>' +\n"
    "        '</div>' +\n"
    "      '</div>';\n"
    "    document.body.appendChild(aside);\n"
    "    var alsoBought=[\n"
    "      {name:'LMNT Electrolyte Cans',price:'$4.99',img:'Images%20for%20Menu/Images%20for%20Menu/Cans.jpg',priceNum:4.99},\n"
    "      {name:'LMNT Electrolyte Packets',price:'$2.99',img:'Images%20for%20Menu/Images%20for%20Menu/Pack1.PNG',priceNum:2.99},\n"
    "      {name:'Zipfizz Energy Drink Mix',price:'$34.99',img:'Images%20for%20Menu/Images%20for%20Menu/Box.PNG',priceNum:34.99},\n"
    "      {name:'Echo Hydrogen Prebiotic Packet',price:'$1.99',img:'Images%20for%20Menu/Images%20for%20Menu/Hyd.PNG',priceNum:1.99}\n"
    "    ];\n"
    "    var alsoContainer=aside.querySelector('#wbcs-also-items');\n"
    "    alsoBought.forEach(function(p){\n"
    "      var row=document.createElement('div');\n"
    "      row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.1);border-radius:8px;';\n"
    "      row.innerHTML='<img src=\"'+p.img+'\" style=\"width:40px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;\" alt=\"'+p.name+'\" />'\n"
    "        +'<div style=\"flex:1;min-width:0;\"><div style=\"font-family:\\'Inter\\',sans-serif;font-size:12px;font-weight:600;color:#F0F7FF;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;\">'+p.name+'</div>'\n"
    "        +'<div style=\"font-family:\\'Inter\\',sans-serif;font-size:12px;color:#00D4FF;font-weight:700;\">'+p.price+'</div></div>'\n"
    "        +'<button style=\"background:#00D4FF;border:none;color:#0B1B2B;font-family:\\'Outfit\\',sans-serif;font-size:11px;font-weight:800;padding:6px 10px;border-radius:6px;cursor:pointer;flex-shrink:0;transition:background 0.15s;\"'\n"
    "        +' data-also-name=\"'+p.name+'\" data-also-price=\"'+p.priceNum+'\" data-also-img=\"'+p.img+'\">+ Add</button>';\n"
    "      alsoContainer.appendChild(row);\n"
    "    });\n"
    "    alsoContainer.addEventListener('click',function(e){\n"
    "      var btn=e.target.closest('[data-also-name]');\n"
    "      if(!btn)return;\n"
    "      addToCart({productName:btn.getAttribute('data-also-name'),quantity:1,\n"
    "        pricePerUnit:parseFloat(btn.getAttribute('data-also-price'))||0,\n"
    "        subtotal:parseFloat(btn.getAttribute('data-also-price'))||0,\n"
    "        image:btn.getAttribute('data-also-img'),timestamp:Date.now()});\n"
    "      btn.textContent='✓';btn.style.background='#22c55e';\n"
    "      setTimeout(function(){btn.textContent='+ Add';btn.style.background='#00D4FF';},1500);\n"
    "      renderCartSidebar();\n"
    "    });"
)

with open('cart-modal.js', 'r', encoding='utf-8') as f:
    cm = f.read()
if OLD_SIDEBAR in cm:
    cm = cm.replace(OLD_SIDEBAR, NEW_SIDEBAR)
    with open('cart-modal.js', 'w', encoding='utf-8') as f:
        f.write(cm)
    print("  OK  cart-modal.js")
else:
    print("  SKIP cart-modal.js (already patched or pattern changed)")


# ─── 6. All other pages — cart button + hamburger ─────────────────────────────
print("\n[6/6] All pages — cart button onclick + hamburger top-right")

BROKEN_CART = "onclick=\"document.getElementById('cart-modal').style.display='flex'\""
FIXED_CART  = 'onclick="window.openCartSidebar&&window.openCartSidebar()"'

other_pages = [
    'about.html', 'alkaline-water.html', 'bottle-pickup.html', 'contact.html',
    'delivery-areas.html', 'dispensers.html', 'faq.html', 'how-it-works.html',
    'my-orders.html', 'order.html', 'reverse-osmosis-water.html',
    'water-delivery.html', 'water-filtration.html',
]
for page in other_pages:
    if not os.path.exists(page):
        continue
    with open(page, 'r', encoding='utf-8') as f:
        c = f.read()
    if BROKEN_CART in c:
        c = c.replace(BROKEN_CART, FIXED_CART)
        with open(page, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f"  OK  {page} — cart button fixed")

# Fix hamburger to top-right on mobile via global.css
HAMBURGER_OLD = '@media (max-width: 900px) {\n  .nav-right { display: none; }\n}'
HAMBURGER_NEW = '@media (max-width: 900px) {\n  .nav-right { display: none; }\n  #navbar .nav-menu-btn, #navbar button.nav-menu-btn { margin-left: auto !important; }\n}'
patch('global.css', [(HAMBURGER_OLD, HAMBURGER_NEW)], 'hamburger → top-right on mobile')

print("\n=== All patches applied ===")
print("\nNext step — commit and push:")
print('  git add .')
print('  git commit -m "fix: products/shop/homepage/cart overhaul — v2"')
print('  git push')
print('  git push mine main --force')

#!/usr/bin/env python3
"""
Waterboy Delivery — Full Update v3
Run from: C:\\Users\\silly\\Desktop\\waterboy-delivery
Usage: python fix_v3.py
"""
import os, re

def rw(path, fn):
    with open(path,'r',encoding='utf-8') as f: c=f.read()
    c2=fn(c)
    if c2!=c:
        with open(path,'w',encoding='utf-8') as f: f.write(c2)
        print(f'  OK  {path}')
    else:
        print(f'  SKIP {path} (no change / already done)')

print('\n=== Waterboy v3 Full Update ===\n')

# ─────────────────────────────────────────────────────────────────
# 1. PRODUCTS.HTML — fill TBD prices + add missing descriptions
# ─────────────────────────────────────────────────────────────────
print('[1/5] products.html')
def fix_products(c):
    # 3-Gallon Glass Bottle — add desc
    c=c.replace(
        '<p class="catalog-name">3-Gallon Glass Bottle</p>\n            <p class="catalog-price">$7.50 / jug</p>',
        '<p class="catalog-name">3-Gallon Glass Bottle</p>\n            <p class="catalog-desc">Premium borosilicate glass jug — pure taste, zero plastic contact. Reusable, eco-friendly, fits countertop dispensers.</p>\n            <p class="catalog-price">$7.50 / jug</p>'
    )
    # Half-Gallon Glass Bottle
    c=c.replace(
        '<p class="catalog-name">Half-Gallon Glass Bottle</p>\n            <p class="catalog-price tbd">[Price Coming Soon]</p>',
        '<p class="catalog-name">Half-Gallon Glass Bottle</p>\n            <p class="catalog-desc">Sleek glass bottle for daily hydration. Pure taste, zero plastic. Dishwasher safe, airtight lid included.</p>\n            <p class="catalog-price">$3.99</p>'
    )
    # 32oz Glass Bottle
    c=c.replace(
        '<p class="catalog-name">32oz Glass Bottle</p>\n            <p class="catalog-price tbd">[Price Coming Soon]</p>',
        '<p class="catalog-name">32oz Glass Bottle</p>\n            <p class="catalog-desc">Compact glass water bottle for everyday on-the-go use. Crystal clear, BPA-free, and easy to clean.</p>\n            <p class="catalog-price">$2.99</p>'
    )
    # 36oz Aluminum Bottle
    c=c.replace(
        '<p class="catalog-name">36oz Aluminum Bottle</p>\n            <p class="catalog-price tbd">[Price Coming Soon]</p>',
        '<p class="catalog-name">36oz Aluminum Bottle</p>\n            <p class="catalog-desc">Wide-mouth aluminum bottle built for active use. Double-wall insulated — keeps water cold for hours. Lightweight and durable.</p>\n            <p class="catalog-price">$14.99</p>'
    )
    # Skinny 12oz Aluminum Bottle
    c=c.replace(
        '<p class="catalog-name">Skinny 12oz Aluminum Bottle</p>\n            <p class="catalog-price tbd">[Price Coming Soon]</p>',
        '<p class="catalog-name">Skinny 12oz Aluminum Bottle</p>\n            <p class="catalog-desc">Slim, portable aluminum bottle perfect for the gym, commute, or kids. Leak-proof lid, lightweight design.</p>\n            <p class="catalog-price">$9.99</p>'
    )
    # 30oz Aluminum Coffee Mug
    c=c.replace(
        '<p class="catalog-name">30oz Aluminum Coffee Mug</p>\n            <p class="catalog-price tbd">[Price Coming Soon]</p>',
        '<p class="catalog-name">30oz Aluminum Coffee Mug</p>\n            <p class="catalog-desc">Double-wall aluminum mug — keeps drinks cold or hot for hours. Fits standard cup holders, spill-resistant lid.</p>\n            <p class="catalog-price">$19.99</p>'
    )
    # Ceramic Water Crock
    c=c.replace(
        '<p class="catalog-name">Ceramic Water Crock</p>\n            <p class="catalog-price tbd">[Price Coming Soon]</p>',
        '<p class="catalog-name">Ceramic Water Crock</p>\n            <p class="catalog-desc">Classic ceramic crock for elegant home water serving. Gravity-fed, holds a 5-gallon jug, no electricity required.</p>\n            <p class="catalog-price">$24.99</p>'
    )
    return c
rw('products.html', fix_products)

# ─────────────────────────────────────────────────────────────────
# 2. SHOP.JS — Buy Now button, Customers Also Bought, descriptions
# ─────────────────────────────────────────────────────────────────
print('\n[2/5] shop.js')
def fix_shopjs(c):
    # a) Add Buy Now button to pd-modal HTML
    c=c.replace(
        '     <button class="wb-btn pd-atc" style="margin-top:14px">Add to Cart</button>\n    </div>\n   </div>\n  </div>\n </div>\n</div>\n\n<!-- Checkout Overlay',
        '     <button class="wb-btn pd-atc" style="margin-top:14px">Add to Cart</button>\n     <button class="wb-btn pd-buy-now" style="margin-top:8px;background:transparent;border:1.5px solid #00D4FF;color:#00D4FF;">Buy Now — Checkout Instantly</button>\n    </div>\n   </div>\n  </div>\n </div>\n</div>\n\n<!-- Checkout Overlay'
    )

    # b) Wire Buy Now in openProductDetailFromCard
    c=c.replace(
        "  if(atcBtn){\n    if(price){\n      atcBtn.style.display='flex';\n      atcBtn.onclick=()=>{ addToCartRaw(name,price,img,modal._qty); closeOverlay('pd-overlay'); toast(name,'Added '+modal._qty+' to cart',''); };\n    } else {\n      atcBtn.style.display='none';\n    }\n  }\n  openOverlay('pd-overlay');",
        "  if(atcBtn){\n    if(price){\n      atcBtn.style.display='flex';\n      atcBtn.onclick=()=>{ addToCartRaw(name,price,img,modal._qty); closeOverlay('pd-overlay'); toast(name,'Added '+modal._qty+' to cart',''); };\n    } else {\n      atcBtn.style.display='none';\n    }\n  }\n  const buyNowBtn=modal.querySelector('.pd-buy-now');\n  if(buyNowBtn){\n    if(price){\n      buyNowBtn.style.display='flex';\n      buyNowBtn.onclick=()=>{ addToCartRaw(name,price,img,modal._qty); closeOverlay('pd-overlay'); gotoStep('checkout-overlay',0); openOverlay('checkout-overlay'); };\n    } else {\n      buyNowBtn.style.display='none';\n    }\n  }\n  openOverlay('pd-overlay');"
    )

    # c) Add Customers Also Bought to cart drawer HTML
    c=c.replace(
        '   <button class="wb-btn" id="cd-checkout-btn" style="margin-top:14px">Proceed to Checkout</button>\n   <button class="wb-btn-ghost" id="cd-continue-btn">Continue Shopping</button>\n  </div>\n </div>\n</div>\n\n<!-- Qty Modal',
        '   <button class="wb-btn" id="cd-checkout-btn" style="margin-top:14px">Proceed to Checkout</button>\n   <button class="wb-btn-ghost" id="cd-continue-btn">Continue Shopping</button>\n   <div class="cd-also-bought" style="margin-top:16px;border-top:1px solid rgba(0,212,255,0.12);padding-top:14px;">\n    <div style="font-family:\'Inter\',sans-serif;font-size:11px;font-weight:700;color:rgba(184,230,255,0.55);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Customers Also Bought</div>\n    <div id="cd-also-items" style="display:flex;flex-direction:column;gap:8px;"></div>\n   </div>\n  </div>\n </div>\n</div>\n\n<!-- Qty Modal'
    )

    # d) Add ALSO_BOUGHT array + renderAlsoBought function before renderCartDrawer
    ALSO = """\n/* ── Customers Also Bought ───────────────────────────────────────── */
const ALSO_BOUGHT=[
  {name:'LMNT Electrolyte Cans',price:4.99,display:'$4.99 / can',img:'Images%20for%20Menu/Images%20for%20Menu/Cans.jpg'},
  {name:'LMNT Electrolyte Packets',price:2.99,display:'$2.99 / pkt',img:'Images%20for%20Menu/Images%20for%20Menu/Pack1.PNG'},
  {name:'Zipfizz Energy Drink Mix',price:39.99,display:'$39.99 / 30-pack',img:'Images%20for%20Menu/Images%20for%20Menu/Box.PNG'},
  {name:'Echo Hydrogen Prebiotic Drink Mix',price:4.99,display:'$4.99 / pkt',img:'Images%20for%20Menu/Images%20for%20Menu/Hyd.PNG'},
];

function renderAlsoBought(){
  const wrap=document.getElementById('cd-also-items');
  if(!wrap) return;
  const inCart=cart.map(i=>(i.name||i.id||'').toLowerCase());
  const toShow=ALSO_BOUGHT.filter(p=>!inCart.some(n=>n.includes(p.name.slice(0,6).toLowerCase())));
  const parent=wrap.closest('.cd-also-bought');
  if(!toShow.length){if(parent)parent.style.display='none';return;}
  if(parent)parent.style.display='';
  wrap.innerHTML=toShow.slice(0,3).map(p=>`
    <div style="display:flex;align-items:center;gap:10px;padding:8px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.1);border-radius:8px;">
      <img src="${p.img}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;" alt="${p.name}" loading="lazy"/>
      <div style="flex:1;min-width:0;">
        <div style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#F0F7FF;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
        <div style="font-family:'Inter',sans-serif;font-size:12px;color:#00D4FF;font-weight:700;">${p.display}</div>
      </div>
      <button onclick="addToCartRaw(this.dataset.n,parseFloat(this.dataset.p),this.dataset.i,1);renderCartDrawer();" data-n="${p.name.replace(/"/g,'&quot;')}" data-p="${p.price}" data-i="${p.img}" style="background:#00D4FF;border:none;color:#0B1B2B;font-family:'Outfit',sans-serif;font-size:11px;font-weight:800;padding:6px 10px;border-radius:6px;cursor:pointer;flex-shrink:0;transition:background 0.15s;">+ Add</button>
    </div>`).join('');
}

"""
    c=c.replace('/* ── Cart Logic', ALSO+'/* ── Cart Logic', 1)

    # e) Call renderAlsoBought inside renderCartDrawer (call it at the top of the fn)
    c=c.replace(
        'function renderCartDrawer(){\n  const body = document.getElementById(\'cd-body\');\n  if(!body) return;',
        'function renderCartDrawer(){\n  const body = document.getElementById(\'cd-body\');\n  if(!body) return;\n  renderAlsoBought();'
    )

    # f) Improve descriptions for glass/aluminum bottles
    c=c.replace(
        "  if(n.includes('glass bottle')||n.includes('glass jug')) return 'Premium glass bottle — pure taste with zero plastic contact. Reusable and eco-friendly.';",
        "  if(n.includes('half-gallon')||n.includes('half gallon')) return 'Sleek 64oz glass bottle for daily hydration. Pure taste with zero plastic leach. Dishwasher safe, airtight lid. Great for home or office.';\n  if(n.includes('32oz glass')) return 'Compact 32oz glass water bottle — perfect for on-the-go. Crystal clear, BPA-free, easy to clean, fits standard cup holders.';\n  if(n.includes('3-gallon glass')||n.includes('3 gallon glass')) return 'Premium 3-gallon borosilicate glass jug. Pure taste with zero plastic contact — ideal for countertop dispensers. Reusable and eco-friendly.';\n  if(n.includes('glass bottle')||n.includes('glass jug')) return 'Premium glass bottle — pure taste with zero plastic contact. Reusable and eco-friendly.';"
    )
    c=c.replace(
        "  if(n.includes('aluminum')||n.includes('coffee mug')) return 'Lightweight aluminum bottle — perfect for on-the-go hydration. Durable, eco-friendly, and reusable.';",
        "  if(n.includes('36oz aluminum')) return 'Wide-mouth 36oz aluminum bottle for active use. Double-wall insulated keeps water cold for hours. Leak-proof, lightweight, built to last.';\n  if(n.includes('12oz')||n.includes('skinny')) return 'Slim 12oz aluminum bottle — perfect for the gym, commute, or kids. Leak-proof lid, lightweight design, fits any bag.';\n  if(n.includes('coffee mug')) return 'Double-wall 30oz aluminum mug — keeps drinks cold or hot for hours. Fits standard cup holders, spill-resistant sliding lid.';\n  if(n.includes('aluminum')) return 'Lightweight aluminum bottle — durable, eco-friendly, perfect for on-the-go hydration.';"
    )
    c=c.replace(
        "  if(n.includes('crock')) return 'Elegant ceramic water crock — a classic way to serve cold water in your home. Contact us for pricing.';",
        "  if(n.includes('crock')) return 'Classic ceramic water crock for elegant home water serving. Gravity-fed, holds a standard 5-gallon jug, no electricity required. Timeless design for any kitchen.';"
    )

    return c
rw('shop.js', fix_shopjs)

# ─────────────────────────────────────────────────────────────────
# 3. INDEX.HTML — nav buttons, stats, hamburger left
# ─────────────────────────────────────────────────────────────────
print('\n[3/5] index.html')
def fix_index(c):
    # a) Remove stats section
    c=re.sub(
        r'<!-- =+\s*\n\s*STATS ROW.*?</section>\s*\n',
        '',
        c, flags=re.DOTALL
    )
    # b) Fix nav-right: remove Order Now, consolidate to Sign Up / Log In
    c=c.replace(
        '    <a href="order.html" class="hn-get-started" style="background:#00D4FF;color:#0B1B2B;">Order Now</a>\n    <a href="javascript:void(0)" class="hn-sign-in" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signin\')">Sign In</a>\n    <a href="javascript:void(0)" class="hn-get-started" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signup\')">Get Started</a>',
        '    <a href="javascript:void(0)" class="hn-get-started" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signin\')" style="background:#00D4FF;color:#0B1B2B;">Sign Up / Log In</a>'
    )
    # c) Fix hamburger: move it BEFORE the logo (so it's DOM-first = left side)
    # Remove hamburger from its current position after nav-right
    c=c.replace(
        '\n  <!-- Hamburger (mobile) -->\n  <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open site navigation" aria-expanded="false" aria-controls="left-drawer">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>\n  </button>\n\n  <!-- nav-links ul — kept for script.js compat -->\n  <ul class="nav-links" role="list" style="list-style:none;margin:0;padding:0;display:none;"></ul>\n\n</nav>',
        '\n\n  <!-- nav-links ul — kept for script.js compat -->\n  <ul class="nav-links" role="list" style="list-style:none;margin:0;padding:0;display:none;"></ul>\n\n</nav>'
    )
    # Place hamburger as FIRST child of nav
    c=c.replace(
        '<nav id="navbar" role="navigation" aria-label="Main navigation">\n\n  <!-- Logo -->',
        '<nav id="navbar" role="navigation" aria-label="Main navigation">\n\n  <!-- Hamburger (mobile) — must be first for top-left positioning -->\n  <button class="nav-menu-btn" id="nav-menu-btn" aria-label="Open site navigation" aria-expanded="false" aria-controls="left-drawer" style="order:0;">\n    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>\n  </button>\n\n  <!-- Logo -->'
    )
    return c
rw('index.html', fix_index)

# ─────────────────────────────────────────────────────────────────
# 4. HOMEPAGE.CSS — hamburger order fix
# ─────────────────────────────────────────────────────────────────
print('\n[4/5] homepage.css')
def fix_homecss(c):
    # Change hamburger order from 3 to 0 so it stays left on desktop too
    c=c.replace('  order: 3;\n  flex-shrink: 0;\n}\n.nav-menu-btn span { display: none; }',
                '  order: 0;\n  flex-shrink: 0;\n}\n.nav-menu-btn span { display: none; }')
    # Fix mobile: remove margin-left auto (that pushed it right)
    c=c.replace('  .nav-menu-btn { display: flex; margin-left: auto; }',
                '  .nav-menu-btn { display: flex; margin-left: 0; }')
    return c
rw('homepage.css', fix_homecss)

# ─────────────────────────────────────────────────────────────────
# 5. ALL PAGES — nav button consolidation
# ─────────────────────────────────────────────────────────────────
print('\n[5/5] All inner pages — nav buttons')

INNER_PAGES = [
    'products.html','shop.html','about.html','alkaline-water.html',
    'bottle-pickup.html','contact.html','delivery-areas.html',
    'dispensers.html','faq.html','how-it-works.html','my-orders.html',
    'order.html','reverse-osmosis-water.html','water-delivery.html',
    'water-filtration.html',
]

# Pattern: Remove Order Now (nav-btn-cyan), Sign In (nav-btn-outline), Get Started (nav-btn-primary)
# Replace with single Sign Up / Log In button

OLD_NAV = (
    '      <a href="my-orders.html" class="nav-btn-outline">My Orders</a>\n'
    '      <a href="order.html" class="nav-btn-cyan">Order Now</a>\n'
    '      <a href="javascript:void(0)" class="nav-btn-outline" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signin\')">Sign In</a>\n'
    '      <a href="javascript:void(0)" class="nav-btn-primary" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signup\')">Get Started</a>'
)
NEW_NAV = (
    '      <a href="javascript:void(0)" class="nav-btn-cyan" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signin\')" style="font-size:13px;padding:8px 18px;">Sign Up / Log In</a>'
)

for page in INNER_PAGES:
    if not os.path.exists(page): continue
    with open(page,'r',encoding='utf-8') as f: c=f.read()
    if OLD_NAV in c:
        c=c.replace(OLD_NAV, NEW_NAV)
        with open(page,'w',encoding='utf-8') as f: f.write(c)
        print(f'  OK  {page}')
    else:
        # Try partial matches for pages with slightly different structure
        changed = False
        # Remove Order Now nav-btn-cyan
        if '<a href="order.html" class="nav-btn-cyan">Order Now</a>' in c:
            c=c.replace('\n      <a href="order.html" class="nav-btn-cyan">Order Now</a>','')
            changed=True
        # Remove Sign In nav-btn-outline
        old_si = '<a href="javascript:void(0)" class="nav-btn-outline" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signin\')">Sign In</a>'
        if old_si in c:
            c=c.replace('\n      '+old_si,'')
            changed=True
        # Remove Get Started nav-btn-primary
        old_gs = '<a href="javascript:void(0)" class="nav-btn-primary" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signup\')">Get Started</a>'
        if old_gs in c:
            # Replace last occurrence with Sign Up / Log In
            new_btn = '<a href="javascript:void(0)" class="nav-btn-cyan" onclick="typeof openAuthModal===\'function\'&&openAuthModal(\'signin\')" style="font-size:13px;padding:8px 18px;">Sign Up / Log In</a>'
            c=c.replace('      '+old_gs, '      '+new_btn)
            changed=True
        if changed:
            with open(page,'w',encoding='utf-8') as f: f.write(c)
            print(f'  OK  {page} (partial match)')
        else:
            print(f'  SKIP {page}')

print('\n=== All done ===')
print('\nCommit and push:')
print('  git add .')
print('  git commit -m "v3: products complete, cart also-bought, buy now, nav consolidation, stats removed, hamburger left"')
print('  git push')
print('  git push mine main --force')

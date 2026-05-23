#!/usr/bin/env python3
"""
Waterboy Delivery — Mobile Fix
Run from: C:\\Users\\silly\\Desktop\\waterboy-delivery
"""
import os, re, glob

def rw(path, fn, label=''):
    with open(path,'r',encoding='utf-8') as f: c=f.read()
    c2=fn(c)
    if c2!=c:
        with open(path,'w',encoding='utf-8') as f: f.write(c2)
        print(f'  OK  {path}' + (f' — {label}' if label else ''))
    else:
        print(f'  SKIP {path} (already done)')

print('\n=== Waterboy Mobile Fix ===\n')

# ─────────────────────────────────────────────────────────────────
# 1. global.css — keep cart visible on mobile, fix hamburger LEFT
# ─────────────────────────────────────────────────────────────────
print('[1] global.css — cart always visible, hamburger left')
def fix_global(c):
    c=c.replace(
        '@media (max-width: 900px) {\n  .nav-right { display: none; }\n  #navbar .nav-menu-btn, #navbar button.nav-menu-btn { margin-left: auto !important; }\n}',
        '@media (max-width: 900px) {\n  /* Hide text buttons but keep cart icon visible */\n  .nav-right .nav-btn-outline,\n  .nav-right .nav-btn-primary,\n  .nav-right .nav-btn-cyan { display: none !important; }\n  .nav-right { gap: 0; }\n  /* Hamburger stays LEFT — no margin-left auto */\n}'
    )
    return c
rw('global.css', fix_global)

# ─────────────────────────────────────────────────────────────────
# 2. homepage.css — keep cart visible on mobile
# ─────────────────────────────────────────────────────────────────
print('[2] homepage.css — cart always visible on homepage mobile')
def fix_homecss(c):
    c=c.replace(
        '  .hn-nav-right { display: none; }',
        '  /* Keep cart icon, hide text buttons */\n  .hn-nav-right .hn-get-started,\n  .hn-nav-right .hn-sign-in { display: none !important; }\n  .hn-nav-right { gap: 0 !important; padding: 0 !important; }'
    )
    return c
rw('homepage.css', fix_homecss)

# ─────────────────────────────────────────────────────────────────
# 3. shop.css — pd-buy-now button CSS, touch targets
# ─────────────────────────────────────────────────────────────────
print('[3] shop.css — Buy Now button CSS + touch targets')
def fix_shopcss(c):
    if '.pd-buy-now' not in c:
        c=c.replace(
            '.catalog-atc{display:block;width:100%;margin-top:10px;padding:9px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.25);border-radius:8px;color:#00D4FF;font-family:\'Outfit\',sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .2s;text-align:center}\n.catalog-atc:hover{background:rgba(0,212,255,.2);border-color:#00D4FF}',
            '.catalog-atc{display:block;width:100%;margin-top:10px;padding:9px;background:rgba(0,212,255,.1);border:1px solid rgba(0,212,255,.25);border-radius:8px;color:#00D4FF;font-family:\'Outfit\',sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .2s;text-align:center}\n.catalog-atc:hover{background:rgba(0,212,255,.2);border-color:#00D4FF}\n\n/* Buy Now button in product detail modal */\n.pd-buy-now{display:flex;width:100%;justify-content:center;align-items:center;margin-top:8px;padding:13px;background:transparent;border:1.5px solid #00D4FF;color:#00D4FF;font-family:\'Outfit\',sans-serif;font-weight:700;font-size:15px;border-radius:12px;cursor:pointer;transition:background 0.2s;box-sizing:border-box}\n.pd-buy-now:hover{background:rgba(0,212,255,0.1)}'
        )
    c=c.replace(
        '.mca-atc{width:100%;height:36px;',
        '.mca-atc{width:100%;height:44px;'
    )
    if '.cd-also-bought-btn{' in c:
        c=c.replace(
            '.cd-also-bought-btn{',
            '.cd-also-bought-btn{min-height:44px;'
        )
    return c
rw('shop.css', fix_shopcss)

# ─────────────────────────────────────────────────────────────────
# 4. left-menu.js — fix Sign In and Cart links to use correct fns
# ─────────────────────────────────────────────────────────────────
print('[4] left-menu.js — wire Sign In + Cart correctly')
def fix_leftmenu(c):
    c=c.replace(
        "  if (signinLink) signinLink.addEventListener('click', function (e) {\n    e.preventDefault();\n    closeDrawer();\n    var m = document.getElementById('auth-modal');\n    if (m) m.classList.add('open');\n  });",
        "  if (signinLink) signinLink.addEventListener('click', function (e) {\n    e.preventDefault();\n    closeDrawer();\n    if (typeof openAuthModal === 'function') openAuthModal('signin');\n    else if (typeof openOverlay === 'function') openOverlay('auth-overlay');\n  });"
    )
    c=c.replace(
        "  if (cartLink) cartLink.addEventListener('click', function (e) {\n    e.preventDefault();\n    closeDrawer();\n    var m = document.getElementById('cart-modal');\n    if (m) m.classList.add('open');\n  });",
        "  if (cartLink) cartLink.addEventListener('click', function (e) {\n    e.preventDefault();\n    closeDrawer();\n    if (typeof openCartDrawer === 'function') openCartDrawer();\n    else if (typeof openCartSidebar === 'function') openCartSidebar();\n  });"
    )
    return c
rw('left-menu.js', fix_leftmenu)

# ─────────────────────────────────────────────────────────────────
# 5. shop.js — fix updateBadge + also-bought badge update
# ─────────────────────────────────────────────────────────────────
print('[5] shop.js — cart count badge + also-bought onclick')
def fix_shopjs(c):
    c=c.replace(
        "function updateBadge(){\n  const count = cartCount();\n  $$('.cart-badge').forEach(b=>{ b.textContent=count; b.style.display=count?'flex':'none'; });",
        "function updateBadge(){\n  const count = cartCount();\n  $$('.cart-badge, .wb-cart-badge').forEach(b=>{ b.textContent=count; b.style.display=count?'flex':'none'; });\n  const nbBadge=document.getElementById('cart-count'); if(nbBadge){nbBadge.textContent=count; nbBadge.style.display=count?'flex':'none';}"
    )
    c=c.replace(
        'onclick="addToCartRaw(this.dataset.n,parseFloat(this.dataset.p),this.dataset.i,1);renderCartDrawer();"',
        'onclick="addToCartRaw(this.dataset.n,parseFloat(this.dataset.p),this.dataset.i,1);renderCartDrawer();if(typeof updateBadge===\'function\')updateBadge();"'
    )
    return c
rw('shop.js', fix_shopjs)

# ─────────────────────────────────────────────────────────────────
# 6. All pages — left drawer text: Sign In → Sign Up / Log In
# ─────────────────────────────────────────────────────────────────
print('\n[6] All pages — left drawer text updates')
pages = glob.glob('*.html')
for page in pages:
    with open(page,'r',encoding='utf-8') as f: c=f.read()
    c2=c
    c2=c2.replace(
        '<a href="#" class="left-drawer-link" id="ld-signin-link">Sign In / Account</a>',
        '<a href="#" class="left-drawer-link" id="ld-signin-link">Sign Up / Log In</a>'
    )
    c2=c2.replace(
        '<a href="#" class="left-drawer-link" id="ld-cart-link">Cart</a>',
        '<a href="#" class="left-drawer-link" id="ld-cart-link">View Cart</a>'
    )
    if c2!=c:
        with open(page,'w',encoding='utf-8') as f: f.write(c2)
        print(f'  OK  {page}')

print('\n=== Done ===')
print('\nRun:')
print('  git add .')
print('  git commit -m "fix: mobile — cart always visible, hamburger left, drawer wiring, badge count"')
print('  git push')
print('  git push mine main --force')

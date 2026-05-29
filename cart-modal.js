/* ================================================================
   cart-modal.js — Add to Cart Modal with Quantity Selector
   Waterboy Delivery — shared across all pages
   ================================================================ */
(function () {
  'use strict';

  var MODAL_CSS = [
    '#wb-cart-overlay{position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,0.85);',
    'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);',
    'display:none;align-items:center;justify-content:center;padding:16px;}',
    '#wb-cart-overlay.wbco-open{display:flex;}',
    '#wb-cart-modal{background:#132236;border:1px solid rgba(0,212,255,0.25);',
    'border-radius:20px;padding:40px;max-width:520px;width:100%;position:relative;',
    'box-shadow:0 40px 100px rgba(0,0,0,0.7);',
    'animation:wbCartIn 0.3s ease;max-height:90vh;overflow-y:auto;}',
    '@keyframes wbCartIn{from{opacity:0;transform:scale(0.9);}to{opacity:1;transform:scale(1);}}',
    '@keyframes wbCartOut{from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(0.9);}}',
    '.wbcm-closing{animation:wbCartOut 0.25s ease forwards!important;}',
    '#wb-cart-close{position:absolute;top:14px;right:14px;background:none;border:none;',
    'color:#B8E6FF;font-size:26px;cursor:pointer;width:36px;height:36px;',
    'display:flex;align-items:center;justify-content:center;border-radius:6px;',
    'transition:color 0.2s,background 0.2s;line-height:1;padding:0;}',
    '#wb-cart-close:hover{color:#00D4FF;background:rgba(0,212,255,0.1);}',
    '.wbcm-img-wrap{width:100%;display:flex;justify-content:center;margin-bottom:20px;}',
    '.wbcm-img{max-height:180px;max-width:100%;object-fit:contain;border-radius:12px;}',
    '.wbcm-name{font-family:"Outfit",sans-serif;font-size:24px;font-weight:700;color:#F0F7FF;margin:0 0 6px;}',
    '.wbcm-variant{font-family:"Inter",sans-serif;font-size:14px;color:#B8E6FF;margin:0 0 6px;}',
    '.wbcm-price{font-family:"Inter",sans-serif;font-size:20px;font-weight:600;color:#00D4FF;margin:0 0 10px;}',
    '.wbcm-desc{font-family:"Inter",sans-serif;font-size:15px;color:#B8E6FF;line-height:1.55;',
    'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;margin:0 0 20px;}',
    '.wbcm-section-lbl{font-family:"Inter",sans-serif;font-size:13px;font-weight:600;',
    'color:#B8E6FF;text-transform:uppercase;letter-spacing:2px;margin:0 0 10px;display:block;}',
    '.wbcm-flavors{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}',
    '.wbcm-pill{background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);',
    'color:#B8E6FF;border-radius:20px;padding:8px 16px;font-family:"Inter",sans-serif;',
    'font-size:13px;cursor:pointer;transition:all 0.15s;line-height:1.3;',
    'background:none;outline:none;}',
    '.wbcm-pill:hover{border-color:rgba(0,212,255,0.5);color:#00D4FF;}',
    '.wbcm-pill.selected{background:rgba(0,212,255,0.2);border-color:#00D4FF;color:#00D4FF;font-weight:600;}',
    '.wbcm-sizes{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;}',
    '.wbcm-qty-wrap{display:flex;align-items:center;gap:0;margin-bottom:20px;}',
    '.wbcm-qty-btn{width:44px;height:44px;background:#0F2740;border:1px solid rgba(0,212,255,0.2);',
    'color:#00D4FF;font-size:22px;cursor:pointer;display:flex;align-items:center;',
    'justify-content:center;transition:all 0.15s;line-height:1;padding:0;flex-shrink:0;}',
    '.wbcm-qty-btn:first-child{border-radius:8px 0 0 8px;}',
    '.wbcm-qty-btn:last-child{border-radius:0 8px 8px 0;}',
    '.wbcm-qty-btn:hover{background:rgba(0,212,255,0.15);border-color:rgba(0,212,255,0.5);}',
    '.wbcm-qty-num{width:64px;height:44px;background:#0B1B2B;border-top:1px solid rgba(0,212,255,0.2);',
    'border-bottom:1px solid rgba(0,212,255,0.2);border-left:none;border-right:none;',
    'font-family:"Inter",sans-serif;font-size:22px;font-weight:700;color:#F0F7FF;',
    'text-align:center;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.wbcm-subtotal{font-family:"Inter",sans-serif;font-size:18px;font-weight:600;',
    'color:#F0F7FF;margin-left:16px;}',
    '.wbcm-confirm{width:100%;background:#00D4FF;color:#0B1B2B;border:none;',
    'font-family:"Outfit",sans-serif;font-size:18px;font-weight:800;',
    'padding:16px;border-radius:12px;cursor:pointer;',
    'transition:background 0.2s,transform 0.15s;margin-top:4px;}',
    '.wbcm-confirm:hover{background:#38BDF8;transform:scale(1.02);}',
    '.wbcm-confirm.wbcm-added{background:#22c55e!important;transform:none!important;}',
    '@media(max-width:600px){#wb-cart-modal{padding:24px 16px;width:92vw;}',
    '.wbcm-name{font-size:20px;}.wbcm-confirm{font-size:16px;padding:14px;}}'
  ].join('');

  var currentProduct = null;
  var qty = 1;

  /* ── Cart storage ──────────────────────────────────────────── */
  function getCart() {
    try { return JSON.parse(localStorage.getItem('wb_cart_v1') || '[]'); } catch (e) { return []; }
  }
  function saveCart(arr) {
    try { localStorage.setItem('wb_cart_v1', JSON.stringify(arr)); } catch (e) {}
  }
  function addToCart(item) {
    var cart = getCart();
    cart.push(item);
    saveCart(cart);
    updateCartBadge();
    bounceCartIcon();
  }
  function updateCartBadge() {
    var cart = getCart();
    var total = cart.reduce(function (s, i) { return s + (i.quantity || 1); }, 0);
    document.querySelectorAll('.cart-badge, #cart-count, .wb-cart-badge').forEach(function (el) {
      el.textContent = total;
      el.style.display = total > 0 ? '' : 'none';
    });
  }
  function bounceCartIcon() {
    document.querySelectorAll('.cart-icon-wrap, [data-cart-icon], #cart-btn').forEach(function (el) {
      el.classList.remove('wb-cart-bounce');
      void el.offsetWidth;
      el.classList.add('wb-cart-bounce');
      setTimeout(function () { el.classList.remove('wb-cart-bounce'); }, 420);
    });
  }

  /* ── Modal build ────────────────────────────────────────────── */
  function buildModal() {
    var html = '<div id="wb-cart-overlay" role="dialog" aria-modal="true" aria-label="Add to cart">' +
      '<div id="wb-cart-modal">' +
        '<button id="wb-cart-close" aria-label="Close">×</button>' +
        '<div class="wbcm-img-wrap"><img class="wbcm-img" id="wbcm-img" src="" alt="" /></div>' +
        '<h2 class="wbcm-name" id="wbcm-name"></h2>' +
        '<p class="wbcm-variant" id="wbcm-variant"></p>' +
        '<p class="wbcm-price" id="wbcm-price"></p>' +
        '<p class="wbcm-desc" id="wbcm-desc"></p>' +
        '<div id="wbcm-flavor-section" style="display:none;">' +
          '<span class="wbcm-section-lbl">Select Flavor</span>' +
          '<div class="wbcm-flavors" id="wbcm-flavors"></div>' +
        '</div>' +
        '<div id="wbcm-size-section" style="display:none;">' +
          '<span class="wbcm-section-lbl">Select Size</span>' +
          '<div class="wbcm-sizes" id="wbcm-sizes"></div>' +
        '</div>' +
        '<span class="wbcm-section-lbl">Quantity</span>' +
        '<div style="display:flex;align-items:center;">' +
          '<div class="wbcm-qty-wrap">' +
            '<button class="wbcm-qty-btn" id="wbcm-minus" aria-label="Decrease quantity">−</button>' +
            '<div class="wbcm-qty-num" id="wbcm-qty-display">1</div>' +
            '<button class="wbcm-qty-btn" id="wbcm-plus" aria-label="Increase quantity">+</button>' +
          '</div>' +
          '<span class="wbcm-subtotal" id="wbcm-subtotal"></span>' +
        '</div>' +
        '<button class="wbcm-confirm" id="wbcm-confirm">Add to Cart</button>' +
      '</div>' +
    '</div>';
    var div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstChild);
  }

  /* ── Pill selection ─────────────────────────────────────────── */
  function selectPill(container, btn) {
    container.querySelectorAll('.wbcm-pill').forEach(function (p) { p.classList.remove('selected'); });
    btn.classList.add('selected');
    if (container === document.getElementById('wbcm-sizes')) {
      var price = parseFloat(btn.dataset.price) || (currentProduct && currentProduct.pricePerUnit) || 0;
      currentProduct.activePricePerUnit = price;
      updateSubtotal();
      var confirmBtn = document.getElementById('wbcm-confirm');
      if (confirmBtn) {
        var total = price * qty;
        confirmBtn.textContent = 'Add to Cart — $' + total.toFixed(2);
      }
    }
  }

  /* ── Qty + subtotal ─────────────────────────────────────────── */
  function updateSubtotal() {
    var price = (currentProduct && (currentProduct.activePricePerUnit || currentProduct.pricePerUnit)) || 0;
    var sub = document.getElementById('wbcm-subtotal');
    var disp = document.getElementById('wbcm-qty-display');
    var confirm = document.getElementById('wbcm-confirm');
    if (sub) sub.textContent = 'Subtotal: $' + (price * qty).toFixed(2);
    if (disp) disp.textContent = qty;
    if (confirm && !confirm.classList.contains('wbcm-added')) {
      confirm.textContent = 'Add to Cart — $' + (price * qty).toFixed(2);
    }
  }

  /* ── Open modal ─────────────────────────────────────────────── */
  function openCartModal(productData) {
    currentProduct = productData;
    qty = 1;

    var modal = document.getElementById('wb-cart-modal');
    if (modal) modal.classList.remove('wbcm-closing');

    // Image
    var imgEl = document.getElementById('wbcm-img');
    if (imgEl) {
      imgEl.src = productData.image || '';
      imgEl.alt = productData.name || '';
      imgEl.style.display = productData.image ? '' : 'none';
      imgEl.parentElement.style.display = productData.image ? '' : 'none';
    }

    // Name / variant / price / desc
    setText('wbcm-name', productData.name || '');
    setText('wbcm-variant', productData.variant || '');
    setText('wbcm-price', productData.priceDisplay || ('$' + (productData.pricePerUnit || 0).toFixed(2)));
    setText('wbcm-desc', productData.description || '');

    // Flavors
    var flavorSection = document.getElementById('wbcm-flavor-section');
    var flavorContainer = document.getElementById('wbcm-flavors');
    if (flavorSection && flavorContainer) {
      if (productData.flavors && productData.flavors.length) {
        flavorSection.style.display = '';
        flavorContainer.innerHTML = '';
        productData.flavors.forEach(function (f) {
          var btn = document.createElement('button');
          btn.className = 'wbcm-pill';
          btn.textContent = f;
          btn.addEventListener('click', function () { selectPill(flavorContainer, btn); });
          flavorContainer.appendChild(btn);
        });
        if (flavorContainer.firstChild) flavorContainer.firstChild.classList.add('selected');
      } else {
        flavorSection.style.display = 'none';
      }
    }

    // Sizes
    var sizeSection = document.getElementById('wbcm-size-section');
    var sizeContainer = document.getElementById('wbcm-sizes');
    if (sizeSection && sizeContainer) {
      if (productData.sizes && productData.sizes.length) {
        sizeSection.style.display = '';
        sizeContainer.innerHTML = '';
        productData.sizes.forEach(function (s, idx) {
          var btn = document.createElement('button');
          btn.className = 'wbcm-pill' + (idx === 0 ? ' selected' : '');
          btn.textContent = s.label;
          btn.dataset.price = s.price;
          btn.addEventListener('click', function () { selectPill(sizeContainer, btn); });
          sizeContainer.appendChild(btn);
        });
        currentProduct.activePricePerUnit = productData.sizes[0].price;
      } else {
        sizeSection.style.display = 'none';
        currentProduct.activePricePerUnit = productData.pricePerUnit;
      }
    }

    updateSubtotal();

    var overlay = document.getElementById('wb-cart-overlay');
    if (overlay) overlay.classList.add('wbco-open');
    setTimeout(function () {
      var first = document.querySelector('#wb-cart-modal input, #wbcm-confirm');
      if (first) first.focus();
    }, 80);
  }

  function closeCartModal() {
    var modal = document.getElementById('wb-cart-modal');
    var overlay = document.getElementById('wb-cart-overlay');
    if (modal) {
      modal.classList.add('wbcm-closing');
      setTimeout(function () {
        if (overlay) overlay.classList.remove('wbco-open');
        if (modal) modal.classList.remove('wbcm-closing');
      }, 260);
    } else if (overlay) {
      overlay.classList.remove('wbco-open');
    }
  }

  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ── Bind events ────────────────────────────────────────────── */
  function bindEvents() {
    var overlay = document.getElementById('wb-cart-overlay');
    var closeBtn = document.getElementById('wb-cart-close');
    var minusBtn = document.getElementById('wbcm-minus');
    var plusBtn = document.getElementById('wbcm-plus');
    var confirmBtn = document.getElementById('wbcm-confirm');

    if (closeBtn) closeBtn.addEventListener('click', closeCartModal);
    if (overlay) overlay.addEventListener('click', function (e) { if (e.target === overlay) closeCartModal(); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.getElementById('wb-cart-overlay').classList.contains('wbco-open')) {
        closeCartModal();
      }
    });

    if (minusBtn) minusBtn.addEventListener('click', function () {
      if (qty > 1) { qty--; updateSubtotal(); }
    });
    if (plusBtn) plusBtn.addEventListener('click', function () {
      if (qty < 99) { qty++; updateSubtotal(); }
    });

    if (confirmBtn) confirmBtn.addEventListener('click', function () {
      if (this.classList.contains('wbcm-added')) return;
      var selectedFlavor = '';
      var flavorPills = document.querySelectorAll('#wbcm-flavors .wbcm-pill.selected');
      if (flavorPills.length) selectedFlavor = flavorPills[0].textContent;
      var selectedSize = '';
      var sizePills = document.querySelectorAll('#wbcm-sizes .wbcm-pill.selected');
      if (sizePills.length) selectedSize = sizePills[0].textContent;

      var price = (currentProduct.activePricePerUnit || currentProduct.pricePerUnit) || 0;
      var item = {
        productName: currentProduct.name,
        flavor: selectedFlavor,
        size: selectedSize || currentProduct.variant,
        quantity: qty,
        pricePerUnit: price,
        subtotal: parseFloat((price * qty).toFixed(2)),
        image: currentProduct.image || '',
        timestamp: Date.now()
      };
      addToCart(item);

      var btn = this;
      btn.classList.add('wbcm-added');
      btn.textContent = '✓ Added!';
      setTimeout(function () { closeCartModal(); }, 900);
    });

    // Wire up all [data-add-to-cart] buttons
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-add-to-cart]');
      if (!btn) return;
      try {
        var data = JSON.parse(btn.getAttribute('data-add-to-cart'));
        openCartModal(data);
      } catch (err) {}
    });
  }

  /* ── Cart sidebar render ──────────────────────────────────────── */
  function renderCartSidebar() {
    var sidebar = document.getElementById('cart-sidebar-items');
    if (!sidebar) return;
    var cart = getCart();
    if (!cart.length) {
      sidebar.innerHTML = '<p style="font-family:\'Inter\',sans-serif;font-size:14px;color:#B8E6FF;text-align:center;padding:24px 0;">Your cart is empty.</p>';
      updateCartTotals(0, 0);
      return;
    }
    var html = '';
    var subtotal = 0;
    cart.forEach(function (item, idx) {
      var lineTotal = item.subtotal || (item.pricePerUnit * item.quantity);
      subtotal += lineTotal;
      html += '<div class="ci-row" style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid rgba(0,212,255,0.08);">' +
        (item.image ? '<img src="' + item.image + '" style="width:52px;height:52px;object-fit:contain;border-radius:8px;background:#0B1B2B;flex-shrink:0;" />' : '') +
        '<div style="flex:1;min-width:0;">' +
          '<div style="font-family:\'Inter\',sans-serif;font-size:14px;font-weight:600;color:#F0F7FF;line-height:1.3;">' + item.productName + '</div>' +
          (item.flavor ? '<div style="font-family:\'Inter\',sans-serif;font-size:12px;color:#B8E6FF;">' + item.flavor + '</div>' : '') +
          (item.size ? '<div style="font-family:\'Inter\',sans-serif;font-size:12px;color:#B8E6FF;">' + item.size + '</div>' : '') +
          '<div style="font-family:\'Inter\',sans-serif;font-size:13px;color:#B8E6FF;margin-top:3px;">' + item.quantity + ' × $' + item.pricePerUnit.toFixed(2) + '</div>' +
        '</div>' +
        '<div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;">' +
          '<div style="font-family:\'Inter\',sans-serif;font-size:14px;font-weight:600;color:#00D4FF;">$' + lineTotal.toFixed(2) + '</div>' +
          '<button onclick="window.wbRemoveCartItem(' + idx + ')" style="background:none;border:none;color:rgba(184,230,255,0.4);font-size:18px;cursor:pointer;padding:0;line-height:1;transition:color 0.15s;" onmouseover="this.style.color=\'#ff6b6b\'" onmouseout="this.style.color=\'rgba(184,230,255,0.4)\'">×</button>' +
        '</div>' +
      '</div>';
    });
    sidebar.innerHTML = html;
    updateCartTotals(subtotal, 0);
  }

  function updateCartTotals(subtotal, delivery) {
    var subEl = document.getElementById('cart-subtotal');
    var totEl = document.getElementById('cart-total');
    if (subEl) subEl.textContent = '$' + subtotal.toFixed(2);
    if (totEl) totEl.textContent = '$' + (subtotal + delivery).toFixed(2);
  }

  window.wbRemoveCartItem = function (idx) {
    var cart = getCart();
    cart.splice(idx, 1);
    saveCart(cart);
    renderCartSidebar();
    updateCartBadge();
  };

  /* ── CSS bounce animation ─────────────────────────────────────── */
  function injectBounceCSS() {
    var s = document.createElement('style');
    s.textContent = '@keyframes wbCartBounce{0%{transform:translateY(0);}40%{transform:translateY(-6px);}80%{transform:translateY(0);}100%{transform:translateY(0);}}.wb-cart-bounce{animation:wbCartBounce 0.4s ease;}';
    document.head.appendChild(s);
  }

  /* ── Cart Sidebar ────────────────────────────────────────────── */
  var SIDEBAR_CSS = [
    '#wb-cart-sidebar{position:fixed;top:0;right:0;height:100%;width:360px;max-width:92vw;',
    'background:#0F2740;border-left:1px solid rgba(0,212,255,0.2);z-index:99980;',
    'transform:translateX(100%);transition:transform 0.3s cubic-bezier(0.4,0,0.2,1);',
    'display:flex;flex-direction:column;overflow:hidden;}',
    '#wb-cart-sidebar.open{transform:translateX(0);}',
    '#wb-cart-sidebar-ov{position:fixed;inset:0;background:rgba(5,12,24,0.65);',
    'z-index:99979;opacity:0;pointer-events:none;transition:opacity 0.3s;}',
    '#wb-cart-sidebar-ov.open{opacity:1;pointer-events:auto;}',
    '.wbcs-header{display:flex;align-items:center;justify-content:space-between;',
    'padding:20px 24px;border-bottom:1px solid rgba(0,212,255,0.12);}',
    '.wbcs-title{font-family:"Outfit",sans-serif;font-size:18px;font-weight:700;color:#F0F7FF;}',
    '.wbcs-close{background:none;border:none;color:rgba(255,255,255,0.5);font-size:22px;',
    'cursor:pointer;padding:4px;line-height:1;transition:color 0.15s;}',
    '.wbcs-close:hover{color:#fff;}',
    '.wbcs-body{flex:1;overflow-y:auto;padding:16px 24px;}',
    '.wbcs-footer{padding:16px 24px;border-top:1px solid rgba(0,212,255,0.12);}',
    '.wbcs-total-row{display:flex;justify-content:space-between;',
    'font-family:"Inter",sans-serif;font-size:15px;font-weight:600;color:#F0F7FF;margin-bottom:14px;}',
    '.wbcs-total-row span:last-child{color:#00D4FF;}',
    '.wbcs-shop-btn{display:block;width:100%;background:#00D4FF;color:#0B1B2B;',
    'font-family:"Outfit",sans-serif;font-size:16px;font-weight:800;border:none;padding:14px;',
    'border-radius:12px;cursor:pointer;text-align:center;text-decoration:none;transition:background 0.2s;}',
    '.wbcs-shop-btn:hover{background:#38BDF8;}',
    '.nav-cart-btn{position:relative;background:none;border:none;cursor:pointer;',
    'color:#00D4FF;padding:6px;display:flex;align-items:center;flex-shrink:0;}',
    '.nav-cart-btn:hover{opacity:0.8;}',
    '#cart-count{position:absolute;top:0;right:0;background:#FF3B3B;color:#fff;',
    'font-family:"Inter",sans-serif;font-size:10px;font-weight:700;min-width:16px;height:16px;',
    'border-radius:8px;display:flex;align-items:center;justify-content:center;',
    'padding:0 3px;line-height:1;}',
  ].join('');

  function buildCartSidebar() {
    if (document.getElementById('wb-cart-sidebar')) return;
    var s = document.createElement('style');
    s.textContent = SIDEBAR_CSS;
    document.head.appendChild(s);

    var ov = document.createElement('div');
    ov.id = 'wb-cart-sidebar-ov';
    document.body.appendChild(ov);
    ov.addEventListener('click', closeCartSidebar);

    var aside = document.createElement('div');
    aside.id = 'wb-cart-sidebar';
    aside.innerHTML =
      '<div class="wbcs-header">' +
        '<span class="wbcs-title">Your Cart</span>' +
        '<button class="wbcs-close" onclick="window.closeCartSidebar()" aria-label="Close cart">✕</button>' +
      '</div>' +
      '<div class="wbcs-body" id="cart-sidebar-items"></div>' +
      '<div class="wbcs-footer">' +
        '<div class="wbcs-total-row"><span>Subtotal</span><span id="cart-subtotal">$0.00</span></div>' +
        '<div class="wbcs-total-row"><span>Total</span><span id="cart-total">$0.00</span></div>' +
        '<a href="order.html" class="wbcs-shop-btn" style="margin-bottom:12px;">Checkout →</a>' +
        '<div id="wbcs-also-bought" style="margin-top:4px;">' +
          '<div style="font-family:'Inter',sans-serif;font-size:11px;font-weight:700;color:rgba(184,230,255,0.6);text-transform:uppercase;letter-spacing:2px;margin-bottom:10px;">Customers Also Bought</div>' +
          '<div style="display:flex;flex-direction:column;gap:8px;" id="wbcs-also-items"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(aside);
    var alsoBought=[
      {name:'LMNT Electrolyte Cans',price:'$4.99',img:'Images%20for%20Menu/Images%20for%20Menu/Cans.jpg',priceNum:4.99},
      {name:'LMNT Electrolyte Packets',price:'$2.99',img:'Images%20for%20Menu/Images%20for%20Menu/Pack1.PNG',priceNum:2.99},
      {name:'Zipfizz Energy Drink Mix',price:'$34.99',img:'Images%20for%20Menu/Images%20for%20Menu/Box.PNG',priceNum:34.99},
      {name:'Echo Hydrogen Prebiotic Packet',price:'$1.99',img:'Images%20for%20Menu/Images%20for%20Menu/Hyd.PNG',priceNum:1.99}
    ];
    var alsoContainer=aside.querySelector('#wbcs-also-items');
    alsoBought.forEach(function(p){
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;padding:8px;background:rgba(0,212,255,0.04);border:1px solid rgba(0,212,255,0.1);border-radius:8px;';
      row.innerHTML='<img src="'+p.img+'" style="width:40px;height:40px;object-fit:cover;border-radius:6px;flex-shrink:0;" alt="'+p.name+'" /><div style="flex:1;min-width:0;"><div style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#F0F7FF;line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.name+'</div><div style="font-family:'Inter',sans-serif;font-size:12px;color:#00D4FF;font-weight:700;">'+p.price+'</div></div><button style="background:#00D4FF;border:none;color:#0B1B2B;font-family:'Outfit',sans-serif;font-size:11px;font-weight:800;padding:6px 10px;border-radius:6px;cursor:pointer;flex-shrink:0;transition:background 0.15s;" data-also-name="'+p.name+'" data-also-price="'+p.priceNum+'" data-also-img="'+p.img+'">+ Add</button>';
      alsoContainer.appendChild(row);
    });
    alsoContainer.addEventListener('click',function(e){
      var btn=e.target.closest('[data-also-name]');
      if(!btn)return;
      addToCart({productName:btn.getAttribute('data-also-name'),quantity:1,pricePerUnit:parseFloat(btn.getAttribute('data-also-price'))||0,subtotal:parseFloat(btn.getAttribute('data-also-price'))||0,image:btn.getAttribute('data-also-img'),timestamp:Date.now()});
      btn.textContent='✓';btn.style.background='#22c55e';
      setTimeout(function(){btn.textContent='+ Add';btn.style.background='#00D4FF';},1500);
      renderCartSidebar();
    });
  }

  function openCartSidebar() {
    buildCartSidebar();
    renderCartSidebar();
    document.getElementById('wb-cart-sidebar').classList.add('open');
    document.getElementById('wb-cart-sidebar-ov').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartSidebar() {
    var s = document.getElementById('wb-cart-sidebar');
    var o = document.getElementById('wb-cart-sidebar-ov');
    if (s) s.classList.remove('open');
    if (o) o.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Init ──────────────────────────────────────────────────── */
  function init() {
    var style = document.createElement('style');
    style.textContent = MODAL_CSS;
    document.head.appendChild(style);
    injectBounceCSS();
    buildModal();
    buildCartSidebar();
    bindEvents();
    updateCartBadge();
    renderCartSidebar();
  }

  /* ── Public API ─────────────────────────────────────────────── */
  window.openCartModal = function (productData) { openCartModal(productData); };
  window.openCartSidebar = function () { openCartSidebar(); };
  window.closeCartSidebar = function () { closeCartSidebar(); };
  window.renderCartSidebar = function () { renderCartSidebar(); };
  window.getWBCart = function () { return getCart(); };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

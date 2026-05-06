/* ================================================================
   SHOP.JS — Cart · Checkout · Auth · Modals · Subscription
   Waterboy Delivery
   ================================================================ */

/* ── Data ──────────────────────────────────────────────────────── */
const PRODUCTS = {
  'p01': { name:'5-Gallon Water Jug', price:7.50, unit:'jug', img:'Images%20for%20Menu/Images%20for%20Menu/5%20Gallon%20Bottle.jpg', desc:'Our standard 5-gallon BPA-free polycarbonate jug. Perfect for most home dispensers.', specs:[['Size','5 Gallons'],['Material','BPA-Free Polycarbonate'],['Compatible','Standard top-load dispensers']] },
  'p02': { name:'3-Gallon Water Jug', price:5.00, unit:'jug', img:'Images%20for%20Menu/Images%20for%20Menu/3%20Gallon%20Bottle%20.jpg', desc:'Compact 3-gallon jug ideal for smaller households or countertop dispensers.', specs:[['Size','3 Gallons'],['Material','BPA-Free Polycarbonate'],['Compatible','Standard top-load dispensers']] },
  'p03': { name:'16 oz Glass Bottle', price:3.50, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/16 oz Glass Bottle.jpg', desc:'Premium glass bottle for pure taste with zero plastic contact.', specs:[['Size','16 oz'],['Material','Borosilicate Glass'],['Cap','Stainless steel lid']] },
  'p04': { name:'32 oz Glass Bottle', price:5.00, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/32 oz Glass Bottle.jpg', desc:'Larger glass option for all-day hydration without compromise.', specs:[['Size','32 oz'],['Material','Borosilicate Glass'],['Cap','Stainless steel lid']] },
  'p05': { name:'Gallon Glass Bottle', price:9.00, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/Gallon Glass Bottle.jpg', desc:'Full gallon glass bottle for families who prefer glass over plastic.', specs:[['Size','1 Gallon'],['Material','Borosilicate Glass'],['Cap','Wide-mouth lid']] },
  'p06': { name:'Gallon Jug', price:6.50, unit:'jug', img:'Images%20for%20Menu/Images%20for%20Menu/Gallon Jug.jpg', desc:'Everyday gallon in lightweight HDPE plastic.', specs:[['Size','1 Gallon'],['Material','HDPE Plastic'],['Cap','Screw-top']] },
  'p07': { name:'12 oz Aluminum Bottle', price:2.50, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/12 oz Aluminum.jpg', desc:'Slim 12 oz aluminum bottle — great for on-the-go hydration.', specs:[['Size','12 oz'],['Material','Aluminum'],['Finish','Matte']] },
  'p08': { name:'16 oz Aluminum Bottle', price:3.00, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/16 oz Aluminum.jpg', desc:'Slightly larger aluminum option, fits most cup holders.', specs:[['Size','16 oz'],['Material','Aluminum'],['Finish','Matte']] },
  'p09': { name:'24 oz Aluminum Bottle', price:3.50, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/24 oz Aluminum.jpg', desc:'The most popular aluminum size for gyms and outdoor use.', specs:[['Size','24 oz'],['Material','Aluminum'],['Finish','Matte']] },
  'p10': { name:'33.8 oz Aluminum Bottle', price:4.00, unit:'bottle', img:'Images%20for%20Menu/Images%20for%20Menu/33.8 oz Aluminum.jpg', desc:'Liter-size aluminum bottle for serious hydrators.', specs:[['Size','33.8 oz / 1L'],['Material','Aluminum'],['Finish','Matte']] },
  'p11': { name:'Top-Load Water Dispenser', price:null, unit:'', img:'Images%20for%20Menu/Images%20for%20Menu/Top Load Dispenser.jpg', desc:'Standard top-load dispenser compatible with all our 3 and 5 gallon jugs. Hot & cold taps.', specs:[['Type','Top-Load'],['Taps','Hot & Cold'],['Voltage','110V']] },
  'p12': { name:'Bottom-Load Dispenser', price:null, unit:'', img:'Images%20for%20Menu/Images%20for%20Menu/Bottom Load Dispenser.jpg', desc:'Sleek bottom-load model — no lifting required. Concealed jug for a clean look.', specs:[['Type','Bottom-Load'],['Taps','Hot & Cold'],['Voltage','110V']] },
  'p13': { name:'Countertop Dispenser', price:null, unit:'', img:'Images%20for%20Menu/Images%20for%20Menu/Counter Top Dispenser.jpg', desc:'Space-saving countertop unit for offices and smaller kitchens.', specs:[['Type','Countertop'],['Compatible','3 & 5 gallon'],['Voltage','110V']] },
  'p14': { name:'Alkaline Water Dispenser', price:null, unit:'', img:'Images%20for%20Menu/Images%20for%20Menu/Alkaline Dispenser.jpg', desc:'Dedicated alkaline dispenser with built-in pH enhancement filter.', specs:[['Type','Bottom-Load'],['pH','8.5–9.5'],['Filter life','6 months']] },
  'p15': { name:'Pink Salt Electrolyte Stick', price:1.50, unit:'stick', img:'Images%20for%20Menu/Images%20for%20Menu/Pink Salt Electrolyte Stick.jpg', desc:'Himalayan pink salt electrolyte blend. Drop one in your water for natural hydration support.', specs:[['Flavor','Unflavored'],['Sodium','230mg'],['Per stick','Single serve']] },
  'p16': { name:'Raw Unflavored Salt Stick', price:1.50, unit:'stick', img:'Images%20for%20Menu/Images%20for%20Menu/Raw%20Unf%3Bavored%20Stick.jpg', desc:'Pure raw electrolyte stick with no added flavors or sweeteners.', specs:[['Flavor','Unflavored/Raw'],['Sodium','250mg'],['Per stick','Single serve']] },
  'p17': { name:'Watermelon Electrolyte Stick', price:1.75, unit:'stick', img:'Images%20for%20Menu/Images%20for%20Menu/Watermelon Electrolyte Stick.jpg', desc:'Refreshing watermelon-flavored electrolyte stick. Natural flavoring.', specs:[['Flavor','Watermelon'],['Sodium','200mg'],['Per stick','Single serve']] },
  'p18': { name:'Lemon Electrolyte Stick', price:1.75, unit:'stick', img:'Images%20for%20Menu/Images%20for%20Menu/Lemon Electrolyte Stick.jpg', desc:'Classic lemon electrolyte stick with a clean citrus finish.', specs:[['Flavor','Lemon'],['Sodium','200mg'],['Per stick','Single serve']] },
  'p19': { name:'Peach Electrolyte Stick', price:1.75, unit:'stick', img:'Images%20for%20Menu/Images%20for%20Menu/Peach Electrolyte Stick.jpg', desc:'Smooth peach electrolyte blend. Great in still or sparkling water.', specs:[['Flavor','Peach'],['Sodium','200mg'],['Per stick','Single serve']] },
  'p20': { name:'Sparkling Water Can', price:2.00, unit:'can', img:'Images%20for%20Menu/Images%20for%20Menu/Sparkling Water Can.jpg', desc:'Crisp natural sparkling water with zero calories, zero sweeteners.', specs:[['Type','Sparkling'],['Calories','0'],['Volume','12 oz']] },
  'p21': { name:'Still Water Can', price:1.75, unit:'can', img:'Images%20for%20Menu/Images%20for%20Menu/Still Water Can.jpg', desc:'Clean still water in a convenient aluminum can.', specs:[['Type','Still'],['Calories','0'],['Volume','12 oz']] },
  'p22': { name:'Energy Supplement', price:2.50, unit:'pack', img:'Images%20for%20Menu/Images%20for%20Menu/Energy Supplement.jpg', desc:'Natural energy blend with B-vitamins and light caffeine. No crash.', specs:[['Caffeine','80mg (natural)'],['Vitamins','B6, B12'],['Per pack','Single serve']] },
};

const PLANS = {
  'Solo':       { jugs:2,  price:21, popular:false, perks:['2 jugs/delivery','Bi-weekly schedule','Free 0–3 mi delivery'] },
  'Family':     { jugs:4,  price:42, popular:true,  perks:['4 jugs/delivery','Flexible schedule','Free 0–3 mi delivery','Priority support'] },
  'Household':  { jugs:6,  price:57, popular:false, perks:['6 jugs/delivery','Flexible schedule','Free 0–3 mi delivery'] },
  'Office':     { jugs:8,  price:72, popular:false, perks:['8 jugs/delivery','Weekly schedule','Free 0–3 mi delivery','Business invoicing'] },
  'Max Bundle': { jugs:12, price:95, popular:false, perks:['12 jugs/delivery','Custom schedule','Free 0–3 mi delivery','Dedicated driver'] },
};

const PHONE = '(916) 619-3218';
const PHONE_HREF = 'tel:+19166193218';
const DEMO_EMAIL = 'demo@waterboy.com';
const DEMO_PASS  = 'water2026';

/* ── State ─────────────────────────────────────────────────────── */
function loadCart(){ try{ return JSON.parse(localStorage.getItem('wb_cart_v1'))||[]; }catch(e){ return []; } }
function saveCart(c){ localStorage.setItem('wb_cart_v1', JSON.stringify(c)); }
function loadUser(){ try{ return JSON.parse(localStorage.getItem('wb_user_v1'))||null; }catch(e){ return null; } }
function saveUser(u){ localStorage.setItem('wb_user_v1', JSON.stringify(u)); }

let cart = loadCart();
let user = loadUser();

/* ── Utility ───────────────────────────────────────────────────── */
function $(sel, ctx){ return (ctx||document).querySelector(sel); }
function $$(sel, ctx){ return [...(ctx||document).querySelectorAll(sel)]; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function genId(){ return 'WB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase(); }

/* ── Toast ─────────────────────────────────────────────────────── */
function toast(title, msg, icon){
  const t = $('#wb-toast');
  if(!t) return;
  t.querySelector('.wb-toast-icon').textContent = icon||'✓';
  t.querySelector('.wb-toast-title').textContent = title;
  t.querySelector('.wb-toast-msg').textContent = msg||'';
  t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(()=>t.classList.remove('show'), 3400);
}

/* ── Overlay open/close ────────────────────────────────────────── */
function openOverlay(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.add('open');
  document.body.style.overflow='hidden';
}
function closeOverlay(id){
  const el = document.getElementById(id);
  if(!el) return;
  el.classList.remove('open');
  document.body.style.overflow='';
}
function closeAll(){
  $$('.wb-overlay').forEach(o=>{ o.classList.remove('open'); });
  document.body.style.overflow='';
}

/* ── Step panels ───────────────────────────────────────────────── */
function gotoStep(overlayId, step){
  const ov = document.getElementById(overlayId);
  if(!ov) return;
  $$('.step-dot', ov).forEach((d,i)=>{
    d.classList.toggle('active', i===step);
    d.classList.toggle('done', i<step);
  });
  $$('.step-line', ov).forEach((l,i)=>l.classList.toggle('done', i<step));
  $$('.step-panel', ov).forEach((p,i)=>p.classList.toggle('active', i===step));
}

/* ── Calendar ──────────────────────────────────────────────────── */
function buildCalendar(wrapId, minDaysAhead, onSelect){
  const wrap = document.getElementById(wrapId);
  if(!wrap) return;
  let now = new Date();
  let viewYear = now.getFullYear();
  let viewMonth = now.getMonth();
  let selected = null;

  function render(){
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + (minDaysAhead||0));
    minDate.setHours(0,0,0,0);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();

    let html = `<div class="cal-head">
      <button class="cal-nav-btn" id="${wrapId}-prev">&#8249;</button>
      <span class="cal-title">${monthNames[viewMonth]} ${viewYear}</span>
      <button class="cal-nav-btn" id="${wrapId}-next">&#8250;</button>
    </div>
    <div class="cal-grid">
      ${['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=>`<div class="cal-lbl">${d}</div>`).join('')}`;

    for(let i=0;i<firstDay;i++) html+=`<div class="cal-empty"></div>`;
    for(let d=1;d<=daysInMonth;d++){
      const date = new Date(viewYear, viewMonth, d);
      date.setHours(0,0,0,0);
      const isSun = date.getDay()===0;
      const isPast = date < minDate;
      const isSel = selected && date.toDateString()===selected.toDateString();
      let cls = 'cal-day';
      if(isSun||isPast) cls+=' cal-off';
      if(isSel) cls+=' cal-sel';
      html+=`<div class="${cls}" data-date="${date.toISOString()}">${d}</div>`;
    }
    html+='</div>';
    wrap.innerHTML = html;

    document.getElementById(`${wrapId}-prev`).addEventListener('click',()=>{
      viewMonth--; if(viewMonth<0){viewMonth=11;viewYear--;} render();
    });
    document.getElementById(`${wrapId}-next`).addEventListener('click',()=>{
      viewMonth++; if(viewMonth>11){viewMonth=0;viewYear++;} render();
    });
    $$('.cal-day:not(.cal-off)', wrap).forEach(el=>{
      el.addEventListener('click',()=>{
        selected = new Date(el.dataset.date);
        render();
        if(onSelect) onSelect(selected);
      });
    });
  }
  render();
}

/* ── Time Windows ──────────────────────────────────────────────── */
function buildTimeWindows(containerId, onSelect){
  const c = document.getElementById(containerId);
  if(!c) return;
  const wins = ['8 AM – 10 AM','10 AM – 12 PM','12 PM – 2 PM','2 PM – 4 PM','4 PM – 6 PM'];
  c.innerHTML = wins.map(w=>`<button class="tw-btn" data-tw="${w}">${w}</button>`).join('');
  $$('.tw-btn', c).forEach(b=>b.addEventListener('click',()=>{
    $$('.tw-btn', c).forEach(x=>x.classList.remove('sel'));
    b.classList.add('sel');
    if(onSelect) onSelect(b.dataset.tw);
  }));
}

/* ── Cart Logic ────────────────────────────────────────────────── */
function cartTotal(){ return cart.reduce((s,i)=>s+i.price*i.qty,0); }
function cartCount(){ return cart.reduce((s,i)=>s+i.qty,0); }

function cartAdd(productId, qty){
  qty = qty||1;
  const existing = cart.find(i=>i.id===productId);
  if(existing){ existing.qty+=qty; }
  else{
    const p = PRODUCTS[productId];
    if(!p) return;
    cart.push({ id:productId, name:p.name, price:p.price||0, img:p.img, qty });
  }
  saveCart(cart);
  updateBadge();
}

function cartRemove(productId){
  cart = cart.filter(i=>i.id!==productId);
  saveCart(cart);
  updateBadge();
  renderCartDrawer();
}

function cartSetQty(productId, qty){
  const item = cart.find(i=>i.id===productId);
  if(!item) return;
  if(qty<1){ cartRemove(productId); return; }
  item.qty = qty;
  saveCart(cart);
  updateBadge();
  renderCartDrawer();
}

function updateBadge(){
  const count = cartCount();
  $$('.cart-badge').forEach(b=>{ b.textContent=count; b.style.display=count?'flex':'none'; });
}

/* ── Cart Drawer ───────────────────────────────────────────────── */
function renderCartDrawer(){
  const body = $('#cd-body');
  const subtotalEl = $('#cd-subtotal');
  const grandEl    = $('#cd-grand');
  if(!body) return;

  if(cart.length===0){
    body.innerHTML='<p style="color:#8BB8D4;text-align:center;padding:40px 0;">Your cart is empty.</p>';
  } else {
    body.innerHTML = cart.map(item=>`
      <div class="cart-item" data-id="${item.id}">
        <div class="ci-img"><img src="${item.img}" alt="${esc(item.name)}" onerror="this.style.display='none'"></div>
        <div class="ci-info">
          <p class="ci-name">${esc(item.name)}</p>
          <p class="ci-price">$${item.price.toFixed(2)} ea</p>
        </div>
        <div class="ci-ctrl">
          <button class="qty-btn ci-minus">−</button>
          <span class="qty-val">${item.qty}</span>
          <button class="qty-btn ci-plus">+</button>
        </div>
        <button class="ci-del">✕</button>
      </div>`).join('');

    $$('.ci-minus', body).forEach(b=>b.addEventListener('click',()=>{
      const id = b.closest('.cart-item').dataset.id;
      const it = cart.find(i=>i.id===id);
      if(it) cartSetQty(id, it.qty-1);
    }));
    $$('.ci-plus', body).forEach(b=>b.addEventListener('click',()=>{
      const id = b.closest('.cart-item').dataset.id;
      const it = cart.find(i=>i.id===id);
      if(it) cartSetQty(id, it.qty+1);
    }));
    $$('.ci-del', body).forEach(b=>b.addEventListener('click',()=>{
      cartRemove(b.closest('.cart-item').dataset.id);
    }));
  }

  const sub = cartTotal();
  const delivery = 0;
  const grand = sub + delivery;
  if(subtotalEl) subtotalEl.textContent = '$'+sub.toFixed(2);
  if(grandEl)    grandEl.textContent    = '$'+grand.toFixed(2);
}

function openCartDrawer(){
  renderCartDrawer();
  const overlay = $('#cart-drawer-overlay');
  const drawer  = $('#cart-drawer');
  if(overlay) overlay.classList.add('open');
  if(drawer)  setTimeout(()=>drawer.classList.add('open'),10);
}
function closeCartDrawer(){
  const overlay = $('#cart-drawer-overlay');
  const drawer  = $('#cart-drawer');
  if(drawer) drawer.classList.remove('open');
  setTimeout(()=>{ if(overlay) overlay.classList.remove('open'); },300);
}

/* ── Qty Modal ─────────────────────────────────────────────────── */
let _qmCallback = null;
function openQtyModal(productId, callback){
  const p = PRODUCTS[productId];
  if(!p){ if(callback) callback(1); return; }
  _qmCallback = callback;
  const modal = $('#qty-modal');
  if(!modal){ if(callback) callback(1); return; }
  const imgEl  = modal.querySelector('.qm-img');
  const nameEl = modal.querySelector('.qm-name');
  const priceEl= modal.querySelector('.qm-price');
  const dispEl = modal.querySelector('.qty-disp');
  if(imgEl)  imgEl.src = p.img;
  if(nameEl) nameEl.textContent = p.name;
  if(priceEl) priceEl.textContent = p.price ? '$'+p.price.toFixed(2)+'/'+p.unit : 'Call for pricing';
  if(dispEl) dispEl.textContent = '1';
  modal._qty = 1;
  openOverlay('qty-overlay');
}

/* ── Product Detail Modal ──────────────────────────────────────── */
function openProductDetail(productId){
  const p = PRODUCTS[productId];
  if(!p) return;
  const modal = $('#pd-modal');
  if(!modal) return;
  const imgEl   = modal.querySelector('.pd-img');
  const nameEl  = modal.querySelector('.pd-name');
  const priceEl = modal.querySelector('.pd-price');
  const descEl  = modal.querySelector('.pd-desc');
  const specsEl = modal.querySelector('.pd-specs');
  const atcBtn  = modal.querySelector('.pd-atc');
  const dispEl  = modal.querySelector('.pd-qty-disp');

  if(imgEl)   imgEl.src = p.img;
  if(nameEl)  nameEl.textContent = p.name;
  if(priceEl) priceEl.textContent = p.price ? '$'+p.price.toFixed(2)+' / '+p.unit : 'Contact for pricing';
  if(descEl)  descEl.textContent = p.desc;
  if(specsEl) specsEl.innerHTML = (p.specs||[]).map(s=>`<div class="pd-spec"><span>${esc(s[0])}</span><span>${esc(s[1])}</span></div>`).join('');
  if(dispEl)  dispEl.textContent = '1';
  modal._pid = productId;
  modal._qty = 1;

  if(atcBtn){
    if(p.price){
      atcBtn.style.display='flex';
      atcBtn.onclick=()=>{
        cartAdd(productId, modal._qty);
        closeOverlay('pd-overlay');
        toast(p.name, `Added ${modal._qty} to cart`,'🛒');
      };
    } else {
      atcBtn.style.display='none';
    }
  }
  openOverlay('pd-overlay');
}

/* ── Auth ──────────────────────────────────────────────────────── */
function updateNavUser(){
  $$('.nav-user-name').forEach(el=>{
    el.textContent = user ? user.name.split(' ')[0] : 'Sign In';
  });
  $$('.nav-user-drop').forEach(drop=>{
    drop.innerHTML = user
      ? `<button class="nud-item" id="nud-account">My Account</button>
         <button class="nud-item" id="nud-orders">My Orders</button>
         <button class="nud-item nud-out" id="nud-signout">Sign Out</button>`
      : `<button class="nud-item" id="nud-signin">Sign In</button>
         <button class="nud-item" id="nud-signup">Create Account</button>`;
    const signout = drop.querySelector('#nud-signout');
    if(signout) signout.addEventListener('click',()=>{
      user=null; saveUser(null); updateNavUser();
      toast('Signed out','See you next time!','👋');
    });
    const signinBtn = drop.querySelector('#nud-signin');
    if(signinBtn) signinBtn.addEventListener('click',()=>openAuthModal('signin'));
    const signupBtn = drop.querySelector('#nud-signup');
    if(signupBtn) signupBtn.addEventListener('click',()=>openAuthModal('signup'));
  });
}

function openAuthModal(tab){
  const modal = $('#auth-modal');
  if(!modal) return;
  $$('.auth-tab', modal).forEach(t=>t.classList.toggle('active', t.dataset.tab===tab));
  $$('.auth-panel', modal).forEach(p=>p.classList.toggle('active', p.id==='auth-panel-'+tab));
  // clear errors
  $$('.auth-error', modal).forEach(e=>{ e.textContent=''; e.style.display='none'; });
  openOverlay('auth-overlay');
}

/* ── Checkout State ────────────────────────────────────────────── */
let checkoutState = { date:null, time:null, orderType:'one-time', freq:'bi-weekly' };

function buildOrderSummary(containerId){
  const c = document.getElementById(containerId);
  if(!c) return;
  const sub = cartTotal();
  c.innerHTML = `
    ${cart.map(i=>`<div class="ob-row"><span>${esc(i.name)} ×${i.qty}</span><span>$${(i.price*i.qty).toFixed(2)}</span></div>`).join('')}
    <div class="ob-row"><span>Delivery</span><span>FREE</span></div>
    <div class="ob-row grand"><span>Total</span><span>$${sub.toFixed(2)}</span></div>`;
}

/* ── Pay Simulation ────────────────────────────────────────────── */
function showPaySim(type, onSuccess){
  const sim = $('#pay-sim');
  if(!sim){ onSuccess && onSuccess(); return; }
  const sheet = sim.querySelector('.pay-sheet');
  const logoEl = sim.querySelector('.pay-sheet-logo');
  const amtEl  = sim.querySelector('.pay-sheet-amt');
  const faceEl = sim.querySelector('.face-id');
  if(logoEl) logoEl.textContent = type==='apple'?'  Pay':'G Pay';
  if(amtEl)  amtEl.textContent  = '$'+cartTotal().toFixed(2);
  if(faceEl) faceEl.className='face-id';
  sim.style.display='flex';
  requestAnimationFrame(()=>{ sim.classList.add('open'); if(sheet) sheet.classList.add('open'); });
  setTimeout(()=>{ if(faceEl) faceEl.classList.add('auth'); }, 600);
  setTimeout(()=>{
    sim.classList.remove('open');
    if(sheet) sheet.classList.remove('open');
    setTimeout(()=>{ sim.style.display='none'; onSuccess && onSuccess(); },350);
  }, 2800);
}

/* ── Subscription State ────────────────────────────────────────── */
let subState = { plan:null, waterType:'purified', date:null, time:null };

/* ── HTML Injection ────────────────────────────────────────────── */
function inject(){
  const div = document.createElement('div');
  div.id = 'wb-modals';
  div.innerHTML = `
<!-- Toast -->
<div id="wb-toast">
  <span class="wb-toast-icon">✓</span>
  <div><div class="wb-toast-title"></div><div class="wb-toast-msg"></div></div>
</div>

<!-- Contact Overlay -->
<div class="wb-overlay" id="contact-overlay">
  <div class="wb-modal" role="dialog" aria-label="Contact Us">
    <div class="wb-mhead">
      <h2>Get in Touch</h2>
      <button class="wb-mclose" aria-label="Close">✕</button>
    </div>
    <div class="wb-mbody">
      <div id="contact-success" class="wb-success">
        <div class="wb-check-circle">✓</div>
        <h3 style="color:#fff;margin:12px 0 6px">Message Sent!</h3>
        <p style="color:#8BB8D4;font-size:14px">We'll get back to you within 24 hours.</p>
      </div>
      <form id="contact-form" data-netlify="true" name="quick-contact" netlify-honeypot="bot-field">
        <input type="hidden" name="form-name" value="quick-contact">
        <input name="bot-field" style="display:none">
        <div class="wb-field"><label>Your Name</label><input name="name" placeholder="Jane Smith" required></div>
        <div class="wb-row">
          <div class="wb-field"><label>Phone</label><input name="phone" type="tel" placeholder="(916) 555-0000"></div>
          <div class="wb-field"><label>Email</label><input name="email" type="email" placeholder="you@email.com" required></div>
        </div>
        <div class="wb-field"><label>Message</label><textarea name="message" placeholder="Tell us how we can help…"></textarea></div>
        <button type="submit" class="wb-btn">Send Message</button>
      </form>
      <div class="wb-callbar">
        <p>Prefer to call? We're available Mon–Sat, 8 AM – 6 PM</p>
        <a href="${PHONE_HREF}" class="wb-callbtn">📞 ${PHONE}</a>
      </div>
    </div>
  </div>
</div>

<!-- Auth Overlay -->
<div class="wb-overlay" id="auth-overlay">
  <div class="wb-modal" role="dialog" aria-label="Sign In / Sign Up">
    <div class="wb-mhead">
      <h2>My Account</h2>
      <button class="wb-mclose" aria-label="Close">✕</button>
    </div>
    <div class="wb-mbody">
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="signin">Sign In</button>
        <button class="auth-tab" data-tab="signup">Create Account</button>
      </div>
      <!-- Sign In -->
      <div class="auth-panel active" id="auth-panel-signin">
        <div class="demo-hint">Demo: ${DEMO_EMAIL} / ${DEMO_PASS}</div>
        <div class="wb-field"><label>Email</label><input id="si-email" type="email" placeholder="you@email.com"></div>
        <div class="wb-field"><label>Password</label>
          <div class="pw-wrap"><input id="si-pass" type="password" placeholder="Password"><button type="button" class="pw-eye">👁</button></div>
        </div>
        <div class="auth-error" id="si-error" style="display:none;color:#ff6b6b;font-size:13px;margin-bottom:10px"></div>
        <button class="wb-btn" id="si-submit">Sign In</button>
        <p style="text-align:center;margin-top:14px;font-size:13px;color:#8BB8D4">No account? <button class="wb-link" id="si-to-signup">Create one free</button></p>
      </div>
      <!-- Sign Up -->
      <div class="auth-panel" id="auth-panel-signup">
        <div class="wb-row">
          <div class="wb-field"><label>First Name</label><input id="su-fname" placeholder="Jane"></div>
          <div class="wb-field"><label>Last Name</label><input id="su-lname" placeholder="Smith"></div>
        </div>
        <div class="wb-field"><label>Email</label><input id="su-email" type="email" placeholder="you@email.com"></div>
        <div class="wb-field"><label>Phone</label><input id="su-phone" type="tel" placeholder="(916) 555-0000"></div>
        <div class="wb-field"><label>Street Address</label><input id="su-addr" placeholder="123 Main St"></div>
        <div class="wb-row">
          <div class="wb-field"><label>City</label><input id="su-city" placeholder="Sacramento"></div>
          <div class="wb-field"><label>ZIP</label><input id="su-zip" placeholder="95814"></div>
        </div>
        <div class="wb-field"><label>Password</label>
          <div class="pw-wrap"><input id="su-pass" type="password" placeholder="Min 8 characters"><button type="button" class="pw-eye">👁</button></div>
        </div>
        <div class="auth-error" id="su-error" style="display:none;color:#ff6b6b;font-size:13px;margin-bottom:10px"></div>
        <button class="wb-btn" id="su-submit">Create Account</button>
        <p style="text-align:center;margin-top:14px;font-size:13px;color:#8BB8D4">Already have an account? <button class="wb-link" id="su-to-signin">Sign In</button></p>
      </div>
    </div>
  </div>
</div>

<!-- Cart Drawer Overlay -->
<div id="cart-drawer-overlay">
  <div id="cart-drawer">
    <div class="cd-head">
      <span>My Cart (<span id="cd-count">0</span>)</span>
      <button class="wb-mclose" id="cd-close">✕</button>
    </div>
    <div class="cd-body" id="cd-body"></div>
    <div class="cd-foot">
      <div class="promo-row">
        <input id="promo-input" placeholder="Promo code" style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(0,212,255,.15);border-radius:8px;padding:9px 12px;color:#fff;font-size:13px;outline:none">
        <button class="promo-apply" id="promo-apply">Apply</button>
      </div>
      <div class="totals-row"><span>Subtotal</span><span id="cd-subtotal">$0.00</span></div>
      <div class="totals-row"><span>Delivery</span><span>FREE</span></div>
      <div class="totals-row grand"><span>Total</span><span id="cd-grand">$0.00</span></div>
      <button class="wb-btn" id="cd-checkout-btn" style="margin-top:14px">Proceed to Checkout</button>
      <button class="wb-btn-ghost" id="cd-continue-btn">Continue Shopping</button>
    </div>
  </div>
</div>

<!-- Qty Modal -->
<div class="wb-overlay" id="qty-overlay">
  <div class="wb-modal" role="dialog" aria-label="Select Quantity">
    <div class="wb-mhead"><h2>How Many?</h2><button class="wb-mclose" aria-label="Close">✕</button></div>
    <div class="wb-mbody">
      <div class="qm-product">
        <img class="qm-img" src="" alt="">
        <div>
          <p class="qm-name"></p>
          <p class="qm-price"></p>
        </div>
      </div>
      <div class="qty-sel">
        <button class="qty-btn qty-lg" id="qm-minus">−</button>
        <span class="qty-disp">1</span>
        <button class="qty-btn qty-lg" id="qm-plus">+</button>
      </div>
      <button class="wb-btn" id="qm-confirm">Add to Cart</button>
    </div>
  </div>
</div>

<!-- Product Detail Overlay -->
<div class="wb-overlay" id="pd-overlay">
  <div class="wb-modal wide" id="pd-modal" role="dialog" aria-label="Product Details">
    <div class="wb-mhead"><h2>Product Details</h2><button class="wb-mclose" aria-label="Close">✕</button></div>
    <div class="wb-mbody">
      <div class="pd-wrap">
        <img class="pd-img" src="" alt="">
        <div class="pd-info">
          <p class="pd-name"></p>
          <p class="pd-price"></p>
          <p class="pd-desc"></p>
          <div class="pd-specs"></div>
          <div class="pd-qty">
            <button class="qty-btn" id="pd-minus">−</button>
            <span class="pd-qty-disp qty-disp">1</span>
            <button class="qty-btn" id="pd-plus">+</button>
          </div>
          <button class="wb-btn pd-atc" style="margin-top:14px">Add to Cart 🛒</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Checkout Overlay (4 steps) -->
<div class="wb-overlay" id="checkout-overlay">
  <div class="wb-modal wide" id="checkout-modal" role="dialog" aria-label="Checkout">
    <div class="wb-mhead">
      <h2>Checkout</h2>
      <button class="wb-mclose" aria-label="Close">✕</button>
    </div>
    <div class="wb-mbody">
      <!-- Step bar -->
      <div class="step-bar">
        <div class="step-dot active" title="Info"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Schedule"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Payment"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Confirm"></div>
      </div>
      <!-- Step 0: Info -->
      <div class="step-panel active" id="co-step-0">
        <p class="step-title">Delivery Information</p>
        <div class="wb-row">
          <div class="wb-field"><label>First Name</label><input id="co-fname" placeholder="Jane"></div>
          <div class="wb-field"><label>Last Name</label><input id="co-lname" placeholder="Smith"></div>
        </div>
        <div class="wb-field"><label>Phone</label><input id="co-phone" type="tel" placeholder="(916) 555-0000"></div>
        <div class="wb-field"><label>Email</label><input id="co-email" type="email" placeholder="you@email.com"></div>
        <div class="wb-field"><label>Street Address</label><input id="co-addr" placeholder="123 Main St, Sacramento, CA"></div>
        <div class="wb-row">
          <div class="wb-field"><label>City</label><input id="co-city" placeholder="Sacramento" value="Sacramento"></div>
          <div class="wb-field"><label>ZIP</label><input id="co-zip" placeholder="95814"></div>
        </div>
        <div class="wb-field"><label>Delivery Notes (optional)</label><textarea id="co-notes" placeholder="Gate code, special instructions…" style="min-height:60px"></textarea></div>
        <div class="step-nav"><button class="step-next wb-btn" id="co-next-0">Next: Schedule →</button></div>
      </div>
      <!-- Step 1: Schedule -->
      <div class="step-panel" id="co-step-1">
        <p class="step-title">Choose Delivery Date & Time</p>
        <div class="order-type-wrap">
          <button class="ot-btn sel" data-ot="one-time">One-Time Delivery</button>
          <button class="ot-btn" data-ot="recurring">Recurring Subscription</button>
        </div>
        <div id="co-freq-wrap" style="display:none;margin-bottom:16px">
          <label style="font-size:11px;color:#8BB8D4;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px;display:block">Frequency</label>
          <div class="freq-btns">
            <button class="freq-btn sel" data-f="bi-weekly">Bi-Weekly</button>
            <button class="freq-btn" data-f="weekly">Weekly</button>
            <button class="freq-btn" data-f="monthly">Monthly</button>
          </div>
        </div>
        <div id="co-calendar"></div>
        <p style="font-size:12px;color:#8BB8D4;margin:12px 0 6px">Select a time window:</p>
        <div class="time-wins" id="co-time-wins"></div>
        <div class="step-nav">
          <button class="step-back wb-btn-ghost" id="co-back-1">← Back</button>
          <button class="step-next wb-btn" id="co-next-1">Next: Payment →</button>
        </div>
      </div>
      <!-- Step 2: Payment -->
      <div class="step-panel" id="co-step-2">
        <p class="step-title">Payment</p>
        <div class="pay-opts">
          <button class="pay-apple" id="co-apple-pay">🍎 Apple Pay</button>
          <button class="pay-google" id="co-google-pay"><span style="font-weight:700;color:#4285F4">G</span><span style="font-weight:700;color:#EA4335">o</span><span style="font-weight:700;color:#FBBC05">o</span><span style="font-weight:700;color:#34A853">g</span><span style="font-weight:700;color:#4285F4">l</span><span style="font-weight:700;color:#EA4335">e</span> Pay</button>
        </div>
        <div class="pay-or"><span>or pay with card</span></div>
        <div class="wb-field"><label>Card Number</label><input id="co-card" placeholder="4242 4242 4242 4242" maxlength="19"></div>
        <div class="wb-row">
          <div class="wb-field"><label>Expiry</label><input id="co-exp" placeholder="MM/YY" maxlength="5"></div>
          <div class="wb-field"><label>CVV</label><input id="co-cvv" placeholder="123" maxlength="4"></div>
        </div>
        <div class="wb-field"><label>Name on Card</label><input id="co-cname" placeholder="Jane Smith"></div>
        <div id="co-order-summary"></div>
        <div class="terms-row">By placing your order you agree to our <a href="#" style="color:#00D4FF">Terms of Service</a>.</div>
        <div class="stripe-badge">🔒 Secured by Stripe</div>
        <div class="step-nav">
          <button class="step-back wb-btn-ghost" id="co-back-2">← Back</button>
          <button class="step-next wb-btn" id="co-place-order">Place Order →</button>
        </div>
      </div>
      <!-- Step 3: Confirmation -->
      <div class="step-panel" id="co-step-3">
        <div class="confirm-wrap">
          <div class="confirm-check">✓</div>
          <h3 style="color:#fff;margin:16px 0 8px">Order Confirmed!</h3>
          <p style="color:#8BB8D4;font-size:14px;margin-bottom:4px">Order number:</p>
          <div class="confirm-num" id="co-order-num">WB-XXXXXX</div>
          <p style="color:#8BB8D4;font-size:13px;margin-top:16px">We'll send a confirmation to your email.<br>Your driver will contact you 30 min before arrival.</p>
          <button class="wb-btn" id="co-done-btn" style="margin-top:24px">Done</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Subscription Overlay (5 steps) -->
<div class="wb-overlay" id="sub-overlay">
  <div class="wb-modal wide" id="sub-modal" role="dialog" aria-label="Start Subscription">
    <div class="wb-mhead">
      <h2>Start Your Plan</h2>
      <button class="wb-mclose" aria-label="Close">✕</button>
    </div>
    <div class="wb-mbody">
      <div class="step-bar">
        <div class="step-dot active" title="Plan"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Info"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Schedule"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Payment"></div>
        <div class="step-line"></div>
        <div class="step-dot" title="Confirm"></div>
      </div>
      <!-- Step 0: Plan & Water Type -->
      <div class="step-panel active" id="sub-step-0">
        <p class="step-title">Your Plan</p>
        <div class="sub-plan-card" id="sub-plan-display"></div>
        <p style="margin:18px 0 8px;font-size:13px;font-weight:600;color:#8BB8D4;text-transform:uppercase;letter-spacing:.5px">Water Type</p>
        <div class="wtype-sel">
          <button class="wtype-btn sel" data-wt="purified">Purified</button>
          <button class="wtype-btn" data-wt="alkaline">Alkaline (+$4/jug)</button>
          <button class="wtype-btn" data-wt="distilled">Distilled</button>
        </div>
        <p class="wtype-ph"></p>
        <div class="step-nav"><button class="step-next wb-btn" id="sub-next-0">Next: Your Info →</button></div>
      </div>
      <!-- Step 1: Contact Info -->
      <div class="step-panel" id="sub-step-1">
        <p class="step-title">Contact & Delivery Info</p>
        <div class="wb-row">
          <div class="wb-field"><label>First Name</label><input id="sub-fname" placeholder="Jane"></div>
          <div class="wb-field"><label>Last Name</label><input id="sub-lname" placeholder="Smith"></div>
        </div>
        <div class="wb-field"><label>Phone</label><input id="sub-phone" type="tel" placeholder="(916) 555-0000"></div>
        <div class="wb-field"><label>Email</label><input id="sub-email" type="email" placeholder="you@email.com"></div>
        <div class="wb-field"><label>Street Address</label><input id="sub-addr" placeholder="123 Main St"></div>
        <div class="wb-row">
          <div class="wb-field"><label>City</label><input id="sub-city" placeholder="Sacramento" value="Sacramento"></div>
          <div class="wb-field"><label>ZIP</label><input id="sub-zip" placeholder="95814"></div>
        </div>
        <div class="step-nav">
          <button class="step-back wb-btn-ghost" id="sub-back-1">← Back</button>
          <button class="step-next wb-btn" id="sub-next-1">Next: Schedule →</button>
        </div>
      </div>
      <!-- Step 2: Schedule -->
      <div class="step-panel" id="sub-step-2">
        <p class="step-title">First Delivery Date</p>
        <div id="sub-calendar"></div>
        <p style="font-size:12px;color:#8BB8D4;margin:12px 0 6px">Select a time window:</p>
        <div class="time-wins" id="sub-time-wins"></div>
        <div class="step-nav">
          <button class="step-back wb-btn-ghost" id="sub-back-2">← Back</button>
          <button class="step-next wb-btn" id="sub-next-2">Next: Payment →</button>
        </div>
      </div>
      <!-- Step 3: Payment -->
      <div class="step-panel" id="sub-step-3">
        <p class="step-title">Payment</p>
        <div class="pay-opts">
          <button class="pay-apple" id="sub-apple-pay">🍎 Apple Pay</button>
          <button class="pay-google" id="sub-google-pay"><span style="font-weight:700;color:#4285F4">G</span><span style="font-weight:700;color:#EA4335">o</span><span style="font-weight:700;color:#FBBC05">o</span><span style="font-weight:700;color:#34A853">g</span><span style="font-weight:700;color:#4285F4">l</span><span style="font-weight:700;color:#EA4335">e</span> Pay</button>
        </div>
        <div class="pay-or"><span>or pay with card</span></div>
        <div class="wb-field"><label>Card Number</label><input id="sub-card" placeholder="4242 4242 4242 4242" maxlength="19"></div>
        <div class="wb-row">
          <div class="wb-field"><label>Expiry</label><input id="sub-exp" placeholder="MM/YY" maxlength="5"></div>
          <div class="wb-field"><label>CVV</label><input id="sub-cvv" placeholder="123" maxlength="4"></div>
        </div>
        <div class="wb-field"><label>Name on Card</label><input id="sub-cname" placeholder="Jane Smith"></div>
        <div id="sub-order-summary"></div>
        <div class="terms-row">By subscribing you agree to our <a href="#" style="color:#00D4FF">Terms of Service</a>. Cancel anytime.</div>
        <div class="stripe-badge">🔒 Secured by Stripe</div>
        <div class="step-nav">
          <button class="step-back wb-btn-ghost" id="sub-back-3">← Back</button>
          <button class="step-next wb-btn" id="sub-subscribe-btn">Subscribe →</button>
        </div>
      </div>
      <!-- Step 4: Confirmation -->
      <div class="step-panel" id="sub-step-4">
        <div class="confirm-wrap">
          <div class="confirm-check">✓</div>
          <h3 style="color:#fff;margin:16px 0 8px">You're Subscribed!</h3>
          <p style="color:#8BB8D4;font-size:14px;margin-bottom:4px">Subscription number:</p>
          <div class="confirm-num" id="sub-order-num">WB-XXXXXX</div>
          <p style="color:#8BB8D4;font-size:13px;margin-top:16px">Your first delivery is scheduled.<br>We'll send a reminder 24 hrs before each delivery.</p>
          <button class="wb-btn" id="sub-done-btn" style="margin-top:24px">Done</button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Pay Sim Sheet -->
<div id="pay-sim" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99999;align-items:flex-end;justify-content:center">
  <div class="pay-sheet">
    <div class="pay-sheet-logo"></div>
    <p style="color:#8BB8D4;font-size:13px;margin:6px 0 2px">Waterboy Delivery</p>
    <div class="pay-sheet-amt"></div>
    <div class="face-id"></div>
    <p style="color:#8BB8D4;font-size:12px;margin-top:8px">Authenticating…</p>
  </div>
</div>
`;
  document.body.appendChild(div);
}

/* ── Wire-up Overlay Close Buttons ────────────────────────────── */
function wireCloseButtons(){
  document.addEventListener('click', e=>{
    if(e.target.classList.contains('wb-mclose')){
      const ov = e.target.closest('.wb-overlay');
      if(ov) closeOverlay(ov.id);
    }
    if(e.target.classList.contains('wb-overlay')){
      closeOverlay(e.target.id);
    }
  });
  document.addEventListener('keydown', e=>{
    if(e.key==='Escape') closeAll();
  });
}

/* ── Wire Contact Modal ────────────────────────────────────────── */
function wireContact(){
  // intercept all #contact links
  document.addEventListener('click', e=>{
    const link = e.target.closest('a');
    if(!link) return;
    const href = link.getAttribute('href')||'';
    if(href==='#contact' || href.endsWith('#contact') || href==='#'){
      // only intercept if it's a nav/contact type link
      if(href==='#contact' || href.endsWith('#contact')){
        e.preventDefault();
        openOverlay('contact-overlay');
      }
    }
  });

  const form = document.getElementById('contact-form');
  if(!form) return;
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.textContent='Sending…'; btn.disabled=true;
    try{
      await fetch('/', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(new FormData(form)) });
    } catch(err){}
    form.style.display='none';
    document.getElementById('contact-success').style.display='block';
    setTimeout(()=>closeOverlay('contact-overlay'),3000);
    setTimeout(()=>{ form.style.display='block'; form.reset(); document.getElementById('contact-success').style.display='none'; btn.textContent='Send Message'; btn.disabled=false; },3500);
  });
}

/* ── Wire Auth Modal ───────────────────────────────────────────── */
function wireAuth(){
  // tab switching
  document.addEventListener('click', e=>{
    const tab = e.target.closest('.auth-tab');
    if(!tab) return;
    const panel = tab.dataset.tab;
    $$('.auth-tab').forEach(t=>t.classList.toggle('active', t===tab));
    $$('.auth-panel').forEach(p=>p.classList.toggle('active', p.id==='auth-panel-'+panel));
  });
  // cross-link buttons
  const s2su = document.getElementById('si-to-signup');
  const su2s = document.getElementById('su-to-signin');
  if(s2su) s2su.addEventListener('click',()=>openAuthModal('signup'));
  if(su2s) su2s.addEventListener('click',()=>openAuthModal('signin'));
  // password toggle
  $$('.pw-eye').forEach(btn=>btn.addEventListener('click',()=>{
    const inp = btn.previousElementSibling;
    inp.type = inp.type==='password' ? 'text' : 'password';
  }));
  // Sign In submit
  const siBtn = document.getElementById('si-submit');
  if(siBtn) siBtn.addEventListener('click',()=>{
    const email = document.getElementById('si-email').value.trim();
    const pass  = document.getElementById('si-pass').value;
    const errEl = document.getElementById('si-error');
    if(!email||!pass){ errEl.textContent='Please fill in all fields.'; errEl.style.display='block'; return; }
    // demo credentials check
    if(email===DEMO_EMAIL && pass===DEMO_PASS){
      user = { name:'Demo User', email:DEMO_EMAIL, addr:'', city:'Sacramento', zip:'', phone:'' };
      saveUser(user); updateNavUser(); closeOverlay('auth-overlay');
      toast('Welcome back!','Signed in as Demo User','👋');
    } else if(email && pass.length>=6){
      // simulate any valid-looking credentials
      user = { name: email.split('@')[0], email, addr:'', city:'Sacramento', zip:'', phone:'' };
      saveUser(user); updateNavUser(); closeOverlay('auth-overlay');
      toast('Welcome back!','You are now signed in','👋');
    } else {
      errEl.textContent='Invalid email or password.'; errEl.style.display='block';
    }
  });
  // Sign Up submit
  const suBtn = document.getElementById('su-submit');
  if(suBtn) suBtn.addEventListener('click',()=>{
    const fname = document.getElementById('su-fname').value.trim();
    const lname = document.getElementById('su-lname').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const phone = document.getElementById('su-phone').value.trim();
    const addr  = document.getElementById('su-addr').value.trim();
    const city  = document.getElementById('su-city').value.trim();
    const zip   = document.getElementById('su-zip').value.trim();
    const pass  = document.getElementById('su-pass').value;
    const errEl = document.getElementById('su-error');
    if(!fname||!lname||!email||!pass){ errEl.textContent='Name, email and password are required.'; errEl.style.display='block'; return; }
    if(pass.length<8){ errEl.textContent='Password must be at least 8 characters.'; errEl.style.display='block'; return; }
    user = { name:`${fname} ${lname}`, email, phone, addr, city, zip };
    saveUser(user); updateNavUser(); closeOverlay('auth-overlay');
    toast('Account created!',`Welcome, ${fname}!`,'🎉');
  });
}

/* ── Wire Qty Modal ────────────────────────────────────────────── */
function wireQtyModal(){
  const modal = document.getElementById('qty-overlay');
  if(!modal) return;
  const dispEl = modal.querySelector('.qty-disp');
  const minusBtn = document.getElementById('qm-minus');
  const plusBtn  = document.getElementById('qm-plus');
  const confirmBtn = document.getElementById('qm-confirm');
  const card = modal.querySelector('.wb-modal');
  if(!card) return;
  card._qty = 1;
  if(minusBtn) minusBtn.addEventListener('click',()=>{ card._qty=Math.max(1,card._qty-1); dispEl.textContent=card._qty; });
  if(plusBtn)  plusBtn.addEventListener('click',()=>{ card._qty=Math.min(99,card._qty+1); dispEl.textContent=card._qty; });
  if(confirmBtn) confirmBtn.addEventListener('click',()=>{
    if(_qmCallback) _qmCallback(card._qty);
    closeOverlay('qty-overlay');
    _qmCallback=null;
  });
}

/* ── Wire Product Detail Modal ─────────────────────────────────── */
function wirePdModal(){
  const modal = document.getElementById('pd-modal');
  if(!modal) return;
  modal._qty = 1;
  const dispEl = modal.querySelector('.pd-qty-disp');
  const minus = document.getElementById('pd-minus');
  const plus  = document.getElementById('pd-plus');
  if(minus) minus.addEventListener('click',()=>{ modal._qty=Math.max(1,modal._qty-1); dispEl.textContent=modal._qty; });
  if(plus)  plus.addEventListener('click', ()=>{ modal._qty=Math.min(99,modal._qty+1); dispEl.textContent=modal._qty; });
}

/* ── Wire Cart Drawer ──────────────────────────────────────────── */
function wireCartDrawer(){
  const closeBtn = document.getElementById('cd-close');
  const overlay  = document.getElementById('cart-drawer-overlay');
  const contBtn  = document.getElementById('cd-continue-btn');
  const coBtn    = document.getElementById('cd-checkout-btn');
  const promoBtn = document.getElementById('promo-apply');

  if(closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if(overlay)  overlay.addEventListener('click', e=>{ if(e.target===overlay) closeCartDrawer(); });
  if(contBtn)  contBtn.addEventListener('click', closeCartDrawer);
  if(coBtn)    coBtn.addEventListener('click', ()=>{
    closeCartDrawer();
    if(cart.length===0){ toast('Cart empty','Add some products first','🛒'); return; }
    gotoStep('checkout-overlay', 0);
    openOverlay('checkout-overlay');
    // prefill with user info if logged in
    if(user){
      const f = (id,val)=>{ const el=document.getElementById(id); if(el&&val) el.value=val; };
      const parts = user.name.split(' ');
      f('co-fname', parts[0]||'');
      f('co-lname', parts.slice(1).join(' ')||'');
      f('co-email', user.email||'');
      f('co-phone', user.phone||'');
      f('co-addr',  user.addr||'');
      f('co-city',  user.city||'Sacramento');
      f('co-zip',   user.zip||'');
    }
  });
  if(promoBtn) promoBtn.addEventListener('click',()=>{
    const code = (document.getElementById('promo-input').value||'').trim().toUpperCase();
    if(code==='WATERBOY10') toast('Promo applied!','10% off your order','🎉');
    else toast('Invalid code','That promo code was not found','❌');
  });

  // update count badge on drawer open
  document.addEventListener('click', e=>{
    if(e.target.closest('#cd-count')){
      document.getElementById('cd-count').textContent = cartCount();
    }
  });
}

/* ── Wire Checkout ─────────────────────────────────────────────── */
function wireCheckout(){
  // Step 0 → 1
  const next0 = document.getElementById('co-next-0');
  if(next0) next0.addEventListener('click',()=>{
    const fname = (document.getElementById('co-fname')||{}).value||'';
    const email = (document.getElementById('co-email')||{}).value||'';
    if(!fname||!email){ toast('Missing info','Please fill in your name and email','⚠️'); return; }
    gotoStep('checkout-overlay',1);
    buildCalendar('co-calendar', 3, date=>{ checkoutState.date=date; });
    buildTimeWindows('co-time-wins', tw=>{ checkoutState.time=tw; });
  });

  // Order type
  document.addEventListener('click', e=>{
    const ot = e.target.closest('.ot-btn');
    if(!ot || !ot.closest('#checkout-overlay')) return;
    $$('.ot-btn', document.getElementById('checkout-overlay')).forEach(b=>b.classList.toggle('sel',b===ot));
    checkoutState.orderType = ot.dataset.ot;
    const fw = document.getElementById('co-freq-wrap');
    if(fw) fw.style.display = checkoutState.orderType==='recurring'?'block':'none';
  });
  document.addEventListener('click', e=>{
    const fb = e.target.closest('.freq-btn');
    if(!fb || !fb.closest('#checkout-overlay')) return;
    $$('.freq-btn', document.getElementById('checkout-overlay')).forEach(b=>b.classList.toggle('sel',b===fb));
    checkoutState.freq = fb.dataset.f;
  });

  // Step 1 → 2
  const next1 = document.getElementById('co-next-1');
  if(next1) next1.addEventListener('click',()=>{
    if(!checkoutState.date){ toast('Select a date','Please pick a delivery date','📅'); return; }
    if(!checkoutState.time){ toast('Select a time','Please pick a time window','⏰'); return; }
    gotoStep('checkout-overlay',2);
    buildOrderSummary('co-order-summary');
  });
  const back1 = document.getElementById('co-back-1');
  if(back1) back1.addEventListener('click',()=>gotoStep('checkout-overlay',0));

  // Step 2 → 3
  const back2 = document.getElementById('co-back-2');
  if(back2) back2.addEventListener('click',()=>gotoStep('checkout-overlay',1));

  const placeOrder = document.getElementById('co-place-order');
  if(placeOrder) placeOrder.addEventListener('click',()=>{
    const card = (document.getElementById('co-card')||{}).value||'';
    const cname = (document.getElementById('co-cname')||{}).value||'';
    if(!card||!cname){ toast('Payment info','Please enter card details','💳'); return; }
    gotoStep('checkout-overlay',3);
    const num = genId();
    const numEl = document.getElementById('co-order-num');
    if(numEl) numEl.textContent = num;
    cart=[]; saveCart(cart); updateBadge();
    toast('Order placed!','Check your email for confirmation','✅');
  });

  const appleBtn = document.getElementById('co-apple-pay');
  if(appleBtn) appleBtn.addEventListener('click',()=>showPaySim('apple',()=>{
    gotoStep('checkout-overlay',3);
    const numEl = document.getElementById('co-order-num');
    if(numEl) numEl.textContent=genId();
    cart=[]; saveCart(cart); updateBadge();
    toast('Order placed!','Apple Pay successful!','✅');
  }));

  const googleBtn = document.getElementById('co-google-pay');
  if(googleBtn) googleBtn.addEventListener('click',()=>showPaySim('google',()=>{
    gotoStep('checkout-overlay',3);
    const numEl = document.getElementById('co-order-num');
    if(numEl) numEl.textContent=genId();
    cart=[]; saveCart(cart); updateBadge();
    toast('Order placed!','Google Pay successful!','✅');
  }));

  const doneBtn = document.getElementById('co-done-btn');
  if(doneBtn) doneBtn.addEventListener('click',()=>closeOverlay('checkout-overlay'));

  // card input formatting
  const cardInp = document.getElementById('co-card');
  if(cardInp) cardInp.addEventListener('input',()=>{
    let v = cardInp.value.replace(/\D/g,'').slice(0,16);
    cardInp.value = v.replace(/(.{4})/g,'$1 ').trim();
  });
  const expInp = document.getElementById('co-exp');
  if(expInp) expInp.addEventListener('input',()=>{
    let v = expInp.value.replace(/\D/g,'').slice(0,4);
    if(v.length>2) v=v.slice(0,2)+'/'+v.slice(2);
    expInp.value=v;
  });
}

/* ── Wire Subscription Modal ───────────────────────────────────── */
function wireSubscription(){
  // Water type selection
  document.addEventListener('click', e=>{
    const wb = e.target.closest('.wtype-btn');
    if(!wb || !wb.closest('#sub-overlay')) return;
    $$('.wtype-btn', document.getElementById('sub-overlay')).forEach(b=>b.classList.toggle('sel',b===wb));
    subState.waterType = wb.dataset.wt;
    const ph = document.querySelector('#sub-overlay .wtype-ph');
    if(ph){
      const msgs = { purified:'Standard purified water — clean, crisp taste.', alkaline:'Alkaline (pH 8.5+) — add $4/jug to base price.', distilled:'Distilled water — ultra-pure, great for appliances.' };
      ph.textContent = msgs[subState.waterType]||'';
    }
  });

  // Step 0 → 1
  const next0 = document.getElementById('sub-next-0');
  if(next0) next0.addEventListener('click',()=>gotoStep('sub-overlay',1));

  // Step 1 → 2
  const next1 = document.getElementById('sub-next-1');
  if(next1) next1.addEventListener('click',()=>{
    const fname = (document.getElementById('sub-fname')||{}).value||'';
    const email = (document.getElementById('sub-email')||{}).value||'';
    if(!fname||!email){ toast('Missing info','Please fill in your name and email','⚠️'); return; }
    gotoStep('sub-overlay',2);
    buildCalendar('sub-calendar', 3, date=>{ subState.date=date; });
    buildTimeWindows('sub-time-wins', tw=>{ subState.time=tw; });
  });
  const back1 = document.getElementById('sub-back-1');
  if(back1) back1.addEventListener('click',()=>gotoStep('sub-overlay',0));

  // Step 2 → 3
  const next2 = document.getElementById('sub-next-2');
  if(next2) next2.addEventListener('click',()=>{
    if(!subState.date){ toast('Select a date','Please pick your first delivery date','📅'); return; }
    if(!subState.time){ toast('Select a time','Please pick a time window','⏰'); return; }
    gotoStep('sub-overlay',3);
    // Build sub order summary
    const plan = PLANS[subState.plan]||{};
    const c = document.getElementById('sub-order-summary');
    if(c){
      const jugs = plan.jugs||0;
      const extra = subState.waterType==='alkaline' ? jugs*4 : 0;
      const total = (plan.price||0) + extra;
      c.innerHTML=`<div class="ob-row"><span>${esc(subState.plan||'')} Plan (${jugs} jugs)</span><span>$${(plan.price||0).toFixed(2)}/mo</span></div>
        ${extra?`<div class="ob-row"><span>Alkaline upgrade (${jugs}×$4)</span><span>+$${extra.toFixed(2)}</span></div>`:''}
        <div class="ob-row"><span>Delivery</span><span>FREE</span></div>
        <div class="ob-row grand"><span>Monthly Total</span><span>$${total.toFixed(2)}/mo</span></div>`;
    }
  });
  const back2 = document.getElementById('sub-back-2');
  if(back2) back2.addEventListener('click',()=>gotoStep('sub-overlay',1));

  // Step 3 → 4
  const back3 = document.getElementById('sub-back-3');
  if(back3) back3.addEventListener('click',()=>gotoStep('sub-overlay',2));

  const subBtn = document.getElementById('sub-subscribe-btn');
  if(subBtn) subBtn.addEventListener('click',()=>{
    const card = (document.getElementById('sub-card')||{}).value||'';
    const cname = (document.getElementById('sub-cname')||{}).value||'';
    if(!card||!cname){ toast('Payment info','Please enter card details','💳'); return; }
    gotoStep('sub-overlay',4);
    const numEl = document.getElementById('sub-order-num');
    if(numEl) numEl.textContent=genId();
    toast('Subscribed!','Welcome to Waterboy Delivery!','🎉');
  });

  const subApple = document.getElementById('sub-apple-pay');
  if(subApple) subApple.addEventListener('click',()=>showPaySim('apple',()=>{
    gotoStep('sub-overlay',4);
    const numEl = document.getElementById('sub-order-num');
    if(numEl) numEl.textContent=genId();
    toast('Subscribed!','Apple Pay successful!','🎉');
  }));

  const subGoogle = document.getElementById('sub-google-pay');
  if(subGoogle) subGoogle.addEventListener('click',()=>showPaySim('google',()=>{
    gotoStep('sub-overlay',4);
    const numEl = document.getElementById('sub-order-num');
    if(numEl) numEl.textContent=genId();
    toast('Subscribed!','Google Pay successful!','🎉');
  }));

  const doneBtn = document.getElementById('sub-done-btn');
  if(doneBtn) doneBtn.addEventListener('click',()=>closeOverlay('sub-overlay'));

  // sub card formatting
  const cardInp = document.getElementById('sub-card');
  if(cardInp) cardInp.addEventListener('input',()=>{
    let v=cardInp.value.replace(/\D/g,'').slice(0,16);
    cardInp.value=v.replace(/(.{4})/g,'$1 ').trim();
  });
  const expInp = document.getElementById('sub-exp');
  if(expInp) expInp.addEventListener('input',()=>{
    let v=expInp.value.replace(/\D/g,'').slice(0,4);
    if(v.length>2) v=v.slice(0,2)+'/'+v.slice(2);
    expInp.value=v;
  });
}

/* ── Wire Nav User Button ──────────────────────────────────────── */
function wireNavUser(){
  document.addEventListener('click', e=>{
    const btn = e.target.closest('.nav-user-btn');
    if(btn){
      if(!user){ openAuthModal('signin'); return; }
      const drop = btn.parentElement.querySelector('.nav-user-drop');
      if(drop) drop.classList.toggle('open');
      return;
    }
    // close drop if clicking outside
    if(!e.target.closest('.nav-user-wrap')){
      $$('.nav-user-drop').forEach(d=>d.classList.remove('open'));
    }
  });
}

/* ── Wire Pricing Buttons (index.html) ────────────────────────── */
function wirePricingButtons(){
  $$('.pricing-card').forEach(card=>{
    const h3 = card.querySelector('h3');
    const planName = h3 ? h3.textContent.trim() : '';
    // find the "Get Started" button
    const btn = card.querySelector('.btn, .pricing-cta, button, a[href="#contact"]');
    if(!btn) return;
    btn.addEventListener('click', e=>{
      e.preventDefault();
      if(PLANS[planName]){
        subState.plan = planName;
        // populate plan display
        const plan = PLANS[planName];
        const display = document.getElementById('sub-plan-display');
        if(display){
          display.innerHTML=`
            <div class="sub-plan-name">${esc(planName)}</div>
            <div class="sub-plan-price">$${plan.price}<span>/mo</span></div>
            <div class="sub-plan-tags">${plan.perks.map(p=>`<span class="sub-tag">${esc(p)}</span>`).join('')}</div>
          `;
        }
        gotoStep('sub-overlay',0);
        openOverlay('sub-overlay');
      }
    });
  });
}

/* ── Wire Catalog Cards (products.html) ────────────────────────── */
function wireCatalogCards(){
  // map image URL fragments to product IDs
  const imgMap = {};
  Object.entries(PRODUCTS).forEach(([id,p])=>{
    const fname = decodeURIComponent(p.img).split('/').pop().toLowerCase();
    imgMap[fname] = id;
  });

  $$('.catalog-card').forEach(card=>{
    const img = card.querySelector('img');
    if(!img) return;
    const src = decodeURIComponent(img.getAttribute('src')||'');
    const fname = src.split('/').pop().toLowerCase();
    const pid = imgMap[fname];
    if(!pid) return;
    card.dataset.pid = pid;

    // rewire "View Details" link
    const viewLink = card.querySelector('.catalog-view, a');
    if(viewLink){
      viewLink.href='#';
      viewLink.onclick=(e)=>{ e.preventDefault(); openProductDetail(pid); };
    }

    // add "Add to Cart" button if not already there
    if(!card.querySelector('.catalog-atc') && PRODUCTS[pid].price){
      const body = card.querySelector('.catalog-card-body');
      if(body){
        const btn = document.createElement('button');
        btn.className='catalog-atc';
        btn.textContent='Add to Cart';
        btn.addEventListener('click',()=>{
          openQtyModal(pid, qty=>{
            cartAdd(pid, qty);
            toast(PRODUCTS[pid].name, `Added ${qty} to cart`,'🛒');
          });
        });
        body.appendChild(btn);
      }
    }
  });
}

/* ── Inject Navbar Buttons ─────────────────────────────────────── */
function injectNavButtons(){
  // Find nav-links ul on this page
  const navLinks = document.querySelector('.nav-links, nav ul');
  if(!navLinks) return;

  // Cart button
  if(!document.querySelector('.nav-cart-btn')){
    const cartLi = document.createElement('li');
    cartLi.innerHTML=`<button class="nav-cart-btn" aria-label="Shopping cart">
      🛒
      <span class="cart-badge" style="display:none">0</span>
    </button>`;
    navLinks.appendChild(cartLi);
    cartLi.querySelector('.nav-cart-btn').addEventListener('click', openCartDrawer);
  }

  // User button
  if(!document.querySelector('.nav-user-btn')){
    const userLi = document.createElement('li');
    userLi.innerHTML=`<div class="nav-user-wrap">
      <button class="nav-user-btn"><span class="nav-user-name">Sign In</span></button>
      <div class="nav-user-drop"></div>
    </div>`;
    navLinks.appendChild(userLi);
  }
  updateNavUser();
  updateBadge();
}

/* ── Init ──────────────────────────────────────────────────────── */
function init(){
  inject();
  injectNavButtons();
  wireCloseButtons();
  wireContact();
  wireAuth();
  wireQtyModal();
  wirePdModal();
  wireCartDrawer();
  wireCheckout();
  wireSubscription();
  wireNavUser();
  wirePricingButtons();
  wireCatalogCards();

  // update cart badge in the injected cart button
  updateBadge();

  // update cd-count when drawer opens
  const origOpen = openCartDrawer;
  // patch openCartDrawer to update count
  document.querySelectorAll('.nav-cart-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const cc = document.getElementById('cd-count');
      if(cc) cc.textContent=cartCount();
    });
  });
}

document.addEventListener('DOMContentLoaded', init);

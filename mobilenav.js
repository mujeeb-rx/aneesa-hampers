/**
 * mobilenav.js — Shared Sidebar Navigation
 * Aneesa Hampers · Single source of truth for the hamburger sidebar
 *
 * ► Injects canonical CSS (overrides per-page dark sidebar styles)
 * ► Injects ham-btn if page doesn't have one
 * ► Builds/rebuilds sidebar HTML with correct links + active state
 * ► Handles open/close, overlay, keyboard, scroll-lock
 * ► Works on ALL pages: index, products, cart, orders, account, etc.
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     1. CANONICAL CSS  —  identical white-sidebar design on every page
        Injected AFTER page styles so these win via specificity/order.
     ══════════════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById('mnav-styles')) return;
    var s = document.createElement('style');
    s.id = 'mnav-styles';
    s.textContent = [
      /* ── Suppress old mobilenav.js elements ── */
      '#mn-sidebar,#mn-overlay,#mn-ham{display:none!important;}',

      /* ── Hamburger button ── */
      '.ham-btn{',
        'display:none;',          /* shown by @media below */
        'position:fixed;',
        'left:14px;top:14px;',
        'width:40px;height:40px;',
        'background:#3b0d1a;',    /* --burgundy */
        'border:none;border-radius:10px;',
        'cursor:pointer;',
        'flex-direction:column;align-items:center;justify-content:center;',
        'gap:5px;',
        'box-shadow:0 4px 16px rgba(59,13,26,.25);',
        'z-index:8300;',          /* above sidebar (8200) */
        '-webkit-tap-highlight-color:transparent;',
        'transition:background .2s,box-shadow .2s;',
      '}',
      '.ham-btn:hover{background:#5a1528;}',
      '.ham-btn span{',
        'display:block;width:16px;height:2px;',
        'background:#fff;border-radius:2px;',
        'transition:transform .25s,opacity .2s;',
      '}',
      '@media(max-width:900px){',
        '.ham-btn{display:flex!important;}',     /* always show on mobile */
        '@media(min-width:901px){.ham-btn{display:none!important;}}',
      '}',
      '@media(min-width:901px){.ham-btn{display:none!important;}}',

      /* ── Overlay ── */
      '#enh-overlay{',
        'position:fixed;inset:0;',
        'background:rgba(20,4,10,.5);',
        'backdrop-filter:blur(4px);',
        'z-index:8150;',
        'opacity:0;pointer-events:none;',
        'transition:opacity .3s;',
        'display:none;',
      '}',
      '#enh-overlay.show{opacity:1;pointer-events:all;}',

      /* ── Sidebar panel ── */
      '#enh-sidebar{',
        'position:fixed;top:0;left:0;',
        'width:300px;max-width:85vw;',
        'height:100%;height:100dvh;',
        'background:#fff!important;',           /* FORCE white — overrides dark gradient */
        'z-index:8200!important;',
        'display:flex!important;',
        'flex-direction:column!important;',
        'overflow:hidden!important;',
        'box-shadow:8px 0 40px rgba(59,13,26,.18);',
        '-webkit-transform:translateX(-100%);transform:translateX(-100%);',
        '-webkit-transition:transform .38s cubic-bezier(.4,0,.2,1);',
        'transition:transform .38s cubic-bezier(.4,0,.2,1);',
        'padding:0!important;',                 /* reset any nav padding */
        'align-items:stretch!important;',
        'justify-content:flex-start!important;',
      '}',
      '#enh-sidebar.open{-webkit-transform:translateX(0);transform:translateX(0);}',

      /* ── User area (gradient header) ── */
      '.esb-user-area{',
        'background:linear-gradient(135deg,#3b0d1a 0%,#7a2040 100%)!important;',
        'padding:52px 20px 20px;position:relative;',
        '-webkit-flex-shrink:0;flex-shrink:0;',
      '}',

      /* ── Close button ── */
      '.esb-close{',
        'position:absolute;top:14px;right:14px;',
        'width:32px;height:32px;',
        'background:rgba(255,255,255,.12);border:none;',
        'color:#fff;border-radius:50%;cursor:pointer;',
        'font-size:1rem;',
        'display:flex;align-items:center;justify-content:center;',
        'transition:background .2s;',
      '}',
      '.esb-close:hover{background:rgba(255,255,255,.22);}',

      /* ── Avatar / greeting / sign-in ── */
      '.esb-avatar{',
        'width:52px;height:52px;border-radius:50%;',
        'background:rgba(255,255,255,.18);',
        'border:2px solid rgba(255,255,255,.3);',
        'display:flex;align-items:center;justify-content:center;',
        'font-size:1.5rem;margin-bottom:10px;',
        'color:#fff;',
      '}',
      '.esb-greeting{font-size:.72rem;color:rgba(255,255,255,.55);letter-spacing:.5px;}',
      '.esb-name{',
        'font-family:"Cormorant Garamond",serif;',
        'font-size:1.3rem;color:#fff;margin-top:2px;',
      '}',
      '.esb-signin-btn{',
        'display:inline-flex;align-items:center;gap:6px;margin-top:10px;',
        'background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.2);',
        'color:#fff;padding:7px 16px;border-radius:30px;',
        'font-family:"Jost",sans-serif;font-size:.68rem;',
        'letter-spacing:1.5px;text-transform:uppercase;',
        'text-decoration:none;transition:background .2s;',
      '}',
      '.esb-signin-btn:hover{background:rgba(255,255,255,.25);}',

      /* ── Scroll area ── */
      '.esb-scroll{',
        '-webkit-flex:1 1 auto;flex:1 1 auto;',
        'overflow-y:auto;overflow-x:hidden;',
        '-webkit-overflow-scrolling:touch;',
        'min-height:0;overscroll-behavior:contain;',
      '}',
      '.esb-scroll::-webkit-scrollbar{width:3px;}',
      '.esb-scroll::-webkit-scrollbar-thumb{background:rgba(192,100,122,.2);border-radius:2px;}',

      /* ── Section labels ── */
      '.esb-section-lbl{',
        'font-size:.56rem;letter-spacing:3px;text-transform:uppercase;',
        'color:rgba(59,13,26,.3);padding:16px 20px 6px;font-weight:600;',
      '}',

      /* ── Links ── */
      '.esb-link{',
        'display:flex;align-items:center;gap:12px;padding:13px 20px;',
        'text-decoration:none;color:rgba(59,13,26,.7);',
        'font-family:"Jost",sans-serif;font-size:.84rem;font-weight:400;',
        'transition:all .18s;position:relative;',
        'border-left:3px solid transparent;',
        'background:none;border-top:none;border-right:none;border-bottom:none;',
        'width:100%;box-sizing:border-box;cursor:pointer;',
      '}',
      '.esb-link:hover{color:#3b0d1a;background:rgba(192,100,122,.06);border-left-color:rgba(192,100,122,.3);}',
      '.esb-link.active{color:#c0647a;background:rgba(192,100,122,.08);border-left-color:#c0647a;font-weight:500;}',

      /* ── Expand button ── */
      '.esb-expand-btn{',
        'display:flex;align-items:center;gap:12px;width:100%;padding:13px 20px;',
        'background:none;border:none;',
        'color:rgba(59,13,26,.7);font-family:"Jost",sans-serif;font-size:.84rem;',
        'cursor:pointer;text-align:left;border-left:3px solid transparent;transition:all .18s;',
        'box-sizing:border-box;',
      '}',
      '.esb-expand-btn:hover{color:#3b0d1a;background:rgba(192,100,122,.06);border-left-color:rgba(192,100,122,.3);}',
      '.esb-expand-btn.open{color:#c0647a;}',
      '.esb-expand-btn .esb-link-arrow{transition:transform .25s;}',
      '.esb-expand-btn.open .esb-link-arrow{transform:rotate(90deg);}',

      /* ── Sub menu ── */
      '.esb-sub{max-height:0;overflow:hidden;transition:max-height .35s ease;background:rgba(192,100,122,.03);}',
      '.esb-sub.open{max-height:400px;}',
      '.esb-sub-link{',
        'display:flex;align-items:center;gap:10px;',
        'padding:10px 20px 10px 56px;',
        'text-decoration:none;color:rgba(59,13,26,.55);',
        'font-size:.8rem;transition:color .18s;border-left:3px solid transparent;',
      '}',
      '.esb-sub-link:hover{color:#c0647a;}',

      /* ── Misc shared ── */
      '.esb-link-icon{font-size:1.1rem;width:24px;text-align:center;flex-shrink:0;}',
      '.esb-link-arrow{margin-left:auto;font-size:.7rem;opacity:.3;transition:transform .2s;}',
      '.esb-link-badge{margin-left:auto;background:#c0647a;color:#fff;font-size:.55rem;font-weight:700;padding:2px 8px;border-radius:10px;}',
      '.esb-divider{height:1px;background:rgba(192,100,122,.08);margin:4px 0;}',

      /* ── Logout button ── */
      '.esb-logout-btn{',
        'width:100%;margin-top:8px;padding:10px;background:transparent;',
        'border:1px solid rgba(200,60,60,.2);border-radius:10px;',
        'color:rgba(200,60,60,.7);font-family:"Jost",sans-serif;font-size:.7rem;',
        'letter-spacing:1px;text-transform:uppercase;cursor:pointer;transition:all .2s;',
        'display:none;',
      '}',
      '.esb-logout-btn:hover{background:rgba(200,60,60,.07);}',

      /* ── Footer ── */
      '.esb-footer{',
        'padding:14px 16px max(28px,env(safe-area-inset-bottom,28px));',
        'border-top:1px solid rgba(192,100,122,.1);',
        '-webkit-flex-shrink:0;flex-shrink:0;',
      '}',
      '.esb-wa-btn{',
        'display:flex;align-items:center;justify-content:center;gap:8px;',
        'padding:12px;background:#25D366;color:#fff;border-radius:12px;',
        'text-decoration:none;font-family:"Jost",sans-serif;font-size:.72rem;',
        'letter-spacing:1.5px;text-transform:uppercase;font-weight:500;',
        'transition:opacity .2s;margin-bottom:8px;',
      '}',
      '.esb-wa-btn:hover{opacity:.88;}',
      '.esb-settings-row{display:flex;gap:8px;margin-bottom:0;}',
      '.esb-settings-btn{',
        'flex:1;padding:10px;background:rgba(59,13,26,.05);',
        'border:1px solid rgba(192,100,122,.12);border-radius:10px;',
        'font-family:"Jost",sans-serif;font-size:.65rem;letter-spacing:1px;',
        'text-transform:uppercase;color:rgba(59,13,26,.55);cursor:pointer;transition:all .2s;',
        'display:flex;align-items:center;justify-content:center;gap:5px;',
      '}',
      '.esb-settings-btn:hover{background:rgba(192,100,122,.08);border-color:rgba(192,100,122,.25);}',
    ].join('');

    /* Append to end of head so this beats per-page styles */
    document.head.appendChild(s);
  }

  /* ══════════════════════════════════════════════════════════════
     2. CART HELPER
     ══════════════════════════════════════════════════════════════ */
  function cartCount() {
    try {
      var u = JSON.parse(localStorage.getItem('ah_user') || 'null');
      var key = (u && u.uid) ? 'ah_cart_' + u.uid : 'ah_cart_guest';
      var items = JSON.parse(localStorage.getItem(key) || '[]');
      return items.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
    } catch (e) { return 0; }
  }

  /* ══════════════════════════════════════════════════════════════
     3. HAM-BTN — inject if page doesn't have one
     ══════════════════════════════════════════════════════════════ */
  function ensureHamBtn() {
    if (document.querySelector('.ham-btn')) return; // already present
    var btn = document.createElement('button');
    btn.className = 'ham-btn';
    btn.setAttribute('aria-label', 'Open menu');
    btn.onclick = enhSbOpen;
    btn.innerHTML = '<span></span><span></span><span></span>';
    /* Insert as first child of body so it's at the top of stacking context */
    document.body.insertBefore(btn, document.body.firstChild);
  }

  /* ══════════════════════════════════════════════════════════════
     4. BUILD SIDEBAR — shared HTML structure for all pages
     ══════════════════════════════════════════════════════════════ */
  function buildSidebar() {
    /* If it already exists, just refresh user state */
    if (document.getElementById('enh-sidebar')) {
      refreshUserState();
      refreshActiveLink();
      return;
    }

    /* Overlay */
    var overlay = document.createElement('div');
    overlay.id = 'enh-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', enhSbClose);

    /* Sidebar */
    var sb = document.createElement('nav');
    sb.id = 'enh-sidebar';
    sb.setAttribute('role', 'navigation');
    sb.setAttribute('aria-label', 'Site navigation');

    var page = location.pathname.split('/').pop() || 'index.html';
    function active(href) { return page === href.split('?')[0] ? ' active' : ''; }

    var count = cartCount();
    var cartBadge = count > 0
      ? '<span class="esb-link-badge">' + count + '</span>'
      : '<span class="esb-link-arrow">›</span>';

    sb.innerHTML =
      '<div class="esb-user-area" id="esb-user-area">' +
        '<button class="esb-close" id="esb-close-btn" aria-label="Close menu">✕</button>' +
        '<div class="esb-avatar" id="esb-av">👤</div>' +
        '<div class="esb-greeting" id="esb-greeting">Hello,</div>' +
        '<div class="esb-name" id="esb-nm">Guest Visitor</div>' +
        '<a href="login.html" class="esb-signin-btn" id="esb-signin">🔑 Sign In / Create Account</a>' +
      '</div>' +
      '<div class="esb-scroll">' +
        '<div class="esb-section-lbl">Menu</div>' +
        '<a href="index.html"    class="esb-link' + active('index.html')    + '"><span class="esb-link-icon">🏠</span>Home</a>' +
        '<a href="products.html" class="esb-link' + active('products.html') + '"><span class="esb-link-icon">🎁</span>Collections</a>' +
        '<button class="esb-expand-btn" onclick="mnavToggleSub(this)">' +
          '<span class="esb-link-icon">📂</span>Categories<span class="esb-link-arrow" style="margin-left:auto">›</span>' +
        '</button>' +
        '<div class="esb-sub" id="esb-cat-sub">' +
          '<a href="products.html?filter=new"        class="esb-sub-link">✨ New Arrivals</a>' +
          '<a href="products.html?filter=bestseller" class="esb-sub-link">⭐ Best Sellers</a>' +
          '<a href="products.html?filter=offers"     class="esb-sub-link">⚡ Offers & Deals</a>' +
        '</div>' +
        '<div class="esb-divider"></div>' +
        '<div class="esb-section-lbl">My Account</div>' +
        '<a href="orders.html"  class="esb-link' + active('orders.html')  + '"><span class="esb-link-icon">📦</span>My Orders</a>' +
        '<a href="cart.html"    class="esb-link' + active('cart.html')    + '"><span class="esb-link-icon">🛒</span>My Cart' + cartBadge + '</a>' +
        '<a href="account.html" class="esb-link' + active('account.html') + '"><span class="esb-link-icon">👤</span>My Account<span class="esb-link-arrow">›</span></a>' +
        '<div class="esb-divider"></div>' +
        '<div class="esb-section-lbl">Support</div>' +
        '<a href="https://wa.me/918639066613" target="_blank" class="esb-link"><span class="esb-link-icon">💬</span>Help & Support</a>' +
        '<button class="esb-logout-btn" id="esb-logout" onclick="mnavDoLogout()">🔒 Sign Out</button>' +
      '</div>' +
      '<div class="esb-footer">' +
        '<a href="https://wa.me/918639066613?text=Hi!%20I%20want%20to%20order%20a%20hamper" target="_blank" class="esb-wa-btn">💬 Order on WhatsApp</a>' +
        '<div class="esb-settings-row">' +
          '<button class="esb-settings-btn" onclick="document.querySelector(\'#enh-sidebar .esb-scroll\').scrollTop=0">↑ Top</button>' +
          '<button class="esb-settings-btn" onclick="location.href=\'account.html\'">⚙️ Settings</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(overlay);
    document.body.appendChild(sb);

    /* Wire up close button */
    document.getElementById('esb-close-btn').addEventListener('click', enhSbClose);

    refreshUserState();
  }

  /* ══════════════════════════════════════════════════════════════
     5. REFRESH USER STATE — updates avatar/name/sign-in button
     ══════════════════════════════════════════════════════════════ */
  function refreshUserState() {
    var session = null;
    try { session = JSON.parse(localStorage.getItem('ah_user') || 'null'); } catch (e) {}

    var avEl   = document.getElementById('esb-av');
    var grEl   = document.getElementById('esb-greeting');
    var nmEl   = document.getElementById('esb-nm');
    var siEl   = document.getElementById('esb-signin');
    var lgEl   = document.getElementById('esb-logout');

    if (!avEl) return; // sidebar not yet in DOM

    if (session && session.uid) {
      var name = session.name || session.email || 'Friend';
      var initial = name.charAt(0).toUpperCase();
      /* Show initial in avatar */
      avEl.textContent = '';
      avEl.style.cssText += 'background:linear-gradient(135deg,#c0647a,#3b0d1a);color:#fff;font-size:1.4rem;font-weight:700;font-family:"Cormorant Garamond",serif;';
      avEl.textContent = initial;
      if (grEl) grEl.textContent = 'Welcome back,';
      if (nmEl) nmEl.textContent = name.split(' ')[0];
      if (siEl) siEl.style.display = 'none';
      if (lgEl) lgEl.style.display = 'block';
    } else {
      avEl.textContent = '👤';
      avEl.style.cssText += '';
      if (grEl) grEl.textContent = 'Hello,';
      if (nmEl) nmEl.textContent = 'Guest Visitor';
      if (siEl) siEl.style.display = '';
      if (lgEl) lgEl.style.display = 'none';
    }
  }

  /* ══════════════════════════════════════════════════════════════
     6. REFRESH ACTIVE LINK (for pages that hard-code sidebar)
     ══════════════════════════════════════════════════════════════ */
  function refreshActiveLink() {
    var page = location.pathname.split('/').pop() || 'index.html';
    var sb = document.getElementById('enh-sidebar');
    if (!sb) return;
    sb.querySelectorAll('.esb-link').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop().split('?')[0];
      if (href === page) a.classList.add('active');
      else a.classList.remove('active');
    });
  }

  /* ══════════════════════════════════════════════════════════════
     7. OPEN / CLOSE
     ══════════════════════════════════════════════════════════════ */
  window.enhSbOpen = function () {
    var sb = document.getElementById('enh-sidebar');
    var ov = document.getElementById('enh-overlay');
    if (!sb) { buildSidebar(); sb = document.getElementById('enh-sidebar'); ov = document.getElementById('enh-overlay'); }
    if (sb) sb.classList.add('open');
    if (ov) { ov.style.display = 'block'; setTimeout(function () { ov.classList.add('show'); }, 10); }
    document.body.style.overflow = 'hidden';
  };

  window.enhSbClose = function () {
    var sb = document.getElementById('enh-sidebar');
    var ov = document.getElementById('enh-overlay');
    if (sb) sb.classList.remove('open');
    if (ov) {
      ov.classList.remove('show');
      setTimeout(function () { ov.style.display = 'none'; }, 310);
    }
    document.body.style.overflow = '';
  };

  /* ══════════════════════════════════════════════════════════════
     8. SUB-MENU TOGGLE
     ══════════════════════════════════════════════════════════════ */
  window.mnavToggleSub = function (btn) {
    var sub = document.getElementById('esb-cat-sub');
    if (!sub) return;
    var open = sub.classList.contains('open');
    sub.classList.toggle('open', !open);
    btn.classList.toggle('open', !open);
    btn.setAttribute('aria-expanded', String(!open));
  };

  /* keep backwards-compat alias */
  window.eshToggleSub = window.mnavToggleSub;
  window.enhToggle = function (id, btn) {
    var sub = document.getElementById(id);
    if (!sub) return;
    var open = sub.classList.contains('open');
    sub.classList.toggle('open', !open);
    if (btn) { btn.classList.toggle('open', !open); }
  };

  /* ══════════════════════════════════════════════════════════════
     9. LOGOUT
     ══════════════════════════════════════════════════════════════ */
  window.mnavDoLogout = window.eshDoLogout = function () {
    if (!confirm('Sign out of your account?')) return;
    Object.keys(localStorage)
      .filter(function (k) { return k.startsWith('ah_'); })
      .forEach(function (k) { localStorage.removeItem(k); });
    window.location.href = 'index.html';
  };

  /* ══════════════════════════════════════════════════════════════
     10. KEYBOARD — close on Escape
     ══════════════════════════════════════════════════════════════ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') enhSbClose();
  });

  /* ══════════════════════════════════════════════════════════════
     11. INIT
     ══════════════════════════════════════════════════════════════ */
  function init() {
    injectStyles();    // canonical CSS — must come first
    ensureHamBtn();    // make sure ham-btn exists on every page
    buildSidebar();    // build or refresh sidebar
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

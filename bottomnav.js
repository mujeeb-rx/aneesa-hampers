/**
 * bottomnav.js — Mobile Bottom Navigation Bar
 * Aneesa Hampers · ALL PAGES
 *
 * Self-contained: injects CSS + HTML, manages visibility,
 * active state, cart badge, and safe-area padding.
 * Shows on: ALL pages at mobile width (≤ 900px)
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────
     1. INJECT STYLES — single source of truth for bottom nav CSS
        Runs once; no per-page CSS needed.
  ───────────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('bn-styles')) return;
    var s = document.createElement('style');
    s.id = 'bn-styles';
    s.textContent = [
      /* Base — hidden by default on desktop, use !important to override page styles */
      '#bottomNav{',
        'display:none!important;',
        'position:fixed!important;',
        'bottom:0!important;left:0!important;right:0!important;',
        'height:66px!important;',
        'background:#fff!important;',
        'border-top:1px solid rgba(192,100,122,.12)!important;',
        'box-shadow:0 -4px 20px rgba(59,13,26,.08)!important;',
        'z-index:990!important;',
        'justify-content:space-evenly!important;',
        'align-items:center!important;',
        'padding:0!important;',
        'margin:0!important;',
        '-webkit-tap-highlight-color:transparent;',
        /* iOS safe area */
        'padding-bottom:env(safe-area-inset-bottom,0px)!important;',
      '}',

      /* Nav items — all with !important for consistency */
      '#bottomNav .bn-item{',
        'display:flex!important;flex-direction:column!important;',
        'align-items:center!important;justify-content:center!important;',
        'gap:4px!important;flex:1 1 0%!important;',
        'text-decoration:none!important;',
        'color:rgba(59,13,26,.38)!important;',
        'font-size:.5rem!important;letter-spacing:.5px!important;text-transform:uppercase!important;',
        'font-family:"Jost",sans-serif!important;font-weight:500!important;',
        'position:relative!important;',
        'transition:color .18s,background .18s;',
        'padding:10px 4px 8px!important;',
        'min-height:56px!important;',
        'max-width:20%!important;',
        'width:20%!important;',
        '-webkit-tap-highlight-color:transparent;',
        'border:none!important;background:transparent!important;',
        'margin:0!important;',
        'box-sizing:border-box!important;',
      '}',
      '#bottomNav .bn-item:active{background:rgba(192,100,122,.07)!important;}',
      '#bottomNav .bn-item.active{color:#c0647a!important;}',
      '#bottomNav .bn-item.active .bn-icon{transform:translateY(-1px);}',

      /* Active indicator pill above icon */
      '#bottomNav .bn-item.active::before{',
        'content:""!important;',
        'position:absolute!important;top:2px!important;left:50%!important;transform:translateX(-50%)!important;',
        'width:24px!important;height:3px!important;',
        'background:#c0647a!important;border-radius:0 0 4px 4px!important;',
      '}',

      /* Icon + label */
      '#bottomNav .bn-icon{',
        'line-height:1!important;display:flex!important;align-items:center!important;justify-content:center!important;',
        'transition:transform .18s;',
        'width:24px!important;height:24px!important;',
      '}',
      '#bottomNav .bn-icon svg{',
        'width:22px!important;height:22px!important;',
        'stroke:currentColor!important;',
        'transition:stroke .18s,transform .18s;',
      '}',
      '#bottomNav .bn-item.active .bn-icon svg{',
        'stroke:#c0647a!important;',
      '}',
      '#bottomNav .bn-label{font-size:.5rem!important;white-space:nowrap!important;margin-top:4px!important;display:block!important;line-height:1.1!important;}',

      /* Cart badge */
      '#bottomNav .bn-badge{',
        'position:absolute!important;',
        'top:5px!important;',
        'left:calc(50% + 6px)!important;',
        'background:#c0647a!important;color:#fff!important;',
        'font-size:.48rem!important;font-weight:700!important;',
        'min-width:16px!important;height:16px!important;border-radius:10px!important;',
        'padding:0 3px!important;',
        'display:none;align-items:center!important;justify-content:center!important;',
        'border:2px solid #fff!important;',
        'font-family:"Jost",sans-serif!important;',
        'line-height:1!important;',
      '}',

      /* Show on mobile ≤ 900px - ALL PAGES */
      '@media(max-width:900px){',
        '#bottomNav{display:flex!important;width:100%!important;}',
        'body{padding-bottom:calc(76px + env(safe-area-inset-bottom,0px))!important;}',
      '}',
    ].join('');
    /* Append to head for highest priority */
    document.head.appendChild(s);
  }

  /* ─────────────────────────────────────────────────────────────
     2. CART HELPERS
  ───────────────────────────────────────────────────────────── */
  function cartKey() {
    try {
      var u = JSON.parse(localStorage.getItem('ah_user') || 'null');
      return (u && u.uid) ? 'ah_cart_' + u.uid : 'ah_cart_guest';
    } catch (e) { return 'ah_cart_guest'; }
  }

  function cartCount() {
    try {
      var items = JSON.parse(localStorage.getItem(cartKey()) || '[]');
      return items.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
    } catch (e) { return 0; }
  }

  /* ─────────────────────────────────────────────────────────────
     3. INJECT HTML — called only if #bottomNav not already in page
  ───────────────────────────────────────────────────────────── */
  function injectBottomNav() {
    if (document.getElementById('bottomNav')) {
      /* Already in HTML — normalise it: ensure it has role + aria */
      var existing = document.getElementById('bottomNav');
      existing.setAttribute('role', 'navigation');
      existing.setAttribute('aria-label', 'Mobile navigation');
      return;
    }

    var nav = document.createElement('nav');
    nav.id = 'bottomNav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Mobile navigation');

    var page = location.pathname.split('/').pop() || 'index.html';

    function isActive(href) {
      var target = href.split('/').pop().split('?')[0];
      return page === target ? ' active' : '';
    }

    nav.innerHTML =
      '<a href="index.html"    class="bn-item' + isActive('index.html')    + '" aria-label="Home">' +
        '<span class="bn-icon">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>' +
            '<polyline points="9 22 9 12 15 12 15 22"></polyline>' +
          '</svg>' +
        '</span><span class="bn-label">Home</span>' +
      '</a>' +
      '<a href="products.html" class="bn-item' + isActive('products.html') + '" aria-label="Shop">' +
        '<span class="bn-icon">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>' +
            '<line x1="3" y1="6" x2="21" y2="6"></line>' +
            '<path d="M16 10a4 4 0 0 1-8 0"></path>' +
          '</svg>' +
        '</span><span class="bn-label">Shop</span>' +
      '</a>' +
      '<a href="cart.html"     class="bn-item' + isActive('cart.html')     + '" aria-label="Cart" style="position:relative">' +
        '<span class="bn-icon">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<circle cx="9" cy="21" r="1"></circle>' +
            '<circle cx="20" cy="21" r="1"></circle>' +
            '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>' +
          '</svg>' +
        '</span><span class="bn-label">Cart</span>' +
        '<span class="bn-badge" id="bnCartBadge">0</span>' +
      '</a>' +
      '<a href="orders.html"   class="bn-item' + isActive('orders.html')   + '" aria-label="Orders">' +
        '<span class="bn-icon">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>' +
            '<polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>' +
            '<line x1="12" y1="22.08" x2="12" y2="12"></line>' +
          '</svg>' +
        '</span><span class="bn-label">Orders</span>' +
      '</a>' +
      '<a href="account.html"  class="bn-item' + isActive('account.html')  + '" aria-label="Account">' +
        '<span class="bn-icon">' +
          '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>' +
            '<circle cx="12" cy="7" r="4"></circle>' +
          '</svg>' +
        '</span><span class="bn-label">Account</span>' +
      '</a>';

    document.body.appendChild(nav);
  }

  /* ─────────────────────────────────────────────────────────────
     4. SYNC EXISTING #bottomNav HTML — fix active states on pages
        that have a hard-coded nav (account.html, cart.html etc.)
  ───────────────────────────────────────────────────────────── */
  function syncActiveState() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    var page = location.pathname.split('/').pop() || 'index.html';
    
    // Handle root path
    if (page === '' || page === '/') page = 'index.html';
    
    nav.querySelectorAll('.bn-item').forEach(function (a) {
      var href = (a.getAttribute('href') || '').split('/').pop().split('?')[0];
      if (href === page || (page === 'index.html' && href === '')) {
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5. CART BADGE UPDATE — updates all badge elements on page
  ───────────────────────────────────────────────────────────── */
  function updateCartBadge() {
    var count = cartCount();

    /* Update the injected badge */
    var badge = document.getElementById('bnCartBadge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    }

    /* Also keep any other legacy badge elements in sync */
    ['bnCart', 'navCart', 'navCartCount', 'cartBadgeNav'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = count;
    });
    document.querySelectorAll('.cart-count').forEach(function (el) {
      el.textContent = count;
    });
  }

  /* ─────────────────────────────────────────────────────────────
     5b. WISHLIST BADGE UPDATE — updates wishlist count in header
  ───────────────────────────────────────────────────────────── */
  function wishlistCount() {
    try {
      var items = JSON.parse(localStorage.getItem('ah_wish') || '[]');
      return items.length;
    } catch (e) { return 0; }
  }

  function updateWishlistBadge() {
    var count = wishlistCount();
    document.querySelectorAll('.wish-count, #wishCount').forEach(function (el) {
      el.textContent = count > 0 ? count : '';
      el.setAttribute('data-count', count);
    });
  }

  /* ─────────────────────────────────────────────────────────────
     6. SHOW / HIDE on resize — JS enforces at ≤900px
        (CSS media query also fires, but JS override is needed
         for pages that set inline display:none on the element)
  ───────────────────────────────────────────────────────────── */
  function showOnMobile() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    
    // Show on ALL pages at mobile width
    if (window.innerWidth <= 900) {
      nav.style.display = 'flex';
    } else {
      nav.style.display = 'none';
    }
  }

  /* ─────────────────────────────────────────────────────────────
     7. INIT
  ───────────────────────────────────────────────────────────── */
  function init() {
    injectStyles();
    injectBottomNav();
    syncActiveState();
    updateCartBadge();
    updateWishlistBadge();
    showOnMobile();

    window.addEventListener('resize', showOnMobile);

    /* Re-sync badge on storage events (cross-tab cart/wishlist updates) */
    window.addEventListener('storage', function (e) {
      if (e.key && e.key.startsWith('ah_cart')) {
        updateCartBadge();
      }
      if (e.key && e.key === 'ah_wish') {
        updateWishlistBadge();
      }
    });

    /* ── SAME-TAB SYNC: poll every 800ms so badge updates instantly
       when user adds to cart on the same page (storage event doesn't
       fire for same-tab localStorage changes) ── */
    var _lastCartCount = cartCount();
    var _lastWishCount = wishlistCount();
    setInterval(function () {
      var cc = cartCount();
      var wc = wishlistCount();
      if (cc !== _lastCartCount) {
        _lastCartCount = cc;
        updateCartBadge();
      }
      if (wc !== _lastWishCount) {
        _lastWishCount = wc;
        updateWishlistBadge();
      }
    }, 800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Expose globally for other scripts to trigger a badge refresh */
  window._updateCartBadge = updateCartBadge;
  window._updateWishlistBadge = updateWishlistBadge;
  window._showBottomNav   = showOnMobile;
})();

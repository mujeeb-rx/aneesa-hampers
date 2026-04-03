/**
 * bottomnav.js — Mobile Bottom Navigation Bar
 * Aneesa Hampers · Shared across all pages
 *
 * Handles:
 * - Showing the bottom nav on mobile screens
 * - Updating the cart badge count in real-time
 * - Highlighting the active nav item
 */

(function () {
  'use strict';

  /* ── Cart key helper (same logic as other pages) ─────────────── */
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

  /* ── Inject bottom nav HTML if not already on page ───────────── */
  function injectBottomNav() {
    if (document.getElementById('bottomNav')) return; // already in HTML

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
        '<span class="bn-icon">🏠</span><span class="bn-label">Home</span>' +
      '</a>' +
      '<a href="products.html" class="bn-item' + isActive('products.html') + '" aria-label="Shop">' +
        '<span class="bn-icon">🎁</span><span class="bn-label">Shop</span>' +
      '</a>' +
      '<a href="cart.html"     class="bn-item' + isActive('cart.html')     + '" aria-label="Cart" style="position:relative">' +
        '<span class="bn-icon">🛒</span><span class="bn-label">Cart</span>' +
        '<span class="bn-badge" id="bnCartBadge" style="display:none">0</span>' +
      '</a>' +
      '<a href="orders.html"   class="bn-item' + isActive('orders.html')   + '" aria-label="Orders">' +
        '<span class="bn-icon">📦</span><span class="bn-label">Orders</span>' +
      '</a>' +
      '<a href="account.html"  class="bn-item' + isActive('account.html')  + '" aria-label="Account">' +
        '<span class="bn-icon">👤</span><span class="bn-label">Account</span>' +
      '</a>';

    document.body.appendChild(nav);
  }

  /* ── Update badge counts on all badge elements ───────────────── */
  function updateCartBadge() {
    var count = cartCount();
    var ids = ['bnCartBadge', 'bnCart', 'navCart', 'navCartCount'];
    ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = count;
      if (id === 'bnCartBadge') {
        el.style.display = count > 0 ? 'flex' : 'none';
      }
    });

    // Also update any .cart-count elements
    document.querySelectorAll('.cart-count').forEach(function (el) {
      el.textContent = count;
    });
  }

  /* ── Show bottom nav on mobile (≤900px) ─────────────────────── */
  function showOnMobile() {
    var nav = document.getElementById('bottomNav');
    if (!nav) return;
    if (window.innerWidth <= 900) {
      nav.style.display = 'flex';
      document.body.style.paddingBottom = 'calc(60px + env(safe-area-inset-bottom, 0px))';
    } else {
      nav.style.display = 'none';
      document.body.style.paddingBottom = '';
    }
  }

  /* ── Init ────────────────────────────────────────────────────── */
  function init() {
    injectBottomNav();
    updateCartBadge();
    showOnMobile();
    window.addEventListener('resize', showOnMobile);

    // Re-update badge whenever localStorage changes (e.g. item added from another tab)
    window.addEventListener('storage', function (e) {
      if (e.key && e.key.startsWith('ah_cart')) {
        updateCartBadge();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose globally so other scripts can call it
  window._updateCartBadge = updateCartBadge;
})();

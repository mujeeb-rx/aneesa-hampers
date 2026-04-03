/**
 * mobilenav.js — Enhanced Sidebar Navigation
 * Aneesa Hampers · Mobile hamburger menu sidebar
 *
 * Handles:
 * - Slide-in sidebar with user greeting
 * - Expandable category sub-menus
 * - Cart badge sync
 * - Sidebar open/close with overlay
 */

(function () {
  'use strict';

  /* ── Disable on desktop (>900px) ────────────────────────────── */
  if (window.innerWidth > 900 && !document.getElementById('enh-sidebar')) return;

  /* ── Cart helper ──────────────────────────────────────────────── */
  function cartCount() {
    try {
      var u = JSON.parse(localStorage.getItem('ah_user') || 'null');
      var key = (u && u.uid) ? 'ah_cart_' + u.uid : 'ah_cart_guest';
      var items = JSON.parse(localStorage.getItem(key) || '[]');
      return items.reduce(function (s, i) { return s + (i.qty || 1); }, 0);
    } catch (e) { return 0; }
  }

  /* ── Build sidebar HTML ───────────────────────────────────────── */
  function buildSidebar() {
    if (document.getElementById('enh-sidebar')) return; // already built by inline HTML

    var session = null;
    try { session = JSON.parse(localStorage.getItem('ah_user') || 'null'); } catch (e) {}
    var name  = session ? (session.name || 'Hello!') : null;
    var email = session ? (session.email || '') : '';

    var userArea = name
      ? '<div class="esb-avatar">👤</div>' +
        '<div class="esb-greeting">Welcome back,</div>' +
        '<div class="esb-name">' + name + '</div>'
      : '<div class="esb-avatar">🌸</div>' +
        '<div class="esb-greeting">Discover premium gifting</div>' +
        '<a href="login.html" class="esb-signin-btn">🔐 Sign In / Register</a>';

    var page = location.pathname.split('/').pop() || 'index.html';
    function active(href) { return page === href.split('?')[0] ? ' active' : ''; }

    var count = cartCount();
    var badgeHtml = count > 0
      ? '<span class="esb-link-badge">' + count + '</span>'
      : '<span class="esb-link-arrow">›</span>';

    // Sidebar HTML
    var sidebar = document.createElement('div');
    sidebar.id = 'enh-sidebar';
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'Site navigation');
    sidebar.innerHTML =
      '<div class="esb-user-area">' +
        '<button class="esb-close" onclick="enhSbClose()" aria-label="Close menu">✕</button>' +
        userArea +
      '</div>' +
      '<div class="esb-scroll">' +
        '<div class="esb-section-lbl">Navigate</div>' +
        '<a href="index.html"    class="esb-link' + active('index.html')    + '">' +
          '<span class="esb-link-icon">🏠</span>Home' +
          '<span class="esb-link-arrow">›</span></a>' +
        '<a href="products.html" class="esb-link' + active('products.html') + '">' +
          '<span class="esb-link-icon">🎁</span>Collections' +
          '<span class="esb-link-arrow">›</span></a>' +
        '<button class="esb-expand-btn" onclick="eshToggleSub(this)" aria-expanded="false">' +
          '<span class="esb-link-icon">📂</span>Categories' +
          '<span class="esb-link-arrow" style="margin-left:auto">›</span>' +
        '</button>' +
        '<div class="esb-sub" id="eshCatSub">' +
          '<a href="products.html?cat=hampers"  class="esb-sub-link">🧺 Gift Hampers</a>' +
          '<a href="products.html?cat=cakes"    class="esb-sub-link">🎂 Custom Cakes</a>' +
          '<a href="products.html?cat=decor"    class="esb-sub-link">🎀 Décor Items</a>' +
          '<a href="products.html?cat=resin"    class="esb-sub-link">🌊 Resin Art</a>' +
          '<a href="products.html?cat=wedding"  class="esb-sub-link">💍 Wedding Essentials</a>' +
        '</div>' +
        '<div class="esb-divider"></div>' +
        '<div class="esb-section-lbl">My Account</div>' +
        '<a href="cart.html"    class="esb-link' + active('cart.html')    + '">' +
          '<span class="esb-link-icon">🛒</span>My Cart' + badgeHtml + '</a>' +
        '<a href="orders.html"  class="esb-link' + active('orders.html')  + '">' +
          '<span class="esb-link-icon">📦</span>My Orders<span class="esb-link-arrow">›</span></a>' +
        '<a href="account.html" class="esb-link' + active('account.html') + '">' +
          '<span class="esb-link-icon">👤</span>My Account<span class="esb-link-arrow">›</span></a>' +
        (name
          ? '<button class="esb-logout-btn" style="display:flex" onclick="eshDoLogout()">🔒 Sign Out</button>'
          : '') +
      '</div>' +
      '<div class="esb-footer">' +
        '<a href="https://wa.me/918639066613?text=Hi!%20I%20want%20to%20order%20a%20hamper" ' +
          'target="_blank" class="esb-wa-btn">💬 Order on WhatsApp</a>' +
        '<div class="esb-settings-row">' +
          '<button class="esb-settings-btn" onclick="location.href=\'contact.html\'">📞 Contact Us</button>' +
          '<button class="esb-settings-btn" onclick="location.href=\'account.html\'">⚙️ Settings</button>' +
        '</div>' +
      '</div>';

    // Overlay
    var overlay = document.createElement('div');
    overlay.id = 'enh-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', enhSbClose);

    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);
  }

  /* ── Open / Close ────────────────────────────────────────────── */
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
      setTimeout(function () { ov.style.display = 'none'; }, 300);
    }
    document.body.style.overflow = '';
  };

  /* ── Expandable sub-menu ─────────────────────────────────────── */
  window.eshToggleSub = function (btn) {
    var sub = document.getElementById('eshCatSub');
    if (!sub) return;
    var isOpen = sub.classList.contains('open');
    if (isOpen) {
      sub.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    } else {
      sub.classList.add('open');
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  };

  /* ── Logout ──────────────────────────────────────────────────── */
  window.eshDoLogout = function () {
    if (!confirm('Sign out?')) return;
    Object.keys(localStorage).filter(function (k) { return k.startsWith('ah_'); }).forEach(function (k) { localStorage.removeItem(k); });
    window.location.href = 'index.html';
  };

  /* ── Keyboard: close on Escape ───────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') enhSbClose();
  });

  /* ── Init: only build on mobile ──────────────────────────────── */
  function init() {
    if (window.innerWidth <= 900) buildSidebar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/**
 * checkout-rewards-patch.js — Checkout Rewards Integration Patch
 * Aneesa Hampers · Bridges scratch card rewards with the checkout flow
 *
 * Handles:
 * - Checking if a saved reward exists in localStorage (ah_reward)
 * - Applying the reward discount at checkout automatically
 * - Showing the scratch card at order confirmation
 * - Expiry validation
 */

(function () {
  'use strict';

  var REWARD_KEY = 'ah_reward';

  /* ── Load saved reward ───────────────────────────────────────── */
  function loadReward() {
    try {
      var raw = localStorage.getItem(REWARD_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      // Check expiry
      if (data.expiresAt && Date.now() > data.expiresAt) {
        localStorage.removeItem(REWARD_KEY);
        return null;
      }
      return data;
    } catch (e) { return null; }
  }

  /* ── Get reward discount amount (in INR) ─────────────────────── */
  function getRewardDiscount(subtotal) {
    var data = loadReward();
    if (!data || !data.reward) return 0;
    var r = data.reward;
    // Check minimum order
    if (subtotal < (r.minOrder || 0)) return 0;
    if (r.type === 'fixed')    return r.value || 0;
    if (r.type === 'percent')  return Math.round(subtotal * (r.value || 0) / 100);
    if (r.type === 'delivery') return 0; // Handled separately as free delivery flag
    return 0;
  }

  /* ── Check if reward is "free delivery" type ─────────────────── */
  function isFreeDelivery() {
    var data = loadReward();
    return data && data.reward && data.reward.type === 'delivery';
  }

  /* ── Clear reward after use ──────────────────────────────────── */
  function clearReward() {
    localStorage.removeItem(REWARD_KEY);
  }

  /* ── Show reward badge on cart/checkout page ─────────────────── */
  function showRewardBadge() {
    var data = loadReward();
    if (!data || !data.reward) return;
    var r = data.reward;

    // Look for a reward banner placeholder on the page
    var banner = document.getElementById('checkoutRewardBanner');
    if (!banner) return;

    var exp = new Date(data.expiresAt);
    banner.style.display = 'flex';
    banner.innerHTML =
      '<span style="font-size:1.4rem">🎁</span>' +
      '<div style="flex:1">' +
        '<div style="font-size:.8rem;font-weight:600;color:#3b0d1a">Reward Active: ' + r.label + '</div>' +
        '<div style="font-size:.68rem;color:rgba(59,13,26,.5);margin-top:2px">' +
          r.icon + ' Will be applied at checkout · Expires ' +
          exp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) +
        '</div>' +
      '</div>' +
      '<button onclick="window._claimRewardNow && window._claimRewardNow()" ' +
        'style="background:none;border:1.5px solid rgba(192,100,122,.25);border-radius:8px;' +
        'padding:5px 11px;font-family:\'Jost\',sans-serif;font-size:.62rem;letter-spacing:1.5px;' +
        'text-transform:uppercase;color:#c0647a;cursor:pointer;">Apply</button>';
  }

  /* ── Auto-trigger scratch card after order confirmation ──────── */
  function triggerAfterOrder(options) {
    options = options || {};
    var delay = options.delay || 1500;

    // Only trigger once per session
    var key = 'ah_scratch_shown_' + (options.orderId || 'generic');
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    setTimeout(function () {
      if (typeof window.AH_launchScratchCard === 'function') {
        window.AH_launchScratchCard({
          rewardPool: options.rewardPool,
          onComplete: function (reward) {
            console.log('🎁 Reward awarded:', reward);
            if (typeof options.onComplete === 'function') options.onComplete(reward);
          }
        });
      } else {
        // scratch-card.js not loaded — load it dynamically
        var script = document.createElement('script');
        script.src = 'scratch-card.js';
        script.onload = function () {
          if (typeof window.AH_launchScratchCard === 'function') {
            window.AH_launchScratchCard({ onComplete: options.onComplete });
          }
        };
        document.head.appendChild(script);
      }
    }, delay);
  }

  /* ── Init: show badge on cart/checkout pages ─────────────────── */
  function init() {
    var page = location.pathname.split('/').pop();
    if (page === 'cart.html') {
      showRewardBadge();
    }
  }

  /* ── Expose globally ─────────────────────────────────────────── */
  window.AH_Rewards = {
    load:            loadReward,
    getDiscount:     getRewardDiscount,
    isFreeDelivery:  isFreeDelivery,
    clear:           clearReward,
    triggerAfterOrder: triggerAfterOrder,
    showBadge:       showRewardBadge
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

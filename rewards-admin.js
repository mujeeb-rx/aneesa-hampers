/**
 * rewards-admin.js — Admin Rewards Management
 * Aneesa Hampers · Admin dashboard rewards configuration
 *
 * Handles:
 * - Displaying active rewards in admin panel
 * - Managing reward pool (add/edit/delete rewards)
 * - Syncing reward config to Firestore siteSettings.rewards
 * - Viewing user-claimed rewards
 */

(function () {
  'use strict';

  /* ── Default reward pool (can be overridden via Firestore) ───── */
  var DEFAULT_POOL = [
    { id: 'r1', label: '₹50 Off',      type: 'fixed',    value: 50,  prob: 30, minOrder: 300,  icon: '🎀', active: true },
    { id: 'r2', label: '₹100 Off',     type: 'fixed',    value: 100, prob: 15, minOrder: 600,  icon: '💝', active: true },
    { id: 'r3', label: '₹200 Off',     type: 'fixed',    value: 200, prob: 5,  minOrder: 1000, icon: '🌟', active: true },
    { id: 'r4', label: '10% Off',       type: 'percent',  value: 10,  prob: 25, minOrder: 400,  icon: '🎊', active: true },
    { id: 'r5', label: '15% Off',       type: 'percent',  value: 15,  prob: 10, minOrder: 700,  icon: '✨', active: true },
    { id: 'r6', label: 'Free Delivery', type: 'delivery', value: 0,   prob: 10, minOrder: 0,    icon: '🚀', active: true },
    { id: 'r7', label: '₹25 Off',      type: 'fixed',    value: 25,  prob: 5,  minOrder: 200,  icon: '🎁', active: true }
  ];

  var _rewardPool = [];

  /* ── Load reward pool from Firestore ─────────────────────────── */
  async function loadRewardPool() {
    try {
      var firebase = window._ahFirebase;
      if (!firebase || !firebase.db) return DEFAULT_POOL;
      var { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      var snap = await getDoc(doc(firebase.db, 'siteSettings', 'rewards'));
      if (snap.exists() && snap.data().pool) {
        return snap.data().pool;
      }
      return DEFAULT_POOL;
    } catch (e) {
      console.warn('rewards-admin: Could not load pool from Firestore:', e);
      return DEFAULT_POOL;
    }
  }

  /* ── Save reward pool to Firestore ───────────────────────────── */
  async function saveRewardPool(pool) {
    try {
      var firebase = window._ahFirebase;
      if (!firebase || !firebase.db) { console.warn('Firebase not ready'); return; }
      var { setDoc, doc, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      await setDoc(doc(firebase.db, 'siteSettings', 'rewards'), {
        pool: pool,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.log('✅ Reward pool saved to Firestore');
    } catch (e) {
      console.error('rewards-admin: Save failed:', e);
    }
  }

  /* ── Render reward pool table in admin UI ────────────────────── */
  function renderRewardTable(pool) {
    var container = document.getElementById('rewardsPoolTable');
    if (!container) return;

    var typeLabels = { fixed: '💰 Fixed ₹', percent: '% Percent', delivery: '🚚 Free Delivery' };

    container.innerHTML =
      '<table style="width:100%;border-collapse:collapse;font-size:.82rem;">' +
        '<thead>' +
          '<tr style="background:rgba(192,100,122,.08);text-align:left;">' +
            '<th style="padding:10px 12px;">Icon</th>' +
            '<th style="padding:10px 12px;">Label</th>' +
            '<th style="padding:10px 12px;">Type</th>' +
            '<th style="padding:10px 12px;">Value</th>' +
            '<th style="padding:10px 12px;">Min Order</th>' +
            '<th style="padding:10px 12px;">Probability</th>' +
            '<th style="padding:10px 12px;">Active</th>' +
            '<th style="padding:10px 12px;">Actions</th>' +
          '</tr>' +
        '</thead>' +
        '<tbody>' +
          pool.map(function (r, i) {
            return '<tr style="border-bottom:1px solid rgba(192,100,122,.1);">' +
              '<td style="padding:10px 12px;font-size:1.2rem">' + r.icon + '</td>' +
              '<td style="padding:10px 12px;font-weight:600">' + r.label + '</td>' +
              '<td style="padding:10px 12px;opacity:.7">' + (typeLabels[r.type] || r.type) + '</td>' +
              '<td style="padding:10px 12px">' + (r.type === 'delivery' ? '—' : r.value + (r.type === 'percent' ? '%' : '')) + '</td>' +
              '<td style="padding:10px 12px">' + (r.minOrder > 0 ? '₹' + r.minOrder : 'None') + '</td>' +
              '<td style="padding:10px 12px">' + r.prob + '%</td>' +
              '<td style="padding:10px 12px">' +
                '<label style="cursor:pointer">' +
                  '<input type="checkbox"' + (r.active !== false ? ' checked' : '') + ' ' +
                  'onchange="window.AH_AdminRewards._toggleActive(' + i + ',this.checked)">' +
                '</label>' +
              '</td>' +
              '<td style="padding:10px 12px">' +
                '<button onclick="window.AH_AdminRewards._deleteReward(' + i + ')" ' +
                  'style="background:#fde8e8;color:#e05050;border:none;border-radius:6px;padding:4px 10px;cursor:pointer;font-size:.7rem;">Delete</button>' +
              '</td>' +
            '</tr>';
          }).join('') +
        '</tbody>' +
      '</table>';
  }

  /* ── Toggle reward active state ──────────────────────────────── */
  function toggleActive(index, active) {
    if (_rewardPool[index]) {
      _rewardPool[index].active = active;
      saveRewardPool(_rewardPool);
    }
  }

  /* ── Delete reward ───────────────────────────────────────────── */
  function deleteReward(index) {
    if (!confirm('Delete this reward?')) return;
    _rewardPool.splice(index, 1);
    saveRewardPool(_rewardPool);
    renderRewardTable(_rewardPool);
  }

  /* ── Add new reward ──────────────────────────────────────────── */
  function addReward(data) {
    var newReward = {
      id:       'r' + Date.now(),
      label:    data.label    || '₹50 Off',
      type:     data.type     || 'fixed',
      value:    Number(data.value)    || 50,
      prob:     Number(data.prob)     || 10,
      minOrder: Number(data.minOrder) || 0,
      icon:     data.icon     || '🎁',
      active:   true
    };
    _rewardPool.push(newReward);
    saveRewardPool(_rewardPool);
    renderRewardTable(_rewardPool);
  }

  /* ── Stats: rewards claimed ──────────────────────────────────── */
  async function loadRewardStats() {
    var container = document.getElementById('rewardsStatsWrap');
    if (!container) return;
    container.innerHTML = '<div style="opacity:.4;font-size:.85rem">Loading reward stats…</div>';
    try {
      var firebase = window._ahFirebase;
      if (!firebase || !firebase.db) throw new Error('Firebase not ready');
      var { collection, getDocs, query, orderBy, limit } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      var snap = await getDocs(query(collection(firebase.db, 'claimedRewards'), orderBy('claimedAt', 'desc'), limit(50)));
      if (snap.empty) {
        container.innerHTML = '<div style="opacity:.4;font-size:.85rem">No rewards claimed yet.</div>';
        return;
      }
      var rows = snap.docs.map(function (d) {
        var r = d.data();
        var date = r.claimedAt ? (r.claimedAt.toDate ? r.claimedAt.toDate() : new Date(r.claimedAt)) : new Date();
        return '<tr style="border-bottom:1px solid rgba(192,100,122,.08)">' +
          '<td style="padding:8px 10px">' + (r.userId || '—') + '</td>' +
          '<td style="padding:8px 10px">' + (r.rewardLabel || r.reward?.label || '—') + '</td>' +
          '<td style="padding:8px 10px">' + date.toLocaleDateString('en-IN') + '</td>' +
          '<td style="padding:8px 10px;color:' + (r.used ? '#2d7a4f' : 'rgba(59,13,26,.45)') + '">' +
            (r.used ? '✅ Used' : '⏳ Pending') + '</td>' +
        '</tr>';
      }).join('');
      container.innerHTML =
        '<table style="width:100%;border-collapse:collapse;font-size:.8rem">' +
          '<thead><tr style="background:rgba(192,100,122,.06);text-align:left">' +
            '<th style="padding:8px 10px">User</th>' +
            '<th style="padding:8px 10px">Reward</th>' +
            '<th style="padding:8px 10px">Date</th>' +
            '<th style="padding:8px 10px">Status</th>' +
          '</tr></thead><tbody>' + rows + '</tbody></table>';
    } catch (e) {
      container.innerHTML = '<div style="color:#e05050;font-size:.82rem">⚠️ Could not load stats: ' + e.message + '</div>';
    }
  }

  /* ── Init ────────────────────────────────────────────────────── */
  async function init() {
    _rewardPool = await loadRewardPool();
    renderRewardTable(_rewardPool);
    loadRewardStats();
  }

  /* ── Expose globally ─────────────────────────────────────────── */
  window.AH_AdminRewards = {
    init:          init,
    reload:        init,
    addReward:     addReward,
    _toggleActive: toggleActive,
    _deleteReward: deleteReward,
    getPool:       function () { return _rewardPool; },
    savePool:      saveRewardPool
  };

  // Auto-init if rewards admin section exists on this page
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (document.getElementById('rewardsPoolTable')) init();
    });
  } else {
    if (document.getElementById('rewardsPoolTable')) init();
  }
})();

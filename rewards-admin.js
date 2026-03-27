/**
 * rewards-admin.js — Aneesa Hampers Admin Rewards Panel
 * ──────────────────────────────────────────────────────
 * Adds a "Rewards" page to the admin panel.
 * Include after firebase.js in admin.html.
 *
 * Features:
 *   • Create / edit / delete reward types
 *   • Set type (fixed ₹ / percent % / free delivery)
 *   • Set probability weight (1–100)
 *   • Set minimum order threshold
 *   • Toggle active/inactive
 *   • Live preview of distribution pie
 *   • View all issued user rewards with status
 */

import { db } from './firebase.js';
import {
  collection, addDoc, getDocs, doc, setDoc,
  updateDoc, deleteDoc, query, orderBy, onSnapshot,
  serverTimestamp, where
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Inject Rewards page styles ───────────────────────────
(function injectStyles() {
  const s = document.createElement('style');
  s.textContent = `
    /* ── Rewards Admin Styles ── */
    .rw-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 14px;
      margin-bottom: 24px;
    }
    .rw-card {
      background: var(--white);
      border-radius: 14px;
      padding: 18px;
      border: 1.5px solid rgba(192,100,122,.12);
      position: relative;
      transition: box-shadow .2s, transform .2s;
    }
    .rw-card:hover { box-shadow: 0 6px 24px rgba(59,13,26,.09); transform: translateY(-2px); }
    .rw-card.inactive { opacity: .52; }
    .rw-card-head {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 10px;
    }
    .rw-type-badge {
      font-size: .58rem; letter-spacing: 2px; text-transform: uppercase;
      font-weight: 700; padding: 3px 9px; border-radius: 20px;
    }
    .rw-type-badge.fixed    { background: #fef3e8; color: #c07830; }
    .rw-type-badge.percent  { background: #e8f4fd; color: #0066cc; }
    .rw-type-badge.delivery { background: #e8fdf0; color: #2d7a4f; }
    .rw-card-label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.5rem; font-weight: 700;
      color: var(--deep-rose); margin: 4px 0 8px;
    }
    .rw-card-meta {
      font-size: .7rem; opacity: .45;
      display: flex; flex-direction: column; gap: 3px;
    }
    .rw-card-prob {
      display: flex; align-items: center; gap: 6px; margin-top: 10px;
    }
    .rw-prob-bar {
      flex: 1; height: 5px; border-radius: 4px;
      background: rgba(192,100,122,.1); overflow: hidden;
    }
    .rw-prob-fill {
      height: 100%; border-radius: 4px;
      background: linear-gradient(90deg, #e8a0b0, #c0647a);
      transition: width .4s;
    }
    .rw-prob-lbl { font-size: .65rem; font-weight: 600; color: var(--deep-rose); min-width: 28px; text-align: right; }
    .rw-card-actions {
      display: flex; gap: 6px; margin-top: 12px;
    }
    .rw-btn-sm {
      font-family: 'Jost', sans-serif;
      font-size: .62rem; letter-spacing: 1.5px; text-transform: uppercase;
      padding: 6px 12px; border-radius: 8px; cursor: pointer;
      font-weight: 600; border: none; transition: all .18s;
    }
    .rw-btn-edit { background: rgba(192,100,122,.1); color: var(--deep-rose); }
    .rw-btn-edit:hover { background: rgba(192,100,122,.2); }
    .rw-btn-toggle { background: rgba(59,13,26,.07); color: var(--burgundy); }
    .rw-btn-toggle:hover { background: rgba(59,13,26,.14); }
    .rw-btn-del { background: rgba(224,80,80,.08); color: #e05050; margin-left: auto; }
    .rw-btn-del:hover { background: rgba(224,80,80,.16); }

    /* Add / Edit Form */
    .rw-form-card {
      background: var(--white);
      border-radius: 16px; padding: 22px;
      border: 1.5px solid rgba(192,100,122,.15);
      margin-bottom: 24px;
    }
    .rw-form-title {
      font-size: .65rem; letter-spacing: 3px; text-transform: uppercase;
      color: var(--deep-rose); font-weight: 700; margin-bottom: 16px;
    }
    .rw-form-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
    .rw-form-group { display: flex; flex-direction: column; gap: 5px; flex: 1; min-width: 140px; }
    .rw-form-group label { font-size: .65rem; letter-spacing: 1.5px; text-transform: uppercase; opacity: .5; font-weight: 600; }
    .rw-form-group input,
    .rw-form-group select {
      padding: 9px 12px; border-radius: 9px;
      border: 1.5px solid rgba(192,100,122,.18);
      font-family: 'Jost', sans-serif; font-size: .82rem;
      color: var(--burgundy); background: #fdf6f0;
      outline: none; transition: border-color .2s;
    }
    .rw-form-group input:focus,
    .rw-form-group select:focus { border-color: var(--deep-rose); }
    .rw-form-actions { display: flex; gap: 10px; margin-top: 4px; }
    .rw-btn-save {
      background: linear-gradient(135deg, #c0647a, #a04060);
      color: white; border: none; border-radius: 10px;
      padding: 10px 22px; font-family: 'Jost', sans-serif;
      font-size: .72rem; letter-spacing: 2px; text-transform: uppercase;
      font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 14px rgba(192,100,122,.25);
      transition: transform .18s;
    }
    .rw-btn-save:hover { transform: translateY(-1px); }
    .rw-btn-cancel {
      background: none; border: 1.5px solid rgba(192,100,122,.2);
      border-radius: 10px; padding: 10px 18px;
      font-family: 'Jost', sans-serif; font-size: .72rem;
      letter-spacing: 2px; text-transform: uppercase;
      color: var(--burgundy); cursor: pointer; opacity: .5; transition: opacity .18s;
    }
    .rw-btn-cancel:hover { opacity: 1; }

    /* Stats row */
    .rw-stats {
      display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 22px;
    }
    .rw-stat {
      background: var(--white); border-radius: 12px;
      padding: 14px 18px; flex: 1; min-width: 120px;
      border: 1.5px solid rgba(192,100,122,.1);
      text-align: center;
    }
    .rw-stat-val { font-size: 1.6rem; font-weight: 700; color: var(--deep-rose); font-family: 'Cormorant Garamond', serif; }
    .rw-stat-lbl { font-size: .63rem; letter-spacing: 1.5px; text-transform: uppercase; opacity: .4; margin-top: 2px; }

    /* Issued rewards table */
    .rw-issued-tbl { width: 100%; border-collapse: collapse; font-size: .78rem; }
    .rw-issued-tbl th {
      font-size: .6rem; letter-spacing: 2px; text-transform: uppercase;
      opacity: .4; font-weight: 600; padding: 8px 12px; text-align: left;
      border-bottom: 1px solid rgba(192,100,122,.1);
    }
    .rw-issued-tbl td {
      padding: 10px 12px; border-bottom: 1px solid rgba(192,100,122,.06);
      vertical-align: middle;
    }
    .rw-issued-tbl tr:last-child td { border-bottom: none; }
    .rw-status {
      display: inline-block; padding: 3px 10px; border-radius: 20px;
      font-size: .6rem; letter-spacing: 1px; text-transform: uppercase; font-weight: 600;
    }
    .rw-status.pending   { background: #fef3e8; color: #c07830; }
    .rw-status.redeemed  { background: #e8fdf0; color: #2d7a4f; }
    .rw-status.expired   { background: #f0f0f0; color: #888; }

    /* Add new button */
    #rwAddNewBtn {
      background: linear-gradient(135deg, #c0647a, #a04060);
      color: white; border: none; border-radius: 10px;
      padding: 10px 20px; font-family: 'Jost', sans-serif;
      font-size: .7rem; letter-spacing: 2px; text-transform: uppercase;
      font-weight: 600; cursor: pointer; margin-bottom: 18px;
      box-shadow: 0 4px 14px rgba(192,100,122,.25);
      transition: transform .18s;
    }
    #rwAddNewBtn:hover { transform: translateY(-1px); }

    /* Distribution preview */
    .rw-dist-wrap {
      display: flex; align-items: center; gap: 20px;
      background: var(--white); border-radius: 14px;
      padding: 18px; border: 1.5px solid rgba(192,100,122,.1);
      margin-bottom: 22px; flex-wrap: wrap;
    }
    .rw-dist-pie { width: 110px; height: 110px; flex-shrink: 0; }
    .rw-dist-legend { display: flex; flex-direction: column; gap: 6px; flex: 1; }
    .rw-dist-item { display: flex; align-items: center; gap: 8px; font-size: .72rem; }
    .rw-dist-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  `;
  document.head.appendChild(s);
})();


// ── State ─────────────────────────────────────────────────
let _rewardPool   = [];
let _editingId    = null;
let _unsubPool    = null;
let _unsubIssued  = null;

const COLORS = ['#c0647a','#e8a0b0','#c9a96e','#3b0d1a','#6a1f38','#a04060','#f5c2ce','#7a2040'];


// ── Build the Rewards Page HTML ───────────────────────────
function buildRewardsPage() {
  return `
    <div class="rw-stats" id="rwStats">
      <div class="rw-stat"><div class="rw-stat-val" id="rw-st-total">0</div><div class="rw-stat-lbl">Total Issued</div></div>
      <div class="rw-stat"><div class="rw-stat-val" id="rw-st-pending">0</div><div class="rw-stat-lbl">Pending</div></div>
      <div class="rw-stat"><div class="rw-stat-val" id="rw-st-redeemed">0</div><div class="rw-stat-lbl">Redeemed</div></div>
      <div class="rw-stat"><div class="rw-stat-val" id="rw-st-types">0</div><div class="rw-stat-lbl">Active Types</div></div>
    </div>

    <!-- Distribution preview -->
    <div class="rw-dist-wrap" id="rwDistWrap">
      <canvas class="rw-dist-pie" id="rwDistPie"></canvas>
      <div class="rw-dist-legend" id="rwDistLegend"><em style="font-size:.72rem;opacity:.4">Add rewards to see distribution</em></div>
    </div>

    <!-- Reward Pool Config -->
    <div class="card" style="margin-bottom:18px">
      <div class="card-hd">
        <div>
          <div class="card-title">Reward Pool</div>
          <div class="card-sub">Configure reward types, values & probability weights</div>
        </div>
        <button id="rwAddNewBtn" onclick="rwShowForm()">＋ Add Reward Type</button>
      </div>

      <!-- Add / Edit Form (hidden by default) -->
      <div class="rw-form-card" id="rwFormCard" style="display:none">
        <div class="rw-form-title" id="rwFormTitle">New Reward Type</div>
        <div class="rw-form-row">
          <div class="rw-form-group">
            <label>Label (shown to user)</label>
            <input id="rwFLabel" placeholder="e.g. ₹50 Off" maxlength="32"/>
          </div>
          <div class="rw-form-group">
            <label>Type</label>
            <select id="rwFType" onchange="rwTypeChange()">
              <option value="fixed">Fixed Amount (₹)</option>
              <option value="percent">Percentage (%)</option>
              <option value="delivery">Free Delivery</option>
            </select>
          </div>
        </div>
        <div class="rw-form-row">
          <div class="rw-form-group" id="rwFValueGrp">
            <label>Value</label>
            <input id="rwFValue" type="number" min="0" placeholder="e.g. 50"/>
          </div>
          <div class="rw-form-group">
            <label>Probability Weight (1–100)</label>
            <input id="rwFProb" type="number" min="1" max="100" placeholder="e.g. 30"/>
          </div>
          <div class="rw-form-group">
            <label>Min Order Amount (₹)</label>
            <input id="rwFMin" type="number" min="0" placeholder="0 = no minimum"/>
          </div>
        </div>
        <div class="rw-form-actions">
          <button class="rw-btn-save" onclick="rwSave()">Save Reward</button>
          <button class="rw-btn-cancel" onclick="rwHideForm()">Cancel</button>
        </div>
      </div>

      <!-- Pool Grid -->
      <div class="rw-grid" id="rwPoolGrid">
        <div style="opacity:.38;font-size:.8rem;padding:16px">Loading reward pool…</div>
      </div>
    </div>

    <!-- Issued Rewards Log -->
    <div class="card">
      <div class="card-hd">
        <div><div class="card-title">Issued Rewards</div><div class="card-sub">All scratch cards given to customers</div></div>
        <select id="rwIssuedFilter" class="fi" style="width:140px;padding:8px 12px" onchange="rwRenderIssued()">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="redeemed">Redeemed</option>
          <option value="expired">Expired</option>
        </select>
      </div>
      <div class="tbl-wrap">
        <table class="rw-issued-tbl">
          <thead>
            <tr>
              <th>Order ID</th><th>User</th><th>Reward</th>
              <th>Type</th><th>Min Order</th><th>Issued</th>
              <th>Expires</th><th>Status</th>
            </tr>
          </thead>
          <tbody id="rwIssuedBody">
            <tr><td colspan="8" style="text-align:center;opacity:.38;padding:24px">Loading…</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}


// ── Render pool grid ──────────────────────────────────────
function rwRenderPool() {
  const grid = document.getElementById('rwPoolGrid');
  if (!grid) return;

  document.getElementById('rw-st-types').textContent =
    _rewardPool.filter(r => r.active !== false).length;

  if (!_rewardPool.length) {
    grid.innerHTML = `<div style="opacity:.38;font-size:.8rem;padding:16px;grid-column:1/-1">No rewards configured. Add one above.</div>`;
    rwUpdateDist([]);
    return;
  }

  grid.innerHTML = _rewardPool.map((r, i) => {
    const prob = r.prob || 10;
    const typeIcons = { fixed: '₹', percent: '%', delivery: '🚚' };
    const active = r.active !== false;
    return `
      <div class="rw-card ${active ? '' : 'inactive'}" id="rwCard_${r.id}">
        <div class="rw-card-head">
          <span class="rw-type-badge ${r.type}">${r.type === 'delivery' ? 'Delivery' : r.type}</span>
          ${!active ? '<span style="font-size:.6rem;letter-spacing:1px;text-transform:uppercase;color:#e05050;opacity:.7">Inactive</span>' : ''}
        </div>
        <div class="rw-card-label">${r.label || (typeIcons[r.type] + r.value)}</div>
        <div class="rw-card-meta">
          <span>Value: <b>${r.type === 'delivery' ? 'Free' : r.type === 'percent' ? r.value + '%' : '₹' + r.value}</b></span>
          <span>Min order: <b>₹${(r.minOrder || 0).toLocaleString('en-IN')}</b></span>
        </div>
        <div class="rw-card-prob">
          <div class="rw-prob-bar"><div class="rw-prob-fill" style="width:${prob}%"></div></div>
          <span class="rw-prob-lbl">${prob}%</span>
        </div>
        <div class="rw-card-actions">
          <button class="rw-btn-sm rw-btn-edit" onclick="rwEdit('${r.id}')">✏️ Edit</button>
          <button class="rw-btn-sm rw-btn-toggle" onclick="rwToggle('${r.id}', ${active})">${active ? '⏸ Disable' : '▶ Enable'}</button>
          <button class="rw-btn-sm rw-btn-del" onclick="rwDelete('${r.id}')">🗑</button>
        </div>
      </div>`;
  }).join('');

  rwUpdateDist(_rewardPool.filter(r => r.active !== false));
}


// ── Distribution pie chart ────────────────────────────────
function rwUpdateDist(activePool) {
  const canvas = document.getElementById('rwDistPie');
  const legend = document.getElementById('rwDistLegend');
  if (!canvas || !legend) return;

  if (!activePool.length) {
    legend.innerHTML = '<em style="font-size:.72rem;opacity:.4">Add rewards to see distribution</em>';
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  const total = activePool.reduce((s, r) => s + (r.prob || 10), 0);
  const ctx = canvas.getContext('2d');
  const cx = canvas.width / 2, cy = canvas.height / 2;
  const R = Math.min(cx, cy) - 4;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let startAngle = -Math.PI / 2;
  legend.innerHTML = '';

  activePool.forEach((r, i) => {
    const slice  = ((r.prob || 10) / total) * 2 * Math.PI;
    const color  = COLORS[i % COLORS.length];
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, startAngle + slice);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    startAngle += slice;

    const pct = Math.round((r.prob || 10) / total * 100);
    legend.innerHTML += `
      <div class="rw-dist-item">
        <div class="rw-dist-dot" style="background:${color}"></div>
        <span>${r.label || r.type}</span>
        <span style="margin-left:auto;font-weight:600;color:var(--deep-rose)">${pct}%</span>
      </div>`;
  });
}


// ── Form helpers ──────────────────────────────────────────
window.rwShowForm = function(prefill = null) {
  const form = document.getElementById('rwFormCard');
  const title = document.getElementById('rwFormTitle');
  if (!form) return;

  _editingId = prefill?.id || null;
  title.textContent = prefill ? 'Edit Reward Type' : 'New Reward Type';

  document.getElementById('rwFLabel').value = prefill?.label || '';
  document.getElementById('rwFType').value  = prefill?.type  || 'fixed';
  document.getElementById('rwFValue').value = prefill?.value || '';
  document.getElementById('rwFProb').value  = prefill?.prob  || 20;
  document.getElementById('rwFMin').value   = prefill?.minOrder || 0;
  rwTypeChange();

  form.style.display = 'block';
  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};

window.rwHideForm = function() {
  document.getElementById('rwFormCard').style.display = 'none';
  _editingId = null;
};

window.rwTypeChange = function() {
  const type = document.getElementById('rwFType').value;
  const grp  = document.getElementById('rwFValueGrp');
  grp.style.display = type === 'delivery' ? 'none' : 'flex';
};

window.rwEdit = function(id) {
  const r = _rewardPool.find(r => r.id === id);
  if (r) rwShowForm(r);
};

window.rwToggle = async function(id, currentlyActive) {
  try {
    await updateDoc(doc(db, 'rewardConfig', id), { active: !currentlyActive });
  } catch (e) { alert('Failed to update: ' + e.message); }
};

window.rwDelete = async function(id) {
  if (!confirm('Delete this reward type?')) return;
  try {
    await deleteDoc(doc(db, 'rewardConfig', id));
  } catch (e) { alert('Failed to delete: ' + e.message); }
};

window.rwSave = async function() {
  const label   = document.getElementById('rwFLabel').value.trim();
  const type    = document.getElementById('rwFType').value;
  const value   = parseFloat(document.getElementById('rwFValue').value) || 0;
  const prob    = parseInt(document.getElementById('rwFProb').value)   || 20;
  const minOrder = parseInt(document.getElementById('rwFMin').value)   || 0;

  if (!label) { alert('Please enter a label.'); return; }
  if (type !== 'delivery' && value <= 0) { alert('Please enter a valid value.'); return; }
  if (prob < 1 || prob > 100) { alert('Probability must be 1–100.'); return; }

  const data = { label, type, value, prob, minOrder, active: true, updatedAt: serverTimestamp() };

  try {
    if (_editingId) {
      await updateDoc(doc(db, 'rewardConfig', _editingId), data);
    } else {
      await addDoc(collection(db, 'rewardConfig'), { ...data, createdAt: serverTimestamp() });
    }
    rwHideForm();
  } catch (e) { alert('Save failed: ' + e.message); }
};


// ── Issued rewards ────────────────────────────────────────
let _allIssued = [];

function rwRenderIssued() {
  const filter = document.getElementById('rwIssuedFilter')?.value || 'all';
  const tbody  = document.getElementById('rwIssuedBody');
  if (!tbody) return;

  const list = filter === 'all'
    ? _allIssued
    : _allIssued.filter(r => r.status === filter);

  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;opacity:.38;padding:24px">No rewards found.</td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(r => {
    const created = r.createdAt?.toDate?.() || new Date(r.createdAt || 0);
    const expires = r.expiresAt?.toDate?.() || new Date(r.expiresAt || 0);
    const fmtDate = d => isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `
      <tr>
        <td style="font-family:monospace;font-size:.72rem">#${(r.orderId||'').slice(-8).toUpperCase()}</td>
        <td style="font-size:.72rem">${r.uid?.slice(0,8) || 'guest'}…</td>
        <td style="font-weight:600;color:var(--deep-rose)">${r.label || r.type}</td>
        <td><span class="rw-type-badge ${r.type}">${r.type}</span></td>
        <td>₹${(r.minOrder||0).toLocaleString('en-IN')}</td>
        <td style="font-size:.72rem">${fmtDate(created)}</td>
        <td style="font-size:.72rem">${fmtDate(expires)}</td>
        <td><span class="rw-status ${r.status||'pending'}">${r.status||'pending'}</span></td>
      </tr>`;
  }).join('');
}


// ── Subscribe to Firestore data ───────────────────────────
function rwSubscribe() {
  // Pool
  _unsubPool = onSnapshot(
    query(collection(db, 'rewardConfig'), orderBy('createdAt', 'asc')),
    snap => {
      _rewardPool = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      rwRenderPool();
    },
    err => console.warn('[Rewards Admin] Pool listener:', err.message)
  );

  // Issued rewards (last 200)
  _unsubIssued = onSnapshot(
    query(collection(db, 'userRewards'), orderBy('createdAt', 'desc')),
    snap => {
      _allIssued = snap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Update stats
      const el = id => document.getElementById(id);
      if (el('rw-st-total'))    el('rw-st-total').textContent    = _allIssued.length;
      if (el('rw-st-pending'))  el('rw-st-pending').textContent  = _allIssued.filter(r=>r.status==='pending').length;
      if (el('rw-st-redeemed')) el('rw-st-redeemed').textContent = _allIssued.filter(r=>r.status==='redeemed').length;

      rwRenderIssued();
    },
    err => console.warn('[Rewards Admin] Issued listener:', err.message)
  );
}


// ── Hook into the admin switchPage function ───────────────
function patchAdminNav() {
  // Add sidebar link
  const sbNav = document.querySelector('.sb-nav');
  if (sbNav && !document.querySelector('[data-pg="rewards"]')) {
    // Find the "Website" section divider and insert before it
    const webSec = Array.from(sbNav.querySelectorAll('.sb-sec')).find(el => el.textContent.trim() === 'Website');
    const rewardLink = document.createElement('a');
    rewardLink.className = 'sb-item';
    rewardLink.setAttribute('data-pg', 'rewards');
    rewardLink.href = '#';
    rewardLink.onclick = function() { window.switchPage('rewards'); return false; };
    rewardLink.innerHTML = '<span class="sb-icon">🎁</span><span>Rewards</span>';
    if (webSec) {
      sbNav.insertBefore(rewardLink, webSec);
    } else {
      sbNav.appendChild(rewardLink);
    }
  }

  // Create the page div
  const pageWrap = document.querySelector('.page-wrap');
  if (pageWrap && !document.getElementById('pg-rewards')) {
    const pg = document.createElement('div');
    pg.className = 'page';
    pg.id = 'pg-rewards';
    pg.innerHTML = buildRewardsPage();
    pageWrap.appendChild(pg);
  }

  // Patch switchPage to handle 'rewards'
  const _origSwitch = window.switchPage;
  window.switchPage = function(pg) {
    _origSwitch(pg);
    if (pg === 'rewards') {
      document.getElementById('pgTitle').innerHTML = 'Rewards <em>Manager</em>';
      // Subscribe when first opened
      if (!_unsubPool) rwSubscribe();
    }
  };
}


// ── Init ──────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', patchAdminNav);
} else {
  patchAdminNav();
}

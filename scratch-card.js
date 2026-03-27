/**
 * scratch-card.js — Aneesa Hampers Reward System v1.0
 * ─────────────────────────────────────────────────────
 * Scratch card reward after successful orders.
 * - Canvas-based scratch animation (mobile + desktop)
 * - Firebase Firestore for reward config + user rewards
 * - Admin-configurable reward pool with probabilities
 * - One card per order; redeemable at checkout
 *
 * Usage: Include after firebase.js on checkout.html
 *   window.AH_Rewards.showCard(orderId, uid)  → shows scratch card
 *   window.AH_Rewards.getActive(uid)           → returns active reward or null
 *   window.AH_Rewards.redeem(rewardId)         → marks reward as redeemed
 */

import {
  db, getSession
} from './firebase.js';

import {
  collection, addDoc, getDocs, doc, setDoc,
  updateDoc, query, where, orderBy, getDoc,
  serverTimestamp, limit
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ═══════════════════════════════════════════════════════════
//  REWARD ENGINE
// ═══════════════════════════════════════════════════════════

const RewardEngine = {

  /** Default pool if admin hasn't configured any */
  defaultPool: [
    { id: 'r_d1', label: '₹50 Off',       type: 'fixed',    value: 50,  prob: 30, minOrder: 300 },
    { id: 'r_d2', label: '₹100 Off',      type: 'fixed',    value: 100, prob: 20, minOrder: 600 },
    { id: 'r_d3', label: '10% Off',        type: 'percent',  value: 10,  prob: 25, minOrder: 400 },
    { id: 'r_d4', label: '15% Off',        type: 'percent',  value: 15,  prob: 10, minOrder: 700 },
    { id: 'r_d5', label: 'Free Delivery',  type: 'delivery', value: 0,   prob: 10, minOrder: 0   },
    { id: 'r_d6', label: '₹25 Off',       type: 'fixed',    value: 25,  prob: 5,  minOrder: 200 },
  ],

  /** Fetch active reward pool from Firestore */
  async getPool() {
    try {
      const snap = await getDocs(
        query(collection(db, 'rewardConfig'), where('active', '==', true))
      );
      if (snap.empty) return this.defaultPool;
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Rewards] Using default pool:', e.message);
      return this.defaultPool;
    }
  },

  /** Weighted random pick from pool */
  pickReward(pool) {
    const total = pool.reduce((s, r) => s + (r.prob || 10), 0);
    let rand = Math.random() * total;
    for (const r of pool) {
      rand -= (r.prob || 10);
      if (rand <= 0) return r;
    }
    return pool[pool.length - 1];
  },

  /** Check if user already has an unclaimed reward for this order */
  async existsForOrder(orderId) {
    try {
      const snap = await getDocs(
        query(collection(db, 'userRewards'),
          where('orderId', '==', orderId), limit(1))
      );
      return !snap.empty;
    } catch { return false; }
  },

  /** Check if user has any active (unredeemed) reward */
  async getActive(uid) {
    if (!uid) return null;
    try {
      const snap = await getDocs(
        query(collection(db, 'userRewards'),
          where('uid', '==', uid),
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc'),
          limit(1))
      );
      if (snap.empty) return null;
      const d = snap.docs[0];
      const reward = { id: d.id, ...d.data() };
      // Check expiry (30 days)
      const exp = reward.expiresAt?.toDate?.() || new Date(reward.expiresAt || 0);
      if (exp < new Date()) {
        await updateDoc(doc(db, 'userRewards', d.id), { status: 'expired' });
        return null;
      }
      return reward;
    } catch (e) {
      // Fallback to localStorage
      try {
        const r = JSON.parse(localStorage.getItem('ah_reward_pending') || 'null');
        if (r && r.uid === uid && new Date(r.expiresAt) > new Date()) return r;
      } catch {}
      return null;
    }
  },

  /** Mark reward as redeemed */
  async redeem(rewardId) {
    try {
      await updateDoc(doc(db, 'userRewards', rewardId), {
        status: 'redeemed',
        redeemedAt: serverTimestamp()
      });
      localStorage.removeItem('ah_reward_pending');
      return true;
    } catch { return false; }
  },

  /** Generate reward for an order */
  async generate(orderId, uid) {
    // Prevent double-generation
    if (await this.existsForOrder(orderId)) return null;

    const pool = await this.getPool();
    const picked = this.pickReward(pool);

    // Expiry: 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const reward = {
      orderId,
      uid: uid || 'guest',
      type: picked.type,
      value: picked.value,
      label: picked.label,
      minOrder: picked.minOrder || 0,
      status: 'pending',        // pending → redeemed | expired
      scratched: false,
      createdAt: serverTimestamp(),
      expiresAt
    };

    try {
      const ref = await addDoc(collection(db, 'userRewards'), reward);
      // Also cache in localStorage for offline access
      localStorage.setItem('ah_reward_pending', JSON.stringify({
        id: ref.id, ...reward,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      }));
      return { id: ref.id, ...reward };
    } catch (e) {
      console.warn('[Rewards] Firestore save failed, using localStorage:', e.message);
      const id = 'local_' + Date.now();
      const r = {
        id, ...reward,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString()
      };
      localStorage.setItem('ah_reward_pending', JSON.stringify(r));
      return r;
    }
  },

  /** Mark reward as scratched (revealed) */
  async markScratched(rewardId) {
    try {
      if (!rewardId.startsWith('local_')) {
        await updateDoc(doc(db, 'userRewards', rewardId), { scratched: true });
      }
      const r = JSON.parse(localStorage.getItem('ah_reward_pending') || 'null');
      if (r && r.id === rewardId) {
        r.scratched = true;
        localStorage.setItem('ah_reward_pending', JSON.stringify(r));
      }
    } catch {}
  }
};


// ═══════════════════════════════════════════════════════════
//  SCRATCH CARD UI
// ═══════════════════════════════════════════════════════════

const ScratchUI = {

  _styles: `
    #ah-scratch-overlay {
      position: fixed; inset: 0; z-index: 8000;
      background: rgba(20, 5, 12, 0.88);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      animation: scrOverlayIn .4s ease both;
    }
    @keyframes scrOverlayIn { from{opacity:0} to{opacity:1} }

    #ah-scratch-box {
      background: linear-gradient(160deg, #fdf0f4 0%, #fdf6f0 100%);
      border-radius: 24px;
      width: 100%; max-width: 360px;
      overflow: hidden;
      box-shadow: 0 32px 80px rgba(59,13,26,.35), 0 0 0 1px rgba(192,100,122,.15);
      animation: scrBoxIn .5s cubic-bezier(.34,1.56,.64,1) both .1s;
    }
    @keyframes scrBoxIn { from{transform:scale(.7) translateY(40px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }

    .scr-header {
      background: linear-gradient(135deg, #3b0d1a 0%, #6a1f38 100%);
      padding: 22px 24px 18px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .scr-header::before {
      content: '';
      position: absolute; inset: 0;
      background: radial-gradient(ellipse at top right, rgba(232,160,176,.3) 0%, transparent 65%);
    }
    .scr-gift-anim {
      font-size: 2.4rem;
      display: block;
      margin-bottom: 8px;
      animation: scrGiftBounce 1.2s ease-in-out infinite;
      position: relative; z-index: 1;
    }
    @keyframes scrGiftBounce {
      0%,100%{transform:translateY(0) rotate(-3deg)}
      50%{transform:translateY(-8px) rotate(3deg)}
    }
    .scr-header h2 {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.65rem; font-style: italic;
      color: white; position: relative; z-index: 1;
      margin-bottom: 4px;
    }
    .scr-header h2 em { color: #e8a0b0; font-style: normal; }
    .scr-header p {
      font-size: .72rem; letter-spacing: 1px;
      color: rgba(255,255,255,.55);
      position: relative; z-index: 1;
    }

    .scr-body { padding: 24px; }

    .scr-canvas-wrap {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(59,13,26,.12);
      cursor: crosshair;
      user-select: none;
      -webkit-user-select: none;
      touch-action: none;
    }

    /* Prize reveal layer (under scratch) */
    .scr-prize-layer {
      position: absolute; inset: 0;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      background: linear-gradient(135deg, #fff5f8 0%, #fff9f5 100%);
      gap: 6px;
      padding: 16px;
    }
    .scr-prize-icon { font-size: 2.8rem; }
    .scr-prize-label {
      font-family: 'Cormorant Garamond', serif;
      font-size: 2.1rem; font-weight: 700;
      color: #c0647a; line-height: 1;
    }
    .scr-prize-desc {
      font-size: .72rem; letter-spacing: 1.5px;
      text-transform: uppercase; color: rgba(59,13,26,.45);
    }
    .scr-prize-min {
      font-size: .63rem; color: rgba(59,13,26,.35);
      text-align: center; margin-top: 4px;
    }

    /* Canvas (scratch layer on top) */
    #ah-scratch-canvas {
      display: block;
      position: relative; z-index: 2;
    }

    /* Hint */
    .scr-hint {
      text-align: center; margin-top: 12px;
      font-size: .7rem; letter-spacing: 1.5px;
      text-transform: uppercase; color: rgba(59,13,26,.38);
      transition: opacity .3s;
    }
    .scr-hint.hidden { opacity: 0; pointer-events: none; }

    /* Progress bar */
    .scr-progress {
      height: 3px;
      background: rgba(192,100,122,.12);
      border-radius: 4px;
      margin-top: 10px;
      overflow: hidden;
    }
    .scr-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #e8a0b0, #c0647a);
      border-radius: 4px;
      width: 0%;
      transition: width .15s;
    }

    /* Reveal state */
    .scr-reveal-msg {
      display: none;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 6px;
      padding: 20px 0 4px;
    }
    .scr-reveal-msg.show { display: flex; }
    .scr-reveal-msg .scr-congrats {
      font-family: 'Cormorant Garamond', serif;
      font-size: 1.4rem; font-style: italic;
      color: #3b0d1a;
    }
    .scr-reveal-msg .scr-valid {
      font-size: .68rem; letter-spacing: 1px;
      text-transform: uppercase; color: rgba(59,13,26,.4);
    }

    /* Buttons */
    .scr-actions {
      display: flex; flex-direction: column; gap: 10px;
      margin-top: 18px;
    }
    .scr-btn-primary {
      background: linear-gradient(135deg, #c0647a 0%, #a04060 100%);
      color: white; border: none; border-radius: 14px;
      padding: 14px 24px;
      font-family: 'Jost', sans-serif;
      font-size: .74rem; letter-spacing: 2px; text-transform: uppercase;
      font-weight: 600; cursor: pointer;
      box-shadow: 0 6px 20px rgba(192,100,122,.35);
      transition: transform .18s, box-shadow .18s;
      display: none;
    }
    .scr-btn-primary.show { display: block; }
    .scr-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(192,100,122,.4); }
    .scr-btn-skip {
      background: none; border: none;
      font-family: 'Jost', sans-serif;
      font-size: .68rem; letter-spacing: 1.5px; text-transform: uppercase;
      color: rgba(59,13,26,.35); cursor: pointer; padding: 6px;
      transition: color .2s;
    }
    .scr-btn-skip:hover { color: rgba(59,13,26,.6); }

    /* Confetti burst */
    .scr-confetti-piece {
      position: fixed; pointer-events: none; z-index: 9000;
      width: 8px; height: 8px; border-radius: 2px;
      animation: confFall linear forwards;
    }
    @keyframes confFall {
      0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(600px) rotate(720deg); opacity: 0; }
    }
  `,

  inject() {
    if (document.getElementById('ah-scr-styles')) return;
    const s = document.createElement('style');
    s.id = 'ah-scr-styles';
    s.textContent = this._styles;
    document.head.appendChild(s);
  },

  buildPrizeHTML(reward) {
    const icons = { fixed: '🎁', percent: '💝', delivery: '🚚' };
    const descs = { fixed: 'Cash Discount', percent: 'Percent Off', delivery: 'Free Delivery' };
    const icon  = icons[reward.type] || '🎁';
    const desc  = descs[reward.type] || 'Special Reward';
    const minTxt = reward.minOrder > 0
      ? `<div class="scr-prize-min">On orders above ₹${reward.minOrder.toLocaleString('en-IN')}</div>`
      : '';
    return `
      <div class="scr-prize-layer" id="scrPrizeLayer">
        <span class="scr-prize-icon">${icon}</span>
        <div class="scr-prize-label">${reward.label}</div>
        <div class="scr-prize-desc">${desc}</div>
        ${minTxt}
      </div>`;
  },

  /** Main entry: show the scratch card modal */
  show(reward) {
    this.inject();

    // Remove existing
    document.getElementById('ah-scratch-overlay')?.remove();

    const W = 312, H = 180;
    const expiryDate = (() => {
      try {
        const d = reward.expiresAt?.toDate?.() || new Date(reward.expiresAt);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      } catch { return '30 days'; }
    })();

    const overlay = document.createElement('div');
    overlay.id = 'ah-scratch-overlay';
    overlay.innerHTML = `
      <div id="ah-scratch-box">
        <div class="scr-header">
          <span class="scr-gift-anim">🎁</span>
          <h2>You've <em>Won</em> a Reward!</h2>
          <p>Scratch to reveal your surprise gift</p>
        </div>
        <div class="scr-body">
          <div class="scr-canvas-wrap" id="scrCanvasWrap" style="height:${H}px">
            ${this.buildPrizeHTML(reward)}
            <canvas id="ah-scratch-canvas" width="${W}" height="${H}"></canvas>
          </div>
          <div class="scr-hint" id="scrHint">✦ Scratch anywhere to reveal ✦</div>
          <div class="scr-progress"><div class="scr-progress-fill" id="scrProgFill"></div></div>
          <div class="scr-reveal-msg" id="scrRevealMsg">
            <div class="scr-congrats">🌸 Congratulations!</div>
            <div class="scr-valid">Valid until ${expiryDate} · Applied at checkout</div>
          </div>
          <div class="scr-actions">
            <button class="scr-btn-primary" id="scrUseBtn" onclick="window._scrUseCoupon()">
              🛍️ Use This Reward
            </button>
            <button class="scr-btn-skip" id="scrLaterBtn" onclick="window._scrDismiss()">
              Save for later
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // Wire up canvas scratch
    this._initCanvas(reward, W, H);
  },

  _initCanvas(reward, W, H) {
    const canvas = document.getElementById('ah-scratch-canvas');
    const ctx    = canvas.getContext('2d');
    let scratched = false;
    let revealed  = false;

    // Draw scratch surface
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0,   '#c0647a');
    grad.addColorStop(0.5, '#a04060');
    grad.addColorStop(1,   '#7a2040');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Pattern overlay
    ctx.globalAlpha = 0.15;
    for (let x = 0; x < W; x += 24) {
      for (let y = 0; y < H; y += 24) {
        ctx.fillStyle = '#fff';
        ctx.font = '14px serif';
        ctx.fillText('✦', x, y + 14);
      }
    }
    ctx.globalAlpha = 1;

    // "Scratch here" text
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 15px Jost, sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '3px';
    ctx.fillText('✦  SCRATCH HERE  ✦', W / 2, H / 2 - 8);
    ctx.font = '11px Jost, sans-serif';
    ctx.globalAlpha = 0.6;
    ctx.fillText('Your reward is hiding underneath', W / 2, H / 2 + 14);
    ctx.globalAlpha = 1;

    // Resize canvas to container
    const wrap = document.getElementById('scrCanvasWrap');
    const scale = wrap.offsetWidth / W;
    canvas.style.width  = '100%';
    canvas.style.height = (H * scale) + 'px';
    wrap.style.height   = (H * scale) + 'px';

    // Scratch logic
    let isDrawing = false;
    let totalPixels  = W * H;
    let scratchedPx  = 0;

    ctx.globalCompositeOperation = 'destination-out';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = W / rect.width;
      const scaleY = H / rect.height;
      const src = e.touches ? e.touches[0] : e;
      return {
        x: (src.clientX - rect.left) * scaleX,
        y: (src.clientY - rect.top)  * scaleY
      };
    };

    const scratch = (pos) => {
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
      ctx.fill();
      checkProgress();
    };

    const checkProgress = () => {
      const data = ctx.getImageData(0, 0, W, H).data;
      let cleared = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) cleared++;
      }
      const pct = cleared / (totalPixels) * 100;
      const fill = document.getElementById('scrProgFill');
      if (fill) fill.style.width = Math.min(pct, 100) + '%';

      if (pct > 55 && !revealed) {
        revealed = true;
        this._onRevealed(reward);
      }
    };

    canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratch(getPos(e)); });
    canvas.addEventListener('mousemove', (e) => { if (isDrawing) scratch(getPos(e)); });
    canvas.addEventListener('mouseup',   () => { isDrawing = false; });
    canvas.addEventListener('mouseleave',() => { isDrawing = false; });
    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; scratch(getPos(e)); }, { passive: false });
    canvas.addEventListener('touchmove',  (e) => { e.preventDefault(); if (isDrawing) scratch(getPos(e)); }, { passive: false });
    canvas.addEventListener('touchend',   () => { isDrawing = false; });
  },

  async _onRevealed(reward) {
    // Fade out canvas
    const canvas = document.getElementById('ah-scratch-canvas');
    if (canvas) {
      canvas.style.transition = 'opacity .6s';
      canvas.style.opacity = '0';
      setTimeout(() => canvas.style.display = 'none', 600);
    }

    // Show hint hidden
    document.getElementById('scrHint')?.classList.add('hidden');

    // Show reveal message + button
    setTimeout(() => {
      document.getElementById('scrRevealMsg')?.classList.add('show');
      document.getElementById('scrUseBtn')?.classList.add('show');
    }, 400);

    // Confetti!
    this._burst();

    // Mark as scratched in Firestore
    await RewardEngine.markScratched(reward.id);

    // Save current reward to window for use button
    window._currentReward = reward;

    // Wire up buttons
    window._scrUseCoupon = () => {
      document.getElementById('ah-scratch-overlay')?.remove();
      // Redirect to checkout or show toast
      const toast = document.createElement('div');
      toast.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:#3b0d1a;color:white;padding:11px 24px;border-radius:30px;font-size:.78rem;z-index:99999;font-family:Jost,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.2);pointer-events:none;white-space:nowrap;';
      toast.textContent = `🎁 Reward saved! ${reward.label} will apply at next checkout.`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    };
  },

  _burst() {
    const colors = ['#c0647a', '#e8a0b0', '#c9a96e', '#f9e4e9', '#3b0d1a', '#fff'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 60; i++) {
      const piece = document.createElement('div');
      piece.className = 'scr-confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.random() * 360) + 'deg';
      const tx = (Math.random() - 0.5) * 400;
      const ty = -(Math.random() * 300 + 100);
      piece.style.cssText = `
        left:${cx + (Math.random() - 0.5) * 100}px;
        top:${cy - 100}px;
        background:${color};
        transform:rotate(${angle});
        animation-duration:${0.8 + Math.random() * 1.2}s;
        animation-delay:${Math.random() * 0.3}s;
      `;
      piece.style.setProperty('--tx', tx + 'px');
      piece.style.setProperty('--ty', ty + 'px');
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2500);
    }
  }
};


// ═══════════════════════════════════════════════════════════
//  PUBLIC API
// ═══════════════════════════════════════════════════════════

window.AH_Rewards = {

  /**
   * Call this right after a successful order.
   * @param {string} orderId   - Firestore order doc ID
   * @param {string|null} uid  - Firebase Auth UID (or null for guest)
   */
  async showCard(orderId, uid) {
    try {
      const reward = await RewardEngine.generate(orderId, uid);
      if (!reward) return; // Already had a card for this order

      // Small delay so success screen renders first
      setTimeout(() => ScratchUI.show(reward), 1800);
    } catch (e) {
      console.error('[Rewards] showCard failed:', e);
    }
  },

  /**
   * Get the user's active (pending) reward, if any.
   * Used by checkout to show & apply discount.
   * @param {string} uid
   * @returns {object|null}
   */
  async getActive(uid) {
    return RewardEngine.getActive(uid);
  },

  /**
   * Redeem (consume) a reward by its Firestore doc ID.
   * @param {string} rewardId
   */
  async redeem(rewardId) {
    return RewardEngine.redeem(rewardId);
  },

  /**
   * Calculate the discount amount for a given order total.
   * @param {object} reward - reward object
   * @param {number} orderTotal - total in INR
   * @returns {number} discount amount in INR
   */
  calcDiscount(reward, orderTotal) {
    if (!reward || reward.status !== 'pending') return 0;
    if (orderTotal < (reward.minOrder || 0)) return 0;
    if (reward.type === 'fixed')   return Math.min(reward.value, orderTotal);
    if (reward.type === 'percent') return Math.round(orderTotal * reward.value / 100);
    if (reward.type === 'delivery') return 0; // handled separately
    return 0;
  },

  /**
   * Show the card manually (for testing / re-showing).
   * @param {object} reward
   */
  showExisting(reward) {
    ScratchUI.show(reward);
  }
};

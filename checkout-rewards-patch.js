/**
 * checkout-rewards-patch.js — Integration Instructions
 * ──────────────────────────────────────────────────────
 * This file documents exactly what to add/change in checkout.html
 * to wire up the scratch card reward system.
 *
 * STEP 1: Add import to checkout.html's <script type="module"> block
 * STEP 2: Modify saveOrder() to call AH_Rewards.showCard()
 * STEP 3: Add reward display to success screen
 * STEP 4: Apply reward discount at checkout
 */

/* ═══════════════════════════════════════════════════════
   STEP 1 — Add this import at top of the module script
   ═══════════════════════════════════════════════════════ */

// In checkout.html, inside <script type="module">, add:
import './scratch-card.js';


/* ═══════════════════════════════════════════════════════
   STEP 2 — In saveOrder(), after showSuccessScreen(), add:
   ═══════════════════════════════════════════════════════ */

// Original saveOrder ends with:
//   showSuccessScreen(trackingId, total);
//
// Replace that line with:
//
//   showSuccessScreen(trackingId, total);
//
//   // 🎁 Show scratch card reward
//   const sess = getSession();
//   if (window.AH_Rewards) {
//     window.AH_Rewards.showCard(orderId, sess?.uid || null);
//   }


/* ═══════════════════════════════════════════════════════
   STEP 3 — Add reward indicator to success screen HTML
   (inside #successScreen, after conf-actions div)
   ═══════════════════════════════════════════════════════ */

// Add this HTML block inside the successScreen div:
const REWARD_INDICATOR_HTML = `
  <!-- Reward pending indicator — shown after scratch -->
  <div id="confRewardBanner" style="
    display:none;
    background:linear-gradient(135deg,#fdf0f4,#fff9f5);
    border:1.5px solid rgba(192,100,122,.2);
    border-radius:14px;
    padding:14px 18px;
    margin:8px 16px 0;
    display:flex;
    align-items:center;
    gap:12px;
  ">
    <span style="font-size:1.6rem">🎁</span>
    <div style="flex:1">
      <div style="font-size:.78rem;font-weight:600;color:#3b0d1a" id="confRewardLabel">Reward saved!</div>
      <div style="font-size:.67rem;color:rgba(59,13,26,.45);margin-top:2px">
        Will be applied at your next checkout · 
        <span id="confRewardExpiry"></span>
      </div>
    </div>
    <button onclick="window.AH_Rewards?.showExisting(window._currentReward)" style="
      background:none;border:1.5px solid rgba(192,100,122,.25);
      border-radius:8px;padding:5px 11px;font-family:'Jost',sans-serif;
      font-size:.62rem;letter-spacing:1.5px;text-transform:uppercase;
      color:#c0647a;cursor:pointer;
    ">View</button>
  </div>
`;

// After AH_Rewards.showCard() returns, show the banner:
// (Add to showSuccessScreen or as a callback from scratch-card.js)
//
// window._onScratchRevealed = function(reward) {
//   const banner = document.getElementById('confRewardBanner');
//   if (banner) {
//     banner.style.display = 'flex';
//     document.getElementById('confRewardLabel').textContent = `🎉 You won: ${reward.label}`;
//     const exp = reward.expiresAt?.toDate?.() || new Date(reward.expiresAt);
//     document.getElementById('confRewardExpiry').textContent =
//       'Valid till ' + exp.toLocaleDateString('en-IN', {day:'numeric',month:'short'});
//   }
// };


/* ═══════════════════════════════════════════════════════
   STEP 4 — Apply reward discount at checkout load
   (Add to the existing checkout page initialization)
   ═══════════════════════════════════════════════════════ */

// At the top of checkout.html's init (onAuthStateChanged callback),
// after user is confirmed, add:

async function checkPendingReward(uid) {
  if (!window.AH_Rewards) return;
  const reward = await window.AH_Rewards.getActive(uid);
  if (!reward) return;

  // Show discount banner on checkout page
  const discountBanner = document.getElementById('co-reward-banner');
  if (discountBanner) {
    discountBanner.style.display = 'flex';
    const label = document.getElementById('co-reward-label');
    const desc  = document.getElementById('co-reward-desc');
    if (label) label.textContent = reward.label;
    if (desc)  desc.textContent  = reward.minOrder > 0
      ? `On orders ₹${reward.minOrder.toLocaleString('en-IN')}+`
      : 'No minimum order';
    window._pendingReward = reward;
    updateOrderTotal(); // recalculate total with discount
  }
}

// Add this HTML in checkout.html (inside .co-body, before the total section):
const CHECKOUT_REWARD_BANNER_HTML = `
  <div class="co-section" id="co-reward-banner" style="display:none">
    <div class="co-section-label"><span>🎁</span> Reward Available</div>
    <div style="
      background:linear-gradient(135deg,#fdf0f4,#fff9f5);
      border:1.5px solid rgba(192,100,122,.2);
      border-radius:12px;
      padding:13px 15px;
      display:flex;align-items:center;gap:12px;
    ">
      <span style="font-size:1.5rem">🎟️</span>
      <div style="flex:1">
        <div style="font-size:.83rem;font-weight:600;color:#3b0d1a" id="co-reward-label">—</div>
        <div style="font-size:.68rem;color:rgba(59,13,26,.45);margin-top:2px" id="co-reward-desc">—</div>
      </div>
      <div style="font-size:.7rem;letter-spacing:1px;text-transform:uppercase;color:#2d7a4f;font-weight:600">Applied ✓</div>
    </div>
  </div>
`;

// Modify the total calculation to subtract reward discount:
// In the existing total/summary section, after calculating `total`, add:
//
// if (window._pendingReward) {
//   const discount = window.AH_Rewards.calcDiscount(window._pendingReward, total);
//   if (discount > 0) {
//     total -= discount;
//     window._rewardDiscount = discount;
//   }
// }

// When placing the order, include the reward in the order data:
// In saveOrder(), add to the orderData object:
//
// rewardId:       window._pendingReward?.id || null,
// rewardLabel:    window._pendingReward?.label || null,
// rewardDiscount: window._rewardDiscount || 0,

// And after the order is saved successfully, redeem the reward:
// if (window._pendingReward) {
//   await window.AH_Rewards.redeem(window._pendingReward.id);
//   window._pendingReward = null;
//   window._rewardDiscount = 0;
// }

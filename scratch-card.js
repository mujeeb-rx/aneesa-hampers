/**
 * scratch-card.js — Google Pay Style Scratch Card Reward
 * Aneesa Hampers · Post-purchase reward animation
 *
 * Usage:
 *   window.AH_launchScratchCard({ orderId, total, rewardPool })
 *   Or just call: launchScratchCard()
 *
 * Injects the scratch card overlay into the page automatically.
 */

(function () {
  'use strict';

  /* ── Default reward pool ──────────────────────────────────────── */
  var DEFAULT_POOL = [
    { id: 'r1', label: '₹50 Off',      type: 'fixed',    value: 50,  prob: 30, minOrder: 300,  icon: '🎀' },
    { id: 'r2', label: '₹100 Off',     type: 'fixed',    value: 100, prob: 15, minOrder: 600,  icon: '💝' },
    { id: 'r3', label: '₹200 Off',     type: 'fixed',    value: 200, prob: 5,  minOrder: 1000, icon: '🌟' },
    { id: 'r4', label: '10% Off',       type: 'percent',  value: 10,  prob: 25, minOrder: 400,  icon: '🎊' },
    { id: 'r5', label: '15% Off',       type: 'percent',  value: 15,  prob: 10, minOrder: 700,  icon: '✨' },
    { id: 'r6', label: 'Free Delivery', type: 'delivery', value: 0,   prob: 10, minOrder: 0,    icon: '🚀' },
    { id: 'r7', label: '₹25 Off',      type: 'fixed',    value: 25,  prob: 5,  minOrder: 200,  icon: '🎁' }
  ];

  /* ── Pick reward by weighted probability ─────────────────────── */
  function pickReward(pool) {
    pool = pool || DEFAULT_POOL;
    var total = pool.reduce(function (s, r) { return s + r.prob; }, 0);
    var rand = Math.random() * total;
    for (var i = 0; i < pool.length; i++) {
      rand -= pool[i].prob;
      if (rand <= 0) return pool[i];
    }
    return pool[0];
  }

  /* ── Build overlay HTML ───────────────────────────────────────── */
  function buildOverlay() {
    if (document.getElementById('ah-scratch-overlay')) return;

    var html =
      '<div id="ah-scratch-overlay" role="dialog" aria-modal="true" aria-label="Scratch your reward card" ' +
      'style="position:fixed;inset:0;z-index:8000;background:rgba(20,5,12,.88);backdrop-filter:blur(12px);' +
      '-webkit-backdrop-filter:blur(12px);display:none;align-items:center;justify-content:center;padding:20px;">' +
        '<div id="ah-scratch-box" style="background:linear-gradient(160deg,#fdf0f4 0%,#fdf6f0 100%);' +
        'border-radius:24px;width:100%;max-width:360px;overflow:hidden;' +
        'box-shadow:0 32px 80px rgba(59,13,26,.35),0 0 0 1px rgba(192,100,122,.15);">' +

          // Header
          '<div style="background:linear-gradient(135deg,#3b0d1a 0%,#6a1f38 100%);' +
          'padding:22px 24px 18px;text-align:center;position:relative;overflow:hidden;">' +
            '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at top right,rgba(232,160,176,.3),transparent 65%)"></div>' +
            '<span id="scrGiftIcon" style="font-size:2.4rem;display:block;margin-bottom:8px;position:relative;z-index:1;' +
            'animation:giftBounce 1.2s ease-in-out infinite">🎁</span>' +
            '<h2 style="font-family:\'Cormorant Garamond\',serif;font-size:1.65rem;font-style:italic;' +
            'color:white;position:relative;z-index:1;margin-bottom:4px;">' +
              'You\'ve <em style="color:#e8a0b0;font-style:normal;">Won</em> a Reward!' +
            '</h2>' +
            '<p style="font-size:.72rem;letter-spacing:1px;color:rgba(255,255,255,.55);position:relative;z-index:1;">' +
              'Scratch to reveal your surprise gift</p>' +
          '</div>' +

          // Body
          '<div style="padding:24px;">' +
            '<div id="scrCanvasWrap" style="position:relative;border-radius:16px;overflow:hidden;' +
            'box-shadow:0 4px 20px rgba(59,13,26,.12);cursor:crosshair;user-select:none;' +
            '-webkit-user-select:none;touch-action:none;">' +
              // Prize layer (under canvas)
              '<div id="scrPrizeLayer" style="position:absolute;inset:0;display:flex;flex-direction:column;' +
              'align-items:center;justify-content:center;background:linear-gradient(135deg,#fff5f8 0%,#fff9f5 100%);' +
              'gap:6px;padding:16px;">' +
                '<span id="prizeIcon" style="font-size:2.8rem;">🎁</span>' +
                '<div id="prizeLabel" style="font-family:\'Cormorant Garamond\',serif;font-size:2.1rem;font-weight:700;color:#c0647a;line-height:1;">₹100 Off</div>' +
                '<div id="prizeDesc" style="font-size:.72rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(59,13,26,.45);">Cash Discount</div>' +
                '<div id="prizeMin" style="font-size:.63rem;color:rgba(59,13,26,.35);text-align:center;margin-top:4px;">On orders above ₹600</div>' +
              '</div>' +
              '<canvas id="ah-scratch-canvas" style="display:block;position:relative;z-index:2;"></canvas>' +
            '</div>' +
            '<div id="scrHint" style="text-align:center;margin-top:12px;font-size:.7rem;letter-spacing:1.5px;' +
            'text-transform:uppercase;color:rgba(59,13,26,.38);transition:opacity .3s;">✦ Scratch anywhere to reveal ✦</div>' +
            '<div style="height:3px;background:rgba(192,100,122,.12);border-radius:4px;margin-top:10px;overflow:hidden;">' +
              '<div id="scrProgFill" style="height:100%;border-radius:4px;background:linear-gradient(90deg,#e8a0b0,#c0647a);width:0%;transition:width .15s;"></div>' +
            '</div>' +
            '<div id="scrRevealMsg" style="display:none;flex-direction:column;align-items:center;text-align:center;gap:6px;padding:20px 0 4px;">' +
              '<div style="font-family:\'Cormorant Garamond\',serif;font-size:1.4rem;font-style:italic;color:#3b0d1a;">🌸 Congratulations!</div>' +
              '<div id="scrValidText" style="font-size:.68rem;letter-spacing:1px;text-transform:uppercase;color:rgba(59,13,26,.4);">Valid for 30 days · Applied at checkout</div>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:10px;margin-top:18px;">' +
              '<button id="scrUseBtn" onclick="window._scrUseCoupon()" style="display:none;background:linear-gradient(135deg,#c0647a 0%,#a04060 100%);' +
              'color:white;border:none;border-radius:14px;padding:14px 24px;font-family:\'Jost\',sans-serif;' +
              'font-size:.74rem;letter-spacing:2px;text-transform:uppercase;font-weight:600;cursor:pointer;' +
              'box-shadow:0 6px 20px rgba(192,100,122,.35);">🛍️ Save to My Account</button>' +
              '<button onclick="window._scrDismiss()" style="background:none;border:none;font-family:\'Jost\',sans-serif;' +
              'font-size:.68rem;letter-spacing:1.5px;text-transform:uppercase;color:rgba(59,13,26,.35);cursor:pointer;padding:6px;">Maybe later</button>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>' +
      '<style>@keyframes giftBounce{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-8px) rotate(3deg)}}' +
      '.conf-piece{position:fixed;pointer-events:none;z-index:9000;border-radius:2px;animation:confFall linear forwards;}' +
      '@keyframes confFall{0%{opacity:1}100%{transform:translateY(700px) rotate(720deg);opacity:0}}</style>';

    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    document.body.appendChild(wrap.firstChild);
    // Append style tag
    document.body.appendChild(wrap.lastChild);
  }

  /* ── Canvas engine ───────────────────────────────────────────── */
  var W = 312, H = 180;
  var ctx, isDrawing = false, isRevealed = false;
  var _currentReward = null;
  var _onComplete = null;

  function initCanvas() {
    var canvas = document.getElementById('ah-scratch-canvas');
    var wrap   = document.getElementById('scrCanvasWrap');
    canvas.width  = W;
    canvas.height = H;

    var scale = wrap.offsetWidth / W || 1;
    canvas.style.width  = '100%';
    canvas.style.height = (H * scale) + 'px';
    wrap.style.height   = (H * scale) + 'px';

    ctx = canvas.getContext('2d');

    // Background gradient
    var grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#c0647a');
    grad.addColorStop(0.5, '#943050');
    grad.addColorStop(1, '#6a1530');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Pattern
    ctx.globalAlpha = 0.12;
    for (var x = 0; x < W; x += 22) {
      for (var y = 0; y < H; y += 22) {
        ctx.fillStyle = '#fff';
        ctx.font = '13px serif';
        ctx.fillText('✦', x, y + 13);
      }
    }
    ctx.globalAlpha = 1;

    // Text
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.font = 'bold 14px Jost, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦   SCRATCH HERE   ✦', W / 2, H / 2 - 10);
    ctx.font = '500 11px Jost, sans-serif';
    ctx.globalAlpha = 0.55;
    ctx.fillText('Your reward is hiding underneath', W / 2, H / 2 + 12);
    ctx.globalAlpha = 1;

    // Lines
    ctx.strokeStyle = 'rgba(255,255,255,.18)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(40, H/2-28); ctx.lineTo(W-40, H/2-28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, H/2+28); ctx.lineTo(W-40, H/2+28); ctx.stroke();

    ctx.globalCompositeOperation = 'destination-out';
    isRevealed = false;
    isDrawing  = false;

    // Events
    canvas.addEventListener('mousedown',  function (e) { isDrawing = true; scratch(getPos(e, canvas)); });
    canvas.addEventListener('mousemove',  function (e) { if (isDrawing) scratch(getPos(e, canvas)); });
    canvas.addEventListener('mouseup',    function () { isDrawing = false; });
    canvas.addEventListener('mouseleave', function () { isDrawing = false; });
    canvas.addEventListener('touchstart', function (e) { e.preventDefault(); isDrawing = true; scratch(getPos(e, canvas)); }, { passive: false });
    canvas.addEventListener('touchmove',  function (e) { e.preventDefault(); if (isDrawing) scratch(getPos(e, canvas)); }, { passive: false });
    canvas.addEventListener('touchend',   function () { isDrawing = false; });
  }

  function getPos(e, canvas) {
    var rect = canvas.getBoundingClientRect();
    var sx = W / rect.width, sy = H / rect.height;
    var src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * sx, y: (src.clientY - rect.top) * sy };
  }

  function scratch(pos) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 30, 0, Math.PI * 2);
    ctx.fill();
    checkReveal();
  }

  function checkReveal() {
    if (isRevealed) return;
    var data = ctx.getImageData(0, 0, W, H).data;
    var cleared = 0;
    for (var i = 3; i < data.length; i += 4) if (data[i] === 0) cleared++;
    var pct = cleared / (W * H) * 100;
    document.getElementById('scrProgFill').style.width = Math.min(pct, 100) + '%';
    if (pct > 52) onRevealed();
  }

  function onRevealed() {
    isRevealed = true;
    var canvas = document.getElementById('ah-scratch-canvas');
    canvas.style.transition = 'opacity .7s';
    canvas.style.opacity = '0';
    setTimeout(function () { canvas.style.display = 'none'; }, 700);
    document.getElementById('scrHint').style.opacity = '0';
    setTimeout(function () {
      var msg = document.getElementById('scrRevealMsg');
      var btn = document.getElementById('scrUseBtn');
      if (msg) msg.style.display = 'flex';
      if (btn) btn.style.display = 'block';
    }, 500);
    confettiBurst();
    // Expiry
    var exp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    var v = document.getElementById('scrValidText');
    if (v) v.textContent = 'Valid until ' + exp.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' · Applied at checkout';
  }

  /* ── Confetti ────────────────────────────────────────────────── */
  function confettiBurst() {
    var colors = ['#c0647a', '#e8a0b0', '#c9a96e', '#f9e4e9', '#3b0d1a', '#fff', '#a04060'];
    var cx = window.innerWidth / 2, cy = window.innerHeight * 0.45;
    for (var i = 0; i < 70; i++) {
      var p = document.createElement('div');
      p.className = 'conf-piece';
      var w = 5 + Math.random() * 8, h2 = 5 + Math.random() * 8;
      var color = colors[Math.floor(Math.random() * colors.length)];
      var tx = (Math.random() - 0.5) * 500;
      var rot = Math.random() * 720;
      var dur = 0.9 + Math.random() * 1.3;
      var delay = Math.random() * 0.4;
      p.style.cssText = 'left:' + (cx + (Math.random() - 0.5) * 80) + 'px;top:' + cy + 'px;' +
        'width:' + w + 'px;height:' + h2 + 'px;background:' + color + ';' +
        'transform:translateX(' + tx + 'px) rotate(' + rot + 'deg);' +
        'animation-duration:' + dur + 's;animation-delay:' + delay + 's;';
      document.body.appendChild(p);
      setTimeout(function () { if (p.parentNode) p.parentNode.removeChild(p); }, (dur + delay) * 1000 + 100);
    }
  }

  /* ── Launch (public API) ─────────────────────────────────────── */
  function launch(options) {
    options = options || {};
    buildOverlay();

    var pool = options.rewardPool || DEFAULT_POOL;
    _currentReward = pickReward(pool);
    _onComplete    = options.onComplete || null;

    // Fill prize layer
    var icons = { fixed: '🎁', percent: '💝', delivery: '🚚' };
    var descs  = { fixed: 'Cash Discount', percent: 'Percent Off', delivery: 'Free Delivery' };
    document.getElementById('prizeIcon').textContent  = _currentReward.icon || icons[_currentReward.type];
    document.getElementById('prizeLabel').textContent = _currentReward.label;
    document.getElementById('prizeDesc').textContent  = descs[_currentReward.type];
    document.getElementById('prizeMin').textContent   =
      _currentReward.minOrder > 0
        ? 'On orders above ₹' + _currentReward.minOrder.toLocaleString('en-IN')
        : 'No minimum order required';

    // Reset
    var msg = document.getElementById('scrRevealMsg');
    var btn = document.getElementById('scrUseBtn');
    var hint= document.getElementById('scrHint');
    var prog= document.getElementById('scrProgFill');
    var canvas = document.getElementById('ah-scratch-canvas');
    if (msg) msg.style.display = 'none';
    if (btn) btn.style.display = 'none';
    if (hint) hint.style.opacity = '1';
    if (prog) prog.style.width = '0';
    if (canvas) { canvas.style.opacity = '1'; canvas.style.display = 'block'; }

    // Show overlay
    var overlay = document.getElementById('ah-scratch-overlay');
    overlay.style.display = 'flex';

    // Init canvas after visible
    requestAnimationFrame(function () { setTimeout(initCanvas, 50); });
  }

  /* ── Dismiss / Use ───────────────────────────────────────────── */
  window._scrDismiss = function () {
    var overlay = document.getElementById('ah-scratch-overlay');
    if (overlay) overlay.style.display = 'none';
    if (typeof _onComplete === 'function') _onComplete(_currentReward);
    // Save reward to localStorage
    if (_currentReward) {
      try {
        var exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('ah_reward', JSON.stringify({ reward: _currentReward, expiresAt: exp }));
      } catch (e) {}
    }
  };

  window._scrUseCoupon = function () {
    var overlay = document.getElementById('ah-scratch-overlay');
    if (overlay) overlay.style.display = 'none';
    if (_currentReward) {
      try {
        var exp = Date.now() + 30 * 24 * 60 * 60 * 1000;
        localStorage.setItem('ah_reward', JSON.stringify({ reward: _currentReward, expiresAt: exp, saved: true }));
      } catch (e) {}
    }
    if (typeof _onComplete === 'function') _onComplete(_currentReward);
  };

  /* ── Expose globally ─────────────────────────────────────────── */
  window.AH_launchScratchCard = launch;
  // Alias used by cart.html
  window.launchScratchCard = launch;

})();

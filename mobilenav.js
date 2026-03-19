/**
 * mobilenav.js — Aneesa Hampers
 * Mobile sidebar with DYNAMIC categories, new arrivals & best sellers from Firebase.
 * No QR code. Clean menu matching the screenshot design.
 */
(function () {

  /* ── page detection ─────────────────────────────────── */
  var path = location.pathname.split("/").pop() || "index.html";
  var isActive = function (pg) { return path === pg ? "mn-active" : ""; };

  /* ── cart count ─────────────────────────────────────── */
  function cartKey() {
    try { var u = JSON.parse(localStorage.getItem("ah_user") || "{}"); return u.uid ? "ah_cart_" + u.uid : "ah_cart_guest"; } catch (e) { return "ah_cart_guest"; }
  }
  function cartCount() {
    try { return JSON.parse(localStorage.getItem(cartKey()) || "[]").reduce(function (s, i) { return s + (i.qty || 1); }, 0); } catch (e) { return 0; }
  }

  /* ── user greeting ──────────────────────────────────── */
  function userGreeting() {
    try {
      var u = JSON.parse(localStorage.getItem("ah_user") || "{}");
      if (u && u.name) return { name: u.name, email: u.email || "", loggedIn: true };
    } catch (e) {}
    return { name: "", email: "", loggedIn: false };
  }

  /* ── inject CSS ─────────────────────────────────────── */
  var style = document.createElement("style");
  style.textContent = `
    #mn-ham {
      display: none;
      position: fixed; top: 14px; left: 14px; z-index: 8001;
      width: 44px; height: 44px;
      background: var(--burgundy, #3b0d1a);
      border: none; border-radius: 12px;
      flex-direction: column; align-items: center; justify-content: center; gap: 5px;
      cursor: pointer; box-shadow: 0 4px 18px rgba(59,13,26,.28); transition: background .2s;
    }
    #mn-ham span { display:block;width:20px;height:2px;background:white;border-radius:2px;transition:all .3s; }
    #mn-ham.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
    #mn-ham.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
    #mn-ham.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

    #mn-overlay {
      display:none; position:fixed; inset:0;
      background:rgba(20,4,10,.55); backdrop-filter:blur(4px);
      z-index:7999; opacity:0; transition:opacity .3s;
    }
    #mn-overlay.show { opacity:1; }

    #mn-sidebar {
      position:fixed; top:0; left:0; width:290px; height:100%;
      background:white;
      z-index:8000;
      display:flex; flex-direction:column;
      transform:translateX(-100%);
      transition:transform .35s cubic-bezier(.4,0,.2,1);
      overflow-y:auto; -webkit-overflow-scrolling:touch;
      box-shadow: 4px 0 24px rgba(59,13,26,.18);
    }
    #mn-sidebar.open { transform:translateX(0); }

    /* Header — dark burgundy */
    .mn-header {
      background: linear-gradient(150deg, #2d0a12 0%, #5a1528 100%);
      padding: 0;
      flex-shrink: 0;
      position: relative;
    }
    .mn-close-btn {
      position: absolute; top: 14px; right: 14px;
      width: 32px; height: 32px;
      background: rgba(255,255,255,.15); border: none; border-radius: 50%;
      color: white; font-size: .9rem; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: background .2s;
    }
    .mn-close-btn:hover { background: rgba(255,255,255,.25); }

    /* User block */
    .mn-user-block {
      padding: 28px 20px 22px;
    }
    .mn-user-av {
      width: 58px; height: 58px; border-radius: 50%;
      background: rgba(255,255,255,.18);
      border: 2px solid rgba(255,255,255,.3);
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700; color: white;
      margin-bottom: 12px;
    }
    .mn-hello { font-size: .78rem; color: rgba(255,255,255,.55); margin-bottom: 2px; }
    .mn-user-name { font-size: 1.35rem; font-weight: 700; color: white; margin-bottom: 8px; font-family: 'Jost', sans-serif; }
    .mn-signed-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2);
      border-radius: 20px; padding: 5px 14px;
      font-size: .72rem; color: rgba(255,255,255,.8); letter-spacing: .5px;
    }
    .mn-guest-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #c0647a; border: none; border-radius: 20px;
      padding: 7px 18px; font-size: .72rem; color: white;
      letter-spacing: 1px; text-transform: uppercase;
      text-decoration: none; font-family: 'Jost', sans-serif; font-weight: 600;
      transition: background .2s;
    }
    .mn-guest-btn:hover { background: #a0506a; }

    /* Section labels */
    .mn-section-lbl {
      font-size: .58rem; letter-spacing: 3px; text-transform: uppercase;
      color: rgba(59,13,26,.3); padding: 16px 20px 4px;
      font-family: 'Jost', sans-serif;
    }

    /* Nav links */
    .mn-link {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 20px; text-decoration: none;
      color: rgba(59,13,26,.65); font-family: 'Jost', sans-serif;
      font-size: .88rem; font-weight: 400;
      border-left: 3px solid transparent;
      transition: all .18s; position: relative;
    }
    .mn-link:hover { color: #c0647a; background: rgba(192,100,122,.06); border-left-color: rgba(192,100,122,.3); }
    .mn-link.mn-active { color: #c0647a; background: rgba(192,100,122,.08); border-left-color: #c0647a; font-weight: 600; }
    .mn-icon { font-size: 1.15rem; width: 24px; text-align: center; flex-shrink: 0; }
    .mn-badge {
      margin-left: auto; background: #c0647a; color: white;
      font-size: .6rem; font-weight: 700; padding: 2px 8px;
      border-radius: 20px; min-width: 20px; text-align: center;
    }
    .mn-badge.mn-badge-new { background: #c0647a; }
    .mn-badge.mn-badge-green { background: #2d7a4f; }

    /* Expandable categories */
    .mn-cat-toggle {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 20px; color: rgba(59,13,26,.65);
      font-family: 'Jost', sans-serif; font-size: .88rem;
      cursor: pointer; border-left: 3px solid transparent;
      transition: all .18s; user-select: none;
    }
    .mn-cat-toggle:hover { color: #c0647a; background: rgba(192,100,122,.06); border-left-color: rgba(192,100,122,.3); }
    .mn-cat-arrow { margin-left: auto; font-size: .7rem; opacity: .4; transition: transform .25s; }
    .mn-cat-arrow.open { transform: rotate(90deg); }
    .mn-cat-list { display: none; background: rgba(192,100,122,.04); }
    .mn-cat-list.open { display: block; }
    .mn-cat-item {
      display: flex; align-items: center; gap: 12px;
      padding: 11px 20px 11px 56px; text-decoration: none;
      color: rgba(59,13,26,.55); font-family: 'Jost', sans-serif;
      font-size: .82rem; transition: all .15s;
      border-left: 3px solid transparent;
    }
    .mn-cat-item:hover { color: #c0647a; background: rgba(192,100,122,.06); border-left-color: rgba(192,100,122,.25); }
    .mn-cat-loading { padding: 10px 56px; font-size: .76rem; opacity: .35; font-family: 'Jost', sans-serif; }

    /* Footer */
    .mn-footer {
      padding: 14px 16px calc(20px + env(safe-area-inset-bottom, 0px));
      border-top: 1px solid rgba(192,100,122,.1);
      display: flex; flex-direction: column; gap: 9px; flex-shrink: 0; margin-top: auto;
    }
    .mn-wa-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 13px; background: #25D366; color: white; border-radius: 12px;
      text-decoration: none; font-family: 'Jost', sans-serif;
      font-size: .74rem; letter-spacing: 1.5px; text-transform: uppercase;
      font-weight: 600; transition: opacity .2s;
    }
    .mn-wa-btn:hover { opacity: .88; }
    .mn-logout-btn {
      display: none; align-items: center; justify-content: center; gap: 6px;
      padding: 11px; background: rgba(59,13,26,.06); color: rgba(59,13,26,.45);
      border: 1px solid rgba(59,13,26,.12); border-radius: 10px;
      font-family: 'Jost', sans-serif; font-size: .72rem;
      letter-spacing: 1.5px; text-transform: uppercase;
      cursor: pointer; transition: all .2s; width: 100%;
    }
    .mn-logout-btn:hover { background: #fde8e8; color: #e05050; border-color: rgba(224,80,80,.2); }

    @media (min-width: 901px) { #mn-ham, #mn-overlay, #mn-sidebar { display: none !important; } }
    @media (max-width: 900px) { #mn-ham { display: flex; } }
  `;
  document.head.appendChild(style);

  /* ── build HTML ─────────────────────────────────────── */
  var user = userGreeting();
  var cc   = cartCount();

  // User block HTML
  var userBlockHtml = user.loggedIn
    ? `<div class="mn-user-block">
        <div class="mn-user-av">${user.name.charAt(0).toUpperCase()}</div>
        <div class="mn-hello">Hello,</div>
        <div class="mn-user-name">${user.name}</div>
        <div class="mn-signed-badge">✓ Signed In</div>
       </div>`
    : `<div class="mn-user-block">
        <div class="mn-user-av">👤</div>
        <div class="mn-hello">Welcome!</div>
        <div class="mn-user-name">Guest</div>
        <a href="login.html" class="mn-guest-btn">🔑 Sign In</a>
       </div>`;

  var sidebarHTML = `
    <button id="mn-ham" aria-label="Menu" onclick="mnToggle()">
      <span></span><span></span><span></span>
    </button>
    <div id="mn-overlay" onclick="mnClose()"></div>
    <div id="mn-sidebar">

      <!-- HEADER with user -->
      <div class="mn-header">
        <button class="mn-close-btn" onclick="mnClose()">✕</button>
        ${userBlockHtml}
      </div>

      <!-- NAV -->
      <nav class="mn-nav" style="flex:1">
        <div class="mn-section-lbl">Menu</div>

        <a href="index.html" class="mn-link ${isActive("index.html")}">
          <span class="mn-icon">🏠</span> Home
        </a>

        <!-- CATEGORIES — dynamic from Firebase -->
        <div class="mn-cat-toggle" onclick="mnToggleCats()">
          <span class="mn-icon">🎁</span>
          <span>Categories</span>
          <span class="mn-cat-arrow" id="mnCatArrow">▶</span>
        </div>
        <div class="mn-cat-list" id="mnCatList">
          <div class="mn-cat-loading" id="mnCatLoading">Loading…</div>
        </div>

        <!-- NEW ARRIVALS — products with badge="new" or added in last 30 days -->
        <a href="products.html?filter=new" class="mn-link ${path.includes("products") && location.search.includes("filter=new") ? "mn-active" : ""}">
          <span class="mn-icon">✨</span> New Arrivals
          <span class="mn-badge mn-badge-new" id="mnNewBadge" style="display:none">New</span>
        </a>

        <!-- BEST SELLERS — products with most orders -->
        <a href="products.html?filter=bestseller" class="mn-link ${path.includes("products") && location.search.includes("filter=bestseller") ? "mn-active" : ""}">
          <span class="mn-icon">⭐</span> Best Sellers
        </a>

        <!-- OFFERS -->
        <a href="products.html?filter=offers" class="mn-link">
          <span class="mn-icon">⚡</span> Offers &amp; Deals
          <span class="mn-badge" id="mnOfferBadge" style="display:none;background:#c07830"></span>
        </a>

        <div class="mn-section-lbl">My Account</div>

        ${user.loggedIn
          ? `<a href="account.html" class="mn-link ${isActive("account.html")}">
               <span class="mn-icon">👤</span> My Profile
             </a>
             <a href="orders.html" class="mn-link ${isActive("orders.html")}">
               <span class="mn-icon">📦</span> My Orders
             </a>`
          : `<a href="login.html" class="mn-link ${isActive("login.html")}">
               <span class="mn-icon">🔑</span> Sign In / Register
             </a>`
        }
        <a href="cart.html" class="mn-link ${isActive("cart.html")}">
          <span class="mn-icon">🛒</span> Cart
          ${cc > 0 ? '<span class="mn-badge">' + cc + '</span>' : ''}
        </a>


        <div class="mn-section-lbl">Support</div>
        <a href="https://wa.me/918639066613" target="_blank" class="mn-link">
          <span class="mn-icon">💬</span> WhatsApp Us
        </a>
      </nav>

      <!-- FOOTER -->
      <div class="mn-footer">
        <a href="https://wa.me/918639066613?text=Hi%20Aneesa%20Hampers!%20I%20want%20to%20order%20a%20hamper%20%F0%9F%8E%81"
           target="_blank" class="mn-wa-btn">💬 Order on WhatsApp</a>
        <button class="mn-logout-btn" id="mnLogoutBtn" onclick="mnLogout()">🔒 Sign Out</button>
      </div>

    </div>
  `;

  var container = document.createElement("div");
  container.innerHTML = sidebarHTML;
  document.body.appendChild(container);

  // Show logout if logged in
  if (user.loggedIn) {
    var lb = document.getElementById("mnLogoutBtn");
    if (lb) lb.style.display = "flex";
  }

  /* ── SIDEBAR OPEN / CLOSE ──────────────────────────── */
  var _open = false;
  window.mnToggle = function () { _open ? mnClose() : mnOpen(); };
  window.mnOpen = function () {
    _open = true;
    document.getElementById("mn-ham").classList.add("open");
    document.getElementById("mn-sidebar").classList.add("open");
    var ov = document.getElementById("mn-overlay");
    ov.style.display = "block";
    setTimeout(function () { ov.classList.add("show"); }, 10);
    document.body.style.overflow = "hidden";
    // Load dynamic data when sidebar opens
    _loadDynamicData();
  };
  window.mnClose = function () {
    _open = false;
    document.getElementById("mn-ham").classList.remove("open");
    document.getElementById("mn-sidebar").classList.remove("open");
    var ov = document.getElementById("mn-overlay");
    ov.classList.remove("show");
    setTimeout(function () { ov.style.display = "none"; }, 300);
    document.body.style.overflow = "";
  };

  /* ── CATEGORIES TOGGLE ──────────────────────────────── */
  var _catsLoaded = false;
  window.mnToggleCats = function () {
    var list  = document.getElementById("mnCatList");
    var arrow = document.getElementById("mnCatArrow");
    if (!list) return;
    var isOpen = list.classList.contains("open");
    if (isOpen) {
      list.classList.remove("open");
      if (arrow) arrow.classList.remove("open");
    } else {
      list.classList.add("open");
      if (arrow) arrow.classList.add("open");
    }
  };

  /* ── LOAD DYNAMIC DATA FROM FIREBASE ───────────────── */
  var _dataLoaded = false;
  function _loadDynamicData() {
    if (_dataLoaded) return;
    _dataLoaded = true;

    // Load Firebase SDK dynamically
    Promise.all([
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js")
    ]).then(function (mods) {
      var initializeApp  = mods[0].initializeApp;
      var getFirestore   = mods[1].getFirestore;
      var collection     = mods[1].collection;
      var query          = mods[1].query;
      var getDocs        = mods[1].getDocs;
      var orderBy        = mods[1].orderBy;
      var where          = mods[1].where;
      var doc            = mods[1].doc;
      var getDoc         = mods[1].getDoc;

      // Reuse existing Firebase app if already initialised on the page
      var app, db;
      try {
        app = initializeApp({
          apiKey:            "AIzaSyCT98OpXIDMCHEiZl6PRrQ6GDziOo2hnTM",
          authDomain:        "aneesa-hampers.firebaseapp.com",
          projectId:         "aneesa-hampers",
          storageBucket:     "aneesa-hampers.firebasestorage.app",
          messagingSenderId: "909653560410",
          appId:             "1:909653560410:web:397db4fec2d9f042609c63"
        }, "mobilenav");
        db = getFirestore(app);
      } catch (e) {
        // App already initialised — get existing instance
        try {
          var firebase = mods[0];
          app = firebase.getApp ? firebase.getApp("mobilenav") : null;
          if (app) db = getFirestore(app);
        } catch (e2) { return; }
      }
      if (!db) return;

      // ── 1. Load Categories ──
      getDocs(query(collection(db, "categories"), orderBy("order", "asc")))
        .then(function (snap) {
          var cats = snap.docs
            .map(function (d) { return Object.assign({ id: d.id }, d.data()); })
            .filter(function (c) { return c.visible !== false; });

          var catList  = document.getElementById("mnCatList");
          var catLoad  = document.getElementById("mnCatLoading");
          if (!catList) return;
          if (catLoad) catLoad.remove();

          if (!cats.length) {
            catList.innerHTML = '<div class="mn-cat-loading">No categories yet</div>';
            return;
          }

          catList.innerHTML = cats.map(function (c) {
            var imgHtml = c.coverImage
              ? '<img src="' + c.coverImage + '" style="width:22px;height:22px;border-radius:4px;object-fit:cover;flex-shrink:0;" alt=""/>'
              : '<span style="font-size:1rem;width:22px;text-align:center;flex-shrink:0;">' + (c.emoji || "🎁") + '</span>';
            return '<a href="products.html?category=' + encodeURIComponent(c.slug || c.id) + '" class="mn-cat-item" onclick="mnClose()">'
              + imgHtml
              + '<span>' + c.name + '</span>'
              + '</a>';
          }).join("");
        })
        .catch(function () {
          var catLoad = document.getElementById("mnCatLoading");
          if (catLoad) catLoad.textContent = "Could not load categories";
        });

      // ── 2. Load Products — New Arrivals + Best Sellers ──
      getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")))
        .then(function (snap) {
          var products = snap.docs.map(function (d) { return Object.assign({ id: d.id }, d.data()); });

          // NEW ARRIVALS — badge="new" OR added within last 30 days
          var thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
          var newProducts = products.filter(function (p) {
            if (p.badge === "new") return true;
            var createdAt = p.createdAt;
            if (!createdAt) return false;
            var ts = createdAt.toDate ? createdAt.toDate().getTime() : (typeof createdAt === "number" ? createdAt : 0);
            return ts > thirtyDaysAgo;
          });

          var newBadge = document.getElementById("mnNewBadge");
          if (newBadge && newProducts.length > 0) {
            newBadge.style.display = "inline-block";
            newBadge.textContent   = newProducts.length;
          }
        })
        .catch(function () {});

      // ── 3. Best Sellers — based on order count ──
      // Count how many times each product appears in orders
      getDocs(collection(db, "orders"))
        .then(function (snap) {
          var counts = {};
          snap.docs.forEach(function (d) {
            var items = d.data().items || [];
            items.forEach(function (item) {
              if (item.id) counts[item.id] = (counts[item.id] || 0) + (item.qty || 1);
            });
          });
          // Store for products.html to use
          try { localStorage.setItem("ah_bestseller_counts", JSON.stringify(counts)); } catch (e) {}
        })
        .catch(function () {});

      // ── 4. Flash Sale badge ──
      getDoc(doc(db, "siteSettings", "config"))
        .then(function (snap) {
          if (!snap.exists()) return;
          var cfg = snap.data();
          if (cfg.flashSale && cfg.flashSale.active && cfg.flashSale.discount > 0) {
            var badge = document.getElementById("mnOfferBadge");
            if (badge) {
              badge.style.display = "inline-block";
              badge.textContent   = cfg.flashSale.discount + "% OFF";
            }
          }
        })
        .catch(function () {});

    }).catch(function (e) {
      console.warn("mobilenav: Firebase load error", e);
    });
  }

  /* ── LOGOUT ─────────────────────────────────────────── */
  window.mnLogout = async function () {
    if (!confirm("Sign out of your account?")) return;
    try { if (window._firebaseAuth) await window._firebaseAuth.signOut(); } catch (e) {}
    Object.keys(localStorage).filter(function (k) { return k.startsWith("ah_"); }).forEach(function (k) { localStorage.removeItem(k); });
    window.location.href = "login.html";
  };

  /* ── SWIPE TO CLOSE ─────────────────────────────────── */
  var _tx = null;
  document.addEventListener("touchstart", function (e) { _tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (_tx === null) return;
    var dx = e.changedTouches[0].clientX - _tx;
    _tx = null;
    if (_open && dx < -60) mnClose();
    if (!_open && dx > 60 && e.changedTouches[0].clientX < 40) mnOpen();
  }, { passive: true });

  /* ── ESC key ────────────────────────────────────────── */
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && _open) mnClose(); });

})();

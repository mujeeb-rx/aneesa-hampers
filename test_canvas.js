/**
 * test_canvas.js — Canvas & Feature Test Utility
 * Aneesa Hampers · Development diagnostics
 *
 * Used to test:
 * - Canvas scratch card rendering
 * - Firebase connectivity
 * - localStorage read/write
 * - Network/CORS checks
 */

(function () {
  'use strict';

  /* ── Canvas test ─────────────────────────────────────────────── */
  function testCanvas() {
    var canvas = document.createElement('canvas');
    canvas.width  = 100;
    canvas.height = 100;
    var ctx = canvas.getContext('2d');
    if (!ctx) { console.error('❌ Canvas 2D context not supported'); return false; }

    // Draw test gradient
    var grad = ctx.createLinearGradient(0, 0, 100, 100);
    grad.addColorStop(0, '#c0647a');
    grad.addColorStop(1, '#3b0d1a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 100, 100);

    // Test composite mode (needed for scratch card)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(50, 50, 20, 0, Math.PI * 2);
    ctx.fill();

    // Verify pixel was erased
    var px = ctx.getImageData(50, 50, 1, 1).data;
    var erased = px[3] === 0;
    console.log(erased
      ? '✅ Canvas: destination-out compositing works correctly'
      : '❌ Canvas: destination-out compositing may not work in this browser'
    );
    return erased;
  }

  /* ── LocalStorage test ───────────────────────────────────────── */
  function testLocalStorage() {
    try {
      var key = '__ah_test__';
      localStorage.setItem(key, '1');
      var ok = localStorage.getItem(key) === '1';
      localStorage.removeItem(key);
      console.log(ok ? '✅ localStorage: OK' : '❌ localStorage: read/write failed');
      return ok;
    } catch (e) {
      console.error('❌ localStorage: not available —', e.message);
      return false;
    }
  }

  /* ── SessionStorage test ─────────────────────────────────────── */
  function testSessionStorage() {
    try {
      var key = '__ah_sess_test__';
      sessionStorage.setItem(key, '1');
      var ok = sessionStorage.getItem(key) === '1';
      sessionStorage.removeItem(key);
      console.log(ok ? '✅ sessionStorage: OK' : '❌ sessionStorage: read/write failed');
      return ok;
    } catch (e) {
      console.error('❌ sessionStorage: not available —', e.message);
      return false;
    }
  }

  /* ── Firebase connectivity test ──────────────────────────────── */
  async function testFirebase() {
    var firebase = window._ahFirebase;
    if (!firebase || !firebase.db) {
      console.warn('⚠️ Firebase: window._ahFirebase not set (firebase.js may not be loaded)');
      return false;
    }
    try {
      var { getDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      var snap = await getDoc(doc(firebase.db, 'siteSettings', 'config'));
      console.log('✅ Firebase Firestore: Connected —', snap.exists() ? 'config doc exists' : 'config doc missing');
      return true;
    } catch (e) {
      console.error('❌ Firebase Firestore: Connection failed —', e.message);
      return false;
    }
  }

  /* ── Network fetch test ──────────────────────────────────────── */
  async function testNetwork() {
    try {
      var res = await fetch('https://www.googleapis.com/favicon.ico', { method: 'HEAD', mode: 'no-cors' });
      console.log('✅ Network: fetch() works');
      return true;
    } catch (e) {
      console.error('❌ Network: fetch() failed —', e.message);
      return false;
    }
  }

  /* ── Render debug info overlay ───────────────────────────────── */
  function renderDebugOverlay() {
    var el = document.getElementById('ah-debug-overlay');
    if (!el) return;

    var ua = navigator.userAgent;
    var isMobile = /Mobi|Android|iPhone|iPad/.test(ua);
    var hasTouch  = 'ontouchstart' in window;

    el.innerHTML =
      '<div style="font-family:monospace;font-size:.78rem;line-height:1.8;padding:12px;">' +
        '<strong style="font-size:.9rem">🔧 Aneesa Hampers — Debug Info</strong><br/>' +
        '<hr style="margin:6px 0;border:none;border-top:1px solid rgba(192,100,122,.2)"/>' +
        'Page:    <strong>' + location.pathname + '</strong><br/>' +
        'Mobile:  ' + (isMobile ? '✅ Yes' : '❌ No') + '<br/>' +
        'Touch:   ' + (hasTouch ? '✅ Yes' : '❌ No') + '<br/>' +
        'Screen:  ' + window.innerWidth + 'px × ' + window.innerHeight + 'px<br/>' +
        'Lang:    ' + navigator.language + '<br/>' +
        'Online:  ' + (navigator.onLine ? '✅ Online' : '❌ Offline') + '<br/>' +
        'Canvas:  <span id="dbg-canvas">Checking…</span><br/>' +
        'Storage: <span id="dbg-storage">Checking…</span><br/>' +
        'Firebase:<span id="dbg-firebase">Checking…</span><br/>' +
      '</div>';

    // Async checks
    Promise.resolve().then(function () {
      var cv = testCanvas();
      var el2 = document.getElementById('dbg-canvas');
      if (el2) el2.textContent = cv ? '✅ OK' : '❌ Failed';
    });
    Promise.resolve().then(function () {
      var ls = testLocalStorage();
      var el2 = document.getElementById('dbg-storage');
      if (el2) el2.textContent = ls ? '✅ OK' : '❌ Failed';
    });
    testFirebase().then(function (ok) {
      var el2 = document.getElementById('dbg-firebase');
      if (el2) el2.textContent = ok ? '✅ Connected' : '❌ Not connected';
    });
  }

  /* ── Run all tests ───────────────────────────────────────────── */
  async function runAll() {
    console.group('🔧 Aneesa Hampers — Diagnostics');
    console.log('Page:', location.href);
    console.log('Browser:', navigator.userAgent);
    testCanvas();
    testLocalStorage();
    testSessionStorage();
    await testFirebase();
    await testNetwork();
    renderDebugOverlay();
    console.groupEnd();
  }

  /* ── Expose globally ─────────────────────────────────────────── */
  window.AH_Test = {
    runAll:           runAll,
    canvas:           testCanvas,
    localStorage:     testLocalStorage,
    sessionStorage:   testSessionStorage,
    firebase:         testFirebase,
    network:          testNetwork
  };

  // Auto-run if URL contains ?debug=1
  if (location.search.indexOf('debug=1') !== -1) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', runAll);
    } else {
      runAll();
    }
  }
})();

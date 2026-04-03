/**
 * lang-currency.js — Language & Currency Switcher
 * Aneesa Hampers · Shared across all pages
 *
 * Handles:
 * - Reading saved language (ah_lang) from localStorage
 * - Reading saved currency (ah_prefs) from localStorage
 * - Converting all price elements with data-inr attribute
 * - Exposing AH_applyLang() and AH_applyCurrency() globally
 */

(function () {
  'use strict';

  /* ── Exchange rates (base: INR) ──────────────────────────────── */
  var RATES = {
    INR: 1,
    USD: 0.012,
    GBP: 0.0095,
    AED: 0.044,
    SAR: 0.045,
    QAR: 0.044,
    KWD: 0.0037,
    BHD: 0.0045,
    OMR: 0.0046,
    CAD: 0.016,
    AUD: 0.018,
    SGD: 0.016,
    MYR: 0.056,
    EUR: 0.011,
    JPY: 1.79,
    CNY: 0.087,
    KRW: 16.1,
    PKR: 3.34,
    BDT: 1.31,
    LKR: 3.72,
    NPR: 1.60,
    NZD: 0.020,
    ZAR: 0.22
  };

  /* ── Currency symbols ─────────────────────────────────────────── */
  var SYMBOLS = {
    INR: '₹', USD: '$', GBP: '£', AED: 'د.إ', SAR: '﷼',
    QAR: '﷼', KWD: 'KD', BHD: 'BD', OMR: 'R.O.', CAD: 'CA$',
    AUD: 'A$', SGD: 'S$', MYR: 'RM', EUR: '€', JPY: '¥',
    CNY: '¥', KRW: '₩', PKR: '₨', BDT: '৳', LKR: 'Rs',
    NPR: 'Rs', NZD: 'NZ$', ZAR: 'R'
  };

  /* ── Apply currency conversion ───────────────────────────────── */
  function applyCurrency(currency) {
    if (!currency || !RATES[currency]) currency = 'INR';
    var rate   = RATES[currency];
    var symbol = SYMBOLS[currency] || currency;

    // Convert elements with data-inr (original INR price stored as attribute)
    document.querySelectorAll('[data-inr]').forEach(function (el) {
      var inr = parseFloat(el.getAttribute('data-inr')) || 0;
      var converted = inr * rate;
      var formatted;
      if (currency === 'INR') {
        formatted = '₹' + Math.round(converted).toLocaleString('en-IN');
      } else if (currency === 'JPY' || currency === 'KRW' || currency === 'IDR') {
        formatted = symbol + Math.round(converted).toLocaleString();
      } else {
        formatted = symbol + converted.toFixed(2);
      }
      el.textContent = formatted;
    });

    // Save to prefs
    try {
      var prefs = JSON.parse(localStorage.getItem('ah_prefs') || '{}');
      prefs.currency = currency;
      prefs.savedAt  = Date.now();
      localStorage.setItem('ah_prefs', JSON.stringify(prefs));
    } catch (e) {}
  }

  /* ── Re-apply currency (called after DOM updates) ────────────── */
  function reapplyCurrency() {
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('ah_prefs') || '{}'); } catch (e) {}
    if (prefs.currency && prefs.currency !== 'INR') {
      applyCurrency(prefs.currency);
    }
  }

  /* ── Basic UI translations ───────────────────────────────────── */
  var TRANSLATIONS = {
    en: {},
    hi: {
      'Shop Now 🎁': 'अभी खरीदें 🎁',
      'View Collections': 'संग्रह देखें',
      'Add to Cart': 'कार्ट में जोड़ें',
      'Buy Now': 'अभी खरीदें',
      'My Account': 'मेरा खाता',
      'My Orders': 'मेरे ऑर्डर'
    },
    te: {
      'Shop Now 🎁': 'ఇప్పుడే కొనండి 🎁',
      'View Collections': 'సేకరణలు చూడండి',
      'Add to Cart': 'కార్ట్‌కు జోడించండి',
      'Buy Now': 'ఇప్పుడే కొనండి',
      'My Account': 'నా ఖాతా',
      'My Orders': 'నా ఆర్డర్లు'
    },
    ar: {
      'Shop Now 🎁': 'تسوق الآن 🎁',
      'View Collections': 'عرض المجموعات',
      'Add to Cart': 'أضف إلى السلة',
      'Buy Now': 'اشتري الآن',
      'My Account': 'حسابي',
      'My Orders': 'طلباتي'
    }
  };

  function applyLang(code) {
    var dict = TRANSLATIONS[code];
    if (!dict || Object.keys(dict).length === 0) {
      // Reset dir for RTL languages
      document.documentElement.dir = (code === 'ar' || code === 'ur') ? 'rtl' : 'ltr';
      return;
    }
    document.documentElement.dir = (code === 'ar' || code === 'ur') ? 'rtl' : 'ltr';
    // Translate simple text nodes (shallow pass — won't break event listeners)
    document.querySelectorAll('a, button, .btn-solid, .btn-outline').forEach(function (el) {
      var text = el.textContent.trim();
      if (dict[text]) el.textContent = dict[text];
    });
  }

  /* ── Init: load saved prefs on page load ─────────────────────── */
  function init() {
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('ah_prefs') || '{}'); } catch (e) {}
    var lang     = localStorage.getItem('ah_lang') || prefs.lang || 'en';
    var currency = prefs.currency || 'INR';

    if (lang && lang !== 'en')     applyLang(lang);
    if (currency && currency !== 'INR') applyCurrency(currency);
  }

  /* ── Expose globally ─────────────────────────────────────────── */
  window.AH_applyLang      = applyLang;
  window.AH_applyCurrency  = applyCurrency;
  window.AH_reapplyCurrency = reapplyCurrency;

  /* ── Run on DOM ready ────────────────────────────────────────── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

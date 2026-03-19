/**
 * lang-currency.js — Aneesa Hampers
 * Live language translation + currency conversion on every page.
 * Include at end of <body> on all pages.
 */
(function () {

  // ── Exchange rates cache ──────────────────────────────
  var RATES    = null;
  var RATES_TS = 0;
  var RATES_TTL = 3600000; // 1 hour cache

  // ── Currency symbols & formatting ────────────────────
  var CURRENCY_META = {
    INR: { symbol: '₹',  locale: 'en-IN', name: 'Indian Rupee' },
    USD: { symbol: '$',  locale: 'en-US', name: 'US Dollar' },
    GBP: { symbol: '£',  locale: 'en-GB', name: 'British Pound' },
    AED: { symbol: 'د.إ', locale: 'ar-AE', name: 'UAE Dirham' },
    SAR: { symbol: '﷼',  locale: 'ar-SA', name: 'Saudi Riyal' },
    QAR: { symbol: 'QR', locale: 'ar-QA', name: 'Qatari Riyal' },
    KWD: { symbol: 'KD', locale: 'ar-KW', name: 'Kuwaiti Dinar' },
    BHD: { symbol: 'BD', locale: 'ar-BH', name: 'Bahraini Dinar' },
    OMR: { symbol: 'RO', locale: 'ar-OM', name: 'Omani Rial' },
    CAD: { symbol: 'C$', locale: 'en-CA', name: 'Canadian Dollar' },
    AUD: { symbol: 'A$', locale: 'en-AU', name: 'Australian Dollar' },
    SGD: { symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
    MYR: { symbol: 'RM', locale: 'ms-MY', name: 'Malaysian Ringgit' },
    EUR: { symbol: '€',  locale: 'de-DE', name: 'Euro' },
    JPY: { symbol: '¥',  locale: 'ja-JP', name: 'Japanese Yen' },
    CNY: { symbol: '¥',  locale: 'zh-CN', name: 'Chinese Yuan' },
    KRW: { symbol: '₩',  locale: 'ko-KR', name: 'Korean Won' },
    NZD: { symbol: 'NZ$',locale: 'en-NZ', name: 'New Zealand Dollar' },
    ZAR: { symbol: 'R',  locale: 'en-ZA', name: 'South African Rand' },
  };

  // ── Language map for Google Translate ────────────────
  var LANG_MAP = {
    en:'en', hi:'hi', te:'te', ta:'ta', ar:'ar', ur:'ur',
    fr:'fr', de:'de', es:'es', zh:'zh-CN', ja:'ja', ko:'ko',
    ms:'ms', ml:'ml', bn:'bn', pt:'pt'
  };

  // ── Read saved preferences ────────────────────────────
  function getPrefs() {
    try { return JSON.parse(localStorage.getItem('ah_prefs') || '{}'); } catch(e) { return {}; }
  }

  // ── Fetch live exchange rates (free API, no key needed) ──
  async function fetchRates() {
    var now = Date.now();
    if (RATES && (now - RATES_TS) < RATES_TTL) return RATES;
    try {
      var cached = JSON.parse(localStorage.getItem('ah_rates') || 'null');
      if (cached && cached.ts && (now - cached.ts) < RATES_TTL) {
        RATES = cached.rates; RATES_TS = cached.ts;
        return RATES;
      }
      // Free API — no key needed
      var res  = await fetch('https://api.frankfurter.app/latest?from=INR');
      var data = await res.json();
      if (data && data.rates) {
        data.rates['INR'] = 1; // base is INR
        RATES    = data.rates;
        RATES_TS = now;
        localStorage.setItem('ah_rates', JSON.stringify({ rates: RATES, ts: now }));
        return RATES;
      }
    } catch(e) {
      // Fallback rates if API fails
      RATES = {
        INR:1, USD:0.012, GBP:0.0095, AED:0.044, SAR:0.045,
        EUR:0.011, JPY:1.78, CAD:0.016, AUD:0.018, SGD:0.016,
        MYR:0.053, KWD:0.0037, QAR:0.044, NZD:0.019, ZAR:0.22,
        CNY:0.087, KRW:16.1
      };
      RATES_TS = now;
    }
    return RATES;
  }

  // ── Convert INR amount to selected currency ───────────
  function convertAmount(inrAmount, currency, rates) {
    if (!currency || currency === 'INR') return inrAmount;
    var rate = rates[currency];
    if (!rate) return inrAmount;
    return inrAmount * rate;
  }

  // ── Format amount with currency symbol ───────────────
  function formatAmount(amount, currency) {
    var meta = CURRENCY_META[currency] || CURRENCY_META['INR'];
    try {
      // Use Intl for proper formatting
      var formatted = new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2,
        maximumFractionDigits: currency === 'JPY' || currency === 'KRW' ? 0 : 2
      }).format(amount);
      return formatted;
    } catch(e) {
      return meta.symbol + amount.toFixed(2);
    }
  }

  // ── Update all prices on the page ────────────────────
  async function updateAllPrices(currency) {
    if (!currency || currency === 'INR') {
      // Restore original INR prices
      document.querySelectorAll('[data-inr]').forEach(function(el) {
        el.textContent = '₹' + Number(el.dataset.inr).toLocaleString('en-IN');
      });
      return;
    }

    var rates = await fetchRates();
    if (!rates) return;

    document.querySelectorAll('[data-inr]').forEach(function(el) {
      var inr    = Number(el.dataset.inr);
      var converted = convertAmount(inr, currency, rates);
      el.textContent = formatAmount(converted, currency);
    });
  }

  // ── Tag all price elements with data-inr ─────────────
  function tagPriceElements() {
    // Match ₹ followed by numbers (with commas)
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    var nodes = [];
    var node;
    while ((node = walker.nextNode())) {
      if (/₹[\d,]+/.test(node.textContent)) {
        nodes.push(node);
      }
    }

    nodes.forEach(function(textNode) {
      var match = textNode.textContent.match(/₹([\d,]+)/);
      if (!match) return;
      var inrValue = parseInt(match[1].replace(/,/g, ''));
      if (!inrValue || inrValue <= 0) return;
      var parent = textNode.parentElement;
      if (!parent) return;
      // Only wrap if parent doesn't already have data-inr
      if (parent.dataset && !parent.dataset.inr) {
        parent.dataset.inr = inrValue;
      }
    });
  }

  // ── Apply Google Translate ────────────────────────────
  function applyLanguage(langCode) {
    if (!langCode || langCode === 'en') {
      // Remove any existing translate cookie and restore
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=' + location.hostname;
      // Remove translate banner if present
      var bar = document.getElementById(':1.container') || document.querySelector('.goog-te-banner-frame');
      if (bar) bar.style.display = 'none';
      return;
    }

    var gtLang = LANG_MAP[langCode] || langCode;

    // Set Google Translate cookie
    document.cookie = 'googtrans=/en/' + gtLang + '; path=/;';
    document.cookie = 'googtrans=/en/' + gtLang + '; path=/; domain=' + location.hostname;

    // If translate element already loaded, trigger it
    if (window.google && window.google.translate) {
      try {
        var sel = document.querySelector('.goog-te-combo');
        if (sel) { sel.value = gtLang; sel.dispatchEvent(new Event('change')); }
      } catch(e) {}
    }
  }

  // ── Load Google Translate script ─────────────────────
  function loadGoogleTranslate() {
    if (document.getElementById('gtScript')) return;
    window.googleTranslateElementInit = function() {
      try {
        new google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: Object.values(LANG_MAP).join(',')
        }, 'googleTranslateElement');
      } catch(e) {}
    };
    var s = document.createElement('script');
    s.id  = 'gtScript';
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    s.async = true;
    document.head.appendChild(s);

    // Hidden container for Google Translate widget
    var div = document.createElement('div');
    div.id    = 'googleTranslateElement';
    div.style = 'display:none!important;position:absolute;top:-9999px';
    document.body.appendChild(div);
  }

  // ── Init on page load ─────────────────────────────────
  function init() {
    var prefs    = getPrefs();
    var currency = prefs.currency || 'INR';
    var lang     = prefs.lang     || localStorage.getItem('ah_lang') || 'en';

    // Apply language
    if (lang && lang !== 'en') {
      loadGoogleTranslate();
      // Small delay to let translate script load
      setTimeout(function() { applyLanguage(lang); }, 800);
    }

    // Tag prices then convert
    setTimeout(function() {
      tagPriceElements();
      if (currency && currency !== 'INR') {
        updateAllPrices(currency);
      }
    }, 600);
  }

  // ── Public API — called from account.html when user saves ──
  // Called after dynamic content (products) renders on page
  window.AH_reapplyCurrency = async function() {
    var prefs    = getPrefs();
    var currency = prefs.currency || 'INR';
    if (currency === 'INR') return;
    tagPriceElements();
    await updateAllPrices(currency);
  };

  window.AH_applyLang = function(langCode) {
    var prefs = getPrefs();
    prefs.lang = langCode;
    localStorage.setItem('ah_prefs', JSON.stringify(prefs));
    localStorage.setItem('ah_lang', langCode);
    loadGoogleTranslate();
    setTimeout(function() { applyLanguage(langCode); }, 300);
  };

  window.AH_applyCurrency = async function(currency) {
    var prefs = getPrefs();
    prefs.currency = currency;
    localStorage.setItem('ah_prefs', JSON.stringify(prefs));
    tagPriceElements();
    await updateAllPrices(currency);

    // Show currency indicator
    var indicator = document.getElementById('ah-currency-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'ah-currency-indicator';
      indicator.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);' +
        'background:#3b0d1a;color:white;padding:8px 20px;border-radius:20px;font-size:.75rem;' +
        'font-family:Jost,sans-serif;z-index:9999;pointer-events:none;transition:opacity .4s;letter-spacing:1px;';
      document.body.appendChild(indicator);
    }
    var meta = CURRENCY_META[currency] || {};
    indicator.textContent = 'Prices shown in ' + (meta.name || currency);
    indicator.style.opacity = '1';
    setTimeout(function() { indicator.style.opacity = '0'; }, 3000);
  };

  // Run on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

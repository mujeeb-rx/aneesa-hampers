/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ANEESA HAMPERS - COOKIE MANAGEMENT SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A complete cookie system for eCommerce functionality:
 * - Cookie consent management
 * - Cart persistence
 * - Recently viewed products
 * - Session handling
 * 
 * @version 1.0.0
 * @author Aneesa Hampers
 */

(function() {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════
     CONFIGURATION
  ═══════════════════════════════════════════════════════════════════════ */
  const CONFIG = {
    prefix: 'ah_',                    // Cookie prefix for namespacing
    expiry: {
      consent: 30,                    // Consent cookie: 30 days
      cart: 7,                        // Cart cookie: 7 days
      recentlyViewed: 7,              // Recently viewed: 7 days
      session: 1                      // Session: 1 day
    },
    maxRecentProducts: 5,             // Max recently viewed products
    secure: location.protocol === 'https:',
    sameSite: 'Lax'
  };

  /* ═══════════════════════════════════════════════════════════════════════
     1. CORE COOKIE FUNCTIONS
     Basic utilities for setting, getting, and deleting cookies
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Set a cookie with the specified name, value, and options
   * @param {string} name - Cookie name
   * @param {string|object} value - Cookie value (objects will be JSON stringified)
   * @param {number} days - Expiration in days
   * @param {object} options - Additional options (path, secure, sameSite)
   */
  function setCookie(name, value, days, options = {}) {
    // Don't set cookies if user rejected (except consent cookie itself)
    if (name !== CONFIG.prefix + 'consent' && !hasConsent()) {
      console.log('🍪 Cookies not accepted, skipping:', name);
      return false;
    }

    const cookieName = name.startsWith(CONFIG.prefix) ? name : CONFIG.prefix + name;
    
    // Convert objects to JSON string
    const cookieValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    // Calculate expiration date
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // Build cookie string with security options
    let cookieString = `${cookieName}=${encodeURIComponent(cookieValue)}`;
    cookieString += `; expires=${date.toUTCString()}`;
    cookieString += `; path=${options.path || '/'}`;
    cookieString += `; SameSite=${options.sameSite || CONFIG.sameSite}`;
    
    // Add Secure flag for HTTPS
    if (CONFIG.secure || options.secure) {
      cookieString += '; Secure';
    }
    
    document.cookie = cookieString;
    return true;
  }

  /**
   * Get a cookie value by name
   * @param {string} name - Cookie name
   * @param {boolean} parseJson - Whether to parse JSON (default: true)
   * @returns {string|object|null} Cookie value or null if not found
   */
  function getCookie(name, parseJson = true) {
    const cookieName = name.startsWith(CONFIG.prefix) ? name : CONFIG.prefix + name;
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === cookieName && value) {
        const decodedValue = decodeURIComponent(value);
        
        // Try to parse as JSON if requested
        if (parseJson) {
          try {
            return JSON.parse(decodedValue);
          } catch (e) {
            return decodedValue;
          }
        }
        return decodedValue;
      }
    }
    return null;
  }

  /**
   * Delete a cookie by name
   * @param {string} name - Cookie name
   */
  function deleteCookie(name) {
    const cookieName = name.startsWith(CONFIG.prefix) ? name : CONFIG.prefix + name;
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=${CONFIG.sameSite}`;
  }

  /**
   * Check if all cookies with our prefix exist
   * @returns {object} Object with cookie names and their existence status
   */
  function listCookies() {
    const cookies = document.cookie.split(';');
    const ourCookies = {};
    
    for (let cookie of cookies) {
      const [key] = cookie.trim().split('=');
      if (key.startsWith(CONFIG.prefix)) {
        ourCookies[key] = getCookie(key);
      }
    }
    return ourCookies;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     2. COOKIE CONSENT MANAGEMENT
     Handle user consent for cookie usage
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Check if user has given cookie consent
   * @returns {boolean} True if accepted, false otherwise
   */
  function hasConsent() {
    const consent = getCookie('consent', false);
    return consent === 'accepted';
  }

  /**
   * Check if user has made any consent choice (accept or reject)
   * @returns {boolean}
   */
  function hasConsentChoice() {
    const consent = getCookie('consent', false);
    return consent === 'accepted' || consent === 'rejected';
  }

  /**
   * Accept cookies and hide popup
   */
  function acceptCookies() {
    // Set consent cookie (this one is always allowed)
    const cookieName = CONFIG.prefix + 'consent';
    const date = new Date();
    date.setTime(date.getTime() + (CONFIG.expiry.consent * 24 * 60 * 60 * 1000));
    document.cookie = `${cookieName}=accepted; expires=${date.toUTCString()}; path=/; SameSite=${CONFIG.sameSite}`;
    
    hideConsentPopup();
    
    // Sync localStorage cart to cookies now that consent is given
    syncCartToCookies();
    
    // Start tracking recently viewed
    initRecentlyViewed();
    
    console.log('🍪 Cookies accepted');
  }

  /**
   * Reject cookies and hide popup
   */
  function rejectCookies() {
    // Set rejection cookie (minimal cookie to remember choice)
    const cookieName = CONFIG.prefix + 'consent';
    const date = new Date();
    date.setTime(date.getTime() + (CONFIG.expiry.consent * 24 * 60 * 60 * 1000));
    document.cookie = `${cookieName}=rejected; expires=${date.toUTCString()}; path=/; SameSite=${CONFIG.sameSite}`;
    
    hideConsentPopup();
    
    // Clear any existing cookies (except consent)
    clearAllCookies();
    
    console.log('🍪 Cookies rejected');
  }

  /**
   * Clear all our cookies except consent
   */
  function clearAllCookies() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key] = cookie.trim().split('=');
      if (key.startsWith(CONFIG.prefix) && key !== CONFIG.prefix + 'consent') {
        deleteCookie(key);
      }
    }
  }

  /**
   * Show consent popup
   */
  function showConsentPopup() {
    const popup = document.getElementById('ah-cookie-consent');
    if (popup) {
      popup.classList.add('show');
    }
  }

  /**
   * Hide consent popup with animation
   */
  function hideConsentPopup() {
    const popup = document.getElementById('ah-cookie-consent');
    if (popup) {
      popup.classList.remove('show');
      popup.classList.add('hide');
      setTimeout(() => {
        popup.style.display = 'none';
      }, 300);
    }
  }

  /**
   * Inject the consent popup HTML and CSS
   */
  function injectConsentPopup() {
    // Don't show if already made a choice
    if (hasConsentChoice()) return;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Cookie Consent Popup Styles */
      #ah-cookie-consent {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 10000;
        background: linear-gradient(135deg, #3b0d1a 0%, #5a1f2e 100%);
        color: #fff;
        padding: 20px 24px;
        box-shadow: 0 -4px 24px rgba(59, 13, 26, 0.3);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        transform: translateY(100%);
        opacity: 0;
        transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
      }
      
      #ah-cookie-consent.show {
        transform: translateY(0);
        opacity: 1;
      }
      
      #ah-cookie-consent.hide {
        transform: translateY(100%);
        opacity: 0;
      }
      
      .cookie-content {
        display: flex;
        align-items: center;
        gap: 16px;
        flex: 1;
      }
      
      .cookie-icon {
        font-size: 2rem;
        flex-shrink: 0;
      }
      
      .cookie-text h4 {
        margin: 0 0 4px;
        font-size: 1rem;
        font-weight: 600;
        font-family: 'Cormorant Garamond', serif;
      }
      
      .cookie-text p {
        margin: 0;
        font-size: 0.85rem;
        opacity: 0.9;
        line-height: 1.4;
      }
      
      .cookie-text a {
        color: #f8c8d4;
        text-decoration: underline;
      }
      
      .cookie-buttons {
        display: flex;
        gap: 12px;
        flex-shrink: 0;
      }
      
      .cookie-btn {
        padding: 10px 24px;
        border-radius: 25px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        font-family: inherit;
      }
      
      .cookie-btn-accept {
        background: linear-gradient(135deg, #c06478 0%, #d4899a 100%);
        color: #fff;
        box-shadow: 0 4px 12px rgba(192, 100, 120, 0.4);
      }
      
      .cookie-btn-accept:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(192, 100, 120, 0.5);
      }
      
      .cookie-btn-reject {
        background: transparent;
        color: #fff;
        border: 1.5px solid rgba(255, 255, 255, 0.4);
      }
      
      .cookie-btn-reject:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.6);
      }
      
      /* Mobile Responsive */
      @media (max-width: 600px) {
        #ah-cookie-consent {
          flex-direction: column;
          text-align: center;
          padding: 20px 16px;
          padding-bottom: 80px; /* Space for bottom nav */
        }
        
        .cookie-content {
          flex-direction: column;
        }
        
        .cookie-buttons {
          width: 100%;
          justify-content: center;
        }
        
        .cookie-btn {
          flex: 1;
          max-width: 140px;
        }
      }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const popup = document.createElement('div');
    popup.id = 'ah-cookie-consent';
    popup.innerHTML = `
      <div class="cookie-content">
        <span class="cookie-icon">🍪</span>
        <div class="cookie-text">
          <h4>We Value Your Privacy</h4>
          <p>We use cookies to enhance your shopping experience, remember your cart, and show you recently viewed products. <a href="#" onclick="return false;">Learn more</a></p>
        </div>
      </div>
      <div class="cookie-buttons">
        <button class="cookie-btn cookie-btn-reject" onclick="window.AHCookies.reject()">Reject</button>
        <button class="cookie-btn cookie-btn-accept" onclick="window.AHCookies.accept()">Accept All</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Show with animation after a brief delay
    setTimeout(showConsentPopup, 500);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     3. CART COOKIE MANAGEMENT
     Sync cart between localStorage and cookies for persistence
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Get cart key for current user
   */
  function getCartKey() {
    try {
      const user = JSON.parse(localStorage.getItem('ah_user') || '{}');
      return user.uid ? `ah_cart_${user.uid}` : 'ah_cart_guest';
    } catch (e) {
      return 'ah_cart_guest';
    }
  }

  /**
   * Sync localStorage cart to cookies
   */
  function syncCartToCookies() {
    if (!hasConsent()) return;

    try {
      const cartKey = getCartKey();
      const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      if (cart.length > 0) {
        // Store simplified cart data in cookie
        const cookieCart = cart.map(item => ({
          id: item.id,
          name: item.name ? item.name.substring(0, 50) : '', // Limit name length
          qty: item.qty || 1,
          price: item.price || 0
        }));
        
        setCookie('cart', cookieCart, CONFIG.expiry.cart);
        console.log('🛒 Cart synced to cookies:', cookieCart.length, 'items');
      }
    } catch (e) {
      console.error('Error syncing cart to cookies:', e);
    }
  }

  /**
   * Restore cart from cookies to localStorage
   */
  function restoreCartFromCookies() {
    if (!hasConsent()) return;

    try {
      const cartKey = getCartKey();
      const localCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
      
      // Only restore if localStorage is empty
      if (localCart.length === 0) {
        const cookieCart = getCookie('cart');
        if (cookieCart && Array.isArray(cookieCart) && cookieCart.length > 0) {
          localStorage.setItem(cartKey, JSON.stringify(cookieCart));
          console.log('🛒 Cart restored from cookies:', cookieCart.length, 'items');
          
          // Trigger cart badge update if function exists
          if (window._updateCartBadge) {
            window._updateCartBadge();
          }
        }
      }
    } catch (e) {
      console.error('Error restoring cart from cookies:', e);
    }
  }

  /**
   * Clear cart cookie
   */
  function clearCartCookie() {
    deleteCookie('cart');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     4. RECENTLY VIEWED PRODUCTS
     Track and display recently viewed products
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Add a product to recently viewed
   * @param {object} product - Product object with id, name, image, price
   */
  function addToRecentlyViewed(product) {
    if (!hasConsent() || !product || !product.id) return;

    try {
      let recent = getCookie('recent') || [];
      
      // Ensure it's an array
      if (!Array.isArray(recent)) recent = [];
      
      // Remove if already exists
      recent = recent.filter(p => p.id !== product.id);
      
      // Add to beginning
      recent.unshift({
        id: product.id,
        name: product.name ? product.name.substring(0, 60) : '',
        image: product.image || '',
        price: product.price || 0,
        viewedAt: Date.now()
      });
      
      // Keep only max items
      recent = recent.slice(0, CONFIG.maxRecentProducts);
      
      setCookie('recent', recent, CONFIG.expiry.recentlyViewed);
      console.log('👁️ Added to recently viewed:', product.name);
      
    } catch (e) {
      console.error('Error adding to recently viewed:', e);
    }
  }

  /**
   * Get recently viewed products
   * @returns {array} Array of recently viewed products
   */
  function getRecentlyViewed() {
    if (!hasConsent()) return [];
    
    const recent = getCookie('recent');
    return Array.isArray(recent) ? recent : [];
  }

  /**
   * Clear recently viewed products
   */
  function clearRecentlyViewed() {
    deleteCookie('recent');
  }

  /**
   * Render recently viewed section
   * @param {string} containerId - ID of container element
   */
  function renderRecentlyViewed(containerId = 'ah-recently-viewed') {
    const container = document.getElementById(containerId);
    if (!container) return;

    const products = getRecentlyViewed();
    
    if (products.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    container.innerHTML = `
      <div class="recent-header">
        <h3>👁️ Recently Viewed</h3>
      </div>
      <div class="recent-products">
        ${products.map(p => `
          <a href="product.html?id=${p.id}" class="recent-item">
            <div class="recent-img">
              <img src="${p.image}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/80?text=🎁'" loading="lazy">
            </div>
            <div class="recent-info">
              <span class="recent-name">${p.name}</span>
              <span class="recent-price">₹${p.price.toLocaleString('en-IN')}</span>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }

  /**
   * Initialize recently viewed (inject styles)
   */
  function initRecentlyViewed() {
    // Check if styles already added
    if (document.getElementById('ah-recent-styles')) return;

    const style = document.createElement('style');
    style.id = 'ah-recent-styles';
    style.textContent = `
      /* Recently Viewed Section */
      #ah-recently-viewed {
        padding: 32px 24px;
        background: linear-gradient(180deg, #fdf6f0 0%, #fff 100%);
        display: none;
      }
      
      .recent-header {
        margin-bottom: 20px;
      }
      
      .recent-header h3 {
        font-family: 'Cormorant Garamond', serif;
        font-size: 1.4rem;
        color: #3b0d1a;
        margin: 0;
      }
      
      .recent-products {
        display: flex;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 8px;
        scrollbar-width: thin;
      }
      
      .recent-products::-webkit-scrollbar {
        height: 4px;
      }
      
      .recent-products::-webkit-scrollbar-thumb {
        background: #c06478;
        border-radius: 4px;
      }
      
      .recent-item {
        flex-shrink: 0;
        width: 120px;
        text-decoration: none;
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(59, 13, 26, 0.08);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      
      .recent-item:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 24px rgba(59, 13, 26, 0.12);
      }
      
      .recent-img {
        width: 120px;
        height: 100px;
        overflow: hidden;
      }
      
      .recent-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      
      .recent-info {
        padding: 10px;
      }
      
      .recent-name {
        display: block;
        font-size: 0.75rem;
        color: #3b0d1a;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 4px;
      }
      
      .recent-price {
        font-size: 0.8rem;
        font-weight: 600;
        color: #c06478;
      }
      
      @media (max-width: 600px) {
        #ah-recently-viewed {
          padding: 24px 16px;
        }
        
        .recent-item {
          width: 100px;
        }
        
        .recent-img {
          width: 100px;
          height: 80px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     5. SESSION MANAGEMENT
     Handle user session with cookies
  ═══════════════════════════════════════════════════════════════════════ */

  /**
   * Set user session in cookie
   * @param {object} user - User object with uid, name, email
   */
  function setSession(user) {
    if (!hasConsent() || !user) return;

    const sessionData = {
      uid: user.uid || '',
      name: user.displayName || user.name || '',
      email: user.email || '',
      loginTime: Date.now()
    };

    setCookie('session', sessionData, CONFIG.expiry.session);
    console.log('👤 Session saved for:', sessionData.name || sessionData.email);
  }

  /**
   * Get current session from cookie
   * @returns {object|null} Session data or null
   */
  function getSession() {
    if (!hasConsent()) return null;
    return getCookie('session');
  }

  /**
   * Check if session is valid (not expired)
   * @returns {boolean}
   */
  function isSessionValid() {
    const session = getSession();
    if (!session || !session.loginTime) return false;

    const expiryMs = CONFIG.expiry.session * 24 * 60 * 60 * 1000;
    return (Date.now() - session.loginTime) < expiryMs;
  }

  /**
   * Clear user session
   */
  function clearSession() {
    deleteCookie('session');
    console.log('👤 Session cleared');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     6. INITIALIZATION
     Setup everything when DOM is ready
  ═══════════════════════════════════════════════════════════════════════ */

  function init() {
    console.log('🍪 Cookie system initializing...');

    // Inject consent popup if needed
    injectConsentPopup();

    // If consent already given, restore data
    if (hasConsent()) {
      restoreCartFromCookies();
      initRecentlyViewed();
      
      // Render recently viewed if container exists
      setTimeout(() => {
        renderRecentlyViewed();
      }, 100);
    }

    // Listen for cart changes to sync
    window.addEventListener('storage', function(e) {
      if (e.key && e.key.startsWith('ah_cart')) {
        syncCartToCookies();
      }
    });

    // Sync cart periodically (every 30 seconds)
    setInterval(syncCartToCookies, 30000);

    console.log('🍪 Cookie system ready. Consent:', hasConsent() ? 'accepted' : hasConsentChoice() ? 'rejected' : 'pending');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7. EXPOSE PUBLIC API
     Make functions available globally
  ═══════════════════════════════════════════════════════════════════════ */

  window.AHCookies = {
    // Core functions
    set: setCookie,
    get: getCookie,
    delete: deleteCookie,
    list: listCookies,

    // Consent
    accept: acceptCookies,
    reject: rejectCookies,
    hasConsent: hasConsent,
    showPopup: showConsentPopup,

    // Cart
    syncCart: syncCartToCookies,
    restoreCart: restoreCartFromCookies,
    clearCart: clearCartCookie,

    // Recently viewed
    addViewed: addToRecentlyViewed,
    getViewed: getRecentlyViewed,
    clearViewed: clearRecentlyViewed,
    renderViewed: renderRecentlyViewed,

    // Session
    setSession: setSession,
    getSession: getSession,
    isSessionValid: isSessionValid,
    clearSession: clearSession,

    // Config
    config: CONFIG
  };

})();

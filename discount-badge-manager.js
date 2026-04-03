/**
 * DISCOUNT BADGE MANAGER
 * Real-time dynamic discount badge system that syncs across all pages
 * Updates instantly when admin changes discount values
 * Automatically hides badge when no valid discount is active
 */

import { db } from './firebase.js';
import { doc, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

// Global state for discount
let discountState = {
  active: false,
  discount: 0,
  codePrefix: '',
  subtext: '',
  validDays: 30,
  minOrder: 0
};

// Track all badge elements across the page
const badgeElements = new Set();

/**
 * Initialize real-time discount listener
 * This function should be called on every page that displays discount badges
 */
export function initDiscountBadge() {
  // Listen to Firestore config changes in real-time
  const configRef = doc(db, 'siteSettings', 'config');
  
  onSnapshot(configRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.warn('⚠️ No siteSettings/config found in Firestore');
      hideAllBadges();
      return;
    }

    const data = snapshot.data();
    const wp = data.welcomePopup || {};
    
    // Update global state
    discountState.active = wp.active !== false;
    discountState.discount = Number(wp.discount) || 0;
    discountState.codePrefix = (wp.codePrefix || '').toUpperCase().trim();
    discountState.subtext = wp.subtext || '';
    discountState.validDays = Number(wp.validDays) || 30;
    discountState.minOrder = Number(wp.minOrder) || 0;

    console.log('✅ Discount config updated:', discountState);

    // Update all badge elements on page
    updateAllBadges();
  }, (error) => {
    console.error('❌ Error listening to discount config:', error);
    hideAllBadges();
  });
}

/**
 * Register a badge element for automatic updates
 * @param {HTMLElement} element - The badge element to track
 */
export function registerBadgeElement(element) {
  if (element && element instanceof HTMLElement) {
    badgeElements.add(element);
    updateBadgeElement(element);
  }
}

/**
 * Unregister a badge element
 * @param {HTMLElement} element - The badge element to stop tracking
 */
export function unregisterBadgeElement(element) {
  badgeElements.delete(element);
}

/**
 * Update a single badge element with current discount state
 * @param {HTMLElement} element - The badge element to update
 */
function updateBadgeElement(element) {
  if (!element) return;

  // Check if discount is active and valid
  const isValid = discountState.active && discountState.discount > 0;

  if (isValid) {
    // Show badge with current discount
    element.style.display = '';
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    
    // Update text content
    const iconHTML = element.querySelector('.badge-icon')?.outerHTML || '🎁';
    const discountText = `${discountState.discount}% OFF`;
    
    // Check if element has specific structure or just text
    if (element.classList.contains('esb-settings-btn') || element.tagName === 'BUTTON') {
      element.innerHTML = `${iconHTML} ${discountText}`;
    } else if (element.classList.contains('discount-badge')) {
      element.textContent = discountText;
    } else {
      element.innerHTML = `${iconHTML} ${discountText}`;
    }
    
    // Update tooltip/title if exists
    if (element.title || element.hasAttribute('title')) {
      element.title = `Claim your ${discountState.discount}% OFF discount`;
    }

    // Trigger animation on update
    element.classList.add('badge-updated');
    setTimeout(() => element.classList.remove('badge-updated'), 600);
    
  } else {
    // Hide badge
    hideBadgeElement(element);
  }
}

/**
 * Hide a single badge element
 * @param {HTMLElement} element - The badge element to hide
 */
function hideBadgeElement(element) {
  if (!element) return;
  
  element.style.opacity = '0';
  setTimeout(() => {
    element.style.display = 'none';
    element.style.visibility = 'hidden';
  }, 300);
}

/**
 * Update all registered badge elements
 */
function updateAllBadges() {
  badgeElements.forEach(element => {
    if (document.body.contains(element)) {
      updateBadgeElement(element);
    } else {
      // Remove stale references
      badgeElements.delete(element);
    }
  });
}

/**
 * Hide all registered badge elements
 */
function hideAllBadges() {
  badgeElements.forEach(element => {
    hideBadgeElement(element);
  });
}

/**
 * Get current discount state (for use in other modules)
 * @returns {Object} Current discount configuration
 */
export function getDiscountState() {
  return { ...discountState };
}

/**
 * Check if discount is currently active and valid
 * @returns {boolean} True if discount is active
 */
export function isDiscountActive() {
  return discountState.active && discountState.discount > 0;
}

/**
 * Auto-discover and register discount badges on page
 * Call this after DOM is loaded
 */
export function autoRegisterBadges() {
  // Find all elements with discount badge classes or data attributes
  const selectors = [
    '.discount-badge',
    '[data-discount-badge]',
    'button[onclick*="ahPopupOpen"]',
    '.esb-settings-btn[onclick*="ahPopupOpen"]'
  ];

  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => registerBadgeElement(el));
  });

  console.log(`✅ Auto-registered ${badgeElements.size} discount badge(s)`);
}

/**
 * Update floating popup button tooltip text
 */
export function updatePopupFloatTooltip() {
  const floatBtn = document.getElementById('ah-popup-float');
  if (!floatBtn) return;

  const isValid = discountState.active && discountState.discount > 0;
  
  if (isValid) {
    floatBtn.title = `Claim your ${discountState.discount}% OFF`;
    floatBtn.style.display = '';
    
    // Update CSS ::before content dynamically
    const style = document.createElement('style');
    style.id = 'dynamic-discount-tooltip';
    
    // Remove old style if exists
    const oldStyle = document.getElementById('dynamic-discount-tooltip');
    if (oldStyle) oldStyle.remove();
    
    style.textContent = `
      #ah-popup-float::before {
        content: 'Tap for ${discountState.discount}% OFF' !important;
      }
    `;
    document.head.appendChild(style);
  } else {
    floatBtn.style.display = 'none';
  }
}

/**
 * Update popup content with dynamic discount
 */
export function updatePopupContent() {
  const headlineEl = document.querySelector('.popup-headline span');
  const subtextEl = document.querySelector('.popup-subtext');
  const successTextEl = document.querySelector('.popup-success-sub strong');
  
  if (headlineEl && discountState.discount > 0) {
    headlineEl.textContent = `${discountState.discount}% OFF`;
  }
  
  if (subtextEl && discountState.subtext) {
    subtextEl.textContent = discountState.subtext;
  }
  
  if (successTextEl && discountState.discount > 0) {
    successTextEl.textContent = `${discountState.discount}% OFF`;
  }
}

// CSS for badge update animation
const style = document.createElement('style');
style.textContent = `
  .badge-updated {
    animation: badgePulse 0.6s ease-out;
  }
  
  @keyframes badgePulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Initialize on module load
console.log('📦 Discount Badge Manager loaded');

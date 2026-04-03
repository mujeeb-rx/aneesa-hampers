# 🎯 PROMOTIONAL BANNER SYSTEM - Implementation Guide

## Overview

This guide covers the **vertical stacked promotional banner system** for the Aneesa Hampers website. Banners are displayed one below another, fully manageable from the admin panel with lazy loading and responsive design.

## 📋 System Architecture

### Components
1. **Frontend Display** - Vertical banner stack on homepage
2. **Admin Panel** - Full CRUD operations + reorder
3. **Firestore Database** - Real-time sync
4. **Image Storage** - ImgBB integration
5. **Lazy Loading** - Performance optimization

---

## 🎨 Banner Structure

### Banner Object Schema
```javascript
{
  id: "banner-1",               // Unique identifier
  title: "Summer Sale",         // Banner title
  subtitle: "Up to 50% OFF",    // Subheading
  description: "Limited time",  // Optional description
  ctaText: "Shop Now",          // Call-to-action button
  ctaLink: "products.html?cat=summer", // Click destination
  image: "https://...",         // Banner image URL
  imageMobile: "https://...",   // Mobile image (optional)
  bgColor: "#f9e4e9",          // Fallback background
  textColor: "#3b0d1a",        // Text color
  active: true,                 // Published status
  order: 1,                     // Display order
  createdAt: timestamp,         // Creation date
  updatedAt: timestamp          // Last modified
}
```

---

## 📍 Implementation Steps

### Step 1: Add HTML Structure to `index.html`

Insert this after the hero/carousel section (around line 1800):

```html
<!-- ═══════════════════════════════════════════════
     PROMOTIONAL BANNERS (Vertical Stack)
═══════════════════════════════════════════════ -->
<section id="promoBannersSection" class="promo-banners-wrap" style="display:none;">
  <div class="promo-banners-container" id="promoBannersContainer">
    <!-- Banners loaded dynamically -->
  </div>
</section>
```

### Step 2: Add CSS Styles

Add to the `<style>` section in `index.html`:

```css
/* ═══════════════════════════════════════════════
   PROMOTIONAL BANNERS (Vertical Stack)
═══════════════════════════════════════════════ */
.promo-banners-wrap{
  width:100%;
  padding:0;
  margin:0;
  background:var(--cream);
}
.promo-banners-container{
  max-width:100%;
  margin:0 auto;
}
.promo-banner{
  position:relative;
  width:100%;
  min-height:clamp(280px, 35vw, 450px);
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  margin-bottom:0;
  cursor:pointer;
  transition:transform .3s ease;
}
.promo-banner:hover{
  transform:scale(1.01);
}
.promo-banner-bg{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
  z-index:1;
}
.promo-banner-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(to right,
    rgba(59,13,26,.75) 0%,
    rgba(59,13,26,.35) 50%,
    transparent 100%
  );
  z-index:2;
}
.promo-banner-content{
  position:relative;
  z-index:3;
  max-width:1200px;
  width:100%;
  padding:40px 52px;
  color:white;
}
.promo-banner-content h2{
  font-family:'Cormorant Garamond',serif;
  font-size:clamp(2rem, 4vw, 3.5rem);
  font-weight:600;
  margin-bottom:12px;
  line-height:1.2;
}
.promo-banner-content h3{
  font-size:clamp(1.1rem, 2vw, 1.5rem);
  font-weight:400;
  margin-bottom:20px;
  opacity:.9;
}
.promo-banner-content p{
  font-size:clamp(.9rem, 1.5vw, 1.1rem);
  margin-bottom:24px;
  opacity:.85;
  max-width:600px;
}
.promo-banner-cta{
  display:inline-flex;
  align-items:center;
  gap:8px;
  background:white;
  color:var(--burgundy);
  padding:14px 32px;
  border-radius:50px;
  font-size:clamp(.8rem, 1.2vw, .95rem);
  font-weight:600;
  letter-spacing:1px;
  text-transform:uppercase;
  text-decoration:none;
  transition:all .3s;
  box-shadow:0 4px 16px rgba(0,0,0,.15);
}
.promo-banner-cta:hover{
  background:var(--deep-rose);
  color:white;
  transform:translateY(-2px);
  box-shadow:0 6px 24px rgba(192,100,122,.3);
}

/* Mobile Responsive */
@media(max-width:900px){
  .promo-banner{
    min-height:clamp(240px, 40vw, 350px);
  }
  .promo-banner-content{
    padding:32px 28px;
  }
  .promo-banner-overlay{
    background:linear-gradient(to bottom,
      transparent 0%,
      rgba(59,13,26,.5) 40%,
      rgba(59,13,26,.85) 100%
    );
  }
  .promo-banner-content{
    text-align:left;
  }
}
@media(max-width:600px){
  .promo-banner{
    min-height:280px;
  }
  .promo-banner-content{
    padding:24px 20px;
  }
  .promo-banner-cta{
    padding:12px 24px;
    font-size:.75rem;
  }
}

/* Lazy Load Animation */
.promo-banner[data-lazy="true"]{
  opacity:0;
  transform:translateY(20px);
  transition:opacity .6s ease, transform .6s ease;
}
.promo-banner[data-lazy="loaded"]{
  opacity:1;
  transform:translateY(0);
}
```

### Step 3: Add JavaScript Functions

Add to the JavaScript section in `index.html` (around line 2500):

```javascript
// ═══════════════════════════════════════════════
// PROMOTIONAL BANNERS (Vertical Stack)
// ═══════════════════════════════════════════════

let promoBannersData = [];

// Load promotional banners from Firestore
function loadPromotionalBanners() {
  console.log('🎯 Loading promotional banners...');
  
  try {
    onSnapshot(
      doc(db, 'siteSettings', 'config'),
      (docSnap) => {
        if (!docSnap.exists()) {
          console.log('⚠️ No siteSettings config found');
          return;
        }
        
        const data = docSnap.data();
        const banners = data.promoBanners || [];
        
        // Filter active banners and sort by order
        const activeBanners = banners
          .filter(b => b.active !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        console.log(`✅ Found ${activeBanners.length} active promotional banners`);
        
        if (activeBanners.length > 0) {
          promoBannersData = activeBanners;
          renderPromotionalBanners(activeBanners);
        } else {
          document.getElementById('promoBannersSection').style.display = 'none';
        }
      },
      (error) => {
        console.error('❌ Error loading promotional banners:', error);
      }
    );
  } catch (error) {
    console.error('❌ Error setting up promo banners listener:', error);
  }
}

// Render promotional banners to DOM
function renderPromotionalBanners(banners) {
  const container = document.getElementById('promoBannersContainer');
  const section = document.getElementById('promoBannersSection');
  
  if (!container || !section) return;
  
  // Build HTML for each banner
  const bannersHTML = banners.map((banner, index) => {
    const {
      title = 'Special Offer',
      subtitle = '',
      description = '',
      ctaText = 'Shop Now',
      ctaLink = 'products.html',
      image = '',
      imageMobile = '',
      bgColor = '#f9e4e9',
      textColor = '#ffffff'
    } = banner;
    
    // Use mobile image if available and on small screen
    const isMobile = window.innerWidth <= 768;
    const bannerImage = (isMobile && imageMobile) ? imageMobile : image;
    
    // Lazy loading: first banner eager, rest lazy
    const loadingAttr = index === 0 ? 'eager' : 'lazy';
    const lazyAttr = index === 0 ? 'loaded' : 'true';
    
    return `
      <a href="${ctaLink}" 
         class="promo-banner" 
         data-lazy="${lazyAttr}"
         style="background-color:${bgColor};color:${textColor};"
         onclick="return handleBannerClick(event, '${ctaLink}')">
        ${bannerImage ? `
          <img src="${bannerImage}" 
               alt="${title}" 
               class="promo-banner-bg" 
               loading="${loadingAttr}"
               onload="this.parentElement.setAttribute('data-lazy','loaded')"/>
        ` : ''}
        <div class="promo-banner-overlay"></div>
        <div class="promo-banner-content">
          ${title ? `<h2>${title}</h2>` : ''}
          ${subtitle ? `<h3>${subtitle}</h3>` : ''}
          ${description ? `<p>${description}</p>` : ''}
          ${ctaText ? `<span class="promo-banner-cta">${ctaText} →</span>` : ''}
        </div>
      </a>
    `;
  }).join('');
  
  container.innerHTML = bannersHTML;
  section.style.display = 'block';
  
  console.log(`🎨 Rendered ${banners.length} promotional banners`);
  
  // Initialize Intersection Observer for lazy loading
  initBannerLazyLoading();
}

// Handle banner click
window.handleBannerClick = function(event, link) {
  console.log('🎯 Banner clicked:', link);
  // Allow default navigation
  return true;
};

// Lazy loading with Intersection Observer
function initBannerLazyLoading() {
  if ('IntersectionObserver' in window) {
    const lazyBanners = document.querySelectorAll('.promo-banner[data-lazy="true"]');
    
    const bannerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const banner = entry.target;
          const img = banner.querySelector('.promo-banner-bg');
          
          if (img && !img.complete) {
            img.addEventListener('load', () => {
              banner.setAttribute('data-lazy', 'loaded');
            });
          } else {
            banner.setAttribute('data-lazy', 'loaded');
          }
          
          bannerObserver.unobserve(banner);
        }
      });
    }, {
      rootMargin: '50px 0px' // Start loading 50px before entering viewport
    });
    
    lazyBanners.forEach(banner => bannerObserver.observe(banner));
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadPromotionalBanners();
});

// Also initialize if DOM already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(loadPromotionalBanners, 100);
}
```

---

## 🎛️ Admin Panel Integration

### Step 4: Add Admin UI to `admin.html`

Add this section to the admin panel (in the Settings tab):

```html
<!-- PROMOTIONAL BANNERS SECTION -->
<div class="card">
  <div class="card-title">🎯 Promotional Banners</div>
  <div style="font-size:.7rem;opacity:.5;margin-bottom:20px;">
    Vertical stacked banners displayed on homepage. Fully clickable and responsive.
  </div>
  
  <!-- Banner List -->
  <div id="promoBannersList" style="margin-bottom:20px;">
    <!-- Dynamic list -->
  </div>
  
  <!-- Add New Banner Button -->
  <button class="btn btn-secondary" onclick="addNewPromoBanner()" style="margin-bottom:20px;">
    ➕ Add New Banner
  </button>
  
  <!-- Banner Editor -->
  <div id="promoBannerEditor" style="display:none;">
    <div style="background:rgba(192,100,122,.05);padding:20px;border-radius:12px;margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <div style="font-weight:600;font-size:.85rem;">Banner Editor</div>
        <button class="btn-sm btn-text" onclick="closePromoBannerEditor()">✕ Close</button>
      </div>
      
      <div class="form-grid">
        <div class="fg full">
          <label class="fl">Banner Title</label>
          <input class="fi" id="pbTitle" placeholder="e.g., Summer Sale 2026"/>
        </div>
        
        <div class="fg full">
          <label class="fl">Subtitle</label>
          <input class="fi" id="pbSubtitle" placeholder="e.g., Up to 50% OFF"/>
        </div>
        
        <div class="fg full">
          <label class="fl">Description (Optional)</label>
          <input class="fi" id="pbDescription" placeholder="Limited time offer"/>
        </div>
        
        <div class="fg">
          <label class="fl">CTA Button Text</label>
          <input class="fi" id="pbCtaText" placeholder="Shop Now"/>
        </div>
        
        <div class="fg">
          <label class="fl">CTA Link/URL</label>
          <input class="fi" id="pbCtaLink" placeholder="products.html?cat=sale"/>
        </div>
        
        <div class="fg">
          <label class="fl">Background Color</label>
          <input class="fi" type="color" id="pbBgColor" value="#f9e4e9"/>
        </div>
        
        <div class="fg">
          <label class="fl">Text Color</label>
          <input class="fi" type="color" id="pbTextColor" value="#ffffff"/>
        </div>
        
        <div class="fg full">
          <label class="fl">Desktop Image</label>
          <input type="file" accept="image/*" onchange="uploadPromoBannerImage(this, 'desktop')"/>
          <div id="pbImagePreview" style="margin-top:8px;"></div>
        </div>
        
        <div class="fg full">
          <label class="fl">Mobile Image (Optional)</label>
          <input type="file" accept="image/*" onchange="uploadPromoBannerImage(this, 'mobile')"/>
          <div id="pbImageMobilePreview" style="margin-top:8px;"></div>
        </div>
        
        <div class="fg">
          <label class="fl">Status</label>
          <select class="fi" id="pbActive">
            <option value="true">✅ Active (Published)</option>
            <option value="false">❌ Inactive (Hidden)</option>
          </select>
        </div>
        
        <div class="fg">
          <label class="fl">Display Order</label>
          <input class="fi" type="number" id="pbOrder" value="1" min="1"/>
        </div>
      </div>
      
      <div style="display:flex;gap:12px;margin-top:16px;">
        <button class="btn btn-primary" onclick="savePromoBanner()">💾 Save Banner</button>
        <button class="btn btn-secondary" onclick="closePromoBannerEditor()">Cancel</button>
      </div>
    </div>
  </div>
  
  <div id="pbSaveStatus" style="font-size:.72rem;text-align:center;margin-top:12px;min-height:18px;"></div>
</div>
```

### Step 5: Add Admin JavaScript Functions

Add to `admin.html` JavaScript section:

```javascript
// ═══════════════════════════════════════════════
// PROMOTIONAL BANNERS MANAGEMENT
// ═══════════════════════════════════════════════

let promoBannersAdmin = [];
let currentEditingBannerIndex = -1;
let pbImageUrl = '';
let pbImageMobileUrl = '';

// Load promotional banners in admin
async function loadPromoBannersAdmin() {
  try {
    const configDoc = await getDoc(doc(db, 'siteSettings', 'config'));
    
    if (configDoc.exists()) {
      const data = configDoc.data();
      promoBannersAdmin = data.promoBanners || [];
      renderPromoBannersListAdmin();
    }
  } catch (error) {
    console.error('Error loading promo banners:', error);
  }
}

// Render banners list in admin
function renderPromoBannersListAdmin() {
  const container = document.getElementById('promoBannersList');
  
  if (!promoBannersAdmin.length) {
    container.innerHTML = `
      <div style="text-align:center;padding:24px;opacity:.5;">
        No banners yet. Click "Add New Banner" to create one.
      </div>
    `;
    return;
  }
  
  const html = promoBannersAdmin.map((banner, index) => `
    <div style="background:white;border:1px solid rgba(192,100,122,.12);border-radius:8px;padding:12px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
      ${banner.image ? `
        <img src="${banner.image}" style="width:80px;height:50px;object-fit:cover;border-radius:6px;"/>
      ` : `
        <div style="width:80px;height:50px;background:${banner.bgColor || '#f9e4e9'};border-radius:6px;"></div>
      `}
      <div style="flex:1;">
        <div style="font-weight:600;font-size:.82rem;margin-bottom:4px;">${banner.title || 'Untitled'}</div>
        <div style="font-size:.7rem;opacity:.6;">${banner.subtitle || 'No subtitle'}</div>
        <div style="font-size:.65rem;opacity:.5;margin-top:4px;">
          Order: ${banner.order || index + 1} | 
          Status: ${banner.active !== false ? '✅ Active' : '❌ Inactive'}
        </div>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn-sm btn-secondary" onclick="editPromoBanner(${index})" title="Edit">✏️</button>
        <button class="btn-sm btn-secondary" onclick="movePromoBanner(${index}, -1)" title="Move Up" ${index === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn-sm btn-secondary" onclick="movePromoBanner(${index}, 1)" title="Move Down" ${index === promoBannersAdmin.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="btn-sm" style="background:#e05050;color:white;" onclick="deletePromoBanner(${index})" title="Delete">🗑️</button>
      </div>
    </div>
  `).join('');
  
  container.innerHTML = html;
}

// Add new banner
function addNewPromoBanner() {
  currentEditingBannerIndex = -1;
  pbImageUrl = '';
  pbImageMobileUrl = '';
  
  // Clear form
  document.getElementById('pbTitle').value = '';
  document.getElementById('pbSubtitle').value = '';
  document.getElementById('pbDescription').value = '';
  document.getElementById('pbCtaText').value = 'Shop Now';
  document.getElementById('pbCtaLink').value = 'products.html';
  document.getElementById('pbBgColor').value = '#f9e4e9';
  document.getElementById('pbTextColor').value = '#ffffff';
  document.getElementById('pbActive').value = 'true';
  document.getElementById('pbOrder').value = promoBannersAdmin.length + 1;
  document.getElementById('pbImagePreview').innerHTML = '';
  document.getElementById('pbImageMobilePreview').innerHTML = '';
  
  document.getElementById('promoBannerEditor').style.display = 'block';
}

// Edit existing banner
function editPromoBanner(index) {
  const banner = promoBannersAdmin[index];
  currentEditingBannerIndex = index;
  pbImageUrl = banner.image || '';
  pbImageMobileUrl = banner.imageMobile || '';
  
  document.getElementById('pbTitle').value = banner.title || '';
  document.getElementById('pbSubtitle').value = banner.subtitle || '';
  document.getElementById('pbDescription').value = banner.description || '';
  document.getElementById('pbCtaText').value = banner.ctaText || 'Shop Now';
  document.getElementById('pbCtaLink').value = banner.ctaLink || 'products.html';
  document.getElementById('pbBgColor').value = banner.bgColor || '#f9e4e9';
  document.getElementById('pbTextColor').value = banner.textColor || '#ffffff';
  document.getElementById('pbActive').value = String(banner.active !== false);
  document.getElementById('pbOrder').value = banner.order || index + 1;
  
  if (pbImageUrl) {
    document.getElementById('pbImagePreview').innerHTML = `
      <img src="${pbImageUrl}" style="width:100%;max-width:300px;border-radius:8px;"/>
    `;
  }
  
  if (pbImageMobileUrl) {
    document.getElementById('pbImageMobilePreview').innerHTML = `
      <img src="${pbImageMobileUrl}" style="width:100%;max-width:200px;border-radius:8px;"/>
    `;
  }
  
  document.getElementById('promoBannerEditor').style.display = 'block';
}

// Close editor
function closePromoBannerEditor() {
  document.getElementById('promoBannerEditor').style.display = 'none';
  currentEditingBannerIndex = -1;
}

// Upload banner image
async function uploadPromoBannerImage(input, type) {
  const file = input.files[0];
  if (!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  
  const previewDiv = type === 'desktop' 
    ? document.getElementById('pbImagePreview')
    : document.getElementById('pbImageMobilePreview');
  
  previewDiv.innerHTML = '<div style="padding:12px;opacity:.6;">Uploading...</div>';
  
  try {
    const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_API_KEY', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      const imageUrl = data.data.url;
      
      if (type === 'desktop') {
        pbImageUrl = imageUrl;
      } else {
        pbImageMobileUrl = imageUrl;
      }
      
      previewDiv.innerHTML = `
        <img src="${imageUrl}" style="width:100%;max-width:${type === 'desktop' ? '300px' : '200px'};border-radius:8px;"/>
      `;
      
      toast('✅ Image uploaded successfully!');
    } else {
      throw new Error('Upload failed');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    previewDiv.innerHTML = '<div style="color:#e05050;font-size:.75rem;">Upload failed. Try again.</div>';
    toast('❌ Image upload failed');
  }
}

// Save banner
async function savePromoBanner() {
  const banner = {
    title: document.getElementById('pbTitle').value.trim(),
    subtitle: document.getElementById('pbSubtitle').value.trim(),
    description: document.getElementById('pbDescription').value.trim(),
    ctaText: document.getElementById('pbCtaText').value.trim(),
    ctaLink: document.getElementById('pbCtaLink').value.trim(),
    image: pbImageUrl,
    imageMobile: pbImageMobileUrl,
    bgColor: document.getElementById('pbBgColor').value,
    textColor: document.getElementById('pbTextColor').value,
    active: document.getElementById('pbActive').value === 'true',
    order: parseInt(document.getElementById('pbOrder').value) || 1,
    updatedAt: serverTimestamp()
  };
  
  if (!banner.title) {
    toast('⚠️ Please enter a banner title');
    return;
  }
  
  try {
    if (currentEditingBannerIndex >= 0) {
      // Update existing
      promoBannersAdmin[currentEditingBannerIndex] = {
        ...promoBannersAdmin[currentEditingBannerIndex],
        ...banner
      };
    } else {
      // Add new
      banner.id = 'pb_' + Date.now();
      banner.createdAt = serverTimestamp();
      promoBannersAdmin.push(banner);
    }
    
    // Save to Firestore
    await setDoc(doc(db, 'siteSettings', 'config'), {
      promoBanners: promoBannersAdmin
    }, { merge: true });
    
    toast('✅ Banner saved successfully!');
    closePromoBannerEditor();
    renderPromoBannersListAdmin();
    
  } catch (error) {
    console.error('Error saving banner:', error);
    toast('❌ Error saving banner');
  }
}

// Delete banner
async function deletePromoBanner(index) {
  if (!confirm('Delete this banner? This cannot be undone.')) return;
  
  try {
    promoBannersAdmin.splice(index, 1);
    
    await setDoc(doc(db, 'siteSettings', 'config'), {
      promoBanners: promoBannersAdmin
    }, { merge: true });
    
    toast('✅ Banner deleted');
    renderPromoBannersListAdmin();
    
  } catch (error) {
    console.error('Error deleting banner:', error);
    toast('❌ Error deleting banner');
  }
}

// Move banner up/down
async function movePromoBanner(index, direction) {
  const newIndex = index + direction;
  
  if (newIndex < 0 || newIndex >= promoBannersAdmin.length) return;
  
  // Swap
  [promoBannersAdmin[index], promoBannersAdmin[newIndex]] = 
  [promoBannersAdmin[newIndex], promoBannersAdmin[index]];
  
  // Update order values
  promoBannersAdmin.forEach((b, i) => {
    b.order = i + 1;
  });
  
  try {
    await setDoc(doc(db, 'siteSettings', 'config'), {
      promoBanners: promoBannersAdmin
    }, { merge: true });
    
    renderPromoBannersListAdmin();
    toast('✅ Banner reordered');
    
  } catch (error) {
    console.error('Error moving banner:', error);
    toast('❌ Error reordering banner');
  }
}

// Load on admin panel init
loadPromoBannersAdmin();
```

---

## 📊 Firestore Structure

### Collection: `siteSettings`
### Document: `config`

```json
{
  "promoBanners": [
    {
      "id": "pb_1234567890",
      "title": "Summer Sale 2026",
      "subtitle": "Up to 50% OFF",
      "description": "Limited time offer on all hampers",
      "ctaText": "Shop Now",
      "ctaLink": "products.html?cat=summer",
      "image": "https://i.ibb.co/xxxxx/banner1.jpg",
      "imageMobile": "https://i.ibb.co/xxxxx/banner1-mobile.jpg",
      "bgColor": "#f9e4e9",
      "textColor": "#ffffff",
      "active": true,
      "order": 1,
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ]
}
```

---

## 🚀 Features

### ✅ Admin Panel
- ✅ Add new banners
- ✅ Edit existing banners
- ✅ Delete banners
- ✅ Reorder with up/down arrows
- ✅ Image upload (desktop + mobile)
- ✅ Color picker for background/text
- ✅ Active/inactive toggle
- ✅ Custom CTA text & link
- ✅ Real-time preview

### ✅ Frontend Display
- ✅ Vertical stacking
- ✅ Fully responsive
- ✅ Lazy loading (Intersection Observer)
- ✅ Clickable banners
- ✅ Smooth animations
- ✅ Mobile-optimized images
- ✅ Touch-friendly
- ✅ SEO-friendly

### ✅ Performance
- ✅ First banner eager load
- ✅ Rest lazy load
- ✅ IntersectionObserver API
- ✅ Optimized images
- ✅ CSS transitions
- ✅ Minimal repaints

---

## 🧪 Testing Checklist

- [ ] Add banner in admin panel
- [ ] Upload image for banner
- [ ] Set CTA link to products.html
- [ ] Publish banner (active = true)
- [ ] View homepage - banner appears
- [ ] Click banner - redirects correctly
- [ ] Test on mobile - responsive layout
- [ ] Add second banner - stacks vertically
- [ ] Reorder banners - order changes
- [ ] Delete banner - removes from homepage
- [ ] Set banner inactive - hides from homepage

---

## 📝 Next Steps

1. Replace `YOUR_IMGBB_API_KEY` with actual ImgBB API key
2. Test banner upload and display
3. Create sample banners for different categories
4. Optimize images for web (compress before upload)
5. Monitor performance metrics

---

**Status:** ✅ Ready to implement
**Version:** 1.0
**Last Updated:** April 2, 2026

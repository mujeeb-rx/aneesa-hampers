# 🎯 Promotional Banner System - Visual Guide

## 📐 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HOMEPAGE (index.html)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Header / Navigation                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Carousel / Hero Section                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Categories Section                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         🎯 PROMOTIONAL BANNERS (Vertical Stack)          │   │
│  │─────────────────────────────────────────────────────────│   │
│  │  ╔═══════════════════════════════════════════════════╗  │   │
│  │  ║  BANNER 1: Summer Sale                            ║  │   │
│  │  ║  [Background Image with Overlay]                  ║  │   │
│  │  ║  Title: "Summer Sale 2026"                        ║  │   │
│  │  ║  Subtitle: "Up to 50% OFF"                        ║  │   │
│  │  ║  [Shop Now →] Button                              ║  │   │
│  │  ╚═══════════════════════════════════════════════════╝  │   │
│  │                                                          │   │
│  │  ╔═══════════════════════════════════════════════════╗  │   │
│  │  ║  BANNER 2: Luxury Hampers                         ║  │   │
│  │  ║  [Background Image with Overlay]                  ║  │   │
│  │  ║  Title: "Luxury Gift Hampers"                     ║  │   │
│  │  ║  Subtitle: "Perfect for Every Occasion"           ║  │   │
│  │  ║  [Explore Collection →] Button                    ║  │   │
│  │  ╚═══════════════════════════════════════════════════╝  │   │
│  │                                                          │   │
│  │  ╔═══════════════════════════════════════════════════╗  │   │
│  │  ║  BANNER 3: Festive Collection                     ║  │   │
│  │  ║  [Background Image with Overlay]                  ║  │   │
│  │  ║  Title: "Festive Special"                         ║  │   │
│  │  ║  Subtitle: "Celebrate in Style"                   ║  │   │
│  │  ║  [Shop Festive →] Button                          ║  │   │
│  │  ╚═══════════════════════════════════════════════════╝  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         ↕ Lazy Loading                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Featured Products (8 items)                 │   │
│  │              [View All Products →]                       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Footer (with Contact Info)                  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 Banner Anatomy

```
╔═══════════════════════════════════════════════════════════════╗
║                                                                ║
║  [Background Image - Full Width]                              ║
║  ┌────────────────────────────────────────────────────────┐   ║
║  │ Dark Gradient Overlay (left-to-right or top-to-bottom) │   ║
║  │                                                         │   ║
║  │  ┌─────────────────────────────────────────────────┐   │   ║
║  │  │ Content Container (Max Width: 1200px)           │   │   ║
║  │  │                                                  │   │   ║
║  │  │  📌 Title (Large, Serif Font)                   │   │   ║
║  │  │     "Summer Sale 2026"                          │   │   ║
║  │  │                                                  │   │   ║
║  │  │  📌 Subtitle (Medium, Sans-serif)               │   │   ║
║  │  │     "Up to 50% OFF"                             │   │   ║
║  │  │                                                  │   │   ║
║  │  │  📌 Description (Optional, Small)               │   │   ║
║  │  │     "Limited time offer on all hampers"         │   │   ║
║  │  │                                                  │   │   ║
║  │  │  ┌──────────────────────────┐                   │   │   ║
║  │  │  │  [Shop Now →]            │  ← CTA Button     │   │   ║
║  │  │  │  (White bg, hover effect)│                   │   │   ║
║  │  │  └──────────────────────────┘                   │   │   ║
║  │  │                                                  │   │   ║
║  │  └─────────────────────────────────────────────────┘   │   ║
║  │                                                         │   ║
║  └────────────────────────────────────────────────────────┘   ║
║                                                                ║
╚═══════════════════════════════════════════════════════════════╝
   └─ Entire banner is clickable (links to ctaLink)
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ADMIN PANEL                              │
│                        (admin.html)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Admin creates/edits banner                                  │
│     ├─ Fills form (title, subtitle, CTA, etc.)                 │
│     ├─ Uploads images to ImgBB                                  │
│     └─ Clicks "Save Banner"                                     │
│                                                                  │
│  2. Admin reorders banners                                      │
│     ├─ Clicks ▲ or ▼ arrows                                    │
│     └─ Order values updated                                     │
│                                                                  │
│  3. Admin deletes banner                                        │
│     ├─ Clicks 🗑️ delete button                                 │
│     └─ Confirms deletion                                        │
│                                                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
         ┌─────────────────────────────┐
         │       FIRESTORE              │
         │  Collection: siteSettings    │
         │  Document: config            │
         │  Field: promoBanners []      │
         └─────────────────────────────┘
                       │
                       │ Real-time Sync (onSnapshot)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                      (index.html)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. loadPromotionalBanners() listens to Firestore              │
│     └─ Triggered on page load & on data changes                │
│                                                                  │
│  2. Filter & sort banners                                       │
│     ├─ Filter: active === true                                 │
│     └─ Sort: by order field (1, 2, 3...)                       │
│                                                                  │
│  3. renderPromotionalBanners(banners)                          │
│     ├─ Build HTML for each banner                              │
│     ├─ First banner: eager loading                             │
│     └─ Rest: lazy loading                                      │
│                                                                  │
│  4. Display banners on page                                     │
│     ├─ Vertical stack (one below another)                      │
│     ├─ Fully clickable                                         │
│     └─ Responsive design                                        │
│                                                                  │
│  5. Intersection Observer monitors scroll                       │
│     └─ Loads images as user scrolls near                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📱 Responsive Behavior

### Desktop (>900px)
```
╔═══════════════════════════════════════════════════════════╗
║                    FULL WIDTH BANNER                       ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ [Image]                                              │ ║
║  │ ┌──────────────────┐                                 │ ║
║  │ │ Title            │                                 │ ║
║  │ │ Subtitle         │                                 │ ║
║  │ │ [Shop Now →]     │                                 │ ║
║  │ └──────────────────┘                                 │ ║
║  │                                                      │ ║
║  └──────────────────────────────────────────────────────┘ ║
║  Gradient: Left to Right                                  ║
║  Text Align: Left                                         ║
║  Min Height: 450px                                        ║
╚═══════════════════════════════════════════════════════════╝
```

### Tablet (600-900px)
```
╔═════════════════════════════════════════════╗
║        ADJUSTED BANNER                      ║
║  ┌───────────────────────────────────────┐ ║
║  │ [Image]                               │ ║
║  │                                       │ ║
║  │ ┌──────────────┐                     │ ║
║  │ │ Title        │                     │ ║
║  │ │ Subtitle     │                     │ ║
║  │ │ [Shop Now →] │                     │ ║
║  │ └──────────────┘                     │ ║
║  └───────────────────────────────────────┘ ║
║  Gradient: Top to Bottom                   ║
║  Text Align: Left                          ║
║  Min Height: 350px                         ║
╚═════════════════════════════════════════════╝
```

### Mobile (<600px)
```
╔═══════════════════════════════╗
║     MOBILE BANNER             ║
║  ┌─────────────────────────┐ ║
║  │ [Mobile Image]          │ ║
║  │                         │ ║
║  │                         │ ║
║  │ ┌────────────────────┐  │ ║
║  │ │ Title              │  │ ║
║  │ │ Subtitle           │  │ ║
║  │ │ [Shop Now]         │  │ ║
║  │ └────────────────────┘  │ ║
║  └─────────────────────────┘ ║
║  Gradient: Strong Bottom      ║
║  Text Align: Left             ║
║  Min Height: 280px            ║
║  CTA: Smaller                 ║
╚═══════════════════════════════╝
```

---

## 🎯 Click Flow

```
User Journey:
┌────────────────┐
│ User visits    │
│ homepage       │
└────────┬───────┘
         │
         ▼
┌────────────────┐
│ Scrolls down   │
│ to banners     │
└────────┬───────┘
         │
         ▼
┌────────────────┐     ┌──────────────────┐
│ First banner   │ ──→ │ Loaded eagerly   │
│ visible        │     │ (instant)        │
└────────┬───────┘     └──────────────────┘
         │
         ▼
┌────────────────┐     ┌──────────────────┐
│ Scrolls more   │ ──→ │ Next banners     │
│                │     │ lazy load        │
└────────┬───────┘     └──────────────────┘
         │
         ▼
┌────────────────┐
│ Clicks banner  │
└────────┬───────┘
         │
         ▼
┌────────────────┐     ┌──────────────────┐
│ Redirects to   │ ──→ │ products.html    │
│ ctaLink URL    │     │ ?cat=summer      │
└────────────────┘     └──────────────────┘
```

---

## 🛠️ Admin Panel UI Flow

```
Admin Panel Flow:
┌─────────────────┐
│ Login to        │
│ admin.html      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Navigate to     │
│ Settings Tab    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Scroll to       │
│ "🎯 Promotional │
│  Banners"       │
└────────┬────────┘
         │
         ├──────┐
         │      │
         ▼      ▼
┌──────────┐  ┌──────────────┐
│ Add New  │  │ Edit Existing│
│ Banner   │  │ Banner       │
└────┬─────┘  └──────┬───────┘
     │               │
     │               │
     └───────┬───────┘
             │
             ▼
┌─────────────────────────┐
│ Fill Banner Form:       │
│ ├─ Title                │
│ ├─ Subtitle             │
│ ├─ Description          │
│ ├─ CTA Text             │
│ ├─ CTA Link             │
│ ├─ Upload Desktop Image │
│ ├─ Upload Mobile Image  │
│ ├─ Set Colors           │
│ ├─ Status (Active)      │
│ └─ Display Order        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────┐
│ Click "Save     │
│ Banner"         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Firestore       │
│ updated         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ All users       │
│ see new banner  │
│ instantly!      │
└─────────────────┘
```

---

## 🔍 Lazy Loading Visualization

```
Viewport (visible area):
┌───────────────────────────────────────┐
│                                        │
│  Banner 1 ✅ LOADED (eager)           │
│  [Visible and displayed]              │
│                                        │
├───────────────────────────────────────┤ ← Viewport Bottom
│                                        │
│  Banner 2 🔄 LOADING (approaching)    │  ← +50px margin
│  [Starts loading when within 50px]   │
│                                        │
├───────────────────────────────────────┤
│                                        │
│  Banner 3 ⏳ NOT LOADED YET           │
│  [Will load when scrolled near]       │
│                                        │
└───────────────────────────────────────┘

How it works:
1. User scrolls down
2. Intersection Observer detects Banner 2 is 50px from viewport
3. Triggers image loading
4. Image loads in background
5. Animation fades in when complete
6. Process repeats for Banner 3, 4, etc.
```

---

## 🎨 Color Scheme

```
Banner Default Colors:
┌────────────────────────────────────────┐
│ Background:  #f9e4e9 (Light Blush)    │
│ Text:        #ffffff (White)          │
│ CTA Bg:      #ffffff (White)          │
│ CTA Text:    #3b0d1a (Burgundy)       │
│ CTA Hover:   #c0647a (Deep Rose)      │
│ Overlay:     rgba(59,13,26,0.75)     │
└────────────────────────────────────────┘

Gradient Options:
Desktop:  Left → Right
          (Dark on left, transparent on right)

Mobile:   Top → Bottom  
          (Transparent top, dark on bottom)

This ensures text is always readable!
```

---

## 📏 Image Specifications

```
Desktop Banner Image:
┌─────────────────────────────────────────┐
│ Width:  1200px (or 1920px for HD)      │
│ Height: 450px  (or 600px for HD)       │
│ Ratio:  ~8:3                            │
│ Format: JPG or PNG                      │
│ Size:   < 500KB (compressed)            │
└─────────────────────────────────────────┘

Mobile Banner Image (Optional):
┌─────────────────────────────────────────┐
│ Width:  800px                           │
│ Height: 600px                           │
│ Ratio:  4:3                             │
│ Format: JPG or PNG                      │
│ Size:   < 300KB (compressed)            │
└─────────────────────────────────────────┘

Best Practices:
✅ Use high contrast text vs background
✅ Keep important content in center
✅ Test on mobile before publishing
✅ Compress images with TinyPNG or similar
```

---

## 🚦 Status Indicators

```
Banner Status in Admin Panel:
┌────────────────────────────────────────┐
│ ✅ Active   = Visible on homepage      │
│ ❌ Inactive = Hidden from homepage     │
└────────────────────────────────────────┘

Banner Display Priority:
┌────────────────────────────────────────┐
│ Order: 1 = Appears first (top)         │
│ Order: 2 = Appears second              │
│ Order: 3 = Appears third               │
│ ...and so on                           │
└────────────────────────────────────────┘

Lazy Load States:
┌────────────────────────────────────────┐
│ data-lazy="loaded" = Fully visible     │
│ data-lazy="true"   = Pending load      │
└────────────────────────────────────────┘
```

---

## ⚡ Performance Metrics

```
Page Load Performance:
┌─────────────────────────────────────────┐
│ First Banner:  < 500ms                  │
│ Second Banner: Loads on scroll          │
│ Third Banner:  Loads on scroll          │
│                                         │
│ Database Reads: 1 (for all banners)    │
│ Image Loading:  Progressive (lazy)      │
│ Real-time Sync: < 300ms                 │
└─────────────────────────────────────────┘

Optimization Strategy:
1. First banner eager → instant visibility
2. Rest lazy → saves bandwidth
3. Intersection Observer → smart loading
4. Single Firestore read → efficient
5. WebSocket sync → instant updates
```

---

**Visual Guide Version**: 1.0
**Last Updated**: April 2, 2026
**Created for**: Aneesa Hampers Website

# 🎯 Promotional Banners - Quick Start Guide

## ✅ What's Been Implemented

The promotional banner system is now fully functional with the following features:

### Frontend Features
- ✅ Vertical stacked banners (one below another)
- ✅ Fully responsive (desktop, tablet, mobile)
- ✅ Lazy loading with Intersection Observer
- ✅ Clickable banners with custom URLs
- ✅ Smooth animations and hover effects
- ✅ Auto-hide when no active banners
- ✅ Real-time updates via Firestore

### Admin Panel Features
- ✅ Add, edit, delete banners
- ✅ Reorder with up/down arrows
- ✅ Image upload (desktop + mobile versions)
- ✅ Color picker for background/text
- ✅ Active/inactive toggle
- ✅ Custom CTA text & link
- ✅ Display order management

---

## 🚀 How to Use (Admin)

### Step 1: Access Admin Panel
1. Go to `admin.html`
2. Login with admin credentials
3. Navigate to **Settings** tab
4. Scroll to **🎯 Promotional Banners** section

### Step 2: Add a New Banner

1. Click **➕ Add New Banner** button
2. Fill in the form:
   - **Title**: Main headline (e.g., "Summer Sale 2026")
   - **Subtitle**: Secondary text (e.g., "Up to 50% OFF")
   - **Description**: Optional extra text
   - **CTA Button Text**: Button label (e.g., "Shop Now")
   - **CTA Link**: Destination URL (e.g., `products.html?cat=summer`)
   - **Background Color**: Pick a color
   - **Text Color**: Pick text color
   - **Desktop Image**: Upload banner image (1200x450px recommended)
   - **Mobile Image**: Optional mobile-optimized image (800x600px)
   - **Status**: Active or Inactive
   - **Display Order**: Number (1, 2, 3...)

3. Click **💾 Save Banner**

### Step 3: Manage Banners

- **Edit**: Click ✏️ to edit an existing banner
- **Reorder**: Use ▲ ▼ arrows to move banners up/down
- **Delete**: Click 🗑️ to remove a banner
- **Toggle Active**: Edit banner and change status to hide/show

---

## 📐 Recommended Image Sizes

### Desktop Banner
- **Dimensions**: 1200px × 450px (or 1920px × 600px for HD)
- **Format**: JPG or PNG
- **File Size**: Under 500KB (compress if needed)

### Mobile Banner (Optional)
- **Dimensions**: 800px × 600px (portrait-friendly)
- **Format**: JPG or PNG
- **File Size**: Under 300KB

---

## 🎨 Example Banner Configurations

### Banner 1: Summer Sale
```
Title: Summer Sale 2026
Subtitle: Up to 50% OFF
Description: Limited time offer on all hampers
CTA Text: Shop Now
CTA Link: products.html?cat=summer
Background Color: #f9e4e9
Text Color: #ffffff
Status: Active
Order: 1
```

### Banner 2: Category Promotion
```
Title: Luxury Gift Hampers
Subtitle: Perfect for Every Occasion
Description: Handpicked collections
CTA Text: Explore Collection
CTA Link: products.html?cat=luxury
Background Color: #3b0d1a
Text Color: #ffffff
Status: Active
Order: 2
```

### Banner 3: Redirect to Product
```
Title: Featured Product
Subtitle: Chocolate Lovers Hamper
CTA Text: View Details
CTA Link: product.html?id=PRODUCT_ID_HERE
Background Color: #c0647a
Text Color: #ffffff
Status: Active
Order: 3
```

---

## 🔥 Live Example URLs

### Products Page with Category Filter
```
products.html?cat=chocolates
products.html?cat=dry-fruits
products.html?cat=luxury
products.html?cat=festive
```

### Direct Product Link
```
product.html?id=YOUR_PRODUCT_ID
```

### Custom Pages
```
contact.html
about.html (if exists)
```

---

## 📊 Firestore Structure

Banners are stored in:
```
Collection: siteSettings
Document: config
Field: promoBanners (array)
```

Example data structure:
```json
{
  "promoBanners": [
    {
      "id": "pb_1234567890",
      "title": "Summer Sale 2026",
      "subtitle": "Up to 50% OFF",
      "description": "Limited time offer",
      "ctaText": "Shop Now",
      "ctaLink": "products.html?cat=summer",
      "image": "https://i.ibb.co/xxxxx/banner1.jpg",
      "imageMobile": "https://i.ibb.co/xxxxx/banner1-mobile.jpg",
      "bgColor": "#f9e4e9",
      "textColor": "#ffffff",
      "active": true,
      "order": 1
    }
  ]
}
```

---

## ⚙️ Technical Details

### Where Banners Are Displayed
- **Homepage**: Between categories section and featured products
- **Section ID**: `#promoBannersSection`
- **Container**: `#promoBannersContainer`

### Performance Optimizations
- **First banner**: Loaded eagerly (visible immediately)
- **Rest**: Lazy loaded as user scrolls
- **Intersection Observer**: Starts loading 50px before banner enters viewport
- **Real-time Updates**: Changes in admin panel reflect instantly on all user devices

### Mobile Responsive Behavior
- **Desktop (>900px)**: Full-width banners with left-aligned text
- **Tablet (600-900px)**: Adjusted overlay (bottom gradient)
- **Mobile (<600px)**: Compact layout, smaller CTA buttons

---

## 🐛 Troubleshooting

### Banner Not Showing
1. Check if banner is marked as **Active** in admin panel
2. Verify at least one banner exists
3. Check browser console for errors
4. Clear cache and refresh page

### Image Not Uploading
1. Ensure image is under 5MB
2. Use JPG or PNG format
3. Check ImgBB API key is configured correctly
4. Try a different image

### Banner Link Not Working
1. Verify URL format (e.g., `products.html?cat=summer`)
2. Check for typos in link
3. Test link in new browser tab first

### Reorder Not Working
1. Refresh admin panel
2. Try reordering again
3. Check Firestore permissions

---

## 📝 Best Practices

### Content
- ✅ Keep titles short (3-5 words)
- ✅ Use compelling CTAs ("Shop Now", "Explore", "Get Yours")
- ✅ Ensure text contrasts well with background

### Images
- ✅ Use high-quality images
- ✅ Compress before upload
- ✅ Include text overlay in image OR use solid backgrounds
- ✅ Test on mobile after uploading

### Performance
- ✅ Limit to 3-5 active banners
- ✅ Optimize images (under 500KB each)
- ✅ Use mobile-specific images for better mobile performance

### Design
- ✅ Maintain consistent brand colors
- ✅ Ensure readability (text color vs background)
- ✅ Use gradients for better text visibility
- ✅ Test hover effects on desktop

---

## 🎯 Next Steps

1. **Upload Banner Images**: Prepare and compress your banner images
2. **Create Banners**: Add 2-3 promotional banners in admin panel
3. **Test**: View homepage on desktop and mobile
4. **Monitor**: Check analytics to see banner click-through rates
5. **Update Regularly**: Change banners based on seasons/promotions

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12)
2. Verify Firestore security rules allow write access
3. Ensure ImgBB API key is configured
4. Clear browser cache

---

**Status**: ✅ Fully Implemented and Ready to Use
**Last Updated**: April 2, 2026
**Version**: 1.0

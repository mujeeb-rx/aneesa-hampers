# 📞 Contact Section - Quick Reference Guide

## 🎯 What You Got

✅ **Updated Footer** on index.html with full contact details  
✅ **New Contact Page** (contact.html) with Google Maps  
✅ **Clickable Links** for phone, email, and maps  
✅ **Mobile Responsive** design for all screen sizes  

---

## 📧 Contact Information Added

```
Business Name: Aneesa Hampers

Address:
13/384, Rahmatullah Street
near Facebook Fashion
Kadapa – 516001
Andhra Pradesh, India

Phone Numbers:
📞 +91 98661 68786 (Primary)
📞 +91 97002 10086 (Secondary)

Email:
✉️ aneesahampers@gmail.com

Business Hours:
🕐 8:00 AM – 10:00 PM (Daily)
💬 WhatsApp: 24/7
```

---

## 🗺️ Links Added

### Direct Call Links (Mobile)
When clicked on mobile → Opens phone dialer
```html
tel:+919866168786
tel:+919700210086
```

### Email Link
When clicked → Opens email client
```html
mailto:aneesahampers@gmail.com
```

### Google Maps Link
When clicked → Opens directions
```html
https://maps.google.com/?q=13/384,Rahmatullah+Street,Kadapa,516001
```

### WhatsApp Link
When clicked → Opens WhatsApp chat
```html
https://wa.me/919866168786
```

---

## 📱 How It Looks

### **Desktop Footer (index.html)**
```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  [Aneesa Hampers Logo]      [CONTACT US]         [Navigate]  [Categories]│
│  Premium handcrafted...      📍 Address:         • Home      • Hampers   │
│                              13/384, Rahma...     • Products  • Cakes    │
│  📸 💬 📞                    📞 Phone:            • Orders    • Decor    │
│                              +91 98661 68786      • Cart      • Resin    │
│                              +91 97002 10086      • Account   • Wedding  │
│                                                                      │
│                              ✉️ Email:                              │
│                              aneesa...@gmail                         │
│                                                                      │
│                              📍 [View on Map]                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### **Mobile Footer (index.html)**
```
┌──────────────────────┐
│ [Aneesa Hampers]     │
│ Premium handcrafted… │
│ 📸 💬 📞             │
├──────────────────────┤
│ CONTACT US           │
│ 📍 Address:          │
│ 13/384, Rahma...     │
│                      │
│ 📞 +91 98661 68786   │
│ 📞 +91 97002 10086   │
│                      │
│ ✉️ aneesa@gmail.com │
│ 📍 [View on Map]     │
├──────────────────────┤
│ Navigate    Categories│
│ • Home      • Hampers │
│ • Products  • Cakes   │
└──────────────────────┘
```

### **Contact Page (contact.html)**
```
┌─────────────────────────────────────┐
│     GET IN TOUCH                    │
│  We'd love to hear from you!        │
└─────────────────────────────────────┘

┌─────────────┐  ┌─────────────┐
│ 📞 Call Us  │  │ 💬 WhatsApp │
│             │  │             │
│ [Phone 1]   │  │ [Chat Now]  │
│ [Phone 2]   │  │             │
└─────────────┘  └─────────────┘

┌─────────────┐  ┌─────────────┐
│ ✉️ Email    │  │ 📍 Visit    │
│             │  │             │
│ [Send Mail] │  │ [Directions]│
└─────────────┘  └─────────────┘

┌──────────────────────────────────┐
│ 📍 Aneesa Hampers               │
│                                  │
│ Address: 13/384, Rahma...       │
│ Phone: +91 98661 68786          │
│ Email: aneesa...@gmail.com      │
│ Hours: 8 AM - 10 PM Daily       │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│                                  │
│      [GOOGLE MAP EMBEDDED]       │
│                                  │
└──────────────────────────────────┘
```

---

## 🎨 Color Theme

```
Dark Background:   #0e0408 (almost black)
Text Color:        rgba(255,255,255,.55) (light gray)
Headings:          #e8a0b0 (rose pink)
Hover Color:       #c0647a (deep rose)
Links:             rgba(255,255,255,.7) (lighter)
```

---

## 🔧 Quick Edit Guide

### To Change Phone Numbers:
1. Find: `tel:+919866168786`
2. Replace with your number
3. Also update display text: `+91 98661 68786`

### To Change Email:
1. Find: `mailto:aneesahampers@gmail.com`
2. Replace with your email
3. Also update display text

### To Change Address:
1. Find: `13/384, Rahmatullah Street`
2. Replace with your address
3. Update Google Maps link with new address

### To Update Map:
1. Go to Google Maps
2. Search for your address
3. Click "Share" → "Embed a map"
4. Copy iframe code
5. Replace in contact.html (around line 233)

---

## 📄 Files You Can Use

### Main Files
- `index.html` - Homepage with updated footer
- `contact.html` - Dedicated contact page

### Documentation
- `CONTACT-SECTION-IMPLEMENTATION.md` - Full technical guide
- `CONTACT-QUICK-REFERENCE.md` - This guide

---

## ✅ Test Your Contact Links

### On Desktop Browser:
1. Open `index.html`
2. Scroll to footer
3. Click phone numbers → Should open Skype/default dialer
4. Click email → Should open email client
5. Click "View on Map" → Should open Google Maps

### On Mobile Phone:
1. Open `index.html` on phone
2. Scroll to footer  
3. Click phone numbers → Should open phone dialer
4. Click email → Should open email app
5. Click "View on Map" → Should open Maps app
6. Go to `contact.html` → All cards should work

---

## 🚀 What's Next?

### Optional Enhancements:
1. **Add footer to other pages** (products.html, cart.html, etc.)
2. **Update Google Maps coordinates** to exact location
3. **Add contact form** on contact page for inquiries
4. **Add business hours widget** showing "Open Now" status
5. **Link contact page** in navigation menu

### To Add Footer to Other Pages:
1. Open the page (e.g., products.html)
2. Find the closing `</body>` tag
3. Copy footer from index.html (lines 2084-2131)
4. Paste before `</body>`
5. Copy footer CSS from index.html (lines 613-625)
6. Paste in that page's `<style>` section
7. Save and test!

---

**Need Help?**
- Check `CONTACT-SECTION-IMPLEMENTATION.md` for detailed guide
- All links use standard HTML - compatible with all browsers
- Tested on Chrome, Firefox, Safari, and mobile browsers

---

_Updated: April 2, 2026_

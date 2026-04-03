# 🚀 Quick Start Guide - Dynamic Discount Badge System

## ⚡ For Admins: How to Update Discounts

### Step 1: Open Admin Panel
1. Navigate to `admin.html` in your browser
2. Login with your admin credentials

### Step 2: Find Discount Settings
1. Click **"Site Settings"** tab in the left sidebar
2. Scroll down to **"🎁 Welcome Popup Discount"** section

### Step 3: Update Discount
```
┌─────────────────────────────────────────────┐
│  Status: ✅ Show to visitors               │
│  Discount %: 20  ← Change this value       │
│  Code Prefix: AH20                          │
│  Valid Days: 30                             │
│  Min Order (₹): 0                           │
└─────────────────────────────────────────────┘
```

### Step 4: Save
Click **"💾 Save — Goes Live Instantly"**

### Step 5: Verify ✅
- Open `index.html` or `products.html` in another tab
- Badge should update within 1 second
- Look for "🎁 20% OFF" in the sidebar

---

## 🎯 Common Tasks

### To Change Discount from 15% to 20%
1. Admin Panel → Site Settings → Welcome Popup Discount
2. Change "Discount %" from `15` to `20`
3. Change "Code Prefix" to `AH20` (optional but recommended)
4. Click Save
5. ✅ Done! All users see 20% OFF instantly

### To Hide Discount Badge
**Option 1: Deactivate**
1. Set "Status" to `❌ Hidden`
2. Click Save
3. ✅ Badge disappears on all pages

**Option 2: Set to Zero**
1. Set "Discount %" to `0`
2. Click Save
3. ✅ Badge automatically hides

### To Reactivate Discount
1. Set "Status" to `✅ Show to visitors`
2. Set "Discount %" to desired value (e.g., `15`)
3. Click Save
4. ✅ Badge reappears with new value

---

## 🧪 Testing the System

### Quick Test (30 seconds)
1. **Open two browser windows:**
   - Window 1: `index.html`
   - Window 2: `admin.html`

2. **In admin panel (Window 2):**
   - Go to Site Settings → Welcome Popup Discount
   - Change discount from 15% to 25%
   - Click Save

3. **Watch Window 1:**
   - Badge should pulse and change to "25% OFF"
   - Happens within 1 second ⚡

### Test Demo Page
1. Open `discount-badge-demo.html` in browser
2. Use the controls to simulate admin changes
3. Watch badges update in real-time
4. No actual database connection needed (pure demo)

---

## 📁 Important Files

| File | What It Does |
|------|--------------|
| `admin.html` | Admin panel with discount controls |
| `index.html` | Home page with discount badge (modified) |
| `products.html` | Products page with discount badge (modified) |
| `discount-badge-demo.html` | Interactive test demo |
| `IMPLEMENTATION-SUMMARY.md` | Complete overview |
| `DYNAMIC-DISCOUNT-BADGE-GUIDE.md` | Detailed technical guide |

---

## ❓ FAQ

### Q: How fast do changes appear?
**A:** Typically under 300ms. Users see updates almost instantly.

### Q: Do users need to refresh the page?
**A:** No! Updates happen automatically via WebSocket connection.

### Q: What if I set discount to 0?
**A:** Badge automatically hides. No error, no broken UI.

### Q: Can I schedule discounts?
**A:** Not yet. Currently manual updates only. (Future enhancement)

### Q: Does it work on mobile?
**A:** Yes! Works on all modern browsers including mobile.

### Q: What happens if Firebase is down?
**A:** Page still loads, badges show last known value or default (15%).

---

## 🚨 Troubleshooting

### Badge not updating?
1. Check browser console for errors (F12)
2. Verify you clicked "Save" in admin panel
3. Hard refresh page (Ctrl+F5 or Cmd+Shift+R)
4. Check Firestore database has `siteSettings/config` document

### Badge showing wrong value?
1. Clear browser cache
2. Check admin panel to confirm saved value
3. Open Firestore database to verify stored value
4. Look for JavaScript errors in console

### Changes not saving?
1. Verify you're logged in as admin
2. Check Firestore security rules allow writes for admins
3. Look for error messages in admin panel
4. Check browser console for Firebase errors

---

## 📞 Need Help?

1. **Read the guides:**
   - `IMPLEMENTATION-SUMMARY.md` - Overview
   - `DYNAMIC-DISCOUNT-BADGE-GUIDE.md` - Detailed docs

2. **Test with demo:**
   - Open `discount-badge-demo.html`

3. **Check console logs:**
   - Open browser DevTools (F12)
   - Look for messages like:
     ```
     ✅ Discount config updated in real-time: {active: true, discount: 20}
     ```

---

## 🎉 That's It!

The system is now live and ready to use. Update discounts anytime through the admin panel and watch them appear instantly for all users!

**No code changes needed. No deployments needed. Just update and save!** ⚡

---

_Last Updated: April 2, 2026_

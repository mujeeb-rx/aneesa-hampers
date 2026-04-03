# Testing Guide: Mobile Sidebar UI

## Quick Test (5 minutes)

### Test 1: Visual Check
1. Open `account.html` in your browser
2. Press `F12` to open DevTools
3. Click the device toolbar icon (or press `Ctrl+Shift+M`)
4. Select "iPhone 12 Pro" or any mobile device
5. **Expected**: You should see a hamburger menu (☰) in the top-left corner

### Test 2: Sidebar Functionality
1. Click the hamburger button
2. **Expected**:
   - ✅ Sidebar slides in from the left
   - ✅ Dark overlay appears over the page
   - ✅ Page content becomes slightly blurred/dimmed
   - ✅ Sidebar shows "Welcome back, [Name]" at the top
   - ✅ Navigation links are styled (NOT blue and underlined)

### Test 3: Navigation Links
1. With sidebar open, check the links:
   - ✅ Links have icons (🏠, 🎁, 📂, etc.)
   - ✅ Links have arrows (›) on the right
   - ✅ Hover over a link - it should highlight
   - ✅ No blue color, no underlines
   - ✅ Text is cream/off-white color

### Test 4: Close Sidebar
Try each method:
- Click the ✕ button in top-right of sidebar → Sidebar closes
- Click the dark overlay area → Sidebar closes
- Press `Escape` key → Sidebar closes

### Test 5: All Pages
Repeat tests 1-4 on these pages:
- `cart.html`
- `orders.html`
- `account.html`
- `index.html`
- `products.html`

---

## Detailed Testing (15 minutes)

### A. Desktop View (>900px)
1. Resize browser to desktop width (>900px)
2. **Expected**:
   - ❌ NO hamburger button visible
   - ✅ Regular horizontal navigation bar
   - ✅ Desktop layout

### B. Tablet View (601px - 900px)
1. Resize to 800px width
2. **Expected**:
   - ✅ Hamburger button appears
   - ✅ Sidebar works perfectly
   - ✅ Desktop nav hidden

### C. Mobile View (≤600px)
1. Resize to 375px width (iPhone SE)
2. **Expected**:
   - ✅ Hamburger button visible
   - ✅ Bottom nav bar appears (if on certain pages)
   - ✅ Sidebar slides in smoothly

### D. Animation Smoothness
1. Open sidebar
2. Watch the animation closely
3. **Expected**:
   - ✅ Smooth slide-in (no jerking)
   - ✅ Takes about 0.35 seconds
   - ✅ Overlay fades in smoothly
   - ✅ 60fps animation (no lag)

### E. Touch Interaction (on real device)
1. Open site on actual phone
2. Tap hamburger button
3. **Expected**:
   - ✅ Immediate response (no delay)
   - ✅ No blue highlight flash
   - ✅ Smooth animation
   - ✅ Links feel responsive

### F. Z-Index Layering
1. Open sidebar
2. Try clicking elements behind sidebar
3. **Expected**:
   - ❌ Can't click content behind overlay
   - ✅ Sidebar stays on top
   - ✅ Close button always clickable

### G. Scroll Behavior
1. Open sidebar
2. Try scrolling the main page
3. **Expected**:
   - ❌ Page doesn't scroll
   - ✅ Only sidebar content scrolls (if long)
   - ✅ Body scroll locked

### H. User Session States
Test with and without logged-in user:

**Logged Out:**
1. Clear localStorage: `localStorage.clear()`
2. Refresh page
3. Open sidebar
4. **Expected**:
   - ✅ Shows "🌸 Discover premium gifting"
   - ✅ Shows "🔐 Sign In / Register" button
   - ✅ No user name

**Logged In:**
1. Open `login.html` and sign in
2. Navigate to any page
3. Open sidebar
4. **Expected**:
   - ✅ Shows "👤 Welcome back,"
   - ✅ Shows user name
   - ✅ Shows "🔒 Sign Out" button at bottom

### I. Cart Badge
1. Add items to cart
2. Open sidebar
3. Check "🛒 My Cart" link
4. **Expected**:
   - ✅ Red badge with item count
   - ✅ Updates when cart changes

### J. Expandable Categories
1. Open sidebar
2. Click "📂 Categories" button
3. **Expected**:
   - ✅ Sub-menu expands smoothly
   - ✅ Arrow rotates 90°
   - ✅ Shows indented sub-links
   - ✅ Click again to collapse

---

## Troubleshooting

### Issue: No hamburger button visible
**Check:**
- Browser width is ≤900px?
- DevTools device mode is enabled?
- Page is fully loaded?
- Clear cache and refresh

### Issue: Sidebar doesn't slide in
**Check:**
- Check browser console for errors (F12)
- Verify `mobilenav.js` is loaded
- Check that JavaScript is enabled
- Try in incognito mode

### Issue: Links are still blue and underlined
**Check:**
- Hard refresh the page (Ctrl+Shift+R)
- Check if custom styles are blocked
- Verify CSS is in the `<style>` tag
- Look for CSS conflicts

### Issue: Overlay doesn't appear
**Check:**
- Check z-index in CSS
- Look for conflicting position styles
- Verify `#enh-overlay` element exists
- Check console for errors

### Issue: Animation is janky
**Check:**
- Test in different browser
- Check CPU usage (close other tabs)
- Try hardware acceleration:
  - Chrome: `chrome://flags/#hardware-acceleration`
- Reduce `transition` duration for testing

### Issue: Can't close sidebar
**Check:**
- Click the ✕ button directly
- Try pressing Escape key
- Check if `enhSbClose()` function exists
- Refresh page and try again

---

## Browser DevTools Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select device from dropdown
4. Test on various preset devices:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - Pixel 5 (393px)
   - Samsung Galaxy S20 Ultra (412px)
   - iPad Mini (768px)

### Firefox Responsive Design Mode
1. Press `Ctrl+Shift+M`
2. Select device from list
3. Test touch simulation

### Safari (iOS Simulator)
1. Open Xcode
2. Launch iOS Simulator
3. Open Safari in simulator
4. Navigate to your local site

---

## Performance Testing

### Load Time
1. Open DevTools Network tab
2. Disable cache
3. Refresh page
4. **Expected**:
   - ✅ CSS loads in <100ms
   - ✅ JS loads in <150ms
   - ✅ Total page load <1s

### Animation Performance
1. Open DevTools Performance tab
2. Start recording
3. Open and close sidebar 5 times
4. Stop recording
5. **Expected**:
   - ✅ 60fps during animation
   - ✅ No layout thrashing
   - ✅ No forced reflows

### Memory
1. Open DevTools Memory tab
2. Take heap snapshot
3. Open/close sidebar 20 times
4. Take another snapshot
5. **Expected**:
   - ✅ No memory leaks
   - ✅ Memory usage stable

---

## Accessibility Testing

### Keyboard Navigation
- ✅ `Tab` to hamburger button
- ✅ `Enter` opens sidebar
- ✅ `Escape` closes sidebar
- ✅ Focus visible

### Screen Reader
1. Enable screen reader (NVDA/JAWS)
2. Navigate to hamburger button
3. **Expected**:
   - ✅ Announces "Open menu button"
   - ✅ Announces expanded state
   - ✅ Reads link text correctly

### Color Contrast
- ✅ Text passes WCAG AA (4.5:1)
- ✅ Buttons have sufficient contrast
- ✅ Focus indicators visible

---

## Automated Testing (Optional)

### Lighthouse (Chrome)
1. Open DevTools
2. Go to Lighthouse tab
3. Select "Mobile" device
4. Run audit
5. **Expected scores**:
   - Performance: >90
   - Accessibility: >95
   - Best Practices: >95

### HTML Validation
1. Go to https://validator.w3.org/
2. Enter page URL or upload HTML
3. **Expected**:
   - ✅ No errors
   - ⚠️ Warnings OK (if minor)

---

## Sign-Off Checklist

Before considering the fix complete:

- [ ] Hamburger button visible on mobile (all pages)
- [ ] Sidebar slides in smoothly
- [ ] Navigation links properly styled
- [ ] No blue underlined text
- [ ] Overlay appears and works
- [ ] Close button works
- [ ] Overlay click closes sidebar
- [ ] Escape key closes sidebar
- [ ] No content overlap
- [ ] Smooth 60fps animations
- [ ] Works on iOS Safari
- [ ] Works on Chrome Mobile
- [ ] Works on Firefox Mobile
- [ ] Desktop view unaffected
- [ ] No console errors
- [ ] User greeting shows correctly
- [ ] Cart badge updates
- [ ] Categories expand/collapse
- [ ] WhatsApp button works
- [ ] Sign out button appears (when logged in)

---

## Test Results Template

```
Test Date: __________
Tester: __________
Browser: __________
Device: __________

✅ = Pass, ❌ = Fail, ⚠️ = Issue

[ ] Visual appearance correct
[ ] Hamburger button clickable
[ ] Sidebar animation smooth
[ ] Links properly styled
[ ] No blue underlined text
[ ] Overlay backdrop works
[ ] Close methods work (all 3)
[ ] No layout breaks
[ ] Responsive on all sizes
[ ] No console errors

Notes:
_________________________________
_________________________________
_________________________________

Overall Status: PASS / FAIL
```

---

## Quick Fix Commands

If you need to revert or debug:

```javascript
// In browser console:

// Check if sidebar exists
document.getElementById('enh-sidebar')

// Check if overlay exists
document.getElementById('enh-overlay')

// Manually open sidebar
enhSbOpen()

// Manually close sidebar
enhSbClose()

// Check if CSS class is applied
document.getElementById('enh-sidebar').classList.contains('open')

// Clear and rebuild sidebar
document.getElementById('enh-sidebar')?.remove()
document.getElementById('enh-overlay')?.remove()
location.reload()
```

---

## Support

If you encounter issues not covered here:

1. Check `MOBILE-SIDEBAR-FIX-SUMMARY.md` for overview
2. Check `BEFORE-AFTER-COMPARISON.md` for visual reference
3. Review browser console for errors
4. Test in incognito/private mode
5. Clear cache and cookies
6. Try different browser

**Last Updated**: April 3, 2026  
**Version**: 1.0

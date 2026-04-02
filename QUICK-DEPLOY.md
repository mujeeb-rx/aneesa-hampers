# Quick Deploy Guide — Admin Email Notifications

## 🚀 3-Step Setup

### Step 1: Create Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not enabled)
3. Click **App passwords** at bottom
4. Generate password for "Mail" → "Other device"
5. Copy the 16-character code

### Step 2: Configure Firebase

```bash
cd functions
firebase functions:config:set email.user="phatanmujeebkhan64@gmail.com"
firebase functions:config:set email.pass="YOUR-16-CHAR-APP-PASSWORD"
```

### Step 3: Deploy

```bash
cd ..
firebase deploy --only functions
```

---

## ✅ Test It

1. Place a test order on your website
2. Check email: `phatanmujeebkhan64@gmail.com`
3. You should receive: **New Order notification**

---

## 📋 What Gets Sent

Every new order triggers 2 emails:

1. **Customer** → Order confirmation ✅ (already working)
2. **Admin** → New order alert 🆕 (new feature)

**Admin email includes:**
- Customer name, phone, email, address
- All items ordered
- Total amount
- Payment method
- Gift message (if any)
- Quick action buttons

---

## 🔍 View Logs

```bash
firebase functions:log
```

---

## ⚙️ Change Admin Email

Edit `functions/index.js` line ~45:

```javascript
adminEmail: "NEW-EMAIL@gmail.com",
```

Then redeploy:
```bash
firebase deploy --only functions
```

---

## 💡 Common Issues

**❌ Email not arriving?**
- Check spam folder
- Verify App Password (not regular password)
- Check logs: `firebase functions:log`

**❌ Function error?**
- Make sure you're in the correct directory
- Run: `cd functions && npm install`
- Check Firebase console for errors

---

## 📞 Quick Commands

| Task | Command |
|------|---------|
| Deploy functions | `firebase deploy --only functions` |
| View logs | `firebase functions:log` |
| Check config | `firebase functions:config:get` |
| Install dependencies | `cd functions && npm install` |

---

**Read full guide:** `ADMIN-EMAIL-SETUP-GUIDE.md`

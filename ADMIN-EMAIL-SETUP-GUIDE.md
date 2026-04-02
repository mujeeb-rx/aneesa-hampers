# Admin Email Notification Setup Guide

## ✅ What's Been Implemented

Automatic email notifications are now sent to the admin (`phatanmujeebkhan64@gmail.com`) whenever a new order is placed.

### Features:
- **Instant notifications** when orders are created
- **Complete order details** including:
  - Customer name, phone, email, and delivery address
  - All ordered items with images and prices
  - Total amount, discounts, and delivery charges
  - Payment method
  - Gift messages (if any)
- **Direct action buttons**:
  - View full order in admin panel
  - Contact customer via WhatsApp
- **Professional email design** optimized for Gmail
- **Reliable delivery** using Firebase Cloud Functions + Nodemailer

---

## 🚀 Deployment Steps

### 1. Configure Gmail SMTP Credentials

You need to set up Gmail authentication for sending emails:

#### Option A: Using Firebase Functions Config (Recommended)

```bash
# Navigate to functions directory
cd functions

# Set Gmail credentials
firebase functions:config:set email.user="your-gmail@gmail.com"
firebase functions:config:set email.pass="your-app-password"
```

#### Option B: Using Environment Variables

```bash
# Set secrets (Firebase Functions Gen 2)
firebase functions:secrets:set GMAIL_USER
# When prompted, enter: your-gmail@gmail.com

firebase functions:secrets:set GMAIL_PASS
# When prompted, enter: your-app-password
```

### 2. Get Gmail App Password

**⚠️ IMPORTANT:** You cannot use your regular Gmail password. You must create an **App Password**.

1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not already)
3. Scroll to **App passwords** at the bottom
4. Click **App passwords**
5. Select:
   - **App:** Mail
   - **Device:** Other (custom name) → "Aneesa Hampers Functions"
6. Click **Generate**
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
8. Use this password in the config above (remove spaces)

### 3. Deploy Firebase Functions

```bash
# Make sure you're in the project root
cd "c:\Users\mujee\OneDrive\Desktop\old website"

# Deploy only functions
firebase deploy --only functions

# OR deploy specific function
firebase deploy --only functions:onOrderCreate
```

### 4. Verify Deployment

After deployment:

1. **Check Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select your project
   - Navigate to **Functions** section
   - Verify `onOrderCreate` shows "Active" status

2. **Test with a sample order:**
   - Place a test order on your website
   - Check admin email (`phatanmujeebkhan64@gmail.com`)
   - Both customer AND admin should receive emails

3. **Check logs:**
```bash
firebase functions:log
```

---

## 📧 Email Preview

### Admin Notification Email Contains:

```
┌─────────────────────────────────────┐
│     🔔 New Order Received!          │
│     [Date and Time]                 │
├─────────────────────────────────────┤
│                                     │
│        Order ID: #ABC123            │
│                                     │
├─────────────────────────────────────┤
│  👤 Customer Information            │
│  Name: John Doe                     │
│  Phone: 📞 +91 98765 43210          │
│  Email: john@example.com            │
│  Address: 📍 123 Main St, Kadapa    │
├─────────────────────────────────────┤
│  🛍️ Items to Prepare                │
│  • Luxury Hamper × 1 - ₹1,499       │
│  • Premium Cake × 1 - ₹899          │
├─────────────────────────────────────┤
│  💰 Order Summary                   │
│  Discount: − ₹200                   │
│  Delivery: ₹50                      │
│  Payment: UPI                       │
│  Total Amount: ₹2,248               │
├─────────────────────────────────────┤
│  💌 Gift Message (if any)           │
│  "Happy Birthday! Love, Sarah"      │
├─────────────────────────────────────┤
│                                     │
│  [View Full Order →]                │
│  [💬 Contact Customer]              │
│                                     │
└─────────────────────────────────────┘
```

---

## 🔧 Customization

### Change Admin Email

Edit `functions/index.js` (line ~45):

```javascript
const BRAND = {
  name:       "Aneesa Hampers",
  email:      "noreply@aneesahampers.in",
  adminEmail: "NEW-ADMIN-EMAIL@gmail.com", // ← Change this
  // ...
};
```

Then redeploy:
```bash
firebase deploy --only functions
```

### Add Multiple Admin Recipients

Modify the admin notification section in `functions/index.js` (around line 820):

```javascript
// Multiple recipients
await sendMail({
  to:      "admin1@gmail.com, admin2@gmail.com",  // Comma-separated
  subject: `🔔 New Order #${shortId} — ₹${total}`,
  html:    adminHtml,
  type:    "admin_order_notification",
  orderId: orderId
});
```

---

## 🛠️ Troubleshooting

### Issue: Emails not arriving

**Check 1: Gmail credentials**
```bash
firebase functions:config:get
# Should show: email.user and email.pass
```

**Check 2: App Password**
- Make sure you're using an App Password, not regular password
- Verify 2-Step Verification is enabled on Gmail account

**Check 3: Function logs**
```bash
firebase functions:log --only onOrderCreate
```

### Issue: Admin email fails but customer email works

Check logs for specific error:
```bash
firebase functions:log | grep "Admin notification"
```

Common causes:
- Invalid admin email address
- Gmail rate limits (max 100 emails/day for free tier)
- App Password expired

### Issue: Function timeout

Increase timeout in `functions/index.js`:

```javascript
exports.onOrderCreate = functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 120,  // Increase from default 60s
    memory: '512MB'
  })
  .firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    // ...
  });
```

---

## 📊 Email Analytics

All sent emails are logged to Firestore collection: `email_analytics`

View in Firebase Console or query:

```javascript
db.collection("email_analytics")
  .where("type", "==", "admin_order_notification")
  .orderBy("sentAt", "desc")
  .limit(50)
  .get()
```

Track:
- Email status (sent/failed)
- Delivery timestamps
- Open/click tracking
- Error messages for failed sends

---

## 🔒 Security Notes

1. **Never commit Gmail credentials** to Git
2. Use Firebase Functions config or secrets (already configured)
3. App Passwords are safer than account passwords
4. Rotate App Passwords periodically
5. Monitor `email_analytics` for suspicious activity

---

## ✅ Testing Checklist

Before going live:

- [ ] Gmail App Password created and configured
- [ ] Functions deployed successfully
- [ ] Test order placed
- [ ] Customer email received
- [ ] **Admin email received** ✅
- [ ] All order details correct in admin email
- [ ] Action buttons work (View Order, Contact Customer)
- [ ] Email renders correctly in Gmail (desktop & mobile)
- [ ] Logs show no errors

---

## 📞 Support

If you encounter issues:

1. Check Firebase Functions logs
2. Verify Gmail configuration
3. Test with a simple order
4. Review `email_analytics` collection
5. Check spam folder in admin Gmail

**Firebase Console:** https://console.firebase.google.com/
**Functions Logs:** `firebase functions:log`

---

## 🎉 Summary

You now have:
- ✅ Automatic admin notifications on new orders
- ✅ Complete order details in email
- ✅ Instant alerts to Gmail inbox
- ✅ Professional HTML email design
- ✅ Analytics tracking
- ✅ Error handling and logging

**Next step:** Deploy the functions and test!

```bash
firebase deploy --only functions
```

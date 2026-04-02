# Setup Email Credentials - Hardcoded Method

## ⚠️ IMPORTANT SECURITY WARNING

You are using hardcoded credentials. This is **LESS SECURE** than using Firebase config, but simpler to set up.

**DO NOT:**
- Share this code with anyone
- Commit to GitHub or public repositories
- Share screenshots of `functions/index.js`

---

## 🔐 Step 1: Get Gmail App Password

1. Go to: **https://myaccount.google.com/security**

2. **Enable 2-Step Verification:**
   - Scroll to "How you sign in to Google"
   - Click "2-Step Verification"
   - Follow setup if not enabled

3. **Create App Password:**
   - Scroll to bottom → "App passwords"
   - Click it (may need to re-enter password)
   - Select:
     - **App:** Mail
     - **Device:** Other (custom name)
     - Type: "Aneesa Hampers"
   - Click **Generate**

4. **Copy the 16-character password**
   - Format looks like: `abcd efgh ijkl mnop`
   - Copy it (you'll need it in next step)

---

## 📝 Step 2: Add Password to Code

1. **Open file:** `functions/index.js`

2. **Find lines 17-19** (near the top):
   ```javascript
   const EMAIL_CONFIG = {
     user: "phatanmujeebkhan64@gmail.com",  // Your Gmail address
     pass: "YOUR_GMAIL_APP_PASSWORD_HERE"   // ⚠️ Replace this!
   };
   ```

3. **Replace `YOUR_GMAIL_APP_PASSWORD_HERE`** with your App Password:
   ```javascript
   const EMAIL_CONFIG = {
     user: "phatanmujeebkhan64@gmail.com",
     pass: "abcdefghijklmnop"  // ← Paste your 16-char password (no spaces)
   };
   ```

4. **Remove all spaces** from the password (just letters/numbers)

5. **Save the file** (Ctrl + S)

---

## 🚀 Step 3: Deploy to Firebase

```bash
# Navigate to your project folder
cd "c:\Users\mujee\OneDrive\Desktop\old website"

# Deploy functions
firebase deploy --only functions
```

Wait for deployment to complete (usually 1-2 minutes).

---

## ✅ Step 4: Test It

1. **Place a test order** on your website

2. **Check TWO emails:**
   - Customer email (order confirmation) ✅
   - **Admin email** (`phatanmujeebkhan64@gmail.com`) 🆕
     - Subject: "🔔 New Order #ABC123..."
     - Contains all order details

3. **Check spam folder** if not in inbox

---

## 🔍 Troubleshooting

### ❌ Error: "Invalid login"

**Solution:** Make sure you're using App Password, NOT your regular Gmail password
- Go back to Step 1
- Create a new App Password
- Copy it carefully (no spaces)

### ❌ Error: "Username and Password not accepted"

**Checklist:**
- [ ] 2-Step Verification is enabled
- [ ] Using App Password (not regular password)
- [ ] Removed all spaces from password
- [ ] Correct Gmail address
- [ ] Saved file before deploying

### ❌ Email not arriving

1. **Check Firebase logs:**
   ```bash
   firebase functions:log
   ```

2. **Look for errors** related to email

3. **Check spam folder** in Gmail

4. **Verify deployment:**
   - Go to: https://console.firebase.google.com
   - Select your project
   - Functions → Check if `onOrderCreate` is Active

---

## 📊 View Logs

```bash
# View all function logs
firebase functions:log

# View only recent logs
firebase functions:log --lines 50

# Watch logs in real-time
firebase functions:log --follow
```

---

## ✏️ Change Email or Password Later

1. Open `functions/index.js`
2. Edit lines 17-19:
   ```javascript
   const EMAIL_CONFIG = {
     user: "NEW-EMAIL@gmail.com",
     pass: "new-app-password-here"
   };
   ```
3. Save file
4. Redeploy: `firebase deploy --only functions`

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep this code private
- Use a dedicated email for sending (not your personal one)
- Rotate App Password every 3-6 months
- Monitor email analytics for suspicious activity

### ❌ DON'T:
- Commit to GitHub with credentials
- Share `functions/index.js` file
- Use your main personal Gmail password
- Give this password to anyone

### 🛡️ If Password Compromised:

1. Go to: https://myaccount.google.com/apppasswords
2. **Revoke** the compromised App Password
3. **Generate** a new one
4. **Update** `functions/index.js`
5. **Redeploy** functions

---

## ✅ Quick Checklist

Before going live:

- [ ] Got Gmail App Password (16 characters)
- [ ] Updated `functions/index.js` with password
- [ ] Removed all spaces from password
- [ ] Saved the file
- [ ] Deployed functions successfully
- [ ] Tested with a real order
- [ ] Admin email received ✅
- [ ] Customer email received ✅
- [ ] No errors in logs

---

## 📞 Need Help?

**Check logs first:**
```bash
firebase functions:log
```

**Common issues:**
1. Wrong password → Create new App Password
2. Spaces in password → Remove all spaces
3. Regular password used → Must use App Password
4. 2FA not enabled → Enable it first

---

## 🎉 You're Done!

Once you see the admin email in your inbox after a test order, everything is working! 🎊

**Admin Email:** `phatanmujeebkhan64@gmail.com`
**Contains:** Full order details, customer info, quick actions

Now every new order will automatically notify you via email! 📧

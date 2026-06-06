# 🚀 START HERE: CHECKPOINT 1 AUTOMATED DEPLOYMENT

**This is your step-by-step guide to complete Checkpoint 1 in 25 minutes.**

---

## ⏱️ TIMING BREAKDOWN

```
STEP 1: Get Supabase Service Key    → 2-5 minutes
STEP 2: Run Deployment Script       → 3-5 minutes  
STEP 3: Deploy SQL (if needed)      → 5-10 minutes
STEP 4: Test Locally                → 5-10 minutes
─────────────────────────────────────────────────
TOTAL TIME                          → 20-30 minutes
```

---

## ✅ STEP 1: Get Your Supabase Service Key (2-5 minutes)

### Do you already have a Supabase account?

**YES → Jump to 1B below**  
**NO → Start at 1A below**

---

### 1A: CREATE A NEW SUPABASE ACCOUNT (3-5 minutes)

1. Open: https://supabase.com
2. Click: "Start your project"
3. Choose your sign-up method:
   - Google
   - GitHub  
   - Email (create password)
4. Complete sign-up
5. **Continue to 1C below**

---

### 1B: CREATE "nursing-pwa" PROJECT (if you don't have it)

1. Go to: https://app.supabase.com
2. If you see "nursing-pwa" project → **Skip to 1D**
3. If not, click: "+ New project"
4. Project name: `nursing-pwa`
5. Database password: (create a strong one)
6. Region: (choose closest to you)
7. Click: "Create new project"
8. Wait 1-2 minutes for project setup...
9. **Continue to 1C**

---

### 1C: GET YOUR SERVICE KEY (1 minute)

1. Project should now be loaded
2. Click: **Settings** (bottom left sidebar)
3. Click: **API** (in the settings menu)
4. You should see three sections:
   - Project URL
   - Service Role Secret ← **THIS ONE**
   - Anon Key
5. For "Service Role Secret":
   - Click: **REVEAL** button
   - You'll see a long string starting with `eyJ...`
6. Click: **Copy** button (to copy to clipboard)
7. Keep this copied! → **Continue to STEP 2**

---

### 1D: YOU ALREADY HAVE IT

If you already have "nursing-pwa" created:

1. Go to: https://app.supabase.com
2. Select: "nursing-pwa" project
3. Settings → API
4. Copy: Service Role Secret (click REVEAL first)
5. → **Continue to STEP 2**

---

## ✅ STEP 2: Update Environment & Deploy (8-10 minutes)

### 2A: Open Command Prompt / PowerShell

Windows users:
- Press: `Win + R`
- Type: `powershell`
- Press: `Enter`

Or if you have VS Code:
- Open your project folder
- Click: "Terminal" → "New Terminal"

### 2B: Navigate to Project

```powershell
cd C:\Users\shemh\OneDrive\Desktop\nursing-pwa
```

### 2C: Update .env.local with Real Key

**Option 1: If you're comfortable with text editors**

1. Open: `.env.local` in any text editor
2. Find the line starting with: `SUPABASE_SERVICE_KEY=`
3. It currently says: `SUPABASE_SERVICE_KEY=eyJ...sampleServiceKey`
4. Delete everything after the `=` sign
5. Paste your real key (that you copied in Step 1C)
6. Save the file
7. → **Continue to 2D**

**Option 2: Use PowerShell to update (automatic)**

Run this command (replace YOUR_KEY with your actual service key):

```powershell
$key = "PASTE_YOUR_SERVICE_KEY_HERE"
$env_file = ".env.local"
$content = Get-Content $env_file
$content = $content -replace 'SUPABASE_SERVICE_KEY=.*', "SUPABASE_SERVICE_KEY=$key"
$content | Set-Content $env_file
Write-Host "✅ .env.local updated!"
```

**But easier: Just paste this command and replace PASTE_YOUR_KEY:**

```powershell
(Get-Content .env.local) -replace 'SUPABASE_SERVICE_KEY=.*', 'SUPABASE_SERVICE_KEY=PASTE_YOUR_KEY_HERE' | Set-Content .env.local
```

### 2D: Run Deployment Script

```powershell
node auto-deploy.mjs
```

This will:
- ✅ Check your credentials
- ✅ Connect to Supabase
- ✅ Check if tables exist
- ✅ Create test data
- ✅ Verify OTP works
- ✅ Report status

---

## 📊 STEP 2D OUTPUT - What You'll See

### Success Case (Tables Already Exist):
```
🚀 AUTOMATED DEPLOYMENT ASSISTANT
...
📍 Connected to Supabase

✅ All tables exist! Proceeding with deployment...

📚 Creating test curriculum data...
✅ Years created
✅ Test data creation completed

🔐 Testing OTP functionality...
✅ OTP storage working

🎉 CHECKPOINT 1 DEPLOYMENT COMPLETE!

✅ All database tables created
✅ Test curriculum data loaded
✅ OTP authentication verified

🚀 NEXT STEPS...
```

### Need Manual SQL Case (Tables Don't Exist):
```
⚠️  Some tables still need to be created.

You have two options:

OPTION 1: Manual SQL deployment (recommended)
  1. Go to: https://app.supabase.com
  2. SQL Editor → New Query
  3. Copy database-schema.sql
  4. Paste and Run
  5. Repeat with database-otp-codes-table.sql
  6. Rerun this script

OPTION 2: Try automated deployment
```

**If you get this, follow STEP 3 below**

---

## ✅ STEP 3: Deploy SQL Manually (if needed) (5-10 minutes)

**Only do this if Step 2D told you tables need to be created**

### 3A: Deploy Main Schema

1. Open: https://app.supabase.com
2. Select: nursing-pwa project
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. In your project folder, open: `database-schema.sql`
6. Select all text: `Ctrl+A`
7. Copy: `Ctrl+C`
8. Go back to Supabase SQL Editor
9. Click in the text area
10. Paste: `Ctrl+V`
11. Click: **Run** button (▶️ at top)
12. Wait for: "Success" message (green)
13. ✅ Done with main schema

### 3B: Deploy OTP Table

1. Click: **New Query** (in SQL Editor)
2. In your project folder, open: `database-otp-codes-table.sql`
3. Select all: `Ctrl+A`
4. Copy: `Ctrl+C`
5. Paste into new SQL query: `Ctrl+V`
6. Click: **Run**
7. Wait for: "Success" message
8. ✅ Done with OTP table

### 3C: Rerun Deployment Script

Go back to PowerShell/Command Prompt:

```powershell
node auto-deploy.mjs
```

This time it should say everything succeeded!

---

## ✅ STEP 4: Test Locally (5-10 minutes)

### 4A: Start Development Server

In PowerShell (same window or new one):

```powershell
npm run dev
```

You'll see output like:
```
> nursing-pwa@1.0.0 dev
> next dev

▲ Next.js 14.0.0
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 4B: Open Browser

1. Open your web browser (Chrome, Firefox, Edge, Safari)
2. Go to: `http://localhost:3000`
3. You should see the Nursing PWA homepage

### 4C: Test Signup Flow

1. Click: **"Sign Up"** button
2. You'll see signup form with:
   - Full Name field
   - Contact Method (Email/Phone toggle)
   - Email or Phone field
3. Fill in:
   - **Full Name:** `Test Student`
   - **Method:** Email (or Phone)
   - **Email:** Your email address
4. Click: **"Send OTP"**
5. You'll see: "Check your email for OTP"
6. Check your email for a 6-digit code
   - Check **Spam/Junk** folder too
   - It might take 10-30 seconds to arrive
7. Once you get the code:
   - Go back to browser
   - Enter the 6-digit code in the OTP field
8. Click: **"Verify & Sign Up"**
9. 🎉 You should see the dashboard!

### 4D: Verify in Supabase

1. Go to: https://app.supabase.com
2. Select: nursing-pwa project
3. Click: **Table Editor**
4. Click: **users** table
5. You should see your test user in the table!

---

## 🎉 YOU'RE DONE!

If you got here, **Checkpoint 1 is COMPLETE!**

```
✅ Database deployed
✅ OTP authentication working
✅ User signup tested
✅ User saved to database
✅ Activity logging verified

🎉 CHECKPOINT 1: COMPLETE
```

---

## 🆘 TROUBLESHOOTING

### "Invalid API key" error
- [ ] Make sure you updated .env.local with the REAL service key
- [ ] Copy the entire key (it's ~200 characters)
- [ ] No spaces at the beginning or end
- [ ] Save the .env.local file

### "Connection refused"
- [ ] Make sure Supabase service key is correct
- [ ] Create a new Supabase project if needed
- [ ] Check internet connection

### OTP email not arriving
- [ ] Check spam/junk folder
- [ ] Wait 30 seconds (sometimes slow)
- [ ] Try with different email
- [ ] Check Supabase function logs

### "Tables not found" when starting
- [ ] You need to deploy SQL files in Step 3
- [ ] Copy/paste database-schema.sql first
- [ ] Then database-otp-codes-table.sql
- [ ] Rerun node auto-deploy.mjs

### npm run dev fails
- [ ] Make sure you're in the right folder
- [ ] Try: `npm install` first
- [ ] Close any other dev servers

---

## 📞 NEXT STEPS AFTER COMPLETION

Once Checkpoint 1 is complete:

1. **Take a break!** You've accomplished a lot
2. **Review what you built:**
   - Database schema
   - OTP auth system
   - User signup/login
3. **Ready for Checkpoint 2?**
   - Admin authentication (1.5-3 hours)
   - More features building
   - Continues from here

---

## ✨ SUMMARY

You're about to complete:
- ✅ Professional database
- ✅ Secure authentication
- ✅ Working user system
- ✅ Audit trail
- ✅ Foundation for 90+ features

**Estimated time: 20-30 minutes**

Ready? Let's go! 🚀

---

**Start with Step 1 above →**

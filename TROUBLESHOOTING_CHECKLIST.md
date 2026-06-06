# ✅ Nursing PWA - Troubleshooting Checklist

## Quick Reference Guide

This checklist helps you systematically diagnose and resolve the Supabase authentication issue.

---

## 🔍 Phase 1: Verification (Do These First)

### Supabase Project Status
- [ ] Log into Supabase dashboard
- [ ] Navigate to: https://supabase.com/dashboard/project/uiakghpvtayplyuaxzyh
- [ ] Check if project shows any **"PAUSED"** status
- [ ] Check **Notifications** for any service alerts
- [ ] Look at **Settings → General** for project status

### API Key Verification
- [ ] Go to **Settings → API Keys**
- [ ] Verify the anon key matches: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- [ ] Check that the key has NOT been rotated recently
- [ ] Verify **Project URL** matches: `https://uiakghpvtayplyuaxzyh.supabase.co`

### Authentication Settings
- [ ] Go to **Authentication → Sign In / Providers**
- [ ] Verify **Email** provider is **ENABLED** (should have green checkmark)
- [ ] Go to **Authentication → URL Configuration**
- [ ] Verify both redirect URLs are present:
  - `https://nursing-pwa.vercel.app`
  - `http://localhost:3000`

### Vercel Environment
- [ ] Log into Vercel dashboard
- [ ] Go to Settings → Environment Variables
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] Confirm `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] Verify values match Supabase exactly (no extra spaces, quotes, etc.)

---

## 🧪 Phase 2: Direct Testing

### Test with cURL (Advanced)
```bash
# Test auth endpoint directly
curl -X POST https://uiakghpvtayplyuaxzyh.supabase.co/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY_HERE" \
  -d '{"email":"test@example.com","password":"Test123456"}'
```
- [ ] Run this command with your actual anon key
- [ ] Check if you get an error or success response
- [ ] If error: note the exact error message and code
- [ ] If success: auth API is working (issue is in app)

### Test Authentication Locally
```bash
cd C:\Users\shemh\OneDrive\Desktop\nursing-pwa
npm run dev
```
- [ ] Start the dev server
- [ ] Navigate to http://localhost:3000/auth/signup
- [ ] Try to sign up with test credentials
- [ ] Check browser console (F12) for any JavaScript errors
- [ ] If it works locally: issue is Vercel-specific
- [ ] If it fails locally: issue is Supabase-wide

### Run Diagnostic Script
```bash
cd C:\Users\shemh\OneDrive\Desktop\nursing-pwa
node test-supabase-connection.js
```
- [ ] Run the diagnostic test script
- [ ] Review output for:
  - Connection status (✅ = OK, ❌ = Failed)
  - Auth endpoint response
  - Error messages
- [ ] Document any errors found

---

## 🛠️ Phase 3: Configuration Fixes

### If Error: API Key Issue

**Symptoms:**
- "Unauthorized" (401) errors
- "Invalid API key" messages
- "Permission denied" errors

**Fix Steps:**
1. [ ] Go to Supabase: **Settings → API Keys**
2. [ ] Copy the anon key (the public, not secret key)
3. [ ] Go to Vercel dashboard
4. [ ] Update `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. [ ] Redeploy on Vercel: `vercel --prod`
6. [ ] Wait 2-3 minutes for deployment
7. [ ] Test at https://nursing-pwa.vercel.app/auth/signup

### If Error: Project Paused

**Symptoms:**
- All API requests fail
- HTTP 503 or 504 errors
- Connection timeouts
- "Service Unavailable" messages

**Fix Steps:**
1. [ ] Log into Supabase dashboard
2. [ ] Look for a "Resume Project" or "Unpause" button
3. [ ] Click to resume the project
4. [ ] Wait for project to restart (2-5 minutes)
5. [ ] Test signup again

### If Error: CORS Issues

**Symptoms:**
- Browser console shows CORS errors
- Network requests are blocked
- "No Access-Control-Allow-Origin" errors

**Fix Steps:**
1. [ ] Go to Supabase: **Settings → API**
2. [ ] Look for CORS configuration section
3. [ ] Add to allowed origins:
   - `https://nursing-pwa.vercel.app`
   - `http://localhost:3000`
   - `https://*.vercel.app` (wildcard for preview deployments)
4. [ ] Save changes
5. [ ] Redeploy app to Vercel
6. [ ] Test signup

### If Error: Auth Endpoint Disabled

**Symptoms:**
- HTTP 404 on /auth/v1/signup
- "Route not found" errors
- Auth endpoints consistently failing

**Fix Steps:**
1. [ ] Go to Supabase: **Settings → API**
2. [ ] Check that REST API is enabled
3. [ ] Check that Auth endpoints are enabled
4. [ ] If disabled, enable them
5. [ ] Save settings
6. [ ] Wait 1-2 minutes
7. [ ] Test signup again

---

## 📊 Phase 4: Monitoring & Logging

### Check Supabase Logs
- [ ] Go to **Logs → Database** (check for errors)
- [ ] Go to **Logs → Authentication** (check auth errors)
- [ ] Go to **Logs → API** (check REST API errors)
- [ ] Look for any error patterns
- [ ] Note timestamps and error codes

### Check Vercel Logs
- [ ] Go to Vercel dashboard
- [ ] Click on latest deployment
- [ ] Check **Logs** section
- [ ] Look for any runtime errors
- [ ] Search for "Supabase" errors

### Browser Console Debugging
1. [ ] Open https://nursing-pwa.vercel.app/auth/signup
2. [ ] Open browser DevTools (F12)
3. [ ] Go to **Console** tab
4. [ ] Try signup and watch console
5. [ ] Note any error messages
6. [ ] Take screenshot of errors
7. [ ] Go to **Network** tab
8. [ ] Repeat signup and check network requests
9. [ ] Look for failed requests (red status codes)
10. [ ] Click on failed requests to see response

---

## 🚨 Phase 5: Escalation (If Still Not Working)

### Before Contacting Support, Have Ready:
- [ ] Diagnostic report (DIAGNOSTIC_REPORT.md)
- [ ] Test script output (from test-supabase-connection.js)
- [ ] Browser console errors (screenshot)
- [ ] Network request failures (screenshot)
- [ ] Exact error message text
- [ ] Steps to reproduce
- [ ] When it last worked (if applicable)

### Contact Supabase Support
- [ ] Go to: https://supabase.com/dashboard/support
- [ ] Create new support ticket
- [ ] **Subject:** "Signup endpoint returning 'Invalid path specified in request URL'"
- [ ] **Description:** Include:
  ```
  Project ID: uiakghpvtayplyuaxzyh
  Error: "Invalid path specified in request URL"
  Endpoint: POST /auth/v1/signup
  Status Code: 400
  When: Every signup attempt
  Environment: Production (Vercel)
  
  [Attach diagnostic report and test output]
  ```

### Temporary Workarounds While Waiting
- [ ] Implement admin signup (no user input, direct database)
- [ ] Use Supabase Auth UI component instead of custom form
- [ ] Create admin panel for manual user creation
- [ ] Set up email invitations system

---

## 📋 Quick Decision Tree

**Does signup work locally (http://localhost:3000)?**
- [ ] **YES** → Issue is Vercel-specific
  - Check Vercel environment variables
  - Check for deployment errors
  - Redeploy the app

- [ ] **NO** → Issue is Supabase-wide
  - Check Supabase project status
  - Verify API credentials
  - Run curl test against endpoint
  - Check project paused status

**Does curl test work?**
- [ ] **YES** → App code issue
  - Check browser console errors
  - Review signup form submission
  - Check Supabase client initialization

- [ ] **NO** → Supabase API issue
  - Contact Supabase support
  - Check project status
  - Verify API key permissions

---

## 🎯 Success Criteria

After fixes, verify:
- [ ] Signup form displays without errors
- [ ] Can enter email and password
- [ ] Can submit form without errors
- [ ] Either redirected to dashboard OR get confirmation message
- [ ] User appears in Supabase → Authentication → Users
- [ ] Can login with new credentials

---

## 📝 Common Solutions Summary

| Issue | Quick Fix |
|-------|-----------|
| "Invalid path" error | Check project paused status, redeploy app |
| API key errors | Verify key in Supabase and Vercel match exactly |
| Works locally, fails on Vercel | Redeploy Vercel, check env vars |
| CORS errors in console | Add Vercel domain to CORS settings |
| User not created | Check Supabase logs for auth errors |
| Consistent 400 errors | Test with curl, check endpoint enables |
| Timeouts | Check internet connection, check Supabase status |

---

## 🔗 Important Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **This Project:** https://supabase.com/dashboard/project/uiakghpvtayplyuaxzyh
- **Vercel Dashboard:** https://vercel.com/shem-s-projects1/nursing-pwa
- **App URL:** https://nursing-pwa.vercel.app
- **Auth Signup Page:** https://nursing-pwa.vercel.app/auth/signup

---

## 💾 Files Referenced

- **This Checklist:** `TROUBLESHOOTING_CHECKLIST.md`
- **Diagnostic Report:** `DIAGNOSTIC_REPORT.md`
- **Test Script:** `test-supabase-connection.js`
- **Signup Code:** `src/app/auth/signup/page.tsx`
- **Supabase Config:** `src/lib/supabase.ts`

---

**Last Updated:** 2026-06-06  
**Created For:** Nursing PWA Project  
**Issue:** Supabase Authentication Signup Failure

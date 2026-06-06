# Checkpoint 1 Deployment Guide
**Date:** 2026-06-06  
**Objective:** Deploy database schema and OTP authentication system to Supabase

---

## 🚀 Step-by-Step Deployment

### Step 1: Deploy Database Schema to Supabase (15 min)

#### 1.1 Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project: `nursing-pwa` (uiakghpvtayplyuaxzyh)
3. Click **SQL Editor** in the left sidebar

#### 1.2 Run Main Schema
1. Click **New Query**
2. Copy entire contents of `database-schema.sql`
3. Paste into the SQL editor
4. Click **Run** (▶️ button)
5. ✓ Verify: You should see "Success" message
6. Verify tables created:
   - `users` ✓
   - `years` ✓
   - `semesters` ✓
   - `subjects` ✓
   - `units` ✓
   - `topics` ✓
   - `subscriptions` ✓
   - `bookmarks`, `downloads`, `ratings` ✓
   - `user_progress` ✓
   - `activity_log` ✓
   - `backups` ✓
   - `notifications` ✓

#### 1.3 Run OTP Codes Table
1. Click **New Query**
2. Copy entire contents of `database-otp-codes-table.sql`
3. Paste and click **Run**
4. ✓ Verify: `otp_codes` table created

#### 1.4 Verify Schema in Table Editor
1. Click **Table Editor** in sidebar
2. Verify all tables appear in the left panel
3. Click on each table to verify columns

---

### Step 2: Create Supabase Edge Functions (20 min)

#### 2.1 Deploy send-otp-email Function
1. Open Supabase Dashboard
2. Click **Edge Functions** in sidebar
3. Click **Create a new function**
4. Name: `send-otp-email`
5. Copy code from `supabase/functions/send-otp-email/index.ts`
6. Click **Deploy**
7. ✓ Verify: Function shows as "Active"

#### 2.2 Deploy send-otp-sms Function
1. Click **Create a new function**
2. Name: `send-otp-sms`
3. Copy code from `supabase/functions/send-otp-sms/index.ts`
4. Click **Deploy**
5. ✓ Verify: Function shows as "Active"

#### 2.3 Test Email Function
1. In Edge Functions list, click `send-otp-email`
2. Click **Invoke** button
3. Paste test payload:
```json
{
  "email": "test@example.com",
  "otp": "123456",
  "userRole": "student"
}
```
4. Click **Invoke**
5. Check response - should be successful

---

### Step 3: Create API Routes in Next.js (20 min)

#### 3.1 Verify API Routes Exist
Check these files are created:
- ✓ `src/app/api/auth/request-otp/route.ts`
- ✓ `src/app/api/auth/verify-otp/route.ts`
- ✓ `src/app/api/auth/signup/route.ts`

#### 3.2 Install Dependencies (if needed)
```bash
npm install
```

#### 3.3 Test API Routes Locally
```bash
npm run dev
```

Then test endpoints:
```bash
# Test 1: Request OTP
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","userRole":"student"}'

# Should return:
# { "success": true, "sessionId": "...", "expiresIn": 600 }
```

---

### Step 4: Create Test Data (15 min)

#### 4.1 Create INC Curriculum Structure

Go to Supabase **SQL Editor** and create test curriculum:

```sql
-- Create Year 1
INSERT INTO years (number, title, description) VALUES
  (1, 'Year 1', 'First Year BSc Nursing')
ON CONFLICT (number) DO NOTHING;

-- Get year ID
WITH year_data AS (SELECT id FROM years WHERE number = 1)
INSERT INTO semesters (year_id, number, title)
SELECT id, 1, 'Semester 1' FROM year_data;

-- Create sample subject
WITH sem_data AS (SELECT id FROM semesters WHERE number = 1 LIMIT 1)
INSERT INTO subjects (semester_id, code, title, description)
SELECT id, 'ANA101', 'Anatomy & Physiology', 'Foundation of human body structure'
FROM sem_data;

-- Create sample unit
WITH subj_data AS (SELECT id FROM subjects WHERE code = 'ANA101')
INSERT INTO units (subject_id, number, title, description, status)
SELECT id, 1, 'Cell Structure', 'Understanding cellular components', 'published'
FROM subj_data;

-- Create sample topic
WITH unit_data AS (SELECT id FROM units WHERE subject_id IN (SELECT id FROM subjects WHERE code = 'ANA101'))
INSERT INTO topics (unit_id, title, content, status)
SELECT id, 'Introduction to Cells', '<h2>What is a Cell?</h2><p>A cell is the basic unit of life...</p>', 'published'
FROM unit_data;
```

#### 4.2 Create Test User Account

```sql
-- Insert test student user
-- Note: You'll need to first create this in Supabase Auth
-- For now, we can insert the profile after auth creation

-- This assumes you already have a user ID from Supabase Auth
-- INSERT INTO users (id, email, full_name, role, subscription_status)
-- VALUES ('user-uuid-here', 'student@example.com', 'Test Student', 'student', 'free');
```

---

### Step 5: Test Complete OTP Flow (10 min)

#### 5.1 Start Development Server
```bash
npm run dev
```

#### 5.2 Test Signup Flow
1. Open http://localhost:3000
2. Click **Sign Up**
3. Enter test data:
   - Full Name: "Test Student"
   - Contact: Email or Phone
   - Select method
4. Click **Send OTP**
5. ✓ Check: Email should arrive (or see console log for SMS)

#### 5.3 Enter OTP
1. Check email for OTP (6-digit code)
2. Enter OTP in the form
3. Click **Verify & Sign Up**
4. ✓ Should see success message

#### 5.4 Verify User Created
1. Go to Supabase Dashboard
2. Click **Table Editor**
3. Click `users` table
4. ✓ Verify: Test user appears in list

#### 5.5 Verify Activity Log
1. Click `activity_log` table
2. ✓ Verify: `user_signup` and `otp_requested` entries exist

---

## ✅ Deployment Checklist

### Database Schema
- [ ] Main schema deployed (`database-schema.sql`)
- [ ] OTP codes table created (`database-otp-codes-table.sql`)
- [ ] All 13+ tables visible in Table Editor
- [ ] RLS policies active
- [ ] Search indexes created

### Supabase Edge Functions
- [ ] `send-otp-email` function deployed
- [ ] `send-otp-sms` function deployed
- [ ] Functions test successfully
- [ ] Environment variables configured

### Next.js API Routes
- [ ] `request-otp` endpoint exists
- [ ] `verify-otp` endpoint exists
- [ ] `signup` endpoint exists
- [ ] Routes tested locally

### Test Data
- [ ] Year 1-4 created
- [ ] Semesters 1-8 created
- [ ] Sample subjects created
- [ ] Sample units/topics created
- [ ] Test user can query curriculum

### OTP Flow
- [ ] Can request OTP via email
- [ ] Can request OTP via phone
- [ ] OTP email received
- [ ] OTP verification works
- [ ] User account created
- [ ] Subscription auto-created (students)
- [ ] Activity logs recorded

---

## 🔍 Troubleshooting

### Issue: "Invalid path specified in request URL" (Supabase API)
**Cause:** Supabase project configuration issue  
**Solution:**
1. Check Supabase project status
2. Verify API key is correct
3. Contact Supabase support if needed
4. Try using service role key instead of anon key

### Issue: SendGrid email not sending
**Cause:** API key not configured  
**Solution:**
1. Verify `SENDGRID_API_KEY` in `.env.local`
2. Check API key is valid at https://sendgrid.com
3. For testing, check console logs in Edge Functions

### Issue: OTP not arriving
**Cause:** Email delivery issue  
**Solution:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase Edge Function logs
4. Verify SendGrid API key

### Issue: User signup fails
**Cause:** Supabase Auth creation failed  
**Solution:**
1. Check Supabase project status
2. Verify auth user creation succeeded
3. Check database user profile creation
4. Review API logs for detailed error

---

## 🚀 Next Steps After Deployment

Once Checkpoint 1 is verified:

### Immediate (Same session if time permits)
1. ✅ Database deployed
2. ✅ Edge Functions deployed
3. ✅ API routes created
4. ✅ OTP flow tested
5. ⏳ Create curriculum seed data (5-10 min)
6. ⏳ Test login with existing user (5 min)

### Checkpoint 1 Completion (Final Gate Check)
- [ ] All database tables created and accessible
- [ ] OTP can be requested and verified
- [ ] Users can sign up successfully
- [ ] User data persists in database
- [ ] Activity logging working
- [ ] Performance acceptable (queries < 500ms)

### Begin Checkpoint 2 (Next Phase)
- Admin authentication (email + OTP + 2FA)
- Password reset functionality
- JWT session management
- Session expiry and refresh tokens

---

## 📊 Deployment Summary

| Component | Status | Time |
|-----------|--------|------|
| Database Schema | ⏳ In Progress | 15 min |
| Edge Functions | ⏳ In Progress | 20 min |
| API Routes | ✅ Done | 20 min |
| Test Data | ⏳ In Progress | 15 min |
| End-to-End Test | ⏳ Next | 10 min |
| **TOTAL** | **~1 hour** | |

---

## 📞 Support

**Documentation:**
- `IMPLEMENTATION_PLAN.md` - Full project roadmap
- `CHECKPOINT_1_STATUS.md` - Detailed checkpoint progress
- `BUILD_PROGRESS_CHECKLIST.md` - Checkpoint tracking

**Code:**
- `database-schema.sql` - Main schema
- `database-otp-codes-table.sql` - OTP storage
- `src/app/api/auth/*` - API routes

**Questions?**
Check `COMPREHENSIVE_QA_CONTINUITY_PLAN.md` for detailed procedures

---

**Deployment Guide Created:** 2026-06-06  
**Status:** Ready to Deploy  
**Estimated Time:** ~1 hour to complete Checkpoint 1

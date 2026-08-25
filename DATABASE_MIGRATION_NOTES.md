# Database Migration & Deployment Guide

**Project:** Aurelis Student Performance Platform  
**Target:** Fresh Supabase Production Database  
**Migration Version:** 0001_initial_schema.sql  
**Date:** 2026-08-24

---

## ⚠️ CRITICAL WARNINGS

**READ BEFORE PROCEEDING:**

1. ✅ **This is a FRESH DEPLOYMENT** - The production database is currently EMPTY
2. ❌ **DO NOT** run this on a database with existing data - this is NOT a data migration
3. ❌ **DO NOT** blindly apply the old `schema.sql` - it is incomplete and outdated
4. ✅ **ONLY** apply the corrected migration: `supabase/migrations/0001_initial_schema.sql`
5. ⏸️ **PAUSE** - Review SUPABASE_SCHEMA_AUDIT.md and SECURITY_DESIGN.md first

---

## Pre-Deployment Checklist

### Documentation Review

- [ ] Read `SUPABASE_SCHEMA_AUDIT.md` completely
- [ ] Read `SECURITY_DESIGN.md` completely
- [ ] Understand schema changes from old to new architecture
- [ ] Understand security model and RLS policies
- [ ] Review Edge Function security patterns

### Environment Preparation

- [ ] Production Supabase project created
- [ ] Supabase CLI installed (`npm install -g supabase`)
- [ ] CLI authenticated (`supabase login`)
- [ ] Project linked (`supabase link --project-ref YOUR_PROJECT_REF`)
- [ ] `.env` or config file with production credentials prepared
- [ ] Backup plan documented (though database is empty)

### Code Verification

- [ ] All Edge Functions tested locally
- [ ] Frontend tested with local Supabase
- [ ] Email templates configured (Resend API key set)
- [ ] Storage bucket names verified in code
- [ ] Anon/service keys identified and documented

---

## Deployment Steps

### Step 1: Verify Empty Database

Before deploying, confirm the production database is empty:

```bash
# Connect to production database
supabase db remote

# List tables (should return empty or only auth tables)
\dt public.*

# If ANY application tables exist, STOP and investigate
# Expected: No ta_profiles, students, marks, etc.
```

**If tables exist:** You're not on an empty database. Contact the team before proceeding.

---

### Step 2: Apply Migration

```bash
# Ensure you're in the project root
cd "c:\Users\mian mobile\OneDrive\Desktop\ta-portal-main"

# Push migration to production
supabase db push

# This will apply: supabase/migrations/0001_initial_schema.sql
```

**Expected Output:**
```
Applying migration 0001_initial_schema.sql...
✓ Created extension pgcrypto
✓ Created table ta_profiles
✓ Created table classes
✓ Created table students
✓ Created table mark_categories
✓ Created table marks
✓ Created table mark_queries
✓ Created function generate_class_token()
✓ Applied RLS policies (13 policies)
Migration complete.
```

**If errors occur:** Do NOT proceed. Save the error log and review schema syntax.

---

### Step 3: Verify Schema

```bash
# Connect to production
supabase db remote

# Verify tables exist
\dt public.*

# Expected tables:
# - ta_profiles
# - classes
# - students
# - mark_categories
# - marks
# - mark_queries

# Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

# All tables should show rowsecurity = true

# Count RLS policies (should be 13)
SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';

# Verify function exists
\df public.generate_class_token
```

**Validation Queries:**

```sql
-- Check ta_profiles structure
\d public.ta_profiles

-- Verify classes has all required columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'classes' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verify students unique constraint is on (class_id, roll_no)
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.students'::regclass 
  AND contype = 'u';

-- Verify mark_queries table exists (was missing in old schema)
SELECT COUNT(*) FROM information_schema.tables 
WHERE table_name = 'mark_queries' 
  AND table_schema = 'public';
```

---

### Step 4: Configure Storage Buckets

Storage buckets are NOT created by SQL migrations. Configure manually:

#### 4a. Create `avatars` Bucket

```bash
# Via Supabase dashboard or CLI
supabase storage create avatars --public
```

**Bucket Settings:**
- **Name:** `avatars`
- **Public:** Yes (students need to see TA avatars)
- **File size limit:** 2MB
- **Allowed MIME types:** image/jpeg, image/png, image/webp

**Storage Policies (via dashboard Storage > Policies):**

```sql
-- Policy 1: TAs can upload own avatar
CREATE POLICY "TAs can upload own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: TAs can update own avatar
CREATE POLICY "TAs can update own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Public read access
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatars');
```

#### 4b. Create `mark-query-photos` Bucket

```bash
supabase storage create mark-query-photos --public
```

**Bucket Settings:**
- **Name:** `mark-query-photos`
- **Public:** Yes (TAs view student-uploaded photos)
- **File size limit:** 5MB per file
- **Allowed MIME types:** image/jpeg, image/png, image/webp

**Storage Policies:**

```sql
-- Policy 1: Anonymous can upload photos
CREATE POLICY "Students can upload query photos"
ON storage.objects FOR INSERT TO anon
WITH CHECK (bucket_id = 'mark-query-photos');

-- Policy 2: Authenticated can view photos
CREATE POLICY "TAs can view query photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'mark-query-photos');

-- Policy 3: Public can view photos (URLs shared via mark_queries table)
CREATE POLICY "Public can view query photos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'mark-query-photos');
```

---

### Step 5: Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy check-roll-taken
supabase functions deploy cleanup-failed-signup
supabase functions deploy create-ta-profile
supabase functions deploy get-student-marks
supabase functions deploy get-ta-by-token
supabase functions deploy get-teacher-dashboard
supabase functions deploy send-marks-email

# Set environment secrets (if needed)
supabase secrets set RESEND_API_KEY=your_resend_api_key_here
```

**Verify deployment:**

```bash
# List deployed functions
supabase functions list

# Test a function (example)
curl -X POST \
  https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-roll-taken \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"class_id":"test-id","roll_no":"test-roll"}'

# Should return: {"taken":false}
```

---

### Step 6: Configure Auth Settings

**In Supabase Dashboard > Authentication > Settings:**

- [ ] **Enable Email Auth:** Yes
- [ ] **Email confirmation:** Required (or optional for testing)
- [ ] **Secure email change:** Enabled
- [ ] **Secure password change:** Enabled
- [ ] **Custom SMTP:** Configure with your email provider (or use Supabase default)
- [ ] **Email templates:** Update with Aurelis branding
- [ ] **Password requirements:** Minimum 8 characters
- [ ] **Site URL:** Set to your production frontend URL
- [ ] **Redirect URLs:** Add allowed redirect URLs for auth callbacks

**Email Templates to Customize:**
- Confirmation email (signup)
- Magic link email (passwordless login - if enabled)
- Password reset email
- Email change confirmation

Replace default branding with:
```
Organization: Maqsad Tech
Product: Aurelis Student Performance Platform
Support: muhammed.abdullah.coder@gmail.com
```

---

### Step 7: Update Frontend Configuration

**Update the following files with production credentials:**

#### `dashboard.html`

```javascript
// Line ~10
const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON = 'YOUR_PRODUCTION_ANON_KEY';
```

#### `login.html`

```javascript
// Same updates
const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON = 'YOUR_PRODUCTION_ANON_KEY';
```

#### `join.html`

```javascript
// Same updates
const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON = 'YOUR_PRODUCTION_ANON_KEY';
```

#### `teacher-view.html`

```javascript
// Same updates
const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
const SUPABASE_ANON = 'YOUR_PRODUCTION_ANON_KEY';
```

**⚠️ Security Note:** 
- The `SUPABASE_ANON` key is **PUBLIC** - safe to expose in frontend code
- The `SUPABASE_SERVICE_ROLE` key is **PRIVATE** - NEVER expose in frontend
- Service role key only used in Edge Functions (server-side)

---

### Step 8: Smoke Test with Real Data

Create a test TA account and verify full workflow:

#### 8a. Create Test TA Account

1. Open `login.html` in browser
2. Click "Sign Up"
3. Enter test TA details:
   - Name: Test TA
   - Email: test.ta@example.com
   - Course: Test Course 101
   - Sir's name: Dr. Test
4. Complete signup
5. Verify email confirmation (if enabled)

#### 8b. Verify TA Dashboard

1. Login with test account
2. Verify class created automatically
3. Verify class link token generated
4. Test creating a new class (multi-class support)
5. Test uploading avatar
6. Test creating mark category (e.g., "Quiz 1", total: 20)

#### 8c. Test Student Registration

1. Copy class join link from dashboard
2. Open `join.html` with token parameter (e.g., `join.html?ta=TOKEN`)
3. Register as test student:
   - Name: Test Student
   - Roll No: 25F-0001
   - Email: test.student@example.com
4. Verify "Request Submitted" message
5. Return to dashboard
6. Verify student appears in "Pending Students"
7. Approve student
8. Verify student moves to "Approved Students"

#### 8d. Test Marks Entry

1. In dashboard, enter marks for test student:
   - Quiz 1: 18/20
   - Remarks: "Good work!"
2. Verify marks save successfully
3. Toggle "Marks Visible" to ON

#### 8e. Test Student Marks View

1. Return to join link with test student roll number
2. Verify marks display correctly
3. Verify statistics (highest, lowest, average)
4. Test submitting a mark query
5. Attach a test image
6. Return to dashboard
7. Verify query appears in "Student Queries" tab
8. Reply to query
9. Return to student view
10. Verify reply appears

#### 8f. Test Teacher Dashboard

1. In TA dashboard, generate teacher view link
2. Copy teacher link
3. Open in incognito/private browser (not logged in)
4. Verify read-only dashboard loads
5. Verify aggregated statistics display
6. Verify no edit capabilities

#### 8g. Test Email Notifications (if Resend configured)

1. In dashboard, click "Send Email" for a student mark
2. Check test email inbox
3. Verify Aurelis branding appears correctly
4. Verify marks data is accurate

---

### Step 9: Security Validation

Run these queries to verify security policies are working:

```sql
-- Test 1: Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('ta_profiles', 'classes', 'students', 'mark_categories', 'marks', 'mark_queries');
-- All should show rowsecurity = t

-- Test 2: Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected:
-- ta_profiles: 2
-- classes: 4
-- students: 4
-- mark_categories: 4
-- marks: 4
-- mark_queries: 3
-- Total: 21 policies (was 13 in initial count - verify actual)

-- Test 3: Verify unique constraints
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint 
WHERE contype = 'u' 
  AND connamespace = 'public'::regnamespace
  AND conrelid::regclass::text LIKE '%students%';
-- Should show: students_class_id_roll_no_key on (class_id, roll_no)
```

**Try to bypass security (should fail):**

```javascript
// Test with anon client trying to access another TA's data
// This should return NO rows (RLS blocking access)
const { data } = await supabase
  .from('students')
  .select('*')
  .eq('ta_id', 'SOME_OTHER_TA_UUID');
console.log(data); // Should be empty or error
```

---

### Step 10: Performance Baseline

Establish baseline metrics for future monitoring:

```sql
-- Table sizes (should be near zero immediately after deployment)
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage (run after some real usage)
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Vacuum stats (maintenance tracking)
SELECT 
  schemaname,
  relname,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables
WHERE schemaname = 'public';
```

---

## Post-Deployment Checklist

### Immediate (Day 1)

- [ ] All smoke tests passed
- [ ] Security validation passed
- [ ] Edge Functions responding correctly
- [ ] Storage buckets accessible
- [ ] Email notifications working (if configured)
- [ ] No errors in Supabase logs
- [ ] Frontend loads without console errors
- [ ] SSL certificate valid on frontend domain

### Week 1

- [ ] Monitor Supabase dashboard for errors
- [ ] Check database size growth (should be gradual)
- [ ] Verify no suspicious anonymous operations
- [ ] Review Edge Function logs for unexpected errors
- [ ] Check storage bucket usage
- [ ] Verify email delivery rates (if Resend configured)
- [ ] Collect user feedback on any issues

### Week 2-4

- [ ] Review RLS policy effectiveness
- [ ] Optimize slow queries if any
- [ ] Check index usage statistics
- [ ] Plan Phase 9 security hardening (Edge Function migration)
- [ ] Consider adding audit logging
- [ ] Plan data retention policy
- [ ] Document any production-specific configurations

---

## Rollback Plan

**If critical issues are discovered:**

Since this is a fresh deployment with no existing production data, rollback is straightforward:

### Option 1: Drop and Recreate

```sql
-- Connect to production database
-- ⚠️ DANGER: This deletes ALL data

-- Drop all tables
DROP TABLE IF EXISTS public.mark_queries CASCADE;
DROP TABLE IF EXISTS public.marks CASCADE;
DROP TABLE IF EXISTS public.mark_categories CASCADE;
DROP TABLE IF EXISTS public.students CASCADE;
DROP TABLE IF EXISTS public.classes CASCADE;
DROP TABLE IF EXISTS public.ta_profiles CASCADE;

-- Drop function
DROP FUNCTION IF EXISTS public.generate_class_token();

-- Then re-apply corrected migration
```

### Option 2: Database Reset

Via Supabase Dashboard:
1. Settings > Database > Database Settings
2. "Reset Database" (if available)
3. Re-apply migration from scratch

### Option 3: New Project

If catastrophic failure:
1. Create new Supabase project
2. Apply migration to new project
3. Update frontend config to point to new project
4. Delete failed project

**Data Loss Consideration:**  
Since this is initial deployment, early rollback has minimal impact. After real student data is entered, plan database backups before any schema changes.

---

## Monitoring and Maintenance

### Daily Monitoring

**Supabase Dashboard Checks:**
- [ ] Database size growth
- [ ] Edge Function invocation counts
- [ ] Edge Function error rates
- [ ] Storage bucket usage
- [ ] Active database connections

**Application Health:**
- [ ] TA login success rate
- [ ] Student registration success rate
- [ ] Marks entry success rate
- [ ] Email delivery success rate

### Weekly Maintenance

**Database Health:**
```sql
-- Check for bloat
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
  pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check for missing indexes (if queries are slow)
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100
  AND correlation < 0.1;
```

**Security Review:**
- Review Supabase logs for suspicious anon operations
- Check for unusual storage uploads
- Monitor failed authentication attempts
- Review Edge Function error logs

### Monthly Maintenance

- [ ] Backup database (Supabase handles automatic backups)
- [ ] Review and optimize slow queries
- [ ] Check for unused indexes
- [ ] Review storage bucket file retention
- [ ] Update Edge Function dependencies if security patches available
- [ ] Review and update RLS policies if access patterns changed

---

## Known Limitations & Future Improvements

### Current Limitations

1. **Token Persistence:** Class link tokens never expire (acceptable for v1, consider adding expiration in future)
2. **Anonymous INSERT:** Students directly insert into `students` and `mark_queries` tables (security risk documented, fix planned for Phase 9)
3. **No Audit Log:** Mark changes are not tracked (plan audit_log table in future)
4. **No Rate Limiting:** Anonymous operations could be abused (add Supabase rate limiting or Cloudflare rules)
5. **No File Scanning:** Uploaded images not scanned for malware (acceptable for trusted educational environment)

### Phase 9 Improvements (Planned)

See SECURITY_DESIGN.md Section 7 for detailed recommendations:

1. **Move student registration to Edge Function** (remove anonymous INSERT policy)
2. **Move mark query submission to Edge Function** (remove anonymous INSERT policy)
3. **Add audit logging table** (track all mark changes)
4. **Add token expiration** (with automated renewal notifications)
5. **Add content security** (file type validation, size limits, virus scanning)
6. **Add data export feature** (GDPR compliance)
7. **Add data deletion feature** (GDPR right to erasure)

---

## Troubleshooting Common Issues

### Issue: Migration fails with "already exists" error

**Cause:** Tables already exist in database (not empty)

**Solution:**
1. Verify you're connected to the correct project
2. If this is truly a fresh deployment, drop existing tables
3. Re-run migration

### Issue: RLS blocks legitimate operations

**Cause:** Policy logic error or missing policy

**Solution:**
1. Check Supabase logs for RLS policy name
2. Review policy definition in migration file
3. Test policy with manual SQL
4. Add missing policy if needed

### Issue: Edge Function returns 500 error

**Cause:** Missing environment secret or database connection issue

**Solution:**
1. Check Edge Function logs in Supabase dashboard
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
3. Verify database is accessible from Edge Function
4. Check for syntax errors in Edge Function code

### Issue: Storage upload fails

**Cause:** Missing bucket or incorrect policy

**Solution:**
1. Verify bucket exists: `supabase storage list`
2. Check bucket policies in dashboard
3. Verify file size under limit
4. Check MIME type is allowed

### Issue: Student can't see marks after approval

**Cause:** `marks_visible` flag not set on class

**Solution:**
1. Check `classes.marks_visible` in database
2. Toggle "Publish Marks" button in TA dashboard
3. Verify Edge Function returns `marks_visible: true`

### Issue: Email notifications not sending

**Cause:** Resend API key not configured or invalid

**Solution:**
1. Verify secret: `supabase secrets list`
2. Set secret: `supabase secrets set RESEND_API_KEY=your_key`
3. Check Resend dashboard for API usage/errors
4. Verify `from` email is verified domain in Resend

---

## Support Contacts

**Database Issues:**
- Review: SUPABASE_SCHEMA_AUDIT.md
- Review: SECURITY_DESIGN.md

**Security Issues:**
- Review: SECURITY_DESIGN.md Section 5 (Security Risk Summary)

**Deployment Issues:**
- This document
- Supabase Documentation: https://supabase.com/docs

**Application Owner:**
- Email: muhammed.abdullah.coder@gmail.com
- WhatsApp: +92 322 6334814

---

## Appendix A: Complete Migration File Listing

**File:** `supabase/migrations/0001_initial_schema.sql`

**Contents:**
- 6 tables (ta_profiles, classes, students, mark_categories, marks, mark_queries)
- 1 function (generate_class_token)
- 21 RLS policies (defense-in-depth security)
- All indexes for query performance
- All foreign key constraints for referential integrity
- All unique constraints for data integrity
- Complete comments for maintainability

**Line Count:** ~470 lines (excluding comments)

**Validated Against:**
- ✅ All 7 Edge Functions
- ✅ dashboard.html operations
- ✅ join.html operations
- ✅ teacher-view.html operations
- ✅ Entire repository grep search

---

## Appendix B: Schema Comparison

| Feature | Old schema.sql | New 0001_initial_schema.sql | Impact |
|---------|---------------|----------------------------|--------|
| **classes table** | Missing | ✅ Created | CRITICAL - multi-class support |
| **students.class_id** | Missing | ✅ Added | CRITICAL - correct foreign key |
| **mark_categories.class_id** | Missing | ✅ Added | CRITICAL - scope to class |
| **mark_queries table** | Missing | ✅ Created | CRITICAL - query feature |
| **ta_profiles.avatar_url** | Missing | ✅ Added | MAJOR - avatar feature |
| **classes.teacher_view_token** | N/A | ✅ Added | MAJOR - teacher dashboard |
| **students unique constraint** | (ta_id, roll_no) | ✅ (class_id, roll_no) | MAJOR - correct constraint |
| **RLS policies** | Missing | ✅ 21 policies | MAJOR - security |
| **teachers table** | Existed | ❌ Removed | CLEANUP - obsolete |
| **pending_tas table** | Existed | ❌ Removed | CLEANUP - obsolete |
| **generate_approval_token** | Existed | ❌ Removed | CLEANUP - obsolete |

---

**Deployment Status:** ⏸️ **READY FOR DEPLOYMENT**

**Approvals Required:**
- [ ] Technical Lead - Schema Review
- [ ] Security Lead - RLS Policy Review
- [ ] Product Owner - Feature Completeness
- [ ] DevOps - Infrastructure Ready

**Deployment Timeline:**
- Schema deployment: ~5 minutes
- Storage configuration: ~10 minutes
- Edge Function deployment: ~15 minutes
- Smoke testing: ~30 minutes
- **Total:** ~1 hour

---

*End of Migration Guide*

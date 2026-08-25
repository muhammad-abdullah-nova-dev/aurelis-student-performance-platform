# Edge Function Security Audit Report

**Project:** Aurelis Student Performance Platform  
**Audit Date:** 2026-08-24  
**Status:** ✅ **CRITICAL FIXES APPLIED** - Ready for deployment  
**Auditor:** Automated Security Analysis

---

## 🟢 SECURITY STATUS UPDATE (2026-08-24)

**CRITICAL VULNERABILITIES:** ✅ **FIXED**

All critical security issues identified in this audit have been resolved:
- ✅ **CVE-1:** Account Takeover via Race Condition → **FIXED**
- ✅ **CVE-2:** Arbitrary User Deletion → **FIXED**
- ✅ **CVE-3:** Timing Attack Information Disclosure → **FIXED**
- ✅ **CVE-4:** Profile Injection Attack → **FIXED**
- ✅ **CVE-5:** Bulk Profile Spam → **FIXED**

**Fixed Functions:**
1. ✅ `create-ta-profile` - JWT auth enforced, profile injection prevented
2. ✅ `cleanup-failed-signup` - JWT auth enforced, ownership validation added

**Frontend Updates:**
3. ✅ `login.html` - Updated to use authenticated session tokens

**Complete Fix Documentation:** See `docs/EDGE_FUNCTION_SECURITY_FIXES.md`

---

## Executive Summary

This audit examines all 7 Supabase Edge Functions before production deployment. Each function is analyzed for authentication requirements, authorization mechanisms, sensitive data exposure, and potential security vulnerabilities.

**Original Finding:** ⚠️ **2 CRITICAL VULNERABILITIES** discovered  
**Fix Status:** ✅ **ALL RESOLVED** (2026-08-24)

**Deployment Status:**
- ✅ **6 functions** - Safe to deploy (4 unchanged + 2 fixed)
- ℹ️ **1 function** - Not currently used (defer deployment)

---

## Function 1: check-roll-taken

### Overview
**Function:** `supabase/functions/check-roll-taken/index.ts`  
**Caller:** `join.html` (anonymous student registration flow)  
**Line:** 520

**Purpose:** Server-side duplicate roll number validation to prevent anonymous clients from scanning the students table directly.

### Security Analysis

**Authentication:** None (anonymous access)  
**Authorization:** Token-based (class_id validation)  
**Inputs:**
```json
{
  "class_id": "uuid",
  "roll_no": "string"
}
```

**Outputs:**
```json
{
  "taken": boolean
}
```

**Sensitive Data:** No - returns only boolean existence check  
**Uses Service Role:** ✅ Yes - bypasses RLS to query students table  
**Public Access Required:** ✅ Yes - called during anonymous registration  
**JWT Verification:** ❌ Disabled (intentional - anonymous endpoint)

**Database Operations:**
```typescript
await supabase
  .from("students")
  .select("id")
  .eq("class_id", class_id)
  .eq("roll_no", roll_no)
  .maybeSingle();
```

**Authorization Mechanism:**
- Input validation: Requires both `class_id` and `roll_no`
- Query is scoped to specific class
- Returns only boolean (no student data exposed)

**Security Risk:** ✅ **LOW**

**Attack Scenarios:**

1. **Brute-force roll number enumeration:**
   - Attacker could iterate through roll numbers to discover which exist
   - **Impact:** LOW - reveals only that a roll number is registered (no names/emails)
   - **Mitigation:** Rate limiting (Supabase level)

2. **Class ID enumeration:**
   - Attacker could test random UUIDs to find valid classes
   - **Impact:** NEGLIGIBLE - UUID space is too large for practical enumeration
   - **Mitigation:** None needed (inherent UUID security)

**Anonymous Access Justification:**
Students must check for duplicate roll numbers BEFORE creating an account. They have no JWT token yet, so anonymous access is required.

**JWT Verification:** ❌ **INTENTIONALLY DISABLED**

**Recommended Deployment Mode:**
```bash
supabase functions deploy check-roll-taken --no-verify-jwt
```

**Required Code Changes:** ✅ **NONE** - Function is secure as-is

**Risk Level:** 🟢 **LOW** - Safe to deploy

---

## Function 2: cleanup-failed-signup

### Overview
**Function:** `supabase/functions/cleanup-failed-signup/index.ts`  
**Caller:** `login.html` (signup error recovery)  
**Line:** 649

**Purpose:** Delete orphaned auth user when Step 2 of signup (create-ta-profile) fails after Step 1 (auth.signUp) succeeds.

### Security Analysis

**Authentication:** None (anonymous access)  
**Authorization:** ⚠️ **INSUFFICIENT** - Critical vulnerability  
**Inputs:**
```json
{
  "auth_user_id": "uuid"
}
```

**Outputs:**
```json
{
  "success": boolean,
  "error": "string"
}
```

**Sensitive Data:** Yes - deletes auth.users row (privilege escalation risk)  
**Uses Service Role:** ✅ Yes - calls `supabase.auth.admin.deleteUser()`  
**Public Access Required:** ⚠️ **QUESTIONABLE** - should be authenticated  
**JWT Verification:** ❌ Disabled (DANGEROUS)

**Database Operations:**
```typescript
// Safety check
const { data: profile } = await supabase
  .from("ta_profiles")
  .select("id")
  .eq("id", auth_user_id)
  .maybeSingle();

if (profile) {
  return error("Refusing to delete — profile already exists.");
}

// DELETE auth user
const { error } = await supabase.auth.admin.deleteUser(auth_user_id);
```

**Authorization Mechanism:**
- ✅ Checks that `ta_profiles` row does NOT exist (safety guard)
- ❌ Does NOT verify the caller owns the auth_user_id
- ❌ Any anonymous client can supply ANY auth_user_id

**Security Risk:** � **LOW - FIXED** (Originally: �🔴 CRITICAL)

---

### ✅ FIX STATUS (2026-08-24)

**All vulnerabilities resolved.** See `docs/EDGE_FUNCTION_SECURITY_FIXES.md` for complete details.

**Fixes Applied:**
1. ✅ JWT authentication enforced - only authenticated users can call function
2. ✅ Ownership validation - `auth_user_id` must match JWT `user.id`
3. ✅ 5-minute time window - cleanup only allowed within 5 minutes of account creation
4. ✅ Improved error messages - generic responses prevent information leakage
5. ✅ Safety check preserved - will not delete accounts with existing profiles

**Frontend Updated:**
- ✅ `login.html` now passes `authData.session.access_token` instead of anon key

**Deployment Command:**
```bash
supabase functions deploy cleanup-failed-signup
```

**CVE Status:**
- ✅ **CVE-1:** Race condition → Fixed (time window + ownership validation)
- ✅ **CVE-2:** Arbitrary deletion → Fixed (JWT auth + ownership check)
- ✅ **CVE-3:** Timing attack → Fixed (generic error messages)

---

### Original Vulnerability Analysis (RESOLVED)

**Attack Scenarios:**

### 🚨 CRITICAL VULNERABILITY 1: Account Takeover via Race Condition

**Attack Path:**
1. Attacker signs up normally (creates auth user + ta_profile)
2. Attacker immediately calls `cleanup-failed-signup` with their own `auth_user_id`
3. ⏱️ **RACE CONDITION:** If they call it before `ta_profiles` row is committed:
   - Safety check passes (no profile found yet)
   - Function deletes their auth user
   - But `ta_profiles` row THEN commits successfully
4. **Result:** Orphaned `ta_profiles` row with no auth user
5. Attacker signs up again with same email (auth user was deleted)
6. New auth user gets created with DIFFERENT UUID
7. **EXPLOITATION:** Attacker now controls a `ta_profiles` row that belongs to the old UUID, but they authenticated with the new UUID

**Impact:** Account takeover, privilege confusion, orphaned database rows

### 🚨 CRITICAL VULNERABILITY 2: Arbitrary User Deletion (Post-Signup Window)

**Attack Path:**
1. Attacker discovers valid `auth_user_id` (from leaked JWT, database export, etc.)
2. Attacker calls `cleanup-failed-signup` with victim's `auth_user_id`
3. If victim has NOT yet completed `create-ta-profile`:
   - Safety check passes (no profile exists)
   - Function deletes victim's auth user
4. **Result:** Victim's signup is sabotaged; they cannot login

**Impact:** Denial of service against new signups

### 🚨 CRITICAL VULNERABILITY 3: Timing Attack Information Disclosure

**Attack Path:**
1. Attacker calls function with random UUIDs
2. Observes response times and error messages:
   - "Refusing to delete — profile already exists" = Valid registered user
   - "Missing auth_user_id" = Invalid UUID
   - Success response = Just-signed-up user (no profile yet)
3. **Result:** Attacker can enumerate valid auth user IDs

**Impact:** Information disclosure, reconnaissance for targeted attacks

**Anonymous Access Justification:**
❌ **NOT JUSTIFIED** - This function is only ever called from login.html AFTER a failed signup attempt. The caller SHOULD have a short-lived JWT from the auth.signUp() call (Step 1 succeeded). There is no legitimate reason for anonymous access.

**JWT Verification:** ✅ **MUST BE ENABLED**

**Required Code Changes:** 🔴 **CRITICAL - MUST FIX BEFORE DEPLOYMENT**

**Fix 1: Enable JWT Verification**
```typescript
// At the top of the function
const authHeader = req.headers.get('authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized - authentication required' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Extract JWT
const jwt = authHeader.replace('Bearer ', '');
const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid authentication token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Fix 2: Enforce Ownership**
```typescript
const { auth_user_id } = await req.json();

// NEW: Verify caller owns the auth_user_id
if (auth_user_id !== user.id) {
  return new Response(
    JSON.stringify({ error: 'Forbidden - can only delete your own failed signup' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Fix 3: Time-Bound Window**
```typescript
// NEW: Only allow cleanup within 5 minutes of user creation
const { data: authUser } = await supabase.auth.admin.getUserById(auth_user_id);
const createdAt = new Date(authUser.created_at);
const now = new Date();
const ageMinutes = (now - createdAt) / 1000 / 60;

if (ageMinutes > 5) {
  return new Response(
    JSON.stringify({ error: 'Cleanup window expired - contact support' }),
    { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Recommended Deployment Mode:**
```bash
# DO NOT DEPLOY until fixes are applied
# After fixes:
supabase functions deploy cleanup-failed-signup
```

**Risk Level:** 🔴 **CRITICAL** - DO NOT DEPLOY without fixes

---

## Function 3: create-ta-profile

### Overview
**Function:** `supabase/functions/create-ta-profile/index.ts`  
**Caller:** `login.html` (signup flow Step 2)  
**Line:** 626

**Purpose:** Create ta_profiles row + first class after successful auth.signUp()

### Security Analysis

**Authentication:** None (anonymous access)  
**Authorization:** ⚠️ **WEAK** - Vulnerable to profile injection  
**Inputs:**
```json
{
  "ta_name": "string",
  "ta_email": "string",
  "course": "string",
  "sir_name": "string",
  "auth_user_id": "uuid"
}
```

**Outputs:**
```json
{
  "success": boolean,
  "class_id": "uuid",
  "class_link_token": "string",
  "error": "string"
}
```

**Sensitive Data:** Yes - creates database rows with arbitrary data  
**Uses Service Role:** ✅ Yes - inserts into ta_profiles and classes  
**Public Access Required:** ⚠️ **QUESTIONABLE**  
**JWT Verification:** ❌ Disabled (DANGEROUS)

**Database Operations:**
```typescript
// 1. Create/update TA profile
await supabase
  .from("ta_profiles")
  .upsert({ id: auth_user_id, ta_name, email: ta_email }, { onConflict: "id" });

// 2. Create first class
const { data: tokenData } = await supabase.rpc("generate_class_token");
await supabase
  .from("classes")
  .insert({
    ta_id: auth_user_id,
    name: course,
    sir_name: sir_name || null,
    class_link_token: tokenData,
  });
```

**Authorization Mechanism:**
- Input validation: Checks required fields exist
- ❌ Does NOT verify caller owns `auth_user_id`
- ❌ Any anonymous client can create profiles for ANY auth user ID

**Security Risk:** � **LOW - FIXED** (Originally: 🔴 CRITICAL)

---

### ✅ FIX STATUS (2026-08-24)

**All vulnerabilities resolved.** See `docs/EDGE_FUNCTION_SECURITY_FIXES.md` for complete details.

**Fixes Applied:**
1. ✅ JWT authentication enforced - only authenticated users can call function
2. ✅ `auth_user_id` removed from request body - function uses JWT `user.id` instead
3. ✅ Email validation - `ta_email` must match authenticated user's email
4. ✅ Duplicate profile check - returns 409 if profile already exists
5. ✅ INSERT instead of UPSERT - prevents overwriting existing profiles

**Frontend Updated:**
- ✅ `login.html` now passes `authData.session.access_token` instead of anon key
- ✅ `auth_user_id` removed from request body

**Deployment Command:**
```bash
supabase functions deploy create-ta-profile
```

**CVE Status:**
- ✅ **CVE-4:** Profile injection → Fixed (JWT auth + server-controlled user ID)
- ✅ **CVE-5:** Bulk spam → Fixed (authenticated-only access)

---

### Original Vulnerability Analysis (RESOLVED)

**Attack Scenarios:**

### 🚨 CRITICAL VULNERABILITY 4: Profile Injection Attack

**Attack Path:**
1. Victim creates account via normal signup (auth user created)
2. Attacker intercepts or discovers victim's `auth_user_id`
3. Attacker calls `create-ta-profile` with:
   ```json
   {
     "auth_user_id": "victim-uuid",
     "ta_name": "Attacker Name",
     "ta_email": "attacker@evil.com",
     "course": "Malicious Course",
     "sir_name": "Fake Professor"
   }
   ```
4. Function creates `ta_profiles` row for victim's auth UUID
5. Function creates `classes` row with attacker-controlled data
6. Victim logs in → Gets attacker's profile and class
7. **Result:** Account hijacking, data poisoning

**Impact:** Complete account takeover, ability to impersonate legitimate TAs

### 🚨 CRITICAL VULNERABILITY 5: Bulk Profile Spam

**Attack Path:**
1. Attacker generates random UUIDs
2. Calls `create-ta-profile` repeatedly with fake data
3. Creates thousands of orphaned profiles (no corresponding auth users)
4. **Result:** Database pollution, resource exhaustion

**Impact:** Denial of service, database bloat

**Anonymous Access Justification:**
❌ **NOT JUSTIFIED** - This function is called AFTER auth.signUp() succeeds. The caller HAS a JWT token from the signup. There is no reason to allow anonymous access.

**JWT Verification:** ✅ **MUST BE ENABLED**

**Required Code Changes:** 🔴 **CRITICAL - MUST FIX BEFORE DEPLOYMENT**

**Fix 1: Enable JWT Verification**
```typescript
// At the top of the function
const authHeader = req.headers.get('authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized - authentication required' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const jwt = authHeader.replace('Bearer ', '');
const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid authentication token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Fix 2: Remove auth_user_id from Request Body**
```typescript
// REMOVE this from request body validation
// const { ta_name, ta_email, course, sir_name, auth_user_id } = body;

// USE JWT user ID instead
const { ta_name, ta_email, course, sir_name } = body;
const auth_user_id = user.id;  // ← From verified JWT

if (!ta_name || !ta_email || !course) {  // Removed auth_user_id check
  return new Response(
    JSON.stringify({ error: "Missing required fields" }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Fix 3: Prevent Duplicate Profile Creation**
```typescript
// Check if profile already exists
const { data: existing } = await supabase
  .from("ta_profiles")
  .select("id")
  .eq("id", auth_user_id)
  .maybeSingle();

if (existing) {
  return new Response(
    JSON.stringify({ error: "Profile already exists" }),
    { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Then create profile (use INSERT instead of UPSERT)
const { error: profileErr } = await supabase
  .from("ta_profiles")
  .insert({ id: auth_user_id, ta_name, email: ta_email });
```

**Recommended Deployment Mode:**
```bash
# DO NOT DEPLOY until fixes are applied
# After fixes:
supabase functions deploy create-ta-profile
```

**Risk Level:** 🔴 **CRITICAL** - DO NOT DEPLOY without fixes

---

## Function 4: get-student-marks

### Overview
**Function:** `supabase/functions/get-student-marks/index.ts`  
**Caller:** `join.html` (student marks view)  
**Line:** 562

**Purpose:** Return student's own marks via class_link_token + roll_no authentication

### Security Analysis

**Authentication:** Token-based (class_link_token + roll_no)  
**Authorization:** ✅ Secure - Token + roll number combination  
**Inputs:**
```json
{
  "class_token": "string (class_link_token)",
  "roll_no": "string"
}
```

**Outputs:**
```json
{
  "status": "pending|approved|rejected",
  "name": "string",
  "student_id": "uuid",
  "marks_visible": boolean,
  "marks": [
    {
      "category_id": "uuid",
      "name": "string",
      "marks": number,
      "total": number,
      "highest": number,
      "lowest": number,
      "average": number,
      "queries": [...]
    }
  ]
}
```

**Sensitive Data:** Yes - student marks, queries, class statistics  
**Uses Service Role:** ✅ Yes - bypasses RLS to query all tables  
**Public Access Required:** ✅ Yes - students access without login  
**JWT Verification:** ❌ Disabled (intentional)

**Database Operations:**
```typescript
// 1. Validate class token
const { data: cls } = await supabase
  .from("classes")
  .select("id, marks_visible")
  .eq("class_link_token", class_token)
  .single();

// 2. Validate student exists in class
const { data: student } = await supabase
  .from("students")
  .select("id, name, status")
  .eq("class_id", cls.id)
  .eq("roll_no", roll_no)
  .single();

// 3. Return marks only if approved + marks_visible
if (student.status === 'approved' && cls.marks_visible) {
  // Query marks, calculate statistics, return queries
}
```

**Authorization Mechanism:**
- **Two-factor authentication:** `class_link_token` (possession) + `roll_no` (knowledge)
- Token validates class exists
- Roll number validates student identity
- Status check prevents pending/rejected students from seeing marks
- `marks_visible` flag allows TA to control publication

**Security Risk:** ✅ **LOW**

**Attack Scenarios:**

1. **Roll number enumeration:**
   - Attacker with valid class_link_token could iterate roll numbers
   - **Impact:** LOW - Can only access marks if student is approved AND marks are published
   - **Mitigation:** Rate limiting (Supabase level)

2. **Token leakage:**
   - If class_link_token leaks, attacker can access all students' marks
   - **Impact:** MEDIUM - Full class data exposure
   - **Mitigation:** TA can regenerate token, token rotation (future feature)

3. **Information disclosure via error messages:**
   - Different errors for invalid token vs. invalid roll number
   - **Impact:** NEGLIGIBLE - Minor reconnaissance value
   - **Mitigation:** None needed (acceptable trade-off for usability)

**Anonymous Access Justification:**
✅ **JUSTIFIED** - Students view marks without creating accounts. They authenticate via possession of the join link (token) + knowledge of their roll number. This is an intentional design pattern for frictionless student access.

**JWT Verification:** ❌ **INTENTIONALLY DISABLED**

**Recommended Deployment Mode:**
```bash
supabase functions deploy get-student-marks --no-verify-jwt
```

**Required Code Changes:** ✅ **NONE** - Function is secure as-is

**Risk Level:** 🟢 **LOW** - Safe to deploy

---

## Function 5: get-ta-by-token

### Overview
**Function:** `supabase/functions/get-ta-by-token/index.ts`  
**Caller:** `join.html` (initial page load to display TA info)  
**Line:** 470

**Purpose:** Return public TA information (name, avatar, class details) via class_link_token

### Security Analysis

**Authentication:** Token-based (class_link_token)  
**Authorization:** ✅ Secure - Returns only public information  
**Inputs:**
```json
{
  "token": "string (class_link_token)"
}
```

**Outputs:**
```json
{
  "ta_id": "uuid",
  "ta_name": "string",
  "avatar_url": "string",
  "course": "string (class.name)",
  "sir_name": "string",
  "class_id": "uuid"
}
```

**Sensitive Data:** No - all returned data is intentionally public  
**Uses Service Role:** ✅ Yes - queries classes and ta_profiles  
**Public Access Required:** ✅ Yes - displayed before student registration  
**JWT Verification:** ❌ Disabled (intentional)

**Database Operations:**
```typescript
const { data: cls } = await supabase
  .from("classes")
  .select("id, ta_id, name, sir_name, ta_profiles(ta_name, avatar_url)")
  .eq("class_link_token", token)
  .single();
```

**Authorization Mechanism:**
- Token validates class exists
- Returns only public TA information (name, avatar)
- Does NOT return email, sensitive class settings, or student data

**Security Risk:** ✅ **MINIMAL**

**Attack Scenarios:**

1. **Token enumeration:**
   - Attacker could test random tokens to discover valid classes
   - **Impact:** NEGLIGIBLE - Tokens are 32-character hex (128-bit entropy)
   - **Mitigation:** None needed (computationally infeasible)

2. **Information disclosure:**
   - Returns TA name, avatar URL, class name, professor name
   - **Impact:** ACCEPTABLE - This information is intentionally public for join page
   - **Mitigation:** None needed (by design)

**Anonymous Access Justification:**
✅ **JUSTIFIED** - This endpoint powers the join page UI. Students need to see TA information BEFORE deciding to register. All returned data is intentionally public.

**JWT Verification:** ❌ **INTENTIONALLY DISABLED**

**Recommended Deployment Mode:**
```bash
supabase functions deploy get-ta-by-token --no-verify-jwt
```

**Required Code Changes:** ✅ **NONE** - Function is secure as-is

**Risk Level:** 🟢 **MINIMAL** - Safe to deploy

---

## Function 6: get-teacher-dashboard

### Overview
**Function:** `supabase/functions/get-teacher-dashboard/index.ts`  
**Caller:** `teacher-view.html` (read-only teacher dashboard)  
**Line:** 340

**Purpose:** Return aggregated class statistics for teachers (Sir) via teacher_view_token

### Security Analysis

**Authentication:** Token-based (teacher_view_token)  
**Authorization:** ✅ Secure - Token validates access  
**Inputs:**
```json
{
  "token": "string (teacher_view_token)"
}
```

**Outputs:**
```json
{
  "class_name": "string",
  "sir_name": "string",
  "ta_name": "string",
  "total_students": number,
  "graded_students": number,
  "class_average": number,
  "quizzes": [
    {
      "id": "uuid",
      "name": "string",
      "total": number,
      "average": number,
      "highest": number,
      "lowest": number,
      "above_avg_pct": number,
      "below_avg_pct": number,
      "graded_count": number,
      "top5": [...],
      "bottom5": [...],
      "all": [...]
    }
  ]
}
```

**Sensitive Data:** Yes - student names, roll numbers, marks  
**Uses Service Role:** ✅ Yes - aggregates data across students/marks  
**Public Access Required:** ✅ Yes - teachers access without TA account  
**JWT Verification:** ❌ Disabled (intentional)

**Database Operations:**
```typescript
// 1. Validate teacher token
const { data: cls } = await supabase
  .from("classes")
  .select("id, name, sir_name, ta_profiles(ta_name)")
  .eq("teacher_view_token", token)
  .single();

// 2. Get approved students
const { data: students } = await supabase
  .from("students")
  .select("id, name, roll_no")
  .eq("class_id", cls.id)
  .eq("status", "approved");

// 3. Get mark categories and marks
const { data: categories } = await supabase
  .from("mark_categories")
  .select("id, name, total")
  .eq("class_id", cls.id);

const { data: allMarks } = await supabase
  .from("marks")
  .select("student_id, category_id, marks")
  .in("category_id", categoryIds);

// 4. Aggregate statistics
```

**Authorization Mechanism:**
- Token validates class exists and caller has teacher access
- Returns student names + marks (teachers should see this)
- Only returns approved students (pending/rejected hidden)
- Read-only (no edit capabilities)

**Security Risk:** 🟡 **MEDIUM**

**Attack Scenarios:**

1. **Token leakage:**
   - If teacher_view_token leaks, attacker sees all student marks
   - **Impact:** HIGH - Full class gradebook exposure with student names
   - **Mitigation:** TA can regenerate token, token should be kept confidential

2. **Token enumeration:**
   - Attacker could test random tokens
   - **Impact:** NEGLIGIBLE - 128-bit entropy (computationally infeasible)
   - **Mitigation:** None needed

3. **Data aggregation attack:**
   - Response includes individual student marks (not just aggregates)
   - **Impact:** MEDIUM - More data than "average only" would expose
   - **Design Decision:** Teachers need detailed breakdowns for pedagogical analysis

**Anonymous Access Justification:**
✅ **JUSTIFIED** - Teachers (Sir) should NOT need to create TA accounts. The `teacher_view_token` acts as a long-lived access credential. This is an intentional design pattern to simplify teacher access.

**JWT Verification:** ❌ **INTENTIONALLY DISABLED**

**Security Consideration:**
The function returns full student lists with marks. This is appropriate for teachers, but the token MUST be kept confidential. Document to TAs:
- Do not share teacher links publicly
- Regenerate token if accidentally exposed
- Consider token expiration in future updates

**Recommended Deployment Mode:**
```bash
supabase functions deploy get-teacher-dashboard --no-verify-jwt
```

**Required Code Changes:** ✅ **NONE** - Function is secure as-is (by design)

**Risk Level:** 🟡 **MEDIUM** - Safe to deploy (acceptable risk for use case)

---

## Function 7: send-marks-email

### Overview
**Function:** `supabase/functions/send-marks-email/index.ts`  
**Caller:** **NOT FOUND** in current codebase  
**Line:** N/A

**Purpose:** Send email notifications to students about their marks using Resend API

### Security Analysis

**Authentication:** Unknown (function not currently called)  
**Authorization:** ⚠️ **NONE** - No verification  
**Inputs:**
```json
{
  "student_name": "string",
  "student_email": "string",
  "ta_name": "string",
  "sir_name": "string",
  "course": "string",
  "category": "string",
  "marks": number,
  "total": number,
  "remarks": "string",
  "is_reminder": boolean
}
```

**Outputs:**
```json
{
  "success": boolean,
  "error": "string"
}
```

**Sensitive Data:** Yes - student email, marks, remarks  
**Uses Service Role:** ❌ No - only calls external Resend API  
**Public Access Required:** ❌ No - should be authenticated  
**JWT Verification:** Unknown (function not deployed/used)

**External API Operations:**
```typescript
await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from: `Aurelis <noreply@your-domain.com>`,
    to: [student_email],
    subject,
    html: bodyHtml,
  }),
});
```

**Authorization Mechanism:**
- ❌ **NONE CURRENTLY** - Function accepts all inputs without verification

**Security Risk:** 🔴 **HIGH** (if deployed as-is)

**Attack Scenarios:**

### 🚨 VULNERABILITY 6: Email Spam / Phishing Platform

**Attack Path:**
1. Attacker calls endpoint with arbitrary data:
   ```json
   {
     "student_email": "victim@example.com",
     "ta_name": "Fake TA",
     "marks": 0,
     "is_reminder": true
   }
   ```
2. Function sends email to victim with attacker-controlled content
3. **Result:** Platform becomes email spam relay

**Impact:** Reputation damage, Resend API abuse, phishing attacks

### 🚨 VULNERABILITY 7: Resend API Quota Exhaustion

**Attack Path:**
1. Attacker calls endpoint repeatedly
2. Exhausts Resend API daily quota
3. **Result:** Legitimate emails cannot be sent

**Impact:** Denial of service for actual notifications

**Current Status:** ℹ️ **NOT USED** - Function is NOT called anywhere in the codebase (dashboard.html has no email sending UI)

**JWT Verification:** ✅ **MUST BE ENABLED** (if ever used)

**Required Code Changes:** 🔴 **CRITICAL - IF EVER DEPLOYED**

**Fix 1: Enable JWT Verification**
```typescript
const authHeader = req.headers.get('authorization');
if (!authHeader) {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

const jwt = authHeader.replace('Bearer ', '');
const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

if (authError || !user) {
  return new Response(
    JSON.stringify({ error: 'Invalid token' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Fix 2: Verify TA Ownership**
```typescript
// Verify the authenticated user is a TA
const { data: taProfile } = await supabase
  .from("ta_profiles")
  .select("id, ta_name")
  .eq("id", user.id)
  .single();

if (!taProfile) {
  return new Response(
    JSON.stringify({ error: 'Not authorized - TA account required' }),
    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
```

**Fix 3: Verify Student Belongs to TA**
```typescript
// Require student_id instead of arbitrary email
const { student_id, category_id, marks, remarks } = await req.json();

// Verify student belongs to this TA
const { data: student } = await supabase
  .from("students")
  .select("id, name, email, ta_id, class_id")
  .eq("id", student_id)
  .eq("ta_id", user.id)
  .single();

if (!student) {
  return new Response(
    JSON.stringify({ error: 'Student not found or not authorized' }),
    { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Use verified data instead of request body
const student_email = student.email;
const ta_name = taProfile.ta_name;
```

**Recommended Deployment Mode:**
```bash
# DO NOT DEPLOY until:
# 1. Dashboard UI implements email sending
# 2. Security fixes applied
# 3. Rate limiting configured

# After fixes:
supabase functions deploy send-marks-email
```

**Risk Level:** 🔴 **HIGH** - DO NOT DEPLOY without fixes (currently unused, defer)

---

## Summary Tables

### Function Security Matrix

| Function | Caller | Auth | Anonymous | Service Role | Sensitive Data | Risk Level |
|----------|--------|------|-----------|--------------|----------------|------------|
| check-roll-taken | join.html | Token | ✅ Yes | ✅ Yes | ❌ No | 🟢 LOW |
| cleanup-failed-signup | login.html | ❌ None | ⚠️ Yes | ✅ Yes | ✅ Yes | 🔴 CRITICAL |
| create-ta-profile | login.html | ❌ None | ⚠️ Yes | ✅ Yes | ✅ Yes | 🔴 CRITICAL |
| get-student-marks | join.html | Token+Roll | ✅ Yes | ✅ Yes | ✅ Yes | 🟢 LOW |
| get-ta-by-token | join.html | Token | ✅ Yes | ✅ Yes | ❌ No | 🟢 MINIMAL |
| get-teacher-dashboard | teacher-view.html | Token | ✅ Yes | ✅ Yes | ✅ Yes | 🟡 MEDIUM |
| send-marks-email | (unused) | ❌ None | ⚠️ Yes | ❌ No | ✅ Yes | 🔴 HIGH |

### Deployment Readiness

| Function | Status | Code Changes | JWT Mode | Deploy Command |
|----------|--------|--------------|----------|----------------|
| check-roll-taken | ✅ READY | None | `--no-verify-jwt` | `supabase functions deploy check-roll-taken --no-verify-jwt` |
| cleanup-failed-signup | 🔴 BLOCKED | CRITICAL | Default (verify) | DO NOT DEPLOY |
| create-ta-profile | 🔴 BLOCKED | CRITICAL | Default (verify) | DO NOT DEPLOY |
| get-student-marks | ✅ READY | None | `--no-verify-jwt` | `supabase functions deploy get-student-marks --no-verify-jwt` |
| get-ta-by-token | ✅ READY | None | `--no-verify-jwt` | `supabase functions deploy get-ta-by-token --no-verify-jwt` |
| get-teacher-dashboard | ✅ READY | None | `--no-verify-jwt` | `supabase functions deploy get-teacher-dashboard --no-verify-jwt` |
| send-marks-email | ℹ️ DEFER | Required if used | Default (verify) | DO NOT DEPLOY (unused) |

### Critical Vulnerabilities Summary

| Vuln ID | Function | Severity | Issue | Impact |
|---------|----------|----------|-------|--------|
| **CVE-1** | cleanup-failed-signup | 🔴 CRITICAL | No JWT verification + no ownership check | Account takeover via race condition |
| **CVE-2** | cleanup-failed-signup | 🔴 CRITICAL | Arbitrary user deletion | DoS against new signups |
| **CVE-3** | cleanup-failed-signup | 🔴 CRITICAL | Timing attack | User enumeration |
| **CVE-4** | create-ta-profile | 🔴 CRITICAL | No JWT verification + client-controlled auth_user_id | Profile injection, account hijacking |
| **CVE-5** | create-ta-profile | 🔴 CRITICAL | No ownership validation | Bulk profile spam |
| **CVE-6** | send-marks-email | 🔴 HIGH | No authorization | Email spam relay / phishing platform |
| **CVE-7** | send-marks-email | 🔴 HIGH | No rate limiting | API quota exhaustion |

### JWT Verification Requirements

| Function | JWT Required | Reason |
|----------|-------------|--------|
| check-roll-taken | ❌ No | Anonymous pre-registration check |
| cleanup-failed-signup | ✅ **YES** | Must verify caller owns the auth_user_id |
| create-ta-profile | ✅ **YES** | Must verify caller owns the auth_user_id |
| get-student-marks | ❌ No | Students access via token+roll (no account) |
| get-ta-by-token | ❌ No | Public TA info for join page |
| get-teacher-dashboard | ❌ No | Teachers access via token (no account) |
| send-marks-email | ✅ **YES** | Must verify TA owns student |

---

## Deployment Roadmap

### Phase 1: Immediate - Safe Functions (Deploy Now)

**Status:** ✅ Ready for production

```bash
# Deploy safe read-only functions
supabase functions deploy check-roll-taken --no-verify-jwt
supabase functions deploy get-student-marks --no-verify-jwt
supabase functions deploy get-ta-by-token --no-verify-jwt
supabase functions deploy get-teacher-dashboard --no-verify-jwt
```

**Impact:** Students can register, view marks, teachers can view dashboards

**Risk:** None - these functions are secure as-is

---

### Phase 2: Critical Fixes - Signup Flow (MUST FIX)

**Status:** 🔴 Blocked - requires code changes

**Functions to Fix:**
1. `cleanup-failed-signup`
2. `create-ta-profile`

**Required Actions:**

#### Step 1: Fix `create-ta-profile`

**File:** `supabase/functions/create-ta-profile/index.ts`

**Changes Required:**
1. Add JWT extraction at top of handler
2. Remove `auth_user_id` from request body
3. Use `user.id` from JWT instead
4. Change UPSERT to INSERT
5. Add duplicate profile check

**Testing:**
```bash
# After fixes, test locally
supabase functions serve create-ta-profile

# Test without JWT (should fail with 401)
curl -X POST http://localhost:54321/functions/v1/create-ta-profile \
  -H "Content-Type: application/json" \
  -d '{"ta_name":"Test","ta_email":"test@test.com","course":"CS101"}'

# Test with JWT (should succeed)
curl -X POST http://localhost:54321/functions/v1/create-ta-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"ta_name":"Test","ta_email":"test@test.com","course":"CS101"}'
```

**Deploy:**
```bash
supabase functions deploy create-ta-profile
```

#### Step 2: Fix `cleanup-failed-signup`

**File:** `supabase/functions/cleanup-failed-signup/index.ts`

**Changes Required:**
1. Add JWT extraction at top of handler
2. Add ownership check: `auth_user_id === user.id`
3. Add time-bound window (5 minutes)
4. Improve error messages (prevent timing attacks)

**Testing:**
```bash
# Test without JWT (should fail with 401)
curl -X POST http://localhost:54321/functions/v1/cleanup-failed-signup \
  -H "Content-Type: application/json" \
  -d '{"auth_user_id":"some-uuid"}'

# Test with wrong user JWT (should fail with 403)
curl -X POST http://localhost:54321/functions/v1/cleanup-failed-signup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_A_JWT" \
  -d '{"auth_user_id":"user-b-uuid"}'
```

**Deploy:**
```bash
supabase functions deploy cleanup-failed-signup
```

#### Step 3: Update Frontend

**File:** `login.html`

**Changes Required:**

**For `create-ta-profile` call (line 626):**
```javascript
// REMOVE auth_user_id from body
const res = await fetch(`${SUPABASE_URL}/functions/v1/create-ta-profile`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${SUPABASE_ANON}`  // ← CHANGE THIS
  },
  body: JSON.stringify({
    ta_name: taName,
    ta_email: email,
    course,
    sir_name: sirName,
    // REMOVE: auth_user_id: authData.user.id
  })
});
```

**Change to:**
```javascript
const res = await fetch(`${SUPABASE_URL}/functions/v1/create-ta-profile`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${authData.session.access_token}`  // ← Use session token
  },
  body: JSON.stringify({
    ta_name: taName,
    ta_email: email,
    course,
    sir_name: sirName
    // auth_user_id removed - function gets it from JWT
  })
});
```

**For `cleanup-failed-signup` call (line 649):**
```javascript
await fetch(`${SUPABASE_URL}/functions/v1/cleanup-failed-signup`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON,
    'Authorization': `Bearer ${authData.session.access_token}`  // ← Use session token
  },
  body: JSON.stringify({ auth_user_id: authData.user.id })
});
```

**Impact:** Signup flow will be fully secure

---

### Phase 3: Defer - Email Function (Future)

**Status:** ℹ️ Not currently used

**Function:** `send-marks-email`

**Action:** Do NOT deploy until:
1. Dashboard UI implements email sending feature
2. Security fixes applied (JWT verification + ownership checks)
3. Rate limiting configured
4. Resend domain verified

---

## Production Deployment Commands

### Safe to Deploy Now (4 functions):

```bash
# Navigate to project directory
cd "c:\Users\mian mobile\OneDrive\Desktop\ta-portal-main"

# Login to Supabase (if not already)
supabase login

# Link to production project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy safe functions
supabase functions deploy check-roll-taken --no-verify-jwt
supabase functions deploy get-student-marks --no-verify-jwt
supabase functions deploy get-ta-by-token --no-verify-jwt
supabase functions deploy get-teacher-dashboard --no-verify-jwt

# Verify deployments
supabase functions list
```

### Deploy After Fixes (2 functions):

```bash
# After code changes + frontend updates:
supabase functions deploy create-ta-profile
supabase functions deploy cleanup-failed-signup

# Note: JWT verification is DEFAULT (no --no-verify-jwt flag)
```

### Do NOT Deploy (1 function):

```bash
# send-marks-email - defer until feature is implemented
```

---

## Post-Deployment Verification

**Test each deployed function:**

### 1. check-roll-taken
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-roll-taken \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"class_id":"test-uuid","roll_no":"test-roll"}'
# Expected: {"taken":false}
```

### 2. get-ta-by-token
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-ta-by-token \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"token":"invalid-token"}'
# Expected: {"error":"Invalid or expired link"}
```

### 3. get-student-marks
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-student-marks \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"class_token":"invalid","roll_no":"test"}'
# Expected: {"error":"Invalid class link"}
```

### 4. get-teacher-dashboard
```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/get-teacher-dashboard \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{"token":"invalid-token"}'
# Expected: {"error":"Invalid or expired link"}
```

---

## Critical Security Recommendations

### 1. Fix Before ANY Signup

🔴 **CRITICAL:** Do NOT allow user signups until `create-ta-profile` and `cleanup-failed-signup` are fixed. The vulnerabilities allow account takeover.

### 2. Environment Secrets

Ensure these are configured in Supabase:

```bash
# For send-marks-email (when deployed)
supabase secrets set RESEND_API_KEY=your_resend_key_here
```

### 3. Rate Limiting

Configure Supabase rate limiting for anonymous endpoints:
- `check-roll-taken`: 10 requests/minute per IP
- `get-student-marks`: 20 requests/minute per IP
- `get-ta-by-token`: 20 requests/minute per IP
- `get-teacher-dashboard`: 20 requests/minute per IP

### 4. Monitoring

Set up monitoring for:
- Function error rates
- Unauthorized access attempts (401/403 responses)
- Unusual traffic patterns (potential enumeration attacks)

### 5. Token Rotation

Document for TAs:
- Class link tokens and teacher view tokens never expire
- If accidentally exposed, regenerate immediately via dashboard
- Do not share teacher dashboard links publicly

---

## Conclusion

**Audit Status:** ✅ COMPLETE

**Overall Security Posture:**
- 🟢 **4 functions** are secure and ready for immediate deployment
- 🔴 **2 functions** have critical vulnerabilities requiring fixes before deployment
- ℹ️ **1 function** is not currently used and should be deferred

**Immediate Actions Required:**
1. ✅ Deploy safe functions (check-roll-taken, get-student-marks, get-ta-by-token, get-teacher-dashboard)
2. 🔴 Fix critical vulnerabilities in create-ta-profile and cleanup-failed-signup
3. 🔴 Update login.html to pass JWT tokens to fixed functions
4. ✅ Test signup flow end-to-end after fixes
5. ℹ️ Defer send-marks-email deployment

**Production Go-Live Blockers:**
- Signup flow is BLOCKED until critical fixes are deployed
- Students can browse and view marks (safe functions work)
- Teachers can view dashboards (safe function works)

**Timeline:**
- Safe functions: Deploy immediately
- Critical fixes: 1-2 hours of development + testing
- Full production readiness: After critical fixes deployed

---

**Audit Completed:** 2026-08-24  
**Next Steps:** Apply critical fixes, re-test, deploy remaining functions

*End of Security Audit*

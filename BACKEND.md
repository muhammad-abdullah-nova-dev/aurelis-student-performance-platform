# 🔧 Backend Documentation

Complete reference for the Aurelis backend infrastructure, including Supabase configuration, Edge Functions, database operations, and API endpoints.

---

## Table of Contents

1. [Supabase Configuration](#supabase-configuration)
2. [Database Setup](#database-setup)
3. [Edge Functions](#edge-functions)
4. [API Reference](#api-reference)
5. [Authentication](#authentication)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Supabase Configuration

### Project Details
- **Project ID:** `tbdslkstlsshbowqtufq`
- **Region:** South Asia (Mumbai)
- **Database:** PostgreSQL 17
- **Project URL:** `https://tbdslkstlsshbowqtufq.supabase.co`

### Environment Variables

The following environment variables are automatically available in Edge Functions:

```bash
SUPABASE_URL=https://tbdslkstlsshbowqtufq.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_DB_URL=<connection-string>
```

⚠️ **Never commit API keys to version control!**

---

## Database Setup

### Initial Migration

Run the initial schema migration:

```bash
supabase db push
```

This executes:
1. `0001_initial_schema.sql` - Creates tables and indexes
2. `0002_harden_anonymous_registration.sql` - Adds security policies

### Schema Overview

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TA Profiles
CREATE TABLE ta_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ta_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Classes
CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ta_id UUID NOT NULL REFERENCES ta_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sir_name TEXT,
  class_link_token TEXT UNIQUE NOT NULL,
  teacher_view_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Students
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  roll_no TEXT NOT NULL,
  name TEXT NOT NULL,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(class_id, roll_no)
);

-- Marks
CREATE TABLE marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  quiz_name TEXT NOT NULL,
  obtained INTEGER NOT NULL CHECK (obtained >= 0),
  total INTEGER NOT NULL CHECK (total > 0),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_classes_ta_id ON classes(ta_id);
CREATE INDEX idx_students_class_id ON students(class_id);
CREATE INDEX idx_marks_student_id ON marks(student_id);
```

### Custom Functions

#### Generate Class Token
```sql
CREATE OR REPLACE FUNCTION generate_class_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(extensions.gen_random_bytes(16), 'hex');
END;
$$;
```

### Row Level Security (RLS)

All tables have RLS enabled. See detailed policies in [ARCHITECTURE.md](ARCHITECTURE.md#row-level-security-rls-policies).

---

## Edge Functions

### Overview

| Function | Auth | Purpose |
|----------|------|---------|
| `create-ta-profile` | ✅ Required | Create TA profile + first class |
| `cleanup-failed-signup` | ✅ Required | Delete orphaned auth users |
| `check-roll-taken` | ❌ Public | Validate student roll uniqueness |
| `get-student-marks` | ❌ Public | Fetch marks by roll + class token |
| `get-ta-by-token` | ❌ Public | Fetch TA info by class token |
| `get-teacher-dashboard` | ❌ Public | Fetch class stats by teacher token |

---

### 1. create-ta-profile

**Purpose:** Create TA profile and first class after signup

**Endpoint:** `POST /functions/v1/create-ta-profile`

**Authentication:** Required (JWT)

**Request:**
```typescript
{
  ta_name: string;
  ta_email: string;
  course: string;
  sir_name?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  class_id: string;
  class_link_token: string;
}
```

**Security Features:**
- ✅ JWT verification
- ✅ Email validation (must match auth user)
- ✅ Duplicate profile check
- ✅ Uses verified `user.id` from JWT
- ✅ INSERT (not UPSERT) to prevent overwrite

**Implementation:**
```typescript
// Verify JWT
const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
if (authError || !user) {
  return new Response(JSON.stringify({ error: "Invalid token" }), { status: 401 });
}

// Validate email
if (ta_email !== user.email) {
  return new Response(JSON.stringify({ error: "Email mismatch" }), { status: 400 });
}

// Check for existing profile
const { data: existingProfile } = await supabase
  .from("ta_profiles")
  .select("id")
  .eq("id", user.id)
  .maybeSingle();

if (existingProfile) {
  return new Response(JSON.stringify({ error: "Profile exists" }), { status: 409 });
}

// Create profile
await supabase
  .from("ta_profiles")
  .insert({ id: user.id, ta_name, email: ta_email });

// Generate token and create class
const { data: tokenData } = await supabase.rpc("generate_class_token");
await supabase
  .from("classes")
  .insert({
    ta_id: user.id,
    name: course,
    sir_name: sir_name || null,
    class_link_token: tokenData
  });
```

**Error Codes:**
- `401` - Missing/invalid authentication
- `400` - Email mismatch or missing fields
- `409` - Profile already exists
- `500` - Server error

---

### 2. cleanup-failed-signup

**Purpose:** Delete orphaned auth user when profile creation fails

**Endpoint:** `POST /functions/v1/cleanup-failed-signup`

**Authentication:** Required (JWT)

**Request:**
```typescript
{
  auth_user_id: string;
}
```

**Response:**
```typescript
{
  success: boolean;
}
```

**Security Features:**
- ✅ JWT verification
- ✅ Ownership check (`auth_user_id === user.id`)
- ✅ 5-minute time window
- ✅ Safety check (won't delete if profile exists)

**Implementation:**
```typescript
// Verify JWT
const { data: { user } } = await supabaseAuth.auth.getUser();

// Enforce ownership
if (auth_user_id !== user.id) {
  return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403 });
}

// Check time window (5 minutes)
const { data: authUser } = await supabase.auth.admin.getUserById(auth_user_id);
const ageMinutes = (Date.now() - new Date(authUser.user.created_at).getTime()) / 60000;

if (ageMinutes > 5) {
  return new Response(JSON.stringify({ error: "Window expired" }), { status: 410 });
}

// Safety check: don't delete if profile exists
const { data: profile } = await supabase
  .from("ta_profiles")
  .select("id")
  .eq("id", auth_user_id)
  .maybeSingle();

if (profile) {
  return new Response(JSON.stringify({ error: "Profile complete" }), { status: 409 });
}

// Delete auth user
await supabase.auth.admin.deleteUser(auth_user_id);
```

**Error Codes:**
- `401` - Missing/invalid authentication
- `403` - Attempting to delete another user's account
- `409` - Profile already exists (won't delete)
- `410` - Cleanup window expired
- `500` - Server error

---

### 3. check-roll-taken

**Purpose:** Check if roll number is already taken in a class

**Endpoint:** `POST /functions/v1/check-roll-taken`

**Authentication:** Public (uses class token)

**Request:**
```typescript
{
  class_link_token: string;
  roll_no: string;
}
```

**Response:**
```typescript
{
  taken: boolean;
}
```

**Implementation:**
```typescript
// Verify class exists
const { data: classData } = await supabase
  .from("classes")
  .select("id")
  .eq("class_link_token", class_link_token)
  .single();

if (!classData) {
  return new Response(JSON.stringify({ error: "Invalid token" }), { status: 404 });
}

// Check if roll exists
const { data: student } = await supabase
  .from("students")
  .select("id")
  .eq("class_id", classData.id)
  .eq("roll_no", roll_no)
  .maybeSingle();

return new Response(JSON.stringify({ taken: !!student }), { status: 200 });
```

---

### 4. get-student-marks

**Purpose:** Fetch all marks for a student

**Endpoint:** `POST /functions/v1/get-student-marks`

**Authentication:** Public (uses class token + roll number)

**Request:**
```typescript
{
  class_link_token: string;
  roll_no: string;
}
```

**Response:**
```typescript
{
  student: {
    id: string;
    name: string;
    roll_no: string;
    approved: boolean;
  };
  marks: Array<{
    quiz_name: string;
    obtained: number;
    total: number;
    created_at: string;
  }>;
  class: {
    name: string;
    ta_name: string;
    sir_name: string;
  };
}
```

**Implementation:**
```typescript
// Verify class and student
const { data: classData } = await supabase
  .from("classes")
  .select("id, name, ta_id")
  .eq("class_link_token", class_link_token)
  .single();

const { data: student } = await supabase
  .from("students")
  .select("*")
  .eq("class_id", classData.id)
  .eq("roll_no", roll_no)
  .single();

if (!student.approved) {
  return new Response(JSON.stringify({ error: "Not approved" }), { status: 403 });
}

// Fetch marks
const { data: marks } = await supabase
  .from("marks")
  .select("quiz_name, obtained, total, created_at")
  .eq("student_id", student.id)
  .order("created_at", { ascending: false });

// Fetch TA info
const { data: ta } = await supabase
  .from("ta_profiles")
  .select("ta_name")
  .eq("id", classData.ta_id)
  .single();

return new Response(JSON.stringify({
  student,
  marks,
  class: { ...classData, ta_name: ta.ta_name }
}), { status: 200 });
```

---

### 5. get-ta-by-token

**Purpose:** Fetch TA information by class token

**Endpoint:** `POST /functions/v1/get-ta-by-token`

**Authentication:** Public (uses class token)

**Request:**
```typescript
{
  class_link_token: string;
}
```

**Response:**
```typescript
{
  ta_name: string;
  course: string;
  sir_name: string;
}
```

---

### 6. get-teacher-dashboard

**Purpose:** Fetch read-only class statistics for teachers

**Endpoint:** `POST /functions/v1/get-teacher-dashboard`

**Authentication:** Public (uses teacher view token)

**Request:**
```typescript
{
  teacher_view_token: string;
}
```

**Response:**
```typescript
{
  class: {
    name: string;
    ta_name: string;
  };
  stats: {
    total_students: number;
    graded_students: number;
    overall_average: number;
  };
  quizzes: Array<{
    quiz_name: string;
    students: Array<{
      name: string;
      roll_no: string;
      obtained: number;
      total: number;
    }>;
  }>;
}
```

---

## API Reference

### Supabase Client (Direct Database Access)

All frontend pages use the Supabase JS client for direct database queries:

```javascript
// Initialize client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Authentication
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});

// Query with RLS
const { data: students } = await supabase
  .from('students')
  .select('*')
  .eq('class_id', classId)
  .eq('approved', true);

// Insert
const { data, error } = await supabase
  .from('marks')
  .insert({ student_id, quiz_name, obtained, total });

// Update
const { error } = await supabase
  .from('students')
  .update({ approved: true })
  .eq('id', studentId);

// Delete
const { error } = await supabase
  .from('students')
  .delete()
  .eq('id', studentId);
```

---

## Authentication

### JWT Token Structure

```json
{
  "iss": "supabase",
  "ref": "tbdslkstlsshbowqtufq",
  "role": "anon",
  "iat": 1787595076,
  "exp": 2103171076,
  "sub": "user-uuid",
  "email": "user@example.com"
}
```

### Session Management

```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession();

// Check if user is logged in
if (session) {
  console.log('User ID:', session.user.id);
  console.log('Email:', session.user.email);
}

// Logout
await supabase.auth.signOut();
```

### Email Confirmation

Email confirmation is **disabled** for smooth signup flow. To enable:

1. Go to Supabase Dashboard → Authentication → Providers
2. Toggle "Enable email confirmations" ON
3. Configure email templates

---

## Deployment

### Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login
```

### Link Project

```bash
cd /path/to/project
supabase link --project-ref tbdslkstlsshbowqtufq
```

### Deploy Database Migrations

```bash
# Push migrations
supabase db push

# Or reset and apply from scratch
supabase db reset
```

### Deploy Edge Functions

```bash
# Deploy all functions
supabase functions deploy create-ta-profile
supabase functions deploy cleanup-failed-signup
supabase functions deploy check-roll-taken
supabase functions deploy get-student-marks
supabase functions deploy get-ta-by-token
supabase functions deploy get-teacher-dashboard

# Or deploy single function
supabase functions deploy create-ta-profile

# With verification disabled (for public functions)
supabase functions deploy check-roll-taken --no-verify-jwt
```

### Environment Variables

Set secrets for Edge Functions:

```bash
# Set secret
supabase secrets set MY_SECRET=value

# List secrets
supabase secrets list

# Unset secret
supabase secrets unset MY_SECRET
```

---

## Troubleshooting

### Common Issues

#### 1. **"Failed to fetch" Error**

**Cause:** Edge Function not deployed or wrong URL

**Solution:**
```bash
# Check deployed functions
supabase functions list

# Redeploy if needed
supabase functions deploy function-name
```

#### 2. **"Invalid JWT" Error**

**Cause:** Using wrong API key or expired token

**Solution:**
- Verify `SUPABASE_ANON_KEY` matches dashboard
- Check token expiration
- Regenerate keys if compromised

#### 3. **"Permission Denied" Error**

**Cause:** RLS policy blocking access

**Solution:**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'table_name';

-- Temporarily disable RLS for debugging (NOT IN PRODUCTION!)
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

#### 4. **"Duplicate Key" Error**

**Cause:** Attempting to insert duplicate unique value

**Solution:**
- Check for existing records before insert
- Use UPSERT for idempotent operations
- Implement proper cleanup flow

### Debug Mode

Enable debug logging:

```javascript
// In Edge Functions
console.log('Debug info:', { user, data });

// Check logs
supabase functions logs function-name
```

---

## Performance Optimization

### Database Indexes

```sql
-- Check existing indexes
SELECT * FROM pg_indexes WHERE tablename = 'students';

-- Add index for frequently queried columns
CREATE INDEX idx_students_approved ON students(approved) WHERE approved = true;
```

### Query Optimization

```javascript
// Bad: Fetching unnecessary data
const { data } = await supabase
  .from('students')
  .select('*');

// Good: Select only needed columns
const { data } = await supabase
  .from('students')
  .select('id, name, roll_no');
```

### Edge Function Cold Starts

- First request after idle: ~200-500ms
- Subsequent requests: ~50-100ms
- Keep functions warm with periodic pings (optional)

---

## Backup & Recovery

### Automatic Backups

Supabase provides:
- Daily backups (retained for 7 days)
- Point-in-time recovery
- Download backups from dashboard

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Import database
psql $DATABASE_URL < backup.sql
```

---

## Monitoring

### Supabase Dashboard

Monitor in real-time:
- Database queries
- API requests
- Edge Function invocations
- Error rates
- Response times

### Logs

```bash
# View Edge Function logs
supabase functions logs function-name --tail

# View database logs
supabase db logs
```

---

## Security Best Practices

1. ✅ Never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend
2. ✅ Always verify JWT in Edge Functions
3. ✅ Use RLS policies for all tables
4. ✅ Validate input in Edge Functions
5. ✅ Use parameterized queries
6. ✅ Enable email verification for production
7. ✅ Rotate API keys regularly
8. ✅ Monitor suspicious activity
9. ✅ Implement rate limiting (via Supabase)
10. ✅ Keep dependencies updated

---

## Support

For backend-related issues:
- 📧 Email: muhammed.abdullah.coder@gmail.com
- 📚 [Supabase Documentation](https://supabase.com/docs)
- 🐛 [GitHub Issues](https://github.com/muhammad-abdullah-nova-dev/aurelis-student-performance-platform/issues)

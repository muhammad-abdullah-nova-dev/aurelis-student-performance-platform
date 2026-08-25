# Supabase Database Schema Audit Report

**Project:** Aurelis Student Performance Platform  
**Audit Date:** 2026-08-24  
**Status:** Pre-Production Schema Validation  
**Auditor:** Automated Repository Analysis

---

## Executive Summary

This audit examined the entire Aurelis codebase to determine the **actual database schema requirements** based on real code usage. The existing `schema.sql` file is **incomplete and outdated**. This report documents every table, column, relationship, and security requirement discovered through systematic code analysis.

**Critical Finding:** The current schema is missing essential columns and contains obsolete tables that are not used by the application.

---

## Audit Methodology

1. ✅ Read all 7 Supabase Edge Functions
2. ✅ Analyzed dashboard.html database operations
3. ✅ Analyzed join.html student registration flow
4. ✅ Searched entire repository for table references
5. ✅ Searched for RPC function usage
6. ✅ Verified obsolete table identification

---

## 1. Edge Function Database Access Analysis

### 1.1 `check-roll-taken/index.ts`

**Purpose:** Server-side duplicate roll number check (prevents direct student table access by anon clients)

**Tables Accessed:**
- `students` (SELECT)

**Columns Used:**
- `students.id` (SELECT only, for existence check)
- `students.class_id` (WHERE clause)
- `students.roll_no` (WHERE clause)

**Key Finding:** Uses `class_id` column which is **MISSING from old schema**.

---

### 1.2 `cleanup-failed-signup/index.ts`

**Purpose:** Delete orphaned auth users when profile creation fails

**Tables Accessed:**
- `ta_profiles` (SELECT)

**Columns Used:**
- `ta_profiles.id` (WHERE clause - checking existence)

**External Operations:**
- `supabase.auth.admin.deleteUser()` - deletes auth.users row

---

### 1.3 `create-ta-profile/index.ts`

**Purpose:** Creates TA profile + first class after signup

**Tables Accessed:**
- `ta_profiles` (UPSERT)
- `classes` (INSERT)

**Columns Used - ta_profiles:**
- `id` (UPSERT with onConflict)
- `ta_name` (INSERT)
- `email` (INSERT)

**Columns Used - classes:**
- `ta_id` (INSERT - foreign key)
- `name` (INSERT - from course field)
- `sir_name` (INSERT - nullable)
- `class_link_token` (INSERT - from RPC)

**RPC Functions:**
- `generate_class_token()` - generates random token

**Key Finding:** `ta_profiles` table NO LONGER stores `course`, `sir_name`, or `class_link_token`. These moved to the `classes` table (multi-class support).

---

### 1.4 `get-student-marks/index.ts`

**Purpose:** Securely fetch one student's marks via class token + roll number

**Tables Accessed:**
- `classes` (SELECT)
- `students` (SELECT)
- `marks` (SELECT with join)
- `mark_categories` (SELECT via join)
- `mark_queries` (SELECT)

**Columns Used - classes:**
- `id` (returned)
- `marks_visible` (conditional logic)
- `class_link_token` (WHERE clause)

**Columns Used - students:**
- `id` (returned, used in subsequent queries)
- `name` (returned)
- `status` (returned, conditional logic)
- `class_id` (WHERE clause)
- `roll_no` (WHERE clause)

**Columns Used - marks:**
- `marks` (returned)
- `total` (returned)
- `category_id` (returned, WHERE clause, join key)
- `student_id` (WHERE clause)

**Columns Used - mark_categories (via join):**
- `name` (returned via join)

**Columns Used - mark_queries:**
- `id` (returned)
- `message` (returned)
- `photo_urls` (returned)
- `resolved` (returned)
- `created_at` (returned, ORDER BY)
- `reply` (returned)
- `replied_at` (returned)
- `student_id` (WHERE clause)
- `category_id` (WHERE clause)

**Key Finding:** `mark_queries` table has extensive usage - needs columns: `id`, `student_id`, `category_id`, `message`, `photo_urls`, `resolved`, `reply`, `replied_at`, `created_at`.

---

### 1.5 `get-ta-by-token/index.ts`

**Purpose:** Returns class info by class link token (for join.html loading)

**Tables Accessed:**
- `classes` (SELECT with join)
- `ta_profiles` (SELECT via join)

**Columns Used - classes:**
- `id` (returned)
- `ta_id` (join key)
- `name` (returned as `course`)
- `sir_name` (returned)
- `class_link_token` (WHERE clause)
- `ta_profiles.ta_name` (returned via join)
- `ta_profiles.avatar_url` (returned via join)

**Key Finding:** Confirms `classes` table needs `name`, `sir_name`, `class_link_token`. Also confirms `ta_profiles.avatar_url` is required.

---

### 1.6 `get-teacher-dashboard/index.ts`

**Purpose:** Read-only dashboard for teachers (Sir) via teacher_view_token

**Tables Accessed:**
- `classes` (SELECT with join)
- `ta_profiles` (SELECT via join)
- `students` (SELECT)
- `mark_categories` (SELECT)
- `marks` (SELECT)

**Columns Used - classes:**
- `id` (returned, used in WHERE clauses)
- `name` (returned)
- `sir_name` (returned)
- `teacher_view_token` (WHERE clause)
- `ta_profiles.ta_name` (returned via join)

**Columns Used - students:**
- `id` (used for aggregation)
- `name` (used in result)
- `roll_no` (used in result)
- `class_id` (WHERE clause)
- `status` (WHERE clause - only 'approved' students)

**Columns Used - mark_categories:**
- `id` (used for aggregation)
- `name` (returned)
- `total` (returned)
- `class_id` (WHERE clause)
- `created_at` (ORDER BY)

**Columns Used - marks:**
- `student_id` (aggregation key)
- `category_id` (aggregation key)
- `marks` (aggregation data)

**Key Finding:** `classes` table MUST have `teacher_view_token` column. This is MISSING from old schema.

---

### 1.7 `send-marks-email/index.ts`

**Purpose:** Sends email notifications (uses Resend API, no database access)

**Tables Accessed:** NONE

**External Services:**
- Resend API (email sending)

**Data Received (from caller):**
- `student_name`, `student_email`, `ta_name`, `sir_name`, `course`, `category`, `marks`, `total`, `remarks`, `is_reminder`

---

## 2. Frontend Database Access Analysis

### 2.1 dashboard.html Analysis

**Direct Database Operations (authenticated TA user):**

#### Storage Operations:
- `sb.storage.from('avatars')` - upload/getPublicUrl
  - Pattern: `{ta_id}/avatar.{ext}`

#### ta_profiles Operations:
- **SELECT:** `id`, `ta_name`, `email`, `avatar_url` (loadTA)
- **UPDATE:** `avatar_url`, `ta_name` (updateAvatar, saveProfile)

#### classes Operations:
- **SELECT:** `*` filtered by `ta_id`, ordered by `created_at`
- **INSERT:** `ta_id`, `name`, `sir_name`, `class_link_token`
- **UPDATE:** 
  - `marks_visible` (toggle)
  - `name`, `sir_name` (class settings)
  - `teacher_view_token` (generate teacher link)
  - `class_link_token` (regenerate link)
  - `google_sheet_url` (sync detection)

**Columns Required:**
- `id`, `ta_id`, `name`, `sir_name`, `class_link_token`, `teacher_view_token`, `marks_visible`, `google_sheet_url`, `created_at`

#### students Operations:
- **SELECT:** `*` filtered by `class_id`, ordered by `roll_no`
- **INSERT:** `ta_id`, `class_id`, `name`, `roll_no`, `email`, `status`
- **UPDATE:** `status` (approve/reject)

**Columns Required:**
- `id`, `ta_id`, `class_id`, `name`, `roll_no`, `email`, `status`, `created_at`

**Key Finding:** `students` table requires `class_id` (MISSING from old schema).

#### mark_categories Operations:
- **SELECT:** `*` filtered by `class_id`, ordered by `created_at`
- **INSERT:** `ta_id`, `class_id`, `name`, `total`
- **UPDATE:** `name`, `total`

**Columns Required:**
- `id`, `ta_id`, `class_id`, `name`, `total`, `created_at`

**Key Finding:** `mark_categories` table requires `class_id` (MISSING from old schema).

#### marks Operations:
- **SELECT:** `*` filtered by `category_id` IN array
- **UPSERT:** `student_id`, `ta_id`, `category_id`, `subject`, `marks`, `total`, `remarks`
  - **Conflict Resolution:** `student_id`, `category_id`, `subject`
- **UPDATE:** `subject`, `total` (bulk update when category renamed)
- **DELETE:** filtered by `student_id` AND `category_id`

**Columns Required:**
- `id`, `student_id`, `ta_id`, `category_id`, `subject`, `marks`, `total`, `remarks`, `created_at`

**Unique Constraint:** `(student_id, category_id, subject)` - required for UPSERT logic.

#### mark_queries Operations:
- **SELECT:** `*` with joins to `students(name, roll_no)` and `mark_categories(name)`, filtered by `ta_id`, ordered by `created_at` DESC
- **UPDATE:** `reply`, `replied_at`, `resolved`

**Columns Required:**
- `id`, `student_id`, `ta_id`, `category_id`, `message`, `photo_urls`, `resolved`, `reply`, `replied_at`, `created_at`

**Storage:**
- `sb.storage.from('mark-query-photos')` - referenced in queries display

#### RPC Functions Used:
- `generate_class_token()` - called 3 times (new class, teacher link, regenerate link)

---

### 2.2 join.html Analysis

**Direct Database Operations (anonymous/unauthenticated):**

#### Edge Function Calls (secure):
- `get-ta-by-token` - fetch class info by token
- `check-roll-taken` - check duplicate roll number
- `get-student-marks` - fetch student status and marks

#### Direct Client Operations:
- **students INSERT (UNSAFE):**
  ```javascript
  sb.from('students').insert({
    ta_id: taData.ta_id,
    class_id: taData.class_id,
    name, roll_no, email, status: 'pending'
  })
  ```
  **SECURITY RISK:** Anonymous client directly inserts into students table with arbitrary `ta_id` and `class_id`. This requires overly permissive RLS policy.

- **mark_queries INSERT:**
  ```javascript
  sb.from('mark_queries').insert({
    student_id, category_id, ta_id,
    message, photo_urls
  })
  ```
  **SECURITY RISK:** Client-side insert allows arbitrary `ta_id`.

#### Storage Operations:
- `sb.storage.from('mark-query-photos')` - upload with pattern: `{category_id}/{student_id}-{timestamp}-{index}.{ext}`

---

## 3. Complete Table Requirements

### 3.1 ta_profiles

**Purpose:** TA identity/profile (auth.users linked via id)

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | - | PRIMARY KEY (auth user id) |
| ta_name | text | NOT NULL | - | - |
| email | text | NOT NULL | - | UNIQUE |
| avatar_url | text | NULL | - | - |
| created_at | timestamptz | NOT NULL | now() | - |

**Removed Columns (moved to classes):**
- ~~sir_name~~ → classes.sir_name
- ~~course~~ → classes.name
- ~~class_link_token~~ → classes.class_link_token
- ~~google_sheet_url~~ → classes.google_sheet_url

---

### 3.2 classes

**Purpose:** Class/course instance (TAs can have multiple classes)

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| ta_id | uuid | NOT NULL | - | REFERENCES ta_profiles(id) ON DELETE CASCADE |
| name | text | NOT NULL | - | - |
| sir_name | text | NULL | - | - |
| class_link_token | text | NOT NULL | - | UNIQUE |
| teacher_view_token | text | NULL | - | UNIQUE |
| marks_visible | boolean | NOT NULL | false | - |
| google_sheet_url | text | NULL | - | - |
| created_at | timestamptz | NOT NULL | now() | - |

**NEW TABLE** - not present in old schema in this form.

---

### 3.3 students

**Purpose:** Student registrations per class

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| ta_id | uuid | NOT NULL | - | REFERENCES ta_profiles(id) ON DELETE CASCADE |
| class_id | uuid | NOT NULL | - | REFERENCES classes(id) ON DELETE CASCADE |
| name | text | NOT NULL | - | - |
| roll_no | text | NOT NULL | - | - |
| email | text | NULL | - | - |
| status | text | NOT NULL | 'pending' | CHECK (status IN ('pending', 'approved', 'rejected')) |
| created_at | timestamptz | NOT NULL | now() | - |

**Unique Constraint:** `UNIQUE(class_id, roll_no)` - one roll per class

**CHANGED:** Old schema had `UNIQUE(ta_id, roll_no)` but code uses `class_id` instead.

---

### 3.4 mark_categories

**Purpose:** Assessment categories (quizzes, assignments) per class

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| ta_id | uuid | NOT NULL | - | REFERENCES ta_profiles(id) ON DELETE CASCADE |
| class_id | uuid | NOT NULL | - | REFERENCES classes(id) ON DELETE CASCADE |
| name | text | NOT NULL | - | - |
| total | numeric | NOT NULL | 20 | - |
| created_at | timestamptz | NOT NULL | now() | - |

**ADDED:** `class_id` column (MISSING from old schema).

---

### 3.5 marks

**Purpose:** Individual student marks for each category

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| student_id | uuid | NOT NULL | - | REFERENCES students(id) ON DELETE CASCADE |
| ta_id | uuid | NOT NULL | - | REFERENCES ta_profiles(id) ON DELETE CASCADE |
| category_id | uuid | NOT NULL | - | REFERENCES mark_categories(id) ON DELETE CASCADE |
| subject | text | NULL | - | Legacy column for sync |
| marks | numeric | NULL | - | - |
| total | numeric | NULL | - | - |
| remarks | text | NULL | - | - |
| created_at | timestamptz | NOT NULL | now() | - |

**Unique Constraint:** `UNIQUE(student_id, category_id, subject)` - required for UPSERT

**Note:** `subject` and `total` columns are legacy/redundant but kept synchronized with category for Google Sheets sync compatibility.

---

### 3.6 mark_queries

**Purpose:** Student queries/appeals about specific marks

| Column | Type | Nullable | Default | Constraints |
|--------|------|----------|---------|-------------|
| id | uuid | NOT NULL | gen_random_uuid() | PRIMARY KEY |
| student_id | uuid | NOT NULL | - | REFERENCES students(id) ON DELETE CASCADE |
| ta_id | uuid | NOT NULL | - | REFERENCES ta_profiles(id) ON DELETE CASCADE |
| category_id | uuid | NOT NULL | - | REFERENCES mark_categories(id) ON DELETE CASCADE |
| message | text | NOT NULL | - | - |
| photo_urls | text[] | NULL | ARRAY[]::text[] | - |
| resolved | boolean | NOT NULL | false | - |
| reply | text | NULL | - | - |
| replied_at | timestamptz | NULL | - | - |
| created_at | timestamptz | NOT NULL | now() | - |

**MISSING from old schema** - this table must be created.

---

## 4. Obsolete Tables

### 4.1 teachers

**Status:** ❌ OBSOLETE - NOT USED

**Evidence:**
- No `.from('teachers')` references found in any code
- No foreign key references to this table
- Only appears in old schema.sql

**Recommendation:** DO NOT include in production migration.

---

### 4.2 pending_tas

**Status:** ❌ OBSOLETE - NOT USED

**Evidence:**
- No `.from('pending_tas')` references found in any code
- Current signup flow (create-ta-profile) creates TAs immediately without approval
- Only appears in old schema.sql

**Historical Context:** Old system required teacher approval for TAs. Current system allows immediate TA self-registration.

**Recommendation:** DO NOT include in production migration.

---

## 5. Required PostgreSQL Functions

### 5.1 generate_class_token()

**Usage:** Called 3+ times in dashboard.html, 1 time in create-ta-profile

**Purpose:** Generate unique random token for class links

**Implementation:**
```sql
create or replace function public.generate_class_token()
returns text language sql stable as $$
  select encode(gen_random_bytes(16), 'hex');
$$;
```

**Status:** ✅ REQUIRED

---

### 5.2 generate_approval_token()

**Usage:** ❌ NOT FOUND in current codebase

**Historical:** Used by obsolete pending_tas approval flow

**Status:** ❌ OBSOLETE - remove from production schema

---

## 6. Storage Buckets Required

| Bucket Name | Purpose | Access Pattern |
|-------------|---------|----------------|
| `avatars` | TA profile pictures | Upload by authenticated TA, public read |
| `mark-query-photos` | Student query attachments | Upload by student (via anon token), read by TA |

**Note:** These are NOT created in SQL migrations - must be configured in Supabase dashboard or via CLI.

---

## 7. Schema Discrepancies Summary

| Issue | Old Schema | Actual Requirement | Impact |
|-------|------------|-------------------|--------|
| **classes table** | Does not exist | Required with 9 columns | ❌ CRITICAL - multi-class feature broken |
| **students.class_id** | Missing | Required (foreign key) | ❌ CRITICAL - student-class link broken |
| **mark_categories.class_id** | Missing | Required (foreign key) | ❌ CRITICAL - categories not scoped to class |
| **mark_queries table** | Does not exist | Required with 10 columns | ❌ CRITICAL - query feature broken |
| **classes.teacher_view_token** | N/A | Required (unique) | ❌ CRITICAL - teacher dashboard broken |
| **ta_profiles columns** | Has obsolete fields | Needs avatar_url, remove course/sir/token | ⚠️ MAJOR - schema mismatch |
| **students unique constraint** | (ta_id, roll_no) | (class_id, roll_no) | ⚠️ MAJOR - wrong constraint |
| **ta_profiles.avatar_url** | Missing | Required (nullable text) | ⚠️ MAJOR - avatar feature broken |
| **teachers table** | Exists | Not used | ℹ️ CLEANUP - remove |
| **pending_tas table** | Exists | Not used | ℹ️ CLEANUP - remove |
| **generate_approval_token()** | Exists | Not used | ℹ️ CLEANUP - remove |

---

## 8. Migration Priorities

### Priority 1 - CRITICAL (Schema Correctness)
1. Create `classes` table with all 9 columns
2. Add `class_id` to `students` table
3. Add `class_id` to `mark_categories` table
4. Create `mark_queries` table
5. Add `avatar_url` to `ta_profiles`
6. Fix unique constraint on students: (ta_id, roll_no) → (class_id, roll_no)

### Priority 2 - MAJOR (Feature Completeness)
7. Remove obsolete columns from ta_profiles: `sir_name`, `course`, `class_link_token`, `google_sheet_url`
8. Add `teacher_view_token` to classes table
9. Add `marks_visible` to classes table

### Priority 3 - CLEANUP (Obsolete Removal)
10. Remove `teachers` table
11. Remove `pending_tas` table
12. Remove `generate_approval_token()` function

---

## 9. Data Migration Considerations

**IMPORTANT:** The new Supabase production database is EMPTY. This is a **fresh deployment**, not a migration from existing data.

Therefore:
- ✅ No data transformation required
- ✅ No backward compatibility needed
- ✅ Clean slate - implement correct schema immediately

---

## 10. Validation Checklist

Before deploying migration:

- [ ] Every table referenced in code exists in migration
- [ ] Every column selected/updated/inserted in code exists in schema
- [ ] All foreign key relationships match code expectations
- [ ] All unique constraints match UPSERT/duplicate check logic
- [ ] All RPC functions used in code are defined
- [ ] Obsolete tables removed from migration
- [ ] Storage buckets documented (manual setup required)

---

## Conclusion

The existing `schema.sql` is **severely outdated** and represents an earlier single-class version of the application. The current application has evolved to support:

1. **Multi-class support** - TAs can manage multiple classes
2. **Teacher dashboard** - Read-only view for course instructors
3. **Mark queries** - Student appeal system with photo uploads
4. **Avatar support** - TA profile pictures

The production migration must reflect the **current application architecture**, not the historical schema.

---

**Next Steps:**
1. Review SECURITY_DESIGN.md for RLS policy requirements
2. Create `supabase/migrations/0001_initial_schema.sql` with corrected schema
3. Create `DATABASE_MIGRATION_NOTES.md` with deployment guide
4. Validate migration against all code references
5. Deploy to empty production database

---

*End of Audit Report*

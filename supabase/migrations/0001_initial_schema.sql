-- ============================================================
-- AURELIS STUDENT PERFORMANCE PLATFORM
-- Initial Database Schema Migration
-- ============================================================
-- Migration: 0001_initial_schema.sql
-- Created: 2026-08-24
-- Description: Complete corrected schema based on production code audit
-- 
-- This migration creates the initial database structure for a fresh
-- Supabase production deployment. Schema verified against:
-- - All 7 Edge Functions
-- - dashboard.html operations
-- - join.html operations
-- 
-- IMPORTANT: This is for a NEW EMPTY database. Do not run on existing data.
-- ============================================================

-- Enable required extensions
-- pgcrypto provides: gen_random_bytes() (used in generate_class_token)
--                    gen_random_uuid()  (used as DEFAULT on all id columns)
-- schema => extensions keeps the extension out of public and is the
-- Supabase-recommended form; functions remain callable from all schemas.
create extension if not exists pgcrypto schema extensions;

-- ============================================================
-- CORE TABLES
-- ============================================================

-- ------------------------------------------------------------
-- TABLE: ta_profiles
-- Purpose: TA (Teaching Assistant) identity and profile information
-- Linked to: auth.users via id (1-to-1)
-- ------------------------------------------------------------
create table public.ta_profiles (
  id uuid primary key,  -- References auth.users(id)
  ta_name text not null,
  email text not null unique,
  avatar_url text,
  created_at timestamptz not null default now()
);

comment on table public.ta_profiles is 'TA profiles linked to Supabase Auth users';
comment on column public.ta_profiles.id is 'References auth.users.id - set during signup';
comment on column public.ta_profiles.avatar_url is 'Public URL to avatar image in storage bucket';

-- ------------------------------------------------------------
-- TABLE: classes
-- Purpose: Class/course instances (TAs can manage multiple classes)
-- New in multi-class architecture - replaces old single-class design
-- ------------------------------------------------------------
create table public.classes (
  id uuid primary key default gen_random_uuid(),
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  name text not null,
  sir_name text,
  class_link_token text not null unique,
  teacher_view_token text unique,
  marks_visible boolean not null default false,
  google_sheet_url text,
  created_at timestamptz not null default now()
);

comment on table public.classes is 'Class instances - TAs can create and manage multiple classes';
comment on column public.classes.name is 'Class/course name (e.g., "CS101 Fall 2026")';
comment on column public.classes.sir_name is 'Instructor/professor name for this class';
comment on column public.classes.class_link_token is 'Token for student join link - never expires';
comment on column public.classes.teacher_view_token is 'Token for teacher read-only dashboard - never expires';
comment on column public.classes.marks_visible is 'Whether students can see their marks yet';
comment on column public.classes.google_sheet_url is 'Optional Google Sheets sync URL';

create index idx_classes_ta_id on public.classes(ta_id);
create index idx_classes_class_link_token on public.classes(class_link_token);
create index idx_classes_teacher_view_token on public.classes(teacher_view_token);

-- ------------------------------------------------------------
-- TABLE: students
-- Purpose: Student registrations per class
-- Key Change: Uses class_id instead of ta_id for uniqueness
-- ------------------------------------------------------------
create table public.students (
  id uuid primary key default gen_random_uuid(),
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  roll_no text not null,
  email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  
  -- One roll number per class (students can't register twice in same class)
  unique(class_id, roll_no)
);

comment on table public.students is 'Student registrations - scoped per class';
comment on column public.students.ta_id is 'Denormalized for query performance - should match classes.ta_id';
comment on column public.students.class_id is 'Which class this student belongs to';
comment on column public.students.status is 'Registration status: pending (awaiting TA approval), approved (active), rejected (denied)';

create index idx_students_ta_id on public.students(ta_id);
create index idx_students_class_id on public.students(class_id);
create index idx_students_status on public.students(status);
create index idx_students_class_roll on public.students(class_id, roll_no);

-- ------------------------------------------------------------
-- TABLE: mark_categories
-- Purpose: Assessment categories (quizzes, assignments, exams) per class
-- Key Change: Added class_id for multi-class support
-- ------------------------------------------------------------
create table public.mark_categories (
  id uuid primary key default gen_random_uuid(),
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  total numeric not null default 20,
  created_at timestamptz not null default now()
);

comment on table public.mark_categories is 'Assessment categories (Quiz 1, Assignment 2, Midterm, etc.) per class';
comment on column public.mark_categories.ta_id is 'Denormalized for query performance - should match classes.ta_id';
comment on column public.mark_categories.class_id is 'Which class this category belongs to';
comment on column public.mark_categories.total is 'Maximum points for this assessment';

create index idx_mark_categories_ta_id on public.mark_categories(ta_id);
create index idx_mark_categories_class_id on public.mark_categories(class_id);

-- ------------------------------------------------------------
-- TABLE: marks
-- Purpose: Individual student marks for each assessment category
-- ------------------------------------------------------------
create table public.marks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  category_id uuid not null references public.mark_categories(id) on delete cascade,
  subject text,  -- Legacy column kept in sync with category.name for Google Sheets compatibility
  marks numeric,
  total numeric,  -- Legacy column kept in sync with category.total for Google Sheets compatibility
  remarks text,
  created_at timestamptz not null default now(),
  
  -- Unique constraint required for UPSERT operations in dashboard
  unique(student_id, category_id, subject)
);

comment on table public.marks is 'Individual marks entries - one row per student per assessment';
comment on column public.marks.subject is 'Legacy: mirrors category name, kept for backward compatibility';
comment on column public.marks.total is 'Legacy: mirrors category total, kept for backward compatibility';
comment on column public.marks.remarks is 'Optional instructor comments/feedback for this mark';

create index idx_marks_student_id on public.marks(student_id);
create index idx_marks_category_id on public.marks(category_id);
create index idx_marks_ta_id on public.marks(ta_id);

-- ------------------------------------------------------------
-- TABLE: mark_queries
-- Purpose: Student queries/appeals about specific marks
-- New table - not present in old schema
-- ------------------------------------------------------------
create table public.mark_queries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  ta_id uuid not null references public.ta_profiles(id) on delete cascade,
  category_id uuid not null references public.mark_categories(id) on delete cascade,
  message text not null,
  photo_urls text[] default array[]::text[],
  resolved boolean not null default false,
  reply text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

comment on table public.mark_queries is 'Student queries/appeals about marks - with photo attachment support';
comment on column public.mark_queries.message is 'Student question or concern about their mark';
comment on column public.mark_queries.photo_urls is 'Array of public URLs to uploaded photos in storage bucket';
comment on column public.mark_queries.resolved is 'Whether TA has marked this query as resolved';
comment on column public.mark_queries.reply is 'TA response to student query';
comment on column public.mark_queries.replied_at is 'Timestamp when TA replied';

create index idx_mark_queries_student_id on public.mark_queries(student_id);
create index idx_mark_queries_ta_id on public.mark_queries(ta_id);
create index idx_mark_queries_category_id on public.mark_queries(category_id);
create index idx_mark_queries_resolved on public.mark_queries(resolved);
create index idx_mark_queries_created_at on public.mark_queries(created_at desc);

-- ============================================================
-- POSTGRESQL FUNCTIONS
-- ============================================================

-- ------------------------------------------------------------
-- FUNCTION: generate_class_token()
-- Purpose: Generate random token for class links and teacher dashboard
-- Usage: Called by dashboard.html and create-ta-profile Edge Function
-- ------------------------------------------------------------
create or replace function public.generate_class_token()
returns text 
language sql 
stable 
as $$
  select encode(extensions.gen_random_bytes(16), 'hex');
$$;

comment on function public.generate_class_token() is 'Generates secure random token for class_link_token and teacher_view_token';

-- ============================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================
-- These policies implement defense-in-depth security.
-- Edge Functions bypass RLS using service role credentials.
-- Client operations (dashboard, join) are protected by these policies.
-- ============================================================

-- ------------------------------------------------------------
-- RLS: ta_profiles
-- ------------------------------------------------------------
alter table public.ta_profiles enable row level security;

-- TAs can read their own full profile
create policy "TAs can view own profile"
  on public.ta_profiles
  for select
  to authenticated
  using (auth.uid() = id);

-- TAs can update their own profile (name, avatar)
create policy "TAs can update own profile"
  on public.ta_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Note: INSERT handled by create-ta-profile Edge Function (service role)
-- Note: DELETE not allowed (preserve referential integrity)

-- ------------------------------------------------------------
-- RLS: classes
-- ------------------------------------------------------------
alter table public.classes enable row level security;

-- TAs can view their own classes
create policy "TAs can view own classes"
  on public.classes
  for select
  to authenticated
  using (ta_id = auth.uid());

-- TAs can create classes for themselves
create policy "TAs can create own classes"
  on public.classes
  for insert
  to authenticated
  with check (ta_id = auth.uid());

-- TAs can update their own classes
create policy "TAs can update own classes"
  on public.classes
  for update
  to authenticated
  using (ta_id = auth.uid())
  with check (ta_id = auth.uid());

-- TAs can delete their own classes (cascade deletes students/marks)
create policy "TAs can delete own classes"
  on public.classes
  for delete
  to authenticated
  using (ta_id = auth.uid());

-- ------------------------------------------------------------
-- RLS: students
-- ------------------------------------------------------------
alter table public.students enable row level security;

-- TAs can view students in their own classes
create policy "TAs can view own students"
  on public.students
  for select
  to authenticated
  using (ta_id = auth.uid());

-- TAs can update students in their own classes (approve/reject)
create policy "TAs can update own students"
  on public.students
  for update
  to authenticated
  using (ta_id = auth.uid())
  with check (ta_id = auth.uid());

-- TAs can delete students in their own classes
create policy "TAs can delete own students"
  on public.students
  for delete
  to authenticated
  using (ta_id = auth.uid());

-- TEMPORARY: Allow anonymous student registration from join.html
-- Security: Validates that class exists and ta_id matches class owner
-- TODO Phase 9: Replace with register-student Edge Function
create policy "Allow student registration via join link"
  on public.students
  for insert
  to anon
  with check (
    exists (
      select 1 from public.classes 
      where classes.id = students.class_id 
        and classes.ta_id = students.ta_id
    )
  );

-- ------------------------------------------------------------
-- RLS: mark_categories
-- ------------------------------------------------------------
alter table public.mark_categories enable row level security;

-- TAs can view their own mark categories
create policy "TAs can view own mark categories"
  on public.mark_categories
  for select
  to authenticated
  using (ta_id = auth.uid());

-- TAs can create categories for their own classes
create policy "TAs can create mark categories"
  on public.mark_categories
  for insert
  to authenticated
  with check (
    ta_id = auth.uid()
    and exists (
      select 1 from public.classes 
      where classes.id = mark_categories.class_id 
        and classes.ta_id = auth.uid()
    )
  );

-- TAs can update their own categories
create policy "TAs can update own mark categories"
  on public.mark_categories
  for update
  to authenticated
  using (ta_id = auth.uid())
  with check (ta_id = auth.uid());

-- TAs can delete their own categories
create policy "TAs can delete own mark categories"
  on public.mark_categories
  for delete
  to authenticated
  using (ta_id = auth.uid());

-- ------------------------------------------------------------
-- RLS: marks
-- ------------------------------------------------------------
alter table public.marks enable row level security;

-- TAs can view marks for their students
create policy "TAs can view own marks"
  on public.marks
  for select
  to authenticated
  using (ta_id = auth.uid());

-- TAs can insert/upsert marks for their students
create policy "TAs can insert marks"
  on public.marks
  for insert
  to authenticated
  with check (
    ta_id = auth.uid()
    and exists (
      select 1 from public.students 
      where students.id = marks.student_id 
        and students.ta_id = auth.uid()
    )
  );

-- TAs can update marks for their students
create policy "TAs can update marks"
  on public.marks
  for update
  to authenticated
  using (ta_id = auth.uid())
  with check (ta_id = auth.uid());

-- TAs can delete marks for their students
create policy "TAs can delete marks"
  on public.marks
  for delete
  to authenticated
  using (ta_id = auth.uid());

-- ------------------------------------------------------------
-- RLS: mark_queries
-- ------------------------------------------------------------
alter table public.mark_queries enable row level security;

-- TAs can view queries for their students
create policy "TAs can view mark queries"
  on public.mark_queries
  for select
  to authenticated
  using (ta_id = auth.uid());

-- TAs can update queries (reply, resolve status)
create policy "TAs can update mark queries"
  on public.mark_queries
  for update
  to authenticated
  using (ta_id = auth.uid())
  with check (ta_id = auth.uid());

-- TEMPORARY: Allow anonymous students to submit queries
-- Security: Validates student exists in correct class for the category
-- TODO Phase 9: Replace with submit-mark-query Edge Function
create policy "Students can submit queries"
  on public.mark_queries
  for insert
  to anon
  with check (
    exists (
      select 1 
      from public.students
      join public.mark_categories on mark_categories.id = mark_queries.category_id
      where students.id = mark_queries.student_id
        and students.ta_id = mark_queries.ta_id
        and mark_categories.ta_id = mark_queries.ta_id
        and students.class_id = mark_categories.class_id
    )
  );

-- ============================================================
-- GRANT PERMISSIONS
-- ============================================================
-- Grant necessary permissions to authenticated and anon roles
-- Service role already has full access
-- ============================================================

-- Grant usage on schema
grant usage on schema public to anon, authenticated;

-- Grant access to tables
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert on public.students to anon;
grant select, insert on public.mark_queries to anon;

-- Grant access to sequences (for default values)
grant usage on all sequences in schema public to authenticated;

-- Grant execute on functions
grant execute on function public.generate_class_token() to authenticated;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Next steps:
-- 1. Review SECURITY_DESIGN.md for security considerations
-- 2. Configure storage buckets manually:
--    - avatars (public read, auth write)
--    - mark-query-photos (public read, anon write)
-- 3. Deploy Edge Functions
-- 4. Test with sample data
-- 5. Review DATABASE_MIGRATION_NOTES.md for deployment checklist
-- ============================================================

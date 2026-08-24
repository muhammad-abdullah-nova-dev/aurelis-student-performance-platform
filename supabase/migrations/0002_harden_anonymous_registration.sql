-- ============================================================
-- AURELIS STUDENT PERFORMANCE PLATFORM
-- Security Hardening Migration
-- ============================================================
-- Migration: 0002_harden_anonymous_registration.sql
-- Created: 2026-08-24
-- Description: Harden anonymous student registration to prevent
--              privilege escalation via status manipulation
-- 
-- SECURITY ISSUE:
-- The original "Allow student registration via join link" policy
-- validated class ownership but did NOT enforce status = 'pending'.
-- An anonymous client could submit status = 'approved' or 'rejected'
-- and bypass TA approval entirely.
-- 
-- FIX:
-- Add explicit status check to WITH CHECK constraint, ensuring
-- anonymous registrations ALWAYS create pending students only.
-- ============================================================

-- Drop existing policy
drop policy if exists "Allow student registration via join link" on public.students;

-- Recreate with hardened status validation
create policy "Allow student registration via join link"
  on public.students
  for insert
  to anon
  with check (
    -- Validate class ownership (existing check)
    exists (
      select 1 from public.classes 
      where classes.id = students.class_id 
        and classes.ta_id = students.ta_id
    )
    -- NEW: Enforce pending status only (prevent privilege escalation)
    and students.status = 'pending'
  );

comment on policy "Allow student registration via join link" on public.students is 
  'Allows anonymous student registration via join.html. Validates: (1) class_id/ta_id ownership, (2) status must be pending. Updated 2026-08-24 to prevent status manipulation.';

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
-- Security improvement: Anonymous clients can no longer:
-- - Set status = 'approved' (bypass TA approval)
-- - Set status = 'rejected' (poison student list)
-- 
-- Frontend behavior unchanged: join.html already submits
-- status: 'pending' by default.
-- 
-- TA policies unchanged: TAs retain full control over student
-- approval/rejection via authenticated UPDATE policies.
-- ============================================================

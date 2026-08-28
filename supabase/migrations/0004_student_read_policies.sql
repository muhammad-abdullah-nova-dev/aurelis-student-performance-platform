-- ============================================================
-- AURELIS STUDENT PERFORMANCE PLATFORM
-- Student Read Access Migration
-- ============================================================
-- Migration: 0004_student_read_policies.sql
-- Created: 2026-08-28
-- Description: Add RLS policies so authenticated students can read
--              their own class info and mark category names.
--
-- ROOT CAUSE OF BUGS:
--   - classes RLS only allowed ta_id = auth.uid() → students got null
--     for sir_name, name, marks_visible
--   - mark_categories RLS only allowed ta_id = auth.uid() → category
--     name lookup returned empty → "Untitled" in dashboard
--   - mark_queries had no student SELECT policy → students couldn't
--     read their own submitted queries
-- ============================================================

-- Allow authenticated students to read the class they belong to
CREATE POLICY "Students can view own class"
  ON public.classes
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT class_id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow authenticated students to read mark categories for their class
CREATE POLICY "Students can view own class categories"
  ON public.mark_categories
  FOR SELECT
  TO authenticated
  USING (
    class_id IN (
      SELECT class_id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow authenticated students to read their own submitted queries
CREATE POLICY "Students can view own queries"
  ON public.mark_queries
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- Allow authenticated students to INSERT queries (replaces anon policy for auth users)
CREATE POLICY "Students can submit queries (auth)"
  ON public.mark_queries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM public.students WHERE auth_user_id = auth.uid()
    )
  );

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

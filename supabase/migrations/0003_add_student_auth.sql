-- Add student authentication support
-- Links students table to auth.users for password-based login

-- Add auth_user_id column to students table
ALTER TABLE public.students
ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster lookups
CREATE INDEX idx_students_auth_user_id ON public.students(auth_user_id);

-- Update RLS policies to allow authenticated students to view their own data
CREATE POLICY "Students can view own data"
ON public.students
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Allow students to update their own profile
CREATE POLICY "Students can update own profile"
ON public.students
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Update marks policies for authenticated students
CREATE POLICY "Students can view own marks"
ON public.marks
FOR SELECT
TO authenticated
USING (
  student_id IN (
    SELECT id FROM public.students WHERE auth_user_id = auth.uid()
  )
);

-- Comment
COMMENT ON COLUMN public.students.auth_user_id IS 'Links student to auth.users for password authentication';

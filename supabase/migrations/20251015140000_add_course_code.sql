-- Add course_code column to courses with default '0' and backfill existing rows
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS course_code TEXT NOT NULL DEFAULT '0';

-- Ensure no NULLs remain
UPDATE public.courses SET course_code = '0' WHERE course_code IS NULL;

-- Align database schema with ERD additions

-- Profiles: add phone, date_of_birth, and experience (for instructors)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS experience INTEGER CHECK (experience >= 0);

-- Assessments: add level and mode
ALTER TABLE public.assessments
ADD COLUMN IF NOT EXISTS level public.skill_level DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS mode TEXT;

-- Backfill sensible defaults where NULL might appear after adding columns
UPDATE public.assessments SET level = COALESCE(level, 'beginner'::public.skill_level);



-- Update handle_new_user trigger to store extra profile fields from auth metadata

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    date_of_birth,
    experience
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'),
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'phone', '')), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'date_of_birth', NULL), NULL)::date,
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data->>'experience', '') ~ '^\\d+$' THEN (NEW.raw_user_meta_data->>'experience')::integer
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;



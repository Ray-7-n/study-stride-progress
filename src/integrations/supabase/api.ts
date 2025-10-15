import { supabase } from "@/integrations/supabase/client";

export type CreateCourseInput = {
  title: string;
  description?: string;
  instructorId: string;
  skillCategory: string;
  durationHours?: number;
  isPublished?: boolean;
};

export async function createCourse(input: CreateCourseInput) {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      title: input.title,
      description: input.description ?? null,
      instructor_id: input.instructorId,
      skill_category: input.skillCategory,
      duration_hours: input.durationHours ?? null,
      is_published: input.isPublished ?? false,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
}

export async function listInstructorCourses(instructorId: string) {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}



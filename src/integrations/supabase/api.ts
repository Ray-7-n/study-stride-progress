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

export async function listPublishedCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("id,title,description,skill_category,is_published,created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function enrollInCourse(studentId: string, courseId: string) {
  const { data, error } = await supabase
    .from("enrollments")
    .insert({ student_id: studentId, course_id: courseId })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateCoursePublish(courseId: string, isPublished: boolean) {
  const { data, error } = await supabase
    .from("courses")
    .update({ is_published: isPublished })
    .eq("id", courseId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export type UpdateCourseInput = {
  id: string;
  title?: string;
  description?: string | null;
  skillCategory?: string;
  durationHours?: number | null;
};

export async function updateCourseDetails(input: UpdateCourseInput) {
  const update: any = {};
  if (typeof input.title !== "undefined") update.title = input.title;
  if (typeof input.description !== "undefined") update.description = input.description;
  if (typeof input.skillCategory !== "undefined") update.skill_category = input.skillCategory;
  if (typeof input.durationHours !== "undefined") update.duration_hours = input.durationHours;

  const { data, error } = await supabase
    .from("courses")
    .update(update)
    .eq("id", input.id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}



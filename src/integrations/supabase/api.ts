import { supabase } from "@/integrations/supabase/client";

export type CreateCourseInput = {
  id?: string; // optional custom UUID
  title: string;
  description?: string;
  instructorId: string;
  skillCategory: string;
  courseCode?: string; // custom human-readable code like ABC123
  durationHours?: number;
  isPublished?: boolean;
};

export async function createCourse(input: CreateCourseInput) {
  const insertBody: any = {
    title: input.title,
    description: input.description ?? null,
    instructor_id: input.instructorId,
    skill_category: input.skillCategory,
    course_code: input.courseCode ?? undefined,
    duration_hours: input.durationHours ?? null,
    is_published: input.isPublished ?? false,
  };
  if (input.id) insertBody.id = input.id;

  const { data, error } = await supabase
    .from("courses")
    .insert(insertBody)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id,email,full_name,role,phone,date_of_birth,experience,created_at,updated_at")
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
  courseCode?: string | null;
  durationHours?: number | null;
  // assessment-related fields handled in dedicated endpoints later
};

export async function updateCourseDetails(input: UpdateCourseInput) {
  const update: any = {};
  if (typeof input.title !== "undefined") update.title = input.title;
  if (typeof input.description !== "undefined") update.description = input.description;
  if (typeof input.skillCategory !== "undefined") update.skill_category = input.skillCategory;
  if (typeof input.courseCode !== "undefined") update.course_code = input.courseCode;
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

// Profile update (phone, date_of_birth, experience)
export type UpdateProfileInput = {
  id: string;
  phone?: string | null;
  dateOfBirth?: string | null; // ISO date (YYYY-MM-DD)
  experience?: number | null; // years
};

export async function updateProfile(input: UpdateProfileInput) {
  const update: any = {};
  if (typeof input.phone !== "undefined") update.phone = input.phone;
  if (typeof input.dateOfBirth !== "undefined") update.date_of_birth = input.dateOfBirth;
  if (typeof input.experience !== "undefined") update.experience = input.experience;

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", input.id)
    .select("id,email,full_name,role,phone,date_of_birth,experience,created_at,updated_at")
    .single();
  if (error) throw error;
  return data;
}

// Assessments CRUD
export type CreateAssessmentInput = {
  courseId: string;
  title: string;
  description?: string | null;
  totalPoints?: number; // default 100
  passingScore?: number; // default 70
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  mode?: string | null; // e.g., quiz, assignment, project
};

export async function listAssessmentsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from("assessments")
    .select("id,course_id,title,description,total_points,passing_score,level,mode,created_at")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createAssessment(input: CreateAssessmentInput) {
  const insertBody: any = {
    course_id: input.courseId,
    title: input.title,
    description: input.description ?? null,
    total_points: typeof input.totalPoints === "number" ? input.totalPoints : undefined,
    passing_score: typeof input.passingScore === "number" ? input.passingScore : undefined,
    level: input.level ?? undefined,
    mode: typeof input.mode !== "undefined" ? input.mode : undefined,
  };

  const { data, error } = await supabase
    .from("assessments")
    .insert(insertBody)
    .select("id,course_id,title,description,total_points,passing_score,level,mode,created_at")
    .single();
  if (error) throw error;
  return data;
}

export type UpdateAssessmentInput = {
  id: string;
  title?: string;
  description?: string | null;
  totalPoints?: number | null;
  passingScore?: number | null;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  mode?: string | null;
};

export async function updateAssessment(input: UpdateAssessmentInput) {
  const update: any = {};
  if (typeof input.title !== "undefined") update.title = input.title;
  if (typeof input.description !== "undefined") update.description = input.description;
  if (typeof input.totalPoints !== "undefined") update.total_points = input.totalPoints;
  if (typeof input.passingScore !== "undefined") update.passing_score = input.passingScore;
  if (typeof input.level !== "undefined") update.level = input.level;
  if (typeof input.mode !== "undefined") update.mode = input.mode;

  const { data, error } = await supabase
    .from("assessments")
    .update(update)
    .eq("id", input.id)
    .select("id,course_id,title,description,total_points,passing_score,level,mode,created_at")
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAssessment(id: string) {
  const { error } = await supabase
    .from("assessments")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

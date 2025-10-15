import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, BarChart3, LogOut, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCourse, updateCoursePublish, updateCourseDetails, listAssessmentsByCourse, createAssessment, updateAssessment, deleteAssessment, updateProfile } from "@/integrations/supabase/api";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editDuration, setEditDuration] = useState<string>("");
  const [editCode, setEditCode] = useState<string>("");
  const [saving, setSaving] = useState(false);

  // Assessments state
  const [assessmentsByCourse, setAssessmentsByCourse] = useState<Record<string, any[]>>({});
  const [assessmentModalOpen, setAssessmentModalOpen] = useState(false);
  const [activeCourseForAssessments, setActiveCourseForAssessments] = useState<any | null>(null);
  const [newAssessmentTitle, setNewAssessmentTitle] = useState("");
  const [newAssessmentDesc, setNewAssessmentDesc] = useState("");
  const [newAssessmentLevel, setNewAssessmentLevel] = useState<"beginner" | "intermediate" | "advanced" | "expert">("beginner");
  const [newAssessmentMode, setNewAssessmentMode] = useState("");
  const [newAssessmentPoints, setNewAssessmentPoints] = useState<string>("100");
  const [newAssessmentPassing, setNewAssessmentPassing] = useState<string>("70");
  const [savingAssessment, setSavingAssessment] = useState(false);

  // Profile edit state
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editExperience, setEditExperience] = useState<string>("");

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createId, setCreateId] = useState("");
  const [createCategory, setCreateCategory] = useState("general");
  const [createDescription, setCreateDescription] = useState("");
  const [createCode, setCreateCode] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCourses();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name,email,role,phone,date_of_birth,experience")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data?.role !== "instructor") {
      navigate("/dashboard");
      return;
    }

    setProfile(data);
    // seed edit fields
    setEditPhone(data?.phone || "");
    setEditDob(data?.date_of_birth || "");
    setEditExperience(typeof data?.experience === "number" ? String(data.experience) : "");
  };

  const loadCourses = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading courses:", error);
      return;
    }

    setCourses(data || []);
  };

  const openAssessments = async (course: any) => {
    setActiveCourseForAssessments(course);
    try {
      const list = await listAssessmentsByCourse(course.id);
      setAssessmentsByCourse((prev) => ({ ...prev, [course.id]: list }));
    } catch (e) {
      setAssessmentsByCourse((prev) => ({ ...prev, [course.id]: [] }));
    }
    setAssessmentModalOpen(true);
  };

  const handleOpenCreate = () => {
    setCreateTitle("");
    setCreateId("");
    setCreateCategory("general");
    setCreateDescription("");
    setCreateCode("");
    setCreateOpen(true);
  };

  const handleCreateCourse = async () => {
    if (!user) return;
    if (!createTitle.trim()) {
      toast.error("Title is required");
      return;
    }
    setCreating(true);
    try {
      const newCourse = await createCourse({
        id: createId.trim() || undefined,
        title: createTitle.trim(),
        description: createDescription.trim() || undefined,
        instructorId: user.id,
        skillCategory: createCategory.trim() || "general",
        courseCode: createCode.trim() || undefined,
        isPublished: false,
      });
      toast.success("Course created");
      setCourses((prev) => [newCourse, ...prev]);
      setCreateOpen(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  const togglePublish = async (courseId: string, current: boolean) => {
    try {
      const updated = await updateCoursePublish(courseId, !current);
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
      toast.success(!current ? "Published" : "Unpublished");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update publish state");
    }
  };

  const openEdit = (course: any) => {
    setEditCourse(course);
    setEditTitle(course.title || "");
    setEditDescription(course.description || "");
    setEditCategory(course.skill_category || "");
    setEditDuration(course.duration_hours != null ? String(course.duration_hours) : "");
    setEditCode(course.course_code || "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editCourse) return;
    setSaving(true);
    try {
      const updated = await updateCourseDetails({
        id: editCourse.id,
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        skillCategory: editCategory.trim(),
        courseCode: editCode.trim() || null,
        durationHours: editDuration ? Number(editDuration) : null,
      });
      setCourses((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success("Course updated");
      setEditOpen(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully!");
    navigate("/");
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <nav className="bg-card border-b border-border shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-primary rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">SkillTracker</span>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Instructor Dashboard</h1>
            <p className="text-muted-foreground">Manage your courses and track student progress</p>
            {profile?.phone && (
              <p className="text-xs text-muted-foreground">Phone: {profile.phone}</p>
            )}
            {typeof profile?.experience === "number" && (
              <p className="text-xs text-muted-foreground">Experience: {profile.experience} yrs</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setProfileEditOpen(true)}>Edit Profile</Button>
            <Button className="bg-gradient-primary shadow-elegant" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{courses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {courses.filter((c) => c.is_published).length} published
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Completion</CardTitle>
              <BarChart3 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground mt-1">Student progress</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Manage and update your course content</CardDescription>
          </CardHeader>
          <CardContent>
            {courses.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No courses created yet</p>
                <Button className="bg-gradient-primary shadow-elegant" onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          {course.is_published ? (
                            <span className="text-xs px-2 py-1 bg-success/10 text-success rounded-full">
                              Published
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full">
                              Draft
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{course.skill_category}</p>
                        {course.course_code ? (
                          <p className="text-xs text-muted-foreground mb-2">Code: {course.course_code}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mb-2">Code: 0</p>
                        )}
                        <p className="text-sm">{course.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(course)}>
                          Edit Course
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openAssessments(course)}>
                          Manage Assessments
                        </Button>
                        <Button
                          variant={course.is_published ? "secondary" : "default"}
                          size="sm"
                          onClick={() => togglePublish(course.id, !!course.is_published)}
                        >
                          {course.is_published ? "Unpublish" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-title">Title</Label>
              <Input id="new-title" value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-id">Course ID (optional UUID)</Label>
              <Input id="new-id" value={createId} onChange={(e) => setCreateId(e.target.value)} placeholder="e.g., 9d2c0c12-..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-code">Course Code (e.g., ABC123)</Label>
              <Input id="new-code" value={createCode} onChange={(e) => setCreateCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-category">Category</Label>
              <Input id="new-category" value={createCategory} onChange={(e) => setCreateCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-desc">Description</Label>
              <Input id="new-desc" value={createDescription} onChange={(e) => setCreateDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
            <Button onClick={handleCreateCourse} disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instructor-phone">Phone</Label>
              <Input id="instructor-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instructor-dob">Date of Birth</Label>
                <Input id="instructor-dob" type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor-exp">Experience (years)</Label>
                <Input id="instructor-exp" type="number" min="0" value={editExperience} onChange={(e) => setEditExperience(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProfileEditOpen(false)}>Cancel</Button>
            <Button onClick={async () => {
              if (!user) return;
              try {
                const updated = await updateProfile({
                  id: user.id,
                  phone: editPhone || null,
                  dateOfBirth: editDob || null,
                  experience: editExperience ? Number(editExperience) : null,
                });
                setProfile(updated);
                toast.success("Profile updated");
                setProfileEditOpen(false);
              } catch (e: any) {
                toast.error(e?.message ?? "Failed to update profile");
              }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={assessmentModalOpen} onOpenChange={setAssessmentModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Assessments {activeCourseForAssessments ? `– ${activeCourseForAssessments.title}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {activeCourseForAssessments && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-2">Existing</p>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {(assessmentsByCourse[activeCourseForAssessments.id] || []).map((a) => (
                      <div key={a.id} className="p-2 border rounded flex items-center justify-between">
                        <div className="text-sm">
                          <div className="font-medium">{a.title}</div>
                          <div className="text-xs text-muted-foreground">{a.level}{a.mode ? ` · ${a.mode}` : ""} · {a.passing_score}/{a.total_points}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={async () => {
                            const nextMode = a.mode === "quiz" ? "assignment" : "quiz";
                            const updated = await updateAssessment({ id: a.id, mode: nextMode });
                            setAssessmentsByCourse((prev) => ({
                              ...prev,
                              [activeCourseForAssessments.id]: (prev[activeCourseForAssessments.id] || []).map((x) => x.id === a.id ? updated : x)
                            }));
                          }}>Toggle Mode</Button>
                          <Button variant="destructive" size="sm" onClick={async () => {
                            await deleteAssessment(a.id);
                            setAssessmentsByCourse((prev) => ({
                              ...prev,
                              [activeCourseForAssessments.id]: (prev[activeCourseForAssessments.id] || []).filter((x) => x.id !== a.id)
                            }));
                          }}>Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Create New</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="ass-title">Title</Label>
                      <Input id="ass-title" value={newAssessmentTitle} onChange={(e) => setNewAssessmentTitle(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ass-level">Level</Label>
                      <Input id="ass-level" value={newAssessmentLevel} onChange={(e) => setNewAssessmentLevel(e.target.value as any)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ass-mode">Mode</Label>
                      <Input id="ass-mode" value={newAssessmentMode} onChange={(e) => setNewAssessmentMode(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ass-points">Total Points</Label>
                      <Input id="ass-points" type="number" min="1" value={newAssessmentPoints} onChange={(e) => setNewAssessmentPoints(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ass-pass">Passing Score</Label>
                      <Input id="ass-pass" type="number" min="0" value={newAssessmentPassing} onChange={(e) => setNewAssessmentPassing(e.target.value)} />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <Label htmlFor="ass-desc">Description</Label>
                      <Input id="ass-desc" value={newAssessmentDesc} onChange={(e) => setNewAssessmentDesc(e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssessmentModalOpen(false)} disabled={savingAssessment}>Close</Button>
            <Button onClick={async () => {
              if (!activeCourseForAssessments) return;
              setSavingAssessment(true);
              try {
                const created = await createAssessment({
                  courseId: activeCourseForAssessments.id,
                  title: newAssessmentTitle.trim(),
                  description: newAssessmentDesc.trim() || null,
                  totalPoints: newAssessmentPoints ? Number(newAssessmentPoints) : undefined,
                  passingScore: newAssessmentPassing ? Number(newAssessmentPassing) : undefined,
                  level: newAssessmentLevel,
                  mode: newAssessmentMode.trim() || null,
                });
                setAssessmentsByCourse((prev) => ({
                  ...prev,
                  [activeCourseForAssessments.id]: [created, ...(prev[activeCourseForAssessments.id] || [])]
                }));
                setNewAssessmentTitle("");
                setNewAssessmentDesc("");
                setNewAssessmentMode("");
                setNewAssessmentPoints("100");
                setNewAssessmentPassing("70");
              } finally {
                setSavingAssessment(false);
              }
            }} disabled={savingAssessment || !newAssessmentTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-title">Title</Label>
              <Input id="course-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-desc">Description</Label>
              <Input id="course-desc" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-category">Category</Label>
              <Input id="course-category" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-code">Course Code</Label>
              <Input id="course-code" value={editCode} onChange={(e) => setEditCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course-duration">Duration (hours)</Label>
              <Input id="course-duration" type="number" min="0" value={editDuration} onChange={(e) => setEditDuration(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard;

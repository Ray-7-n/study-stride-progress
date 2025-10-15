import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, BarChart3, LogOut, GraduationCap, Plus } from "lucide-react";
import { toast } from "sonner";
import { createCourse, updateCoursePublish, updateCourseDetails } from "@/integrations/supabase/api";
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
  const [saving, setSaving] = useState(false);

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
      .select("*")
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

  const handleCreateCourse = async () => {
    if (!user) return;
    try {
      const newCourse = await createCourse({
        title: "Untitled Course",
        description: "",
        instructorId: user.id,
        skillCategory: "general",
        isPublished: false,
      });
      toast.success("Course created");
      setCourses((prev) => [newCourse, ...prev]);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create course");
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
          </div>
          <Button className="bg-gradient-primary shadow-elegant" onClick={handleCreateCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
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
                <Button className="bg-gradient-primary shadow-elegant" onClick={handleCreateCourse}>
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
                        <p className="text-sm text-muted-foreground mb-2">{course.skill_category}</p>
                        <p className="text-sm">{course.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(course)}>
                          Edit Course
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

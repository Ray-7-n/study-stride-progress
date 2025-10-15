import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, TrendingUp, Award, LogOut, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { listPublishedCourses, enrollInCourse, updateProfile } from "@/integrations/supabase/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editDob, setEditDob] = useState("");

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
      loadEnrollments();
      loadAvailableCourses();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("id,full_name,email,role,phone,date_of_birth")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data?.role !== "student") {
      navigate("/instructor-dashboard");
      return;
    }

    setProfile(data);
    setEditPhone((data as any)?.phone || "");
    setEditDob((data as any)?.date_of_birth || "");
  };

  const loadEnrollments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        courses (
          id,
          title,
          description,
          skill_category
        )
      `)
      .eq("student_id", user.id)
      .order("enrolled_at", { ascending: false });

    if (error) {
      console.error("Error loading enrollments:", error);
      return;
    }

    setEnrollments(data || []);
  };

  const loadAvailableCourses = async () => {
    try {
      const published = await listPublishedCourses();
      setAvailableCourses(published);
    } catch (e) {
      console.error(e);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    try {
      await enrollInCourse(user.id, courseId);
      toast.success("Enrolled successfully");
      await loadEnrollments();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to enroll");
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.full_name}!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
          {(profile as any)?.phone && (
            <p className="text-xs text-muted-foreground">Phone: {(profile as any).phone}</p>
          )}
          {(profile as any)?.date_of_birth && (
            <p className="text-xs text-muted-foreground">DOB: {(profile as any).date_of_birth}</p>
          )}
          <div className="mt-2">
            <Button variant="outline" size="sm" onClick={() => setProfileEditOpen(true)}>Edit Profile</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrollments.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active enrollments</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {enrollments.length > 0
                  ? Math.round(
                      enrollments.reduce((sum, e) => sum + (Number(e.progress_percentage) || 0), 0) /
                        enrollments.length
                    )
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              <Award className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {enrollments.filter((e) => e.completed_at).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Certificates earned</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Track your progress and continue learning</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No courses enrolled yet</p>
                <Button className="bg-gradient-primary shadow-elegant">Browse Courses</Button>
              </div>
            ) : (
              <div className="space-y-4">
                {enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{enrollment.courses?.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.courses?.skill_category}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        {Math.round(Number(enrollment.progress_percentage) || 0)}%
                      </span>
                    </div>
                    <Progress value={Number(enrollment.progress_percentage) || 0} className="mb-2" />
                    <Button variant="outline" size="sm" className="mt-2">
                      Continue Learning
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card mt-8">
          <CardHeader>
            <CardTitle>Browse Courses</CardTitle>
            <CardDescription>Enroll in published courses</CardDescription>
          </CardHeader>
          <CardContent>
            {availableCourses.length === 0 ? (
              <div className="text-sm text-muted-foreground">No courses available yet</div>
            ) : (
              <div className="space-y-4">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.skill_category}</p>
                        {course.description && (
                          <p className="text-sm mt-1">{course.description}</p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleEnroll(course.id)}>
                        Enroll
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <div>
        <Dialog open={profileEditOpen} onOpenChange={setProfileEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student-phone">Phone</Label>
                <Input id="student-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="student-dob">Date of Birth</Label>
                <Input id="student-dob" type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setProfileEditOpen(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!user) return;
                try {
                  const updated = await updateProfile({
                    id: user.id,
                    phone: editPhone || null,
                    dateOfBirth: editDob || null,
                  });
                  setProfile(updated);
                  setProfileEditOpen(false);
                } catch (e: any) {
                  console.error(e);
                }
              }}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentDashboard;

import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp, Award, Users, BarChart3, Target } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              Master New Skills, Track Your Progress
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
              Join SkillTracker to access expert-led courses, monitor your learning journey, and achieve your educational goals with data-driven insights.
            </p>
            <div className="flex gap-4 justify-center animate-fade-in">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-primary shadow-elegant hover:shadow-xl transition-all">
                  Start Learning Today
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">
                  I'm an Instructor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose SkillTracker?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive platform designed to accelerate your learning with powerful tracking and analytics
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="bg-gradient-primary rounded-lg p-3 w-fit mb-3">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Expert-Led Courses</CardTitle>
                <CardDescription>
                  Learn from industry professionals with structured curricula and hands-on projects
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="bg-gradient-accent rounded-lg p-3 w-fit mb-3">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your skill development with detailed analytics and visual progress indicators
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-card hover:shadow-elegant transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="bg-gradient-primary rounded-lg p-3 w-fit mb-3">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Skill Certifications</CardTitle>
                <CardDescription>
                  Earn recognized certificates upon course completion to showcase your achievements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Students</h2>
              <p className="text-muted-foreground mb-6">
                Take control of your learning journey with personalized dashboards, skill assessments, and detailed progress reports.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Personalized Learning Paths</h3>
                    <p className="text-sm text-muted-foreground">
                      Get course recommendations based on your skill level and goals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BarChart3 className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Skill Analytics</h3>
                    <p className="text-sm text-muted-foreground">
                      Visualize your progress across different skills and competencies
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">For Instructors</h2>
              <p className="text-muted-foreground mb-6">
                Create engaging courses, manage student progress, and analyze learning outcomes with powerful instructor tools.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Student Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Track enrollment, monitor progress, and provide targeted feedback
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BookOpen className="h-6 w-6 text-accent mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Course Builder</h3>
                    <p className="text-sm text-muted-foreground">
                      Design comprehensive courses with modules, assessments, and resources
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary via-secondary to-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners and instructors who are already transforming education with SkillTracker
          </p>
          <Link to="/auth">
            <Button size="lg" variant="secondary" className="shadow-xl">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 SkillTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

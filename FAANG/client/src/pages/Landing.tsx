import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  Code2, 
  Target, 
  TrendingUp, 
  Award, 
  Route,
  Puzzle,
  BarChart3,
  Users,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const features = [
  {
    icon: Route,
    title: "Structured Roadmap",
    description: "Follow a comprehensive A2Z DSA roadmap covering all essential topics from basics to advanced concepts."
  },
  {
    icon: Puzzle,
    title: "Pattern-Based Learning",
    description: "Master algorithmic patterns like Sliding Window, Two Pointers, and DP on Subsequences."
  },
  {
    icon: TrendingUp,
    title: "Adaptive Recommendations",
    description: "Get personalized problem suggestions based on your performance and weak areas."
  },
  {
    icon: BarChart3,
    title: "Detailed Analytics",
    description: "Track your progress with visual charts, mastery scores, and performance insights."
  },
  {
    icon: Award,
    title: "Gamification",
    description: "Earn XP points, unlock badges, and maintain daily streaks to stay motivated."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Join thousands of students preparing for FAANG and product-based companies."
  }
];

const stats = [
  { value: "500+", label: "DSA Problems" },
  { value: "20+", label: "Patterns" },
  { value: "15+", label: "Topics" },
  { value: "50+", label: "Badges" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <Code2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">PrepOS</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Your Path to FAANG Success</span>
            </div>
            
            <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Master DSA.{" "}
              <span className="text-primary">Ace Placements.</span>
            </h1>
            
            <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              A smart, structured platform for mastering Data Structures and Algorithms. 
              Pattern-based learning, adaptive recommendations, and real-time progress tracking.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button 
                size="lg" 
                onClick={() => window.location.href = "/api/login"}
                className="gap-2"
                data-testid="button-start-learning"
              >
                Start Learning
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" data-testid="button-view-roadmap">
                View Roadmap
              </Button>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute -top-40 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center"
                data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <span className="text-3xl font-bold text-primary md:text-4xl">
                  {stat.value}
                </span>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything You Need to Excel
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              PrepOS provides all the tools and features you need to systematically 
              prepare for technical interviews.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="border bg-card"
                data-testid={`card-feature-${index}`}
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/30 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              How PrepOS Works
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A simple, effective approach to mastering DSA
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Choose Your Path",
                description: "Start with the structured roadmap or focus on specific patterns you want to master."
              },
              {
                step: "02",
                title: "Practice & Learn",
                description: "Solve problems, track your progress, and get adaptive recommendations based on your performance."
              },
              {
                step: "03",
                title: "Achieve Mastery",
                description: "Earn badges, build streaks, and gain confidence for your placement interviews."
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center text-center"
                data-testid={`step-${index + 1}`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4">
          <Card className="border-0 bg-primary">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
              <CheckCircle2 className="h-12 w-12 text-primary-foreground" />
              <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                Ready to Start Your DSA Journey?
              </h2>
              <p className="max-w-xl text-primary-foreground/80">
                Join thousands of students who are preparing for their dream jobs with PrepOS.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = "/api/login"}
                className="gap-2"
                data-testid="button-cta-start"
              >
                Get Started for Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
                <Code2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">PrepOS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Intelligent DSA Placement Preparation Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

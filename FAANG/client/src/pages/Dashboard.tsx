import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle2, 
  Flame, 
  Trophy, 
  Target, 
  ExternalLink,
  TrendingUp,
  Zap
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { UserStats, ProblemWithDetails, TopicWithProgress } from "@shared/schema";

function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  subtitle,
  testId 
}: { 
  title: string; 
  value: string | number; 
  icon: React.ElementType; 
  subtitle?: string;
  testId: string;
}) {
  return (
    <Card data-testid={testId}>
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted-foreground">{title}</span>
          <span className="text-3xl font-bold">{value}</span>
          {subtitle && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variants: Record<string, string> = {
    Easy: "bg-green-500/10 text-green-600 dark:text-green-400",
    Medium: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    Hard: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <Badge 
      variant="secondary" 
      className={variants[difficulty] || ""}
      size="sm"
    >
      {difficulty}
    </Badge>
  );
}

function ProblemCard({ problem }: { problem: ProblemWithDetails }) {
  return (
    <Card 
      className="hover-elevate transition-all"
      data-testid={`card-problem-${problem.id}`}
    >
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="font-medium truncate">{problem.title}</span>
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.pattern && (
              <Badge variant="outline" size="sm">
                {problem.pattern.name}
              </Badge>
            )}
          </div>
        </div>
        <Button 
          size="sm" 
          variant="ghost"
          asChild
        >
          <a 
            href={problem.externalUrl || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            data-testid={`link-problem-${problem.id}`}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

function TopicProgressItem({ topic }: { topic: TopicWithProgress }) {
  return (
    <div className="flex flex-col gap-2" data-testid={`progress-topic-${topic.id}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium truncate">{topic.name}</span>
        <span className="text-sm text-muted-foreground">
          {topic.completedCount}/{topic.problemCount}
        </span>
      </div>
      <Progress value={topic.progress} className="h-2" />
    </div>
  );
}

function ActivityGrid({ activity }: { activity: { date: string; count: number }[] }) {
  const weeks = 13;
  const days = 7;
  const grid = Array(weeks).fill(null).map(() => Array(days).fill(0));
  
  activity.forEach((day, index) => {
    const weekIndex = Math.floor(index / 7);
    const dayIndex = index % 7;
    if (weekIndex < weeks) {
      grid[weekIndex][dayIndex] = day.count;
    }
  });

  const getIntensity = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-primary/20";
    if (count <= 3) return "bg-primary/40";
    if (count <= 5) return "bg-primary/60";
    return "bg-primary";
  };

  return (
    <div className="flex gap-1" data-testid="activity-grid">
      {grid.map((week, weekIndex) => (
        <div key={weekIndex} className="flex flex-col gap-1">
          {week.map((count, dayIndex) => (
            <div
              key={dayIndex}
              className={`h-3 w-3 rounded-sm ${getIntensity(count)}`}
              title={`${count} problems solved`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const { data: recommendations, isLoading: recsLoading } = useQuery<ProblemWithDetails[]>({
    queryKey: ["/api/problems/recommended"],
  });

  const isLoading = statsLoading || recsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <DashboardSkeleton />
      </div>
    );
  }

  const displayStats = stats || {
    totalSolved: 0,
    currentStreak: 0,
    xp: 0,
    level: 1,
    topicProgress: [],
    recentActivity: [],
    badges: [],
  };

  const displayRecs = recommendations || [];

  const xpToNextLevel = (displayStats.level * 100) - (displayStats.xp % (displayStats.level * 100));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-dashboard-title">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="text-muted-foreground">
          Keep up the great work on your DSA journey.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Problems Solved" 
          value={displayStats.totalSolved}
          icon={CheckCircle2}
          testId="card-stats-solved"
        />
        <StatsCard 
          title="Current Streak" 
          value={`${displayStats.currentStreak} days`}
          icon={Flame}
          testId="card-stats-streak"
        />
        <StatsCard 
          title="XP Points" 
          value={displayStats.xp}
          icon={Zap}
          subtitle={`${xpToNextLevel} XP to Level ${displayStats.level + 1}`}
          testId="card-stats-xp"
        />
        <StatsCard 
          title="Level" 
          value={displayStats.level}
          icon={Trophy}
          testId="card-stats-level"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recommended Problems */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Today's Recommendations
            </CardTitle>
            <Link href="/roadmap">
              <Button variant="ghost" size="sm" data-testid="link-view-all">
                View All
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {displayRecs.length > 0 ? (
              displayRecs.slice(0, 5).map((problem) => (
                <ProblemCard key={problem.id} problem={problem} />
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No recommendations yet. Start solving problems!
                </p>
                <Link href="/roadmap">
                  <Button data-testid="button-start-roadmap">
                    Explore Roadmap
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topic Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Topic Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {displayStats.topicProgress.length > 0 ? (
              displayStats.topicProgress.slice(0, 6).map((topic) => (
                <TopicProgressItem key={topic.id} topic={topic} />
              ))
            ) : (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No progress yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <ActivityGrid 
              activity={
                displayStats.recentActivity?.map((a) => ({
                  date: new Date(a.date).toISOString(),
                  count: a.problemsSolved,
                })) || Array(91).fill({ date: "", count: 0 })
              } 
            />
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-sm bg-muted" />
                <div className="h-3 w-3 rounded-sm bg-primary/20" />
                <div className="h-3 w-3 rounded-sm bg-primary/40" />
                <div className="h-3 w-3 rounded-sm bg-primary/60" />
                <div className="h-3 w-3 rounded-sm bg-primary" />
              </div>
              <span>More</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

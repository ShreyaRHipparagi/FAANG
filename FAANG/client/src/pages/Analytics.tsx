import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Target
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { UserStats } from "@shared/schema";

const COLORS = {
  primary: "hsl(217, 91%, 60%)",
  green: "hsl(142, 76%, 36%)",
  yellow: "hsl(45, 93%, 47%)",
  red: "hsl(0, 84%, 60%)",
  purple: "hsl(262, 83%, 58%)",
  orange: "hsl(27, 87%, 67%)",
};

const DIFFICULTY_COLORS = {
  Easy: COLORS.green,
  Medium: COLORS.yellow,
  Hard: COLORS.red,
};

function TopicPerformanceChart({ data }: { data: { name: string; progress: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 80 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
        <Tooltip 
          formatter={(value: number) => [`${value}%`, "Progress"]}
          contentStyle={{ 
            backgroundColor: "hsl(var(--popover))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
        />
        <Bar dataKey="progress" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DifficultyDistributionChart({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, value }) => `${name}: ${value}`}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={DIFFICULTY_COLORS[entry.name as keyof typeof DIFFICULTY_COLORS] || COLORS.primary} 
            />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--popover))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function PatternMasteryChart({ data }: { data: { name: string; mastery: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} />
        <Radar
          name="Mastery"
          dataKey="mastery"
          stroke={COLORS.primary}
          fill={COLORS.primary}
          fillOpacity={0.3}
        />
        <Tooltip 
          formatter={(value: number) => [`${value}%`, "Mastery"]}
          contentStyle={{ 
            backgroundColor: "hsl(var(--popover))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function SolveTrendsChart({ data }: { data: { date: string; solved: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ left: 0, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--popover))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px"
          }}
        />
        <Line 
          type="monotone" 
          dataKey="solved" 
          stroke={COLORS.primary} 
          strokeWidth={2}
          dot={{ fill: COLORS.primary, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[300px] w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { data: stats, isLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your learning progress</p>
        </div>
        <AnalyticsSkeleton />
      </div>
    );
  }

  const topicProgressData = (stats?.topicProgress || []).map((topic) => ({
    name: topic.name,
    progress: topic.progress,
  }));

  const patternMasteryData = (stats?.patternProgress || []).slice(0, 8).map((pattern) => ({
    name: pattern.name,
    mastery: pattern.masteryScore,
  }));

  const difficultyData = [
    { name: "Easy", value: 0 },
    { name: "Medium", value: 0 },
    { name: "Hard", value: 0 },
  ];

  const solveTrendsData = (stats?.recentActivity || []).slice(-14).map((activity) => ({
    date: new Date(activity.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    solved: activity.problemsSolved,
  }));

  const hasData = stats && (
    topicProgressData.length > 0 || 
    patternMasteryData.length > 0 || 
    solveTrendsData.length > 0
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-analytics-title">
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Visualize your learning journey and identify areas for improvement
        </p>
      </div>

      {/* Summary Stats */}
      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card data-testid="card-analytics-solved">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats?.totalSolved || 0}</span>
              <span className="text-sm text-muted-foreground">Problems Solved</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-analytics-topics">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
              <BarChart3 className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {stats?.topicProgress?.filter((t) => t.progress === 100).length || 0}
              </span>
              <span className="text-sm text-muted-foreground">Topics Mastered</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-analytics-patterns">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/10">
              <TrendingUp className="h-6 w-6 text-purple-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">
                {stats?.patternProgress?.filter((p) => p.masteryScore >= 80).length || 0}
              </span>
              <span className="text-sm text-muted-foreground">Patterns Mastered</span>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-analytics-streak">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10">
              <PieChartIcon className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{stats?.longestStreak || 0}</span>
              <span className="text-sm text-muted-foreground">Longest Streak</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {hasData ? (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Topic Performance */}
          <Card data-testid="chart-topic-performance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Topic Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topicProgressData.length > 0 ? (
                <TopicPerformanceChart data={topicProgressData} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No topic data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pattern Mastery */}
          <Card data-testid="chart-pattern-mastery">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Pattern Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patternMasteryData.length > 0 ? (
                <PatternMasteryChart data={patternMasteryData} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No pattern data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Difficulty Distribution */}
          <Card data-testid="chart-difficulty-distribution">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Difficulty Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DifficultyDistributionChart data={difficultyData} />
            </CardContent>
          </Card>

          {/* Solve Trends */}
          <Card data-testid="chart-solve-trends">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Daily Solve Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {solveTrendsData.length > 0 ? (
                <SolveTrendsChart data={solveTrendsData} />
              ) : (
                <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                  No activity data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-medium">No Data Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start solving problems to see your analytics. Your progress will be visualized here.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Award, 
  Flame, 
  Trophy, 
  Zap,
  Target,
  Calendar,
  LogOut,
  Lock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserStats, Badge as BadgeType } from "@shared/schema";

function StatItem({ 
  icon: Icon, 
  label, 
  value,
  testId 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number;
  testId: string;
}) {
  return (
    <div className="flex items-center gap-3" data-testid={testId}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    </div>
  );
}

function BadgeCard({ 
  badge, 
  earned 
}: { 
  badge: BadgeType & { earned: boolean; earnedAt?: Date }; 
  earned: boolean;
}) {
  const getBadgeIcon = () => {
    return Trophy;
  };
  
  const Icon = getBadgeIcon();

  return (
    <div 
      className={`flex flex-col items-center gap-2 rounded-lg border p-4 text-center ${
        earned ? "" : "opacity-50"
      }`}
      data-testid={`badge-${badge.id}`}
    >
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
        earned ? "bg-primary/10" : "bg-muted"
      }`}>
        {earned ? (
          <Icon className="h-6 w-6 text-primary" />
        ) : (
          <Lock className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <span className="text-sm font-medium">{badge.name}</span>
      {badge.description && (
        <span className="text-xs text-muted-foreground line-clamp-2">
          {badge.description}
        </span>
      )}
      {earned && badge.earnedAt && (
        <Badge variant="secondary" size="sm">
          Earned {new Date(badge.earnedAt).toLocaleDateString()}
        </Badge>
      )}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
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
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
  });

  const isLoading = authLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <ProfileSkeleton />
      </div>
    );
  }

  const displayStats = stats || {
    totalSolved: 0,
    currentStreak: 0,
    longestStreak: 0,
    xp: 0,
    level: 1,
    badges: [],
    topicProgress: [],
    patternProgress: [],
    recentActivity: [],
  };

  const xpToNextLevel = (displayStats.level * 100);
  const currentXpInLevel = displayStats.xp % xpToNextLevel;
  const xpProgress = Math.round((currentXpInLevel / xpToNextLevel) * 100);

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const earnedBadges = displayStats.badges.filter((b) => b.earned);
  const lockedBadges = displayStats.badges.filter((b) => !b.earned);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={user?.profileImageUrl || undefined} 
                alt={user?.firstName || "User"}
                className="object-cover" 
              />
              <AvatarFallback className="bg-primary text-2xl text-primary-foreground">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-bold" data-testid="text-profile-name">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "User"}
              </h1>
              <p className="text-muted-foreground" data-testid="text-profile-email">
                {user?.email || ""}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="gap-1">
                  <Trophy className="h-3 w-3" />
                  Level {displayStats.level}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Zap className="h-3 w-3" />
                  {displayStats.xp} XP
                </Badge>
              </div>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => window.location.href = "/api/logout"}
            data-testid="button-profile-logout"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <StatItem 
              icon={Target} 
              label="Problems Solved" 
              value={displayStats.totalSolved}
              testId="stat-problems-solved"
            />
            <StatItem 
              icon={Flame} 
              label="Current Streak" 
              value={`${displayStats.currentStreak} days`}
              testId="stat-current-streak"
            />
            <StatItem 
              icon={Calendar} 
              label="Longest Streak" 
              value={`${displayStats.longestStreak} days`}
              testId="stat-longest-streak"
            />
            <StatItem 
              icon={Award} 
              label="Badges Earned" 
              value={earnedBadges.length}
              testId="stat-badges-earned"
            />
            
            <Separator className="my-2" />
            
            {/* XP Progress */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">XP to Level {displayStats.level + 1}</span>
                <span className="font-medium">
                  {currentXpInLevel} / {xpToNextLevel}
                </span>
              </div>
              <Progress value={xpProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Badges ({earnedBadges.length}/{displayStats.badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayStats.badges.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {earnedBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} earned />
                ))}
                {lockedBadges.slice(0, 6 - earnedBadges.length).map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} earned={false} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No badges yet. Start solving problems to earn badges!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Learning Journey */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Topics Progress</span>
              <span className="text-sm font-medium">
                {displayStats.topicProgress.filter((t) => t.progress === 100).length}/
                {displayStats.topicProgress.length} completed
              </span>
            </div>
            
            <div className="grid gap-3 md:grid-cols-2">
              {displayStats.topicProgress.slice(0, 6).map((topic) => (
                <div key={topic.id} className="flex items-center gap-3">
                  <Progress value={topic.progress} className="h-2 flex-1" />
                  <span className="text-sm text-muted-foreground w-20 truncate">
                    {topic.name}
                  </span>
                  <span className="text-sm font-medium w-12 text-right">
                    {topic.progress}%
                  </span>
                </div>
              ))}
            </div>
            
            {displayStats.topicProgress.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <Target className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Start your learning journey by exploring the roadmap
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

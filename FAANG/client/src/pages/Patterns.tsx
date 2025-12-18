import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  ExternalLink, 
  Puzzle,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PatternWithProgress, ProblemWithDetails } from "@shared/schema";

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

function PatternCard({ 
  pattern, 
  onClick 
}: { 
  pattern: PatternWithProgress;
  onClick: () => void;
}) {
  const getPatternIcon = (name: string) => {
    return Puzzle;
  };
  
  const Icon = getPatternIcon(pattern.name);

  return (
    <Card 
      className="cursor-pointer hover-elevate transition-all"
      onClick={onClick}
      data-testid={`card-pattern-${pattern.id}`}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${pattern.color}20` || "hsl(var(--primary) / 0.1)" }}
          >
            <Icon 
              className="h-6 w-6" 
              style={{ color: pattern.color || "hsl(var(--primary))" }}
            />
          </div>
          <Badge variant="secondary">
            {pattern.problemCount} problems
          </Badge>
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className="font-semibold">{pattern.name}</h3>
          {pattern.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {pattern.description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{pattern.progress}%</span>
          </div>
          <Progress value={pattern.progress} className="h-2" />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Mastery Score</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="font-medium">{pattern.masteryScore}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProblemRow({ 
  problem, 
  onToggle 
}: { 
  problem: ProblemWithDetails; 
  onToggle: (problemId: string, completed: boolean) => void;
}) {
  return (
    <div 
      className="flex items-center gap-4 rounded-md border p-3 hover-elevate transition-all"
      data-testid={`row-pattern-problem-${problem.id}`}
    >
      <Checkbox 
        checked={problem.isCompleted || false}
        onCheckedChange={(checked) => onToggle(problem.id, checked as boolean)}
        data-testid={`checkbox-pattern-problem-${problem.id}`}
      />
      
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <span className="font-medium truncate">{problem.title}</span>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.topic && (
            <Badge variant="outline" size="sm">
              {problem.topic.name}
            </Badge>
          )}
        </div>
      </div>

      <Button 
        size="icon" 
        variant="ghost"
        asChild
      >
        <a 
          href={problem.externalUrl || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          data-testid={`link-pattern-external-${problem.id}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

function PatternsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <CardContent className="flex flex-col gap-4 p-6">
            <div className="flex items-start justify-between">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Patterns() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<PatternWithProgress | null>(null);
  const { toast } = useToast();

  const { data: patterns, isLoading: patternsLoading } = useQuery<PatternWithProgress[]>({
    queryKey: ["/api/patterns"],
  });

  const { data: patternProblems, isLoading: problemsLoading } = useQuery<ProblemWithDetails[]>({
    queryKey: ["/api/patterns", selectedPattern?.id, "problems"],
    enabled: !!selectedPattern,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ problemId, completed }: { problemId: string; completed: boolean }) => {
      await apiRequest("POST", `/api/progress/${problemId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patterns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/patterns", selectedPattern?.id, "problems"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      });
    },
  });

  const handleToggleProblem = (problemId: string, completed: boolean) => {
    toggleMutation.mutate({ problemId, completed });
  };

  const filteredPatterns = (patterns || []).filter((pattern) =>
    pattern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pattern.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-patterns-title">
          Algorithmic Patterns
        </h1>
        <p className="text-muted-foreground">
          Master common problem-solving patterns used in coding interviews
        </p>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-patterns"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patterns Grid */}
      {patternsLoading ? (
        <PatternsSkeleton />
      ) : filteredPatterns.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatterns.map((pattern) => (
            <PatternCard 
              key={pattern.id} 
              pattern={pattern}
              onClick={() => setSelectedPattern(pattern)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Puzzle className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No patterns found.</p>
          </CardContent>
        </Card>
      )}

      {/* Pattern Detail Dialog */}
      <Dialog open={!!selectedPattern} onOpenChange={() => setSelectedPattern(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSelectedPattern(null)}
                data-testid="button-back-patterns"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="flex items-center gap-2">
                <Puzzle className="h-5 w-5 text-primary" />
                {selectedPattern?.name}
              </DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col gap-4">
            {selectedPattern?.description && (
              <p className="text-muted-foreground">{selectedPattern.description}</p>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Progress</span>
                <div className="flex items-center gap-2">
                  <Progress value={selectedPattern?.progress || 0} className="h-2 w-32" />
                  <span className="text-sm font-medium">{selectedPattern?.progress}%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Mastery</span>
                <span className="text-sm font-medium">{selectedPattern?.masteryScore}%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-medium">Problems ({selectedPattern?.problemCount})</h4>
              {problemsLoading ? (
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : patternProblems && patternProblems.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {patternProblems.map((problem) => (
                    <ProblemRow 
                      key={problem.id} 
                      problem={problem}
                      onToggle={handleToggleProblem}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No problems in this pattern yet.
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

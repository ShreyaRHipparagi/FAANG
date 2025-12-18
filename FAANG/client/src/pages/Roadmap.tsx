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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  ExternalLink, 
  Filter,
  CheckCircle2,
  Circle,
  ChevronRight
} from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TopicWithProgress, ProblemWithDetails } from "@shared/schema";

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
      data-testid={`row-problem-${problem.id}`}
    >
      <Checkbox 
        checked={problem.isCompleted || false}
        onCheckedChange={(checked) => onToggle(problem.id, checked as boolean)}
        data-testid={`checkbox-problem-${problem.id}`}
      />
      
      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{problem.title}</span>
          {problem.platform && (
            <Badge variant="outline" size="sm" className="shrink-0">
              {problem.platform}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={problem.difficulty} />
          {problem.pattern && (
            <Badge variant="secondary" size="sm">
              {problem.pattern.name}
            </Badge>
          )}
          {problem.tags?.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" size="sm">
              {tag}
            </Badge>
          ))}
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
          data-testid={`link-external-${problem.id}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

function TopicCard({ 
  topic, 
  problems,
  onToggleProblem 
}: { 
  topic: TopicWithProgress;
  problems: ProblemWithDetails[];
  onToggleProblem: (problemId: string, completed: boolean) => void;
}) {
  const topicProblems = problems.filter(p => p.topicId === topic.id);
  
  return (
    <AccordionItem value={topic.id} className="border rounded-lg px-0 overflow-hidden">
      <AccordionTrigger 
        className="px-4 py-3 hover:no-underline [&[data-state=open]]:bg-muted/50"
        data-testid={`accordion-topic-${topic.id}`}
      >
        <div className="flex flex-1 items-center gap-4 pr-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            {topic.progress === 100 ? (
              <CheckCircle2 className="h-5 w-5 text-primary" />
            ) : (
              <Circle className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="flex flex-1 flex-col gap-1 min-w-0 text-left">
            <span className="font-semibold truncate">{topic.name}</span>
            <div className="flex items-center gap-2">
              <Progress value={topic.progress} className="h-2 w-24" />
              <span className="text-xs text-muted-foreground">
                {topic.completedCount}/{topic.problemCount}
              </span>
            </div>
          </div>
          
          <Badge variant="secondary">
            {topic.problemCount} problems
          </Badge>
        </div>
      </AccordionTrigger>
      
      <AccordionContent className="px-4 pb-4">
        <div className="flex flex-col gap-2 mt-2">
          {topicProblems.length > 0 ? (
            topicProblems.map((problem) => (
              <ProblemRow 
                key={problem.id} 
                problem={problem}
                onToggle={onToggleProblem}
              />
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No problems in this topic yet.
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

function RoadmapSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardContent className="flex items-center gap-4 p-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-2 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Roadmap() {
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  const { data: topics, isLoading: topicsLoading } = useQuery<TopicWithProgress[]>({
    queryKey: ["/api/topics"],
  });

  const { data: problems, isLoading: problemsLoading } = useQuery<ProblemWithDetails[]>({
    queryKey: ["/api/problems"],
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ problemId, completed }: { problemId: string; completed: boolean }) => {
      await apiRequest("POST", `/api/progress/${problemId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/topics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/problems"] });
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

  const isLoading = topicsLoading || problemsLoading;

  const filteredProblems = (problems || []).filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.pattern?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === "all" || problem.difficulty === difficultyFilter;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "completed" && problem.isCompleted) ||
      (statusFilter === "pending" && !problem.isCompleted);

    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  const completedCount = filteredProblems.filter(p => p.isCompleted).length;
  const totalCount = filteredProblems.length;
  const overallProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold" data-testid="text-roadmap-title">
          DSA Roadmap
        </h1>
        <p className="text-muted-foreground">
          Follow the structured path to master Data Structures and Algorithms
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold">{overallProgress}%</span>
              <Progress value={overallProgress} className="h-3 w-40" />
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{completedCount} Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span>{totalCount - completedCount} Remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search problems, patterns, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-32" data-testid="select-difficulty">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Topics List */}
      {isLoading ? (
        <RoadmapSkeleton />
      ) : topics && topics.length > 0 ? (
        <Accordion type="multiple" className="flex flex-col gap-4">
          {topics.map((topic) => (
            <TopicCard 
              key={topic.id} 
              topic={topic}
              problems={filteredProblems}
              onToggleProblem={handleToggleProblem}
            />
          ))}
        </Accordion>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ChevronRight className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No topics available yet.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

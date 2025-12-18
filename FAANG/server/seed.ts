import { db } from "./db";
import { eq } from "drizzle-orm";
import { topics, patterns, problems, badges, subtopics } from "@shared/schema";

const TOPICS_DATA = [
  { name: "Arrays & Hashing", description: "Fundamental operations on arrays and hash tables", icon: "Grid", order: 1 },
  { name: "Two Pointers", description: "Techniques using two pointers for efficient solutions", icon: "ArrowsHorizontal", order: 2 },
  { name: "Sliding Window", description: "Optimize array/string problems with sliding window", icon: "Window", order: 3 },
  { name: "Stack", description: "LIFO data structure problems", icon: "Layers", order: 4 },
  { name: "Binary Search", description: "Efficient search in sorted data", icon: "Search", order: 5 },
  { name: "Linked List", description: "Node-based linear data structures", icon: "Link", order: 6 },
  { name: "Trees", description: "Hierarchical tree structures and traversals", icon: "TreePine", order: 7 },
  { name: "Heap / Priority Queue", description: "Priority-based data structures", icon: "Mountain", order: 8 },
  { name: "Backtracking", description: "Recursive exploration with pruning", icon: "Undo", order: 9 },
  { name: "Graphs", description: "Graph traversal and algorithms", icon: "Network", order: 10 },
  { name: "Dynamic Programming", description: "Optimization through subproblem solving", icon: "Brain", order: 11 },
  { name: "Greedy", description: "Locally optimal choices for global solutions", icon: "Sparkles", order: 12 },
  { name: "Bit Manipulation", description: "Operations on binary representations", icon: "Binary", order: 13 },
  { name: "Math & Geometry", description: "Mathematical algorithms and geometry", icon: "Calculator", order: 14 },
];

const PATTERNS_DATA = [
  { name: "Two Pointers", description: "Use two pointers moving in same or opposite directions", icon: "ArrowsHorizontal", color: "#3b82f6" },
  { name: "Sliding Window", description: "Maintain a window that slides through data", icon: "Window", color: "#10b981" },
  { name: "Fast & Slow Pointers", description: "Two pointers moving at different speeds", icon: "Rabbit", color: "#f59e0b" },
  { name: "Merge Intervals", description: "Combine overlapping intervals", icon: "Merge", color: "#8b5cf6" },
  { name: "Cyclic Sort", description: "Sort numbers in a given range", icon: "RefreshCw", color: "#ec4899" },
  { name: "Binary Search", description: "Divide and conquer on sorted data", icon: "Search", color: "#06b6d4" },
  { name: "BFS", description: "Breadth-first search traversal", icon: "Layers", color: "#84cc16" },
  { name: "DFS", description: "Depth-first search traversal", icon: "TreePine", color: "#f97316" },
  { name: "Top K Elements", description: "Find top/smallest K elements using heap", icon: "Trophy", color: "#6366f1" },
  { name: "Subsets", description: "Generate all subsets/combinations", icon: "Grid", color: "#14b8a6" },
  { name: "Modified Binary Search", description: "Variations of binary search", icon: "SearchCode", color: "#a855f7" },
  { name: "Topological Sort", description: "Order nodes in a DAG", icon: "GitBranch", color: "#0ea5e9" },
  { name: "DP on Subsequences", description: "Dynamic programming for subsequence problems", icon: "Dna", color: "#d946ef" },
  { name: "DP on Strings", description: "Dynamic programming for string problems", icon: "Text", color: "#22c55e" },
  { name: "DP on Grid", description: "Dynamic programming on 2D grids", icon: "LayoutGrid", color: "#eab308" },
  { name: "Monotonic Stack", description: "Stack maintaining monotonic order", icon: "BarChart", color: "#ef4444" },
];

const PROBLEMS_DATA = [
  // Arrays & Hashing
  { title: "Two Sum", difficulty: "Easy", topicIndex: 0, patternIndex: 0, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/two-sum/", tags: ["array", "hash-table"] },
  { title: "Contains Duplicate", difficulty: "Easy", topicIndex: 0, patternIndex: null, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/contains-duplicate/", tags: ["array", "hash-table"] },
  { title: "Valid Anagram", difficulty: "Easy", topicIndex: 0, patternIndex: null, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/valid-anagram/", tags: ["string", "hash-table"] },
  { title: "Group Anagrams", difficulty: "Medium", topicIndex: 0, patternIndex: null, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/group-anagrams/", tags: ["array", "hash-table", "string"] },
  { title: "Top K Frequent Elements", difficulty: "Medium", topicIndex: 0, patternIndex: 8, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/top-k-frequent-elements/", tags: ["array", "heap", "hash-table"] },
  
  // Two Pointers
  { title: "Valid Palindrome", difficulty: "Easy", topicIndex: 1, patternIndex: 0, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/valid-palindrome/", tags: ["string", "two-pointers"] },
  { title: "3Sum", difficulty: "Medium", topicIndex: 1, patternIndex: 0, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/3sum/", tags: ["array", "two-pointers"] },
  { title: "Container With Most Water", difficulty: "Medium", topicIndex: 1, patternIndex: 0, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/container-with-most-water/", tags: ["array", "two-pointers", "greedy"] },
  
  // Sliding Window
  { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topicIndex: 2, patternIndex: 1, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock/", tags: ["array", "dp"] },
  { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topicIndex: 2, patternIndex: 1, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/longest-substring-without-repeating-characters/", tags: ["string", "sliding-window", "hash-table"] },
  { title: "Minimum Window Substring", difficulty: "Hard", topicIndex: 2, patternIndex: 1, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/minimum-window-substring/", tags: ["string", "sliding-window", "hash-table"] },
  
  // Stack
  { title: "Valid Parentheses", difficulty: "Easy", topicIndex: 3, patternIndex: 15, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/valid-parentheses/", tags: ["string", "stack"] },
  { title: "Daily Temperatures", difficulty: "Medium", topicIndex: 3, patternIndex: 15, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/daily-temperatures/", tags: ["array", "stack", "monotonic-stack"] },
  { title: "Largest Rectangle in Histogram", difficulty: "Hard", topicIndex: 3, patternIndex: 15, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/largest-rectangle-in-histogram/", tags: ["array", "stack", "monotonic-stack"] },
  
  // Binary Search
  { title: "Binary Search", difficulty: "Easy", topicIndex: 4, patternIndex: 5, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/binary-search/", tags: ["array", "binary-search"] },
  { title: "Search in Rotated Sorted Array", difficulty: "Medium", topicIndex: 4, patternIndex: 10, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/search-in-rotated-sorted-array/", tags: ["array", "binary-search"] },
  { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topicIndex: 4, patternIndex: 10, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/", tags: ["array", "binary-search"] },
  
  // Linked List
  { title: "Reverse Linked List", difficulty: "Easy", topicIndex: 5, patternIndex: null, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/reverse-linked-list/", tags: ["linked-list", "recursion"] },
  { title: "Merge Two Sorted Lists", difficulty: "Easy", topicIndex: 5, patternIndex: null, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/merge-two-sorted-lists/", tags: ["linked-list", "recursion"] },
  { title: "Linked List Cycle", difficulty: "Easy", topicIndex: 5, patternIndex: 2, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/linked-list-cycle/", tags: ["linked-list", "two-pointers"] },
  
  // Trees
  { title: "Invert Binary Tree", difficulty: "Easy", topicIndex: 6, patternIndex: 7, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/invert-binary-tree/", tags: ["tree", "dfs", "bfs"] },
  { title: "Maximum Depth of Binary Tree", difficulty: "Easy", topicIndex: 6, patternIndex: 7, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/maximum-depth-of-binary-tree/", tags: ["tree", "dfs", "bfs"] },
  { title: "Validate Binary Search Tree", difficulty: "Medium", topicIndex: 6, patternIndex: 7, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/validate-binary-search-tree/", tags: ["tree", "dfs", "bst"] },
  { title: "Binary Tree Level Order Traversal", difficulty: "Medium", topicIndex: 6, patternIndex: 6, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/binary-tree-level-order-traversal/", tags: ["tree", "bfs"] },
  
  // Graphs
  { title: "Number of Islands", difficulty: "Medium", topicIndex: 9, patternIndex: 7, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/number-of-islands/", tags: ["graph", "dfs", "bfs"] },
  { title: "Clone Graph", difficulty: "Medium", topicIndex: 9, patternIndex: 6, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/clone-graph/", tags: ["graph", "dfs", "bfs"] },
  { title: "Course Schedule", difficulty: "Medium", topicIndex: 9, patternIndex: 11, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/course-schedule/", tags: ["graph", "topological-sort"] },
  
  // Dynamic Programming
  { title: "Climbing Stairs", difficulty: "Easy", topicIndex: 10, patternIndex: 12, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/climbing-stairs/", tags: ["dp", "math"] },
  { title: "House Robber", difficulty: "Medium", topicIndex: 10, patternIndex: 12, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/house-robber/", tags: ["dp", "array"] },
  { title: "Longest Increasing Subsequence", difficulty: "Medium", topicIndex: 10, patternIndex: 12, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/longest-increasing-subsequence/", tags: ["dp", "binary-search"] },
  { title: "Longest Common Subsequence", difficulty: "Medium", topicIndex: 10, patternIndex: 13, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/longest-common-subsequence/", tags: ["dp", "string"] },
  { title: "Unique Paths", difficulty: "Medium", topicIndex: 10, patternIndex: 14, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/unique-paths/", tags: ["dp", "math"] },
  
  // Backtracking
  { title: "Subsets", difficulty: "Medium", topicIndex: 8, patternIndex: 9, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/subsets/", tags: ["backtracking", "array"] },
  { title: "Combination Sum", difficulty: "Medium", topicIndex: 8, patternIndex: 9, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/combination-sum/", tags: ["backtracking", "array"] },
  { title: "Permutations", difficulty: "Medium", topicIndex: 8, patternIndex: 9, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/permutations/", tags: ["backtracking", "array"] },
  { title: "Word Search", difficulty: "Medium", topicIndex: 8, patternIndex: 7, platform: "LeetCode", externalUrl: "https://leetcode.com/problems/word-search/", tags: ["backtracking", "dfs", "matrix"] },
];

const BADGES_DATA = [
  { name: "First Steps", description: "Solve your first problem", icon: "Footprints", xpReward: 50, requirement: "problems_solved", threshold: 1 },
  { name: "Getting Started", description: "Solve 10 problems", icon: "Rocket", xpReward: 100, requirement: "problems_solved", threshold: 10 },
  { name: "Problem Solver", description: "Solve 25 problems", icon: "Target", xpReward: 200, requirement: "problems_solved", threshold: 25 },
  { name: "Century", description: "Solve 100 problems", icon: "Trophy", xpReward: 500, requirement: "problems_solved", threshold: 100 },
  { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "Flame", xpReward: 150, requirement: "streak_days", threshold: 7 },
  { name: "Month Master", description: "Maintain a 30-day streak", icon: "Calendar", xpReward: 500, requirement: "streak_days", threshold: 30 },
  { name: "Topic Explorer", description: "Complete 1 topic", icon: "Map", xpReward: 200, requirement: "topics_completed", threshold: 1 },
  { name: "Topic Champion", description: "Complete 5 topics", icon: "Medal", xpReward: 500, requirement: "topics_completed", threshold: 5 },
  { name: "Pattern Learner", description: "Master 1 pattern", icon: "Puzzle", xpReward: 150, requirement: "patterns_mastered", threshold: 1 },
  { name: "Pattern Expert", description: "Master 5 patterns", icon: "Brain", xpReward: 400, requirement: "patterns_mastered", threshold: 5 },
  { name: "XP Hunter", description: "Earn 500 XP", icon: "Zap", xpReward: 100, requirement: "xp_earned", threshold: 500 },
  { name: "XP Master", description: "Earn 2000 XP", icon: "Crown", xpReward: 300, requirement: "xp_earned", threshold: 2000 },
];

export async function seedDatabase() {
  console.log("Starting database seed...");

  try {
    // Check if data already exists
    const existingTopics = await db.select().from(topics);
    if (existingTopics.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    // Insert topics
    const insertedTopics = await db.insert(topics).values(
      TOPICS_DATA.map((t, i) => ({ ...t, problemCount: 0 }))
    ).returning();
    console.log(`Inserted ${insertedTopics.length} topics`);

    // Insert patterns
    const insertedPatterns = await db.insert(patterns).values(
      PATTERNS_DATA.map((p) => ({ ...p, problemCount: 0 }))
    ).returning();
    console.log(`Inserted ${insertedPatterns.length} patterns`);

    // Insert problems
    const problemsToInsert = PROBLEMS_DATA.map((p, i) => ({
      title: p.title,
      difficulty: p.difficulty,
      topicId: insertedTopics[p.topicIndex].id,
      patternId: p.patternIndex !== null ? insertedPatterns[p.patternIndex].id : null,
      platform: p.platform,
      externalUrl: p.externalUrl,
      tags: p.tags,
      order: i,
    }));

    const insertedProblems = await db.insert(problems).values(problemsToInsert).returning();
    console.log(`Inserted ${insertedProblems.length} problems`);

    // Update topic problem counts
    for (const topic of insertedTopics) {
      const count = insertedProblems.filter((p) => p.topicId === topic.id).length;
      await db.update(topics).set({ problemCount: count }).where(eq(topics.id, topic.id));
    }

    // Update pattern problem counts
    for (const pattern of insertedPatterns) {
      const count = insertedProblems.filter((p) => p.patternId === pattern.id).length;
      await db.update(patterns).set({ problemCount: count }).where(eq(patterns.id, pattern.id));
    }

    // Insert badges
    const insertedBadges = await db.insert(badges).values(BADGES_DATA).returning();
    console.log(`Inserted ${insertedBadges.length} badges`);

    console.log("Database seed completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

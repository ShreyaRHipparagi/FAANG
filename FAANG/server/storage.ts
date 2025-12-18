import {
  users,
  topics,
  subtopics,
  patterns,
  problems,
  userProgress,
  userTopicProgress,
  userPatternProgress,
  badges,
  userBadges,
  dailyActivity,
  type User,
  type UpsertUser,
  type Topic,
  type InsertTopic,
  type Subtopic,
  type InsertSubtopic,
  type Pattern,
  type InsertPattern,
  type Problem,
  type InsertProblem,
  type UserProgress,
  type InsertUserProgress,
  type Badge,
  type InsertBadge,
  type UserBadge,
  type DailyActivity,
  type TopicWithProgress,
  type PatternWithProgress,
  type ProblemWithDetails,
  type UserStats,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserXP(userId: string, xpToAdd: number): Promise<void>;
  updateUserStreak(userId: string): Promise<void>;

  // Topics
  getTopics(): Promise<Topic[]>;
  getTopicsWithProgress(userId: string): Promise<TopicWithProgress[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;

  // Subtopics
  getSubtopics(topicId: string): Promise<Subtopic[]>;
  createSubtopic(subtopic: InsertSubtopic): Promise<Subtopic>;

  // Patterns
  getPatterns(): Promise<Pattern[]>;
  getPatternsWithProgress(userId: string): Promise<PatternWithProgress[]>;
  createPattern(pattern: InsertPattern): Promise<Pattern>;

  // Problems
  getProblems(): Promise<Problem[]>;
  getProblemsWithDetails(userId: string): Promise<ProblemWithDetails[]>;
  getProblemsByPattern(patternId: string, userId: string): Promise<ProblemWithDetails[]>;
  getRecommendedProblems(userId: string, limit?: number): Promise<ProblemWithDetails[]>;
  createProblem(problem: InsertProblem): Promise<Problem>;

  // User Progress
  getUserProgress(userId: string, problemId: string): Promise<UserProgress | undefined>;
  toggleProblemProgress(userId: string, problemId: string, completed: boolean): Promise<void>;

  // Badges
  getBadges(): Promise<Badge[]>;
  getUserBadges(userId: string): Promise<(Badge & { earned: boolean; earnedAt?: Date })[]>;
  awardBadge(userId: string, badgeId: string): Promise<void>;
  checkAndAwardBadges(userId: string): Promise<void>;

  // Daily Activity
  getDailyActivity(userId: string, days?: number): Promise<DailyActivity[]>;
  recordDailyActivity(userId: string): Promise<void>;

  // User Stats
  getUserStats(userId: string): Promise<UserStats>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserXP(userId: string, xpToAdd: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const newXP = (user.xp || 0) + xpToAdd;
    const newLevel = Math.floor(newXP / 100) + 1;

    await db
      .update(users)
      .set({ xp: newXP, level: newLevel, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }

  async updateUserStreak(userId: string): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;

    let newStreak = user.currentStreak || 0;

    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return; // Already counted today
      } else if (diffDays === 1) {
        newStreak += 1;
      } else {
        newStreak = 1; // Reset streak
      }
    } else {
      newStreak = 1;
    }

    const longestStreak = Math.max(user.longestStreak || 0, newStreak);

    await db
      .update(users)
      .set({
        currentStreak: newStreak,
        longestStreak,
        lastActiveDate: today,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Topics
  async getTopics(): Promise<Topic[]> {
    return db.select().from(topics).orderBy(topics.order);
  }

  async getTopicsWithProgress(userId: string): Promise<TopicWithProgress[]> {
    const allTopics = await this.getTopics();
    const allProblems = await db.select().from(problems);
    const userProgressList = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const completedProblemIds = new Set(
      userProgressList.filter((p) => p.completed).map((p) => p.problemId)
    );

    return allTopics.map((topic) => {
      const topicProblems = allProblems.filter((p) => p.topicId === topic.id);
      const completedCount = topicProblems.filter((p) => completedProblemIds.has(p.id)).length;
      const progress = topicProblems.length > 0 
        ? Math.round((completedCount / topicProblems.length) * 100) 
        : 0;

      return {
        ...topic,
        problemCount: topicProblems.length,
        completedCount,
        progress,
      };
    });
  }

  async createTopic(topic: InsertTopic): Promise<Topic> {
    const [created] = await db.insert(topics).values(topic).returning();
    return created;
  }

  // Subtopics
  async getSubtopics(topicId: string): Promise<Subtopic[]> {
    return db.select().from(subtopics).where(eq(subtopics.topicId, topicId)).orderBy(subtopics.order);
  }

  async createSubtopic(subtopic: InsertSubtopic): Promise<Subtopic> {
    const [created] = await db.insert(subtopics).values(subtopic).returning();
    return created;
  }

  // Patterns
  async getPatterns(): Promise<Pattern[]> {
    return db.select().from(patterns);
  }

  async getPatternsWithProgress(userId: string): Promise<PatternWithProgress[]> {
    const allPatterns = await this.getPatterns();
    const allProblems = await db.select().from(problems);
    const userProgressList = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const completedProblemIds = new Set(
      userProgressList.filter((p) => p.completed).map((p) => p.problemId)
    );

    return allPatterns.map((pattern) => {
      const patternProblems = allProblems.filter((p) => p.patternId === pattern.id);
      const completedCount = patternProblems.filter((p) => completedProblemIds.has(p.id)).length;
      const progress = patternProblems.length > 0 
        ? Math.round((completedCount / patternProblems.length) * 100) 
        : 0;
      const masteryScore = progress; // Simplified mastery calculation

      return {
        ...pattern,
        problemCount: patternProblems.length,
        completedCount,
        progress,
        masteryScore,
      };
    });
  }

  async createPattern(pattern: InsertPattern): Promise<Pattern> {
    const [created] = await db.insert(patterns).values(pattern).returning();
    return created;
  }

  // Problems
  async getProblems(): Promise<Problem[]> {
    return db.select().from(problems).orderBy(problems.order);
  }

  async getProblemsWithDetails(userId: string): Promise<ProblemWithDetails[]> {
    const allProblems = await this.getProblems();
    const allTopics = await this.getTopics();
    const allSubtopics = await db.select().from(subtopics);
    const allPatterns = await this.getPatterns();
    const userProgressList = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    const topicsMap = new Map(allTopics.map((t) => [t.id, t]));
    const subtopicsMap = new Map(allSubtopics.map((s) => [s.id, s]));
    const patternsMap = new Map(allPatterns.map((p) => [p.id, p]));
    const progressMap = new Map(userProgressList.map((p) => [p.problemId, p]));

    return allProblems.map((problem) => ({
      ...problem,
      topic: problem.topicId ? topicsMap.get(problem.topicId) : undefined,
      subtopic: problem.subtopicId ? subtopicsMap.get(problem.subtopicId) : undefined,
      pattern: problem.patternId ? patternsMap.get(problem.patternId) : undefined,
      isCompleted: progressMap.get(problem.id)?.completed || false,
    }));
  }

  async getProblemsByPattern(patternId: string, userId: string): Promise<ProblemWithDetails[]> {
    const allProblems = await this.getProblemsWithDetails(userId);
    return allProblems.filter((p) => p.patternId === patternId);
  }

  async getRecommendedProblems(userId: string, limit = 5): Promise<ProblemWithDetails[]> {
    const allProblems = await this.getProblemsWithDetails(userId);
    const unsolvedProblems = allProblems.filter((p) => !p.isCompleted);
    
    // Prioritize by difficulty: Easy first, then Medium, then Hard
    const sorted = unsolvedProblems.sort((a, b) => {
      const order = { Easy: 0, Medium: 1, Hard: 2 };
      return (order[a.difficulty as keyof typeof order] || 0) - 
             (order[b.difficulty as keyof typeof order] || 0);
    });

    return sorted.slice(0, limit);
  }

  async createProblem(problem: InsertProblem): Promise<Problem> {
    const [created] = await db.insert(problems).values(problem).returning();
    return created;
  }

  // User Progress
  async getUserProgress(userId: string, problemId: string): Promise<UserProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.problemId, problemId)));
    return progress;
  }

  async toggleProblemProgress(userId: string, problemId: string, completed: boolean): Promise<void> {
    const existing = await this.getUserProgress(userId, problemId);

    if (existing) {
      await db
        .update(userProgress)
        .set({
          completed,
          completedAt: completed ? new Date() : null,
        })
        .where(eq(userProgress.id, existing.id));
    } else {
      await db.insert(userProgress).values({
        userId,
        problemId,
        completed,
        completedAt: completed ? new Date() : null,
      });
    }

    if (completed) {
      await this.updateUserXP(userId, 10);
      await this.updateUserStreak(userId);
      await this.recordDailyActivity(userId);
      await this.checkAndAwardBadges(userId);
    }
  }

  // Badges
  async getBadges(): Promise<Badge[]> {
    return db.select().from(badges);
  }

  async getUserBadges(userId: string): Promise<(Badge & { earned: boolean; earnedAt?: Date })[]> {
    const allBadges = await this.getBadges();
    const earnedBadges = await db
      .select()
      .from(userBadges)
      .where(eq(userBadges.userId, userId));

    const earnedMap = new Map(earnedBadges.map((b) => [b.badgeId, b]));

    return allBadges.map((badge) => {
      const earned = earnedMap.get(badge.id);
      return {
        ...badge,
        earned: !!earned,
        earnedAt: earned?.earnedAt || undefined,
      };
    });
  }

  async awardBadge(userId: string, badgeId: string): Promise<void> {
    const existing = await db
      .select()
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), eq(userBadges.badgeId, badgeId)));

    if (existing.length === 0) {
      await db.insert(userBadges).values({ userId, badgeId });
      
      // Award XP for badge
      const [badge] = await db.select().from(badges).where(eq(badges.id, badgeId));
      if (badge && badge.xpReward) {
        await this.updateUserXP(userId, badge.xpReward);
      }
    }
  }

  async checkAndAwardBadges(userId: string): Promise<void> {
    const stats = await this.getUserStats(userId);
    const allBadges = await this.getBadges();

    for (const badge of allBadges) {
      let shouldAward = false;

      switch (badge.requirement) {
        case "problems_solved":
          shouldAward = stats.totalSolved >= badge.threshold;
          break;
        case "streak_days":
          shouldAward = stats.currentStreak >= badge.threshold;
          break;
        case "topics_completed":
          const completedTopics = stats.topicProgress.filter((t) => t.progress === 100).length;
          shouldAward = completedTopics >= badge.threshold;
          break;
        case "patterns_mastered":
          const masteredPatterns = stats.patternProgress.filter((p) => p.masteryScore >= 80).length;
          shouldAward = masteredPatterns >= badge.threshold;
          break;
        case "xp_earned":
          shouldAward = stats.xp >= badge.threshold;
          break;
      }

      if (shouldAward) {
        await this.awardBadge(userId, badge.id);
      }
    }
  }

  // Daily Activity
  async getDailyActivity(userId: string, days = 91): Promise<DailyActivity[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db
      .select()
      .from(dailyActivity)
      .where(and(eq(dailyActivity.userId, userId), sql`${dailyActivity.date} >= ${startDate}`))
      .orderBy(desc(dailyActivity.date));
  }

  async recordDailyActivity(userId: string): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [existing] = await db
      .select()
      .from(dailyActivity)
      .where(and(eq(dailyActivity.userId, userId), eq(dailyActivity.date, today)));

    if (existing) {
      await db
        .update(dailyActivity)
        .set({
          problemsSolved: (existing.problemsSolved || 0) + 1,
          xpEarned: (existing.xpEarned || 0) + 10,
        })
        .where(eq(dailyActivity.id, existing.id));
    } else {
      await db.insert(dailyActivity).values({
        userId,
        date: today,
        problemsSolved: 1,
        xpEarned: 10,
      });
    }
  }

  // User Stats
  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.getUser(userId);
    const topicProgress = await this.getTopicsWithProgress(userId);
    const patternProgress = await this.getPatternsWithProgress(userId);
    const recentActivity = await this.getDailyActivity(userId, 91);
    const badgesList = await this.getUserBadges(userId);

    const allProgress = await db
      .select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.completed, true)));

    return {
      totalSolved: allProgress.length,
      currentStreak: user?.currentStreak || 0,
      longestStreak: user?.longestStreak || 0,
      xp: user?.xp || 0,
      level: user?.level || 1,
      topicProgress,
      patternProgress,
      recentActivity,
      badges: badgesList,
    };
  }
}

export const storage = new DatabaseStorage();

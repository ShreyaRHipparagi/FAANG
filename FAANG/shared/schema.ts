import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  xp: integer("xp").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  currentStreak: integer("current_streak").default(0).notNull(),
  longestStreak: integer("longest_streak").default(0).notNull(),
  lastActiveDate: timestamp("last_active_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Topics (e.g., Arrays, Graphs, DP)
export const topics = pgTable("topics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  order: integer("order").default(0).notNull(),
  problemCount: integer("problem_count").default(0).notNull(),
});

// Subtopics (e.g., Easy, Medium, Hard array problems)
export const subtopics = pgTable("subtopics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  order: integer("order").default(0).notNull(),
  problemCount: integer("problem_count").default(0).notNull(),
});

// Patterns (e.g., Sliding Window, Two Pointers)
export const patterns = pgTable("patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  problemCount: integer("problem_count").default(0).notNull(),
});

// Problems
export const problems = pgTable("problems", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  difficulty: varchar("difficulty", { length: 20 }).notNull(), // Easy, Medium, Hard
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  subtopicId: varchar("subtopic_id").references(() => subtopics.id),
  patternId: varchar("pattern_id").references(() => patterns.id),
  externalUrl: text("external_url"),
  platform: varchar("platform", { length: 50 }), // LeetCode, Codeforces, etc.
  tags: text("tags").array(),
  order: integer("order").default(0).notNull(),
});

// User Progress on Problems
export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  problemId: varchar("problem_id").notNull().references(() => problems.id),
  completed: boolean("completed").default(false).notNull(),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
});

// User Topic Progress (cached aggregations)
export const userTopicProgress = pgTable("user_topic_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  topicId: varchar("topic_id").notNull().references(() => topics.id),
  completedCount: integer("completed_count").default(0).notNull(),
  totalCount: integer("total_count").default(0).notNull(),
});

// User Pattern Progress (cached aggregations)
export const userPatternProgress = pgTable("user_pattern_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  patternId: varchar("pattern_id").notNull().references(() => patterns.id),
  completedCount: integer("completed_count").default(0).notNull(),
  totalCount: integer("total_count").default(0).notNull(),
  masteryScore: integer("mastery_score").default(0).notNull(), // 0-100
});

// Badges/Achievements
export const badges = pgTable("badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  xpReward: integer("xp_reward").default(0).notNull(),
  requirement: varchar("requirement", { length: 50 }).notNull(), // Type of requirement
  threshold: integer("threshold").default(1).notNull(), // Value to unlock
});

// User Badges (earned badges)
export const userBadges = pgTable("user_badges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  badgeId: varchar("badge_id").notNull().references(() => badges.id),
  earnedAt: timestamp("earned_at").defaultNow(),
});

// Daily Activity (for streak tracking and activity chart)
export const dailyActivity = pgTable("daily_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  problemsSolved: integer("problems_solved").default(0).notNull(),
  xpEarned: integer("xp_earned").default(0).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  topicProgress: many(userTopicProgress),
  patternProgress: many(userPatternProgress),
  badges: many(userBadges),
  dailyActivity: many(dailyActivity),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  subtopics: many(subtopics),
  problems: many(problems),
}));

export const subtopicsRelations = relations(subtopics, ({ one, many }) => ({
  topic: one(topics, {
    fields: [subtopics.topicId],
    references: [topics.id],
  }),
  problems: many(problems),
}));

export const patternsRelations = relations(patterns, ({ many }) => ({
  problems: many(problems),
}));

export const problemsRelations = relations(problems, ({ one }) => ({
  topic: one(topics, {
    fields: [problems.topicId],
    references: [topics.id],
  }),
  subtopic: one(subtopics, {
    fields: [problems.subtopicId],
    references: [subtopics.id],
  }),
  pattern: one(patterns, {
    fields: [problems.patternId],
    references: [patterns.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  problem: one(problems, {
    fields: [userProgress.problemId],
    references: [problems.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertTopicSchema = createInsertSchema(topics).omit({ id: true });
export const insertSubtopicSchema = createInsertSchema(subtopics).omit({ id: true });
export const insertPatternSchema = createInsertSchema(patterns).omit({ id: true });
export const insertProblemSchema = createInsertSchema(problems).omit({ id: true });
export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ id: true });
export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true });
export const insertDailyActivitySchema = createInsertSchema(dailyActivity).omit({ id: true });

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;
export type Subtopic = typeof subtopics.$inferSelect;
export type InsertSubtopic = z.infer<typeof insertSubtopicSchema>;
export type Pattern = typeof patterns.$inferSelect;
export type InsertPattern = z.infer<typeof insertPatternSchema>;
export type Problem = typeof problems.$inferSelect;
export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserTopicProgress = typeof userTopicProgress.$inferSelect;
export type UserPatternProgress = typeof userPatternProgress.$inferSelect;
export type Badge = typeof badges.$inferSelect;
export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;
export type DailyActivity = typeof dailyActivity.$inferSelect;

// Extended types for frontend use
export type ProblemWithDetails = Problem & {
  topic?: Topic;
  subtopic?: Subtopic;
  pattern?: Pattern;
  isCompleted?: boolean;
};

export type TopicWithProgress = Topic & {
  completedCount: number;
  progress: number;
  subtopics?: SubtopicWithProgress[];
};

export type SubtopicWithProgress = Subtopic & {
  completedCount: number;
  progress: number;
  problems?: ProblemWithDetails[];
};

export type PatternWithProgress = Pattern & {
  completedCount: number;
  progress: number;
  masteryScore: number;
};

export type UserStats = {
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
  xp: number;
  level: number;
  topicProgress: TopicWithProgress[];
  patternProgress: PatternWithProgress[];
  recentActivity: DailyActivity[];
  badges: (Badge & { earned: boolean; earnedAt?: Date })[];
};

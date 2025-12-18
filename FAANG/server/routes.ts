import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User Stats
  app.get("/api/user/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Topics
  app.get("/api/topics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const topics = await storage.getTopicsWithProgress(userId);
      res.json(topics);
    } catch (error) {
      console.error("Error fetching topics:", error);
      res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  // Problems
  app.get("/api/problems", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const problems = await storage.getProblemsWithDetails(userId);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  app.get("/api/problems/recommended", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 5;
      const problems = await storage.getRecommendedProblems(userId, limit);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching recommended problems:", error);
      res.status(500).json({ message: "Failed to fetch recommended problems" });
    }
  });

  // Patterns
  app.get("/api/patterns", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const patterns = await storage.getPatternsWithProgress(userId);
      res.json(patterns);
    } catch (error) {
      console.error("Error fetching patterns:", error);
      res.status(500).json({ message: "Failed to fetch patterns" });
    }
  });

  app.get("/api/patterns/:patternId/problems", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { patternId } = req.params;
      const problems = await storage.getProblemsByPattern(patternId, userId);
      res.json(problems);
    } catch (error) {
      console.error("Error fetching pattern problems:", error);
      res.status(500).json({ message: "Failed to fetch pattern problems" });
    }
  });

  // Progress
  app.post("/api/progress/:problemId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { problemId } = req.params;
      const { completed } = req.body;

      await storage.toggleProblemProgress(userId, problemId, completed);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Failed to update progress" });
    }
  });

  // Badges
  app.get("/api/badges", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const badges = await storage.getUserBadges(userId);
      res.json(badges);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Failed to fetch badges" });
    }
  });

  // Daily Activity
  app.get("/api/activity", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 91;
      const activity = await storage.getDailyActivity(userId, days);
      res.json(activity);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Failed to fetch activity" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

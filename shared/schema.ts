import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const cultures = pgTable("cultures", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").notNull(),
  flag: text("flag").notNull(),
  imageUrl: text("image_url").notNull(),
  description: text("description").notNull(),
  totalQuestions: integer("total_questions").notNull().default(8),
  estimatedTime: integer("estimated_time").notNull().default(15), // in minutes
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  cultureId: integer("culture_id").notNull(),
  type: text("type").notNull(), // 'trivia', 'visual', 'matching'
  question: text("question").notNull(),
  imageUrl: text("image_url"),
  options: text("options").array().notNull(),
  correctAnswer: text("correct_answer").notNull(),
  culturalFact: text("cultural_fact").notNull(),
  difficulty: integer("difficulty").notNull().default(1), // 1-3
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  cultureId: integer("culture_id").notNull(),
  questionsCompleted: integer("questions_completed").notNull().default(0),
  bestScore: integer("best_score").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  level: text("level").notNull().default("Beginner"), // Beginner, Intermediate, Advanced, Expert
  lastPlayed: text("last_played"),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  points: integer("points").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull(), // e.g., "complete_culture_japanese"
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: text("unlocked_at").notNull(),
});

export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey().default(1),
  totalScore: integer("total_score").notNull().default(0),
  level: integer("level").notNull().default(1),
  culturesExplored: integer("cultures_explored").notNull().default(0),
  challengesCompleted: integer("challenges_completed").notNull().default(0),
  accuracy: integer("accuracy").notNull().default(0), // percentage
  streak: integer("streak").notNull().default(0),
});

export const insertCultureSchema = createInsertSchema(cultures).omit({
  id: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
});

export const insertGameStatsSchema = createInsertSchema(gameStats).omit({
  id: true,
});

export type Culture = typeof cultures.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type UserProgress = typeof userProgress.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;

export type InsertCulture = z.infer<typeof insertCultureSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;

// Quiz session types
export type QuizSession = {
  cultureId: number;
  cultureName: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  startTime: number;
  answers: { questionId: number; answer: string; isCorrect: boolean; timeSpent: number }[];
};

export type QuizResult = {
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  pointsEarned: number;
  newAchievements: Achievement[];
  levelUp: boolean;
  newLevel?: string;
};

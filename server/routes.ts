import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import type { QuizResult } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all cultures with user progress
  app.get("/api/cultures", async (req, res) => {
    try {
      const cultures = await storage.getCultures();
      const userProgress = await storage.getUserProgress();
      
      const culturesWithProgress = cultures.map(culture => {
        const progress = userProgress.find(p => p.cultureId === culture.id);
        return {
          ...culture,
          progress: progress ? {
            questionsCompleted: progress.questionsCompleted,
            totalQuestions: culture.totalQuestions,
            bestScore: progress.bestScore,
            level: progress.level,
            progressPercent: Math.round((progress.questionsCompleted / culture.totalQuestions) * 100)
          } : {
            questionsCompleted: 0,
            totalQuestions: culture.totalQuestions,
            bestScore: 0,
            level: "Beginner",
            progressPercent: 0
          }
        };
      });

      res.json(culturesWithProgress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cultures" });
    }
  });

  // Get culture by ID
  app.get("/api/cultures/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const culture = await storage.getCulture(id);
      
      if (!culture) {
        return res.status(404).json({ message: "Culture not found" });
      }

      res.json(culture);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch culture" });
    }
  });

  // Start quiz - get random questions for a culture
  app.get("/api/quiz/:cultureId", async (req, res) => {
    try {
      const cultureId = parseInt(req.params.cultureId);
      const count = parseInt(req.query.count as string) || 5;
      
      const culture = await storage.getCulture(cultureId);
      if (!culture) {
        return res.status(404).json({ message: "Culture not found" });
      }

      const questions = await storage.getRandomQuestions(cultureId, count);
      
      res.json({
        culture,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question,
          imageUrl: q.imageUrl,
          options: q.options,
          difficulty: q.difficulty
        })) // Don't send correct answers or cultural facts until submission
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to start quiz" });
    }
  });

  // Submit quiz results
  const submitQuizSchema = z.object({
    cultureId: z.number(),
    answers: z.array(z.object({
      questionId: z.number(),
      answer: z.string(),
      timeSpent: z.number()
    })),
    totalTime: z.number()
  });

  app.post("/api/quiz/submit", async (req, res) => {
    try {
      const { cultureId, answers, totalTime } = submitQuizSchema.parse(req.body);
      
      // Get all questions for validation
      const allQuestions = await storage.getQuestionsByCulture(cultureId);
      const questionMap = new Map(allQuestions.map(q => [q.id, q]));
      
      // Calculate results
      let correctAnswers = 0;
      const detailedAnswers = answers.map(answer => {
        const question = questionMap.get(answer.questionId);
        if (!question) {
          throw new Error(`Question ${answer.questionId} not found`);
        }
        
        const isCorrect = answer.answer === question.correctAnswer;
        if (isCorrect) correctAnswers++;
        
        return {
          questionId: answer.questionId,
          question: question.question,
          userAnswer: answer.answer,
          correctAnswer: question.correctAnswer,
          isCorrect,
          timeSpent: answer.timeSpent,
          culturalFact: question.culturalFact,
          imageUrl: question.imageUrl
        };
      });

      const accuracy = Math.round((correctAnswers / answers.length) * 100);
      const basePoints = correctAnswers * 100;
      const timeBonus = totalTime < 300 ? 100 : totalTime < 600 ? 50 : 0; // Bonus for completing under 5/10 minutes
      const accuracyBonus = accuracy === 100 ? 200 : accuracy >= 80 ? 100 : 0;
      const pointsEarned = basePoints + timeBonus + accuracyBonus;

      const quizResult: QuizResult & { cultureId: number } = {
        cultureId,
        totalScore: pointsEarned,
        correctAnswers,
        totalQuestions: answers.length,
        accuracy,
        timeSpent: totalTime,
        pointsEarned,
        newAchievements: [],
        levelUp: false
      };

      // Submit results and update progress
      const result = await storage.submitQuizResult(quizResult);
      
      res.json({
        ...quizResult,
        detailedAnswers,
        newAchievements: result.newAchievements,
        levelUp: result.updatedProgress.level !== (await storage.getUserProgressByCulture(cultureId))?.level,
        newLevel: result.updatedProgress.level,
        updatedStats: result.updatedStats
      });
    } catch (error) {
      console.error("Quiz submission error:", error);
      res.status(500).json({ message: "Failed to submit quiz results" });
    }
  });

  // Get game statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getGameStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch game statistics" });
    }
  });

  // Get achievements
  app.get("/api/achievements", async (req, res) => {
    try {
      const achievements = await storage.getAchievements();
      const userAchievements = await storage.getUserAchievements();
      
      const achievementsWithStatus = achievements.map(achievement => ({
        ...achievement,
        unlocked: userAchievements.some(ua => ua.achievementId === achievement.id),
        unlockedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.unlockedAt
      }));

      res.json(achievementsWithStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}

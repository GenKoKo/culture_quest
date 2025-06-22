import { 
  cultures, questions, userProgress, achievements, userAchievements, gameStats,
  type Culture, type Question, type UserProgress, type Achievement, 
  type UserAchievement, type GameStats, type InsertCulture, type InsertQuestion,
  type InsertUserProgress, type InsertAchievement, type InsertUserAchievement,
  type InsertGameStats, type QuizSession, type QuizResult
} from "@shared/schema";

export interface IStorage {
  // Cultures
  getCultures(): Promise<Culture[]>;
  getCulture(id: number): Promise<Culture | undefined>;
  createCulture(culture: InsertCulture): Promise<Culture>;

  // Questions
  getQuestionsByCulture(cultureId: number): Promise<Question[]>;
  getRandomQuestions(cultureId: number, count: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;

  // User Progress
  getUserProgress(): Promise<UserProgress[]>;
  getUserProgressByCulture(cultureId: number): Promise<UserProgress | undefined>;
  updateUserProgress(cultureId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress>;

  // Achievements
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(): Promise<UserAchievement[]>;
  unlockAchievement(achievementId: number): Promise<UserAchievement>;
  checkAchievements(stats: GameStats, progress: UserProgress[]): Promise<Achievement[]>;

  // Game Stats
  getGameStats(): Promise<GameStats>;
  updateGameStats(stats: Partial<InsertGameStats>): Promise<GameStats>;

  // Quiz Management
  submitQuizResult(result: QuizResult & { cultureId: number }): Promise<{ 
    updatedProgress: UserProgress;
    updatedStats: GameStats;
    newAchievements: Achievement[];
  }>;
}

export class MemStorage implements IStorage {
  private cultures: Map<number, Culture>;
  private questions: Map<number, Question>;
  private userProgress: Map<number, UserProgress>;
  private achievements: Map<number, Achievement>;
  private userAchievements: Map<number, UserAchievement>;
  private gameStats: GameStats;
  private currentId: number;

  constructor() {
    this.cultures = new Map();
    this.questions = new Map();
    this.userProgress = new Map();
    this.achievements = new Map();
    this.userAchievements = new Map();
    this.currentId = 1;
    
    this.gameStats = {
      id: 1,
      totalScore: 1247,
      level: 3,
      culturesExplored: 5,
      challengesCompleted: 24,
      accuracy: 87,
      streak: 12
    };

    this.initializeData();
  }

  private initializeData() {
    // Initialize cultures
    const culturesData: InsertCulture[] = [
      {
        name: "Japanese",
        country: "Japan",
        flag: "🇯🇵",
        imageUrl: "https://images.unsplash.com/photo-1528164344705-47542687000d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        description: "Explore traditions, cuisine, festivals, and modern culture of Japan",
        totalQuestions: 8,
        estimatedTime: 15
      },
      {
        name: "Indian",
        country: "India", 
        flag: "🇮🇳",
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        description: "Discover diverse traditions, languages, festivals, and rich heritage",
        totalQuestions: 8,
        estimatedTime: 18
      },
      {
        name: "Brazilian",
        country: "Brazil",
        flag: "🇧🇷", 
        imageUrl: "https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        description: "Experience carnival, music, dance, cuisine, and vibrant lifestyle",
        totalQuestions: 8,
        estimatedTime: 12
      },
      {
        name: "Egyptian",
        country: "Egypt",
        flag: "🇪🇬",
        imageUrl: "https://images.unsplash.com/photo-1568322445389-f64ac2515020?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        description: "Uncover ancient history, pharaohs, pyramids, and modern Egypt",
        totalQuestions: 8,
        estimatedTime: 20
      },
      {
        name: "Chinese",
        country: "China",
        flag: "🇨🇳",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        description: "Learn about dynasties, philosophy, arts, cuisine, and traditions",
        totalQuestions: 8,
        estimatedTime: 16
      },
      {
        name: "Mexican",
        country: "Mexico",
        flag: "🇲🇽",
        imageUrl: "https://images.unsplash.com/photo-1518638150340-f706e86654de?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
        description: "Explore festivals, cuisine, art, history, and vibrant traditions",
        totalQuestions: 8,
        estimatedTime: 14
      }
    ];

    culturesData.forEach(culture => {
      const id = this.currentId++;
      this.cultures.set(id, { 
        id, 
        ...culture,
        totalQuestions: culture.totalQuestions || 8,
        estimatedTime: culture.estimatedTime || 15
      });
    });

    // Initialize user progress
    const progressData = [
      { cultureId: 1, questionsCompleted: 3, bestScore: 485, totalPoints: 485, level: "Intermediate" },
      { cultureId: 2, questionsCompleted: 5, bestScore: 672, totalPoints: 672, level: "Advanced" },
      { cultureId: 3, questionsCompleted: 2, bestScore: 298, totalPoints: 298, level: "Beginner" },
      { cultureId: 4, questionsCompleted: 6, bestScore: 789, totalPoints: 789, level: "Expert" },
      { cultureId: 5, questionsCompleted: 4, bestScore: 521, totalPoints: 521, level: "Intermediate" },
      { cultureId: 6, questionsCompleted: 1, bestScore: 156, totalPoints: 156, level: "Beginner" }
    ];

    progressData.forEach(progress => {
      this.userProgress.set(progress.cultureId, { id: progress.cultureId, ...progress, lastPlayed: new Date().toISOString() });
    });

    // Initialize questions
    this.initializeQuestions();

    // Initialize achievements
    this.initializeAchievements();
  }

  private initializeQuestions() {
    const questionsData: InsertQuestion[] = [
      // Japanese Culture Questions
      {
        cultureId: 1,
        type: "visual",
        question: "Which traditional Japanese art form is shown in this image?",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        options: ["Origami (Paper Folding)", "Ikebana (Flower Arranging)", "Shodō (Calligraphy)", "Raku (Pottery)"],
        correctAnswer: "Origami (Paper Folding)",
        culturalFact: "Origami, meaning 'folding paper,' is a traditional Japanese art form that transforms flat sheets of paper into beautiful sculptures without cuts or glue. The practice dates back to the 6th century and teaches patience, precision, and creativity.",
        difficulty: 1
      },
      {
        cultureId: 1,
        type: "trivia",
        question: "What is the traditional Japanese tea ceremony called?",
        options: ["Chanoyu", "Sushi", "Kabuki", "Haiku"],
        correctAnswer: "Chanoyu",
        culturalFact: "Chanoyu, also known as the Way of Tea, is a Japanese cultural activity involving the ceremonial preparation and presentation of matcha tea. It embodies the principles of harmony, respect, purity, and tranquility.",
        difficulty: 2
      },
      {
        cultureId: 1,
        type: "trivia",
        question: "Which Japanese festival celebrates the cherry blossom season?",
        options: ["Hanami", "Obon", "Tanabata", "Shichi-Go-San"],
        correctAnswer: "Hanami",
        culturalFact: "Hanami literally means 'flower viewing' and is the Japanese traditional custom of enjoying the transient beauty of flowers, particularly cherry blossoms. People gather for picnics under blooming sakura trees.",
        difficulty: 1
      },
      {
        cultureId: 1,
        type: "visual",
        question: "What type of traditional Japanese architecture is shown?",
        imageUrl: "https://images.unsplash.com/photo-1480796927426-f609979314bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        options: ["Buddhist Temple", "Shinto Shrine", "Imperial Palace", "Tea House"],
        correctAnswer: "Shinto Shrine",
        culturalFact: "Shinto shrines are sacred spaces in Japanese Shintoism, characterized by their distinctive torii gates, clean architectural lines, and natural settings. They serve as dwelling places for kami (spirits or gods).",
        difficulty: 2
      },

      // Indian Culture Questions
      {
        cultureId: 2,
        type: "visual",
        question: "Which famous Indian monument is shown in this image?",
        imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        options: ["Red Fort", "Taj Mahal", "Hawa Mahal", "Qutub Minar"],
        correctAnswer: "Taj Mahal",
        culturalFact: "The Taj Mahal is a white marble mausoleum built by Mughal emperor Shah Jahan for his wife Mumtaz Mahal. It's considered one of the finest examples of Mughal architecture and is a UNESCO World Heritage Site.",
        difficulty: 1
      },
      {
        cultureId: 2,
        type: "trivia",
        question: "What is the festival of lights called in India?",
        options: ["Holi", "Diwali", "Durga Puja", "Navratri"],
        correctAnswer: "Diwali",
        culturalFact: "Diwali, also known as Deepavali, is the Hindu festival of lights celebrated across India. It symbolizes the victory of light over darkness and good over evil, lasting five days with oil lamps, fireworks, and sweets.",
        difficulty: 1
      },

      // Brazilian Culture Questions
      {
        cultureId: 3,
        type: "trivia",
        question: "What is Brazil's most famous carnival celebration city?",
        options: ["São Paulo", "Rio de Janeiro", "Salvador", "Recife"],
        correctAnswer: "Rio de Janeiro",
        culturalFact: "Rio de Janeiro's Carnival is the world's largest carnival celebration, attracting millions of participants and spectators. It features elaborate parades, samba schools, colorful costumes, and street parties called 'blocos'.",
        difficulty: 1
      },
      {
        cultureId: 3,
        type: "trivia",
        question: "Which dance originated in Brazil?",
        options: ["Tango", "Samba", "Salsa", "Flamenco"],
        correctAnswer: "Samba",
        culturalFact: "Samba is a Brazilian dance and music genre with African and European influences. It became the signature dance of Brazilian Carnival and represents the joyful, rhythmic spirit of Brazilian culture.",
        difficulty: 1
      },

      // Egyptian Culture Questions
      {
        cultureId: 4,
        type: "visual",
        question: "Which ancient Egyptian structure is shown?",
        imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        options: ["Great Pyramid of Giza", "Temple of Karnak", "Abu Simbel", "Valley of the Kings"],
        correctAnswer: "Great Pyramid of Giza",
        culturalFact: "The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex. Built around 2580-2510 BC for Pharaoh Khufu, it was the tallest man-made structure in the world for over 3,800 years.",
        difficulty: 1
      },
      {
        cultureId: 4,
        type: "trivia",
        question: "What was the ancient Egyptian writing system called?",
        options: ["Cuneiform", "Hieroglyphics", "Sanskrit", "Phoenician"],
        correctAnswer: "Hieroglyphics",
        culturalFact: "Egyptian hieroglyphics were a formal writing system used by ancient Egyptians, combining logographic and alphabetic elements. The word 'hieroglyph' comes from Greek meaning 'sacred carving'.",
        difficulty: 2
      },

      // Chinese Culture Questions
      {
        cultureId: 5,
        type: "visual",
        question: "What famous Chinese landmark is shown?",
        imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        options: ["Forbidden City", "Great Wall of China", "Temple of Heaven", "Terracotta Army"],
        correctAnswer: "Great Wall of China",
        culturalFact: "The Great Wall of China is a series of fortifications built to protect Chinese states from northern invasions. Stretching over 13,000 miles, it's one of the most impressive architectural feats in human history.",
        difficulty: 1
      },
      {
        cultureId: 5,
        type: "trivia",
        question: "What is the Chinese New Year also known as?",
        options: ["Dragon Festival", "Spring Festival", "Lantern Festival", "Moon Festival"],
        correctAnswer: "Spring Festival",
        culturalFact: "Chinese New Year, also called Spring Festival, is the most important traditional Chinese holiday. It marks the beginning of the lunar new year and is celebrated with family reunions, fireworks, and red decorations for good luck.",
        difficulty: 1
      },

      // Mexican Culture Questions
      {
        cultureId: 6,
        type: "trivia",
        question: "What is the Day of the Dead called in Spanish?",
        options: ["Cinco de Mayo", "Día de los Muertos", "Las Posadas", "Quinceañera"],
        correctAnswer: "Día de los Muertos",
        culturalFact: "Día de los Muertos (Day of the Dead) is a Mexican holiday celebrating deceased loved ones. Families create altars (ofrendas) with photos, favorite foods, and marigold flowers to welcome spirits back to the world of the living.",
        difficulty: 1
      },
      {
        cultureId: 6,
        type: "trivia",
        question: "Which ancient civilization built the pyramid at Chichen Itza?",
        options: ["Aztecs", "Maya", "Olmecs", "Zapotecs"],
        correctAnswer: "Maya",
        culturalFact: "Chichen Itza was built by the Maya civilization and is one of the New Seven Wonders of the World. The main pyramid, El Castillo, demonstrates the Maya's advanced knowledge of astronomy and mathematics.",
        difficulty: 2
      }
    ];

    questionsData.forEach(question => {
      const id = this.currentId++;
      this.questions.set(id, { 
        id, 
        ...question,
        imageUrl: question.imageUrl || null,
        difficulty: question.difficulty || 1
      });
    });
  }

  private initializeAchievements() {
    const achievementsData: InsertAchievement[] = [
      {
        title: "Cultural Explorer",
        description: "Complete your first cultural challenge",
        points: 100,
        icon: "🌍",
        requirement: "complete_first_challenge"
      },
      {
        title: "Perfect Score",
        description: "Get 100% accuracy on any culture quiz",
        points: 250,
        icon: "🌟",
        requirement: "perfect_score"
      },
      {
        title: "Culture Master",
        description: "Complete all challenges for any culture",
        points: 500,
        icon: "🏆",
        requirement: "complete_culture"
      },
      {
        title: "Global Citizen",
        description: "Explore 5 different cultures",
        points: 750,
        icon: "🌐",
        requirement: "explore_5_cultures"
      },
      {
        title: "Speed Learner",
        description: "Complete a quiz in under 5 minutes",
        points: 200,
        icon: "⚡",
        requirement: "speed_completion"
      }
    ];

    achievementsData.forEach(achievement => {
      const id = this.currentId++;
      this.achievements.set(id, { id, ...achievement });
    });
  }

  async getCultures(): Promise<Culture[]> {
    return Array.from(this.cultures.values());
  }

  async getCulture(id: number): Promise<Culture | undefined> {
    return this.cultures.get(id);
  }

  async createCulture(culture: InsertCulture): Promise<Culture> {
    const id = this.currentId++;
    const newCulture: Culture = { 
      id, 
      ...culture,
      totalQuestions: culture.totalQuestions || 8,
      estimatedTime: culture.estimatedTime || 15
    };
    this.cultures.set(id, newCulture);
    return newCulture;
  }

  async getQuestionsByCulture(cultureId: number): Promise<Question[]> {
    return Array.from(this.questions.values()).filter(q => q.cultureId === cultureId);
  }

  async getRandomQuestions(cultureId: number, count: number): Promise<Question[]> {
    const cultureQuestions = await this.getQuestionsByCulture(cultureId);
    const shuffled = [...cultureQuestions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.currentId++;
    const newQuestion: Question = { 
      id, 
      ...question,
      imageUrl: question.imageUrl || null,
      difficulty: question.difficulty || 1
    };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async getUserProgress(): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values());
  }

  async getUserProgressByCulture(cultureId: number): Promise<UserProgress | undefined> {
    return this.userProgress.get(cultureId);
  }

  async updateUserProgress(cultureId: number, progress: Partial<InsertUserProgress>): Promise<UserProgress> {
    const existing = this.userProgress.get(cultureId);
    const updated = { 
      id: cultureId,
      cultureId,
      questionsCompleted: 0,
      bestScore: 0,
      totalPoints: 0,
      level: "Beginner" as const,
      lastPlayed: new Date().toISOString(),
      ...existing,
      ...progress
    };
    this.userProgress.set(cultureId, updated);
    return updated;
  }

  async getAchievements(): Promise<Achievement[]> {
    return Array.from(this.achievements.values());
  }

  async getUserAchievements(): Promise<UserAchievement[]> {
    return Array.from(this.userAchievements.values());
  }

  async unlockAchievement(achievementId: number): Promise<UserAchievement> {
    const id = this.currentId++;
    const userAchievement: UserAchievement = {
      id,
      achievementId,
      unlockedAt: new Date().toISOString()
    };
    this.userAchievements.set(id, userAchievement);
    return userAchievement;
  }

  async checkAchievements(stats: GameStats, progress: UserProgress[]): Promise<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const unlockedAchievementIds = new Set(Array.from(this.userAchievements.values()).map(ua => ua.achievementId));

    for (const achievement of Array.from(this.achievements.values())) {
      if (unlockedAchievementIds.has(achievement.id)) continue;

      let shouldUnlock = false;
      switch (achievement.requirement) {
        case "complete_first_challenge":
          shouldUnlock = stats.challengesCompleted >= 1;
          break;
        case "perfect_score":
          shouldUnlock = stats.accuracy === 100;
          break;
        case "complete_culture":
          shouldUnlock = progress.some(p => p.questionsCompleted >= 8);
          break;
        case "explore_5_cultures":
          shouldUnlock = stats.culturesExplored >= 5;
          break;
        case "speed_completion":
          // This would be checked during quiz submission
          break;
      }

      if (shouldUnlock) {
        await this.unlockAchievement(achievement.id);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  async getGameStats(): Promise<GameStats> {
    return this.gameStats;
  }

  async updateGameStats(stats: Partial<InsertGameStats>): Promise<GameStats> {
    this.gameStats = { ...this.gameStats, ...stats };
    return this.gameStats;
  }

  async submitQuizResult(result: QuizResult & { cultureId: number }): Promise<{
    updatedProgress: UserProgress;
    updatedStats: GameStats;
    newAchievements: Achievement[];
  }> {
    // Update user progress for this culture
    const currentProgress = await this.getUserProgressByCulture(result.cultureId);
    const newQuestionsCompleted = Math.max(currentProgress?.questionsCompleted || 0, result.totalQuestions);
    const newBestScore = Math.max(currentProgress?.bestScore || 0, result.totalScore);
    
    let newLevel = currentProgress?.level || "Beginner";
    if (newQuestionsCompleted >= 8) newLevel = "Expert";
    else if (newQuestionsCompleted >= 6) newLevel = "Advanced";
    else if (newQuestionsCompleted >= 3) newLevel = "Intermediate";

    const updatedProgress = await this.updateUserProgress(result.cultureId, {
      questionsCompleted: newQuestionsCompleted,
      bestScore: newBestScore,
      totalPoints: (currentProgress?.totalPoints || 0) + result.pointsEarned,
      level: newLevel,
      lastPlayed: new Date().toISOString()
    });

    // Update global game stats
    const currentStats = await this.getGameStats();
    const updatedStats = await this.updateGameStats({
      totalScore: currentStats.totalScore + result.pointsEarned,
      challengesCompleted: currentStats.challengesCompleted + 1,
      accuracy: Math.round((currentStats.accuracy * currentStats.challengesCompleted + result.accuracy) / (currentStats.challengesCompleted + 1)),
      culturesExplored: new Set([...Array.from(this.userProgress.keys()), result.cultureId]).size
    });

    // Check for new achievements
    const allProgress = await this.getUserProgress();
    const newAchievements = await this.checkAchievements(updatedStats, allProgress);

    return {
      updatedProgress,
      updatedStats,
      newAchievements
    };
  }
}

export const storage = new MemStorage();

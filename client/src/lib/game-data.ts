// This file contains static game data and utilities for the cultural learning game

export interface CulturalFact {
  category: string;
  fact: string;
  culture: string;
}

export const culturalFacts: CulturalFact[] = [
  {
    category: "Art",
    fact: "Origami, meaning 'folding paper,' is a traditional Japanese art form that transforms flat sheets of paper into beautiful sculptures without cuts or glue. The practice dates back to the 6th century and teaches patience, precision, and creativity.",
    culture: "Japanese"
  },
  {
    category: "Architecture", 
    fact: "The Taj Mahal is a white marble mausoleum built by Mughal emperor Shah Jahan for his wife Mumtaz Mahal. It's considered one of the finest examples of Mughal architecture and is a UNESCO World Heritage Site.",
    culture: "Indian"
  },
  {
    category: "Festivals",
    fact: "Rio de Janeiro's Carnival is the world's largest carnival celebration, attracting millions of participants and spectators. It features elaborate parades, samba schools, colorful costumes, and street parties called 'blocos'.",
    culture: "Brazilian"
  },
  {
    category: "History",
    fact: "The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex. Built around 2580-2510 BC for Pharaoh Khufu, it was the tallest man-made structure in the world for over 3,800 years.",
    culture: "Egyptian"
  },
  {
    category: "Architecture",
    fact: "The Great Wall of China is a series of fortifications built to protect Chinese states from northern invasions. Stretching over 13,000 miles, it's one of the most impressive architectural feats in human history.",
    culture: "Chinese"
  },
  {
    category: "Traditions",
    fact: "Día de los Muertos (Day of the Dead) is a Mexican holiday celebrating deceased loved ones. Families create altars (ofrendas) with photos, favorite foods, and marigold flowers to welcome spirits back to the world of the living.",
    culture: "Mexican"
  }
];

export const difficultyLevels = {
  1: { name: "Beginner", color: "green", points: 100 },
  2: { name: "Intermediate", color: "yellow", points: 150 },
  3: { name: "Advanced", color: "red", points: 200 }
};

export const questionTypes = {
  trivia: { name: "Trivia", icon: "🧠", description: "Test your knowledge" },
  visual: { name: "Visual Recognition", icon: "👀", description: "Identify cultural elements" },
  matching: { name: "Matching", icon: "🔗", description: "Connect related concepts" }
};

export const achievementRequirements = {
  complete_first_challenge: "Complete your first cultural challenge",
  perfect_score: "Get 100% accuracy on any culture quiz",
  complete_culture: "Complete all challenges for any culture",
  explore_5_cultures: "Explore 5 different cultures",
  speed_completion: "Complete a quiz in under 5 minutes"
};

export const levelThresholds = {
  Beginner: { min: 0, max: 2 },
  Intermediate: { min: 3, max: 5 },
  Advanced: { min: 6, max: 7 },
  Expert: { min: 8, max: 8 }
};

export function calculateLevel(questionsCompleted: number): string {
  if (questionsCompleted >= 8) return "Expert";
  if (questionsCompleted >= 6) return "Advanced";
  if (questionsCompleted >= 3) return "Intermediate";
  return "Beginner";
}

export function calculatePoints(correctAnswers: number, totalQuestions: number, timeSpent: number, difficulty: number = 1): number {
  const basePoints = correctAnswers * 100 * difficulty;
  const timeBonus = timeSpent < 300 ? 100 : timeSpent < 600 ? 50 : 0;
  const accuracyBonus = (correctAnswers / totalQuestions) === 1 ? 200 : (correctAnswers / totalQuestions) >= 0.8 ? 100 : 0;
  
  return basePoints + timeBonus + accuracyBonus;
}

export function getRandomCulturalFact(culture?: string): CulturalFact {
  const facts = culture ? culturalFacts.filter(f => f.culture === culture) : culturalFacts;
  return facts[Math.floor(Math.random() * facts.length)];
}

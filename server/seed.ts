import { db } from "./db";
import { cultures, questions, achievements, gameStats } from "@shared/schema";

async function seedDatabase() {
  console.log("Starting database seeding...");

  // Clear existing data
  await db.delete(questions);
  await db.delete(cultures);
  await db.delete(achievements);
  await db.delete(gameStats);

  // Seed cultures
  const culturesData = [
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

  const insertedCultures = await db.insert(cultures).values(culturesData).returning();
  console.log(`Inserted ${insertedCultures.length} cultures`);

  // Seed questions
  const questionsData = [
    // Japanese Culture Questions
    {
      cultureId: insertedCultures[0].id,
      type: "visual",
      question: "Which traditional Japanese art form is shown in this image?",
      imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      options: ["Origami (Paper Folding)", "Ikebana (Flower Arranging)", "Shodō (Calligraphy)", "Raku (Pottery)"],
      correctAnswer: "Origami (Paper Folding)",
      culturalFact: "Origami, meaning 'folding paper,' is a traditional Japanese art form that transforms flat sheets of paper into beautiful sculptures without cuts or glue. The practice dates back to the 6th century and teaches patience, precision, and creativity.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[0].id,
      type: "trivia",
      question: "What is the traditional Japanese tea ceremony called?",
      imageUrl: null,
      options: ["Chanoyu", "Sushi", "Kabuki", "Haiku"],
      correctAnswer: "Chanoyu",
      culturalFact: "Chanoyu, also known as the Way of Tea, is a Japanese cultural activity involving the ceremonial preparation and presentation of matcha tea. It embodies the principles of harmony, respect, purity, and tranquility.",
      difficulty: 2
    },
    {
      cultureId: insertedCultures[0].id,
      type: "trivia",
      question: "Which Japanese festival celebrates the cherry blossom season?",
      imageUrl: null,
      options: ["Hanami", "Obon", "Tanabata", "Shichi-Go-San"],
      correctAnswer: "Hanami",
      culturalFact: "Hanami literally means 'flower viewing' and is the Japanese traditional custom of enjoying the transient beauty of flowers, particularly cherry blossoms. People gather for picnics under blooming sakura trees.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[0].id,
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
      cultureId: insertedCultures[1].id,
      type: "visual",
      question: "Which famous Indian monument is shown in this image?",
      imageUrl: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      options: ["Red Fort", "Taj Mahal", "Hawa Mahal", "Qutub Minar"],
      correctAnswer: "Taj Mahal",
      culturalFact: "The Taj Mahal is a white marble mausoleum built by Mughal emperor Shah Jahan for his wife Mumtaz Mahal. It's considered one of the finest examples of Mughal architecture and is a UNESCO World Heritage Site.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[1].id,
      type: "trivia",
      question: "What is the festival of lights called in India?",
      imageUrl: null,
      options: ["Holi", "Diwali", "Durga Puja", "Navratri"],
      correctAnswer: "Diwali",
      culturalFact: "Diwali, also known as Deepavali, is the Hindu festival of lights celebrated across India. It symbolizes the victory of light over darkness and good over evil, lasting five days with oil lamps, fireworks, and sweets.",
      difficulty: 1
    },

    // Brazilian Culture Questions
    {
      cultureId: insertedCultures[2].id,
      type: "trivia",
      question: "What is Brazil's most famous carnival celebration city?",
      imageUrl: null,
      options: ["São Paulo", "Rio de Janeiro", "Salvador", "Recife"],
      correctAnswer: "Rio de Janeiro",
      culturalFact: "Rio de Janeiro's Carnival is the world's largest carnival celebration, attracting millions of participants and spectators. It features elaborate parades, samba schools, colorful costumes, and street parties called 'blocos'.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[2].id,
      type: "trivia",
      question: "Which dance originated in Brazil?",
      imageUrl: null,
      options: ["Tango", "Samba", "Salsa", "Flamenco"],
      correctAnswer: "Samba",
      culturalFact: "Samba is a Brazilian dance and music genre with African and European influences. It became the signature dance of Brazilian Carnival and represents the joyful, rhythmic spirit of Brazilian culture.",
      difficulty: 1
    },

    // Egyptian Culture Questions
    {
      cultureId: insertedCultures[3].id,
      type: "visual",
      question: "Which ancient Egyptian structure is shown?",
      imageUrl: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      options: ["Great Pyramid of Giza", "Temple of Karnak", "Abu Simbel", "Valley of the Kings"],
      correctAnswer: "Great Pyramid of Giza",
      culturalFact: "The Great Pyramid of Giza is the oldest and largest of the three pyramids in the Giza pyramid complex. Built around 2580-2510 BC for Pharaoh Khufu, it was the tallest man-made structure in the world for over 3,800 years.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[3].id,
      type: "trivia",
      question: "What was the ancient Egyptian writing system called?",
      imageUrl: null,
      options: ["Cuneiform", "Hieroglyphics", "Sanskrit", "Phoenician"],
      correctAnswer: "Hieroglyphics",
      culturalFact: "Egyptian hieroglyphics were a formal writing system used by ancient Egyptians, combining logographic and alphabetic elements. The word 'hieroglyph' comes from Greek meaning 'sacred carving'.",
      difficulty: 2
    },

    // Chinese Culture Questions
    {
      cultureId: insertedCultures[4].id,
      type: "visual",
      question: "What famous Chinese landmark is shown?",
      imageUrl: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
      options: ["Forbidden City", "Great Wall of China", "Temple of Heaven", "Terracotta Army"],
      correctAnswer: "Great Wall of China",
      culturalFact: "The Great Wall of China is a series of fortifications built to protect Chinese states from northern invasions. Stretching over 13,000 miles, it's one of the most impressive architectural feats in human history.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[4].id,
      type: "trivia",
      question: "What is the Chinese New Year also known as?",
      imageUrl: null,
      options: ["Dragon Festival", "Spring Festival", "Lantern Festival", "Moon Festival"],
      correctAnswer: "Spring Festival",
      culturalFact: "Chinese New Year, also called Spring Festival, is the most important traditional Chinese holiday. It marks the beginning of the lunar new year and is celebrated with family reunions, fireworks, and red decorations for good luck.",
      difficulty: 1
    },

    // Mexican Culture Questions
    {
      cultureId: insertedCultures[5].id,
      type: "trivia",
      question: "What is the Day of the Dead called in Spanish?",
      imageUrl: null,
      options: ["Cinco de Mayo", "Día de los Muertos", "Las Posadas", "Quinceañera"],
      correctAnswer: "Día de los Muertos",
      culturalFact: "Día de los Muertos (Day of the Dead) is a Mexican holiday celebrating deceased loved ones. Families create altars (ofrendas) with photos, favorite foods, and marigold flowers to welcome spirits back to the world of the living.",
      difficulty: 1
    },
    {
      cultureId: insertedCultures[5].id,
      type: "trivia",
      question: "Which ancient civilization built the pyramid at Chichen Itza?",
      imageUrl: null,
      options: ["Aztecs", "Maya", "Olmecs", "Zapotecs"],
      correctAnswer: "Maya",
      culturalFact: "Chichen Itza was built by the Maya civilization and is one of the New Seven Wonders of the World. The main pyramid, El Castillo, demonstrates the Maya's advanced knowledge of astronomy and mathematics.",
      difficulty: 2
    }
  ];

  const insertedQuestions = await db.insert(questions).values(questionsData).returning();
  console.log(`Inserted ${insertedQuestions.length} questions`);

  // Seed achievements
  const achievementsData = [
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

  const insertedAchievements = await db.insert(achievements).values(achievementsData).returning();
  console.log(`Inserted ${insertedAchievements.length} achievements`);

  // Seed initial game stats
  await db.insert(gameStats).values({
    totalScore: 0,
    level: 1,
    culturesExplored: 0,
    challengesCompleted: 0,
    accuracy: 0,
    streak: 0
  });
  console.log("Inserted initial game stats");

  console.log("Database seeding completed successfully!");
}

seedDatabase().catch(console.error);
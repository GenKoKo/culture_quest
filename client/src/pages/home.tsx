import { useQuery } from "@tanstack/react-query";
import { Globe, Star, Trophy, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import CultureCard from "@/components/culture-card";
import { useLocation } from "wouter";

interface GameStats {
  totalScore: number;
  level: number;
  culturesExplored: number;
  challengesCompleted: number;
  accuracy: number;
  streak: number;
}

interface CultureWithProgress {
  id: number;
  name: string;
  country: string;
  flag: string;
  imageUrl: string;
  description: string;
  totalQuestions: number;
  estimatedTime: number;
  progress: {
    questionsCompleted: number;
    totalQuestions: number;
    bestScore: number;
    level: string;
    progressPercent: number;
  };
}

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
  });

  const { data: cultures, isLoading: culturesLoading } = useQuery<CultureWithProgress[]>({
    queryKey: ["/api/cultures"],
  });

  const handleSurpriseMe = () => {
    if (cultures && cultures.length > 0) {
      const randomCulture = cultures[Math.floor(Math.random() * cultures.length)];
      setLocation(`/quiz/${randomCulture.id}`);
    }
  };

  if (statsLoading || culturesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="animate-pulse">
          <div className="h-16 bg-white border-b border-gray-200"></div>
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-64 bg-white rounded-2xl mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-white rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Cultural Quest</h1>
                <p className="text-xs text-gray-500">Learn cultures through play</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 bg-accent/10 px-3 py-1.5 rounded-full">
                <Star className="text-accent w-4 h-4" />
                <span className="font-semibold text-accent">{stats?.totalScore.toLocaleString() || 0}</span>
                <span className="text-gray-600 text-sm">points</span>
              </div>
              
              <div className="hidden sm:flex items-center space-x-2 bg-secondary/10 px-3 py-1.5 rounded-full">
                <Trophy className="text-secondary w-4 h-4" />
                <span className="font-semibold text-secondary">Level {stats?.level || 1}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Explore World Cultures
              <span className="text-primary block">Through Play</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Embark on an educational journey across continents. Test your knowledge, discover fascinating facts, and earn points while learning about diverse cultures from around the world.
            </p>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-primary">{stats?.culturesExplored || 0}</div>
                <div className="text-sm text-gray-600">Cultures Explored</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-secondary">{stats?.challengesCompleted || 0}</div>
                <div className="text-sm text-gray-600">Challenges Done</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-accent">{stats?.accuracy || 0}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-cultural-purple">{stats?.streak || 0}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Culture Selection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Choose Your Cultural Adventure</h3>
            <Button 
              variant="ghost" 
              onClick={handleSurpriseMe}
              className="text-primary hover:text-primary/80 font-medium"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Surprise Me
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultures?.map((culture) => (
              <CultureCard key={culture.id} culture={culture} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Globe className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Cultural Quest</h3>
                  <p className="text-sm text-gray-600">Learning cultures through play</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Embark on an educational journey across continents and discover the rich diversity of world cultures through interactive challenges and engaging gameplay.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Cultures</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {cultures?.map(culture => (
                  <li key={culture.id}>
                    <button 
                      onClick={() => setLocation(`/quiz/${culture.id}`)}
                      className="hover:text-primary transition-colors"
                    >
                      {culture.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600">© 2024 Cultural Quest. All rights reserved.</p>
            <p className="text-sm text-gray-600 mt-2 md:mt-0">Made with ❤️ for cultural education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

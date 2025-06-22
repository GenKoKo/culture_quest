import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Globe, Star, Trophy, Shuffle, LogIn, UserPlus, UserCircle, LogOut, Settings, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import CultureCard from "@/components/culture-card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme"; // Import useTheme
import { AuthModal } from "@/components/auth/AuthModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


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
  const { user, logout, isLoading: authLoading } = useAuth();
  const { theme, setTheme, effectiveTheme } = useTheme(); // Use theme context
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');

  const { data: stats, isLoading: statsLoading } = useQuery<GameStats>({
    queryKey: ["/api/stats"],
    // enabled: !!user, // Potentially only fetch stats if user is logged in, or adapt backend
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

  const openAuthModal = (view: 'login' | 'register') => {
    setAuthModalView(view);
    setIsAuthModalOpen(true);
  };

  const getAvatarFallback = () => {
    if (!user) return "CQ";
    return (user.displayName || user.email)?.[0]?.toUpperCase() || "U";
  };

  if (statsLoading || culturesLoading || authLoading) { // Added authLoading
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
    // Apply dark class to the root of home page content based on effectiveTheme
    // Tailwind's `dark:` variants will then apply automatically.
    // The ThemeProvider already handles adding 'dark' or 'light' to `document.documentElement`,
    // so individual components should react to that.
    // The bg-gray-50 and other similar classes will need dark: variants.
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Globe className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Cultural Quest</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Learn cultures through play</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme ({effectiveTheme})</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-2 bg-accent/10 dark:bg-accent/20 px-3 py-1.5 rounded-full">
                    <Star className="text-accent w-4 h-4" />
                    <span className="font-semibold text-accent">{stats?.totalScore?.toLocaleString() || 0}</span>
                    <span className="text-gray-600 dark:text-gray-300 text-sm">points</span>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl || undefined} alt={user.displayName || user.email} />
                          <AvatarFallback>{getAvatarFallback()}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount> {/* Dark mode for dropdown is usually handled by ui component if well-designed */}
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none text-gray-900 dark:text-white">{user.displayName || "User"}</p>
                          <p className="text-xs leading-none text-muted-foreground dark:text-gray-400">
                            {user.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="dark:bg-slate-700"/>
                      <DropdownMenuItem onClick={() => setLocation('/profile')} className="dark:focus:bg-slate-700">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Profile Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={logout} className="dark:focus:bg-slate-700">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => openAuthModal('login')} className="dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Button>
                  <Button onClick={() => openAuthModal('register')} className="dark:bg-primary dark:hover:bg-primary/90">
                    <UserPlus className="mr-2 h-4 w-4" /> Register
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authModalView}
        // AuthModal itself will need dark mode styling internally or via its own components
      />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Explore World Cultures
              <span className="text-primary block">Through Play</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Embark on an educational journey across continents. Test your knowledge, discover fascinating facts, and earn points while learning about diverse cultures from around the world.
            </p>
            
            {/* Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Example of one card, others would follow similar pattern */}
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-primary">{stats?.culturesExplored || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cultures Explored</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-secondary">{stats?.challengesCompleted || 0}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Challenges Done</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-[#9797cf]">{stats?.accuracy || 0}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
                <div className="text-2xl font-bold text-cultural-purple">{stats?.streak || 0}</div> {/* Assuming cultural-purple is defined for dark too or is a color that works */}
                <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Culture Selection */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Choose Your Cultural Adventure</h3>
            <Button 
              variant="ghost" 
              onClick={handleSurpriseMe}
              className="text-primary hover:text-primary/80 font-medium dark:text-primary dark:hover:text-primary/90"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Surprise Me
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cultures?.map((culture) => (
              // CultureCard will need its own internal dark mode styling
              (<CultureCard key={culture.id} culture={culture} />)
            ))}
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Globe className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cultural Quest</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Learning cultures through play</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Embark on an educational journey across continents and discover the rich diversity of world cultures through interactive challenges and engaging gameplay.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Cultures</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {cultures?.map(culture => (
                  <li key={culture.id}>
                    <button 
                      onClick={() => setLocation(`/quiz/${culture.id}`)}
                      className="hover:text-primary dark:hover:text-primary-light transition-colors" // Assuming primary-light for dark theme hover
                    >
                      {culture.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-primary dark:hover:text-primary-light transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary dark:hover:text-primary-light transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary dark:hover:text-primary-light transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary dark:hover:text-primary-light transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 dark:border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 Cultural Quest. All rights reserved.</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 md:mt-0">Made with ❤️ for cultural education</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

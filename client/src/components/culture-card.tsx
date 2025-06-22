import { Clock, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";

interface Culture {
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

interface CultureCardProps {
  culture: Culture;
}

const getCultureColor = (cultureName: string) => {
  const colors = {
    Japanese: "cultural-red",
    Indian: "cultural-orange", 
    Brazilian: "green-500",
    Egyptian: "amber-600",
    Chinese: "cultural-red",
    Mexican: "green-600"
  };
  return colors[cultureName as keyof typeof colors] || "primary";
};

export default function CultureCard({ culture }: CultureCardProps) {
  const [, setLocation] = useLocation();
  
  const colorClass = getCultureColor(culture.name);

  const handleClick = () => {
    setLocation(`/quiz/${culture.id}`);
  };

  return (
    <Card 
      className="culture-card group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-md dark:hover:shadow-slate-700/50 cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          src={culture.imageUrl} 
          alt={`${culture.name} culture`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {culture.flag} {culture.country}
          </span>
        </div>
        {/* Assuming colorClass text (e.g. text-cultural-red) has enough contrast on dark background or is adjusted via its own definition if needed */}
        <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className={`text-sm font-medium text-${colorClass}`}>
            {culture.progress.questionsCompleted}/{culture.progress.totalQuestions} Complete
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{culture.name} Culture</h4>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{culture.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-1">
            <Star className="text-accent w-4 h-4" /> {/* text-accent should use CSS vars for dark mode */}
            <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{culture.progress.bestScore} pts</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="text-gray-400 dark:text-gray-500 w-4 h-4" />
            <span className="text-sm text-gray-500 dark:text-gray-400">~{culture.estimatedTime} min</span>
          </div>
        </div>
        
        {/* Progress component should handle its own dark theming via shadcn/ui conventions */}
        <Progress value={culture.progress.progressPercent} className="mb-3" />
        
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Beginner</span>
          <span>{culture.progress.level}</span>
          <span>Expert</span>
        </div>
      </div>
    </Card>
  );
}

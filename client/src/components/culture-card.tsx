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
      className="culture-card group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          src={culture.imageUrl} 
          alt={`${culture.name} culture`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className="text-sm font-medium text-gray-900">
            {culture.flag} {culture.country}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
          <span className={`text-sm font-medium text-${colorClass}`}>
            {culture.progress.questionsCompleted}/{culture.progress.totalQuestions} Complete
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{culture.name} Culture</h4>
        <p className="text-gray-600 text-sm mb-4">{culture.description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-1">
            <Star className="text-accent w-4 h-4" />
            <span className="text-sm font-medium">{culture.progress.bestScore} pts</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="text-gray-400 w-4 h-4" />
            <span className="text-sm text-gray-500">~{culture.estimatedTime} min</span>
          </div>
        </div>
        
        <Progress value={culture.progress.progressPercent} className="mb-3" />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>Beginner</span>
          <span>{culture.progress.level}</span>
          <span>Expert</span>
        </div>
      </div>
    </Card>
  );
}

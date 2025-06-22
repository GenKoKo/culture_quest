import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Achievement {
  id: number;
  title: string;
  description: string;
  points: number;
  icon: string;
}

interface AchievementModalProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-bounce-gentle">
        <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="text-white text-2xl" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{achievement.title}</h3>
        <p className="text-gray-600 mb-4">{achievement.description}</p>
        <div className="flex justify-center space-x-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">+{achievement.points}</div>
            <div className="text-sm text-gray-600">Points</div>
          </div>
          <div className="text-center">
            <div className="text-2xl">{achievement.icon}</div>
            <div className="text-sm text-gray-600">Achievement</div>
          </div>
        </div>
        <Button
          onClick={onClose}
          className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          Continue Learning
        </Button>
      </div>
    </div>
  );
}

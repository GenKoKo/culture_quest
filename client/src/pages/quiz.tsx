import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest, queryClient } from "@/lib/queryClient";
import QuizInterface from "@/components/quiz-interface";
import AchievementModal from "@/components/achievement-modal";

interface Question {
  id: number;
  type: string;
  question: string;
  imageUrl?: string;
  options: string[];
  difficulty: number;
}

interface Culture {
  id: number;
  name: string;
  country: string;
  flag: string;
  description: string;
}

interface QuizData {
  culture: Culture;
  questions: Question[];
}

interface QuizAnswer {
  questionId: number;
  answer: string;
  timeSpent: number;
}

interface DetailedAnswer {
  questionId: number;
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  culturalFact: string;
  imageUrl?: string;
}

interface QuizResult {
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number;
  timeSpent: number;
  pointsEarned: number;
  detailedAnswers: DetailedAnswer[];
  newAchievements: any[];
  levelUp: boolean;
  newLevel?: string;
}

export default function Quiz() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const cultureId = parseInt(params.cultureId || "0");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizStartTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);

  const { data: quizData, isLoading } = useQuery<QuizData>({
    queryKey: [`/api/quiz/${cultureId}`],
    enabled: !!cultureId,
  });

  const submitQuizMutation = useMutation({
    mutationFn: async (data: { cultureId: number; answers: QuizAnswer[]; totalTime: number }) => {
      const response = await apiRequest("POST", "/api/quiz/submit", data);
      return response.json();
    },
    onSuccess: (result: QuizResult) => {
      setQuizResult(result);
      setShowResult(true);
      if (result.newAchievements.length > 0) {
        setTimeout(() => setShowAchievement(true), 1000);
      }
      queryClient.invalidateQueries({ queryKey: ["/api/cultures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  useEffect(() => {
    if (quizData) {
      setQuestionStartTime(Date.now());
    }
  }, [currentQuestionIndex, quizData]);

  if (isLoading || !quizData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-gray-300 dark:bg-slate-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-300 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const timeSpent = Date.now() - questionStartTime;
    const newAnswer: QuizAnswer = {
      questionId: currentQuestion.id,
      answer: selectedAnswer,
      timeSpent,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    setSelectedAnswer("");

    if (currentQuestionIndex + 1 < quizData.questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed, submit results
      const totalTime = Math.round((Date.now() - quizStartTime) / 1000);
      submitQuizMutation.mutate({
        cultureId,
        answers: updatedAnswers,
        totalTime,
      });
    }
  };

  const handleGoBack = () => {
    setLocation("/");
  };

  const handleNextQuestion = () => {
    if (showResult && quizResult && currentQuestionIndex + 1 < quizResult.detailedAnswers.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer("");
    setScore(0);
    setShowResult(false);
    setQuizResult(null);
    setShowAchievement(false);
    queryClient.invalidateQueries({ queryKey: [`/api/quiz/${cultureId}`] });
  };

  if (showResult && quizResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" onClick={handleGoBack} className="dark:text-gray-300 dark:hover:bg-slate-700">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {quizData.culture.flag} {quizData.culture.name} Culture
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Quiz Results</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-accent/10 dark:bg-accent/20 px-3 py-1.5 rounded-full">
                  <Star className="text-accent w-4 h-4" /> {/* Accent color should be theme aware */}
                  <span className="font-semibold text-accent">{quizResult.totalScore}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 mb-6 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Quiz Complete!</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl">
                <div className="text-2xl font-bold text-primary">{quizResult.totalScore}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Score</div>
              </div>
              <div className="bg-secondary/5 dark:bg-secondary/10 p-4 rounded-xl">
                <div className="text-2xl font-bold text-secondary">{quizResult.correctAnswers}/{quizResult.totalQuestions}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="bg-accent/5 dark:bg-accent/10 p-4 rounded-xl">
                <div className="text-2xl font-bold text-accent">{quizResult.accuracy}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Accuracy</div>
              </div>
              <div className="bg-cultural-purple/5 dark:bg-cultural-purple/10 p-4 rounded-xl"> {/* Assuming cultural-purple is fine on dark */}
                <div className="text-2xl font-bold text-cultural-purple">{Math.round(quizResult.timeSpent / 60)}m</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button onClick={handleRestartQuiz} className="dark:bg-primary dark:hover:bg-primary/90">Try Again</Button>
              <Button variant="outline" onClick={handleGoBack} className="dark:text-white dark:border-slate-600 dark:hover:bg-slate-700">Back to Home</Button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6">
            {quizResult.detailedAnswers.map((answer, index) => (
              <div key={answer.questionId} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Question {index + 1}</h4>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    answer.isCorrect 
                      ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300"
                  }`}>
                    {answer.isCorrect ? "Correct" : "Incorrect"}
                  </div>
                </div>
                
                <p className="text-gray-900 dark:text-gray-100 mb-4">{answer.question}</p>
                
                {answer.imageUrl && (
                  <img 
                    src={answer.imageUrl} 
                    alt="Question" 
                    className="w-full max-w-md mx-auto h-48 object-cover rounded-xl mb-4"
                  />
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Your Answer:</span>
                    <span className={`${answer.isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} font-medium`}>
                      {answer.userAnswer}
                    </span>
                  </div>
                  {!answer.isCorrect && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Correct Answer:</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">{answer.correctAnswer}</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-secondary/5 dark:bg-secondary/10 border border-secondary/20 dark:border-secondary/30 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm">💡</span> {/* Icon might need dark mode adjustment if not visible */}
                    </div>
                    <div>
                      <h5 className="font-semibold text-secondary mb-2">Cultural Insight</h5> {/* Secondary color should be theme aware */}
                      <p className="text-gray-700 dark:text-gray-300">{answer.culturalFact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {showAchievement && quizResult.newAchievements.length > 0 && (
          <AchievementModal
            achievement={quizResult.newAchievements[0]}
            onClose={() => setShowAchievement(false)}
            // AchievementModal needs internal dark mode styling
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={handleGoBack} className="dark:text-gray-300 dark:hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {quizData.culture.flag} {quizData.culture.name} Culture
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Cultural Challenge</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-accent/10 dark:bg-accent/20 px-3 py-1.5 rounded-full">
                <Star className="text-accent w-4 h-4" /> {/* Accent color should be theme aware */}
                <span className="font-semibold text-accent">{score}</span>
              </div>
              
              <div className="flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-full">
                <Clock className="text-primary w-4 h-4" /> {/* Primary color should be theme aware */}
                <span className="font-semibold text-primary">
                  {Math.floor((Date.now() - quizStartTime) / 60000)}:
                  {String(Math.floor(((Date.now() - quizStartTime) % 60000) / 1000)).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {quizData.questions.length}
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">{Math.round(progress)}% Complete</span>
          </div>
          {/* Progress component should handle its own dark theming */}
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Quiz Interface */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* QuizInterface component needs internal dark mode styling */}
        <QuizInterface
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onSubmitAnswer={handleSubmitAnswer}
          isSubmitting={submitQuizMutation.isPending}
        />
      </main>
    </div>
  );
}

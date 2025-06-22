import { Button } from "@/components/ui/button";

interface Question {
  id: number;
  type: string;
  question: string;
  imageUrl?: string;
  options: string[];
  difficulty: number;
}

interface QuizInterfaceProps {
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
  onSubmitAnswer: () => void;
  isSubmitting: boolean;
}

export default function QuizInterface({ 
  question, 
  selectedAnswer, 
  onAnswerSelect, 
  onSubmitAnswer, 
  isSubmitting 
}: QuizInterfaceProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-8">
      <div className="text-center mb-8">
        <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{question.question}</h4>
        
        {question.imageUrl && (
          <div className="max-w-md mx-auto mb-6">
            <img 
              src={question.imageUrl} 
              alt="Quiz question" 
              className="w-full h-64 object-cover rounded-xl shadow-lg"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => onAnswerSelect(option)}
            className={`quiz-option p-4 text-left border-2 rounded-xl transition-all duration-200 group ${
              selectedAnswer === option
                ? "selected border-primary bg-primary/5 dark:bg-primary/20"
                : "border-gray-200 dark:border-slate-600 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/20"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`option-indicator w-6 h-6 rounded-full border-2 transition-colors ${
                selectedAnswer === option
                  ? "border-primary bg-primary"
                  : "border-gray-300 dark:border-slate-500 group-hover:border-primary"
              }`}>
                {selectedAnswer === option && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="text-center">
        <Button
          onClick={onSubmitAnswer}
          disabled={!selectedAnswer || isSubmitting}
          className="bg-primary text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Submitting..." : "Submit Answer"}
        </Button>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { Clock, ThumbsUp, ThumbsDown } from "lucide-react";

export interface Option {
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface Challenge {
  id: number;
  title: string;
  description: string;
  type: "multiple-choice";
  timeLimit: number;
  options: Option[];
}

interface ChallengeCardProps {
  challenge: Challenge;
  onAnswerSubmit: (isCorrect: boolean, questionId: number) => void;
  currentQuestion: number;
  totalQuestions: number;
}

const ChallengeCard = ({ challenge, onAnswerSubmit, currentQuestion, totalQuestions }: ChallengeCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);

  useEffect(() => {
    // Reset state when challenge changes
    setSelectedOption(null);
    setShowExplanation(false);
    setTimeLeft(challenge.timeLimit);
    
    // Start timer countdown
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // If time runs out and no option selected, trigger incorrect answer
          if (selectedOption === null && !showExplanation) {
            setShowExplanation(true);
            return 0;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge.id, challenge.timeLimit]);

  const handleOptionSelect = (index: number) => {
    if (showExplanation) return; // Prevent selection after submission
    
    setSelectedOption(index);
    const correct = challenge.options[index].isCorrect;
    setIsCorrect(correct);
    setShowExplanation(true);
  };

  const handleNext = () => {
    onAnswerSubmit(isCorrect, challenge.id);
  };

  // Calculate time percentage for progress bar
  const timePercentage = (timeLeft / challenge.timeLimit) * 100;

  return (
    <motion.div
      key={challenge.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="card-gradient">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <span className="bg-primary/20 px-2 py-1 rounded text-xs">Question {currentQuestion} of {totalQuestions}</span>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span className={`text-sm ${timeLeft < 5 ? "text-destructive" : ""}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          <CardTitle>{challenge.title}</CardTitle>
          <CardDescription className="text-base">{challenge.description}</CardDescription>
          <Progress 
            value={timePercentage}
            className={`h-1 mt-2 ${timeLeft < 5 ? "bg-destructive" : ""}`}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {challenge.options.map((option, index) => (
              <Button
                key={index}
                variant={selectedOption === index 
                  ? option.isCorrect ? "default" : "destructive" 
                  : selectedOption !== null && option.isCorrect 
                  ? "default" 
                  : "outline"
                }
                className={`justify-start h-auto py-4 px-4 text-left ${
                  selectedOption === null ? "hover:bg-secondary/80" : ""
                }`}
                onClick={() => handleOptionSelect(index)}
                disabled={showExplanation}
              >
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                {option.text}
                {selectedOption === index && option.isCorrect && (
                  <ThumbsUp className="ml-auto h-5 w-5 text-green-500" />
                )}
                {selectedOption === index && !option.isCorrect && (
                  <ThumbsDown className="ml-auto h-5 w-5 text-destructive" />
                )}
              </Button>
            ))}
          </div>

          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <Card className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-destructive"}`}>
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">
                    {isCorrect ? "Correct!" : "Incorrect!"}
                  </h4>
                  <p>
                    {selectedOption !== null 
                      ? challenge.options[selectedOption].explanation 
                      : "Time's up! The correct answer is: " + 
                        challenge.options.find(opt => opt.isCorrect)?.text
                    }
                  </p>
                </CardContent>
              </Card>
              
              <div className="flex justify-end mt-4">
                <Button onClick={handleNext}>
                  Next Question
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;

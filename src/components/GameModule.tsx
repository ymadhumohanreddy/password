import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Award, Play, Trophy, User, RefreshCw, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import ChallengeCard, { Challenge } from "./game/ChallengeCard";
import Leaderboard from "./game/Leaderboard";
import { useToast } from "@/hooks/use-toast";
import { useGameQuestions } from "../hooks/use-game-questions";

type GameView = "intro" | "challenge" | "leaderboard";

const GameModule = () => {
  const { toast } = useToast();
  const [gameView, setGameView] = useState<GameView>("intro");
  const [currentLevel, setCurrentLevel] = useState(0);
  const [score, setScore] = useState(0);
  const [username, setUsername] = useState("");
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Use our custom hook to manage dynamic questions
  const { 
    gameQuestions, 
    generateNewGameQuestions, 
    recordAnsweredQuestion, 
    isLoading 
  } = useGameQuestions();

  useEffect(() => {
    // Try to load username from localStorage
    const savedUsername = localStorage.getItem("password_game_username");
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const startGame = () => {
    if (!username.trim()) {
      toast({
        title: "Username Required",
        description: "Please enter a username to start the game",
        variant: "destructive",
      });
      return;
    }
    
    // Save username to localStorage
    localStorage.setItem("password_game_username", username);
    
    // Generate new questions for this game session
    const newQuestions = generateNewGameQuestions();
    
    // Reset game state
    setCurrentLevel(0);
    setScore(0);
    setGameView("challenge");
    setGameCompleted(false);
    setHasSubmittedScore(false);
  };

  const handleAnswerSubmit = (isCorrect: boolean, questionId: number) => {
    // Record this question as answered
    recordAnsweredQuestion(questionId);
    
    if (isCorrect) {
      // Calculate score based on difficulty and time left
      const currentQuestion = gameQuestions[currentLevel];
      let difficultyMultiplier = 1;
      
      // Apply difficulty multiplier if question has difficulty property
      if ('difficulty' in currentQuestion) {
        const difficulty = (currentQuestion as any).difficulty;
        if (difficulty === 'medium') difficultyMultiplier = 1.5;
        if (difficulty === 'hard') difficultyMultiplier = 2;
      }
      
      const levelScore = Math.round(100 * difficultyMultiplier);
      setScore(prev => prev + levelScore);
      
      toast({
        title: "Correct!",
        description: `+${levelScore} points`,
        variant: "default",
      });
    } else {
      toast({
        title: "Incorrect!",
        description: "No points awarded for this question",
        variant: "destructive",
      });
    }

    // Move to next level or end game
    if (currentLevel < gameQuestions.length - 1) {
      setCurrentLevel(prev => prev + 1);
    } else {
      setGameCompleted(true);
      toast({
        title: "Game Completed!",
        description: `Final score: ${score}`,
      });
    }
  };

  const submitScore = () => {
    // Here we store the score in localStorage via our leaderboard
    const timestamp = new Date().toISOString();
    const newScore = { username, score, date: timestamp };
    
    try {
      // Get existing scores
      const storedScores = localStorage.getItem("password_game_leaderboard");
      let leaderboard = storedScores ? JSON.parse(storedScores) : [];
      
      // Add new score
      leaderboard.push(newScore);
      
      // Sort by score (highest first)
      leaderboard.sort((a: any, b: any) => b.score - a.score);
      
      // Store back to localStorage
      localStorage.setItem("password_game_leaderboard", JSON.stringify(leaderboard));
      
      toast({
        title: "Score Submitted!",
        description: "Your score has been added to the leaderboard",
      });
      
      setHasSubmittedScore(true);
      setGameView("leaderboard");
    } catch (error) {
      console.error("Error saving score:", error);
      toast({
        title: "Error",
        description: "Could not save your score",
        variant: "destructive",
      });
    }
  };

  const progress = ((currentLevel) / (gameQuestions.length || 1)) * 100;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {gameView === "intro" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-6 mb-8 card-gradient">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl text-center">
                Password Security Challenge
              </CardTitle>
              <CardDescription className="text-center text-lg mt-2">
                Test your knowledge about password security and learn how to create stronger passwords!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-secondary/30 p-4 card-hover">
                  <div className="flex flex-col items-center text-center">
                    <Play className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">Dynamic Challenges</h3>
                    <p className="text-sm text-muted-foreground">
                      Face new questions every time you play
                    </p>
                  </div>
                </Card>
                <Card className="bg-secondary/30 p-4 card-hover">
                  <div className="flex flex-col items-center text-center">
                    <Award className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">Earn Points</h3>
                    <p className="text-sm text-muted-foreground">
                      Score higher with harder questions
                    </p>
                  </div>
                </Card>
                <Card className="bg-secondary/30 p-4 card-hover">
                  <div className="flex flex-col items-center text-center">
                    <Trophy className="h-8 w-8 mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">Leaderboard</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare your score with other players
                    </p>
                  </div>
                </Card>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full max-w-md">
                  <label htmlFor="username" className="block text-sm font-medium mb-1">
                    Enter your username:
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 bg-secondary/50 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="YourUsername"
                    maxLength={20}
                  />
                </div>
                
                <Button size="lg" onClick={startGame} className="pulse-animation mt-4">
                  <Play className="mr-2" /> Start Challenge
                </Button>
                
                <Button variant="ghost" onClick={() => setGameView("leaderboard")}>
                  <Trophy className="mr-2" /> View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {gameView === "challenge" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {gameCompleted ? (
            <Card className="p-6 mb-8 card-gradient">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  Challenge Complete!
                </CardTitle>
                <CardDescription className="text-center text-lg">
                  You've finished all challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center">
                  <Trophy className="h-16 w-16 text-yellow-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Final Score: {score}</h3>
                  <p className="text-center mb-6">
                    Great job! You've learned important password security concepts.
                  </p>
                  
                  {!hasSubmittedScore ? (
                    <Button size="lg" onClick={submitScore} className="w-full max-w-xs">
                      Submit Score
                    </Button>
                  ) : (
                    <div className="space-y-4 w-full max-w-xs">
                      <Button variant="outline" onClick={() => setGameView("leaderboard")} className="w-full">
                        <Trophy className="mr-2" /> View Leaderboard
                      </Button>
                      <Button onClick={() => {
                        setGameView("intro");
                        generateNewGameQuestions(); // Pre-generate questions for next game
                      }} className="w-full">
                        <RefreshCw className="mr-2" /> Play Again
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Question: {currentLevel + 1}/{gameQuestions.length}</span>
                  <Progress value={progress} className="h-2 w-40" />
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-primary/20 rounded-md text-sm">
                    Score: <span className="font-bold">{score}</span>
                  </span>
                </div>
              </div>

              {gameQuestions.length > 0 && currentLevel < gameQuestions.length && (
                <ChallengeCard
                  challenge={gameQuestions[currentLevel]}
                  onAnswerSubmit={handleAnswerSubmit}
                  currentQuestion={currentLevel + 1}
                  totalQuestions={gameQuestions.length}
                />
              )}

              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setGameView("intro")}>
                  Exit Challenge
                </Button>
              </div>
            </>
          )}
        </motion.div>
      )}

      {gameView === "leaderboard" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Leaderboard 
            currentUser={username} 
            currentScore={score} 
            onBack={() => setGameView("intro")} 
          />
        </motion.div>
      )}
    </div>
  );
};

export default GameModule;

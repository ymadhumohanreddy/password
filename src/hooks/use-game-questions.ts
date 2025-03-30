import { useState, useEffect } from "react";
import { getProgressiveQuestions, QuestionItem } from "@/data/passwordQuestions";

interface GameQuestionState {
  answeredQuestionIds: number[];
  recentSessions: number[][];
}

const STORAGE_KEY = "password_game_questions";
const MAX_RECENT_SESSIONS = 5;
const QUESTIONS_PER_GAME = 5;

export const useGameQuestions = () => {
  const [gameQuestions, setGameQuestions] = useState<QuestionItem[]>([]);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<number[]>([]);
  const [recentSessions, setRecentSessions] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load question history from localStorage
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        const parsedState: GameQuestionState = JSON.parse(savedState);
        setAnsweredQuestionIds(parsedState.answeredQuestionIds || []);
        setRecentSessions(parsedState.recentSessions || []);
      }
    } catch (error) {
      console.error("Error loading question history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save question history to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        const stateToSave: GameQuestionState = {
          answeredQuestionIds,
          recentSessions
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Error saving question history:", error);
      }
    }
  }, [answeredQuestionIds, recentSessions, isLoading]);

  // Generate new questions for a game session
  const generateNewGameQuestions = () => {
    // Flatten recent sessions to prioritize excluding recently seen questions
    const recentlySeenIds = recentSessions.flat();
    
    // Get new questions, avoiding recently seen ones as much as possible
    const newQuestions = getProgressiveQuestions(QUESTIONS_PER_GAME, recentlySeenIds);
    setGameQuestions(newQuestions);
    
    // Record this new session's question IDs
    const newSessionIds = newQuestions.map(q => q.id);
    setRecentSessions(prev => {
      const updated = [newSessionIds, ...prev];
      // Keep only the most recent sessions
      return updated.slice(0, MAX_RECENT_SESSIONS);
    });
    
    return newQuestions;
  };

  // Record that a question has been answered
  const recordAnsweredQuestion = (questionId: number) => {
    setAnsweredQuestionIds(prev => {
      if (!prev.includes(questionId)) {
        return [...prev, questionId];
      }
      return prev;
    });
  };

  return {
    gameQuestions,
    generateNewGameQuestions,
    recordAnsweredQuestion,
    answeredQuestionIds,
    isLoading
  };
};

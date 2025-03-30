import { useState, useEffect } from "react";

// Question interface
export interface DnaQuestion {
  id: string;
  text: string;
  emoji: string;
}

// Pool of 20 personalized questions
const QUESTION_POOL: DnaQuestion[] = [
  { id: "favorite-character", text: "What's your favorite fictional character?", emoji: "🦸" },
  { id: "childhood-pet", text: "What was the name of your childhood pet?", emoji: "🐕" },
  { id: "dream-destination", text: "What's your dream travel destination?", emoji: "🌴" },
  { id: "first-concert", text: "What was the first concert you attended?", emoji: "🎸" },
  { id: "favorite-food", text: "If you had to eat one food for the rest of your life, what would it be?", emoji: "🍕" },
  { id: "childhood-street", text: "What street did you grow up on?", emoji: "🏠" },
  { id: "first-teacher", text: "What was your first teacher's name?", emoji: "👩‍🏫" },
  { id: "favorite-movie", text: "What's your all-time favorite movie?", emoji: "🎬" },
  { id: "superpower", text: "If you could have any superpower, what would it be?", emoji: "⚡" },
  { id: "first-job", text: "What was your first job?", emoji: "💼" },
  { id: "favorite-book", text: "What's your favorite book?", emoji: "📚" },
  { id: "favorite-color", text: "What's your favorite color?", emoji: "🎨" },
  { id: "hobby", text: "What's a hobby you're passionate about?", emoji: "🏄" },
  { id: "dream-car", text: "What's your dream car?", emoji: "🚗" },
  { id: "favorite-season", text: "What's your favorite season of the year?", emoji: "🍂" },
  { id: "favorite-game", text: "What's your favorite game from childhood?", emoji: "🎮" },
  { id: "best-gift", text: "What's the best gift you've ever received?", emoji: "🎁" },
  { id: "life-motto", text: "Do you have a life motto or favorite quote?", emoji: "💭" },
  { id: "would-visit", text: "If you could visit any historical period, which would it be?", emoji: "⏳" },
  { id: "spirit-animal", text: "What would you consider your spirit animal?", emoji: "🦊" }
];

// Number of questions to ask per session
const QUESTIONS_PER_SESSION = 3;

// LocalStorage key
const STORAGE_KEY = "dna_password_questions";

interface RecentQuestions {
  currentSession: string[];
  previousSessions: string[][];
  lastUpdated: number;
}

export const useDnaQuestions = () => {
  const [questions, setQuestions] = useState<DnaQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  // Load previous question IDs
  const getRecentQuestionsFromStorage = (): RecentQuestions => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading recent questions:", error);
    }
    
    return {
      currentSession: [],
      previousSessions: [],
      lastUpdated: Date.now()
    };
  };

  // Save question IDs to storage
  const saveRecentQuestionsToStorage = (data: RecentQuestions) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Error saving recent questions:", error);
    }
  };

  // Get unique questions that weren't recently used
  const getUniqueQuestions = () => {
    setIsLoadingQuestions(true);
    
    const recentData = getRecentQuestionsFromStorage();
    
    // If it's been more than 24 hours, we reset the history to avoid limiting the pool too much
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - recentData.lastUpdated > oneDayMs) {
      recentData.previousSessions = [];
      recentData.lastUpdated = Date.now();
    }

    // Get all recently used question IDs (flattened)
    const recentlyUsedIds = [
      ...recentData.currentSession,
      ...(recentData.previousSessions.flat())
    ];
    
    // Filter out recently used questions if possible
    let availableQuestions = QUESTION_POOL.filter(q => !recentlyUsedIds.includes(q.id));
    
    // If we don't have enough questions after filtering, use the whole pool except current session
    if (availableQuestions.length < QUESTIONS_PER_SESSION) {
      availableQuestions = QUESTION_POOL.filter(q => !recentData.currentSession.includes(q.id));
    }
    
    // Shuffle available questions
    const shuffledQuestions = [...availableQuestions].sort(() => Math.random() - 0.5);
    
    // Take needed number of questions
    const selectedQuestions = shuffledQuestions.slice(0, QUESTIONS_PER_SESSION);
    
    // If we still don't have enough questions, just take random ones from the pool
    if (selectedQuestions.length < QUESTIONS_PER_SESSION) {
      const remainingNeeded = QUESTIONS_PER_SESSION - selectedQuestions.length;
      const remainingPool = QUESTION_POOL
        .filter(q => !selectedQuestions.some(sq => sq.id === q.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, remainingNeeded);
      
      selectedQuestions.push(...remainingPool);
    }
    
    // Update the storage with new session data
    const newSessionIds = selectedQuestions.map(q => q.id);
    
    // Store current session in previous sessions
    if (recentData.currentSession.length > 0) {
      recentData.previousSessions.unshift(recentData.currentSession);
      
      // Keep only the last 5 sessions
      if (recentData.previousSessions.length > 5) {
        recentData.previousSessions = recentData.previousSessions.slice(0, 5);
      }
    }
    
    // Set new current session
    recentData.currentSession = newSessionIds;
    recentData.lastUpdated = Date.now();
    
    // Save to storage
    saveRecentQuestionsToStorage(recentData);
    
    // Set state and return
    setQuestions(selectedQuestions);
    setIsLoadingQuestions(false);
    return selectedQuestions;
  };

  // Initial load of questions
  useEffect(() => {
    getUniqueQuestions();
  }, []);

  // Refresh questions manually
  const refreshQuestions = () => {
    getUniqueQuestions();
  };

  return {
    questions,
    refreshQuestions,
    isLoadingQuestions
  };
};

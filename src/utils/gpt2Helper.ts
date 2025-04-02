import { useState, useEffect } from 'react';

// Interface for GPT-2 response
export interface GPT2Response {
  text: string;
  isLoading: boolean;
  error: string | null;
}

// Function to simulate GPT-2 generation (we'll use this until we set up actual integration)
export const simulateGPT2Generation = async (
  prompt: string, 
  options: { 
    maxLength?: number; 
    temperature?: number;
    theme?: string;
  } = {}
): Promise<string> => {
  // This is a simulation function - in a real implementation we would call an API
  // or use a library like @huggingface/transformers
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const { maxLength = 50, temperature = 0.7, theme } = options;
  
  // Generate different responses based on prompt and theme
  const themeWords: Record<string, string[]> = {
    music: ['melody', 'rhythm', 'harmony', 'symphony', 'concert', 'piano', 'guitar', 'drums', 'vocalist', 'orchestra'],
    scifi: ['galaxy', 'starship', 'alien', 'future', 'robot', 'planet', 'space', 'technology', 'laser', 'dimensional'],
    fantasy: ['wizard', 'dragon', 'magic', 'kingdom', 'sword', 'spell', 'quest', 'ancient', 'mythical', 'potion'],
    movies: ['cinema', 'actor', 'director', 'scene', 'script', 'camera', 'film', 'Oscar', 'premiere', 'production'],
  };
  
  // Words for different passphrase types
  const commonWords = [
    'apple', 'ocean', 'mountain', 'whisper', 'valley', 'thunder', 
    'galaxy', 'horizon', 'breeze', 'forest', 'river', 'sunlight',
    'melody', 'journey', 'diamond', 'compass', 'garden', 'eagle',
    'rainbow', 'island', 'castle', 'winter', 'summer', 'autumn'
  ];
  
  // Memorable phrases that sound like they're from a language model
  const memorablePhrases = [
    'The dancing elephant knows many secrets',
    'Whisper gently to the midnight stars',
    'Blue oceans hide mysterious treasures',
    'Swift eagles soar beyond mountain peaks',
    'Ancient trees remember forgotten stories',
    'Crystal rivers flow through golden valleys',
    'Velvet shadows hide in corner rooms',
    'Silver moons illuminate secret paths',
  ];
  
  let result = '';
  
  // If theme is provided, use theme-specific words
  if (theme && themeWords[theme]) {
    const words = themeWords[theme];
    // Create a themed phrase using words from the theme
    const numWords = Math.min(4 + Math.floor(Math.random() * 4), maxLength / 6);
    
    for (let i = 0; i < numWords; i++) {
      const word = words[Math.floor(Math.random() * words.length)];
      result += (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word);
      result += Math.random() > 0.7 ? (Math.random() > 0.5 ? '!' : '?') : '';
      result += ' ';
    }
    
    // Add random number for extra security
    if (Math.random() > 0.5) {
      result += Math.floor(Math.random() * 1000);
    }
  } 
  // If prompt includes "memorable" or "pronounceable"
  else if (prompt.includes('memorable') || prompt.includes('pronounceable')) {
    // Use a memorable phrase
    result = memorablePhrases[Math.floor(Math.random() * memorablePhrases.length)];
    
    // Add complexity if temperature is high
    if (temperature > 0.6) {
      result = result.replace(/e/g, '3').replace(/a/g, '@').replace(/s/g, '$');
    }
  }
  // Otherwise, use random words for standard passphrase
  else {
    const numWords = Math.min(3 + Math.floor(Math.random() * 5), maxLength / 7);
    for (let i = 0; i < numWords; i++) {
      const word = commonWords[Math.floor(Math.random() * commonWords.length)];
      const modified = temperature > 0.5 ? 
        word.charAt(0).toUpperCase() + word.slice(1) : 
        word;
      result += modified;
      
      // Add separator based on temperature
      if (i < numWords - 1) {
        result += temperature > 0.7 ? '-' : (temperature > 0.4 ? '_' : ' ');
      }
    }
    
    // Add special chars and numbers for increased entropy
    if (temperature > 0.6) {
      const specialChars = '!@#$%^&*';
      result += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
      result += Math.floor(Math.random() * 100);
    }
  }
  
  return result.trim();
};

// Hook for using GPT-2 in components
export const useGPT2 = () => {
  const [response, setResponse] = useState<GPT2Response>({
    text: '',
    isLoading: false,
    error: null
  });

  const generateText = async (
    prompt: string,
    options: { 
      maxLength?: number; 
      temperature?: number;
      theme?: string;
    } = {}
  ) => {
    try {
      setResponse({ text: '', isLoading: true, error: null });
      const generatedText = await simulateGPT2Generation(prompt, options);
      setResponse({ text: generatedText, isLoading: false, error: null });
      return generatedText;
    } catch (error) {
      console.error('Error generating text with GPT-2:', error);
      setResponse({ 
        text: '', 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
      return '';
    }
  };

  return {
    generateText,
    text: response.text,
    isLoading: response.isLoading,
    error: response.error
  };
};

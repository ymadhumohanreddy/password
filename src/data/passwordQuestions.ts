import { Challenge } from "@/components/game/ChallengeCard";

// Question categories
export type QuestionCategory = 
  | "stronger-password" 
  | "weak-password" 
  | "pattern-recognition" 
  | "cracking-time" 
  | "password-facts" 
  | "best-practices";

// Question difficulty levels
export type DifficultyLevel = "easy" | "medium" | "hard";

// Extended challenge type with metadata
export interface QuestionItem extends Challenge {
  category: QuestionCategory;
  difficulty: DifficultyLevel;
}

// The main question pool
export const questionPool: QuestionItem[] = [
  // Category: Identify the Stronger Password
  {
    id: 101,
    title: "Identify the Stronger Password",
    description: "Which of these passwords would be the most secure?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "stronger-password",
    difficulty: "easy",
    options: [
      { text: "password123", isCorrect: false, explanation: "This is a common password pattern that can be easily guessed." },
      { text: "P@$$w0rd", isCorrect: false, explanation: "Despite the special characters, this is still based on a dictionary word with obvious substitutions." },
      { text: "jK9#mL2&pZ", isCorrect: true, explanation: "This password has high entropy with a mix of random characters." },
      { text: "qwerty12345", isCorrect: false, explanation: "This uses a keyboard pattern which is easily guessable." },
    ],
  },
  {
    id: 102,
    title: "Password Strength Comparison",
    description: "Select the strongest password from the options below:",
    type: "multiple-choice",
    timeLimit: 25,
    category: "stronger-password",
    difficulty: "medium",
    options: [
      { text: "ILoveMyCat2023!", isCorrect: false, explanation: "While it has mixed case, numbers, and special characters, it's based on a common phrase with a predictable pattern." },
      { text: "correcthorsebatterystaple", isCorrect: true, explanation: "This is a strong passphrase. The length and combination of random words gives it high entropy despite not having special characters." },
      { text: "Admin@123", isCorrect: false, explanation: "This is a common pattern used for administrative accounts and is in many password cracking dictionaries." },
      { text: "87654321Aa#", isCorrect: false, explanation: "This contains a sequence of numbers with minimal additional complexity." },
    ],
  },
  
  // Category: Spot the Weak Password
  {
    id: 201,
    title: "Spot the Security Flaw",
    description: "Which of these passwords has the most critical security flaw?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "weak-password",
    difficulty: "easy",
    options: [
      { text: "87Birthday1935", isCorrect: true, explanation: "This contains personal information (birthday) which makes it vulnerable to targeted attacks." },
      { text: "zY7@jK9#mL2&", isCorrect: false, explanation: "This is a strong password with random characters and no personal info." },
      { text: "R4!nd0mW0rd$", isCorrect: false, explanation: "While based on words, the substitutions are not trivial and it has good variety." },
      { text: "9v3!K8p2@L5s", isCorrect: false, explanation: "This password has high entropy and no obvious patterns." },
    ],
  },
  {
    id: 202,
    title: "Most Vulnerable Password",
    description: "Which password is most vulnerable to being cracked?",
    type: "multiple-choice",
    timeLimit: 15,
    category: "weak-password",
    difficulty: "medium",
    options: [
      { text: "CompanyName2023", isCorrect: true, explanation: "This contains context-specific information (company name) with a predictable year pattern." },
      { text: "j7K!9mP#2xZ", isCorrect: false, explanation: "This has high entropy with random characters making it hard to crack." },
      { text: "BlueWhale$wimming", isCorrect: false, explanation: "While it uses words, the combination is random and includes a special character." },
      { text: "9z!Hq2pR4mE", isCorrect: false, explanation: "This random character combination provides good security." },
    ],
  },
  
  // Category: Password Pattern Recognition
  {
    id: 301,
    title: "Password Pattern Analysis",
    description: "Which password pattern is most secure?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "pattern-recognition",
    difficulty: "medium",
    options: [
      { text: "First name + birth year (e.g., John1990)", isCorrect: false, explanation: "Personal information is easily discoverable and makes passwords vulnerable." },
      { text: "Famous quote or lyric with numbers (e.g., ToBeOrNot2Be)", isCorrect: false, explanation: "Common phrases can be targeted in dictionary attacks." },
      { text: "Random words with special characters (e.g., Correct@Horse@Battery@Staple)", isCorrect: true, explanation: "Multiple random words create high entropy and are easier to remember than random characters." },
      { text: "Replacing letters with similar numbers (e.g., P4$$w0rd)", isCorrect: false, explanation: "These substitutions are well-known and checked in password cracking attempts." },
    ],
  },
  {
    id: 302,
    title: "Identify the Pattern",
    description: "Which password pattern would be most resistant to dictionary attacks?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "pattern-recognition",
    difficulty: "hard",
    options: [
      { text: "Words with numbers at the end (e.g., security123)", isCorrect: false, explanation: "This is one of the first patterns tried in dictionary attacks." },
      { text: "Keyboard patterns with special characters (e.g., qwerty!@#)", isCorrect: false, explanation: "Keyboard patterns are well-known and easily cracked." },
      { text: "Interleaved letters and numbers (e.g., a1b2c3d4e5f6)", isCorrect: false, explanation: "While better than appending numbers, this pattern is still predictable." },
      { text: "Unrelated words with symbols between (e.g., table%chair$lamp)", isCorrect: true, explanation: "The combination of unrelated words and symbols creates high entropy and unpredictability." },
    ],
  },
  
  // Category: Password Cracking Time Estimation
  {
    id: 401,
    title: "Password Cracking Time",
    description: "Which password would take the shortest time to crack?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "cracking-time",
    difficulty: "medium",
    options: [
      { text: "Tr0ub4dor&3", isCorrect: false, explanation: "This has moderate strength with character substitutions." },
      { text: "correcthorsebatterystaple", isCorrect: false, explanation: "While it uses only lowercase letters, its length gives it substantial strength." },
      { text: "p@$$w0rd!", isCorrect: true, explanation: "Despite special characters, this is based on a common password with simple substitutions." },
      { text: "j7K!9mP#2xZ", isCorrect: false, explanation: "This has high entropy with random characters making it hard to crack." },
    ],
  },
  {
    id: 402,
    title: "Cracking Speed Analysis",
    description: "Which password would resist a high-speed GPU cracking attempt the longest?",
    type: "multiple-choice",
    timeLimit: 30,
    category: "cracking-time",
    difficulty: "hard",
    options: [
      { text: "A 12-character password with letters, numbers, and symbols", isCorrect: false, explanation: "While strong, this has less total entropy than longer alternatives." },
      { text: "A 20-character password with only lowercase letters", isCorrect: true, explanation: "The length provides more entropy than a shorter password with more character types. Password length is generally more important than complexity." },
      { text: "An 8-character password with uncommon Unicode symbols", isCorrect: false, explanation: "Despite the uncommon symbols, the short length makes it vulnerable." },
      { text: "A 10-character password with uppercase, lowercase, and numbers", isCorrect: false, explanation: "This has good complexity but lacks the entropy of longer passwords." },
    ],
  },
  
  // Category: Password Facts (True or False)
  {
    id: 501,
    title: "Password Security Fact Check",
    description: "Which statement about password security is TRUE?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "password-facts",
    difficulty: "easy",
    options: [
      { text: "Changing your password every 30 days always improves security", isCorrect: false, explanation: "Frequent mandatory changes often lead to weaker passwords or incremental changes that are easy to predict." },
      { text: "A password with special characters is always more secure than one without", isCorrect: false, explanation: "A long password without special characters can be more secure than a short password with special characters." },
      { text: "Password managers are generally more secure than memorizing passwords", isCorrect: true, explanation: "Password managers allow for unique, strong passwords for each site without memorization burden." },
      { text: "Most password breaches occur through brute force attacks", isCorrect: false, explanation: "Most breaches occur through phishing, social engineering, or using passwords leaked from other sites." },
    ],
  },
  {
    id: 502,
    title: "Password Myths",
    description: "Which of these password security claims is FALSE?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "password-facts",
    difficulty: "medium",
    options: [
      { text: "Two-factor authentication can protect against some password breaches", isCorrect: false, explanation: "This is true - 2FA adds an additional security layer beyond passwords." },
      { text: "Writing down passwords is always bad security practice", isCorrect: true, explanation: "This is false - in some cases, writing down complex passwords and storing them securely can be better than using simple, memorable passwords." },
      { text: "Using the same password on multiple sites increases risk", isCorrect: false, explanation: "This is true - password reuse means one breach can compromise multiple accounts." },
      { text: "Longer passwords are generally more secure than shorter ones", isCorrect: false, explanation: "This is true - password length is one of the most important factors in password strength." },
    ],
  },
  
  // Category: Best Practices
  {
    id: 601,
    title: "Security Best Practice",
    description: "Which of these is the best password security practice?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "best-practices",
    difficulty: "easy",
    options: [
      { text: "Change your password every day", isCorrect: false, explanation: "Changing too frequently can lead to weaker passwords as users opt for simpler options." },
      { text: "Use the same strong password for all accounts", isCorrect: false, explanation: "If one service is compromised, all your accounts would be vulnerable." },
      { text: "Write down passwords on paper", isCorrect: false, explanation: "Physical records can be lost or stolen." },
      { text: "Use a password manager with unique passwords", isCorrect: true, explanation: "Password managers allow you to use unique strong passwords for each service without memorizing them." },
    ],
  },
  {
    id: 602,
    title: "Password Recovery",
    description: "What is the most secure approach to password recovery?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "best-practices",
    difficulty: "medium",
    options: [
      { text: "Using your mother's maiden name as a security question", isCorrect: false, explanation: "Personal information that can be found through social media or public records is not secure." },
      { text: "Setting up two-factor authentication", isCorrect: true, explanation: "2FA provides a secure secondary verification channel that's more resistant to compromises." },
      { text: "Using the same recovery email for all your accounts", isCorrect: false, explanation: "If that email is compromised, all accounts become vulnerable." },
      { text: "Storing password hints that clearly indicate the password", isCorrect: false, explanation: "Clear hints can make it easy for attackers to guess your password." },
    ],
  },
  {
    id: 603,
    title: "Password Sharing",
    description: "What's the safest way to share access to an account with a colleague?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "best-practices",
    difficulty: "hard",
    options: [
      { text: "Email them the password", isCorrect: false, explanation: "Email is generally not encrypted and the password could remain in both sent and received folders." },
      { text: "Tell them the password over the phone", isCorrect: false, explanation: "This is better than email but still not secure, especially in public places." },
      { text: "Use a password manager's secure sharing feature", isCorrect: true, explanation: "Password managers offer encrypted sharing that doesn't expose the actual password and can revoke access later." },
      { text: "Text them the password", isCorrect: false, explanation: "Text messages are not encrypted and could be intercepted." },
    ],
  },
  
  // More questions for each category...
  {
    id: 701,
    title: "Password Storage Security",
    description: "How should websites properly store user passwords?",
    type: "multiple-choice",
    timeLimit: 30,
    category: "best-practices",
    difficulty: "hard",
    options: [
      { text: "In plain text for easy retrieval", isCorrect: false, explanation: "Plain text storage means anyone with database access can see all passwords." },
      { text: "Using simple MD5 hashing", isCorrect: false, explanation: "MD5 is cryptographically broken and can be easily reversed using rainbow tables." },
      { text: "With reversible encryption", isCorrect: false, explanation: "If passwords can be decrypted, they're vulnerable if the encryption key is compromised." },
      { text: "Using salted hashing with a strong algorithm like bcrypt", isCorrect: true, explanation: "Salted hashes with modern algorithms protect against rainbow tables and make brute-forcing computationally expensive." },
    ],
  },
  {
    id: 702,
    title: "Password Complexity Requirements",
    description: "Which password requirement policy is most effective?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "best-practices",
    difficulty: "medium",
    options: [
      { text: "Requiring changes every 30 days with no reuse", isCorrect: false, explanation: "Frequent changes often lead to predictable patterns or written passwords." },
      { text: "Requiring exactly 8 characters with mixed case, numbers and symbols", isCorrect: false, explanation: "Fixed-length requirements limit entropy and often result in barely-compliant passwords." },
      { text: "Encouraging long passphrases (16+ characters) with no complexity requirements", isCorrect: true, explanation: "Length contributes more to entropy than character variety. Longer passwords without complex requirements are often stronger and more memorable." },
      { text: "Requiring at least 2 special characters and blocking dictionary words", isCorrect: false, explanation: "This can lead to predictable substitutions (e.g., 'p@ssw0rd') that cracking algorithms can easily handle." },
    ],
  },
  {
    id: 703,
    title: "Account Breach Response",
    description: "If you discover your password was in a data breach, what should you do FIRST?",
    type: "multiple-choice",
    timeLimit: 20,
    category: "best-practices",
    difficulty: "easy",
    options: [
      { text: "Delete your account on that service", isCorrect: false, explanation: "While this might eventually be necessary, it's not the first priority." },
      { text: "Change your password on that service immediately", isCorrect: true, explanation: "Immediately changing the compromised password is the first step to secure your account." },
      { text: "Contact the authorities", isCorrect: false, explanation: "While reporting breaches is important, securing your accounts comes first." },
      { text: "Check your credit report", isCorrect: false, explanation: "This is important for financial accounts but not the immediate first step." },
    ],
  },
  
  // Even more questions...
  {
    id: 801,
    title: "Password Management Strategies",
    description: "What is the BEST strategy for managing passwords across multiple devices?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "best-practices",
    difficulty: "medium",
    options: [
      { text: "Use simple passwords you can easily remember for all devices", isCorrect: false, explanation: "Simple, memorable passwords are typically weak and reuse increases vulnerability." },
      { text: "Use a cloud-based password manager with encryption", isCorrect: true, explanation: "Cloud-based password managers securely sync across devices while maintaining strong encryption." },
      { text: "Create a document with all your passwords and sync it to the cloud", isCorrect: false, explanation: "Unless strongly encrypted, this exposes all your passwords if the document is compromised." },
      { text: "Use the same pattern but customize it slightly for each account", isCorrect: false, explanation: "Patterns are predictable and can be guessed if one password is exposed." },
    ],
  },
  {
    id: 802,
    title: "Biometric Authentication",
    description: "Which statement about biometric authentication (fingerprint, face recognition) is TRUE?",
    type: "multiple-choice",
    timeLimit: 30,
    category: "password-facts",
    difficulty: "hard",
    options: [
      { text: "Biometrics are always more secure than passwords", isCorrect: false, explanation: "Biometrics can't be changed if compromised and often still rely on password fallbacks." },
      { text: "Biometrics completely eliminate the need for passwords", isCorrect: false, explanation: "Most biometric systems still use passwords as fallbacks or for initial setup." },
      { text: "Biometrics can be spoofed or replicated with varying degrees of difficulty", isCorrect: true, explanation: "Different biometric methods have different security levels, but all can potentially be spoofed." },
      { text: "Biometric data is typically stored in the same way as passwords", isCorrect: false, explanation: "Proper systems store mathematical representations of biometric features, not the actual biometric data itself." },
    ],
  },
  {
    id: 803,
    title: "Password Manager Security",
    description: "What is a valid concern about password managers?",
    type: "multiple-choice",
    timeLimit: 25,
    category: "password-facts",
    difficulty: "medium",
    options: [
      { text: "They create a single point of failure if the master password is compromised", isCorrect: true, explanation: "The master password becomes critically important as it protects all other passwords." },
      { text: "They generate passwords that are too complex for websites to accept", isCorrect: false, explanation: "Good password managers allow customization of password generation to meet site requirements." },
      { text: "They store passwords in plain text", isCorrect: false, explanation: "Reputable password managers use strong encryption to protect stored passwords." },
      { text: "They significantly slow down the login process", isCorrect: false, explanation: "Modern password managers integrate with browsers and actually make logging in faster." },
    ],
  },
];

// This function returns a subset of questions with specified count and difficulty
export const getRandomQuestions = (
  count: number, 
  difficulty?: DifficultyLevel,
  excludeIds: number[] = []
): QuestionItem[] => {
  let filteredQuestions = [...questionPool];
  
  // Filter by difficulty if specified
  if (difficulty) {
    filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
  }
  
  // Filter out excluded question IDs
  if (excludeIds.length > 0) {
    filteredQuestions = filteredQuestions.filter(q => !excludeIds.includes(q.id));
  }
  
  // Shuffle the questions
  const shuffled = filteredQuestions.sort(() => 0.5 - Math.random());
  
  // Return the requested number of questions
  return shuffled.slice(0, count);
};

// Get questions with progressive difficulty
export const getProgressiveQuestions = (count: number, excludeIds: number[] = []): QuestionItem[] => {
  // Determine how many questions of each difficulty to include
  const easyCount = Math.floor(count * 0.4);
  const mediumCount = Math.floor(count * 0.4);
  const hardCount = count - easyCount - mediumCount;
  
  // Get questions for each difficulty level
  const easyQuestions = getRandomQuestions(easyCount, "easy", excludeIds);
  const excludeWithEasy = [...excludeIds, ...easyQuestions.map(q => q.id)];
  
  const mediumQuestions = getRandomQuestions(mediumCount, "medium", excludeWithEasy);
  const excludeWithMedium = [...excludeWithEasy, ...mediumQuestions.map(q => q.id)];
  
  const hardQuestions = getRandomQuestions(hardCount, "hard", excludeWithMedium);
  
  // Combine and return questions in order of difficulty
  return [...easyQuestions, ...mediumQuestions, ...hardQuestions];
};

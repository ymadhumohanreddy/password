import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Send, 
  User, 
  Info, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "1",
    content: "Hello! I'm your AI Security Assistant. I can analyze your passwords and answer security questions. How can I help you today?",
    role: "assistant",
    timestamp: new Date()
  }
];

// Sample common questions and responses
const FAQ_QUESTIONS = [
  "How often should I change my passwords?",
  "What makes a password secure?",
  "Are password managers safe to use?",
  "How do I check if my password has been leaked?"
];

const FAQ_RESPONSES: Record<string, string> = {
  "How often should I change my passwords?": 
    "Rather than changing passwords on a fixed schedule, it's better to change them when there's a reason - like a data breach, someone might have seen it, or you've used it for a long time. Using unique, strong passwords for each site and a password manager is more important than frequent changes, which can lead to weaker passwords.",
  
  "What makes a password secure?": 
    "A secure password is: 1) Long (12+ characters), 2) Complex (mix of letters, numbers, symbols), 3) Unique (not used on any other site), 4) Random (doesn't contain predictable patterns), and 5) Not based on personal information. Passphrases or generated passwords are often better than ones humans make up.",
  
  "Are password managers safe to use?": 
    "Yes, password managers are generally very safe and highly recommended by security experts. They use strong encryption to protect your passwords, generate unique passwords for each site, and reduce the risk of phishing since they recognize legitimate websites. The security benefit of having unique strong passwords for every site far outweighs the minimal risk of using a reputable password manager.",
  
  "How do I check if my password has been leaked?": 
    "You can check if your password has been exposed in data breaches using services like HaveIBeenPwned.com. These services safely check your email or password hash against known breaches without exposing your actual credentials. If your accounts appear in breaches, you should change those passwords immediately. Many browsers and password managers now include this checking feature built-in."
};

const SecurityAssistant = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const generateReply = (userMessage: string) => {
    setIsTyping(true);
    
    // Check if the message is a FAQ
    const normalizedInput = userMessage.toLowerCase().trim();
    const matchedQuestion = FAQ_QUESTIONS.find(q => 
      normalizedInput.includes(q.toLowerCase()) || 
      q.toLowerCase().includes(normalizedInput)
    );
    
    if (matchedQuestion) {
      // Found a matching FAQ
      setTimeout(() => {
        addMessage({
          id: Date.now().toString(),
          content: FAQ_RESPONSES[matchedQuestion],
          role: "assistant",
          timestamp: new Date()
        });
        setIsTyping(false);
      }, 1000);
      return;
    }
    
    // Check if this is a password the user wants analyzed
    if (normalizedInput.includes("password") && 
        (normalizedInput.includes("check") || 
         normalizedInput.includes("analyze") ||
         normalizedInput.includes("is") ||
         normalizedInput.includes("how") ||
         normalizedInput.includes("strong"))) {
      
      // Extract potential password
      let potentialPassword = userMessage.split(/['"]/); // Extract content between quotes
      if (potentialPassword.length > 2) {
        potentialPassword = [potentialPassword[1]]; // Take the content between the first set of quotes
      } else {
        // Try to find the password in the message
        potentialPassword = userMessage.split(" ");
        
        // Filter out common words
        potentialPassword = potentialPassword.filter(word => 
          word.length >= 6 && 
          !["password", "check", "analyze", "strong", "secure", "good"].includes(word.toLowerCase())
        );
      }
      
      const passwordToAnalyze = potentialPassword[0] || "";
      
      if (passwordToAnalyze && passwordToAnalyze.length >= 4) {
        setTimeout(() => {
          let analysis = "";
          
          // Very simple analysis for demo purposes
          if (passwordToAnalyze.length < 8) {
            analysis = `"${passwordToAnalyze}" is too short. Passwords should be at least 8 characters long for basic security. Short passwords can be cracked in seconds using brute force techniques where attackers try all possible combinations of characters.`;
          } else if (!/[A-Z]/.test(passwordToAnalyze)) {
            analysis = `"${passwordToAnalyze}" is missing uppercase letters. Adding uppercase letters would make it more resistant to brute force attacks by increasing the number of possible combinations attackers would need to try.`;
          } else if (!/[0-9]/.test(passwordToAnalyze)) {
            analysis = `"${passwordToAnalyze}" is missing numbers. Adding numbers significantly increases the complexity of a password. Without digits, the password can be more vulnerable to dictionary attacks.`;
          } else if (!/[^A-Za-z0-9]/.test(passwordToAnalyze)) {
            analysis = `"${passwordToAnalyze}" is missing special characters. Special characters like !@#$% greatly enhance password security by adding another layer of complexity that makes passwords harder to crack.`;
          } else if (passwordToAnalyze.length >= 12 && 
                    /[A-Z]/.test(passwordToAnalyze) && 
                    /[0-9]/.test(passwordToAnalyze) && 
                    /[^A-Za-z0-9]/.test(passwordToAnalyze)) {
            analysis = `"${passwordToAnalyze}" appears to be a strong password! It has good length, uppercase letters, numbers, and special characters. This combination makes it very resistant to common cracking methods. To further strengthen it, avoid using personal information or recognizable patterns.`;
          } else {
            analysis = `"${passwordToAnalyze}" has moderate strength. It includes some good security elements, but could be improved. Consider making it longer or adding more variety of character types to increase its resistance to advanced cracking techniques.`;
          }
          
          addMessage({
            id: Date.now().toString(),
            content: analysis,
            role: "assistant",
            timestamp: new Date()
          });
          setIsTyping(false);
        }, 1500);
        return;
      }
    }
    
    // Generic response for other queries
    setTimeout(() => {
      addMessage({
        id: Date.now().toString(),
        content: "I'm designed to help with password security questions and analysis. Try asking me about password best practices, or ask me to analyze a specific password for security issues.",
        role: "assistant",
        timestamp: new Date()
      });
      setIsTyping(false);
    }, 1000);
  };
  
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: "user",
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    setInput("");
    
    generateReply(userMessage.content);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleQuickQuestionClick = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: question,
      role: "user",
      timestamp: new Date()
    };
    
    addMessage(userMessage);
    generateReply(question);
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="card-gradient card-hover h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl">
          <Bot className="mr-2" size={20} />
          AI Security Assistant
        </CardTitle>
        <CardDescription>
          Ask questions about password security or get your passwords analyzed
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col h-[500px]">
        <ScrollArea className="flex-1 pr-4 mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "assistant" ? "justify-start" : "justify-end"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    message.role === "assistant"
                      ? "bg-secondary/50 text-foreground"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  <div className="flex items-center mb-1">
                    {message.role === "assistant" ? (
                      <Bot size={14} className="mr-1" />
                    ) : (
                      <User size={14} className="mr-1" />
                    )}
                    <span className="text-xs opacity-70">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-secondary/50 text-foreground max-w-[80%] px-4 py-2 rounded-lg">
                  <div className="flex items-center">
                    <Bot size={14} className="mr-1" />
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="space-y-2">
          <div className="flex items-center overflow-x-auto pb-2 space-x-2">
            {FAQ_QUESTIONS.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-xs whitespace-nowrap"
                onClick={() => handleQuickQuestionClick(question)}
              >
                <Info size={12} className="mr-1" />
                {question}
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a security question or 'check password123'"
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isTyping}>
              <Send size={18} />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            <ShieldAlert size={12} className="inline mr-1" />
            Try typing "Is 'password123' secure?" or "Check if 'Tr0ub4dor&3' is strong"
          </p>
        </div>
      </CardContent>
      
      <style>
        {`
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 8px;
          width: 8px;
          margin: 0 1px;
          background-color: currentColor;
          border-radius: 50%;
          display: inline-block;
          opacity: 0.4;
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        `}
      </style>
    </Card>
  );
};

export default SecurityAssistant;
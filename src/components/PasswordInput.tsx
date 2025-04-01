import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Shield, AlertCircle, Info } from "lucide-react";

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const PasswordInput = ({ password, setPassword, onAnalyze, isLoading }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setIsTyping(true);
    
    // Automatically clear the typing indicator after 1 second of inactivity
    const typingTimer = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    // Clear the timeout if the user types again
    return () => clearTimeout(typingTimer);
  };

  return (
    <div className="relative w-full">
      <div className="mb-2">
        <p className="text-sm text-muted-foreground flex items-center">
          <AlertCircle size={14} className="mr-1" />
          Enter your password to analyze its strength and vulnerabilities using advanced AI techniques
        </p>
        
        <Button 
          variant="link" 
          className="text-xs p-0 h-auto text-primary"
          onClick={() => setShowTips(!showTips)}
        >
          <Info size={12} className="mr-1" />
          {showTips ? "Hide tips" : "Show password tips"}
        </Button>
        
        {showTips && (
          <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
            <h4 className="font-medium mb-1">Password Best Practices:</h4>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Use a mix of characters (letters, numbers, symbols)</li>
              <li>Aim for at least 12 characters in length</li>
              <li>Avoid using personal information</li>
              <li>Don't reuse passwords across different accounts</li>
              <li>Consider using a password manager for storage</li>
            </ul>
          </div>
        )}
      </div>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter your password to analyze"
            className="pr-10 py-6 text-lg bg-secondary/50 border-primary/20 focus:border-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter") onAnalyze();
            }}
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        </div>
        <Button 
          onClick={onAnalyze} 
          className={`ml-3 px-6 py-6 ${isTyping ? 'bg-primary/80' : 'bg-primary'} hover:bg-primary/80 ${isTyping ? '' : 'pulse-animation'}`}
          disabled={isLoading || !password}
        >
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              Analyzing...
            </>
          ) : (
            <>
              <Shield className="mr-2" size={18} />
              AI Analyze
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PasswordInput;
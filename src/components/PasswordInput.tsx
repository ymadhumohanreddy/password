
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  password: string;
  setPassword: (password: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

const PasswordInput = ({ password, setPassword, onAnalyze, isLoading }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <div className="flex items-center">
        <div className="relative flex-1">
          <Input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          className="ml-3 px-6 py-6 bg-primary hover:bg-primary/80 pulse-animation"
          disabled={isLoading || !password}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
    </div>
  );
};

export default PasswordInput;

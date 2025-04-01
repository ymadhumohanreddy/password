
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ShieldAlert, AlertTriangle, Info, Lock, Cpu } from "lucide-react";
import { toast } from "sonner";

interface PasswordStrength {
  score: number;
  entropy: number;
  crackTimeText: string;
  securityIssues: string[];
}

const LocalPasswordAnalyzer = () => {
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<PasswordStrength | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate model loading
  useEffect(() => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
        setModelLoaded(true);
      }
      setLoadingProgress(progress);
    }, 300);

    return () => clearInterval(interval);
  }, []);
  
  const analyzePasswordLocally = () => {
    setIsAnalyzing(true);
    
    // Simulate local analysis with a timeout
    setTimeout(() => {
      // This is a simplified version of a password strength estimator
      // In a real app, this would use a local ML model
      
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasDigit = /\d/.test(password);
      const hasSpecial = /[^a-zA-Z0-9]/.test(password);
      
      let poolSize = 0;
      if (hasLower) poolSize += 26;
      if (hasUpper) poolSize += 26;
      if (hasDigit) poolSize += 10;
      if (hasSpecial) poolSize += 33;
      
      const entropy = Math.round(password.length * Math.log2(poolSize || 1) * 100) / 100;
      
      // Determine score based on entropy
      let score = 0;
      if (entropy > 80) score = 4;
      else if (entropy > 60) score = 3;
      else if (entropy > 40) score = 2;
      else if (entropy > 20) score = 1;
      
      // Estimate crack time
      let crackTimeText = "Less than a second";
      if (entropy > 128) crackTimeText = "Centuries";
      else if (entropy > 100) crackTimeText = "Decades";
      else if (entropy > 80) crackTimeText = "Years";
      else if (entropy > 60) crackTimeText = "Months";
      else if (entropy > 40) crackTimeText = "Days";
      else if (entropy > 30) crackTimeText = "Hours";
      else if (entropy > 20) crackTimeText = "Minutes";
      
      // Generate security issues
      const securityIssues = [];
      if (password.length < 8) securityIssues.push("Password is too short (minimum 8 characters recommended)");
      if (!hasLower) securityIssues.push("Missing lowercase letters");
      if (!hasUpper) securityIssues.push("Missing uppercase letters");
      if (!hasDigit) securityIssues.push("Missing numbers");
      if (!hasSpecial) securityIssues.push("Missing special characters");
      
      // Check for common patterns
      if (/^[a-zA-Z]+\d+$/.test(password)) {
        securityIssues.push("Simple word + number pattern detected (highly predictable)");
      }
      
      if (/(.)\1{2,}/.test(password)) {
        securityIssues.push("Repeated characters detected (reduces entropy)");
      }
      
      if (/^(qwerty|asdfgh|zxcvbn)/i.test(password)) {
        securityIssues.push("Keyboard pattern detected (easily guessable)");
      }
      
      const commonPasswords = ["password", "123456", "qwerty", "admin", "welcome"];
      if (commonPasswords.includes(password.toLowerCase())) {
        securityIssues.push("This is one of the most common passwords (extremely vulnerable)");
      }
      
      setResult({
        score,
        entropy,
        crackTimeText,
        securityIssues
      });
      
      setIsAnalyzing(false);
    }, 800);
  };
  
  const getScoreText = (score: number) => {
    switch (score) {
      case 0: return "Very Weak";
      case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Strong";
      case 4: return "Very Strong";
      default: return "Unknown";
    }
  };
  
  const getScoreColor = (score: number) => {
    switch (score) {
      case 0: return "bg-red-500";
      case 1: return "bg-red-400";
      case 2: return "bg-yellow-500";
      case 3: return "bg-green-500";
      case 4: return "bg-emerald-500";
      default: return "bg-gray-500";
    }
  };
  
  const getScoreBadgeColor = (score: number) => {
    switch (score) {
      case 0:
      case 1: return "destructive";
      case 2: return "warning";
      case 3:
      case 4: return "success";
      default: return "secondary";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      analyzePasswordLocally();
    }
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Cpu className="mr-2" size={20} />
          Offline Password Analyzer
        </CardTitle>
        <CardDescription>
          100% private password analysis - runs entirely on your device
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!modelLoaded ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="mx-auto w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4"></div>
              <h3 className="text-lg font-medium mb-1">Loading Analysis Engine</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Setting up secure offline analysis environment...
              </p>
              <Progress value={loadingProgress} className="w-full" />
              <p className="text-xs text-muted-foreground mt-2">
                {loadingProgress < 100 
                  ? `Loading resources... ${Math.round(loadingProgress)}%` 
                  : "Ready to analyze!"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Lock size={14} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Your password never leaves your device
                </span>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  type="password"
                  placeholder="Enter password to analyze"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
                <Button 
                  onClick={analyzePasswordLocally} 
                  disabled={!password || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    "Analyze"
                  )}
                </Button>
              </div>
            </div>
            
            {result && (
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Password Strength:</span>
                    <Badge variant={getScoreBadgeColor(result.score) as any}>
                      {getScoreText(result.score)}
                    </Badge>
                  </div>
                  
                  <Progress 
                    value={(result.score / 4) * 100} 
                    className="h-2"
                    indicatorClassName={getScoreColor(result.score)}
                  />
                  
                  <div className="p-3 bg-secondary/20 rounded-md text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Entropy:</span>
                      <span className="font-mono font-medium">{result.entropy} bits</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span>Crack Time:</span>
                      <span className="font-medium">{result.crackTimeText}</span>
                    </div>
                  </div>
                  
                  {result.securityIssues.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 flex items-center">
                        <AlertTriangle size={14} className="mr-1 text-yellow-500" />
                        Security Issues:
                      </h4>
                      <ul className="space-y-1">
                        {result.securityIssues.map((issue, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <Info size={12} className="mr-1 mt-1 shrink-0 text-info" />
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="p-3 bg-secondary/20 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Technical Details:</h4>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-2 gap-x-2">
                        <span className="text-muted-foreground">Character Set Size:</span>
                        <span className="font-mono">
                          {(/[a-z]/.test(password) ? 26 : 0) +
                            (/[A-Z]/.test(password) ? 26 : 0) +
                            (/[0-9]/.test(password) ? 10 : 0) +
                            (/[^a-zA-Z0-9]/.test(password) ? 33 : 0)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2">
                        <span className="text-muted-foreground">Password Length:</span>
                        <span className="font-mono">{password.length} characters</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2">
                        <span className="text-muted-foreground">Entropy Formula:</span>
                        <span className="font-mono">L × log₂(R)</span>
                      </div>
                      <div className="grid grid-cols-2 gap-x-2">
                        <span className="text-muted-foreground">Possible Combinations:</span>
                        <span className="font-mono">~{Math.round(Math.pow(2, result.entropy)).toExponential(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Character Analysis:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`p-2 rounded border ${/[a-z]/.test(password) ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <span className="text-xs">Lowercase (a-z)</span>
                      </div>
                      <div className={`p-2 rounded border ${/[A-Z]/.test(password) ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <span className="text-xs">Uppercase (A-Z)</span>
                      </div>
                      <div className={`p-2 rounded border ${/[0-9]/.test(password) ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <span className="text-xs">Numbers (0-9)</span>
                      </div>
                      <div className={`p-2 rounded border ${/[^a-zA-Z0-9]/.test(password) ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}`}>
                        <span className="text-xs">Special Chars</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-secondary/20 rounded-md text-sm">
                    <h4 className="font-medium mb-1">Entropy Explained:</h4>
                    <p className="text-muted-foreground text-xs">
                      Entropy is a measure of password strength in bits. 
                      A secure password should have at least 60-80 bits of entropy. 
                      Your password has {result.entropy} bits of entropy, which means it would 
                      require approximately {Math.pow(2, result.entropy).toExponential(2)} guesses 
                      to crack through brute force.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
        
        <div className="flex items-center justify-center space-x-2 py-1">
          <ShieldAlert size={12} className="text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            No data sent to servers - 100% local analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalPasswordAnalyzer;

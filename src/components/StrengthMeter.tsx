import { AlertTriangle, ShieldAlert, ShieldCheck, Clock, Lock, Brain, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface StrengthMeterProps {
  entropy: number;
  compromised: boolean;
  exposureCount?: number;
  strengthText?: string;
  score?: number;
}

const StrengthMeter = ({ 
  entropy, 
  compromised, 
  exposureCount, 
  strengthText: providedStrengthText,
  score 
}: StrengthMeterProps) => {
  // Calculate strength percentage based on entropy without points
  const strengthPercentage = Math.min(Math.max((entropy / 120) * 100, 0), 100);
  
  // Use provided strength text or determine based on entropy/compromised status
  let strengthText = providedStrengthText || "";
  let strengthColor = "";
  let Icon = ShieldAlert;
  
  // Determine the strength level based on entropy or compromised status
  if (compromised) {
    strengthText = "Compromised!";
    strengthColor = "bg-destructive";
    Icon = AlertTriangle;
  } else if (exposureCount && exposureCount > 0) {
    strengthText = "Exposed!";
    strengthColor = "bg-destructive";
    Icon = AlertTriangle;
  } else {
    // Calculate strength based directly on entropy
    if (entropy < 40) {
      strengthText = "Very Weak";
      strengthColor = "bg-destructive";
      Icon = ShieldAlert;
    } else if (entropy < 60) {
      strengthText = "Weak";
      strengthColor = "bg-orange-500";
      Icon = ShieldAlert;
    } else if (entropy < 80) {
      strengthText = "Moderate";
      strengthColor = "bg-yellow-500";
      Icon = ShieldAlert;
    } else if (entropy < 100) {
      strengthText = "Strong";
      strengthColor = "bg-green-500";
      Icon = ShieldCheck;
    } else {
      strengthText = "Very Strong";
      strengthColor = "bg-emerald-500";
      Icon = ShieldCheck;
    }
  }

  // Generate descriptive text based on entropy
  const getDescriptiveAnalysis = () => {
    if (compromised || (exposureCount && exposureCount > 0)) {
      return "This password has been found in data breaches and should be changed immediately. Hackers already have access to this password, making it extremely vulnerable.";
    }
    
    if (entropy < 40) {
      return "This password could be cracked almost instantly by modern password cracking tools. It offers minimal protection against even casual attacks and follows patterns that are easily predictable.";
    } else if (entropy < 60) {
      return "This password offers minimal protection against targeted attacks. It might resist casual attempts but would fall to determined attackers using automated tools and common wordlists.";
    } else if (entropy < 80) {
      return "This password provides adequate security for most personal accounts, but may not withstand sophisticated attacks with dedicated resources or advanced cracking techniques.";
    } else if (entropy < 100) {
      return "This password offers good protection against most attack methods including dictionary attacks and common brute force approaches. It would require significant computational resources to crack.";
    } else {
      return "This password provides excellent security and would be extremely difficult to crack, even with significant computational resources. It effectively resists all common attack methods.";
    }
  };

  // Calculate number of guesses
  const getGuessEstimate = () => {
    const guesses = Math.pow(2, entropy);
    if (guesses < 1000) {
      return guesses.toFixed(0);
    } else if (guesses < 1000000) {
      return (guesses / 1000).toFixed(1) + " thousand";
    } else if (guesses < 1000000000) {
      return (guesses / 1000000).toFixed(1) + " million";
    } else if (guesses < 1000000000000) {
      return (guesses / 1000000000).toFixed(1) + " billion";
    } else if (guesses < 1000000000000000) {
      return (guesses / 1000000000000).toFixed(1) + " trillion";
    } else {
      return (guesses / 1000000000000000).toFixed(1) + " quadrillion";
    }
  };
  
  // Get specific attack resistance information
  const getAttackResistance = () => {
    if (compromised || (exposureCount && exposureCount > 0)) {
      return "Already compromised - no resistance";
    }
    
    let brute = "Poor";
    let dictionary = "Poor";
    let social = "Unknown";
    
    if (entropy >= 100) {
      brute = "Excellent";
      dictionary = "Excellent";
      social = "Likely Good";
    } else if (entropy >= 80) {
      brute = "Strong";
      dictionary = "Strong";
      social = "Likely Good";
    } else if (entropy >= 60) {
      brute = "Moderate";
      dictionary = "Moderate";
      social = "Unknown";
    } else if (entropy >= 40) {
      brute = "Weak";
      dictionary = "Weak";
      social = "Potentially Weak";
    }
    
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="p-1 bg-secondary/30 rounded text-center">
          <div className="text-xs font-medium flex flex-col items-center justify-center">
            <Brain size={14} className="mb-1" />
            Brute Force
          </div>
          <div className={`text-xs ${brute === "Poor" || brute === "Weak" ? "text-red-500" : 
                             brute === "Moderate" ? "text-yellow-500" : "text-green-500"}`}>
            {brute}
          </div>
        </div>
        <div className="p-1 bg-secondary/30 rounded text-center">
          <div className="text-xs font-medium flex flex-col items-center justify-center">
            <Lock size={14} className="mb-1" />
            Dictionary
          </div>
          <div className={`text-xs ${dictionary === "Poor" || dictionary === "Weak" ? "text-red-500" : 
                             dictionary === "Moderate" ? "text-yellow-500" : "text-green-500"}`}>
            {dictionary}
          </div>
        </div>
        <div className="p-1 bg-secondary/30 rounded text-center">
          <div className="text-xs font-medium flex flex-col items-center justify-center">
            <Users size={14} className="mb-1" />
            Social
          </div>
          <div className={`text-xs ${social === "Potentially Weak" ? "text-red-500" : 
                             social === "Unknown" ? "text-yellow-500" : "text-green-500"}`}>
            {social}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          <Icon className={`mr-2 ${compromised || (exposureCount && exposureCount > 0) ? "text-destructive" : ""}`} size={20} />
          <span className="font-medium">{strengthText}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Entropy: {entropy} bits
          {exposureCount !== undefined && exposureCount > 0 && (
            <span className="ml-2 text-destructive">
              Found in {exposureCount.toLocaleString()} breaches
            </span>
          )}
        </span>
      </div>
      
      <Progress 
        value={strengthPercentage} 
        className="h-3 w-full"
        indicatorClassName={strengthColor}
      />
      
      <p className="mt-2 text-sm text-muted-foreground">
        {getDescriptiveAnalysis()}
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="p-3 bg-secondary/20 rounded-lg">
          <h4 className="text-xs font-medium mb-1 flex items-center">
            <Lock size={14} className="mr-1" />
            Attack Resistance:
          </h4>
          {getAttackResistance()}
        </div>
        
        <div className="p-3 bg-secondary/20 rounded-lg">
          <h4 className="text-xs font-medium mb-1 flex items-center">
            <Brain size={14} className="mr-1" />
            Password Complexity:
          </h4>
          <div className="text-sm">
            <p className="text-xs">
              Estimated guesses required: <span className="font-mono font-medium">{getGuessEstimate()}</span>
            </p>
            
            <div className="h-1 w-full bg-secondary mt-2">
              <div 
                className={`h-full ${strengthColor}`} 
                style={{ width: `${strengthPercentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>Simple</span>
              <span>Complex</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrengthMeter;

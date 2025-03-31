import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
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
  // Calculate strength percentage (max entropy considered is 120 or based on score)
  const strengthPercentage = score !== undefined 
    ? Math.min(Math.max((score / 4) * 100, 0), 100)
    : Math.min(Math.max((entropy / 120) * 100, 0), 100);
  
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
  } else if (providedStrengthText) {
    // Use provided strength text and determine color based on it
    strengthText = providedStrengthText;
    
    switch (providedStrengthText) {
      case "Very Weak":
        strengthColor = "bg-destructive";
        Icon = ShieldAlert;
        break;
      case "Weak":
        strengthColor = "bg-orange-500";
        Icon = ShieldAlert;
        break;
      case "Moderate":
        strengthColor = "bg-yellow-500";
        Icon = ShieldAlert;
        break;
      case "Strong":
        strengthColor = "bg-green-500";
        Icon = ShieldCheck;
        break;
      case "Very Strong":
        strengthColor = "bg-emerald-500";
        Icon = ShieldCheck;
        break;
      default:
        // Fallback to calculation based on entropy
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
  } else {
    // Fallback to calculation based on entropy
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
    </div>
  );
};

export default StrengthMeter;
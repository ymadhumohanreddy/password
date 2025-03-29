
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

interface StrengthMeterProps {
  entropy: number;
  compromised: boolean;
}

const StrengthMeter = ({ entropy, compromised }: StrengthMeterProps) => {
  // Calculate strength percentage (max entropy considered is 120)
  const strengthPercentage = Math.min(Math.max((entropy / 120) * 100, 0), 100);
  
  let strengthText = "";
  let strengthColor = "";
  let Icon = ShieldAlert;
  
  // Determine the strength level based on entropy
  if (compromised) {
    strengthText = "Compromised!";
    strengthColor = "bg-destructive";
    Icon = AlertTriangle;
  } else if (entropy < 40) {
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

  return (
    <div className="mt-6 w-full">
      <div className="flex items-center mb-2 justify-between">
        <div className="flex items-center">
          <Icon className={`mr-2 ${compromised ? "text-destructive" : ""}`} size={20} />
          <span className="font-medium">{strengthText}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          Entropy: {entropy} bits
        </span>
      </div>
      
      <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${strengthColor} strength-meter-transition rounded-full`}
          style={{ width: `${strengthPercentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StrengthMeter;


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ExplanationCardProps {
  explanation: string;
  compromised: boolean;
}

const ExplanationCard = ({ explanation, compromised }: ExplanationCardProps) => {
  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <AlertCircle className="mr-2" size={18} />
          Security Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {compromised && (
          <div className="mb-4 p-3 bg-destructive/20 border border-destructive/30 rounded-md">
            <p className="font-medium text-destructive">
              ⚠️ This password has been compromised in data breaches!
            </p>
            <p className="text-sm mt-1 text-muted-foreground">
              This password appears in known data breaches (RockYou) and should never be used.
            </p>
          </div>
        )}
        
        <div className="text-sm text-muted-foreground">
          <p>{explanation}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;

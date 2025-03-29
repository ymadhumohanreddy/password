import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield, Loader2 } from "lucide-react";

interface ExplanationCardProps {
  explanation: string | null; // It can be null while loading
  compromised: boolean;
}

const ExplanationCard = ({ explanation, compromised }: ExplanationCardProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate AI processing delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Change this to match the actual AI response time

    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="mr-2" size={18} />
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

        {loading ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin" size={18} />
            <span>AI is analyzing...</span>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            <p>{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExplanationCard;

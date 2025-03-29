import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface SuggestionsCardProps {
  hardened: string;
  suggestions: string[];
}

const SuggestionsCard = ({ hardened, suggestions }: SuggestionsCardProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success("Password copied to clipboard");
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Wand2 className="mr-2" size={18} />
          Stronger Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Hardened version of your password:</p>
            <div className="flex items-center justify-between bg-secondary/30 p-2 rounded">
              <code className="font-mono text-primary">{hardened}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(hardened, -1)}
                className="ml-2 h-8 w-8"
              >
                {copiedIndex === -1 ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Strong password suggestions:</p>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-center justify-between bg-secondary/30 p-2 rounded">
                  <code className="font-mono text-primary">{suggestion}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(suggestion, index)}
                    className="ml-2 h-8 w-8"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionsCard;
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, CheckCircle, Dna } from "lucide-react";
import { toast } from "sonner";

interface DnaPasswordResult {
  password: string;
  entropy: number;
  crackTimes: Record<string, string>;
}

const DnaPasswordGenerator = () => {
  const [favoriteCharacter, setFavoriteCharacter] = useState("");
  const [childhoodPet, setChildhoodPet] = useState("");
  const [dreamDestination, setDreamDestination] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DnaPasswordResult | null>(null);
  const [copied, setCopied] = useState(false);

  const generatePassword = async () => {
    if (!favoriteCharacter || !childhoodPet || !dreamDestination) {
      toast.error("Please answer all three questions");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/generate-dna-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          favoriteCharacter,
          childhoodPet,
          dreamDestination,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate password");
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Error generating DNA password:", error);
      toast.error("Failed to generate password. Using fallback mode.");
      // Fallback mode with local generation
      const mockResult = {
        password: `${favoriteCharacter.substring(0, 2)}${childhoodPet.substring(0, 2)}${dreamDestination.substring(0, 2)}!2A`,
        entropy: 40.2,
        crackTimes: {
          "Online (1k guesses/sec)": "3.5 years",
          "Fast GPU (1 trillion guesses/sec)": "10.2 seconds",
          "Supercomputer (100 trillion/sec)": "0.1 seconds"
        }
      };
      setResult(mockResult);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Password copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Dna className="mr-2" size={18} />
          DNA Password Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate a unique, memorable password based on your personal answers.
        </p>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="favorite-character">Who's your favorite fictional character?</Label>
            <Input
              id="favorite-character"
              value={favoriteCharacter}
              onChange={(e) => setFavoriteCharacter(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="childhood-pet">What was the name of your childhood pet?</Label>
            <Input
              id="childhood-pet"
              value={childhoodPet}
              onChange={(e) => setChildhoodPet(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="dream-destination">What's your dream travel destination?</Label>
            <Input
              id="dream-destination"
              value={dreamDestination}
              onChange={(e) => setDreamDestination(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <Button 
            onClick={generatePassword} 
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate DNA Password"}
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-3 bg-secondary/30 rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Your DNA Password:</p>
                <p className="font-mono text-primary text-lg">{result.password}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Entropy: {result.entropy} bits
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(result.password)}
                className="h-8"
              >
                {copied ? <CheckCircle size={16} className="mr-1 text-green-500" /> : <Copy size={16} className="mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            
            <div className="mt-3">
              <p className="text-xs font-medium mb-1">Time to crack:</p>
              <ul className="text-xs space-y-1">
                {Object.entries(result.crackTimes).map(([attack, time]) => (
                  <li key={attack} className="flex justify-between">
                    <span>{attack}:</span>
                    <span className="font-medium">{time}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DnaPasswordGenerator;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, CheckCircle, Wand2, Lock, Volume2, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";

const PassphraseGenerator = () => {
  const [passphrase, setPassphrase] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [wordCount, setWordCount] = useState(4); 
  const [complexity, setComplexity] = useState(2); // 1-3 scale
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [passphraseContext, setPassphraseContext] = useState<string>("");
  const [passphraseExplanation, setPassphraseExplanation] = useState<string>("");
  const [passphraseType, setPassphraseType] = useState<"standard" | "memorable" | "pronounceable">("standard");

  const generatePassphrase = async () => {
    setIsGenerating(true);
    
    try {
      // Here we'd normally call the backend to generate a passphrase
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        const commonWords = [
          "apple", "ocean", "mountain", "whisper", "valley", "thunder", 
          "galaxy", "horizon", "breeze", "forest", "river", "sunlight",
          "melody", "journey", "diamond", "compass", "garden", "eagle",
          "rainbow", "island", "castle", "winter", "summer", "autumn"
        ];
        
        const getRandomSymbol = () => {
          const symbols = "!@#$%^&*-_=+";
          return symbols[Math.floor(Math.random() * symbols.length)];
        };
        
        const getRandomNumber = () => Math.floor(Math.random() * 10);
        
        // Select random words based on word count
        let words = [];
        for (let i = 0; i < wordCount; i++) {
          const word = commonWords[Math.floor(Math.random() * commonWords.length)];
          
          // Apply complexity - capitalize some words
          if (complexity > 1 && Math.random() > 0.5) {
            words.push(word.charAt(0).toUpperCase() + word.slice(1));
          } else {
            words.push(word);
          }
        }
        
        // Add symbols and numbers based on user preferences
        if (includeSymbols && complexity > 1) {
          const symbolPosition = Math.floor(Math.random() * (words.length + 1));
          words.splice(symbolPosition, 0, getRandomSymbol());
        }
        
        if (includeNumbers && complexity > 1) {
          const numberPosition = Math.floor(Math.random() * (words.length + 1));
          words.splice(numberPosition, 0, getRandomNumber().toString());
        }
        
        // For highest complexity, add an extra layer of randomness
        if (complexity === 3) {
          // Replace some letters with numbers/symbols (l33t speak)
          words = words.map(word => {
            if (typeof word === 'string' && word.length > 1 && Math.random() > 0.7) {
              return word
                .replace('a', '@')
                .replace('e', '3')
                .replace('i', '1')
                .replace('o', '0')
                .replace('s', '$');
            }
            return word;
          });
        }
        
        let result = "";
        
        if (passphraseType === "standard") {
          // Standard passphrase - simply join with spaces or dashes
          result = words.join(complexity > 2 ? '-' : ' ');
        } 
        else if (passphraseType === "memorable") {
          // Memorable passphrase - create a sentence-like structure
          const connectors = ["and", "with", "near", "under", "over", "beside"];
          let phrase = [];
          
          for (let i = 0; i < words.length; i++) {
            phrase.push(words[i]);
            if (i < words.length - 1 && Math.random() > 0.5 && complexity > 1) {
              phrase.push(connectors[Math.floor(Math.random() * connectors.length)]);
            }
          }
          result = phrase.join(' ');
        }
        else if (passphraseType === "pronounceable") {
          // Pronounceable passphrase - no spaces, camel case
          result = words.map((word, index) => 
            index === 0 ? word : (typeof word === 'string' ? word.charAt(0).toUpperCase() + word.slice(1) : word)
          ).join('');
        }
        
        // Generate context/explanation
        let context = "";
        let explanation = "";
        
        if (complexity === 1) {
          context = "Basic Strength";
          explanation = "This passphrase uses common words making it easy to remember, but more vulnerable to sophisticated dictionary attacks.";
        } else if (complexity === 2) {
          context = "Medium Strength";
          explanation = "This passphrase combines words with symbols and numbers, balancing memorability with security. Dictionary attacks would struggle with these combinations.";
        } else {
          context = "High Strength";
          explanation = "This complex passphrase uses advanced substitutions and patterns that would be extremely difficult for automated tools to crack, while maintaining some memorability.";
        }
        
        setPassphrase(result);
        setPassphraseContext(context);
        setPassphraseExplanation(explanation);
        setIsGenerating(false);
      }, 1500); // Simulate API call delay
    } catch (error) {
      console.error("Error generating passphrase:", error);
      toast.error("Failed to generate passphrase. Please try again.");
      setIsGenerating(false);
    }
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    toast.success("Passphrase copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  
  const speakPassphrase = () => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(passphrase);
      speech.rate = 0.8; // Slightly slower for clarity
      window.speechSynthesis.speak(speech);
      toast.success("Speaking passphrase");
    } else {
      toast.error("Speech synthesis not supported in your browser");
    }
  };
  
  return (
    <Card className="card-gradient card-hover">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Wand2 className="mr-2" size={20} />
          AI Passphrase Generator
        </CardTitle>
        <CardDescription>
          Generate secure, memorable passphrases using AI techniques
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="standard" onValueChange={(value) => setPassphraseType(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="standard">Standard</TabsTrigger>
            <TabsTrigger value="memorable">Memorable</TabsTrigger>
            <TabsTrigger value="pronounceable">Pronounceable</TabsTrigger>
          </TabsList>
          
          <TabsContent value="standard">
            <div className="text-sm text-muted-foreground mb-4">
              <p>Standard passphrases use random words separated by spaces or symbols.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="memorable">
            <div className="text-sm text-muted-foreground mb-4">
              <p>Memorable passphrases form sentence-like structures for easier recall.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="pronounceable">
            <div className="text-sm text-muted-foreground mb-4">
              <p>Pronounceable passphrases join words without spaces for compact security.</p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm flex items-center mb-2">
              <Sparkles className="w-4 h-4 mr-1" />
              Word Count: {wordCount}
            </Label>
            <Slider 
              value={[wordCount]} 
              min={3} 
              max={8} 
              step={1} 
              onValueChange={(value) => setWordCount(value[0])}
            />
          </div>
          
          <div>
            <Label className="text-sm flex items-center mb-2">
              <Lock className="w-4 h-4 mr-1" />
              Complexity Level: {complexity === 1 ? 'Basic' : complexity === 2 ? 'Medium' : 'High'}
            </Label>
            <Slider 
              value={[complexity]} 
              min={1} 
              max={3} 
              step={1} 
              onValueChange={(value) => setComplexity(value[0])}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-symbols" 
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
              <Label htmlFor="include-symbols" className="text-sm">Include Symbols</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="include-numbers" 
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
              <Label htmlFor="include-numbers" className="text-sm">Include Numbers</Label>
            </div>
          </div>
          
          <Button 
            onClick={generatePassphrase} 
            className="w-full" 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="mr-2" size={16} />
                Generate Secure Passphrase
              </>
            )}
          </Button>
          
          {passphrase && (
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Input 
                  value={passphrase} 
                  readOnly 
                  className="pr-20 font-mono bg-secondary/30 py-6 text-lg"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={speakPassphrase}
                    className="h-8 w-8"
                  >
                    <Volume2 size={16} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyToClipboard}
                    className="h-8 w-8"
                  >
                    {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-muted/30 rounded text-sm space-y-2">
                <p className="font-medium flex items-center">
                  <Info size={14} className="mr-1" />
                  {passphraseContext}
                </p>
                <p className="text-muted-foreground text-xs">
                  {passphraseExplanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PassphraseGenerator;

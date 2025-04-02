import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RefreshCw, Copy, Check, Sparkles, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGPT2 } from "@/utils/gpt2Helper";

const PassphraseGenerator = () => {
  const { toast } = useToast();
  const [type, setType] = useState<string>("standard");
  const [length, setLength] = useState<number>(12);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [passphrase, setPassphrase] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  
  // Use the GPT-2 helper
  const { generateText, isLoading } = useGPT2();

  const handleGeneratePassphrase = async () => {
    // Create a prompt based on the selected type
    let prompt = `Generate a secure ${type} passphrase`;
    
    if (type === "memorable" || type === "pronounceable") {
      prompt += ` that is easy to remember and pronounce`;
    }
    
    // Generate the passphrase using GPT-2
    const generatedPassphrase = await generateText(prompt, { 
      maxLength: length,
      temperature: temperature
    });
    
    setPassphrase(generatedPassphrase);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(passphrase);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Passphrase copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="mr-2" size={18} />
          GPT-2 Passphrase Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate secure, memorable passphrases using GPT-2 AI technology
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="type">Passphrase Type</Label>
          <Select 
            value={type} 
            onValueChange={setType}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="memorable">Memorable</SelectItem>
              <SelectItem value="pronounceable">Pronounceable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="length">Length (approx.): {length}</Label>
          </div>
          <Slider 
            id="length"
            min={8} 
            max={32} 
            step={1} 
            value={[length]} 
            onValueChange={(value) => setLength(value[0])}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="complexity">Complexity: {temperature.toFixed(1)}</Label>
          </div>
          <Slider 
            id="complexity"
            min={0.1} 
            max={1.0} 
            step={0.1} 
            value={[temperature]} 
            onValueChange={(value) => setTemperature(value[0])}
          />
          <p className="text-xs text-muted-foreground">
            Higher values produce more creative but potentially less secure passphrases.
          </p>
        </div>

        <Button 
          onClick={handleGeneratePassphrase} 
          className="w-full flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Generate with GPT-2
            </>
          )}
        </Button>

        {passphrase && (
          <div className="mt-4">
            <Label htmlFor="passphrase">Generated Passphrase</Label>
            <div className="flex mt-1.5">
              <Input 
                id="passphrase"
                value={passphrase} 
                readOnly 
                className="font-mono"
              />
              <Button 
                onClick={copyToClipboard} 
                variant="outline" 
                size="icon" 
                className="ml-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This passphrase was generated using GPT-2 AI technology for enhanced security and memorability.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PassphraseGenerator;

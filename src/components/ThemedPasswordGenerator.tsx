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
import { Copy, Check, RefreshCw, BarChart, Wand } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGPT2 } from "@/utils/gpt2Helper";

const ThemedPasswordGenerator = () => {
  const { toast } = useToast();
  const [theme, setTheme] = useState<string>("music");
  const [length, setLength] = useState<number>(12);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  
  // Use the GPT-2 helper
  const { generateText, isLoading } = useGPT2();

  const handleGeneratePassword = async () => {
    // Generate the password using GPT-2 with the selected theme
    const generatedPassword = await generateText(`Generate a password with ${theme} theme`, { 
      maxLength: length,
      temperature: temperature,
      theme: theme
    });
    
    setPassword(generatedPassword);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Password copied to clipboard",
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <BarChart className="mr-2" size={18} />
          GPT-2 Themed Password Generator
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate passwords inspired by specific themes using GPT-2 AI technology
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Password Theme</Label>
          <Select 
            value={theme} 
            onValueChange={setTheme}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="scifi">Science Fiction</SelectItem>
              <SelectItem value="fantasy">Fantasy</SelectItem>
              <SelectItem value="movies">Movies</SelectItem>
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
            <Label htmlFor="complexity">Creativity: {temperature.toFixed(1)}</Label>
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
            Higher values create more creative, theme-specific passwords.
          </p>
        </div>

        <Button 
          onClick={handleGeneratePassword} 
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
              <Wand className="mr-2 h-4 w-4" />
              Generate with GPT-2
            </>
          )}
        </Button>

        {password && (
          <div className="mt-4">
            <Label htmlFor="password">Generated Themed Password</Label>
            <div className="flex mt-1.5">
              <Input 
                id="password"
                value={password} 
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
              This {theme}-themed password was generated using GPT-2 AI for enhanced security with thematic elements.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemedPasswordGenerator;

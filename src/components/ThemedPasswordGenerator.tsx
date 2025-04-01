import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, CheckCircle, Sparkles, Music, Rocket, Castle, Film } from "lucide-react";
import { toast } from "sonner";

const THEMES = [
  { id: "music", name: "Music & Lyrics", icon: <Music className="w-4 h-4" /> },
  { id: "scifi", name: "Sci-Fi References", icon: <Rocket className="w-4 h-4" /> },
  { id: "fantasy", name: "Fantasy Characters", icon: <Castle className="w-4 h-4" /> },
  { id: "movies", name: "Movie Quotes", icon: <Film className="w-4 h-4" /> },
];

const ThemedPasswordGenerator = () => {
  const [selectedTheme, setSelectedTheme] = useState("music");
  const [randomness, setRandomness] = useState(2); // 1-3 scale
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState("");
  const [securityScore, setSecurityScore] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [themeInsight, setThemeInsight] = useState("");

  const generatePassword = () => {
    setIsGenerating(true);
    
    // Simulate API call
    setTimeout(() => {
      // Theme-specific data
      const themeData: Record<string, string[]> = {
        music: [
          "BohemianRhapsody", "StairwayToHeaven", "ImagineAllPeople", 
          "SmellsLikeTeenSpirit", "BillyJean", "LikeARollingStone"
        ],
        scifi: [
          "UseTheForce", "BeamMeUp", "OpenThePodBay", 
          "IAmYourFather", "TheresNoSpoon", "ToInfinityAndBeyond"
        ],
        fantasy: [
          "YouShallNotPass", "WinterIsComing", "MyPrecious", 
          "ExpectoPatronum", "AslanIsOnTheMove", "ForNarnia"
        ],
        movies: [
          "HereIsLookinAtYou", "IllBeBack", "MayTheForceBeWithYou",
          "HoustonWeHaveAProblem", "ShowMeTheMoney", "LifeIsLikeABox"
        ]
      };
      
      // Select a base password from the theme
      const themeOptions = themeData[selectedTheme];
      let basePassword = themeOptions[Math.floor(Math.random() * themeOptions.length)];
      
      // Apply randomness transformations
      if (randomness >= 2) {
        // Replace some characters with similar looking numbers/symbols (l33t speak)
        basePassword = basePassword
          .replace(/a/g, '@')
          .replace(/e/g, '3')
          .replace(/i/g, '1')
          .replace(/o/g, '0')
          .replace(/s/g, '$');
      }
      
      // Add numbers if requested
      if (includeNumbers) {
        basePassword += Math.floor(Math.random() * 100);
      }
      
      // Add symbols if requested
      if (includeSymbols) {
        const symbols = "!@#$%^&*";
        basePassword += symbols.charAt(Math.floor(Math.random() * symbols.length));
      }
      
      // For highest randomness, shuffle the string
      if (randomness === 3) {
        basePassword = basePassword.split('').sort(() => 0.5 - Math.random()).join('');
      }
      
      // Calculate a security score (0-100)
      let score = 0;
      score += basePassword.length * 4; // Length bonus
      score += includeNumbers ? 20 : 0;
      score += includeSymbols ? 20 : 0;
      score += (randomness - 1) * 15; // Randomness bonus
      
      // Cap at 100
      score = Math.min(score, 100);
      
      // Generate theme-specific security insight
      let insight = "";
      if (score < 40) {
        insight = `This ${getThemeName(selectedTheme).toLowerCase()} themed password is recognizable and might be vulnerable to targeted attacks.`;
      } else if (score < 70) {
        insight = `Your ${getThemeName(selectedTheme).toLowerCase()} themed password has decent security but could be strengthened with more randomization.`;
      } else {
        insight = `This highly secure ${getThemeName(selectedTheme).toLowerCase()} themed password combines cultural references with strong randomization.`;
      }
      
      setPassword(basePassword);
      setSecurityScore(score);
      setThemeInsight(insight);
      setIsGenerating(false);
    }, 1000);
  };
  
  const getThemeName = (themeId: string): string => {
    const theme = THEMES.find(t => t.id === themeId);
    return theme ? theme.name : "";
  };
  
  const getScoreColor = () => {
    if (securityScore < 40) return "text-red-500";
    if (securityScore < 70) return "text-yellow-500";
    return "text-green-500";
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    toast.success("Password copied to clipboard");
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="card-gradient card-hover">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Sparkles className="mr-2" size={20} />
          Themed Password Generator
        </CardTitle>
        <CardDescription>
          Create secure passwords with creative themes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Label className="text-sm">Select Theme:</Label>
        <ScrollArea className="h-[150px] rounded-md border p-2">
          <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
            {THEMES.map((theme) => (
              <div key={theme.id} className="flex items-center space-x-2 py-2">
                <RadioGroupItem value={theme.id} id={theme.id} />
                <Label 
                  htmlFor={theme.id} 
                  className="flex items-center cursor-pointer py-1 px-2 rounded hover:bg-muted/50 w-full"
                >
                  {theme.icon}
                  <span className="ml-2">{theme.name}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </ScrollArea>
        
        <div>
          <Label className="text-sm flex items-center mb-2">
            <Sparkles className="w-4 h-4 mr-1" />
            Randomness Level: {randomness === 1 ? 'Low' : randomness === 2 ? 'Medium' : 'High'}
          </Label>
          <Slider 
            value={[randomness]} 
            min={1} 
            max={3} 
            step={1} 
            onValueChange={(value) => setRandomness(value[0])}
          />
        </div>
        
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Switch 
              id="include-numbers" 
              checked={includeNumbers}
              onCheckedChange={setIncludeNumbers}
            />
            <Label htmlFor="include-numbers" className="text-sm">Include Numbers</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="include-symbols" 
              checked={includeSymbols}
              onCheckedChange={setIncludeSymbols}
            />
            <Label htmlFor="include-symbols" className="text-sm">Include Symbols</Label>
          </div>
        </div>
        
        <Button 
          onClick={generatePassword} 
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
              <Sparkles className="mr-2" size={16} />
              Generate Themed Password
            </>
          )}
        </Button>
        
        {password && (
          <div className="space-y-3 mt-2">
            <div className="relative">
              <Input 
                value={password} 
                readOnly 
                className="pr-10 font-mono bg-secondary/30 py-5 text-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8"
              >
                {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Theme Security Score:</span>
              <span className={`font-bold ${getScoreColor()}`}>
                {securityScore}/100
              </span>
            </div>
            
            <div className="w-full bg-secondary/30 h-2 rounded-full overflow-hidden">
              <div 
                className={securityScore < 40 ? "bg-red-500" : securityScore < 70 ? "bg-yellow-500" : "bg-green-500"} 
                style={{ width: `${securityScore}%`, height: '100%' }}
              ></div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {themeInsight}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ThemedPasswordGenerator;

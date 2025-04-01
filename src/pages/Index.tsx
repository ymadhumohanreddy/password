import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import HeroSection from "@/components/HeroSection";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import CrackTimeCard from "@/components/CrackTimeCard";
import SuggestionsCard from "@/components/SuggestionsCard";
import SecurityAnalysisCard from "@/components/SecurityAnalysisCard";
import DnaPasswordGenerator from "@/components/DnaPasswordGenerator";
import EntryAnimation from "@/components/EntryAnimation";
import GameModule from "@/components/GameModule";
import PassphraseGenerator from "@/components/PassphraseGenerator";
import ThemedPasswordGenerator from "@/components/ThemedPasswordGenerator";
import SecurityAssistant from "@/components/SecurityAssistant";
import LocalPasswordAnalyzer from "@/components/LocalPasswordAnalyzer";
import PasswordHistory from "@/components/PasswordHistory";
import WizardNavigation from "@/components/WizardNavigation";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Lock, 
  Key, 
  Menu, 
  X,
  Bot,
  Sparkles,
  History,
  Cpu,
  BarChart,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";

const API_ENDPOINT = "http://localhost:5000/analyze";

const Index = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [password, setPassword] = useState("");
  const [passwordData, setPasswordData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showingAnimation, setShowingAnimation] = useState(true);
  const [activeTab, setActiveTab] = useState("analyzer");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasErrorOccurred, setHasErrorOccurred] = useState(false);
  const [isWizardMode, setIsWizardMode] = useState(true);

  const checkPasswordExposure = async (password: string) => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        console.error("Failed to check password exposure");
        return 0;
      }
      
      const text = await response.text();
      const hashes = text.split('\r\n');
      
      for (const hash of hashes) {
        const [hashSuffix, count] = hash.split(':');
        if (hashSuffix.toLowerCase() === suffix.toLowerCase()) {
          return parseInt(count, 10);
        }
      }
      
      return 0;
    } catch (error) {
      console.error("Error checking password exposure:", error);
      return 0;
    }
  };

  const analyzePassword = async () => {
    if (!password) return;
    
    setIsLoading(true);
    let exposureCount = 0;
    let simulationMode = false;
    
    try {
      exposureCount = await checkPasswordExposure(password);
      
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to analyze password");
      }
      
      const data = await response.json();
      
      const processedData = {
        ...data,
        exposureCount,
        securityTips: data.suggestions || []
      };
      
      setPasswordData(processedData);
      
      if (data.compromised) {
        toast({
          title: "Security Alert",
          description: "This password has been found in data breaches!",
          variant: "destructive",
        });
      } else if (exposureCount > 0) {
        toast({
          title: "Security Alert",
          description: `This password was found in ${exposureCount.toLocaleString()} data breaches!`,
          variant: "destructive",
        });
      }
      
      setHasErrorOccurred(false);
    } catch (error) {
      console.error("Error analyzing password:", error);
      
      if (!hasErrorOccurred && isMobile) {
        toast({
          title: "Notice",
          description: "Using local password analysis mode",
          variant: "default",
        });
        setHasErrorOccurred(true);
      }
      
      simulationMode = true;
      simulateAnalysis(exposureCount);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAnalysis = (exposureCount = 0) => {
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    
    let poolSize = 0;
    if (hasLower) poolSize += 26;
    if (hasUpper) poolSize += 26;
    if (hasDigit) poolSize += 10;
    if (hasSpecial) poolSize += 33;
    
    const entropy = Math.round(password.length * Math.log2(poolSize || 1) * 100) / 100;
    
    const commonPasswords = ["password", "123456", "qwerty", "admin", "welcome", "password123"];
    const compromised = commonPasswords.includes(password.toLowerCase());
    
    let strengthText = "Very Weak";
    let score = 0;
    
    if (entropy > 100) {
      strengthText = "Very Strong";
      score = 4;
    } else if (entropy > 80) {
      strengthText = "Strong";
      score = 3;
    } else if (entropy > 60) {
      strengthText = "Moderate";
      score = 2;
    } else if (entropy > 40) {
      strengthText = "Weak";
      score = 1;
    }
    
    const securityAnalysis = [];
    if (!hasUpper) securityAnalysis.push("Using uppercase letters would significantly improve your password security");
    if (!hasLower) securityAnalysis.push("Including lowercase letters would help strengthen your password");
    if (!hasDigit) securityAnalysis.push("Adding numbers would make your password harder to crack");
    if (!hasSpecial) securityAnalysis.push("Special characters (!@#$%) would greatly enhance your password strength");
    if (password.length < 8) securityAnalysis.push("Your password is too short - use at least 8 characters");
    if (commonPasswords.includes(password.toLowerCase())) securityAnalysis.push("This is a commonly used password and very easy to guess");
    
    const securityTips = [
      "Use a combination of letters, numbers, and special characters",
      "Aim for at least 12 characters in your password",
      "Avoid using personal information in your password"
    ];
    
    const getCrackTime = (ent: number) => {
      const times: Record<string, string> = {};
      const speeds = {
        "Online (1k guesses/sec)": 1e3,
        "Fast GPU (1 trillion guesses/sec)": 1e12,
        "Supercomputer (100 trillion/sec)": 1e14
      };
      
      for (const [attack, speed] of Object.entries(speeds)) {
        const crackSeconds = Math.pow(2, ent) / speed;
        
        let timeString;
        if (crackSeconds < 60) {
          timeString = `${crackSeconds.toFixed(2)} sec`;
        } else if (crackSeconds < 3600) {
          timeString = `${(crackSeconds / 60).toFixed(2)} min`;
        } else if (crackSeconds < 86400) {
          timeString = `${(crackSeconds / 3600).toFixed(2)} hr`;
        } else if (crackSeconds < 2592000) {
          timeString = `${(crackSeconds / 86400).toFixed(2)} days`;
        } else if (crackSeconds < 31536000) {
          timeString = `${(crackSeconds / 2592000).toFixed(2)} months`;
        } else {
          timeString = `${(crackSeconds / 31536000).toFixed(2)} years`;
        }
        
        times[attack] = timeString;
      }
      
      return times;
    };
    
    const generateStrongPassword = (length = 16) => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
      return Array(length).fill(0).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    };
    
    const simData = {
      entropy: entropy,
      crackTimes: getCrackTime(entropy),
      hardened: password + "!A9" + password.split("").reverse().join("").substring(0, 3),
      suggestions: [
        generateStrongPassword(),
        generateStrongPassword(),
        generateStrongPassword()
      ],
      compromised: compromised,
      exposureCount: exposureCount,
      strengthText: strengthText,
      score: score,
      securityTips: securityTips,
      security_analysis: securityAnalysis
    };
    
    setPasswordData(simData);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const mobileMenuVariants = {
    closed: { 
      opacity: 0,
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    open: { 
      opacity: 1,
      x: "0%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    }
  };

  useEffect(() => {
    if (passwordData && isWizardMode && activeTab === "analyzer") {
      setActiveTab("suggestions");
    }
  }, [passwordData, isWizardMode, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case "analyzer":
        return (
          <div className="space-y-6">
            <Card className="p-6 mb-8 card-gradient">
              <PasswordInput
                password={password}
                setPassword={setPassword}
                onAnalyze={analyzePassword}
                isLoading={isLoading}
              />
              
              {passwordData && (
                <StrengthMeter 
                  entropy={passwordData.entropy} 
                  compromised={passwordData.compromised}
                  exposureCount={passwordData.exposureCount}
                  strengthText={passwordData.strengthText}
                  score={passwordData.score}
                />
              )}
            </Card>
            
            {passwordData && !isWizardMode && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
              >
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <SecurityAnalysisCard 
                    securityAnalysis={passwordData.security_analysis || []} 
                  />
                  
                  <CrackTimeCard crackTimes={passwordData.crackTimes} />
                </motion.div>
              </motion.div>
            )}
          </div>
        );
      case "suggestions":
        return passwordData ? (
          <SuggestionsCard
            hardened={passwordData.hardened}
            suggestions={passwordData.suggestions}
            securityTips={passwordData.securityTips}
          />
        ) : (
          <Card className="p-6">
            <CardContent className="pt-6 text-center">
              <p>Please analyze a password first to see suggestions.</p>
              <Button 
                onClick={() => setActiveTab("analyzer")} 
                className="mt-4"
                variant="secondary"
              >
                Go to Password Analyzer
              </Button>
            </CardContent>
          </Card>
        );
      case "passphrase":
        return <PassphraseGenerator />;
      case "themed":
        return <ThemedPasswordGenerator />;
      case "assistant":
        return <SecurityAssistant />;
      case "local":
        return <LocalPasswordAnalyzer />;
      case "history":
        return <PasswordHistory />;
      case "dna":
        return <DnaPasswordGenerator />;
      case "game":
        return <GameModule />;
      default:
        return <div>Select a tool to get started</div>;
    }
  };

  return (
    <>
      {showingAnimation && (
        <EntryAnimation onComplete={() => setShowingAnimation(false)} />
      )}
      
      <div className="min-h-screen w-full max-w-7xl mx-auto px-4 pb-16 relative">
        {isMobile && (
          <div className="fixed top-4 right-4 z-50">
            <Button 
              size="icon" 
              variant="outline" 
              className="bg-card/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        )}
        
        <AnimatePresence>
          {isMobile && mobileMenuOpen && (
            <motion.div 
              className="fixed inset-0 z-40 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center"
              variants={mobileMenuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
                <Button 
                  variant={activeTab === "analyzer" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("analyzer")}
                >
                  <Lock className="mr-3 h-5 w-5" /> Password Analyzer
                </Button>
                
                <Button 
                  variant={activeTab === "passphrase" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("passphrase")}
                >
                  <Sparkles className="mr-3 h-5 w-5" /> AI Passphrases
                </Button>
                
                <Button 
                  variant={activeTab === "themed" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("themed")}
                >
                  <BarChart className="mr-3 h-5 w-5" /> Themed Generator
                </Button>
                
                <Button 
                  variant={activeTab === "assistant" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("assistant")}
                >
                  <Bot className="mr-3 h-5 w-5" /> Security Assistant
                </Button>
                
                <Button 
                  variant={activeTab === "local" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("local")}
                >
                  <Cpu className="mr-3 h-5 w-5" /> Local Analyzer
                </Button>
                
                <Button 
                  variant={activeTab === "history" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("history")}
                >
                  <History className="mr-3 h-5 w-5" /> Password History
                </Button>
                
                <Button 
                  variant={activeTab === "dna" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("dna")}
                >
                  <Key className="mr-3 h-5 w-5" /> DNA Password
                </Button>
                
                <Button 
                  variant={activeTab === "game" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("game")}
                >
                  <Gamepad2 className="mr-3 h-5 w-5" /> Password Game
                </Button>
                
                <Separator className="my-2" />
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => setIsWizardMode(!isWizardMode)}
                >
                  <Settings className="mr-3 h-5 w-5" /> 
                  {isWizardMode ? "Switch to Tabs Mode" : "Switch to Wizard Mode"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <HeroSection />
        
        {!isMobile && (
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              onClick={() => setIsWizardMode(!isWizardMode)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {isWizardMode ? "Switch to Tabs Mode" : "Switch to Wizard Mode"}
            </Button>
          </div>
        )}
        
        {isWizardMode ? (
          <div className="w-full mt-6">
            <WizardNavigation 
              activeTab={activeTab} 
              onTabChange={handleTabChange}
              hasPasswordData={!!passwordData}
            />
            {renderContent()}
          </div>
        ) : isMobile ? (
          <div className="w-full mt-6">
            {renderContent()}
          </div>
        ) : (
          <Tabs 
            defaultValue="analyzer" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-8 mb-6 gap-1">
              <TabsTrigger value="analyzer" className="flex items-center">
                <Lock className="mr-2 h-4 w-4" /> Analyzer
              </TabsTrigger>
              <TabsTrigger value="passphrase" className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" /> Passphrases
              </TabsTrigger>
              <TabsTrigger value="themed" className="flex items-center">
                <BarChart className="mr-2 h-4 w-4" /> Themed
              </TabsTrigger>
              <TabsTrigger value="assistant" className="flex items-center">
                <Bot className="mr-2 h-4 w-4" /> Assistant
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center">
                <Cpu className="mr-2 h-4 w-4" /> Local
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center">
                <History className="mr-2 h-4 w-4" /> History
              </TabsTrigger>
              <TabsTrigger value="dna" className="flex items-center">
                <Key className="mr-2 h-4 w-4" /> DNA
              </TabsTrigger>
              <TabsTrigger value="game" className="flex items-center">
                <Gamepad2 className="mr-2 h-4 w-4" /> Game
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {renderContent()}
            </TabsContent>
          </Tabs>
        )}
        
        <Separator className="my-12 opacity-30" />
      </div>
    </>
  );
};

export default Index;

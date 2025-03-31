import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import HeroSection from "@/components/HeroSection";
import PasswordInput from "@/components/PasswordInput";
import StrengthMeter from "@/components/StrengthMeter";
import CrackTimeCard from "@/components/CrackTimeCard";
import SuggestionsCard from "@/components/SuggestionsCard";
import DnaPasswordGenerator from "@/components/DnaPasswordGenerator";
import EntryAnimation from "@/components/EntryAnimation";
import GameModule from "@/components/GameModule";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, 
  Lock, 
  Key, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";

// API endpoint for the Flask backend
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

  // Check if the password has been exposed in data breaches
  const checkPasswordExposure = async (password: string) => {
    try {
      // Convert password to SHA-1 hash
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      
      // Convert hash to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Use k-anonymity: send only first 5 chars of hash
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);
      
      // Call the API
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        console.error("Failed to check password exposure");
        return 0;
      }
      
      // Process response
      const text = await response.text();
      const hashes = text.split('\r\n');
      
      // Look for our hash suffix
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
      // First check for password exposure
      exposureCount = await checkPasswordExposure(password);
      
      // Then analyze password strength
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
      
      // Handle both legacy and enhanced response formats
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
      
      // Reset error flag since we had a successful request
      setHasErrorOccurred(false);
    } catch (error) {
      console.error("Error analyzing password:", error);
      
      // Only show toast for first error on mobile
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
    
    // Determine strength text based on entropy
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
    
    // Generate security tips
    const securityTips = [];
    if (!hasUpper) securityTips.push("Add uppercase letters for better security");
    if (!hasLower) securityTips.push("Add lowercase letters for better security");
    if (!hasDigit) securityTips.push("Add numbers to increase password strength");
    if (!hasSpecial) securityTips.push("Add special characters like !@#$ to significantly improve security");
    if (password.length < 8) securityTips.push("Use at least 8 characters in your password");
    
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
      securityTips: securityTips
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
              <div className="flex flex-col items-center space-y-8 w-full max-w-xs">
                <Button 
                  variant={activeTab === "analyzer" ? "default" : "outline"} 
                  size="lg"
                  className="w-full flex items-center justify-start text-lg"
                  onClick={() => handleTabChange("analyzer")}
                >
                  <Lock className="mr-3 h-5 w-5" /> Password Analyzer
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <HeroSection />
        
        {isMobile ? (
          <div className="w-full mt-6">
            {activeTab === "analyzer" && (
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
                
                {passwordData && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 gap-6"
                  >
                    <motion.div variants={itemVariants}>
                      <CrackTimeCard crackTimes={passwordData.crackTimes} />
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <SuggestionsCard
                        hardened={passwordData.hardened}
                        suggestions={passwordData.suggestions}
                        securityTips={passwordData.securityTips}
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
            
            {activeTab === "dna" && (
              <DnaPasswordGenerator />
            )}
            
            {activeTab === "game" && (
              <GameModule />
            )}
          </div>
        ) : (
          <Tabs 
            defaultValue="analyzer" 
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="analyzer" className="flex items-center">
                <Lock className="mr-2 h-4 w-4" /> Password Analyzer
              </TabsTrigger>
              <TabsTrigger value="dna" className="flex items-center">
                <Key className="mr-2 h-4 w-4" /> DNA Password
              </TabsTrigger>
              <TabsTrigger value="game" className="flex items-center">
                <Gamepad2 className="mr-2 h-4 w-4" /> Password Game
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="analyzer" className="space-y-6">
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
              
              {passwordData && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <CrackTimeCard crackTimes={passwordData.crackTimes} />
                  </motion.div>
                  
                  <motion.div variants={itemVariants} className="md:col-span-2">
                    <SuggestionsCard
                      hardened={passwordData.hardened}
                      suggestions={passwordData.suggestions}
                      securityTips={passwordData.securityTips}
                    />
                  </motion.div>
                </motion.div>
              )}
            </TabsContent>
            
            <TabsContent value="dna">
              <DnaPasswordGenerator />
            </TabsContent>
            
            <TabsContent value="game">
              <GameModule />
            </TabsContent>
          </Tabs>
        )}
        
        <Separator className="my-12 opacity-30" />
      </div>
    </>
  );
};

export default Index;

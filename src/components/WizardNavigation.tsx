import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Sparkles, 
  BarChart, 
  Bot, 
  Cpu, 
  History, 
  Key, 
  Gamepad2,
  HelpCircle
} from "lucide-react";
import { motion } from "framer-motion";

interface WizardNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasPasswordData: boolean;
}

type WizardStep = {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  showOnlyAfterAnalysis?: boolean;
};

const WizardNavigation = ({ activeTab, onTabChange, hasPasswordData }: WizardNavigationProps) => {
  const { toast } = useToast();
  
  const wizardSteps: WizardStep[] = [
    {
      id: "analyzer",
      title: "Password Analyzer",
      icon: <Lock className="h-5 w-5" />,
      description: "Analyze your password's strength and vulnerabilities"
    },
    {
      id: "suggestions",
      title: "Password Suggestions",
      icon: <Sparkles className="h-5 w-5" />,
      description: "Get AI-generated secure password suggestions",
      showOnlyAfterAnalysis: true
    },
    {
      id: "passphrase",
      title: "AI Passphrases",
      icon: <Sparkles className="h-5 w-5" />,
      description: "Generate memorable passphrases using advanced AI"
    },
    {
      id: "themed",
      title: "Themed Generator",
      icon: <BarChart className="h-5 w-5" />,
      description: "Create passwords based on specific themes"
    },
    {
      id: "assistant",
      title: "Security Assistant",
      icon: <Bot className="h-5 w-5" />,
      description: "Chat with our AI assistant about password security"
    },
    {
      id: "local",
      title: "Local Analyzer",
      icon: <Cpu className="h-5 w-5" />,
      description: "Analyze passwords without sending data to servers"
    },
    {
      id: "history",
      title: "Password History",
      icon: <History className="h-5 w-5" />,
      description: "View your password analysis history"
    },
    {
      id: "dna",
      title: "DNA Password",
      icon: <Key className="h-5 w-5" />,
      description: "Generate secure passwords based on your personal information"
    },
    {
      id: "game",
      title: "Password Game",
      icon: <Gamepad2 className="h-5 w-5" />,
      description: "Test your password knowledge with our interactive game"
    }
  ];

  // Keep a consistent list of all steps regardless of password data state
  const allSteps = [...wizardSteps];
  
  // For display and progress bar, filter steps that should be shown
  const visibleSteps = wizardSteps.filter(step => 
    !step.showOnlyAfterAnalysis || (step.showOnlyAfterAnalysis && hasPasswordData)
  );
  
  // Find current step in the COMPLETE list, not filtered list
  const currentStepIndex = allSteps.findIndex(step => step.id === activeTab);
  
  // Navigation should work with the complete list
  const goToPrevStep = () => {
    if (currentStepIndex > 0) {
      // Always go to previous step in the full list
      onTabChange(allSteps[currentStepIndex - 1].id);
    }
  };
  
  const goToNextStep = () => {
    if (currentStepIndex < allSteps.length - 1) {
      // Always go to next step in the full list
      onTabChange(allSteps[currentStepIndex + 1].id);
    } else {
      toast({
        title: "Congratulations!",
        description: "You've completed all steps of the password security wizard.",
      });
    }
  };
  
  // Get current step info for display purposes
  const currentStep = allSteps[currentStepIndex];
  
  // Calculate if first or last for button disabling
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === allSteps.length - 1;
  
  return (
    <div className="mb-8 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {currentStep?.icon}
          <h2 className="text-2xl font-bold">{currentStep?.title}</h2>
        </div>
        
        <div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              toast({
                title: "Wizard Help",
                description: currentStep?.description || "Navigate through our password security tools.",
              });
            }}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="w-full bg-muted rounded-full h-2 mb-6">
        <motion.div 
          className="bg-primary h-2 rounded-full"
          initial={{ width: "0%" }}
          animate={{ 
            width: `${((visibleSteps.findIndex(step => step.id === activeTab) + 1) / visibleSteps.length) * 100}%` 
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-muted-foreground">{currentStep?.description}</p>
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={goToPrevStep}
          disabled={isFirstStep}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-1">
            {visibleSteps.map((step) => (
              <button
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  step.id === activeTab ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => onTabChange(step.id)}
                aria-label={`Go to ${step.title}`}
              />
            ))}
          </div>
        </div>
        
        <Button
          onClick={goToNextStep}
          className="flex items-center"
        >
          {isLastStep ? "Complete" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WizardNavigation;
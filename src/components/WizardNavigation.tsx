import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Bot, 
  Cpu, 
  History, 
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
      id: "game",
      title: "Password Game",
      icon: <Gamepad2 className="h-5 w-5" />,
      description: "Test your password knowledge with our interactive game"
    }
  ];

  const filteredSteps = wizardSteps.filter(step => 
    !step.showOnlyAfterAnalysis || (step.showOnlyAfterAnalysis && hasPasswordData)
  );
  
  const currentStepIndex = filteredSteps.findIndex(step => step.id === activeTab);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === filteredSteps.length - 1;
  
  const goToPrevStep = () => {
    if (!isFirstStep) {
      onTabChange(filteredSteps[currentStepIndex - 1].id);
    }
  };
  
  const goToNextStep = () => {
    if (!isLastStep) {
      onTabChange(filteredSteps[currentStepIndex + 1].id);
    } else {
      toast({
        title: "Congratulations!",
        description: "You've completed all steps of the password security wizard.",
      });
    }
  };
  
  // Find the current step from wizard steps or handle generator buttons separately
  const currentStep = filteredSteps[currentStepIndex] || {
    id: activeTab,
    title: activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
    icon: <Lock className="h-5 w-5" />,
    description: ""
  };
  
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
          animate={{ width: `${((currentStepIndex + 1) / filteredSteps.length) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-muted-foreground">{currentStep?.description}</p>
      
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={goToPrevStep}
          disabled={isFirstStep || !filteredSteps.some(step => step.id === activeTab)}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-1">
            {filteredSteps.map((step, index) => (
              <button
                key={step.id}
                className={`w-2 h-2 rounded-full ${
                  activeTab === step.id ? "bg-primary" : "bg-muted-foreground/30"
                }`}
                onClick={() => onTabChange(step.id)}
                aria-label={`Go to ${step.title}`}
              />
            ))}
          </div>
        </div>
        
        <Button
          onClick={goToNextStep}
          disabled={!filteredSteps.some(step => step.id === activeTab)}
          className="flex items-center"
        >
          {isLastStep ? "Complete" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WizardNavigation;

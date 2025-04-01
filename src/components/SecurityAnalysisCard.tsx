import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, Info, Check, Lock, Globe, BrainCircuit, History } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SecurityAnalysisCardProps {
  securityAnalysis: string[];
}

const SecurityAnalysisCard = ({ securityAnalysis }: SecurityAnalysisCardProps) => {
  // Function to determine icon based on insight content
  const getInsightIcon = (insight: string) => {
    if (insight.includes("would significantly improve") || 
        insight.includes("would greatly enhance") || 
        insight.includes("would help strengthen")) {
      return <AlertTriangle size={14} className="mr-2 mt-1 text-yellow-500" />;
    } else if (insight.includes("too short") || 
               insight.includes("commonly used") || 
               insight.includes("vulnerable") || 
               insight.includes("easy to guess") ||
               insight.includes("data breach") ||
               insight.includes("breaches")) {
      return <Info size={14} className="mr-2 mt-1 text-destructive" />;
    } else if (insight.includes("excellent") || 
               insight.includes("good") || 
               insight.includes("strong")) {
      return <Check size={14} className="mr-2 mt-1 text-green-500" />;
    }
    
    return <AlertTriangle size={14} className="mr-2 mt-1 text-yellow-500" />;
  };
  
  // Group insights by severity
  const categorizeInsights = () => {
    const critical: string[] = [];
    const warnings: string[] = [];
    const improvements: string[] = [];
    
    securityAnalysis.forEach(insight => {
      if (insight.includes("too short") || 
          insight.includes("commonly used") || 
          insight.includes("data breaches") ||
          insight.includes("dictionary") ||
          insight.includes("vulnerable") ||
          insight.includes("breaches")) {
        critical.push(insight);
      } else if (insight.includes("would significantly") ||
                insight.includes("would make") ||
                insight.includes("Adding") ||
                insight.includes("Consider")) {
        improvements.push(insight);
      } else {
        warnings.push(insight);
      }
    });
    
    return { critical, warnings, improvements };
  };
  
  const { critical, warnings, improvements } = categorizeInsights();
  
  // Get a real-world scenario based on password weaknesses
  const getRealWorldScenario = () => {
    if (critical.length > 0) {
      if (critical.some(c => c.includes("data breach") || c.includes("breaches"))) {
        return {
          title: "Data Breach Vulnerability",
          description: "Your password appears in data breaches, which means hackers already have it in their databases. They could use this to access your accounts through credential stuffing attacks.",
          icon: <Globe className="h-4 w-4" />
        };
      } else if (critical.some(c => c.includes("dictionary") || c.includes("commonly used"))) {
        return {
          title: "Dictionary Attack Risk",
          description: "Your password could be cracked in seconds using automated dictionary attacks that try thousands of common passwords per minute.",
          icon: <BrainCircuit className="h-4 w-4" />
        };
      } else if (critical.some(c => c.includes("too short"))) {
        return {
          title: "Brute Force Vulnerability",
          description: "A short password can be cracked by a modern computer trying all possible combinations in minutes to hours rather than years.",
          icon: <Lock className="h-4 w-4" />
        };
      }
    }
    
    return null;
  };
  
  const realWorldScenario = getRealWorldScenario();

  return (
    <Card className="card-gradient card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Shield className="mr-2" size={18} />
          AI Security Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {securityAnalysis && securityAnalysis.length > 0 ? (
            <>
              {realWorldScenario && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="flex items-center font-medium">
                    {realWorldScenario.icon}
                    <span className="ml-1">{realWorldScenario.title}</span>
                  </AlertTitle>
                  <AlertDescription>
                    {realWorldScenario.description}
                  </AlertDescription>
                </Alert>
              )}
              
              {critical.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-destructive mb-2 flex items-center">
                    <Info size={14} className="mr-1" />
                    Critical Issues
                  </h4>
                  <ul className="space-y-2 border-l-2 border-destructive pl-3">
                    {critical.map((insight, index) => (
                      <li key={`critical-${index}`} className="flex items-start">
                        <Info size={14} className="mr-2 mt-1 text-destructive" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {warnings.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-yellow-500 mb-2 flex items-center">
                    <AlertTriangle size={14} className="mr-1" />
                    Security Warnings
                  </h4>
                  <ul className="space-y-2 border-l-2 border-yellow-500 pl-3">
                    {warnings.map((insight, index) => (
                      <li key={`warning-${index}`} className="flex items-start">
                        <AlertTriangle size={14} className="mr-2 mt-1 text-yellow-500" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {improvements.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-blue-500 mb-2 flex items-center">
                    <Info size={14} className="mr-1" />
                    Recommended Improvements
                  </h4>
                  <ul className="space-y-2 border-l-2 border-blue-500 pl-3">
                    {improvements.map((insight, index) => (
                      <li key={`improvement-${index}`} className="flex items-start">
                        <Info size={14} className="mr-2 mt-1 text-blue-500" />
                        <span className="text-sm">{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No security concerns were found with this password. However, remember to use unique passwords for each account and change them periodically.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAnalysisCard;

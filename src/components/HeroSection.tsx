
import { ShieldCheck, ShieldAlert, Lock } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative py-10 md:py-16 text-center">
      <div className="absolute inset-0 bg-grid -z-10"></div>
      
      {/* Animated floating elements */}
      <div className="absolute -z-5 top-0 left-10 text-primary/20 animate-float" style={{ animationDelay: "0s" }}>
        <ShieldCheck size={60} />
      </div>
      <div className="absolute -z-5 bottom-10 right-10 text-destructive/20 animate-float" style={{ animationDelay: "1s" }}>
        <ShieldAlert size={40} />
      </div>
      <div className="absolute -z-5 top-1/2 right-1/4 text-primary/20 animate-float" style={{ animationDelay: "2s" }}>
        <Lock size={30} />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">
        <span className="text-primary">Password</span> Palooza
      </h1>
      
      <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
        Test the strength of your passwords and discover how quickly they could be hacked in this interactive analysis tool
      </p>
      
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-muted/30 text-sm text-muted-foreground">
        <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
        Powered by advanced security algorithms
      </div>
    </div>
  );
};

export default HeroSection;

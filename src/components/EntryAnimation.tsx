
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

interface EntryAnimationProps {
  onComplete: () => void;
}

const EntryAnimation = ({ onComplete }: EntryAnimationProps) => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      const fadeTimer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(fadeTimer);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-background flex items-center justify-center z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: animationComplete ? 0 : 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0, -10, 0],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop" 
          }}
          className="text-primary mb-4"
        >
          <ShieldCheck size={80} />
        </motion.div>
        
        <motion.h1
          className="text-3xl font-bold mb-2"
          animate={{ 
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop" 
          }}
        >
          Password Palooza
        </motion.h1>
        
        <p className="text-muted-foreground">Loading security tools...</p>
      </motion.div>
    </motion.div>
  );
};

export default EntryAnimation;

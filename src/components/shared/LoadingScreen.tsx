"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Satellite, ShieldCheck, Database, Zap } from "lucide-react";

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  
  const steps = [
    { text: "Initializing AI Core...", icon: Zap },
    { text: "Loading Terrain Models...", icon: Database },
    { text: "Connecting Mission Control...", icon: Satellite },
    { text: "Systems Ready.", icon: ShieldCheck },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800); // Wait briefly at 100%
          return 100;
        }
        
        // Update step based on progress
        if (prev === 25) setStep(1);
        if (prev === 60) setStep(2);
        if (prev === 90) setStep(3);
        
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, [onComplete]);

  const CurrentIcon = steps[step].icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-space-black"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-electric-blue/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-md w-full px-6">
          {/* Central Logo Animation */}
          <motion.div 
            animate={{ 
              rotate: 360,
              boxShadow: [
                "0 0 20px rgba(0, 240, 255, 0.2)",
                "0 0 60px rgba(0, 240, 255, 0.5)",
                "0 0 20px rgba(0, 240, 255, 0.2)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-24 h-24 rounded-full border border-electric-blue/50 flex items-center justify-center mb-8 bg-dark-navy/50 backdrop-blur-md"
          >
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Moon className="w-10 h-10 text-electric-blue" />
            </motion.div>
          </motion.div>

          <h1 className="font-heading text-3xl font-bold tracking-widest mb-12 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
            LUNASAFE
          </h1>

          {/* Progress Section */}
          <div className="w-full space-y-4">
            <div className="flex justify-between items-end font-mono text-sm">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-electric-blue"
              >
                <CurrentIcon className="w-4 h-4" />
                {steps[step].text}
              </motion.div>
              <span className="text-white/70">{progress}%</span>
            </div>
            
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden relative">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-electric-blue shadow-[0_0_10px_rgba(0,240,255,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

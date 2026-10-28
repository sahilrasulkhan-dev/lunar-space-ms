"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Radar, Map as MapIcon, Orbit } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { NeonButton } from "@/components/ui/NeonButton";
import { LoadingScreen } from "@/components/shared/LoadingScreen";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  if (loading) {
    return <LoadingScreen onComplete={() => setLoading(false)} />;
  }

  return (
    <main className="min-h-screen relative overflow-hidden flex flex-col">
      <Navbar />
      
      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {/* Animated Moon Base */}
        <motion.div 
          className="absolute -bottom-[40vh] left-1/2 -translate-x-1/2 w-[150vw] h-[150vw] max-w-[1600px] max-h-[1600px] rounded-full"
          style={{ y: y1 }}
        >
          {/* Moon Surface Texture Mock */}
          <div className="absolute inset-0 rounded-full bg-[#111] shadow-[inset_0_-40px_100px_rgba(0,0,0,1)] overflow-hidden">
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[url('https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center" />
            <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-electric-blue/10 to-transparent" />
          </div>
          
          {/* Glowing Grid overlay */}
          <div 
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
              transform: 'perspective(1000px) rotateX(75deg) scale(1.5)',
              transformOrigin: 'top center'
            }}
          />
        </motion.div>

        {/* Orbiting Satellite Animation */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-electric-blue shadow-[0_0_15px_rgba(0,240,255,1)]" />
        </motion.div>
      </div>

      {/* Hero Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-20 px-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto"
          style={{ opacity }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-electric-blue/30 bg-electric-blue/5 mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
            <span className="text-sm font-mono text-electric-blue tracking-wider uppercase">Mission Control Online</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Next-Gen Lunar
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-blue via-white to-neon-purple">
              Surface Intelligence
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            AI-powered lunar terrain analysis and safe rover navigation system.
            Identify craters, calculate slopes, and chart optimal paths with unprecedented accuracy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/dashboard">
              <NeonButton size="lg" className="w-full sm:w-auto">
                <Radar className="w-5 h-5" />
                Initialize Analysis
              </NeonButton>
            </Link>
            <Link href="#features">
              <NeonButton variant="outline" size="lg" className="w-full sm:w-auto">
                Explore Mission <ArrowRight className="w-5 h-5 ml-2" />
              </NeonButton>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Floating Info Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 pb-20 z-10"
        style={{ y: y2 }}
      >
        {[
          { title: "Terrain Mapping", desc: "Real-time surface classification and anomaly detection.", icon: MapIcon, delay: 0.4 },
          { title: "Hazard Avoidance", desc: "Predictive obstacle detection using advanced neural nets.", icon: Radar, delay: 0.5 },
          { title: "Path Optimization", desc: "Energy-efficient route calculation for lunar rovers.", icon: Orbit, delay: 0.6 },
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: feature.delay }}
            className="glass-card p-6 border-white/5 hover:border-electric-blue/30 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-electric-blue/10 group-hover:border-electric-blue/30 transition-colors">
              <feature.icon className="w-6 h-6 text-electric-blue" />
            </div>
            <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </main>
  );
}

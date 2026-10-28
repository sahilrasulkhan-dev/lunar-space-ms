"use client";

import { motion } from "framer-motion";
import { Mountain, Target, ShieldAlert, Activity } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface TerrainInfoProps {
  data: {
    landing_score: number;
    safe_percentage: number;
    unsafe_percentage: number;
    terrain_type: string;
    confidence: number;
  };
}

export function TerrainInfo({ data }: TerrainInfoProps) {
  const stats = [
    { label: "Safe Zone", value: `${data.safe_percentage}%`, score: "High", icon: Mountain, color: "text-emerald-400" },
    { label: "Hazard Zone", value: `${data.unsafe_percentage}%`, score: "Critical", icon: Activity, color: "text-red-500" },
    { label: "Terrain Type", value: data.terrain_type, score: "Identified", icon: Target, color: "text-orange-400" },
    { label: "Landing Score", value: `${data.landing_score}/100`, score: "Optimal", icon: ShieldAlert, color: "text-electric-blue" },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = { hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <motion.div key={i} variants={item}>
          <GlassCard className="p-4 h-full" glowColor="cyan">
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-mono text-white/40">{stat.score}</span>
            </div>
            <h4 className="text-white/60 text-sm mb-1">{stat.label}</h4>
            <div className="font-heading font-semibold text-lg">{stat.value}</div>
          </GlassCard>
        </motion.div>
      ))}
      
      <motion.div variants={item} className="col-span-2 mt-2">
        <GlassCard className="p-5 border-emerald-400/30 bg-emerald-400/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h4 className="font-heading text-emerald-400">AI Recommendation</h4>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            AI analysis complete with {data.confidence}% confidence. 
            {data.landing_score > 70 
              ? " Landing conditions are optimal. Extensive safe zones mapped."
              : " Landing conditions are hazardous. High density of craters and rocks detected."}
          </p>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}

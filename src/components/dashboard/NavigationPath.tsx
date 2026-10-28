"use client";

import { useEffect, useState } from "react";
import { Route, Battery, Zap, Clock, ShieldAlert } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";

export function NavigationPath() {
  const [navStats, setNavStats] = useState({
    distance: 0,
    risk_score: 0,
    energy_estimation: 0
  });

  useEffect(() => {
    const handleNavData = (e: any) => {
      setNavStats(e.detail);
    };
    window.addEventListener('navigation_calculated', handleNavData);
    return () => window.removeEventListener('navigation_calculated', handleNavData);
  }, []);

  const stats = [
    { label: "Est. Distance", value: `${navStats.distance} m`, icon: Route, color: "text-electric-blue" },
    { label: "Energy Usage", value: `${navStats.energy_estimation} kWh`, icon: Battery, color: "text-orange-400" },
    { label: "Risk Score", value: `${navStats.risk_score}/100`, icon: ShieldAlert, color: "text-emerald-400" },
  ];

  return (
    <div className="space-y-4">
      <GlassCard className="p-5" glowColor="cyan">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2 mb-6">
          <Zap className="w-5 h-5 text-electric-blue" />
          Path Analytics
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white/5 rounded-xl p-3 border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-white/50">{stat.label}</span>
              </div>
              <div className="font-mono text-lg font-semibold">{stat.value}</div>
            </div>
          ))}
        </div>

        <NeonButton className="w-full" disabled={navStats.distance === 0}>
          {navStats.distance > 0 ? "Transmit Route to Rover" : "Calculating Path..."}
        </NeonButton>
      </GlassCard>
    </div>
  );
}

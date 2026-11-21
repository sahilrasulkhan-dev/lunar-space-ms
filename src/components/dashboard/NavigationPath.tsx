"use client";

import { useEffect, useState } from "react";
import { Route, Battery, Zap, ShieldAlert, Send, Check } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";

export function NavigationPath() {
  const [navStats, setNavStats] = useState({
    distance: 1140,
    risk_score: 12,
    energy_estimation: 3.4
  });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [transmitted, setTransmitted] = useState(false);

  useEffect(() => {
    const handleNavData = (e: any) => {
      if (e.detail) {
        setNavStats({
          distance: e.detail.distance || 1140,
          risk_score: e.detail.risk_score || 12,
          energy_estimation: e.detail.energy_estimation || 3.4
        });
      }
    };
    window.addEventListener("navigation_calculated", handleNavData);
    return () => window.removeEventListener("navigation_calculated", handleNavData);
  }, []);

  const handleTransmit = () => {
    setIsTransmitting(true);
    setTimeout(() => {
      setIsTransmitting(false);
      setTransmitted(true);
      setTimeout(() => setTransmitted(false), 4000);
    }, 1000);
  };

  const stats = [
    { 
      label: "Calculated Distance", 
      value: `${navStats.distance} m`, 
      sub: "Traverse Length", 
      icon: Route, 
      color: "text-[#F4F7FC]" 
    },
    { 
      label: "Energy Requirement", 
      value: `${navStats.energy_estimation} kWh`, 
      sub: "48V Battery Pack", 
      icon: Battery, 
      color: "text-[#A8C4E6]" 
    },
    { 
      label: "Terrain Hazard Index", 
      value: `${navStats.risk_score}/100`, 
      sub: "Grade Tolerance", 
      icon: ShieldAlert, 
      color: navStats.risk_score < 25 ? "text-emerald-400" : "text-amber-400" 
    },
  ];

  return (
    <GlassCard className="p-6 space-y-6" variant="editorial">
      <div className="flex justify-between items-center pb-3 border-b border-[rgba(160,195,240,0.14)]">
        <h3 className="font-mono text-sm md:text-base uppercase tracking-wider font-bold text-[#F4F7FC] flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#A8C4E6]" />
          Rover Mission Telemetry
        </h3>
        <span className="font-mono text-xs text-emerald-400 uppercase font-semibold">UPLINK OK</span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-[rgba(160,195,240,0.14)] flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#84A0C6]/10 border border-[#84A0C6]/25">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-xs font-mono text-[#8292A8] uppercase">{stat.sub}</div>
                <div className="text-sm font-mono text-[#B4C2D6] font-medium">{stat.label}</div>
              </div>
            </div>
            <div className="font-mono text-lg md:text-xl font-bold text-[#F4F7FC]">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2">
        <NeonButton 
          onClick={handleTransmit}
          disabled={isTransmitting || transmitted}
          variant="primary" 
          size="md" 
          cursorText="TRANSMIT"
          className="w-full justify-center text-xs md:text-sm font-semibold"
        >
          {transmitted ? (
            <>
              <Check className="w-4 h-4 mr-1 text-emerald-600" />
              Route Transmitted to Rover
            </>
          ) : isTransmitting ? (
            "Uplinking Waypoints..."
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Transmit Route to Surface Rover
            </>
          )}
        </NeonButton>
      </div>

      <div className="text-xs font-mono text-[#8292A8] text-center">
        DIRECT TO RF LINK // 2.4 GHZ DEEP SPACE TRANSPONDER
      </div>
    </GlassCard>
  );
}

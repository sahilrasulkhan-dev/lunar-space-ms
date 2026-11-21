"use client";

import { motion } from "framer-motion";
import { Mountain, Target, ShieldAlert, Activity, CheckCircle, AlertTriangle } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface TerrainInfoProps {
  data: {
    landing_score: number;
    safe_percentage: number;
    unsafe_percentage: number;
    rock_percentage?: number;
    crater_percentage?: number;
    terrain_type: string;
    confidence: number;
    yolo_detections_count?: number;
    model_name?: string;
  };
}

export function TerrainInfo({ data }: TerrainInfoProps) {
  const isOptimal = data.landing_score >= 65;
  const rockPct = data.rock_percentage !== undefined ? data.rock_percentage : data.unsafe_percentage;
  const isHighRockHazard = rockPct > 20;

  // Clear, comfortably readable text metrics (13px/14px labels, 24px numbers)
  const stats = [
    { 
      label: "Safe Touchdown Zone", 
      value: `${data.safe_percentage}%`, 
      metric: "Verified Surface", 
      icon: Mountain, 
      color: "text-emerald-400",
      border: "border-emerald-500/30"
    },
    { 
      label: "Rock & Boulder Field", 
      value: `${rockPct}%`, 
      metric: isHighRockHazard ? "SIREN ACTIVE (>20%)" : "Exclusion Field", 
      icon: Activity, 
      color: isHighRockHazard ? "text-rose-400 animate-pulse font-bold" : "text-rose-400",
      border: isHighRockHazard ? "border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.3)] bg-rose-950/20" : "border-rose-500/30"
    },
    { 
      label: "Geological Type", 
      value: data.terrain_type, 
      metric: "Regolith Matrix", 
      icon: Target, 
      color: "text-[#A8C4E6]",
      border: "border-[rgba(160,195,240,0.2)]"
    },
    { 
      label: "Landing Feasibility", 
      value: `${data.landing_score}/100`, 
      metric: isOptimal ? "GO FOR TOUCHDOWN" : "CAUTION ADVISED", 
      icon: ShieldAlert, 
      color: isOptimal ? "text-[#F4F7FC]" : "text-amber-300",
      border: "border-[rgba(160,195,240,0.25)]"
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <GlassCard key={i} className={`p-4 md:p-5 h-full border ${stat.border}`} variant="editorial">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-lg bg-[#84A0C6]/10 border border-[#84A0C6]/25">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-xs font-mono text-[#8292A8] tracking-wider uppercase font-medium">
                {stat.metric}
              </span>
            </div>
            <div className="text-xs md:text-sm font-mono text-[#B4C2D6] uppercase tracking-wider mb-1 font-medium">
              {stat.label}
            </div>
            <div className="font-mono font-bold text-xl md:text-2xl text-[#F4F7FC] tracking-tight">
              {stat.value}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* AI Scientific Synthesis - Enhanced Readability */}
      <GlassCard className="p-5 md:p-6 border border-[rgba(160,195,240,0.2)] bg-[#84A0C6]/5" variant="editorial">
        <div className="flex flex-wrap items-center gap-2.5 mb-3 pb-2.5 border-b border-[rgba(160,195,240,0.12)]">
          {isOptimal ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <h4 className="font-mono text-sm font-bold uppercase tracking-wider text-[#F4F7FC]">
            Autonomous Mission Synthesis
          </h4>
          <div className="ml-auto flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/30 font-mono text-[11px] text-[#00F0FF] font-semibold">
              {data.model_name || "YOLO (best.pt)"}
            </span>
            <span className="font-mono text-xs text-[#A8C4E6] font-semibold">
              CONFIDENCE: {data.confidence}%
            </span>
          </div>
        </div>

        <p className="text-sm md:text-base text-[#B4C2D6] leading-relaxed font-sans">
          Surface classification completed with <strong className="text-[#F4F7FC] font-semibold">{data.confidence}%</strong> neural model certainty using <strong className="text-[#00F0FF] font-semibold">{data.model_name || "YOLO (best.pt)"}</strong>
          {data.yolo_detections_count !== undefined && (
            <span> ({data.yolo_detections_count} lunar hazard feature{data.yolo_detections_count === 1 ? "" : "s"} isolated)</span>
          )}.
          {isOptimal 
            ? " Landing corridor parameters meet Apollo/Artemis Class-A tolerances. Low roughness index detected with ample contiguous safe zones."
            : " Terrain exhibits elevated crater density and steep rock scatter. Recommend re-orienting landing thrusters toward adjacent low-slope mare basalt."}
        </p>
      </GlassCard>
    </div>
  );
}

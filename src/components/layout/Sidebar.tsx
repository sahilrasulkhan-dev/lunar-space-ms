"use client";

import { Activity, AlertTriangle, CheckCircle2, Info, Radio, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error";
  tag: string;
  message: string;
  time: string;
}

export function Sidebar() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", type: "info", tag: "CORE", message: "Lunar Space AI telemetry engine initialized", time: "00:00:01" },
    { id: "2", type: "success", tag: "DSN", message: "Deep Space Network downlink locked (Ka-Band)", time: "00:00:04" },
    { id: "3", type: "info", tag: "ORBIT", message: "LRO orbit altitude stable at 50.4 km circular", time: "00:02:18" },
    { id: "4", type: "warning", tag: "SENSOR", message: "Thermal sensor delta detected in PSR shadow rim", time: "00:08:42" },
    { id: "5", type: "success", tag: "AI", message: "Optical surface segmentation models primed", time: "00:14:05" },
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const icons = {
    info: <Info className="w-4 h-4 text-[#A8C4E6]" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    error: <Activity className="w-4 h-4 text-rose-400" />,
  };

  return (
    <div className="w-88 hidden xl:flex flex-col h-full border-l border-[rgba(160,195,240,0.14)] bg-[#070D1A]/95 backdrop-blur-2xl pt-20 pb-5 px-5 font-mono">
      {/* Header - Comfortable Readability */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[rgba(160,195,240,0.14)] px-1">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-[#A8C4E6] animate-pulse" />
          <h2 className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-[#F4F7FC]">
            Mission Telemetry Log
          </h2>
        </div>
        <span className="text-xs font-semibold text-emerald-400">LIVE</span>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#070D1A] to-transparent z-10 pointer-events-none" />
        <div ref={scrollRef} className="h-full overflow-y-auto pr-1.5 space-y-3 pb-2">
          {logs.map((log) => (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id}
              className="p-3.5 rounded bg-white/[0.03] border border-[rgba(160,195,240,0.12)] text-xs hover:border-[#84A0C6]/40 transition-all"
            >
              <div className="flex items-center justify-between mb-1.5 text-xs text-[#8292A8]">
                <div className="flex items-center gap-1.5">
                  {icons[log.type]}
                  <span className="text-[#A8C4E6] font-semibold">[{log.tag}]</span>
                </div>
                <span className="font-mono">{log.time}</span>
              </div>
              <p className="text-[#E2ECF8] leading-relaxed font-sans text-xs md:text-sm">{log.message}</p>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#070D1A] to-transparent z-10 pointer-events-none" />
      </div>

      {/* Mission Diagnostics Card */}
      <div className="mt-4 pt-3.5 border-t border-[rgba(160,195,240,0.14)] space-y-3">
        <div className="p-3.5 rounded bg-white/[0.03] border border-[rgba(160,195,240,0.14)] text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#B4C2D6] text-xs font-medium">System Integrity</span>
            <span className="text-emerald-400 font-bold text-sm">99.2%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[99.2%] shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          </div>
        </div>

        <div className="p-3.5 rounded bg-white/[0.03] border border-[rgba(160,195,240,0.14)] text-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#B4C2D6] text-xs font-medium">Orbiter Uplink (Ka-Band)</span>
            <span className="text-[#A8C4E6] font-bold text-sm">-62 dBm</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#84A0C6] w-[88%] shadow-[0_0_8px_rgba(132,160,200,0.6)]" />
          </div>
        </div>
      </div>
    </div>
  );
}

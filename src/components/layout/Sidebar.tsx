"use client";

import { Activity, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";

interface LogEntry {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  time: string;
}

export function Sidebar() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", type: "info", message: "System initialized", time: "00:00:01" },
    { id: "2", type: "success", message: "Uplink established", time: "00:00:05" },
    { id: "3", type: "warning", message: "Solar flare detected", time: "00:12:43" },
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const icons = {
    info: <Info className="w-4 h-4 text-electric-blue" />,
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    warning: <AlertTriangle className="w-4 h-4 text-orange-400" />,
    error: <Activity className="w-4 h-4 text-red-500" />,
  };

  return (
    <div className="w-80 hidden xl:flex flex-col h-full border-l border-white/5 bg-[#050816]/80 backdrop-blur-md pt-24 pb-6 px-4">
      <div className="flex items-center gap-2 mb-6 px-2">
        <Activity className="w-5 h-5 text-electric-blue" />
        <h2 className="font-heading font-semibold text-lg">Mission Log</h2>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-[#050816] to-transparent z-10" />
        <div ref={scrollRef} className="h-full overflow-y-auto pr-2 space-y-3 pb-4">
          {logs.map((log) => (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id}
              className="p-3 rounded-lg bg-white/5 border border-white/5 flex gap-3 text-sm"
            >
              <div className="mt-0.5">{icons[log.type]}</div>
              <div>
                <p className="text-white/90 leading-tight mb-1">{log.message}</p>
                <p className="text-white/40 font-mono text-xs">{log.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-[#050816] to-transparent z-10" />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5">
        <GlassCard variant="subtle" className="p-4" glowColor="blue">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/70">System Health</span>
            <span className="text-emerald-400 font-mono text-sm">98.5%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-[98.5%] shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

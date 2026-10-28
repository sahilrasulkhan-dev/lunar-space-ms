"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline" | "warning" | "error" | "processing" | "safe";
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const styles = {
    online: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
    safe: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]",
    offline: "text-white/50 bg-white/5 border-white/10",
    warning: "text-orange-400 bg-orange-400/10 border-orange-400/30 shadow-[0_0_10px_rgba(251,146,60,0.2)]",
    error: "text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_10px_rgba(248,113,113,0.2)]",
    processing: "text-electric-blue bg-electric-blue/10 border-electric-blue/30 shadow-[0_0_10px_rgba(0,240,255,0.2)]",
  };

  const indicatorStyles = {
    online: "bg-emerald-400",
    safe: "bg-emerald-400",
    offline: "bg-white/50",
    warning: "bg-orange-400 animate-pulse",
    error: "bg-red-400 animate-pulse",
    processing: "bg-electric-blue animate-pulse",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-mono font-medium", styles[status], className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", indicatorStyles[status])} />
      {label}
    </div>
  );
}

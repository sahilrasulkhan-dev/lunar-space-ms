"use client";

import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "online" | "offline" | "warning" | "error" | "processing" | "safe";
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  // Comfortable 12px font-mono with clear contrast
  const styles = {
    online: "text-emerald-300 bg-emerald-950/50 border-emerald-500/30",
    safe: "text-emerald-300 bg-emerald-950/50 border-emerald-500/30",
    offline: "text-[#8292A8] bg-white/[0.04] border-white/10",
    warning: "text-amber-200 bg-amber-950/50 border-amber-500/35",
    error: "text-rose-300 bg-rose-950/50 border-rose-500/35",
    processing: "text-[#B8D4F5] bg-[#84A0C6]/15 border-[#84A0C6]/40 shadow-[0_0_12px_rgba(100,160,240,0.15)]",
  };

  const indicatorStyles = {
    online: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]",
    safe: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]",
    offline: "bg-[#8292A8]",
    warning: "bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]",
    error: "bg-rose-400 animate-pulse shadow-[0_0_6px_rgba(251,113,133,0.8)]",
    processing: "bg-[#B8D4F5] animate-pulse shadow-[0_0_6px_rgba(184,212,245,0.8)]",
  };

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded border text-xs font-mono tracking-wider uppercase font-medium backdrop-blur-md", styles[status], className)}>
      <span className={cn("w-2 h-2 rounded-full", indicatorStyles[status])} />
      <span>{label}</span>
    </div>
  );
}

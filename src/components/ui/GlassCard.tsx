"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: "blue" | "cyan" | "purple" | "red" | "green" | "orange";
  variant?: "default" | "panel" | "subtle";
}

export function GlassCard({
  children,
  className,
  glowColor = "blue",
  variant = "default",
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-dark-navy/40 backdrop-blur-lg border border-white/10 rounded-2xl",
    panel: "bg-[#050816]/70 backdrop-blur-xl border border-white/5 rounded-3xl",
    subtle: "bg-white/5 backdrop-blur-md border border-white/5 rounded-xl",
  };

  const glowStyles = {
    blue: "hover:border-electric-blue/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.15)]",
    cyan: "hover:border-neon-cyan/50 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]",
    purple: "hover:border-neon-purple/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.15)]",
    red: "hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
    green: "hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    orange: "hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variantStyles[variant],
        glowStyles[glowColor],
        className
      )}
      {...props}
    >
      {/* Internal subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

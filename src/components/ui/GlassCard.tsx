"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: "blue" | "cyan" | "purple" | "red" | "green" | "orange" | "white" | "none";
  variant?: "default" | "panel" | "subtle" | "editorial";
}

export function GlassCard({
  children,
  className,
  glowColor = "none",
  variant = "default",
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-[#0B1220]/84 backdrop-blur-xl border border-[rgba(160,195,240,0.12)] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
    panel: "bg-[#080E1C]/92 backdrop-blur-2xl border border-[rgba(160,195,240,0.14)] rounded-xl shadow-[0_12px_44px_rgba(0,0,0,0.8)]",
    subtle: "bg-white/[0.03] backdrop-blur-md border border-[rgba(160,195,240,0.08)] rounded-lg",
    editorial: "bg-[#091122]/90 backdrop-blur-xl border border-[rgba(160,195,240,0.14)] rounded-xl relative",
  };

  const glowStyles = {
    none: "hover:border-[rgba(180,215,255,0.3)] transition-all duration-300",
    white: "hover:border-white/40 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300",
    blue: "hover:border-[#84A0C6]/60 hover:shadow-[0_0_35px_rgba(100,160,240,0.18)] transition-all duration-300",
    cyan: "hover:border-[#B8D4F5]/50 hover:shadow-[0_0_35px_rgba(140,190,250,0.16)] transition-all duration-300",
    purple: "hover:border-[#9FBAD8]/50 hover:shadow-[0_0_35px_rgba(132,165,225,0.16)] transition-all duration-300",
    red: "hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.12)] transition-all duration-300",
    green: "hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.12)] transition-all duration-300",
    orange: "hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.12)] transition-all duration-300",
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
      {/* Subtle top border highlight line with cosmic blue tint */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#84A0C6]/25 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

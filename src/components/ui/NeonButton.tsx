"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost" | "editorial";
  size?: "sm" | "md" | "lg" | "icon";
  glow?: boolean;
  cursorText?: string;
}

export function NeonButton({
  children,
  className,
  variant = "primary",
  size = "md",
  glow = false,
  cursorText,
  ...props
}: NeonButtonProps) {
  // Comfortable, clearly readable typography with responsive scaling
  const baseStyles = "relative inline-flex items-center justify-center font-mono font-medium tracking-wider uppercase transition-all duration-200 select-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[#F4F7FC] text-[#05070D] hover:bg-white hover:shadow-[0_0_25px_rgba(160,205,255,0.35)] border border-white font-semibold",
    secondary: "bg-[#0B1426]/90 border border-[#84A0C6]/30 text-[#F4F7FC] hover:bg-[#84A0C6]/15 hover:border-[#A8C4E6]/60 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4)]",
    outline: "border border-[#84A0C6]/40 text-[#F4F7FC] hover:bg-[#84A0C6]/10 hover:border-[#A8C4E6]/80 backdrop-blur-sm",
    danger: "bg-rose-950/40 border border-rose-500/40 text-rose-200 hover:bg-rose-900/50 hover:border-rose-400",
    ghost: "text-[#B4C2D6] hover:text-[#F4F7FC] hover:bg-[#84A0C6]/10 border border-transparent",
    editorial: "bg-[#09101F] border border-[#84A0C6]/40 text-[#F4F7FC] hover:border-[#B8D4F5] hover:shadow-[0_0_25px_rgba(132,165,225,0.22)]",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs rounded",
    md: "h-11 px-6 text-sm rounded",
    lg: "h-13 px-8 text-sm md:text-base rounded-md",
    icon: "h-10 w-10 rounded flex items-center justify-center",
  };

  const glowStyle = glow ? "shadow-[0_0_20px_rgba(132,165,225,0.3)]" : "";

  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      data-cursor-text={cursorText}
      className={cn(baseStyles, variants[variant], sizes[size], glowStyle, className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

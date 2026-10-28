"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  glow?: boolean;
}

export function NeonButton({
  children,
  className,
  variant = "primary",
  size = "md",
  glow = true,
  ...props
}: NeonButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-heading font-medium tracking-wide transition-all duration-300 overflow-hidden";
  
  const variants = {
    primary: "bg-electric-blue text-[#050816] hover:bg-white hover:text-[#050816]",
    secondary: "bg-dark-navy border border-electric-blue/30 text-white hover:bg-electric-blue/10 hover:border-electric-blue",
    outline: "border-2 border-electric-blue text-electric-blue hover:bg-electric-blue/10",
    danger: "bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
    ghost: "text-white/70 hover:text-white hover:bg-white/5",
  };

  const sizes = {
    sm: "h-9 px-4 text-xs rounded-lg",
    md: "h-11 px-6 text-sm rounded-xl",
    lg: "h-14 px-8 text-base rounded-2xl",
    icon: "h-10 w-10 rounded-xl",
  };

  const glowStyle = glow && variant === "primary" ? "shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)]" : "";
  const secondaryGlowStyle = glow && (variant === "secondary" || variant === "outline") ? "hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]" : "";

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(baseStyles, variants[variant], sizes[size], glowStyle, secondaryGlowStyle, className)}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}

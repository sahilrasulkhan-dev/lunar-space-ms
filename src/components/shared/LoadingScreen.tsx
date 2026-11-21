"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  "INITIALIZING LUNAR CORE SYSTEMS...",
  "SYNCHRONIZING ORBITAL TELEMETRY...",
  "CALIBRATING SPECTRAL SENSORS...",
  "ALL SYSTEMS OPERATIONAL",
];

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [exiting, setExiting] = useState(false);

  const finish = useCallback(() => {
    setExiting(true);
    setTimeout(onComplete, 900);
  }, [onComplete]);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const duration = 2200; // ms total loading time

    const tick = (now: number) => {
      if (!start) start = now;
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);

      if (pct < 25) setStep(0);
      else if (pct < 55) setStep(1);
      else if (pct < 85) setStep(2);
      else setStep(3);

      if (pct >= 100) {
        finish();
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [finish]);

  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] } }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "#030508" }}
        >
          {/* ── Deep space starfield ── */}
          <div className="absolute inset-0 stars-bg opacity-50 pointer-events-none" />

          {/* ── Atmospheric blue radial glows ── */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 60% 55% at 50% 65%, rgba(80,135,220,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 50% 50%, rgba(50,90,170,0.10) 0%, transparent 65%)",
            }}
          />

          {/* ── Outlined watermark text ── */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <motion.span
              initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 0.08, scale: 1 }}
              transition={{ duration: 1.4, delay: 0.3, ease: "easeOut" }}
              className="text-[22vw] sm:text-[18vw] font-black tracking-tighter outlined-text uppercase leading-none whitespace-nowrap"
            >
              LUNAR
            </motion.span>
          </div>

          {/* ── Moon with atmospheric halo ── */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 mb-8 flex-shrink-0"
          >
            {/* Outer atmospheric halo */}
            <div
              className="absolute inset-[-30%] rounded-full pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(100,165,245,0.12) 20%, rgba(60,110,190,0.06) 45%, transparent 70%)",
              }}
            />

            {/* Moon sphere */}
            <div className="absolute inset-0 rounded-full overflow-hidden bg-[#0C1522] border border-[rgba(180,210,255,0.3)] shadow-[0_0_60px_rgba(100,165,245,0.18),0_0_120px_rgba(70,120,200,0.08)]">
              {/* Gradient surface texture */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 38% 35%, #3A4560 0%, #1A2235 40%, #0A1020 80%)",
                }}
              />
              {/* Terminator shadow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/90" />
              {/* Top rim light */}
              <div className="absolute top-0 inset-x-0 h-1/3 bg-gradient-to-b from-[rgba(180,215,255,0.22)] to-transparent" />
            </div>

            {/* Slow floating animation */}
            {!prefersReducedMotion && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </motion.div>

          {/* ── Branding ── */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative z-10 text-center mb-8 px-4"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-[0.25em] text-[#F2F2F2] uppercase mb-2">
              LUNAR SPACE AI
            </h1>
            <div className="text-[11px] sm:text-xs font-mono tracking-[0.35em] text-[#8496B4] uppercase mb-3">
              LUNAR EXPLORATION &amp; INTELLIGENCE
            </div>
            <div className="text-xs sm:text-sm italic text-[#71717A] font-light tracking-wide">
              &ldquo;Exploring the Unknown. Discovering the Moon.&rdquo;
            </div>
          </motion.div>

          {/* ── Progress section ── */}
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="relative z-10 w-full max-w-sm px-6 space-y-3"
          >
            {/* Step text */}
            <div className="flex justify-between items-center font-mono text-[11px] text-[#A1A1AA]">
              <motion.span
                key={step}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[#D6D6D6] tracking-wider truncate mr-3"
              >
                {STEPS[step]}
              </motion.span>
              <span className="font-semibold text-[#F2F2F2] tabular-nums">{progress}%</span>
            </div>

            {/* Progress bar */}
            <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #4A7DC8, #8CB4F0, #E2ECF8)",
                  boxShadow: "0 0 14px rgba(100,165,245,0.6)",
                }}
              />
            </div>

            {/* Sub-telemetry */}
            <div className="flex justify-between text-[10px] font-mono text-[#71717A] tracking-widest">
              <span>LAT 89.9°S</span>
              <span>LRO-M3 ONLINE</span>
              <span>SEC-LINK {progress}%</span>
            </div>
          </motion.div>

          {/* Dark vignette edges */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, #030508 100%)",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

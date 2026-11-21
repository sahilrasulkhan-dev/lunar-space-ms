"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import {
  Compass,
  Radar,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  Maximize2,
  Terminal,
  Crosshair,
  Sparkles,
  ChevronRight,
  Eye,
  Radio
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { TechText } from "@/components/ui/TechText";
import { LunarChatSection } from "@/components/chat/LunarChatSection";
import KineticGrid from "@/components/ui/KineticGrid";

export default function LandingPage() {
  const [loading, setLoading] = useState(true);
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(0);

  // Scroll parallax
  const { scrollY } = useScroll();
  const moonParallaxY = useTransform(scrollY, [0, 900], [0, 160]);
  const heroOpacity = useTransform(scrollY, [0, 450], [1, 0.2]);

  // Mouse-based subtle cinematic parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Different layer parallax speeds
  const bgStarX = useTransform(smoothMouseX, [-800, 800], [-8, 8]);
  const bgStarY = useTransform(smoothMouseY, [-600, 600], [-6, 6]);
  const moonLayerX = useTransform(smoothMouseX, [-800, 800], [-20, 20]);
  const moonLayerY = useTransform(smoothMouseY, [-600, 600], [-15, 15]);
  const heroTextX = useTransform(smoothMouseX, [-800, 800], [10, -10]);
  const heroTextY = useTransform(smoothMouseY, [-600, 600], [8, -8]);

  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", handlePointerMove);
  }, [mouseX, mouseY]);

  const lunarSites = [
    {
      name: "South Pole — Aitken Basin",
      coordinates: "89.9°S, 0.0°E",
      elevation: "-8,200m",
      illumination: "Permanently Shadowed (PSR)",
      iceProbability: "94.2%",
      hazardScore: "Low (Floor Smooth)",
      description: "Primary candidate for permanent lunar outpost and water-ice harvesting operations. Exhibits deep thermal cold traps shielded from solar radiation.",
      image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=75&w=1200&auto=format&fit=crop"
    },
    {
      name: "Mare Tranquillitatis",
      coordinates: "0.6740°N, 23.4720°E",
      elevation: "-1,340m",
      illumination: "14-Day Diurnal Cycle",
      iceProbability: "1.4%",
      hazardScore: "Ultra-Low (Basaltic Plain)",
      description: "Historic Apollo 11 touchdown site. Characterized by expansive ancient basalt lava flows with exceptionally low obstacle density.",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=75&w=1200&auto=format&fit=crop"
    },
    {
      name: "Tycho Crater Rim",
      coordinates: "43.31°S, 11.36°W",
      elevation: "+4,800m",
      illumination: "High Incidence Rays",
      iceProbability: "12.8%",
      hazardScore: "Extreme (Steep Terraces)",
      description: "Prominent impact crater featuring 1,500km ray systems and steep central mountain peaks with complex geochemical exposures.",
      image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=75&w=1200&auto=format&fit=crop"
    },
    {
      name: "Oceanus Procellarum",
      coordinates: "18.4°N, 57.4°W",
      elevation: "-2,100m",
      illumination: "Maximum Solar Window",
      iceProbability: "3.1%",
      hazardScore: "Low-Moderate (Wrinkle Ridges)",
      description: "The largest of all lunar maria, spanning over 2,500km across the western hemisphere with high titanium basalts and smooth volcanic plains.",
      image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=75&w=1200&auto=format&fit=crop"
    }
  ];

  const activeSite = lunarSites[selectedSiteIndex];

  return (
    <>
      <AnimatePresence>{loading && <LoadingScreen onComplete={() => setLoading(false)} />}</AnimatePresence>
    <main className="min-h-screen relative overflow-hidden flex flex-col bg-[#05070D] text-[#F4F7FC]">
      <Navbar />

      {/* ========================================================================= */}
      {/* 1. LAYERED CELESTIAL ENVIRONMENT — MOUSE PARALLAX & BLUE ATMOSPHERIC GLOW */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Soft Cosmic Blue Atmospheric Nebula Gradient */}
        <motion.div 
          style={{ x: bgStarX, y: bgStarY }}
          className="absolute inset-0 opacity-60"
        >
          <div 
            className="w-full h-full"
            style={{
              backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 15%, rgba(90, 145, 230, 0.15) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 85% 75%, rgba(40, 80, 150, 0.22) 0%, transparent 60%)"
            }}
          />
        </motion.div>

        {/* Reactive Kinetic Grid Mesh */}
        <div className="absolute inset-0 opacity-30">
          <KineticGrid
            background="transparent"
            dotColor="#FFFFFF"
            lineColor="#80ACFF"
            trailColor="#84A0C6"
            spacing={42}
            radius={320}
            strength={4}
            trail={true}
          />
        </div>

        {/* Slow Floating Moon with Soft Lunar Blue Rim Light */}
        <motion.div
          className="absolute -bottom-[42vw] md:-bottom-[28vw] left-1/2 -translate-x-1/2 w-[150vw] md:w-[105vw] max-w-[1800px] aspect-square rounded-full z-0 pointer-events-none"
          style={{ 
            y: moonParallaxY,
            x: moonLayerX,
          }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Moon Disc & Multi-layered Surface Lighting */}
          <div className="relative w-full h-full rounded-full overflow-hidden bg-[#0A1120] shadow-[0_-25px_110px_rgba(110,170,250,0.20)] border-t border-[rgba(180,215,255,0.35)]">
            {/* High-res moon texture */}
            <div 
              className="absolute inset-0 opacity-35 mix-blend-screen bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=75&w=1400&auto=format&fit=crop')"
              }}
            />
            {/* Atmospheric terminator and blue moonlit shading */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05070D]/60 to-[#05070D]" />
            <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-[rgba(180,215,255,0.18)] via-[rgba(100,160,240,0.08)] to-transparent" />
          </div>
        </motion.div>

        {/* Orbit trajectory line with floating satellite node */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1400px] h-[340px] border border-[rgba(140,185,245,0.08)] rounded-[100%] rotate-[-12deg] pointer-events-none">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
            className="w-full h-full relative"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#EAF2FA] shadow-[0_0_14px_rgba(160,210,255,1)]" />
            <div className="absolute top-[-14px] left-1/2 translate-x-3 font-mono text-xs text-[#A8C4E6] tracking-widest uppercase">
              LRO-ORBITER // ALT 50.4 KM
            </div>
          </motion.div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION — READABILITY & MOTION ENHANCEMENTS */}
      {/* ========================================================================= */}
      <section className="relative z-10 min-h-[92vh] flex flex-col justify-between pt-24 md:pt-32 pb-12 px-6 md:px-12 max-w-[1680px] mx-auto w-full">
        {/* Outlined Typography Watermark Layer Behind Hero */}
        <div className="absolute inset-x-0 top-16 md:top-20 flex justify-center pointer-events-none select-none z-[-1] overflow-hidden">
          <span className="text-[20vw] md:text-[18vw] font-black tracking-tighter outlined-text uppercase leading-none whitespace-nowrap opacity-15">
            EXPLORATION
          </span>
        </div>

        {/* Top Telemetry Bar - Enhanced Font Size (12px / 13px) */}
        <motion.div 
          style={{ x: heroTextX }}
          className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(160,195,240,0.14)] pb-3.5 font-mono text-xs text-[#B4C2D6]"
        >
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[#F4F7FC] uppercase tracking-wider font-semibold text-xs md:text-sm">
              MISSION STATUS: OPERATIONAL
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-[#A8C4E6] hidden sm:inline text-xs">
              SELENOGRAPHIC REF: WGS-LUNAR-2026
            </span>
          </div>

          <div className="flex items-center gap-6 text-[#8292A8] text-xs">
            <span className="hidden lg:inline text-[#B4C2D6]">COORDINATES: 89.9°S 0.0°E</span>
            <span>LRO.ORBIT: REV 41,208</span>
            <span className="text-[#F4F7FC] font-semibold text-xs md:text-sm">T-PLUS 00:44:12</span>
          </div>
        </motion.div>

        {/* Main Editorial Hero Content */}
        <motion.div 
          style={{ opacity: heroOpacity, y: heroTextY }}
          className="my-auto py-8 md:py-14 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded border border-[#84A0C6]/30 bg-[#84A0C6]/10 backdrop-blur-md mb-6 shadow-[0_0_20px_rgba(100,160,240,0.12)]">
            <Compass className="w-4 h-4 text-[#A8C4E6]" />
            <span className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#E2ECF8] uppercase font-medium">
              Planetary Autonomous Systems // Deep Space Lab
            </span>
          </div>

          {/* TechText Hero Title Integration */}
          <div className="mb-6 space-y-1">
            <h1 className="sr-only">LUNAR SPACE AI PLANETARY CARTOGRAPHY</h1>
            <div className="w-full h-16 sm:h-24 md:h-28 lg:h-32 relative">
              <TechText
                text="LUNAR SPACE AI"
                fontWeight={900}
                fontSize={130}
                align="left"
                color="#F4F7FC"
                accentColor="#84A0C6"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
                intro="none"
                introDuration={2}
                clickKick
                draggable
                sweep
                speed={1}
                guides={false}
              />
            </div>
            <div className="w-full h-12 sm:h-18 md:h-22 lg:h-26 relative">
              <TechText
                text="PLANETARY CARTOGRAPHY"
                fontWeight={700}
                fontSize={95}
                align="left"
                color="#A8C4E6"
                accentColor="#84A0C6"
                reveal="letter"
                dashLength={4}
                dashGap={2}
                specks={15}
                intro="none"
                introDuration={2}
                clickKick
                draggable
                sweep
                speed={1}
                guides={false}
              />
            </div>
          </div>

          <p className="text-base sm:text-lg md:text-xl text-[#B4C2D6] max-w-2xl leading-relaxed mb-10 font-sans font-normal">
            Autonomous optical surface intelligence, polar water-ice deposit detection,
            and real-time hazard classification. Precision navigation for next-generation lunar exploration.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link href="/dashboard" data-cursor-text="LAUNCH">
              <NeonButton variant="primary" size="lg" className="w-full sm:w-auto font-mono text-xs md:text-sm tracking-wider px-8">
                <Radar className="w-4 h-4 mr-2" />
                Initialize Mission Control
              </NeonButton>
            </Link>

            <Link href="#capabilities" data-cursor-text="EXPLORE">
              <NeonButton variant="outline" size="lg" className="w-full sm:w-auto font-mono text-xs md:text-sm tracking-wider px-8">
                Explore Core Capabilities
                <ArrowRight className="w-4 h-4 ml-2" />
              </NeonButton>
            </Link>
          </div>
        </motion.div>

        {/* Hero Bottom Telemetry Grid - Clear Readability */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-[rgba(160,195,240,0.14)]">
          {[
            { label: "SURFACE COVERAGE", val: "99.8%", sub: "Global LRO Mosaic" },
            { label: "OPTICAL RESOLUTION", val: "0.5 M/PX", sub: "Narrow Angle Camera" },
            { label: "CRATER MAPPING", val: "1.3M+", sub: "Segmented Anomaly Targets" },
            { label: "ESTIMATED ICE RESERVES", val: "600M TONS", sub: "South Pole Volatiles" },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-xs font-mono tracking-wider text-[#8292A8] uppercase">{stat.label}</div>
              <div className="text-2xl md:text-3xl font-bold font-mono text-[#F4F7FC] tracking-tight">{stat.val}</div>
              <div className="text-xs text-[#B4C2D6] font-mono">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SCIENTIFIC CAPABILITIES SECTION — SUBTLE BLUE GLOW & EXPANDED TEXT */}
      {/* ========================================================================= */}
      <section id="capabilities" className="relative z-10 py-18 md:py-28 px-6 md:px-12 max-w-[1680px] mx-auto w-full">
        {/* Outlined Typography */}
        <div className="absolute right-6 top-8 pointer-events-none select-none z-[-1] overflow-hidden">
          <span className="text-[16vw] font-black tracking-tighter outlined-text uppercase leading-none opacity-15">
            LUNAR
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-[rgba(160,195,240,0.14)] pb-6">
          <div>
            <div className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#84A0C6] uppercase mb-1.5 font-medium">
              Autonomous Systems & Neural Processing
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#F4F7FC] uppercase">
              Scientific Mission Capabilities
            </h2>
          </div>
          <p className="text-sm md:text-base text-[#B4C2D6] max-w-md leading-relaxed">
            Architected for deep-space science, lunar landing craft telemetry, and robotic rover autonomy.
          </p>
        </div>

        {/* 4 Feature Panels with Contextual Cursor & Atmospheric Glow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              id: "01",
              title: "Lunar Image Analysis",
              desc: "Deep neural networks identify craters, boulder distributions, and basaltic regolith boundaries with sub-pixel precision.",
              icon: Layers,
              tag: "OPENCV & AI",
              link: "/dashboard?tab=upload",
              cursor: "ANALYZE"
            },
            {
              id: "02",
              title: "Polar Ice Detection",
              desc: "Multi-band thermal neutron spectroscopy models permanently shadowed crater depressions containing subsurface water ice.",
              icon: Sparkles,
              tag: "WATER-ICE VOLATILES",
              link: "/dashboard?tab=ice",
              cursor: "ICE SCAN"
            },
            {
              id: "03",
              title: "Satellite Imagery Viewer",
              desc: "Synchronized telemetry feeds from Lunar Reconnaissance Orbiter (LRO-NAC), Chandrayaan, and Kaguya topographic databases.",
              icon: Eye,
              tag: "ORBITAL RECON",
              link: "/dashboard?tab=satellite",
              cursor: "SATELLITE"
            },
            {
              id: "04",
              title: "Autonomous Rover Pathing",
              desc: "Dynamic heuristic navigation computes slope gradients, obstacle clearances, and battery energy budgets for surface rovers.",
              icon: Activity,
              tag: "HEURISTIC TRAJECTORY",
              link: "/dashboard?tab=navigation",
              cursor: "NAVIGATE"
            },
          ].map((feat) => (
            <motion.div 
              key={feat.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <GlassCard 
                glowColor="blue" 
                className="p-7 md:p-8 h-full flex flex-col justify-between group cursor-pointer"
                data-cursor-text={feat.cursor}
              >
                <div>
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-[rgba(160,195,240,0.12)]">
                    <span className="font-mono text-sm text-[#A8C4E6] font-bold tracking-wider">{feat.id}</span>
                    <span className="text-xs font-mono tracking-wider text-[#8292A8] uppercase bg-[#84A0C6]/10 px-2.5 py-1 rounded border border-[#84A0C6]/20">
                      {feat.tag}
                    </span>
                  </div>

                  <div className="w-12 h-12 rounded-lg bg-[#84A0C6]/10 border border-[#84A0C6]/25 flex items-center justify-center mb-6 group-hover:bg-[#84A0C6]/20 group-hover:border-[#B8D4F5]/60 transition-all shadow-[0_0_15px_rgba(100,160,240,0.12)]">
                    <feat.icon className="w-6 h-6 text-[#E2ECF8]" />
                  </div>

                  <h3 className="text-xl font-bold tracking-tight text-[#F4F4F8] mb-3 uppercase">
                    {feat.title}
                  </h3>

                  <p className="text-sm text-[#B4C2D6] leading-relaxed mb-6 font-sans">
                    {feat.desc}
                  </p>
                </div>

                <Link 
                  href={feat.link} 
                  data-cursor-text={feat.cursor}
                  className="inline-flex items-center text-xs md:text-sm font-mono tracking-wider text-[#A8C4E6] group-hover:text-white transition-colors pt-4 border-t border-[rgba(160,195,240,0.12)]"
                >
                  <span className="font-medium">Launch Mission Tool</span>
                  <ChevronRight className="w-4 h-4 ml-1.5 transition-transform group-hover:translate-x-1.5" />
                </Link>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ASYMMETRIC SPECIMEN: INTERACTIVE LUNAR EXPLORER */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-6 md:px-12 max-w-[1680px] mx-auto w-full">
        {/* Outlined Typography */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 pointer-events-none select-none z-[-1] overflow-hidden">
          <span className="text-[18vw] font-black tracking-tighter outlined-text uppercase leading-none opacity-10">
            MOON
          </span>
        </div>

        <GlassCard variant="panel" className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left: Viewport with Surface Imagery & Contextual Cursor */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between font-mono text-xs text-[#B4C2D6] pb-2 border-b border-[rgba(160,195,240,0.12)]">
                <div className="flex items-center gap-2">
                  <Crosshair className="w-4 h-4 text-[#A8C4E6]" />
                  <span className="uppercase text-[#F4F7FC] font-semibold">Target Specimen: {activeSite.name}</span>
                </div>
                <span className="text-[#84A0C6]">OPTICAL SENSOR LRO-NAC-04</span>
              </div>

              {/* Specimen Image Container */}
              <div 
                data-cursor-text="ZOOM"
                className="relative aspect-[16/10] rounded-lg overflow-hidden border border-[rgba(160,195,240,0.22)] bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)] group cursor-crosshair"
              >
                <img
                  src={activeSite.image}
                  alt={activeSite.name}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale contrast-125 opacity-85 group-hover:scale-105 transition-transform duration-700"
                />

                {/* Atmospheric Icy-Blue Vignette */}
                <div className="absolute inset-0 bg-radial from-transparent via-[#05070D]/30 to-[#05070D]/80 pointer-events-none" />

                {/* HUD Coordinate Brackets - High Readability */}
                <div className="absolute top-3.5 left-3.5 font-mono text-xs text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3 py-1.5 rounded border border-[#84A0C6]/30">
                  LAT/LON: {activeSite.coordinates}
                </div>
                <div className="absolute bottom-3.5 left-3.5 font-mono text-xs text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3 py-1.5 rounded border border-[#84A0C6]/30">
                  ELEVATION: {activeSite.elevation}
                </div>
                <div className="absolute bottom-3.5 right-3.5 font-mono text-xs text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3 py-1.5 rounded border border-[#84A0C6]/30 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ICE PROBABILITY: {activeSite.iceProbability}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#8292A8] pt-1">
                <span>SELENOCENTRIC DATUM WGS-84 EQUIV</span>
                <span>SPECTRAL BAND: UV-VIS-NIR (320-1000NM)</span>
              </div>
            </div>

            {/* Right: Scientific Readout & Fast Switcher */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <div className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#84A0C6] uppercase mb-1.5 font-medium">
                  Lunar Surface Cartography
                </div>
                <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-[#F4F7FC] uppercase mb-3">
                  {activeSite.name}
                </h3>
                <p className="text-sm md:text-base text-[#B4C2D6] leading-relaxed mb-4 font-sans">
                  {activeSite.description}
                </p>
              </div>

              {/* Telemetry Matrix - Clear 13px/14px Sizes */}
              <div className="grid grid-cols-2 gap-3.5 font-mono text-xs">
                <div className="p-3.5 rounded bg-white/[0.03] border border-[rgba(160,195,240,0.14)]">
                  <div className="text-xs text-[#8292A8] uppercase mb-1">Illumination Regimes</div>
                  <div className="text-[#F4F7FC] font-semibold text-sm">{activeSite.illumination}</div>
                </div>
                <div className="p-3.5 rounded bg-white/[0.03] border border-[rgba(160,195,240,0.14)]">
                  <div className="text-xs text-[#8292A8] uppercase mb-1">Hazard Classification</div>
                  <div className="text-[#F4F7FC] font-semibold text-sm">{activeSite.hazardScore}</div>
                </div>
              </div>

              {/* Site Selection Tabs with Contextual Cursor */}
              <div>
                <div className="text-xs font-mono text-[#8292A8] uppercase tracking-wider mb-2.5">
                  Select Exploration Target:
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {lunarSites.map((site, index) => (
                    <button
                      key={site.name}
                      onClick={() => setSelectedSiteIndex(index)}
                      data-cursor-text="TARGET"
                      className={`text-left p-3 rounded text-xs font-mono tracking-wider uppercase transition-all duration-200 border cursor-pointer ${
                        selectedSiteIndex === index
                          ? "bg-[#84A0C6]/20 border-[#B8D4F5] text-white font-semibold shadow-[0_0_15px_rgba(100,160,240,0.2)]"
                          : "bg-white/[0.02] border-[rgba(160,195,240,0.1)] text-[#B4C2D6] hover:bg-[#84A0C6]/10 hover:text-white"
                      }`}
                    >
                      <div className="truncate text-xs font-semibold">{site.name}</div>
                      <div className="text-[11px] text-[#84A0C6] mt-0.5">{site.coordinates}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Link href="/dashboard" data-cursor-text="INSPECT">
                  <NeonButton variant="primary" size="md" className="w-full justify-center font-mono text-xs md:text-sm">
                    Analyze This Terrain in Console
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </NeonButton>
                </Link>
              </div>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* ========================================================================= */}
      {/* 5. LUNAR AI ASSISTANT CHATBOT SECTION */}
      {/* ========================================================================= */}
      <LunarChatSection />

      {/* ========================================================================= */}
      {/* 6. CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 md:py-28 px-6 md:px-12 max-w-[1680px] mx-auto w-full text-center">
        {/* Outlined Typography */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-[-1] overflow-hidden">
          <span className="text-[22vw] font-black tracking-tighter outlined-text-dim uppercase leading-none opacity-15">
            SPACE
          </span>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded border border-[#84A0C6]/30 bg-[#84A0C6]/10 text-xs font-mono text-[#B8D4F5]">
            <Radio className="w-3.5 h-3.5 text-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>MISSION CONTROL TELEMETRY GATEWAY ONLINE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#F4F7FC] uppercase leading-tight">
            Ready for Autonomous Lunar Deployment
          </h2>

          <p className="text-base md:text-lg text-[#B4C2D6] max-w-lg mx-auto leading-relaxed">
            Upload custom lunar imagery, calculate safe landing scores, and generate
            energy-optimized rover trajectories in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link href="/dashboard" data-cursor-text="CONSOLE">
              <NeonButton variant="primary" size="lg" className="w-full sm:w-auto px-9 font-mono tracking-wider text-xs md:text-sm">
                Launch Mission Control Center
                <ArrowRight className="w-4 h-4 ml-2" />
              </NeonButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. EDITORIAL FOOTER */}
      {/* ========================================================================= */}
      <footer id="about" className="relative z-10 border-t border-[rgba(160,195,240,0.14)] bg-[#04060B]/95 py-10 px-6 md:px-12">
        <div className="max-w-[1680px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 font-mono text-xs text-[#8292A8]">
          <div className="space-y-1">
            <div className="text-sm font-bold tracking-[0.2em] text-[#F4F7FC] uppercase">
              LUNAR SPACE AI
            </div>
            <div className="text-xs text-[#B4C2D6]">Autonomous Planetary Intelligence & Cartography Platform</div>
          </div>

          <div className="flex flex-wrap gap-8 text-xs text-[#B4C2D6]">
            <Link href="#assistant" className="hover:text-white transition-colors uppercase text-[#A8C4E6]">Lunar AI</Link>
            <Link href="/dashboard?tab=upload" className="hover:text-white transition-colors uppercase">Upload Analysis</Link>
            <Link href="/dashboard?tab=ice" className="hover:text-white transition-colors uppercase">Ice Detection</Link>
            <Link href="/dashboard?tab=satellite" className="hover:text-white transition-colors uppercase">Satellite Viewer</Link>
            <Link href="/dashboard?tab=navigation" className="hover:text-white transition-colors uppercase">Rover Navigation</Link>
          </div>

          <div className="text-right">
            <div>SELENOGRAPHIC DATUM: LRO-WGS-2026</div>
            <div className="text-[#A8C4E6]">ALL MISSION PROTOCOLS VERIFIED</div>
          </div>
        </div>
      </footer>
    </main>
    </>
  );
}

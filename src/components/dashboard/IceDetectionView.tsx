"use client";

import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { Sparkles, Thermometer, Layers, Compass, Download, ShieldCheck, Activity } from "lucide-react";

export function IceDetectionView() {
  const [selectedCrater, setSelectedCrater] = useState(0);
  const [activeBand, setActiveBand] = useState<"neutron" | "thermal" | "radar">("neutron");

  const craters = [
    {
      name: "Shackleton Crater",
      location: "89.9°S, 0.0°E",
      diameter: "21 km",
      depth: "4.2 km",
      tempKelvin: "38 K (-235°C)",
      iceConcentration: "5.6 ± 1.2 wt%",
      estimatedVolume: "1.2 × 10⁸ m³",
      psrStatus: "100% Permanently Shadowed",
      image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=75&w=1200&auto=format&fit=crop"
    },
    {
      name: "Faustini Crater",
      location: "87.3°S, 77.0°E",
      diameter: "39 km",
      depth: "3.1 km",
      tempKelvin: "44 K (-229°C)",
      iceConcentration: "4.1 ± 0.9 wt%",
      estimatedVolume: "8.5 × 10⁷ m³",
      psrStatus: "Continuous Cold Trap",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=75&w=1200&auto=format&fit=crop"
    },
    {
      name: "Shoemaker Crater",
      location: "88.1°S, 44.9°E",
      diameter: "50 km",
      depth: "2.8 km",
      tempKelvin: "52 K (-221°C)",
      iceConcentration: "3.4 ± 0.8 wt%",
      estimatedVolume: "6.2 × 10⁷ m³",
      psrStatus: "Confirmed Hydrogen Enrichment",
      image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=75&w=1200&auto=format&fit=crop"
    }
  ];

  const current = craters[selectedCrater];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      {/* Main Specimen Viewer */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <GlassCard className="flex-1 p-6 flex flex-col" variant="editorial">
          {/* Header - Comfortable Readability */}
          <div className="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-[rgba(160,195,240,0.14)] gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#A8C4E6] uppercase font-medium">
                <Sparkles className="w-4 h-4 text-[#F4F7FC]" />
                Polar Volatile Spectroscopy // LEND Detector
              </div>
              <h3 className="font-mono text-base md:text-lg font-bold text-[#F4F7FC] uppercase">
                {current.name} — Subsurface Water-Ice Matrix
              </h3>
            </div>

            {/* Spectral Band Selector */}
            <div className="flex bg-[#84A0C6]/10 p-1 rounded-lg border border-[#84A0C6]/25 font-mono text-xs md:text-sm">
              {(["neutron", "thermal", "radar"] as const).map((band) => (
                <button
                  key={band}
                  onClick={() => setActiveBand(band)}
                  data-cursor-text={band.toUpperCase()}
                  className={`px-3.5 py-1.5 rounded capitalize transition-all cursor-pointer ${
                    activeBand === band
                      ? "bg-[#F4F7FC] text-[#05070D] font-bold shadow-[0_0_12px_rgba(180,215,255,0.4)]"
                      : "text-[#B4C2D6] hover:text-white"
                  }`}
                >
                  {band}
                </button>
              ))}
            </div>
          </div>

          {/* Viewport */}
          <div 
            data-cursor-text="INSPECT"
            className="flex-1 min-h-[420px] rounded-lg overflow-hidden border border-[rgba(160,195,240,0.22)] relative bg-black flex items-center justify-center shadow-[0_0_35px_rgba(0,0,0,0.8)]"
          >
            <img
              src={current.image}
              alt={current.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                activeBand === "neutron"
                  ? "contrast-150 brightness-90 grayscale"
                  : activeBand === "thermal"
                  ? "invert contrast-125"
                  : "contrast-200 hue-rotate-180"
              }`}
            />

            <div className="absolute inset-0 bg-radial from-transparent via-[#05070D]/40 to-[#05070D]/85 pointer-events-none" />

            {/* Reticle & Ice Probability Overlay - Clear 12px/13px */}
            <div className="absolute top-4 left-4 font-mono text-xs md:text-sm text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3.5 py-1.5 rounded border border-[#84A0C6]/30">
              TARGET: {current.location}
            </div>
            
            <div className="absolute bottom-4 left-4 font-mono text-xs md:text-sm text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-4 py-2 rounded border border-[#84A0C6]/30 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span className="font-semibold">ESTIMATED VOLATILE FRACTION: {current.iceConcentration}</span>
            </div>

            <div className="absolute bottom-4 right-4 font-mono text-xs md:text-sm text-[#B4C2D6] bg-[#070D1A]/85 backdrop-blur-md px-3.5 py-1.5 rounded border border-[#84A0C6]/30">
              TEMP: {current.tempKelvin}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Right Column: Crater Telemetry & Switcher */}
      <div className="lg:col-span-4 space-y-4">
        <GlassCard className="p-6" variant="editorial">
          <h4 className="font-mono text-sm uppercase tracking-wider text-[#F4F7FC] mb-4 pb-2.5 border-b border-[rgba(160,195,240,0.14)] font-bold">
            Permanently Shadowed Targets
          </h4>

          <div className="space-y-2.5 mb-6">
            {craters.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setSelectedCrater(i)}
                data-cursor-text="SELECT"
                className={`w-full text-left p-3.5 rounded-lg font-mono text-xs md:text-sm transition-all border cursor-pointer ${
                  selectedCrater === i
                    ? "bg-[#84A0C6]/20 border-[#B8D4F5] text-white font-semibold shadow-[0_0_15px_rgba(100,160,240,0.2)]"
                    : "bg-white/[0.02] border-[rgba(160,195,240,0.1)] text-[#B4C2D6] hover:bg-[#84A0C6]/10 hover:text-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{c.name}</span>
                  <span className="text-[#A8C4E6] text-xs font-bold">{c.iceConcentration}</span>
                </div>
                <div className="text-xs text-[#8292A8] mt-1">{c.location}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3 font-mono text-xs md:text-sm border-t border-[rgba(160,195,240,0.14)] pt-5">
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Crater Diameter:</span>
              <span className="text-[#F4F7FC] font-semibold">{current.diameter}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Crater Depth:</span>
              <span className="text-[#F4F7FC] font-semibold">{current.depth}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Subsurface Temp:</span>
              <span className="text-[#B8D4F5] font-bold">{current.tempKelvin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Estimated Water H2O:</span>
              <span className="text-emerald-400 font-bold">{current.estimatedVolume}</span>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[rgba(160,195,240,0.14)]">
            <NeonButton variant="primary" size="md" className="w-full justify-center text-xs md:text-sm font-semibold" cursorText="EXPORT">
              Export Volatile Extraction Model
            </NeonButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

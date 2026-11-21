"use client";

import { useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { Eye, Layers, ZoomIn, ZoomOut, Download, Compass, Satellite } from "lucide-react";

export function SatelliteImageryView() {
  const [selectedFeed, setSelectedFeed] = useState(0);
  const [filterMode, setFilterMode] = useState<"optical" | "elevation" | "infrared">("optical");

  const satelliteFeeds = [
    {
      id: "LRO-NAC-01",
      mission: "Lunar Reconnaissance Orbiter",
      camera: "Narrow Angle Camera (NAC)",
      target: "Apollo 11 — Mare Tranquillitatis",
      resolution: "0.5 meters / pixel",
      date: "Rev 42,912",
      image: "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=75&w=1200&auto=format&fit=crop"
    },
    {
      id: "KAGUYA-TC-04",
      mission: "SELENE / Kaguya",
      camera: "Terrain Camera Stereo (TC)",
      target: "Aristarchus Plateau & Rille",
      resolution: "10.0 meters / pixel",
      date: "Rev 11,402",
      image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=75&w=1200&auto=format&fit=crop"
    },
    {
      id: "CH-2-SAR-09",
      mission: "Chandrayaan-2",
      camera: "Dual Frequency Synthetic Aperture Radar (DFSAR)",
      target: "Cabeus Crater South Polar Floor",
      resolution: "2.0 meters / pixel",
      date: "Rev 18,720",
      image: "https://images.unsplash.com/photo-1532693322450-2cb5c511067d?q=75&w=1200&auto=format&fit=crop"
    }
  ];

  const current = satelliteFeeds[selectedFeed];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <div className="lg:col-span-8 flex flex-col gap-4">
        <GlassCard className="flex-1 p-6 flex flex-col" variant="editorial">
          {/* Header - Comfortable Readability */}
          <div className="flex flex-wrap justify-between items-center pb-4 mb-4 border-b border-[rgba(160,195,240,0.14)] gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#A8C4E6] uppercase font-medium">
                <Satellite className="w-4 h-4 text-[#F4F7FC]" />
                Orbital Reconnaissance Telemetry
              </div>
              <h3 className="font-mono text-base md:text-lg font-bold text-[#F4F7FC] uppercase">
                {current.mission} — {current.target}
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex bg-[#84A0C6]/10 p-1 rounded-lg border border-[#84A0C6]/25 font-mono text-xs md:text-sm">
              {(["optical", "elevation", "infrared"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFilterMode(filter)}
                  data-cursor-text={filter.toUpperCase()}
                  className={`px-3.5 py-1.5 rounded capitalize transition-all cursor-pointer ${
                    filterMode === filter
                      ? "bg-[#F4F7FC] text-[#05070D] font-bold shadow-[0_0_12px_rgba(180,215,255,0.4)]"
                      : "text-[#B4C2D6] hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Viewport Canvas */}
          <div 
            data-cursor-text="VIEW"
            className="flex-1 min-h-[420px] rounded-lg overflow-hidden border border-[rgba(160,195,240,0.22)] relative bg-black flex items-center justify-center shadow-[0_0_35px_rgba(0,0,0,0.8)]"
          >
            <img
              src={current.image}
              alt={current.target}
              className={`w-full h-full object-cover transition-all duration-500 ${
                filterMode === "optical"
                  ? "contrast-125 grayscale"
                  : filterMode === "elevation"
                  ? "contrast-200 hue-rotate-90"
                  : "contrast-150 brightness-110 saturate-150"
              }`}
            />

            {/* Tactical Grid */}
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(rgba(160, 205, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(160, 205, 255, 0.4) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
              }}
            />

            <div className="absolute top-4 left-4 font-mono text-xs md:text-sm text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3.5 py-1.5 rounded border border-[#84A0C6]/30">
              FEED ID: {current.id} // {current.camera}
            </div>

            <div className="absolute bottom-4 left-4 font-mono text-xs md:text-sm text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3.5 py-1.5 rounded border border-[#84A0C6]/30">
              GROUND RESOLUTION: {current.resolution}
            </div>

            <div className="absolute bottom-4 right-4 font-mono text-xs md:text-sm text-[#B4C2D6] bg-[#070D1A]/85 backdrop-blur-md px-3.5 py-1.5 rounded border border-[#84A0C6]/30">
              TIMESTAMP: {current.date}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="lg:col-span-4 space-y-4">
        <GlassCard className="p-6" variant="editorial">
          <h4 className="font-mono text-sm uppercase tracking-wider text-[#F4F7FC] mb-4 pb-2.5 border-b border-[rgba(160,195,240,0.14)] font-bold">
            Available Satellite Sensor Passes
          </h4>

          <div className="space-y-2.5 mb-6">
            {satelliteFeeds.map((feed, i) => (
              <button
                key={feed.id}
                onClick={() => setSelectedFeed(i)}
                data-cursor-text="ORBITAL"
                className={`w-full text-left p-3.5 rounded-lg font-mono text-xs md:text-sm transition-all border cursor-pointer ${
                  selectedFeed === i
                    ? "bg-[#84A0C6]/20 border-[#B8D4F5] text-white font-semibold shadow-[0_0_15px_rgba(100,160,240,0.2)]"
                    : "bg-white/[0.02] border-[rgba(160,195,240,0.1)] text-[#B4C2D6] hover:bg-[#84A0C6]/10 hover:text-white"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{feed.target}</span>
                  <span className="text-[#A8C4E6] text-xs font-bold">{feed.resolution}</span>
                </div>
                <div className="text-xs text-[#8292A8] mt-1">{feed.mission}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3 font-mono text-xs md:text-sm border-t border-[rgba(160,195,240,0.14)] pt-5">
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Orbiter Mission:</span>
              <span className="text-[#F4F7FC] font-semibold">{current.mission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Focal Instrument:</span>
              <span className="text-[#F4F7FC] font-semibold">{current.camera}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8292A8]">Spatial Sampling:</span>
              <span className="text-emerald-400 font-bold">{current.resolution}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

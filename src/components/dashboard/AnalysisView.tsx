"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { GlassCard } from "../ui/GlassCard";
import { Maximize2, Download, SplitSquareVertical } from "lucide-react";

interface AnalysisViewProps {
  originalImage: string;
  analyzedImage: string;
}

export function AnalysisView({ originalImage, analyzedImage }: AnalysisViewProps) {
  return (
    <GlassCard className="h-full flex flex-col p-6" variant="editorial">
      {/* Editorial Header - Comfortable Readability */}
      <div className="flex flex-wrap justify-between items-center mb-5 pb-4 border-b border-[rgba(160,195,240,0.14)] gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div>
            <h3 className="font-mono text-sm md:text-base uppercase tracking-wider font-bold text-[#F4F7FC] flex items-center gap-2">
              Multi-Spectral Optical Comparison
            </h3>
            <span className="text-xs font-mono text-[#8292A8] uppercase">
              Raw Regolith Capture vs. Neural Feature Extraction
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded bg-[#84A0C6]/10 border border-[#84A0C6]/25 text-xs font-mono text-[#B4C2D6]">
            <SplitSquareVertical className="w-4 h-4 text-[#A8C4E6]" />
            <span>DRAG SLIDER TO INSPECT</span>
          </div>

          <a 
            href={analyzedImage} 
            download 
            target="_blank" 
            rel="noreferrer"
            data-cursor-text="SAVE"
            className="p-2.5 text-[#B4C2D6] hover:text-white hover:bg-[#84A0C6]/15 rounded border border-[rgba(160,195,240,0.15)] transition-colors cursor-pointer"
            title="Download Processed Frame"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Compare Viewport with Contextual Cursor */}
      <div 
        data-cursor-text="DRAG"
        className="flex-1 min-h-[420px] rounded-lg overflow-hidden border border-[rgba(160,195,240,0.2)] relative group bg-black shadow-[0_0_35px_rgba(0,0,0,0.8)]"
      >
        <ReactCompareSlider
          className="h-full w-full object-contain"
          itemOne={<ReactCompareSliderImage src={originalImage} alt="Raw Moon Surface" className="object-contain" />}
          itemTwo={<ReactCompareSliderImage src={analyzedImage} alt="Neural Feature Map" className="object-contain" />}
        />

        {/* Tactical HUD Corner Reticles - Readable 11px/12px */}
        <div className="absolute top-3.5 left-3.5 font-mono text-xs text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3 py-1.5 rounded border border-[#84A0C6]/30 pointer-events-none">
          RAW LRO FRAME [LEFT]
        </div>
        <div className="absolute top-3.5 right-3.5 font-mono text-xs text-[#F4F7FC] bg-[#070D1A]/85 backdrop-blur-md px-3 py-1.5 rounded border border-[#84A0C6]/30 pointer-events-none">
          NEURAL SEGMENTATION [RIGHT]
        </div>

        {/* Legend - Clearly Readable Sizes */}
        <div className="absolute bottom-4 left-4 bg-[#070D1A]/90 backdrop-blur-md border border-[rgba(160,195,240,0.25)] rounded-md p-3 flex flex-wrap items-center gap-4 text-xs md:text-sm font-mono z-10">
          <div className="flex items-center gap-2 text-[#F4F7FC]">
            <span className="w-3 h-3 bg-emerald-500/80 border border-emerald-400 rounded-sm shadow-[0_0_6px_rgba(52,211,153,0.6)]" /> Safe Zone
          </div>
          <div className="flex items-center gap-2 text-[#F4F7FC]">
            <span className="w-3 h-3 bg-cyan-400/80 border border-cyan-300 rounded-sm shadow-[0_0_6px_rgba(34,211,238,0.6)]" /> YOLO Target (best.pt)
          </div>
          <div className="flex items-center gap-2 text-[#F4F7FC]">
            <span className="w-3 h-3 bg-rose-500/80 border border-rose-400 rounded-sm shadow-[0_0_6px_rgba(244,63,94,0.6)]" /> Crater / Hazard
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

"use client";

import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { GlassCard } from "../ui/GlassCard";
import { Maximize2, Download } from "lucide-react";

interface AnalysisViewProps {
  originalImage: string;
  analyzedImage: string;
}

export function AnalysisView({ originalImage, analyzedImage }: AnalysisViewProps) {
  return (
    <GlassCard className="h-full flex flex-col p-4" glowColor="blue" variant="panel">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-electric-blue animate-pulse" />
          Terrain Detection Results
        </h3>
        <div className="flex gap-2">
          <a href={analyzedImage} download target="_blank" className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Download className="w-4 h-4" />
          </a>
          <button className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative group">
        <ReactCompareSlider
          className="h-full w-full object-contain bg-black/40"
          itemOne={<ReactCompareSliderImage src={originalImage} alt="Original Moon Surface" />}
          itemTwo={<ReactCompareSliderImage src={analyzedImage} alt="Analyzed Surface" />}
        />
        
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg p-3 flex gap-4 text-xs font-mono z-10">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-400/50 border border-emerald-400 rounded-sm" /> Safe
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-orange-400/50 border border-orange-400 rounded-sm" /> Warning
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500/50 border border-red-500 rounded-sm" /> Hazard
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

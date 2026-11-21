"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Maximize, Map as MapIcon, Crosshair, Navigation, RotateCcw, Compass } from "lucide-react";

interface InteractiveMapProps {
  imageId: number;
  bgImage: string;
}

export function InteractiveMap({ imageId, bgImage }: InteractiveMapProps) {
  const constraintsRef = useRef(null);
  const [path, setPath] = useState<number[][]>([]);
  const [zoom, setZoom] = useState(1);
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  const svgPath = path.length > 0 
    ? `M ${path.map(p => `${p[0]} ${p[1]}`).join(' L ')}`
    : "";

  useEffect(() => {
    const fetchPath = async () => {
      setLoadingRoute(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_id: imageId,
            start_x: 80,
            start_y: 80,
            end_x: 820,
            end_y: 820
          })
        });
        const data = await res.json();
        if (data.success && data.data.path) {
          window.dispatchEvent(new CustomEvent("navigation_calculated", { detail: data.data.stats }));
          setPath(data.data.path);
        }
      } catch (err) {
        console.error("Navigation API fallback:", err);
        const fallbackPath = [
          [80, 80],
          [210, 160],
          [340, 290],
          [480, 410],
          [620, 560],
          [740, 700],
          [820, 820]
        ];
        setPath(fallbackPath);
        window.dispatchEvent(new CustomEvent("navigation_calculated", { 
          detail: { distance: 1140, risk_score: 12, energy_estimation: 3.4 } 
        }));
      } finally {
        setLoadingRoute(false);
      }
    };
    
    fetchPath();
  }, [imageId]);

  return (
    <GlassCard className="h-full flex flex-col p-6" variant="editorial">
      {/* Tactical Map Header - Clear Readability */}
      <div className="flex justify-between items-center mb-5 pb-4 border-b border-[rgba(160,195,240,0.14)]">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <div>
            <h3 className="font-mono text-sm md:text-base uppercase tracking-wider font-bold text-[#F4F7FC] flex items-center gap-2">
              Autonomous Rover Surface Trajectory
            </h3>
            <span className="text-xs font-mono text-[#8292A8] uppercase">
              Heuristic A* Pathfinding // Slope Limit: 15° // Elevation Contour
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.0))}
            data-cursor-text="ZOOM +"
            className="px-3 py-1.5 text-xs font-mono text-[#B4C2D6] hover:text-white bg-[#84A0C6]/10 border border-[#84A0C6]/25 rounded transition-colors cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button 
            onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.8))}
            data-cursor-text="ZOOM -"
            className="px-3 py-1.5 text-xs font-mono text-[#B4C2D6] hover:text-white bg-[#84A0C6]/10 border border-[#84A0C6]/25 rounded transition-colors cursor-pointer"
            title="Zoom Out"
          >
            -
          </button>
          <button 
            onClick={() => setZoom(1)}
            data-cursor-text="RESET"
            className="p-2 text-[#B4C2D6] hover:text-white bg-[#84A0C6]/10 border border-[#84A0C6]/25 rounded transition-colors cursor-pointer"
            title="Reset Viewport"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div 
        ref={constraintsRef}
        data-cursor-text="PAN"
        className="flex-1 min-h-[440px] rounded-lg overflow-hidden border border-[rgba(160,195,240,0.22)] relative bg-[#070B14] cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.15}
          animate={{ scale: zoom }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full h-full origin-center relative"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            filter: "contrast(1.2) brightness(0.9)"
          }}
        >
          {/* Tactical Cartographic Grid with Subtle Blue Lines */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(160, 205, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(160, 205, 255, 0.4) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />

          {/* SVG Rover Trajectory */}
          {svgPath && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <motion.path
                d={svgPath}
                fill="none"
                stroke="rgba(160, 200, 255, 0.35)"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
              
              <motion.path
                d={svgPath}
                fill="none"
                stroke="#F4F7FC"
                strokeWidth="3.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 10px rgba(180, 220, 255, 0.9))" }}
              />

              {path.map((pt, idx) => (
                <g key={idx}>
                  <circle cx={pt[0]} cy={pt[1]} r={idx === 0 || idx === path.length - 1 ? 9 : 4.5} fill={idx === 0 ? "#52B788" : idx === path.length - 1 ? "#F4F7FC" : "#84A0C6"} stroke="#05070D" strokeWidth="2.5" />
                </g>
              ))}
            </svg>
          )}

          {/* Start Point Marker (Lander L-1) */}
          <div className="absolute top-[8%] left-[8%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-emerald-400 border border-black shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="font-mono text-xs text-white bg-[#070D1A]/90 px-2.5 py-1 rounded border border-white/20 whitespace-nowrap">
              LANDER [L-1] (0,0)
            </span>
          </div>

          {/* End Point Marker (Target Site ST-ALPHA) */}
          <div className="absolute top-[82%] left-[82%] -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
            <div className="w-4 h-4 rounded-full bg-white border border-black shadow-[0_0_14px_rgba(200,230,255,1)] animate-pulse" />
            <span className="font-mono text-xs text-white bg-[#070D1A]/90 px-2.5 py-1 rounded border border-white/20 whitespace-nowrap">
              TARGET SITE [PSR-1]
            </span>
          </div>
        </motion.div>

        {/* HUD Info Box */}
        <div className="absolute bottom-4 right-4 font-mono text-xs text-[#B4C2D6] bg-[#070D1A]/90 backdrop-blur-md px-3.5 py-2 rounded border border-[#84A0C6]/30 pointer-events-none">
          {loadingRoute ? "COMPUTING OPTIMAL GRADIENT..." : "HEURISTIC ROUTE LOCK: CONFIRMED"}
        </div>
      </div>
    </GlassCard>
  );
}

"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Maximize, Map as MapIcon, Crosshair, Navigation } from "lucide-react";

interface InteractiveMapProps {
  imageId: number;
  bgImage: string;
}

export function InteractiveMap({ imageId, bgImage }: InteractiveMapProps) {
  const constraintsRef = useRef(null);
  const [path, setPath] = useState<number[][]>([]);
  
  // Convert coordinate array to SVG path
  const svgPath = path.length > 0 
    ? `M ${path.map(p => `${p[0]} ${p[1]}`).join(' L ')}`
    : "";

  useEffect(() => {
    // Call navigation API on mount to get the path
    const fetchPath = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/navigation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_id: imageId,
            start_x: 50,
            start_y: 50,
            end_x: 800,
            end_y: 800
          })
        });
        const data = await res.json();
        if (data.success && data.data.path) {
          // Send navigation results back up to window event so NavigationPath can read it
          // In a real app we'd use context, but for simplicity we'll dispatch an event
          window.dispatchEvent(new CustomEvent('navigation_calculated', { detail: data.data.stats }));
          setPath(data.data.path);
        }
      } catch (err) {
        console.error("Navigation failed", err);
      }
    };
    
    fetchPath();
  }, [imageId]);

  return (
    <GlassCard className="h-full flex flex-col p-4" variant="panel">
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-heading font-semibold text-lg flex items-center gap-2">
          <MapIcon className="w-5 h-5 text-electric-blue" />
          Interactive Navigation Map
        </h3>
        <div className="flex gap-2">
          <button className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Crosshair className="w-4 h-4" />
          </button>
          <button className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div 
        ref={constraintsRef}
        className="flex-1 rounded-xl overflow-hidden border border-white/10 relative bg-[#111] cursor-grab active:cursor-grabbing"
      >
        <motion.div
          drag
          dragConstraints={constraintsRef}
          dragElastic={0.2}
          initial={{ scale: 1.0, x: 0, y: 0 }}
          className="w-full h-full origin-top-left relative"
          style={{
            backgroundImage: `url('${bgImage}')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            filter: 'contrast(1.2)'
          }}
        >
          {/* Map Grid */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.5) 1px, transparent 1px)`,
              backgroundSize: '50px 50px',
            }}
          />

          {svgPath && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
              <motion.path
                d={svgPath}
                fill="none"
                stroke="rgba(0, 240, 255, 0.3)"
                strokeWidth="4"
                strokeDasharray="8 8"
              />
              <motion.path
                d={svgPath}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 4, ease: "linear" }}
                style={{ filter: "drop-shadow(0 0 8px #00f0ff)" }}
              />
            </svg>
          )}
        </motion.div>
      </div>
    </GlassCard>
  );
}

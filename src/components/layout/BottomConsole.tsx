"use client";

import { useEffect, useState } from "react";
import { Terminal, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

export function BottomConsole() {
  const [messages, setMessages] = useState<string[]>([
    "LUNAR SPACE AI OS v4.2 [Kernel Build 2026.11]",
    "Establishing secure orbital handshake with Lunar Reconnaissance Orbiter (LRO)...",
    "Loading Apollo & Artemis selenographic reference maps...",
    "Surface segmentation pipeline: Hough Canny Edge Detector ready.",
    "Awaiting image upload or mission coordinates...",
  ]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`border-t border-white/[0.08] bg-[#050812]/95 backdrop-blur-md flex flex-col font-mono text-xs transition-all duration-200 relative z-40 ${isCollapsed ? "h-9" : "h-36"}`}>
      {/* Console Bar Header */}
      <div className="h-9 border-b border-white/[0.06] flex items-center justify-between px-4 text-[#A1A1AA] bg-white/[0.02]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-[#8496B4]" />
          <span>MISSION TELEMETRY CONSOLE</span>
          <span className="text-white/20">|</span>
          <span className="text-[10px] text-emerald-400">DSN-NODE 01 ACTIVE</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMessages([])} 
            className="hover:text-white transition-colors cursor-pointer" 
            title="Clear Console"
          >
            <Trash2 className="w-3 h-3 text-[#71717A] hover:text-[#A1A1AA]" />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hover:text-white transition-colors cursor-pointer"
            title={isCollapsed ? "Expand Console" : "Collapse Console"}
          >
            {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      {!isCollapsed && (
        <div className="flex-1 p-2.5 px-4 overflow-y-auto space-y-1">
          {messages.map((msg, i) => (
            <div key={i} className="text-[#A1A1AA] flex items-start gap-2 leading-relaxed">
              <span className="text-[#8496B4] font-semibold select-none">{`>`}</span>
              <span>{msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

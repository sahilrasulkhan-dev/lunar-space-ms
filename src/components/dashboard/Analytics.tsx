"use client";

import { GlassCard } from "../ui/GlassCard";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";

interface AnalyticsProps {
  data: {
    safe_percentage: number;
    unsafe_percentage: number;
  };
}

export function Analytics({ data }: AnalyticsProps) {
  const safe = Number(data.safe_percentage) || 75;
  const unsafe = Number(data.unsafe_percentage) || 20;
  const undetermined = Math.max(0, 100 - safe - unsafe);

  const terrainData = [
    { name: "Safe Basalt Plain", value: safe, color: "#4E9F76" },
    { name: "Crater / Rock Hazard", value: unsafe, color: "#C84C4C" },
    { name: "Unclassified Regolith", value: undetermined, color: "#84A0C6" },
  ];

  const slopeDistribution = [
    { range: "0-5°", percentage: Math.round(safe * 0.7) },
    { range: "5-12°", percentage: Math.round(safe * 0.3) },
    { range: "12-20°", percentage: Math.round(unsafe * 0.4) },
    { range: ">20°", percentage: Math.round(unsafe * 0.6) },
  ];

  return (
    <GlassCard className="p-6 space-y-6" variant="editorial">
      {/* Terrain Composition Pie */}
      <div>
        <div className="flex justify-between items-center mb-4 pb-2.5 border-b border-[rgba(160,195,240,0.14)]">
          <h3 className="font-mono text-sm md:text-base uppercase tracking-wider font-bold text-[#F4F7FC]">
            Surface Composition Distribution
          </h3>
          <span className="font-mono text-xs text-[#A8C4E6] font-semibold">SPECTRAL RATIOS</span>
        </div>

        <div className="h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={terrainData}
                cx="50%"
                cy="50%"
                innerRadius={56}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                stroke="rgba(5,7,13,0.6)"
                strokeWidth={2}
              >
                {terrainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(7, 13, 26, 0.95)", 
                  borderColor: "rgba(160,195,240,0.25)", 
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#F4F7FC"
                }}
                itemStyle={{ color: "#F4F7FC" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend - Clearly Readable 13px Text */}
        <div className="space-y-2 pt-2">
          {terrainData.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-xs md:text-sm font-mono">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[#B4C2D6]">{item.name}</span>
              </div>
              <span className="text-[#F4F7FC] font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Slope Gradient Histogram */}
      <div className="pt-4 border-t border-[rgba(160,195,240,0.14)]">
        <div className="flex justify-between items-center mb-3.5">
          <h4 className="font-mono text-xs md:text-sm uppercase tracking-wider text-[#B4C2D6] font-semibold">
            Topographic Slope Incline
          </h4>
          <span className="font-mono text-xs text-[#A8C4E6]">ROVER LIMIT: 15°</span>
        </div>

        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slopeDistribution}>
              <XAxis dataKey="range" stroke="#8292A8" fontSize={11} tickLine={false} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "rgba(7, 13, 26, 0.95)", 
                  borderColor: "rgba(160,195,240,0.25)", 
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontFamily: "monospace"
                }}
              />
              <Bar dataKey="percentage" fill="#84A0C6" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </GlassCard>
  );
}

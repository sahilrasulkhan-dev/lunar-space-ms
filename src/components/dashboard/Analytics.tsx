"use client";

import { GlassCard } from "../ui/GlassCard";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface AnalyticsProps {
  data: {
    safe_percentage: number;
    unsafe_percentage: number;
  };
}

export function Analytics({ data }: AnalyticsProps) {
  const terrainData = [
    { name: "Safe Zones", value: data.safe_percentage, color: "#34d399" },
    { name: "Hazards (Crater/Rock)", value: data.unsafe_percentage, color: "#ef4444" },
    { name: "Other", value: Math.max(0, 100 - data.safe_percentage - data.unsafe_percentage), color: "#00f0ff" },
  ];

  const elevationData = [
    { name: "S1", elevation: -120 },
    { name: "S2", elevation: -80 },
    { name: "S3", elevation: -10 },
    { name: "S4", elevation: 45 },
    { name: "S5", elevation: 15 },
  ];

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <h3 className="font-heading font-medium text-sm text-white/70 mb-4">Terrain Composition</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={terrainData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {terrainData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(5, 8, 22, 0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {terrainData.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-white/70">{item.name}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

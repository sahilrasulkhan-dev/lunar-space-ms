"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";
import { FileText, Printer, ShieldCheck, Download, Calendar, Compass, CheckCircle } from "lucide-react";

interface MissionReportProps {
  analysisId?: number | null;
  analysisData?: any;
}

export function MissionReportView({ analysisId, analysisData }: MissionReportProps) {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (analysisId) {
      const fetchReport = async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/reports/${analysisId}`);
          const data = await res.json();
          if (data.success) {
            setReportData(data.data);
          }
        } catch (e) {
          console.error("Failed to load report from API", e);
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [analysisId]);

  const safePercentage = analysisData?.safe_percentage || reportData?.stats?.safe || 84;
  const unsafePercentage = analysisData?.unsafe_percentage || reportData?.stats?.unsafe || 16;
  const landingScore = analysisData?.landing_score || reportData?.stats?.landing_score || 88;
  const terrainType = analysisData?.terrain_type || "Mare Basalt Plain";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <GlassCard className="p-8 md:p-12 relative" variant="editorial">
        {/* Outlined Watermark */}
        <div className="absolute right-4 top-4 pointer-events-none select-none z-0">
          <span className="text-[12vw] font-black tracking-tighter outlined-text uppercase leading-none opacity-5">
            REPORT
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-[rgba(160,195,240,0.14)] gap-4">
            <div>
              <div className="text-xs md:text-sm font-mono tracking-[0.25em] text-[#A8C4E6] uppercase mb-1.5 font-medium">
                Deep Space Exploration Command // Artemis Selenography
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#F4F7FC] uppercase font-mono">
                Mission Flight Readiness Certification
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                data-cursor-text="PRINT"
                className="px-4 py-2 rounded border border-[rgba(160,195,240,0.2)] bg-[#84A0C6]/10 text-xs md:text-sm font-mono text-[#F4F7FC] hover:bg-[#84A0C6]/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#A8C4E6]" />
                Print Dossier
              </button>
            </div>
          </div>

          {/* Dossier Metadata Grid - Comfortable Readability */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-lg bg-white/[0.03] border border-[rgba(160,195,240,0.14)] font-mono text-xs md:text-sm">
            <div>
              <div className="text-xs text-[#8292A8] uppercase mb-1">MISSION REF</div>
              <div className="text-[#F4F7FC] font-bold">LSA-ARTEMIS-004</div>
            </div>
            <div>
              <div className="text-xs text-[#8292A8] uppercase mb-1">DATE VERIFIED</div>
              <div className="text-[#F4F7FC] font-bold">2026.11.20</div>
            </div>
            <div>
              <div className="text-xs text-[#8292A8] uppercase mb-1">TERRAIN CLASSIFICATION</div>
              <div className="text-[#F4F7FC] font-bold truncate">{terrainType}</div>
            </div>
            <div>
              <div className="text-xs text-[#8292A8] uppercase mb-1">CERTIFICATION STATUS</div>
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> FLIGHT READY
              </div>
            </div>
          </div>

          {/* Summary Narrative */}
          <div className="space-y-4 font-sans text-sm md:text-base text-[#B4C2D6] leading-relaxed">
            <h3 className="font-mono text-xs md:text-sm uppercase tracking-wider text-[#F4F7FC] font-bold">
              Executive Evaluation Summary
            </h3>
            <p>
              Autonomous orbital machine-vision inspection completed over designated lunar touchdown sector.
              Optical edge differentiation and Hough circular crater transforms confirm a safe zone coverage of{" "}
              <strong className="text-[#F4F7FC] font-semibold">{safePercentage}%</strong>, with an overall touchdown
              feasibility score of <strong className="text-emerald-400 font-semibold">{landingScore}/100</strong>.
            </p>
            <p>
              Hazard scatter index is restricted to <strong className="text-[#F4F7FC] font-semibold">{unsafePercentage}%</strong>,
              comprising small impact craters and isolated boulder ejecta. Slope angles along the primary landing corridor
              remain safely beneath the 12-degree threshold required for soft descent and subsequent rover egress.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3.5 pt-5 border-t border-[rgba(160,195,240,0.14)] font-mono text-xs md:text-sm">
            <h4 className="text-xs md:text-sm uppercase tracking-wider text-[#A8C4E6] font-bold">
              Descent Protocol Checklist
            </h4>
            <div className="space-y-2.5">
              {[
                "Lidar altimetry surface elevation reference locked",
                "Crater and boulder hazard avoidance threshold programmed",
                "Heuristic rover surface route synthesized & verified",
                "Autonomous landing guidance thruster profiles approved",
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-[#E2ECF8]">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

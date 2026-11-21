"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomConsole } from "@/components/layout/BottomConsole";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UploadSection } from "@/components/dashboard/UploadSection";
import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { TerrainInfo } from "@/components/dashboard/TerrainInfo";
import { InteractiveMap } from "@/components/dashboard/InteractiveMap";
import { NavigationPath } from "@/components/dashboard/NavigationPath";
import { Analytics } from "@/components/dashboard/Analytics";
import { IceDetectionView } from "@/components/dashboard/IceDetectionView";
import { SatelliteImageryView } from "@/components/dashboard/SatelliteImageryView";
import { MissionReportView } from "@/components/dashboard/MissionReportView";
import { RoverSimulationView } from "@/components/dashboard/RoverSimulationView";
import { LunarChatSection } from "@/components/chat/LunarChatSection";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Radio, Layers, Sparkles, Eye, Route, FileText, Upload, Cpu, Bot } from "lucide-react";

type TabType = "upload" | "analysis" | "navigation" | "simulation" | "ice" | "satellite" | "report" | "assistant";

function DashboardContent() {
  const searchParams = useSearchParams();
  const urlTab = searchParams.get("tab") as TabType | null;

  const [activeTab, setActiveTab] = useState<TabType>("upload");
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  // Sync tab from URL query if present
  useEffect(() => {
    if (urlTab) {
      if (urlTab === ("missions" as any)) {
        setActiveTab("report");
      } else if (urlTab === ("gallery" as any)) {
        setActiveTab("satellite");
      } else if (["upload", "analysis", "navigation", "simulation", "ice", "satellite", "report", "assistant"].includes(urlTab)) {
        setActiveTab(urlTab);
      }
    }
  }, [urlTab]);

  const handleAnalysisComplete = (id: number, originalPath: string, data: any) => {
    setImageId(id);
    setOriginalImagePath(originalPath);
    setAnalysisData(data);
    setIsAnalyzed(true);
    setActiveTab("analysis");
  };

  const tabs = [
    { id: "simulation", label: "Rover Simulation & A*", icon: Compass, needsAnalysis: false, cursor: "SIMULATE" },
    { id: "assistant", label: "Lunar AI Assistant", icon: Bot, needsAnalysis: false, cursor: "ASSISTANT" },
    { id: "upload", label: "Image Upload", icon: Upload, needsAnalysis: false, cursor: "UPLOAD" },
    { id: "analysis", label: "Terrain Analysis", icon: Layers, needsAnalysis: true, cursor: "ANALYSIS" },
    { id: "navigation", label: "Rover Navigation", icon: Route, needsAnalysis: true, cursor: "NAVIGATE" },
    { id: "ice", label: "Ice Detection", icon: Sparkles, needsAnalysis: false, cursor: "ICE SCAN" },
    { id: "satellite", label: "Satellite Viewer", icon: Eye, needsAnalysis: false, cursor: "ORBITAL" },
    { id: "report", label: "Mission Dossier", icon: FileText, needsAnalysis: false, cursor: "DOSSIER" },
  ] as const;

  const displayOriginal = originalImagePath 
    ? `http://127.0.0.1:8000/${originalImagePath.replace('app/', '')}`
    : "https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?q=75&w=1200&auto=format&fit=crop";
    
  const displayAnalyzed = analysisData?.processed_image_path
    ? `http://127.0.0.1:8000/${analysisData.processed_image_path.replace('app/', '')}`
    : "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=75&w=1200&auto=format&fit=crop";

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#05070D] text-[#F4F7FC]">
      {/* Background stars texture with subtle blue atmospheric glow */}
      <div className="fixed inset-0 stars-bg opacity-35 pointer-events-none z-0" />
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-25"
        style={{
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(90, 150, 240, 0.18), transparent 55%)"
        }}
      />

      <Navbar />

      <div className="flex-1 flex overflow-hidden pt-18 md:pt-20 relative z-10">
        <main className="flex-1 flex flex-col relative overflow-hidden">
          {/* Mission Control Operations Header - High Readability */}
          <header className="h-16 border-b border-[rgba(160,195,240,0.14)] flex items-center justify-between px-6 shrink-0 bg-[#070D1A]/90 backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <h1 className="font-mono font-bold text-xs md:text-sm tracking-wider uppercase text-[#F4F7FC]">
                Mission Operations Center
              </h1>
              <span className="text-white/20 hidden sm:inline">|</span>
              <StatusBadge status="online" label="LRO Connected" className="hidden sm:inline-flex" />
              {isAnalyzed && <StatusBadge status="safe" label="Touchdown Calculated" />}
            </div>

            {/* Clean Editorial Navigation Tabs with Comfortable 13px/14px Sizes */}
            <div className="flex items-center bg-white/[0.03] p-1 rounded-lg border border-[rgba(160,195,240,0.14)] overflow-x-auto max-w-[60vw] md:max-w-none">
              {tabs.map((tab) => {
                const isTabActive = activeTab === tab.id;
                const isDisabled = tab.needsAnalysis && !isAnalyzed;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    disabled={isDisabled}
                    data-cursor-text={tab.cursor}
                    className={`px-3.5 py-1.5 rounded-md text-xs md:text-sm font-mono uppercase tracking-wider transition-all duration-200 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isTabActive
                        ? "bg-[#F4F7FC] text-[#05070D] font-bold shadow-[0_0_15px_rgba(180,215,255,0.4)]"
                        : "text-[#B4C2D6] hover:text-white hover:bg-[#84A0C6]/15 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#8292A8]"
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </header>

          {/* Tab Content Canvas */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col"
              >
                {/* 0. LUNAR ROVER SIMULATION & REPLANNING TAB */}
                {activeTab === "simulation" && (
                  <RoverSimulationView />
                )}

                {/* 0.5 LUNAR AI ASSISTANT TAB */}
                {activeTab === "assistant" && (
                  <div className="h-full overflow-y-auto">
                    <LunarChatSection />
                  </div>
                )}

                {/* 1. UPLOAD TAB */}
                {activeTab === "upload" && (
                  <div className="max-w-4xl mx-auto w-full my-auto py-6">
                    <UploadSection onComplete={handleAnalysisComplete} />
                  </div>
                )}

                {/* 2. TERRAIN ANALYSIS TAB */}
                {activeTab === "analysis" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 h-[550px] lg:h-auto">
                      <AnalysisView 
                        originalImage={displayOriginal} 
                        analyzedImage={displayAnalyzed} 
                      />
                    </div>
                    <div className="space-y-6 overflow-y-auto pr-1 pb-6">
                      <TerrainInfo data={analysisData || {
                        landing_score: 88,
                        safe_percentage: 84,
                        unsafe_percentage: 16,
                        terrain_type: "Basalt Mare Plain",
                        confidence: 96
                      }} />
                      <Analytics data={analysisData || {
                        safe_percentage: 84,
                        unsafe_percentage: 16
                      }} />
                    </div>
                  </div>
                )}

                {/* 3. ROVER NAVIGATION TAB */}
                {activeTab === "navigation" && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 h-[550px] lg:h-auto">
                      <InteractiveMap 
                        imageId={imageId || 1}
                        bgImage={displayOriginal}
                      />
                    </div>
                    <div className="space-y-6 overflow-y-auto pr-1 pb-6">
                      <NavigationPath />
                    </div>
                  </div>
                )}

                {/* 4. POLAR ICE DETECTION TAB */}
                {activeTab === "ice" && (
                  <div className="h-full">
                    <IceDetectionView />
                  </div>
                )}

                {/* 5. SATELLITE IMAGERY VIEWER TAB */}
                {activeTab === "satellite" && (
                  <div className="h-full">
                    <SatelliteImageryView />
                  </div>
                )}

                {/* 6. MISSION REPORT DOSSIER TAB */}
                {activeTab === "report" && (
                  <div className="h-full overflow-y-auto py-4">
                    <MissionReportView 
                      analysisId={imageId} 
                      analysisData={analysisData} 
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <Sidebar />
      </div>

      <BottomConsole />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#05070D] flex items-center justify-center font-mono text-sm text-[#A8C4E6]">
        CALIBRATING MISSION DASHBOARD...
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

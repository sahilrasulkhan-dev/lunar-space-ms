"use client";

import { useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "analysis" | "navigation">("upload");
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [imageId, setImageId] = useState<number | null>(null);
  const [originalImagePath, setOriginalImagePath] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<any>(null);

  const handleAnalysisComplete = (id: number, originalPath: string, data: any) => {
    setImageId(id);
    setOriginalImagePath(originalPath);
    setAnalysisData(data);
    setIsAnalyzed(true);
    setActiveTab("analysis");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-space-black bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-blend-overlay bg-black/80">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden pt-20">
        <main className="flex-1 flex flex-col relative">
          
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20 glass bg-transparent">
            <div className="flex items-center gap-4">
              <h1 className="font-heading font-semibold text-lg">Mission Control Center</h1>
              <StatusBadge status="online" label="AI Active" />
              {isAnalyzed && <StatusBadge status="safe" label="Landing Zone Identified" />}
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {(["upload", "analysis", "navigation"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={tab !== "upload" && !isAnalyzed}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                    activeTab === tab 
                      ? "bg-electric-blue text-space-black shadow-[0_0_15px_rgba(0,240,255,0.4)]" 
                      : "text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white/60"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-6 z-10 relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col"
              >
                {activeTab === "upload" && (
                  <div className="max-w-4xl mx-auto w-full">
                    <UploadSection onComplete={handleAnalysisComplete} />
                  </div>
                )}
                
                {activeTab === "analysis" && analysisData && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 h-[600px] lg:h-auto">
                      <AnalysisView 
                        originalImage={`http://127.0.0.1:8000/${originalImagePath?.replace('app/', '')}`} 
                        analyzedImage={`http://127.0.0.1:8000/${analysisData.processed_image_path.replace('app/', '')}`} 
                      />
                    </div>
                    <div className="space-y-6 overflow-y-auto pr-2 pb-6">
                      <TerrainInfo data={analysisData} />
                      <Analytics data={analysisData} />
                    </div>
                  </div>
                )}
                
                {activeTab === "navigation" && imageId && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                    <div className="lg:col-span-2 h-[600px] lg:h-auto">
                      <InteractiveMap 
                        imageId={imageId}
                        bgImage={`http://127.0.0.1:8000/${originalImagePath?.replace('app/', '')}`}
                      />
                    </div>
                    <div className="space-y-6 overflow-y-auto pr-2 pb-6">
                      <NavigationPath />
                    </div>
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

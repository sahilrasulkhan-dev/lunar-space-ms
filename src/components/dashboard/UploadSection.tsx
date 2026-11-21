"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ScanLine, Radar, Compass, Image as ImageIcon, Sparkles } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";

interface UploadSectionProps {
  onComplete: (id: number, originalPath: string, data: any) => void;
}

export function UploadSection({ onComplete }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState("Initializing neural sensor pipeline...");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selected = acceptedFiles[0];
      setFile(selected);
      const objectUrl = URL.createObjectURL(selected);
      setPreview(objectUrl);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpeg", ".jpg", ".webp", ".tif"] },
    maxFiles: 1,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const startAnalysis = async () => {
    if (!file) return;
    setIsScanning(true);
    setScanProgress(15);
    setScanStep("Uploading multi-spectral surface frame...");
    
    try {
      // 1. Upload file to backend
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      setScanProgress(50);
      setScanStep("YOLO neural feature extraction (best.pt)...");
      
      if (!uploadData.success) {
        throw new Error(JSON.stringify(uploadData));
      }
      
      const imageId = uploadData.data.image_id;
      const originalPath = uploadData.data.file_path;

      // 2. Trigger AI analysis on backend
      setScanProgress(80);
      setScanStep("Classifying basalt safe zones & YOLO hazard coordinates...");
      
      const analyzeRes = await fetch(`http://127.0.0.1:8000/api/analyze/${imageId}`, {
        method: "POST"
      });
      const analyzeData = await analyzeRes.json();
      setScanProgress(100);
      setScanStep("Touchdown suitability matrix generated.");

      if (!analyzeData.success) {
        throw new Error(JSON.stringify(analyzeData));
      }

      setIsScanning(false);
      onComplete(imageId, originalPath, analyzeData.data.results);

    } catch (error: any) {
      console.error("Analysis pipeline error:", error);
      setIsScanning(false);
      
      let errorMsg = error.message || "An error occurred during lunar surface analysis.";
      let errorStep = "Processing Pipeline";
      
      if (error.message && error.message.startsWith("{")) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) errorMsg = parsed.error;
          if (parsed.step) errorStep = parsed.step;
          alert(`Analysis Error [${errorStep}]:\n${errorMsg}`);
          return;
        } catch (e) {}
      }
      
      alert(`Backend Communication Notice:\n${errorMsg}\n\nEnsure backend FastAPI server is running on http://127.0.0.1:8000.`);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="p-8 md:p-12 w-full relative z-10" variant="editorial">
        {/* Section Header - Highly Readable Font Hierarchy */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-[rgba(160,195,240,0.14)] gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs md:text-sm font-mono tracking-[0.25em] text-[#A8C4E6] uppercase mb-1.5 font-medium">
              <Compass className="w-4 h-4 text-[#84A0C6]" />
              Optical Cartography Sensor Ingestion
            </div>
            <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-[#F4F7FC] uppercase">
              Lunar Terrain Telemetry Ingestion
            </h2>
          </div>
          <div className="text-right font-mono text-xs md:text-sm text-[#8292A8] hidden md:block space-y-0.5">
            <div>RESOLUTIONS: 0.5M TO 100M/PX</div>
            <div className="text-[#A8C4E6] font-semibold">SPECTRA: UV / VIS / THERMAL NIR</div>
          </div>
        </div>

        {/* Upload Dropzone / Preview */}
        <AnimatePresence mode="wait">
          {!preview ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div
                {...getRootProps()}
                data-cursor-text="DROP"
                className={`border-2 border-dashed rounded-xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300 relative group overflow-hidden ${
                  isDragActive
                    ? "border-[#B8D4F5] bg-[#84A0C6]/15 shadow-[0_0_35px_rgba(100,160,240,0.25)]"
                    : "border-[rgba(160,195,240,0.2)] bg-[#84A0C6]/5 hover:border-[rgba(180,215,255,0.5)] hover:bg-[#84A0C6]/10"
                }`}
              >
                <input {...getInputProps()} />

                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-18 h-18 rounded-full bg-[#84A0C6]/15 border border-[#84A0C6]/30 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-[#B8D4F5] group-hover:shadow-[0_0_20px_rgba(132,175,235,0.3)] transition-all">
                    <Upload className="w-8 h-8 text-[#E2ECF8]" />
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#F4F7FC] mb-3 font-mono">
                    Drag & Drop Lunar Imagery
                  </h3>
                  
                  <p className="text-sm md:text-base text-[#B4C2D6] max-w-lg mb-8 leading-relaxed font-sans">
                    Supports high-resolution Apollo orbital frames, LRO Narrow Angle Camera captures, or processed lunar mosaics (PNG, JPG, TIFF).
                  </p>

                  <NeonButton variant="secondary" size="md" onClick={(e) => e.preventDefault()} cursorText="SELECT">
                    <ImageIcon className="w-4 h-4 mr-2 text-[#A8C4E6]" />
                    Select Orbital Image File
                  </NeonButton>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-xl overflow-hidden border border-[rgba(160,195,240,0.22)] bg-black"
            >
              {/* Telemetry info header on preview */}
              <div className="h-12 border-b border-[rgba(160,195,240,0.14)] bg-[#070D1A]/90 px-5 flex items-center justify-between text-xs md:text-sm font-mono text-[#B4C2D6]">
                <span className="truncate max-w-[280px] text-[#F4F7FC] font-semibold">{file?.name || "Lunar_Surface_Capture.png"}</span>
                <span className="text-[#A8C4E6]">{(file ? (file.size / 1024 / 1024).toFixed(2) : "0.00")} MB</span>
              </div>

              <div className="relative aspect-[16/10] max-h-[520px] flex items-center justify-center bg-[#070B14]">
                <img
                  src={preview}
                  alt="Lunar Specimen Preview"
                  className="max-w-full max-h-full object-contain filter contrast-110"
                />

                {/* Scanning laser and reticle overlay with blue atmospheric glow */}
                {isScanning && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <motion.div
                      animate={{ top: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-[#B8D4F5] shadow-[0_0_18px_rgba(180,215,255,1)]"
                    />
                    
                    <div className="absolute inset-8 border border-[#84A0C6]/30 border-dashed" />
                    
                    {/* HUD Status Box */}
                    <div className="absolute bottom-6 left-6 right-6 md:right-auto md:min-w-[380px] bg-[#070D1A]/95 backdrop-blur-xl border border-[#84A0C6]/35 p-5 rounded-lg font-mono text-xs md:text-sm shadow-[0_0_25px_rgba(0,0,0,0.8)]">
                      <div className="flex items-center justify-between text-[#F4F7FC] mb-2.5 font-bold">
                        <div className="flex items-center gap-2">
                          <ScanLine className="w-4 h-4 text-[#A8C4E6] animate-pulse" />
                          <span>PROCESSING TERRAIN MATRIX</span>
                        </div>
                        <span className="text-[#B8D4F5]">{scanProgress}%</span>
                      </div>
                      
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2.5">
                        <motion.div
                          className="h-full bg-[#B8D4F5] shadow-[0_0_10px_rgba(184,212,245,0.9)]"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      
                      <div className="text-xs text-[#B4C2D6] truncate">
                        {scanStep}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Overlay */}
              <div className="p-5 bg-[#070D1A]/90 border-t border-[rgba(160,195,240,0.14)] flex items-center justify-between">
                <button
                  onClick={clearFile}
                  disabled={isScanning}
                  data-cursor-text="DISCARD"
                  className="px-4 py-2 rounded border border-[rgba(160,195,240,0.2)] text-xs md:text-sm font-mono text-[#B4C2D6] hover:text-white hover:border-rose-400/50 hover:bg-rose-500/10 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <X className="w-4 h-4 inline mr-1.5" />
                  Discard File
                </button>

                {!isScanning && (
                  <NeonButton onClick={startAnalysis} variant="primary" size="md" cursorText="ANALYZE">
                    <Radar className="w-4 h-4 mr-2" />
                    Execute AI Terrain Analysis
                  </NeonButton>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Informational Footer */}
        <div className="mt-8 pt-6 border-t border-[rgba(160,195,240,0.12)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs md:text-sm font-mono text-[#8292A8]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#84A0C6]" />
            <span>SUPPORTED DETECTORS: OPENCV HOUGH TRANSFORM // CANNY EDGE // REGOLITH CLASSIFIER</span>
          </div>
          <span className="text-[#B4C2D6]">SECURE SANDBOX PIPELINE v4.2</span>
        </div>
      </GlassCard>
    </div>
  );
}

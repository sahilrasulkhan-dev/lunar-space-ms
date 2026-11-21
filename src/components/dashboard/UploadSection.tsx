"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ScanLine, Radar, Compass, Image as ImageIcon, AlertTriangle, ShieldAlert } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";
import { NeonButton } from "../ui/NeonButton";

interface UploadSectionProps {
  onComplete: (id: number, originalPath: string, data: any) => void;
  onReset?: () => void;
}

export function UploadSection({ onComplete, onReset }: UploadSectionProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState("Initializing neural sensor pipeline...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  // Auto-dismiss error toast after 8 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
        setErrorDetail(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Client-side quick spectral color pre-check
  const validateClientImage = (fileToCheck: File): Promise<{ valid: boolean; reason?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(fileToCheck);
      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            resolve({ valid: true });
            return;
          }
          const sample = 80;
          canvas.width = sample;
          canvas.height = sample;
          ctx.drawImage(img, 0, 0, sample, sample);
          const data = ctx.getImageData(0, 0, sample, sample).data;

          let totalDivergence = 0;
          let totalSat = 0;
          const pixelCount = sample * sample;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            totalDivergence += Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);

            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            const sat = max === 0 ? 0 : (max - min) / max;
            totalSat += sat * 255;
          }

          const avgDivergence = totalDivergence / pixelCount;
          const avgSat = totalSat / pixelCount;

          // Reject vivid color images (Earth nature, humans, cars, pets, colorful scenes)
          if (avgDivergence > 16.0 || avgSat > 24.0) {
            resolve({
              valid: false,
              reason: `Non-lunar chromatic colors detected (Saturation: ${avgSat.toFixed(1)}, Color variance: ${avgDivergence.toFixed(1)}). Lunar terrain is monochromatic regolith.`
            });
            return;
          }

          resolve({ valid: true });
        } catch {
          resolve({ valid: true });
        }
      };
      img.onerror = () => resolve({ valid: true });
      img.src = url;
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setErrorMessage(null);
      setErrorDetail(null);
      onReset?.(); // Immediately clear any old analysis results

      const selected = acceptedFiles[0];
      const objectUrl = URL.createObjectURL(selected);
      setFile(selected);
      setPreview(objectUrl);

      // Perform quick client pre-validation check
      const clientCheck = await validateClientImage(selected);
      if (!clientCheck.valid) {
        setErrorMessage("Analysis Failed: Invalid Image. Please upload a valid lunar terrain image.");
        setErrorDetail(clientCheck.reason || "Image lacks recognized lunar surface characteristics.");
        setFile(null);
        URL.revokeObjectURL(objectUrl);
        setPreview(null);
        onReset?.();
      }
    }
  }, [onReset]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpeg", ".jpg", ".webp", ".tif"] },
    maxFiles: 1,
    disabled: isScanning
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setErrorMessage(null);
    setErrorDetail(null);
    onReset?.();
  };

  const startAnalysis = async () => {
    if (!file || isScanning) return; // Prevent duplicate submissions

    setIsScanning(true);
    setErrorMessage(null);
    setErrorDetail(null);
    onReset?.(); // Ensure old results are never shown

    setScanProgress(15);
    setScanStep("Validating lunar terrain telemetry & surface features...");

    try {
      // 1. Client-side pre-verification
      const clientCheck = await validateClientImage(file);
      if (!clientCheck.valid) {
        setErrorMessage("Analysis Failed: Invalid Image. Please upload a valid lunar terrain image.");
        setErrorDetail(clientCheck.reason || "Non-lunar chromatic colors detected.");
        setIsScanning(false);
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        onReset?.();
        return;
      }

      // 2. Upload file & perform backend lunar validation
      setScanProgress(40);
      setScanStep("Uploading frame & verifying lunar surface morphology...");

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok || !uploadData.success) {
        setErrorMessage("Analysis Failed: Invalid Image. Please upload a valid lunar terrain image.");
        setErrorDetail(uploadData.error || uploadData.detail || "Image is not recognized as authentic lunar terrain.");
        setIsScanning(false);
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        onReset?.();
        return;
      }

      const imageId = uploadData.data.image_id;
      const originalPath = uploadData.data.file_path;

      // 3. Trigger YOLO & OpenCV AI analysis on verified lunar terrain
      setScanProgress(75);
      setScanStep("YOLO neural feature extraction (best.pt)...");

      const analyzeRes = await fetch(`http://127.0.0.1:8000/api/analyze/${imageId}`, {
        method: "POST"
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok || !analyzeData.success) {
        setErrorMessage("Analysis Failed: Invalid Image. Please upload a valid lunar terrain image.");
        setErrorDetail(analyzeData.error || "Lunar terrain verification rejected this image.");
        setIsScanning(false);
        setFile(null);
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        onReset?.();
        return;
      }

      setScanProgress(100);
      setScanStep("Touchdown suitability matrix generated.");

      setIsScanning(false);
      onComplete(imageId, originalPath, analyzeData.data.results);

    } catch (error: any) {
      console.error("Analysis pipeline error:", error);
      setIsScanning(false);
      setFile(null);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(null);
      onReset?.();

      let msg = "Analysis Failed: Invalid Image. Please upload a valid lunar terrain image.";
      let detail = "Could not communicate with the lunar validation engine or image was rejected.";

      if (error.message && error.message.startsWith("{")) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) msg = parsed.error;
          if (parsed.step) detail = parsed.step;
        } catch {}
      }

      setErrorMessage(msg);
      setErrorDetail(detail);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Toast Notification for Invalid Image Analysis Error */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 right-4 sm:right-8 z-50 max-w-lg w-[calc(100vw-2rem)] bg-[#1A0A0E]/95 border border-rose-500/70 p-4 rounded-xl shadow-[0_0_35px_rgba(244,63,94,0.45)] backdrop-blur-2xl flex items-start gap-3.5"
          >
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-400 shrink-0">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-mono text-xs uppercase tracking-wider text-rose-400 font-bold mb-0.5 flex items-center gap-1.5">
                <span>VALIDATION REJECTED</span>
              </div>
              <div className="font-mono text-sm text-[#F4F7FC] font-bold leading-snug">
                {errorMessage}
              </div>
              {errorDetail && (
                <div className="font-mono text-xs text-rose-300/80 mt-1 leading-relaxed">
                  {errorDetail}
                </div>
              )}
            </div>
            <button
              onClick={() => { setErrorMessage(null); setErrorDetail(null); }}
              className="text-rose-400 hover:text-white p-1 rounded transition cursor-pointer"
              title="Dismiss Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GlassCard className="p-8 md:p-12 w-full relative z-10" variant="editorial">
        {/* Section Header */}
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
            <div>VALIDATION: LUNAR REGOLITH ONLY</div>
            <div className="text-[#A8C4E6] font-semibold">DETECTORS: YOLO (best.pt) + HOUGH CRATERS</div>
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
                    : errorMessage
                    ? "border-rose-500/50 bg-rose-950/10 hover:border-rose-400/80"
                    : "border-[rgba(160,195,240,0.2)] bg-[#84A0C6]/5 hover:border-[rgba(180,215,255,0.5)] hover:bg-[#84A0C6]/10"
                }`}
              >
                <input {...getInputProps()} />

                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-18 h-18 rounded-full flex items-center justify-center mb-6 group-hover:scale-105 transition-all ${
                    errorMessage 
                      ? "bg-rose-500/15 border border-rose-500/40 text-rose-400"
                      : "bg-[#84A0C6]/15 border border-[#84A0C6]/30 text-[#E2ECF8] group-hover:border-[#B8D4F5] group-hover:shadow-[0_0_20px_rgba(132,175,235,0.3)]"
                  }`}>
                    {errorMessage ? <AlertTriangle className="w-8 h-8 text-rose-400" /> : <Upload className="w-8 h-8 text-[#E2ECF8]" />}
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-[#F4F7FC] mb-3 font-mono">
                    Drag & Drop Lunar Imagery
                  </h3>
                  
                  <p className="text-sm md:text-base text-[#B4C2D6] max-w-lg mb-8 leading-relaxed font-sans">
                    Accepts authentic Apollo orbital frames, LRO captures, or simulated lunar landscapes. Unrelated photographs (humans, buildings, cars, Earth landscapes) are automatically rejected.
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

                {/* Scanning laser and reticle overlay */}
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
                          <span>VALIDATING & PROCESSING TERRAIN</span>
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
                  <NeonButton onClick={startAnalysis} variant="primary" size="md" cursorText="ANALYZE" disabled={isScanning}>
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
            <span>SPECTRAL VALIDATION ACTIVE: NON-LUNAR IMAGES ARE STRICTLY EXCLUDED</span>
          </div>
          <span className="text-[#B4C2D6]">LUNAR RECONNAISSANCE GATEWAY v5.0</span>
        </div>
      </GlassCard>
    </div>
  );
}

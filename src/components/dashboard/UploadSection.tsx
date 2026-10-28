"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ScanLine, Radar } from "lucide-react";
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
    accept: { 'image/*': ['.png', '.jpeg', '.jpg'] },
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
    setScanProgress(10);
    
    try {
      // 1. Upload
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch("http://127.0.0.1:8000/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      setScanProgress(40);
      
      if (!uploadData.success) {
        throw new Error(JSON.stringify(uploadData));
      }
      
      const imageId = uploadData.data.image_id;
      const originalPath = uploadData.data.file_path;

      // 2. Analyze
      const analyzeRes = await fetch(`http://127.0.0.1:8000/api/analyze/${imageId}`, {
        method: "POST"
      });
      const analyzeData = await analyzeRes.json();
      setScanProgress(90);

      if (!analyzeData.success) {
        throw new Error(JSON.stringify(analyzeData));
      }

      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
        onComplete(imageId, originalPath, analyzeData.data.results);
      }, 500);

    } catch (error: any) {
      console.error(error);
      setIsScanning(false);
      
      let errorMsg = error.message || "An error occurred during processing.";
      let errorStep = "Unknown";
      
      // If the error string contains JSON, we parse it
      if (error.message && error.message.startsWith('{')) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.error) errorMsg = parsed.error;
          if (parsed.step) errorStep = parsed.step;
          alert(`Step Failed: ${errorStep}\nError: ${errorMsg}`);
          return;
        } catch (e) {}
      }
      
      alert(errorMsg);
    }
  };

  return (
    <GlassCard className="p-8 w-full max-w-3xl mx-auto" glowColor="cyan">
      <div className="text-center mb-8">
        <h2 className="font-heading text-2xl font-bold mb-2">Initialize Terrain Analysis</h2>
        <p className="text-white/60">Upload high-resolution lunar surface imagery for AI processing.</p>
      </div>

      <AnimatePresence mode="wait">
        {!preview ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? "border-electric-blue bg-electric-blue/10 shadow-[0_0_30px_rgba(0,240,255,0.2)]" 
                  : "border-white/20 hover:border-white/50 hover:bg-white/5"
              }`}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-full bg-dark-navy border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Upload className={`w-8 h-8 ${isDragActive ? "text-electric-blue" : "text-white/50"}`} />
              </div>
              <h3 className="text-xl font-medium mb-2">Drag & Drop Image Here</h3>
              <p className="text-white/40 text-sm mb-6">Supports PNG, JPEG, JPG</p>
              <NeonButton variant="secondary" onClick={(e) => e.preventDefault()}>Browse Files</NeonButton>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/50"
          >
            <div className="relative aspect-video flex items-center justify-center">
              <img src={preview} alt="Lunar Preview" className="max-w-full max-h-full object-contain" />
              
              {isScanning && (
                <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
                  <div className="absolute inset-0 bg-electric-blue/10 mix-blend-overlay" />
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-electric-blue shadow-[0_0_20px_rgba(0,240,255,1)]"
                  />
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-electric-blue"
                  />
                  <div className="absolute bottom-4 left-4 font-mono text-electric-blue text-sm bg-black/50 px-3 py-1 rounded backdrop-blur flex items-center gap-2">
                    <ScanLine className="w-4 h-4 animate-pulse" />
                    ANALYZING TERRAIN... {scanProgress}%
                  </div>
                </div>
              )}
            </div>

            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={clearFile}
                disabled={isScanning}
                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500/20 hover:border-red-500 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="absolute bottom-4 right-4">
              {!isScanning && (
                <NeonButton onClick={startAnalysis} glow className="shadow-lg">
                  <Radar className="w-5 h-5" />
                  Start AI Analysis
                </NeonButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

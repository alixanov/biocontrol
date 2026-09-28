"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, X, CheckCircle2, Sparkles, Scan, ArrowRight } from "lucide-react";
import { QualityGateMetrics } from "@/types/screening";
import { TranslationDictionary } from "@/i18n/translations";

interface WebcamCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteScan: (metrics: QualityGateMetrics) => void;
  t: TranslationDictionary;
}

export const WebcamCaptureModal: React.FC<WebcamCaptureModalProps> = ({
  isOpen,
  onClose,
  onCompleteScan,
  t,
}) => {
  const [mode, setMode] = useState<"camera" | "upload">("camera");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleStartAnalysis = () => {
    setIsProcessing(true);
    setProcessStep(t.scanStep1);

    setTimeout(() => {
      setProcessStep(t.scanStep2);
    }, 800);

    setTimeout(() => {
      setProcessStep(t.scanStep3);
    }, 1600);

    setTimeout(() => {
      setIsProcessing(false);
      onCompleteScan({
        passed: true,
        laplacianVariance: 184.2,
        faceResolution: [512, 512],
        headPose: { pitch: 0.8, yaw: -0.4, roll: 0.1 },
        lightingQuality: 98,
        occlusionScore: 1.2,
      });
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[36px] p-7 shadow-[0_25px_60px_rgba(15,23,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white dark:border-white/10 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-cyan-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t.scannerModalTitle}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.scannerModalSubtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1.5 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
          <button
            onClick={() => setMode("camera")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "camera" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Camera className="w-4 h-4 text-indigo-500 dark:text-cyan-400" />
            <span>{t.scannerModeCamera}</span>
          </button>
          <button
            onClick={() => setMode("upload")}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              mode === "upload" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Upload className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>{t.scannerModeUpload}</span>
          </button>
        </div>

        {/* Viewport / Upload Area */}
        <div className="relative w-full h-64 bg-slate-950 rounded-3xl overflow-hidden flex flex-col items-center justify-center text-center p-6 border border-slate-800 shadow-inner">
          {mode === "camera" ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-36 h-48 border-2 border-dashed border-indigo-400/80 rounded-full flex items-center justify-center bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                <span className="text-[11px] text-white/90 font-medium px-2">{t.scannerCenterFace}</span>
              </div>
              <span className="text-xs text-slate-400">{t.scannerLightingTip}</span>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-full border-2 border-dashed border-slate-700 hover:border-indigo-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer p-4 transition-colors group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={() => handleStartAnalysis()}
              />
              <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-indigo-600/30 flex items-center justify-center text-indigo-400 mb-2 transition-colors">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-white">{t.scannerUploadPrompt}</p>
              <p className="text-[10px] text-slate-400 mt-1">{t.scannerUploadFormats}</p>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center gap-4 z-20">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin" />
                <Sparkles className="w-5 h-5 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-white animate-pulse">{processStep}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            {t.scannerBtnCancel}
          </button>
          <button
            onClick={handleStartAnalysis}
            disabled={isProcessing}
            className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-indigo-600 dark:via-purple-600 dark:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-950/20 hover:shadow-indigo-950/30 transition-all flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>{isProcessing ? t.scannerBtnAnalyzing : t.scannerBtnStart}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

      </div>
    </div>
  );
};



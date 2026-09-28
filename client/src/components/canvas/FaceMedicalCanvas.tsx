"use client";

import React, { useState } from "react";
import { BiomarkerFinding } from "@/types/screening";
import { Sparkles, CheckCircle2, Scan, Maximize2, ShieldCheck, Heart, Wind, Zap, Activity } from "lucide-react";
import { TranslationDictionary } from "@/i18n/translations";

interface FaceMedicalCanvasProps {
  findings: BiomarkerFinding[];
  selectedFinding: BiomarkerFinding | null;
  onSelectFinding: (finding: BiomarkerFinding) => void;
  isScanning: boolean;
  onTriggerScan: () => void;
  t: TranslationDictionary;
}

export const FaceMedicalCanvas: React.FC<FaceMedicalCanvasProps> = ({
  findings,
  selectedFinding,
  onSelectFinding,
  isScanning,
  onTriggerScan,
  t,
}) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const HOTSPOT_INFO: Record<string, { top: string; left: string; label: string; stat: string }> = {
    SKIN_BARRIER_HYDRATION: { top: "26%", left: "50%", label: t.zoneForehead, stat: t.zoneForeheadStat },
    PERIORBITAL_EDEMA: { top: "42%", left: "37%", label: t.zoneEyes, stat: t.zoneEyesStat },
    FACIAL_ERYTHEMA: { top: "54%", left: "33%", label: t.zoneCheeks, stat: t.zoneCheeksStat },
    FACIAL_SYMMETRY_TONE: { top: "67%", left: "50%", label: t.zoneLips, stat: t.zoneLipsStat },
  };

  return (
    <div className="relative w-full h-[620px] bg-transparent rounded-[36px] overflow-hidden flex flex-col justify-between p-6 select-none">
      
      {/* Ambient Floating Pastel Spheres (Matching Image 1 & 2) */}
      <div className="absolute top-12 left-10 w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-300 to-sky-100 dark:from-cyan-500 dark:to-blue-900 shadow-[0_8px_20px_rgba(56,189,248,0.35),inset_0_2px_6px_rgba(255,255,255,0.8)] border border-white/80 dark:border-cyan-400/30 animate-float-slow pointer-events-none z-10" />
      <div className="absolute top-16 right-16 w-8 h-8 rounded-full bg-gradient-to-tr from-rose-300 to-amber-100 dark:from-rose-500 dark:to-purple-900 shadow-[0_6px_16px_rgba(244,63,94,0.3),inset_0_2px_6px_rgba(255,255,255,0.8)] border border-white/80 dark:border-rose-400/30 animate-float-reverse pointer-events-none z-10" />
      <div className="absolute bottom-28 right-24 w-7 h-7 rounded-full bg-gradient-to-tr from-purple-300 to-pink-200 dark:from-purple-500 dark:to-indigo-900 shadow-[0_6px_16px_rgba(192,132,252,0.3),inset_0_2px_6px_rgba(255,255,255,0.8)] border border-white/80 dark:border-purple-400/30 animate-float-slow pointer-events-none z-10" />
      <div className="absolute bottom-20 left-16 w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-300 to-teal-100 dark:from-emerald-500 dark:to-teal-900 shadow-[0_4px_12px_rgba(52,211,153,0.3),inset_0_2px_6px_rgba(255,255,255,0.8)] border border-white/80 dark:border-emerald-400/30 animate-float-reverse pointer-events-none z-10" />

      {/* Floating Status Callout Pills on Left & Right (Matching Image 1 Callouts) */}
      
      {/* Callout 1: Heart Activity (Top Right) */}
      <div className="absolute top-8 right-6 z-20 hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-[0_8px_25px_rgba(148,163,184,0.18)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/90 dark:border-white/10 animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">{t.heartActivityTitle}</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.heartActivityValue}</p>
        </div>
      </div>

      {/* Callout 2: Breath Activity (Mid Right) */}
      <div className="absolute top-28 right-2 z-20 hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-[0_8px_25px_rgba(148,163,184,0.18)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/90 dark:border-white/10 animate-float-reverse">
        <div className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">{t.breathActivityTitle}</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.breathActivityValue}</p>
        </div>
      </div>

      {/* Callout 3: Symmetry & Tone (Bottom Left) */}
      <div className="absolute bottom-20 left-4 z-20 hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-[0_8px_25px_rgba(148,163,184,0.18)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/90 dark:border-white/10 animate-float-slow">
        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
          <Activity className="w-3.5 h-3.5" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">{t.facialSymmetryTitle}</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.facialSymmetryValue}</p>
        </div>
      </div>

      {/* Callout 4: AI Performance (Bottom Right) */}
      <div className="absolute bottom-20 right-8 z-20 hidden md:flex items-center gap-2.5 px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-full shadow-[0_8px_25px_rgba(148,163,184,0.18)] dark:shadow-[0_8px_25px_rgba(0,0,0,0.5)] border border-white/90 dark:border-white/10 animate-float-reverse">
        <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
        <div className="text-left">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium leading-none">{t.aiHealthIndexTitle}</p>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{t.aiHealthIndexValue}</p>
        </div>
      </div>

      {/* Center Stage: Frosted Pedestal Bowl & Floating Anatomy Model */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        
        {/* Concentric Orbital Stage Rings (Image 1 replica) */}
        <div className="absolute bottom-8 w-[420px] h-[130px] rounded-[100%] border border-indigo-200/40 dark:border-cyan-500/20 shadow-[0_0_50px_rgba(199,210,254,0.3)] dark:shadow-[0_0_50px_rgba(6,182,212,0.15)] pointer-events-none" />
        <div className="absolute bottom-12 w-[340px] h-[90px] rounded-[100%] border border-purple-200/50 dark:border-purple-500/20 pointer-events-none" />

        {/* Frosted Curved Stage Bowl */}
        <div className="absolute bottom-10 w-[380px] h-[180px] bg-gradient-to-b from-white/90 via-white/70 to-indigo-50/40 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-indigo-950/40 backdrop-blur-2xl rounded-b-[190px] border-b border-x border-white/90 dark:border-white/10 shadow-[0_24px_50px_rgba(148,163,184,0.2),inset_0_10px_20px_rgba(255,255,255,0.9)] dark:shadow-[0_24px_50px_rgba(0,0,0,0.7),inset_0_10px_20px_rgba(255,255,255,0.05)] overflow-hidden pointer-events-none flex items-center justify-center">
          <div className="absolute top-0 inset-x-8 h-1 bg-gradient-to-r from-transparent via-indigo-300/40 dark:via-cyan-400/40 to-transparent" />
        </div>

        {/* Anatomical Head Floating on Stage */}
        <div className="relative z-10 w-[310px] h-[370px] -mt-10 flex items-center justify-center pointer-events-auto transition-transform duration-500 hover:scale-[1.02]">
          <img
            src="/images/face_anatomy_hero.png"
            alt="BioControl AI 3D Head Visualization"
            className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(99,102,241,0.2)] animate-float-slow"
          />

          {/* Scanning Line Effect */}
          {isScanning && (
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22D3EE] animate-scan z-20 pointer-events-none" />
          )}

          {/* Interactive Anatomical Hotspots with Leader Tags */}
          {findings.map((finding) => {
            const pos = HOTSPOT_INFO[finding.code] || { top: "50%", left: "50%", label: finding.name, stat: t.resultStatusNormal };
            const isSelected = selectedFinding?.id === finding.id;

            return (
              <div
                key={finding.id}
                onClick={() => onSelectFinding(finding)}
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute pointer-events-auto cursor-pointer group z-30 transition-transform duration-300 hover:scale-110"
              >
                <div className="relative flex items-center">
                  
                  {/* Glowing Node Button */}
                  <span
                    className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-all ${
                      isSelected
                        ? "bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 scale-110 ring-4 ring-indigo-400/40 dark:ring-cyan-400/50 shadow-indigo-400/50"
                        : "bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 border border-white/90 dark:border-white/10 group-hover:scale-110 group-hover:shadow-md"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-cyan-400 dark:bg-slate-950 animate-pulse" : "bg-indigo-500 dark:bg-cyan-400"}`} />
                  </span>

                  {/* Connected Frosted Mini Badge */}
                  <div
                    className={`absolute left-9 whitespace-nowrap px-3 py-1.5 rounded-2xl border text-xs font-semibold shadow-md transition-all ${
                      isSelected
                        ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-700 dark:border-slate-600 shadow-xl"
                        : "bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 border-white/90 dark:border-white/10 group-hover:bg-white dark:group-hover:bg-slate-800 group-hover:text-slate-900 dark:group-hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{pos.label}</span>
                      <span className="text-[10px] text-emerald-500 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
                        {pos.stat}
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

        </div>

      </div>

      {/* Bottom Floating Control Strip (Carousel Dots & Expansion Icon) */}
      <div className="z-20 pointer-events-auto flex items-center justify-between mt-auto">
        
        {/* Left Status pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-white/80 dark:border-white/10 shadow-sm text-xs font-medium text-slate-500 dark:text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-cyan-400" />
          <span>{t.clickZonePrompt}</span>
        </div>

        {/* Center Carousel Pagination Dots (Image 1 replica) */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md rounded-full border border-white/80 dark:border-white/10 shadow-sm mx-auto sm:mx-0">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                activeSlide === idx ? "w-5 bg-slate-800 dark:bg-cyan-400" : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>

        {/* Right Stage Expansion Button (Image 1 bottom right icon) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerScan}
            className="p-2.5 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-cyan-400 rounded-full border border-white/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all cursor-pointer"
            title="Scan"
          >
            <Scan className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};



"use client";

import React from "react";
import { QualityGateMetrics } from "@/types/screening";
import { CheckCircle2, ShieldCheck, HelpCircle, Activity } from "lucide-react";

interface QualityScoreCardProps {
  score: number;
  qualityGate: QualityGateMetrics;
}

export const QualityScoreCard: React.FC<QualityScoreCardProps> = ({
  score,
  qualityGate,
}) => {
  // SVG circular progress calculation
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-[32px] p-6 border border-neutral-200/80 shadow-[0_4px_24px_-2px_rgba(13,17,28,0.05)] flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Biometric Gate
          </span>
          <h3 className="text-base font-bold text-[#0D111C]">Quality & Vitals</h3>
        </div>

        <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold flex items-center gap-1.5 border border-emerald-200/60">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Valid Frame</span>
        </div>
      </div>

      {/* Center Circular Progress Ring & Numbers */}
      <div className="flex items-center justify-around py-4">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="text-neutral-100"
              strokeWidth="9"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#0062FF"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-[#0D111C] tracking-tight">
              {score}
              <span className="text-xs text-[#0062FF] font-bold">%</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">Confidence</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-xs">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">
              Clarity Index
            </span>
            <span className="font-bold text-[#0D111C]">
              {qualityGate.laplacianVariance.toFixed(1)}{" "}
              <span className="text-emerald-600 text-[10px]">/ 100 min</span>
            </span>
          </div>
          <div className="text-xs">
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">
              Lighting Score
            </span>
            <span className="font-bold text-[#0D111C]">
              {qualityGate.lightingQuality}% Normal
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Micro-Metrics */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-neutral-100">
        <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-100">
          <span className="text-[10px] text-neutral-400 block font-medium">Head Pose</span>
          <span className="text-xs font-bold text-neutral-800 font-mono">
            P: {qualityGate.headPose.pitch}° | Y: {qualityGate.headPose.yaw}°
          </span>
        </div>
        <div className="p-2.5 bg-neutral-50 rounded-2xl border border-neutral-100">
          <span className="text-[10px] text-neutral-400 block font-medium">Occlusion</span>
          <span className="text-xs font-bold text-emerald-600 font-mono">
            {qualityGate.occlusionScore}% (Ideal)
          </span>
        </div>
      </div>
    </div>
  );
};

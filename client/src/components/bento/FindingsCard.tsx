"use client";

import React from "react";
import { BiomarkerFinding } from "@/types/screening";
import { AlertCircle, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";

interface FindingsCardProps {
  findings: BiomarkerFinding[];
  selectedFinding: BiomarkerFinding | null;
  onSelectFinding: (finding: BiomarkerFinding) => void;
}

export const FindingsCard: React.FC<FindingsCardProps> = ({
  findings,
  selectedFinding,
  onSelectFinding,
}) => {
  return (
    <div className="bg-white rounded-[32px] p-6 border border-neutral-200/80 shadow-[0_4px_24px_-2px_rgba(13,17,28,0.05)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            AI Screening Analysis
          </span>
          <h3 className="text-base font-bold text-[#0D111C]">Detected Biomarkers</h3>
        </div>
        <span className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs font-semibold">
          {findings.length} targets
        </span>
      </div>

      {/* Biomarkers List */}
      <div className="flex flex-col gap-2.5 my-3 max-h-[220px] overflow-y-auto pr-1">
        {findings.map((finding) => {
          const isSelected = selectedFinding?.id === finding.id;
          const isWarning = finding.severity === "MODERATE";

          return (
            <div
              key={finding.id}
              onClick={() => onSelectFinding(finding)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                isSelected
                  ? "bg-[#0D111C] text-white border-[#0D111C] shadow-md scale-[1.01]"
                  : "bg-neutral-50/70 hover:bg-neutral-100/80 border-neutral-200/60 text-neutral-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    isWarning ? "bg-amber-400" : "bg-[#D4F938]"
                  }`}
                />
                <div className="truncate">
                  <h4 className="text-xs font-bold truncate leading-tight">
                    {finding.name}
                  </h4>
                  <span
                    className={`text-[10px] block truncate ${
                      isSelected ? "text-neutral-400" : "text-neutral-500"
                    }`}
                  >
                    {finding.category} • Zone: {finding.zone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span
                    className={`text-xs font-black font-mono block leading-none ${
                      isSelected ? "text-[#D4F938]" : "text-[#0062FF]"
                    }`}
                  >
                    {Math.round(finding.probability * 100)}%
                  </span>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider ${
                      isWarning ? "text-amber-500" : "text-emerald-500"
                    }`}
                  >
                    {finding.severity}
                  </span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 ${
                    isSelected ? "text-white" : "text-neutral-400"
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Item Detail Callout */}
      {selectedFinding && (
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase font-bold text-neutral-400 block">
              Clinical & Myological Insight
            </span>
            {selectedFinding.muscleName && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold">
                {selectedFinding.muscleName.split("(")[0]}
              </span>
            )}
          </div>
          <p className="text-neutral-700 text-[11px] leading-relaxed mb-1.5">
            {selectedFinding.description}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#0062FF]">
            <Sparkles className="w-3 h-3" />
            <span>{selectedFinding.recommendation}</span>
          </div>
        </div>
      )}
    </div>
  );
};

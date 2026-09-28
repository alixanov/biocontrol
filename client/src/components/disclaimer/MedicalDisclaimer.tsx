"use client";

import React, { useState } from "react";
import { AlertCircle, X, ShieldAlert, Check } from "lucide-react";

export const MedicalDisclaimer: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Medical Disclaimer" className="w-full bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-amber-900 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600">
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold block text-amber-950">
            Regulatory Notice & Non-Diagnostic Status
          </span>
          <p className="text-[11px] text-amber-800/90 leading-relaxed">
            BioControl is a decision-support and preliminary visual biomarker screening instrument.
            It does not constitute a clinical diagnosis, medical prescription, or definitive disease confirmation.
            Always seek advice from a licensed medical physician for medical concerns.
          </p>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="px-3.5 py-1.5 bg-white border border-amber-200 rounded-full font-bold text-amber-900 hover:bg-amber-100 text-[11px] shrink-0 transition-colors shadow-xs"
      >
        I Understand
      </button>
    </aside>
  );
};

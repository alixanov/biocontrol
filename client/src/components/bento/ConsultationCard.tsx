"use client";

import React from "react";
import { UserCheck, ArrowUpRight, ShieldAlert, Calendar } from "lucide-react";

interface ConsultationCardProps {
  specialist: {
    speciality: string;
    urgency: "ROUTINE" | "RECOMMENDED" | "PRIORITY";
    doctorName?: string;
    availableTime?: string;
  };
  onBookConsultation: () => void;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  specialist,
  onBookConsultation,
}) => {
  return (
    <div className="bg-[#111318] text-white rounded-[32px] p-6 border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.25)] flex flex-col justify-between relative overflow-hidden group">
      {/* Background Subtle Gradient Mesh */}
      <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-[#0062FF]/20 blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
      <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-[#D4F938]/10 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4F938]">
          Clinical Referral
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/10">
          {specialist.urgency}
        </span>
      </div>

      {/* Main Specialist Info */}
      <div className="relative z-10 my-4">
        <h3 className="text-xl font-bold tracking-tight text-white mb-1">
          {specialist.speciality}
        </h3>
        <p className="text-xs text-neutral-400">
          {specialist.doctorName || "Certified Telehealth Physician"}
        </p>

        <div className="mt-3 flex items-center gap-2 text-xs text-neutral-300">
          <Calendar className="w-3.5 h-3.5 text-[#D4F938]" />
          <span>Next slot: {specialist.availableTime || "Today, 14:00"}</span>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Non-diagnostic triage</span>
        </div>

        <button
          onClick={onBookConsultation}
          className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#111318] hover:bg-[#D4F938] rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-md"
        >
          <span>Schedule</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

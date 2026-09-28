"use client";

import React from "react";
import { Search, Bell, ShieldCheck, Sparkles, ChevronRight } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewScan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onNewScan,
}) => {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/60">
      {/* Brand & Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0062FF] flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#0D111C] flex items-center gap-2">
              BioControl
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 bg-[#D4F938] text-[#111318] rounded-full">
                Screening v2.4
              </span>
            </h1>
            <p className="text-xs text-neutral-500 font-medium">
              Autonomous Facial Biomarker Health Intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Pill Segmented Tabs */}
      <div className="hidden lg:flex items-center p-1 bg-white rounded-full border border-neutral-200/80 shadow-sm">
        {(
          [
            { id: "overview", label: "Overview" },
            { id: "findings", label: "Biomarkers" },
            { id: "quality", label: "Quality Gate" },
            { id: "specialists", label: "Specialists" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-2 text-xs font-semibold rounded-full transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-[#0D111C] text-white shadow-sm"
                : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden sm:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search biomarker or tag..."
            className="pl-9 pr-4 py-2 text-xs bg-white border border-neutral-200/80 rounded-full w-48 focus:w-64 focus:outline-none focus:ring-2 focus:ring-[#0062FF]/20 focus:border-[#0062FF] transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2.5 bg-white border border-neutral-200/80 rounded-full hover:bg-neutral-50 transition-colors shadow-sm">
          <Bell className="w-4 h-4 text-neutral-700" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#D4F938] rounded-full border border-white" />
        </button>

        {/* Start Scan CTA Button (Electric Blue) */}
        <button
          onClick={onNewScan}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0062FF] hover:bg-[#004FD6] text-white text-xs font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Run Screening</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Doctor / Patient Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-neutral-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-neutral-800 to-neutral-600 border-2 border-white shadow-md flex items-center justify-center text-xs font-bold text-white">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};

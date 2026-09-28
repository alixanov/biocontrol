"use client";

import React from "react";
import {
  LayoutGrid,
  Camera,
  History,
  Stethoscope,
  SlidersHorizontal,
  LogOut,
} from "lucide-react";
import { TranslationDictionary } from "@/i18n/translations";

interface SidebarDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenScanner: () => void;
  t: TranslationDictionary;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
  activeTab,
  onTabChange,
  onOpenScanner,
  t,
}) => {
  return (
    <aside className="fixed left-6 top-8 bottom-8 z-40 hidden lg:flex flex-col items-center justify-between w-[82px] py-7 px-2 bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/90 dark:border-white/10 rounded-[38px] shadow-[0_20px_50px_rgba(148,163,184,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all select-none">
      
      {/* Top 3D Pearlescent Sphere Brand Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative group cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#DDE2FF] via-[#EEF2FF] to-white dark:from-slate-800 dark:via-indigo-950 dark:to-slate-900 shadow-[inset_0_4px_10px_rgba(255,255,255,0.9),0_8px_20px_rgba(165,180,252,0.35)] dark:shadow-[inset_0_2px_6px_rgba(255,255,255,0.15),0_8px_20px_rgba(0,0,0,0.5)] border border-white/90 dark:border-white/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-300 blur-[0.5px] shadow-sm" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-black tracking-widest text-slate-700 dark:text-slate-200 uppercase leading-none">{t.brandCore}</span>
          <span className="text-[7.5px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">{t.brandMedicine}</span>
        </div>
      </div>

      {/* Main Navigation Minimalist Icons */}
      <nav className="flex flex-col items-center gap-4">
        
        {/* Overview Tab */}
        <button
          onClick={() => onTabChange("overview")}
          className={`relative p-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${
            activeTab === "overview"
              ? "bg-gradient-to-b from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-lg shadow-slate-900/20 dark:shadow-indigo-500/30 scale-105"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
          }`}
          title={t.tabDashboard}
        >
          <LayoutGrid className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
          {activeTab === "overview" && (
            <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-indigo-500 rounded-r-full" />
          )}
        </button>

        {/* Live Camera Scanner */}
        <button
          onClick={onOpenScanner}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/25 transition-all duration-300 hover:scale-110 cursor-pointer"
          title={t.startScanBtn}
        >
          <Camera className="w-5 h-5 transition-transform group-hover:rotate-6 duration-200" />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        {/* History Tab */}
        <button
          onClick={() => onTabChange("history")}
          className={`relative p-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${
            activeTab === "history"
              ? "bg-gradient-to-b from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-lg shadow-slate-900/20 dark:shadow-indigo-500/30 scale-105"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
          }`}
          title={t.historyTitle}
        >
          <History className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
        </button>

        {/* Specialists Tab */}
        <button
          onClick={() => onTabChange("specialists")}
          className={`relative p-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${
            activeTab === "specialists"
              ? "bg-gradient-to-b from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-lg shadow-slate-900/20 dark:shadow-indigo-500/30 scale-105"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
          }`}
          title={t.specialistsTitle}
        >
          <Stethoscope className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => onTabChange("settings")}
          className={`relative p-3.5 rounded-2xl transition-all duration-300 cursor-pointer group ${
            activeTab === "settings"
              ? "bg-gradient-to-b from-slate-900 to-slate-800 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-lg shadow-slate-900/20 dark:shadow-indigo-500/30 scale-105"
              : "text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
          }`}
          title={t.settingsTitle}
        >
          <SlidersHorizontal className="w-5 h-5 transition-transform group-hover:scale-110 duration-200" />
        </button>

      </nav>

      {/* Bottom Exit Capsule Button */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => alert("BioControl Health AI")}
          className="p-3 rounded-2xl text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 transition-all cursor-pointer group"
          title="Status"
        >
          <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 duration-200" />
        </button>
      </div>

    </aside>
  );
};





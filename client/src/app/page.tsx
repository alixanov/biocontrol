"use client";

import React, { useState, useEffect } from "react";
import { SidebarDock } from "@/components/navigation/SidebarDock";
import { FaceMedicalCanvas } from "@/components/canvas/FaceMedicalCanvas";
import { WebcamCaptureModal } from "@/components/canvas/WebcamCaptureModal";
import { initialScreeningData } from "@/data/mockScreening";
import { BiomarkerFinding, QualityGateMetrics } from "@/types/screening";
import { Language, translations } from "@/i18n/translations";
import {
  Search,
  Bell,
  Camera,
  Sparkles,
  Droplets,
  Smile,
  CheckCircle2,
  X,
  Zap,
  Eye,
  Activity,
  Play,
  Pause,
  Sun,
  Moon,
  ArrowRight,
  Globe,
} from "lucide-react";

export default function Home() {
  const [lang, setLang] = useState<Language>("uz");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [screening, setScreening] = useState(initialScreeningData);
  const [selectedFinding, setSelectedFinding] = useState<BiomarkerFinding | null>(
    initialScreeningData.findings[0]
  );
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [isScannerModalOpen, setIsScannerModalOpen] = useState<boolean>(false);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(false);
  const [activeModal, setActiveModal] = useState<"history" | "specialists" | "settings" | "results" | null>(null);
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [zoneViewTab, setZoneViewTab] = useState<"metrics" | "exercise" | "anatomy">("metrics");
  const [isExerciseRunning, setIsExerciseRunning] = useState<boolean>(false);
  const [exerciseTimeLeft, setExerciseTimeLeft] = useState<number>(30);
  const [scanResults, setScanResults] = useState<{
    score: number;
    label: string;
    time: string;
    zones: { name: string; icon: React.ReactNode; status: string; color: string }[];
    tips: string[];
  } | null>(null);

  const t = translations[lang];

  // Sync theme with html class & localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("biocontrol_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("biocontrol_theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  // Exercise countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isExerciseRunning && exerciseTimeLeft > 0) {
      interval = setInterval(() => {
        setExerciseTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (exerciseTimeLeft === 0) {
      setIsExerciseRunning(false);
    }
    return () => clearInterval(interval);
  }, [isExerciseRunning, exerciseTimeLeft]);

  const handleStartExercise = () => {
    setExerciseTimeLeft(30);
    setIsExerciseRunning(true);
  };

  const handleResetExercise = () => {
    setIsExerciseRunning(false);
    setExerciseTimeLeft(30);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "history" || tab === "specialists" || tab === "settings") {
      setActiveModal(tab as "history" | "specialists" | "settings");
    } else {
      setActiveModal(null);
    }
  };

  const handleTriggerScan = () => {
    setIsScanningActive(true);
    setTimeout(() => setIsScanningActive(false), 2000);
  };

  const handleCompleteScan = (metrics: QualityGateMetrics) => {
    const score = Math.floor(Math.random() * 14) + 84; // 84–97%
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

    const zones = [
      {
        name: t.resultZone1,
        icon: <Zap className="w-4 h-4" />,
        status: t.resultStatusRelaxed,
        color: "text-emerald-500 dark:text-emerald-400",
      },
      {
        name: t.resultZone2,
        icon: <Eye className="w-4 h-4" />,
        status: t.resultStatusFresh,
        color: "text-emerald-500 dark:text-emerald-400",
      },
      {
        name: t.resultZone3,
        icon: <Activity className="w-4 h-4" />,
        status: t.resultStatusSymmetric,
        color: "text-emerald-500 dark:text-emerald-400",
      },
      {
        name: t.resultZone4,
        icon: <Smile className="w-4 h-4" />,
        status: t.resultStatusNormal,
        color: "text-emerald-500 dark:text-emerald-400",
      },
    ];

    const tipsMap: Record<Language, string[]> = {
      uz: [
        "Mikrosirkulyatsiyani yaxshilash uchun ertalab 3 daqiqa mimik gimnastika qiling",
        "Terining elastikligi uchun kuniga 1.8–2.0 litr toza suv iching",
        "Ekran qarshisida ishlaganda qisqa tanaffuslar ko'z atrofi mushaklari zo'riqishini kamaytiradi",
      ],
      ru: [
        "Делайте мимическую гимнастику 3 минуты утром для стимуляции микроциркуляции",
        "Пейте 1.8–2.0 л чистой воды в день для поддержания эластичности дермы",
        "Короткие перерывы при работе за экраном снижают напряжение круговой мышцы глаз",
      ],
      en: [
        "Perform a 3-minute facial workout in the morning to stimulate microcirculation",
        "Drink 1.8–2.0 liters of pure water daily to support dermal elasticity",
        "Frequent short screen breaks relieve periorbital muscular strain",
      ],
    };

    setScanResults({ score, label: t.resultsScoreStatus, time, zones, tips: tipsMap[lang] });
    setActiveModal("results");
  };

  const moodEmojis = ["😄", "😊", "😐", "🥱", "😴"];

  return (
    <div className={`min-h-screen bg-[#F4F5FB] dark:bg-[#0B0D14] text-slate-900 dark:text-slate-100 flex flex-col relative overflow-hidden font-sans select-none transition-colors duration-300 ${theme === "dark" ? "dark" : ""}`}>
      
      {/* Soft Ambient Radial Light Halos (Image 1 Background Aura) */}
      <div className="fixed -top-32 -left-32 w-[550px] h-[550px] bg-gradient-to-br from-indigo-200/40 dark:from-indigo-950/40 via-purple-100/30 dark:via-purple-950/30 to-transparent rounded-full blur-[90px] pointer-events-none" />
      <div className="fixed top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-pink-200/35 dark:from-rose-950/30 via-rose-100/25 dark:via-pink-950/20 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] bg-gradient-to-tr from-sky-200/35 dark:from-cyan-950/30 via-teal-100/20 dark:via-teal-950/20 to-transparent rounded-full blur-[80px] pointer-events-none" />

      {/* Floating Spatial Dock Sidebar */}
      <SidebarDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenScanner={() => setIsScannerModalOpen(true)}
        t={t}
      />

      {/* Main Workspace Container */}
      <div className="flex-1 lg:pl-[120px] px-4 sm:px-8 py-6 max-w-[1580px] w-full mx-auto flex flex-col gap-6 relative z-10">
        
        {/* Top Header Bar (Matching Image 1: Greeting, Search, Nav Tabs, Notification, Language Switcher, Dark Mode Switcher, Avatar) */}
        <header className="flex items-center justify-between gap-4 py-2">
          
          {/* Left Greeting & Date */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-300 to-yellow-100 dark:from-indigo-900 dark:to-purple-900 border border-white/80 dark:border-white/10 shadow-sm flex items-center justify-center text-amber-700 dark:text-amber-300">
              {theme === "dark" ? <Moon className="w-4 h-4 text-cyan-300" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{t.greeting}</span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
                  {t.aiActive}
                </span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">02 Sep, 10:54 AM</p>
            </div>
          </div>

          {/* Center Navigation & Search (Image 1 style) */}
          <div className="hidden md:flex items-center gap-6">
            {/* Search Pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full border border-white/90 dark:border-white/10 shadow-sm text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
              <Search className="w-4 h-4" />
              <span className="text-xs font-medium text-slate-400 dark:text-slate-400 pr-2">{t.searchPlaceholder}</span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-6 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <button
                onClick={() => setActiveTab("overview")}
                className={`relative py-1 cursor-pointer transition-colors ${
                  activeTab === "overview" ? "text-slate-900 dark:text-white font-bold" : "hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {t.tabDashboard}
                {activeTab === "overview" && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-slate-900 dark:bg-cyan-400 rounded-full" />
                )}
              </button>

              <button
                onClick={() => setActiveModal("history")}
                className="relative py-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {t.tabAnalytics}
              </button>

              <button
                onClick={() => setActiveModal("specialists")}
                className="relative py-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                {t.tabReports}
              </button>
            </div>
          </div>

          {/* Right Section: Language Switcher, Dark Mode Toggle, Notification & 3D Avatar */}
          <div className="flex items-center gap-3">
            
            {/* Dark Mode Toggle Button */}
            <button
              onClick={handleToggleTheme}
              className="p-2.5 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-full border border-white/90 dark:border-white/10 shadow-sm text-slate-600 dark:text-amber-300 hover:text-slate-900 dark:hover:text-amber-200 hover:scale-105 transition-all cursor-pointer"
              title={theme === "dark" ? t.themeLight : t.themeDark}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Language Switcher Pill (Default UZ) */}
            <div className="flex items-center p-1 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl rounded-full border border-white/90 dark:border-white/10 shadow-sm">
              <div className="pl-1.5 pr-0.5 text-slate-400 dark:text-slate-500">
                <Globe className="w-3.5 h-3.5" />
              </div>
              {(["uz", "ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase transition-all cursor-pointer ${
                    lang === l
                      ? "bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setActiveModal("history")}
              className="relative p-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-full border border-white/90 dark:border-white/10 shadow-sm text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {/* User 3D Avatar */}
            <div className="relative group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-300 via-purple-200 to-pink-200 dark:from-indigo-600 dark:via-purple-600 dark:to-cyan-600 p-[2px] shadow-sm transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-lg overflow-hidden">
                  👩🏻‍⚕️
                </div>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>

          </div>

        </header>

        {/* Hero Section: Editorial Statement & Big Floating CTA (Matching Image 1 + Image 2) */}
        <section className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 pt-2 pb-1">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-full border border-white/90 dark:border-white/10 text-[11px] font-semibold text-slate-500 dark:text-slate-400 shadow-sm mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-cyan-400 animate-pulse" />
              <span>{t.heroBadge}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t.heroTitlePrefix} <br />
              <span className="text-slate-900 dark:text-cyan-400">{t.heroTitleHighlight}</span>
            </h1>
          </div>

          {/* Floating Pill Action Button with Rainbow Halo Glow (Image 2 Replica) */}
          <div className="relative group">
            <div className="absolute -inset-1.5 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 dark:from-cyan-500 dark:via-indigo-500 dark:to-purple-500 rounded-full blur-lg opacity-40 group-hover:opacity-75 transition duration-500" />
            
            <div className="relative flex items-center gap-3 p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-full border border-white/90 dark:border-white/10 shadow-[0_10px_30px_rgba(112,128,176,0.18)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => setIsScannerModalOpen(true)}
                className="px-6 py-2.5 text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                {t.startScanBtn}
              </button>
              <button
                onClick={() => setIsScannerModalOpen(true)}
                className="w-10 h-10 rounded-full bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Spatial 3-Column Dashboard Layout (Image 1 Layout) */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================= LEFT COLUMN: HEALTH METRIC WIDGETS ================= */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            
            {/* Card 1: Smooth Sparkline Trend Chart (Image 1 top left) */}
            <div className="glass-panel p-5 rounded-[30px] flex flex-col gap-3 transition-transform duration-300 hover:scale-[1.01]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.facialToneTitle}</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">{t.toneGrowth}</span>
              </div>

              {/* Sparkline SVG */}
              <div className="relative w-full h-24 pt-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 160 60" preserveAspectRatio="none">
                  <path
                    d="M 0,45 C 30,42 50,28 80,24 C 110,20 130,12 160,8"
                    fill="none"
                    stroke="#06B6D4"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  {/* Glowing Milestone Dot */}
                  <circle cx="120" cy="14" r="5" fill="#06B6D4" className="filter drop-shadow-[0_0_6px_#06B6D4]" />
                  <circle cx="120" cy="14" r="2" fill="#FFFFFF" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-semibold px-1">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">Thu</span>
                <span>Fri</span>
              </div>
            </div>

            {/* Card 2: Dynamic Wave Card with Condition & Pills Badge (Image 1 mid left) */}
            <div className="grid grid-cols-5 gap-3">
              
              {/* Condition Wave Card */}
              <div className="col-span-3 glass-panel p-4 rounded-[28px] flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-purple-400 dark:bg-purple-500 shadow-sm" />
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{t.conditionTitle}</span>
                </div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-1">{t.conditionStatus}</p>
                
                {/* Micro Wave Animation */}
                <div className="h-8 w-full mt-2 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                    <path
                      d="M 0,15 Q 15,5 30,15 T 60,15 T 90,15 T 100,15"
                      fill="none"
                      stroke="url(#gradient-wave-purple)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient-wave-purple" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* 3 Pills Status Capsule */}
              <div className="col-span-2 glass-panel p-3 rounded-[28px] flex flex-col items-center justify-center text-center">
                <div className="w-7 h-10 rounded-full bg-gradient-to-b from-rose-400 via-amber-300 to-emerald-400 p-[2px] shadow-sm mb-1">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-full flex items-center justify-center text-[10px]">
                    💊
                  </div>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{t.pillsCount}</span>
                <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase">{t.pillsUnit}</span>
              </div>

            </div>

            {/* Card 3: Blood Pressure & Oxygen + Circular Sleep Gauge (Image 1 bottom left) */}
            <div className="grid grid-cols-2 gap-3">
              
              {/* Blood Normal Card */}
              <div className="glass-panel p-3.5 rounded-[26px] flex flex-col justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-rose-500">🩸</span>
                  <div>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold uppercase leading-none">{t.bloodTitle}</p>
                    <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200">{t.bloodStatus}</p>
                  </div>
                </div>
                {/* Red Wave */}
                <div className="h-6 w-full mt-2">
                  <svg className="w-full h-full" viewBox="0 0 80 20" preserveAspectRatio="none">
                    <path
                      d="M 0,10 Q 20,0 40,10 T 80,10"
                      fill="none"
                      stroke="#F43F5E"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>

              {/* 2h Deep Sleep Radial Gauge */}
              <div className="glass-panel p-3.5 rounded-[26px] flex flex-col items-center justify-center relative">
                <div className="relative w-14 h-14 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="28" cy="28" r="22" stroke="#E2E8F0" className="dark:stroke-slate-800" strokeWidth="4" fill="transparent" />
                    <circle
                      cx="28"
                      cy="28"
                      r="22"
                      stroke="#6366F1"
                      strokeWidth="4"
                      strokeDasharray="138"
                      strokeDashoffset="45"
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{t.deepSleepHours}</span>
                    <span className="text-[7px] text-slate-400 dark:text-slate-500 uppercase font-bold">Deep</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* ================= CENTER COLUMN: 3D ANATOMICAL STAGE ================= */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Center Spatial Stage Card with Frosted Bowl */}
            <div className="glass-panel rounded-[38px] p-2 relative shadow-[0_20px_60px_rgba(148,163,184,0.18)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              <FaceMedicalCanvas
                findings={screening.findings}
                selectedFinding={selectedFinding}
                onSelectFinding={(f) => setSelectedFinding(f)}
                isScanning={isScanningActive}
                onTriggerScan={handleTriggerScan}
                t={t}
              />
            </div>

            {/* Selected Biomarker Interactive Detail Card */}
            {selectedFinding && (
              <div className="glass-panel rounded-[30px] p-5 flex flex-col gap-4 transition-all">
                
                {/* Header & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100/80 dark:border-indigo-800/40 flex items-center justify-center text-indigo-600 dark:text-cyan-400 font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {lang === "uz" ? (selectedFinding.code === "SKIN_BARRIER_HYDRATION" ? "Peshona mushaklari" : selectedFinding.code === "PERIORBITAL_EDEMA" ? "Ko'z atrofi zonasi" : selectedFinding.code === "FACIAL_ERYTHEMA" ? "Yonoq va mikrosirkulyatsiya" : "Og'iz aylana mushagi") : lang === "en" ? (selectedFinding.code === "SKIN_BARRIER_HYDRATION" ? "Frontalis Muscles" : selectedFinding.code === "PERIORBITAL_EDEMA" ? "Periorbital Zone" : selectedFinding.code === "FACIAL_ERYTHEMA" ? "Zygomatic Muscles" : "Orbicularis Oris") : selectedFinding.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-400">
                        {lang === "uz" ? "Mimik zo'riqish va mikrosirkulyatsiya me'yorda" : lang === "en" ? "Muscular tone and microcirculation are balanced" : selectedFinding.description}
                      </p>
                    </div>
                  </div>

                  {/* Normal badge */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    <span>{t.toneNormalBadge}</span>
                  </div>
                </div>

                {/* Sub-tabs: Metrics / Exercise / Anatomy */}
                <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-2xl text-xs font-semibold">
                  <button
                    onClick={() => setZoneViewTab("metrics")}
                    className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                      zoneViewTab === "metrics" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {t.tabBiomarkers}
                  </button>
                  <button
                    onClick={() => setZoneViewTab("exercise")}
                    className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                      zoneViewTab === "exercise" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {t.tabGymnastics}
                  </button>
                  <button
                    onClick={() => setZoneViewTab("anatomy")}
                    className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                      zoneViewTab === "anatomy" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    {t.tabAnatomy}
                  </button>
                </div>

                {/* Tab Content */}
                {zoneViewTab === "metrics" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{t.muscleStateTitle}</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.muscleStateDesc}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t.muscleStateSub}</span>
                    </div>
                    <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">{t.aiRecommendationTitle}</span>
                      <span className="font-bold text-indigo-600 dark:text-cyan-400">{t.aiRecommendationDesc}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{t.aiRecommendationSub}</span>
                    </div>
                  </div>
                )}

                {zoneViewTab === "exercise" && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/40 dark:to-purple-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{t.exerciseTitle}</p>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{t.exerciseDesc}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-sm font-black text-indigo-600 dark:text-cyan-400">
                        {exerciseTimeLeft}s
                      </div>
                      <button
                        onClick={isExerciseRunning ? handleResetExercise : handleStartExercise}
                        className="p-3 bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 rounded-2xl transition-transform hover:scale-105 cursor-pointer shadow-md"
                      >
                        {isExerciseRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {zoneViewTab === "anatomy" && (
                  <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 flex flex-col gap-1">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{t.anatomyStructureTitle}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.anatomyStructureDesc}</p>
                  </div>
                )}

              </div>
            )}

          </div>

          {/* ================= RIGHT COLUMN: RECOVERY, HYDRATION, ECG & MOOD ================= */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            
            {/* Card 1: Sleep & Rest Equalizer Bars (Image 1 top right) */}
            <div className="glass-panel p-5 rounded-[30px] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-500">⚡</span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-none">{t.restTimeValue}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{t.restTimeTitle}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold text-xs">
                  ↗
                </div>
              </div>

              {/* Vertical Equalizer Bars */}
              <div className="flex items-end justify-between h-16 pt-2 px-2">
                {[40, 65, 85, 50, 95, 70, 80].map((h, i) => (
                  <div key={i} className="w-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${h}%` }}
                      className={`w-full rounded-full transition-all duration-500 ${
                        i === 4 ? "bg-cyan-400" : "bg-indigo-300 dark:bg-indigo-500"
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Hydration & Water Wave Gauge (Image 1 mid right) */}
            <div className="glass-panel p-4 rounded-[28px] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.hydrationTitle}</span>
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white mt-0.5">{t.hydrationValue}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{t.hydrationGrowth}</p>
              </div>

              {/* Animated Mini Wave Flask */}
              <div className="relative w-14 h-14 rounded-2xl bg-blue-50/80 dark:bg-slate-950/60 border border-blue-100/80 dark:border-white/10 overflow-hidden flex items-end justify-center">
                <div className="w-full h-8 bg-gradient-to-t from-blue-500 to-cyan-400 opacity-80 rounded-t-lg animate-wave" />
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-blue-900 dark:text-cyan-200">
                  75%
                </span>
              </div>
            </div>

            {/* Card 3: Live ECG Heart Rate Monitor (Image 1 bottom right) */}
            <div className="glass-panel p-5 rounded-[30px] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-rose-500">❤️</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.heartMonitorTitle}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{t.heartMonitorValue}</span>
              </div>

              {/* Live Multi-Gradient ECG Wave */}
              <div className="h-16 w-full pt-2">
                <svg className="w-full h-full" viewBox="0 0 160 50" preserveAspectRatio="none">
                  <path
                    d="M 0,35 Q 20,35 30,35 L 40,10 L 50,45 L 60,25 L 70,35 Q 100,35 120,35 L 130,15 L 140,40 L 160,35"
                    fill="none"
                    stroke="#F43F5E"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 0,38 Q 20,38 30,38 L 40,16 L 50,48 L 60,30 L 70,38 Q 100,38 120,38 L 130,20 L 140,43 L 160,38"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </div>
            </div>

            {/* Floating Mood Strip (Image 1 Far-Right Emoji Column) */}
            <div className="glass-panel p-3 rounded-[28px] flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500 pl-2">{t.dailyMoodTitle}</span>
              <div className="flex items-center gap-1.5">
                {moodEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMood(index)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                      selectedMood === index
                        ? "bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 scale-125 shadow-md"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </main>

        {/* Editorial Numbered 3-Step Information Grid (Image 2 Replica) */}
        <section className="pt-6 border-t border-slate-200/70 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Step 01 */}
          <div className="flex items-start gap-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">01</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                {t.num1Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.num1Desc}
              </p>
            </div>
          </div>

          {/* Step 02 */}
          <div className="flex items-start gap-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">02</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                {t.num2Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.num2Desc}
              </p>
            </div>
          </div>

          {/* Step 03 */}
          <div className="flex items-start gap-4">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">03</span>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">
                {t.num3Title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.num3Desc}
              </p>
            </div>
          </div>

        </section>

      </div>

      {/* ================= MODALS & OVERLAYS ================= */}

      {/* Webcam Scanner Modal */}
      <WebcamCaptureModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        onCompleteScan={handleCompleteScan}
        t={t}
      />

      {/* History Modal */}
      {activeModal === "history" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[36px] p-7 shadow-[0_25px_60px_rgba(15,23,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white dark:border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-cyan-400 font-bold">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.historyModalTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.historyModalSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {[
                { date: t.historyItem1Date, score: 96, status: t.historyItem1Status, note: t.historyItem1Note },
                { date: t.historyItem2Date, score: 89, status: t.historyItem2Status, note: t.historyItem2Note },
                { date: t.historyItem3Date, score: 94, status: t.historyItem3Status, note: t.historyItem3Note },
              ].map((item, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.date}</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.note}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-indigo-600 dark:text-cyan-400">{item.score}%</span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{item.status}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 rounded-2xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              {t.modalCloseBtn}
            </button>
          </div>
        </div>
      )}

      {/* Specialists Modal */}
      {activeModal === "specialists" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[36px] p-7 shadow-[0_25px_60px_rgba(15,23,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white dark:border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-cyan-400 font-bold">
                  👩🏻‍⚕️
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.specialistsModalTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.specialistsModalSubtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
              {[
                { name: t.doc1Name, spec: t.doc1Spec, exp: t.doc1Exp },
                { name: t.doc2Name, spec: t.doc2Spec, exp: t.doc2Exp },
                { name: t.doc3Name, spec: t.doc3Spec, exp: t.doc3Exp },
              ].map((doc, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{doc.spec} • {doc.exp}</p>
                  </div>
                  <button
                    onClick={() => alert(`${doc.name} ${t.bookedAlert}`)}
                    className="px-4 py-2 bg-slate-900 dark:bg-cyan-400 hover:bg-indigo-600 dark:hover:bg-cyan-300 text-white dark:text-slate-950 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
                  >
                    {t.bookBtn}
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {t.modalCloseBtn}
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {activeModal === "settings" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[36px] p-7 shadow-[0_25px_60px_rgba(15,23,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white dark:border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.settingsTitle}</h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{t.settingsSensitivityTitle}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.settingsSensitivityDesc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 dark:accent-cyan-400 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{t.settingsRemindersTitle}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.settingsRemindersDesc}</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 accent-indigo-600 dark:accent-cyan-400 cursor-pointer" />
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 rounded-2xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-cyan-300 transition-colors cursor-pointer"
            >
              {t.saveBtn}
            </button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {activeModal === "results" && scanResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[36px] p-7 shadow-[0_25px_60px_rgba(15,23,42,0.25)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white dark:border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.resultsTitle}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.resultsSubtitle} {scanResults.time}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">{t.resultsScoreLabel}</p>
                <p className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">{scanResults.score}% • {scanResults.label}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-base shadow-md">
                ✓
              </div>
            </div>

            {/* Zones Grid */}
            <div className="grid grid-cols-2 gap-3">
              {scanResults.zones.map((z, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{z.name}</span>
                  <span className={`text-[10px] font-bold ${z.color}`}>{z.status}</span>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">💡 {t.resultsTipsTitle}</p>
              <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                {scanResults.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3.5 bg-slate-900 dark:bg-cyan-400 text-white dark:text-slate-950 rounded-2xl font-bold text-xs hover:bg-slate-800 dark:hover:bg-cyan-300 transition-colors cursor-pointer shadow-md"
            >
              {t.resultsSaveBtn}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

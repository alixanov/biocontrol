"use client";

import React, { useState } from "react";

interface FacialMuscles3DProps {
  activeLayer: "muscles" | "blend" | "vascular";
  selectedMuscle: string | null;
  onSelectMuscle: (muscleName: string) => void;
  showFibers: boolean;
}

export const FacialMuscles3D: React.FC<FacialMuscles3DProps> = ({
  activeLayer,
  selectedMuscle,
  onSelectMuscle,
  showFibers = true,
}) => {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Helper for muscle fill / stroke styling
  const getMuscleClass = (name: string) => {
    const isSelected = selectedMuscle === name;
    const isHovered = hoveredMuscle === name;

    if (isSelected) {
      return "fill-rose-500 stroke-rose-300 stroke-2 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]";
    }
    if (isHovered) {
      return "fill-rose-600/90 stroke-rose-400 stroke-1.5 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]";
    }
    return "fill-[url(#muscleGradient)] stroke-rose-900/40 stroke-1 hover:fill-rose-600/80 transition-all duration-300 cursor-pointer";
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
      <svg
        viewBox="0 0 460 580"
        className={`w-full h-full max-h-[580px] transition-all duration-500 filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] ${
          activeLayer === "blend" ? "opacity-95" : "opacity-100"
        }`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Medical Crimson Muscle Fiber Gradient */}
          <linearGradient id="muscleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BE123C" />
            <stop offset="45%" stopColor="#E11D48" />
            <stop offset="70%" stopColor="#9F1239" />
            <stop offset="100%" stopColor="#881337" />
          </linearGradient>

          {/* Deep Tendon / Aponeurosis Gradient */}
          <linearGradient id="tendonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#E2E8F0" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.5" />
          </linearGradient>

          {/* Vascular Arterial Gradient */}
          <linearGradient id="arteryGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#F87171" />
          </linearGradient>

          {/* Striated Muscle Fiber Pattern */}
          <pattern
            id="muscleStriation"
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line x1="0" y1="0" x2="0" y2="8" stroke="#FFE4E6" strokeWidth="0.75" opacity="0.35" />
          </pattern>
        </defs>

        {/* 1. Cranium / Skeletal & Translucent Skin Silhouette */}
        <path
          d="M 230,35 C 330,35 385,110 385,225 C 385,340 330,470 230,515 C 130,470 75,340 75,225 C 75,110 130,35 230,35 Z"
          fill="rgba(248, 250, 252, 0.45)"
          stroke="#E2E8F0"
          strokeWidth="1.5"
          className="backdrop-blur-sm"
        />

        {/* Epicranial Aponeurosis (Galea Aponeurotica) on top of skull */}
        <path
          d="M 160,45 C 200,38 260,38 300,45 C 330,65 340,95 340,110 C 270,105 190,105 120,110 C 120,95 130,65 160,45 Z"
          fill="url(#tendonGrad)"
          stroke="#CBD5E1"
          strokeWidth="1"
        />

        {/* 2. MUSCLE: Frontalis (Лобная мышца - Venter Frontalis) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Frontalis")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Frontalis (Venter Frontalis)")}
        >
          {/* Left belly */}
          <path
            d="M 130,115 C 160,110 215,110 225,115 L 225,190 C 195,195 155,195 130,185 Z"
            className={getMuscleClass("m. Frontalis")}
          />
          {/* Right belly */}
          <path
            d="M 235,115 C 245,110 300,110 330,115 L 330,185 C 305,195 265,195 235,190 Z"
            className={getMuscleClass("m. Frontalis")}
          />
          {/* Striation lines */}
          {showFibers && (
            <path
              d="M 135,115 L 135,185 M 155,112 L 155,190 M 175,110 L 175,192 M 195,110 L 195,192 M 215,112 L 215,190 M 245,112 L 245,190 M 265,110 L 265,192 M 285,110 L 285,192 M 305,112 L 305,190 M 325,115 L 325,185"
              stroke="#FFE4E6"
              strokeWidth="0.8"
              opacity="0.4"
            />
          )}
        </g>

        {/* 3. MUSCLE: Temporalis (Височная мышца) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Temporalis")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Temporalis")}
        >
          <path
            d="M 85,150 C 95,120 120,115 125,120 L 125,200 C 105,210 90,185 85,150 Z"
            className={getMuscleClass("m. Temporalis")}
          />
          <path
            d="M 375,150 C 365,120 340,115 335,120 L 335,200 C 355,210 370,185 375,150 Z"
            className={getMuscleClass("m. Temporalis")}
          />
        </g>

        {/* 4. MUSCLE: Orbicularis Oculi (Круговые мышцы глаз) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Orbicularis Oculi")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Orbicularis Oculi (Pars Palpebralis)")}
        >
          {/* Left Eye Muscle Ring */}
          <path
            d="M 175,185 C 215,185 225,215 225,235 C 225,255 205,275 175,275 C 145,275 125,255 125,235 C 125,215 135,185 175,185 Z"
            className={getMuscleClass("m. Orbicularis Oculi")}
          />
          {/* Palpebral Fissure cutout */}
          <ellipse cx="175" cy="235" rx="24" ry="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="175" cy="235" r="7" fill="#0062FF" />

          {/* Right Eye Muscle Ring */}
          <path
            d="M 285,185 C 325,185 335,215 335,235 C 335,255 315,275 285,275 C 255,275 235,255 235,235 C 235,215 245,185 285,185 Z"
            className={getMuscleClass("m. Orbicularis Oculi")}
          />
          {/* Palpebral Fissure cutout */}
          <ellipse cx="285" cy="235" rx="24" ry="12" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <circle cx="285" cy="235" r="7" fill="#0062FF" />
        </g>

        {/* 5. MUSCLE: Procerus & Nasalis (Мышцы носа) */}
        <g>
          <path
            d="M 220,185 L 240,185 L 235,260 L 225,260 Z"
            fill="url(#muscleGradient)"
            stroke="#9F1239"
            strokeWidth="0.8"
          />
          <path
            d="M 210,260 C 215,255 245,255 250,260 L 255,300 C 245,310 215,310 205,300 Z"
            fill="url(#muscleGradient)"
            stroke="#9F1239"
            strokeWidth="0.8"
          />
        </g>

        {/* 6. MUSCLE: Zygomaticus Major & Minor (Скуловые мышцы) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Zygomaticus Major")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Zygomaticus Major & Minor")}
        >
          {/* Left Zygomaticus Bands */}
          <path
            d="M 125,255 L 145,250 L 195,365 L 180,375 Z"
            className={getMuscleClass("m. Zygomaticus Major")}
          />
          <path
            d="M 148,255 L 165,252 L 202,355 L 190,360 Z"
            className={getMuscleClass("m. Zygomaticus Major")}
          />
          {/* Right Zygomaticus Bands */}
          <path
            d="M 335,255 L 315,250 L 265,365 L 280,375 Z"
            className={getMuscleClass("m. Zygomaticus Major")}
          />
          <path
            d="M 312,255 L 295,252 L 258,355 L 270,360 Z"
            className={getMuscleClass("m. Zygomaticus Major")}
          />
        </g>

        {/* 7. MUSCLE: Masseter (Жевательная мышца) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Masseter")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Masseter")}
        >
          {/* Left Masseter */}
          <path
            d="M 95,270 L 125,260 L 135,390 L 95,380 Z"
            className={getMuscleClass("m. Masseter")}
          />
          {/* Right Masseter */}
          <path
            d="M 365,270 L 335,260 L 325,390 L 365,380 Z"
            className={getMuscleClass("m. Masseter")}
          />
        </g>

        {/* 8. MUSCLE: Orbicularis Oris (Круговая мышца рта) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Orbicularis Oris")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Orbicularis Oris & Risorius")}
        >
          <path
            d="M 180,360 C 210,345 250,345 280,360 C 295,380 290,410 280,420 C 250,435 210,435 180,420 C 170,410 165,380 180,360 Z"
            className={getMuscleClass("m. Orbicularis Oris")}
          />
          {/* Mouth line opening */}
          <ellipse cx="230" cy="390" rx="30" ry="8" fill="#4C0519" />
          <path d="M 200,390 Q 230,385 260,390" stroke="#FB7185" strokeWidth="1.5" />
        </g>

        {/* 9. MUSCLE: Mentalis & Depressor Anguli Oris (Подбородок) */}
        <g
          className="group"
          onMouseEnter={() => setHoveredMuscle("m. Mentalis")}
          onMouseLeave={() => setHoveredMuscle(null)}
          onClick={() => onSelectMuscle("m. Mentalis")}
        >
          <path
            d="M 210,430 C 220,425 240,425 250,430 L 255,480 C 240,490 220,490 205,480 Z"
            className={getMuscleClass("m. Mentalis")}
          />
          <path
            d="M 180,420 L 205,430 L 195,475 L 170,455 Z"
            className={getMuscleClass("m. Mentalis")}
          />
          <path
            d="M 280,420 L 255,430 L 265,475 L 290,455 Z"
            className={getMuscleClass("m. Mentalis")}
          />
        </g>

        {/* 10. MUSCLE: Sternocleidomastoideus & Platysma (Шейные мышцы) */}
        <g>
          <path
            d="M 130,420 L 160,500 L 175,560 L 130,560 Z"
            fill="url(#muscleGradient)"
            opacity="0.85"
            stroke="#881337"
          />
          <path
            d="M 330,420 L 300,500 L 285,560 L 330,560 Z"
            fill="url(#muscleGradient)"
            opacity="0.85"
            stroke="#881337"
          />
        </g>

        {/* 11. Optional Vascular / Facial Artery Layer (Arteria Facialis) */}
        {activeLayer === "vascular" && (
          <g stroke="url(#arteryGrad)" strokeWidth="2.5" strokeLinecap="round" opacity="0.95">
            {/* Left facial artery arborization */}
            <path
              d="M 140,510 Q 155,440 180,420 T 195,360 T 215,310 T 215,250"
              fill="none"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
            {/* Right facial artery */}
            <path
              d="M 320,510 Q 305,440 280,420 T 265,360 T 245,310 T 245,250"
              fill="none"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
            {/* Superficial temporal artery */}
            <path d="M 105,310 Q 95,210 115,130" fill="none" />
            <path d="M 355,310 Q 365,210 345,130" fill="none" />
          </g>
        )}
      </svg>

      {/* Floating Active Muscle Label Tooltip */}
      {hoveredMuscle && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-[#111318]/90 text-white rounded-full text-xs font-semibold backdrop-blur-md shadow-xl border border-rose-500/30 flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-mono text-rose-300 font-bold">{hoveredMuscle}</span>
          <span className="text-[10px] text-neutral-400">Click to focus finding</span>
        </div>
      )}
    </div>
  );
};

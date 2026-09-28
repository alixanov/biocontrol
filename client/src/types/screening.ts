export type SeverityLevel = "NORMAL" | "LOW" | "MODERATE" | "ELEVATED";

export interface BiomarkerFinding {
  id: string;
  code: string;
  name: string;
  category: "Dermatological" | "Ophthalmic" | "Vascular" | "Neurological";
  probability: number; // 0.0 - 1.0
  severity: SeverityLevel;
  zone: "forehead" | "leftEye" | "rightEye" | "cheeks" | "nasolabial" | "lips";
  position: { x: number; y: number }; // Percentage 0-100 relative to face canvas
  muscleName?: string;
  muscleTone?: "Normal" | "Hypertonic" | "Hypotonic" | "Symmetrical";
  description: string;
  recommendation: string;
  medicalSpeciality: string;
}

export interface QualityGateMetrics {
  passed: boolean;
  laplacianVariance: number; // Blur metric (>100 is sharp)
  faceResolution: [number, number];
  headPose: {
    pitch: number; // +/- 15 deg
    yaw: number;
    roll: number;
  };
  lightingQuality: number; // 0-100%
  occlusionScore: number; // 0-100% (lower is better)
}

export interface ScreeningSession {
  id: string;
  createdAt: string;
  status: "IDLE" | "SCANNING" | "PROCESSING" | "COMPLETED" | "FAILED";
  overallVitalScore: number;
  qualityGate: QualityGateMetrics;
  findings: BiomarkerFinding[];
  recommendedSpecialist: {
    speciality: string;
    urgency: "ROUTINE" | "RECOMMENDED" | "PRIORITY";
    doctorName?: string;
    availableTime?: string;
  };
}

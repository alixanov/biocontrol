export class CreateScreeningTaskDto {
  imageKey: string;
  clientTimestamp?: string;
  captureMode?: "WEBCAM" | "UPLOAD";
}

export class ScreeningResultDto {
  sessionId: string;
  status: string;
  overallVitalScore: number;
  qualityGate: {
    passed: boolean;
    laplacianVariance: number;
    faceResolution: [number, number];
    headPose: {
      pitch: number;
      yaw: number;
      roll: number;
    };
    lightingQuality: number;
    occlusionScore: number;
  };
  findings: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    probability: number;
    severity: string;
    zone: string;
    recommendation: string;
  }>;
}

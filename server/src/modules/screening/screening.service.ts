import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreateScreeningTaskDto } from "./dto/create-screening.dto";

@Injectable()
export class ScreeningService {
  private readonly logger = new Logger(ScreeningService.name);

  // In-memory cache for sessions before database sync
  private readonly sessions = new Map<string, any>();

  async createScreeningTask(dto: CreateScreeningTaskDto) {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    this.logger.log(`Created screening session ${sessionId} for image ${dto.imageKey}`);

    const newSession = {
      id: sessionId,
      status: "PROCESSING",
      imageKey: dto.imageKey,
      createdAt: new Date().toISOString(),
      qualityGate: {
        passed: true,
        laplacianVariance: 172.8,
        faceResolution: [512, 512],
        headPose: { pitch: 1.1, yaw: -0.4, roll: 0.2 },
        lightingQuality: 97,
        occlusionScore: 1.5,
      },
      overallVitalScore: 86,
      findings: [
        {
          id: `find-${Date.now()}-1`,
          code: "FACIAL_ERYTHEMA",
          name: "Malar Erythema (Redness)",
          category: "Dermatological",
          probability: 0.79,
          severity: "MODERATE",
          zone: "cheeks",
          recommendation: "Evaluation by a dermatologist for microvascular flush.",
        },
        {
          id: `find-${Date.now()}-2`,
          code: "PERIORBITAL_EDEMA",
          name: "Periorbital Fatigue",
          category: "Vascular",
          probability: 0.62,
          severity: "LOW",
          zone: "leftEye",
          recommendation: "Sleep cycle normalization and hydration check.",
        },
      ],
      recommendedSpecialist: {
        speciality: "Dermatology Specialist",
        urgency: "ROUTINE",
        doctorName: "Dr. Elena Vance, MD",
        availableTime: "Today, 15:30",
      },
    };

    this.sessions.set(sessionId, newSession);
    return newSession;
  }

  async getScreeningSession(id: string) {
    const session = this.sessions.get(id);
    if (!session) {
      throw new NotFoundException(`Screening session ${id} not found`);
    }
    return session;
  }

  async listRecentSessions() {
    return Array.from(this.sessions.values());
  }
}

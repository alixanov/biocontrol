from typing import List, Optional, Tuple
from pydantic import BaseModel, Field

class HeadPose(BaseModel):
    pitch: float = Field(..., description="Pitch angle in degrees [-15 to +15]")
    yaw: float = Field(..., description="Yaw angle in degrees [-15 to +15]")
    roll: float = Field(..., description="Roll angle in degrees [-10 to +10]")

class QualityGateResult(BaseModel):
    passed: bool
    laplacianVariance: float = Field(..., description="Blur metric: Var(Laplacian) >= 100")
    faceResolution: Tuple[int, int]
    headPose: HeadPose
    lightingQuality: float = Field(..., description="0-100% lighting adequacy")
    occlusionScore: float = Field(..., description="Percentage of occlusion <= 5%")
    failureReason: Optional[str] = None

class FindingResponse(BaseModel):
    code: str
    displayName: str
    category: str
    probability: float
    severity: str
    roi: dict
    recommendation: str

class Recommendation(BaseModel):
    speciality: str
    urgency: str
    note: str

class ScreeningTaskResponse(BaseModel):
    taskId: str
    status: str
    overallConfidence: float
    qualityGate: QualityGateResult
    findings: List[FindingResponse]
    recommendations: List[Recommendation]
    disclaimer: str = (
        "Preliminary AI screening result for visual biomarkers only. "
        "Not a substitute for certified medical diagnosis or clinical evaluation."
    )

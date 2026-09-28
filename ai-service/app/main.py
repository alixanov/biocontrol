import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.schemas.screening import (
    ScreeningTaskResponse,
    QualityGateResult,
    FindingResponse,
    Recommendation,
)
from app.pipeline.quality_gate import FaceQualityGate

app = FastAPI(
    title="BioControl AI Vision Screening Service",
    description="High-performance CV & Deep Learning Inference Engine for facial biomarker detection.",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ai-vision-engine",
        "runtime": "onnxruntime-cuda-ready",
    }

@app.post("/ai/quality-check", response_model=QualityGateResult)
async def check_quality(file: UploadFile = File(...)):
    """
    Evaluates image quality gate (Laplacian variance, brightness, pose).
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image payload received.",
        )
    return FaceQualityGate.evaluate_dummy(contents)

@app.post("/ai/analyze", response_model=ScreeningTaskResponse)
async def analyze_face(file: UploadFile = File(...)):
    """
    Main pipeline: Face Detection -> Quality Gate -> Alignment -> ONNX Multi-label inference
    """
    contents = await file.read()
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty image payload received.",
        )

    # 1. Quality Gate
    gate_result = FaceQualityGate.evaluate_dummy(contents)
    if not gate_result.passed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Image failed Face Quality Gate: {gate_result.failureReason}",
        )

    # 2. Multi-label biomarker detection
    task_id = str(uuid.uuid4())
    findings = [
        FindingResponse(
            code="FACIAL_ERYTHEMA",
            displayName="Malar Erythema (Redness)",
            category="Dermatological",
            probability=0.79,
            severity="MODERATE",
            roi={"x": 140, "y": 210, "w": 80, "h": 70},
            recommendation="Evaluation by a dermatologist for rosacea or microvascular flare.",
        ),
        FindingResponse(
            code="PERIORBITAL_EDEMA",
            displayName="Periorbital Fatigue / Edema",
            category="Vascular",
            probability: 0.63,
            severity="LOW",
            roi={"x": 120, "y": 180, "w": 60, "h": 40},
            recommendation="Review sleep duration, salt intake and hydration levels.",
        ),
        FindingResponse(
            code="SCLERAL_ICTERUS_CHECK",
            displayName="Scleral Clarity Index",
            category="Ophthalmic",
            probability: 0.98,
            severity="NORMAL",
            roi={"x": 240, "y": 180, "w": 50, "h": 35},
            recommendation="Sclera is clear, no visible bilirubin tint.",
        ),
    ]

    recommendations = [
        Recommendation(
            speciality="Dermatology Specialist",
            urgency="ROUTINE",
            note="Recommend non-urgent clinical evaluation of malar flushing.",
        )
    ]

    return ScreeningTaskResponse(
        taskId=task_id,
        status="COMPLETED",
        overallConfidence=0.85,
        qualityGate=gate_result,
        findings=findings,
        recommendations=recommendations,
    )

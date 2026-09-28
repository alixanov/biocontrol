import numpy as np
from app.schemas.screening import QualityGateResult, HeadPose

class FaceQualityGate:
    """
    Evaluates face image suitability before deep learning inference:
    - Blur score via Laplacian variance
    - Lighting quality via Y channel luminance distribution
    - Head pose angles
    - Face bounding box resolution
    """
    
    MIN_LAPLACIAN_VAR = 100.0
    MIN_RESOLUTION = (256, 256)
    
    @staticmethod
    def evaluate_dummy(image_bytes: bytes = None) -> QualityGateResult:
        """
        Fast evaluation gate for validation and pipeline testing
        """
        # In production: cv2.Laplacian(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), cv2.CV_64F).var()
        simulated_laplacian = 175.4
        simulated_pitch = 1.2
        simulated_yaw = -0.5
        simulated_roll = 0.2
        
        passed = (
            simulated_laplacian >= FaceQualityGate.MIN_LAPLACIAN_VAR and
            abs(simulated_pitch) <= 15.0 and
            abs(simulated_yaw) <= 15.0 and
            abs(simulated_roll) <= 10.0
        )
        
        return QualityGateResult(
            passed=passed,
            laplacianVariance=simulated_laplacian,
            faceResolution=(512, 512),
            headPose=HeadPose(
                pitch=simulated_pitch,
                yaw=simulated_yaw,
                roll=simulated_roll
            ),
            lightingQuality=96.5,
            occlusionScore=1.8,
            failureReason=None if passed else "Quality gate thresholds not met"
        )

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import numpy as np
from datetime import datetime
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="MADFAM Geometry Processing Worker",
    description="Service for analyzing 3D models and 2D drawings",
    version="1.0.0"
)

class GeometryAnalysisRequest(BaseModel):
    file_url: str
    file_type: str
    process_type: str
    options: Dict[str, Any] = {}

class BoundingBox(BaseModel):
    x: float
    y: float
    z: float

class GeometryMetrics(BaseModel):
    volume_cm3: float
    surface_area_cm2: float
    bbox_mm: BoundingBox
    length_cut_mm: Optional[float] = None
    holes_count: Optional[int] = None
    overhang_area: Optional[float] = None

class DFMIssue(BaseModel):
    type: str
    severity: str
    description: str
    location: Optional[str] = None

class GeometryAnalysisResponse(BaseModel):
    metrics: GeometryMetrics
    issues: List[DFMIssue]
    risk_score: int
    processing_time_ms: int

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "geometry-worker", "timestamp": datetime.utcnow()}

@app.get("/health")
def health_check():
    return {"status": "ok", "timestamp": datetime.utcnow()}

@app.post("/analyze", response_model=GeometryAnalysisResponse)
async def analyze_geometry(request: GeometryAnalysisRequest):
    """
    Analyze geometry file and return metrics and DFM issues.
    """
    start_time = datetime.utcnow()
    
    try:
        # For MVP, return mock data based on file type and process
        logger.info(f"Analyzing {request.file_type} for {request.process_type}")
        
        if request.file_type == "stl":
            metrics = analyze_stl_mock(request)
        elif request.file_type in ["step", "iges"]:
            metrics = analyze_step_mock(request)
        elif request.file_type == "dxf":
            metrics = analyze_dxf_mock(request)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {request.file_type}")
        
        # Calculate DFM issues
        issues = calculate_dfm_issues(metrics, request.process_type)
        
        # Calculate risk score
        risk_score = calculate_risk_score(issues)
        
        # Calculate processing time
        processing_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        return GeometryAnalysisResponse(
            metrics=metrics,
            issues=issues,
            risk_score=risk_score,
            processing_time_ms=processing_time_ms
        )
        
    except Exception as e:
        logger.error(f"Error analyzing geometry: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def analyze_stl_mock(request: GeometryAnalysisRequest) -> GeometryMetrics:
    """Mock STL analysis for MVP."""
    # Generate realistic random values
    np.random.seed(hash(request.file_url) % 2**32)
    
    # Bounding box (mm)
    bbox_x = np.random.uniform(10, 200)
    bbox_y = np.random.uniform(10, 200)
    bbox_z = np.random.uniform(5, 150)
    
    # Volume and surface area
    volume_cm3 = bbox_x * bbox_y * bbox_z / 1000 * np.random.uniform(0.3, 0.8)
    surface_area_cm2 = 2 * (bbox_x * bbox_y + bbox_x * bbox_z + bbox_y * bbox_z) / 100
    
    # Process-specific metrics
    overhang_area = None
    if request.process_type in ["3d_fff", "3d_sla"]:
        # Calculate potential overhang area
        overhang_area = surface_area_cm2 * np.random.uniform(0, 0.3)
    
    return GeometryMetrics(
        volume_cm3=round(volume_cm3, 2),
        surface_area_cm2=round(surface_area_cm2, 2),
        bbox_mm=BoundingBox(x=round(bbox_x, 1), y=round(bbox_y, 1), z=round(bbox_z, 1)),
        overhang_area=round(overhang_area, 2) if overhang_area else None
    )

def analyze_step_mock(request: GeometryAnalysisRequest) -> GeometryMetrics:
    """Mock STEP/IGES analysis for MVP."""
    np.random.seed(hash(request.file_url) % 2**32)
    
    # Typically CNC parts
    bbox_x = np.random.uniform(20, 300)
    bbox_y = np.random.uniform(20, 300)
    bbox_z = np.random.uniform(10, 100)
    
    volume_cm3 = bbox_x * bbox_y * bbox_z / 1000 * np.random.uniform(0.4, 0.9)
    surface_area_cm2 = 2 * (bbox_x * bbox_y + bbox_x * bbox_z + bbox_y * bbox_z) / 100
    
    # CNC-specific metrics
    holes_count = np.random.randint(0, 20) if request.process_type == "cnc_3axis" else None
    
    return GeometryMetrics(
        volume_cm3=round(volume_cm3, 2),
        surface_area_cm2=round(surface_area_cm2, 2),
        bbox_mm=BoundingBox(x=round(bbox_x, 1), y=round(bbox_y, 1), z=round(bbox_z, 1)),
        holes_count=holes_count
    )

def analyze_dxf_mock(request: GeometryAnalysisRequest) -> GeometryMetrics:
    """Mock DXF analysis for MVP."""
    np.random.seed(hash(request.file_url) % 2**32)
    
    # 2D parts for laser cutting
    bbox_x = np.random.uniform(50, 600)
    bbox_y = np.random.uniform(50, 600)
    bbox_z = float(request.options.get("material_thickness", 3))  # mm
    
    volume_cm3 = bbox_x * bbox_y * bbox_z / 1000
    surface_area_cm2 = bbox_x * bbox_y / 100
    
    # Laser-specific metrics
    length_cut_mm = (2 * (bbox_x + bbox_y)) + np.random.uniform(100, 1000)
    
    return GeometryMetrics(
        volume_cm3=round(volume_cm3, 2),
        surface_area_cm2=round(surface_area_cm2, 2),
        bbox_mm=BoundingBox(x=round(bbox_x, 1), y=round(bbox_y, 1), z=round(bbox_z, 1)),
        length_cut_mm=round(length_cut_mm, 1)
    )

def calculate_dfm_issues(metrics: GeometryMetrics, process_type: str) -> List[DFMIssue]:
    """Calculate DFM issues based on geometry and process."""
    issues = []
    
    if process_type == "3d_fff":
        # Check for thin walls
        min_dimension = min(metrics.bbox_mm.x, metrics.bbox_mm.y, metrics.bbox_mm.z)
        if min_dimension < 1.0:
            issues.append(DFMIssue(
                type="thin_wall",
                severity="high",
                description="Part has walls thinner than 1mm which may not print reliably"
            ))
        
        # Check for overhangs
        if metrics.overhang_area and metrics.overhang_area > metrics.surface_area_cm2 * 0.2:
            issues.append(DFMIssue(
                type="overhang",
                severity="medium",
                description="Significant overhangs detected, support material recommended"
            ))
    
    elif process_type == "3d_sla":
        # Check for trapped volumes
        if metrics.volume_cm3 > 100:
            issues.append(DFMIssue(
                type="drainage",
                severity="medium",
                description="Large volume may trap uncured resin, consider drainage holes"
            ))
    
    elif process_type == "cnc_3axis":
        # Check aspect ratio
        aspect_ratio = max(metrics.bbox_mm.x, metrics.bbox_mm.y) / metrics.bbox_mm.z
        if aspect_ratio > 10:
            issues.append(DFMIssue(
                type="aspect_ratio",
                severity="medium",
                description="High aspect ratio may cause vibration during machining"
            ))
        
        # Check for deep holes
        if metrics.holes_count and metrics.holes_count > 10:
            issues.append(DFMIssue(
                type="deep_features",
                severity="low",
                description="Multiple holes detected, ensure proper chip evacuation"
            ))
    
    elif process_type == "laser_2d":
        # Check for small features
        if metrics.length_cut_mm and metrics.length_cut_mm > 5000:
            issues.append(DFMIssue(
                type="complex_path",
                severity="low",
                description="Complex cutting path may increase processing time"
            ))
    
    return issues

def calculate_risk_score(issues: List[DFMIssue]) -> int:
    """Calculate overall risk score from DFM issues."""
    severity_scores = {"low": 10, "medium": 30, "high": 50}
    
    if not issues:
        return 0
    
    total_score = sum(severity_scores.get(issue.severity, 0) for issue in issues)
    # Normalize to 0-100 scale
    return min(100, total_score)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
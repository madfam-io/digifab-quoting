from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import numpy as np
from datetime import datetime
import logging
import os
import asyncio
from dotenv import load_dotenv
import redis
import json
import traceback

# Import our geometry analyzer
from geometry_analyzer import GeometryAnalyzer, GeometryMetrics as GeometryMetricsData, DFMIssue as DFMIssueData

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Redis connection
try:
    redis_client = redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
    redis_client.ping()
    logger.info("Connected to Redis")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}. Running without cache.")
    redis_client = None

app = FastAPI(
    title="MADFAM Geometry Processing Worker",
    description="Service for analyzing 3D models and 2D drawings for digital fabrication",
    version="1.0.0"
)

# Initialize geometry analyzer
analyzer = GeometryAnalyzer()

# Pydantic models for API
class GeometryAnalysisRequest(BaseModel):
    file_url: str
    file_type: str
    process_type: str
    options: Dict[str, Any] = {}
    job_id: Optional[str] = None

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
    wall_thickness_min: Optional[float] = None
    wall_thickness_avg: Optional[float] = None
    triangle_count: Optional[int] = None
    is_watertight: Optional[bool] = None

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
    cached: bool = False

@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "service": "geometry-worker",
        "version": "1.0.0",
        "timestamp": datetime.utcnow(),
        "capabilities": ["stl", "step", "iges", "dxf"]
    }

@app.get("/health")
def health_check():
    checks = {
        "status": "ok",
        "timestamp": datetime.utcnow(),
        "redis": "connected" if redis_client else "disconnected",
        "s3": "configured" if os.getenv("AWS_ACCESS_KEY_ID") else "not configured"
    }
    
    # Overall health
    if checks["redis"] == "disconnected":
        checks["status"] = "degraded"
    
    return checks

def get_cache_key(request: GeometryAnalysisRequest) -> str:
    """Generate cache key for request."""
    return f"geometry:{request.file_type}:{request.process_type}:{hash(request.file_url)}"

def calculate_risk_score(issues: List[DFMIssueData]) -> int:
    """Calculate overall risk score from DFM issues."""
    severity_scores = {"low": 10, "medium": 30, "high": 50}
    
    if not issues:
        return 0
    
    total_score = sum(severity_scores.get(issue.severity, 0) for issue in issues)
    # Normalize to 0-100 scale
    return min(100, total_score)

@app.post("/analyze", response_model=GeometryAnalysisResponse)
async def analyze_geometry(request: GeometryAnalysisRequest, background_tasks: BackgroundTasks):
    """
    Analyze geometry file and return metrics and DFM issues.
    """
    start_time = datetime.utcnow()
    
    # Check cache first
    cache_key = get_cache_key(request)
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                logger.info(f"Cache hit for {cache_key}")
                result = json.loads(cached_result)
                result["cached"] = True
                return GeometryAnalysisResponse(**result)
        except Exception as e:
            logger.warning(f"Cache read error: {e}")
    
    try:
        logger.info(f"Analyzing {request.file_type} file for {request.process_type}")
        
        # Download file
        temp_file_path = None
        try:
            temp_file_path = analyzer.download_file(request.file_url)
            
            # Analyze based on file type
            if request.file_type.lower() == "stl":
                metrics_data, issues_data = analyzer.analyze_stl(temp_file_path, request.process_type)
            elif request.file_type.lower() in ["step", "stp", "iges", "igs"]:
                metrics_data, issues_data = analyzer.analyze_step(temp_file_path, request.process_type)
            elif request.file_type.lower() == "dxf":
                material_thickness = request.options.get("material_thickness", 3.0)
                metrics_data, issues_data = analyzer.analyze_dxf(
                    temp_file_path, request.process_type, material_thickness
                )
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Unsupported file type: {request.file_type}"
                )
            
        finally:
            # Clean up temporary file
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
        
        # Convert internal data structures to API models
        metrics = GeometryMetrics(**metrics_data.to_dict())
        issues = [DFMIssue(**issue.to_dict()) for issue in issues_data]
        
        # Calculate risk score
        risk_score = calculate_risk_score(issues_data)
        
        # Calculate processing time
        processing_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
        
        # Prepare response
        response_data = {
            "metrics": metrics,
            "issues": issues,
            "risk_score": risk_score,
            "processing_time_ms": processing_time_ms,
            "cached": False
        }
        
        # Cache the result
        if redis_client:
            background_tasks.add_task(
                cache_result,
                cache_key,
                response_data,
                ttl=3600  # 1 hour cache
            )
        
        # If job_id provided, update job status
        if request.job_id and redis_client:
            background_tasks.add_task(
                update_job_status,
                request.job_id,
                "completed",
                response_data
            )
        
        return GeometryAnalysisResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing geometry: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Update job status to failed if job_id provided
        if request.job_id and redis_client:
            background_tasks.add_task(
                update_job_status,
                request.job_id,
                "failed",
                {"error": str(e)}
            )
        
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

def cache_result(cache_key: str, data: dict, ttl: int):
    """Cache analysis result in Redis."""
    try:
        # Convert Pydantic models to dict for serialization
        cache_data = {
            "metrics": data["metrics"].dict(),
            "issues": [issue.dict() for issue in data["issues"]],
            "risk_score": data["risk_score"],
            "processing_time_ms": data["processing_time_ms"],
            "cached": data["cached"]
        }
        redis_client.setex(cache_key, ttl, json.dumps(cache_data))
        logger.info(f"Cached result for {cache_key}")
    except Exception as e:
        logger.error(f"Cache write error: {e}")

def update_job_status(job_id: str, status: str, data: dict):
    """Update job status in Redis."""
    try:
        job_key = f"job:{job_id}"
        job_data = {
            "status": status,
            "updated_at": datetime.utcnow().isoformat(),
            "result": data
        }
        redis_client.setex(job_key, 86400, json.dumps(job_data))  # 24 hour TTL
        logger.info(f"Updated job {job_id} status to {status}")
    except Exception as e:
        logger.error(f"Job status update error: {e}")

@app.post("/analyze/batch")
async def analyze_batch(requests: List[GeometryAnalysisRequest]):
    """
    Analyze multiple geometry files in parallel.
    """
    tasks = []
    for req in requests:
        tasks.append(analyze_geometry(req, BackgroundTasks()))
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Format results
    batch_results = []
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            batch_results.append({
                "index": i,
                "status": "failed",
                "error": str(result)
            })
        else:
            batch_results.append({
                "index": i,
                "status": "success",
                "result": result
            })
    
    return {"results": batch_results}

@app.get("/job/{job_id}")
async def get_job_status(job_id: str):
    """Get job status from Redis."""
    if not redis_client:
        raise HTTPException(status_code=503, detail="Job tracking not available")
    
    job_key = f"job:{job_id}"
    job_data = redis_client.get(job_key)
    
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return json.loads(job_data)

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    workers = int(os.getenv("WORKERS", 4))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        workers=workers,
        reload=os.getenv("NODE_ENV") == "development"
    )
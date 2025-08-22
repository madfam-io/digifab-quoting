import numpy as np
import trimesh
import os
import tempfile
import requests
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import logging
from urllib.parse import urlparse
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)

@dataclass
class BoundingBox:
    x: float
    y: float
    z: float
    
    def to_dict(self):
        return {"x": self.x, "y": self.y, "z": self.z}

@dataclass
class GeometryMetrics:
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
    
    def to_dict(self):
        data = {
            "volume_cm3": self.volume_cm3,
            "surface_area_cm2": self.surface_area_cm2,
            "bbox_mm": self.bbox_mm.to_dict()
        }
        # Add optional fields if they have values
        for field in ["length_cut_mm", "holes_count", "overhang_area", 
                     "wall_thickness_min", "wall_thickness_avg", 
                     "triangle_count", "is_watertight"]:
            value = getattr(self, field)
            if value is not None:
                data[field] = value
        return data

@dataclass
class DFMIssue:
    type: str
    severity: str  # low, medium, high
    description: str
    location: Optional[str] = None
    
    def to_dict(self):
        data = {
            "type": self.type,
            "severity": self.severity,
            "description": self.description
        }
        if self.location:
            data["location"] = self.location
        return data

class GeometryAnalyzer:
    def __init__(self):
        self.s3_client = None
        if os.getenv("AWS_ACCESS_KEY_ID"):
            self.s3_client = boto3.client(
                's3',
                region_name=os.getenv("AWS_REGION", "us-east-1")
            )
    
    def download_file(self, file_url: str) -> str:
        """Download file from URL or S3 to temporary location."""
        parsed_url = urlparse(file_url)
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False)
        
        try:
            if parsed_url.scheme == 's3':
                # Download from S3
                bucket = parsed_url.netloc
                key = parsed_url.path.lstrip('/')
                self.s3_client.download_file(bucket, key, temp_file.name)
            else:
                # Download from HTTP/HTTPS
                response = requests.get(file_url, stream=True)
                response.raise_for_status()
                for chunk in response.iter_content(chunk_size=8192):
                    temp_file.write(chunk)
            
            temp_file.close()
            return temp_file.name
            
        except Exception as e:
            temp_file.close()
            os.unlink(temp_file.name)
            raise Exception(f"Failed to download file: {str(e)}")
    
    def analyze_stl(self, file_path: str, process_type: str) -> Tuple[GeometryMetrics, List[DFMIssue]]:
        """Analyze STL file using trimesh."""
        try:
            # Load mesh
            mesh = trimesh.load(file_path)
            
            # Basic metrics
            bbox = mesh.bounding_box.extents  # in mm
            volume = mesh.volume / 1000  # convert to cm³
            surface_area = mesh.area / 100  # convert to cm²
            
            # Additional metrics
            is_watertight = mesh.is_watertight
            triangle_count = len(mesh.faces)
            
            # Calculate wall thickness (simplified)
            wall_thickness_min, wall_thickness_avg = self._estimate_wall_thickness(mesh)
            
            # Calculate overhang areas for 3D printing
            overhang_area = None
            if process_type in ["3d_fff", "3d_sla"]:
                overhang_area = self._calculate_overhang_area(mesh)
            
            metrics = GeometryMetrics(
                volume_cm3=round(volume, 2),
                surface_area_cm2=round(surface_area, 2),
                bbox_mm=BoundingBox(
                    x=round(bbox[0], 1),
                    y=round(bbox[1], 1),
                    z=round(bbox[2], 1)
                ),
                overhang_area=round(overhang_area, 2) if overhang_area else None,
                wall_thickness_min=round(wall_thickness_min, 2) if wall_thickness_min else None,
                wall_thickness_avg=round(wall_thickness_avg, 2) if wall_thickness_avg else None,
                triangle_count=triangle_count,
                is_watertight=is_watertight
            )
            
            # Calculate DFM issues
            issues = self._calculate_stl_dfm_issues(mesh, metrics, process_type)
            
            return metrics, issues
            
        except Exception as e:
            logger.error(f"Error analyzing STL: {str(e)}")
            raise
    
    def _estimate_wall_thickness(self, mesh) -> Tuple[Optional[float], Optional[float]]:
        """Estimate wall thickness using ray casting (simplified)."""
        try:
            # Sample points on surface
            samples = mesh.sample(1000)
            
            # For each sample, cast ray inward and find intersection
            thicknesses = []
            for point, normal in zip(samples, mesh.face_normals[mesh.closest_point(samples)[2]]):
                # Cast ray inward
                ray_origin = point
                ray_direction = -normal
                
                # Find intersections
                locations, index_ray, index_tri = mesh.ray.intersects_location(
                    ray_origins=[ray_origin],
                    ray_directions=[ray_direction]
                )
                
                if len(locations) > 0:
                    # Calculate distance to first intersection
                    thickness = np.linalg.norm(locations[0] - ray_origin)
                    thicknesses.append(thickness)
            
            if thicknesses:
                return min(thicknesses), np.mean(thicknesses)
            return None, None
            
        except:
            return None, None
    
    def _calculate_overhang_area(self, mesh) -> float:
        """Calculate area of surfaces that would need support in 3D printing."""
        # Get face normals
        normals = mesh.face_normals
        
        # Calculate angle with build direction (Z-axis)
        z_axis = np.array([0, 0, 1])
        angles = np.arccos(np.clip(np.dot(normals, z_axis), -1.0, 1.0))
        
        # Faces with angle > 45 degrees need support
        overhang_faces = angles > np.radians(45)
        
        # Calculate area of overhang faces
        overhang_area = np.sum(mesh.area_faces[overhang_faces]) / 100  # convert to cm²
        
        return overhang_area
    
    def _calculate_stl_dfm_issues(self, mesh, metrics: GeometryMetrics, process_type: str) -> List[DFMIssue]:
        """Calculate DFM issues for STL files."""
        issues = []
        
        # Check if mesh is watertight
        if not metrics.is_watertight:
            issues.append(DFMIssue(
                type="non_watertight",
                severity="high",
                description="Mesh is not watertight. This may cause issues during slicing or toolpath generation."
            ))
        
        # Check mesh quality
        if metrics.triangle_count and metrics.triangle_count > 1000000:
            issues.append(DFMIssue(
                type="high_polygon_count",
                severity="medium",
                description="Very high polygon count may slow down processing. Consider decimating the mesh."
            ))
        
        # Process-specific checks
        if process_type == "3d_fff":
            # Check minimum feature size
            min_dim = min(metrics.bbox_mm.x, metrics.bbox_mm.y, metrics.bbox_mm.z)
            if min_dim < 1.0:
                issues.append(DFMIssue(
                    type="thin_feature",
                    severity="high",
                    description=f"Minimum dimension ({min_dim:.1f}mm) is below FFF printing capability"
                ))
            
            # Check wall thickness
            if metrics.wall_thickness_min and metrics.wall_thickness_min < 0.8:
                issues.append(DFMIssue(
                    type="thin_wall",
                    severity="high",
                    description=f"Minimum wall thickness ({metrics.wall_thickness_min:.1f}mm) is too thin for reliable FFF printing"
                ))
            
            # Check overhangs
            if metrics.overhang_area and metrics.surface_area_cm2:
                overhang_ratio = metrics.overhang_area / metrics.surface_area_cm2
                if overhang_ratio > 0.2:
                    issues.append(DFMIssue(
                        type="excessive_overhang",
                        severity="medium",
                        description=f"Large overhang area ({overhang_ratio*100:.0f}% of surface) will require support material"
                    ))
        
        elif process_type == "3d_sla":
            # Check for trapped volumes
            if metrics.volume_cm3 > 50 and metrics.is_watertight:
                issues.append(DFMIssue(
                    type="trapped_volume",
                    severity="medium",
                    description="Large enclosed volume may trap uncured resin. Consider adding drainage holes."
                ))
            
            # Check minimum feature size
            if metrics.wall_thickness_min and metrics.wall_thickness_min < 0.5:
                issues.append(DFMIssue(
                    type="thin_feature",
                    severity="medium",
                    description=f"Features below 0.5mm may not cure properly in SLA"
                ))
        
        return issues
    
    def analyze_step(self, file_path: str, process_type: str) -> Tuple[GeometryMetrics, List[DFMIssue]]:
        """Analyze STEP/IGES files (placeholder for future CAD kernel integration)."""
        # For now, use mesh conversion if possible
        try:
            mesh = trimesh.load(file_path)
            return self.analyze_stl(file_path, process_type)
        except:
            # Fallback to mock data with reasonable estimates
            return self._analyze_step_mock(file_path, process_type)
    
    def _analyze_step_mock(self, file_path: str, process_type: str) -> Tuple[GeometryMetrics, List[DFMIssue]]:
        """Mock STEP analysis until CAD kernel is integrated."""
        # Generate consistent values based on file
        np.random.seed(hash(file_path) % 2**32)
        
        # CNC parts tend to be larger and more rectangular
        bbox_x = np.random.uniform(30, 250)
        bbox_y = np.random.uniform(30, 250)
        bbox_z = np.random.uniform(10, 80)
        
        volume = bbox_x * bbox_y * bbox_z / 1000 * np.random.uniform(0.5, 0.85)
        surface_area = 2 * (bbox_x * bbox_y + bbox_x * bbox_z + bbox_y * bbox_z) / 100
        
        holes_count = np.random.randint(2, 15) if process_type == "cnc_3axis" else None
        
        metrics = GeometryMetrics(
            volume_cm3=round(volume, 2),
            surface_area_cm2=round(surface_area, 2),
            bbox_mm=BoundingBox(
                x=round(bbox_x, 1),
                y=round(bbox_y, 1),
                z=round(bbox_z, 1)
            ),
            holes_count=holes_count
        )
        
        issues = []
        
        if process_type == "cnc_3axis":
            # Check aspect ratio
            aspect_ratio = max(bbox_x, bbox_y) / bbox_z
            if aspect_ratio > 10:
                issues.append(DFMIssue(
                    type="high_aspect_ratio",
                    severity="medium",
                    description=f"High aspect ratio ({aspect_ratio:.1f}:1) may cause workpiece deflection"
                ))
            
            # Check for thin walls (estimated)
            if bbox_z < 3:
                issues.append(DFMIssue(
                    type="thin_material",
                    severity="high",
                    description=f"Material thickness ({bbox_z:.1f}mm) may be too thin for stable machining"
                ))
        
        return metrics, issues
    
    def analyze_dxf(self, file_path: str, process_type: str, material_thickness: float = 3.0) -> Tuple[GeometryMetrics, List[DFMIssue]]:
        """Analyze DXF files for laser cutting (placeholder)."""
        # For now, use mock data
        # Future: integrate ezdxf or similar library
        return self._analyze_dxf_mock(file_path, process_type, material_thickness)
    
    def _analyze_dxf_mock(self, file_path: str, process_type: str, material_thickness: float) -> Tuple[GeometryMetrics, List[DFMIssue]]:
        """Mock DXF analysis until DXF parser is integrated."""
        np.random.seed(hash(file_path) % 2**32)
        
        # 2D laser cutting parts
        bbox_x = np.random.uniform(50, 500)
        bbox_y = np.random.uniform(50, 500)
        bbox_z = material_thickness
        
        # Area and perimeter based
        area = bbox_x * bbox_y * np.random.uniform(0.4, 0.9)
        volume = area * bbox_z / 1000
        surface_area = area / 100
        
        # Cutting length (perimeter + internal cuts)
        perimeter = 2 * (bbox_x + bbox_y)
        internal_cuts = perimeter * np.random.uniform(0.5, 2.0)
        length_cut = perimeter + internal_cuts
        
        metrics = GeometryMetrics(
            volume_cm3=round(volume, 2),
            surface_area_cm2=round(surface_area, 2),
            bbox_mm=BoundingBox(
                x=round(bbox_x, 1),
                y=round(bbox_y, 1),
                z=round(bbox_z, 1)
            ),
            length_cut_mm=round(length_cut, 1)
        )
        
        issues = []
        
        # Check for small features
        min_feature_size = 1.0  # mm
        if np.random.random() > 0.7:  # 30% chance of small features
            issues.append(DFMIssue(
                type="small_features",
                severity="medium",
                description=f"Design contains features smaller than {min_feature_size}mm which may not cut cleanly"
            ))
        
        # Check cutting complexity
        if length_cut > 3000:
            issues.append(DFMIssue(
                type="complex_cutting_path",
                severity="low",
                description="Complex cutting path will increase processing time and cost"
            ))
        
        return metrics, issues
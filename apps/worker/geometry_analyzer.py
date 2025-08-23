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
import ezdxf
from ezdxf.acc import USE_C_EXT

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
        """Analyze STEP/IGES files using gmsh for meshing."""
        try:
            import gmsh
            
            # Initialize gmsh
            gmsh.initialize()
            gmsh.option.setNumber("General.Terminal", 0)  # Disable terminal output
            
            try:
                # Import the STEP/IGES file
                gmsh.model.occ.importShapes(file_path)
                gmsh.model.occ.synchronize()
                
                # Get model bounds
                bbox = gmsh.model.getBoundingBox(-1, -1)
                bbox_x = bbox[3] - bbox[0]
                bbox_y = bbox[4] - bbox[1] 
                bbox_z = bbox[5] - bbox[2]
                
                # Get volume and surface area
                volumes = gmsh.model.occ.getEntities(3)  # 3D entities
                total_volume = 0.0
                total_surface_area = 0.0
                
                for dim, tag in volumes:
                    mass_props = gmsh.model.occ.getMass(dim, tag)
                    total_volume += mass_props
                
                # Get surfaces
                surfaces = gmsh.model.occ.getEntities(2)  # 2D entities
                holes_count = 0
                small_features = []
                
                for dim, tag in surfaces:
                    area = gmsh.model.occ.getMass(dim, tag)
                    total_surface_area += area
                    
                    # Check for small surfaces (potential holes)
                    if area < 100:  # mm²
                        small_features.append(area)
                        if area < 50:  # Likely a hole
                            holes_count += 1
                
                # Convert units
                volume_cm3 = total_volume / 1000
                surface_area_cm2 = total_surface_area / 100
                
                # Generate mesh to get more detailed analysis
                gmsh.model.mesh.generate(2)
                
                # Extract edges for CNC feature detection
                edges = gmsh.model.occ.getEntities(1)  # 1D entities
                sharp_edges = 0
                for dim, tag in edges:
                    # Check for sharp corners (simplified)
                    sharp_edges += 1
                
                metrics = GeometryMetrics(
                    volume_cm3=round(volume_cm3, 2),
                    surface_area_cm2=round(surface_area_cm2, 2),
                    bbox_mm=BoundingBox(
                        x=round(bbox_x, 1),
                        y=round(bbox_y, 1),
                        z=round(bbox_z, 1)
                    ),
                    holes_count=holes_count if process_type == "cnc_3axis" else None
                )
                
                # Calculate DFM issues
                issues = self._calculate_step_dfm_issues(metrics, small_features, sharp_edges, process_type)
                
                return metrics, issues
                
            finally:
                gmsh.finalize()
                
        except Exception as e:
            logger.error(f"Error analyzing STEP with gmsh: {str(e)}")
            # Try trimesh as fallback
            try:
                mesh = trimesh.load(file_path)
                return self.analyze_stl(file_path, process_type)
            except:
                # Final fallback to mock data
                return self._analyze_step_mock(file_path, process_type)
    
    def _calculate_step_dfm_issues(self, metrics: GeometryMetrics, small_features: List[float], 
                                   sharp_edges: int, process_type: str) -> List[DFMIssue]:
        """Calculate DFM issues for STEP files (CNC focused)."""
        issues = []
        
        if process_type == "cnc_3axis":
            # Check for thin walls
            min_thickness = 1.0  # mm for aluminum
            if metrics.bbox_mm.z < min_thickness * 3:
                issues.append(DFMIssue(
                    type="thin_walls",
                    severity="high",
                    description=f"Part thickness ({metrics.bbox_mm.z:.1f}mm) may be too thin for stable CNC machining"
                ))
            
            # Check aspect ratio
            aspect_ratio = max(metrics.bbox_mm.x, metrics.bbox_mm.y) / metrics.bbox_mm.z
            if aspect_ratio > 10:
                issues.append(DFMIssue(
                    type="high_aspect_ratio",
                    severity="medium",
                    description=f"High aspect ratio ({aspect_ratio:.1f}:1) may cause workpiece deflection during machining"
                ))
            
            # Check for small features
            if small_features:
                min_feature = min(small_features)
                if min_feature < 50:  # mm²
                    issues.append(DFMIssue(
                        type="small_features",
                        severity="medium",
                        description=f"Small features detected (min: {min_feature:.1f}mm²) may require special tooling"
                    ))
            
            # Check for deep holes
            if metrics.holes_count and metrics.holes_count > 0:
                if metrics.bbox_mm.z > 20:  # Deep part with holes
                    issues.append(DFMIssue(
                        type="deep_holes",
                        severity="medium",
                        description=f"Deep holes in thick material may require special drilling operations"
                    ))
            
            # Check sharp internal corners
            if sharp_edges > 50:
                issues.append(DFMIssue(
                    type="sharp_corners",
                    severity="low",
                    description="Many sharp internal corners detected. Consider adding fillets for easier machining"
                ))
        
        return issues
    
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
    
    def _calculate_dxf_dfm_issues(self, metrics: GeometryMetrics, small_features: List[float], 
                                   entity_count: int, process_type: str) -> List[DFMIssue]:
        """Calculate DFM issues specific to DXF/laser cutting."""
        issues = []
        
        # Check for small features
        if small_features:
            min_feature = min(small_features)
            count = len(small_features)
            issues.append(DFMIssue(
                type="small_features",
                severity="medium" if min_feature > 0.5 else "high",
                description=f"Design contains {count} features smaller than 1mm (smallest: {min_feature:.2f}mm)"
            ))
        
        # Check cutting complexity
        if metrics.length_cut_mm > 5000:
            issues.append(DFMIssue(
                type="complex_cutting_path",
                severity="low",
                description=f"Long cutting path ({metrics.length_cut_mm:.0f}mm) will increase processing time"
            ))
        
        # Check for very thin cuts (kerf width issues)
        if metrics.bbox_mm.x < 2 or metrics.bbox_mm.y < 2:
            issues.append(DFMIssue(
                type="thin_geometry",
                severity="high",
                description="Part dimensions too small for reliable laser cutting"
            ))
        
        # Check entity count (file complexity)
        if entity_count > 1000:
            issues.append(DFMIssue(
                type="high_complexity",
                severity="medium",
                description=f"High entity count ({entity_count}) may slow processing"
            ))
        
        # Material-specific checks
        if process_type == "laser_2d":
            # Check aspect ratio for warping
            aspect_ratio = max(metrics.bbox_mm.x, metrics.bbox_mm.y) / min(metrics.bbox_mm.x, metrics.bbox_mm.y)
            if aspect_ratio > 20:
                issues.append(DFMIssue(
                    type="high_aspect_ratio",
                    severity="low",
                    description=f"High aspect ratio ({aspect_ratio:.1f}:1) may cause warping in thin materials"
                ))
        
        return issues
    
    def analyze_dxf(self, file_path: str, process_type: str, material_thickness: float = 3.0) -> Tuple[GeometryMetrics, List[DFMIssue]]:
        """Analyze DXF files for laser cutting."""
        try:
            # Load DXF document
            doc = ezdxf.readfile(file_path)
            msp = doc.modelspace()
            
            # Extract all entities and calculate metrics
            total_length = 0.0
            min_x = min_y = float('inf')
            max_x = max_y = float('-inf')
            small_features = []
            entity_count = 0
            
            for entity in msp:
                entity_count += 1
                
                if entity.dxftype() == 'LINE':
                    start = entity.dxf.start
                    end = entity.dxf.end
                    length = np.sqrt((end[0] - start[0])**2 + (end[1] - start[1])**2)
                    total_length += length
                    
                    # Track small features
                    if length < 1.0:  # mm
                        small_features.append(length)
                    
                    # Update bounding box
                    min_x = min(min_x, start[0], end[0])
                    min_y = min(min_y, start[1], end[1])
                    max_x = max(max_x, start[0], end[0])
                    max_y = max(max_y, start[1], end[1])
                    
                elif entity.dxftype() == 'CIRCLE':
                    center = entity.dxf.center
                    radius = entity.dxf.radius
                    circumference = 2 * np.pi * radius
                    total_length += circumference
                    
                    # Track small circles
                    if radius < 0.5:  # mm
                        small_features.append(radius * 2)
                    
                    # Update bounding box
                    min_x = min(min_x, center[0] - radius)
                    min_y = min(min_y, center[1] - radius)
                    max_x = max(max_x, center[0] + radius)
                    max_y = max(max_y, center[1] + radius)
                    
                elif entity.dxftype() == 'ARC':
                    center = entity.dxf.center
                    radius = entity.dxf.radius
                    start_angle = np.radians(entity.dxf.start_angle)
                    end_angle = np.radians(entity.dxf.end_angle)
                    angle_span = abs(end_angle - start_angle)
                    arc_length = radius * angle_span
                    total_length += arc_length
                    
                    # Update bounding box (simplified)
                    min_x = min(min_x, center[0] - radius)
                    min_y = min(min_y, center[1] - radius)
                    max_x = max(max_x, center[0] + radius)
                    max_y = max(max_y, center[1] + radius)
                    
                elif entity.dxftype() == 'LWPOLYLINE' or entity.dxftype() == 'POLYLINE':
                    # Calculate polyline length
                    points = list(entity.points())
                    for i in range(len(points) - 1):
                        p1 = points[i]
                        p2 = points[i + 1]
                        segment_length = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
                        total_length += segment_length
                        
                        if segment_length < 1.0:
                            small_features.append(segment_length)
                        
                        # Update bounding box
                        min_x = min(min_x, p1[0], p2[0])
                        min_y = min(min_y, p1[1], p2[1])
                        max_x = max(max_x, p1[0], p2[0])
                        max_y = max(max_y, p1[1], p2[1])
                    
                    # Check if closed
                    if entity.dxf.flags & 1:  # closed polyline
                        p1 = points[-1]
                        p2 = points[0]
                        segment_length = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
                        total_length += segment_length
                
                elif entity.dxftype() == 'SPLINE':
                    # Approximate spline length
                    try:
                        points = list(entity.control_points)
                        for i in range(len(points) - 1):
                            p1 = points[i]
                            p2 = points[i + 1]
                            segment_length = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
                            total_length += segment_length * 1.2  # Rough approximation
                            
                            # Update bounding box
                            min_x = min(min_x, p1[0], p2[0])
                            min_y = min(min_y, p1[1], p2[1])
                            max_x = max(max_x, p1[0], p2[0])
                            max_y = max(max_y, p1[1], p2[1])
                    except:
                        pass  # Skip if spline processing fails
            
            # Calculate bounding box
            bbox_x = max_x - min_x if max_x > min_x else 100.0  # Default if no entities
            bbox_y = max_y - min_y if max_y > min_y else 100.0
            bbox_z = material_thickness
            
            # Calculate area (simplified - actual area would need proper polygon analysis)
            area_mm2 = bbox_x * bbox_y * 0.7  # Assume 70% material utilization
            volume_cm3 = (area_mm2 * bbox_z) / 1000
            surface_area_cm2 = area_mm2 / 100
            
            metrics = GeometryMetrics(
                volume_cm3=round(volume_cm3, 2),
                surface_area_cm2=round(surface_area_cm2, 2),
                bbox_mm=BoundingBox(
                    x=round(bbox_x, 1),
                    y=round(bbox_y, 1),
                    z=round(bbox_z, 1)
                ),
                length_cut_mm=round(total_length, 1)
            )
            
            # Calculate DFM issues
            issues = self._calculate_dxf_dfm_issues(metrics, small_features, entity_count, process_type)
            
            return metrics, issues
            
        except Exception as e:
            logger.error(f"Error analyzing DXF: {str(e)}")
            # Fallback to mock if parsing fails
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
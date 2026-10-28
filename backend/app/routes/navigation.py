from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import json

from app.database.database import get_db
from app.models.models import Image, Navigation
from app.schemas.schemas import StandardResponse, NavigationRequest
from app.services.image_processor import ImageProcessor
from app.services.path_planner import PathPlanner

import logging
from app.utils.exceptions import ProcessingError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/navigation", tags=["Navigation"])

@router.post("", response_model=StandardResponse)
def generate_path(req: NavigationRequest, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == req.image_id).first()
    if not db_image:
        raise ProcessingError("Image not found", "Database Lookup")
        
    try:
        processor = ImageProcessor()
        stats = processor.process_lunar_image(db_image.file_path, os.path.basename(db_image.file_path))
        terrain_map = stats["terrain_map"]
        
        planner = PathPlanner(terrain_map)
        path_results = planner.generate_path(req.start_x, req.start_y, req.end_x, req.end_y)
        logger.info("Path planning completed")
    except Exception as e:
        if isinstance(e, ProcessingError):
            raise
        raise ProcessingError(str(e), "Path Planning")
    
    if not path_results["path"]:
        raise ProcessingError("No valid path found avoiding obstacles.", "Path Planning")
        
    db_nav = Navigation(
        image_id=req.image_id,
        start_x=req.start_x,
        start_y=req.start_y,
        end_x=req.end_x,
        end_y=req.end_y,
        distance=path_results["distance"],
        risk_score=path_results["risk_score"],
        energy_estimation=path_results["energy_estimation"],
        path_coordinates=json.dumps(path_results["path"])
    )
    db.add(db_nav)
    db.commit()
    db.refresh(db_nav)
    
    return StandardResponse(
        success=True,
        message="Optimal path generated",
        data={
            "navigation_id": db_nav.id,
            "path": path_results["path"],
            "stats": {
                "distance": db_nav.distance,
                "risk_score": db_nav.risk_score,
                "energy_estimation": db_nav.energy_estimation
            }
        }
    )

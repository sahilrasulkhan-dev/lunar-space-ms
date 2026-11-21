from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os

from app.database.database import get_db
from app.models.models import Image, Analysis
from app.schemas.schemas import StandardResponse, AnalysisResponse
from app.services.image_processor import ImageProcessor

from app.utils.exceptions import ProcessingError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analyze", tags=["Analysis"])

@router.post("/{image_id}", response_model=StandardResponse)
def analyze_image(image_id: int, db: Session = Depends(get_db)):
    db_image = db.query(Image).filter(Image.id == image_id).first()
    if not db_image:
        raise ProcessingError("Image not found", "Database Lookup")
        
    if not os.path.exists(db_image.file_path):
        raise ProcessingError("Original image file missing from disk", "File Check")
        
    processor = ImageProcessor()
    
    output_filename = os.path.basename(db_image.file_path)
    stats = processor.process_lunar_image(db_image.file_path, output_filename)

        
    # Save analysis results to DB
    db_analysis = Analysis(
        image_id=image_id,
        safe_percentage=stats["safe_percentage"],
        unsafe_percentage=stats["unsafe_percentage"],
        landing_score=stats["landing_score"],
        confidence=stats["confidence"],
        terrain_type=stats["terrain_type"],
        processed_image_path=stats["processed_image_path"]
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    
    logger.info("Response sent")
    return StandardResponse(
        success=True,
        message="Analysis complete",
        data={
            "analysis_id": db_analysis.id,
            "results": {
                "safe_percentage": db_analysis.safe_percentage,
                "unsafe_percentage": db_analysis.unsafe_percentage,
                "landing_score": db_analysis.landing_score,
                "confidence": db_analysis.confidence,
                "terrain_type": db_analysis.terrain_type,
                "processed_image_path": db_analysis.processed_image_path,
                "yolo_detections_count": stats.get("yolo_detections_count", 0),
                "yolo_detections": stats.get("yolo_detections", []),
                "model_name": stats.get("model_name", "YOLO (best.pt)")
            }
        }
    )

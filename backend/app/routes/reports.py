from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.models import Analysis, Report
from app.schemas.schemas import StandardResponse

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.get("/{analysis_id}", response_model=StandardResponse)
def get_report(analysis_id: int, db: Session = Depends(get_db)):
    db_analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not db_analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    db_report = db.query(Report).filter(Report.analysis_id == analysis_id).first()
    
    if not db_report:
        # Generate summary if it doesn't exist
        summary = f"Mission analysis completed for image {db_analysis.image_id}. " \
                  f"Terrain is classified as {db_analysis.terrain_type}. " \
                  f"Landing score computed at {db_analysis.landing_score}/100 with a " \
                  f"safe zone coverage of {db_analysis.safe_percentage}%."
                  
        db_report = Report(analysis_id=analysis_id, summary=summary)
        db.add(db_report)
        db.commit()
        db.refresh(db_report)
        
    return StandardResponse(
        success=True,
        message="Report retrieved successfully",
        data={
            "report_id": db_report.id,
            "analysis_id": db_report.analysis_id,
            "summary": db_report.summary,
            "generated_at": str(db_report.generated_at),
            "stats": {
                "safe": db_analysis.safe_percentage,
                "unsafe": db_analysis.unsafe_percentage,
                "landing_score": db_analysis.landing_score
            }
        }
    )

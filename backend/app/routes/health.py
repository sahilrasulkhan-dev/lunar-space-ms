from fastapi import APIRouter
from app.schemas.schemas import StandardResponse

router = APIRouter(tags=["Health"])

@router.get("/api/health", response_model=StandardResponse)
def health_check():
    return StandardResponse(
        success=True,
        message="LunaSafe AI Backend is operational",
        data={"status": "online"}
    )

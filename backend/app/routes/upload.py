from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import shutil
import uuid
import os
from pathlib import Path

from app.database.database import get_db
from app.models.models import Image, User
from app.schemas.schemas import StandardResponse
from app.utils.security import get_current_user

import logging
from app.utils.exceptions import ProcessingError

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["Upload"])

UPLOAD_DIR = Path("app/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("", response_model=StandardResponse)
async def upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user) # Optional for now
):
    logger.info(f"Image uploaded: {file.filename}")
    content_type = file.content_type or ""
    file_ext = os.path.splitext(file.filename or "")[1].lower()
    valid_exts = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}
    if not (content_type.startswith("image/") or file_ext in valid_exts):
        raise ProcessingError("File provided is not an image.", "Format Validation")
        
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Save to database
    db_image = Image(
        filename=file.filename,
        file_path=str(file_path),
        # user_id=current_user.id
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    return StandardResponse(
        success=True,
        message="Image uploaded successfully",
        data={"image_id": db_image.id, "file_path": str(file_path)}
    )

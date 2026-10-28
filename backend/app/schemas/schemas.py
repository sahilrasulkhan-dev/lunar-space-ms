from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Common Response Format
class StandardResponse(BaseModel):
    success: bool
    message: str
    data: Dict[str, Any] = {}

# User Schemas
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Analysis Schemas
class AnalysisResponse(BaseModel):
    id: int
    image_id: int
    safe_percentage: float
    unsafe_percentage: float
    landing_score: float
    confidence: float
    terrain_type: str
    processed_image_path: str
    
    class Config:
        from_attributes = True

# Navigation Schemas
class NavigationRequest(BaseModel):
    image_id: int
    start_x: int
    start_y: int
    end_x: int
    end_y: int

class NavigationResponse(BaseModel):
    path: List[List[int]]
    distance: float
    risk_score: float
    energy_estimation: float

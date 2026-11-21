"""
Simulation and Navigation Pydantic Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class GridInitRequest(BaseModel):
    width: int = Field(default=40, ge=20, le=100)
    height: int = Field(default=40, ge=20, le=100)
    start_x: float = Field(default=3.0)
    start_y: float = Field(default=3.0)
    goal_x: float = Field(default=36.0)
    goal_y: float = Field(default=36.0)
    seed: Optional[int] = Field(default=42)

class ObstacleInjectRequest(BaseModel):
    x: Optional[float] = None
    y: Optional[float] = None
    radius: float = Field(default=1.8, ge=0.5, le=5.0)
    obstacle_type: str = Field(default="boulder")
    inject_on_path: bool = Field(default=False)
    steps_ahead: int = Field(default=4)

class SimulationStepRequest(BaseModel):
    steps_count: int = Field(default=1, ge=1, le=50)

class PlanRouteRequest(BaseModel):
    start_x: Optional[float] = None
    start_y: Optional[float] = None
    goal_x: Optional[float] = None
    goal_y: Optional[float] = None

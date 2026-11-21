"""
Simulation API Router
Exposes validated endpoints for lunar grid simulation, rover kinematics,
obstacle injection, and dynamic A* / D* Lite replanning.
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import time

from app.schemas.schemas import StandardResponse
from app.schemas.simulation_schema import (
    GridInitRequest,
    ObstacleInjectRequest,
    SimulationStepRequest,
    PlanRouteRequest
)
from app.simulation.lunar_environment import LunarEnvironment
from app.simulation.rover_simulator import RoverSimulator
from app.simulation.sensor_simulator import SensorSimulator
from app.simulation.obstacle_injection import ObstacleInjector
from app.navigation.dynamic_replanning import DynamicReplanningCoordinator
from app.navigation.localization import LocalizationEstimator
from app.navigation.path_smoothing import PathSmoother

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

# Global singleton simulation manager
class SimulationSession:
    def __init__(self):
        self.env = LunarEnvironment(width=40, height=40, seed=42)
        self.rover = RoverSimulator(start_x=3.0, start_y=3.0, goal_x=36.0, goal_y=36.0)
        self.sensors = SensorSimulator()
        self.coordinator = DynamicReplanningCoordinator(self.env, self.rover)
        self.localization = LocalizationEstimator()
        
        # Initial plan
        self.coordinator.plan_initial_route()

    def reset(self, width: int = 40, height: int = 40, start_x: float = 3.0, start_y: float = 3.0,
              goal_x: float = 36.0, goal_y: float = 36.0, seed: Optional[int] = 42):
        self.env = LunarEnvironment(width=width, height=height, seed=seed)
        self.rover = RoverSimulator(start_x=start_x, start_y=start_y, goal_x=goal_x, goal_y=goal_y)
        self.sensors = SensorSimulator()
        self.coordinator = DynamicReplanningCoordinator(self.env, self.rover)
        self.coordinator.plan_initial_route()

session = SimulationSession()

@router.get("/state", response_model=StandardResponse)
def get_simulation_state():
    """Returns full snapshot of current lunar grid, rover state, sensor telemetry, and routes."""
    rover_telem = session.rover.get_telemetry()
    sensor_data = session.sensors.read_sensors(
        rover_telem["x"],
        rover_telem["y"],
        session.rover.heading_rad,
        session.env
    )
    pose = session.localization.estimate_pose(
        rover_telem["x"],
        rover_telem["y"],
        rover_telem["heading_deg"]
    )
    
    # Calculate smoothed path if path exists
    smoothed_path = []
    if session.rover.current_path:
        smoothed_path = PathSmoother.smooth(session.rover.current_path, session.env.cost_map)

    return StandardResponse(
        success=True,
        message="Simulation state retrieved",
        data={
            "environment": session.env.to_dict(),
            "rover": rover_telem,
            "sensors": sensor_data,
            "localization": pose,
            "initial_astar_path": session.coordinator.initial_astar_path,
            "current_active_path": session.rover.current_path,
            "smoothed_path": smoothed_path,
            "replanning_history": session.coordinator.replanning_history
        }
    )

@router.post("/init", response_model=StandardResponse)
def init_simulation(req: GridInitRequest):
    """Initializes a new lunar simulation environment and rover configuration."""
    session.reset(
        width=req.width,
        height=req.height,
        start_x=req.start_x,
        start_y=req.start_y,
        goal_x=req.goal_x,
        goal_y=req.goal_y,
        seed=req.seed
    )
    return StandardResponse(
        success=True,
        message="Lunar simulation environment initialized",
        data={
            "grid_size": [req.width, req.height],
            "start": [req.start_x, req.start_y],
            "goal": [req.goal_x, req.goal_y],
            "initial_waypoints_count": len(session.coordinator.initial_astar_path)
        }
    )

@router.post("/plan", response_model=StandardResponse)
def plan_route(req: PlanRouteRequest):
    """Plans or recalculates baseline path using A*."""
    if req.start_x is not None and req.start_y is not None:
        session.rover.x = req.start_x
        session.rover.y = req.start_y
    if req.goal_x is not None and req.goal_y is not None:
        session.rover.goal_x = req.goal_x
        session.rover.goal_y = req.goal_y
        
    res = session.coordinator.plan_initial_route()
    return StandardResponse(
        success=res.get("success", False),
        message="Route planned with A* algorithm",
        data=res
    )

@router.post("/step", response_model=StandardResponse)
def step_simulation(req: SimulationStepRequest):
    """
    Advances the rover by N simulation steps.
    Detects dynamic obstacles within sensor horizon and triggers replanning if needed.
    """
    step_results = []
    replan_triggered = False
    
    for _ in range(req.steps_count):
        step_res = session.rover.step(session.env)
        step_results.append(step_res)
        
        # If obstacle detected on path, trigger dynamic replanning
        if step_res.get("requires_replan"):
            hazard = step_res["hazard"]
            replan_res = session.coordinator.handle_obstacle_and_replan(hazard)
            replan_triggered = True
            step_results.append({
                "event": "REPLAN_EXECUTED",
                "details": replan_res
            })
            break  # Pause stepping so user can see replanning event
            
        if step_res.get("event") in ("GOAL_REACHED", "FINISHED"):
            break

    rover_telem = session.rover.get_telemetry()
    return StandardResponse(
        success=True,
        message="Simulation stepped",
        data={
            "step_events": step_results,
            "replan_triggered": replan_triggered,
            "rover": rover_telem,
            "remaining_waypoints": len(session.rover.current_path) - session.rover.active_waypoint_idx
        }
    )

@router.post("/inject_obstacle", response_model=StandardResponse)
def inject_obstacle(req: ObstacleInjectRequest):
    """
    Injects an unexpected obstacle into the terrain.
    Can be placed at explicit coordinates or automatically ahead on the active path.
    """
    if req.inject_on_path:
        obs = ObstacleInjector.inject_along_path(
            env=session.env,
            current_path=session.rover.current_path,
            active_waypoint_idx=session.rover.active_waypoint_idx,
            steps_ahead=req.steps_ahead,
            radius=req.radius,
            obstacle_type=req.obstacle_type
        )
        if not obs:
            raise HTTPException(status_code=400, detail="Unable to inject obstacle on path (no active remaining path)")
    else:
        if req.x is None or req.y is None:
            raise HTTPException(status_code=400, detail="Coordinates (x, y) required when inject_on_path is false")
        obs = ObstacleInjector.inject_at_coordinates(
            env=session.env,
            x=req.x,
            y=req.y,
            radius=req.radius,
            obstacle_type=req.obstacle_type
        )

    # Immediately evaluate if this obstacle blocks the path and trigger replan
    replan_info = session.coordinator.handle_obstacle_and_replan(obs)

    return StandardResponse(
        success=True,
        message=f"Dynamic obstacle injected: {obs.get('type')}",
        data={
            "obstacle": obs,
            "replan_info": replan_info,
            "rover_status": session.rover.status,
            "active_path_length": len(session.rover.current_path)
        }
    )

@router.post("/reset", response_model=StandardResponse)
def reset_simulation():
    """Resets rover to start position and restores initial planned route."""
    session.reset()
    return StandardResponse(
        success=True,
        message="Simulation reset to baseline state",
        data=session.rover.get_telemetry()
    )

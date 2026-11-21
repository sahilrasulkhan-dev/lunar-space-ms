"""
Obstacle Injection Module
Injects unexpected rocks, boulders, or terrain collapses directly on or near the active rover path.
"""

import math
from typing import Dict, Any, Optional, List
from app.simulation.lunar_environment import LunarEnvironment

class ObstacleInjector:
    @staticmethod
    def inject_at_coordinates(
        env: LunarEnvironment,
        x: float,
        y: float,
        radius: float = 1.5,
        obstacle_type: str = "boulder"
    ) -> Dict[str, Any]:
        """Injects dynamic obstacle at specified grid coordinates."""
        return env.inject_obstacle(x, y, radius, obstacle_type)

    @staticmethod
    def inject_along_path(
        env: LunarEnvironment,
        current_path: List[List[int]],
        active_waypoint_idx: int,
        steps_ahead: int = 4,
        radius: float = 1.8,
        obstacle_type: str = "boulder_fall"
    ) -> Optional[Dict[str, Any]]:
        """
        Injects an obstacle directly on the rover's upcoming path.
        Used to demonstrate real-time hazard detection and dynamic replanning.
        """
        if not current_path or len(current_path) <= active_waypoint_idx:
            return None
            
        target_idx = min(len(current_path) - 1, active_waypoint_idx + steps_ahead)
        target_wp = current_path[target_idx]
        
        return env.inject_obstacle(
            x=float(target_wp[0]),
            y=float(target_wp[1]),
            radius=radius,
            obstacle_type=obstacle_type
        )

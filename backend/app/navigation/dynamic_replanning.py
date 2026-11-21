"""
Dynamic Replanning Coordinator
Coordinates A* initial trajectory, obstacle discovery, D* Lite execution,
and trajectory stitching.
"""

import time
import math
from typing import Dict, List, Tuple, Any, Optional
import numpy as np

from app.navigation.astar import AStarPlanner
from app.navigation.dstar_lite import DStarLitePlanner
from app.simulation.lunar_environment import LunarEnvironment
from app.simulation.rover_simulator import RoverSimulator

class DynamicReplanningCoordinator:
    def __init__(self, env: LunarEnvironment, rover: RoverSimulator):
        self.env = env
        self.rover = rover
        self.astar = AStarPlanner(env.cost_map, env.resolution_m)
        self.dstar = DStarLitePlanner(env.cost_map, env.resolution_m)
        
        self.initial_astar_path: List[List[int]] = []
        self.latest_replanned_path: List[List[int]] = []
        self.replanning_history: List[Dict[str, Any]] = []

    def plan_initial_route(self) -> Dict[str, Any]:
        """Plans the initial baseline path using A* search."""
        start = (int(round(self.rover.x)), int(round(self.rover.y)))
        goal = (int(round(self.rover.goal_x)), int(round(self.rover.goal_y)))
        
        # Initialize D* Lite for fast subsequent updates
        self.dstar.initialize(start, goal)
        self.dstar.compute_shortest_path()
        
        res = self.astar.plan(start, goal)
        if res["success"]:
            self.initial_astar_path = res["path"]
            self.rover.set_path(res["path"])
        return res

    def handle_obstacle_and_replan(
        self,
        obstacle: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Triggered when an unexpected obstacle blocks the rover's path.
        Executes incremental replanning from current rover coordinates.
        """
        start_time = time.perf_counter()
        current_pos = (int(round(self.rover.x)), int(round(self.rover.y)))
        
        # Collect affected grid cells around obstacle radius
        ox, oy, r = obstacle["x"], obstacle["y"], obstacle["radius"]
        obstacle_cells = []
        for y in range(max(0, int(oy - r - 1)), min(self.env.height, int(oy + r + 2))):
            for x in range(max(0, int(ox - r - 1)), min(self.env.width, int(ox + r + 2))):
                if math.hypot(x - ox, y - oy) <= r + 0.5:
                    obstacle_cells.append((x, y))

        # Run D* Lite incremental replan
        dstar_result = self.dstar.replan_with_obstacle(current_pos, obstacle_cells)
        
        # If D* Lite succeeds and has a path, use it; otherwise fallback to full A* on updated cost map
        if dstar_result["success"] and len(dstar_result["path"]) > 1:
            replanned_segment = dstar_result["path"]
            latency_ms = dstar_result["compute_time_ms"]
            algorithm_used = "D* Lite (Incremental)"
        else:
            self.env.recompute_cost_map()
            self.astar = AStarPlanner(self.env.cost_map, self.env.resolution_m)
            astar_fallback = self.astar.plan(current_pos, (int(round(self.rover.goal_x)), int(round(self.rover.goal_y))))
            replanned_segment = astar_fallback.get("path", [])
            latency_ms = astar_fallback.get("compute_time_ms", 5.0)
            algorithm_used = "A* (Full Re-search)"

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        if replanned_segment:
            # Update rover's current path
            self.rover.set_path(replanned_segment)
            self.latest_replanned_path = replanned_segment
            self.rover.status = "NAVIGATING"
            
            event = {
                "event_id": len(self.replanning_history) + 1,
                "timestamp_ms": round(time.time() * 1000),
                "trigger": "OBSTACLE_DETECTED",
                "obstacle_id": obstacle.get("id"),
                "obstacle_type": obstacle.get("type", "boulder"),
                "obstacle_coords": [obstacle.get("x"), obstacle.get("y")],
                "rover_pos_at_replan": list(current_pos),
                "algorithm": algorithm_used,
                "latency_ms": round(latency_ms, 2),
                "new_waypoints_count": len(replanned_segment)
            }
            self.replanning_history.append(event)
            self.rover.replanning_events.append(event)

            return {
                "success": True,
                "algorithm": algorithm_used,
                "latency_ms": round(elapsed_ms, 2),
                "replanned_path": replanned_segment,
                "event": event
            }
        else:
            self.rover.status = "EMERGENCY_STOP"
            return {
                "success": False,
                "error": "No safe avoidance route found around obstacle",
                "latency_ms": round(elapsed_ms, 2)
            }

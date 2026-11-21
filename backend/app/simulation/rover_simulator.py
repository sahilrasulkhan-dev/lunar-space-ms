"""
Rover Simulator Module
Maintains rover kinematics, state machine, sensor horizons, battery telemetry, and path traversal.
"""

import math
from typing import Dict, List, Tuple, Any, Optional
from app.simulation.lunar_environment import LunarEnvironment

class RoverSimulator:
    def __init__(
        self,
        start_x: float = 3.0,
        start_y: float = 3.0,
        goal_x: float = 36.0,
        goal_y: float = 36.0,
        battery_wh: float = 450.0,
        speed_mps: float = 0.25,
        sensor_range_m: float = 6.0
    ):
        self.start_x = start_x
        self.start_y = start_y
        self.goal_x = goal_x
        self.goal_y = goal_y
        
        self.x = float(start_x)
        self.y = float(start_y)
        self.heading_rad = 0.0
        
        self.battery_capacity_wh = battery_wh
        self.battery_remaining_wh = battery_wh
        self.nominal_speed_mps = speed_mps
        self.sensor_range_m = sensor_range_m
        
        # State: IDLE | NAVIGATING | HAZARD_DETECTED | REPLANNING | GOAL_REACHED | EMERGENCY_STOP
        self.status = "IDLE"
        
        self.current_path: List[List[int]] = []
        self.traversed_path: List[List[float]] = [[self.x, self.y]]
        self.active_waypoint_idx = 0
        
        self.distance_traveled_m = 0.0
        self.replanning_events: List[Dict[str, Any]] = []

    def set_path(self, path: List[List[int]]) -> None:
        """Sets active planned path."""
        self.current_path = path
        self.active_waypoint_idx = 0
        if len(path) > 1 and math.hypot(path[0][0] - self.x, path[0][1] - self.y) < 0.2:
            self.active_waypoint_idx = 1
        if len(path) > 0 and self.status != "GOAL_REACHED":
            self.status = "NAVIGATING"

    def scan_for_hazards(self, env: LunarEnvironment) -> Optional[Dict[str, Any]]:
        """Scans for unmapped obstacles within sensor radius."""
        for obs in env.dynamic_obstacles:
            dist = math.hypot(obs["x"] - self.x, obs["y"] - self.y)
            if dist <= self.sensor_range_m:
                obs["detected"] = True
                
                # Check if this obstacle obstructs any upcoming waypoint in current path
                for i in range(self.active_waypoint_idx, min(len(self.current_path), self.active_waypoint_idx + 10)):
                    wx, wy = self.current_path[i]
                    if math.hypot(wx - obs["x"], wy - obs["y"]) <= obs["radius"] + 0.5:
                        return obs
        return None

    def step(self, env: LunarEnvironment) -> Dict[str, Any]:
        """
        Advances rover one simulation step along the active path.
        Returns step telemetry and whether replanning was triggered.
        """
        if self.status == "GOAL_REACHED":
            return {"event": "GOAL_REACHED", "rover": self.get_telemetry()}
            
        if not self.current_path or self.active_waypoint_idx >= len(self.current_path):
            self.status = "GOAL_REACHED" if math.hypot(self.x - self.goal_x, self.y - self.goal_y) < 2.0 else "IDLE"
            return {"event": "FINISHED", "rover": self.get_telemetry()}

        # 1. First, perform forward sensor scan
        detected_hazard = self.scan_for_hazards(env)
        if detected_hazard is not None:
            self.status = "HAZARD_DETECTED"
            return {
                "event": "HAZARD_DETECTED",
                "hazard": detected_hazard,
                "rover": self.get_telemetry(),
                "requires_replan": True
            }

        # 2. Advance toward current waypoint
        target_wp = self.current_path[self.active_waypoint_idx]
        tx, ty = float(target_wp[0]), float(target_wp[1])
        
        dx = tx - self.x
        dy = ty - self.y
        dist_to_wp = math.hypot(dx, dy)
        
        step_distance = min(self.nominal_speed_mps, dist_to_wp)
        
        if dist_to_wp > 0.001:
            self.heading_rad = math.atan2(dy, dx)
            prev_x, prev_y = self.x, self.y
            
            if dist_to_wp <= self.nominal_speed_mps:
                self.x = tx
                self.y = ty
                self.active_waypoint_idx += 1
            else:
                self.x += (dx / dist_to_wp) * step_distance
                self.y += (dy / dist_to_wp) * step_distance
                
            actual_step = math.hypot(self.x - prev_x, self.y - prev_y)
            self.distance_traveled_m += actual_step
            self.traversed_path.append([round(self.x, 2), round(self.y, 2)])
            
            # Energy calculation: Base drain + slope gradient penalty
            cell_slope = float(env.slope_deg[min(env.height-1, max(0, int(self.y))), min(env.width-1, max(0, int(self.x)))])
            energy_step_wh = actual_step * (0.15 + max(0.0, cell_slope) * 0.02)
            self.battery_remaining_wh = max(0.0, self.battery_remaining_wh - energy_step_wh)

        # 3. Check goal arrival
        if math.hypot(self.x - self.goal_x, self.y - self.goal_y) < 1.0 or self.active_waypoint_idx >= len(self.current_path):
            self.status = "GOAL_REACHED"
            return {"event": "GOAL_REACHED", "rover": self.get_telemetry()}

        return {"event": "TRAVERSING", "rover": self.get_telemetry(), "requires_replan": False}

    def reset(self, start_x: float, start_y: float, goal_x: float, goal_y: float) -> None:
        self.start_x = start_x
        self.start_y = start_y
        self.goal_x = goal_x
        self.goal_y = goal_y
        self.x = float(start_x)
        self.y = float(start_y)
        self.heading_rad = 0.0
        self.battery_remaining_wh = self.battery_capacity_wh
        self.status = "IDLE"
        self.current_path = []
        self.traversed_path = [[self.x, self.y]]
        self.active_waypoint_idx = 0
        self.distance_traveled_m = 0.0
        self.replanning_events = []

    def get_telemetry(self) -> Dict[str, Any]:
        """Returns rover telemetry snapshot."""
        dist_to_goal = math.hypot(self.goal_x - self.x, self.goal_y - self.y)
        battery_pct = round((self.battery_remaining_wh / self.battery_capacity_wh) * 100.0, 1)
        
        return {
            "x": round(self.x, 2),
            "y": round(self.y, 2),
            "grid_x": int(round(self.x)),
            "grid_y": int(round(self.y)),
            "heading_deg": round(math.degrees(self.heading_rad) % 360, 1),
            "speed_mps": self.nominal_speed_mps,
            "status": self.status,
            "battery_pct": battery_pct,
            "battery_remaining_wh": round(self.battery_remaining_wh, 1),
            "distance_traveled_m": round(self.distance_traveled_m, 2),
            "distance_to_goal_m": round(dist_to_goal, 2),
            "active_waypoint_idx": self.active_waypoint_idx,
            "total_waypoints": len(self.current_path),
            "traversed_path": self.traversed_path,
            "remaining_path": self.current_path[self.active_waypoint_idx:] if self.current_path else [],
            "replanning_events_count": len(self.replanning_events)
        }

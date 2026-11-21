"""
Sensor Simulator Module
Simulates Forward LiDAR, Thermal IR radiometer, Stereo Camera, and IMU telemetry.
"""

import math
import numpy as np
from typing import Dict, List, Any
from app.simulation.lunar_environment import LunarEnvironment

class SensorSimulator:
    def __init__(self, fov_deg: float = 90.0, lidar_points: int = 24, max_range_m: float = 8.0):
        self.fov_deg = fov_deg
        self.lidar_points = lidar_points
        self.max_range_m = max_range_m

    def read_sensors(self, rover_x: float, rover_y: float, heading_rad: float, env: LunarEnvironment) -> Dict[str, Any]:
        """Collects simulated multimodal sensor telemetry from the environment."""
        ix = min(env.width - 1, max(0, int(round(rover_x))))
        iy = min(env.height - 1, max(0, int(round(rover_y))))
        
        # 1. IMU: pitch and roll derived from local gradient and heading
        grad_y, grad_x = float(np.gradient(env.elevation, env.resolution_m)[0][iy, ix]), float(np.gradient(env.elevation, env.resolution_m)[1][iy, ix])
        pitch_deg = round(math.degrees(math.atan2(grad_x * math.cos(heading_rad) + grad_y * math.sin(heading_rad), 1.0)), 2)
        roll_deg = round(math.degrees(math.atan2(-grad_x * math.sin(heading_rad) + grad_y * math.cos(heading_rad), 1.0)), 2)
        
        # 2. Thermal radiometer: simulate regolith temperature (Kelvin)
        # Deep depressions (crater bottoms) are permanently shadowed cold traps ~ 45-90K, flat plains ~ 180-230K
        elev = float(env.elevation[iy, ix])
        if elev < -1.5:
            temp_k = max(40.0, 85.0 + elev * 12.0)
        else:
            temp_k = 180.0 + min(60.0, elev * 8.0)
            
        # 3. Forward LiDAR scan (simulated range rays across horizontal FOV)
        lidar_ranges = []
        half_fov = math.radians(self.fov_deg / 2.0)
        angles = np.linspace(heading_rad - half_fov, heading_rad + half_fov, self.lidar_points)
        
        for ang in angles:
            hit_range = self.max_range_m
            # Raycast forward
            for r in np.linspace(0.5, self.max_range_m, 20):
                rx = rover_x + r * math.cos(ang)
                ry = rover_y + r * math.sin(ang)
                rix, riy = int(round(rx)), int(round(ry))
                
                if 0 <= rix < env.width and 0 <= riy < env.height:
                    # Check dynamic obstacles
                    hit_obs = False
                    for obs in env.dynamic_obstacles:
                        if math.hypot(rx - obs["x"], ry - obs["y"]) <= obs["radius"]:
                            hit_obs = True
                            break
                    if hit_obs or env.cost_map[riy, rix] >= 500.0:
                        hit_range = float(r)
                        break
            lidar_ranges.append(round(hit_range, 2))
            
        min_obstacle_dist = min(lidar_ranges) if lidar_ranges else self.max_range_m
        
        return {
            "imu": {
                "pitch_deg": pitch_deg,
                "roll_deg": roll_deg,
                "yaw_deg": round(math.degrees(heading_rad) % 360, 1),
                "angular_rate_dps": 0.0
            },
            "thermal": {
                "regolith_temperature_k": round(temp_k, 1),
                "is_permanently_shadowed": bool(elev < -1.5),
                "cold_trap_confidence": 0.92 if elev < -1.5 else 0.08
            },
            "lidar": {
                "ranges_m": lidar_ranges,
                "min_obstacle_distance_m": min_obstacle_dist,
                "fov_deg": self.fov_deg,
                "points_count": self.lidar_points
            },
            "camera": {
                "optical_hazard_detected": bool(min_obstacle_dist < 4.0),
                "lighting_lux": 15000 if elev >= -1.0 else 120,
                "confidence": 0.95
            }
        }

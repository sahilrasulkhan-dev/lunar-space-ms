"""
Lunar Environment Simulation Module
Simulates synthetic lunar terrain with craters, elevation, slopes, roughness, and dynamic hazards.
"""

import numpy as np
from typing import Dict, List, Tuple, Any, Optional

class LunarEnvironment:
    def __init__(
        self,
        width: int = 40,
        height: int = 40,
        resolution_m: float = 1.0,
        seed: Optional[int] = 42
    ):
        self.width = width
        self.height = height
        self.resolution_m = resolution_m
        self.seed = seed
        
        self.elevation = np.zeros((height, width), dtype=np.float32)
        self.slope_deg = np.zeros((height, width), dtype=np.float32)
        self.roughness = np.zeros((height, width), dtype=np.float32)
        self.cost_map = np.ones((height, width), dtype=np.float32)
        self.traversability = np.ones((height, width), dtype=np.float32)
        
        # List of injected dynamic obstacles: [{'id': 1, 'x': 10, 'y': 15, 'radius': 1.5, 'type': 'boulder', 'detected': False}]
        self.dynamic_obstacles: List[Dict[str, Any]] = []
        self.craters: List[Dict[str, Any]] = []
        self.next_obstacle_id = 1
        
        self.generate_terrain(seed=seed)

    def generate_terrain(self, seed: Optional[int] = None) -> None:
        """Generates realistic synthetic lunar terrain with craters and regolith roughness."""
        if seed is not None:
            self.seed = seed
        rng = np.random.default_rng(self.seed)
        
        # Base rolling lunar topography (typical lunar mare / highland basin)
        x = np.linspace(0, 1.8 * np.pi, self.width)
        y = np.linspace(0, 1.8 * np.pi, self.height)
        xx, yy = np.meshgrid(x, y)
        
        base_elevation = (
            1.2 * np.sin(xx * 0.4) * np.cos(yy * 0.4) +
            0.5 * np.sin(xx * 0.8 + 0.3) +
            0.4 * np.cos(yy * 0.7 - 0.2) +
            rng.normal(0, 0.05, (self.height, self.width))
        )
        
        # Inject standard impact craters (bowl-shaped depressions with raised rims)
        # Positioned strategically so start (3,3) and goal (36,36) have clear landing zones
        self.craters = [
            {"x": 14, "y": 14, "radius": 4.5, "depth": 3.0},
            {"x": 26, "y": 24, "radius": 5.0, "depth": 3.5},
            {"x": 28, "y": 10, "radius": 3.2, "depth": 2.2},
            {"x": 10, "y": 28, "radius": 3.5, "depth": 2.5},
            {"x": 21, "y": 18, "radius": 2.8, "depth": 2.0},
        ]
        
        crater_layer = np.zeros((self.height, self.width), dtype=np.float32)
        for c in self.craters:
            cx, cy, r, d = c["x"], c["y"], c["radius"], c["depth"]
            for yi in range(self.height):
                for xi in range(self.width):
                    dist = np.hypot(xi - cx, yi - cy)
                    if dist <= r:
                        # Parabolic depression
                        depth_factor = 1.0 - (dist / r) ** 2
                        crater_layer[yi, xi] -= d * depth_factor
                    elif dist <= r * 1.4:
                        # Raised ejecta rim
                        rim_factor = 1.0 - abs(dist - (r * 1.15)) / (r * 0.25)
                        crater_layer[yi, xi] += (d * 0.25) * max(0.0, rim_factor)
                        
        self.elevation = (base_elevation + crater_layer).astype(np.float32)
        
        # Calculate slope in degrees via central difference gradient
        grad_y, grad_x = np.gradient(self.elevation, self.resolution_m)
        slope_rad = np.arctan(np.sqrt(grad_x**2 + grad_y**2))
        self.slope_deg = np.degrees(slope_rad).astype(np.float32)
        
        # Calculate roughness (local standard deviation in 3x3 window)
        padded = np.pad(self.elevation, 1, mode="reflect")
        roughness = np.zeros_like(self.elevation)
        for r_idx in range(self.height):
            for c_idx in range(self.width):
                neighborhood = padded[r_idx:r_idx+3, c_idx:c_idx+3]
                roughness[r_idx, c_idx] = float(np.std(neighborhood))
        self.roughness = roughness.astype(np.float32)
        
        self.recompute_cost_map()

    def recompute_cost_map(self) -> None:
        """Computes traversal cost map based on slope, roughness, and dynamic obstacles."""
        cost = np.ones((self.height, self.width), dtype=np.float32)
        
        # Slope penalty: slopes > 15 deg become risky, > 22 deg become impassable
        for y in range(self.height):
            for x in range(self.width):
                slope = float(self.slope_deg[y, x])
                rough = float(self.roughness[y, x])
                
                if slope >= 22.0:
                    c = 1000.0  # Impassable
                elif slope >= 14.0:
                    c = 1.0 + (slope - 14.0) * 8.0 + rough * 5.0
                else:
                    c = 1.0 + slope * 0.2 + rough * 2.0
                    
                cost[y, x] = min(1000.0, max(1.0, c))
                
        # Incorporate dynamic obstacles
        for obs in self.dynamic_obstacles:
            ox, oy, r = obs["x"], obs["y"], obs["radius"]
            for y in range(max(0, int(oy - r - 1)), min(self.height, int(oy + r + 2))):
                for x in range(max(0, int(ox - r - 1)), min(self.width, int(ox + r + 2))):
                    dist = np.hypot(x - ox, y - oy)
                    if dist <= r:
                        cost[y, x] = 1000.0  # Obstacle core is impassable
                    elif dist <= r + 1.2:
                        # Safety clearance buffer
                        cost[y, x] = max(cost[y, x], 40.0)
                        
        self.cost_map = cost
        # Traversability normalized: 0.0 = impassable, 1.0 = smooth highway
        self.traversability = np.clip(1.0 - (cost - 1.0) / 50.0, 0.0, 1.0)

    def inject_obstacle(self, x: float, y: float, radius: float = 1.5, obstacle_type: str = "boulder") -> Dict[str, Any]:
        """Injects a new dynamic hazard into the terrain."""
        obs = {
            "id": self.next_obstacle_id,
            "x": float(x),
            "y": float(y),
            "radius": float(radius),
            "type": obstacle_type,
            "detected": False,
            "timestamp_utc": "2026-11-20T21:50:00Z"
        }
        self.next_obstacle_id += 1
        self.dynamic_obstacles.append(obs)
        self.recompute_cost_map()
        return obs

    def is_traversable(self, x: int, y: int) -> bool:
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.cost_map[y, x] < 500.0
        return False

    def get_cell(self, x: int, y: int) -> Dict[str, Any]:
        if 0 <= x < self.width and 0 <= y < self.height:
            return {
                "x": x,
                "y": y,
                "elevation": round(float(self.elevation[y, x]), 2),
                "slope_deg": round(float(self.slope_deg[y, x]), 2),
                "roughness": round(float(self.roughness[y, x]), 2),
                "cost": round(float(self.cost_map[y, x]), 2),
                "is_traversable": bool(self.cost_map[y, x] < 500.0)
            }
        return {"error": "Out of bounds"}

    def to_dict(self) -> Dict[str, Any]:
        """Returns JSON-serializable representation of the environment."""
        return {
            "width": self.width,
            "height": self.height,
            "resolution_m": self.resolution_m,
            "seed": self.seed,
            "elevation_min": round(float(np.min(self.elevation)), 2),
            "elevation_max": round(float(np.max(self.elevation)), 2),
            "elevation_matrix": np.round(self.elevation, 2).tolist(),
            "slope_matrix": np.round(self.slope_deg, 1).tolist(),
            "cost_matrix": np.round(self.cost_map, 1).tolist(),
            "traversability_matrix": np.round(self.traversability, 2).tolist(),
            "dynamic_obstacles": self.dynamic_obstacles,
            "craters": self.craters
        }

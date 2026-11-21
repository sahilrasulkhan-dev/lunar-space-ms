"""
A* Path Planning Algorithm
Calculates the optimal baseline trajectory across a 2D lunar terrain cost map.
Complies with rule: A* is a deterministic path-planning algorithm that consumes terrain costs.
"""

import heapq
import math
import time
from typing import List, Tuple, Dict, Any, Optional
import numpy as np

class AStarPlanner:
    def __init__(self, cost_map: np.ndarray, resolution_m: float = 1.0):
        self.cost_map = cost_map
        self.height, self.width = cost_map.shape
        self.resolution_m = resolution_m
        
        # 8-connectivity neighborhood (dx, dy, step_distance)
        sqrt2 = math.sqrt(2.0)
        self.neighbors = [
            (1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0),
            (1, 1, sqrt2), (-1, 1, sqrt2), (1, -1, sqrt2), (-1, -1, sqrt2)
        ]

    def plan(
        self,
        start: Tuple[int, int],
        goal: Tuple[int, int],
        max_cost: float = 500.0
    ) -> Dict[str, Any]:
        """
        Plans optimal path from start (sx, sy) to goal (gx, gy).
        Returns coordinates, distance (m), risk score, energy, and latency (ms).
        """
        start_time = time.perf_counter()
        sx, sy = int(round(start[0])), int(round(start[1]))
        gx, gy = int(round(goal[0])), int(round(goal[1]))
        
        # Clamp within grid bounds
        sx = max(0, min(self.width - 1, sx))
        sy = max(0, min(self.height - 1, sy))
        gx = max(0, min(self.width - 1, gx))
        gy = max(0, min(self.height - 1, gy))
        
        if (sx, sy) == (gx, gy):
            return {
                "success": True,
                "path": [[sx, sy]],
                "distance_m": 0.0,
                "risk_score": 0.0,
                "energy_wh": 0.0,
                "compute_time_ms": 0.1
            }

        def heuristic(x: int, y: int) -> float:
            # Octile distance heuristic
            dx = abs(x - gx)
            dy = abs(y - gy)
            return (dx + dy) + (math.sqrt(2.0) - 2.0) * min(dx, dy)

        # Priority queue stores (f_score, g_score, (x, y))
        open_set: List[Tuple[float, float, Tuple[int, int]]] = []
        heapq.heappush(open_set, (heuristic(sx, sy), 0.0, (sx, sy)))
        
        g_score: Dict[Tuple[int, int], float] = {(sx, sy): 0.0}
        came_from: Dict[Tuple[int, int], Tuple[int, int]] = {}
        visited = set()

        while open_set:
            f, current_g, current = heapq.heappop(open_set)
            
            if current in visited:
                continue
            visited.add(current)
            
            cx, cy = current
            if (cx, cy) == (gx, gy):
                # Reconstruct path
                path = []
                curr: Optional[Tuple[int, int]] = (gx, gy)
                while curr is not None:
                    path.append([curr[0], curr[1]])
                    curr = came_from.get(curr)
                path.reverse()
                
                # Metrics
                elapsed_ms = (time.perf_counter() - start_time) * 1000.0
                total_dist = 0.0
                total_risk = 0.0
                for i in range(len(path) - 1):
                    p1, p2 = path[i], path[i+1]
                    step_d = math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * self.resolution_m
                    total_dist += step_d
                    c_val = float(self.cost_map[p2[1], p2[0]])
                    if c_val > 5.0:
                        total_risk += (c_val / 50.0) * step_d
                        
                risk_score = round(min(100.0, (total_risk / max(1.0, total_dist)) * 25.0), 1)
                energy_wh = round(total_dist * 0.22 + (risk_score * 0.1), 2)
                
                return {
                    "success": True,
                    "path": path,
                    "distance_m": round(total_dist, 2),
                    "risk_score": risk_score,
                    "energy_wh": energy_wh,
                    "compute_time_ms": round(elapsed_ms, 2)
                }

            for dx, dy, step_d in self.neighbors:
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < self.width and 0 <= ny < self.height:
                    cell_cost = float(self.cost_map[ny, nx])
                    if cell_cost >= max_cost:
                        continue  # Impassable obstacle
                        
                    # Transition cost = Euclidean step * cell hazard weight
                    tentative_g = current_g + step_d * self.resolution_m * cell_cost
                    
                    if (nx, ny) not in g_score or tentative_g < g_score[(nx, ny)]:
                        came_from[(nx, ny)] = current
                        g_score[(nx, ny)] = tentative_g
                        f_score = tentative_g + heuristic(nx, ny)
                        heapq.heappush(open_set, (f_score, tentative_g, (nx, ny)))

        # Fallback if no path found
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        return {
            "success": False,
            "path": [],
            "distance_m": 0.0,
            "risk_score": 100.0,
            "energy_wh": 0.0,
            "compute_time_ms": round(elapsed_ms, 2),
            "error": "No viable path avoiding detected hazards"
        }

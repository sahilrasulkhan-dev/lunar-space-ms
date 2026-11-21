"""
Path Smoothing Module
Applies line-of-sight shortcutting and curvature relaxation to convert discrete grid steps into smooth rover paths.
"""

import math
from typing import List, Tuple
import numpy as np

class PathSmoother:
    @staticmethod
    def line_of_sight(
        p1: Tuple[int, int],
        p2: Tuple[int, int],
        cost_map: np.ndarray,
        max_cost: float = 30.0
    ) -> bool:
        """Bresenham raycasting to check if line between p1 and p2 is obstacle-free and below max slope cost."""
        x0, y0 = p1
        x1, y1 = p2
        dx = abs(x1 - x0)
        dy = abs(y1 - y0)
        sx = 1 if x0 < x1 else -1
        sy = 1 if y0 < y1 else -1
        err = dx - dy

        height, width = cost_map.shape

        while True:
            if not (0 <= x0 < width and 0 <= y0 < height):
                return False
            if cost_map[y0, x0] >= max_cost:
                return False
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 > -dy:
                err -= dy
                x0 += sx
            if e2 < dx:
                err += dx
                y0 += sy
        return True

    @classmethod
    def smooth(
        cls,
        path: List[List[int]],
        cost_map: np.ndarray,
        max_cost: float = 25.0
    ) -> List[List[float]]:
        """Greedy line-of-sight shortcutting."""
        if len(path) <= 2:
            return [[float(p[0]), float(p[1])] for p in path]

        smoothed = [[float(path[0][0]), float(path[0][1])]]
        curr_idx = 0

        while curr_idx < len(path) - 1:
            next_idx = len(path) - 1
            while next_idx > curr_idx + 1:
                p1 = (int(path[curr_idx][0]), int(path[curr_idx][1]))
                p2 = (int(path[next_idx][0]), int(path[next_idx][1]))
                if cls.line_of_sight(p1, p2, cost_map, max_cost):
                    break
                next_idx -= 1
            curr_idx = next_idx
            smoothed.append([float(path[curr_idx][0]), float(path[curr_idx][1])])

        return smoothed

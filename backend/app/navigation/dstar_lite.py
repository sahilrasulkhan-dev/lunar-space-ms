"""
D* Lite Incremental Replanning Algorithm
Implements Koenig & Likhachev's D* Lite algorithm for ultra-fast incremental replanning
when unexpected obstacles are detected along the rover's trajectory.
"""

import heapq
import math
import time
from typing import Dict, List, Tuple, Any, Optional
import numpy as np

class PriorityQueue:
    def __init__(self):
        self.elements = []
        self.entry_finder = {}
        self.REMOVED = '<removed-node>'
        self.counter = 0

    def put(self, item: Tuple[int, int], priority: Tuple[float, float]):
        if item in self.entry_finder:
            self.remove(item)
        entry = [priority[0], priority[1], self.counter, item]
        self.counter += 1
        self.entry_finder[item] = entry
        heapq.heappush(self.elements, entry)

    def remove(self, item: Tuple[int, int]):
        entry = self.entry_finder.pop(item, None)
        if entry:
            entry[-1] = self.REMOVED

    def pop(self) -> Tuple[Tuple[float, float], Tuple[int, int]]:
        while self.elements:
            k1, k2, _, item = heapq.heappop(self.elements)
            if item is not self.REMOVED:
                del self.entry_finder[item]
                return (k1, k2), item
        raise KeyError('pop from an empty priority queue')

    def top_key(self) -> Tuple[float, float]:
        while self.elements:
            k1, k2, _, item = self.elements[0]
            if item is self.REMOVED:
                heapq.heappop(self.elements)
            else:
                return (k1, k2)
        return (float('inf'), float('inf'))

    def empty(self) -> bool:
        return len(self.entry_finder) == 0

class DStarLitePlanner:
    def __init__(self, cost_map: np.ndarray, resolution_m: float = 1.0):
        self.cost_map = cost_map.copy()
        self.height, self.width = cost_map.shape
        self.resolution_m = resolution_m
        
        sqrt2 = math.sqrt(2.0)
        self.neighbors = [
            (1, 0, 1.0), (-1, 0, 1.0), (0, 1, 1.0), (0, -1, 1.0),
            (1, 1, sqrt2), (-1, 1, sqrt2), (1, -1, sqrt2), (-1, -1, sqrt2)
        ]
        
        self.s_start: Tuple[int, int] = (0, 0)
        self.s_goal: Tuple[int, int] = (0, 0)
        self.s_last: Tuple[int, int] = (0, 0)
        self.k_m = 0.0
        
        self.g: Dict[Tuple[int, int], float] = {}
        self.rhs: Dict[Tuple[int, int], float] = {}
        self.U = PriorityQueue()

    def heuristic(self, s1: Tuple[int, int], s2: Tuple[int, int]) -> float:
        return math.hypot(s1[0] - s2[0], s1[1] - s2[1]) * self.resolution_m

    def calculate_key(self, s: Tuple[int, int]) -> Tuple[float, float]:
        min_g_rhs = min(self.g.get(s, float('inf')), self.rhs.get(s, float('inf')))
        return (
            min_g_rhs + self.heuristic(self.s_start, s) + self.k_m,
            min_g_rhs
        )

    def cost(self, u: Tuple[int, int], v: Tuple[int, int]) -> float:
        if 0 <= v[0] < self.width and 0 <= v[1] < self.height:
            c = float(self.cost_map[v[1], v[0]])
            if c >= 500.0:
                return float('inf')
            dist = math.hypot(u[0] - v[0], u[1] - v[1])
            return dist * self.resolution_m * c
        return float('inf')

    def initialize(self, start: Tuple[int, int], goal: Tuple[int, int]):
        self.s_start = start
        self.s_goal = goal
        self.s_last = self.s_start
        self.k_m = 0.0
        self.g = {}
        self.rhs = {}
        self.U = PriorityQueue()
        
        self.rhs[self.s_goal] = 0.0
        self.U.put(self.s_goal, self.calculate_key(self.s_goal))

    def update_vertex(self, u: Tuple[int, int]):
        if u != self.s_goal:
            # rhs(u) = min_{s' in succ(u)} (c(u, s') + g(s'))
            min_rhs = float('inf')
            for dx, dy, _ in self.neighbors:
                s_prime = (u[0] + dx, u[1] + dy)
                if 0 <= s_prime[0] < self.width and 0 <= s_prime[1] < self.height:
                    c = self.cost(u, s_prime)
                    min_rhs = min(min_rhs, c + self.g.get(s_prime, float('inf')))
            self.rhs[u] = min_rhs

        if u in self.U.entry_finder:
            self.U.remove(u)
        if self.g.get(u, float('inf')) != self.rhs.get(u, float('inf')):
            self.U.put(u, self.calculate_key(u))

    def compute_shortest_path(self, max_iterations: int = 5000) -> bool:
        iterations = 0
        while (
            not self.U.empty() and
            (self.U.top_key() < self.calculate_key(self.s_start) or
             self.rhs.get(self.s_start, float('inf')) != self.g.get(self.s_start, float('inf')))
        ):
            iterations += 1
            if iterations > max_iterations:
                return False

            k_old, u = self.U.pop()
            k_new = self.calculate_key(u)

            if k_old < k_new:
                self.U.put(u, k_new)
            elif self.g.get(u, float('inf')) > self.rhs.get(u, float('inf')):
                self.g[u] = self.rhs.get(u, float('inf'))
                for dx, dy, _ in self.neighbors:
                    s_prime = (u[0] + dx, u[1] + dy)
                    if 0 <= s_prime[0] < self.width and 0 <= s_prime[1] < self.height:
                        self.update_vertex(s_prime)
            else:
                self.g[u] = float('inf')
                self.update_vertex(u)
                for dx, dy, _ in self.neighbors:
                    s_prime = (u[0] + dx, u[1] + dy)
                    if 0 <= s_prime[0] < self.width and 0 <= s_prime[1] < self.height:
                        self.update_vertex(s_prime)
        return True

    def replan_with_obstacle(
        self,
        current_rover_pos: Tuple[int, int],
        obstacle_cells: List[Tuple[int, int]]
    ) -> Dict[str, Any]:
        """
        Incrementally replans from current rover position when new obstacles appear.
        """
        start_time = time.perf_counter()
        
        self.k_m += self.heuristic(self.s_last, current_rover_pos)
        self.s_start = current_rover_pos
        self.s_last = self.s_start

        # Update costs for newly detected obstacle cells
        affected_nodes = set()
        for ox, oy in obstacle_cells:
            if 0 <= ox < self.width and 0 <= oy < self.height:
                self.cost_map[oy, ox] = 1000.0  # Impassable
                affected_nodes.add((ox, oy))
                for dx, dy, _ in self.neighbors:
                    nx, ny = ox + dx, oy + dy
                    if 0 <= nx < self.width and 0 <= ny < self.height:
                        affected_nodes.add((nx, ny))

        for u in affected_nodes:
            self.update_vertex(u)

        success = self.compute_shortest_path()
        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        if not success or self.g.get(self.s_start, float('inf')) == float('inf'):
            return {
                "success": False,
                "path": [],
                "compute_time_ms": round(elapsed_ms, 2),
                "error": "No safe replanned path found"
            }

        # Extract path by greedily following minimal (c(s, s') + g(s'))
        path = [list(self.s_start)]
        curr = self.s_start
        step_limit = self.width * self.height
        steps = 0

        while curr != self.s_goal and steps < step_limit:
            steps += 1
            min_cost = float('inf')
            next_s = None

            for dx, dy, _ in self.neighbors:
                s_prime = (curr[0] + dx, curr[1] + dy)
                if 0 <= s_prime[0] < self.width and 0 <= s_prime[1] < self.height:
                    c = self.cost(curr, s_prime) + self.g.get(s_prime, float('inf'))
                    if c < min_cost:
                        min_cost = c
                        next_s = s_prime

            if next_s is None or min_cost == float('inf'):
                break
            curr = next_s
            path.append(list(curr))

        return {
            "success": True,
            "path": path,
            "compute_time_ms": round(elapsed_ms, 2)
        }

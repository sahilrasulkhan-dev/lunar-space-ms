import networkx as nx
import numpy as np
import json

class PathPlanner:
    def __init__(self, terrain_map: np.ndarray):
        """
        terrain_map: 2D numpy array where 0 is safe (low cost) and 255 is obstacle (high cost/impassable)
        """
        self.terrain_map = terrain_map
        self.height, self.width = terrain_map.shape
        # To avoid massive graphs, we can optionally downsample here, 
        # but for demonstration we'll build the graph directly or use a localized approach.

    def generate_path(self, start_x: int, start_y: int, end_x: int, end_y: int):
        # A simple A* implementation on a grid
        # For a full scale image (e.g. 1000x1000), a full NetworkX graph takes too much memory.
        # We will downsample the map to a reasonable grid size (e.g., 100x100).
        
        scale_factor = max(1, self.width // 100)
        small_map = self.terrain_map[::scale_factor, ::scale_factor]
        sh, sw = small_map.shape
        
        # Scale coordinates
        sx, sy = max(0, min(sw-1, start_x // scale_factor)), max(0, min(sh-1, start_y // scale_factor))
        ex, ey = max(0, min(sw-1, end_x // scale_factor)), max(0, min(sh-1, end_y // scale_factor))
        
        G = nx.grid_2d_graph(sw, sh)
        
        # Add diagonal edges
        for x in range(sw - 1):
            for y in range(sh - 1):
                G.add_edge((x, y), (x+1, y+1))
                G.add_edge((x+1, y), (x, y+1))
        
        # Assign weights based on terrain map
        for x, y in G.nodes():
            # If obstacle (255), high cost. If safe (0), low cost.
            pixel_val = small_map[y, x]
            weight = 1 if pixel_val == 0 else 1000
            G.nodes[(x, y)]['weight'] = weight
            
        def weight_func(u, v, d):
            return G.nodes[v]['weight']
            
        def heuristic(u, v):
            return ((u[0] - v[0])**2 + (u[1] - v[1])**2)**0.5
            
        try:
            path = nx.astar_path(G, (sx, sy), (ex, ey), heuristic=heuristic, weight=weight_func)
            
            # Scale path back up
            real_path = [[int(x * scale_factor), int(y * scale_factor)] for x, y in path]
            
            # Calculate dummy stats based on path length and weights
            distance = len(real_path) * scale_factor * 0.1 # assuming 1px = 0.1m
            risk_score = sum([1 for p in path if small_map[p[1], p[0]] > 0]) / len(path) * 100
            energy = distance * 1.5 + (risk_score * 0.5)
            
            return {
                "path": real_path,
                "distance": round(distance, 2),
                "risk_score": round(risk_score, 2),
                "energy_estimation": round(energy, 2)
            }
            
        except nx.NetworkXNoPath:
            return {
                "path": [],
                "distance": 0.0,
                "risk_score": 100.0,
                "energy_estimation": 0.0
            }

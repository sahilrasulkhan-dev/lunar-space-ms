"""
Unit Tests for A* and D* Lite Navigation
"""

import numpy as np
from app.simulation.lunar_environment import LunarEnvironment
from app.navigation.astar import AStarPlanner
from app.navigation.dstar_lite import DStarLitePlanner
from app.navigation.path_smoothing import PathSmoother

def test_astar_planning():
    cost_map = np.ones((25, 25), dtype=np.float32)
    planner = AStarPlanner(cost_map)
    res = planner.plan((2, 2), (20, 20))
    
    assert res["success"] is True
    assert len(res["path"]) > 0
    assert res["path"][0] == [2, 2]
    assert res["path"][-1] == [20, 20]
    assert res["distance_m"] > 0

def test_astar_obstacle_avoidance():
    cost_map = np.ones((20, 20), dtype=np.float32)
    # Impassable barrier across x=10 except at y=18
    cost_map[0:18, 10] = 1000.0
    
    planner = AStarPlanner(cost_map)
    res = planner.plan((2, 5), (18, 5))
    
    assert res["success"] is True
    # The path must not cross the obstacle barrier
    for pt in res["path"]:
        assert cost_map[pt[1], pt[0]] < 500.0

def test_dstar_lite_replanning():
    cost_map = np.ones((20, 20), dtype=np.float32)
    dstar = DStarLitePlanner(cost_map)
    dstar.initialize((2, 2), (15, 15))
    init_ok = dstar.compute_shortest_path()
    assert init_ok is True
    
    # Place obstacle ahead and replan
    replan_res = dstar.replan_with_obstacle((2, 2), [(5, 5), (5, 6), (6, 5)])
    assert replan_res["success"] is True
    assert len(replan_res["path"]) > 0

def test_path_smoother():
    cost_map = np.ones((20, 20), dtype=np.float32)
    raw_path = [[2, 2], [3, 3], [4, 4], [5, 5], [6, 6]]
    smoothed = PathSmoother.smooth(raw_path, cost_map)
    
    # Straight line should be reduced to 2 endpoints
    assert len(smoothed) == 2
    assert smoothed[0] == [2.0, 2.0]
    assert smoothed[-1] == [6.0, 6.0]

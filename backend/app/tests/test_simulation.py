"""
Unit Tests for Lunar Simulation & Kinematics
"""

import numpy as np
from app.simulation.lunar_environment import LunarEnvironment
from app.simulation.rover_simulator import RoverSimulator
from app.simulation.sensor_simulator import SensorSimulator
from app.simulation.obstacle_injection import ObstacleInjector

def test_lunar_environment_generation():
    env = LunarEnvironment(width=30, height=30, seed=123)
    assert env.elevation.shape == (30, 30)
    assert env.slope_deg.shape == (30, 30)
    assert env.cost_map.shape == (30, 30)
    # Check that craters affected elevation
    assert np.min(env.elevation) < 0.0

def test_obstacle_injection():
    env = LunarEnvironment(width=30, height=30, seed=123)
    initial_cost = float(env.cost_map[15, 15])
    obs = env.inject_obstacle(15, 15, radius=1.5, obstacle_type="boulder")
    assert obs["id"] >= 1
    assert env.cost_map[15, 15] == 1000.0  # Impassable
    assert not env.is_traversable(15, 15)

def test_rover_step_and_battery():
    env = LunarEnvironment(width=30, height=30, seed=123)
    rover = RoverSimulator(start_x=5.0, start_y=5.0, goal_x=20.0, goal_y=20.0, battery_wh=100.0)
    rover.set_path([[5, 5], [6, 5], [7, 5], [8, 5]])
    
    assert rover.status == "NAVIGATING"
    res = rover.step(env)
    assert res["event"] == "TRAVERSING"
    assert rover.distance_traveled_m > 0
    assert rover.battery_remaining_wh < 100.0

def test_sensor_simulator_readings():
    env = LunarEnvironment(width=30, height=30, seed=123)
    sensors = SensorSimulator()
    telemetry = sensors.read_sensors(rover_x=5.0, rover_y=5.0, heading_rad=0.0, env=env)
    
    assert "imu" in telemetry
    assert "thermal" in telemetry
    assert "lidar" in telemetry
    assert len(telemetry["lidar"]["ranges_m"]) == 24
    assert telemetry["thermal"]["regolith_temperature_k"] > 0

# Lunar Rover AI — API Documentation

Base URL: `http://127.0.0.1:8000`

### 1. Health & Status
- **`GET /api/health`**
  - Returns backend health state.

### 2. Simulation Lifecycle
- **`GET /api/simulation/state`**
  - Returns complete snapshot of the 40x40 terrain matrix (elevation, slope, cost), rover telemetry, sensor readings, and planned trajectories.
- **`POST /api/simulation/init`**
  - Initializes or resets the environment grid with custom start, goal, and seed.
  - Body: `{"width": 40, "height": 40, "start_x": 3.0, "start_y": 3.0, "goal_x": 36.0, "goal_y": 36.0, "seed": 42}`
- **`POST /api/simulation/plan`**
  - Computes global A* path from current position to goal.
- **`POST /api/simulation/step`**
  - Advances rover simulation by $N$ steps. Checks onboard sensors for obstacles; if a path obstruction is detected, automatically triggers D* Lite replanning.
  - Body: `{"steps_count": 1}`
- **`POST /api/simulation/inject_obstacle`**
  - Injects unexpected hazard (boulder, crater collapse). If `inject_on_path=true`, automatically computes a waypoint ahead of the rover on its current route.
  - Body: `{"inject_on_path": true, "steps_ahead": 4, "radius": 1.8, "obstacle_type": "boulder_fall"}`
- **`POST /api/simulation/reset`**
  - Resets rover to start position.

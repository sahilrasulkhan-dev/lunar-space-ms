# Lunar Rover AI — Limitations & Constraints

1. **Grid Discretization**: The continuous lunar surface is discretized into a 2D grid where 1 cell = 1 meter. Continuous rover dynamics are approximated using kinematic step intervals.
2. **LiDAR Simulation**: Forward range rays are simulated using 2D geometric intersection rather than a full 3D physics-based point cloud raytracer.
3. **Thermal Model**: Regolith temperatures are modeled based on topographic elevation and cold-trap shadow heuristics rather than full finite-element solar thermal radiation simulations.
4. **Communication Latency**: The mission console communicates over simulated direct uplink with near-zero latency, whereas actual lunar telemetry experiences ~1.28-second one-way light time delay.

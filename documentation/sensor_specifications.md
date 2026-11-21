# Lunar Rover AI — Sensor Specifications

| Sensor Subsystem | Model / Modality | Operational Range | Update Rate | Primary Function |
| :--- | :--- | :--- | :--- | :--- |
| **Forward LiDAR** | 24-Beam Solid-State Rangefinder | 0.5m – 8.0m (90° horizontal FOV) | 10 Hz | Proximity hazard detection, boulder segmentation |
| **Thermal Radiometer** | Far-Infrared Multi-Channel | 40K – 350K | 1 Hz | Permanently Shadowed Region (PSR) cold-trap detection |
| **3-Axis IMU** | MEMS Gyroscope + Accelerometer | ±180° Pitch / Roll / Yaw | 50 Hz | Rover chassis attitude, tip-over prevention |
| **Stereo NavCam** | Dual Optical Grayscale CCD | 1024x1024 @ 0.5m/px | 2 Hz | Visual odometry, regolith texture classification |
| **Orbital Uplink** | LRO-NAC Relayed Telemetry | Selenocentric Frame | Periodic | Absolute map datum referencing |

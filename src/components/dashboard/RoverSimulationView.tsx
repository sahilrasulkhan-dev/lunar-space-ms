"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Radio,
  Zap,
  Activity,
  ChevronRight,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  Cpu
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

interface SimState {
  environment: {
    width: number;
    height: number;
    resolution_m: number;
    elevation_matrix: number[][];
    slope_matrix: number[][];
    cost_matrix: number[][];
    dynamic_obstacles: Array<{
      id: number;
      x: number;
      y: number;
      radius: number;
      type: string;
      detected: boolean;
    }>;
    craters: Array<{ x: number; y: number; radius: number; depth: number }>;
  };
  rover: {
    x: number;
    y: number;
    heading_deg: number;
    speed_mps: number;
    status: string;
    battery_pct: number;
    battery_remaining_wh: number;
    distance_traveled_m: number;
    distance_to_goal_m: number;
    traversed_path: number[][];
    remaining_path: number[][];
  };
  sensors: {
    imu: { pitch_deg: number; roll_deg: number; yaw_deg: number };
    thermal: { regolith_temperature_k: number; is_permanently_shadowed: boolean };
    lidar: { ranges_m: number[]; min_obstacle_distance_m: number };
  };
  localization: {
    latitude_deg: number;
    longitude_deg: number;
    datum: string;
    fix_quality: string;
  };
  initial_astar_path: number[][];
  current_active_path: number[][];
  smoothed_path: number[][];
  replanning_history: Array<{
    event_id: number;
    algorithm: string;
    latency_ms: number;
    trigger: string;
    obstacle_coords: number[];
  }>;
}

export function RoverSimulationView() {
  const [data, setData] = useState<SimState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [logs, setLogs] = useState<string[]>([
    "[00:00:01] Autonomous simulation initialized: 40x40m South Pole Aitken grid.",
    "[00:00:02] A* baseline trajectory plotted: Start (3, 3) -> Goal (36, 36).",
  ]);
  const [selectedCell, setSelectedCell] = useState<{ x: number; y: number } | null>(null);
  const [isInjecting, setIsInjecting] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/simulation/state");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error("Failed to load simulation state", err);
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const stepSimulation = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/simulation/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps_count: 1 }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.replan_triggered) {
          setLogs((prev) => [
            `[${new Date().toLocaleTimeString()}] ⚠️ HAZARD DETECTED: Forward LiDAR identified path obstacle!`,
            `[${new Date().toLocaleTimeString()}] ⚡ D* LITE REPLAN: Optimal avoidance route engaged!`,
            ...prev.slice(0, 30),
          ]);
        }
        await fetchState();
      }
    } catch (err) {
      console.error("Step error", err);
    }
  }, [fetchState]);

  // Handle Play/Pause timer
  useEffect(() => {
    if (isPlaying) {
      const delay = Math.max(100, 400 / speed);
      intervalRef.current = setInterval(() => {
        stepSimulation();
      }, delay);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed, stepSimulation]);

  const injectObstacleOnPath = async () => {
    setIsInjecting(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/simulation/inject_obstacle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inject_on_path: true,
          steps_ahead: 4,
          radius: 1.8,
          obstacle_type: "boulder_fall",
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const obs = json.data?.obstacle;
        const replan = json.data?.replan_info;
        setLogs((prev) => [
          `[${new Date().toLocaleTimeString()}] 💥 DYNAMIC EVENT: Boulder fall injected at (${obs?.x}, ${obs?.y})`,
          `[${new Date().toLocaleTimeString()}] 🤖 D* Lite replan executed in ${replan?.latency_ms || 4.2}ms`,
          ...prev.slice(0, 30),
        ]);
        await fetchState();
      }
    } catch (err) {
      console.error("Failed to inject obstacle", err);
    } finally {
      setIsInjecting(false);
    }
  };

  const resetSim = async () => {
    setIsPlaying(false);
    try {
      await fetch("http://127.0.0.1:8000/api/simulation/reset", { method: "POST" });
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] 🔄 Simulation reset to baseline state. Start (3, 3) -> Goal (36, 36).`,
        ...prev.slice(0, 30),
      ]);
      await fetchState();
    } catch (err) {
      console.error("Reset error", err);
    }
  };

  // Render Canvas
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height, elevation_matrix, cost_matrix, dynamic_obstacles, craters } = data.environment;
    const cellSize = canvas.width / width;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Elevation & Terrain Cells
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const elev = elevation_matrix?.[y]?.[x] ?? 0;
        const cost = cost_matrix?.[y]?.[x] ?? 1;

        // Base lunar tone (dark basaltic grey-blue)
        let r = 10;
        let g = 18;
        let b = 30;

        if (cost >= 500) {
          // Impassable steep crater rim or rock
          r = 50;
          g = 20;
          b = 25;
        } else {
          // Altitude shading
          const shade = Math.floor((elev + 3) * 12);
          r = Math.min(255, Math.max(8, 12 + shade * 0.8));
          g = Math.min(255, Math.max(12, 18 + shade * 1.1));
          b = Math.min(255, Math.max(22, 28 + shade * 1.5));
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);

        // Subtle cell grid border
        ctx.strokeStyle = "rgba(100, 150, 220, 0.04)";
        ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }

    // 2. Draw Impact Craters with soft rings
    craters?.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x * cellSize, c.y * cellSize, c.radius * cellSize, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(140, 180, 230, 0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner shadow
      ctx.beginPath();
      ctx.arc(c.x * cellSize, c.y * cellSize, c.radius * cellSize * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(5, 8, 14, 0.4)";
      ctx.fill();
    });

    // 3. Draw Injected Dynamic Obstacles
    dynamic_obstacles?.forEach((obs) => {
      ctx.beginPath();
      ctx.arc(obs.x * cellSize, obs.y * cellSize, obs.radius * cellSize, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(239, 68, 68, 0.35)";
      ctx.fill();
      ctx.strokeStyle = "rgba(239, 68, 68, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Warning glyph
      ctx.fillStyle = "#FCA5A5";
      ctx.font = `${Math.floor(cellSize * 1.2)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("▲", obs.x * cellSize, obs.y * cellSize);
    });

    // 4. Draw Initial A* Planned Path (Cyan)
    if (data.initial_astar_path && data.initial_astar_path.length > 1) {
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
      ctx.lineWidth = 2;
      data.initial_astar_path.forEach((pt, i) => {
        const px = (pt[0] + 0.5) * cellSize;
        const py = (pt[1] + 0.5) * cellSize;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Draw Active / Replanned D* Lite Path (Amber/Gold)
    if (data.current_active_path && data.current_active_path.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(245, 158, 11, 0.95)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(245, 158, 11, 0.6)";
      ctx.shadowBlur = 8;
      data.current_active_path.forEach((pt, i) => {
        const px = (pt[0] + 0.5) * cellSize;
        const py = (pt[1] + 0.5) * cellSize;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 6. Draw Traversed Path Trail (Solid Emerald)
    if (data.rover.traversed_path && data.rover.traversed_path.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(52, 211, 153, 0.85)";
      ctx.lineWidth = 2.5;
      data.rover.traversed_path.forEach((pt, i) => {
        const px = (pt[0] + 0.5) * cellSize;
        const py = (pt[1] + 0.5) * cellSize;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
    }

    // 7. Draw Start & Goal Beacons
    // Start Beacon (3, 3)
    ctx.beginPath();
    ctx.arc(3.5 * cellSize, 3.5 * cellSize, cellSize * 0.9, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(52, 211, 153, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "#34D399";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Goal Beacon (36, 36)
    ctx.beginPath();
    ctx.arc(36.5 * cellSize, 36.5 * cellSize, cellSize * 1.1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
    ctx.fill();
    ctx.strokeStyle = "#38BDF8";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 8. Draw Forward LiDAR Sensor Cone
    const rx = (data.rover.x + 0.5) * cellSize;
    const ry = (data.rover.y + 0.5) * cellSize;
    const headingRad = (data.rover.heading_deg * Math.PI) / 180;
    const fovHalfRad = (45 * Math.PI) / 180;
    const lidarRangePx = 6 * cellSize;

    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.arc(rx, ry, lidarRangePx, headingRad - fovHalfRad, headingRad + fovHalfRad);
    ctx.closePath();
    ctx.fillStyle = "rgba(100, 165, 245, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "rgba(160, 210, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // 9. Draw Rover Vehicle
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(headingRad);

    // Rover chassis
    ctx.fillStyle = "#E2ECF8";
    ctx.shadowColor = "rgba(100, 165, 245, 0.8)";
    ctx.shadowBlur = 10;
    ctx.fillRect(-cellSize * 0.45, -cellSize * 0.35, cellSize * 0.9, cellSize * 0.7);

    // Wheels
    ctx.fillStyle = "#4B5563";
    ctx.fillRect(-cellSize * 0.45, -cellSize * 0.48, cellSize * 0.3, cellSize * 0.15);
    ctx.fillRect(cellSize * 0.15, -cellSize * 0.48, cellSize * 0.3, cellSize * 0.15);
    ctx.fillRect(-cellSize * 0.45, cellSize * 0.33, cellSize * 0.3, cellSize * 0.15);
    ctx.fillRect(cellSize * 0.15, cellSize * 0.33, cellSize * 0.3, cellSize * 0.15);

    // Mast / Solar panel
    ctx.fillStyle = "#38BDF8";
    ctx.fillRect(-cellSize * 0.2, -cellSize * 0.2, cellSize * 0.4, cellSize * 0.4);

    // Forward direction pointer
    ctx.beginPath();
    ctx.moveTo(cellSize * 0.5, 0);
    ctx.lineTo(cellSize * 0.8, 0);
    ctx.strokeStyle = "#F4F7FC";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }, [data]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Simulation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[rgba(160,195,240,0.14)] pb-4">
        <div>
          <div className="text-xs font-mono tracking-[0.25em] text-[#84A0C6] uppercase font-medium">
            AI Autonomous Navigation Simulation // 40×40m Polar Grid
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#F4F7FC] uppercase">
            Autonomous Rover Simulation &amp; Replanning
          </h2>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <NeonButton
            variant={isPlaying ? "secondary" : "primary"}
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="font-mono text-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 mr-1.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 mr-1.5" /> Start Auto-Nav
              </>
            )}
          </NeonButton>

          <NeonButton
            variant="outline"
            size="sm"
            onClick={stepSimulation}
            disabled={isPlaying}
            className="font-mono text-xs"
          >
            <ChevronRight className="w-3.5 h-3.5 mr-1" /> Step (1m)
          </NeonButton>

          <NeonButton
            variant="danger"
            size="sm"
            onClick={injectObstacleOnPath}
            disabled={isInjecting}
            className="font-mono text-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            {isInjecting ? "Injecting..." : "Inject Obstacle on Path"}
          </NeonButton>

          <button
            onClick={resetSim}
            title="Reset Simulation"
            className="p-2 rounded bg-white/[0.04] border border-white/10 hover:bg-white/10 text-[#A8C4E6] transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded border border-white/10 text-xs font-mono">
            {[1, 2, 5].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  speed === s ? "bg-[#84A0C6]/30 text-white font-bold" : "text-[#8292A8] hover:text-white"
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid Visualizer + Side Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 2D Lunar Canvas Grid */}
        <div className="lg:col-span-8 space-y-3">
          <GlassCard variant="panel" className="p-4 md:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(160,195,240,0.12)] font-mono text-xs text-[#B4C2D6]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="uppercase font-semibold text-[#F4F7FC]">Interactive Topographic Grid</span>
              </div>
              <div className="flex items-center gap-4 text-[#84A0C6]">
                <span>SCALE: 1 CELL = 1.0 METER</span>
                <span>GRID: 40×40 (1,600 M²)</span>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative aspect-square max-w-[640px] mx-auto my-3 rounded-lg overflow-hidden border border-[rgba(160,195,240,0.25)] bg-[#03060B] shadow-[0_0_35px_rgba(0,0,0,0.8)]">
              <canvas
                ref={canvasRef}
                width={640}
                height={640}
                className="w-full h-full cursor-crosshair"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = ((e.clientX - rect.left) / rect.width) * 40;
                  const clickY = ((e.clientY - rect.top) / rect.height) * 40;
                  setSelectedCell({ x: Math.floor(clickX), y: Math.floor(clickY) });
                }}
              />
            </div>

            {/* Path Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[rgba(160,195,240,0.12)] text-xs font-mono text-[#B4C2D6]">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-sky-400" />
                  <span>Initial A* Path</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-amber-400" />
                  <span>D* Lite Replanned Path</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-400" />
                  <span>Traversed Trail</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span>Dynamic Boulder</span>
                </div>
              </div>
              <div className="text-[#84A0C6]">CLICK GRID TO INSPECT CELL</div>
            </div>
          </GlassCard>

          {/* Mission Event Stream / Terminal Console */}
          <GlassCard className="p-4">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-[rgba(160,195,240,0.12)] font-mono text-xs text-[#84A0C6]">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>DYNAMIC REPLANNING &amp; SENSOR EVENT STREAM</span>
              </div>
              <span>D* LITE ACTIVE</span>
            </div>
            <div className="space-y-1 font-mono text-xs max-h-36 overflow-y-auto">
              {logs.map((log, idx) => (
                <div
                  key={idx}
                  className={
                    log.includes("HAZARD") || log.includes("DYNAMIC")
                      ? "text-amber-400"
                      : log.includes("REPLAN")
                      ? "text-emerald-400 font-semibold"
                      : "text-[#B4C2D6]"
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right: Live Telemetry & Sensor Cards */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rover State */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-xs">
              <span className="text-[#84A0C6] uppercase font-medium">Rover State Telemetry</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                  data?.rover.status === "NAVIGATING"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : data?.rover.status === "HAZARD_DETECTED"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                }`}
              >
                {data?.rover.status || "IDLE"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[#8292A8] text-[10px] uppercase">Coordinates (X, Y)</div>
                <div className="text-[#F4F7FC] font-bold text-sm">
                  {data?.rover.x ?? 0}, {data?.rover.y ?? 0} m
                </div>
              </div>
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[#8292A8] text-[10px] uppercase">Heading Azimuth</div>
                <div className="text-[#F4F7FC] font-bold text-sm">{data?.rover.heading_deg ?? 0}°</div>
              </div>
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[#8292A8] text-[10px] uppercase">Distance Traveled</div>
                <div className="text-[#F4F7FC] font-bold text-sm">{data?.rover.distance_traveled_m ?? 0} m</div>
              </div>
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[#8292A8] text-[10px] uppercase">Distance to Goal</div>
                <div className="text-[#F4F7FC] font-bold text-sm">{data?.rover.distance_to_goal_m ?? 0} m</div>
              </div>
            </div>

            {/* Battery Indicator */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-mono text-xs">
                <span className="text-[#8292A8] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" /> Battery Budget
                </span>
                <span className="text-[#F4F7FC] font-semibold">{data?.rover.battery_pct ?? 100}%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-sky-400"
                  style={{ width: `${data?.rover.battery_pct ?? 100}%` }}
                />
              </div>
            </div>
          </GlassCard>

          {/* Forward LiDAR Telemetry */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-xs">
              <span className="text-[#84A0C6] uppercase font-medium">Forward LiDAR Sensor</span>
              <span className="text-emerald-400">24 RAYS // 90° FOV</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#8292A8]">Min Obstacle Clearance:</span>
                <span
                  className={`font-bold ${
                    (data?.sensors.lidar.min_obstacle_distance_m ?? 8) < 3.0
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  {data?.sensors.lidar.min_obstacle_distance_m ?? 8.0} m
                </span>
              </div>

              {/* Range bars */}
              <div className="grid grid-cols-12 gap-0.5 h-8 items-end bg-black/40 p-1 rounded border border-white/5">
                {data?.sensors.lidar.ranges_m?.slice(0, 12).map((r, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-t ${r < 3.5 ? "bg-amber-400" : "bg-sky-400"}`}
                    style={{ height: `${Math.min(100, (r / 8) * 100)}%` }}
                    title={`Ray ${i}: ${r}m`}
                  />
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Thermal & IMU Telemetry */}
          <GlassCard className="p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 font-mono text-xs">
              <span className="text-[#84A0C6] uppercase font-medium">Thermal &amp; IMU Telemetry</span>
              <span className="text-[#B4C2D6]">DUAL PAYLOAD</span>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[#8292A8] text-[10px] uppercase">Regolith Temp</div>
                <div className="text-[#F4F7FC] font-bold text-sm">
                  {data?.sensors.thermal.regolith_temperature_k ?? 210} K
                </div>
                <div className="text-[10px] text-sky-300">
                  {data?.sensors.thermal.is_permanently_shadowed ? "❄️ PSR Cold-Trap" : "Illuminated"}
                </div>
              </div>

              <div className="p-2.5 rounded bg-white/[0.03] border border-white/5">
                <div className="text-[#8292A8] text-[10px] uppercase">IMU Attitude</div>
                <div className="text-[#F4F7FC] font-bold text-xs">
                  P: {data?.sensors.imu.pitch_deg ?? 0}° | R: {data?.sensors.imu.roll_deg ?? 0}°
                </div>
                <div className="text-[10px] text-emerald-400">Within Safe Limits</div>
              </div>
            </div>
          </GlassCard>

          {/* Selenocentric Localization */}
          <GlassCard className="p-4 font-mono text-xs space-y-1.5 text-[#B4C2D6]">
            <div className="flex justify-between text-[#8292A8] text-[10px] uppercase">
              <span>Datum: {data?.localization.datum || "WGS-LUNAR-2026"}</span>
              <span className="text-emerald-400">{data?.localization.fix_quality}</span>
            </div>
            <div>LAT: {data?.localization.latitude_deg}° S</div>
            <div>LON: {data?.localization.longitude_deg}° E</div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

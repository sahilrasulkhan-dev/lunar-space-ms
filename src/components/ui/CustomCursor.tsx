"use client";

import { useEffect, useState, useRef } from "react";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
}

export function CustomCursor() {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [cursorText, setCursorText] = useState("");

  const cursorRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const prevPos = useRef({ x: -100, y: -100 });
  const currentAngle = useRef(-28); // Standard aerodynamic pointer tilt
  const targetAngle = useRef(-28);
  const trailPoints = useRef<TrailPoint[]>([]);
  const trailCounter = useRef(0);
  const [trailRender, setTrailRender] = useState<TrailPoint[]>([]);

  useEffect(() => {
    setIsMounted(true);

    // Disable completely on non-fine pointer / touch devices
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    let rafId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const interactive = target.closest(
        "a, button, input, textarea, select, [role='button'], [data-cursor-text], [data-cursor], .group"
      );

      if (interactive) {
        setIsHovered(true);
        const text = interactive.getAttribute("data-cursor-text");
        setCursorText(text || "");
      } else {
        setIsHovered(false);
        setCursorText("");
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver, { passive: true });

    // 60-120fps Animation Loop for dynamic rotation, trail, and instant position sync
    const render = () => {
      const x = mousePos.current.x;
      const y = mousePos.current.y;
      const px = prevPos.current.x;
      const py = prevPos.current.y;

      const dx = x - px;
      const dy = y - py;
      const speed = Math.sqrt(dx * dx + dy * dy);

      // If moving, calculate heading angle
      if (speed > 1.2) {
        // Point along flight velocity vector
        const movementAngle = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
        targetAngle.current = movementAngle;

        // Spawn ion engine exhaust trail
        if (speed > 2.5) {
          trailCounter.current += 1;
          if (trailCounter.current % 2 === 0) {
            // Position behind rocket engine nozzle
            const rad = ((currentAngle.current - 90) * Math.PI) / 180;
            const exhaustX = x - Math.cos(rad) * 20;
            const exhaustY = y - Math.sin(rad) * 20;

            trailPoints.current.push({
              id: Math.random(),
              x: exhaustX,
              y: exhaustY,
              opacity: 0.85,
              size: Math.min(4, 2 + speed * 0.15)
            });

            if (trailPoints.current.length > 8) {
              trailPoints.current.shift();
            }
          }
        }
      } else {
        // When stationary, smoothly settle to aerospace pointer tilt (-28°)
        targetAngle.current = -28;
      }

      // Smooth angle interpolation with shortest 360° turn path
      let diff = ((targetAngle.current - currentAngle.current + 540) % 360) - 180;
      currentAngle.current += diff * 0.18;

      // Update trail points decay
      if (trailPoints.current.length > 0) {
        trailPoints.current = trailPoints.current
          .map((pt) => ({
            ...pt,
            opacity: pt.opacity - 0.05,
            size: Math.max(0.5, pt.size - 0.1)
          }))
          .filter((pt) => pt.opacity > 0.05);

        setTrailRender([...trailPoints.current]);
      } else if (trailRender.length > 0) {
        setTrailRender([]);
      }

      // Update Rocket Element DOM transform directly for zero-latency response
      if (cursorRef.current) {
        const scale = isClicking ? 0.9 : isHovered ? 1.25 : 1.0;
        cursorRef.current.style.transform = `translate3d(${x - 12}px, ${y - 2}px, 0) rotate(${currentAngle.current}deg) scale(${scale})`;
      }

      prevPos.current.x = x;
      prevPos.current.y = y;

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible, isHovered, isClicking]);

  if (!isMounted || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden select-none">
      {/* 1. Plasma Ion Engine Trail Sparks */}
      {trailRender.map((pt) => (
        <div
          key={pt.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${pt.x}px`,
            top: `${pt.y}px`,
            width: `${pt.size}px`,
            height: `${pt.size}px`,
            transform: "translate(-50%, -50%)",
            opacity: pt.opacity,
            backgroundColor: "#00F0FF",
            boxShadow: `0 0 ${pt.size * 3}px rgba(0, 240, 255, 0.9), 0 0 ${pt.size * 6}px rgba(56, 189, 248, 0.6)`
          }}
        />
      ))}

      {/* 2. Main Futuristic Rocket Cursor */}
      <div
        ref={cursorRef}
        className="absolute top-0 left-0 pointer-events-none will-change-transform"
        style={{
          transformOrigin: "12px 2px", // Pivot around the precise nose tip
          filter: isHovered
            ? "drop-shadow(0 0 10px rgba(0, 240, 255, 0.85)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.4))"
            : "drop-shadow(0 0 6px rgba(0, 240, 255, 0.55))"
        }}
      >
        <svg
          width="24"
          height="28"
          viewBox="0 0 24 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          {/* Thruster Flame (Pulsing Plasma Core) */}
          <path
            d="M10 21C10 21 11 25.5 12 28C13 25.5 14 21 14 21H10Z"
            fill="url(#thrusterFlame)"
            className={isHovered ? "scale-y-125 origin-top transition-transform" : ""}
          />
          <circle cx="12" cy="23" r="2" fill="#00F0FF" opacity="0.9" filter="blur(0.8px)" />

          {/* Left & Right Aerodynamic Delta Wings */}
          <path
            d="M5 15.5L2 19.5V22L7 19.5L5 15.5Z"
            fill="#0B1426"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />
          <path
            d="M19 15.5L22 19.5V22L17 19.5L19 15.5Z"
            fill="#0B1426"
            stroke="#38BDF8"
            strokeWidth="0.8"
          />

          {/* Fuselage Hull Base Structure */}
          <path
            d="M12 2C9.5 7 7 13 7 19H17C17 13 14.5 7 12 2Z"
            fill="#F4F7FC"
            stroke="#38BDF8"
            strokeWidth="1"
            strokeLinejoin="round"
          />

          {/* Titanium Shading Facets */}
          <path
            d="M12 2C13.5 7 15 13 15 19H17C17 13 14.5 7 12 2Z"
            fill="#B4C6E2"
            opacity="0.55"
          />

          {/* Center Spine Pinstripe */}
          <path d="M12 2.5V19" stroke="#38BDF8" strokeWidth="0.6" opacity="0.8" />

          {/* Glowing Cyan Viewport / Sensor Dome */}
          <ellipse cx="12" cy="10" rx="2" ry="2.4" fill="#00F0FF" stroke="#FFFFFF" strokeWidth="0.6" />
          <circle cx="11.4" cy="9.2" r="0.6" fill="#FFFFFF" opacity="0.9" />

          {/* Rocket Engine Collar Ring */}
          <rect
            x="9.5"
            y="19"
            width="5"
            height="2"
            rx="0.5"
            fill="#1E293B"
            stroke="#38BDF8"
            strokeWidth="0.6"
          />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="thrusterFlame" x1="12" y1="21" x2="12" y2="28" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#00F0FF" />
              <stop offset="65%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
            </linearGradient>
          </defs>
        </svg>

        {/* Hover Contextual Badge */}
        {cursorText && (
          <div
            className="absolute left-7 top-1 whitespace-nowrap pointer-events-none"
            style={{
              transform: `rotate(${-currentAngle.current}deg)` // Counter-rotate so text remains upright
            }}
          >
            <span className="px-2 py-0.5 rounded bg-[#070D1A]/90 border border-[#38BDF8]/60 text-[10px] font-mono tracking-widest text-[#E2EDF8] font-bold uppercase shadow-[0_0_12px_rgba(0,240,255,0.4)] backdrop-blur-md">
              {cursorText}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

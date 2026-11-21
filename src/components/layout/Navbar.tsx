"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { NeonButton } from "../ui/NeonButton";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Explore", path: "/", cursor: "EXPLORE" },
    { name: "Lunar AI", path: "/#assistant", cursor: "ASSISTANT" },
    { name: "Missions", path: "/dashboard?tab=missions", cursor: "MISSIONS" },
    { name: "Analysis", path: "/dashboard?tab=analysis", cursor: "ANALYZE" },
    { name: "Gallery", path: "/dashboard?tab=gallery", cursor: "GALLERY" },
    { name: "About", path: "/#about", cursor: "ABOUT" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#05070D]/85 backdrop-blur-xl border-b border-[rgba(160,195,240,0.12)] transition-all">
      <div className="max-w-[1680px] mx-auto px-6 h-18 md:h-20 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" data-cursor-text="HOME" className="flex items-center gap-3.5 group">
          {/* Minimalist Lunar Disk Icon with Soft Blue Rim Glow */}
          <div className="relative w-9 h-9 rounded-full border border-[#84A0C6]/40 bg-[#091122] flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-[#B8D4F5] group-hover:shadow-[0_0_15px_rgba(132,175,235,0.4)]">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-70"
              style={{
                backgroundImage: "radial-gradient(circle at 35% 35%, #84A0C6 0%, #060B14 80%)"
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/30 to-black/90" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#EAF2FA] shadow-[0_0_8px_rgba(180,215,255,0.9)] relative z-10" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm md:text-base font-bold tracking-[0.2em] text-[#F4F7FC] uppercase group-hover:text-white transition-colors">
              LUNAR<span className="text-[#84A0C6] ml-1.5 font-light">SPACE AI</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-[#8292A8] uppercase">
              Planetary Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Minimal Editorial Desktop Navigation - Comfortable Readability */}
        <div className="hidden md:flex items-center gap-8 lg:gap-10">
          {navLinks.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                data-cursor-text={item.cursor}
                className={`text-xs md:text-sm uppercase tracking-[0.16em] font-mono transition-all duration-200 relative py-1 ${
                  isActive
                    ? "text-[#F4F7FC] font-semibold text-shadow-[0_0_12px_rgba(160,205,255,0.4)]"
                    : "text-[#B4C2D6] hover:text-[#F4F7FC]"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-[#B8D4F5] shadow-[0_0_8px_rgba(184,212,245,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions & Mission Console CTA */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded border border-[#84A0C6]/25 bg-[#84A0C6]/5 text-xs font-mono text-[#B4C2D6]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
            <span>LRO.L2-UPLINK ACTIVE</span>
          </div>

          <Link href="/dashboard" data-cursor-text="LAUNCH">
            <NeonButton variant="primary" size="sm" className="font-mono text-xs tracking-wider">
              <span>Mission Control</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </NeonButton>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-[#B4C2D6] hover:text-white transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#84A0C6]/20 bg-[#070D1A]/98 backdrop-blur-2xl px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-mono uppercase tracking-widest text-[#B4C2D6] hover:text-[#F4F7FC] py-2.5 border-b border-white/5"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="pt-2">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <NeonButton variant="primary" size="md" className="w-full justify-center">
                Mission Control
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </NeonButton>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

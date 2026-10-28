"use client";

import { Moon, Bell, Menu, User, Settings } from "lucide-react";
import Link from "next/link";
import { NeonButton } from "../ui/NeonButton";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/10 bg-[#050816]/60 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 rounded-full flex items-center justify-center bg-dark-navy border border-electric-blue/30 group-hover:border-electric-blue transition-colors overflow-hidden">
            <Moon className="w-6 h-6 text-electric-blue relative z-10" />
            <div className="absolute inset-0 bg-electric-blue/20 blur-xl rounded-full" />
          </div>
          <span className="font-heading font-bold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            LUNASAFE<span className="text-electric-blue">AI</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: "Dashboard", path: "/dashboard" },
            { name: "Upload", path: "/dashboard?tab=upload" },
            { name: "Analysis", path: "/dashboard?tab=analysis" },
            { name: "Navigation", path: "/dashboard?tab=navigation" },
            { name: "Mission Report", path: "/dashboard?tab=report" },
            { name: "About", path: "/about" },
          ].map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors relative group"
            >
              {item.name}
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-electric-blue transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-white/70 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-neon-purple rounded-full animate-pulse" />
          </button>
          <button className="hidden sm:flex items-center gap-2 p-1.5 pr-4 bg-dark-navy/50 border border-white/10 rounded-full hover:border-white/20 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric-blue to-neon-purple flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium">Cmdr. Ripley</span>
          </button>
          
          <button className="lg:hidden p-2 text-white/70 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}

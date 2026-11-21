import type { Metadata } from "next";
import "./globals.css";
import { CustomCursor } from "@/components/ui/CustomCursor";

export const metadata: Metadata = {
  title: "LUNAR SPACE AI — Autonomous Planetary Intelligence & Cartography",
  description: "Cinematic lunar terrain intelligence, Apollo-grade cartography, polar ice detection, and autonomous rover trajectory planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col bg-[#05070D] text-[#F2F2F2] selection:bg-[#8496B4]/30 selection:text-white overflow-x-hidden relative">
        {/* Custom Interactive Desktop Cursor */}
        <CustomCursor />

        {/* Deep space base canvas with subtle blue atmospheric tint */}
        <div className="fixed inset-0 z-[-4] bg-[#05070D]" />
        
        {/* Multi-layered cosmic blue atmospheric illumination */}
        <div 
          className="fixed inset-0 z-[-3] pointer-events-none opacity-60"
          style={{
            background: "radial-gradient(ellipse 90% 60% at 50% -15%, rgba(70, 110, 170, 0.18), transparent 75%), radial-gradient(ellipse 70% 50% at 85% 85%, rgba(35, 65, 110, 0.35), transparent 70%), radial-gradient(ellipse 60% 45% at 10% 55%, rgba(25, 45, 85, 0.25), transparent 65%)"
          }}
        />

        {/* CSS Starfield Background */}
        <div className="fixed inset-0 z-[-2] pointer-events-none opacity-50 stars-bg" />

        {/* Subtle cosmic vignette */}
        <div 
          className="fixed inset-0 z-[-1] pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, transparent 60%, rgba(5, 7, 13, 0.75) 100%)"
          }}
        />

        {children}
      </body>
    </html>
  );
}

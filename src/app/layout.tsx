import type { Metadata } from "next";
import { Inter, Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LunaSafe AI - Lunar Landing & Navigation",
  description: "AI-Powered Lunar Terrain Analysis & Safe Rover Navigation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${orbitron.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-space-black text-white selection:bg-electric-blue/30 overflow-x-hidden relative">
        <div className="fixed inset-0 z-[-2] bg-[#050816]"></div>
        {/* Basic stars background - can be enhanced later */}
        <div className="fixed inset-0 z-[-1] opacity-50 bg-[url('https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=3000&auto=format&fit=crop')] bg-cover bg-center pointer-events-none mix-blend-screen"></div>
        {children}
      </body>
    </html>
  );
}

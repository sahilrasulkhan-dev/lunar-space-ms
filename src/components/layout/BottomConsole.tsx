"use client";

import { useEffect, useState } from "react";
import { Terminal } from "lucide-react";

export function BottomConsole() {
  const [messages, setMessages] = useState<string[]>([]);
  const [currentText, setCurrentText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const script = [
    "Initializing LunaSafe AI Engine v4.2...",
    "Connecting to lunar reconnaissance orbiter database...",
    "Calibrating optical sensors...",
    "Ready for image upload.",
  ];

  useEffect(() => {
    let index = 0;
    let charIndex = 0;
    
    const typeWriter = () => {
      if (index < script.length) {
        setIsTyping(true);
        if (charIndex < script[index].length) {
          setCurrentText((prev) => prev + script[index].charAt(charIndex));
          charIndex++;
          setTimeout(typeWriter, 30);
        } else {
          setMessages((prev) => [...prev, script[index]]);
          setCurrentText("");
          charIndex = 0;
          index++;
          setIsTyping(false);
          setTimeout(typeWriter, 500);
        }
      }
    };

    setTimeout(typeWriter, 1000);
  }, []);

  return (
    <div className="h-48 border-t border-white/10 bg-[#050816]/95 backdrop-blur-xl flex flex-col font-mono text-sm relative z-40">
      <div className="h-8 border-b border-white/5 flex items-center px-4 gap-2 text-white/50 text-xs uppercase tracking-widest bg-white/5">
        <Terminal className="w-3.5 h-3.5" />
        Mission Console
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className="text-white/60 mb-1 flex gap-2">
            <span className="text-electric-blue/50">{`>`}</span>
            {msg}
          </div>
        ))}
        {isTyping && (
          <div className="text-white/90 flex gap-2">
            <span className="text-electric-blue">{`>`}</span>
            {currentText}
            <span className="w-2 h-4 bg-electric-blue inline-block animate-pulse ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}

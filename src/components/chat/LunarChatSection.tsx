"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  Copy,
  Check,
  Compass,
  Radio,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  MessageSquare
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonButton } from "@/components/ui/NeonButton";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: string[];
  followups?: string[];
}

const INITIAL_SUGGESTIONS = [
  "What is Lunar Space AI?",
  "Tell me about lunar ice.",
  "How does AI help in lunar exploration?",
  "What are the major Moon missions?",
  "Explain the lunar surface analysis.",
  "How does this project work?"
];

const WELCOME_MESSAGE =
  "Hello, Explorer! 🌕 I'm Lunar AI, your intelligent assistant for lunar exploration. I can help you understand lunar missions, Moon geology, lunar ice, satellite data, AI-powered analysis, and everything about the Lunar Space AI project. What would you like to explore today?";

export function LunarChatSection() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: WELCOME_MESSAGE,
      timestamp: "00:00:01",
      followups: INITIAL_SUGGESTIONS
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        id: "welcome-msg-reset",
        role: "assistant",
        content: WELCOME_MESSAGE,
        timestamp: new Date().toLocaleTimeString(),
        followups: INITIAL_SUGGESTIONS
      }
    ]);
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsLoading(true);

    try {
      // 1. Attempt backend API call
      const res = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: json.data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            sources: json.data.sources || [],
            followups: json.data.suggested_followups || []
          };
          setMessages((prev) => [...prev, aiMsg]);
          setIsLoading(false);
          return;
        }
      }
    } catch {
      // Fallback below
    }

    // 2. Client-side fallback if backend is offline/restarting
    setTimeout(() => {
      const fallbackReply = generateFallbackResponse(query);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: fallbackReply.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sources: fallbackReply.sources,
        followups: fallbackReply.followups
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <section id="assistant" className="relative z-10 py-20 md:py-28 px-6 md:px-12 max-w-[1680px] mx-auto w-full">
      {/* Outlined Typography Watermark */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none select-none z-[-1] overflow-hidden">
        <span className="text-[18vw] font-black tracking-tighter outlined-text uppercase leading-none opacity-10">
          ASSISTANT
        </span>
      </div>

      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6 border-b border-[rgba(160,195,240,0.14)] pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-xs md:text-sm font-mono tracking-[0.25em] text-[#84A0C6] uppercase mb-2 font-medium">
            <Sparkles className="w-4 h-4 text-[#A8C4E6]" />
            <span>Autonomous Knowledge Engine // Multimodal AI</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#F4F7FC] uppercase">
            LUNAR AI <span className="text-[#A8C4E6] font-light">ASSISTANT</span>
          </h2>
          <p className="text-sm md:text-base text-[#B4C2D6] mt-2 font-sans">
            Your intelligent lunar exploration guide for Moon missions, polar ice, terrain analysis, and space science.
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#081224]/80 border border-[#84A0C6]/30 text-xs font-mono text-[#E2ECF8]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>LRO UPLINK ACTIVE</span>
          </div>
          <button
            onClick={handleClear}
            title="Reset Chat Session"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-white/10 bg-white/[0.03] text-xs font-mono text-[#8292A8] hover:text-white hover:bg-white/[0.08] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface Box */}
      <GlassCard variant="panel" className="relative p-0 overflow-hidden border border-[rgba(160,195,240,0.22)] shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Terminal Header Bar */}
        <div className="h-14 bg-[#070D1A]/90 border-b border-[rgba(160,195,240,0.14)] px-5 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Lunar AI Avatar with Soft Atmospheric Blue Corona */}
            <div className="relative w-8 h-8 rounded-full border border-[#84A0C6]/40 bg-[#091122] flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(100,165,245,0.3)]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-80"
                style={{
                  backgroundImage: "radial-gradient(circle at 35% 35%, #84A0C6 0%, #060B14 80%)"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-black/80" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#EAF2FA] shadow-[0_0_6px_rgba(180,215,255,1)] relative z-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold tracking-wider text-[#F4F7FC] uppercase">LUNAR AI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#84A0C6]/15 text-[#B8D4F5] border border-[#84A0C6]/30">
                  v2.4
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#8292A8] hidden sm:block">
                Autonomous Deep Space Research Agent
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-[#84A0C6]">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">SELENOGRAPHIC TELEMETRY LIVE</span>
          </div>
        </div>

        {/* Messages Stream Container */}
        <div className="h-[460px] md:h-[520px] overflow-y-auto p-5 md:p-8 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {/* AI Avatar */}
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-[#0C1525] border border-[#84A0C6]/40 flex items-center justify-center shrink-0 mt-1 shadow-[0_0_10px_rgba(100,165,245,0.2)]">
                    <Bot className="w-4 h-4 text-[#A8C4E6]" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] md:max-w-[75%] rounded-lg p-4 md:p-5 relative group ${
                    msg.role === "user"
                      ? "bg-[#84A0C6]/15 border border-[#84A0C6]/35 text-[#F4F7FC]"
                      : "bg-[#070D1A]/95 border border-[rgba(160,195,240,0.18)] text-[#F4F7FC] shadow-[0_4px_25px_rgba(0,0,0,0.6)]"
                  }`}
                >
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center justify-between gap-4 pb-2 mb-2 border-b border-white/5 font-mono text-[11px] text-[#8292A8]">
                    <span className="uppercase tracking-wider font-semibold text-[#A8C4E6]">
                      {msg.role === "assistant" ? "Lunar AI Assistant" : "Mission Controller"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Message Content with Markdown Formatting */}
                  <div className="text-sm md:text-[15px] leading-relaxed font-sans space-y-2 text-[#E2ECF8]">
                    {formatMarkdown(msg.content)}
                  </div>

                  {/* Sources Footnote (if available) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-4 pt-2.5 border-t border-white/5 flex items-center gap-2 flex-wrap font-mono text-[10px] text-[#84A0C6]">
                      <span className="uppercase text-[#8292A8]">Verified Sources:</span>
                      {msg.sources.map((src, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/10">
                          {src}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Follow-up suggestions */}
                  {msg.followups && msg.followups.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                      <div className="text-[11px] font-mono tracking-wider text-[#8292A8] uppercase">
                        Recommended Follow-Ups:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.followups.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(suggestion)}
                            className="text-left text-xs font-mono px-3 py-1.5 rounded-full bg-[#84A0C6]/10 border border-[#84A0C6]/25 text-[#D6E6F8] hover:bg-[#84A0C6]/25 hover:border-[#B8D4F5] hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{suggestion}</span>
                            <ChevronRight className="w-3 h-3 text-[#A8C4E6]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#84A0C6]/20 border border-[#84A0C6]/40 flex items-center justify-center shrink-0 mt-1">
                    <User className="w-4 h-4 text-[#F4F7FC]" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3.5"
              >
                <div className="w-8 h-8 rounded-full bg-[#0C1525] border border-[#84A0C6]/40 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#A8C4E6]" />
                </div>
                <div className="rounded-lg px-4 py-3 bg-[#070D1A]/95 border border-[rgba(160,195,240,0.18)] flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#84A0C6] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#84A0C6] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-[#84A0C6] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs font-mono text-[#8292A8]">Lunar AI is synthesizing lunar telemetry...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar Area */}
        <div className="border-t border-[rgba(160,195,240,0.14)] bg-[#05070D]/95 p-4 md:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Lunar AI anything about the Moon..."
                rows={1}
                className="w-full bg-[#070D1A] border border-[rgba(160,195,240,0.22)] rounded-lg px-4 py-3 text-sm md:text-base text-[#F4F7FC] placeholder-[#8292A8] focus:outline-none focus:border-[#84A0C6] focus:ring-1 focus:ring-[#84A0C6] transition-all resize-none font-sans"
              />
            </div>

            <NeonButton
              variant="primary"
              size="md"
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-6 shrink-0 font-mono text-xs tracking-wider"
              cursorText="SEND"
            >
              <Send className="w-4 h-4 mr-2" />
              <span>Transmitting</span>
            </NeonButton>
          </form>

          {/* Prompt Assist Footer */}
          <div className="flex items-center justify-between text-[11px] font-mono text-[#8292A8] mt-2.5 px-1">
            <span>Press Enter to transmit (Shift+Enter for new line)</span>
            <span>POWERED BY LUNAR SPACE AI KNOWLEDGE ENGINE</span>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}

/** Helper to format bullet points, bold text, and headers in responses */
function formatMarkdown(content: string) {
  const lines = content.split("\n");
  return lines.map((line, idx) => {
    if (!line.trim()) {
      return <div key={idx} className="h-1.5" />;
    }

    // Markdown Headers (### Header)
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} className="text-sm font-mono font-bold text-[#A8C4E6] uppercase tracking-wider pt-1.5">
          {line.replace("### ", "")}
        </h4>
      );
    }

    // Bullet points
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      const cleanLine = line.replace(/^[•\-\*]\s*/, "");
      return (
        <div key={idx} className="flex items-start gap-2 pl-1">
          <span className="text-[#84A0C6] font-bold mt-0.5">•</span>
          <div>{parseBoldText(cleanLine)}</div>
        </div>
      );
    }

    // Numbered lists (1. Item)
    if (/^\d+\.\s/.test(line)) {
      const numMatch = line.match(/^(\d+\.)\s*(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-2 pl-1">
            <span className="text-[#84A0C6] font-mono font-bold">{numMatch[1]}</span>
            <div>{parseBoldText(numMatch[2])}</div>
          </div>
        );
      }
    }

    return <p key={idx}>{parseBoldText(line)}</p>;
  });
}

function parseBoldText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

/** Client-side fallback engine if backend connection is unavailable */
function generateFallbackResponse(query: string) {
  const q = query.toLowerCase();

  if (q.includes("what is lunar space ai") || q.includes("overview")) {
    return {
      reply:
        "**Lunar Space AI** is an advanced planetary cartography and mission intelligence platform.\n\n" +
        "### Core Capabilities:\n" +
        "• **Optical Surface Intelligence**: Sub-pixel crater segmentation & hazard mapping via OpenCV.\n" +
        "• **Polar Water-Ice Detection**: Multi-spectral modeling of permanently shadowed cold traps.\n" +
        "• **Autonomous Rover Navigation**: A* global planning coupled with real-time D* Lite replanning.\n" +
        "• **Orbital Telemetry Synchronizer**: Unified feeds from LRO, Chandrayaan-2, and Kaguya.",
      sources: ["Lunar Space AI Whitepaper", "Autonomous Deep Space Lab"],
      followups: ["Tell me about lunar ice.", "How does this project work?", "How does AI help in lunar exploration?"]
    };
  }

  if (q.includes("ice") || q.includes("water") || q.includes("cold trap") || q.includes("psr")) {
    return {
      reply:
        "**Water-Ice on the Moon** is concentrated in **Permanently Shadowed Regions (PSRs)** at the lunar poles:\n\n" +
        "• **Thermal Cold Traps**: Crater temperatures in polar depressions plunge below **40 to 90 Kelvin (-233°C)**, shielded from solar thermal radiation.\n" +
        "• **Estimated Volume**: Upwards of **600 million metric tons** of volatile ice deposits in craters such as Shackleton, Faustini, and Shoemaker.\n" +
        "• **ISRU Potential**: Ice can be electrolyzed into liquid hydrogen ($H_2$) and liquid oxygen ($O_2$) for deep space rocket propellant.",
      sources: ["NASA LRO Diviner Radiometer", "ISRO Chandrayaan M3 Archive"],
      followups: ["What is Lunar Space AI?", "What are the major Moon missions?"]
    };
  }

  if (q.includes("ai") || q.includes("how does ai help") || q.includes("machine learning")) {
    return {
      reply:
        "**AI enables real-time autonomous surface operations**:\n\n" +
        "• **Latency Mitigation**: Overcomes the 2.5-second round-trip radio delay through autonomous onboard hazard avoidance.\n" +
        "• **Computer Vision**: OpenCV morphological filters automatically extract crater distributions and slope gradients.\n" +
        "• **D* Lite Replanning**: Recalculates rover routes in under 5ms when unexpected boulders appear.",
      sources: ["NASA Autonomous Systems Initiative", "Lunar Rover AI Architecture"],
      followups: ["Explain the lunar surface analysis.", "What is Lunar Space AI?"]
    };
  }

  if (q.includes("mission") || q.includes("chandrayaan") || q.includes("apollo") || q.includes("artemis")) {
    return {
      reply:
        "**Major Historic and Modern Lunar Missions**:\n\n" +
        "• **Apollo (1969–1972)**: NASA crewed missions that returned 382 kg of lunar rocks.\n" +
        "• **LRO (2009–Present)**: Continually captures global 0.5m/px imagery.\n" +
        "• **Chandrayaan-1 & 3**: Chandrayaan-1 discovered lunar water molecules; Chandrayaan-3 achieved the historic soft landing near the lunar South Pole.\n" +
        "• **Artemis Program**: Ongoing international effort to establish permanent lunar presence.",
      sources: ["ISRO Telemetry Archives", "NASA Planetary Data System"],
      followups: ["Tell me about lunar ice.", "How does this project work?"]
    };
  }

  return {
    reply:
      "I specialize in **lunar science, Moon missions, and the Lunar Space AI platform**.\n\n" +
      "I can assist you with:\n" +
      "• **Lunar Space AI Project**: Architecture, tech stack, and algorithms\n" +
      "• **Lunar Science**: Geology, polar ice, and cold-trap craters\n" +
      "• **Missions**: Chandrayaan, Apollo, LRO, and Artemis\n" +
      "• **Autonomous Navigation**: A* and D* Lite rover pathfinding\n\n" +
      "What would you like to explore regarding the Moon?",
    sources: ["Lunar Space AI Intelligence"],
    followups: ["What is Lunar Space AI?", "Tell me about lunar ice.", "How does this project work?"]
  };
}

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Trash2,
  Film,
  Camera,
  PenTool,
  Users,
} from "lucide-react";
import { ChatMessage, AssistantRole, AssistantModel, ProjectData } from "../types";

interface GeminiChatbotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  onApplySceneSuggestion?: (suggestion: any) => void;
}

const ROLES: Array<{
  id: AssistantRole;
  name: string;
  icon: any;
  desc: string;
}> = [
  {
    id: "director",
    name: "Snapchat Director",
    icon: Film,
    desc: "10-second suspense pacing, retention hooks & cliffhangers",
  },
  {
    id: "script_doctor",
    name: "Script Doctor",
    icon: PenTool,
    desc: "Micro-dialogue tightening & narrative tension escalation",
  },
  {
    id: "cinematographer",
    name: "Cinematographer",
    icon: Camera,
    desc: "9:16 vertical composition, lighting setups & Dutch angles",
  },
  {
    id: "character_artist",
    name: "Character Specialist",
    icon: Users,
    desc: "AI visual consistency, facial traits & wardrobe bibles",
  },
];

const MODELS: Array<{
  id: AssistantModel;
  name: string;
  badge: string;
  desc: string;
}> = [
  {
    id: "gemini-3.1-pro-preview",
    name: "gemini-3.1-pro-preview",
    badge: "Complex Tasks",
    desc: "Deep script restructuring, multi-beat pacing & narrative reasoning",
  },
  {
    id: "gemini-3.5-flash",
    name: "gemini-3.5-flash",
    badge: "General Tasks",
    desc: "Balanced speed and creativity for scene drafting & ideas",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "gemini-3.1-flash-lite",
    badge: "Fast Tasks",
    desc: "Ultra-low latency for instant prompt polish & quick tweaks",
  },
];

export const GeminiChatbotDrawer: React.FC<GeminiChatbotDrawerProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial_msg",
      role: "model",
      content: `Hello! I'm your AI Snapchat Movie Consultant. I can help you craft addictive 10-second suspense installments, calibrate character consistency bibles, or suggest vertical 9:16 lighting setups.\n\nWhat would you like to refine today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      modelUsed: "gemini-3.5-flash",
      assistantRole: "director",
    },
  ]);

  const [input, setInput] = useState("");
  const [selectedRole, setSelectedRole] = useState<AssistantRole>("director");
  const [selectedModel, setSelectedModel] = useState<AssistantModel>("gemini-3.5-flash");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput("");
    setIsLoading(true);

    try {
      // Build conversation history payload
      const historyPayload = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          role: selectedRole,
          modelPreference: selectedModel,
          projectContext: {
            title: project.title,
            genre: project.genre,
            sceneCount: project.scenes.length,
            characters: project.characters.map((c) => ({
              name: c.name,
              role: c.role,
              appearance: c.appearanceDescription,
              wardrobe: c.signatureWardrobe,
            })),
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Chat request failed");
      }

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `msg_resp_${Date.now()}`,
        role: "model",
        content: data.reply || "No response generated.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed || selectedModel,
        assistantRole: selectedRole,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: "model",
        content: `Error: ${err.message || "Failed to reach Gemini. Please check your network and try again."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (confirm("Clear chat history?")) {
      setMessages([
        {
          id: `msg_init_${Date.now()}`,
          role: "model",
          content: "Chat history cleared. How can I help with your Snapchat storyboards?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          assistantRole: selectedRole,
          modelUsed: selectedModel,
        },
      ]);
    }
  };

  const quickPrompts = [
    "Audit my 10s cliffhangers for viewer retention",
    "How do I maintain character consistency across dark scenes?",
    "Suggest vertical 9:16 camera angles for Beat 1",
    "Tighten dialogue to fit a fast 10-second beat",
  ];

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col animate-slideLeft text-neutral-100">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/95">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold flex items-center gap-1.5">
              <span>Gemini Director Chat</span>
            </h2>
            <p className="text-[11px] text-neutral-400">Multi-turn AI Script & Storyboard Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={clearHistory}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="Clear chat history"
            aria-label="Clear chat history"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Close chat"
            aria-label="Close chat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Role & Model Controls */}
      <div className="px-4 py-2.5 bg-neutral-950/60 border-b border-neutral-800 space-y-2 text-xs">
        {/* Role Selector */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            AI Persona Role:
          </span>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as AssistantRole)}
            className="bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selector (mandated by prompt) */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
            Gemini Model:
          </span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as AssistantModel)}
            className="bg-neutral-800 border border-neutral-700 text-amber-300 font-mono text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.badge})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "model" && (
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                msg.role === "user"
                  ? "bg-amber-500 text-neutral-950 font-medium rounded-tr-none shadow-sm"
                  : "bg-neutral-800/80 border border-neutral-700/60 text-neutral-100 rounded-tl-none leading-relaxed"
              }`}
            >
              <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>

              <div
                className={`text-[10px] mt-1.5 flex items-center gap-2 ${
                  msg.role === "user" ? "text-neutral-900/70" : "text-neutral-400"
                }`}
              >
                <span>{msg.timestamp}</span>
                {msg.modelUsed && (
                  <>
                    <span>&bull;</span>
                    <span className="font-mono text-[9px] opacity-80">{msg.modelUsed}</span>
                  </>
                )}
              </div>
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-2.5 items-center text-neutral-400 text-xs">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
            </div>
            <div className="bg-neutral-800/80 border border-neutral-700/60 rounded-xl px-3 py-2 text-neutral-300 flex items-center gap-1.5">
              <span>Thinking with {selectedModel}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 border-t border-neutral-800 bg-neutral-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 text-[10px] text-neutral-300 transition-colors border border-neutral-700"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-neutral-800 bg-neutral-900/90">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask the ${ROLES.find((r) => r.id === selectedRole)?.name}...`}
            disabled={isLoading}
            className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            title="Send message"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

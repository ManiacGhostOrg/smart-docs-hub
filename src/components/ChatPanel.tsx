import { useState, useRef, useEffect } from "react";
import { Send, Play } from "lucide-react";
import { type ChatMessage, type Timestamp } from "@/lib/mock-data";

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onTimestampClick?: (ts: Timestamp) => void;
  loading?: boolean;
}

export function ChatPanel({ messages, onSendMessage, onTimestampClick, loading }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <aside className="relative z-10 w-[400px] shrink-0 glass-panel-rounded flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-glass-border/50 flex items-center gap-3 shrink-0">
        <div className="relative flex items-center justify-center size-6">
          <div className="absolute inset-0 rounded-full bg-aurora-violet/30 blur-[6px] animate-pulse" />
          <div className="relative size-2 rounded-full bg-aurora-violet shadow-[0_0_10px_var(--aurora-violet)]" />
        </div>
        <div className="text-sm font-medium text-text-primary tracking-wide">
          Synapse Active
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col gap-2 ${msg.role === "user" ? "pl-8 items-end" : "pr-4"}`}>
            <div className={`text-[10px] font-mono ${msg.role === "user" ? "text-text-tertiary" : "text-aurora-violet flex items-center gap-2"}`}>
              {msg.role === "user" ? (
                "YOU"
              ) : (
                <>
                  <span className="size-1 rounded-full bg-aurora-violet inline-block" />
                  SYNTHESIS
                </>
              )}
            </div>
            <div className={`text-sm leading-relaxed font-light ${msg.role === "user" ? "text-text-secondary text-right" : "text-text-primary"}`}>
              {msg.content}
            </div>

            {/* Play button for timestamp reference */}
            {msg.relatedTimestamp && onTimestampClick && (
              <button
                onClick={() => onTimestampClick(msg.relatedTimestamp!)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-aurora-cyan/10 border border-aurora-cyan/20 text-aurora-cyan text-xs hover:bg-aurora-cyan/20 transition-all self-start mt-1"
              >
                <Play className="size-3" />
                <span className="font-mono">{msg.relatedTimestamp.time}</span>
                <span>{msg.relatedTimestamp.label}</span>
              </button>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-[10px] font-mono text-aurora-violet animate-pulse flex items-center gap-2">
            <span className="size-1 rounded-full bg-aurora-violet" />
            SYNTHESIZING...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 shrink-0">
        <div className="relative bg-obsidian-base rounded-[20px] p-1 border border-glass-border shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 bg-transparent px-4 py-3 text-sm text-text-primary placeholder:text-text-tertiary outline-none font-light"
            placeholder="Direct a query to the core..."
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 mr-1 rounded-xl bg-white/5 text-text-primary text-xs font-medium cursor-pointer hover:bg-white/10 transition-colors border border-white/5 disabled:opacity-30"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

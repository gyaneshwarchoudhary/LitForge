"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Hello! I'm your AI reading companion, currently loaded with **Atomic Habits** by James Clear.\n\nI've analyzed this book with your profile in mind — your goals of building consistent habits and improving productivity.\n\nWhat would you like to explore? You can ask me anything from key concepts to how specific ideas apply to your life.",
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
  },
];

const suggestedQuestions = [
  "How does the habit loop apply to my morning routine?",
  "What's the difference between goals and systems?",
  "How do I build a reading habit from scratch?",
  "Explain the 2-minute rule with examples from my context",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5 ${
          isUser
            ? "bg-indigo-500 text-white"
            : "bg-[#F59E0B]/20 border border-[#F59E0B]/30"
        }`}
      >
        {isUser ? (
          "U"
        ) : (
          <span
            className="material-symbols-outlined text-[#F59E0B] text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            smart_toy
          </span>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-500 text-white rounded-tr-md"
              : "bg-[#161618] border border-[#262626] text-[#F5F5F0] rounded-tl-md"
          }`}
        >
          {msg.content.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line.split("**").map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className={isUser ? "text-white" : "text-[#F59E0B]"}>
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
              {i < msg.content.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>
        <span className="text-xs text-[#94948E] px-1">{formatTime(msg.timestamp)}</span>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (content: string) => {
    if (!content.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Great question about **"${content.trim().slice(0, 30)}..."**\n\nBased on Atomic Habits and your personal goals, here's my personalized insight:\n\nJames Clear emphasizes that small 1% improvements compound over time. For your specific situation, I'd suggest starting with an **implementation intention**: "I will [behavior] at [time] in [location]."\n\nWould you like me to help you design a specific experiment based on this principle?`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0B0B0D]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#0e0e10] border-r border-[#262626] min-h-screen flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-[#262626]">
          <Link href="/" className="flex items-center gap-2 mb-4 group">
            <span
              className="material-symbols-outlined text-[#F59E0B] text-xl group-hover:rotate-12 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_stories
            </span>
            <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F59E0B]">
              LitForge
            </span>
          </Link>

          {/* Active book */}
          <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center text-xl flex-shrink-0">
              🔬
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#94948E]">Chatting with</p>
              <p className="text-sm font-semibold text-[#F5F5F0] truncate">Atomic Habits</p>
            </div>
            <span className="w-2 h-2 bg-emerald-400 rounded-full pulse-ring flex-shrink-0" />
          </div>
        </div>

        {/* Suggested questions */}
        <div className="p-4 flex-1 overflow-y-auto">
          <p className="text-xs text-[#94948E] uppercase tracking-wider font-semibold mb-3">
            Suggested Questions
          </p>
          <div className="flex flex-col gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="text-left text-xs text-[#94948E] hover:text-[#F5F5F0] p-3 rounded-xl hover:bg-[#161618] border border-transparent hover:border-[#262626] transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Nav links */}
        <div className="p-4 border-t border-[#262626] flex flex-col gap-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-[#94948E] hover:text-[#F5F5F0] py-2 px-3 rounded-xl hover:bg-[#161618] transition-colors"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="glass-nav px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="lg:hidden text-[#94948E] hover:text-[#F5F5F0]">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/20 flex items-center justify-center text-xl flex-shrink-0">
            🔬
          </div>
          <div>
            <p className="font-semibold text-[#F5F5F0] text-sm">Atomic Habits</p>
            <p className="text-xs text-[#94948E]">James Clear · AI Companion Active</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
              Active
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#F59E0B]/20 border border-[#F59E0B]/30 flex items-center justify-center flex-shrink-0">
                  <span
                    className="material-symbols-outlined text-[#F59E0B] text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <div className="bg-[#161618] border border-[#262626] rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-[#262626] bg-[#0B0B0D] px-4 md:px-8 py-4">
          <div className="max-w-2xl mx-auto">
            {/* Quick suggestions (mobile) */}
            <div className="lg:hidden flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
              {suggestedQuestions.slice(0, 2).map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="flex-shrink-0 text-xs text-[#94948E] bg-[#161618] border border-[#262626] px-3 py-1.5 rounded-full hover:border-[#F59E0B]/30 hover:text-[#F5F5F0] transition-colors"
                >
                  {q.slice(0, 30)}…
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3">
              <div className="flex-1 bg-[#161618] border border-[#262626] rounded-2xl px-4 py-3 focus-within:border-[#F59E0B]/50 transition-colors">
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about Atomic Habits..."
                  rows={1}
                  className="w-full bg-transparent text-[#F5F5F0] text-sm placeholder-[#94948E] resize-none focus:outline-none leading-relaxed"
                  style={{ maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="w-10 h-10 bg-[#F59E0B] text-[#1a1000] rounded-xl flex items-center justify-center hover:bg-[#ffc174] transition-all duration-200 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>
            <p className="text-xs text-[#94948E] mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

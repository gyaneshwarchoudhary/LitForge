"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { TOKEN_COOKIE } from "@/lib/auth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ChunkResult {
  text: string;
  score: number;
  chunk_index: number;
  title: string;
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  profile_used?: boolean;
  results?: ChunkResult[];
};

interface ConversationSummary {
  id: number;
  document_id: number;
  created_at: string;
  turn_count: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatConvDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const [sourcesOpen, setSourcesOpen] = useState(false);

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
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

      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? "bg-indigo-500 text-white rounded-tr-md"
              : "bg-[#161618] border border-[#262626] text-[#F5F5F0] rounded-tl-md"
          }`}
        >
          {msg.content.split("\n").map((line, i, arr) => (
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
              {i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </div>

        {/* Extra info for assistant messages */}
        {!isUser && (msg.profile_used || (msg.results && msg.results.length > 0)) && (
          <div className="mt-1 flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#94948E] px-1">{formatTime(msg.timestamp)}</span>
              {msg.profile_used && (
                <span className="inline-flex items-center gap-1 text-[10px] text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20 px-2 py-0.5 rounded-full font-medium">
                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                  Personalized for you
                </span>
              )}
            </div>

            {msg.results && msg.results.length > 0 && (
              <div className="bg-[#161618] border border-[#262626] rounded-xl overflow-hidden mt-1">
                <button
                  onClick={() => setSourcesOpen(!sourcesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-[#94948E] hover:text-[#F5F5F0] hover:bg-[#262626]/50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[14px]">menu_book</span>
                    Sources ({msg.results.length})
                  </span>
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                      sourcesOpen ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {sourcesOpen && (
                  <div className="px-3 pb-3 pt-1 border-t border-[#262626]/50 flex flex-col gap-2">
                    {msg.results.map((r, idx) => (
                      <div key={idx} className="bg-[#0B0B0D] p-2.5 rounded-lg border border-[#262626]/50">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-[#F5F5F0] truncate pr-2">
                            {r.title}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                              r.score > 0.6
                                ? "bg-emerald-500/10 text-emerald-400"
                                : r.score > 0.5
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-[#262626] text-[#94948E]"
                            }`}
                          >
                            {r.score > 0.6 ? "High Match" : r.score > 0.5 ? "Good Match" : "Related"}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#94948E] leading-relaxed line-clamp-2">
                          "{r.text.substring(0, 150)}..."
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isUser && <span className="text-xs text-[#94948E] px-1">{formatTime(msg.timestamp)}</span>}
        {!isUser && !(msg.profile_used || (msg.results && msg.results.length > 0)) && (
          <span className="text-xs text-[#94948E] px-1">{formatTime(msg.timestamp)}</span>
        )}
      </div>
    </div>
  );
}

// ── Conversations Sidebar ─────────────────────────────────────────────────────

function ConversationsSidebar({
  docId,
  conversations,
  loadingConvs,
  activeConvId,
  onSelectConversation,
  onNewConversation,
}: {
  docId: number | null;
  conversations: ConversationSummary[];
  loadingConvs: boolean;
  activeConvId: number | null;
  onSelectConversation: (conv: ConversationSummary) => void;
  onNewConversation: () => void;
}) {
  return (
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

        {/* Book indicator */}
        <div className="glass-panel rounded-xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center text-xl flex-shrink-0">
            📚
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-[#94948E]">Chatting with</p>
            <p className="text-sm font-semibold text-[#F5F5F0] truncate">
              {docId ? `Document #${docId}` : "Select a book"}
            </p>
          </div>
          {docId && (
            <span className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {/* New conversation button */}
        {docId && (
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94948E] hover:text-[#F5F5F0] hover:bg-[#161618] border border-dashed border-[#262626] hover:border-[#F59E0B]/30 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Conversation
          </button>
        )}

        <p className="text-xs text-[#94948E] uppercase tracking-wider font-semibold mt-1">
          Past Conversations
        </p>

        {loadingConvs ? (
          <div className="flex items-center justify-center py-8">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-[#262626]" />
              <div className="absolute inset-0 rounded-full border-2 border-t-[#F59E0B] animate-spin" />
            </div>
          </div>
        ) : !docId ? (
          <p className="text-xs text-[#94948E] text-center py-6">
            Open a book from your library to start chatting.
          </p>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-[#94948E] text-center py-6">
            No conversations yet. Ask your first question!
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv)}
                className={`w-full text-left px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeConvId === conv.id
                    ? "bg-[#F59E0B]/10 border border-[#F59E0B]/20"
                    : "hover:bg-[#161618] border border-transparent hover:border-[#262626]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`material-symbols-outlined text-sm ${
                      activeConvId === conv.id ? "text-[#F59E0B]" : "text-[#94948E]"
                    }`}
                  >
                    chat_bubble
                  </span>
                  <span
                    className={`text-xs font-semibold truncate ${
                      activeConvId === conv.id ? "text-[#F59E0B]" : "text-[#F5F5F0]"
                    }`}
                  >
                    Conversation #{conv.id}
                  </span>
                  {activeConvId === conv.id && (
                    <span className="ml-auto w-1.5 h-1.5 bg-[#F59E0B] rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-[#94948E] pl-5">
                  {formatConvDate(conv.created_at)}
                </p>
                <p className="text-[10px] text-[#94948E] pl-5">
                  {conv.turn_count} {conv.turn_count === 1 ? "turn" : "turns"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav links */}
      <div className="p-4 border-t border-[#262626] flex flex-col gap-1">
        <Link
          href="/dashboard/library"
          className="flex items-center gap-2 text-sm text-[#94948E] hover:text-[#F5F5F0] py-2 px-3 rounded-xl hover:bg-[#161618] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">auto_stories</span>
          My Library
        </Link>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-[#94948E] hover:text-[#F5F5F0] py-2 px-3 rounded-xl hover:bg-[#161618] transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Dashboard
        </Link>
      </div>
    </aside>
  );
}

// ── Chat Page ─────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId") ? Number(searchParams.get("docId")) : null;

  // conversations sidebar
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);

  // chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Fetch conversations when docId changes ─────────────────────────────────

  const fetchConversations = useCallback(async () => {
    if (!docId) return;
    const token = getCookie(TOKEN_COOKIE);
    if (!token) return;

    setLoadingConvs(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/query/${docId}/conversations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const convs = res.data as ConversationSummary[];
      setConversations(convs);

      // Auto-select the most recent conversation
      if (convs.length > 0 && activeConvId === null) {
        setActiveConvId(convs[0].id);
        loadConversationHistory(convs[0].id);
      }
    } catch {
      toast.error("Failed to load conversations.");
    } finally {
      setLoadingConvs(false);
    }
  }, [docId, activeConvId]);

  useEffect(() => {
    fetchConversations();
  }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load full conversation history ─────────────────────────────────────────

  const loadConversationHistory = async (convId: number) => {
    if (!docId) return;
    const token = getCookie(TOKEN_COOKIE);
    if (!token) return;

    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/query/${docId}/conversations/${convId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const loadedMessages: Message[] = [];
      if (res.data.turns && Array.isArray(res.data.turns)) {
        res.data.turns.forEach((turn: any) => {
          loadedMessages.push({
            id: `user-${turn.id}`,
            role: "user",
            content: turn.question,
            timestamp: new Date(turn.created_at),
          });
          loadedMessages.push({
            id: `assistant-${turn.id}`,
            role: "assistant",
            content: turn.answer,
            timestamp: new Date(turn.created_at),
          });
        });
      }
      setMessages(loadedMessages);
    } catch {
      toast.error("Failed to load conversation history.");
    }
  };

  // ── Select a conversation ──────────────────────────────────────────────────

  function handleSelectConversation(conv: ConversationSummary) {
    setActiveConvId(conv.id);
    loadConversationHistory(conv.id);
  }

  // ── New conversation ───────────────────────────────────────────────────────

  function handleNewConversation() {
    setActiveConvId(null);
    setMessages([
      {
        id: "system-new",
        role: "assistant",
        content: `Starting a **new conversation** for Document #${docId}. Ask me anything!`,
        timestamp: new Date(),
      },
    ]);
  }

  // ── Send message ───────────────────────────────────────────────────────────

  const sendMessage = async (content: string) => {
    if (!content.trim() || !docId) return;

    const token = getCookie(TOKEN_COOKIE);
    if (!token) {
      toast.error("You are not authenticated.");
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/query/${docId}`,
        {
          question: content.trim(),
          top_k: 5,
          conversation_id: activeConvId ?? undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data;

      // Track conversation id from response
      if (data.conversation_id && activeConvId !== data.conversation_id) {
        setActiveConvId(data.conversation_id);
        // Refresh conversation list to show new entry
        fetchConversations();
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        profile_used: data.profile_used,
        results: data.results,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            "Failed to get a response."
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ── Greeting message when docId first set ────────────────────────────────

  useEffect(() => {
    if (docId && messages.length === 0) {
      setMessages([
        {
          id: "greeting",
          role: "assistant",
          content: `Hello! I'm your AI reading companion for **Document #${docId}**.\n\nSelect a past conversation from the sidebar to continue, or ask me a new question below to start fresh.`,
          timestamp: new Date(),
        },
      ]);
    }
    if (!docId && messages.length === 0) {
      setMessages([
        {
          id: "no-doc",
          role: "assistant",
          content:
            "No book selected. Go to **My Library**, find a completed book, and click **Chat** to start a conversation.",
          timestamp: new Date(),
        },
      ]);
    }
  }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0B0D]">
      <ConversationsSidebar
        docId={docId}
        conversations={conversations}
        loadingConvs={loadingConvs}
        activeConvId={activeConvId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="glass-nav px-6 py-4 flex items-center gap-4">
          <Link href="/dashboard/library" className="lg:hidden text-[#94948E] hover:text-[#F5F5F0]">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/20 flex items-center justify-center text-xl flex-shrink-0">
            📚
          </div>
          <div>
            <p className="font-semibold text-[#F5F5F0] text-sm">
              {docId ? `Document #${docId}` : "No book selected"}
            </p>
            <p className="text-xs text-[#94948E]">
              {activeConvId
                ? `Conversation #${activeConvId} · AI Companion Active`
                : "New conversation"}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {docId && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                Active
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          <div className="max-w-2xl mx-auto w-full space-y-6">
            {messages.length === 0 && !docId && (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <span className="material-symbols-outlined text-[#94948E] text-5xl">
                  auto_stories
                </span>
                <p className="text-[#F5F5F0] font-semibold">No book selected</p>
                <Link
                  href="/dashboard/library"
                  className="text-sm text-[#F59E0B] hover:text-[#ffc174] transition-colors"
                >
                  Go to My Library →
                </Link>
              </div>
            )}

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
                  placeholder={
                    docId
                      ? "Ask anything about this book..."
                      : "Select a book from My Library first..."
                  }
                  disabled={!docId}
                  rows={1}
                  className="w-full bg-transparent text-[#F5F5F0] text-sm placeholder-[#94948E] resize-none focus:outline-none leading-relaxed disabled:opacity-50"
                  style={{ maxHeight: "120px" }}
                />
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping || !docId}
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

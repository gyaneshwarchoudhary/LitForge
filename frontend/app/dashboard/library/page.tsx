"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { TOKEN_COOKIE } from "@/lib/auth";
import { useRouter } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Document {
  id: number;
  user_id: number;
  filename: string;
  file_size: number;
  content_type: string;
  total_pages: number | null;
  total_chunks: number | null;
  processing_status: "processing" | "completed" | "failed" | string;
  created_at: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function bookEmoji(filename: string): string {
  const name = filename.toLowerCase();
  if (name.includes("habit")) return "🔬";
  if (name.includes("law")) return "⚖️";
  if (name.includes("money") || name.includes("rich")) return "💰";
  if (name.includes("mind") || name.includes("think")) return "🧠";
  if (name.includes("art") || name.includes("design")) return "🎨";
  if (name.includes("science") || name.includes("physics")) return "🔭";
  if (name.includes("history")) return "📜";
  if (name.includes("war") || name.includes("strategy")) return "⚔️";
  return "📚";
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar() {
  const navItems = [
    { icon: "grid_view", label: "Dashboard", href: "/dashboard", active: false },
    { icon: "person", label: "Profile", href: "/dashboard/profile", active: false },
    { icon: "auto_stories", label: "My Library", href: "/dashboard/library", active: true },
    { icon: "smart_toy", label: "AI Chat", href: "/dashboard/chat", active: false },
    { icon: "account_tree", label: "Knowledge Map", href: "/dashboard", active: false },
    { icon: "science", label: "Experiments", href: "/dashboard", active: false },
    { icon: "edit_note", label: "Journal", href: "/dashboard", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0e0e10] border-r border-[#262626] min-h-screen py-6 px-4 flex-shrink-0">
      <Link href="/" className="flex items-center gap-2 px-3 mb-8 group">
        <span
          className="material-symbols-outlined text-[#F59E0B] text-2xl group-hover:rotate-12 transition-transform duration-300"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          auto_stories
        </span>
        <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F59E0B]">
          LitForge
        </span>
      </Link>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              item.active
                ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                : "text-[#94948E] hover:text-[#F5F5F0] hover:bg-[#161618]"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{item.icon}</span>
            {item.label}
            {item.active && (
              <span className="ml-auto w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#262626] pt-4 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#161618] transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F5F5F0] truncate">User</p>
            <p className="text-xs text-[#94948E] truncate">Pro Plan</p>
          </div>
          <span className="material-symbols-outlined text-[#94948E] text-base">
            more_vert
          </span>
        </div>
      </div>
    </aside>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; classes: string; icon: string }> = {
    completed: {
      label: "Ready",
      classes: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      icon: "check_circle",
    },
    processing: {
      label: "Processing",
      classes: "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20",
      icon: "progress_activity",
    },
    failed: {
      label: "Failed",
      classes: "bg-red-500/10 text-red-400 border border-red-500/20",
      icon: "error",
    },
  };

  const cfg = map[status] ?? {
    label: status,
    classes: "bg-[#262626] text-[#94948E] border border-[#262626]",
    icon: "help",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${cfg.classes}`}
    >
      <span
        className={`material-symbols-outlined text-xs ${
          status === "processing" ? "animate-spin" : ""
        }`}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

// ── Book Card ─────────────────────────────────────────────────────────────────

function BookCard({ doc }: { doc: Document }) {
  const title = doc.filename.replace(/\.pdf$/i, "");

  return (
    <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4 hover:border-[#F59E0B]/20 transition-all duration-300 group">
      {/* Cover + title */}
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          {bookEmoji(doc.filename)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#F5F5F0] leading-snug line-clamp-2 group-hover:text-[#F59E0B] transition-colors">
            {title}
          </p>
          <p className="text-xs text-[#94948E] mt-1">{formatDate(doc.created_at)}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[#161618] rounded-lg py-2">
          <p className="text-xs font-semibold text-[#F5F5F0]">
            {doc.total_pages ?? "—"}
          </p>
          <p className="text-[10px] text-[#94948E] mt-0.5">Pages</p>
        </div>
        <div className="bg-[#161618] rounded-lg py-2">
          <p className="text-xs font-semibold text-[#F5F5F0]">
            {doc.total_chunks ?? "—"}
          </p>
          <p className="text-[10px] text-[#94948E] mt-0.5">Chunks</p>
        </div>
        <div className="bg-[#161618] rounded-lg py-2">
          <p className="text-xs font-semibold text-[#F5F5F0]">
            {formatBytes(doc.file_size)}
          </p>
          <p className="text-[10px] text-[#94948E] mt-0.5">Size</p>
        </div>
      </div>

      {/* Status + action */}
      <div className="flex items-center justify-between">
        <StatusBadge status={doc.processing_status} />
        {doc.processing_status === "completed" && (
          <Link
            href={`/dashboard/chat?docId=${doc.id}`}
            className="flex items-center gap-1 text-xs text-[#94948E] hover:text-[#F59E0B] transition-colors"
          >
            <span className="material-symbols-outlined text-sm">smart_toy</span>
            Chat
          </Link>
        )}
      </div>
    </div>
  );
}

// ── Upload Zone ───────────────────────────────────────────────────────────────

function UploadZone({
  onUploadSuccess,
}: {
  onUploadSuccess: (doc: Document) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }

    const token = getCookie(TOKEN_COOKIE);
    if (!token) {
      toast.error("You are not authenticated.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success(`"${file.name}" uploaded!`, {
        description: res.data.message ?? "Processing started in background.",
        icon: "📚",
      });
      onUploadSuccess(res.data as Document);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
            error.response?.data?.message ||
            "Upload failed."
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative glass-panel rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 border-2 border-dashed
        ${dragOver ? "border-[#F59E0B] bg-[#F59E0B]/5" : "border-[#262626] hover:border-[#F59E0B]/40 hover:bg-[#F59E0B]/3"}
        ${uploading ? "cursor-not-allowed opacity-80" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {uploading ? (
        <>
          {/* Themed spinner */}
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-[#262626]" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#F59E0B] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#F59E0B] text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_stories
              </span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#F5F5F0]">Uploading…</p>
            <p className="text-xs text-[#94948E] mt-1">
              Processing your PDF. This may take a moment.
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 flex items-center justify-center">
            <span className="material-symbols-outlined text-indigo-400 text-3xl">
              upload_file
            </span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-[#F5F5F0]">
              Drop a PDF here, or{" "}
              <span className="text-[#F59E0B]">click to browse</span>
            </p>
            <p className="text-xs text-[#94948E] mt-1">PDF only · 1 MB – 50 MB</p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Library Page ──────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDocs = React.useCallback(
    async (isRefresh = false) => {
      const token = getCookie(TOKEN_COOKIE);
      if (!token) {
        router.push("/login");
        return;
      }
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocs(res.data as Document[]);
        if (isRefresh)
          toast.success("Library refreshed.", { icon: "🔄" });
      } catch {
        toast.error("Failed to load your library.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router]
  );

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  function handleUploadSuccess(newDoc: Document) {
    setDocs((prev) => [newDoc, ...prev]);
  }

  const completed = docs.filter((d) => d.processing_status === "completed").length;
  const processing = docs.filter((d) => d.processing_status === "processing").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0B0D]">
      <Sidebar />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass-nav px-6 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
              My Library
            </h1>
            <p className="text-xs text-[#94948E]">
              {docs.length === 0
                ? "No books yet"
                : `${completed} ready · ${processing} processing`}
            </p>
          </div>

          <button
            onClick={() => fetchDocs(true)}
            disabled={refreshing || loading}
            title="Refresh library"
            className="w-9 h-9 rounded-xl bg-[#161618] border border-[#262626] flex items-center justify-center hover:border-[#F59E0B]/40 hover:text-[#F59E0B] text-[#94948E] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                refreshing ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
          </button>
        </div>

        <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl">
          {/* Upload zone */}
          <UploadZone onUploadSuccess={handleUploadSuccess} />

          {/* Book list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              {/* Themed spinner */}
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-[#262626]" />
                <div className="absolute inset-0 rounded-full border-4 border-t-[#F59E0B] animate-spin" />
              </div>
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#161618] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#94948E] text-3xl">
                  auto_stories
                </span>
              </div>
              <p className="text-[#F5F5F0] font-semibold">Your library is empty</p>
              <p className="text-sm text-[#94948E]">
                Upload your first PDF to get started.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F5F5F0]">
                  Your Books
                </h2>
                <span className="text-xs text-[#94948E]">
                  {docs.length} {docs.length === 1 ? "book" : "books"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {docs.map((doc) => (
                  <BookCard key={doc.id} doc={doc} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

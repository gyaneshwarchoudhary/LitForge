"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { TOKEN_COOKIE } from "@/lib/auth";
import { useRouter } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";

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
        className={`material-symbols-outlined text-xs ${status === "processing" ? "animate-spin" : ""
          }`}
      >
        {cfg.icon}
      </span>
      {cfg.label}
    </span>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────

function DeleteConfirmModal({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  // Close on backdrop click
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onCancel();
  }

  // Close on Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-[#2a2a2c] bg-[#131315] p-6 flex flex-col gap-5 shadow-2xl"
        style={{ animation: "modalIn 0.18s cubic-bezier(.4,0,.2,1) both" }}
      >
        {/* Icon */}
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-red-400 text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            delete_forever
          </span>
        </div>

        {/* Text */}
        <div className="text-center space-y-1.5">
          <h3 className="text-base font-semibold text-[#F5F5F0]">
            Delete document?
          </h3>
          <p className="text-sm text-[#94948E] leading-relaxed">
            <span className="font-medium text-[#F5F5F0]">&ldquo;{title}&rdquo;</span>{" "}
            will be permanently removed. This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-[#94948E] bg-[#1c1c1e] border border-[#2a2a2c] hover:border-[#3a3a3e] hover:text-[#F5F5F0] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 active:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                Deleting…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">delete</span>
                Delete
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.94) translateY(8px); }
          to   { opacity: 1; transform: scale(1)   translateY(0);    }
        }
      `}</style>
    </div>
  );
}

// ── Book Card ─────────────────────────────────────────────────────────────────

function BookCard({
  doc,
  onDelete,
}: {
  doc: Document;
  onDelete: (id: number) => void;
}) {
  const title = doc.filename.replace(/\.pdf$/i, "");
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    const token = getCookie(TOKEN_COOKIE);
    if (!token) {
      toast.error("You are not authenticated.");
      return;
    }

    setDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/documents/${doc.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`"${title}" deleted.`, { icon: "🗑️" });
      setShowModal(false);
      onDelete(doc.id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete document."
        );
      } else {
        toast.error("Something went wrong.");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {showModal && (
        <DeleteConfirmModal
          title={title}
          deleting={deleting}
          onCancel={() => !deleting && setShowModal(false)}
          onConfirm={confirmDelete}
        />
      )}

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

          {/* Delete button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowModal(true); }}
            title="Delete document"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-500/40 flex-shrink-0"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
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
    </>
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

  function handleDelete(id: number) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }

  const completed = docs.filter((d) => d.processing_status === "completed").length;
  const processing = docs.filter((d) => d.processing_status === "processing").length;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0B0D]">
      <DashboardSidebar />

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
              className={`material-symbols-outlined text-lg ${refreshing ? "animate-spin" : ""
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
                  <BookCard key={doc.id} doc={doc} onDelete={handleDelete} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - LitForge",
  description: "Your personal reading dashboard powered by AI.",
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  const navItems = [
    { icon: "grid_view", label: "Dashboard", href: "/dashboard", active: true },
    { icon: "person", label: "Profile", href: "/dashboard/profile", active: false },
    { icon: "auto_stories", label: "My Library", href: "/dashboard/library", active: false },
    { icon: "smart_toy", label: "AI Chat", href: "/dashboard/chat", active: false },
    { icon: "account_tree", label: "Knowledge Map", href: "/dashboard", active: false },
    { icon: "science", label: "Experiments", href: "/dashboard", active: false },
    { icon: "edit_note", label: "Journal", href: "/dashboard", active: false },
  ];

  return (
    <aside className="hidden lg:flex w-64 flex-col bg-[#0e0e10] border-r border-[#262626] min-h-screen py-6 px-4 flex-shrink-0">
      {/* Logo */}
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

      {/* Navigation */}
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

      {/* User profile */}
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

// ─── Stats Card ────────────────────────────────────────────────────────────────
function StatsCard({ icon, label, value, sub, color }: {
  icon: string; label: string; value: string; sub: string; color: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:border-[#F59E0B]/20 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-[#94948E] text-sm font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center`}>
          <span className="material-symbols-outlined text-lg">{icon}</span>
        </div>
      </div>
      <div>
        <p className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0]">
          {value}
        </p>
        <p className="text-xs text-[#94948E] mt-1">{sub}</p>
      </div>
    </div>
  );
}

// ─── Dashboard Page ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const currentBooks = [
    { title: "Atomic Habits", author: "James Clear", progress: 65, cover: "🔬" },
    { title: "Deep Work", author: "Cal Newport", progress: 32, cover: "🧠" },
    { title: "The Psychology of Money", author: "Morgan Housel", progress: 88, cover: "💰" },
  ];

  const recentInsights = [
    { book: "Atomic Habits", insight: "Apply the 2-minute rule to your morning journaling habit.", time: "2h ago" },
    { book: "Deep Work", insight: "Schedule your most cognitively demanding tasks before noon.", time: "Yesterday" },
    { book: "The Psychology of Money", insight: "Compounding works on behavior, not just money.", time: "2d ago" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0B0D]">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 glass-nav px-6 md:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F5F5F0]">
              Good morning! 👋
            </h1>
            <p className="text-xs text-[#94948E]">Here&apos;s your reading progress today</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-[#161618] border border-[#262626] flex items-center justify-center hover:border-[#F59E0B]/30 transition-colors">
              <span className="material-symbols-outlined text-[#94948E] text-lg">notifications</span>
            </button>
            <Link
              href="/dashboard/chat"
              className="flex items-center gap-2 bg-[#F59E0B] text-[#1a1000] px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#ffc174] transition-all duration-300 hover:scale-105"
            >
              <span className="material-symbols-outlined text-base">smart_toy</span>
              AI Chat
            </Link>
          </div>
        </div>

        <div className="px-6 md:px-8 py-8 space-y-8 max-w-5xl">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard icon="auto_stories" label="Books Read" value="24" sub="+3 this month" color="bg-[#F59E0B]/15 text-[#F59E0B]" />
            <StatsCard icon="local_fire_department" label="Day Streak" value="12" sub="Keep it up!" color="bg-orange-500/15 text-orange-400" />
            <StatsCard icon="lightbulb" label="Insights" value="147" sub="AI-personalized" color="bg-indigo-500/15 text-indigo-400" />
            <StatsCard icon="science" label="Experiments" value="8" sub="3 active" color="bg-emerald-500/15 text-emerald-400" />
          </div>

          {/* Current Reading */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F5F5F0]">
                Currently Reading
              </h2>
              <button className="text-xs text-[#F59E0B] hover:text-[#ffc174] transition-colors font-medium">
                View Library →
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {currentBooks.map((book) => (
                <div
                  key={book.title}
                  className="glass-panel rounded-2xl p-5 flex flex-col gap-4 hover:border-[#F59E0B]/20 transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#2a2a2c] flex items-center justify-center text-2xl flex-shrink-0">
                      {book.cover}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#F5F5F0] truncate group-hover:text-[#F59E0B] transition-colors">
                        {book.title}
                      </p>
                      <p className="text-xs text-[#94948E] truncate">{book.author}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs text-[#94948E]">Progress</span>
                      <span className="text-xs text-[#F59E0B] font-semibold">{book.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#2a2a2c] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-[#F59E0B] rounded-full transition-all duration-500"
                        style={{ width: `${book.progress}%` }}
                      />
                    </div>
                  </div>
                  <Link
                    href="/dashboard/chat"
                    className="flex items-center gap-1.5 text-xs text-[#94948E] hover:text-[#F59E0B] transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                    Chat with this book
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Recent AI Insights */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F5F5F0]">
                Recent AI Insights
              </h2>
              <button className="text-xs text-[#F59E0B] hover:text-[#ffc174] transition-colors font-medium">
                View All →
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {recentInsights.map((insight) => (
                <div
                  key={insight.book}
                  className="glass-panel rounded-xl p-5 flex items-start gap-4 hover:border-[#F59E0B]/20 transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[#F59E0B] text-sm">
                      lightbulb
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-[family-name:var(--font-mono)] text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
                        {insight.book}
                      </span>
                    </div>
                    <p className="text-sm text-[#F5F5F0] leading-relaxed">{insight.insight}</p>
                  </div>
                  <span className="text-xs text-[#94948E] flex-shrink-0">{insight.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 hover:border-[#F59E0B]/20 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-indigo-400 text-2xl">add_circle</span>
              </div>
              <div>
                <p className="font-semibold text-[#F5F5F0] mb-0.5">Add New Book</p>
                <p className="text-sm text-[#94948E]">Import a PDF, EPUB or search by title</p>
              </div>
            </div>
            <div className="glass-panel rounded-2xl p-6 flex items-center gap-5 hover:border-[#F59E0B]/20 transition-all duration-300 cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">science</span>
              </div>
              <div>
                <p className="font-semibold text-[#F5F5F0] mb-0.5">Start an Experiment</p>
                <p className="text-sm text-[#94948E]">Turn an insight into a measurable action</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

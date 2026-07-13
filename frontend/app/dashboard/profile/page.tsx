import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile - LitForge",
  description: "Manage your LitForge reading profile and preferences.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0B0B0D]">
      {/* Header */}
      <div className="glass-nav px-6 md:px-12 py-4 flex items-center gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[#94948E] hover:text-[#F5F5F0] transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Dashboard
        </Link>
        <div className="flex-1" />
        <Link href="/" className="flex items-center gap-2 group">
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
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-12 py-12">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] mb-2">
          Your Profile
        </h1>
        <p className="text-[#94948E] mb-8">
          Customize how LitForge personalizes insights for you.
        </p>

        {/* Avatar */}
        <div className="glass-panel rounded-2xl p-6 mb-6 flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
            U
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#F5F5F0] mb-1">Reader</h2>
            <p className="text-sm text-[#94948E] mb-3">user@example.com</p>
            <span className="bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-semibold px-3 py-1 rounded-full">
              Pro Plan
            </span>
          </div>
          <button className="border border-[#262626] text-[#94948E] hover:text-[#F5F5F0] hover:border-[#F59E0B]/30 px-4 py-2 rounded-xl text-sm transition-all duration-200">
            Edit Photo
          </button>
        </div>

        {/* Reading Goals */}
        <div className="glass-panel rounded-2xl p-6 mb-6">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F5F5F0] mb-4">
            Reading Goals & Context
          </h3>
          <p className="text-sm text-[#94948E] mb-4 leading-relaxed">
            Help LitForge personalize insights by telling us about your goals and current life context.
          </p>
          <textarea
            id="reading-goals"
            rows={4}
            placeholder="e.g., I want to build better habits, improve my productivity at work, and become a more empathetic leader..."
            className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all duration-200 resize-none leading-relaxed"
          />
          <button className="mt-4 bg-[#F59E0B] text-[#1a1000] px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#ffc174] transition-all duration-300 hover:scale-105">
            Save Goals
          </button>
        </div>

        {/* Reading Stats */}
        <div className="glass-panel rounded-2xl p-6">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F5F5F0] mb-5">
            Reading Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "auto_stories", label: "Books Read", value: "24" },
              { icon: "lightbulb", label: "AI Insights", value: "147" },
              { icon: "local_fire_department", label: "Day Streak", value: "12" },
              { icon: "science", label: "Experiments", value: "8" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-[#161618] rounded-xl p-4">
                <span className="material-symbols-outlined text-[#F59E0B] text-2xl mb-2 block">
                  {stat.icon}
                </span>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#94948E] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

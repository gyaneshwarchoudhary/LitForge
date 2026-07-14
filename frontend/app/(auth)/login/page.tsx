import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
// import axios from "axios";

export const metadata: Metadata = {
  title: "Sign In - LitForge",
  description: "Sign in to your LitForge account and continue your reading journey.",
};

export default function LoginPage() {


  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 relative">
        {/* Background glow */}
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mb-12 group w-fit">
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

        <div className="max-w-md w-full relative z-10">
          <div className="mb-8">
            <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] mb-2">
              Welcome back
            </h1>
            <p className="text-[#94948E] text-sm">
              Sign in to continue your reading journey.
            </p>
          </div>

          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94948E] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#94948E] uppercase tracking-wider">
                  Password
                </label>

              </div>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F59E0B] text-[#1a1000] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-[1.02] mt-2 glow-amber cursor-pointer"
            >
              Sign In →
            </button>
          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#262626]" />
            <span className="text-xs text-[#94948E]">or continue with</span>
            <div className="flex-1 h-px bg-[#262626]" />
          </div>  */}

          {/* /* OAuth buttons */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button
              id="google-signin"
              className="flex items-center justify-center gap-2 border border-[#262626] bg-[#161618] text-[#F5F5F0] py-3 rounded-xl text-sm font-medium hover:border-[#F59E0B]/30 hover:bg-[#1c1b1d] transition-all duration-200"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              id="github-signin"
              className="flex items-center justify-center gap-2 border border-[#262626] bg-[#161618] text-[#F5F5F0] py-3 rounded-xl text-sm font-medium hover:border-[#F59E0B]/30 hover:bg-[#1c1b1d] transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-[#F5F5F0]" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
          */}

          <p className="text-center text-sm text-[#94948E] mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-[#F59E0B] hover:text-[#ffc174] font-semibold transition-colors"
            >
              Sign up free
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual Panel */}
      <div className="hidden lg:flex flex-1 bg-[#0e0e10] border-l border-[#262626] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-[#F59E0B]/5 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-sm w-full">
          <div className="glass-panel rounded-2xl p-7 mb-6 glow-indigo">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#F59E0B]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_stories
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold">Currently Reading</p>
                <p className="text-xs text-[#94948E]">Thinking, Fast and Slow</p>
              </div>
            </div>
            <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4">
              <p className="text-xs font-[family-name:var(--font-mono)] text-[#F59E0B] mb-2 uppercase tracking-wide">
                Today&apos;s Insight
              </p>
              <p className="text-sm text-[#F5F5F0] leading-relaxed">
                Your System 1 is triggering the availability heuristic when
                reviewing this week&apos;s data. Try the pre-mortem technique.
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-[#94948E] text-sm leading-relaxed">
              &ldquo;Reading without applying is just collecting. LitForge
              bridges the gap.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

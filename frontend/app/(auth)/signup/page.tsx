import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - LitForge",
  description: "Join LitForge and start transforming books into personal growth with AI.",
};

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0B0B0D] flex">
      {/* Left: Visual Panel */}
      <div className="hidden lg:flex flex-1 bg-[#0e0e10] border-r border-[#262626] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-[#F59E0B]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10 max-w-sm w-full flex flex-col gap-6">
          {/* Feature list */}
          {[
            { icon: "smart_toy", title: "AI Book Companion", desc: "Deep conversations with any book" },
            { icon: "account_tree", title: "Knowledge Map", desc: "Connect ideas across your library" },
            { icon: "science", title: "Experiment Tracker", desc: "Turn insights into daily actions" },
          ].map((feat) => (
            <div key={feat.title} className="glass-panel rounded-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
                <span
                  className="material-symbols-outlined text-[#F59E0B] text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {feat.icon}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F5F5F0]">{feat.title}</p>
                <p className="text-xs text-[#94948E]">{feat.desc}</p>
              </div>
              <span className="material-symbols-outlined text-[#94948E] text-base ml-auto">
                check_circle
              </span>
            </div>
          ))}

          {/* Stats */}
          <div className="glass-panel rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
            {[
              { val: "2.4K+", label: "Readers" },
              { val: "18K+", label: "Books" },
              { val: "94%", label: "Satisfaction" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F59E0B]">
                  {stat.val}
                </p>
                <p className="text-xs text-[#94948E] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12 xl:px-24 relative">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-[#F59E0B]/5 rounded-full blur-[100px] pointer-events-none" />

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
              Start your journey
            </h1>
            <p className="text-[#94948E] text-sm">
              Create your free account. No credit card required.
            </p>
          </div>

          <form className="flex flex-col gap-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#94948E] uppercase tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                id="full-name"
                name="fullName"
                placeholder="Alex"
                className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all duration-200"
              />
            </div>

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
              <label className="text-xs font-semibold text-[#94948E] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 8 characters"
                className="w-full bg-[#161618] border border-[#262626] text-[#F5F5F0] placeholder-[#353437] rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B]/30 transition-all duration-200"
              />
            </div>

            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                className="mt-0.5 w-4 h-4 rounded border-[#262626] bg-[#161618] accent-[#F59E0B] cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-[#94948E] leading-relaxed cursor-pointer">
                I agree to the{" "}
                <a href="#" className="text-[#F59E0B] hover:text-[#ffc174] transition-colors">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-[#F59E0B] hover:text-[#ffc174] transition-colors">
                  Privacy Policy
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-[#F59E0B] text-[#1a1000] py-3.5 rounded-xl font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-[1.02] mt-1 glow-amber"
            >
              Create Free Account →
            </button>
          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#262626]" />
            <span className="text-xs text-[#94948E]">or sign up with</span>
            <div className="flex-1 h-px bg-[#262626]" />
          </div> */}

          {/* OAuth buttons */}
          {/* <div className="grid grid-cols-2 gap-3">
            <button
              id="google-signup"
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
              id="github-signup"
              className="flex items-center justify-center gap-2 border border-[#262626] bg-[#161618] text-[#F5F5F0] py-3 rounded-xl text-sm font-medium hover:border-[#F59E0B]/30 hover:bg-[#1c1b1d] transition-all duration-200"
            >
              <svg className="w-4 h-4 fill-[#F5F5F0]" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div> */}

          <p className="text-center text-sm text-[#94948E] mt-8">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-[#F59E0B] hover:text-[#ffc174] font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

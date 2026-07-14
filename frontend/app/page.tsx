import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// ─── Hero Section ────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center pt-24 pb-16 px-6 md:px-12 max-w-[1200px] mx-auto"
    >
      {/* Ambient glow background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] opacity-60" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-[#F59E0B]/5 rounded-full blur-[100px] opacity-40" />
      </div>

      <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10 w-full">
        {/* Left: Copy */}
        <div className="flex flex-col gap-6 fade-in-up">
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-3 py-1.5 rounded-full w-fit">
            AI-Powered Personalized Reading
          </span>

          <h1 className="font-[family-name:var(--font-display)] text-5xl md:text-6xl xl:text-7xl font-bold leading-[1.1] tracking-tight">
            Turn Books Into{" "}
            <br className="hidden md:block" />
            <span className="text-gradient-amber">Personal Growth.</span>
          </h1>

          <p className="text-lg text-[#94948E] max-w-lg leading-relaxed">
            Books are written for everyone. LitForge helps you understand what
            they mean <em>for you</em>. Transform generic advice into
            actionable insights tailored to your unique journey.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/signup"
              className="bg-[#F59E0B] text-[#1a1000] px-8 py-4 rounded-lg font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-105 glow-amber"
            >
              Start Your Journey →
            </Link>
            <a
              href="#how-it-works"
              className="border border-[#262626] bg-transparent text-[#F5F5F0] px-8 py-4 rounded-lg font-semibold text-sm hover:bg-[#161618] transition-colors duration-300"
            >
              See How It Works
            </a>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex -space-x-2">
              {["bg-indigo-500", "bg-amber-500", "bg-emerald-500", "bg-pink-500"].map(
                (color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-[#0B0B0D] flex items-center justify-center text-xs font-bold text-white`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                )
              )}
            </div>
            <span className="text-sm text-[#94948E]">
              <span className="text-[#F5F5F0] font-semibold">2,400+</span> readers
              already transforming through books
            </span>
          </div>
        </div>

        {/* Right: Visual */}
        <div className="relative w-full aspect-square md:aspect-[4/3] flex justify-center items-center floating-anim">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-amber-500/10 rounded-[30px] blur-2xl" />
          {/* Simulated UI card */}
          <div className="relative z-10 w-full max-w-sm glass-panel rounded-2xl p-6 glow-indigo">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/20 flex items-center justify-center">
                <span
                  className="material-symbols-outlined text-[#F59E0B] text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_stories
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F5F5F0]">Atomic Habits</p>
                <p className="text-xs text-[#94948E]">James Clear</p>
              </div>
              <span className="ml-auto text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                Reading
              </span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="bg-[#F59E0B]/5 border border-[#F59E0B]/20 rounded-xl p-4">
                <p className="text-xs font-[family-name:var(--font-mono)] text-[#F59E0B] mb-1 uppercase tracking-wide">
                  AI Insight for You
                </p>
                <p className="text-sm text-[#F5F5F0] leading-relaxed">
                  Based on your goal of building a morning routine, try the
                  2-minute rule: start with just making your bed.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-[#161618] rounded-lg p-3 border border-[#262626]">
                  <p className="text-xs text-[#94948E] mb-1">Progress</p>
                  <div className="w-full h-1.5 bg-[#2a2a2c] rounded-full">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-[#F59E0B] rounded-full w-[65%]" />
                  </div>
                  <p className="text-xs text-[#F5F5F0] mt-1 font-semibold">65%</p>
                </div>
                <div className="flex-1 bg-[#161618] rounded-lg p-3 border border-[#262626]">
                  <p className="text-xs text-[#94948E] mb-1">Streak</p>
                  <p className="text-2xl font-bold text-[#F59E0B] font-[family-name:var(--font-display)]">
                    12
                  </p>
                  <p className="text-xs text-[#94948E]">days</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#94948E]">
              <span className="material-symbols-outlined text-base text-[#F59E0B]">
                chat
              </span>
              Chatting with "Atomic Habits"…
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Value Props ─────────────────────────────────────────────────────────────
function ValueProps() {
  const props = [
    {
      icon: "psychology",
      title: "Understand",
      desc: "Extract the core concepts and mental models from dense non-fiction with AI-assisted clarity.",
    },
    {
      icon: "tune",
      title: "Personalize",
      desc: "Map insights directly to your personal context, goals, and current life challenges.",
    },
    {
      icon: "rocket_launch",
      title: "Apply",
      desc: "Generate concrete experiments and action plans to implement book wisdom into your daily life.",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
      <div className="grid md:grid-cols-3 gap-6">
        {props.map((p) => (
          <div
            key={p.title}
            className="glass-panel p-8 rounded-2xl flex flex-col gap-4 hover:border-[#F59E0B]/30 transition-all duration-300 group cursor-default"
          >
            <div className="w-12 h-12 rounded-full bg-[#2a2a2c] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span
                className="material-symbols-outlined text-[#F59E0B]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {p.icon}
              </span>
            </div>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              {p.title}
            </h3>
            <p className="text-[#94948E] text-sm leading-relaxed">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Features Bento Grid ─────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section
      id="features"
      className="max-w-[1200px] mx-auto px-6 md:px-12 py-24"
    >
      <div className="text-center mb-16">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] mb-4 block">
          Everything You Need
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-4">
          The Quiet Architect of{" "}
          <span className="text-gradient-amber">Your Mind</span>
        </h2>
        <p className="text-lg text-[#94948E] max-w-2xl mx-auto leading-relaxed">
          A calm, focused workspace designed for deep intellectual rigor and
          personal evolution.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
        {/* AI Companion - Large */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between group hover:border-[#F59E0B]/30 transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#c3c0ff] text-xl">
                  smart_toy
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                AI Companion
              </h3>
            </div>
            <p className="text-[#94948E] text-sm leading-relaxed">
              Have deep, Socratic dialogues with books. Ask questions, challenge
              ideas, and get personalized explanations tailored to your goals.
            </p>
          </div>
          <div className="relative z-10 self-end w-3/4 h-28 bg-[#161618] rounded-tl-xl border-t border-l border-[#262626] overflow-hidden flex justify-end items-end p-4">
            <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] bg-[#F59E0B]/10 px-3 py-1 rounded-full border border-[#F59E0B]/20">
              Chatting with "Atomic Habits"
            </span>
          </div>
        </div>

        {/* Knowledge Map */}
        <div className="glass-panel rounded-2xl p-8 flex flex-col border border-[#262626] justify-between hover:border-[#F59E0B]/30 transition-all duration-300 group">
          <div>
            <span
              className="material-symbols-outlined text-3xl mb-4 text-[#ffc174] block"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              account_tree
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">
              Knowledge Map
            </h3>
          </div>
          <p className="text-[#94948E] text-sm leading-relaxed">
            Visually connect concepts across different books to form a unified
            worldview.
          </p>
        </div>

        {/* Reading Journal */}
        <div className="glass-panel rounded-2xl p-8 flex flex-col border border-[#262626] justify-between hover:border-[#F59E0B]/30 transition-all duration-300 group">
          <div>
            <span
              className="material-symbols-outlined text-3xl mb-4 text-[#ffc174] block"
              style={{ fontVariationSettings: "'FILL' 0" }}
            >
              edit_note
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold mb-2">
              Reading Journal
            </h3>
          </div>
          <p className="text-[#94948E] text-sm leading-relaxed">
            Capture your reflections and &ldquo;aha&rdquo; moments in a
            distraction-free markdown editor.
          </p>
        </div>

        {/* Experiment Tracker - Large */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-8 relative overflow-hidden flex items-center gap-8 border border-[#262626] hover:border-[#F59E0B]/30 transition-all duration-300">
          <div className="flex-1 z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-400 text-xl">
                  science
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold">
                Experiment Tracker
              </h3>
            </div>
            <p className="text-[#94948E] text-sm leading-relaxed">
              Don&apos;t just read—do. Track the implementation of ideas with
              structured, measurable micro-experiments.
            </p>
          </div>
          <div className="w-1/3 flex flex-col gap-3 opacity-70">
            {[
              { label: "Morning Ritual", pct: "75%" },
              { label: "Deep Work Block", pct: "50%" },
              { label: "Reflection Time", pct: "85%" },
            ].map((exp) => (
              <div key={exp.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-[#94948E]">{exp.label}</span>
                  <span className="text-xs text-[#F59E0B] font-semibold">
                    {exp.pct}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#2a2a2c] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-[#F59E0B] rounded-full transition-all"
                    style={{ width: exp.pct }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: "upload_file",
      title: "Upload Your Book",
      desc: "Import any book via PDF, EPUB, or simply type the title. LitForge handles the rest.",
    },
    {
      num: "02",
      icon: "manage_accounts",
      title: "Share Your Context",
      desc: "Tell us your goals, challenges, and what you hope to achieve. The more you share, the more personalized your experience.",
    },
    {
      num: "03",
      icon: "psychology",
      title: "Get AI Insights",
      desc: "Our AI distills the most relevant lessons for your specific situation, not generic summaries.",
    },
    {
      num: "04",
      icon: "rocket_launch",
      title: "Take Action",
      desc: "Use structured experiments and daily prompts to turn knowledge into real-world results.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="max-w-[1200px] mx-auto px-6 md:px-12 py-24"
    >
      <div className="text-center mb-16">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] mb-4 block">
          How It Works
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-4">
          From Page to{" "}
          <span className="text-gradient-amber">Practice</span>
        </h2>
        <p className="text-lg text-[#94948E] max-w-xl mx-auto leading-relaxed">
          Four simple steps that bridge the gap between reading and doing.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, i) => (
          <div key={step.num} className="relative group">
            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className="hidden lg:block absolute top-6 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-[#262626] to-transparent z-0" />
            )}
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4 hover:border-[#F59E0B]/30 transition-all duration-300 relative z-10 h-full">
              <div className="flex items-center justify-between">
                <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B]/50 font-bold tracking-wider">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] flex items-center justify-center group-hover:bg-[#F59E0B]/10 transition-colors duration-300">
                  <span className="material-symbols-outlined text-[#F59E0B] text-xl">
                    {step.icon}
                  </span>
                </div>
              </div>
              <h3 className="font-[family-name:var(--font-display)] font-semibold text-lg">
                {step.title}
              </h3>
              <p className="text-[#94948E] text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    {
      name: "Priya Sharma",
      role: "Product Designer",
      avatar: "P",
      color: "bg-indigo-500",
      text: "LitForge completely changed how I read. I used to highlight everything and forget it all. Now I actually apply what I learn.",
    },
    {
      name: "Marcus Chen",
      role: "Entrepreneur",
      avatar: "M",
      color: "bg-amber-500",
      text: "The AI companion is like having a personal tutor for every book. It asks the right questions that make me think deeper.",
    },
    {
      name: "Sarah Mitchell",
      role: "PhD Student",
      avatar: "S",
      color: "bg-emerald-500",
      text: "The knowledge map feature alone is worth it. Seeing how 'Thinking Fast and Slow' connects to 'Atomic Habits' was mind-blowing.",
    },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-6 md:px-12 py-24">
      <div className="text-center mb-16">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] mb-4 block">
          Reader Stories
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold">
          Real Readers.{" "}
          <span className="text-gradient-amber">Real Transformation.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.name}
            className="glass-panel rounded-2xl p-7 flex flex-col gap-5 hover:border-[#F59E0B]/20 transition-all duration-300"
          >
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-[#F59E0B] text-sm">
                  ★
                </span>
              ))}
            </div>
            <p className="text-[#94948E] text-sm leading-relaxed flex-1 italic">
              &ldquo;{t.text}&rdquo;
            </p>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-white font-bold text-sm border-2 border-[#0B0B0D]`}
              >
                {t.avatar}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F5F5F0]">{t.name}</p>
                <p className="text-xs text-[#94948E]">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
/*
function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      desc: "Perfect for curious readers just getting started.",
      features: ["3 books per month", "Basic AI insights", "Reading journal", "Progress tracking"],
      cta: "Get Started Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      desc: "For serious readers who want maximum growth.",
      features: [
        "Unlimited books",
        "Deep AI companion",
        "Knowledge map",
        "Experiment tracker",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlight: true,
    },
    {
      name: "Team",
      price: "$29",
      period: "per month",
      desc: "For book clubs and learning teams.",
      features: [
        "Everything in Pro",
        "Up to 10 members",
        "Shared knowledge maps",
        "Group experiments",
        "Dedicated support",
      ],
      cta: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="max-w-[1200px] mx-auto px-6 md:px-12 py-24"
    >
      <div className="text-center mb-16">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] mb-4 block">
          Simple Pricing
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-4">
          Invest in Your{" "}
          <span className="text-gradient-amber">Intellectual Growth</span>
        </h2>
        <p className="text-lg text-[#94948E] max-w-xl mx-auto">
          Choose the plan that matches your reading ambition.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl p-8 flex flex-col gap-6 transition-all duration-300 ${
              plan.highlight
                ? "bg-[#161618] border-2 border-[#F59E0B]/50 glow-amber relative"
                : "glass-panel hover:border-[#F59E0B]/20"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[#F59E0B] text-[#1a1000] text-xs font-bold px-4 py-1 rounded-full tracking-wide uppercase">
                  Most Popular
                </span>
              </div>
            )}
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold mb-1">
                {plan.name}
              </h3>
              <p className="text-[#94948E] text-sm">{plan.desc}</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#F59E0B]">
                {plan.price}
              </span>
              <span className="text-[#94948E] text-sm">/{plan.period}</span>
            </div>
            <ul className="flex flex-col gap-3 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <span className="material-symbols-outlined text-emerald-400 text-base">
                    check_circle
                  </span>
                  <span className="text-[#94948E]">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/signup"
              className={`text-center py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 ${
                plan.highlight
                  ? "bg-[#F59E0B] text-[#1a1000] hover:bg-[#ffc174] hover:scale-105"
                  : "border border-[#262626] text-[#F5F5F0] hover:bg-[#161618] hover:border-[#F59E0B]/30"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}




*/
// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="border-t border-[#262626] bg-[#161618]/30 relative overflow-hidden">
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
        <div className="w-full max-w-4xl h-64 bg-[#F59E0B]/5 blur-[100px] rounded-full" />
        <div className="absolute w-full max-w-2xl h-48 bg-indigo-500/5 blur-[80px] rounded-full" />
      </div>
      <div className="max-w-3xl mx-auto px-6 md:px-12 py-32 text-center relative z-10">
        <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] mb-6 block">
          Ready to Begin?
        </span>
        <h2 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Stop Collecting Books.
          <br />
          <span className="text-gradient-amber">Start Transforming</span>{" "}
          Through Them.
        </h2>
        <p className="text-lg text-[#94948E] mb-10 max-w-xl mx-auto leading-relaxed">
          Join a community of thinkers turning knowledge into action. Begin
          your personalized intellectual journey today—free for 14 days.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-[#F59E0B] text-[#1a1000] px-10 py-4 rounded-lg font-semibold text-sm hover:bg-[#ffc174] transition-all duration-300 hover:scale-105 glow-amber"
          >
            Start Your Free Trial →
          </Link>
          <a
            href="#features"
            className="border border-[#262626] text-[#F5F5F0] px-10 py-4 rounded-lg font-semibold text-sm hover:bg-[#161618] transition-colors duration-300"
          >
            Explore Features
          </a>
        </div>
        <p className="text-xs text-[#94948E] mt-6">
          No credit card required • Cancel anytime • Free forever plan available
        </p>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <ValueProps />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        {/* <Pricing /> */}
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}

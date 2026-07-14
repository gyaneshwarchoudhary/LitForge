"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
        ? "glass-nav shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-[1200px] mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer group">
          <span
            className="material-symbols-outlined text-[#F59E0B] text-2xl transition-transform duration-300 group-hover:rotate-12"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_stories
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl font-bold text-[#F59E0B] tracking-tight">
            LitForge
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-[#94948E] hover:text-[#F5F5F0] transition-colors duration-200 text-sm font-medium"
            >
              {item}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-[#94948E] hover:text-[#F5F5F0] transition-colors duration-200 text-sm font-medium px-4 py-2"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="bg-[#F59E0B] text-[#1a1000] px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#ffc174] transition-all duration-300 hover:scale-105 glow-amber"
          >
            Start Reading Smarter
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-[#94948E] hover:text-[#F5F5F0] hover:bg-[#201f21] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden glass-nav border-t border-[#262626] px-6 py-4 flex flex-col gap-4">
          {["Features", "How It Works", "Blog"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-[#94948E] hover:text-[#F5F5F0] text-sm font-medium py-2 border-b border-[#262626]/50"
              onClick={() => setMobileOpen(false)}
            >
              {item}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <Link
              href="/login"
              className="text-center border border-[#262626] text-[#F5F5F0] py-2.5 rounded-lg text-sm font-medium hover:bg-[#161618] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-center bg-[#F59E0B] text-[#1a1000] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#ffc174] transition-colors"
            >
              Start Reading Smarter
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

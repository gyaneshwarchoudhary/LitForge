"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { TOKEN_COOKIE, isTokenExpired, signOut } from "@/lib/auth";

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { icon: "grid_view", label: "Dashboard", href: "/dashboard" },
  { icon: "person", label: "Profile", href: "/dashboard/profile" },
  { icon: "auto_stories", label: "My Library", href: "/dashboard/library" },
  { icon: "smart_toy", label: "AI Chat", href: "/dashboard/chat" },

];

export default function DashboardSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  // ── Token expiry guard ─────────────────────────────────────────────────────
  useEffect(() => {
    const token = getCookie(TOKEN_COOKIE);
    if (isTokenExpired(token)) {
      // Clear stale cookie then redirect to login
      document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
      router.replace("/login?reason=expired");
    }
  }, [router]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  function handleSignOut() {
    signOut(); // clears cookie + redirects to "/"
  }

  function isActive(href: string) {
    // Exact match for /dashboard, prefix match for sub-routes
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

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
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active
                  ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                  : "text-[#94948E] hover:text-[#F5F5F0] hover:bg-[#161618]"
                }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 bg-[#F59E0B] rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user + sign-out */}
      <div className="border-t border-[#262626] pt-4 mt-4 flex flex-col gap-2">
        {/* User row */}
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#161618] transition-colors">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            U
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F5F5F0] truncate">User</p>
            <p className="text-xs text-[#94948E] truncate">Pro Plan</p>
          </div>
        </div>

        {/* Sign out button */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#94948E] hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 w-full text-left group"
        >
          <span className="material-symbols-outlined text-xl group-hover:text-red-400 transition-colors">
            logout
          </span>
          Sign out
        </button>
      </div>
    </aside>
  );
}

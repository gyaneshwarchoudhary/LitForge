import React from "react";
import Link from "next/link";

const footerLinks = {
  // Product: ["Features", "How It Works", "Pricing", "Changelog", "Roadmap"],
  Product: ["Features", "How It Works"],
  Company: ["About", "Blog"],
  Legal: ["Privacy Policy", "Terms of Service",],
  Social: ["Twitter / X", "LinkedIn", "GitHub", "Discord"],
};

const Footer = () => {
  return (
    <footer className="bg-[#0e0e10] w-full py-20 border-t border-[#262626]">
      <div className="max-w-[1200px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1 flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
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
            <p className="text-xs text-[#94948E] leading-relaxed max-w-[200px]">
              Transforming knowledge into action, one book at a time.
            </p>
            <p className="text-xs text-[#94948E] mt-auto">
              © {new Date().getFullYear()} LitForge. All rights reserved.
            </p>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section} className="flex flex-col gap-3">
              <span className="font-[family-name:var(--font-mono)] text-xs text-[#F59E0B] uppercase tracking-[0.1em] mb-1">
                {section}
              </span>
              {links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-[#94948E] hover:text-[#F5F5F0] transition-colors duration-200"
                >
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#262626] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#94948E]">
            Built with ❤️ for lifelong learners.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-emerald-400">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

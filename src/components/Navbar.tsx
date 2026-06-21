"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import company from "@/data/company.json";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/handbook", label: "Handbook" },
  { href: "/assets", label: "Assets" },
  { href: "/agent-hub", label: "AI Hub" },
  { href: "/marketing-ai", label: "Marketing AI" },
  { href: "/ai-prompt-studio", label: "AI Prompt Studio" },
  { href: "/data", label: "API" },
  { href: "/changelog", label: "Changelog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const openPalette = () => {
    window.dispatchEvent(new CustomEvent("cmd:open"));
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[var(--color-bg-secondary)]/90 backdrop-blur-xl border-b border-[var(--color-border-primary)]/80 shadow-sm"
          : "bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-primary)]/50"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo / Brand */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span className="text-white text-[0.625rem] font-extrabold tracking-tight">RJ</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-neutral-800 tracking-tight leading-tight">
                BYD Miri Knowledge Base Masterbook
              </p>
              <p className="text-[0.6rem] text-neutral-400 font-medium leading-tight -mt-0.5">
                {company.company}
              </p>
            </div>
          </Link>

          {/* Nav Links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={openPalette}
              aria-label="Open command palette"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-neutral-400 bg-neutral-50 border border-neutral-200/60 hover:border-neutral-300 hover:text-neutral-500 transition-all w-48 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span className="flex-1 text-left">Search...</span>
              <kbd>⌘K</kbd>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 transition-colors cursor-pointer touch-target"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {menuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </>
                ) : (
                  <>
                    <line x1="4" y1="6" x2="20" y2="6"/>
                    <line x1="4" y1="12" x2="20" y2="12"/>
                    <line x1="4" y1="18" x2="20" y2="18"/>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="md:hidden pb-4 border-t border-neutral-100 pt-3 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={openPalette}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer touch-target"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Search
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

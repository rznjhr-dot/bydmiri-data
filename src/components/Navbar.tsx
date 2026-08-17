"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/pricelist", label: "Pricelist" },
  { href: "/rjeos", label: "RJEOS" },
  { href: "/admin", label: "Database Admin" },
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
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--color-bg-secondary)]/85 backdrop-blur-xl border-b border-[var(--color-border-primary)] shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
          : "bg-[var(--color-bg-secondary)]/70 backdrop-blur-md border-b border-[var(--color-border-primary)]/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo / Brand */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-[#0f2f7d] flex items-center justify-center shadow-[0_2px_8px_rgba(29,78,216,0.35)] group-hover:shadow-[0_4px_14px_rgba(29,78,216,0.45)] transition-shadow">
              <span className="text-white text-[0.7rem] font-extrabold tracking-tight">RJ</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
                Ridzuan &middot; BYD Miri
              </p>
              <p className="text-[0.7rem] text-[var(--color-text-tertiary)] font-medium leading-tight -mt-0.5">
                Personal Database
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
                  className={`nav-pill ${isActive ? "nav-pill-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button
              onClick={openPalette}
              aria-label="Open command palette"
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm text-[var(--color-text-tertiary)] bg-[var(--color-bg-tertiary)]/60 border border-[var(--color-border-primary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-secondary)] transition-all w-48 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span className="flex-1 text-left">Search...</span>
              <kbd>⌘K</kbd>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer touch-target"
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
          <nav className="md:hidden pb-4 border-t border-[var(--color-border-primary)] pt-3 space-y-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--color-accent-light)] text-[var(--color-accent)] font-semibold"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-tertiary)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={openPalette}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors cursor-pointer touch-target"
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

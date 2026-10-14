"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/pricelist", label: "Pricelist" },
  { href: "/ehakmilik", label: "e-Hakmilik" },
  { href: "/rco", label: "RCO" },
  { href: "/jpj", label: "JPJ Check" },
  { href: "/live-script", label: "Live Script" },
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
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-[var(--color-border-primary)]"
          : "bg-white/70 backdrop-blur-md border-[var(--color-border-secondary)]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14">
          {/* Brand */}
          <Link
            href="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-7 h-7 bg-[var(--color-figure-black)] flex items-center justify-center">
              <span className="text-white text-[0.6rem] font-bold tracking-tight">RJ</span>
            </div>
            <div className="hidden sm:block leading-none">
              <p className="label text-[0.7rem] text-[var(--color-text-primary)]">
                Ridzuan &middot; BYD Miri
              </p>
              <p className="text-[0.6rem] text-[var(--color-text-tertiary)] mt-1">
                Personal Database
              </p>
            </div>
          </Link>

          {/* Nav (desktop) */}
          <nav className="hidden lg:flex items-center gap-0.5">
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

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={openPalette}
              aria-label="Open command palette"
              className="hidden sm:flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-[var(--radius-xl)] text-[0.7rem] text-[var(--color-text-tertiary)] border border-[var(--color-border-primary)] hover:border-[var(--color-figure-black)] hover:text-[var(--color-figure-black)] transition-colors w-40 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <span className="flex-1 text-left label text-[0.6rem]">Search</span>
              <kbd>⌘K</kbd>
            </button>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-figure-black)] transition-colors cursor-pointer touch-target"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          <nav className="lg:hidden py-3 border-t border-[var(--color-border-primary)]">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block px-3 py-2.5 label text-[0.7rem] transition-colors ${
                    isActive
                      ? "text-[var(--color-figure-black)]"
                      : "text-[var(--color-text-tertiary)] hover:text-[var(--color-figure-black)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <button
              onClick={openPalette}
              className="w-full flex items-center gap-2 px-3 py-2.5 label text-[0.7rem] text-[var(--color-text-tertiary)] hover:text-[var(--color-figure-black)] transition-colors cursor-pointer touch-target"
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              Search
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}

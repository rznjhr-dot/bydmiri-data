"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import vehicles from "@/data/vehicles.json";

type SearchItem = {
  label: string;
  description: string;
  href: string;
  category: string;
};

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const allItems: SearchItem[] = [
    { label: "Dashboard", description: "Home overview", href: "/", category: "Page" },
    { label: "Vehicles", description: "All vehicle models", href: "/vehicles", category: "Page" },
    { label: "Handbook", description: "Master handbook", href: "/handbook", category: "Page" },
    { label: "API / Data", description: "Machine-readable JSON endpoints", href: "/data", category: "Page" },
    { label: "Changelog", description: "Version history", href: "/changelog", category: "Page" },
    ...vehicles.flatMap((v) =>
      v.variants.map((var_, i) => ({
        label: `${v.model} ${var_.name}`,
        description: `RM${var_.otr.toLocaleString()} · ${var_.range}km range`,
        href: `/vehicles?model=${encodeURIComponent(v.model)}&variant=${i}`,
        category: "Vehicle",
      }))
    ),
  ];

  const filtered = query.trim()
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.description.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("cmd:open", handler);
    return () => window.removeEventListener("cmd:open", handler);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh]"
      onClick={() => setOpen(false)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-dialog border border-neutral-200 overflow-hidden animate-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-neutral-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-300 shrink-0">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search vehicles, pages, pricing..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 py-3.5 text-sm bg-transparent outline-none text-neutral-800 placeholder:text-neutral-400"
          />
          <kbd className="text-[0.6rem]">ESC</kbd>
        </div>

        {filtered.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-neutral-400">
            No results for &ldquo;{query}&rdquo;
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto p-2 space-y-0.5">
            {filtered.map((item, i) => (
              <button
                key={`${item.href}-${i}`}
                onClick={() => navigate(item.href)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer ${
                  i === selectedIndex
                    ? "bg-accent/10 text-accent"
                    : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <span
                  className={`text-[0.6rem] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                    item.category === "Vehicle"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {item.category}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

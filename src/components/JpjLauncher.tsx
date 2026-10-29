"use client";

/**
 * JPJ Checker launcher button.
 *
 * The checker runs locally (Streamlit on :8501). This button:
 *  1. Checks if the server is already up (fetch with 700ms timeout).
 *  2. If up   → opens http://localhost:8501 in a new tab. Done.
 *  3. If down → triggers the custom URL scheme jpjchecker:// which
 *     launches the "JPJ Checker.app" bundle in ~/Applications; the app
 *     starts the Streamlit server, and this page polls until it's live
 *     then opens the tab for you.
 *
 * If the app isn't installed, the scheme click does nothing visible —
 * the UI falls back to a plain link with instructions.
 */
import { useEffect, useRef, useState } from "react";

const CHECKER_URL = "http://localhost:8501";
const SCHEME_URL = "jpjchecker://launch";
const POLL_MS = 1200;
const POLL_TIMEOUT_MS = 60_000;

type Status = "idle" | "checking" | "launching" | "up" | "timeout";

export default function JpjLauncher() {
  const [status, setStatus] = useState<Status>("idle");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkUp = async (): Promise<boolean> => {
    try {
      await fetch(`${CHECKER_URL}/_stcore/health`, {
        mode: "no-cors",
        signal: AbortSignal.timeout(1200),
      });
      return true; // any response (even opaque) = server alive
    } catch {
      return false;
    }
  };

  useEffect(() => {
    (async () => {
      setStatus("checking");
      if (await checkUp()) setStatus("up");
      else setStatus("idle");
    })();
  }, []);

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    []
  );

  const openChecker = () => {
    window.open(CHECKER_URL, "_blank", "noopener");
  };

  const startLaunch = async () => {
    const up = await checkUp();
    if (up) {
      openChecker();
      return;
    }
    setStatus("launching");
    // Fire the custom scheme — macOS shows a prompt the first time,
    // then launches JPJ Checker.app which boots the server.
    window.location.href = SCHEME_URL;
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    pollRef.current = setInterval(async () => {
      if (await checkUp()) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("up");
        openChecker();
      } else if (Date.now() > deadline) {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("timeout");
      }
    }, POLL_MS);
  };

  const busy = status === "launching" || status === "checking";
  const online = status === "up";

  const copy: Record<Status, { title: string; hint: string }> = {
    idle: {
      title: "Launch JPJ Checker",
      hint: "Starts the app and opens localhost:8501",
    },
    checking: {
      title: "Checking status…",
      hint: "Looking for a running instance",
    },
    launching: {
      title: "Starting JPJ Checker…",
      hint: "Terminal is open — this can take a few seconds",
    },
    up: {
      title: "Open JPJ Checker",
      hint: "Already running on localhost:8501",
    },
    timeout: {
      title: "Retry launch",
      hint: "No response within 60 seconds",
    },
  };

  const current = copy[status];

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={startLaunch}
        disabled={busy}
        className={`
          group flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left
          transition-all duration-150 cursor-pointer
          ${
            online
              ? "border-[var(--color-figure-black)] bg-white text-[var(--color-figure-black)] hover:bg-[var(--color-neutral-50)]"
              : "border-[var(--color-figure-black)] bg-[var(--color-figure-black)] text-white hover:bg-[var(--color-absolute-black)]"
          }
          ${busy ? "cursor-wait opacity-70" : "active:scale-[0.995]"}
        `}
      >
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition-colors ${
            online
              ? "border-[var(--color-figure-black)] bg-[var(--color-figure-black)] text-white"
              : "border-white/20 bg-white/10 text-white"
          }`}
        >
          {busy ? (
            <Spinner />
          ) : online ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17 17 7"/><path d="M7 7h10v10"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3"/><path d="M13 15h5"/></svg>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span
            aria-live="polite"
            className="flex items-center gap-2 text-sm font-semibold leading-tight"
          >
            {online && (
              <span className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current animate-pulse" />
            )}
            {current.title}
          </span>
          <span
            className={`mt-0.5 block text-[0.68rem] leading-snug ${
              online ? "text-[var(--color-text-tertiary)]" : "text-white/60"
            }`}
          >
            {current.hint}
          </span>
        </span>

        {!busy && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={`shrink-0 transition-transform duration-150 group-hover:translate-x-0.5 ${
              online ? "text-[var(--color-figure-black)]/60" : "text-white/70"
            }`}
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        )}
      </button>

      {status === "timeout" && (
        <p className="text-xs text-[var(--color-text-tertiary)] leading-relaxed">
          Still booting after 60s. Check the Terminal window on the Mac (or open{" "}
          <a href={CHECKER_URL} className="underline" target="_blank" rel="noopener noreferrer">
            localhost:8501
          </a>{" "}
          manually).
        </p>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

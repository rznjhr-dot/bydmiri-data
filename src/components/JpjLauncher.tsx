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

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={startLaunch}
        disabled={busy}
        className={`
          inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
          transition-all cursor-pointer border
          ${
            status === "up"
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] hover:brightness-110"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] border-[var(--color-border-primary)] hover:border-[var(--color-accent)]"
          }
          ${busy ? "opacity-60 cursor-wait" : ""}
        `}
      >
        {status === "up" && (
          <span className="inline-block w-2 h-2 rounded-full bg-[var(--color-figure-black)] animate-pulse" />
        )}
        {status === "launching" && <Spinner />}
        {status === "checking" && <Spinner />}
        {status === "up"
          ? "JPJ Checker — Online, Click to Open"
          : status === "launching"
            ? "Booting JPJ Checker…"
            : "Launch JPJ Checker"}
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

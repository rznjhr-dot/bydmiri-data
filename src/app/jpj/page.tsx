import type { Metadata } from "next";
import JpjLauncher from "@/components/JpjLauncher";
import JpjRunningNumbers from "@/components/JpjRunningNumbers";
import { PageSection, PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "JPJ Checker · BYD Miri",
  description:
    "Check registration-number availability across 32 Malaysian states with the local JPJ Checker.",
};

export default function JpjPage() {
  return (
    <PageShell
      eyebrow="Local tool · macOS"
      title="JPJ Checker"
      description="Check a registration number across 32 states — runs locally on this Mac."
      width="wide"
    >
        {/* Current running numbers (live from JPJ.my) */}
        <JpjRunningNumbers />

        {/* Launcher */}
        <PageSection
          eyebrow="Start here"
          title="Launch JPJ Checker"
          description="Start the JPJ Checker on this Mac. Terminal opens once while the app boots, then your browser follows automatically. If it's already running, it opens right away."
          flush
        >
          <div className="bg-[var(--color-bg-tertiary)]/40 px-5 py-4 sm:px-6">
            <JpjLauncher />
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.62rem] font-medium uppercase tracking-[0.08em] text-[var(--color-text-tertiary)]">
              <span>Runs locally</span>
              <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[var(--color-border-primary)] sm:block" />
              <span>Terminal opens once</span>
              <span aria-hidden="true" className="hidden h-1 w-1 rounded-full bg-[var(--color-border-primary)] sm:block" />
              <span>localhost:8501</span>
            </div>
          </div>
        </PageSection>

        {/* How it works */}
        <PageSection
          eyebrow="Workflow"
          title="How it works"
          description="Four steps from plate number to a copy-ready result."
          flush
        >
          <ol className="divide-y divide-[var(--color-border-primary)]/60 px-5 sm:px-6">
            {[
              {
                title: "Enter a number",
                body: (
                  <>
                    Type the registration number (for example,{" "}
                    <code className="px-1 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs">888</code>
                    ) and select Cari.
                  </>
                ),
              },
              {
                title: "Sign in to JPJ",
                body: "A JPJ window opens. Sign in once with your password and CAPTCHA.",
              },
              {
                title: "Let the scan run",
                body: "The window minimises while the 32-state check runs in the background.",
              },
              {
                title: "Review the results",
                body: "Available and unavailable plates appear as cards, with a customer-ready summary you can copy.",
              },
            ].map((step, index) => (
              <li key={step.title} className="flex gap-3 py-3 first:pt-4 last:pb-4">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[var(--color-border-primary)] bg-[var(--color-bg-tertiary)] text-[0.65rem] font-semibold text-[var(--color-text-tertiary)]">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)] leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </PageSection>

        {/* Troubleshooting */}
        <PageSection
          eyebrow="Support"
          title="Troubleshooting"
          description="Common issues when the app will not start or connect."
          flush
        >
          <ul className="divide-y divide-[var(--color-border-primary)]/60 px-5 sm:px-6">
            <li className="py-3 first:pt-4">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                The launch button does nothing
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)] leading-relaxed">
                Open{" "}
                <code className="px-1 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs">~/Applications/JPJ Checker.app</code>{" "}
                once manually so macOS trusts it. The button works after that.
              </p>
            </li>
            <li className="py-3">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                The server does not start
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)] leading-relaxed">
                Check the log at{" "}
                <code className="px-1 rounded bg-[var(--color-bg-tertiary)] font-mono text-xs">~/.jpj_checker.log</code>{" "}
                for the startup error.
              </p>
            </li>
            <li className="py-3 last:pb-4">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                Available on this Mac only
              </p>
              <p className="mt-0.5 text-sm text-[var(--color-text-tertiary)] leading-relaxed">
                The tool is local by design. The JPJ login and CAPTCHA must be
                completed manually in the browser window.
              </p>
            </li>
          </ul>
        </PageSection>
    </PageShell>
  );
}

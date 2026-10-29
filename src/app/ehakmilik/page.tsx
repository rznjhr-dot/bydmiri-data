import type { Metadata } from "next";
import EhakmilikForm from "@/components/EhakmilikForm";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "e-Hakmilik Generator · BYD Miri",
  description: "Ownership-claim registration letter (JPJ e-Hakmilik) — PDF auto-generated in Drive",
};

export default function EhakmilikPage() {
  return (
    <PageShell
      eyebrow="Documents"
      title="e-Hakmilik Generator"
      description="Generate the ownership-claim registration letter for the bank. The PDF appears in your Drive folder automatically."
      width="default"
    >
      <EhakmilikForm />
    </PageShell>
  );
}

import { PageShell } from "@/components/PageShell";
import WarrantyCard from "@/components/WarrantyCard";

export default function WarrantyPage() {
  return (
    <PageShell
      title="Warranty coverage"
      description="Warranty terms and coverage details for every BYD model."
      eyebrow="Ownership"
      width="default"
    >
      <WarrantyCard />
    </PageShell>
  );
}

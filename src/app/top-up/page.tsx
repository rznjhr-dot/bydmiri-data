import { PageShell } from "@/components/PageShell";
import TopUpCalculator from "@/components/TopUpCalculator";

export default function TopUpPage() {
  return (
    <PageShell
      title="Price breakdown"
      description="Selling price and balance payable, ready to send to the customer."
      eyebrow="Finance"
      width="default"
    >
      <TopUpCalculator />
    </PageShell>
  );
}

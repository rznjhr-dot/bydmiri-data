import { PageShell } from "@/components/PageShell";
import LoanCalculator from "@/components/LoanCalculator";

export default function FinancePage() {
  return (
    <PageShell
      title="Finance calculator"
      description="Calculate monthly repayments and compare downpayment options."
      eyebrow="Finance"
      width="default"
    >
      <LoanCalculator />
    </PageShell>
  );
}

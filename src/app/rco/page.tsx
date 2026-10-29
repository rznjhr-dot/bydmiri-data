import type { Metadata } from "next";
import RcoForm from "@/components/RcoForm";
import { PageShell } from "@/components/PageShell";

export const metadata: Metadata = {
  title: "RCO Generator · BYD Miri",
  description: "Submit a sales order — PDF auto-generated in Drive",
};

export default function RcoPage() {
  return (
    <PageShell
      eyebrow="Sales"
      title="RCO Generator"
      description="Fill in the sales order and the PDF appears in your Drive folder automatically."
      width="default"
    >
      <RcoForm />
    </PageShell>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ridzuan Jahari | BYD Knowledge Base Masterbook",
  description:
    "The official Single Source of Truth for all BYD Miri operations. Pricing, rebates, financing, vehicle hierarchy, charging network and sales rules.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CommandPalette from "@/components/CommandPalette";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "RJ Master Databook | BYD Miri",
  description:
    "The official Single Source of Truth for all BYD Miri operations. Pricing, rebates, financing, vehicle hierarchy, charging network and sales rules.",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RJ Master Databook",
  description:
    "Single Source of Truth for BYD Miri — vehicle data, pricing, rebates, financing, and sales rules",
  provider: {
    "@type": "Organization",
    name: "Kah Progression Auto",
    branch: "BYD Miri",
  },
  about: {
    "@type": "Product",
    name: "BYD Electric Vehicles",
    description: "BYD EV models including Atto 2, Atto 3, Sealion 7, Seal, Seal 6, and M6",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <ThemeProvider>
          <Navbar />
          <CommandPalette />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

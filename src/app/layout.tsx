import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "IIM CAT 2025 Admission Predictor",
  description:
    "Explainable CAT 2025 admission analysis for IIM Ahmedabad, IIM Bangalore, and IIM Calcutta.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}

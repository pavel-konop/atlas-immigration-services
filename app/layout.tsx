import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";
import { business } from "@/content/config/business";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || business.url),
  title: {
    default: business.shortName,
    template: `%s | ${business.shortName}`
  },
  description:
    "Singapore immigration and corporate services consultancy for individuals, families, entrepreneurs, and businesses.",
  applicationName: business.shortName,
  icons: {
    icon: "/brand/atlas-mark.svg"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Recipes by Maren | Real Food, Simple Recipes",
    template: "%s | Recipes by Maren"
  },
  description:
    "Discover approachable weeknight dinners, cozy bakes, and simple recipes made for real life.",
  applicationName: "Recipes by Maren",
  openGraph: {
    type: "website",
    siteName: "Recipes by Maren",
    title: "Recipes by Maren | Real Food, Simple Recipes",
    description: "Approachable recipes for everyday home cooking.",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipes by Maren",
    description: "Real food. Simple recipes. Made with care."
  },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf8f2"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><SiteHeader />{children}<SiteFooter /></body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "./globals.css";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://recipesbymaren.com";
const pinterestVerification = process.env.PINTEREST_DOMAIN_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Recipes by Maren | Real Food, Simple Recipes",
    template: "%s | Recipes by Maren"
  },
  description: "Discover approachable weeknight dinners, cozy bakes, and simple recipes made for real life.",
  applicationName: "Recipes by Maren",
  alternates: { canonical: "/" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg"
  },
  openGraph: {
    type: "website",
    siteName: "Recipes by Maren",
    title: "Recipes by Maren | Real Food, Simple Recipes",
    description: "Approachable recipes for everyday home cooking.",
    url: siteUrl,
    images: [{
      url: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=85",
      width: 1200,
      height: 630,
      alt: "A colorful table of fresh, homemade food"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Recipes by Maren",
    description: "Real food. Simple recipes. Made with care.",
    images: ["https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&h=630&q=85"]
  },
  ...(pinterestVerification ? { other: { "p:domain_verify": pinterestVerification } } : {}),
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
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}

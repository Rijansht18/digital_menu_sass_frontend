import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RestroSphere — Digital Menu SaaS",
    template: "%s | RestroSphere",
  },
  description:
    "Create stunning digital menus for your restaurant. PWA-ready, SEO optimized, and fully customizable.",
  keywords: ["digital menu", "restaurant menu", "QR menu", "online menu", "SaaS"],
  authors: [{ name: "RestroSphere" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "RestroSphere",
    title: "RestroSphere — Digital Menu SaaS",
    description: "Create stunning digital menus for your restaurant.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RestroSphere — Digital Menu SaaS",
    description: "Create stunning digital menus for your restaurant.",
  },
  icons: {
    icon: "/menulogonobg.png",
    shortcut: "/menulogonobg.png",
    apple: "/menulogonobg.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

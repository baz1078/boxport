import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "BoxPort — Buy & Sell Shipping Containers",
    template: "%s | BoxPort",
  },
  description:
    "BoxPort is the trusted US marketplace to buy and sell shipping containers. Browse 20ft, 40ft, reefer, and high cube containers from verified sellers with secure escrow payments.",
  keywords: [
    "shipping containers for sale",
    "buy shipping container",
    "sell shipping container",
    "used shipping containers",
    "20ft shipping container",
    "40ft shipping container",
    "reefer container",
    "high cube container",
    "shipping container marketplace",
    "container for sale near me",
  ],
  metadataBase: new URL("https://boxport.io"),
  openGraph: {
    type: "website",
    siteName: "BoxPort",
    title: "BoxPort — Buy & Sell Shipping Containers",
    description:
      "The trusted US marketplace to buy and sell shipping containers. Verified sellers, secure escrow, no shady deals.",
    url: "https://boxport.io",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "BoxPort — Shipping Container Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BoxPort — Buy & Sell Shipping Containers",
    description: "The trusted US marketplace to buy and sell shipping containers.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "https://boxport.io",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  );
}

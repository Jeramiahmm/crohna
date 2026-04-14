import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import ThemeProvider from "@/components/ui/ThemeProvider";
import SessionProvider from "@/components/providers/SessionProvider";
import AddMemoryButton from "@/components/ui/AddMemoryButton";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import SWRProvider from "@/components/providers/SWRProvider";
import SessionErrorBanner from "@/components/ui/SessionErrorBanner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-body",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Crohna — Your Life, Beautifully Mapped",
  description:
    "Crohna transforms your memories into a stunning visual timeline. A premium digital life story.",
  keywords: ["timeline", "life events", "memories", "digital story"],
  openGraph: {
    title: "Crohna — Your Life, Beautifully Mapped",
    description: "Transform your memories into a stunning visual timeline. A premium digital life story.",
    type: "website",
    siteName: "Crohna",
  },
  twitter: {
    card: "summary_large_image",
    title: "Crohna — Your Life, Beautifully Mapped",
    description: "Transform your memories into a stunning visual timeline. A premium digital life story.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#FAF8F5" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Crohna" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        {/* Google Fonts: EB Garamond for editorial serif headlines */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts -- Must run before paint to prevent theme flash */}
        <script src="/theme-init.js" />
      </head>
      <body className="font-body antialiased bg-chrono-bg text-chrono-text">
        <SessionProvider>
          <SWRProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <ScrollProgressBar />
              <Suspense>
                <Navigation />
              </Suspense>
              <SessionErrorBanner />
              <main>{children}</main>
              <AddMemoryButton />
              <Footer />
            </ErrorBoundary>
            <ToasterProvider />
          </ThemeProvider>
          </SWRProvider>
        </SessionProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

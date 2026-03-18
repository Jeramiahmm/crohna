import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import ScrollProgressBar from "@/components/ui/ScrollProgressBar";
import ThemeProvider from "@/components/ui/ThemeProvider";
import SessionProvider from "@/components/providers/SessionProvider";
import AddMemoryButton from "@/components/ui/AddMemoryButton";
import { ToasterProvider } from "@/components/providers/ToasterProvider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-body",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-display",
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
        <meta name="theme-color" content="#050505" />
      </head>
      <body className="font-body antialiased bg-chrono-bg text-chrono-text">
        <SessionProvider>
          <ThemeProvider>
            <ErrorBoundary>
              <ScrollProgressBar />
              <Navigation />
              <main>{children}</main>
              <AddMemoryButton />
              <Footer />
            </ErrorBoundary>
            <ToasterProvider />
          </ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

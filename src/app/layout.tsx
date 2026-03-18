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
  title: "Chrono \u2014 Your Life, Beautifully Mapped",
  description:
    "Chrono transforms your memories into a stunning visual timeline. A premium digital life story.",
  keywords: ["timeline", "life events", "memories", "digital story"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
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
          </ThemeProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}

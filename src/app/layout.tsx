import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/factory/theme-provider";

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
    default: "The SEO Audit Factory - Free SEO Audit & Five Ways to Save Money",
    template: "%s | The SEO Audit Factory",
  },
  description:
    "Free SEO audits with real website crawling: technical SEO, content, AI search readiness, local SEO and performance - plus five personalized ways to save money on marketing and free marketing content from Plunder & Riffle.",
  keywords: [
    "free SEO audit",
    "SEO audit tool",
    "AI search readiness",
    "generative engine optimization",
    "answer engine optimization",
    "local SEO",
    "save money on marketing",
    "Plunder & Riffle",
  ],
  applicationName: "The SEO Audit Factory",
  openGraph: {
    title: "The SEO Audit Factory - Free SEO Audit",
    description:
      "Find out what is costing you customers, what is wasting your marketing budget, and how to get discovered on Google and AI search. Free. No signup.",
    siteName: "The SEO Audit Factory",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The SEO Audit Factory - Free SEO Audit",
    description:
      "Free SEO audit plus five personalized ways to save money on marketing. Real crawling, honest estimates, no signup.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

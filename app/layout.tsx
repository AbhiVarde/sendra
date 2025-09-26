import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    default: "Sendra | Monitor Appwrite Sites Deployments",
    template: "%s | Sendra",
  },
  description:
    "Monitor your Appwrite Sites deployments with real-time error analysis and instant email alerts powered by Resend. Ship with confidence, never miss a failure again.",
  openGraph: {
    title: "Sendra",
    description:
      "Sendra helps developers monitor Appwrite Sites deployments with real-time error analysis and instant Resend-powered email alerts. Stay in control, ship with confidence.",
    siteName: "Sendra",
    url: "https://sendra.vercel.app",
    type: "website",
    images: [
      {
        url: "https://sendra.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sendra - Monitor Appwrite Sites Deployments with Email Alerts",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sendra",
    description:
      "Monitor Appwrite Sites deployments with real-time error analysis and instant email alerts powered by Resend. Ship with confidence.",
    images: "https://sendra.vercel.app/og-image.png",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://sendra.vercel.app",
  },
  keywords:
    "Sendra, Appwrite Sites monitoring, deployment alerts, error analysis, Resend email, DevOps, Vercel apps, developer tools",
  authors: [{ name: "Sendra" }],
  creator: "Sendra",
  publisher: "Sendra",
  metadataBase: new URL("https://sendra.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}

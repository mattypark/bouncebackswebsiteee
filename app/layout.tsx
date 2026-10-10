import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import SmoothScroll from "@/components/SmoothScroll";
import { Analytics } from "@vercel/analytics/next";
import { PostHogAnalytics } from "./PostHogAnalytics";

// Inter is self-hosted (latin subset, variable weight) so the build never
// downloads fonts from Google; a failed download there broke Vercel deploys.
// License: app/fonts/Inter-OFL.txt (SIL Open Font License 1.1).
const inter = localFont({
  src: "./fonts/Inter-latin-var.woff2",
  weight: "300 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BounceBack — Recycled Pickleball",
  description:
    "Built for players. Designed for the planet. BounceBack is the first recycled pickleball with the same feel and performance as professional balls.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased`}>
        <SmoothScroll />
        <Providers>{children}</Providers>
        <Analytics />
        <PostHogAnalytics />
      </body>
    </html>
  );
}

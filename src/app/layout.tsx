import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Use Outfit for premium feel
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BADA JuruMarble",
  description: "Custom Web Board Game with BADA Theme",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${outfit.variable} antialiased bg-slate-950 text-slate-100`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}

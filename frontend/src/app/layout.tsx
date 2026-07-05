import type { Metadata } from "next";
import "./globals.css";

import Navbar from "@/components/Navbar";
import AuthRouteGuard from "@/components/AuthRouteGuard";

import { Inter, DM_Serif_Display } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Alumly",
  description: "A modern alumni mentorship platform",
  openGraph: {
    title: "Alumly",
    description: "A modern alumni mentorship platform",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumly",
    description: "A modern alumni mentorship platform",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${dmSerif.variable}`}>
        <Navbar />
        <AuthRouteGuard>{children}</AuthRouteGuard>
      </body>
    </html>
  );
}
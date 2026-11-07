import React from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "KUMUSTA: Civic & School Predictive Well-being Sentinel",
  description: "Real-time Crisis Triage, Counselor De-escalation Protocol, and Pampanga Municipal Anomaly Heatmap.",
  icons: {
    icon: "/logo.png",
  },
};

const clerkPublishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
  "pk_test_dW5pY29ybi00Mi5jbGVyay5hY2NvdW50cy5kZXYk";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en" className={`${inter.className} ${inter.variable}`}>
        <body className="antialiased bg-white text-slate-900 selection:bg-purple-200 selection:text-purple-950 font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FreshMart NZ | Premium Organic Grocery Delivery",
  description: "New Zealand's premium organic grocery marketplace. Fresh Products, grass-fed meats, artisan dairy, and pantry essentials sourced directly from local NZ farmers. Fast delivery across Auckland, Wellington, Canterbury, and more.",
  keywords: ["organic grocery", "NZ Products", "fresh delivery", "New Zealand", "FreshMart", "sustainable", "grass-fed", "local farmers"],
  openGraph: {
    title: "FreshMart NZ | Premium Organic Grocery Delivery",
    description: "Fresh, organic Products sourced directly from New Zealand's best local farmers.",
    type: "website",
    locale: "en_NZ",
    siteName: "FreshMart NZ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />
      </head>
      <body className="bg-background text-on-background font-sans antialiased selection:bg-secondary-fixed-dim selection:text-on-secondary-fixed">
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </body>
    </html>
  );
}

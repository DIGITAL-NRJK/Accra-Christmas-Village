import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Big_Shoulders, Geist_Mono, Instrument_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: "variable",
});

const bigShoulders = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  weight: "variable",
  adjustFontFallback: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Accra Christmas Village",
    template: "%s | Accra Christmas Village",
  },
  description:
    "Festival guide for Accra Christmas Village with the programme, village map, stands, safety notes and participant operations.",
  applicationName: "Accra Christmas Village",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Accra Christmas Village",
    description:
      "A mobile-first festival guide for visitors, vendors, sponsors and organizers in Accra.",
    siteName: "Accra Christmas Village",
    type: "website",
    images: [
      {
        url: "/design/hero-night-market.png",
        width: 1600,
        height: 1000,
        alt: "Night market route artwork for Accra Christmas Village",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Accra Christmas Village",
    statusBarStyle: "black-translucent",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSans.variable} ${bigShoulders.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ClerkProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </ClerkProvider>
      </body>
    </html>
  );
}

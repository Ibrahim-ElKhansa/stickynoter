import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from "@/lib/auth/AuthContext";
import { StickyNoteProvider } from "@/lib/context/StickyNoteContext";
import { CanvasTransformProvider } from "@/lib/context/CanvasTransformContext";
import { NavbarWithStickyNotes } from "./NavbarWithStickyNotes";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Viewport is its own export in the App Router. It used to be a hand-written
 * <meta> tag in <head> that also set maximum-scale=1 and user-scalable=no,
 * which blocked pinch-zoom entirely (a WCAG 1.4.4 failure) on an app whose
 * manifest advertises an installable mobile experience.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#991b1b",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StickyNoter - Digital Sticky Notes & Visual Organization Tool",
    template: "%s | StickyNoter"
  },
  description: "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas. Perfect for brainstorming, project planning, and visual thinking. Free online sticky note app with automatic saving.",
  keywords: [
    "sticky notes",
    "digital notes",
    "visual organization",
    "brainstorming tool",
    "project planning",
    "mind mapping",
    "note taking",
    "productivity app",
    "visual thinking",
    "drag and drop notes",
    "infinite canvas",
    "color coded notes",
    "online notepad"
  ],
  authors: [{ name: "Ibrahim El Khansa", url: "https://ibrahimelkhansa.com" }],
  creator: "Ibrahim El Khansa",
  publisher: "Ibrahim El Khansa",
  applicationName: "StickyNoter",
  generator: "Next.js",
  category: "Productivity",
  classification: "Productivity Tool",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "StickyNoter",
    title: "StickyNoter - Digital Sticky Notes & Visual Organization Tool",
    description: "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas. Perfect for brainstorming, project planning, and visual thinking.",
    // No explicit `images` here on purpose. An explicit list overrides the
    // file-convention tag, which is what left app/opengraph-image.tsx
    // generating an image no crawler ever referenced.
  },
  twitter: {
    card: "summary_large_image",
    site: "@stickynoter",
    creator: "@stickynoter",
    title: "StickyNoter - Digital Sticky Notes & Visual Organization Tool",
    description: "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  // `verification` is deliberately omitted: it previously shipped the literal
  // placeholders "your-google-verification-code" and friends as real meta tags.
  // Add it back with actual tokens when the properties are claimed.
  alternates: {
    canonical: SITE_URL
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "StickyNoter",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#991b1b",
    "msapplication-TileImage": "/android-chrome-192x192.png",
    "format-detection": "telephone=no"
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" }
    ],
    other: [
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ]
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "StickyNoter",
  description:
    "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas.",
  url: SITE_URL,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "Ibrahim El Khansa",
    url: "https://ibrahimelkhansa.com",
  },
  publisher: {
    "@type": "Person",
    name: "Ibrahim El Khansa",
    url: "https://ibrahimelkhansa.com",
  },
  featureList: [
    "Drag and drop sticky notes",
    "Infinite canvas workspace",
    "Color-coded organization",
    "Resizable notes",
    // "Real-time synchronization" was listed here and is not a feature: saving
    // is a debounced batch upsert, with no realtime subscription anywhere.
    "Automatic saving",
    "Pinch to zoom and touch support",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* The canonical link and the manifest link are both emitted from the
            metadata export above, so they are not repeated here. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-dvh flex-col overflow-hidden antialiased`}
      >
        <AuthProvider>
          <CanvasTransformProvider>
            <StickyNoteProvider>
              <NavbarWithStickyNotes />
              {/*
                min-h-0 is what lets this shrink inside the flex column. The
                previous layout stacked a fixed 80px navbar above a full-height
                region inside a 100vh box, so the bottom 80px of the canvas was
                clipped and unreachable.
              */}
              <main className="min-h-0 w-full flex-1 overflow-hidden">{children}</main>
            </StickyNoteProvider>
          </CanvasTransformProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

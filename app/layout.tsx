import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from "@/lib/auth/AuthContext";
import { StickyNoteProvider } from "@/lib/context/StickyNoteContext";
import { NavbarWithStickyNotes } from "./NavbarWithStickyNotes";
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
  metadataBase: new URL('https://stickynoter.org'),
  title: {
    default: "StickyNoter - Digital Sticky Notes & Visual Organization Tool",
    template: "%s | StickyNoter"
  },
  description: "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas. Perfect for brainstorming, project planning, and visual thinking. Free online sticky note app with real-time sync.",
  keywords: [
    "sticky notes",
    "digital notes",
    "visual organization",
    "brainstorming tool",
    "project planning",
    "mind mapping",
    "note taking",
    "productivity app",
    "collaborative notes",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stickynoter.org",
    siteName: "StickyNoter",
    title: "StickyNoter - Digital Sticky Notes & Visual Organization Tool",
    description: "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas. Perfect for brainstorming, project planning, and visual thinking.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "StickyNoter - Digital Sticky Notes App Interface",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@stickynoter",
    creator: "@stickynoter",
    title: "StickyNoter - Digital Sticky Notes & Visual Organization Tool",
    description: "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas.",
    images: ["/opengraph-image.png"]
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
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code"
  },
  alternates: {
    canonical: "https://stickynoter.org"
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "StickyNoter",
    "mobile-web-app-capable": "yes",
    "msapplication-TileColor": "#991b1b",
    "msapplication-TileImage": "/android-chrome-192x192.png",
    "theme-color": "#991b1b",
    "color-scheme": "dark",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full overflow-hidden">
      <head>
        <link rel="canonical" href="https://stickynoter.org" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "StickyNoter",
              "description": "Transform your ideas into organized digital sticky notes. Create, drag, resize, and color-code notes on an infinite canvas.",
              "url": "https://stickynoter.org",
              "applicationCategory": "ProductivityApplication",
              "operatingSystem": "Any",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Person",
                "name": "Ibrahim El Khansa",
                "url": "https://ibrahimelkhansa.com"
              },
              "publisher": {
                "@type": "Person",
                "name": "Ibrahim El Khansa",
                "url": "https://ibrahimelkhansa.com"
              },
              "featureList": [
                "Drag and drop sticky notes",
                "Infinite canvas workspace",
                "Color-coded organization",
                "Real-time synchronization",
                "Resizable notes",
                "Auto-save functionality"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-red-950/90 text-white h-full m-0 p-0 overflow-hidden`}
      >
        <AuthProvider>
          <StickyNoteProvider>
            <div className="flex min-h-screen flex-col w-full h-full overflow-hidden">
              <NavbarWithStickyNotes />
              <div className="flex-1 w-full h-full overflow-hidden">
                {children}
              </div>
            </div>
          </StickyNoteProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}

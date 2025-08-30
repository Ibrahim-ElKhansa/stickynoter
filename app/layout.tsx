import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "StickyNoter",
  description: "A digital sticky note application",
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
      </body>
    </html>
  );
}

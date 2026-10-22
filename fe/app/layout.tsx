import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "@/components/providers";
import { AuthGate } from "@/components/layout/auth-gate";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Dolphin Studio Váy & Vest",
  description:
    "Phần mềm quản lý cho thuê trang phục — studio · cọc · nhận trả — Dolphin Software",
  manifest: `${basePath}/manifest.webmanifest`,
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" }],
    shortcut: `${basePath}/favicon.ico`,
  },
  appleWebApp: {
    capable: true,
    title: "Studio Váy & Vest",
  },
};

export const viewport: Viewport = {
  themeColor: "#5D5CC4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const THEME_INIT = `(function(){try{var k='dolphin-rental-theme';var t=localStorage.getItem(k)||'light';var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=t==='system'?(d?'dark':'light'):t;var e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r;e.lang='vi';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <Script id="dolphin-theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
        <Providers>
          <AuthGate>{children}</AuthGate>
        </Providers>
      </body>
    </html>
  );
}

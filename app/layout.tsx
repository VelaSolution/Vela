import type { Metadata, Viewport } from "next";
import Script from "next/script";
import NavBar from "@/components/NavBar";
import CommandPalette from "@/components/CommandPalette";
import InstallPrompt from "@/components/InstallPrompt";
import MobileTabBar from "@/components/MobileTabBar";
import ClientProviders from "@/components/ClientProviders";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://velaanalytics.com"),
  title: "VELA - 외식업 AI 경영 분석 | 매장 수익 시뮬레이터",
  description: "좌석 수, 객단가, 비용만 입력하면 AI가 수익성을 분석합니다. 30개 이상의 외식업 경영 도구를 무료로 시작하세요.",
  keywords: "외식업, 경영분석, 수익시뮬레이터, 매장관리, AI, 원가계산, 자영업, SaaS",
  openGraph: {
    title: "VELA - 외식업 AI 경영 분석 | 매장 수익 시뮬레이터",
    description: "좌석 수, 객단가, 비용만 입력하면 AI가 수익성을 분석합니다. 30개 이상의 외식업 경영 도구를 무료로 시작하세요.",
    url: "https://velaanalytics.com",
    siteName: "VELA",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELA - 외식업 AI 경영 분석 | 매장 수익 시뮬레이터",
    description: "좌석 수, 객단가, 비용만 입력하면 AI가 수익성을 분석합니다. 30개 이상의 외식업 경영 도구를 무료로 시작하세요.",
  },
  robots: "index, follow",
  alternates: { canonical: "https://velaanalytics.com" },
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "VELA" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#3182F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('vela-theme') === 'dark' ||
                (!localStorage.getItem('vela-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
            if (window.location.pathname.startsWith('/hq')) {
              document.documentElement.classList.add('is-hq');
            }
          } catch {}
        ` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "VELA",
          "applicationCategory": "BusinessApplication",
          "operatingSystem": "Web, iOS",
          "description": "외식업 사장님을 위한 AI 경영 분석 플랫폼",
          "url": "https://velaanalytics.com",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KRW"
          },
          "publisher": {
            "@type": "Organization",
            "name": "벨라솔루션",
            "url": "https://velaanalytics.com"
          }
        }) }} />
        <script dangerouslySetInnerHTML={{ __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
          // 글씨 크기 복원
          try { var fs = localStorage.getItem('vela-font-size'); if (fs) document.documentElement.style.fontSize = fs + 'px'; } catch {}
          // Capacitor 앱 감지 — URL ?app=1 또는 localStorage 플래그
          if (window.Capacitor || navigator.userAgent.includes('CapacitorApp') || window.matchMedia('(display-mode: standalone)').matches || window.location.search.includes('app=1') || localStorage.getItem('vela-is-app') === '1') {
            document.documentElement.classList.add('capacitor-app');
            localStorage.setItem('vela-is-app', '1');
          }
        ` }} />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-VDZ131LSM0"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VDZ131LSM0');
          `}
        </Script>
      </head>
      <body className="flex flex-col min-h-screen pt-16 bg-slate-50">
        <NavBar />
        <CommandPalette />
        <InstallPrompt />
        {children}
        <MobileTabBar />
        <ClientProviders />
      </body>
    </html>
  );
}

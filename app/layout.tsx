import type { Metadata } from "next";
import NavBar from "@/components/NavBar";
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
  title: "VELA — 사업의 방향을 계산하다",
  description: "외식업 창업자와 운영자를 위한 수익 시뮬레이터 & AI 경영 컨설턴트. 매출·원가·인건비를 한 번에 시뮬레이션하고 AI 맞춤 전략을 받아보세요.",
  keywords: ["외식업", "카페 창업", "음식점 창업", "수익 시뮬레이터", "원가 계산기", "외식업 경영", "AI 컨설턴트", "VELA"],
  openGraph: {
    title: "VELA — 외식업 사장님을 위한 숫자 경영 파트너",
    description: "매출·원가·인건비를 한 번에 시뮬레이션하고 AI 맞춤 전략을 받아보세요.",
    url: "https://velaanalytics.com",
    siteName: "VELA",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VELA — 외식업 사장님을 위한 숫자 경영 파트너",
    description: "매출·원가·인건비를 한 번에 시뮬레이션하고 AI 맞춤 전략을 받아보세요.",
  },
  robots: { index: true, follow: true },
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
    >
      <body className="flex flex-col min-h-screen pt-16 bg-slate-50">
        <NavBar />
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "서비스 소개 — VELA | AI 외식업 경영 분석",
  description: "VELA가 제공하는 수익 시뮬레이터, AI 브리핑, 메뉴 원가 계산, POS 분석 등 핵심 기능을 확인하세요. 500+ 사장님이 사용 중.",
  openGraph: {
    title: "VELA 서비스 소개",
    description: "외식업 사장님의 숫자 경영을 돕는 AI 플랫폼. 핵심 기능을 살펴보세요.",
  },
};

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "요금제 — VELA | 무료·스탠다드·프로",
  description: "VELA 요금제 비교. 무료로 시뮬레이터 체험, 스탠다드(월 9,900원)로 AI 기능 무제한, 프로(월 29,900원)로 다점포·팀 관리까지.",
  openGraph: {
    title: "VELA 요금제 — 무료부터 시작",
    description: "외식업 경영 분석을 무료로 체험하고, 필요할 때 업그레이드하세요.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}

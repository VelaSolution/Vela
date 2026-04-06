import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "경영 도구 모음 — VELA | 원가·인건비·세금·AI 마케팅",
  description: "메뉴 원가 계산기, 인건비 스케줄러, 세금 계산기, SNS 콘텐츠 생성기, 리뷰 답변 AI 등 외식업 사장님을 위한 14가지 무료 경영 도구.",
  openGraph: {
    title: "VELA 경영 도구 14종",
    description: "원가 계산부터 AI 마케팅까지, 외식업에 필요한 모든 도구를 한곳에서.",
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

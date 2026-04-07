import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "투자 유치 도구 — VELA",
  description:
    "밸류에이션 계산 + IR 덱 12슬라이드 가이드 + 투자자 미팅 체크리스트.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

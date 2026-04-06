import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용 가이드 — VELA | 시작하기",
  description: "VELA 시뮬레이터 사용법, 대시보드 활용법, AI 기능 가이드. 처음 사용하는 사장님도 5분이면 시작할 수 있습니다.",
  openGraph: {
    title: "VELA 사용 가이드",
    description: "처음 사용하는 사장님을 위한 단계별 가이드.",
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return children;
}

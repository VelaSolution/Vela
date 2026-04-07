import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "일일 매출 기록 — VELA",
  description:
    "매일 매출·고객수 입력으로 월간 자동 집계 + 요일별 매출 패턴 분석.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

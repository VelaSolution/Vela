import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "손익계산서 PDF — VELA",
  description:
    "시뮬레이션 데이터로 월별 P&L 리포트 PDF 출력.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

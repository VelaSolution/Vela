import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "경쟁 매장 비교 — VELA | 업계 벤치마크",
  description: "카페·음식점·바·파인다이닝·고깃집 업종별 평균 원가율, 인건비 비율, 순이익률과 내 매장을 비교 분석하세요.",
  openGraph: {
    title: "VELA 업계 벤치마크",
    description: "내 매장 수치를 업계 평균과 비교해보세요.",
  },
};

export default function BenchmarkLayout({ children }: { children: React.ReactNode }) {
  return children;
}

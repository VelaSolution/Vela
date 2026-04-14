import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "수익 시뮬레이터 — VELA | 외식업 손익계산",
  description: "카페·음식점·바 매출·원가·인건비를 한 번에 시뮬레이션. 좌석 수, 객단가, 회전율만 입력하면 세후 실수령액까지 즉시 계산됩니다.",
  openGraph: {
    title: "수익 시뮬레이터 — VELA",
    description: "외식업 손익계산을 3단계로. 매출·비용·투자금을 입력하면 순이익·손익분기점·투자회수 기간까지 한눈에.",
  },
};

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  return children;
}

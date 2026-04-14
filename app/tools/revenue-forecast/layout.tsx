import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "매출 예측 AI — VELA",
  description: "과거 매출 데이터 기반 AI 매출 예측. 다음 달 예상 매출과 핵심 전략을 확인하세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

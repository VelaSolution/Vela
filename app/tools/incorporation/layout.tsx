import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "법인 설립 가이드 — VELA",
  description:
    "개인 vs 법인 세금 비교 + 설립 절차 체크리스트 + 비용 시뮬레이터.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

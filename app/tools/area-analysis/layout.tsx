import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "상권 분석 도우미 — VELA",
  description:
    "입지 조건 입력으로 AI 상권 적합도 평가 리포트 생성.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

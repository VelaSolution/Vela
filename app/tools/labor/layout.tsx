import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인건비 스케줄러 — VELA",
  description:
    "직원별 시급·근무시간 설정으로 주간·월간 인건비 예측.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

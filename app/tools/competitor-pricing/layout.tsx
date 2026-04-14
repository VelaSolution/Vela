import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "경쟁매장 가격 조사 — VELA",
  description:
    "주변 매장 메뉴 가격 기록으로 내 가격 포지셔닝 파악.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

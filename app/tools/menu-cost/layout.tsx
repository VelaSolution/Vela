import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "메뉴별 원가 계산기 — VELA",
  description:
    "식재료 원가 입력으로 원가율·건당 순이익 자동 계산. 메뉴 가격 결정에 바로 활용.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

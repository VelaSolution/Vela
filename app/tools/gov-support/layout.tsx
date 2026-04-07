import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "정부 지원사업 매칭 — VELA",
  description:
    "내 조건에 맞는 정부 지원금·대출·보증 프로그램 20개 이상 자동 매칭.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

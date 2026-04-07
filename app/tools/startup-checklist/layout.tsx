import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "창업 체크리스트 — VELA",
  description:
    "업종별 인허가·준비물·타임라인 단계별 가이드.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

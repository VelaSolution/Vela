import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "세금 계산기 — VELA",
  description:
    "매출 기반 부가세·종합소득세 예상액 자동 산출.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

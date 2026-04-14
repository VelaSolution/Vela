import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "세무·회계 가이드 — VELA",
  description:
    "세금 캘린더 + 부가세·소득세·4대보험 계산기 + 외식업 절세 전략 10선.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

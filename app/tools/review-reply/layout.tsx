import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "리뷰 답변 생성기 — VELA",
  description:
    "고객 리뷰 붙여넣기로 AI 맞춤 답변 초안 작성.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

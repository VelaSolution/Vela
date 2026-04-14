import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인력 채용 도구 — VELA",
  description:
    "급여 계산기 + 근로계약서 자동 생성 + 업종별 채용공고 템플릿 3종.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

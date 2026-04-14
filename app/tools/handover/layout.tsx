import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인수인계 체크리스트 — VELA",
  description:
    "매장 양도양수 시 필수 점검 36개 항목.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

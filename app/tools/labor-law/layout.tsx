import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "인건비 계산기 (법정) — VELA",
  description:
    "주휴수당·야간수당·4대보험 자동 반영 실제 인건비 계산.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "재무 시뮬레이션 — VELA",
  description:
    "런웨이·손익분기점·12개월 현금흐름을 3가지 시나리오로 시뮬레이션.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

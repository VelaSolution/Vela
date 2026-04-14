import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "네이버 플레이스 최적화 — VELA",
  description:
    "검색 노출을 위한 15가지 체크리스트 가이드.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

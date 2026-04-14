import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사업계획서 작성 도우미 — VELA",
  description:
    "6단계 사업계획서 작성 + 미리보기 + 복사. 투자용·정부지원금용 사업계획서를 쉽게 만드세요.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

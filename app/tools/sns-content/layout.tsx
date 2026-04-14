import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SNS 콘텐츠 생성기 — VELA",
  description:
    "메뉴·이벤트 정보 입력으로 인스타그램 캡션 AI 자동 생성.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}

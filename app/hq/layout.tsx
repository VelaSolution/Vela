import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VELA Bridge - 사내 인트라넷",
  description: "벨라솔루션 사내 업무 관리 시스템 | VELA Bridge",
  robots: { index: false, follow: false },
};

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

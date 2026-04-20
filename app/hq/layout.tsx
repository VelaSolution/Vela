import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VELA HQ - 사내 인트라넷",
  description: "벨라솔루션 사내 업무 관리 시스템",
  robots: { index: false, follow: false },
};

export default function HQLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

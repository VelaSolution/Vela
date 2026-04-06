import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사장님 커뮤니티 — VELA | 외식업 정보 공유",
  description: "외식업 사장님들의 경영 노하우, 시뮬레이션 결과 공유, 익명 고민 상담. 업종별 벤치마크로 내 매장을 비교해보세요.",
  openGraph: {
    title: "VELA 사장님 커뮤니티",
    description: "외식업 동료 사장님들과 경영 정보를 나누고, AI 상담을 받아보세요.",
  },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}

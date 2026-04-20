"use client";

import Link from "next/link";

const PROMO_IMAGES = [
  {
    id: "main",
    title: "메인 홍보",
    desc: "VELA 전체 소개",
    src: "/promo/main.png",
  },
  {
    id: "tools",
    title: "도구 소개",
    desc: "20+ 경영 도구",
    src: "/promo/tools.png",
  },
  {
    id: "ai",
    title: "AI 기능",
    desc: "AI 브리핑·전략·리뷰 분석",
    src: "/promo/ai.png",
  },
  {
    id: "simulator",
    title: "시뮬레이터",
    desc: "수익 시뮬레이션",
    src: "/promo/simulator.png",
  },
  {
    id: "event",
    title: "출시 이벤트",
    desc: "프로 1개월 무료",
    src: "/promo/event.png",
  },
];

export default function PromoPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">홍보 자료</h1>
        <p className="text-slate-500 text-sm mb-8">이미지를 클릭하면 새 탭에서 열립니다. 우클릭 → 이미지 저장으로 다운로드하세요.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PROMO_IMAGES.map((img) => (
            <Link key={img.id} href={img.src} target="_blank" className="group block">
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden hover:shadow-lg transition">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.src} alt={img.title} className="w-full aspect-[1200/630] object-cover" />
                <div className="p-4">
                  <p className="text-sm font-bold text-slate-900">{img.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{img.desc} · 1200x630px</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

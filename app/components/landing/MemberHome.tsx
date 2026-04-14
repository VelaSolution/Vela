"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import type { User } from "@supabase/supabase-js";

const TOOLS_HOME = [
  { icon:"🧮", label:"원가 계산기",    href:"/tools/menu-cost" },
  { icon:"👥", label:"인건비 스케줄러", href:"/tools/labor" },
  { icon:"🧾", label:"세금 계산기",    href:"/tools/tax" },
  { icon:"📄", label:"손익계산서 PDF", href:"/tools/pl-report" },
  { icon:"✅", label:"창업 체크리스트", href:"/tools/startup-checklist" },
  { icon:"📱", label:"SNS 콘텐츠",     href:"/tools/sns-content" },
  { icon:"💬", label:"리뷰 답변",      href:"/tools/review-reply" },
  { icon:"🗺️", label:"상권 분석",     href:"/tools/area-analysis" },
];

type NewsItem = { title:string; summary:string; source:string; url:string };
type IndexData = { price:string; date:string } | null;

function StockTicker() {
  const [stocks, setStocks] = useState<{kospi:IndexData;kosdaq:IndexData;usdkrw:IndexData}|null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/home")
      .then(r => r.json())
      .then(d => { if (d.stocks) setStocks(d.stocks); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const cards = [
    { label:"KOSPI",  icon:"📈", data: stocks?.kospi  },
    { label:"KOSDAQ", icon:"📊", data: stocks?.kosdaq },
    { label:"달러/원", icon:"💵", data: stocks?.usdkrw },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({label, icon, data}) => (
        <div key={label} className="rounded-2xl bg-white ring-1 ring-slate-200 px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-sm">{icon}</span>
            <p className="text-xs font-semibold text-slate-500">{label}</p>
          </div>
          {!loaded ? (
            <div className="animate-pulse space-y-1">
              <div className="h-5 bg-slate-100 rounded w-20" />
              <div className="h-3 bg-slate-100 rounded w-14" />
            </div>
          ) : data ? (
            <>
              <p className="text-base font-bold text-slate-900">{data.price}</p>
              <p className="text-xs text-slate-400 mt-0.5">{data.date} 전일종가</p>
            </>
          ) : (
            <p className="text-xs text-slate-400 mt-1">—</p>
          )}
        </div>
      ))}
    </div>
  );
}

export function MemberHome() {
  const [user,      setUser]      = useState<User|null>(null);
  const [loading,   setLoading]   = useState(true);
  const [news,      setNews]      = useState<NewsItem[]>([]);
  const [newsLoad,  setNewsLoad]  = useState(true);
  const [thisSnap,  setThisSnap]  = useState<{total_sales:number;net_profit:number;month:string}|null|undefined>(undefined);

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(async ({ data }: { data: { user: User|null } }) => {
      setUser(data.user);
      if (data.user) {
        const m = new Date().toISOString().slice(0,7);
        const { data: snap } = await sb.from("monthly_snapshots")
          .select("total_sales,net_profit,month").eq("user_id", data.user.id).eq("month", m).single();
        setThisSnap(snap ?? null);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetch("/api/home")
      .then(r => r.json())
      .then(d => { if (d.news) setNews(d.news); })
      .catch(() => setNews([
        { title:"최저임금 인상 논의 본격화", summary:"2027년 최저임금 심의 시작", source:"연합뉴스", url:"https://www.yna.co.kr" },
        { title:"배달앱 수수료 인하 논의", summary:"소상공인 부담 완화 추진", source:"한국경제", url:"https://www.hankyung.com" },
        { title:"외식물가 상승세 지속", summary:"식재료비·인건비 동반 상승", source:"머니투데이", url:"https://www.mt.co.kr" },
      ]))
      .finally(() => setNewsLoad(false));
  }, []);

  const name = user?.user_metadata?.nickname || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "사장님";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "좋은 아침이에요" : hour < 18 ? "안녕하세요" : "오늘도 수고하셨어요";
  const fmtN = (n: number) => Math.round(n).toLocaleString("ko-KR");

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex items-center justify-center h-[80vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl space-y-5">

          {/* 인사말 */}
          <div>
            <p className="text-sm text-slate-400">{new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{greeting}, {name}님! 👋</h1>
          </div>

          {/* 빠른 실행 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {icon:"📊",label:"시뮬레이터",sub:"수익 분석하기",  href:"/simulator",bg:"bg-slate-900",text:"text-white",subText:"text-slate-400"},
              {icon:"🎮",label:"경영 게임", sub:"90일 운영해보기",href:"/game",     bg:"bg-blue-600", text:"text-white",subText:"text-blue-200"},
              {icon:"📈",label:"대시보드",  sub:"매출 현황 보기", href:"/dashboard",bg:"bg-white",    text:"text-slate-900",subText:"text-slate-400"},
              {icon:"👥",label:"커뮤니티",  sub:"사장님들과 소통",href:"/community",bg:"bg-white",    text:"text-slate-900",subText:"text-slate-400"},
            ].map(b=>(
              <Link key={b.href} href={b.href}
                className={`${b.bg} ${b.text} rounded-2xl p-4 sm:p-5 ring-1 ring-slate-200 hover:opacity-90 transition block`}>
                <p className="text-2xl mb-2">{b.icon}</p>
                <p className="text-sm font-bold">{b.label}</p>
                <p className={`text-xs mt-0.5 ${b.subText} hidden sm:block`}>{b.sub}</p>
              </Link>
            ))}
          </div>

          {/* 지수 티커 */}
          <StockTicker />

          {/* 이번달 매출 알림 */}
          {thisSnap === null && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xl">📋</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">이번 달 매출을 아직 등록하지 않으셨어요</p>
                  <p className="text-xs text-amber-600 mt-0.5">등록하면 월별 현황과 순이익을 한눈에 볼 수 있어요</p>
                </div>
              </div>
              <Link href="/dashboard" className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-600 transition">등록하기 →</Link>
            </div>
          )}
          {thisSnap && (
            <div className="rounded-2xl bg-white ring-1 ring-slate-200 px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xl">📈</span>
                <div>
                  <p className="text-xs text-slate-400">{thisSnap.month} 매출 현황</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    매출 <span className="text-blue-600">{fmtN(thisSnap.total_sales)}원</span>
                    <span className="text-slate-300 mx-2">·</span>
                    순이익 <span className={thisSnap.net_profit>=0?"text-emerald-600":"text-red-500"}>{thisSnap.net_profit>=0?"+":""}{fmtN(thisSnap.net_profit)}원</span>
                  </p>
                </div>
              </div>
              <Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition">상세보기 →</Link>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 뉴스 */}
            <div className="sm:col-span-2 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-base font-bold text-slate-900">📰 오늘의 외식업 뉴스</h2>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AI 요약</span>
              </div>
              {newsLoad ? (
                <div className="space-y-3">
                  {[1,2,3].map(i=><div key={i} className="animate-pulse space-y-1"><div className="h-4 bg-slate-100 rounded w-3/4"/><div className="h-3 bg-slate-100 rounded w-1/2"/></div>)}
                  <p className="text-xs text-slate-400 mt-2">오늘 뉴스 불러오는 중...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {news.map((n,i)=>(
                    <a key={i} href={n.url||"#"} target="_blank" rel="noopener noreferrer"
                      className="flex gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0 hover:bg-slate-50 rounded-xl px-2 -mx-2 transition group">
                      <span className="text-base flex-shrink-0 mt-0.5">📌</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition">{n.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{n.summary}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <p className="text-xs text-slate-400">{n.source}</p>
                          <span className="text-xs text-slate-300">·</span>
                          <p className="text-xs text-blue-400 group-hover:text-blue-600">원문 보기 →</p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
            {/* 도구 */}
            <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
              <h2 className="text-base font-bold text-slate-900 mb-4">🛠️ 도구</h2>
              <div className="grid grid-cols-2 gap-2">
                {TOOLS_HOME.map(t=>(
                  <Link key={t.href} href={t.href}
                    className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 p-2.5 hover:bg-slate-100 transition text-center">
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-xs font-medium text-slate-700 leading-tight">{t.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 게임 배너 */}
          <div className="rounded-3xl bg-slate-900 p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-white font-bold text-lg">🎮 경영 시뮬레이션 게임</p>
              <p className="text-slate-400 text-sm mt-1">4가지 모드로 내 가게를 운영해보세요!</p>
            </div>
            <Link href="/game" className="rounded-2xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition flex-shrink-0">게임 시작 →</Link>
          </div>

        </div>
      </main>
    </div>
  );
}

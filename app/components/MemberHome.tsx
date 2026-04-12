"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import OnboardingModal from "@/components/OnboardingModal";
import MonthlyReminder from "@/components/MonthlyReminder";
import EventBanner from "@/components/EventBanner";
import type { User } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────
type NewsItem = { title:string; summary:string; source:string; url:string; tag?:string; insight?:string; date?:string };
type IndexData = { price:string; date:string } | null;

// ── Constants ──────────────────────────────────────────────────
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

const NEWS_TAGS = [
  { key: "all", label: "전체", color: "bg-slate-900 text-white" },
  { key: "외식업", label: "🍽️ 외식업", color: "bg-orange-500 text-white" },
  { key: "경제", label: "📈 경제", color: "bg-blue-500 text-white" },
];

const TAG_COLORS: Record<string, string> = {
  "외식업": "bg-orange-100 text-orange-700",
  "경제": "bg-blue-100 text-blue-700",
};

// ── StockTicker ────────────────────────────────────────────────
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

// ── NewsSection ────────────────────────────────────────────────
function NewsSection({ news, loading }: { news: NewsItem[]; loading: boolean }) {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? news : news.filter(n => n.tag === filter);

  return (
    <div className="sm:col-span-2 rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-slate-900">📰 오늘의 뉴스</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}</span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">AI 요약</span>
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto">
        {NEWS_TAGS.map(t => (
          <button key={t.key} onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              filter === t.key ? t.color : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i=><div key={i} className="animate-pulse space-y-1"><div className="h-4 bg-slate-100 rounded w-3/4"/><div className="h-3 bg-slate-100 rounded w-1/2"/></div>)}
          <p className="text-xs text-slate-400 mt-2">오늘 뉴스 불러오는 중...</p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">해당 카테고리 뉴스가 없어요.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((n,i)=>(
            <a key={i} href={n.url||"#"} target="_blank" rel="noopener noreferrer"
              className="block rounded-2xl border border-slate-100 p-4 hover:bg-slate-50 hover:border-slate-200 transition group">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {n.tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TAG_COLORS[n.tag] ?? "bg-slate-100 text-slate-600"}`}>{n.tag}</span>}
                    <span className="text-[11px] text-slate-400">{n.source}</span>
                    {n.date && <span className="text-[10px] text-slate-300">{n.date.slice(5).replace("-", "/")}</span>}
                  </div>
                  <p className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-blue-600 transition">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{n.summary}</p>
                  {n.insight && (
                    <div className="mt-2 rounded-lg bg-amber-50 px-3 py-1.5">
                      <p className="text-xs text-amber-800">💡 <b>사장님 인사이트:</b> {n.insight}</p>
                    </div>
                  )}
                </div>
                <span className="text-xs text-blue-400 group-hover:text-blue-600 flex-shrink-0 mt-1">보기 →</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ── OwnerTips ───────────────────────────────────────────────────
function OwnerTips() {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDay(); // 0=일 ~ 6=토
  const date = now.getDate();

  // 월별 시즌 팁
  const seasonalTips: Record<number, { title: string; tips: string[] }> = {
    1: { title: "1월 — 신년 시즌", tips: ["연초 메뉴 리뉴얼 시기입니다. 작년 하위 20% 메뉴를 과감히 정리하세요.", "연말정산 시즌, 법인카드 사용 고객이 늘어납니다. 점심 세트 강화하세요.", "난방비가 가장 높은 달입니다. 에어커튼·문풍지로 열손실 20% 줄일 수 있어요."] },
    2: { title: "2월 — 비수기 돌파", tips: ["외식업 비수기입니다. 이 시기에 원가율을 1%만 낮춰도 연간 수백만원 절약됩니다.", "발렌타인데이 특별 메뉴를 2주 전부터 SNS에 노출하세요. 예약제가 객단가를 올립니다.", "비수기에 직원 교육을 집중하세요. 성수기에 서비스 품질이 매출을 결정합니다."] },
    3: { title: "3월 — 봄 시즌 준비", tips: ["봄 메뉴 출시 적기입니다. 제철 식재료(냉이, 달래, 봄나물) 활용하면 원가를 낮출 수 있어요.", "테라스·야외 좌석이 있다면 지금 정비하세요. 4월부터 회전율이 2배 됩니다.", "3월 신학기에 주변 학교·학원가 전단지 배포가 가장 효과적입니다."] },
    4: { title: "4월 — 성수기 진입", tips: ["꽃놀이 시즌, 테이크아웃·도시락 메뉴를 추가하면 객단가 외 추가 매출이 생깁니다.", "4월은 외식 지출이 연중 최고인 달입니다. 신메뉴 출시 골든타임이에요.", "네이버 플레이스 리뷰 관리를 집중하세요. 봄에 검색량이 급증합니다."] },
    5: { title: "5월 — 가정의 달 특수", tips: ["어버이날·어린이날 가족 단체 예약을 2주 전부터 받으세요. 코스 메뉴가 객단가를 50% 올립니다.", "가정의 달 선물세트(상품권, 밀키트)를 만들어보세요. 객단가 대비 마진이 높습니다.", "5월 매출이 연간 BEP 달성 여부를 결정합니다. 이 달 순이익을 꼭 체크하세요."] },
    6: { title: "6월 — 여름 대비", tips: ["장마 시작 전 배달 메뉴를 강화하세요. 비 오는 날 배달 주문이 평소의 1.5배입니다.", "에어컨 점검과 전기료 확인을 지금 하세요. 여름 전기료가 월 50만원 이상 늘어날 수 있습니다.", "냉면·빙수 등 여름 한정 메뉴를 6월 초에 출시하면 SNS 선점 효과가 있습니다."] },
    7: { title: "7월 — 성수기 관리", tips: ["여름 성수기 식자재 관리가 핵심입니다. 냉장고 온도를 매일 체크하고 선입선출 철저히 하세요.", "무더위에 홀 매출이 줄고 배달이 늘어납니다. 배달 전용 메뉴 마진을 재계산하세요.", "파트타이머 채용 시기입니다. 여름 알바를 7월 초에 확보해야 8월에 안정적입니다."] },
    8: { title: "8월 — 휴가 시즌", tips: ["사장님도 쉬어야 합니다. 연중 가장 매출이 낮은 주를 골라 3일이라도 휴가를 내세요.", "8월은 식재료 가격이 연중 최고입니다. 메뉴 가격 조정을 고려할 시기예요.", "여름 한정 메뉴의 재고를 정리하고, 가을 메뉴를 9월 초 출시 목표로 준비하세요."] },
    9: { title: "9월 — 가을 시즌", tips: ["추석 연휴 전 영업 계획을 세우세요. 명절 선물세트가 의외의 매출원이 됩니다.", "가을 제철 식재료(버섯, 고구마, 밤)로 메뉴를 구성하면 원가 절감 + 계절감을 잡을 수 있어요.", "9월부터 점심 매출이 회복됩니다. 직장인 대상 런치 세트를 재정비하세요."] },
    10: { title: "10월 — 4분기 전략", tips: ["연말까지 3개월, 올해 목표 매출 대비 현재 달성률을 체크하세요. VELA 대시보드에서 확인 가능합니다.", "할로윈 이벤트는 카페·바 업종에서 객단가를 30% 올릴 수 있는 기회입니다.", "10월은 연간 식재료비를 재협상하기 좋은 시기입니다. 거래처에 단가 조정을 요청하세요."] },
    11: { title: "11월 — 연말 준비", tips: ["12월 송년회·모임 예약을 11월부터 받으세요. 단체 코스 메뉴를 미리 구성해두면 객단가가 2배입니다.", "연말정산 대비, 올해 비용 지출 내역을 정리하세요. 놓친 경비 처리가 있을 수 있어요.", "겨울 메뉴(국물, 따뜻한 음료) 출시 적기입니다. 11월 중순 출시가 이상적이에요."] },
    12: { title: "12월 — 연말 특수", tips: ["송년회 시즌, 단체 예약 노쇼를 방지하기 위해 예약금 제도를 도입하세요.", "연말 매출이 좋아도 1월 비수기를 대비해 현금을 확보하세요. 매출의 20%는 유보하는 게 안전합니다.", "올해 월별 매출·순이익을 정리하고 내년 목표를 세우세요. VELA 시뮬레이터로 시나리오를 돌려보세요."] },
  };

  // 요일별 팁
  const dailyTips: Record<number, string> = {
    1: "월요일은 보통 매출이 낮은 날입니다. 식재료 발주와 재고 정리에 집중하세요.",
    2: "화요일은 신메뉴 테스트에 적합합니다. 손님이 적을 때 직원들과 시식 평가를 해보세요.",
    3: "수요일 — 주중 중간 매출 회복일입니다. SNS에 주말 이벤트를 미리 올려두세요.",
    4: "목요일부터 주말 식재료를 준비하세요. 금요일 발주는 늦습니다.",
    5: "금요일 저녁은 회전율이 핵심입니다. 예약 손님과 워크인 비율을 체크하세요.",
    6: "토요일은 매출 최고일이지만 식재료 소진도 빠릅니다. 재고를 수시로 확인하세요.",
    0: "일요일은 브런치·가족 단위 손님이 많습니다. 세트 메뉴가 객단가를 올립니다.",
  };

  const season = seasonalTips[month] ?? seasonalTips[4];
  const tipIndex = date % season.tips.length;

  return (
    <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-bold text-slate-900">💡 사장님 실전 경영 팁</h2>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{season.title}</span>
      </div>
      <div className="space-y-3">
        <div className="rounded-2xl bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold text-blue-600 mb-1">이번 달 핵심</p>
          <p className="text-sm text-blue-900 leading-relaxed">{season.tips[tipIndex]}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold text-slate-500 mb-1">오늘의 할 일</p>
          <p className="text-sm text-slate-700 leading-relaxed">{dailyTips[day]}</p>
        </div>
        <div className="rounded-2xl bg-amber-50 px-4 py-3">
          <p className="text-xs font-semibold text-amber-600 mb-1">원가 절감 팁</p>
          <p className="text-sm text-amber-900 leading-relaxed">
            {month <= 2 || month >= 11
              ? "겨울철 가스비가 급등합니다. 조리 효율을 높이려면 뚜껑 사용, 예열 시간 단축, 동시 조리를 습관화하세요."
              : month <= 5
              ? "봄 제철 식재료를 적극 활용하세요. 제철 재료는 맛도 좋고 원가도 30% 이상 저렴합니다."
              : month <= 8
              ? "여름철 식재료 폐기율이 높아집니다. 발주 주기를 주 2→3회로 늘리면 폐기를 절반으로 줄일 수 있어요."
              : "가을 제철 재료(버섯, 고구마, 밤)로 메뉴를 구성하면 원가를 낮추면서 계절감을 줄 수 있습니다."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── MemberHome ─────────────────────────────────────────────────
export default function MemberHome() {
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
          .select("total_sales,net_profit,month").eq("user_id", data.user.id).eq("month", m).maybeSingle();
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
  const greeting = hour < 6 ? "늦은 밤이에요" : hour < 12 ? "좋은 아침이에요" : hour < 18 ? "안녕하세요" : "오늘도 수고하셨어요";
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
      <OnboardingModal />

      <main className="px-4 py-8 md:px-8">
        <div className="mx-auto max-w-4xl space-y-5">

          {/* 인사말 */}
          <div>
            <p className="text-sm text-slate-400">{new Date().toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric",weekday:"long"})}</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{greeting}, {name}님! 👋</h1>
          </div>

          {/* 가입 환영 배너 (첫 방문 시) */}
          {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("signup") === "success" && (
            <div className="rounded-2xl bg-blue-600 px-5 py-4 flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-white font-bold text-sm">환영합니다! VELA에 가입되었어요.</p>
                <p className="text-blue-200 text-xs mt-0.5">시뮬레이터로 내 매장을 분석해보세요. 3분이면 충분합니다.</p>
              </div>
              <Link href="/simulator" className="ml-auto flex-shrink-0 rounded-xl bg-white text-blue-600 text-xs font-bold px-4 py-2">무료로 시작하기</Link>
            </div>
          )}

          {/* 이벤트 배너 */}
          <EventBanner />

          {/* 빠른 실행 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {icon:"📊",label:"시뮬레이터",sub:"수익 분석하기",  href:"/simulator",bg:"bg-slate-900",text:"text-white",subText:"text-slate-400"},
              {icon:"🛠️",label:"도구 모음", sub:"원가·세금·인건비",href:"/tools",   bg:"bg-blue-600", text:"text-white",subText:"text-blue-200"},
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

          {/* 월초 매출 등록 리마인더 */}
          {thisSnap === null && <MonthlyReminder />}

          {/* 이번달 매출 알림 — MonthlyReminder에서 이미 표시하므로 중복 제거 */}
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

          {/* 사장님 실전 경영 팁 */}
          <OwnerTips />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* 뉴스 */}
            <NewsSection news={news} loading={newsLoad} />
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

        </div>
      </main>
    </div>
  );
}

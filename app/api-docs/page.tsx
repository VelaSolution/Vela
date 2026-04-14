"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Endpoint = {
  method: "GET" | "POST";
  path: string;
  description: string;
  category: string;
  auth: boolean;
  rateLimit: string | null;
  requestBody: string | null;
  responseExample: string;
};

/* ------------------------------------------------------------------ */
/*  Endpoint catalog                                                   */
/* ------------------------------------------------------------------ */

const ENDPOINTS: Endpoint[] = [
  // ── AI ──
  {
    method: "POST",
    path: "/api/ai-strategy",
    description: "AI 전략 추천 (매장 수치 기반 경영 전략 생성)",
    category: "AI",
    auth: false,
    rateLimit: "5회/분",
    requestBody: JSON.stringify({ form: { industry: "cafe", monthlyRent: 2000000, employees: 3, deliveryPreference: "possible" }, result: { totalSales: 15000000, profit: 3000000 }, existingStrategies: [] }, null, 2),
    responseExample: JSON.stringify({ strategy: "매출 구조 개선을 위해 배달 채널을 확대하세요..." }, null, 2),
  },
  {
    method: "POST",
    path: "/api/anon-ai-reply",
    description: "익명 게시글에 AI 자동 답변 생성",
    category: "AI",
    auth: false,
    rateLimit: "5회/분",
    requestBody: JSON.stringify({ postId: "uuid-1234" }, null, 2),
    responseExample: JSON.stringify({ ok: true, commentId: "uuid-5678" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/briefing",
    description: "AI 경영 브리핑 (오늘의 매장 진단 요약)",
    category: "AI",
    auth: false,
    rateLimit: "5회/분",
    requestBody: JSON.stringify({ form: { industry: "restaurant", monthlyRent: 3000000 }, result: { totalSales: 20000000, profit: 5000000 } }, null, 2),
    responseExample: JSON.stringify({ briefing: "매출 대비 임대료 비율이 15%로 양호합니다..." }, null, 2),
  },
  {
    method: "POST",
    path: "/api/chat",
    description: "AI 채팅 (외식업 경영 상담 대화)",
    category: "AI",
    auth: false,
    rateLimit: "10회/분",
    requestBody: JSON.stringify({ messages: [{ role: "user", content: "인건비를 줄이려면?" }], context: { industry: "cafe" } }, null, 2),
    responseExample: JSON.stringify({ role: "assistant", content: "카페 인건비 절감 방법은..." }, null, 2),
  },
  {
    method: "POST",
    path: "/api/tools/generate",
    description: "AI 콘텐츠 생성 (마케팅 문구, 메뉴 설명 등)",
    category: "AI",
    auth: true,
    rateLimit: "10회/분",
    requestBody: JSON.stringify({ prompt: "카페 신메뉴 홍보 문구 작성", systemPrompt: "마케팅 전문가로서 답변하세요" }, null, 2),
    responseExample: JSON.stringify({ text: "향긋한 봄 시즌 한정 라벤더 라떼..." }, null, 2),
  },

  // ── 데이터 ──
  {
    method: "GET",
    path: "/api/benchmark",
    description: "업종별 벤치마크 데이터 (매출/원가율/인건비 평균)",
    category: "데이터",
    auth: false,
    rateLimit: "10회/분",
    requestBody: null,
    responseExample: JSON.stringify({ industry: "cafe", avgSales: 18000000, avgCostRate: 35, avgLaborRate: 25, sampleSize: 124 }, null, 2),
  },
  {
    method: "POST",
    path: "/api/card-sales",
    description: "카드매출 조회 (사업자번호 기반)",
    category: "데이터",
    auth: false,
    rateLimit: "5회/분",
    requestBody: JSON.stringify({ bizNumber: "1234567890" }, null, 2),
    responseExample: JSON.stringify({ period: "2026-03", totalSales: 12500000, cardSales: 9800000, cashSales: 2700000, dailyAvg: 416666 }, null, 2),
  },
  {
    method: "POST",
    path: "/api/delivery-analysis",
    description: "배달앱 정산 데이터 분석 (CSV 텍스트 기반)",
    category: "데이터",
    auth: false,
    rateLimit: "5회/분",
    requestBody: JSON.stringify({ csvText: "날짜,주문수,매출\n2026-03-01,45,1350000", platform: "baemin", fileName: "정산서.xlsx" }, null, 2),
    responseExample: JSON.stringify({ totalOrders: 1350, totalSales: 40500000, avgOrderPrice: 30000, commission: 5400000 }, null, 2),
  },
  {
    method: "GET",
    path: "/api/home",
    description: "홈 데이터 (KOSPI/KOSDAQ/환율 + 뉴스)",
    category: "데이터",
    auth: false,
    rateLimit: null,
    requestBody: null,
    responseExample: JSON.stringify({ stocks: { kospi: { price: "2,650.32", date: "2026.04.05" }, kosdaq: { price: "870.15", date: "2026.04.05" }, usdkrw: { price: "1,345.2", date: "2026.04.05" } }, news: [] }, null, 2),
  },
  {
    method: "GET",
    path: "/api/ingredient-price",
    description: "식재료 가격 조회 (KAMIS 농산물 유통정보)",
    category: "데이터",
    auth: false,
    rateLimit: "20회/분",
    requestBody: null,
    responseExample: JSON.stringify({ items: [{ name: "양파", unit: "1kg", price: 2800, change: -3.4 }], date: "2026-04-05" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/parse-excel",
    description: "엑셀/CSV 파싱 (AI 기반 매출 데이터 추출)",
    category: "데이터",
    auth: false,
    rateLimit: "3회/분",
    requestBody: JSON.stringify({ csvText: "날짜,매출,비용\n2026-03-01,500000,200000", fileName: "매출현황.xlsx", industry: "cafe" }, null, 2),
    responseExample: JSON.stringify({ parsed: { totalSales: 500000, totalCost: 200000, rows: 1 } }, null, 2),
  },
  {
    method: "GET",
    path: "/api/report-card",
    description: "성적표 OG 이미지 생성 (SNS 공유용)",
    category: "데이터",
    auth: false,
    rateLimit: null,
    requestBody: null,
    responseExample: "image/png (1080x1080)\nQuery params: ?store=매장명&industry=카페&sales=15000000&profit=3000000&margin=20&rank=15",
  },

  // ── 결제 ──
  {
    method: "POST",
    path: "/api/payment/confirm",
    description: "토스페이먼츠 결제 승인 처리",
    category: "결제",
    auth: true,
    rateLimit: null,
    requestBody: JSON.stringify({ paymentKey: "toss_pay_key_xxx", orderId: "VELA-pro-1712345678", amount: 9900 }, null, 2),
    responseExample: JSON.stringify({ ok: true, plan: "pro", orderId: "VELA-pro-1712345678" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/subscription/cancel",
    description: "구독 해지 (플랜을 free로 변경)",
    category: "결제",
    auth: true,
    rateLimit: null,
    requestBody: JSON.stringify({}, null, 2),
    responseExample: JSON.stringify({ ok: true }, null, 2),
  },

  // ── 관리 ──
  {
    method: "POST",
    path: "/api/contact",
    description: "문의하기 (이메일 발송)",
    category: "관리",
    auth: false,
    rateLimit: null,
    requestBody: JSON.stringify({ name: "홍길동", email: "user@example.com", message: "가격 문의드립니다." }, null, 2),
    responseExample: JSON.stringify({ ok: true }, null, 2),
  },
  {
    method: "POST",
    path: "/api/event/feedback",
    description: "이벤트/서비스 피드백 제출",
    category: "관리",
    auth: false,
    rateLimit: "3회/분",
    requestBody: JSON.stringify({ user_id: "uuid", nickname: "사장님", industry: "cafe", review: "유용합니다", useful_features: ["진단", "AI전략"], pay_intent: "yes" }, null, 2),
    responseExample: JSON.stringify({ ok: true, id: "uuid" }, null, 2),
  },
  {
    method: "POST",
    path: "/api/newsletter",
    description: "월간 뉴스레터 발송 (관리자 전용, secret 필요)",
    category: "관리",
    auth: false,
    rateLimit: null,
    requestBody: JSON.stringify({ secret: "TOSS_SECRET_KEY" }, null, 2),
    responseExample: JSON.stringify({ ok: true, sent: 42 }, null, 2),
  },
  {
    method: "POST",
    path: "/api/reminder",
    description: "매출 미입력 유저 리마인더 발송 (관리자 전용)",
    category: "관리",
    auth: false,
    rateLimit: "2회/분",
    requestBody: JSON.stringify({ secret: "TOSS_SECRET_KEY" }, null, 2),
    responseExample: JSON.stringify({ ok: true, sent: 15 }, null, 2),
  },
  {
    method: "POST",
    path: "/api/weekly-report",
    description: "주간 리포트 이메일 발송 (관리자 전용)",
    category: "관리",
    auth: false,
    rateLimit: "2회/분",
    requestBody: JSON.stringify({ secret: "TOSS_SECRET_KEY" }, null, 2),
    responseExample: JSON.stringify({ ok: true, sent: 38 }, null, 2),
  },
];

const CATEGORIES = ["AI", "데이터", "결제", "관리"] as const;

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ApiDocsPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openPaths, setOpenPaths] = useState<Set<string>>(new Set());
  const [expandedCategory, setExpandedCategory] = useState<Set<string>>(new Set(CATEGORIES));

  /* ── Admin check ── */
  useEffect(() => {
    (async () => {
      try {
        const sb = createSupabaseBrowserClient();
        if (!sb) { setLoading(false); return; }
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { setLoading(false); return; }
        const adminEmails = ["mnhyuk@velaanalytics.com", "mnhyuk0213@gmail.com"];
        if (adminEmails.includes(user.email ?? "")) setAuthorized(true);
      } catch (e) {
        console.error("Auth check failed:", e);
      }
      setLoading(false);
    })();
  }, []);

  /* ── Filter ── */
  const filtered = ENDPOINTS.filter((ep) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      ep.path.toLowerCase().includes(q) ||
      ep.description.toLowerCase().includes(q) ||
      ep.method.toLowerCase().includes(q) ||
      ep.category.toLowerCase().includes(q)
    );
  });

  const toggle = (path: string) => {
    setOpenPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategory((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  /* ── Loading / Unauthorized ── */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400 text-lg">Loading...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <div className="text-4xl">🔒</div>
          <h1 className="text-xl font-bold text-slate-800">접근 권한 없음</h1>
          <p className="text-slate-500 text-sm">관리자 계정으로 로그인해주세요.</p>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">API Documentation</h1>
          <p className="text-slate-500 text-sm">
            VELA 내부 API 엔드포인트 레퍼런스 &mdash; 총 {ENDPOINTS.length}개
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="엔드포인트 검색 (경로, 설명, 메서드...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {CATEGORIES.map((cat) => {
            const count = filtered.filter((e) => e.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  expandedCategory.has(cat)
                    ? "bg-slate-800 text-white"
                    : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Endpoint groups */}
        {CATEGORIES.map((cat) => {
          const items = filtered.filter((e) => e.category === cat);
          if (items.length === 0) return null;
          const isExpanded = expandedCategory.has(cat);

          return (
            <div key={cat} className="mb-6">
              <button
                onClick={() => toggleCategory(cat)}
                className="flex items-center gap-2 mb-3 group"
              >
                <span className="text-xs text-slate-400 transition-transform group-hover:text-slate-600" style={{ transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)" }}>
                  ▶
                </span>
                <h2 className="text-lg font-semibold text-slate-800">{cat}</h2>
                <span className="text-xs text-slate-400">{items.length}개</span>
              </button>

              {isExpanded && (
                <div className="space-y-2">
                  {items.map((ep) => {
                    const isOpen = openPaths.has(ep.path);
                    return (
                      <div
                        key={ep.path}
                        className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                      >
                        {/* Collapsed row */}
                        <button
                          onClick={() => toggle(ep.path)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                        >
                          <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold shrink-0 ${METHOD_STYLES[ep.method]}`}>
                            {ep.method}
                          </span>
                          <code className="text-sm font-mono text-slate-700 shrink-0">
                            {ep.path}
                          </code>
                          <span className="text-sm text-slate-500 truncate ml-auto">
                            {ep.description}
                          </span>
                          <span className="text-xs text-slate-300 shrink-0" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                            ▼
                          </span>
                        </button>

                        {/* Expanded detail */}
                        {isOpen && (
                          <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50/50">
                            {/* Meta */}
                            <div className="flex flex-wrap gap-3 text-xs">
                              <span className="px-2 py-1 rounded bg-slate-100 text-slate-600">
                                인증: {ep.auth ? "필요" : "불필요"}
                              </span>
                              {ep.rateLimit && (
                                <span className="px-2 py-1 rounded bg-amber-50 text-amber-700">
                                  Rate Limit: {ep.rateLimit}
                                </span>
                              )}
                            </div>

                            {/* Request body */}
                            {ep.requestBody && (
                              <div>
                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                  Request Body
                                </h4>
                                <pre className="bg-slate-900 text-green-300 rounded-lg p-3 text-xs overflow-x-auto">
                                  {ep.requestBody}
                                </pre>
                              </div>
                            )}

                            {/* Response */}
                            <div>
                              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Response Example
                              </h4>
                              <pre className="bg-slate-900 text-blue-300 rounded-lg p-3 text-xs overflow-x-auto">
                                {ep.responseExample}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <div className="text-3xl mb-2">🔍</div>
            <p>검색 결과가 없습니다.</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
          VELA Internal API Docs &mdash; {ENDPOINTS.length} endpoints
        </div>
      </div>
    </div>
  );
}

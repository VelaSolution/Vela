"use client";

import { useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import ToolNav from "@/components/ToolNav";

type CheckItem = {
  id: string;
  label: string;
  desc?: string;
  required: boolean;
  done: boolean;
  link?: string;
};

type Phase = {
  id: string;
  title: string;
  emoji: string;
  timeline: string;
  items: Omit<CheckItem, "done">[];
};

// ─── 체크리스트 데이터 ─────────────────────────────────────────────────────────

type PhaseBase = Omit<Phase, "items"> & { items: Omit<CheckItem, "done">[] };

const PHASES_BASE: PhaseBase[] = [
  {
    id: "planning",
    title: "사업 기획",
    emoji: "💡",
    timeline: "D-180 ~ D-90",
    items: [
      { id: "concept", label: "사업 컨셉 및 타깃 고객 정의", required: true },
      { id: "market", label: "상권 조사 및 입지 분석", desc: "유동 인구, 경쟁 업체, 임대료 비교", required: true },
      { id: "competitor", label: "경쟁 업체 벤치마킹 (3곳 이상)", required: false },
      { id: "menu-plan", label: "메뉴 기획 및 레시피 개발", required: true },
      { id: "revenue-sim", label: "수익 시뮬레이션 작성", desc: "VELA 시뮬레이터 활용 권장", required: true, link: "/simulator" },
      { id: "budget", label: "초기 투자 비용 산정", required: true },
      { id: "funding", label: "자금 조달 방법 결정 (자기자본/대출/투자)", required: true },
    ],
  },
  {
    id: "legal",
    title: "법적 절차",
    emoji: "📋",
    timeline: "D-90 ~ D-60",
    items: [
      { id: "biz-reg", label: "사업자등록 (세무서 or 홈택스)", required: true, link: "https://www.hometax.go.kr" },
      { id: "food-license", label: "식품위생법상 영업 허가/신고", desc: "일반음식점 영업신고 or 즉석판매제조가공업", required: true },
      { id: "health-cert", label: "영업자 위생교육 이수", desc: "식품위생교육원 (6시간)", required: true },
      { id: "health-check", label: "건강진단 (보건증)", required: true },
      { id: "fire-safety", label: "소방시설 완비증명서 확인", required: true },
      { id: "alcohol", label: "주류 판매 허가 (해당 시)", desc: "관할 세무서 신청", required: false },
      { id: "franchise", label: "프랜차이즈 계약 검토 (해당 시)", desc: "공정거래위원회 가맹사업정보 확인 권장", required: false },
      { id: "insurance", label: "사업장 화재보험 가입", required: true },
    ],
  },
  {
    id: "location",
    title: "공간 준비",
    emoji: "🏠",
    timeline: "D-90 ~ D-45",
    items: [
      { id: "lease", label: "임대차 계약 체결", desc: "건물 용도, 임차인 동의 사항 확인 필수", required: true },
      { id: "interior-design", label: "인테리어 설계 및 업체 선정", required: true },
      { id: "interior-work", label: "인테리어 공사 진행", required: true },
      { id: "signage", label: "간판 제작 및 설치", desc: "옥외광고물법 신고 필요", required: true },
      { id: "equipment", label: "주방 기기·집기 구매 및 설치", required: true },
      { id: "pos-system", label: "POS 시스템 도입", required: true },
      { id: "wifi", label: "인터넷·CCTV 설치", required: false },
    ],
  },
  {
    id: "hr",
    title: "인력·운영",
    emoji: "👥",
    timeline: "D-45 ~ D-14",
    items: [
      { id: "hire", label: "직원 채용 (알바천국, 사람인 등)", required: true },
      { id: "labor-contract", label: "근로계약서 작성", desc: "표준 근로계약서 사용 권장", required: true },
      { id: "training", label: "직원 위생·서비스 교육", required: true },
      { id: "supplier", label: "식자재 공급업체 계약", required: true },
      { id: "sop", label: "운영 매뉴얼 작성", desc: "개점·마감·위생 점검 루틴", required: false },
      { id: "delivery-app", label: "배달앱 입점 신청 (배민/쿠팡이츠)", desc: "심사 기간 약 7~14일 소요", required: false },
    ],
  },
  {
    id: "marketing",
    title: "마케팅·홍보",
    emoji: "📣",
    timeline: "D-30 ~ D-0",
    items: [
      { id: "sns-setup", label: "인스타그램·블로그 계정 개설", required: false },
      { id: "naver-place", label: "네이버 플레이스 등록", required: true },
      { id: "kakao-map", label: "카카오맵 등록", required: true },
      { id: "google-map", label: "구글맵 등록", required: false },
      { id: "grand-open", label: "그랜드오픈 이벤트 기획", desc: "SNS 콘텐츠 생성기 활용 권장", required: false, link: "/tools/sns-content" },
      { id: "flyer", label: "전단지·쿠폰 제작 (주변 반경 배포)", required: false },
      { id: "photo", label: "메뉴 사진 촬영 (전문 or DIY)", required: true },
    ],
  },
  {
    id: "finance",
    title: "재무 준비",
    emoji: "💰",
    timeline: "D-30 ~ 개점 후",
    items: [
      { id: "bank-account", label: "사업용 은행 계좌 개설", required: true },
      { id: "card-terminal", label: "카드 단말기 임대 계약", required: true },
      { id: "cash-register", label: "현금영수증 가맹점 가입 (의무)", required: true, link: "https://www.hometax.go.kr" },
      { id: "accounting", label: "회계 소프트웨어 or 세무사 계약", required: true },
      { id: "emergency-fund", label: "운영 예비자금 3개월치 확보", desc: "개점 초기 매출 부진 대비", required: true },
      { id: "tax-plan", label: "세금 납부 계획 수립", desc: "세금 계산기로 미리 시뮬레이션", required: true, link: "/tools/tax" },
    ],
  },
];

function buildState(phases: PhaseBase[], industry: string) {
  // 업종별 특수 항목 추가
  const extras: Record<string, { phaseId: string; item: Omit<CheckItem, "done"> }[]> = {
    bar: [
      { phaseId: "legal", item: { id: "alcohol-bar", label: "일반음식점 주류 판매 신고 확인", desc: "유흥업과 혼동 주의", required: true } },
    ],
    cafe: [
      { phaseId: "legal", item: { id: "cafe-ice", label: "즉석판매제조가공업 신고 (디저트 직접 제조 시)", required: false } },
    ],
    finedining: [
      { phaseId: "legal", item: { id: "wine-import", label: "주류 수입 관련 면허 검토 (와인 셀러 운영 시)", required: false } },
      { phaseId: "hr", item: { id: "sommelier", label: "소믈리에·파티시에 등 전문 인력 채용", required: false } },
    ],
    gogi: [
      { phaseId: "legal", item: { id: "gogi-dual1", label: "이중사업자 구조 검토 (세무사 상담 필수)", desc: "1호 음식점업 + 2호 축산물판매업 구조", required: true } },
      { phaseId: "legal", item: { id: "gogi-livestock", label: "축산물판매업 영업허가 신청", desc: "관할 시·군·구청 위생과 또는 농식품부", required: true } },
      { phaseId: "legal", item: { id: "gogi-haccp", label: "HACCP 인증 검토 (냉장·냉동 보관 기준 준수)", required: false } },
      { phaseId: "legal", item: { id: "gogi-origin", label: "원산지 표시 의무 준비 (돼지·소 원산지 메뉴판 표기)", required: true } },
      { phaseId: "finance", item: { id: "gogi-biz2-account", label: "2호 사업자 별도 계좌·카드단말 개설", desc: "1호·2호 매출·매입 분리 필수", required: true } },
      { phaseId: "finance", item: { id: "gogi-taxadvisor", label: "이중사업자 전문 세무사 계약", desc: "부가세 매입세액 공제 최적화", required: true } },
      { phaseId: "hr", item: { id: "gogi-butcher", label: "정육 처리 인력 확보 또는 외주 계약", required: false } },
    ],
  };

  return phases.map((phase) => ({
    ...phase,
    items: [
      ...phase.items,
      ...(extras[industry] ?? []).filter(e => e.phaseId === phase.id).map(e => e.item),
    ].map(item => ({ ...item, done: false })),
  }));
}

const INDUSTRIES = [
  { id: "cafe", label: "카페", emoji: "☕" },
  { id: "restaurant", label: "음식점", emoji: "🍽️" },
  { id: "bar", label: "술집/바", emoji: "🍺" },
  { id: "finedining", label: "파인다이닝", emoji: "✨" },
  { id: "gogi", label: "고깃집", emoji: "🥩" },
];

export default function StartupChecklistPage() {
  const [industry, setIndustry] = useState("cafe");
  const [phases, setPhases] = useState(() => buildState(PHASES_BASE, "cafe"));
  const [expandedPhase, setExpandedPhase] = useState<string | null>("planning");

  const changeIndustry = (ind: string) => {
    setIndustry(ind);
    setPhases(buildState(PHASES_BASE, ind));
  };

  const toggleItem = (phaseId: string, itemId: string) => {
    setPhases(prev => prev.map(p =>
      p.id === phaseId
        ? { ...p, items: p.items.map(i => i.id === itemId ? { ...i, done: !i.done } : i) }
        : p
    ));
  };

  const totalItems = phases.flatMap(p => p.items).length;
  const doneItems = phases.flatMap(p => p.items).filter(i => i.done).length;
  const requiredItems = phases.flatMap(p => p.items).filter(i => i.required);
  const doneRequired = requiredItems.filter(i => i.done).length;
  const progress = totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');
        body{font-family:'Pretendard',-apple-system,sans-serif}
      `}</style>
      <NavBar />
      <ToolNav />
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 md:pl-60">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3 mb-8 mt-4">
            <Link href="/tools" className="text-sm text-slate-400 hover:text-slate-700 transition">← 도구 목록</Link>
          </div>

          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-cyan-50 text-cyan-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <span>✅</span> 창업 체크리스트
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">창업 체크리스트</h1>
            <p className="text-slate-500 text-sm">업종별 인허가·준비사항을 단계별로 확인하세요.</p>
          </div>

          {/* 업종 선택 */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.id}
                onClick={() => changeIndustry(ind.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${
                  industry === ind.id ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
                }`}
              >
                <span>{ind.emoji}</span>{ind.label}
              </button>
            ))}
          </div>

          {/* 진행률 */}
          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">전체 진행률</h2>
              <span className="text-2xl font-extrabold text-slate-900">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 mb-4">
              <div
                className="h-3 rounded-full bg-slate-900 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{doneItems}</p>
                <p className="text-xs text-slate-400">완료 항목</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-cyan-600">{doneRequired}/{requiredItems.length}</p>
                <p className="text-xs text-slate-400">필수 항목</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-slate-400">{totalItems - doneItems}</p>
                <p className="text-xs text-slate-400">남은 항목</p>
              </div>
            </div>
          </div>

          {/* 단계별 체크리스트 */}
          <div className="space-y-3">
            {phases.map((phase) => {
              const phaseDone = phase.items.filter(i => i.done).length;
              const phaseTotal = phase.items.length;
              const isExpanded = expandedPhase === phase.id;

              return (
                <div key={phase.id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                  <button
                    className="w-full px-6 py-4 flex items-center gap-3 text-left"
                    onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  >
                    <span className="text-2xl">{phase.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{phase.title}</span>
                        <span className="text-xs text-slate-400">{phase.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 max-w-[120px]">
                          <div
                            className="h-1.5 rounded-full bg-slate-900 transition-all"
                            style={{ width: `${phaseTotal > 0 ? (phaseDone / phaseTotal) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-400">{phaseDone}/{phaseTotal}</span>
                      </div>
                    </div>
                    {phaseDone === phaseTotal && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">완료 ✓</span>
                    )}
                    <svg
                      width="16" height="16" viewBox="0 0 16 16" fill="none"
                      className={`text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    >
                      <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 divide-y divide-slate-50">
                      {phase.items.map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-4 px-6 py-4 cursor-pointer transition ${item.done ? "bg-slate-50" : "hover:bg-slate-50"}`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={() => toggleItem(phase.id, item.id)}
                              className="w-4 h-4 accent-slate-900"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-sm font-semibold ${item.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                                {item.label}
                              </span>
                              {item.required && (
                                <span className="text-xs font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md flex-shrink-0">필수</span>
                              )}
                            </div>
                            {item.desc && (
                              <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                            )}
                          </div>
                          {item.link && !item.done && (
                            <Link
                              href={item.link}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 text-xs font-semibold text-blue-500 hover:text-blue-600 transition"
                            >
                              바로가기 →
                            </Link>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-100 px-5 py-4 text-xs text-slate-500 leading-relaxed">
            💡 <strong className="text-slate-700">Tip.</strong> 체크 상태는 브라우저 새로고침 시 초기화됩니다. 진행 상황은 별도로 저장해두시길 권장합니다. 인허가 요건은 지자체별로 상이할 수 있으니 관할 구청에서 최종 확인하세요.
          </div>
        </div>
      </main>
    </>
  );
}

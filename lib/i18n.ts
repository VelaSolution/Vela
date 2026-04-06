/**
 * VELA i18n — 경량 다국어 지원
 */

export type Locale = "ko" | "en";

const translations: Record<Locale, Record<string, string>> = {
  ko: {
    "nav.service": "서비스",
    "nav.tools": "도구",
    "nav.community": "커뮤니티",
    "nav.guide": "가이드",
    "nav.pricing": "요금제",
    "nav.login": "로그인",
    "nav.signup": "무료 시작",
    "nav.logout": "로그아웃",
    "nav.dashboard": "대시보드",
    "nav.simulator": "시뮬레이터 →",

    "hero.tag": "외식업 경영 분석 플랫폼",
    "hero.title1": "원가 모르면",
    "hero.title2": "매달 수백만원 손실",
    "hero.desc": "매출·원가·인건비를 3분 만에 시뮬레이션하고\nAI가 찾아주는 절감 포인트로 순이익을 올리세요.",
    "hero.cta": "무료로 시작하기 →",
    "hero.cta2": "서비스 알아보기",
    "hero.sub": "카카오 로그인으로 3초 만에 시작 · 무료 플랜 제공",
    "hero.stat1": "사장님 사용 중",
    "hero.stat2": "업종 지원",
    "hero.stat3": "재무 지표",
    "hero.stat4": "실시간 전략",

    "hero.preview": "실시간 미리보기",
    "hero.drag": "드래그해서 조절",
    "hero.seats": "좌석 수",
    "hero.avgSpend": "객단가",
    "hero.turnover": "일 회전율",
    "hero.monthlySales": "월 예상 매출",
    "hero.profit": "예상 순이익",
    "hero.margin": "순이익률",
    "hero.analyze": "상세 분석하기 →",

    "features.tag": "도구",
    "features.title": "사업에 필요한 모든 도구",
    "features.desc": "외식업 사장님을 위한 실무 도구 모음. 계산부터 콘텐츠 생성까지 한 곳에서.",

    "steps.tag": "사용 방법",
    "steps.title": "3단계로 끝납니다",
    "steps.1.title": "3분 만에 입력",
    "steps.1.desc": "업종·좌석·객단가·비용 구조를 3단계로 간단하게 입력합니다. POS 파일이 있으면 바로 업로드해도 됩니다.",
    "steps.2.title": "AI가 즉시 분석",
    "steps.2.desc": "입력 즉시 20개 이상의 재무 지표가 계산되고 AI가 현재 상태를 진단합니다.",
    "steps.3.title": "바로 실행",
    "steps.3.desc": "AI 추천 전략을 확인하고 채팅으로 추가 질문하며 바로 실행 계획을 세웁니다.",

    "pricing.tag": "요금제",
    "pricing.title": "합리적인 가격으로",
    "pricing.desc": "매장 규모에 맞는 플랜을 선택하세요.",

    "reviews.tag": "후기",
    "reviews.title": "실제 사장님들의 이야기",

    "cta.title": "지금 바로 시작하세요",
    "cta.desc": "외식업 경영, 감이 아니라 숫자로 하세요.",
    "cta.btn": "무료로 시작하기",

    "footer.terms": "이용약관",
    "footer.privacy": "개인정보처리방침",
  },

  en: {
    "nav.service": "Service",
    "nav.tools": "Tools",
    "nav.community": "Community",
    "nav.guide": "Guide",
    "nav.pricing": "Pricing",
    "nav.login": "Log in",
    "nav.signup": "Start Free",
    "nav.logout": "Log out",
    "nav.dashboard": "Dashboard",
    "nav.simulator": "Simulator →",

    "hero.tag": "Food Service Business Analytics Platform",
    "hero.title1": "Not knowing your costs?",
    "hero.title2": "Losing millions monthly",
    "hero.desc": "Simulate revenue, costs & labor in 3 minutes.\nBoost net profit with AI-powered cost reduction insights.",
    "hero.cta": "Start for Free →",
    "hero.cta2": "Learn More",
    "hero.sub": "Start in 3 seconds with Kakao login · Free plan available",
    "hero.stat1": "Owners using",
    "hero.stat2": "Industries",
    "hero.stat3": "Financial metrics",
    "hero.stat4": "Real-time strategy",

    "hero.preview": "Live Preview",
    "hero.drag": "Drag to adjust",
    "hero.seats": "Seats",
    "hero.avgSpend": "Avg. Spend",
    "hero.turnover": "Turnover Rate",
    "hero.monthlySales": "Est. Monthly Revenue",
    "hero.profit": "Est. Net Profit",
    "hero.margin": "Net Margin",
    "hero.analyze": "Full Analysis →",

    "features.tag": "Tools",
    "features.title": "Everything You Need to Run Your Business",
    "features.desc": "Practical tools for restaurant owners. From cost calculation to AI content generation, all in one place.",

    "steps.tag": "How it Works",
    "steps.title": "Done in 3 Steps",
    "steps.1.title": "Input in 3 min",
    "steps.1.desc": "Enter your industry, seats, average spend, and cost structure in 3 simple steps. Got a POS file? Just upload it.",
    "steps.2.title": "AI Analyzes Instantly",
    "steps.2.desc": "20+ financial metrics are calculated instantly and AI diagnoses your current situation.",
    "steps.3.title": "Take Action",
    "steps.3.desc": "Review AI-recommended strategies, ask follow-up questions via chat, and build your action plan.",

    "pricing.tag": "Pricing",
    "pricing.title": "Affordable Plans",
    "pricing.desc": "Choose the plan that fits your store.",

    "reviews.tag": "Reviews",
    "reviews.title": "Stories from Real Owners",

    "cta.title": "Get Started Now",
    "cta.desc": "Run your restaurant with data, not gut feeling.",
    "cta.btn": "Start for Free",

    "footer.terms": "Terms of Service",
    "footer.privacy": "Privacy Policy",
  },
};

const LOCALE_KEY = "vela-locale";

export function getLocale(): Locale {
  if (typeof window === "undefined") return "ko";
  return (localStorage.getItem(LOCALE_KEY) as Locale) ?? "ko";
}

export function setLocale(locale: Locale) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCALE_KEY, locale);
    window.location.reload();
  }
}

export function t(key: string, locale?: Locale): string {
  const l = locale ?? getLocale();
  return translations[l]?.[key] ?? translations.ko[key] ?? key;
}

export function useTranslation() {
  const locale = typeof window !== "undefined" ? getLocale() : "ko";
  return (key: string) => t(key, locale);
}

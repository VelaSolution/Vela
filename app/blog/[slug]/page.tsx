"use client";

import { use } from "react";
import Link from "next/link";

type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  emoji: string;
  author?: string;
  content?: string;
};

const ARTICLES: Article[] = [
  {
    slug: "restaurant-cost-rate-30",
    title: "외식업 원가율 30% 맞추는 5가지 방법",
    excerpt:
      "원가율은 외식업 수익의 핵심 지표입니다. 식재료 단가 협상부터 레시피 표준화, 로스율 관리까지 — 현실적으로 원가율 30%를 달성하고 유지하는 구체적인 실행 전략을 알려드립니다. 실제 매장 사례와 함께 원가율 관리 체크리스트도 포함했습니다.",
    category: "원가관리",
    date: "2026-03-28",
    readTime: "7분",
    emoji: "💰",
    author: "VELA 편집팀",
    content: `원가율은 외식업 수익의 핵심 지표입니다. 많은 사장님들이 원가율 30%를 목표로 하지만, 실제로 달성하기는 쉽지 않습니다.

1. 식재료 단가 협상
공급업체와의 정기적인 단가 협상은 필수입니다. 3개월마다 시장 가격을 조사하고, 복수의 공급업체 견적을 비교하세요. 연간 계약 시 추가 할인을 받을 수 있습니다.

2. 레시피 표준화
모든 메뉴의 레시피를 그램 단위로 표준화하세요. 조리사마다 다른 양을 사용하면 원가율이 크게 변동합니다. 표준 레시피 카드를 주방에 비치하고, 신입 직원 교육에도 활용하세요.

3. 로스율 관리
식재료 폐기량을 매일 기록하세요. 주간 단위로 로스율을 분석하면 어떤 식재료에서 낭비가 발생하는지 파악할 수 있습니다. 선입선출(FIFO) 원칙을 철저히 지키세요.

4. 메뉴 엔지니어링
메뉴별 원가율과 판매량을 분석하여, 고수익 메뉴의 판매를 촉진하고 저수익 메뉴는 개선하거나 제거하세요. 메뉴판 배치와 추천 메뉴 설정도 중요한 전략입니다.

5. 계절별 식재료 활용
제철 식재료는 품질이 좋고 가격이 저렴합니다. 계절 메뉴를 개발하여 원가를 절감하면서도 고객에게 신선한 경험을 제공할 수 있습니다.`,
  },
  {
    slug: "naver-place-seo-2026",
    title: "네이버 플레이스 상위 노출 전략 2026",
    excerpt:
      "2026년 네이버 플레이스 알고리즘이 크게 변경되었습니다. 리뷰 수보다 리뷰 품질, 사진 등록 빈도, 예약 전환율이 더 중요해졌습니다. 최신 알고리즘에 맞춘 상위 노출 전략과 매장 프로필 최적화 방법을 단계별로 정리했습니다.",
    category: "마케팅",
    date: "2026-03-22",
    readTime: "8분",
    emoji: "🔍",
    author: "VELA 편집팀",
    content: `2026년 네이버 플레이스 알고리즘이 크게 변경되었습니다. 이제 단순히 리뷰 수를 늘리는 것만으로는 상위 노출이 어렵습니다.

핵심 변경사항
- 리뷰 품질 점수: 사진 포함 리뷰, 100자 이상 리뷰에 가중치가 부여됩니다.
- 사진 등록 빈도: 매장에서 직접 올리는 사진의 빈도와 품질이 중요해졌습니다.
- 예약 전환율: 네이버 예약을 통한 실제 방문 전환율이 랭킹에 반영됩니다.

매장 프로필 최적화 방법
1. 매장 정보를 100% 채우세요 (영업시간, 메뉴, 가격, 편의시설 등).
2. 주 2회 이상 새로운 사진을 등록하세요.
3. 고객 리뷰에 24시간 이내 답글을 달아주세요.
4. 네이버 예약 시스템을 연동하세요.
5. 소식 탭을 활용해 이벤트와 신메뉴를 알리세요.`,
  },
  {
    slug: "small-business-tax-top10",
    title: "소상공인 절세 전략 TOP 10",
    excerpt:
      "부가세, 종합소득세, 간이과세 전환 등 소상공인이 반드시 알아야 할 절세 전략 10가지를 정리했습니다. 세금 신고 시즌 전에 준비하면 수백만 원을 절약할 수 있습니다. 2026년 개정된 세법 변경사항도 반영했습니다.",
    category: "세무",
    date: "2026-03-15",
    readTime: "10분",
    emoji: "🧾",
    author: "VELA 편집팀",
    content: `소상공인이 반드시 알아야 할 절세 전략 10가지를 정리했습니다. 세금 신고 시즌 전에 준비하면 수백만 원을 절약할 수 있습니다.

1. 간이과세 전환 검토: 연 매출 1억 400만원 이하라면 간이과세로 전환하여 부가세 부담을 줄이세요.
2. 사업용 신용카드 등록: 국세청 홈택스에 사업용 신용카드를 등록하면 매입세액 공제가 자동 반영됩니다.
3. 감가상각비 활용: 장비, 인테리어 비용을 감가상각하여 매년 비용으로 인정받으세요.
4. 인건비 신고 최적화: 직원 4대보험 가입 시 두루누리 사회보험료 지원을 활용하세요.
5. 노란우산공제 가입: 소득공제 혜택과 함께 퇴직금 성격의 자금을 마련할 수 있습니다.
6. 성실신고확인제도 활용: 세무사 확인을 받으면 의료비, 교육비 세액공제를 추가로 받을 수 있습니다.
7. 부가세 예정고지 세액 확인: 예정고지 세액이 과다한 경우 예정신고로 전환하세요.
8. 업무용 차량 비용처리: 업무용 차량 운행일지를 작성하면 차량 관련 비용을 인정받을 수 있습니다.
9. 접대비 한도 관리: 접대비 한도를 초과하지 않도록 관리하세요.
10. 세금 신고 기한 준수: 기한 내 신고 시 무신고 가산세를 피할 수 있습니다.`,
  },
  {
    slug: "hiring-difficulty-solutions",
    title: "알바 구인난 해결하는 3가지 방법",
    excerpt:
      "외식업 인력난은 갈수록 심화되고 있습니다. 급여 인상만이 답이 아닙니다. 근무 환경 개선, 유연 근무제 도입, 그리고 채용 채널 다각화를 통해 실제로 구인난을 해결한 매장의 사례를 소개합니다.",
    category: "인사",
    date: "2026-03-10",
    readTime: "6분",
    emoji: "👥",
    author: "VELA 편집팀",
    content: `외식업 인력난은 갈수록 심화되고 있습니다. 급여 인상만이 답이 아닙니다.

1. 근무 환경 개선
직원 휴게 공간 마련, 식사 제공, 교통비 지원 등 복지를 개선하세요. 실제로 한 카페에서는 직원 식사 제공과 교통비 지원만으로 이직률을 40% 줄였습니다.

2. 유연 근무제 도입
주 5일 고정 근무 대신 주 3~4일 근무, 단축 근무 등 유연한 근무 형태를 제공하세요. 특히 대학생 아르바이트의 경우 시험 기간 근무 조정이 가능하면 장기 근속율이 높아집니다.

3. 채용 채널 다각화
알바몬, 알바천국 외에도 인스타그램, 당근마켓 등 다양한 채널을 활용하세요. 매장 앞 구인 포스터도 여전히 효과적입니다. 지역 커뮤니티와 대학교 게시판도 적극 활용해보세요.`,
  },
  {
    slug: "food-industry-ai-trend-2026",
    title: "2026 외식업 트렌드: AI와 자동화",
    excerpt:
      "AI 주문 시스템, 자동 재고 관리, 로봇 서빙까지 — 2026년 외식업에서 실제로 도입되고 있는 AI/자동화 기술을 분석합니다. 소규모 매장도 활용 가능한 현실적인 AI 도구와 비용 대비 효과를 비교 분석했습니다.",
    category: "트렌드",
    date: "2026-03-05",
    readTime: "9분",
    emoji: "🤖",
    author: "VELA 편집팀",
    content: `2026년 외식업에서 AI와 자동화 기술이 본격적으로 도입되고 있습니다.

AI 주문 시스템
키오스크를 넘어 AI 음성 주문 시스템이 등장했습니다. 고객이 자연어로 주문하면 AI가 이해하고 처리합니다. 도입 비용은 월 15~30만원 수준입니다.

자동 재고 관리
AI가 판매 데이터를 분석하여 식재료 발주량을 자동으로 추천합니다. 로스율을 평균 20% 줄일 수 있습니다.

로봇 서빙
서빙 로봇은 월 대여비 30~50만원으로 인건비 대비 효율적입니다. 특히 홀 면적이 넓은 매장에서 효과가 큽니다.

소규모 매장을 위한 현실적 AI 도구
- VELA 시뮬레이터: 무료로 매출/원가 시뮬레이션 가능
- ChatGPT 활용: 메뉴 설명, SNS 콘텐츠 작성에 활용
- 네이버 스마트스토어 AI: 자동 상품 설명 생성`,
  },
  {
    slug: "delivery-app-commission-tips",
    title: "배달앱 수수료 줄이는 실전 팁",
    excerpt:
      "배달의민족, 쿠팡이츠, 요기요 등 주요 배달앱 수수료 구조를 비교하고, 실질적으로 수수료를 줄이는 방법을 정리했습니다. 자체 배달 전환, 포장 할인, 배달 전용 메뉴 설계 등 매출은 유지하면서 수수료 부담을 낮추는 전략입니다.",
    category: "마케팅",
    date: "2026-02-28",
    readTime: "7분",
    emoji: "🛵",
    author: "VELA 편집팀",
    content: `배달앱 수수료는 매출의 상당 부분을 차지합니다. 주요 배달앱의 수수료 구조를 비교하고 줄이는 방법을 알아보겠습니다.

수수료 구조 비교
- 배달의민족: 중개수수료 6.8% + 배달비
- 쿠팡이츠: 중개수수료 9.8% (배달비 포함)
- 요기요: 중개수수료 12.5%

수수료 절감 전략
1. 자체 배달 전환: 배달 전문 인력을 고용하면 장기적으로 수수료보다 저렴할 수 있습니다.
2. 포장 할인: 포장 주문 시 10% 할인을 제공하면 배달 수수료 없이 매출을 유지할 수 있습니다.
3. 배달 전용 메뉴: 배달에 최적화된 메뉴를 개발하여 객단가를 높이면 수수료 비중이 줄어듭니다.
4. 복수 플랫폼 운영: 한 플랫폼에 의존하지 말고 여러 플랫폼을 병행하세요.`,
  },
  {
    slug: "cafe-startup-cost-guide",
    title: "카페 창업 비용 현실적 가이드",
    excerpt:
      "카페 창업을 꿈꾸시나요? 인테리어, 장비, 보증금부터 운영 자금까지 — 실제 카페 창업에 필요한 총 비용을 항목별로 상세히 분석합니다. 10평, 20평, 30평 규모별 예산과 1년차 손익분기 시나리오도 포함했습니다.",
    category: "원가관리",
    date: "2026-02-20",
    readTime: "12분",
    emoji: "☕",
    author: "VELA 편집팀",
    content: `카페 창업에 필요한 총 비용을 항목별로 상세히 분석합니다.

10평 소형 카페 (테이크아웃 위주)
- 보증금: 1,000~2,000만원
- 인테리어: 1,500~2,500만원
- 장비 (에스프레소 머신 등): 1,000~2,000만원
- 초기 재료비: 200~300만원
- 총 예상 비용: 4,000~7,000만원

20평 중형 카페
- 보증금: 2,000~4,000만원
- 인테리어: 3,000~5,000만원
- 장비: 1,500~3,000만원
- 초기 재료비: 300~500만원
- 총 예상 비용: 7,000~12,000만원

손익분기 시나리오
일 매출 50만원 기준, 원가율 30%, 인건비 25%, 임대료 15%일 때 약 8~12개월 내 손익분기 달성이 가능합니다. VELA 시뮬레이터에서 직접 계산해보세요.`,
  },
  {
    slug: "ingredient-cost-supplier-tips",
    title: "식재료 원가 절감 공급업체 활용법",
    excerpt:
      "도매시장, 산지 직거래, 공동구매 등 다양한 식재료 공급 채널의 장단점을 비교하고, 실질적으로 원가를 절감하는 공급업체 활용 전략을 공유합니다. 계절별 식재료 가격 변동 패턴과 비축 전략도 함께 다룹니다.",
    category: "원가관리",
    date: "2026-02-12",
    readTime: "8분",
    emoji: "🥬",
    author: "VELA 편집팀",
    content: `식재료 공급 채널별 장단점을 비교하고 원가를 절감하는 전략을 알아보겠습니다.

공급 채널 비교
- 도매시장: 가격이 저렴하지만 직접 방문해야 합니다. 새벽 시장이 가장 저렴합니다.
- 산지 직거래: 중간 유통 마진을 줄일 수 있지만 최소 주문량이 있습니다.
- 공동구매: 같은 지역 매장들과 공동 구매하면 대량 할인을 받을 수 있습니다.
- 온라인 식자재몰: 편리하지만 배송비가 추가됩니다. 정기 구독 시 할인이 가능합니다.

계절별 식재료 가격 변동
- 봄: 나물류 가격 하락, 딸기 가격 상승
- 여름: 과일류 가격 하락, 엽채류 가격 상승
- 가을: 고구마/감자 가격 하락, 버섯류 풍부
- 겨울: 배추/무 가격 상승, 수입 과일 가격 상승

비축 전략: 냉동 가능한 식재료는 저가 시기에 대량 구매하여 냉동 보관하세요.`,
  },
  {
    slug: "instagram-marketing-restaurant",
    title: "인스타그램으로 매장 홍보하는 법",
    excerpt:
      "릴스, 스토리, 피드 최적화부터 해시태그 전략까지 — 외식업 매장을 위한 인스타그램 마케팅 실전 가이드입니다. 팔로워 수보다 중요한 것은 지역 고객의 방문 전환입니다. 월 광고비 10만원으로 효과를 극대화하는 방법을 알려드립니다.",
    category: "마케팅",
    date: "2026-02-05",
    readTime: "8분",
    emoji: "📸",
    author: "VELA 편집팀",
    content: `외식업 매장을 위한 인스타그램 마케팅 실전 가이드입니다.

콘텐츠 전략
- 릴스: 조리 과정, 음식 완성 장면을 15~30초로 촬영하세요. 릴스는 팔로워 외 사용자에게도 노출됩니다.
- 스토리: 오늘의 메뉴, 매장 일상을 공유하세요. 투표, 질문 스티커로 고객과 소통하세요.
- 피드: 음식 사진은 자연광에서 촬영하고, 일관된 필터를 사용하세요.

해시태그 전략
지역명 + 업종 조합이 가장 효과적입니다. 예: #홍대맛집 #홍대카페 #합정맛집
인기 해시태그 10개 + 니치 해시태그 10개를 조합하세요.

월 10만원 광고 전략
- 가장 반응이 좋았던 게시물을 광고로 전환하세요.
- 타겟: 매장 반경 3km, 20~40대, 음식/카페 관심사
- 일 예산 3,000원으로 30일 운영하면 월 10만원 이내로 운영 가능합니다.`,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "원가관리": "bg-emerald-50 text-emerald-600",
  "마케팅": "bg-blue-50 text-blue-600",
  "세무": "bg-amber-50 text-amber-600",
  "인사": "bg-rose-50 text-rose-600",
  "트렌드": "bg-purple-50 text-purple-600",
};

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const article = ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 md:pl-60">
        <div className="mx-auto max-w-3xl">
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-4">404</p>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              글을 찾을 수 없습니다
            </h1>
            <p className="text-slate-500 text-sm mb-6">
              요청하신 블로그 글이 존재하지 않거나 삭제되었습니다.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
            >
              블로그 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 md:pl-60">
      <div className="mx-auto max-w-3xl">
        {/* Back button */}
        <div className="flex items-center gap-3 mb-8 mt-4">
          <Link
            href="/blog"
            className="text-sm text-slate-400 hover:text-slate-700 transition"
          >
            ← 블로그 목록
          </Link>
        </div>

        {/* Article header */}
        <article className="bg-white ring-1 ring-slate-200 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                CATEGORY_COLORS[article.category] ?? "bg-slate-100 text-slate-600"
              }`}
            >
              {article.category}
            </span>
            <span className="text-xs text-slate-400">{article.date}</span>
            <span className="text-xs text-slate-400">
              · {article.readTime} 읽기
            </span>
          </div>

          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl shrink-0">{article.emoji}</span>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {article.title}
              </h1>
              {article.author && (
                <p className="mt-2 text-sm text-slate-400">
                  {article.author}
                </p>
              )}
            </div>
          </div>

          {/* Excerpt highlight */}
          <div className="bg-slate-50 rounded-2xl px-5 py-4 mb-6">
            <p className="text-sm text-slate-600 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          {/* Full content */}
          {article.content && (
            <div className="prose prose-slate max-w-none">
              {article.content.split("\n").map((line, i) => {
                if (!line.trim()) return <br key={i} />;
                return (
                  <p
                    key={i}
                    className="text-sm text-slate-700 leading-relaxed mb-3"
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          )}
        </article>

        {/* Footer */}
        <div className="mt-8 rounded-2xl bg-slate-100 px-5 py-4 text-xs text-slate-500 leading-relaxed text-center">
          더 많은 외식업 경영 인사이트를 원하시나요?{" "}
          <Link
            href="/blog"
            className="text-purple-600 underline hover:text-purple-800"
          >
            블로그 목록
          </Link>
          으로 돌아가거나{" "}
          <Link
            href="/tools"
            className="text-purple-600 underline hover:text-purple-800"
          >
            AI 도구 모음
          </Link>
          을 활용해 보세요.
        </div>
      </div>
    </main>
  );
}

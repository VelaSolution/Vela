import Link from "next/link";
import { FadeIn } from "./LandingUtils";

const FEATURES = [
  { icon:"🧮", title:"메뉴별 원가 계산기",  desc:"식재료 원가 입력 → 원가율·건당 순익 자동 계산. 메뉴 가격 결정에 바로 활용하세요.",      tag:"원가 계산",  href:"/tools/menu-cost" },
  { icon:"👥", title:"인건비 스케줄러",      desc:"직원별 시급·근무시간 설정 → 주간·월간 인건비 예측. 알바 채용 계획에 필수.",              tag:"인건비 관리", href:"/tools/labor" },
  { icon:"🧾", title:"세금 계산기",          desc:"매출 기반 부가세·종합소득세 예상액 자동 산출. 세금 폭탄 없이 미리 준비하세요.",           tag:"세금 예측",  href:"/tools/tax" },
  { icon:"📄", title:"손익계산서 PDF",       desc:"시뮬레이션 데이터로 월별 P&L 리포트 PDF 출력. 투자자·세무사에게 바로 공유 가능.",        tag:"PDF 출력",   href:"/tools/pl-report" },
  { icon:"✅", title:"창업 체크리스트",      desc:"업종별 인허가·준비물·타임라인 단계별 가이드. 창업 전 놓치는 것 없이 준비하세요.",         tag:"창업 준비",  href:"/tools/startup-checklist" },
  { icon:"📱", title:"SNS 콘텐츠 생성기",   desc:"메뉴·이벤트 정보 입력 → 인스타 캡션 AI 자동 생성. 매일 고민하는 SNS 포스팅 해결.",     tag:"AI · SNS",   href:"/tools/sns-content" },
  { icon:"💬", title:"리뷰 답변 생성기",     desc:"고객 리뷰 붙여넣기 → AI가 맞춤 답변 초안 작성. 악성 리뷰도 프로답게 대응하세요.",        tag:"AI · 리뷰",  href:"/tools/review-reply" },
  { icon:"🗺️", title:"상권 분석 도우미",    desc:"입지 조건 입력 → AI 상권 적합도 평가 리포트. 창업 전 상권 리스크를 미리 파악하세요.",    tag:"AI · 상권",  href:"/tools/area-analysis" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="features-bg">
      <div className="section-inner">
        <FadeIn>
          <span className="section-tag">도구</span>
          <h2 className="section-title">사업에 필요한 <span className="gradient-text">모든 도구</span></h2>
          <p className="section-desc">외식업 사장님을 위한 실무 도구 모음. 계산부터 콘텐츠 생성까지 한 곳에서.</p>
        </FadeIn>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 60}>
              <Link href={f.href} style={{ textDecoration: "none" }}>
                <div className="feature-card">
                  <div className="feature-icon">{f.icon}</div>
                  <div className="feature-title">{f.title}</div>
                  <div className="feature-desc">{f.desc}</div>
                  <span className="feature-tag">{f.tag}</span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

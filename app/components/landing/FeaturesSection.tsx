import Link from "next/link";
import { FadeIn } from "./LandingUtils";

const FEATURES = [
  { icon:"🧮", title:"메뉴 원가 계산",    desc:"메뉴 수익성을 해도처럼 펼쳐보세요. 재료비 넣으면 어디서 마진이 새는지 한눈에 보입니다.",  tag:"원가",    href:"/tools/menu-cost" },
  { icon:"👥", title:"인건비 계산",       desc:"든든한 선원 관리의 시작. 시급·근무시간 넣으면 주휴수당·4대보험 포함 실제 비용을 보여줍니다.",  tag:"인건비",  href:"/tools/labor" },
  { icon:"💬", title:"리뷰 답변 생성",    desc:"배민·쿠팡이츠 리뷰 붙여넣으면 AI가 답변을 써줍니다. 악성 리뷰도 프로답게.",                  tag:"리뷰",    href:"/tools/review-reply" },
  { icon:"🧾", title:"세금 미리보기",     desc:"매출 넣으면 부가세·종합소득세 얼마 나올지 미리 봅니다. 세금 폭탄 방지.",                      tag:"세금",    href:"/tools/tax" },
  { icon:"📒", title:"매장 가계부",       desc:"항해일지처럼 매일 기록하면 돈 새는 곳이 바로 보입니다. 이번 달 순이익 한눈에.",               tag:"가계부",  href:"/tools/cashbook" },
  { icon:"📱", title:"SNS 홍보글 생성",   desc:"메뉴 이름만 넣으면 인스타 캡션을 AI가 만들어줍니다. 매일 고민하는 포스팅 해결.",             tag:"홍보",    href:"/tools/sns-content" },
];

export function FeaturesSection() {
  return (
    <section id="features" className="features-bg">
      <div className="section-inner">
        <FadeIn>
          <span className="section-tag">항해 장비</span>
          <h2 className="section-title">선장님의 <span className="gradient-text">항해 장비</span></h2>
          <p className="section-desc">내 가게의 현재 위치를 파악하고, 방향을 잡아주는 도구들입니다.</p>
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
        <FadeIn>
          <div style={{ textAlign: "center", marginTop: 32 }}>
            <Link href="/tools" style={{ fontSize: 14, fontWeight: 600, color: "#3182F6", textDecoration: "none" }}>
              도구 전체 보기 →
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

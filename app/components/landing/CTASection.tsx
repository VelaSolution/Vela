import Link from "next/link";
import { FadeIn } from "./LandingUtils";

export function CTASection() {
  return (
    <section className="cta-bg">
      <div className="section-inner">
        <FadeIn>
          <h2 className="cta-title">지금 바로 내 매장을 분석해보세요</h2>
          <p className="cta-desc">회원가입 후 무료로 시작할 수 있습니다. 신용카드 불필요.</p>
          <Link href="/signup" className="btn-white">무료로 시작하기 →</Link>
        </FadeIn>
      </div>
    </section>
  );
}

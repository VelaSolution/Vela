import { FadeIn } from "./LandingUtils";

const TESTIMONIALS = [
  { text: "손익분기점을 처음으로 제대로 이해했어요. 숫자를 보니 어디서 돈이 새는지 바로 보이더라고요.", name: "김○○", role: "카페 운영 3년차", av: "김", delay: 0 },
  { text: "AI가 배달 채널 추가를 추천해줬는데, 실행 후 월 매출이 20% 올랐습니다. 믿기 어렵지만 사실이에요.", name: "박○○", role: "분식점 사장님", av: "박", delay: 80 },
  { text: "창업 전에 미리 수치를 검토할 수 있어서 보증금 협상도 자신 있게 했습니다.", name: "이○○", role: "파인다이닝 예비 창업자", av: "이", delay: 160 },
];

export function TestimonialsSection() {
  return (
    <section className="testi-bg">
      <div className="section-inner">
        <FadeIn><span className="section-tag" style={{ background: "rgba(255,255,255,.1)", color: "#93C5FD" }}>후기</span><h2 className="section-title">실제 사장님들의 이야기</h2></FadeIn>
        <div className="testi-grid">
          {TESTIMONIALS.map((t) => (
            <FadeIn key={t.name} delay={t.delay}>
              <div className="testi-card">
                <div className="testi-stars">★★★★★</div>
                <div className="testi-text">&ldquo;{t.text}&rdquo;</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.av}</div>
                  <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

import { FadeIn } from "./LandingUtils";

const STEPS = [
  { num: "1", title: "정보 입력", desc: "업종·좌석·객단가·비용 구조를 3단계로 간단하게 입력합니다. POS 파일이 있으면 바로 업로드해도 됩니다.", delay: 0 },
  { num: "2", title: "AI 분석", desc: "입력 즉시 20개 이상의 재무 지표가 계산되고 AI가 현재 상태를 진단합니다.", delay: 100 },
  { num: "3", title: "전략 실행", desc: "AI 추천 전략을 확인하고 채팅으로 추가 질문하며 바로 실행 계획을 세웁니다.", delay: 200 },
];

export function HowItWorksSection() {
  return (
    <section>
      <div className="section-inner">
        <FadeIn><div style={{ textAlign: "center" }}><span className="section-tag">사용 방법</span><h2 className="section-title" style={{ textAlign: "center" }}>3단계로 끝납니다</h2></div></FadeIn>
        <div className="steps-grid">
          {STEPS.map((s) => (
            <FadeIn key={s.num} delay={s.delay}>
              <div className="step-num">{s.num}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

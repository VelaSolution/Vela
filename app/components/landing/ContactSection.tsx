"use client";

import { useRef } from "react";
import Link from "next/link";
import { FadeIn } from "./LandingUtils";

const CONTACT_INFO = [
  { label: "이메일", value: "mnhyuk@velaanalytics.com" },
  { label: "운영 시간", value: "평일 10:00 — 18:00" },
  { label: "응답 시간", value: "영업일 기준 1일 이내" },
];

export function ContactSection() {
  const formMsgRef = useRef<HTMLParagraphElement>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const btn = submitBtnRef.current;
    const msg = formMsgRef.current;
    if (!btn || !msg) return;

    const name = nameRef.current?.value ?? "";
    const email = emailRef.current?.value ?? "";
    const message = messageRef.current?.value ?? "";

    btn.textContent = "전송 중...";
    btn.disabled = true;
    msg.style.display = "none";

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        btn.textContent = "전송 완료 ✓";
        msg.style.display = "block";
        msg.style.color = "#059669";
        msg.textContent = "문의가 접수되었습니다. 빠르게 연락드리겠습니다.";
        (e.target as HTMLFormElement).reset();
      } else {
        btn.textContent = "재시도";
        msg.style.display = "block";
        msg.style.color = "#ef4444";
        msg.textContent = "전송에 실패했습니다. 잠시 후 다시 시도해 주세요.";
        btn.disabled = false;
      }
    } catch {
      btn.textContent = "재시도";
      msg.style.display = "block";
      msg.style.color = "#ef4444";
      msg.textContent = "네트워크 오류가 발생했습니다.";
      btn.disabled = false;
    }

    setTimeout(() => {
      if (btn && btn.textContent === "전송 완료 ✓") {
        btn.textContent = "문의 보내기";
        btn.disabled = false;
      }
    }, 4000);
  }

  return (
    <section id="contact">
      <div className="section-inner">
        <FadeIn><span className="section-tag">문의</span><h2 className="section-title">궁금한 게 있으신가요?</h2><p className="section-desc">서비스 도입, 기능 제안, 파트너십 등 편하게 남겨주세요.</p></FadeIn>
        <div className="contact-layout">
          <FadeIn>
            <div className="contact-info">
              {CONTACT_INFO.map((c) => (
                <div key={c.label}><div className="contact-label">{c.label}</div><div className="contact-value">{c.value}</div></div>
              ))}
              <div style={{ paddingTop: 16, borderTop: "1px solid var(--gray-200)" }}>
                <div className="contact-label" style={{ marginBottom: 12 }}>바로 시작하고 싶다면</div>
                <Link href="/simulator" className="btn-primary" style={{ display: "inline-flex" }}>시뮬레이터 →</Link>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={100}>
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div><label className="field-label">이름</label><input ref={nameRef} className="field-input" type="text" placeholder="홍길동" required /></div>
                <div><label className="field-label">연락처</label><input className="field-input" type="text" placeholder="010-0000-0000" /></div>
              </div>
              <div><label className="field-label">이메일</label><input ref={emailRef} className="field-input" type="email" placeholder="your@email.com" required /></div>
              <div><label className="field-label">문의 내용</label><textarea ref={messageRef} className="field-input" placeholder="궁금한 점을 자유롭게 적어주세요." required /></div>
              <button ref={submitBtnRef} type="submit" className="form-submit">문의 보내기</button>
              <p ref={formMsgRef} className="form-msg" />
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

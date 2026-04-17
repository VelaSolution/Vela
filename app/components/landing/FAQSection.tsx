"use client";

import { useState } from "react";
import { FadeIn } from "./LandingUtils";

const FAQS = [
  { q: "VELA는 어떤 서비스인가요?", a: "외식업 사장님을 위한 AI 기반 경영 분석 도구입니다. 수익 시뮬레이션, AI 브리핑, 메뉴 원가 분석 등 매장 운영에 필요한 핵심 기능을 제공합니다." },
  { q: "무료 플랜에서 유료로 전환하면 데이터가 유지되나요?", a: "네, 기존에 저장한 시뮬레이션 데이터는 모두 유지됩니다." },
  { q: "언제든지 구독을 취소할 수 있나요?", a: "네, 언제든 취소 가능합니다. 취소 후에도 결제 기간까지 유료 기능을 사용할 수 있습니다." },
  { q: "결제는 어떤 방법으로 가능한가요?", a: "신용카드, 체크카드 등 토스페이먼츠를 통한 다양한 결제 방법을 지원합니다." },
  { q: "POS 파일은 어떤 형식을 지원하나요?", a: "xlsx, xls, csv 파일을 지원합니다. POS에서 내보낸 매출 파일을 업로드하면 AI가 자동으로 분석합니다." },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full text-left rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden transition-all"
    >
      <div className="flex items-center justify-between px-6 py-5">
        <p className="text-[15px] font-semibold text-slate-900 pr-4">Q. {q}</p>
        <span className={`text-slate-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}>▾</span>
      </div>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
        </div>
      )}
    </button>
  );
}

export function FAQSection() {
  return (
    <section id="faq" className="features-bg">
      <div className="section-inner" style={{ maxWidth: 640 }}>
        <FadeIn>
          <span className="section-tag">FAQ</span>
          <h2 className="section-title">자주 묻는 질문</h2>
        </FadeIn>
        <div className="flex flex-col gap-3 mt-10">
          {FAQS.map((faq) => (
            <FadeIn key={faq.q}>
              <FAQItem q={faq.q} a={faq.a} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

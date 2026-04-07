"use client";

import { useState, useEffect } from "react";

const ONBOARDING_KEY = "vela-onboarding-done";

const STEPS = [
  {
    emoji: "👋",
    title: "VELA에 오신 걸 환영합니다!",
    desc: "외식업 사장님을 위한 올인원 경영 도구입니다.\n매출 분석부터 AI 콘텐츠까지, 사업의 모든 것을 도와드려요.",
  },
  {
    emoji: "📊",
    title: "시뮬레이터로 시작하세요",
    desc: "매출·원가·인건비를 입력하면 수익 구조를 자동 분석합니다.\n손익분기점, 순이익률까지 한눈에 확인하세요.",
  },
  {
    emoji: "🛠️",
    title: "도구를 활용하세요",
    desc: "메뉴 원가 계산, 인건비 관리, 세금 계산 등 30가지 이상의 경영 도구를 제공합니다.\n필요한 도구를 골라 바로 사용해보세요.",
  },
  {
    emoji: "🤖",
    title: "AI가 도와드려요",
    desc: "SNS 콘텐츠, 리뷰 답변, 상권 분석까지 AI가 자동 생성합니다.\n매달 시즌에 맞는 경영 팁도 받아보세요.",
  },
  {
    emoji: "🎮",
    title: "게임으로 연습하세요",
    desc: "경영 시뮬레이션 게임으로 실전 감각을 키워보세요.\n리스크 없이 다양한 경영 전략을 실험할 수 있습니다.",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShow(true);
  }, []);

  const close = () => {
    setShow(false);
    localStorage.setItem(ONBOARDING_KEY, "1");
  };

  if (!show) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
        <button onClick={close} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl">&times;</button>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === step ? "w-8 bg-blue-500" : "w-2 bg-slate-200"}`} />
          ))}
        </div>

        <div className="text-6xl mb-5">{current.emoji}</div>
        <p className="text-xs text-blue-500 font-semibold mb-2">STEP {step + 1} / {STEPS.length}</p>
        <h2 className="text-xl font-extrabold text-slate-900 mb-3">{current.title}</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-8 whitespace-pre-line">{current.desc}</p>

        <div className="flex gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
              ← 이전
            </button>
          )}
          {!isLast ? (
            <>
              {step === 0 && (
                <button onClick={close} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition">
                  건너뛰기
                </button>
              )}
              <button onClick={() => setStep(step + 1)} className="flex-1 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition">
                다음 →
              </button>
            </>
          ) : (
            <button onClick={close} className="flex-1 rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
              시작하기 🚀
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ComingSoon({ title, desc }: { title: string; desc: string }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-md text-center py-16">
        <p className="text-5xl mb-6">🚀</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">{title}</h1>
        <p className="text-sm text-slate-500 mb-8">{desc}</p>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 mb-6">
          <p className="text-sm font-semibold text-slate-700 mb-3">출시되면 알려드릴까요?</p>
          {submitted ? (
            <p className="text-sm text-emerald-600 font-semibold">알림 신청 완료!</p>
          ) : (
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => { if (email.trim()) setSubmitted(true); }}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                알림 받기
              </button>
            </div>
          )}
        </div>

        <Link href="/tools" className="text-sm text-slate-400 hover:text-slate-600 transition">
          ← 도구 목록으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

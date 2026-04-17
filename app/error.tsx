"use client";

import Link from "next/link";
import { useEffect } from "react";
import { captureError } from "@/lib/sentry";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { captureError(error); }, [error]);

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl">😵</span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">문제가 발생했어요</h2>
        <p className="text-sm text-slate-500 mb-2 leading-relaxed">
          페이지를 불러오는 중 오류가 발생했습니다.
        </p>
        {error.digest && (
          <p className="text-xs text-slate-400 mb-6 font-mono bg-slate-100 rounded-lg px-3 py-1.5 inline-block">
            오류 코드: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-4">
          <button onClick={reset}
            className="rounded-xl bg-slate-900 text-white font-semibold px-6 py-3 text-sm hover:bg-slate-800 active:scale-[0.98] transition">
            다시 시도
          </button>
          <Link href="/"
            className="rounded-xl bg-white ring-1 ring-slate-200 text-slate-700 font-semibold px-6 py-3 text-sm hover:bg-slate-50 active:scale-[0.98] transition">
            홈으로 돌아가기
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-6">
          문제가 계속되면 <a href="mailto:mnhyuk@velaanalytics.com" className="text-[#3182F6] underline underline-offset-2">mnhyuk@velaanalytics.com</a>으로 문의해주세요.
        </p>
      </div>
    </main>
  );
}

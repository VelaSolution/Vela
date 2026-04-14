"use client";
import Link from "next/link";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="text-5xl mb-4">😵</div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-2">문제가 발생했어요</h2>
        <p className="text-sm text-slate-500 mb-6">잠시 후 다시 시도해주세요.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="rounded-xl bg-slate-900 text-white font-semibold px-5 py-2.5 text-sm hover:bg-slate-800 transition">다시 시도</button>
          <Link href="/hq" className="rounded-xl bg-white ring-1 ring-slate-200 text-slate-700 font-semibold px-5 py-2.5 text-sm hover:bg-slate-50 transition">돌아가기</Link>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">페이지를 찾을 수 없어요</h2>
        <p className="text-sm text-slate-500 mb-6">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="rounded-xl bg-slate-900 text-white font-semibold px-5 py-2.5 text-sm hover:bg-slate-800 transition">
            홈으로
          </Link>
          <Link href="/tools" className="rounded-xl bg-white ring-1 ring-slate-200 text-slate-700 font-semibold px-5 py-2.5 text-sm hover:bg-slate-50 transition">
            도구 목록
          </Link>
        </div>
      </div>
    </main>
  );
}

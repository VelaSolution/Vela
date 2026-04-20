import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 flex items-center justify-center">
      <style>{`
        @keyframes boat-bob {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-8px) rotate(2deg); }
          50% { transform: translateY(-4px) rotate(-1deg); }
          75% { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes wave-drift {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(12px); }
        }
        @keyframes lighthouse-glow {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes wave-move {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-8px) scaleY(0.9); }
        }
        .boat-anim { animation: boat-bob 4s ease-in-out infinite; }
        .wave-1 { animation: wave-move 3s ease-in-out infinite; }
        .wave-2 { animation: wave-move 3.5s ease-in-out 0.5s infinite; }
        .wave-3 { animation: wave-move 4s ease-in-out 1s infinite; }
        .lighthouse-light { animation: lighthouse-glow 2s ease-in-out infinite; }
        .cloud-drift { animation: wave-drift 8s ease-in-out infinite; }
      `}</style>

      <div className="mx-auto max-w-lg text-center">
        {/* Animated sea illustration */}
        <div className="relative w-64 h-52 mx-auto mb-8">
          {/* Clouds */}
          <div className="cloud-drift absolute top-4 left-6 w-12 h-4 bg-slate-200 rounded-full opacity-60" />
          <div className="cloud-drift absolute top-8 right-8 w-8 h-3 bg-slate-200 rounded-full opacity-40" />

          {/* Lighthouse */}
          <div className="absolute top-6 right-10">
            <div className="w-4 h-16 bg-gradient-to-b from-red-300 to-red-400 rounded-t-full mx-auto" />
            <div className="lighthouse-light w-6 h-6 bg-yellow-300 rounded-full absolute -top-2 left-1/2 -translate-x-1/2 blur-sm" />
            <div className="w-6 h-2 bg-slate-400 rounded-sm" />
          </div>

          {/* Boat */}
          <div className="boat-anim absolute inset-0 flex items-center justify-center" style={{ top: "20px" }}>
            <div className="relative">
              {/* Sail */}
              <div className="w-0 h-0 border-l-[2px] border-l-transparent border-r-[18px] border-r-blue-300 border-b-[32px] border-b-transparent absolute -top-8 left-4" />
              {/* Mast */}
              <div className="w-[2px] h-10 bg-slate-500 absolute -top-9 left-4" />
              {/* Hull */}
              <div className="w-20 h-6 bg-gradient-to-b from-amber-600 to-amber-700 rounded-b-xl" style={{ clipPath: "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)" }} />
            </div>
          </div>

          {/* Waves */}
          <div className="absolute bottom-6 left-0 right-0">
            <div className="wave-1 h-3 bg-blue-200 rounded-full opacity-50 mx-4 mb-1" />
            <div className="wave-2 h-2 bg-blue-300 rounded-full opacity-40 mx-8 mb-1" />
            <div className="wave-3 h-2 bg-blue-200 rounded-full opacity-30 mx-2" />
          </div>

          {/* 404 text floating behind */}
          <div className="absolute inset-0 flex items-center justify-center -z-10">
            <span className="text-9xl font-black text-slate-100 select-none">404</span>
          </div>
        </div>

        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">항로를 벗어났습니다</h2>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          이 바다에는 아무것도 없네요.<br />
          아래에서 검색하거나 항구로 돌아가 보세요.
        </p>

        {/* Search bar */}
        <form action="/search" method="GET" className="mb-8">
          <div className="relative max-w-sm mx-auto">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              name="q"
              placeholder="찾고 있는 페이지를 검색해보세요"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white ring-1 ring-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
            />
          </div>
        </form>

        {/* Popular pages */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">인기 페이지</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/simulator" className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold px-4 py-2 text-sm hover:bg-blue-100 active:scale-[0.97] transition">
              <span>🔮</span> 시뮬레이터
            </Link>
            <Link href="/tools" className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 text-purple-700 font-semibold px-4 py-2 text-sm hover:bg-purple-100 active:scale-[0.97] transition">
              <span>🛠️</span> 도구 모음
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 text-sm hover:bg-emerald-100 active:scale-[0.97] transition">
              <span>💰</span> 가격
            </Link>
          </div>
        </div>

        {/* Home button */}
        <Link href="/" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white font-semibold px-6 py-3 text-sm hover:bg-slate-800 active:scale-[0.98] transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
          </svg>
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}

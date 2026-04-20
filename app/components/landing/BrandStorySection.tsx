"use client";

export function BrandStorySection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* 배경 웨이브 */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.03]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" className="text-[#3182F6]" d="M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,181.3C960,203,1056,213,1152,197.3C1248,181,1344,139,1392,117.3L1440,96L1440,320L0,320Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.02]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" className="text-[#3182F6]" d="M0,256L48,240C96,224,192,192,288,197.3C384,203,480,245,576,250.7C672,256,768,224,864,208C960,192,1056,192,1152,208C1248,224,1344,256,1392,272L1440,288L1440,320L0,320Z" />
        </svg>
      </div>

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        {/* 로고 */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-8">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">V<span className="text-[#3182F6]">.</span></span>
        </div>

        {/* VELA 의미 */}
        <p className="text-sm font-semibold text-[#3182F6] tracking-wide uppercase mb-4">
          VELA — 라틴어로 &ldquo;돛&rdquo;
        </p>

        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-6">
          모든 사장님은<br />
          자기 가게의 <span className="text-[#3182F6]">선장</span>입니다
        </h2>

        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-xl mx-auto">
          바다 위에서 돛이 바람을 잡아 방향을 만들어주듯,
          VELA는 데이터라는 바람을 읽어
          사장님의 경영에 방향을 잡아드립니다.
        </p>

        {/* 3개 키워드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="text-3xl mb-3">🧭</div>
            <p className="font-bold text-slate-900 dark:text-white mb-1">데이터 = 바람</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">읽을 줄 알면<br />원하는 곳에 갈 수 있습니다</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="text-3xl mb-3">⛵</div>
            <p className="font-bold text-slate-900 dark:text-white mb-1">VELA = 돛</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">바람을 잡아<br />방향을 만들어드립니다</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="text-3xl mb-3">🗺️</div>
            <p className="font-bold text-slate-900 dark:text-white mb-1">도구 = 항해 장비</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">시뮬레이터, 원가 계산기<br />사장님의 나침반입니다</p>
          </div>
        </div>

        {/* 한 줄 약속 */}
        <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-full px-6 py-3">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            좌석 수랑 객단가만 넣으면 끝 — 30초면 충분합니다
          </span>
        </div>
      </div>
    </section>
  );
}

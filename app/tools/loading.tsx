export default function ToolsLoading() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-3xl">
        {/* 스켈레톤 — 도구 페이지 로딩 */}
        <div className="h-4 w-16 bg-slate-200 rounded mb-6 animate-pulse" />
        <div className="h-7 w-48 bg-slate-200 rounded-lg mb-2 animate-pulse" />
        <div className="h-4 w-72 bg-slate-100 rounded mb-6 animate-pulse" />
        <div className="bg-white ring-1 ring-slate-200 rounded-3xl p-6 space-y-4">
          <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 w-full bg-slate-100 rounded-xl animate-pulse" />
          <div className="h-10 w-3/4 bg-slate-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </main>
  );
}

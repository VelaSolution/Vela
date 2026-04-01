// app/loading.tsx - 모든 페이지 전환 시 표시되는 글로벌 로딩
import NavBar from "@/components/NavBar";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-2xl w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-200 rounded-2xl" />)}
        </div>
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 h-64 bg-slate-200 rounded-3xl" />
          <div className="h-64 bg-slate-200 rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

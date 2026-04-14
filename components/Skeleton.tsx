export function SkeletonCard() {
  return (
    <div className="bg-white ring-1 ring-slate-200 rounded-3xl p-6 space-y-4 animate-pulse">
      <div className="h-4 w-32 bg-slate-200 rounded" />
      <div className="h-10 w-full bg-slate-100 rounded-xl" />
      <div className="h-10 w-full bg-slate-100 rounded-xl" />
      <div className="h-10 w-3/4 bg-slate-100 rounded-xl" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-4 w-16 bg-slate-200 rounded mb-6" />
        <div className="h-7 w-48 bg-slate-200 rounded-lg mb-2" />
        <div className="h-4 w-72 bg-slate-100 rounded mb-6" />
        <SkeletonCard />
      </div>
    </main>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white ring-1 ring-slate-200 rounded-3xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-48 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

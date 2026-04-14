"use client";

interface PageLoadingProps {
  message?: string;
}

export default function PageLoading({ message }: PageLoadingProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      {message && (
        <p className="mt-4 text-sm text-slate-500">{message}</p>
      )}
    </div>
  );
}

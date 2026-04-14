"use client";

interface PageErrorProps {
  message?: string;
  onRetry?: () => void;
}

export default function PageError({
  message = "문제가 발생했습니다. 다시 시도해주세요.",
  onRetry,
}: PageErrorProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-red-50 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
          <svg
            className="w-6 h-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-2xl hover:bg-slate-800 transition-colors"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}

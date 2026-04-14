"use client";

export default function CostRatioBar({ ratio }: { ratio: number }) {
  const good = ratio <= 30;
  const ok = ratio <= 40;
  const color = good ? "#059669" : ok ? "#D97706" : "#EF4444";
  return (
    <div className="w-full rounded-full bg-slate-100 h-1.5 mt-1">
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(ratio, 100)}%`, background: color }}
      />
    </div>
  );
}

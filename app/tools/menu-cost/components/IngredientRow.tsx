"use client";

import type { Ingredient } from "./types";

export default function IngredientRow({
  ing,
  onChange,
  onDelete,
}: {
  ing: Ingredient;
  onChange: (id: string, field: "name" | "cost", value: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 items-center group">
      <input
        type="text"
        placeholder="재료명"
        value={ing.name}
        onChange={(e) => onChange(ing.id, "name", e.target.value)}
        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white transition"
      />
      <div className="relative w-32">
        <input
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={ing.cost}
          onChange={(e) => onChange(ing.id, "cost", e.target.value.replace(/[^0-9]/g, ""))}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-right pr-7 outline-none focus:border-blue-400 focus:bg-white transition"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">원</span>
      </div>
      <button
        onClick={() => onDelete(ing.id)}
        className="opacity-0 group-hover:opacity-100 transition rounded-lg p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-400"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

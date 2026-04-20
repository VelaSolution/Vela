"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ToolNav from "@/components/ToolNav";
import CloudSyncBadge from "@/components/CloudSyncBadge";
import { useCloudSync } from "@/lib/useCloudSync";
import { exportCSV } from "@/lib/exportCSV";

// ── Types ──
type EntryType = "income" | "expense";
type Category = { id: string; label: string; icon: string; type: EntryType };

const CATEGORIES: Category[] = [
  // 수입
  { id: "card", label: "카드매출", icon: "💳", type: "income" },
  { id: "cash", label: "현금매출", icon: "💵", type: "income" },
  { id: "delivery", label: "배달매출", icon: "🛵", type: "income" },
  { id: "other_income", label: "기타 수입", icon: "📈", type: "income" },
  // 지출
  { id: "ingredients", label: "재료비", icon: "🥬", type: "expense" },
  { id: "labor", label: "인건비", icon: "👥", type: "expense" },
  { id: "rent", label: "월세", icon: "🏠", type: "expense" },
  { id: "utilities", label: "공과금", icon: "💡", type: "expense" },
  { id: "delivery_fee", label: "배달수수료", icon: "📦", type: "expense" },
  { id: "card_fee", label: "카드수수료", icon: "🏦", type: "expense" },
  { id: "supplies", label: "소모품", icon: "🧹", type: "expense" },
  { id: "marketing", label: "홍보/마케팅", icon: "📢", type: "expense" },
  { id: "insurance", label: "보험/4대보험", icon: "🛡️", type: "expense" },
  { id: "tax", label: "세금", icon: "🧾", type: "expense" },
  { id: "maintenance", label: "수리/유지보수", icon: "🔧", type: "expense" },
  { id: "other_expense", label: "기타 지출", icon: "📉", type: "expense" },
];

const INCOME_CATS = CATEGORIES.filter(c => c.type === "income");
const EXPENSE_CATS = CATEGORIES.filter(c => c.type === "expense");

type Entry = {
  id: string;
  date: string;
  type: EntryType;
  category: string;
  amount: number;
  memo: string;
};

type MonthView = "list" | "summary" | "chart";

const fmt = (n: number) => n.toLocaleString("ko-KR");
const uid = () => Math.random().toString(36).slice(2, 9);

export default function CashbookPage() {
  const { data: entries, update: setEntries, status, error: syncError, userId, retry } = useCloudSync<Entry[]>("vela-cashbook", []);

  // 입력 폼
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<EntryType>("income");
  const [category, setCategory] = useState("card");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [msg, setMsg] = useState("");

  // 뷰
  const [view, setView] = useState<MonthView>("list");
  const [viewMonth, setViewMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editId, setEditId] = useState<string | null>(null);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  // 입력
  const handleAdd = () => {
    const num = Number(amount.replace(/,/g, ""));
    if (!num || num <= 0) { flash("금액을 입력해주세요"); return; }
    if (editId) {
      setEntries(entries.map(e => e.id === editId ? { ...e, date, type, category, amount: num, memo } : e));
      setEditId(null);
      flash("수정 완료");
    } else {
      setEntries([...entries, { id: uid(), date, type, category, amount: num, memo }].sort((a, b) => b.date.localeCompare(a.date)));
      flash("저장 완료");
    }
    setAmount(""); setMemo("");
  };

  const handleEdit = (e: Entry) => {
    setEditId(e.id); setDate(e.date); setType(e.type); setCategory(e.category);
    setAmount(String(e.amount)); setMemo(e.memo);
  };

  const handleDelete = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    setEntries(entries.filter(e => e.id !== id));
    flash("삭제 완료");
  };

  // 월간 데이터
  const monthEntries = useMemo(() =>
    entries.filter(e => e.date.startsWith(viewMonth)).sort((a, b) => b.date.localeCompare(a.date)),
    [entries, viewMonth]
  );

  const totalIncome = monthEntries.filter(e => e.type === "income").reduce((s, e) => s + e.amount, 0);
  const totalExpense = monthEntries.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // 카테고리별 합계
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    monthEntries.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return map;
  }, [monthEntries]);

  // 일별 합계
  const dailyTotals = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    monthEntries.forEach(e => {
      if (!map[e.date]) map[e.date] = { income: 0, expense: 0 };
      if (e.type === "income") map[e.date].income += e.amount;
      else map[e.date].expense += e.amount;
    });
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a));
  }, [monthEntries]);

  // 월 이동
  const prevMonth = () => { const d = new Date(viewMonth + "-01"); d.setMonth(d.getMonth() - 1); setViewMonth(d.toISOString().slice(0, 7)); };
  const nextMonth = () => { const d = new Date(viewMonth + "-01"); d.setMonth(d.getMonth() + 1); setViewMonth(d.toISOString().slice(0, 7)); };
  const monthLabel = (() => { const [y, m] = viewMonth.split("-"); return `${y}년 ${Number(m)}월`; })();

  // CSV 내보내기
  const handleExport = () => {
    const headers = ["날짜", "구분", "카테고리", "금액", "메모"];
    const rows = monthEntries.map(e => {
      const cat = CATEGORIES.find(c => c.id === e.category);
      return [e.date, e.type === "income" ? "수입" : "지출", cat?.label ?? e.category, e.amount, e.memo] as (string | number)[];
    });
    exportCSV(`가계부_${viewMonth}`, headers, rows);
  };

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base outline-none focus:border-blue-400 focus:bg-white transition";
  const cardCls = "bg-white ring-1 ring-slate-200 rounded-2xl p-5 mb-4";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5";

  return (
    <>
      <ToolNav />
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-20 pb-16 px-4 md:pl-60">
        <div className="mx-auto max-w-2xl">
          {msg && (
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-xl">
              {msg}
            </div>
          )}

          <Link href="/tools" className="text-xs text-slate-400 hover:text-slate-600 transition">← 도구 목록</Link>
          <div className="mt-4 mb-2">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-3">
              <span>📒</span> 매장 가계부
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1">매장 가계부</h1>
            <div className="flex items-center gap-2">
              <p className="text-slate-500 text-sm">매일 수입/지출 기록하고, 이번 달 얼마 남았는지 확인하세요</p>
              <CloudSyncBadge status={status} userId={userId} onRetry={retry} />
            </div>
          </div>

          {syncError && (
            <div className="rounded-xl bg-red-50 ring-1 ring-red-200 px-4 py-3 mb-4 flex items-center gap-2 text-sm text-red-700">
              <span>⚠️</span>
              <span className="font-medium">클라우드 동기화 실패</span>
              <span className="text-red-500 text-xs">— 데이터는 로컬에 저장되었습니다</span>
              <button onClick={retry} className="ml-auto px-3 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-xs font-bold transition">재시도</button>
            </div>
          )}

          {/* ── 월간 요약 카드 ── */}
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 mb-4 text-white">
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-95">←</button>
              <span className="text-sm font-bold">{monthLabel}</span>
              <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition active:scale-95">→</button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-[11px] text-slate-400 mb-1">수입</p>
                <p className="text-lg font-bold text-emerald-400">+{fmt(totalIncome)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">지출</p>
                <p className="text-lg font-bold text-red-400">-{fmt(totalExpense)}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">순이익</p>
                <p className={`text-lg font-bold ${netProfit >= 0 ? "text-white" : "text-red-400"}`}>
                  {netProfit >= 0 ? "+" : ""}{fmt(netProfit)}
                </p>
              </div>
            </div>
            {totalIncome > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>지출 비율</span>
                  <span>{totalIncome > 0 ? Math.round(totalExpense / totalIncome * 100) : 0}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${Math.min(100, totalIncome > 0 ? totalExpense / totalIncome * 100 : 0)}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* ── 입력 폼 ── */}
          <div className={cardCls}>
            <h3 className="font-bold text-slate-900 text-sm mb-4">{editId ? "✏️ 수정" : "➕ 새 기록"}</h3>

            {/* 수입/지출 토글 */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => { setType("income"); setCategory("card"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.98] ${type === "income" ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-500"}`}>
                수입
              </button>
              <button onClick={() => { setType("expense"); setCategory("ingredients"); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition active:scale-[0.98] ${type === "expense" ? "bg-red-500 text-white shadow-sm" : "bg-slate-100 text-slate-500"}`}>
                지출
              </button>
            </div>

            {/* 카테고리 선택 */}
            <div className="mb-4">
              <label className={labelCls}>카테고리</label>
              <div className="grid grid-cols-4 gap-1.5">
                {(type === "income" ? INCOME_CATS : EXPENSE_CATS).map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold transition text-center active:scale-95 ${
                      category === c.id
                        ? type === "income" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}>
                    <span className="block text-base mb-0.5">{c.icon}</span>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className={labelCls}>날짜</label>
                <input type="date" className={inputCls} value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>금액 (원)</label>
                <input className={inputCls} inputMode="numeric" placeholder="0"
                  value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ""))} />
              </div>
            </div>
            <div className="mb-3">
              <label className={labelCls}>메모 (선택)</label>
              <input className={inputCls} value={memo} onChange={e => setMemo(e.target.value)} placeholder="예) 하나로마트 식재료" />
            </div>
            <div className="flex gap-2">
              {editId && (
                <button onClick={() => { setEditId(null); setAmount(""); setMemo(""); }}
                  className="rounded-xl bg-slate-100 text-slate-600 font-semibold px-5 py-3 text-sm hover:bg-slate-200 active:scale-[0.98] transition">
                  취소
                </button>
              )}
              <button onClick={handleAdd}
                className={`flex-1 rounded-xl text-white font-semibold py-3 text-sm active:scale-[0.98] transition ${
                  type === "income" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                }`}>
                {editId ? "수정 완료" : type === "income" ? "수입 추가" : "지출 추가"}
              </button>
            </div>
          </div>

          {/* ── 뷰 탭 ── */}
          <div className="flex gap-1.5 mb-4">
            {([["list", "내역"], ["summary", "카테고리별"], ["chart", "일별"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setView(k)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${view === k ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200"}`}>
                {l}
              </button>
            ))}
          </div>

          {/* ── 내역 리스트 ── */}
          {view === "list" && (
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm">{monthLabel} 내역 ({monthEntries.length}건)</h3>
                {monthEntries.length > 0 && (
                  <button onClick={handleExport} className="text-xs text-slate-400 hover:text-blue-600 font-semibold">CSV 내보내기</button>
                )}
              </div>
              {monthEntries.length === 0 ? (
                <p className="text-center py-8 text-sm text-slate-400">이번 달 기록이 없어요. 위에서 추가해보세요!</p>
              ) : (
                <div className="space-y-2">
                  {monthEntries.map(e => {
                    const cat = CATEGORIES.find(c => c.id === e.category);
                    return (
                      <div key={e.id} className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition group">
                        <span className="text-lg flex-shrink-0">{cat?.icon ?? "📌"}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{cat?.label}</span>
                            <span className="text-[11px] text-slate-400">{e.date.slice(5)}</span>
                          </div>
                          {e.memo && <p className="text-xs text-slate-400 truncate">{e.memo}</p>}
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${e.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                          {e.type === "income" ? "+" : "-"}{fmt(e.amount)}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                          <button onClick={() => handleEdit(e)} className="text-[11px] text-slate-400 hover:text-blue-600 font-semibold">수정</button>
                          <button onClick={() => handleDelete(e.id)} className="text-[11px] text-slate-400 hover:text-red-500 font-semibold">삭제</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── 카테고리별 요약 ── */}
          {view === "summary" && (
            <>
              <div className={cardCls}>
                <h3 className="font-bold text-slate-900 text-sm mb-3">수입 카테고리</h3>
                {INCOME_CATS.filter(c => categoryTotals[c.id]).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">수입 기록이 없어요</p>
                ) : (
                  <div className="space-y-2">
                    {INCOME_CATS.filter(c => categoryTotals[c.id]).map(c => (
                      <div key={c.id} className="flex items-center gap-3">
                        <span className="text-base">{c.icon}</span>
                        <span className="text-sm text-slate-700 flex-1">{c.label}</span>
                        <span className="text-sm font-bold text-emerald-600">+{fmt(categoryTotals[c.id])}</span>
                        <span className="text-[11px] text-slate-400 w-10 text-right">{totalIncome > 0 ? Math.round(categoryTotals[c.id] / totalIncome * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className={cardCls}>
                <h3 className="font-bold text-slate-900 text-sm mb-3">지출 카테고리</h3>
                {EXPENSE_CATS.filter(c => categoryTotals[c.id]).length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-4">지출 기록이 없어요</p>
                ) : (
                  <div className="space-y-2">
                    {EXPENSE_CATS.filter(c => categoryTotals[c.id]).sort((a, b) => (categoryTotals[b.id] || 0) - (categoryTotals[a.id] || 0)).map(c => {
                      const pct = totalExpense > 0 ? categoryTotals[c.id] / totalExpense * 100 : 0;
                      return (
                        <div key={c.id}>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-base">{c.icon}</span>
                            <span className="text-sm text-slate-700 flex-1">{c.label}</span>
                            <span className="text-sm font-bold text-red-500">-{fmt(categoryTotals[c.id])}</span>
                            <span className="text-[11px] text-slate-400 w-10 text-right">{Math.round(pct)}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden ml-8">
                            <div className="h-full bg-red-300 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── 일별 요약 ── */}
          {view === "chart" && (
            <div className={cardCls}>
              <h3 className="font-bold text-slate-900 text-sm mb-3">일별 수입/지출</h3>
              {dailyTotals.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">기록이 없어요</p>
              ) : (
                <div className="space-y-2">
                  {dailyTotals.map(([date, { income, expense }]) => {
                    const dayIdx = new Date(date).getDay();
                    const dayLabel = ["일", "월", "화", "수", "목", "금", "토"][dayIdx];
                    const net = income - expense;
                    return (
                      <div key={date} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                        <div className="w-16 flex-shrink-0">
                          <p className="text-sm font-semibold text-slate-800">{date.slice(5)}</p>
                          <p className={`text-[11px] ${dayIdx === 0 ? "text-red-400" : dayIdx === 6 ? "text-blue-400" : "text-slate-400"}`}>{dayLabel}요일</p>
                        </div>
                        <div className="flex-1">
                          <div className="flex gap-4 text-xs">
                            {income > 0 && <span className="text-emerald-600 font-semibold">+{fmt(income)}</span>}
                            {expense > 0 && <span className="text-red-500 font-semibold">-{fmt(expense)}</span>}
                          </div>
                        </div>
                        <span className={`text-sm font-bold flex-shrink-0 ${net >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {net >= 0 ? "+" : ""}{fmt(net)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 팁 */}
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 mb-4">
            <p className="text-xs text-amber-800">
              <span className="font-bold">💡 팁:</span> 매일 영업 끝나고 2분만 투자하세요. 카드매출 + 현금매출 넣고, 오늘 쓴 재료비만 기록하면 됩니다.
              한 달 모이면 어디서 돈이 새는지 바로 보여요.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

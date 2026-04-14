"use client";
import { useState, useEffect } from "react";
import type { HQRole, Goal } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE, ST } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const EMPTY = { title: "", target_value: "", metric_type: "", start_date: today(), end_date: "" };

function PulseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className={C}>
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-200 rounded-lg w-2/3" />
              <div className="h-3 bg-slate-100 rounded-lg w-1/3" />
            </div>
            <div className="h-6 w-12 bg-slate-200 rounded-lg" />
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full w-full" />
          <div className="mt-3 h-3 bg-slate-100 rounded-lg w-1/4" />
        </div>
      ))}
    </div>
  );
}

export default function GoalTab({ userId, flash }: Props) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s
      .from("hq_goals")
      .select("*")
      .eq("user_id", userId)
      .order("start_date", { ascending: false });
    setGoals((data as Goal[]) ?? []);
    setLoading(false);
  }

  const activeCount = goals.filter((g) => g.status === "active").length;

  async function save() {
    if (!form.title.trim()) { flash("목표 제목을 입력하세요"); return; }
    if (!form.target_value) { flash("목표 값을 입력하세요"); return; }
    if (activeCount >= 2) { flash("활성 목표는 최대 2개까지 가능합니다"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_goals").insert({
      user_id: userId,
      title: form.title,
      target_value: Number(form.target_value),
      current_value: 0,
      metric_type: form.metric_type || "기타",
      start_date: form.start_date,
      end_date: form.end_date || null,
      status: "active",
    });
    if (error) flash("저장 실패: " + error.message);
    else { flash("목표 생성 완료"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const s = sb();
    if (!s) return;
    await s.from("hq_goals").update({ status }).eq("id", id);
    flash(status === "completed" ? "목표 달성!" : "목표 실패 처리");
    await load();
  }

  async function updateCurrent(id: string, value: number) {
    const s = sb();
    if (!s) return;
    await s.from("hq_goals").update({ current_value: value }).eq("id", id);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_goals").delete().eq("id", id);
    flash("삭제 완료");
    await load();
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">목표 관리</h2>
        <span className={`${BADGE} ${activeCount >= 2 ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
          활성 {activeCount}/2
        </span>
      </div>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">새 목표</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={L}>목표 제목</label>
            <input className={I} placeholder="예: 월 매출 1억 달성" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className={L}>목표 값</label>
            <input type="number" className={I} placeholder="100" value={form.target_value} onChange={(e) => set("target_value", e.target.value)} />
          </div>
          <div>
            <label className={L}>지표 유형</label>
            <input className={I} placeholder="매출, 사용자, 전환율 등" value={form.metric_type} onChange={(e) => set("metric_type", e.target.value)} />
          </div>
          <div>
            <label className={L}>시작일</label>
            <input type="date" className={I} value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
          </div>
          <div>
            <label className={L}>종료일</label>
            <input type="date" className={I} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className={B} onClick={save} disabled={saving || activeCount >= 2}>
            {saving ? "생성 중..." : "목표 생성"}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <PulseSkeleton />}

      {/* Goal Cards */}
      {!loading && (
        <div className="space-y-4">
          {goals.map((g) => {
            const pct = g.target_value ? Math.round((g.current_value / g.target_value) * 100) : 0;
            const st = ST[g.status] ?? ST.active;
            const isActive = g.status === "active";
            return (
              <div key={g.id} className={C}>
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-slate-900">{g.title}</h4>
                      <span className={`${BADGE} text-[10px] ${st.bg}`}>{st.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {g.metric_type} &middot; {g.start_date} ~ {g.end_date || "미정"}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-[#3182F6]">{pct}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-3 h-2.5 rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      g.status === "completed"
                        ? "bg-emerald-500"
                        : g.status === "failed"
                          ? "bg-red-400"
                          : "bg-[#3182F6]"
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    현재 {g.current_value} / 목표 {g.target_value}
                  </p>
                  <div className="flex items-center gap-2">
                    {isActive && (
                      <>
                        <input
                          type="number"
                          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-blue-400"
                          placeholder="현재값"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              updateCurrent(g.id, Number((e.target as HTMLInputElement).value));
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                        <button
                          className="rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                          onClick={() => updateStatus(g.id, "completed")}
                        >
                          달성
                        </button>
                        <button
                          className="rounded-lg bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                          onClick={() => updateStatus(g.id, "failed")}
                        >
                          실패
                        </button>
                      </>
                    )}
                    <button
                      className="rounded-lg bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                      onClick={() => remove(g.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && goals.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-[#3182F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">아직 설정된 목표가 없습니다</p>
          <p className="text-xs text-slate-400">목표를 설정하고 성장을 추적해보세요!</p>
        </div>
      )}
    </div>
  );
}

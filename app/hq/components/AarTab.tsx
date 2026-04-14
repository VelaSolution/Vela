"use client";
import { useState, useEffect } from "react";
import type { HQRole, AAR } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2 } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const EMPTY = { date: today(), goal: "", result: "", gap_reason: "", improvement: "" };

function PulseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className={C}>
          <div className="h-4 bg-slate-200 rounded-lg w-24 mb-3" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-blue-50/40 p-3 space-y-2">
              <div className="h-3 bg-blue-100 rounded w-12" />
              <div className="h-3 bg-blue-100 rounded w-3/4" />
            </div>
            <div className="rounded-xl bg-emerald-50/40 p-3 space-y-2">
              <div className="h-3 bg-emerald-100 rounded w-12" />
              <div className="h-3 bg-emerald-100 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AarTab({ userId, flash }: Props) {
  const [records, setRecords] = useState<AAR[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s
      .from("hq_aar")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
    setRecords((data as AAR[]) ?? []);
    setLoading(false);
  }

  async function save() {
    if (!form.goal.trim()) { flash("목표를 입력하세요"); return; }
    if (!form.result.trim()) { flash("결과를 입력하세요"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_aar").insert({ user_id: userId, ...form });
    if (error) flash("저장 실패: " + error.message);
    else { flash("AAR 저장 완료"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_aar").delete().eq("id", id);
    flash("삭제 완료");
    await load();
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">AAR (After Action Review)</h2>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">새 AAR 작성</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={L}>날짜</label>
            <input type="date" className={I} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className={L}>목표 (의도한 것)</label>
            <input className={I} placeholder="달성하려 했던 목표" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
          </div>
          <div>
            <label className={L}>결과 (실제 일어난 것)</label>
            <input className={I} placeholder="실제 결과" value={form.result} onChange={(e) => set("result", e.target.value)} />
          </div>
          <div>
            <label className={L}>GAP 원인</label>
            <textarea
              className={`${I} resize-none`}
              rows={3}
              placeholder="목표와 결과의 차이가 발생한 원인"
              value={form.gap_reason}
              onChange={(e) => set("gap_reason", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={L}>개선 방안</label>
            <textarea
              className={`${I} resize-none`}
              rows={3}
              placeholder="다음에 더 잘하기 위한 구체적인 개선 방안"
              value={form.improvement}
              onChange={(e) => set("improvement", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className={B} onClick={save} disabled={saving}>
            {saving ? "저장 중..." : "AAR 저장"}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <PulseSkeleton />}

      {/* AAR List */}
      {!loading && records.map((r) => (
        <div key={r.id} className={C}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">{r.date}</span>
            <button className="text-xs text-red-400 hover:text-red-600" onClick={() => remove(r.id)}>
              삭제
            </button>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-blue-50/60 p-3">
              <p className="text-xs font-bold text-blue-700">목표</p>
              <p className="mt-1 text-sm text-blue-900/80">{r.goal}</p>
            </div>
            <div className="rounded-xl bg-emerald-50/60 p-3">
              <p className="text-xs font-bold text-emerald-700">결과</p>
              <p className="mt-1 text-sm text-emerald-900/80">{r.result}</p>
            </div>
            {r.gap_reason && (
              <div className="rounded-xl bg-amber-50/60 p-3">
                <p className="text-xs font-bold text-amber-700">GAP 원인</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900/80 whitespace-pre-wrap">{r.gap_reason}</p>
              </div>
            )}
            {r.improvement && (
              <div className="rounded-xl bg-purple-50/60 p-3">
                <p className="text-xs font-bold text-purple-700">개선 방안</p>
                <p className="mt-1 text-sm leading-relaxed text-purple-900/80 whitespace-pre-wrap">{r.improvement}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">작성된 AAR이 없습니다</p>
          <p className="text-xs text-slate-400">행동 후 리뷰를 작성하여 성장을 기록하세요</p>
        </div>
      )}
    </div>
  );
}

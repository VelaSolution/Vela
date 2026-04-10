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
    if (!form.goal.trim()) { flash("\ubaa9\ud45c\ub97c \uc785\ub825\ud558\uc138\uc694"); return; }
    if (!form.result.trim()) { flash("\uacb0\uacfc\ub97c \uc785\ub825\ud558\uc138\uc694"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_aar").insert({ user_id: userId, ...form });
    if (error) flash("\uc800\uc7a5 \uc2e4\ud328: " + error.message);
    else { flash("AAR \uc800\uc7a5 \uc644\ub8cc"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    const s = sb();
    if (!s) return;
    await s.from("hq_aar").delete().eq("id", id);
    flash("\uc0ad\uc81c \uc644\ub8cc");
    await load();
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">AAR (After Action Review)</h2>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">\uc0c8 AAR \uc791\uc131</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={L}>\ub0a0\uc9dc</label>
            <input type="date" className={I} value={form.date} onChange={(e) => set("date", e.target.value)} />
          </div>
          <div>
            <label className={L}>\ubaa9\ud45c (\uc758\ub3c4\ud55c \uac83)</label>
            <input className={I} placeholder="\ub2ec\uc131\ud558\ub824 \ud588\ub358 \ubaa9\ud45c" value={form.goal} onChange={(e) => set("goal", e.target.value)} />
          </div>
          <div>
            <label className={L}>\uacb0\uacfc (\uc2e4\uc81c \uc77c\uc5b4\ub09c \uac83)</label>
            <input className={I} placeholder="\uc2e4\uc81c \uacb0\uacfc" value={form.result} onChange={(e) => set("result", e.target.value)} />
          </div>
          <div>
            <label className={L}>GAP \uc6d0\uc778</label>
            <textarea
              className={`${I} resize-none`}
              rows={3}
              placeholder="\ubaa9\ud45c\uc640 \uacb0\uacfc\uc758 \ucc28\uc774\uac00 \ubc1c\uc0dd\ud55c \uc6d0\uc778"
              value={form.gap_reason}
              onChange={(e) => set("gap_reason", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={L}>\uac1c\uc120 \ubc29\uc548</label>
            <textarea
              className={`${I} resize-none`}
              rows={3}
              placeholder="\ub2e4\uc74c\uc5d0 \ub354 \uc798\ud558\uae30 \uc704\ud55c \uad6c\uccb4\uc801\uc778 \uac1c\uc120 \ubc29\uc548"
              value={form.improvement}
              onChange={(e) => set("improvement", e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button className={B} onClick={save} disabled={saving}>
            {saving ? "\uc800\uc7a5 \uc911..." : "AAR \uc800\uc7a5"}
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
              \uc0ad\uc81c
            </button>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl bg-blue-50/60 p-3">
              <p className="text-xs font-bold text-blue-700">\ubaa9\ud45c</p>
              <p className="mt-1 text-sm text-blue-900/80">{r.goal}</p>
            </div>
            <div className="rounded-xl bg-emerald-50/60 p-3">
              <p className="text-xs font-bold text-emerald-700">\uacb0\uacfc</p>
              <p className="mt-1 text-sm text-emerald-900/80">{r.result}</p>
            </div>
            {r.gap_reason && (
              <div className="rounded-xl bg-amber-50/60 p-3">
                <p className="text-xs font-bold text-amber-700">GAP \uc6d0\uc778</p>
                <p className="mt-1 text-sm leading-relaxed text-amber-900/80 whitespace-pre-wrap">{r.gap_reason}</p>
              </div>
            )}
            {r.improvement && (
              <div className="rounded-xl bg-purple-50/60 p-3">
                <p className="text-xs font-bold text-purple-700">\uac1c\uc120 \ubc29\uc548</p>
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
          <p className="text-sm font-semibold text-slate-700 mb-1">\uc791\uc131\ub41c AAR\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</p>
          <p className="text-xs text-slate-400">\ud589\ub3d9 \ud6c4 \ub9ac\ubdf0\ub97c \uc791\uc131\ud558\uc5ec \uc131\uc7a5\uc744 \uae30\ub85d\ud558\uc138\uc694</p>
        </div>
      )}
    </div>
  );
}

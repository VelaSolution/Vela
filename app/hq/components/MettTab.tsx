"use client";
import { useState, useEffect } from "react";
import type { HQRole, Mett } from "@/app/hq/types";
import { sb, I, C, L, B, B2 } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const FIELDS: { key: keyof Omit<Mett, "id" | "created_at">; label: string; placeholder: string }[] = [
  { key: "mission", label: "Mission (\uc784\ubb34)", placeholder: "\ud575\uc2ec \uc784\ubb34\ub97c \uc815\uc758\ud558\uc138\uc694" },
  { key: "enemy", label: "Enemy (\uc704\ud611/\uacbd\uc7c1)", placeholder: "\uacbd\uc7c1\uc0ac, \uc2dc\uc7a5 \uc704\ud611 \uc694\uc18c" },
  { key: "terrain", label: "Terrain (\ud658\uacbd)", placeholder: "\uc2dc\uc7a5 \ud658\uacbd, \uae30\uc220 \ud2b8\ub80c\ub4dc" },
  { key: "troops", label: "Troops (\uc790\uc6d0/\ud300)", placeholder: "\uac00\uc6a9 \uc778\ub825, \uc608\uc0b0, \ub3c4\uad6c" },
  { key: "time_constraint", label: "Time (\uc2dc\uac04 \uc81c\uc57d)", placeholder: "\ub9c8\uac10\uc77c, \uc2dc\uac04 \uc81c\uc57d \uc870\uac74" },
  { key: "civil", label: "Civil (\uc774\ud574\uad00\uacc4\uc790)", placeholder: "\uace0\uac1d, \ud30c\ud2b8\ub108, \uaddc\uc81c \uae30\uad00" },
];

const EMPTY = { mission: "", enemy: "", terrain: "", troops: "", time_constraint: "", civil: "" };

function PulseSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className={C}>
          <div className="h-3 bg-slate-200 rounded-lg w-28 mb-3" />
          <div className="grid gap-3 sm:grid-cols-2">
            {[1, 2, 3, 4].map(j => (
              <div key={j} className="space-y-2">
                <div className="h-3 bg-slate-100 rounded w-20" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MettTab({ userId, flash }: Props) {
  const [records, setRecords] = useState<Mett[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s
      .from("hq_mett")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setRecords((data as Mett[]) ?? []);
    setLoading(false);
  }

  async function save() {
    if (!form.mission.trim()) { flash("\uc784\ubb34\ub97c \uc785\ub825\ud558\uc138\uc694"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_mett").insert({ user_id: userId, ...form });
    if (error) flash("\uc800\uc7a5 \uc2e4\ud328: " + error.message);
    else { flash("\uc800\uc7a5 \uc644\ub8cc"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    const s = sb();
    if (!s) return;
    await s.from("hq_mett").delete().eq("id", id);
    flash("\uc0ad\uc81c \uc644\ub8cc");
    await load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">\uc0c1\ud669\ud310\ub2e8 (METT-TC)</h2>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">\uc0c8 \ubd84\uc11d \uc791\uc131</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <label className={L}>{f.label}</label>
              <textarea
                className={`${I} resize-none`}
                rows={3}
                placeholder={f.placeholder}
                value={form[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button className={B} onClick={save} disabled={saving}>
            {saving ? "\uc800\uc7a5 \uc911..." : "\uc800\uc7a5"}
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && <PulseSkeleton />}

      {/* Records */}
      {!loading && records.map((r) => (
        <div key={r.id} className={C}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              {new Date(r.created_at).toLocaleDateString("ko-KR")}
            </span>
            <button className={`${B2} text-xs text-red-500 hover:bg-red-50`} onClick={() => remove(r.id)}>
              \uc0ad\uc81c
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <p className="text-xs font-bold text-slate-500">{f.label}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {r[f.key] || "-"}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!loading && records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-700 mb-1">\uc544\uc9c1 \uc791\uc131\ub41c \ubd84\uc11d\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</p>
          <p className="text-xs text-slate-400">METT-TC \ubd84\uc11d\uc73c\ub85c \uc0c1\ud669\uc744 \uccb4\uacc4\uc801\uc73c\ub85c \ud310\ub2e8\ud558\uc138\uc694</p>
        </div>
      )}
    </div>
  );
}

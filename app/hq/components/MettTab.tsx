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
  { key: "mission", label: "Mission (임무)", placeholder: "핵심 임무를 정의하세요" },
  { key: "enemy", label: "Enemy (위협/경쟁)", placeholder: "경쟁사, 시장 위협 요소" },
  { key: "terrain", label: "Terrain (환경)", placeholder: "시장 환경, 기술 트렌드" },
  { key: "troops", label: "Troops (자원/팀)", placeholder: "가용 인력, 예산, 도구" },
  { key: "time_constraint", label: "Time (시간 제약)", placeholder: "마감일, 시간 제약 조건" },
  { key: "civil", label: "Civil (이해관계자)", placeholder: "고객, 파트너, 규제 기관" },
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
    if (!form.mission.trim()) { flash("임무를 입력하세요"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_mett").insert({ user_id: userId, ...form });
    if (error) flash("저장 실패: " + error.message);
    else { flash("저장 완료"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_mett").delete().eq("id", id);
    flash("삭제 완료");
    await load();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">상황판단 (METT-TC)</h2>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">새 분석 작성</h3>
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
            {saving ? "저장 중..." : "저장"}
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
              삭제
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
          <p className="text-sm font-semibold text-slate-700 mb-1">아직 작성된 분석이 없습니다</p>
          <p className="text-xs text-slate-400">METT-TC 분석으로 상황을 체계적으로 판단하세요</p>
        </div>
      )}
    </div>
  );
}

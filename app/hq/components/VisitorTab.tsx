"use client";
import { useState, useEffect, useMemo } from "react";
import type { HQRole } from "@/app/hq/types";
import { sb, I, C, L, B, B2, BADGE, fmt, today, useTeamDisplayNames } from "@/app/hq/utils";

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

type Visitor = {
  id: string; name: string; company: string; purpose: string; host: string;
  visit_date: string; expected_time: string; arrival_time: string | null;
  departure_time: string | null; phone: string; vehicle_no: string;
  status: string; created_at: string;
};

const STATUSES = ["예약", "방문중", "퇴실"] as const;
const STATUS_COLORS: Record<string, string> = {
  "예약": "bg-blue-50 text-blue-700",
  "방문중": "bg-green-50 text-green-700",
  "퇴실": "bg-slate-100 text-slate-500",
};

const EMPTY_FORM = {
  name: "", company: "", purpose: "", host: "",
  visit_date: today(), expected_time: "09:00", phone: "", vehicle_no: "",
};

export default function VisitorTab({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();
  const canDelete = myRole === "대표" || myRole === "이사" || myRole === "팀장";

  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [teamNames, setTeamNames] = useState<string[]>([]);

  // filters
  const [dateFilter, setDateFilter] = useState(today());
  const [statusFilter, setStatusFilter] = useState("전체");
  const [search, setSearch] = useState("");

  // badge print
  const [printVisitor, setPrintVisitor] = useState<Visitor | null>(null);

  async function load() {
    const s = sb(); if (!s) { setLoading(false); return; }
    const [r1, r2] = await Promise.all([
      s.from("hq_visitors").select("*").order("visit_date", { ascending: false }).order("expected_time", { ascending: true }).limit(500),
      s.from("hq_team").select("name").neq("approved", false),
    ]);
    if (r1.data) setVisitors(r1.data as Visitor[]);
    if (r2.data) setTeamNames((r2.data as { name: string }[]).map(t => t.name));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const todayVisitors = useMemo(() => {
    const d = today();
    return visitors.filter(v => v.visit_date === d);
  }, [visitors]);

  const todaySummary = useMemo(() => {
    const total = todayVisitors.length;
    const reserved = todayVisitors.filter(v => v.status === "예약").length;
    const visiting = todayVisitors.filter(v => v.status === "방문중").length;
    const left = todayVisitors.filter(v => v.status === "퇴실").length;
    return { total, reserved, visiting, left };
  }, [todayVisitors]);

  const filtered = useMemo(() => {
    return visitors.filter(v => {
      if (dateFilter && v.visit_date !== dateFilter) return false;
      if (statusFilter !== "전체" && v.status !== statusFilter) return false;
      if (search && !v.name.includes(search) && !v.company?.includes(search) && !v.host?.includes(search)) return false;
      return true;
    });
  }, [visitors, dateFilter, statusFilter, search]);

  async function saveVisitor() {
    if (!form.name.trim()) { flash("방문자명을 입력해주세요"); return; }
    if (!form.host) { flash("담당자를 선택해주세요"); return; }
    setSaving(true);
    const s = sb(); if (!s) { setSaving(false); return; }
    const payload = {
      name: form.name.trim(),
      company: form.company.trim(),
      purpose: form.purpose.trim(),
      host: form.host,
      visit_date: form.visit_date,
      expected_time: form.expected_time,
      phone: form.phone.trim(),
      vehicle_no: form.vehicle_no.trim(),
      status: "예약",
    };
    await s.from("hq_visitors").insert(payload);
    flash("방문자가 등록되었습니다");
    setShowForm(false); setForm(EMPTY_FORM); setSaving(false);
    load();
  }

  async function checkIn(id: string) {
    const s = sb(); if (!s) return;
    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
    await s.from("hq_visitors").update({ status: "방문중", arrival_time: now }).eq("id", id);
    flash("입실 처리되었습니다");
    load();
  }

  async function checkOut(id: string) {
    const s = sb(); if (!s) return;
    const now = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
    await s.from("hq_visitors").update({ status: "퇴실", departure_time: now }).eq("id", id);
    flash("퇴실 처리되었습니다");
    load();
  }

  async function deleteVisitor(id: string) {
    if (!confirm("이 방문자 기록을 삭제하시겠습니까?")) return;
    const s = sb(); if (!s) return;
    await s.from("hq_visitors").delete().eq("id", id);
    flash("삭제되었습니다"); load();
  }

  if (loading) return <div className="text-center py-20 text-slate-400">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      {/* 오늘 방문 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "오늘 전체", value: `${todaySummary.total}명` },
          { label: "예약", value: `${todaySummary.reserved}명` },
          { label: "방문중", value: `${todaySummary.visiting}명` },
          { label: "퇴실", value: `${todaySummary.left}명` },
        ].map(c => (
          <div key={c.label} className={C}>
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
          </div>
        ))}
      </div>

      {/* 필터 & 검색 */}
      <div className={`${C} flex flex-wrap gap-3 items-center`}>
        <input type="date" className={`${I} max-w-[180px]`} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <select className={`${I} max-w-[140px]`} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="전체">전체 상태</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className={`${I} max-w-[200px]`} placeholder="검색 (이름/회사/담당자)" value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex-1" />
        <button className={B} onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }}>+ 방문자 등록</button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className={C}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">방문자 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={L}>방문자명 *</label>
              <input className={I} placeholder="방문자 이름" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className={L}>소속 회사</label>
              <input className={I} placeholder="회사명" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            </div>
            <div>
              <label className={L}>방문 목적</label>
              <input className={I} placeholder="방문 목적" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
            </div>
            <div>
              <label className={L}>담당자 (호스트) *</label>
              <select className={I} value={form.host} onChange={e => setForm({ ...form, host: e.target.value })}>
                <option value="">선택</option>
                {teamNames.map(n => <option key={n} value={n}>{displayName(n)}</option>)}
              </select>
            </div>
            <div>
              <label className={L}>방문 예정일</label>
              <input type="date" className={I} value={form.visit_date} onChange={e => setForm({ ...form, visit_date: e.target.value })} />
            </div>
            <div>
              <label className={L}>예정 시간</label>
              <input type="time" className={I} value={form.expected_time} onChange={e => setForm({ ...form, expected_time: e.target.value })} />
            </div>
            <div>
              <label className={L}>연락처</label>
              <input className={I} placeholder="010-0000-0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label className={L}>차량 번호</label>
              <input className={I} placeholder="12가 3456" value={form.vehicle_no} onChange={e => setForm({ ...form, vehicle_no: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className={B} onClick={saveVisitor} disabled={saving}>{saving ? "저장 중..." : "등록"}</button>
            <button className={B2} onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 방문자 목록 */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">방문자 목록 ({filtered.length}건)</h3>
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-8">방문자 기록이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400">
                  <th className="py-2 px-2 font-medium">상태</th>
                  <th className="py-2 px-2 font-medium">방문자</th>
                  <th className="py-2 px-2 font-medium">소속</th>
                  <th className="py-2 px-2 font-medium">목적</th>
                  <th className="py-2 px-2 font-medium">담당자</th>
                  <th className="py-2 px-2 font-medium">방문일</th>
                  <th className="py-2 px-2 font-medium">예정</th>
                  <th className="py-2 px-2 font-medium">입실</th>
                  <th className="py-2 px-2 font-medium">퇴실</th>
                  <th className="py-2 px-2 font-medium">차량</th>
                  <th className="py-2 px-2 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(v => (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2.5 px-2">
                      <span className={`${BADGE} ${STATUS_COLORS[v.status] || "bg-slate-100 text-slate-600"}`}>{v.status}</span>
                    </td>
                    <td className="py-2.5 px-2 font-medium text-slate-800">{v.name}</td>
                    <td className="py-2.5 px-2 text-slate-600">{v.company || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-600">{v.purpose || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-600">{displayName(v.host)}</td>
                    <td className="py-2.5 px-2 text-slate-500">{v.visit_date}</td>
                    <td className="py-2.5 px-2 text-slate-500">{v.expected_time || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-500">{v.arrival_time || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-500">{v.departure_time || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-500">{v.vehicle_no || "-"}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex gap-1.5 flex-wrap">
                        {v.status === "예약" && (
                          <button className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 font-semibold hover:bg-green-100 transition-colors" onClick={() => checkIn(v.id)}>입실</button>
                        )}
                        {v.status === "방문중" && (
                          <button className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold hover:bg-slate-200 transition-colors" onClick={() => checkOut(v.id)}>퇴실</button>
                        )}
                        <button className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors" onClick={() => setPrintVisitor(v)}>배지</button>
                        {canDelete && (
                          <button className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors" onClick={() => deleteVisitor(v.id)}>삭제</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 방문자 배지 (인쇄용) */}
      {printVisitor && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setPrintVisitor(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div id="visitor-badge" className="p-8">
              <div className="border-2 border-slate-800 rounded-xl p-6 text-center">
                <div className="text-xs text-slate-400 mb-1 tracking-widest uppercase">VISITOR BADGE</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{printVisitor.name}</h2>
                {printVisitor.company && <p className="text-base text-slate-600 mb-3">{printVisitor.company}</p>}
                <div className="border-t border-slate-200 pt-3 mt-3 space-y-1.5 text-sm text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">방문 목적</span>
                    <span className="text-slate-700 font-medium">{printVisitor.purpose || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">담당자</span>
                    <span className="text-slate-700 font-medium">{displayName(printVisitor.host)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">방문일</span>
                    <span className="text-slate-700 font-medium">{printVisitor.visit_date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">예정 시간</span>
                    <span className="text-slate-700 font-medium">{printVisitor.expected_time || "-"}</span>
                  </div>
                  {printVisitor.vehicle_no && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">차량 번호</span>
                      <span className="text-slate-700 font-medium">{printVisitor.vehicle_no}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-dashed border-slate-300">
                  <p className="text-[11px] text-slate-400">본 배지는 방문 당일에만 유효합니다</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button className={B} onClick={() => {
                const style = document.createElement("style");
                style.textContent = `@media print { body > * { display: none !important; } #visitor-badge { display: block !important; position: fixed; inset: 0; z-index: 9999; background: white; } }`;
                document.head.appendChild(style);
                window.print();
                setTimeout(() => style.remove(), 500);
              }}>인쇄</button>
              <button className={B2} onClick={() => setPrintVisitor(null)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

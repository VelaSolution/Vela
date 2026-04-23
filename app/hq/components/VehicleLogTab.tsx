"use client";
import { useState, useEffect, useMemo } from "react";
import type { HQRole } from "@/app/hq/types";
import { sb, I, C, L, B, B2, BADGE, fmt, today, useTeamDisplayNames } from "@/app/hq/utils";

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

type VehicleLog = {
  id: string; date: string; driver: string; vehicle_name: string;
  purpose: string; from_location: string; to_location: string;
  departure_km: number; arrival_km: number; distance: number;
  fuel_amount: number; fuel_cost: number; memo: string; created_at: string;
};

type Vehicle = { id: string; name: string; category: string; status: string };

const EMPTY_FORM = {
  date: today(), driver: "", vehicle_name: "", purpose: "",
  from_location: "", to_location: "",
  departure_km: "", arrival_km: "",
  fuel_amount: "", fuel_cost: "", memo: "",
};

export default function VehicleLogTab({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();
  const canDelete = myRole === "대표" || myRole === "이사";

  const [logs, setLogs] = useState<VehicleLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // filters
  const [monthFilter, setMonthFilter] = useState(today().slice(0, 7)); // YYYY-MM
  const [vehicleFilter, setVehicleFilter] = useState("전체");

  // print view
  const [showPrint, setShowPrint] = useState(false);

  async function load() {
    const s = sb(); if (!s) { setLoading(false); return; }
    const [r1, r2, r3] = await Promise.all([
      s.from("hq_vehicle_logs").select("*").order("date", { ascending: false }).limit(1000),
      s.from("hq_assets").select("id, name, category, status").eq("category", "차량"),
      s.from("hq_team").select("name").neq("approved", false),
    ]);
    if (r1.data) setLogs(r1.data as VehicleLog[]);
    if (r2.data) setVehicles(r2.data as Vehicle[]);
    if (r3.data) setTeamNames((r3.data as { name: string }[]).map(t => t.name));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return logs.filter(l => {
      if (monthFilter && !l.date.startsWith(monthFilter)) return false;
      if (vehicleFilter !== "전체" && l.vehicle_name !== vehicleFilter) return false;
      return true;
    });
  }, [logs, monthFilter, vehicleFilter]);

  const monthlySummary = useMemo(() => {
    const totalDistance = filtered.reduce((s, l) => s + (l.distance || 0), 0);
    const totalFuelCost = filtered.reduce((s, l) => s + (l.fuel_cost || 0), 0);
    const totalFuelAmount = filtered.reduce((s, l) => s + (l.fuel_amount || 0), 0);

    const byVehicle: Record<string, { distance: number; fuelCost: number; fuelAmount: number; count: number }> = {};
    for (const l of filtered) {
      const v = l.vehicle_name || "미지정";
      if (!byVehicle[v]) byVehicle[v] = { distance: 0, fuelCost: 0, fuelAmount: 0, count: 0 };
      byVehicle[v].distance += l.distance || 0;
      byVehicle[v].fuelCost += l.fuel_cost || 0;
      byVehicle[v].fuelAmount += l.fuel_amount || 0;
      byVehicle[v].count += 1;
    }
    return { totalDistance, totalFuelCost, totalFuelAmount, byVehicle };
  }, [filtered]);

  const computedDistance = useMemo(() => {
    const dep = Number(form.departure_km);
    const arr = Number(form.arrival_km);
    if (dep > 0 && arr > 0 && arr >= dep) return arr - dep;
    return 0;
  }, [form.departure_km, form.arrival_km]);

  async function saveLog() {
    if (!form.driver) { flash("운전자를 선택해주세요"); return; }
    if (!form.vehicle_name) { flash("차량을 선택해주세요"); return; }
    setSaving(true);
    const s = sb(); if (!s) { setSaving(false); return; }
    const depKm = Number(form.departure_km) || 0;
    const arrKm = Number(form.arrival_km) || 0;
    const distance = arrKm >= depKm ? arrKm - depKm : 0;
    const payload = {
      date: form.date,
      driver: form.driver,
      vehicle_name: form.vehicle_name,
      purpose: form.purpose.trim(),
      from_location: form.from_location.trim(),
      to_location: form.to_location.trim(),
      departure_km: depKm,
      arrival_km: arrKm,
      distance,
      fuel_amount: Number(form.fuel_amount) || 0,
      fuel_cost: Number(form.fuel_cost) || 0,
      memo: form.memo.trim(),
    };
    await s.from("hq_vehicle_logs").insert(payload);
    flash("운행일지가 등록되었습니다");
    setShowForm(false); setForm(EMPTY_FORM); setSaving(false);
    load();
  }

  async function deleteLog(id: string) {
    if (!confirm("이 운행 기록을 삭제하시겠습니까?")) return;
    const s = sb(); if (!s) return;
    await s.from("hq_vehicle_logs").delete().eq("id", id);
    flash("삭제되었습니다"); load();
  }

  if (loading) return <div className="text-center py-20 text-slate-400">불러오는 중...</div>;

  return (
    <div className="space-y-4">
      {/* 월간 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "총 운행건수", value: `${filtered.length}건` },
          { label: "총 주행거리", value: `${fmt(monthlySummary.totalDistance)}km` },
          { label: "총 주유량", value: `${fmt(monthlySummary.totalFuelAmount)}L` },
          { label: "총 주유비", value: `${fmt(monthlySummary.totalFuelCost)}원` },
        ].map(c => (
          <div key={c.label} className={C}>
            <p className="text-xs text-slate-400 mb-1">{c.label}</p>
            <p className="text-lg font-bold text-slate-800">{c.value}</p>
          </div>
        ))}
      </div>

      {/* 차량별 요약 */}
      {Object.keys(monthlySummary.byVehicle).length > 0 && (
        <div className={C}>
          <h3 className="text-sm font-bold text-slate-700 mb-3">차량별 요약</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(monthlySummary.byVehicle).map(([name, data]) => (
              <div key={name} className="rounded-xl bg-slate-50 p-3">
                <p className="font-semibold text-slate-800 text-sm mb-1">{name}</p>
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>운행 {data.count}건 · {fmt(data.distance)}km</p>
                  <p>주유 {fmt(data.fuelAmount)}L · {fmt(data.fuelCost)}원</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 필터 & 액션 */}
      <div className={`${C} flex flex-wrap gap-3 items-center`}>
        <input type="month" className={`${I} max-w-[180px]`} value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
        <select className={`${I} max-w-[180px]`} value={vehicleFilter} onChange={e => setVehicleFilter(e.target.value)}>
          <option value="전체">전체 차량</option>
          {vehicles.map(v => <option key={v.id} value={v.name}>{v.name}</option>)}
        </select>
        <div className="flex-1" />
        <button className={B2} onClick={() => setShowPrint(true)}>인쇄용 보기</button>
        <button className={B} onClick={() => { setForm({ ...EMPTY_FORM, driver: userName }); setShowForm(true); }}>+ 운행 기록</button>
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className={C}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">운행일지 등록</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={L}>운행일 *</label>
              <input type="date" className={I} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className={L}>운전자 *</label>
              <select className={I} value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })}>
                <option value="">선택</option>
                {teamNames.map(n => <option key={n} value={n}>{displayName(n)}</option>)}
              </select>
            </div>
            <div>
              <label className={L}>차량 *</label>
              <select className={I} value={form.vehicle_name} onChange={e => setForm({ ...form, vehicle_name: e.target.value })}>
                <option value="">선택</option>
                {vehicles.map(v => <option key={v.id} value={v.name}>{v.name} {v.status !== "사용중" ? `(${v.status})` : ""}</option>)}
              </select>
            </div>
            <div>
              <label className={L}>운행 목적</label>
              <input className={I} placeholder="운행 목적" value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })} />
            </div>
            <div>
              <label className={L}>출발지</label>
              <input className={I} placeholder="출발 장소" value={form.from_location} onChange={e => setForm({ ...form, from_location: e.target.value })} />
            </div>
            <div>
              <label className={L}>도착지</label>
              <input className={I} placeholder="도착 장소" value={form.to_location} onChange={e => setForm({ ...form, to_location: e.target.value })} />
            </div>
            <div>
              <label className={L}>출발 km</label>
              <input type="number" className={I} placeholder="출발 시 계기판 km" value={form.departure_km} onChange={e => setForm({ ...form, departure_km: e.target.value })} />
            </div>
            <div>
              <label className={L}>도착 km</label>
              <input type="number" className={I} placeholder="도착 시 계기판 km" value={form.arrival_km} onChange={e => setForm({ ...form, arrival_km: e.target.value })} />
            </div>
            {computedDistance > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-slate-500">주행 거리: <span className="font-bold text-slate-800">{fmt(computedDistance)}km</span></p>
              </div>
            )}
            <div>
              <label className={L}>주유량 (L)</label>
              <input type="number" className={I} placeholder="주유량" value={form.fuel_amount} onChange={e => setForm({ ...form, fuel_amount: e.target.value })} />
            </div>
            <div>
              <label className={L}>주유비 (원)</label>
              <input type="number" className={I} placeholder="주유 금액" value={form.fuel_cost} onChange={e => setForm({ ...form, fuel_cost: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className={L}>비고</label>
              <input className={I} placeholder="메모" value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className={B} onClick={saveLog} disabled={saving}>{saving ? "저장 중..." : "등록"}</button>
            <button className={B2} onClick={() => setShowForm(false)}>취소</button>
          </div>
        </div>
      )}

      {/* 운행일지 목록 */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">운행일지 ({filtered.length}건)</h3>
        {filtered.length === 0 ? (
          <p className="text-center text-slate-400 py-8">운행 기록이 없습니다</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-400">
                  <th className="py-2 px-2 font-medium">날짜</th>
                  <th className="py-2 px-2 font-medium">운전자</th>
                  <th className="py-2 px-2 font-medium">차량</th>
                  <th className="py-2 px-2 font-medium">목적</th>
                  <th className="py-2 px-2 font-medium">출발지</th>
                  <th className="py-2 px-2 font-medium">도착지</th>
                  <th className="py-2 px-2 font-medium text-right">출발km</th>
                  <th className="py-2 px-2 font-medium text-right">도착km</th>
                  <th className="py-2 px-2 font-medium text-right">거리</th>
                  <th className="py-2 px-2 font-medium text-right">주유(L)</th>
                  <th className="py-2 px-2 font-medium text-right">주유비</th>
                  <th className="py-2 px-2 font-medium">비고</th>
                  {canDelete && <th className="py-2 px-2 font-medium">관리</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(l => (
                  <tr key={l.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">{l.date}</td>
                    <td className="py-2.5 px-2 text-slate-700 font-medium">{displayName(l.driver)}</td>
                    <td className="py-2.5 px-2"><span className={`${BADGE} bg-purple-50 text-purple-700`}>{l.vehicle_name}</span></td>
                    <td className="py-2.5 px-2 text-slate-600">{l.purpose || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-500">{l.from_location || "-"}</td>
                    <td className="py-2.5 px-2 text-slate-500">{l.to_location || "-"}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{l.departure_km ? fmt(l.departure_km) : "-"}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{l.arrival_km ? fmt(l.arrival_km) : "-"}</td>
                    <td className="py-2.5 px-2 text-right font-semibold text-slate-800">{l.distance ? `${fmt(l.distance)}km` : "-"}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{l.fuel_amount ? fmt(l.fuel_amount) : "-"}</td>
                    <td className="py-2.5 px-2 text-right text-slate-500">{l.fuel_cost ? `${fmt(l.fuel_cost)}원` : "-"}</td>
                    <td className="py-2.5 px-2 text-slate-400 text-xs">{l.memo || ""}</td>
                    {canDelete && (
                      <td className="py-2.5 px-2">
                        <button className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors" onClick={() => deleteLog(l.id)}>삭제</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 인쇄용 보기 */}
      {showPrint && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowPrint(false)}>
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div id="vehicle-log-print" className="p-8">
              <h2 className="text-xl font-bold text-center mb-1">차량 운행일지</h2>
              <p className="text-center text-sm text-slate-500 mb-4">{monthFilter}</p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-2 py-1.5">날짜</th>
                    <th className="border border-slate-300 px-2 py-1.5">운전자</th>
                    <th className="border border-slate-300 px-2 py-1.5">차량</th>
                    <th className="border border-slate-300 px-2 py-1.5">목적</th>
                    <th className="border border-slate-300 px-2 py-1.5">출발지</th>
                    <th className="border border-slate-300 px-2 py-1.5">도착지</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-right">출발km</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-right">도착km</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-right">거리</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-right">주유(L)</th>
                    <th className="border border-slate-300 px-2 py-1.5 text-right">주유비</th>
                    <th className="border border-slate-300 px-2 py-1.5">비고</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td className="border border-slate-200 px-2 py-1">{l.date}</td>
                      <td className="border border-slate-200 px-2 py-1">{l.driver}</td>
                      <td className="border border-slate-200 px-2 py-1">{l.vehicle_name}</td>
                      <td className="border border-slate-200 px-2 py-1">{l.purpose || ""}</td>
                      <td className="border border-slate-200 px-2 py-1">{l.from_location || ""}</td>
                      <td className="border border-slate-200 px-2 py-1">{l.to_location || ""}</td>
                      <td className="border border-slate-200 px-2 py-1 text-right">{l.departure_km ? fmt(l.departure_km) : ""}</td>
                      <td className="border border-slate-200 px-2 py-1 text-right">{l.arrival_km ? fmt(l.arrival_km) : ""}</td>
                      <td className="border border-slate-200 px-2 py-1 text-right font-semibold">{l.distance ? fmt(l.distance) : ""}</td>
                      <td className="border border-slate-200 px-2 py-1 text-right">{l.fuel_amount ? fmt(l.fuel_amount) : ""}</td>
                      <td className="border border-slate-200 px-2 py-1 text-right">{l.fuel_cost ? fmt(l.fuel_cost) : ""}</td>
                      <td className="border border-slate-200 px-2 py-1">{l.memo || ""}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 font-semibold">
                    <td className="border border-slate-300 px-2 py-1.5" colSpan={8}>합계</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-right">{fmt(monthlySummary.totalDistance)}km</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-right">{fmt(monthlySummary.totalFuelAmount)}L</td>
                    <td className="border border-slate-300 px-2 py-1.5 text-right">{fmt(monthlySummary.totalFuelCost)}원</td>
                    <td className="border border-slate-300 px-2 py-1.5"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div className="flex gap-2 px-6 pb-6">
              <button className={B} onClick={() => {
                const style = document.createElement("style");
                style.textContent = `@media print { body > * { display: none !important; } #vehicle-log-print { display: block !important; position: fixed; inset: 0; z-index: 9999; background: white; overflow: visible; } }`;
                document.head.appendChild(style);
                window.print();
                setTimeout(() => style.remove(), 500);
              }}>인쇄</button>
              <button className={B2} onClick={() => setShowPrint(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

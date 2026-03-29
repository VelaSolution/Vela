"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { fmt } from "@/lib/vela";
import type { User } from "@supabase/supabase-js";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

type HistoryRow = {
  id: string; label: string; created_at: string;
  result: { totalSales: number; profit: number; netProfit: number; netMargin: number };
  form: { industry: string };
};
type Snapshot = { month: string; monthly_sales: number; profit: number; };

const INDUSTRY_OPTIONS = [
  { id: "cafe", label: "☕ 카페" }, { id: "restaurant", label: "🍽️ 음식점" },
  { id: "bar", label: "🍺 술집/바" }, { id: "finedining", label: "✨ 파인다이닝" },
  { id: "gogi", label: "🥩 고깃집" },
];
const INDUSTRY_ICON: Record<string, string> = {
  cafe: "☕", restaurant: "🍽️", bar: "🍺", finedining: "✨", gogi: "🥩",
};
const PLAN_INFO: Record<string, { label: string; color: string; bg: string }> = {
  free:     { label: "무료",      color: "#6B7684", bg: "#F2F4F6" },
  standard: { label: "스탠다드", color: "#3182F6", bg: "#EBF3FF" },
  pro:      { label: "프로",      color: "#7C3AED", bg: "#F5F3FF" },
};

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview"|"history"|"settings">("overview");
  const [storeInfo, setStoreInfo] = useState({ store_name: "", industry: "restaurant", seats: 0, address: "" });
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeSaved, setStoreSaved] = useState(false);
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login?next=/profile"); return; }
      setUser(user);
      const { data: hist } = await supabase.from("simulation_history")
        .select("id, label, created_at, result, form").eq("user_id", user.id)
        .order("created_at", { ascending: false }).limit(20);
      setHistory(hist ?? []);
      const { data: snaps } = await supabase.from("monthly_snapshots")
        .select("month, monthly_sales, profit").eq("user_id", user.id)
        .order("month", { ascending: true }).limit(6);
      setSnapshots(snaps ?? []);
      const meta = user.user_metadata;
      setStoreInfo({ store_name: meta?.store_name ?? "", industry: meta?.industry ?? "restaurant", seats: meta?.seats ?? 0, address: meta?.address ?? "" });
      setLoading(false);
    }
    load();
  }, []);

  async function deleteHistory(id: string) {
    await supabase.from("simulation_history").delete().eq("id", id);
    setHistory(prev => prev.filter(h => h.id !== id));
  }

  async function saveStoreInfo() {
    if (!user) return;
    setStoreSaving(true);
    await supabase.auth.updateUser({ data: { ...user.user_metadata, ...storeInfo } });
    setStoreSaving(false); setStoreSaved(true);
    setTimeout(() => setStoreSaved(false), 2000);
  }

  async function changePassword() {
    if (pwNew !== pwConfirm) { setPwMsg("새 비밀번호가 일치하지 않아요."); return; }
    if (pwNew.length < 8) { setPwMsg("8자 이상 입력해주세요."); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: pwNew });
    setPwLoading(false);
    if (error) { setPwMsg(error.message); return; }
    setPwMsg("✅ 비밀번호가 변경되었습니다.");
    setPwNew(""); setPwConfirm("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "삭제") return;
    await supabase.auth.signOut();
    router.push("/");
  }

  const fmtM = (v: number) => Math.abs(v) >= 10_000 ? (v / 10_000).toFixed(0) + "만" : String(v);
  const plan = user?.user_metadata?.plan ?? "free";
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.free;
  const avgProfit = history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.result?.netProfit ?? 0), 0) / history.length) : 0;
  const chartData = snapshots.map(s => ({ month: s.month.slice(5) + "월", 매출: s.monthly_sales, 순이익: s.profit }));

  if (loading) return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
    </main>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@400;500;600;700;800&display=swap');body{font-family:'Pretendard',-apple-system,sans-serif}`}</style>
      <NavBar />
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6 mt-6 mb-4">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
                  {user?.user_metadata?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase() ?? "U"}
                </div>
                <span className="absolute -bottom-1 -right-1 text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: planInfo.bg, color: planInfo.color }}>
                  {planInfo.label}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-extrabold text-slate-900">{user?.user_metadata?.full_name ?? "사용자"}</h1>
                <p className="text-sm text-slate-400 mt-0.5">{user?.email ?? user?.phone}</p>
                {storeInfo.store_name && (
                  <p className="text-sm text-slate-500 mt-1">
                    {INDUSTRY_ICON[storeInfo.industry]} {storeInfo.store_name}{storeInfo.seats > 0 && ` · ${storeInfo.seats}석`}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Link href="/simulator" className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white text-center hover:bg-slate-700 transition">시뮬레이터 →</Link>
                <Link href="/dashboard" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 text-center hover:bg-slate-50 transition">대시보드</Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-slate-100">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-slate-900">{history.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">시뮬레이션</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-extrabold text-slate-900">{snapshots.length}</p>
                <p className="text-xs text-slate-400 mt-0.5">월별 기록</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-extrabold ${avgProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmtM(avgProfit)}원</p>
                <p className="text-xs text-slate-400 mt-0.5">평균 순이익</p>
              </div>
            </div>
          </div>

          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1 mb-4">
            {([{ id: "overview", label: "📊 개요" }, { id: "history", label: "📋 히스토리" }, { id: "settings", label: "⚙️ 설정" }] as const).map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${activeTab === tab.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">🏪 매장 정보</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">매장명</label>
                    <input type="text" value={storeInfo.store_name} onChange={e => setStoreInfo(p => ({ ...p, store_name: e.target.value }))} placeholder="예) 카페 베이글"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">업종</label>
                    <div className="flex gap-2 flex-wrap">
                      {INDUSTRY_OPTIONS.map(opt => (
                        <button key={opt.id} onClick={() => setStoreInfo(p => ({ ...p, industry: opt.id }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${storeInfo.industry === opt.id ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">좌석 수</label>
                      <div className="relative">
                        <input type="number" value={storeInfo.seats || ""} onChange={e => setStoreInfo(p => ({ ...p, seats: Number(e.target.value) }))} placeholder="20"
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-right pr-8 outline-none focus:border-slate-400 focus:bg-white transition" />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">석</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">주소</label>
                      <input type="text" value={storeInfo.address} onChange={e => setStoreInfo(p => ({ ...p, address: e.target.value }))} placeholder="예) 서울 마포구"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition" />
                    </div>
                  </div>
                  <button onClick={saveStoreInfo} disabled={storeSaving}
                    className={`w-full rounded-2xl py-3 text-sm font-bold transition ${storeSaved ? "bg-emerald-500 text-white" : "bg-slate-900 text-white hover:bg-slate-700"}`}>
                    {storeSaving ? "저장 중..." : storeSaved ? "✅ 저장 완료!" : "저장하기"}
                  </button>
                </div>
              </div>

              {snapshots.length > 0 && (
                <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-900">📈 최근 매출 추이</h2>
                    <Link href="/dashboard" className="text-xs font-semibold text-blue-500 hover:text-blue-700">전체 보기 →</Link>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={chartData}>
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={fmtM} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v) => `${fmt(Number(v ?? 0))}원`} />
                      <Line type="monotone" dataKey="매출" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 4, fill: "#0f172a" }} />
                      <Line type="monotone" dataKey="순이익" stroke="#059669" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3, fill: "#059669" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">💳 구독 플랜</h2>
                <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: planInfo.bg }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: planInfo.color }}>현재 플랜</p>
                    <p className="text-xl font-extrabold mt-0.5" style={{ color: planInfo.color }}>{planInfo.label}</p>
                  </div>
                  {plan === "free" && (
                    <Link href="/pricing" className="rounded-xl bg-blue-500 text-white px-4 py-2 text-xs font-bold hover:bg-blue-600 transition">업그레이드 →</Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">시뮬레이션 히스토리</h2>
                  <p className="text-xs text-slate-400 mt-0.5">총 {history.length}개</p>
                </div>
                <Link href="/monthly-input" className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white hover:bg-slate-700 transition">+ 이번 달 입력</Link>
              </div>
              {history.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-4xl mb-3">📊</p>
                  <p className="text-slate-500 text-sm mb-4">아직 저장된 시뮬레이션이 없어요.</p>
                  <Link href="/simulator" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white inline-block">시뮬레이터 시작</Link>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {history.map(h => (
                    <li key={h.id} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition">
                      <span className="text-2xl">{INDUSTRY_ICON[h.form?.industry] ?? "📊"}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 text-sm">{h.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{new Date(h.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}</p>
                        <div className="flex gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-slate-500">매출 <b>{fmt(h.result.totalSales)}원</b></span>
                          <span className={`text-xs font-semibold ${h.result.netProfit >= 0 ? "text-emerald-600" : "text-red-500"}`}>실수령 {fmt(h.result.netProfit)}원</span>
                          <span className="text-xs text-slate-400">{h.result.netMargin.toFixed(1)}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/result?historyId=${h.id}`} className="rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">보기</Link>
                        <button onClick={() => deleteHistory(h.id)} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200">삭제</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-4">
              {user?.app_metadata?.provider === "email" && (
                <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
                  <h2 className="font-bold text-slate-900 mb-4">🔒 비밀번호 변경</h2>
                  <div className="space-y-3">
                    {[{ label: "새 비밀번호", value: pwNew, setter: setPwNew, placeholder: "8자 이상" }, { label: "새 비밀번호 확인", value: pwConfirm, setter: setPwConfirm, placeholder: "다시 입력" }].map(({ label, value, setter, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</label>
                        <input type="password" value={value} onChange={e => setter(e.target.value)} placeholder={placeholder}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white transition" />
                      </div>
                    ))}
                    {pwMsg && <p className={`text-xs px-4 py-2.5 rounded-xl ${pwMsg.startsWith("✅") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{pwMsg}</p>}
                    <button onClick={changePassword} disabled={pwLoading}
                      className="w-full rounded-2xl bg-slate-900 py-3 text-sm font-bold text-white hover:bg-slate-700 transition disabled:opacity-50">
                      {pwLoading ? "변경 중..." : "비밀번호 변경"}
                    </button>
                  </div>
                </div>
              )}

              <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-6">
                <h2 className="font-bold text-slate-900 mb-4">👤 계정 관리</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">로그아웃</p>
                      <p className="text-xs text-slate-400 mt-0.5">현재 기기에서 로그아웃합니다</p>
                    </div>
                    <button onClick={handleLogout} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white transition">로그아웃</button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50">
                    <div>
                      <p className="text-sm font-semibold text-red-700">회원 탈퇴</p>
                      <p className="text-xs text-red-400 mt-0.5">모든 데이터가 삭제되며 복구할 수 없어요</p>
                    </div>
                    <button onClick={() => setShowDeleteModal(true)} className="rounded-xl bg-red-500 text-white px-4 py-2 text-sm font-semibold hover:bg-red-600 transition">탈퇴</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full">
            <p className="text-2xl mb-3">⚠️</p>
            <h3 className="text-lg font-extrabold text-slate-900 mb-2">정말 탈퇴하시겠어요?</h3>
            <p className="text-sm text-slate-500 mb-5">모든 데이터가 삭제되며 복구할 수 없습니다.</p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">확인을 위해 <b className="text-red-500">삭제</b> 를 입력하세요</label>
              <input type="text" value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="삭제"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-red-400" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }} className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">취소</button>
              <button onClick={handleDeleteAccount} disabled={deleteConfirm !== "삭제"} className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-40">탈퇴하기</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

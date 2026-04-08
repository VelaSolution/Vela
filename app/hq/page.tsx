"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type Tab = "dashboard" | "mett" | "kpi" | "goal" | "task" | "aar" | "roadmap";

type Mett = { id: string; mission: string; enemy: string; terrain: string; troops: string; time_constraint: string; civil: string; created_at: string };
type Metric = { id: string; date: string; revenue: number; users_count: number; conversion_rate: number; profit: number };
type Goal = { id: string; title: string; target_value: number; current_value: number; metric_type: string; start_date: string; end_date: string; status: string };
type Task = { id: string; goal_id: string | null; title: string; assignee: string; deadline: string; status: string; result: string };
type AAR = { id: string; date: string; goal: string; result: string; gap_reason: string; improvement: string };

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "dashboard", label: "대시보드", icon: "📋" },
  { key: "mett", label: "METT-TC", icon: "🎯" },
  { key: "kpi", label: "KPI", icon: "📊" },
  { key: "goal", label: "목표", icon: "🏆" },
  { key: "task", label: "태스크", icon: "✅" },
  { key: "aar", label: "AAR", icon: "📝" },
  { key: "roadmap", label: "로드맵", icon: "🗺️" },
];

const fmt = (n: number) => n.toLocaleString("ko-KR");
const STATUS_COLOR: Record<string, string> = {
  active: "bg-blue-50 text-blue-700", completed: "bg-emerald-50 text-emerald-700", failed: "bg-red-50 text-red-700",
  pending: "bg-slate-100 text-slate-600", in_progress: "bg-amber-50 text-amber-700",
};
const STATUS_LABEL: Record<string, string> = {
  active: "진행중", completed: "완료", failed: "실패", pending: "대기", in_progress: "진행중",
};

export default function HQPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Data
  const [metts, setMetts] = useState<Mett[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [aars, setAars] = useState<AAR[]>([]);

  // Forms
  const [mettForm, setMettForm] = useState({ mission: "", enemy: "", terrain: "", troops: "", time_constraint: "", civil: "" });
  const [metricForm, setMetricForm] = useState({ date: new Date().toISOString().slice(0, 10), revenue: "", users_count: "", conversion_rate: "", profit: "" });
  const [goalForm, setGoalForm] = useState({ title: "", target_value: "", metric_type: "revenue", start_date: new Date().toISOString().slice(0, 10), end_date: "" });
  const [taskForm, setTaskForm] = useState({ title: "", assignee: "", deadline: "", goal_id: "" });
  const [aarForm, setAarForm] = useState({ date: new Date().toISOString().slice(0, 10), goal: "", result: "", gap_reason: "", improvement: "" });

  const getSb = () => { try { return createSupabaseBrowserClient(); } catch { return null; } };

  useEffect(() => {
    const sb = getSb();
    if (!sb) { setLoading(false); return; }
    (async () => {
      const { data: { user } } = await sb.auth.getUser();
      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // 권한 확인 — admin 이메일 체크
      const { data: profile } = await sb.from("profiles").select("email, plan").eq("id", user.id).single();
      const adminEmails = ["mnhyuk@velaanalytics.com", "mnhyuk0213@gmail.com"];
      if (adminEmails.includes(user.email ?? "") || adminEmails.includes(profile?.email ?? "")) {
        setAuthorized(true);
      }

      // 데이터 로드
      const [m, met, g, t, a] = await Promise.all([
        sb.from("hq_mett").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        sb.from("hq_metrics").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(30),
        sb.from("hq_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
        sb.from("hq_tasks").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
        sb.from("hq_aar").select("*").eq("user_id", user.id).order("date", { ascending: false }).limit(10),
      ]);
      setMetts((m.data ?? []) as Mett[]);
      setMetrics((met.data ?? []) as Metric[]);
      setGoals((g.data ?? []) as Goal[]);
      setTasks((t.data ?? []) as Task[]);
      setAars((a.data ?? []) as AAR[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin" /></div>;
  if (!authorized) return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        <p className="text-sm text-slate-500 mb-4">HQ는 관리자 전용 페이지입니다.</p>
        <Link href="/" className="rounded-xl bg-slate-900 text-white font-semibold px-5 py-2.5 text-sm">홈으로</Link>
      </div>
    </main>
  );

  const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-blue-400 focus:bg-white outline-none transition";
  const cardCls = "bg-white ring-1 ring-slate-200 rounded-3xl p-5 mb-4";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1";
  const btnCls = "rounded-xl bg-slate-900 text-white font-semibold px-5 py-2.5 text-sm hover:bg-slate-800 transition";

  const saveMett = async () => {
    const sb = getSb(); if (!sb || !userId || !mettForm.mission.trim()) return;
    const { data } = await sb.from("hq_mett").insert({ user_id: userId, ...mettForm }).select().single();
    if (data) setMetts([data as Mett, ...metts]);
    setMettForm({ mission: "", enemy: "", terrain: "", troops: "", time_constraint: "", civil: "" });
  };

  const saveMetric = async () => {
    const sb = getSb(); if (!sb || !userId) return;
    const payload = { user_id: userId, date: metricForm.date, revenue: Number(metricForm.revenue) || 0, users_count: Number(metricForm.users_count) || 0, conversion_rate: Number(metricForm.conversion_rate) || 0, profit: Number(metricForm.profit) || 0 };
    const { data } = await sb.from("hq_metrics").upsert(payload, { onConflict: "user_id,date" }).select().single();
    if (data) { setMetrics([data as Metric, ...metrics.filter(m => m.date !== metricForm.date)]); }
    setMetricForm({ date: new Date().toISOString().slice(0, 10), revenue: "", users_count: "", conversion_rate: "", profit: "" });
  };

  const saveGoal = async () => {
    const sb = getSb(); if (!sb || !userId || !goalForm.title.trim()) return;
    if (goals.filter(g => g.status === "active").length >= 2) { alert("활성 목표는 최대 2개까지 가능합니다."); return; }
    const { data } = await sb.from("hq_goals").insert({ user_id: userId, ...goalForm, target_value: Number(goalForm.target_value) || 0 }).select().single();
    if (data) setGoals([data as Goal, ...goals]);
    setGoalForm({ title: "", target_value: "", metric_type: "revenue", start_date: new Date().toISOString().slice(0, 10), end_date: "" });
  };

  const saveTask = async () => {
    const sb = getSb(); if (!sb || !userId || !taskForm.title.trim()) return;
    const { data } = await sb.from("hq_tasks").insert({ user_id: userId, ...taskForm, goal_id: taskForm.goal_id || null }).select().single();
    if (data) setTasks([data as Task, ...tasks]);
    setTaskForm({ title: "", assignee: "", deadline: "", goal_id: "" });
  };

  const updateTaskStatus = async (id: string, status: string) => {
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_tasks").update({ status }).eq("id", id);
    setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
  };

  const saveAAR = async () => {
    const sb = getSb(); if (!sb || !userId || !aarForm.goal.trim()) return;
    const { data } = await sb.from("hq_aar").insert({ user_id: userId, ...aarForm }).select().single();
    if (data) setAars([data as AAR, ...aars]);
    setAarForm({ date: new Date().toISOString().slice(0, 10), goal: "", result: "", gap_reason: "", improvement: "" });
  };

  const updateGoalStatus = async (id: string, status: string) => {
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_goals").update({ status }).eq("id", id);
    setGoals(goals.map(g => g.id === id ? { ...g, status } : g));
  };

  // 삭제 함수들
  const deleteMett = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_mett").delete().eq("id", id);
    setMetts(metts.filter(m => m.id !== id));
  };
  const deleteMetric = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_metrics").delete().eq("id", id);
    setMetrics(metrics.filter(m => m.id !== id));
  };
  const deleteGoal = async (id: string) => {
    if (!confirm("목표를 삭제할까요?")) return;
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_goals").delete().eq("id", id);
    setGoals(goals.filter(g => g.id !== id));
  };
  const deleteTask = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_tasks").delete().eq("id", id);
    setTasks(tasks.filter(t => t.id !== id));
  };
  const deleteAAR = async (id: string) => {
    if (!confirm("삭제할까요?")) return;
    const sb = getSb(); if (!sb) return;
    await sb.from("hq_aar").delete().eq("id", id);
    setAars(aars.filter(a => a.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
              🏛️ VELA HQ
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">운영 시스템</h1>
            <p className="text-xs text-slate-400 mt-0.5">METT-TC → KPI → Goal → Task → AAR</p>
          </div>
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-slate-600">대시보드 →</Link>
        </div>

        {/* 탭 */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition ${tab === t.key ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === "dashboard" && (() => {
          const activeGoals = goals.filter(g => g.status === "active");
          const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in_progress");
          const completedTasks = tasks.filter(t => t.status === "completed");
          const latestMett = metts[0];
          const latestMetric = metrics[0];
          const prevMetric = metrics[1];
          const recentAar = aars[0];

          const delta = (curr: number, prev: number) => {
            if (!prev) return "";
            const pct = Math.round((curr - prev) / Math.abs(prev || 1) * 100);
            return pct >= 0 ? `+${pct}%` : `${pct}%`;
          };

          return (
            <>
              {/* KPI 요약 카드 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "매출", value: latestMetric ? fmt(latestMetric.revenue) + "원" : "—", change: prevMetric ? delta(latestMetric?.revenue ?? 0, prevMetric.revenue) : "", color: "text-slate-900" },
                  { label: "사용자", value: latestMetric ? fmt(latestMetric.users_count) + "명" : "—", change: prevMetric ? delta(latestMetric?.users_count ?? 0, prevMetric.users_count) : "", color: "text-blue-600" },
                  { label: "전환율", value: latestMetric ? latestMetric.conversion_rate + "%" : "—", change: prevMetric ? delta(latestMetric?.conversion_rate ?? 0, prevMetric.conversion_rate) : "", color: "text-purple-600" },
                  { label: "순이익", value: latestMetric ? fmt(latestMetric.profit) + "원" : "—", change: prevMetric ? delta(latestMetric?.profit ?? 0, prevMetric.profit) : "", color: (latestMetric?.profit ?? 0) >= 0 ? "text-emerald-600" : "text-red-500" },
                ].map(s => (
                  <div key={s.label} className={cardCls}>
                    <p className="text-[11px] text-slate-400 mb-0.5">{s.label}</p>
                    <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                    {s.change && <p className={`text-[11px] font-semibold mt-0.5 ${s.change.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}>{s.change} vs 이전</p>}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* 현재 미션 */}
                <div className={cardCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">🎯 현재 미션</h3>
                    <button onClick={() => setTab("mett")} className="text-[11px] text-blue-600 font-semibold">수정 →</button>
                  </div>
                  {latestMett ? (
                    <div className="space-y-1.5 text-xs">
                      <p className="text-sm font-bold text-slate-900 mb-2">{latestMett.mission}</p>
                      {latestMett.enemy && <p><span className="text-slate-400">문제:</span> {latestMett.enemy}</p>}
                      {latestMett.troops && <p><span className="text-slate-400">자원:</span> {latestMett.troops}</p>}
                      {latestMett.time_constraint && <p><span className="text-slate-400">일정:</span> {latestMett.time_constraint}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">METT-TC를 작성하세요</p>
                  )}
                </div>

                {/* 활성 목표 */}
                <div className={cardCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">🏆 활성 목표 ({activeGoals.length}/2)</h3>
                    <button onClick={() => setTab("goal")} className="text-[11px] text-blue-600 font-semibold">관리 →</button>
                  </div>
                  {activeGoals.length === 0 ? (
                    <p className="text-xs text-slate-400">목표를 설정하세요</p>
                  ) : (
                    <div className="space-y-3">
                      {activeGoals.map(g => {
                        const pct = g.target_value > 0 ? Math.round(g.current_value / g.target_value * 100) : 0;
                        return (
                          <div key={g.id}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-semibold text-slate-700">{g.title}</span>
                              <span className="text-slate-400">{pct}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full">
                              <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 진행 중 태스크 */}
                <div className={cardCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">✅ 태스크 ({completedTasks.length}/{tasks.length})</h3>
                    <button onClick={() => setTab("task")} className="text-[11px] text-blue-600 font-semibold">관리 →</button>
                  </div>
                  {pendingTasks.length === 0 ? (
                    <p className="text-xs text-emerald-600 font-semibold">모든 태스크 완료!</p>
                  ) : (
                    <div className="space-y-1.5">
                      {pendingTasks.slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === "in_progress" ? "bg-amber-400" : "bg-slate-300"}`} />
                          <span className="text-slate-700 truncate flex-1">{t.title}</span>
                          {t.deadline && <span className="text-slate-400 flex-shrink-0">{t.deadline.slice(5)}</span>}
                        </div>
                      ))}
                      {pendingTasks.length > 5 && <p className="text-[11px] text-slate-400">+{pendingTasks.length - 5}개 더</p>}
                    </div>
                  )}
                </div>

                {/* 최근 AAR */}
                <div className={cardCls}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900">📝 최근 AAR</h3>
                    <button onClick={() => setTab("aar")} className="text-[11px] text-blue-600 font-semibold">작성 →</button>
                  </div>
                  {recentAar ? (
                    <div className="text-xs space-y-1">
                      <p className="text-[11px] text-slate-400">{recentAar.date}</p>
                      <p><b>목표:</b> {recentAar.goal}</p>
                      <p><b>결과:</b> {recentAar.result}</p>
                      {recentAar.improvement && <p className="text-blue-600"><b>개선:</b> {recentAar.improvement}</p>}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">AAR을 작성하세요</p>
                  )}
                </div>
              </div>

              {/* 핵심 리스크 */}
              <div className={`${cardCls} mt-4`}>
                <h3 className="text-sm font-bold text-slate-900 mb-3">⚠️ 핵심 리스크</h3>
                <div className="space-y-2 text-xs">
                  {[
                    "결제 이탈 — 가격 페이지 → 결제 전환율 모니터링",
                    "온보딩 실패 — 첫 분석 완료율이 목표 이하",
                    "기능 과다 — 도구가 많아 사용자 혼란 가능",
                    "CS 미대응 — 피드백/버그 리포트 처리 지연",
                  ].map((r, i) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 bg-red-50 rounded-xl">
                      <span className="text-red-400 flex-shrink-0">●</span>
                      <span className="text-red-700">{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 운영 리듬 (Cadence) */}
              <div className={`${cardCls} mt-4`}>
                <h3 className="text-sm font-bold text-slate-900 mb-3">📅 운영 리듬 (Cadence)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="font-bold text-blue-700 mb-2">🌅 일일</p>
                    <p className="text-blue-600">1. METT-TC 상황 판단</p>
                    <p className="text-blue-600">2. KPI 확인 (핵심 3개)</p>
                    <p className="text-blue-600">3. 오늘의 Task 실행</p>
                    <p className="text-blue-600">4. AAR 작성 (3줄)</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-3">
                    <p className="font-bold text-purple-700 mb-2">📆 주간</p>
                    <p className="text-purple-600">월: 주간 목표 설정</p>
                    <p className="text-purple-600">수: 중간 점검</p>
                    <p className="text-purple-600">금: AAR + 전략 수정</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="font-bold text-emerald-700 mb-2">📊 월간</p>
                    <p className="text-emerald-600">KPI 전월 대비 분석</p>
                    <p className="text-emerald-600">목표 달성률 리뷰</p>
                    <p className="text-emerald-600">다음 달 전략 수립</p>
                  </div>
                </div>
              </div>

              {/* 업무 지시 템플릿 */}
              <div className={`${cardCls} mt-4`}>
                <h3 className="text-sm font-bold text-slate-900 mb-2">📋 업무 지시 템플릿</h3>
                <p className="text-[11px] text-slate-400 mb-3">모든 업무 지시는 이 형식으로 통일</p>
                <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-1 font-mono">
                  <p><b>목표:</b> [무엇을 달성하려는가]</p>
                  <p><b>담당:</b> [누가]</p>
                  <p><b>마감:</b> [언제까지]</p>
                  <p><b>산출물:</b> [무엇을 만들어야 하는가]</p>
                  <p><b>제약:</b> [제한 조건]</p>
                  <p><b>보고:</b> [어떻게 보고하는가]</p>
                </div>
              </div>
            </>
          );
        })()}

        {/* METT-TC */}
        {tab === "mett" && (
          <>
            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">🎯 상황 판단 (METT-TC)</h3>
              <div className="space-y-3">
                {([["mission", "M — Mission (목표)"], ["enemy", "E — Enemy (문제/경쟁)"], ["terrain", "T — Terrain (시장/환경)"], ["troops", "T — Troops (자원)"], ["time_constraint", "T — Time (일정)"], ["civil", "C — Civil (고객 반응)"]] as const).map(([k, label]) => (
                  <div key={k}>
                    <label className={labelCls}>{label}</label>
                    <input className={inputCls} value={mettForm[k]} onChange={e => setMettForm({ ...mettForm, [k]: e.target.value })} placeholder={label} />
                  </div>
                ))}
                <button onClick={saveMett} className={btnCls}>저장</button>
              </div>
            </div>
            {metts.map(m => (
              <div key={m.id} className={cardCls}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] text-slate-400">{new Date(m.created_at).toLocaleDateString("ko-KR")}</p>
                  <button onClick={() => deleteMett(m.id)} className="text-[11px] text-red-400 hover:text-red-600">삭제</button>
                </div>
                <div className="space-y-1 text-xs">
                  {([["M", m.mission], ["E", m.enemy], ["T", m.terrain], ["T", m.troops], ["T", m.time_constraint], ["C", m.civil]] as const).map(([k, v], i) => v && (
                    <p key={i}><b className="text-slate-700">{k}:</b> <span className="text-slate-600">{v}</span></p>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}

        {/* KPI */}
        {tab === "kpi" && (
          <>
            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">📊 KPI 입력</h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><label className={labelCls}>날짜</label><input type="date" className={inputCls} value={metricForm.date} onChange={e => setMetricForm({ ...metricForm, date: e.target.value })} /></div>
                <div><label className={labelCls}>매출 (원)</label><input className={inputCls} inputMode="numeric" value={metricForm.revenue} onChange={e => setMetricForm({ ...metricForm, revenue: e.target.value })} /></div>
                <div><label className={labelCls}>사용자 수</label><input className={inputCls} inputMode="numeric" value={metricForm.users_count} onChange={e => setMetricForm({ ...metricForm, users_count: e.target.value })} /></div>
                <div><label className={labelCls}>전환율 (%)</label><input className={inputCls} inputMode="decimal" value={metricForm.conversion_rate} onChange={e => setMetricForm({ ...metricForm, conversion_rate: e.target.value })} /></div>
                <div><label className={labelCls}>순이익 (원)</label><input className={inputCls} inputMode="numeric" value={metricForm.profit} onChange={e => setMetricForm({ ...metricForm, profit: e.target.value })} /></div>
              </div>
              <button onClick={saveMetric} className={btnCls}>저장</button>
            </div>
            {metrics.length > 0 && (
              <div className={cardCls}>
                <h3 className="text-sm font-bold text-slate-900 mb-3">📈 최근 KPI</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead><tr className="text-slate-400 border-b border-slate-100"><th className="py-2 text-left">날짜</th><th className="py-2 text-right">매출</th><th className="py-2 text-right">사용자</th><th className="py-2 text-right">전환율</th><th className="py-2 text-right">순이익</th><th className="py-2 w-8"></th></tr></thead>
                    <tbody>{metrics.slice(0, 10).map(m => (
                      <tr key={m.id} className="border-b border-slate-50">
                        <td className="py-1.5 text-slate-700">{m.date}</td>
                        <td className="py-1.5 text-right font-semibold">{fmt(m.revenue)}</td>
                        <td className="py-1.5 text-right">{m.users_count}</td>
                        <td className="py-1.5 text-right">{m.conversion_rate}%</td>
                        <td className={`py-1.5 text-right font-semibold ${m.profit >= 0 ? "text-emerald-600" : "text-red-500"}`}>{fmt(m.profit)}</td>
                        <td className="py-1.5 text-right"><button onClick={() => deleteMetric(m.id)} className="text-[10px] text-red-400 hover:text-red-600">✕</button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Goal */}
        {tab === "goal" && (
          <>
            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-1">🏆 목표 설정</h3>
              <p className="text-[11px] text-slate-400 mb-3">활성 목표는 최대 2개. 집중하세요.</p>
              <div className="space-y-3">
                <div><label className={labelCls}>목표</label><input className={inputCls} value={goalForm.title} onChange={e => setGoalForm({ ...goalForm, title: e.target.value })} placeholder="예: 전환율 5% → 8%" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>목표 수치</label><input className={inputCls} value={goalForm.target_value} onChange={e => setGoalForm({ ...goalForm, target_value: e.target.value })} placeholder="8" /></div>
                  <div><label className={labelCls}>지표</label>
                    <select className={inputCls} value={goalForm.metric_type} onChange={e => setGoalForm({ ...goalForm, metric_type: e.target.value })}>
                      <option value="revenue">매출</option><option value="users">사용자수</option><option value="conversion">전환율</option><option value="profit">순이익</option><option value="custom">기타</option>
                    </select>
                  </div>
                  <div><label className={labelCls}>시작일</label><input type="date" className={inputCls} value={goalForm.start_date} onChange={e => setGoalForm({ ...goalForm, start_date: e.target.value })} /></div>
                  <div><label className={labelCls}>마감일</label><input type="date" className={inputCls} value={goalForm.end_date} onChange={e => setGoalForm({ ...goalForm, end_date: e.target.value })} /></div>
                </div>
                <button onClick={saveGoal} disabled={goals.filter(g => g.status === "active").length >= 2} className={`${btnCls} disabled:opacity-40`}>목표 추가</button>
              </div>
            </div>
            {goals.map(g => (
              <div key={g.id} className={cardCls}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-900">{g.title}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_COLOR[g.status]}`}>{STATUS_LABEL[g.status]}</span>
                </div>
                <div className="flex gap-4 text-xs text-slate-500 mb-2">
                  <span>목표: {g.target_value}</span><span>현재: {g.current_value}</span><span>{g.start_date} ~ {g.end_date}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full mb-2">
                  <div className={`h-full rounded-full ${g.status === "completed" ? "bg-emerald-500" : "bg-blue-500"}`} style={{ width: `${Math.min(g.target_value > 0 ? g.current_value / g.target_value * 100 : 0, 100)}%` }} />
                </div>
                <div className="flex gap-2">
                  {g.status === "active" && <>
                    <button onClick={() => updateGoalStatus(g.id, "completed")} className="text-[11px] text-emerald-600 font-semibold">완료</button>
                    <button onClick={() => updateGoalStatus(g.id, "failed")} className="text-[11px] text-red-500 font-semibold">실패</button>
                  </>}
                  <button onClick={() => deleteGoal(g.id)} className="text-[11px] text-red-400 hover:text-red-600 ml-auto">삭제</button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* Task */}
        {tab === "task" && (
          <>
            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">✅ 태스크 추가</h3>
              <div className="space-y-3">
                <div><label className={labelCls}>할 일</label><input className={inputCls} value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="구체적인 실행 항목" /></div>
                <div className="grid grid-cols-3 gap-3">
                  <div><label className={labelCls}>담당자</label><input className={inputCls} value={taskForm.assignee} onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })} /></div>
                  <div><label className={labelCls}>마감일</label><input type="date" className={inputCls} value={taskForm.deadline} onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })} /></div>
                  <div><label className={labelCls}>연결 목표</label>
                    <select className={inputCls} value={taskForm.goal_id} onChange={e => setTaskForm({ ...taskForm, goal_id: e.target.value })}>
                      <option value="">없음</option>
                      {goals.filter(g => g.status === "active").map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={saveTask} className={btnCls}>추가</button>
              </div>
            </div>
            <div className="space-y-2">
              {tasks.map(t => (
                <div key={t.id} className={`${cardCls} flex items-center gap-3`}>
                  <button onClick={() => updateTaskStatus(t.id, t.status === "completed" ? "pending" : "completed")}
                    className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-xs ${t.status === "completed" ? "bg-emerald-500 text-white" : "ring-1 ring-slate-200"}`}>
                    {t.status === "completed" ? "✓" : ""}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${t.status === "completed" ? "text-slate-400 line-through" : "text-slate-900"}`}>{t.title}</p>
                    <div className="flex gap-2 text-[11px] text-slate-400 mt-0.5">
                      {t.assignee && <span>👤 {t.assignee}</span>}
                      {t.deadline && <span>📅 {t.deadline}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${STATUS_COLOR[t.status]}`}>{STATUS_LABEL[t.status]}</span>
                  <button onClick={() => deleteTask(t.id)} className="text-[10px] text-red-400 hover:text-red-600 flex-shrink-0 ml-1">✕</button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* AAR */}
        {tab === "aar" && (
          <>
            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-1">📝 AAR (After Action Review)</h3>
              <p className="text-[11px] text-slate-400 mb-3">목표 → 결과 → 차이 원인 → 개선안</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>날짜</label><input type="date" className={inputCls} value={aarForm.date} onChange={e => setAarForm({ ...aarForm, date: e.target.value })} /></div>
                  <div><label className={labelCls}>목표</label><input className={inputCls} value={aarForm.goal} onChange={e => setAarForm({ ...aarForm, goal: e.target.value })} placeholder="무엇을 달성하려 했나" /></div>
                </div>
                <div><label className={labelCls}>결과</label><input className={inputCls} value={aarForm.result} onChange={e => setAarForm({ ...aarForm, result: e.target.value })} placeholder="실제 결과는" /></div>
                <div><label className={labelCls}>차이 원인</label><textarea className={`${inputCls} h-16`} value={aarForm.gap_reason} onChange={e => setAarForm({ ...aarForm, gap_reason: e.target.value })} placeholder="왜 차이가 발생했는가" /></div>
                <div><label className={labelCls}>개선안</label><textarea className={`${inputCls} h-16`} value={aarForm.improvement} onChange={e => setAarForm({ ...aarForm, improvement: e.target.value })} placeholder="다음에는 어떻게 할 것인가" /></div>
                <button onClick={saveAAR} className={btnCls}>저장</button>
              </div>
            </div>
            {aars.map(a => (
              <div key={a.id} className={cardCls}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[11px] text-slate-400">{a.date}</p>
                  <button onClick={() => deleteAAR(a.id)} className="text-[11px] text-red-400 hover:text-red-600">삭제</button>
                </div>
                <div className="space-y-1.5 text-xs">
                  <p><b className="text-slate-700">목표:</b> {a.goal}</p>
                  <p><b className="text-slate-700">결과:</b> {a.result}</p>
                  {a.gap_reason && <p><b className="text-amber-600">차이 원인:</b> {a.gap_reason}</p>}
                  {a.improvement && <p><b className="text-blue-600">개선안:</b> {a.improvement}</p>}
                </div>
              </div>
            ))}
          </>
        )}

        {/* Roadmap */}
        {tab === "roadmap" && (
          <>
            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-1">🗺️ 실행 로드맵</h3>
              <p className="text-[11px] text-slate-400 mb-4">지휘통제 시스템 구축 7주 로드맵</p>
              <div className="space-y-3">
                {[
                  { week: "1주차", title: "내부 대시보드 구축", desc: "목표·KPI·실행카드·AAR 탭 구성", status: "completed" as const },
                  { week: "2주차", title: "브리핑 진입 흐름", desc: "홈페이지/앱에 '브리핑' 문구·흐름 반영", status: "in_progress" as const },
                  { week: "3~4주차", title: "대시보드 고도화", desc: "오늘의 임무·핵심 경고·실행 카드 블록", status: "pending" as const },
                  { week: "5~6주차", title: "도구 연결", desc: "기존 도구 결과 → 실행카드·AAR 자동 연결", status: "pending" as const },
                  { week: "7주차+", title: "HQ 고도화", desc: "팀 실행 카드 보드·사용자 피드백·버그 위젯", status: "pending" as const },
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${item.status === "completed" ? "bg-emerald-500 text-white" : item.status === "in_progress" ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-500"}`}>
                        {item.status === "completed" ? "✓" : i + 1}
                      </div>
                      {i < 4 && <div className={`w-0.5 h-8 ${item.status !== "pending" ? "bg-blue-300" : "bg-slate-200"}`} />}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400">{item.week}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${STATUS_COLOR[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardCls}>
              <h3 className="text-sm font-bold text-slate-900 mb-3">💡 핵심 결론</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <p>VELA의 다음 단계는 <b className="text-slate-900">더 많은 도구를 붙이는 것이 아니라</b>, 기존 도구를 지휘통제 시스템 안으로 편입시키는 것입니다.</p>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[["감각", "→", "구조"], ["즉흥", "→", "시스템"], ["실패", "→", "데이터 기반 개선"]].map(([from, arrow, to], i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-slate-400 text-[11px]">{from}</p>
                      <p className="text-lg">{arrow}</p>
                      <p className="font-bold text-slate-900 text-[11px]">{to}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

"use client";
import { useState, useEffect, useMemo } from "react";
import type { HQRole } from "@/app/hq/types";
import { sb, I, C, L, B, B2, BADGE, fmt, today, useTeamDisplayNames, notifyMany } from "@/app/hq/utils";

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

type Checkin = {
  id: string; user_name: string; date: string;
  today_plan: string; yesterday_done: string; blockers: string;
  created_at: string;
};

type SubTab = "today" | "history";

export default function CheckinTab({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();

  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [myCheckins, setMyCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(true);
  const [sub, setSub] = useState<SubTab>("today");

  // form
  const [todayPlan, setTodayPlan] = useState("");
  const [yesterdayDone, setYesterdayDone] = useState("");
  const [blockers, setBlockers] = useState("");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // history filter
  const [historyMonth, setHistoryMonth] = useState(today().slice(0, 7));

  const todayStr = today();

  async function load() {
    const s = sb(); if (!s) { setLoading(false); return; }
    const [r1, r2] = await Promise.all([
      s.from("hq_checkins").select("*").eq("date", todayStr).order("created_at", { ascending: false }),
      s.from("hq_checkins").select("*").eq("user_name", userName).order("date", { ascending: false }).limit(90),
    ]);
    if (r1.data) setCheckins(r1.data as Checkin[]);
    if (r2.data) setMyCheckins(r2.data as Checkin[]);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // 오늘 내 체크아웃
  const myToday = useMemo(() => checkins.find(c => c.user_name === userName), [checkins, userName]);
  const isDone = !!myToday;

  // 폼 초기화 (수정 시)
  useEffect(() => {
    if (myToday && !editId) {
      setTodayPlan(myToday.today_plan || "");
      setYesterdayDone(myToday.yesterday_done || "");
      setBlockers(myToday.blockers || "");
    }
  }, [myToday]);

  // 연속 체크아웃 계산
  const streak = useMemo(() => {
    if (myCheckins.length === 0) return 0;
    let count = 0;
    const sorted = [...myCheckins].sort((a, b) => b.date.localeCompare(a.date));
    let expected = todayStr;

    for (const c of sorted) {
      if (c.date === expected) {
        count++;
        // 이전 날짜 (주말 스킵 안 함, 단순 연속일 계산)
        const prev = new Date(expected);
        prev.setDate(prev.getDate() - 1);
        expected = prev.toISOString().slice(0, 10);
      } else if (c.date < expected) {
        break;
      }
    }
    return count;
  }, [myCheckins, todayStr]);

  async function submit() {
    if (!todayPlan.trim()) { flash("오늘 한 일을 정리해주세요"); return; }
    setSaving(true);
    const s = sb(); if (!s) { setSaving(false); return; }
    const payload = {
      user_name: userName, date: todayStr,
      today_plan: todayPlan.trim(), yesterday_done: yesterdayDone.trim(),
      blockers: blockers.trim(),
    };

    if (myToday) {
      // 수정
      await s.from("hq_checkins").update(payload).eq("id", myToday.id);
      flash("체크아웃이 수정되었습니다");
    } else {
      // 신규
      const { error } = await s.from("hq_checkins").insert(payload);
      if (error?.code === "23505") {
        flash("이미 오늘 체크아웃을 완료했습니다");
      } else {
        flash("체크아웃 완료!");
        // 체크아웃 알림 → 대표/이사
        const { data: mgrs } = await s.from("hq_team").select("name").in("hq_role", ["대표", "이사"]);
        if (mgrs) await notifyMany(mgrs.map((m: any) => m.name), "checkin", `${userName} 일일 체크아웃 완료`, userName);
      }
    }
    setSaving(false); setEditId(null);
    load();
  }

  const filteredHistory = useMemo(() => {
    return myCheckins.filter(c => c.date.startsWith(historyMonth));
  }, [myCheckins, historyMonth]);

  // 팀원별 오늘 체크아웃 여부
  const teamCheckinStatus = useMemo(() => {
    const done = new Set(checkins.map(c => c.user_name));
    return done;
  }, [checkins]);

  if (loading) return (
    <div className="text-center py-20">
      <div className="inline-block w-6 h-6 border-2 border-slate-200 border-t-[#3182F6] rounded-full animate-spin mb-3" />
      <p className="text-sm text-slate-400">불러오는 중...</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* 상태 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className={`${C} ${isDone ? "!bg-emerald-50 border border-emerald-200" : "!bg-amber-50 border border-amber-200"}`}>
          <p className="text-xs text-slate-400 mb-1">오늘 체크아웃</p>
          <p className={`text-lg font-bold ${isDone ? "text-emerald-600" : "text-amber-600"}`}>
            {isDone ? "완료" : "아직 안 했어요"}
          </p>
          {!isDone && <p className="text-xs text-amber-500 mt-1">퇴근 전에 하루를 정리해보세요</p>}
        </div>
        <div className={C}>
          <p className="text-xs text-slate-400 mb-1">연속 체크아웃</p>
          <p className="text-lg font-bold text-[#3182F6]">
            {streak}일 {streak >= 7 ? "연속" : streak >= 3 ? "연속" : ""}
          </p>
          {streak >= 5 && <p className="text-xs text-[#3182F6] mt-1">꾸준히 잘하고 있어요</p>}
        </div>
        <div className={C}>
          <p className="text-xs text-slate-400 mb-1">오늘 팀 체크아웃</p>
          <p className="text-lg font-bold text-slate-800">{checkins.length}명 완료</p>
        </div>
        <div className={C}>
          <p className="text-xs text-slate-400 mb-1">이번 달 체크아웃</p>
          <p className="text-lg font-bold text-slate-800">{myCheckins.filter(c => c.date.startsWith(todayStr.slice(0, 7))).length}일</p>
        </div>
      </div>

      {/* 서브 탭 */}
      <div className="flex gap-2">
        <button className={sub === "today" ? B : B2} onClick={() => setSub("today")}>오늘</button>
        <button className={sub === "history" ? B : B2} onClick={() => setSub("history")}>내 기록</button>
      </div>

      {/* ── 오늘 탭 ──────────────────────────── */}
      {sub === "today" && (
        <>
          {/* 체크아웃 폼 */}
          <div className={C}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">
                {isDone && !editId ? "오늘의 체크아웃" : "데일리 체크아웃"}
              </h3>
              {isDone && !editId && (
                <button className={B2} onClick={() => setEditId(myToday!.id)}>수정</button>
              )}
            </div>

            {(!isDone || editId) ? (
              <div className="space-y-4">
                <div>
                  <label className={L}>오늘 한 일 *</label>
                  <textarea className={`${I} min-h-[80px]`} value={todayPlan} onChange={e => setTodayPlan(e.target.value)}
                    placeholder="오늘 완료한 업무를 정리해주세요" />
                </div>
                <div>
                  <label className={L}>내일 할 일</label>
                  <textarea className={`${I} min-h-[80px]`} value={yesterdayDone} onChange={e => setYesterdayDone(e.target.value)}
                    placeholder="내일 계획을 간단히 적어주세요" />
                </div>
                <div>
                  <label className={L}>메모</label>
                  <textarea className={`${I} min-h-[60px]`} value={blockers} onChange={e => setBlockers(e.target.value)}
                    placeholder="아이디어, 느낀 점 등 자유롭게" />
                </div>
                <div className="flex gap-2">
                  <button className={B} onClick={submit} disabled={saving}>
                    {saving ? "저장중..." : isDone ? "수정 완료" : "체크아웃 제출"}
                  </button>
                  {editId && <button className={B2} onClick={() => setEditId(null)}>취소</button>}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">오늘 한 일</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{myToday?.today_plan}</p>
                </div>
                {myToday?.yesterday_done && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">내일 할 일</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{myToday.yesterday_done}</p>
                  </div>
                )}
                {myToday?.blockers && (
                  <div>
                    <p className="text-xs text-slate-400 mb-1">메모</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap bg-slate-50 rounded-xl p-3">{myToday.blockers}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 팀 체크아웃 피드 */}
          <div className={C}>
            <h3 className="font-bold text-slate-800 mb-4">팀 체크아웃 피드 ({checkins.length}명)</h3>
            {checkins.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">아직 오늘 체크아웃한 팀원이 없어요</p>
                <p className="text-slate-300 text-xs mt-1">첫 번째로 체크아웃해보세요</p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkins.map(c => (
                  <div key={c.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-800">{displayName(c.user_name)}</span>
                      <span className="text-xs text-slate-400">{c.created_at?.slice(11, 16)}</span>
                      {c.user_name === userName && <span className={`${BADGE} bg-blue-50 text-blue-600`}>나</span>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <div className="bg-blue-50/50 rounded-xl p-3">
                        <p className="text-xs text-blue-500 font-medium mb-1">오늘 한 일</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{c.today_plan}</p>
                      </div>
                      {c.yesterday_done && (
                        <div className="bg-emerald-50/50 rounded-xl p-3">
                          <p className="text-xs text-emerald-500 font-medium mb-1">내일 할 일</p>
                          <p className="text-slate-700 whitespace-pre-wrap">{c.yesterday_done}</p>
                        </div>
                      )}
                      {c.blockers && (
                        <div className="bg-slate-50/50 rounded-xl p-3">
                          <p className="text-xs text-slate-500 font-medium mb-1">메모</p>
                          <p className="text-slate-700 whitespace-pre-wrap">{c.blockers}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 내 기록 탭 ───────────────────────── */}
      {sub === "history" && (
        <>
          <div className={`${C} flex items-center gap-3`}>
            <label className={L + " mb-0"}>월 선택</label>
            <input type="month" className={`${I} max-w-[180px]`} value={historyMonth} onChange={e => setHistoryMonth(e.target.value)} />
            <span className="text-sm text-slate-500">{filteredHistory.length}건</span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className={C}>
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm">해당 월의 체크아웃 기록이 없어요</p>
                <p className="text-slate-300 text-xs mt-1">다른 월을 선택해보세요</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map(c => (
                <div key={c.id} className={C}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-semibold text-slate-800">{new Date(c.date).toLocaleDateString("ko-KR", { month: "long", day: "numeric" })}</span>
                    <span className="text-xs text-slate-400">{new Date(c.date).toLocaleDateString("ko-KR", { weekday: "long" })}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">오늘 한 일</p>
                      <p className="text-slate-700 whitespace-pre-wrap">{c.today_plan}</p>
                    </div>
                    {c.yesterday_done && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">내일 할 일</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{c.yesterday_done}</p>
                      </div>
                    )}
                    {c.blockers && (
                      <div>
                        <p className="text-xs text-slate-400 mb-1">메모</p>
                        <p className="text-red-600 whitespace-pre-wrap">{c.blockers}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 연속 체크아웃 카드 */}
          <div className={C}>
            <h3 className="font-bold text-slate-800 mb-3">체크아웃 달력</h3>
            <div className="flex flex-wrap gap-1">
              {(() => {
                const dates = getMonthCalendar(historyMonth);
                const checkedDates = new Set(myCheckins.map(c => c.date));
                return dates.map(d => (
                  <div key={d} className={`w-8 h-8 rounded-lg text-xs flex items-center justify-center font-medium ${
                    checkedDates.has(d) ? "bg-[#3182F6] text-white" : d <= todayStr ? "bg-slate-100 text-slate-400" : "bg-slate-50 text-slate-300"
                  }`} title={d}>
                    {d.slice(8)}
                  </div>
                ));
              })()}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getMonthCalendar(yearMonth: string): string[] {
  const [y, m] = yearMonth.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  const dates: string[] = [];
  for (let d = 1; d <= last; d++) {
    dates.push(`${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return dates;
}

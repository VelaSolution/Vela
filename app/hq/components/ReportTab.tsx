"use client";
import { useState, useEffect } from "react";
import { HQRole, ReportStatus, DailyReport, IssueReport, ProjectReport } from "@/app/hq/types";
import { REPORT_ST } from "@/app/hq/types";
import { sb, today, fmt, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

type SubTab = "weekly" | "daily" | "issue" | "project";

export default function ReportTab({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<SubTab>("weekly");

  /* ── weekly summary ── */
  const [weeklyText, setWeeklyText] = useState("");
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  /* ── daily ── */
  const [dailies, setDailies] = useState<(DailyReport & { author?: string })[]>([]);
  const [dDate, setDDate] = useState(today());
  const [dContent, setDContent] = useState("");
  const [dProblems, setDProblems] = useState("");
  const [dNext, setDNext] = useState("");

  /* ── issue ── */
  const [issues, setIssues] = useState<(IssueReport & { author?: string })[]>([]);
  const [iTitle, setITitle] = useState("");
  const [iDesc, setIDesc] = useState("");
  const [iPriority, setIPriority] = useState("중간");
  const [iStatus, setIStatus] = useState("신규");

  /* ── project ── */
  const [projects, setProjects] = useState<(ProjectReport & { author?: string })[]>([]);
  const [pTitle, setPTitle] = useState("");
  const [pProgress, setPProgress] = useState(0);
  const [pDeadline, setPDeadline] = useState(today());
  const [pDesc, setPDesc] = useState("");

  const canApprove = myRole === "대표" || myRole === "이사" || myRole === "팀장";

  /* ── loaders ── */
  const loadDailies = async () => {
    const s = sb();
    if (!s) return;
    const { data } = await s.from("hq_reports").select("*").eq("report_type", "daily").order("created_at", { ascending: false });
    if (data) setDailies(data.map((d: any) => ({ id: d.id, date: d.created_at?.slice(0, 10) ?? "", content: d.content ?? "", problems: d.problems ?? "", nextSteps: d.next_steps ?? "", status: d.status ?? "submitted", approver: d.approver, author: d.author })));
  };

  const loadIssues = async () => {
    const s = sb();
    if (!s) return;
    const { data } = await s.from("hq_reports").select("*").eq("report_type", "issue").order("created_at", { ascending: false });
    if (data) setIssues(data.map((d: any) => ({ id: d.id, title: d.title ?? "", description: d.description ?? "", priority: d.priority ?? "중간", status: d.status ?? "신규", reportStatus: d.status ?? "submitted", approver: d.approver, author: d.author })));
  };

  const loadProjects = async () => {
    const s = sb();
    if (!s) return;
    const { data } = await s.from("hq_reports").select("*").eq("report_type", "project").order("created_at", { ascending: false });
    if (data) setProjects(data.map((d: any) => ({ id: d.id, title: d.title ?? "", progress: d.progress ?? 0, description: d.description ?? "", deadline: d.deadline ?? "", reportStatus: d.status ?? "submitted", approver: d.approver, author: d.author })));
  };

  const generateWeekly = async () => {
    setWeeklyLoading(true);
    const s = sb();
    if (!s) { setWeeklyLoading(false); return; }
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();

    const [kpiRes, goalRes, taskRes, aarRes] = await Promise.all([
      s.from("hq_kpi").select("*").gte("date", sevenDaysAgo.slice(0, 10)).order("date", { ascending: false }),
      s.from("hq_goals").select("*").order("created_at", { ascending: false }).limit(10),
      s.from("hq_tasks").select("*").order("created_at", { ascending: false }).limit(20),
      s.from("hq_aar").select("*").gte("date", sevenDaysAgo.slice(0, 10)).order("date", { ascending: false }),
    ]);

    const lines: string[] = [];
    lines.push(`=== 주간 보고서 (${sevenDaysAgo.slice(0, 10)} ~ ${today()}) ===`);
    lines.push(`작성자: ${userName}\n`);

    // KPI
    lines.push("[ KPI 현황 ]");
    if (kpiRes.data?.length) {
      kpiRes.data.forEach((k: any) => lines.push(`  ${k.date} | 매출 ${fmt(k.revenue ?? 0)}원 | 사용자 ${fmt(k.users_count ?? 0)}명 | 전환율 ${k.conversion_rate ?? 0}%`));
    } else {
      lines.push("  이번 주 KPI 데이터 없음");
    }
    lines.push("");

    // Goals
    lines.push("[ 목표 달성률 ]");
    if (goalRes.data?.length) {
      goalRes.data.slice(0, 5).forEach((g: any) => {
        const pct = g.target_value ? Math.round((g.current_value / g.target_value) * 100) : 0;
        lines.push(`  ${g.title} — ${pct}% (${fmt(g.current_value)}/${fmt(g.target_value)}) [${g.status}]`);
      });
    } else {
      lines.push("  등록된 목표 없음");
    }
    lines.push("");

    // Tasks
    lines.push("[ 태스크 진행 ]");
    if (taskRes.data?.length) {
      const byStatus: Record<string, number> = {};
      taskRes.data.forEach((t: any) => { byStatus[t.status] = (byStatus[t.status] || 0) + 1; });
      Object.entries(byStatus).forEach(([s, c]) => lines.push(`  ${s}: ${c}건`));
    } else {
      lines.push("  등록된 태스크 없음");
    }
    lines.push("");

    // AAR
    lines.push("[ AAR (사후검토) ]");
    if (aarRes.data?.length) {
      aarRes.data.forEach((a: any) => lines.push(`  ${a.date} | 목표: ${a.goal} | 결과: ${a.result}`));
    } else {
      lines.push("  이번 주 AAR 없음");
    }

    setWeeklyText(lines.join("\n"));
    setWeeklyLoading(false);
  };

  useEffect(() => {
    if (sub === "weekly") generateWeekly();
    if (sub === "daily") loadDailies();
    if (sub === "issue") loadIssues();
    if (sub === "project") loadProjects();
  }, [sub]);

  /* ── actions ── */
  const addDaily = async () => {
    if (!dContent.trim()) { flash("내용을 입력하세요"); return; }
    const s = sb();
    if (!s) return;
    await s.from("hq_reports").insert({ report_type: "daily", content: dContent.trim(), problems: dProblems.trim(), next_steps: dNext.trim(), status: "submitted", author: userName });
    setDContent(""); setDProblems(""); setDNext("");
    flash("일일보고 등록"); loadDailies();
  };

  const addIssue = async () => {
    if (!iTitle.trim()) { flash("제목을 입력하세요"); return; }
    const s = sb();
    if (!s) return;
    await s.from("hq_reports").insert({ report_type: "issue", title: iTitle.trim(), description: iDesc.trim(), priority: iPriority, status: "submitted", author: userName });
    setITitle(""); setIDesc(""); setIPriority("중간"); setIStatus("신규");
    flash("이슈 보고 등록"); loadIssues();
  };

  const addProject = async () => {
    if (!pTitle.trim()) { flash("제목을 입력하세요"); return; }
    const s = sb();
    if (!s) return;
    await s.from("hq_reports").insert({ report_type: "project", title: pTitle.trim(), progress: pProgress, deadline: pDeadline, description: pDesc.trim(), status: "submitted", author: userName });
    setPTitle(""); setPProgress(0); setPDeadline(today()); setPDesc("");
    flash("프로젝트 보고 등록"); loadProjects();
  };

  const approveReport = async (id: string, action: "approved" | "rejected") => {
    const s = sb();
    if (!s) return;
    await s.from("hq_reports").update({ status: action, approver: userName }).eq("id", id);
    flash(action === "approved" ? "승인 완료" : "반려 완료");
    if (sub === "daily") loadDailies();
    if (sub === "issue") loadIssues();
    if (sub === "project") loadProjects();
  };

  const statusBadge = (st: string) => {
    const r = REPORT_ST[st] ?? REPORT_ST.draft;
    return <span className={`${BADGE} ${r.bg}`}>{r.label}</span>;
  };

  const priorityColor: Record<string, string> = { "높음": "bg-red-50 text-red-700", "중간": "bg-amber-50 text-amber-700", "낮음": "bg-slate-50 text-slate-600" };

  const subTabs: { key: SubTab; label: string }[] = [
    { key: "weekly", label: "주간 요약" },
    { key: "daily", label: "일일 보고" },
    { key: "issue", label: "이슈 보고" },
    { key: "project", label: "프로젝트 보고" },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {subTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setSub(t.key)}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${sub === t.key ? "bg-white text-[#3182F6] shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Weekly ── */}
      {sub === "weekly" && (
        <div className={C}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800">주간 보고서 자동 생성</h3>
            <div className="flex gap-2 flex-wrap">
              <button className={B2} onClick={generateWeekly} disabled={weeklyLoading}>
                {weeklyLoading ? "생성중..." : "새로고침"}
              </button>
              <button className={B2} onClick={() => { navigator.clipboard.writeText(weeklyText); flash("클립보드에 복사됨"); }}>
                클립보드 복사
              </button>
              <button className={B} onClick={() => {
                if (!weeklyText) { flash("보고서를 먼저 생성하세요"); return; }
                const blob = new Blob([weeklyText], { type: "text/plain;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                const dateStr = new Date().toISOString().slice(0, 10);
                a.href = url;
                a.download = `VELA_주간보고서_${dateStr}.txt`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                flash("파일 다운로드 완료");
              }}>
                PDF 다운로드
              </button>
            </div>
          </div>
          <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
            {weeklyLoading ? "데이터를 수집 중입니다..." : weeklyText || "데이터를 불러오는 중..."}
          </pre>
        </div>
      )}

      {/* ── Daily ── */}
      {sub === "daily" && (
        <>
          <div className={C}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">일일 보고 작성</h3>
            <div className="space-y-3">
              <div>
                <label className={L}>날짜</label>
                <input type="date" className={I} value={dDate} onChange={(e) => setDDate(e.target.value)} />
              </div>
              <div>
                <label className={L}>업무 내용</label>
                <textarea className={`${I} min-h-[80px]`} rows={3} value={dContent} onChange={(e) => setDContent(e.target.value)} placeholder="오늘의 업무 내용" />
              </div>
              <div>
                <label className={L}>문제/이슈</label>
                <textarea className={`${I} min-h-[60px]`} rows={2} value={dProblems} onChange={(e) => setDProblems(e.target.value)} placeholder="발생한 문제사항" />
              </div>
              <div>
                <label className={L}>내일 계획</label>
                <textarea className={`${I} min-h-[60px]`} rows={2} value={dNext} onChange={(e) => setDNext(e.target.value)} placeholder="내일 진행 예정 업무" />
              </div>
              <div className="flex justify-end">
                <button className={B} onClick={addDaily}>제출</button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {dailies.map((d) => (
              <div key={d.id} className={C}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">{d.author ?? userName}</span>
                    <span className="text-xs text-slate-400">{d.date}</span>
                  </div>
                  {statusBadge(d.status ?? "submitted")}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap mb-2">{d.content}</p>
                {d.problems && <p className="text-sm text-red-600 mb-1"><span className="font-semibold">문제:</span> {d.problems}</p>}
                {d.nextSteps && <p className="text-sm text-blue-600"><span className="font-semibold">계획:</span> {d.nextSteps}</p>}
                {canApprove && d.status === "submitted" && d.author !== userName && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button className="rounded-xl bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 text-sm hover:bg-emerald-100 transition-all" onClick={() => approveReport(d.id, "approved")}>승인</button>
                    <button className="rounded-xl bg-red-50 text-red-600 font-semibold px-4 py-2 text-sm hover:bg-red-100 transition-all" onClick={() => approveReport(d.id, "rejected")}>반려</button>
                  </div>
                )}
              </div>
            ))}
            {dailies.length === 0 && <div className="text-center py-8 text-slate-400">일일 보고가 없습니다</div>}
          </div>
        </>
      )}

      {/* ── Issue ── */}
      {sub === "issue" && (
        <>
          <div className={C}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">이슈 보고</h3>
            <div className="space-y-3">
              <div>
                <label className={L}>제목</label>
                <input className={I} value={iTitle} onChange={(e) => setITitle(e.target.value)} placeholder="이슈 제목" />
              </div>
              <div>
                <label className={L}>설명</label>
                <textarea className={`${I} min-h-[80px]`} rows={3} value={iDesc} onChange={(e) => setIDesc(e.target.value)} placeholder="이슈 상세 설명" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={L}>우선순위</label>
                  <select className={I} value={iPriority} onChange={(e) => setIPriority(e.target.value)}>
                    <option>높음</option>
                    <option>중간</option>
                    <option>낮음</option>
                  </select>
                </div>
                <div>
                  <label className={L}>상태</label>
                  <select className={I} value={iStatus} onChange={(e) => setIStatus(e.target.value)}>
                    <option>신규</option>
                    <option>진행중</option>
                    <option>완료</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button className={B} onClick={addIssue}>제출</button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {issues.map((iss) => (
              <div key={iss.id} className={C}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800 truncate">{iss.title}</h4>
                  {statusBadge(iss.reportStatus ?? "submitted")}
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{iss.description}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className={`${BADGE} ${priorityColor[iss.priority] ?? priorityColor["중간"]}`}>{iss.priority}</span>
                  <span>{iss.author ?? userName}</span>
                </div>
                {canApprove && iss.reportStatus === "submitted" && iss.author !== userName && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button className="rounded-xl bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 text-sm hover:bg-emerald-100 transition-all" onClick={() => approveReport(iss.id, "approved")}>승인</button>
                    <button className="rounded-xl bg-red-50 text-red-600 font-semibold px-4 py-2 text-sm hover:bg-red-100 transition-all" onClick={() => approveReport(iss.id, "rejected")}>반려</button>
                  </div>
                )}
              </div>
            ))}
            {issues.length === 0 && <div className="col-span-2 text-center py-8 text-slate-400">이슈 보고가 없습니다</div>}
          </div>
        </>
      )}

      {/* ── Project ── */}
      {sub === "project" && (
        <>
          <div className={C}>
            <h3 className="text-lg font-bold text-slate-800 mb-4">프로젝트 보고</h3>
            <div className="space-y-3">
              <div>
                <label className={L}>프로젝트명</label>
                <input className={I} value={pTitle} onChange={(e) => setPTitle(e.target.value)} placeholder="프로젝트 이름" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={L}>진행률 ({pProgress}%)</label>
                  <input type="range" min={0} max={100} value={pProgress} onChange={(e) => setPProgress(Number(e.target.value))} className="w-full accent-[#3182F6]" />
                </div>
                <div>
                  <label className={L}>마감일</label>
                  <input type="date" className={I} value={pDeadline} onChange={(e) => setPDeadline(e.target.value)} />
                </div>
              </div>
              <div>
                <label className={L}>설명</label>
                <textarea className={`${I} min-h-[80px]`} rows={3} value={pDesc} onChange={(e) => setPDesc(e.target.value)} placeholder="프로젝트 상세 설명" />
              </div>
              <div className="flex justify-end">
                <button className={B} onClick={addProject}>제출</button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className={C}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-slate-800">{p.title}</h4>
                  {statusBadge(p.reportStatus ?? "submitted")}
                </div>
                <p className="text-sm text-slate-600 mb-3">{p.description}</p>
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>진행률</span>
                    <span className="font-semibold text-[#3182F6]">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3182F6] rounded-full transition-all" style={{ width: `${p.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{p.author ?? userName}</span>
                  <span>마감: {p.deadline}</span>
                </div>
                {canApprove && p.reportStatus === "submitted" && p.author !== userName && (
                  <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                    <button className="rounded-xl bg-emerald-50 text-emerald-700 font-semibold px-4 py-2 text-sm hover:bg-emerald-100 transition-all" onClick={() => approveReport(p.id, "approved")}>승인</button>
                    <button className="rounded-xl bg-red-50 text-red-600 font-semibold px-4 py-2 text-sm hover:bg-red-100 transition-all" onClick={() => approveReport(p.id, "rejected")}>반려</button>
                  </div>
                )}
              </div>
            ))}
            {projects.length === 0 && <div className="text-center py-8 text-slate-400">프로젝트 보고가 없습니다</div>}
          </div>
        </>
      )}
    </div>
  );
}

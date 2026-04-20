"use client";

import { useState, useEffect, useRef } from "react";
import { HQRole, Approval } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE, useTeamDisplayNames } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  "대기": "bg-amber-50 text-amber-700",
  "승인": "bg-emerald-50 text-emerald-700",
  "반려": "bg-red-50 text-red-700",
};

type TeamMember = { name: string; hqRole: string };

interface EnrichedApproval extends Approval {
  urgent?: boolean;
  approved_at?: string;
  seq?: number;
}

export default function ApprovalTab({ userId, userName, myRole, flash }: Props) {
  const [list, setList] = useState<EnrichedApproval[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [comment, setComment] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [filter, setFilter] = useState<"all" | "mine" | "pending">("all");
  const [approvers, setApprovers] = useState<TeamMember[]>([]);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [approverSearch, setApproverSearch] = useState("");
  const [showApproverList, setShowApproverList] = useState(false);
  const [expandedApproval, setExpandedApproval] = useState<string | null>(null);
  const [approvalLine, setApprovalLine] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { displayName } = useTeamDisplayNames();
  const canApprove = myRole === "대표" || myRole === "이사" || myRole === "팀장";

  /** 결재선 파싱: JSON 배열이면 다단계, 일반 문자열이면 단일 결재자 */
  function parseApprovalLine(approver: string): string[] {
    try {
      const parsed = JSON.parse(approver);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch { /* plain string */ }
    return [approver];
  }

  /** 결재 진행 상황 파싱: approved_steps는 승인 완료된 단계 수 */
  function parseApprovedSteps(a: EnrichedApproval): number {
    try {
      const steps = JSON.parse((a as any).approved_steps || "0");
      return typeof steps === "number" ? steps : 0;
    } catch { return a.status === "승인" ? parseApprovalLine(a.approver).length : 0; }
  }

  /** 현재 결재 순서의 결재자 이름 */
  function currentApproverName(a: EnrichedApproval): string | null {
    const line = parseApprovalLine(a.approver);
    const step = parseApprovedSteps(a);
    if (a.status === "반려" || a.status === "승인") return null;
    return step < line.length ? line[step] : null;
  }

  const load = async () => {
    const s = sb();
    if (!s) return setLoading(false);
    const [{ data }, { data: teamData }] = await Promise.all([
      s.from("hq_approvals").select("*").order("created_at", { ascending: false }),
      s.from("hq_team").select("name, hq_role").order("created_at", { ascending: true }),
    ]);
    if (data)
      setList(data.map((r: any, index: number) => ({
        id: r.id, title: r.title, content: r.content,
        author: r.author, approver: r.approver,
        status: r.status, comment: r.comment || "",
        fileUrl: r.file_url, fileName: r.file_name,
        date: r.created_at,
        urgent: r.urgent ?? false,
        approved_at: r.approved_at ?? null,
        approved_steps: r.approved_steps ?? "0",
        seq: data.length - index,
      })));
    if (teamData)
      setApprovers(
        (teamData as any[]).map(m => ({ name: m.name, hqRole: m.hq_role ?? "팀원" })).filter(m => ["대표", "이사"].includes(m.hqRole))
      );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const addToApprovalLine = (name: string) => {
    if (approvalLine.includes(name)) return flash("이미 결재선에 추가된 결재자입니다");
    setApprovalLine(prev => [...prev, name]);
    setApproverSearch("");
    setShowApproverList(false);
  };

  const removeFromApprovalLine = (index: number) => {
    setApprovalLine(prev => prev.filter((_, i) => i !== index));
  };

  const moveApprovalLine = (index: number, direction: "up" | "down") => {
    setApprovalLine(prev => {
      const next = [...prev];
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const submit = async () => {
    if (!title.trim()) return flash("제목을 입력하세요");
    if (approvalLine.length === 0) return flash("결재선을 설정하세요 (결재자를 1명 이상 추가)");
    const s = sb();
    if (!s) return;

    let fileUrl: string | undefined;
    let fileName: string | undefined;
    if (file) {
      const path = `approvals/${Date.now()}_${file.name}`;
      const { error: ue } = await s.storage.from("hq-files").upload(path, file);
      if (!ue) {
        const { data: { publicUrl } } = s.storage.from("hq-files").getPublicUrl(path);
        fileUrl = publicUrl;
        fileName = file.name;
      }
    }

    const approverValue = approvalLine.length === 1 ? approvalLine[0] : JSON.stringify(approvalLine);

    const { error } = await s.from("hq_approvals").insert({
      title: title.trim(), content: content.trim(),
      author: userName, approver: approverValue,
      status: "대기",
      file_url: fileUrl || null, file_name: fileName || null,
      urgent: urgent,
      approved_steps: "0",
    });
    if (error) return flash("저장 실패: " + error.message);
    flash("결재가 요청되었습니다");
    setTitle(""); setContent(""); setSelectedApprover(""); setFile(null); setUrgent(false);
    setApproverSearch(""); setApprovalLine([]);
    if (fileRef.current) fileRef.current.value = "";
    load();
  };

  const act = async (id: string, status: "승인" | "반려") => {
    const s = sb();
    if (!s) return;
    const item = list.find(a => a.id === id);
    if (!item) return;

    const line = parseApprovalLine(item.approver);
    const currentStep = parseApprovedSteps(item);

    if (status === "반려") {
      // 반려 시 즉시 반려 처리
      await s.from("hq_approvals").update({
        status: "반려",
        comment: comment.trim() || null,
        approved_at: new Date().toISOString(),
        approved_steps: String(currentStep),
      }).eq("id", id);
      flash("반려되었습니다");
    } else {
      // 승인: 다음 단계로 진행
      const nextStep = currentStep + 1;
      const isLastStep = nextStep >= line.length;
      await s.from("hq_approvals").update({
        status: isLastStep ? "승인" : "대기",
        comment: comment.trim() || null,
        approved_at: isLastStep ? new Date().toISOString() : null,
        approved_steps: String(nextStep),
      }).eq("id", id);
      if (isLastStep) {
        flash("최종 승인되었습니다");
      } else {
        flash(`${currentStep + 1}단계 승인 완료 — 다음 결재자: ${line[nextStep]}`);
      }
    }
    setComment("");
    load();
  };

  const delApproval = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_approvals").delete().eq("id", id);
    flash("삭제되었습니다");
    load();
  };

  const filtered = list.filter(a => {
    const line = parseApprovalLine(a.approver);
    const isInLine = line.includes(userName);
    const isMyTurn = currentApproverName(a) === userName;
    if (filter === "mine") return a.author === userName || isInLine;
    if (filter === "pending") return a.status === "대기" && isMyTurn;
    return true;
  });

  const pendingCount = list.filter(a => a.status === "대기" && currentApproverName(a) === userName).length;

  function seqLabel(seq: number) {
    return `결재-${String(seq).padStart(3, "0")}`;
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* 결재 요청 폼 */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">결재 요청</h3>
        <div className="space-y-4">
          <div>
            <label className={L}>제목</label>
            <input className={I} placeholder="결재 제목" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className={L}>결재선 설정 (순서대로 결재자를 추가하세요)</label>
            {/* 현재 결재선 */}
            {approvalLine.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mb-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                {approvalLine.map((name, idx) => (
                  <div key={idx} className="flex items-center gap-0.5">
                    {idx > 0 && <span className="text-slate-300 text-xs mx-1">&rarr;</span>}
                    <span className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 shadow-sm">
                      <span className="text-[10px] text-slate-400 mr-0.5">{idx + 1}단계</span>
                      {name}
                      <button type="button" onClick={() => moveApprovalLine(idx, "up")} className="text-slate-300 hover:text-slate-500 ml-0.5" title="위로" disabled={idx === 0}>&uarr;</button>
                      <button type="button" onClick={() => moveApprovalLine(idx, "down")} className="text-slate-300 hover:text-slate-500" title="아래로" disabled={idx === approvalLine.length - 1}>&darr;</button>
                      <button type="button" onClick={() => removeFromApprovalLine(idx)} className="text-slate-300 hover:text-red-500 ml-0.5">&times;</button>
                    </span>
                  </div>
                ))}
              </div>
            )}
            {/* 결재자 검색/추가 */}
            <div className="relative">
              <input className={I} placeholder="결재자 이름으로 검색하여 추가..." value={approverSearch}
                onChange={e => { setApproverSearch(e.target.value); setShowApproverList(true); }}
                onFocus={() => setShowApproverList(true)} />
              {showApproverList && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {approvers.filter(a => !approverSearch || a.name.includes(approverSearch)).filter(a => !approvalLine.includes(a.name)).length === 0 ? (
                    <p className="text-xs text-slate-400 px-3 py-2">검색 결과 없음</p>
                  ) : (
                    approvers.filter(a => !approverSearch || a.name.includes(approverSearch)).filter(a => !approvalLine.includes(a.name)).map(a => (
                      <button key={a.name} type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between"
                        onClick={() => addToApprovalLine(a.name)}>
                        <span className="font-medium text-slate-700">{a.name}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">{a.hqRole}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
          <div>
            <label className={L}>보고자</label>
            <div className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200">{userName} ({myRole})</div>
          </div>
          <div>
            <label className={L}>내용</label>
            <textarea
              className={`${I} min-h-[100px] resize-y`}
              placeholder="결재 내용을 작성하세요"
              value={content} onChange={e => setContent(e.target.value)} rows={4}
            />
          </div>
          <div>
            <label className={L}>첨부파일</label>
            <input ref={fileRef} type="file"
              className="text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200"
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={urgent}
                onChange={(e) => setUrgent(e.target.checked)}
                className="rounded border-red-300 text-red-500 focus:ring-red-300"
              />
              <span className="text-red-500 font-semibold">긴급 결재</span>
            </label>
            <button className={B} onClick={submit}>결재 요청</button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2 items-center">
        {[
          { key: "all" as const, label: "전체" },
          { key: "mine" as const, label: "내 결재" },
          { key: "pending" as const, label: `승인 대기 ${pendingCount > 0 ? `(${pendingCount})` : ""}` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              filter === f.key ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* 결재 목록 */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">결재 목록</h3>
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">불러오는 중...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">결재 내역이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => {
              const line = parseApprovalLine(a.approver);
              const approvedSteps = parseApprovedSteps(a);
              const currentApprover = currentApproverName(a);
              const isMyTurn = currentApprover === userName;
              const isInLine = line.includes(userName);
              const isAuthor = a.author === userName;
              const isExpanded = expandedApproval === a.id;
              const isMultiStep = line.length > 1;
              return (
                <div key={a.id} className={`rounded-xl border p-4 hover:bg-slate-50/60 transition-colors ${a.urgent ? "border-red-300 border-l-4 bg-red-50/20" : "border-slate-100"}`}>
                  <div
                    className="flex items-start justify-between gap-3 mb-2 cursor-pointer"
                    onClick={() => setExpandedApproval(isExpanded ? null : a.id)}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded">
                          {seqLabel(a.seq ?? 0)}
                        </span>
                        {a.urgent && (
                          <span className={`${BADGE} text-[10px] bg-red-500 text-white`}>긴급</span>
                        )}
                        <span className="text-sm font-bold text-slate-800">{a.title}</span>
                        <span className={`${BADGE} ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                        {isMultiStep && a.status === "대기" && (
                          <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-semibold">
                            {approvedSteps}/{line.length}단계
                          </span>
                        )}
                        {isMyTurn && a.status === "대기" && (
                          <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">결재 필요</span>
                        )}
                      </div>
                      {/* 결재선 시각화 */}
                      {isMultiStep ? (
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          <span className="text-xs text-slate-400">보고자: <span className="text-slate-600 font-medium">{displayName(a.author)}</span></span>
                          <span className="text-slate-300 text-xs mx-0.5">&rarr;</span>
                          {line.map((name, idx) => {
                            const isDone = a.status !== "반려" && idx < approvedSteps;
                            const isCurrent = a.status === "대기" && idx === approvedSteps;
                            const isRejectedAt = a.status === "반려" && idx === approvedSteps;
                            return (
                              <span key={idx} className="flex items-center gap-0.5">
                                {idx > 0 && <span className="text-slate-300 text-[10px] mx-0.5">&rarr;</span>}
                                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-medium ${
                                  isDone ? "bg-emerald-50 text-emerald-700" :
                                  isCurrent ? "bg-amber-50 text-amber-700 ring-1 ring-amber-300" :
                                  isRejectedAt ? "bg-red-50 text-red-700 ring-1 ring-red-300" :
                                  "bg-slate-50 text-slate-400"
                                }`}>
                                  {isDone ? "\u2713 " : isCurrent ? "\u25B6 " : isRejectedAt ? "\u2717 " : ""}{displayName(name)}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          보고자: <span className="text-slate-600 font-medium">{displayName(a.author)}</span> &rarr; 결재자: <span className="text-slate-600 font-medium">{displayName(line[0])}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuthor && a.status === "대기" && (
                        <button onClick={(e) => { e.stopPropagation(); delApproval(a.id); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">취소</button>
                      )}
                      <svg className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                      {a.content && <p className="text-sm text-slate-600 whitespace-pre-wrap">{a.content}</p>}

                      {a.fileUrl && (
                        <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#3182F6] hover:underline">
                          📎 {a.fileName || "첨부파일"}
                        </a>
                      )}

                      {a.comment && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                          💬 <span className="font-semibold">{displayName(a.approver)}:</span> {a.comment}
                        </p>
                      )}

                      {/* 다단계 결재 진행 현황 */}
                      {isMultiStep && (
                        <div className="bg-slate-50/80 rounded-xl p-3">
                          <p className="text-xs font-semibold text-slate-500 mb-3">결재선 진행 현황</p>
                          <div className="flex items-center gap-0 overflow-x-auto pb-1">
                            {line.map((name, idx) => {
                              const isDone = a.status !== "반려" && idx < approvedSteps;
                              const isCurrent = a.status === "대기" && idx === approvedSteps;
                              const isRejectedAt = a.status === "반려" && idx === approvedSteps;
                              return (
                                <div key={idx} className="flex items-center">
                                  {idx > 0 && (
                                    <div className={`w-6 h-0.5 ${isDone ? "bg-emerald-400" : "bg-slate-200"}`} />
                                  )}
                                  <div className={`flex flex-col items-center min-w-[60px] ${isCurrent ? "scale-110" : ""}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                      isDone ? "bg-emerald-500 text-white" :
                                      isCurrent ? "bg-amber-400 text-white ring-2 ring-amber-200" :
                                      isRejectedAt ? "bg-red-500 text-white" :
                                      "bg-slate-200 text-slate-400"
                                    }`}>
                                      {isDone ? "\u2713" : isRejectedAt ? "\u2717" : idx + 1}
                                    </div>
                                    <p className={`text-[10px] mt-1 font-medium ${
                                      isDone ? "text-emerald-600" :
                                      isCurrent ? "text-amber-600" :
                                      isRejectedAt ? "text-red-600" :
                                      "text-slate-400"
                                    }`}>{displayName(name)}</p>
                                    <p className="text-[9px] text-slate-400">
                                      {isDone ? "승인 완료" : isCurrent ? "결재 대기" : isRejectedAt ? "반려" : "대기"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Timeline / History */}
                      <div className="bg-slate-50/80 rounded-xl p-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">결재 이력</p>
                        <div className="space-y-2">
                          {/* Submitted */}
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#3182F6] mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-600">
                                <span className="font-semibold">{displayName(a.author)}</span>이(가) 결재를 요청했습니다
                                {isMultiStep && <span className="text-slate-400"> (결재선: {line.map(n => displayName(n)).join(" → ")})</span>}
                              </p>
                              <p className="text-[10px] text-slate-400">{formatDateTime(a.date)}</p>
                            </div>
                          </div>

                          {/* 다단계: 각 승인 완료 단계 표시 */}
                          {isMultiStep && line.slice(0, approvedSteps).map((name, idx) => (
                            <div key={`step-${idx}`} className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-600">
                                  <span className="font-semibold">{displayName(name)}</span>이(가){" "}
                                  <span className="text-emerald-600 font-semibold">{idx + 1}단계 승인</span>했습니다
                                </p>
                              </div>
                            </div>
                          ))}

                          {/* 단일 결재자 또는 최종 완료/반려 */}
                          {!isMultiStep && a.status !== "대기" && (
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === "승인" ? "bg-emerald-500" : "bg-red-500"}`} />
                              <div>
                                <p className="text-xs text-slate-600">
                                  <span className="font-semibold">{displayName(line[0])}</span>이(가){" "}
                                  <span className={a.status === "승인" ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                                    {a.status}
                                  </span>
                                  했습니다
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {a.approved_at ? formatDateTime(a.approved_at) : "-"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* 다단계 반려 표시 */}
                          {isMultiStep && a.status === "반려" && (
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-600">
                                  <span className="font-semibold">{displayName(line[approvedSteps] || line[line.length - 1])}</span>이(가){" "}
                                  <span className="text-red-600 font-semibold">{approvedSteps + 1}단계에서 반려</span>했습니다
                                </p>
                              </div>
                            </div>
                          )}

                          {/* 다단계 최종 승인 표시 */}
                          {isMultiStep && a.status === "승인" && (
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs text-slate-600">
                                  <span className="text-emerald-600 font-bold">최종 승인</span> 완료
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {a.approved_at ? formatDateTime(a.approved_at) : "-"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Pending indicator */}
                          {a.status === "대기" && (
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 animate-pulse" />
                              <p className="text-xs text-amber-600">
                                <span className="font-semibold">{displayName(currentApprover || line[0])}</span>의 결재를 대기 중입니다...
                                {isMultiStep && ` (${approvedSteps + 1}/${line.length}단계)`}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 현재 결재 순서의 결재자만 승인/반려 가능 */}
                      {a.status === "대기" && isMyTurn && (
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <input className={`${I} !text-xs flex-1`} placeholder="코멘트 (선택)"
                            value={comment} onChange={e => setComment(e.target.value)} />
                          <button className="rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2 text-xs hover:bg-emerald-600 transition-colors"
                            onClick={() => act(a.id, "승인")}>승인</button>
                          <button className="rounded-xl bg-red-500 text-white font-semibold px-4 py-2 text-xs hover:bg-red-600 transition-colors"
                            onClick={() => act(a.id, "반려")}>반려</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

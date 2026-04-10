"use client";

import { useState, useEffect, useRef } from "react";
import { HQRole, Approval } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const STATUS_STYLE: Record<string, string> = {
  "\ub300\uae30": "bg-amber-50 text-amber-700",
  "\uc2b9\uc778": "bg-emerald-50 text-emerald-700",
  "\ubc18\ub824": "bg-red-50 text-red-700",
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
  const fileRef = useRef<HTMLInputElement>(null);

  const canApprove = myRole === "\ub300\ud45c" || myRole === "\uc774\uc0ac" || myRole === "\ud300\uc7a5";

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
        seq: data.length - index,
      })));
    if (teamData)
      setApprovers(
        (teamData as any[]).map(m => ({ name: m.name, hqRole: m.hq_role ?? "\ud300\uc6d0" })).filter(m => ["\ub300\ud45c", "\uc774\uc0ac"].includes(m.hqRole))
      );
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!title.trim()) return flash("\uc81c\ubaa9\uc744 \uc785\ub825\ud558\uc138\uc694");
    if (!selectedApprover) return flash("\uacb0\uc7ac\uc790\ub97c \uc120\ud0dd\ud558\uc138\uc694");
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

    const { error } = await s.from("hq_approvals").insert({
      title: title.trim(), content: content.trim(),
      author: userName, approver: selectedApprover,
      status: "\ub300\uae30",
      file_url: fileUrl || null, file_name: fileName || null,
      urgent: urgent,
    });
    if (error) return flash("\uc800\uc7a5 \uc2e4\ud328: " + error.message);
    flash("\uacb0\uc7ac\uac00 \uc694\uccad\ub418\uc5c8\uc2b5\ub2c8\ub2e4");
    setTitle(""); setContent(""); setSelectedApprover(""); setFile(null); setUrgent(false);
    setApproverSearch("");
    if (fileRef.current) fileRef.current.value = "";
    load();
  };

  const act = async (id: string, status: "\uc2b9\uc778" | "\ubc18\ub824") => {
    const s = sb();
    if (!s) return;
    await s.from("hq_approvals").update({
      status,
      comment: comment.trim() || null,
      approved_at: new Date().toISOString(),
    }).eq("id", id);
    flash(`${status}\ub418\uc5c8\uc2b5\ub2c8\ub2e4`);
    setComment("");
    load();
  };

  const delApproval = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_approvals").delete().eq("id", id);
    flash("\uc0ad\uc81c\ub418\uc5c8\uc2b5\ub2c8\ub2e4");
    load();
  };

  const filtered = list.filter(a => {
    if (filter === "mine") return a.author === userName || a.approver === userName;
    if (filter === "pending") return a.status === "\ub300\uae30" && a.approver === userName;
    return true;
  });

  const pendingCount = list.filter(a => a.status === "\ub300\uae30" && a.approver === userName).length;

  function seqLabel(seq: number) {
    return `\uacb0\uc7ac-${String(seq).padStart(3, "0")}`;
  }

  function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div className="space-y-6">
      {/* \uacb0\uc7ac \uc694\uccad \ud3fc */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">\uacb0\uc7ac \uc694\uccad</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={L}>\uc81c\ubaa9</label>
              <input className={I} placeholder="\uacb0\uc7ac \uc81c\ubaa9" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="relative">
              <label className={L}>\uacb0\uc7ac\uc790 (\ub300\ud45c/\uc774\uc0ac)</label>
              <input className={I} placeholder="\uc774\ub984\uc73c\ub85c \uac80\uc0c9..." value={approverSearch}
                onChange={e => { setApproverSearch(e.target.value); setShowApproverList(true); setSelectedApprover(""); }}
                onFocus={() => setShowApproverList(true)} />
              {selectedApprover && (
                <span className="absolute right-3 top-[30px] text-xs bg-[#3182F6]/10 text-[#3182F6] px-2 py-0.5 rounded-lg font-semibold">{selectedApprover}</span>
              )}
              {showApproverList && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                  {approvers.filter(a => !approverSearch || a.name.includes(approverSearch)).length === 0 ? (
                    <p className="text-xs text-slate-400 px-3 py-2">\uac80\uc0c9 \uacb0\uacfc \uc5c6\uc74c</p>
                  ) : (
                    approvers.filter(a => !approverSearch || a.name.includes(approverSearch)).map(a => (
                      <button key={a.name} type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors flex items-center justify-between"
                        onClick={() => { setSelectedApprover(a.name); setApproverSearch(a.name); setShowApproverList(false); }}>
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
            <label className={L}>\ubcf4\uace0\uc790</label>
            <div className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-200">{userName} ({myRole})</div>
          </div>
          <div>
            <label className={L}>\ub0b4\uc6a9</label>
            <textarea
              className={`${I} min-h-[100px] resize-y`}
              placeholder="\uacb0\uc7ac \ub0b4\uc6a9\uc744 \uc791\uc131\ud558\uc138\uc694"
              value={content} onChange={e => setContent(e.target.value)} rows={4}
            />
          </div>
          <div>
            <label className={L}>\ucca8\ubd80\ud30c\uc77c</label>
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
              <span className="text-red-500 font-semibold">\uae34\uae09 \uacb0\uc7ac</span>
            </label>
            <button className={B} onClick={submit}>\uacb0\uc7ac \uc694\uccad</button>
          </div>
        </div>
      </div>

      {/* \ud544\ud130 */}
      <div className="flex gap-2 items-center">
        {[
          { key: "all" as const, label: "\uc804\uccb4" },
          { key: "mine" as const, label: "\ub0b4 \uacb0\uc7ac" },
          { key: "pending" as const, label: `\uc2b9\uc778 \ub300\uae30 ${pendingCount > 0 ? `(${pendingCount})` : ""}` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
              filter === f.key ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* \uacb0\uc7ac \ubaa9\ub85d */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">\uacb0\uc7ac \ubaa9\ub85d</h3>
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">\ubd88\ub7ec\uc624\ub294 \uc911...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">\uacb0\uc7ac \ub0b4\uc5ed\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</p>
        ) : (
          <div className="space-y-3">
            {filtered.map(a => {
              const isApprover = a.approver === userName;
              const isAuthor = a.author === userName;
              const isExpanded = expandedApproval === a.id;
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
                          <span className={`${BADGE} text-[10px] bg-red-500 text-white`}>\uae34\uae09</span>
                        )}
                        <span className="text-sm font-bold text-slate-800">{a.title}</span>
                        <span className={`${BADGE} ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                        {isApprover && a.status === "\ub300\uae30" && (
                          <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">\uacb0\uc7ac \ud544\uc694</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        \ubcf4\uace0\uc790: <span className="text-slate-600 font-medium">{a.author}</span> → \uacb0\uc7ac\uc790: <span className="text-slate-600 font-medium">{a.approver}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuthor && a.status === "\ub300\uae30" && (
                        <button onClick={(e) => { e.stopPropagation(); delApproval(a.id); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors">\ucde8\uc18c</button>
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
                          \ud83d\udcce {a.fileName || "\ucca8\ubd80\ud30c\uc77c"}
                        </a>
                      )}

                      {a.comment && (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
                          \ud83d\udcac <span className="font-semibold">{a.approver}:</span> {a.comment}
                        </p>
                      )}

                      {/* Timeline / History */}
                      <div className="bg-slate-50/80 rounded-xl p-3">
                        <p className="text-xs font-semibold text-slate-500 mb-2">\uacb0\uc7ac \uc774\ub825</p>
                        <div className="space-y-2">
                          {/* Submitted */}
                          <div className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-[#3182F6] mt-1.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs text-slate-600">
                                <span className="font-semibold">{a.author}</span>\uc774(\uac00) \uacb0\uc7ac\ub97c \uc694\uccad\ud588\uc2b5\ub2c8\ub2e4
                              </p>
                              <p className="text-[10px] text-slate-400">{formatDateTime(a.date)}</p>
                            </div>
                          </div>

                          {/* Approved/Rejected */}
                          {a.status !== "\ub300\uae30" && (
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${a.status === "\uc2b9\uc778" ? "bg-emerald-500" : "bg-red-500"}`} />
                              <div>
                                <p className="text-xs text-slate-600">
                                  <span className="font-semibold">{a.approver}</span>\uc774(\uac00){" "}
                                  <span className={a.status === "\uc2b9\uc778" ? "text-emerald-600 font-semibold" : "text-red-600 font-semibold"}>
                                    {a.status}
                                  </span>
                                  \ud588\uc2b5\ub2c8\ub2e4
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  {a.approved_at ? formatDateTime(a.approved_at) : "-"}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Pending indicator */}
                          {a.status === "\ub300\uae30" && (
                            <div className="flex items-start gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0 animate-pulse" />
                              <p className="text-xs text-amber-600">
                                <span className="font-semibold">{a.approver}</span>\uc758 \uacb0\uc7ac\ub97c \ub300\uae30 \uc911\uc785\ub2c8\ub2e4...
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* \uacb0\uc7ac\uc790\ub9cc \uc2b9\uc778/\ubc18\ub824 \uac00\ub2a5 */}
                      {a.status === "\ub300\uae30" && isApprover && (
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <input className={`${I} !text-xs flex-1`} placeholder="\ucf54\uba58\ud2b8 (\uc120\ud0dd)"
                            value={comment} onChange={e => setComment(e.target.value)} />
                          <button className="rounded-xl bg-emerald-500 text-white font-semibold px-4 py-2 text-xs hover:bg-emerald-600 transition-colors"
                            onClick={() => act(a.id, "\uc2b9\uc778")}>\uc2b9\uc778</button>
                          <button className="rounded-xl bg-red-500 text-white font-semibold px-4 py-2 text-xs hover:bg-red-600 transition-colors"
                            onClick={() => act(a.id, "\ubc18\ub824")}>\ubc18\ub824</button>
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

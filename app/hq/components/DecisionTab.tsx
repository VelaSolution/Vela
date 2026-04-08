"use client";

import { useState, useEffect } from "react";
import { HQRole, Decision } from "@/app/hq/types";
import { sb, today, I, C, L, B, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

export default function DecisionTab({ userId, userName, myRole, flash }: Props) {
  const [list, setList] = useState<Decision[]>([]);
  const [title, setTitle] = useState("");
  const [decision, setDecision] = useState("");
  const [reason, setReason] = useState("");
  const [owner, setOwner] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const s = sb();
    if (!s) return setLoading(false);
    const { data } = await s
      .from("hq_decisions")
      .select("*")
      .order("created_at", { ascending: false });
    if (data)
      setList(
        data.map((r: any) => ({
          id: r.id,
          title: r.title,
          decision: r.decision,
          reason: r.reason,
          owner: r.owner,
          date: r.created_at,
          followUp: r.follow_up || "",
        }))
      );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!title.trim() || !decision.trim())
      return flash("제목과 결정사항을 입력하세요");
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_decisions").insert({
      title: title.trim(),
      decision: decision.trim(),
      reason: reason.trim(),
      owner: owner.trim() || userName,
      follow_up: followUp.trim(),
      created_at: new Date().toISOString(),
    });
    if (error) return flash("저장 실패: " + error.message);
    flash("의사결정이 기록되었습니다");
    setTitle("");
    setDecision("");
    setReason("");
    setOwner("");
    setFollowUp("");
    load();
  };

  const remove = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_decisions").delete().eq("id", id);
    flash("삭제되었습니다");
    load();
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">의사결정 기록</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={L}>제목</label>
              <input
                className={I}
                placeholder="의사결정 제목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className={L}>책임자</label>
              <input
                className={I}
                placeholder="책임자 이름"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={L}>결정사항</label>
            <textarea
              className={`${I} min-h-[80px] resize-y`}
              placeholder="어떤 결정을 내렸는지 작성하세요"
              value={decision}
              onChange={(e) => setDecision(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className={L}>근거/이유</label>
            <textarea
              className={`${I} min-h-[80px] resize-y`}
              placeholder="결정의 근거와 이유를 작성하세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <label className={L}>후속 조치</label>
            <input
              className={I}
              placeholder="후속으로 필요한 액션"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
            />
          </div>
          <button className={B} onClick={add}>
            기록 저장
          </button>
        </div>
      </div>

      {/* List */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          의사결정 로그{" "}
          <span className="text-sm font-normal text-slate-400">
            ({list.length}건)
          </span>
        </h3>
        {loading ? (
          <p className="text-sm text-slate-400 py-8 text-center">불러오는 중...</p>
        ) : list.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">
            기록된 의사결정이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {list.map((d) => (
              <div
                key={d.id}
                className="rounded-xl border border-slate-100 p-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{d.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {d.owner} ·{" "}
                      {new Date(d.date).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(d.id)}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 flex-shrink-0"
                  >
                    삭제
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="bg-blue-50/60 rounded-lg px-3 py-2">
                    <span className="text-[11px] font-semibold text-blue-500 block mb-0.5">
                      결정사항
                    </span>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {d.decision}
                    </p>
                  </div>
                  {d.reason && (
                    <div className="bg-slate-50 rounded-lg px-3 py-2">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                        근거
                      </span>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {d.reason}
                      </p>
                    </div>
                  )}
                  {d.followUp && (
                    <div className="bg-amber-50/60 rounded-lg px-3 py-2">
                      <span className="text-[11px] font-semibold text-amber-500 block mb-0.5">
                        후속 조치
                      </span>
                      <p className="text-sm text-slate-700">{d.followUp}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

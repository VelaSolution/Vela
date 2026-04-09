"use client";
import { useState, useEffect } from "react";
import { HQRole, Feedback } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const TYPES = ["버그", "기능요청", "개선", "기타"] as const;
const PRIORITIES = ["높음", "중간", "낮음"] as const;
const STATUS_FLOW = ["신규", "진행", "완료"] as const;

const priorityColor: Record<string, string> = {
  "높음": "bg-red-50 text-red-700",
  "중간": "bg-amber-50 text-amber-700",
  "낮음": "bg-slate-50 text-slate-600",
};
const typeIcon: Record<string, string> = {
  "버그": "🐛",
  "기능요청": "✨",
  "개선": "🔧",
  "기타": "📝",
};

export default function FeedbackTab({ userId, userName, myRole, flash }: Props) {
  const [items, setItems] = useState<Feedback[]>([]);
  const [type, setType] = useState<string>("버그");
  const [priority, setPriority] = useState<string>("중간");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("전체");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Feedback | null>(null);

  const load = async () => {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s.from("hq_feedback").select("*").order("created_at", { ascending: false });
    if (data) {
      setItems(data.map((d: any) => ({
        id: d.id,
        type: d.type ?? "버그",
        title: d.title ?? "",
        description: d.description ?? "",
        priority: d.priority ?? "중간",
        status: d.status ?? "신규",
        date: d.created_at?.slice(0, 10) ?? today(),
        author: d.author ?? "",
      })));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!title.trim()) { flash("제목을 입력하세요"); return; }
    const s = sb();
    if (!s) return;
    await s.from("hq_feedback").insert({
      type,
      title: title.trim(),
      description: desc.trim(),
      priority,
      status: "신규",
      author: userName,
    });
    setTitle(""); setDesc(""); setType("버그"); setPriority("중간");
    flash("피드백 등록 완료");
    load();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_feedback").update({ status: newStatus }).eq("id", id);
    flash(`상태 변경: ${newStatus}`);
    load();
  };

  const deleteFb = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_feedback").delete().eq("id", id);
    flash("삭제되었습니다");
    setSelected(null);
    load();
  };

  const filtered = filterStatus === "전체" ? items : items.filter((i) => i.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* 상세 모달 */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeIcon[selected.type] ?? "📝"}</span>
                <h3 className="text-lg font-bold text-slate-900">{selected.title}</h3>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400">✕</button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div className="flex gap-2 flex-wrap">
                <span className={`${BADGE} ${priorityColor[selected.priority]}`}>{selected.priority}</span>
                {STATUS_FLOW.map(st => (
                  <button key={st} onClick={() => { updateStatus(selected.id, st); setSelected({ ...selected, status: st }); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${selected.status === st ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>
                    {st}
                  </button>
                ))}
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selected.description || "설명 없음"}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>작성자: {selected.author} · {selected.date}</span>
              </div>
            </div>
            <div className="px-5 py-3 border-t border-slate-100 flex justify-between">
              {selected.author === userName && (
                <button onClick={() => deleteFb(selected.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">삭제</button>
              )}
              <div />
              <button onClick={() => setSelected(null)} className={B2}>닫기</button>
            </div>
          </div>
        </div>
      )}

      {/* 작성 폼 */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">피드백 등록</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={L}>유형</label>
              <select className={I} value={type} onChange={(e) => setType(e.target.value)}>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={L}>우선순위</label>
              <select className={I} value={priority} onChange={(e) => setPriority(e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className={L}>제목</label>
            <input className={I} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="피드백 제목" />
          </div>
          <div>
            <label className={L}>설명</label>
            <textarea className={`${I} min-h-[80px]`} rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="상세 설명을 입력하세요" />
          </div>
          <div className="flex justify-end">
            <button className={B} onClick={handleAdd}>등록</button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <div className="flex gap-2">
        {["전체", ...STATUS_FLOW].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filterStatus === s ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {s}
            {s !== "전체" && (
              <span className="ml-1.5 text-xs opacity-70">
                {items.filter((i) => i.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 카드 목록 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-400">피드백이 없습니다</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fb) => (
            <div key={fb.id} className={`${C} cursor-pointer`} onClick={() => setSelected(fb)}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">{typeIcon[fb.type] ?? "📝"}</span>
                  <span className="text-xs font-semibold text-slate-500">{fb.type}</span>
                </div>
                <span className={`${BADGE} ${priorityColor[fb.priority] ?? priorityColor["중간"]}`}>
                  {fb.priority}
                </span>
              </div>
              <h4 className="font-semibold text-slate-800 mb-1.5 line-clamp-1">{fb.title}</h4>
              <p className="text-sm text-slate-500 mb-3 line-clamp-2">{fb.description}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  <span>{fb.author}</span>
                  <span className="mx-1.5">·</span>
                  <span>{fb.date}</span>
                </div>
                {/* Status transition */}
                <div className="flex gap-1">
                  {STATUS_FLOW.map((st) => (
                    <button
                      key={st}
                      onClick={() => updateStatus(fb.id, st)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${fb.status === st ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

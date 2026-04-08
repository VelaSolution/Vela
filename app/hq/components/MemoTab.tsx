"use client";
import { useState, useEffect } from "react";
import { HQRole, MemoItem } from "@/app/hq/types";
import { sb, I, C, B, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

export default function MemoTab({ userId, userName, myRole, flash }: Props) {
  const [memos, setMemos] = useState<(MemoItem & { author?: string })[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s.from("hq_memos").select("*").order("created_at", { ascending: false });
    if (data) {
      setMemos(
        data.map((d: any) => ({
          id: d.id,
          content: d.content ?? "",
          time: d.created_at
            ? new Date(d.created_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
            : "",
          author: d.author ?? "",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!content.trim()) { flash("내용을 입력하세요"); return; }
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_memos").insert({ content: content.trim(), author: userName });
    if (error) { flash("저장 실패"); return; }
    setContent("");
    flash("메모 저장 완료");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_memos").delete().eq("id", id);
    flash("삭제 완료");
    load();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <div className="space-y-6">
      {/* 입력 */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">빠른 메모</h3>
        <textarea
          className={`${I} min-h-[120px]`}
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메모를 입력하세요... (Ctrl+Enter로 저장)"
        />
        <div className="flex justify-end mt-3">
          <button className={B} onClick={handleSave}>저장</button>
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">불러오는 중...</div>
      ) : memos.length === 0 ? (
        <div className="text-center py-12 text-slate-400">메모가 없습니다</div>
      ) : (
        <div className="space-y-3">
          {memos.map((m) => (
            <div key={m.id} className={`${C} group`}>
              <div className="flex items-start justify-between">
                <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed flex-1">{m.content}</p>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all flex-shrink-0 ml-3"
                  title="삭제"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <span>{m.author}</span>
                <span>·</span>
                <span>{m.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

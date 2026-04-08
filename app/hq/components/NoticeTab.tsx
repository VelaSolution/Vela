"use client";
import { useState, useEffect } from "react";
import { HQRole, Notice } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

export default function NoticeTab({ userId, userName, myRole, flash }: Props) {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s
      .from("hq_notices")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (data) {
      setNotices(
        data.map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          date: d.created_at?.slice(0, 10) ?? today(),
          pinned: d.pinned ?? false,
          author: d.author ?? "",
          readBy: d.read_by ?? [],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!title.trim()) { flash("제목을 입력하세요"); return; }
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_notices").insert({
      title: title.trim(),
      content: content.trim(),
      pinned,
      author: userName,
      read_by: [userName],
    });
    if (error) { flash("저장 실패"); return; }
    setTitle("");
    setContent("");
    setPinned(false);
    flash("공지 등록 완료");
    load();
  };

  const markRead = async (n: Notice) => {
    if (n.readBy?.includes(userName)) return;
    const s = sb();
    if (!s) return;
    const newReadBy = [...(n.readBy ?? []), userName];
    await s.from("hq_notices").update({ read_by: newReadBy }).eq("id", n.id);
    load();
  };

  const togglePin = async (n: Notice) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_notices").update({ pinned: !n.pinned }).eq("id", n.id);
    flash(n.pinned ? "고정 해제" : "고정됨");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_notices").delete().eq("id", id);
    flash("삭제 완료");
    load();
  };

  const canManage = myRole === "대표" || myRole === "이사" || myRole === "팀장";

  return (
    <div className="space-y-6">
      {/* 작성 폼 */}
      {canManage && (
        <div className={C}>
          <h3 className="text-lg font-bold text-slate-800 mb-4">공지 작성</h3>
          <div className="space-y-3">
            <div>
              <label className={L}>제목</label>
              <input className={I} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지 제목" />
            </div>
            <div>
              <label className={L}>내용</label>
              <textarea className={`${I} min-h-[100px]`} rows={4} value={content} onChange={(e) => setContent(e.target.value)} placeholder="공지 내용을 입력하세요" />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="rounded border-slate-300 text-[#3182F6] focus:ring-[#3182F6]" />
                상단 고정
              </label>
              <button className={B} onClick={handleAdd}>등록</button>
            </div>
          </div>
        </div>
      )}

      {/* 공지 목록 */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">불러오는 중...</div>
      ) : notices.length === 0 ? (
        <div className="text-center py-12 text-slate-400">등록된 공지가 없습니다</div>
      ) : (
        <div className="space-y-3">
          {notices.map((n) => {
            const isRead = n.readBy?.includes(userName);
            const expanded = expandedId === n.id;
            return (
              <div key={n.id} className={C}>
                <div
                  className="flex items-start justify-between cursor-pointer"
                  onClick={() => {
                    setExpandedId(expanded ? null : n.id);
                    if (!isRead) markRead(n);
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {n.pinned && (
                        <span className={`${BADGE} bg-amber-50 text-amber-700`}>
                          <span className="mr-1">&#128204;</span>고정
                        </span>
                      )}
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#3182F6] flex-shrink-0" />
                      )}
                      <h4 className="font-semibold text-slate-800 truncate">{n.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{n.author}</span>
                      <span>{n.date}</span>
                      <span>읽음 {n.readBy?.length ?? 0}명</span>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-2 ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {expanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">{n.content || "(내용 없음)"}</p>
                    {canManage && (
                      <div className="flex gap-2 mt-4">
                        <button className={B2} onClick={(e) => { e.stopPropagation(); togglePin(n); }}>
                          {n.pinned ? "고정 해제" : "고정"}
                        </button>
                        <button className="rounded-xl bg-red-50 text-red-600 font-semibold px-4 py-2 text-sm hover:bg-red-100 transition-all" onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}>
                          삭제
                        </button>
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
  );
}

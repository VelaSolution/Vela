"use client";
import { useState, useEffect } from "react";
import { HQRole, WikiArticle } from "@/app/hq/types";
import { sb, today, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const CATEGORIES = ["가이드", "정책", "기술", "일반"];
const CAT_COLOR: Record<string, string> = {
  "가이드": "bg-blue-50 text-blue-700",
  "정책": "bg-purple-50 text-purple-700",
  "기술": "bg-emerald-50 text-emerald-700",
  "일반": "bg-slate-100 text-slate-600",
};

type View = "list" | "create" | "detail" | "edit";

export default function WikiTab({ userId, userName, myRole, flash }: Props) {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Form state
  const [fTitle, setFTitle] = useState("");
  const [fCategory, setFCategory] = useState("일반");
  const [fTags, setFTags] = useState("");
  const [fContent, setFContent] = useState("");

  useEffect(() => {
    (async () => {
      const s = sb();
      if (s) {
        try {
          const { data } = await s.from("hq_wiki").select("*").order("created_at", { ascending: false });
          if (data && data.length >= 0) { setArticles(data as WikiArticle[]); return; }
        } catch {}
      }
      try { const d = localStorage.getItem("vela-hq-wiki"); if (d) setArticles(JSON.parse(d)); } catch {}
    })();
  }, []);

  const persist = (next: WikiArticle[]) => { setArticles(next); localStorage.setItem("vela-hq-wiki", JSON.stringify(next)); };

  const catCounts = CATEGORIES.reduce((acc, c) => {
    acc[c] = articles.filter(a => a.category === c).length;
    return acc;
  }, {} as Record<string, number>);

  const filtered = articles
    .filter(a => !filterCat || a.category === filterCat)
    .filter(a => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q) || a.tags.some(t => t.toLowerCase().includes(q));
    });

  const selected = articles.find(a => a.id === selectedId);

  const resetForm = () => { setFTitle(""); setFCategory("일반"); setFTags(""); setFContent(""); };

  const openCreate = () => {
    resetForm();
    setView("create");
  };

  const openDetail = (id: string) => {
    setSelectedId(id);
    // Increment view count
    persist(articles.map(a => a.id === id ? { ...a, views: a.views + 1 } : a));
    setView("detail");
  };

  const openEdit = () => {
    if (!selected) return;
    setFTitle(selected.title);
    setFCategory(selected.category);
    setFTags(selected.tags.join(", "));
    setFContent(selected.content);
    setView("edit");
  };

  const saveArticle = () => {
    if (!fTitle.trim()) { flash("제목을 입력하세요"); return; }
    if (!fContent.trim()) { flash("내용을 입력하세요"); return; }
    const tags = fTags.split(",").map(t => t.trim()).filter(Boolean);
    const article: WikiArticle = {
      id: crypto.randomUUID(),
      title: fTitle.trim(),
      content: fContent.trim(),
      category: fCategory,
      author: userName,
      lastEditor: userName,
      date: today(),
      updatedAt: today(),
      tags,
      views: 0,
    };
    persist([article, ...articles]);
    flash("문서가 작성되었습니다");
    resetForm();
    setView("list");
  };

  const updateArticle = () => {
    if (!selected) return;
    if (!fTitle.trim()) { flash("제목을 입력하세요"); return; }
    if (!fContent.trim()) { flash("내용을 입력하세요"); return; }
    const tags = fTags.split(",").map(t => t.trim()).filter(Boolean);
    persist(articles.map(a => a.id === selected.id ? {
      ...a,
      title: fTitle.trim(),
      content: fContent.trim(),
      category: fCategory,
      tags,
      lastEditor: userName,
      updatedAt: today(),
    } : a));
    flash("문서가 수정되었습니다");
    setView("detail");
  };

  const deleteArticle = (id: string) => {
    persist(articles.filter(a => a.id !== id));
    flash("문서가 삭제되었습니다");
    setView("list");
  };

  // ──── DETAIL VIEW ────
  if (view === "detail" && selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("list")} className={B2}>← 목록</button>
        </div>
        <div className={C}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`${BADGE} text-[11px] ${CAT_COLOR[selected.category] || CAT_COLOR["일반"]}`}>{selected.category}</span>
                <span className="text-xs text-slate-400">조회 {selected.views}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-800">{selected.title}</h2>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                <span>작성자: {selected.author}</span>
                <span>최종 수정: {selected.lastEditor} ({selected.updatedAt})</span>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={openEdit} className={B2}>편집</button>
              <button onClick={() => deleteArticle(selected.id)} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 font-semibold hover:bg-red-100 transition-colors">삭제</button>
            </div>
          </div>

          {selected.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {selected.tags.map((t, i) => (
                <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">#{t}</span>
              ))}
            </div>
          )}

          <div className="border-t border-slate-100 pt-4">
            <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap leading-relaxed">
              {selected.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──── CREATE / EDIT VIEW ────
  if (view === "create" || view === "edit") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => { setView(view === "edit" ? "detail" : "list"); resetForm(); }} className={B2}>← 뒤로</button>
          <h2 className="text-sm font-bold text-slate-700">{view === "edit" ? "문서 편집" : "문서 작성"}</h2>
        </div>
        <div className={C}>
          <div className="space-y-4">
            <div>
              <label className={L}>제목</label>
              <input value={fTitle} onChange={e => setFTitle(e.target.value)} placeholder="문서 제목" className={I} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={L}>카테고리</label>
                <select value={fCategory} onChange={e => setFCategory(e.target.value)} className={I}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={L}>태그 (쉼표 구분)</label>
                <input value={fTags} onChange={e => setFTags(e.target.value)} placeholder="온보딩, 개발, 가이드" className={I} />
              </div>
            </div>
            <div>
              <label className={L}>내용</label>
              <textarea
                value={fContent}
                onChange={e => setFContent(e.target.value)}
                placeholder="문서 내용을 작성하세요"
                rows={16}
                className={`${I} font-mono`}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => { setView(view === "edit" ? "detail" : "list"); resetForm(); }} className={B2}>취소</button>
            <button onClick={view === "edit" ? updateArticle : saveArticle} className={B}>
              {view === "edit" ? "수정 완료" : "작성 완료"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ──── LIST VIEW ────
  return (
    <div className="flex gap-6">
      {/* Category sidebar */}
      <div className="w-48 shrink-0 hidden sm:block">
        <div className={C}>
          <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">카테고리</h3>
          <div className="space-y-1">
            <button
              onClick={() => setFilterCat(null)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                !filterCat ? "bg-[#3182F6] text-white" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              전체 <span className="text-xs opacity-70">({articles.length})</span>
            </button>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setFilterCat(filterCat === c ? null : c)}
                className={`w-full text-left text-sm px-3 py-2 rounded-lg font-medium transition-colors ${
                  filterCat === c ? "bg-[#3182F6] text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c} <span className="text-xs opacity-70">({catCounts[c]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search & create */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="문서 검색 (제목, 내용, 태그)"
              className={`${I} pl-9`}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button onClick={openCreate} className={B}>+ 문서 작성</button>
        </div>

        {/* Mobile category filter */}
        <div className="flex gap-1 flex-wrap sm:hidden">
          <button
            onClick={() => setFilterCat(null)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${!filterCat ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500"}`}
          >
            전체
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilterCat(filterCat === c ? null : c)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold ${filterCat === c ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500"}`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Article list */}
        {filtered.length === 0 ? (
          <div className={C}>
            <p className="text-center text-sm text-slate-400 py-12">
              {search ? "검색 결과가 없습니다" : "등록된 문서가 없습니다"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(a => (
              <div
                key={a.id}
                onClick={() => openDetail(a.id)}
                className={`${C} cursor-pointer hover:border-blue-200`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`${BADGE} text-[11px] ${CAT_COLOR[a.category] || CAT_COLOR["일반"]}`}>{a.category}</span>
                      <h3 className="text-sm font-bold text-slate-800 truncate">{a.title}</h3>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{a.content.slice(0, 120)}</p>
                    {a.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {a.tags.slice(0, 5).map((t, i) => (
                          <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">#{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs text-slate-400">{a.author}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">{a.updatedAt}</p>
                    <p className="text-[11px] text-slate-300">조회 {a.views}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

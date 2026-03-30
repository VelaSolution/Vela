"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

type SharedSim = {
  id: string;
  title: string;
  description: string;
  industry: string;
  author_name: string;
  form: Record<string, unknown>;
  result: { totalSales: number; profit: number; netMargin: number; bep: number };
  view_count: number;
  like_count: number;
  created_at: string;
  user_id: string;
  is_liked?: boolean;
};

type Comment = {
  id: string;
  simulation_id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

const INDUSTRY_LABEL: Record<string, string> = {
  cafe: "☕ 카페", restaurant: "🍽️ 음식점",
  bar: "🍺 술집/바", finedining: "✨ 파인다이닝", gogi: "🥩 고깃집",
};

const fmt = (n: number) => {
  if (Math.abs(n) >= 100_000_000) return `${(n / 100_000_000).toFixed(1)}억`;
  if (Math.abs(n) >= 10_000) return `${Math.round(n / 10_000)}만`;
  return n.toLocaleString("ko-KR");
};

export default function CommunityPage() {
  const supabase = createSupabaseBrowserClient();
  const [sims, setSims] = useState<SharedSim[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState("전체");
  const [sort, setSort] = useState<"latest" | "popular" | "likes">("latest");

  // 댓글
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentLoading, setCommentLoading] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      let query = supabase.from("shared_simulations").select("*").eq("is_public", true);
      if (filter !== "전체") {
        const key = Object.entries(INDUSTRY_LABEL).find(([, v]) => v === filter)?.[0];
        if (key) query = query.eq("industry", key);
      }
      if (sort === "latest") query = query.order("created_at", { ascending: false });
      else if (sort === "popular") query = query.order("view_count", { ascending: false });
      else query = query.order("like_count", { ascending: false });

      const { data } = await query.limit(20);
      if (data && userId) {
        const { data: likes } = await supabase.from("simulation_likes").select("simulation_id").eq("user_id", userId);
        const likedIds = new Set(likes?.map(l => l.simulation_id) ?? []);
        setSims(data.map(s => ({ ...s, is_liked: likedIds.has(s.id) })));
      } else {
        setSims(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [filter, sort, userId]);

  async function loadComments(simId: string) {
    const { data } = await supabase
      .from("simulation_comments")
      .select("*")
      .eq("simulation_id", simId)
      .order("created_at", { ascending: true });
    setComments(prev => ({ ...prev, [simId]: data ?? [] }));
  }

  async function toggleExpand(simId: string) {
    if (expandedId === simId) {
      setExpandedId(null);
    } else {
      setExpandedId(simId);
      if (!comments[simId]) await loadComments(simId);
      // 조회수 증가
      await supabase.from("shared_simulations").update({ view_count: (sims.find(s => s.id === simId)?.view_count ?? 0) + 1 }).eq("id", simId);
    }
  }

  async function submitComment(simId: string) {
    if (!userId) { window.location.href = "/login?next=/community"; return; }
    const text = commentText[simId]?.trim();
    if (!text) return;
    setCommentLoading(simId);

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", userId).single();
    const authorName = profile?.full_name ?? "익명";

    const { data, error } = await supabase.from("simulation_comments").insert({
      simulation_id: simId,
      user_id: userId,
      author_name: authorName,
      content: text,
    }).select().single();

    if (!error && data) {
      setComments(prev => ({ ...prev, [simId]: [...(prev[simId] ?? []), data] }));
      setCommentText(prev => ({ ...prev, [simId]: "" }));
    }
    setCommentLoading(null);
  }

  async function deleteComment(simId: string, commentId: string) {
    await supabase.from("simulation_comments").delete().eq("id", commentId);
    setComments(prev => ({ ...prev, [simId]: prev[simId].filter(c => c.id !== commentId) }));
  }

  async function deleteSim(simId: string) {
    if (!confirm("정말 삭제할까요?")) return;
    await supabase.from("shared_simulations").delete().eq("id", simId);
    setSims(prev => prev.filter(s => s.id !== simId));
  }

  async function toggleLike(sim: SharedSim) {
    if (!userId) { window.location.href = "/login?next=/community"; return; }
    if (sim.is_liked) {
      await supabase.from("simulation_likes").delete().eq("simulation_id", sim.id).eq("user_id", userId);
      await supabase.from("shared_simulations").update({ like_count: sim.like_count - 1 }).eq("id", sim.id);
      setSims(prev => prev.map(s => s.id === sim.id ? { ...s, is_liked: false, like_count: s.like_count - 1 } : s));
    } else {
      await supabase.from("simulation_likes").insert({ simulation_id: sim.id, user_id: userId });
      await supabase.from("shared_simulations").update({ like_count: sim.like_count + 1 }).eq("id", sim.id);
      setSims(prev => prev.map(s => s.id === sim.id ? { ...s, is_liked: true, like_count: s.like_count + 1 } : s));
    }
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 md:px-8">
        <div className="mx-auto max-w-3xl">

          {/* 헤더 */}
          <div className="flex items-end justify-between pt-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-2">
                👥 커뮤니티
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">사장님들의 수익 분석</h1>
              <p className="text-sm text-slate-400 mt-1">다른 사장님들의 시뮬레이션을 참고해보세요</p>
            </div>
            <Link href="/simulator"
              className="rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition">
              내 분석 공유하기 →
            </Link>
          </div>

          {/* 필터 */}
          <div className="flex gap-3 mb-6 flex-wrap items-center">
            <div className="flex gap-1.5 flex-wrap">
              {["전체", ...Object.values(INDUSTRY_LABEL)].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    filter === f ? "bg-slate-900 text-white" : "bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
            <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
              className="ml-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none">
              <option value="latest">최신순</option>
              <option value="popular">조회순</option>
              <option value="likes">좋아요순</option>
            </select>
          </div>

          {/* 목록 */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
            </div>
          ) : sims.length === 0 ? (
            <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 p-16 text-center">
              <p className="text-4xl mb-4">📊</p>
              <p className="font-bold text-slate-900 mb-2">아직 공유된 분석이 없어요</p>
              <p className="text-sm text-slate-400 mb-6">첫 번째로 시뮬레이션을 공유해보세요!</p>
              <Link href="/simulator" className="inline-block rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white">
                시뮬레이터 시작하기 →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {sims.map(sim => {
                const isProfit = sim.result.profit >= 0;
                const isExpanded = expandedId === sim.id;
                const simComments = comments[sim.id] ?? [];
                const isOwner = userId === sim.user_id;

                return (
                  <div key={sim.id} className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
                    <div className="p-6">
                      {/* 상단 */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                              {INDUSTRY_LABEL[sim.industry] ?? sim.industry}
                            </span>
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isProfit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                              {isProfit ? "✅ 흑자" : "❌ 적자"}
                            </span>
                          </div>
                          <h2 className="font-extrabold text-slate-900 text-lg leading-tight">{sim.title}</h2>
                          {sim.description && <p className="text-sm text-slate-500 mt-1">{sim.description}</p>}
                        </div>
                        <div className="flex flex-col items-center gap-2 flex-shrink-0">
                          <button onClick={() => toggleLike(sim)}
                            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl transition ${sim.is_liked ? "bg-red-50 text-red-500" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                            <span className="text-lg">{sim.is_liked ? "❤️" : "🤍"}</span>
                            <span className="text-xs font-bold">{sim.like_count}</span>
                          </button>
                          {isOwner && (
                            <button onClick={() => deleteSim(sim.id)}
                              className="text-xs text-slate-300 hover:text-red-400 transition px-2 py-1 rounded-lg hover:bg-red-50">
                              삭제
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 수치 */}
                      <div className="grid grid-cols-3 gap-2 mt-4">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-400 mb-0.5">월 매출</p>
                          <p className="font-extrabold text-slate-900">{fmt(sim.result.totalSales)}원</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-400 mb-0.5">순이익</p>
                          <p className={`font-extrabold ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
                            {isProfit ? "+" : ""}{fmt(sim.result.profit)}원
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-400 mb-0.5">이익률</p>
                          <p className={`font-extrabold ${isProfit ? "text-emerald-600" : "text-red-500"}`}>
                            {sim.result.netMargin.toFixed(1)}%
                          </p>
                        </div>
                      </div>

                      {/* 하단 */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {sim.author_name[0]}
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{sim.author_name}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">{new Date(sim.created_at).toLocaleDateString("ko-KR")}</span>
                          <span className="text-xs text-slate-300">·</span>
                          <span className="text-xs text-slate-400">👁 {sim.view_count}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleExpand(sim.id)}
                            className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition">
                            💬 댓글 {isExpanded ? "닫기" : `보기`}
                          </button>
                          <Link
                            href={`/simulator?${Object.entries(sim.form).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&")}`}
                            className="text-xs font-semibold text-blue-500 hover:text-blue-700 transition">
                            이 값으로 시뮬레이션 →
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* 댓글 영역 */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                        {/* 댓글 목록 */}
                        {simComments.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-3">아직 댓글이 없어요. 첫 댓글을 남겨보세요!</p>
                        ) : (
                          <div className="space-y-3 mb-4">
                            {simComments.map(c => (
                              <div key={c.id} className="flex gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0 mt-0.5">
                                  {c.author_name[0]}
                                </div>
                                <div className="flex-1 bg-white rounded-2xl px-3.5 py-2.5 ring-1 ring-slate-200">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-700">{c.author_name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-slate-300">{new Date(c.created_at).toLocaleDateString("ko-KR")}</span>
                                      {userId === c.user_id && (
                                        <button onClick={() => deleteComment(sim.id, c.id)}
                                          className="text-xs text-slate-300 hover:text-red-400 transition">
                                          삭제
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm text-slate-600">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* 댓글 입력 */}
                        {userId ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={commentText[sim.id] ?? ""}
                              onChange={e => setCommentText(prev => ({ ...prev, [sim.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === "Enter") submitComment(sim.id); }}
                              placeholder="댓글을 입력하세요..."
                              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm outline-none focus:border-slate-400 transition"
                            />
                            <button onClick={() => submitComment(sim.id)}
                              disabled={commentLoading === sim.id || !commentText[sim.id]?.trim()}
                              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 transition disabled:opacity-40">
                              {commentLoading === sim.id ? "..." : "등록"}
                            </button>
                          </div>
                        ) : (
                          <Link href="/login?next=/community"
                            className="block text-center text-xs font-semibold text-blue-500 hover:text-blue-700 py-2">
                            로그인하고 댓글 달기 →
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 비로그인 안내 */}
          {!userId && (
            <div className="mt-8 rounded-3xl bg-slate-900 p-6 text-center">
              <p className="text-white font-bold mb-2">내 분석을 공유하고 싶으신가요?</p>
              <p className="text-slate-400 text-sm mb-4">로그인하면 시뮬레이션 결과를 공유하고 댓글을 남길 수 있어요.</p>
              <Link href="/login?next=/community"
                className="inline-block rounded-2xl bg-white text-slate-900 px-8 py-3 text-sm font-bold hover:bg-slate-100 transition">
                로그인하기
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

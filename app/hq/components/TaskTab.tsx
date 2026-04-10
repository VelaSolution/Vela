"use client";
import { useState, useEffect } from "react";
import type { HQRole, Task, Goal, TaskComment } from "@/app/hq/types";
import { sb, I, C, L, B, B2, BADGE, ST } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const STATUSES = [
  { key: "pending", label: "\ub300\uae30" },
  { key: "in_progress", label: "\uc9c4\ud589\uc911" },
  { key: "review", label: "\uac80\ud1a0" },
  { key: "completed", label: "\uc644\ub8cc" },
] as const;

const STATUS_DOT: Record<string, string> = {
  pending: "bg-slate-400",
  in_progress: "bg-amber-400",
  review: "bg-purple-400",
  completed: "bg-emerald-400",
};

const PRIORITIES = [
  { key: "\uae34\uae09", color: "bg-red-500 text-white", border: "border-red-400", dot: "bg-red-500" },
  { key: "\ub192\uc74c", color: "bg-orange-100 text-orange-700", border: "border-orange-300", dot: "bg-orange-500" },
  { key: "\ubcf4\ud1b5", color: "bg-slate-100 text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
  { key: "\ub0ae\uc74c", color: "bg-blue-50 text-blue-500", border: "border-blue-200", dot: "bg-blue-400" },
] as const;
type Priority = typeof PRIORITIES[number]["key"];

const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map(p => [p.key, p]));

const EMPTY = { title: "", assignee: "", deadline: "", goal_id: "", priority: "\ubcf4\ud1b5" as Priority, progress: "0" };

function isOverdue(deadline: string | null | undefined, status: string): boolean {
  if (!deadline || status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dl = new Date(deadline);
  dl.setHours(0, 0, 0, 0);
  return dl.getTime() < today.getTime();
}

export default function TaskTab({ userId, userName, flash }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState<"list" | "kanban">("list");
  const [comments, setComments] = useState<Record<string, TaskComment[]>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "mine">("all");

  useEffect(() => {
    load();
    loadComments();
  }, []);

  async function loadComments() {
    const s = sb();
    if (!s) return;
    try {
      const { data } = await s.from("hq_task_comments").select("*").order("created_at", { ascending: true });
      if (data) {
        const grouped: Record<string, TaskComment[]> = {};
        for (const r of data as any[]) {
          const tid = r.task_id;
          if (!grouped[tid]) grouped[tid] = [];
          grouped[tid].push({ id: r.id, author: r.author, text: r.text, time: r.created_at });
        }
        setComments(grouped);
      }
    } catch {}
  }

  async function load() {
    const s = sb();
    if (!s) return;
    const [tRes, gRes] = await Promise.all([
      s.from("hq_tasks").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      s.from("hq_goals").select("*").eq("user_id", userId).eq("status", "active"),
    ]);
    setTasks((tRes.data as Task[]) ?? []);
    setGoals((gRes.data as Goal[]) ?? []);
  }

  async function save() {
    if (!form.title.trim()) { flash("\ud0dc\uc2a4\ud06c \uc81c\ubaa9\uc744 \uc785\ub825\ud558\uc138\uc694"); return; }
    setSaving(true);
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_tasks").insert({
      user_id: userId,
      title: form.title,
      assignee: form.assignee || userName,
      deadline: form.deadline || null,
      goal_id: form.goal_id || null,
      status: "pending",
      result: JSON.stringify({ priority: form.priority, progress: Number(form.progress) || 0 }),
    });
    if (error) flash("\uc800\uc7a5 \uc2e4\ud328: " + error.message);
    else { flash("\ud0dc\uc2a4\ud06c \uc0dd\uc131 \uc644\ub8cc"); setForm({ ...EMPTY }); await load(); }
    setSaving(false);
  }

  async function updateStatus(id: string, status: string) {
    const s = sb();
    if (!s) return;
    await s.from("hq_tasks").update({ status }).eq("id", id);
    await load();
  }

  async function updateProgress(id: string, progress: number) {
    const s = sb();
    if (!s) return;
    const task = tasks.find(t => t.id === id);
    const meta = parseResultMeta(task?.result);
    meta.progress = progress;
    await s.from("hq_tasks").update({ result: JSON.stringify(meta) }).eq("id", id);
    await load();
  }

  async function remove(id: string) {
    const s = sb();
    if (!s) return;
    await s.from("hq_tasks").delete().eq("id", id);
    flash("\uc0ad\uc81c \uc644\ub8cc");
    await load();
  }

  async function addComment(taskId: string) {
    const text = commentInputs[taskId]?.trim();
    if (!text) return;
    const s = sb();
    if (!s) return;
    const { error } = await s.from("hq_task_comments").insert({ task_id: taskId, author: userName, text });
    if (error) { flash("\ub313\uae00 \uc800\uc7a5 \uc2e4\ud328"); return; }
    setCommentInputs((p) => ({ ...p, [taskId]: "" }));
    loadComments();
  }

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const goalMap = Object.fromEntries(goals.map((g) => [g.id, g.title]));

  function parseResultMeta(result: string | undefined | null): { priority: Priority; progress: number } {
    if (!result) return { priority: "\ubcf4\ud1b5", progress: 0 };
    try {
      const parsed = JSON.parse(result);
      return {
        priority: parsed.priority || "\ubcf4\ud1b5",
        progress: typeof parsed.progress === "number" ? parsed.progress : 0,
      };
    } catch {
      return { priority: "\ubcf4\ud1b5", progress: 0 };
    }
  }

  function dDayBadge(deadline: string | null | undefined) {
    if (!deadline) return null;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    const dl = new Date(deadline);
    dl.setHours(0, 0, 0, 0);
    const diff = Math.round((dl.getTime() - todayDate.getTime()) / 86400000);
    if (diff === 0) return <span className={`${BADGE} text-[10px] bg-red-50 text-red-600`}>D-DAY</span>;
    if (diff < 0) return <span className={`${BADGE} text-[10px] bg-red-50 text-red-600`}>D+{Math.abs(diff)} \uc9c0\uc5f0</span>;
    if (diff <= 3) return <span className={`${BADGE} text-[10px] bg-amber-50 text-amber-600`}>D-{diff}</span>;
    return <span className={`${BADGE} text-[10px] bg-slate-50 text-slate-500`}>D-{diff}</span>;
  }

  function priorityBadge(priority: Priority) {
    const p = PRIORITY_MAP[priority] ?? PRIORITY_MAP["\ubcf4\ud1b5"];
    return <span className={`${BADGE} text-[10px] ${p.color}`}>{priority}</span>;
  }

  function progressBar(progress: number) {
    return (
      <div className="flex items-center gap-1.5 min-w-[80px]">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              progress >= 100 ? "bg-emerald-500" : progress >= 50 ? "bg-[#3182F6]" : "bg-amber-400"
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400 font-medium w-8 text-right">{progress}%</span>
      </div>
    );
  }

  const filteredTasks = filterMode === "mine"
    ? tasks.filter(t => t.assignee === userName)
    : tasks;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">\ud0dc\uc2a4\ud06c \uad00\ub9ac</h2>
        <div className="flex gap-2 items-center">
          {/* My tasks / All filter */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${filterMode === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              onClick={() => setFilterMode("all")}
            >
              \uc804\uccb4
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${filterMode === "mine" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              onClick={() => setFilterMode("mine")}
            >
              \ub0b4 \ud0dc\uc2a4\ud06c
            </button>
          </div>
          {/* View toggle */}
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              onClick={() => setView("list")}
            >
              \ub9ac\uc2a4\ud2b8
            </button>
            <button
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${view === "kanban" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              onClick={() => setView("kanban")}
            >
              \uce78\ubc18
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className={C}>
        <h3 className="mb-4 text-sm font-bold text-slate-700">\uc0c8 \ud0dc\uc2a4\ud06c</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={L}>\uc81c\ubaa9</label>
            <input className={I} placeholder="\ud0dc\uc2a4\ud06c \uc81c\ubaa9" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className={L}>\ub2f4\ub2f9\uc790</label>
            <input className={I} placeholder={userName} value={form.assignee} onChange={(e) => set("assignee", e.target.value)} />
          </div>
          <div>
            <label className={L}>\ub9c8\uac10\uc77c</label>
            <input type="date" className={I} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
          </div>
          <div>
            <label className={L}>\uc6b0\uc120\uc21c\uc704</label>
            <div className="flex gap-1.5 flex-wrap">
              {PRIORITIES.map(p => (
                <button
                  key={p.key}
                  onClick={() => set("priority", p.key)}
                  className={`${BADGE} text-[10px] transition-all ${form.priority === p.key ? p.color + " ring-2 ring-offset-1 ring-blue-300" : "bg-slate-50 text-slate-400"}`}
                >
                  {p.key}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className={L}>\uc9c4\ud589\ub960 ({form.progress}%)</label>
            <input type="range" min="0" max="100" step="5" className="w-full accent-[#3182F6]" value={form.progress} onChange={(e) => set("progress", e.target.value)} />
          </div>
          <div>
            <label className={L}>\uc5f0\uacb0 \ubaa9\ud45c</label>
            <select className={I} value={form.goal_id} onChange={(e) => set("goal_id", e.target.value)}>
              <option value="">\uc5c6\uc74c</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button className={B} onClick={save} disabled={saving}>
              {saving ? "\uc0dd\uc131 \uc911..." : "\ud0dc\uc2a4\ud06c \uc0dd\uc131"}
            </button>
          </div>
        </div>
      </div>

      {/* List View */}
      {view === "list" && (
        <div className="space-y-2">
          {filteredTasks.map((t) => {
            const st = ST[t.status] ?? ST.pending;
            const dot = STATUS_DOT[t.status] ?? "bg-slate-400";
            const tc = comments[t.id] ?? [];
            const isExpanded = expandedTask === t.id;
            const meta = parseResultMeta(t.result);
            const overdue = isOverdue(t.deadline, t.status);
            return (
              <div key={t.id} className={`${C} ${overdue ? "border-red-300 border-l-4" : ""}`}>
                <div className="flex items-center gap-3">
                  <div className={`h-2.5 w-2.5 rounded-full ${dot} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        className="truncate text-sm font-semibold text-slate-800 text-left hover:text-[#3182F6]"
                        onClick={() => setExpandedTask(isExpanded ? null : t.id)}
                      >
                        {t.title}
                      </button>
                      {priorityBadge(meta.priority)}
                      {dDayBadge(t.deadline)}
                      {t.goal_id && goalMap[t.goal_id] && (
                        <span className={`${BADGE} text-[10px] bg-blue-50 text-blue-600`}>
                          {goalMap[t.goal_id]}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-xs text-slate-400">
                        {t.assignee} &middot; {t.deadline || "\ub9c8\uac10\uc77c \uc5c6\uc74c"}
                      </p>
                      {progressBar(meta.progress)}
                    </div>
                  </div>
                  <select
                    className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none"
                    value={t.status}
                    onChange={(e) => updateStatus(t.id, e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s.key} value={s.key}>{s.label}</option>
                    ))}
                  </select>
                  <button className="text-xs text-red-400 hover:text-red-600" onClick={() => remove(t.id)}>
                    \uc0ad\uc81c
                  </button>
                </div>

                {/* Expanded: Comments + Progress update */}
                {isExpanded && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    {/* Progress slider */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold text-slate-500">\uc9c4\ud589\ub960:</span>
                      <input
                        type="range" min="0" max="100" step="5"
                        className="flex-1 accent-[#3182F6]"
                        value={meta.progress}
                        onChange={(e) => updateProgress(t.id, Number(e.target.value))}
                      />
                      <span className="text-xs font-bold text-[#3182F6] w-10 text-right">{meta.progress}%</span>
                    </div>

                    {tc.length > 0 && (
                      <div className="mb-2 space-y-1.5">
                        {tc.map((c) => (
                          <div key={c.id} className="rounded-lg bg-slate-50 px-3 py-2 text-xs">
                            <span className="font-semibold text-slate-700">{c.author}</span>
                            <span className="ml-2 text-slate-400">{new Date(c.time).toLocaleString("ko-KR")}</span>
                            <p className="mt-0.5 text-slate-600">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-blue-400"
                        placeholder="\ucf54\uba58\ud2b8 \uc785\ub825..."
                        value={commentInputs[t.id] ?? ""}
                        onChange={(e) => setCommentInputs((p) => ({ ...p, [t.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === "Enter" && addComment(t.id)}
                      />
                      <button className={`${B2} text-xs`} onClick={() => addComment(t.id)}>
                        \ucd94\uac00
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {filteredTasks.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-400">\ud0dc\uc2a4\ud06c\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.</p>
          )}
        </div>
      )}

      {/* Kanban View */}
      {view === "kanban" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);
            const dot = STATUS_DOT[col.key];
            return (
              <div key={col.key} className="rounded-2xl bg-slate-50/80 p-3">
                <div className="mb-3 flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${dot}`} />
                  <h4 className="text-xs font-bold text-slate-600">{col.label}</h4>
                  <span className="ml-auto text-xs text-slate-400">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((t) => {
                    const meta = parseResultMeta(t.result);
                    const overdue = isOverdue(t.deadline, t.status);
                    return (
                      <div key={t.id} className={`rounded-xl border bg-white p-3 shadow-sm ${overdue ? "border-red-300 border-l-4" : "border-slate-200/60"}`}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                          {priorityBadge(meta.priority)}
                          {dDayBadge(t.deadline)}
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {t.assignee} &middot; {t.deadline || "\ub9c8\uac10\uc77c \uc5c6\uc74c"}
                        </p>
                        {/* Progress bar */}
                        <div className="mt-1.5">{progressBar(meta.progress)}</div>
                        {t.goal_id && goalMap[t.goal_id] && (
                          <span className={`${BADGE} mt-1.5 text-[10px] bg-blue-50 text-blue-600`}>
                            {goalMap[t.goal_id]}
                          </span>
                        )}
                        <div className="mt-2 flex gap-1 flex-wrap">
                          {STATUSES.filter((s) => s.key !== col.key).map((s) => (
                            <button
                              key={s.key}
                              className="rounded-md bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                              onClick={() => updateStatus(t.id, s.key)}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && (
                    <p className="py-4 text-center text-xs text-slate-300">\ube44\uc5b4 \uc788\uc74c</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

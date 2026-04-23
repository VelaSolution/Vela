import { ChatMsg } from "@/app/hq/types";

export interface EnrichedMsg extends ChatMsg {
  sender: string;
  created_at: string;
  reply_to?: { sender: string; text: string } | null;
  reactions?: Record<string, string[]>;
  receiver?: string;
  type?: "message" | "vote";
  vote_data?: VoteData | null;
}

export interface TeamMemberSimple {
  id: string;
  name: string;
}

export const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

export interface VoteData {
  question: string;
  options: string[];
  votes: Record<string, string[]>; // optionIndex -> userName[]
  anonymous: boolean;
  deadline?: string;
}

export type UserStatus = "접속중" | "자리비움" | "외근" | "휴가" | "오프라인";
export const STATUS_CONFIG: Record<UserStatus, { color: string; dot: string; label: string }> = {
  "접속중": { color: "bg-emerald-500", dot: "bg-emerald-400", label: "접속중" },
  "자리비움": { color: "bg-amber-500", dot: "bg-amber-400", label: "자리비움" },
  "외근": { color: "bg-blue-500", dot: "bg-blue-400", label: "외근" },
  "휴가": { color: "bg-purple-500", dot: "bg-purple-400", label: "휴가" },
  "오프라인": { color: "bg-slate-400", dot: "bg-slate-300", label: "오프라인" },
};

export function mapRow(d: any): EnrichedMsg {
  return {
    id: d.id,
    sender: d.sender ?? "",
    receiver: d.receiver ?? "",
    text: d.text ?? "",
    created_at: d.created_at ?? "",
    time: d.created_at ? new Date(d.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "",
    reply_to: d.reply_to ?? null,
    reactions: d.reactions ?? {},
    type: d.type ?? "message",
    vote_data: d.vote_data ?? null,
  };
}

export const avatarColor = (name: string) => {
  const colors = [
    "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500",
    "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-rose-500",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export function dateSeparatorLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yest = new Date(now);
  yest.setDate(yest.getDate() - 1);
  const yesterdayStr = yest.toISOString().slice(0, 10);
  const ds = d.toISOString().slice(0, 10);
  if (ds === todayStr) return "오늘";
  if (ds === yesterdayStr) return "어제";
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function groupByDate(msgs: EnrichedMsg[]) {
  const groups: { label: string; msgs: EnrichedMsg[] }[] = [];
  let currentDate = "";
  for (const m of msgs) {
    const d = m.created_at ? m.created_at.slice(0, 10) : "";
    if (d !== currentDate) {
      currentDate = d;
      groups.push({ label: dateSeparatorLabel(m.created_at), msgs: [m] });
    } else {
      groups[groups.length - 1].msgs.push(m);
    }
  }
  return groups;
}

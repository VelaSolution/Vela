"use client";
import { useState, useEffect, useRef } from "react";
import { HQRole, ChatMsg } from "@/app/hq/types";
import { sb, I, B, C } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

export default function ChatTab({ userId, userName, myRole, flash }: Props) {
  const [messages, setMessages] = useState<(ChatMsg & { sender: string })[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const { data } = await s.from("hq_chat").select("*").order("created_at", { ascending: true }).limit(200);
    if (data) {
      setMessages(
        data.map((d: any) => ({
          id: d.id,
          sender: d.sender ?? "",
          text: d.text ?? "",
          time: d.created_at ? new Date(d.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }) : "",
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const s = sb();
    if (!s) return;
    await s.from("hq_chat").insert({ sender: userName, text: text.trim() });
    setText("");
    load();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const deleteMsg = async (id: string) => {
    const s = sb();
    if (!s) return;
    await s.from("hq_chat").delete().eq("id", id);
    flash("삭제됨");
    load();
  };

  const avatarColor = (name: string) => {
    const colors = [
      "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500",
      "bg-pink-500", "bg-cyan-500", "bg-indigo-500", "bg-rose-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`${C} flex flex-col`} style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex-shrink-0">팀 채팅</h3>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {loading ? (
          <div className="text-center py-12 text-slate-400">불러오는 중...</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400">메시지가 없습니다. 첫 메시지를 보내보세요!</div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender === userName;
            return (
              <div key={m.id} className={`flex items-end gap-2.5 ${isMe ? "flex-row-reverse" : ""}`}>
                {/* Avatar */}
                {!isMe && (
                  <div className={`w-8 h-8 rounded-full ${avatarColor(m.sender)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {m.sender.charAt(0)}
                  </div>
                )}

                {/* Bubble */}
                <div className={`max-w-[70%] group ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && (
                    <p className="text-xs font-semibold text-slate-500 mb-1 ml-1">{m.sender}</p>
                  )}
                  <div className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isMe ? "bg-[#3182F6] text-white rounded-br-md" : "bg-slate-100 text-slate-800 rounded-bl-md"}`}>
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {/* Delete */}
                    {isMe && (
                      <button
                        onClick={() => deleteMsg(m.id)}
                        className="absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className={`text-[10px] text-slate-400 mt-1 ${isMe ? "text-right mr-1" : "ml-1"}`}>{m.time}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 flex gap-2 pt-3 border-t border-slate-100">
        <input
          className={`${I} flex-1`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
        />
        <button className={`${B} flex-shrink-0`} onClick={send}>
          전송
        </button>
      </div>
    </div>
  );
}

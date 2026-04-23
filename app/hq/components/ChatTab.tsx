"use client";
import { useState, useEffect, useCallback } from "react";
import { HQRole } from "@/app/hq/types";
import { sb, C, useTeamDisplayNames } from "@/app/hq/utils";
import { TeamMemberSimple, UserStatus, STATUS_CONFIG, avatarColor } from "@/app/hq/components/chat/chatHelpers";
import TeamChat from "@/app/hq/components/chat/TeamChat";
import DmChat from "@/app/hq/components/chat/DmChat";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const ALL_STATUSES: UserStatus[] = ["접속중", "자리비움", "외근", "휴가", "오프라인"];

export default function ChatTab({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();
  const [mode, setMode] = useState<"team" | "dm">("team");
  const [allMembers, setAllMembers] = useState<TeamMemberSimple[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberSimple[]>([]);
  const [memberStatuses, setMemberStatuses] = useState<Record<string, UserStatus>>({});
  const [myStatus, setMyStatus] = useState<UserStatus>("접속중");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPresencePanel, setShowPresencePanel] = useState(false);

  // Load members
  useEffect(() => {
    (async () => {
      const s = sb();
      if (!s) return;
      const { data } = await s.from("hq_team").select("id, name").neq("approved", false);
      if (data) {
        const members = data as TeamMemberSimple[];
        setAllMembers(members);
        setTeamMembers(members.filter(m => m.name !== userName));
      }
    })();
  }, [userName]);

  // Load all statuses
  const loadStatuses = useCallback(async () => {
    const s = sb();
    if (!s) return;
    const { data } = await s.from("hq_settings").select("key, value").like("key", "user_status_%");
    if (data) {
      const statuses: Record<string, UserStatus> = {};
      for (const row of data) {
        const name = row.key.replace("user_status_", "");
        try {
          const parsed = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
          statuses[name] = parsed.status || "오프라인";
        } catch {
          statuses[name] = "오프라인";
        }
      }
      setMemberStatuses(statuses);
      if (statuses[userName]) setMyStatus(statuses[userName]);
    }
  }, [userName]);

  // Set own status to 접속중 on load, then load all
  useEffect(() => {
    (async () => {
      const s = sb();
      if (!s) return;
      const key = `user_status_${userName}`;
      const value = { status: "접속중", updated_at: new Date().toISOString() };
      await s.from("hq_settings").upsert({ key, value }, { onConflict: "key" });
      setMyStatus("접속중");
      await loadStatuses();
    })();
  }, [userName, loadStatuses]);

  // Realtime status updates
  useEffect(() => {
    const s = sb();
    if (!s) return;
    const channel = s
      .channel("hq_status_realtime")
      .on("postgres_changes" as any, { event: "*", schema: "public", table: "hq_settings", filter: "key=like.user_status_%" }, (payload: any) => {
        const row = payload.new;
        if (row?.key) {
          const name = row.key.replace("user_status_", "");
          try {
            const parsed = typeof row.value === "string" ? JSON.parse(row.value) : row.value;
            setMemberStatuses(prev => ({ ...prev, [name]: parsed.status || "오프라인" }));
          } catch { /* ignore */ }
        }
      })
      .subscribe();
    return () => { s.removeChannel(channel); };
  }, []);

  const changeStatus = async (newStatus: UserStatus) => {
    const s = sb();
    if (!s) return;
    const key = `user_status_${userName}`;
    const value = { status: newStatus, updated_at: new Date().toISOString() };
    await s.from("hq_settings").upsert({ key, value }, { onConflict: "key" });
    setMyStatus(newStatus);
    setMemberStatuses(prev => ({ ...prev, [userName]: newStatus }));
    setShowStatusDropdown(false);
  };

  const statusCfg = STATUS_CONFIG[myStatus];
  const onlineCount = Object.values(memberStatuses).filter(s => s === "접속중").length;

  return (
    <div className={`${C} flex flex-col`} style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
      {/* Header with mode tabs + status */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMode("team")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === "team" ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            팀 채팅
          </button>
          <button
            onClick={() => setMode("dm")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === "dm" ? "bg-[#3182F6] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            개별 채팅
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Presence panel toggle */}
          <button
            onClick={() => setShowPresencePanel(!showPresencePanel)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              showPresencePanel ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {onlineCount}명 접속중
          </button>

          {/* My status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all text-xs font-semibold text-slate-600"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} />
              {statusCfg.label}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 w-36">
                {ALL_STATUSES.map(st => {
                  const cfg = STATUS_CONFIG[st];
                  return (
                    <button key={st} onClick={() => changeStatus(st)}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${
                        myStatus === st ? "bg-slate-50 font-semibold text-slate-800" : "text-slate-600 hover:bg-slate-50"
                      }`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Presence panel */}
      {showPresencePanel && (
        <div className="flex-shrink-0 mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">팀원 상태</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {allMembers.map(m => {
              const st = memberStatuses[m.name] || "오프라인";
              const cfg = STATUS_CONFIG[st];
              return (
                <div key={m.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-100">
                  <div className="relative flex-shrink-0">
                    <div className={`w-7 h-7 rounded-full ${avatarColor(m.name)} flex items-center justify-center text-white text-xs font-bold`}>
                      {m.name.charAt(0)}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${cfg.dot}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{displayName(m.name)}</p>
                    <p className="text-[10px] text-slate-400">{cfg.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {mode === "team" && (
        <TeamChat userName={userName} allMembers={allMembers} flash={flash} />
      )}

      {mode === "dm" && (
        <DmChat userName={userName} teamMembers={teamMembers} flash={flash} memberStatuses={memberStatuses} />
      )}

      {/* Click outside handler for status dropdown */}
      {showStatusDropdown && (
        <div className="fixed inset-0 z-20" onClick={() => setShowStatusDropdown(false)} />
      )}
    </div>
  );
}

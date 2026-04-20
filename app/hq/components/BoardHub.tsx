"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const BoardTab = dynamic(() => import("./BoardTab"));
const NoticeTab = dynamic(() => import("./NoticeTab"));
const KudosTab = dynamic(() => import("./KudosTab"));
const SurveyTab = dynamic(() => import("./SurveyTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "board", label: "게시판" },
  { key: "notice", label: "공지" },
  { key: "kudos", label: "칭찬" },
  { key: "survey", label: "설문" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function BoardHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("board");

  return (
    <div>
      <div className="flex gap-1 bg-slate-100 rounded-2xl p-1 mb-6">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className={`px-4 py-2.5 text-[14px] font-semibold rounded-xl transition-all ${
              sub === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {sub === "board" && <BoardTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "notice" && <NoticeTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "kudos" && <KudosTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "survey" && <SurveyTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}

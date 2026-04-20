"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const TeamTab = dynamic(() => import("./TeamTab"));
const ContactsTab = dynamic(() => import("./ContactsTab"));
const OrgChartTab = dynamic(() => import("./OrgChartTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

const tabs = [
  { key: "team", label: "팀원" },
  { key: "contacts", label: "주소록" },
  { key: "orgchart", label: "조직도" },
] as const;

type Sub = (typeof tabs)[number]["key"];

export default function TeamHub({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<Sub>("team");

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

      {sub === "team" && <TeamTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "contacts" && <ContactsTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "orgchart" && <OrgChartTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}

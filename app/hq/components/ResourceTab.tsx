"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { HQRole } from "@/app/hq/types";

const BookingTab = dynamic(() => import("./BookingTab"));
const AssetTab = dynamic(() => import("./AssetTab"));
const VisitorTab = dynamic(() => import("./VisitorTab"));
const VehicleLogTab = dynamic(() => import("./VehicleLogTab"));

interface Props { userId: string; userName: string; myRole: HQRole; flash: (m: string) => void }

type SubTab = "booking" | "asset" | "visitor" | "vehicle";

export default function ResourceTab({ userId, userName, myRole, flash }: Props) {
  const [sub, setSub] = useState<SubTab>("booking");
  const tabs: { key: SubTab; label: string }[] = [
    { key: "booking", label: "예약" },
    { key: "asset", label: "자산" },
    { key: "visitor", label: "방문자" },
    { key: "vehicle", label: "차량일지" },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-2xl font-bold text-slate-900">자원관리</h2>
        <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setSub(t.key)}
              className={`px-4 py-2 text-[13px] font-semibold rounded-xl transition-all ${
                sub === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {sub === "booking" && <BookingTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "asset" && <AssetTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "visitor" && <VisitorTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
      {sub === "vehicle" && <VehicleLogTab userId={userId} userName={userName} myRole={myRole} flash={flash} />}
    </div>
  );
}

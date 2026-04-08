"use client";

import { useState, useEffect, useMemo } from "react";
import { HQRole, Contact } from "@/app/hq/types";
import { sb, I, C, L, B, B2, BADGE } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

const LS_KEY = "vela-hq-contacts";

function loadLocal(): Contact[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocal(c: Contact[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(c));
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-600",
  "bg-emerald-100 text-emerald-600",
  "bg-amber-100 text-amber-600",
  "bg-purple-100 text-purple-600",
  "bg-rose-100 text-rose-600",
  "bg-cyan-100 text-cyan-600",
];

function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

export default function ContactsTab({ userId, userName, myRole, flash }: Props) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [view, setView] = useState<"grid" | "org">("grid");
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [extension, setExtension] = useState("");

  const load = async () => {
    const s = sb();
    if (s) {
      const { data, error } = await s
        .from("hq_contacts")
        .select("*")
        .order("name", { ascending: true });
      if (data && !error) {
        const mapped: Contact[] = data.map((r: any) => ({
          id: r.id,
          name: r.name,
          department: r.department || "",
          position: r.position || "",
          phone: r.phone || "",
          email: r.email || "",
          extension: r.extension || "",
          manager: r.manager,
        }));
        setContacts(mapped);
        saveLocal(mapped);
        setLoading(false);
        return;
      }
    }
    // Fallback: localStorage
    setContacts(loadLocal());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!name.trim()) return flash("이름을 입력하세요");
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: name.trim(),
      department: department.trim(),
      position: position.trim(),
      phone: phone.trim(),
      email: email.trim(),
      extension: extension.trim(),
    };

    const s = sb();
    if (s) {
      const { error } = await s.from("hq_contacts").insert({
        id: newContact.id,
        name: newContact.name,
        department: newContact.department,
        position: newContact.position,
        phone: newContact.phone,
        email: newContact.email,
        extension: newContact.extension,
      });
      if (error) {
        // Fallback to local
        const updated = [newContact, ...contacts];
        setContacts(updated);
        saveLocal(updated);
      } else {
        await load();
      }
    } else {
      const updated = [newContact, ...contacts];
      setContacts(updated);
      saveLocal(updated);
    }

    flash("연락처가 추가되었습니다");
    setName("");
    setDepartment("");
    setPosition("");
    setPhone("");
    setEmail("");
    setExtension("");
  };

  const remove = async (id: string) => {
    const s = sb();
    if (s) {
      await s.from("hq_contacts").delete().eq("id", id);
    }
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveLocal(updated);
    flash("삭제되었습니다");
  };

  const departments = useMemo(
    () => [...new Set(contacts.map((c) => c.department).filter(Boolean))].sort(),
    [contacts]
  );

  const filtered = useMemo(() => {
    let r = contacts;
    if (deptFilter) r = r.filter((c) => c.department === deptFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.department.toLowerCase().includes(q) ||
          c.position.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.includes(q)
      );
    }
    return r;
  }, [contacts, search, deptFilter]);

  // Org chart: group by department
  const orgGroups = useMemo(() => {
    const map: Record<string, Contact[]> = {};
    contacts.forEach((c) => {
      const dept = c.department || "미지정";
      if (!map[dept]) map[dept] = [];
      map[dept].push(c);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [contacts]);

  return (
    <div className="space-y-6">
      {/* Search & Filter */}
      <div className={C}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <input
              className={I}
              placeholder="이름, 부서, 직책, 이메일로 검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className={`${I} !w-auto min-w-[140px]`}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">전체 부서</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            <button
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                view === "grid"
                  ? "bg-[#3182F6] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setView("grid")}
            >
              카드
            </button>
            <button
              className={`px-3 py-2 text-xs font-semibold transition-colors ${
                view === "org"
                  ? "bg-[#3182F6] text-white"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setView("org")}
            >
              조직도
            </button>
          </div>
        </div>
      </div>

      {/* Add form */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">연락처 추가</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className={L}>이름</label>
            <input
              className={I}
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={L}>부서</label>
            <input
              className={I}
              placeholder="부서"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
          <div>
            <label className={L}>직책</label>
            <input
              className={I}
              placeholder="직책"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
            />
          </div>
          <div>
            <label className={L}>전화번호</label>
            <input
              className={I}
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className={L}>이메일</label>
            <input
              className={I}
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className={L}>내선번호</label>
            <input
              className={I}
              placeholder="내선번호"
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
            />
          </div>
        </div>
        <button className={`${B} mt-4`} onClick={add}>
          추가
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p className="text-sm text-slate-400 py-12 text-center">불러오는 중...</p>
      ) : view === "grid" ? (
        /* Card grid */
        filtered.length === 0 ? (
          <p className="text-sm text-slate-400 py-12 text-center">
            연락처가 없습니다
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="group bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <button
                  onClick={() => remove(c.id)}
                  className="absolute top-3 right-3 text-xs text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold ${avatarColor(
                      c.name
                    )}`}
                  >
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {c.position && `${c.position}`}
                      {c.position && c.department && " · "}
                      {c.department}
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs text-slate-500">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">📱</span>
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">✉️</span>
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.extension && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300">☎️</span>
                      <span>내선 {c.extension}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Org chart view */
        orgGroups.length === 0 ? (
          <p className="text-sm text-slate-400 py-12 text-center">
            연락처가 없습니다
          </p>
        ) : (
          <div className="space-y-4">
            {orgGroups.map(([dept, members]) => (
              <div key={dept} className={C}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#3182F6]" />
                  <h4 className="text-sm font-bold text-slate-800">{dept}</h4>
                  <span className="text-xs text-slate-400">
                    ({members.length}명)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 border-l-2 border-blue-100">
                  {members.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${avatarColor(
                          c.name
                        )}`}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800">
                          {c.name}
                          {c.position && (
                            <span className="text-xs font-normal text-slate-400 ml-1.5">
                              {c.position}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {[c.phone, c.email].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

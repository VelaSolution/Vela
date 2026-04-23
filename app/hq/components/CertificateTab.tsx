"use client";

import { useState, useEffect } from "react";
import { HQRole } from "@/app/hq/types";
import { sb, I, C, L, B, B2, BADGE, today, useTeamDisplayNames } from "@/app/hq/utils";

interface Props {
  userId: string;
  userName: string;
  myRole: HQRole;
  flash: (m: string) => void;
}

type CertType = "재직증명서" | "경력증명서" | "퇴직증명서";

interface CertRecord {
  id: string;
  employee_name: string;
  cert_type: CertType;
  cert_number: string;
  issued_by: string;
  created_at: string;
}

type TeamMember = {
  name: string;
  role: string;
  hqRole: string;
  join_date?: string;
  department?: string;
  position?: string;
};

const CERT_TYPES: CertType[] = ["재직증명서", "경력증명서", "퇴직증명서"];

function generateCertNumber(): string {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `CERT-${dateStr}-${seq}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function openCertificateWindow(opts: {
  certType: CertType;
  employeeName: string;
  certNumber: string;
  joinDate: string;
  department: string;
  position: string;
  issuedBy: string;
  issueDate: string;
}) {
  const { certType, employeeName, certNumber, joinDate, department, position, issuedBy, issueDate } = opts;

  const bodyTextMap: Record<CertType, string> = {
    "재직증명서": `위 사람은 당사에 ${joinDate || "(입사일 미상)"}부터 현재까지 ${department ? department + " " : ""}${position || "직원"}(으)로 재직하고 있음을 증명합니다.`,
    "경력증명서": `위 사람은 당사에 ${joinDate || "(입사일 미상)"}부터 현재까지 ${department ? department + " " : ""}${position || "직원"}(으)로 근무하였으며, 그 경력을 증명합니다.`,
    "퇴직증명서": `위 사람은 당사에 ${joinDate || "(입사일 미상)"}부터 퇴직일까지 ${department ? department + " " : ""}${position || "직원"}(으)로 근무하였으며, 퇴직하였음을 증명합니다.`,
  };

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>${certType} - ${employeeName}</title>
<style>
  @media print {
    body { margin: 0; }
    .no-print { display: none !important; }
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Batang', 'NanumMyeongjo', serif; background: #f5f5f5; }
  .page {
    width: 210mm; min-height: 297mm; margin: 20px auto; background: #fff;
    padding: 60px 50px; position: relative; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header { text-align: center; margin-bottom: 60px; }
  .header h1 { font-size: 32px; letter-spacing: 12px; border-bottom: 3px double #333; display: inline-block; padding-bottom: 10px; }
  .cert-number { text-align: right; font-size: 13px; color: #666; margin-bottom: 40px; }
  .info-table { width: 100%; border-collapse: collapse; margin-bottom: 50px; }
  .info-table th, .info-table td { border: 1px solid #333; padding: 12px 16px; font-size: 15px; }
  .info-table th { background: #f9f9f9; width: 25%; text-align: center; font-weight: bold; }
  .info-table td { width: 75%; }
  .body-text { font-size: 16px; line-height: 2; text-indent: 2em; margin-bottom: 60px; }
  .date-section { text-align: center; font-size: 16px; margin-bottom: 50px; }
  .company-section { text-align: center; margin-top: 60px; }
  .company-name { font-size: 20px; font-weight: bold; margin-bottom: 20px; }
  .seal {
    display: inline-block; width: 80px; height: 80px; border: 3px solid #c00;
    border-radius: 50%; color: #c00; font-size: 14px; font-weight: bold;
    line-height: 1.3; display: inline-flex; align-items: center; justify-content: center;
    text-align: center; margin-top: 10px;
  }
  .issuer { font-size: 14px; color: #666; margin-top: 10px; }
  .print-btn {
    position: fixed; bottom: 30px; right: 30px;
    background: #3182F6; color: #fff; border: none; padding: 14px 28px;
    font-size: 16px; font-weight: bold; border-radius: 12px; cursor: pointer;
    box-shadow: 0 4px 12px rgba(49,130,246,0.3);
  }
  .print-btn:hover { background: #2672DE; }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <h1>${certType}</h1>
  </div>
  <div class="cert-number">문서번호: ${certNumber}</div>
  <table class="info-table">
    <tr><th>성 명</th><td>${employeeName}</td></tr>
    <tr><th>소 속</th><td>${department || "벨라솔루션"}</td></tr>
    <tr><th>직 위</th><td>${position || "-"}</td></tr>
    <tr><th>입사일</th><td>${joinDate || "-"}</td></tr>
  </table>
  <p class="body-text">${bodyTextMap[certType]}</p>
  <div class="date-section">${issueDate}</div>
  <div class="company-section">
    <div class="company-name">주식회사 벨라솔루션</div>
    <div class="seal">벨라<br/>솔루션</div>
    <div class="issuer">발급자: ${issuedBy}</div>
  </div>
</div>
<button class="print-btn no-print" onclick="window.print()">인쇄하기</button>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
  }
}

export default function CertificateTab({ userId, userName, myRole, flash }: Props) {
  const { displayName } = useTeamDisplayNames();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [history, setHistory] = useState<CertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [historySearch, setHistorySearch] = useState("");

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [certType, setCertType] = useState<CertType>("재직증명서");

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const s = sb();
    if (!s) { setLoading(false); return; }
    const [{ data: teamData }, { data: certData }] = await Promise.all([
      s.from("hq_team").select("name, role, hq_role, created_at").neq("approved", false).order("name"),
      s.from("hq_certificates").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (teamData) {
      setTeamMembers((teamData as any[]).map(m => ({
        name: m.name,
        role: m.role ?? "",
        hqRole: m.hq_role ?? "팀원",
        join_date: m.created_at ? new Date(m.created_at).toISOString().slice(0, 10) : "",
        department: "",
        position: m.hq_role ?? "팀원",
      })));
    }
    if (certData) setHistory(certData as CertRecord[]);
    setLoading(false);
  }

  const selectedMember = teamMembers.find(m => m.name === selectedEmployee);

  async function handleIssue() {
    if (!selectedEmployee) return flash("직원을 선택하세요");
    const s = sb();
    if (!s) return;

    const certNumber = generateCertNumber();
    const issueDate = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });

    // Save to DB
    const { error } = await s.from("hq_certificates").insert({
      employee_name: selectedEmployee,
      cert_type: certType,
      cert_number: certNumber,
      issued_by: userName,
    });
    if (error) return flash("발급 기록 저장 실패: " + error.message);

    // Open printable window
    openCertificateWindow({
      certType,
      employeeName: selectedEmployee,
      certNumber,
      joinDate: selectedMember?.join_date ?? "",
      department: selectedMember?.department ?? "벨라솔루션",
      position: selectedMember?.position ?? selectedMember?.hqRole ?? "",
      issuedBy: userName,
      issueDate,
    });

    flash(`${certType}가 발급되었습니다 (${certNumber})`);
    loadData();
  }

  const filteredHistory = history.filter(h => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return h.employee_name.toLowerCase().includes(q)
      || h.cert_type.toLowerCase().includes(q)
      || h.cert_number.toLowerCase().includes(q);
  });

  if (loading) return <p className="text-center text-sm text-slate-400 py-12">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-slate-900">재직증명서 발급</h2>

      {/* Issue Form */}
      <div className={C}>
        <h3 className="text-lg font-bold text-slate-800 mb-4">증명서 발급</h3>
        <div className="space-y-4">
          <div>
            <label className={L}>직원 선택</label>
            <select className={I} value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)}>
              <option value="">직원을 선택하세요</option>
              {teamMembers.map(m => (
                <option key={m.name} value={m.name}>{m.name} ({m.hqRole})</option>
              ))}
            </select>
          </div>

          <div>
            <label className={L}>증명서 종류</label>
            <select className={I} value={certType} onChange={e => setCertType(e.target.value as CertType)}>
              {CERT_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Auto-fill preview */}
          {selectedMember && (
            <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
              <p className="text-xs font-semibold text-slate-500 mb-2">자동 입력 정보</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-400">회사명</span>
                  <p className="text-sm font-medium text-slate-700">주식회사 벨라솔루션</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">입사일</span>
                  <p className="text-sm font-medium text-slate-700">{selectedMember.join_date || "-"}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">소속</span>
                  <p className="text-sm font-medium text-slate-700">{selectedMember.department || "벨라솔루션"}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400">직위</span>
                  <p className="text-sm font-medium text-slate-700">{selectedMember.position || selectedMember.hqRole}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button className={B} onClick={handleIssue}>발급</button>
          </div>
        </div>
      </div>

      {/* Issue History */}
      <div className={C}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">발급 이력</h3>
          <span className="text-xs text-slate-400">{history.length}건</span>
        </div>
        <div className="mb-4">
          <input className={`${I} !py-2 !text-sm`}
            placeholder="이름, 종류, 문서번호 검색..."
            value={historySearch} onChange={e => setHistorySearch(e.target.value)}
          />
        </div>
        {filteredHistory.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">발급 이력이 없습니다</p>
        ) : (
          <div className="space-y-2">
            {filteredHistory.map(h => (
              <div key={h.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-sm">
                    {h.cert_type === "재직증명서" ? "📄" : h.cert_type === "경력증명서" ? "📋" : "📑"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-slate-800">{displayName(h.employee_name)}</span>
                      <span className={`${BADGE} text-[10px] bg-blue-50 text-blue-700`}>{h.cert_type}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {h.cert_number} | 발급자: {displayName(h.issued_by)}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{formatDate(h.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

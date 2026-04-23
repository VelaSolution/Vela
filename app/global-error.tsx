"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F7F8FA" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #3182F6, #60a5fa)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 800, color: "#fff" }}>V</div>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#191F28" }}>VELA</span>
            </div>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#191F28", marginBottom: 8 }}>예상치 못한 오류</h1>
            <p style={{ fontSize: 14, color: "#6B7684", marginBottom: 8, lineHeight: 1.6 }}>
              페이지를 불러오는 중 심각한 오류가 발생했습니다.<br />
              새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            {error.digest && (
              <p style={{ fontSize: 12, color: "#ADB5BD", marginBottom: 20, fontFamily: "monospace" }}>
                오류 코드: {error.digest}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
              <button
                onClick={reset}
                style={{ background: "#191F28", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                다시 시도
              </button>
              <a
                href="/"
                style={{ background: "#F1F3F5", color: "#191F28", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer", textDecoration: "none", display: "inline-block" }}
              >
                홈으로
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

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
          <div style={{ textAlign: "center", maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#191F28", marginBottom: 8 }}>예상치 못한 오류</h1>
            <p style={{ fontSize: 14, color: "#6B7684", marginBottom: 24, lineHeight: 1.6 }}>
              페이지를 불러오는 중 심각한 오류가 발생했습니다.<br />
              새로고침하거나 잠시 후 다시 시도해주세요.
            </p>
            <button
              onClick={reset}
              style={{ background: "#191F28", color: "#fff", border: "none", borderRadius: 12, padding: "12px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              다시 시도
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

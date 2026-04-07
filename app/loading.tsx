export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      {/* 빠른 전환 시 깜빡임 방지: 0.3초 후에만 스피너 표시 */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeInDelay { 0%, 80% { opacity: 0 } 100% { opacity: 1 } }
        .vela-loading-spinner {
          animation: fadeInDelay 0.4s ease-out forwards, spin 0.8s linear 0.4s infinite;
          opacity: 0;
        }
      `}</style>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "40vh" }}>
        <div className="vela-loading-spinner" style={{
          width: 32, height: 32, border: "3px solid #E5E8EB", borderTopColor: "#3182F6",
          borderRadius: "50%",
        }} />
      </div>
    </div>
  );
}

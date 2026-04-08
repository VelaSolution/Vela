"use client";

/** iOS 스타일 토글 스위치 — 모든 곳에서 동일한 모양 */
export default function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 51,
        height: 31,
        borderRadius: 16,
        background: checked ? "#34C759" : "#E5E8EB",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
        padding: 0,
        minHeight: "auto",
        display: "inline-block",
        fontSize: "inherit",
        fontWeight: "inherit",
        lineHeight: "inherit",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: 14,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          transition: "left 0.2s",
        }}
      />
    </button>
  );
}

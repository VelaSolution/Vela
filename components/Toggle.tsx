"use client";

/** iOS 설정 화면과 동일한 토글 스위치 */
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
        borderRadius: 31,
        background: checked ? "#34C759" : "#E9E9EA",
        border: "none",
        cursor: "pointer",
        transition: "background 0.3s ease",
        flexShrink: 0,
        padding: 0,
        WebkitTapHighlightColor: "transparent",
        outline: "none",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 27,
          height: 27,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 3px 8px rgba(0,0,0,0.15), 0 1px 1px rgba(0,0,0,0.16)",
          transition: "left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      />
    </button>
  );
}

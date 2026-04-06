import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 40,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ fontSize: 100, fontWeight: 900, color: "#ffffff", letterSpacing: "-0.04em" }}>V</span>
          <span style={{ fontSize: 100, fontWeight: 900, color: "#3182F6" }}>.</span>
        </div>
      </div>
    ),
    { ...size }
  );
}

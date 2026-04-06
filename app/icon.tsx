import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          borderRadius: 8,
          fontFamily: "sans-serif",
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 900, color: "#3182F6" }}>V</span>
      </div>
    ),
    { ...size }
  );
}

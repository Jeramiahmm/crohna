import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Crohna — Your Life, Beautifully Mapped";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAF8F5 0%, #F0EDE8 50%, #E8E4DD 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Accent dot */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            backgroundColor: "#3D5A44",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Brand name */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#111111",
            letterSpacing: "-0.01em",
            marginBottom: 24,
            fontFamily: "sans-serif",
          }}
        >
          Crohna
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 400,
            color: "#111111",
            lineHeight: 1.1,
            textAlign: "center",
            maxWidth: 900,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Your life,</span>
          <span>
            <span style={{ fontStyle: "italic", color: "#3D5A44" }}>beautifully</span>{" "}
            <span style={{ fontWeight: 700 }}>mapped</span>
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(17, 17, 17, 0.5)",
            marginTop: 24,
            fontFamily: "sans-serif",
            fontWeight: 400,
          }}
        >
          The visual timeline that turns memories into beautiful stories.
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            backgroundColor: "#3D5A44",
          }}
        />
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const alt = "Danial CN, премиум багаж";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "#0b0b0b",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: 10,
            opacity: 0.5,
            marginBottom: 28,
          }}
        >
          PREMIUM LUGGAGE
        </div>
        <div
          style={{
            fontSize: 96,
            letterSpacing: 14,
            fontWeight: 500,
          }}
        >
          DANIAL CN
        </div>
      </div>
    ),
    { ...size },
  );
}

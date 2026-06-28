import { ImageResponse } from "next/og";

// サイト共通の OGP 画像(1200x630)。モノクロのブランドカード。
// 個別アプリページは generateMetadata 側で app.image_url を指定して上書きする。
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "onebuzz ポータル";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#0a0a0a",
          color: "#ededed",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        {/* ブランドマーク */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 28,
            background: "#ededed",
            color: "#0a0a0a",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: -3,
            marginBottom: 48,
          }}
        >
          ob
        </div>

        {/* ワードマーク */}
        <div
          style={{
            fontSize: 104,
            fontWeight: 700,
            letterSpacing: -4,
            lineHeight: 1,
          }}
        >
          onebuzz
        </div>

        {/* ラベル */}
        <div
          style={{
            marginTop: 28,
            fontSize: 30,
            fontWeight: 500,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#8f8f8f",
          }}
        >
          Portal
        </div>
      </div>
    ),
    { ...size },
  );
}

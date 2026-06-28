import type { MetadataRoute } from "next";

// PWA / インストール時のメタ情報。アイコンは icon.svg / apple-icon を流用。
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "onebuzz ポータル",
    short_name: "onebuzz",
    description: "診断・フィットネス・健康のアプリをまとめて紹介するポータル",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
    ],
  };
}

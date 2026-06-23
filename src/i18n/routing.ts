import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 対応言語: 日本語 / 英語 / 中国語(簡体字)
  locales: ["ja", "en", "zh"],
  defaultLocale: "ja",
});

export type Locale = (typeof routing.locales)[number];

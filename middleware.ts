import createMiddleware from "next-intl/middleware";
import { type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

/**
 * ★唯一の必須要件: アフィリエイト click_id の引き継ぎ
 *
 * パートナー経由の流入(?aff_click_id=XXX)時に、親ドメイン Cookie
 * `aff_click_id`(Domain=.onebuzz.net)へラストクリックで上書き保存する。
 * 配下のアプリ(*.onebuzz.net)が SDK で読む既定名。
 * 仕様: docs/06_affiliate_clickid.md(厳守)
 *
 * 同時に next-intl のロケール振り分け(/ja /en /zh)も行う。
 */
export default function middleware(req: NextRequest) {
  // 先に i18n のルーティング応答を生成し、その応答に Cookie を載せる
  const res = intlMiddleware(req);

  const cid = req.nextUrl.searchParams.get("aff_click_id");
  if (cid) {
    const isProd = process.env.NODE_ENV === "production";
    res.cookies.set("aff_click_id", cid, {
      // 本番のみ親ドメイン共有(localhost では .onebuzz.net を付けられないため未指定)
      domain: isProd ? ".onebuzz.net" : undefined,
      path: "/",
      maxAge: 2592000, // 30日
      sameSite: "lax",
      secure: isProd,
      httpOnly: false, // click_id は秘密情報ではない(最終帰属はアプリ側のサーバ署名で担保)
    });
  }

  return res;
}

export const config = {
  // 静的ファイル・API・Next 内部以外の全ページを対象にする
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

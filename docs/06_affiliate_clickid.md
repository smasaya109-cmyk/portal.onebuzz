# 06. アフィリエイト click_id 引き継ぎ(★唯一の必須要件)

> ステータス: ✅確定(仕様厳守)
> 出典: 構築指示書(2026-06-23 受領)

このポータルの **機能上の核心はこれ一つ**。ほかの一覧表示などは付随要素であり、本要件を正確に満たすことを最優先する。

## 1. 役割と前提

- `portal.onebuzz.net` で動く、一般ユーザー向けのアプリ紹介ポータル(カタログ / LP)。
- 各アプリ(`*.onebuzz.net` のサブドメイン)へ送客する。
- **アカウント登録・決済・成果送信(trackConversion)は一切やらない**(アプリ側の責務)。
- パートナー経由の流入時、URL に `?aff_click_id=XXX` が付く。これを **親ドメイン Cookie** に保存し、配下のアプリ(サブドメイン)が読めるようにする。

## 2. Cookie 仕様(厳守)

| 項目 | 値 |
|---|---|
| 名前 | `aff_click_id`(**この名前固定**。アプリ側SDKが読む既定名) |
| Domain | `.onebuzz.net`(先頭ドット = 全サブドメイン共有) |
| Path | `/` |
| 有効期限 | 30日(`2592000` 秒) |
| SameSite | `Lax` |
| Secure | 本番 `true`(開発は `false`) |
| HttpOnly | `false`(click_id は秘密情報ではない。最終帰属はサーバ署名で担保) |

**挙動**: `?aff_click_id` が有れば毎回その Cookie を**上書き保存(ラストクリック)**。無ければ何もしない。

## 3. 実装(Next.js middleware)

```ts
// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const cid = req.nextUrl.searchParams.get("aff_click_id");
  if (cid) {
    res.cookies.set("aff_click_id", cid, {
      domain: ".onebuzz.net",
      path: "/",
      maxAge: 2592000,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    });
  }
  return res;
}

export const config = { matcher: "/:path*" };
```

- `domain: ".onebuzz.net"` 固定でよい(本番はこのドメイン配下で動くため)。ローカル(`localhost`)では先頭ドット付き独自ドメインを設定できないので、Cookie がセットされなくても挙動確認は本番/プレビュー(`*.onebuzz.net`)で行う想定。必要なら開発時のみ `domain` を未指定に分岐する。

## 4. アプリへのリンク

- 各アプリへは**普通のリンクでOK**(例: `https://shindan.onebuzz.net`)。Cookie は親ドメイン共有済みなのでパラメータ付与は不要。
- 堅くするなら、アプリリンクにも `?aff_click_id=` を付けてよい(Cookie ブロック環境への保険)。
  - 付ける場合は middleware で読んだ値、または Cookie から取り出してリンクに付与する実装を検討。

## 5. やらないこと(重要)

- ❌ SDK(`@smasaya109-cmyk/aff-sdk`)の導入 — ポータルには不要
- ❌ ユーザー登録・ログイン・決済・`trackConversion`
- ❌ `aff_click_id` 以外の用途で値を加工・送信(透過的に保存して引き継ぐだけ)

## 6. テスト観点

- [ ] `https://portal.onebuzz.net/?aff_click_id=TEST123` アクセスで `aff_click_id=TEST123` の Cookie が `Domain=.onebuzz.net` で保存される
- [ ] 別ページ遷移後も Cookie が残る(maxAge 30日)
- [ ] `?aff_click_id` 無しのアクセスでは既存 Cookie を変更しない
- [ ] `?aff_click_id` が別値で来たら上書きされる(ラストクリック)
- [ ] サブドメイン(例: `shindan.onebuzz.net`)から `document.cookie` で `aff_click_id` が読める
- [ ] `Secure` が本番で付与され、HTTP では送られない

## 7. デプロイ上の注意

- このサイトは **独立リポ・独立 Vercel プロジェクト**で作る(ASPリポ `onebuzz` には同居させない)。
- Cookie 共有が機能する条件: ポータルもアプリも **同一親ドメイン `onebuzz.net` のサブドメイン**であること。

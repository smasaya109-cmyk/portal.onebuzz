/** 外部リンク定数(一元管理) */

/** アフィリエイター募集の応募先: onebuzz 公式 LINE(登録前の相談・情報収集向けのセカンダリ導線) */
export const LINE_OFFICIAL_URL = "https://lin.ee/wPKhL6S";

/**
 * ASP パートナー登録ページ(www 付きが正規ドメイン)。
 * 紹介の帰属は ASP 側の aff_click_id Cookie(同一ブラウザ前提)で行うため、
 * ここへは target="_blank" や LINE を挟まず、同一タブの通常 <a> 遷移で誘導する。
 * クエリパラメータの付与も不要。
 */
export const PARTNER_REGISTER_URL = "https://www.onebuzz.net/register";

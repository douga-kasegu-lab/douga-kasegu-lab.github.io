// サイトを組み立てるスクリプト。`node build.js` で docs/ に公開用のページを作る。
// 記事は src/articles/*.html、固定ページは src/pages/*.html に書く。
// どちらもファイルの先頭に <!--{ ...JSON... }--> で記事の情報(タイトル・日付など)を書く。
import fs from "node:fs";
import path from "node:path";
import config from "./site.config.js";

const OUT = "docs";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const catName = (id) => config.categories.find((c) => c.id === id)?.name ?? id;
const fmtDate = (d) => d.replaceAll("-", ".");

function readSource(file) {
  const raw = fs.readFileSync(file, "utf8");
  const m = raw.match(/^<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${file} の先頭に <!--{...}--> がありません`);
  return { meta: JSON.parse(m[1]), body: raw.slice(m[0].length), slug: path.basename(file, ".html") };
}

const articles = fs
  .readdirSync("src/articles")
  .filter((f) => f.endsWith(".html"))
  .map((f) => readSource(path.join("src/articles", f)))
  .filter((a) => !a.meta.draft)
  .sort((a, b) => (b.meta.date > a.meta.date ? 1 : -1));
const bySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));

// ---------- 共通パーツ ----------
// root はそのページからサイトの一番上までの相対パス("" か "../")
function rinseqBox(root, size = "large") {
  const r = config.rinseq;
  const beta = r.phase === "beta";
  const badge = beta ? `β版 ${r.betaUntil}まで無料` : "最初の7日間無料";
  const btn = beta ? "無料でβ版を試す" : "7日間無料で試す";
  const prLine = `<p class="feat-pr">PR:運営者が開発しているソフトです(ランキングの対象外)</p>`;
  const head = `<p class="feat-h">今回紹介したいソフト</p>`;
  if (size === "small") {
    return `<aside class="feat feat-s">${head}<div class="feat-b">
<p class="feat-name">RINSEQ(リンセック)</p><span class="feat-badge">${badge}</span>
<p><a class="btn2 btn-s" href="${r.url}" target="_blank" rel="noopener">${btn}</a></p></div>${prLine}</aside>`;
  }
  const tutorial = bySlug["first-video-5steps"] ? `<a class="more" href="${root}articles/first-video-5steps.html">はじめての方は使い方入門へ ›</a>` : "";
  return `<aside class="feat">${head}<div class="feat-b">
<div class="feat-top"><img src="${root}assets/img/rinseq.jpg" alt="RINSEQ" width="320" height="180" loading="lazy">
<div><p class="feat-name">RINSEQ(リンセック)</p><span class="feat-badge">${badge}</span><p class="sm">YouTube向けの動画編集ソフト(Mac・Windows)</p></div></div>
<div class="feat-sec"><p class="feat-sh">なぜ紹介するの?</p>
<p>動画編集を始めた頃、「編集が終わらない」「作った動画をどうお金にすればいいかわからない」の2つで何度も止まりました。編集から「稼ぐ」までを1つのソフトでできたら…と思って、自分で作ったのがRINSEQです。あの頃の自分と同じところで止まっている人に、まず無料で試してほしくて紹介しています。</p></div>
<div class="feat-sec"><p class="feat-sh">編集がラクになる</p><ul>
<li>無音・「えー」などを自動で見つけてカット</li><li>しゃべった言葉を文字にして、そのままテロップに</li></ul></div>
<div class="feat-sec"><p class="feat-sh">作った動画で「稼ぐ」しくみが、アプリの中にある</p><ul>
<li><b>企業案件・編集の仕事に応募できる</b>(正式版11月〜・プラス会員 月980円)</li>
<li><b>RINSEQを紹介すると、紹介した人が使い続けてくれる間、最大6か月間、毎月報酬が入ります。</b><span class="sm">(はじめに1人1,000〜2,000円、その後は毎月100円。正式版11月〜)</span></li></ul></div>
<p><a class="btn2" href="${r.url}" target="_blank" rel="noopener">${btn}</a>${tutorial}</p></div>${prLine}</aside>`;
}

function header(root) {
  const nav = config.categories.map((c) => `<a href="${root}category/${c.id}.html">${c.name}</a>`).join("");
  return `<header class="site-header"><div class="wrap hd">
<a class="logo" href="${root}index.html">${esc(config.name)}</a>
<nav class="nav">${nav}<a href="${root}about.html">運営者</a></nav>
</div></header>`;
}

function prBar(text) {
  return `<div class="pr-bar"><div class="wrap">${text}</div></div>`;
}

function footer(root) {
  return `<footer class="site-footer"><div class="wrap">
<nav><a href="${root}about.html">運営者情報</a><a href="${root}ads.html">広告について</a><a href="${root}privacy.html">プライバシーポリシー</a><a href="${root}contact.html">お問い合わせ</a></nav>
<p>© ${new Date().getFullYear()} ${esc(config.name)}</p>
</div></footer>`;
}

function sideProfile(root, long = true) {
  return `<div class="box profile"><div class="box-h">運営者</div><div class="av" aria-hidden="true"></div>
<p><b>${esc(config.author)}</b></p>${long ? `<p class="sm">本業は動画と関係ない仕事。動画編集の初心者から、YouTube編集ソフト「RINSEQ」を作っています。</p>` : ""}
<a class="sm" href="${root}about.html">運営者情報 ›</a></div>`;
}

function sidePopular(root) {
  const items = config.popular.filter((s) => bySlug[s]).map((s, i) => `<li><a href="${root}articles/${s}.html">${esc(bySlug[s].meta.short ?? bySlug[s].meta.title)}</a></li>`);
  return `<div class="box"><div class="box-h">人気記事</div><ol class="lk">${items.join("")}</ol></div>`;
}

function sideCategories(root) {
  return `<div class="box"><div class="box-h">カテゴリー</div><ul class="lk">${config.categories
    .map((c) => `<li><a href="${root}category/${c.id}.html">${c.name}</a></li>`)
    .join("")}</ul></div>`;
}

function page({ root, title, description, prText, main, side, canonical, ogType = "website" }) {
  const fullTitle = title ? `${title}|${config.name}` : `${config.name}|${config.catch}`;
  return `<!doctype html>
<html lang="ja"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description ?? config.description)}">
<link rel="canonical" href="${config.baseUrl}/${canonical}">
<meta property="og:title" content="${esc(fullTitle)}"><meta property="og:type" content="${ogType}">
<meta property="og:description" content="${esc(description ?? config.description)}">
<link rel="stylesheet" href="${root}assets/style.css">
</head><body>
${header(root)}
${prBar(prText)}
<div class="wrap layout"><main class="main">${main}</main><aside class="side">${side}</aside></div>
${footer(root)}
</body></html>`;
}

function thumb(a, root) {
  return `<img class="thumb" src="${root}assets/img/thumb-${a.slug}.svg" alt="" width="160" height="90" loading="lazy">`;
}

function articleListItem(a, root, withThumb = true) {
  return `<a class="post" href="${root}articles/${a.slug}.html">${withThumb ? thumb(a, root) : ""}<div>
<span class="cat">${catName(a.meta.category)}</span><span class="date">${fmtDate(a.meta.date)}</span>
<p class="ttl">${esc(a.meta.title)}</p><p class="ex">${esc(a.meta.description)}</p></div></a>`;
}

// ---------- 記事の表紙画像(SVG) ----------
function wrapText(s, n) {
  const lines = [];
  let cur = "";
  for (const ch of s) {
    cur += ch;
    if (cur.length >= n) { lines.push(cur); cur = ""; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}
function thumbSvg(a) {
  const tones = { software: "#dfe6ec", tutorial: "#e3e8e1", sponsorship: "#e8e3e8", editor: "#e9e4dc" };
  const lines = wrapText(a.meta.short ?? a.meta.title, 11);
  const t = lines.map((l, i) => `<text x="24" y="${92 + i * 34}" font-size="26" font-weight="700" fill="#22324a">${esc(l)}</text>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180" width="320" height="180">
<rect width="320" height="180" fill="${tones[a.meta.category] ?? "#e4e4e4"}"/>
<text x="24" y="44" font-size="15" fill="#2b4a6f" font-family="sans-serif">${esc(catName(a.meta.category))}</text>
<g font-family="'Hiragino Sans','Noto Sans JP',sans-serif">${t}</g>
<text x="296" y="164" font-size="12" text-anchor="end" fill="#6b7785" font-family="sans-serif">${esc(config.name)}</text></svg>`;
}

// ---------- 記事ページ ----------
function articlePage(a) {
  const root = "../";
  const m = a.meta;
  const toc = (m.toc ?? []).map(([id, label]) => `<li><a href="#${id}">${esc(label)}</a></li>`).join("");
  const related = articles.filter((x) => x.slug !== a.slug).slice(0, 3);
  const prText = m.pr
    ? "※この記事にはアフィリエイト広告(PR)を含みます。運営者はRINSEQの開発者です"
    : "※運営者はRINSEQの開発者です";
  const main = `<nav class="crumb"><a href="${root}index.html">ホーム</a> › <a href="${root}category/${m.category}.html">${catName(m.category)}</a> › <span>${esc(m.short ?? m.title)}</span></nav>
<article class="article">
<span class="cat">${catName(m.category)}</span>
<h1>${esc(m.title)}</h1>
<p class="meta">公開 ${fmtDate(m.date)}${m.updated ? ` ・ 更新 ${fmtDate(m.updated)}` : ""}${m.readMin ? ` ・ 読む時間 約${m.readMin}分` : ""}</p>
${rinseqBox(root)}
${toc ? `<nav class="toc"><p class="toc-h">目次</p><ol>${toc}</ol></nav>` : ""}
${a.body.replaceAll("{{RINSEQ_BOX}}", rinseqBox(root)).replaceAll("{{ROOT}}", root)}
<div class="author-box"><div class="av" aria-hidden="true"></div><div><b>この記事を書いた人:${esc(config.author)}</b>
<p class="sm">本業は動画と関係ない仕事。動画編集の初心者からYouTube編集ソフト「RINSEQ」を作っています。<a href="${root}about.html">運営者情報 ›</a></p></div></div>
${related.length ? `<section class="related"><h2 class="h-line">あわせて読みたい</h2><ul class="lk">${related.map((r) => `<li><a href="${root}articles/${r.slug}.html">${esc(r.meta.title)}</a></li>`).join("")}</ul></section>` : ""}
</article>`;
  const side = `${rinseqBox(root, "small")}
${sideProfile(root, false)}
${m.top ? `<div class="box"><div class="box-h">この記事の1位</div><p><b>${esc(m.top.name)}</b><br><span class="sm">${esc(m.top.note)}</span></p><a class="btn btn-s" href="${m.top.url}" target="_blank" rel="noopener sponsored">公式サイトを見る(PR)</a></div>` : ""}
${sidePopular(root)}
${sideCategories(root)}
${toc ? `<div class="box sticky"><div class="box-h">目次</div><ol class="lk">${toc}</ol></div>` : ""}`;
  return page({ root, title: m.title, description: m.description, prText, main, side, canonical: `articles/${a.slug}.html`, ogType: "article" });
}

// ---------- トップページ ----------
function indexPage() {
  const root = "";
  const intro = fs.readFileSync("src/home-intro.html", "utf8");
  const themes = config.categories
    .map((c) => `<a class="tcard" href="category/${c.id}.html"><b>${c.name}</b><p>${c.lead}</p></a>`)
    .join("");
  const perCat = config.categories
    .map((c) => {
      const list = articles.filter((a) => a.meta.category === c.id);
      if (!list.length) return "";
      return `<h3 class="h-bar">${c.name}</h3><ul class="lk-list">${list
        .slice(0, 3)
        .map((a) => `<li><a href="articles/${a.slug}.html"><b>${esc(a.meta.title)}</b><span>${esc(a.meta.description)}</span></a></li>`)
        .join("")}</ul><p class="more-r"><a href="category/${c.id}.html">もっと見る ›</a></p>`;
    })
    .join("");
  const main = `${rinseqBox(root)}
<section class="intro">${intro}</section>
<section><h2 class="h-bar">4つのテーマ</h2><div class="themes">${themes}</div></section>
<section><h2 class="h-bar">新着記事</h2>${articles.slice(0, 6).map((a) => articleListItem(a, root)).join("")}</section>
<section><h2 class="h-bar">カテゴリーごとの記事</h2>${perCat}</section>`;
  const side = `${rinseqBox(root, "small")}
${sideProfile(root)}
${sidePopular(root)}
${sideCategories(root)}
<div class="box"><div class="box-h">広告について</div><p class="sm">当サイトはアフィリエイト広告を利用しています。ランキングの採点基準は記事の中で公開しています。<a href="ads.html">くわしく ›</a></p></div>`;
  return page({
    root,
    title: "",
    prText: "※当サイトはアフィリエイト広告(PR)を利用しています。運営者はRINSEQの開発者です",
    main,
    side,
    canonical: "",
  });
}

// ---------- カテゴリーページ ----------
function categoryPage(c) {
  const root = "../";
  const list = articles.filter((a) => a.meta.category === c.id);
  const main = `<nav class="crumb"><a href="${root}index.html">ホーム</a> › <span>${c.name}</span></nav>
<h1 class="page-h">${c.name}</h1><p>${c.lead}</p>
${list.length ? list.map((a) => articleListItem(a, root)).join("") : `<p class="empty">このカテゴリーの記事は準備中です。</p>`}`;
  const side = `${rinseqBox(root, "small")}${sideProfile(root, false)}${sidePopular(root)}${sideCategories(root)}`;
  return page({ root, title: c.name, description: `${c.name}:${c.lead}`, prText: "※当サイトはアフィリエイト広告(PR)を利用しています", main, side, canonical: `category/${c.id}.html` });
}

// ---------- 固定ページ ----------
function staticPage(p) {
  const root = "";
  const main = `<nav class="crumb"><a href="index.html">ホーム</a> › <span>${esc(p.meta.title)}</span></nav>
<article class="article"><h1>${esc(p.meta.title)}</h1>${p.body}</article>`;
  const side = `${sideProfile(root, false)}${sideCategories(root)}`;
  return page({ root, title: p.meta.title, description: p.meta.description, prText: "※当サイトはアフィリエイト広告(PR)を利用しています", main, side, canonical: `${p.slug}.html` });
}

// ---------- 書き出し ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(`${OUT}/articles`, { recursive: true });
fs.mkdirSync(`${OUT}/category`, { recursive: true });
fs.cpSync("assets", `${OUT}/assets`, { recursive: true });

fs.writeFileSync(`${OUT}/index.html`, indexPage());
for (const a of articles) {
  fs.writeFileSync(`${OUT}/articles/${a.slug}.html`, articlePage(a));
  fs.writeFileSync(`${OUT}/assets/img/thumb-${a.slug}.svg`, thumbSvg(a));
}
for (const c of config.categories) fs.writeFileSync(`${OUT}/category/${c.id}.html`, categoryPage(c));
const pages = fs.readdirSync("src/pages").filter((f) => f.endsWith(".html")).map((f) => readSource(path.join("src/pages", f)));
for (const p of pages) fs.writeFileSync(`${OUT}/${p.slug}.html`, staticPage(p));

const urls = ["", ...articles.map((a) => `articles/${a.slug}.html`), ...config.categories.map((c) => `category/${c.id}.html`), ...pages.map((p) => `${p.slug}.html`)];
fs.writeFileSync(`${OUT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `<url><loc>${config.baseUrl}/${u}</loc></url>`).join("\n")}\n</urlset>\n`);
fs.writeFileSync(`${OUT}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${config.baseUrl}/sitemap.xml\n`);
fs.writeFileSync(`${OUT}/.nojekyll`, "");
console.log(`できました:記事 ${articles.length} 本、固定ページ ${pages.length} 枚 → ${OUT}/`);

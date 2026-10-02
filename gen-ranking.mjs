// 比較記事(7選)の本文を、下のデータから組み立てる。点数や料金を直したらここを変えて `node gen-ranking.mjs && node build.js`
import fs from "node:fs";
const KEYS = ["使いやすさ", "機能", "料金", "軽さ", "YouTube向け", "サポート"];
const S = [
  { name: "Filmora(フィモーラ)", short: "Filmora", url: "https://filmora.wondershare.jp/", os: "Win・Mac", price: "1年プラン 6,980円〜/買い切り 8,980円〜", free: "あり(書き出した動画にロゴが入る)", who: "とにかく簡単に始めたい人",
    sc: [5,4,4,4,4,4],
    about: "画面がシンプルで、はじめてでも「どこを押せばいいか」が分かりやすい定番ソフトです。テロップやBGM、効果の素材が多く、AIによる字幕作りや無音部分の検出など、YouTube向けの便利な機能もそろっています。",
    good: ["ボタンや画面が分かりやすく、迷いにくい", "テロップ・BGM・効果の素材が多い", "日本語の説明や使い方の情報がネット上に多い", "Mac・Windowsのどちらでも使える"],
    bad: ["無料版は書き出した動画にロゴが入るので、YouTube投稿には実質有料版が必要", "素材やAI機能の一部は追加料金・別プラン", "本格的な色調整などは上位ソフトに及ばない"] },
  { name: "PowerDirector 365(パワーディレクター)", short: "PowerDirector", url: "https://jp.cyberlink.com/products/powerdirector-video-editing-software/", os: "Win・Mac", price: "12か月 9,280円/1か月 2,480円", free: "あり(冒頭・最後にロゴが入る)", who: "Windowsで機能の多さも欲しい人",
    sc: [4,5,4,4,4,4],
    about: "国内の販売本数で上位常連の、機能の多いソフトです。初心者向けの「かんたん編集」から、細かい編集まで1本でこなせます。サブスク版(365)は新しい機能や素材が毎月のように追加されます。",
    good: ["機能がとても多く、慣れてからも物足りなくなりにくい", "動作が比較的軽く、ふつうのパソコンでも動きやすい", "素材やテンプレートが毎月追加される", "日本の会社のサポート・日本語の情報が多い"],
    bad: ["機能が多いぶん、画面のボタンが多く最初は戸惑う", "Mac版はWindows版より機能が少ない", "無料版はロゴが入る"] },
  { name: "Clipchamp(クリップチャンプ)", short: "Clipchamp", url: "https://clipchamp.com/ja/", os: "Win(標準)・ブラウザ", price: "無料/プレミアム 月額1,374円・年額13,724円", free: "あり(1080pまでロゴなしで書き出せる)", who: "お金をかけずに始めたいWindowsの人",
    sc: [5,3,5,4,3,3],
    about: "Windows 11に最初から入っているMicrosoftの編集ソフトです。ブラウザでも使えます。無料のままでもロゴなしでフルHD(1080p)の動画を書き出せるのが大きな強みです。",
    good: ["無料でもロゴなし・1080pで書き出せる", "Windowsなら最初から入っていて、インストール不要", "テンプレートが多く、直感的に使える", "自動字幕や読み上げなどのAI機能もある"],
    bad: ["長い動画や細かい編集はやや苦手", "インターネットにつながっていないと使いにくい", "Macではブラウザ版のみ"] },
  { name: "CapCut(キャップカット)PC版", short: "CapCut", url: "https://www.capcut.com/ja-jp/", os: "Win・Mac", price: "無料/Pro 月額2,180円・年額19,800円", free: "あり(使える機能が限られる)", who: "スマホ版CapCutに慣れている人", 
    sc: [5,4,3,4,4,3],
    about: "スマホで人気の編集アプリのパソコン版です。流行のエフェクトやテキストが多く、ショート動画との相性が抜群です。ただし、以前は無料だった機能の多くが有料(Pro)に移っています。",
    good: ["スマホ版と同じ感覚で使える", "ショート動画向けの流行エフェクト・テキストが多い", "自動字幕など、時短の機能がそろっている"],
    bad: ["自動字幕などの便利な機能の多くが有料(Pro)", "Proの料金はほかのソフトより高め", "無料でできることが今後も変わる可能性がある"] },
  { name: "iMovie(アイムービー)", short: "iMovie", url: "https://www.apple.com/jp/imovie/", os: "Macのみ", price: "無料", free: "完全無料", who: "Macで、まず無料で試したい人",
    sc: [5,2,5,5,2,3],
    about: "Macに最初から入っている、Apple純正の無料ソフトです。カット・BGM・簡単な文字入れなど、基本の編集はこれだけでできます。",
    good: ["完全無料で、ロゴも入らない", "Macにもとから入っていて動作が軽い", "画面がシンプルで迷いにくい"],
    bad: ["テロップの自由度が低く、YouTubeらしい字幕は作りにくい", "無音カットや自動字幕などの時短機能がない", "Windowsでは使えない"] },
  { name: "DaVinci Resolve(ダヴィンチ・リゾルブ)", short: "DaVinci Resolve", url: "https://www.blackmagicdesign.com/jp/products/davinciresolve", os: "Win・Mac", price: "無料/Studio 買い切り 51,980円", free: "あり(無料版でも4Kまで・ロゴなし)", who: "無料で本格的な編集を覚えたい人",
    sc: [2,5,5,2,3,3],
    about: "映画やテレビの現場でも使われるプロ向けソフトです。無料版でも4K・ロゴなしで書き出せ、無料ソフトとしては機能が飛び抜けています。",
    good: ["無料版でもプロ並みの機能", "色の調整(カラー)は業界トップクラス", "有料版も買い切りで、毎月の支払いがない"],
    bad: ["画面が複雑で、初心者にはかなり難しい", "パソコンにある程度の性能が必要", "日本語の初心者向け情報が少なめ"] },
  { name: "Adobe Premiere Pro(プレミアプロ)", short: "Premiere Pro", url: "https://www.adobe.com/jp/products/premiere.html", os: "Win・Mac", price: "月額3,280円(年間プラン・月々払い)", free: "7日間の無料体験のみ", who: "将来、仕事として編集を受けたい人",
    sc: [2,5,2,3,4,4],
    about: "動画編集の仕事で最もよく使われる、プロの定番ソフトです。動画編集者として仕事を受けたいなら、いずれ覚えておくと有利です。",
    good: ["編集の仕事の求人で指定されることが多い", "できないことがほぼ無い", "使い方の本・動画・講座がとても多い"],
    bad: ["毎月の料金が高め(買い切りはない)", "はじめての人には画面が難しい", "パソコンにある程度の性能が必要"] },
];
const AFF = ["Filmora","PowerDirector","CapCut","Premiere Pro"]; // アフィリエイトの広告があるソフト(リンクをもらったら url を差し替える)
const avg = (a) => Math.round((a.reduce((x, y) => x + y, 0) / a.length) * 10) / 10;
const stars = (v) => "★".repeat(Math.round(v)) + "☆".repeat(5 - Math.round(v));
S.forEach((s) => (s.total = avg(s.sc)));

const compare = `<div class="tbl-wrap"><table>
<tr><th>ソフト</th><th>総合</th><th>料金(目安)</th><th>パソコン</th><th>無料版</th><th>こんな人に</th></tr>
${S.map((s) => `<tr><td><b>${s.short}</b></td><td class="num"><span class="star">★</span>${s.total.toFixed(1)}</td><td>${s.price}</td><td>${s.os}</td><td>${s.free}</td><td>${s.who}</td></tr>`).join("\n")}
<tr class="own-row"><td><b>参考:RINSEQ</b><br><span class="sm">運営者のソフト・採点外</span></td><td class="num">—</td><td>β版は10月31日まで無料/正式版 月額1,500円〜(最初の7日間無料)</td><td>Win(64bit)・Mac(M1以降)</td><td>β版の間は編集機能が無料</td><td>YouTubeのトーク動画を早く仕上げたい人</td></tr>
</table></div>`;

const ranks = S.map((s, i) => `<section class="rank" id="no${i + 1}">
<div class="rank-h"><span class="no">${i + 1}</span><h3>${s.name}</h3><span class="star">${stars(s.total)}</span><span class="sm">総合 ${s.total.toFixed(1)}点</span></div>
<div class="tbl-wrap"><table class="score-tbl"><tr>${KEYS.map((k) => `<th>${k}</th>`).join("")}</tr><tr>${s.sc.map((v) => `<td>${v}</td>`).join("")}</tr></table></div>
<p>${s.about}</p>
<table><tr><th>料金(目安)</th><td>${s.price}</td></tr><tr><th>パソコン</th><td>${s.os}</td></tr><tr><th>無料版</th><td>${s.free}</td></tr></table>
<div class="pc"><div><b>良い点</b><ul>${s.good.map((g) => `<li>${g}</li>`).join("")}</ul></div><div><b>気になる点</b><ul>${s.bad.map((g) => `<li>${g}</li>`).join("")}</ul></div></div>
<p><b>こんな人におすすめ:</b>${s.who}</p>
<p class="cta"><a class="btn" href="${s.url}" target="_blank" rel="noopener${AFF.includes(s.short) ? " sponsored" : ""}">${s.short}の公式サイトを見る${AFF.includes(s.short) ? "(PR)" : ""}</a></p>
</section>`).join("\n");

const meta = {
  title: "【2026年】初心者向け動画編集ソフトおすすめ7選|6つの基準で採点・比較",
  short: "初心者向け編集ソフト7選",
  category: "software",
  date: "2026-10-02",
  readMin: 15,
  pr: true,
  description: "Filmora・PowerDirector・Clipchamp・CapCut・iMovie・DaVinci Resolve・Premiere Proの7本を、使いやすさ・料金・YouTube向けの機能など6つの基準で採点。良い点も気になる点も正直にまとめました。",
  top: { name: S[0].short, note: S[0].who, url: S[0].url },
  toc: [["conclusion","結論:目的別のおすすめ"],["how","採点のしかた"],["table","比較表"],["ranking","ランキング"],["rinseq","RINSEQとの比較"],["choose","選び方のポイント"],["faq","よくある質問"],["matome","まとめ"]],
};

const body = `
<p>「動画編集を始めたいけど、ソフトが多すぎて選べない」。私も最初、まさにそこで止まりました。この記事では、初心者がよく候補にする7本のソフトを、同じ6つの基準で採点して比べます。良い点だけでなく、気になる点も正直に書いています。</p>
<p class="note">この記事の料金・機能は、2026年10月時点で各ソフトの公式情報と公開されているレビューをもとに調べたものです。料金はキャンペーンなどでよく変わるので、申し込む前に必ず公式サイトで確認してください。運営者が実際に試した結果は、順次この記事に追記します。</p>

<h2 id="conclusion">結論:目的別のおすすめ</h2>
<div class="summary"><ul>
<li><b>とにかく簡単に始めたい</b> → <a href="#no1">Filmora</a></li>
<li><b>機能の多さも欲しい(Windows)</b> → <a href="#no2">PowerDirector</a></li>
<li><b>お金をかけたくない(Windows)</b> → <a href="#no3">Clipchamp</a></li>
<li><b>お金をかけたくない(Mac)</b> → <a href="#no5">iMovie</a></li>
<li><b>将来、編集の仕事をしたい</b> → <a href="#no7">Premiere Pro</a></li>
<li><b>YouTubeのトーク・実況動画を早く仕上げたい</b> → <a href="#rinseq">RINSEQ(運営者のソフト)</a></li>
</ul></div>

<h2 id="how">採点のしかた</h2>
<p>7本すべてを、次の6つの基準で5点満点で採点し、その平均を「総合点」にしました。総合点が同じ場合は、初心者向けの記事なので「使いやすさ」の点が高い方を上にしています。基準を先に公開しているのは、どんな考えで順位を付けたのかを読む人が確かめられるようにするためです。広告の報酬の多い少ないでは順位を決めていません。</p>
<div class="tbl-wrap"><table>
<tr><th>基準</th><th>見たところ</th></tr>
<tr><td>使いやすさ</td><td>はじめてでも、どこを押せばいいか迷わないか</td></tr>
<tr><td>機能</td><td>カット・テロップ・BGM・効果など、できることの多さ</td></tr>
<tr><td>料金</td><td>無料版でどこまでできるか、有料版の値段は手ごろか</td></tr>
<tr><td>軽さ</td><td>ふつうのパソコンでも、固まらずに動くか</td></tr>
<tr><td>YouTube向け</td><td>無音カット・自動字幕・縦型動画など、YouTubeに便利な機能</td></tr>
<tr><td>サポート</td><td>日本語の説明・問い合わせ先・使い方の情報の多さ</td></tr>
</table></div>
<p>なお、運営者が作っている<b>RINSEQは、公平さのため採点・ランキングに入れていません</b>。比較表の一番下に参考として載せ、<a href="#rinseq">別の見出し</a>で正直に比べています。</p>

<h2 id="table">比較表</h2>
${compare}
<p class="sm">※点数は、公式情報と公開されているレビューをもとに調べた結果です(運営者が実際に試した結果ではありません)。料金は2026年10月時点の目安です。</p>

<h2 id="ranking">ランキング</h2>
${ranks}

<h2 id="rinseq">RINSEQとの比較(運営者のソフト)</h2>
<p>ここからは、このサイトの運営者が作っている「RINSEQ」の話です。自分のソフトなので、ランキングには入れず、ほかのソフトと比べて<b>向いている人・向いていない人</b>を正直に書きます。</p>
<h3>RINSEQが向いている人</h3>
<ul>
<li>YouTubeの<b>トーク・解説・Vlog</b>など、しゃべりが中心の動画を作る人(無音や「えー」「あのー」を自動で見つけてカットできます)</li>
<li>文字起こしからそのまま<b>テロップ</b>を作りたい人</li>
<li>AIに「荒編集(下書き)」を任せて、仕上げだけ自分でやりたい人</li>
<li>編集した動画で、<b>企業案件や編集の仕事</b>にもつなげたい人(アプリ内の案件掲示板。正式版11月〜。案件への応募はプラス会員 月980円が必要)</li>
</ul>
<h3>ほかのソフトの方が向いている人</h3>
<ul>
<li>映画のような凝った映像表現や色の調整をしたい人 → DaVinci Resolve・Premiere Pro</li>
<li>スマホだけで編集したい人 → RINSEQはパソコン専用です</li>
<li>古いMac(Intel製)を使っている人 → RINSEQのMac版はM1以降のMacが対象です</li>
<li>とにかくお金をかけたくない人 → 正式版は月額1,500円からなので、ずっと無料のClipchamp・iMovieの方が合います</li>
</ul>
<h3>まだ足りないところ(正直に)</h3>
<ul>
<li>新しいソフトなので、ネット上の使い方の情報はまだ少なめです(このサイトの<a href="{{ROOT}}category/tutorial.html">使い方入門</a>で増やしていきます)</li>
<li>素材(BGM・効果)の数は、Filmoraなどの老舗ソフトにはまだ及びません</li>
</ul>
{{RINSEQ_BOX}}

<h2 id="choose">選び方のポイント</h2>
<h3>① 自分のパソコンで動くか</h3>
<p>まず、自分のパソコンがMacかWindowsかを確認しましょう。iMovieはMacだけ、ClipchampはWindowsに最初から入っています。DaVinci ResolveやPremiere Proは、ある程度の性能のパソコンでないと動きが重くなります。</p>
<h3>② 料金の払い方</h3>
<p>払い方は大きく「毎月・毎年払う(サブスク)」と「一度だけ払う(買い切り)」の2つです。サブスクは新しい機能がずっと使え、買い切りは長く使うほどお得です。また、無料版は<b>書き出した動画にロゴが入る</b>ものが多いので、YouTubeに投稿するなら「ロゴなしで書き出せるか」を必ず確認しましょう。</p>
<h3>③ 作りたい動画に合う機能があるか</h3>
<p>しゃべりが中心の動画なら、無音カットや自動字幕があると作業時間が大きく減ります。ショート動画中心なら、縦型の書き出しや流行のエフェクトが多いソフトが便利です。</p>

<h2 id="faq">よくある質問</h2>
<div class="qa"><p class="q">Q. 無料ソフトでもYouTubeに投稿できますか?</p><p>A. できます。ただし、無料版は書き出した動画にソフトのロゴが入るものが多いです。ロゴなしで書き出せる無料ソフトは、Clipchamp(1080pまで)・iMovie・DaVinci Resolveです。</p></div>
<div class="qa"><p class="q">Q. スマホだけでも編集できますか?</p><p>A. 短い動画ならスマホでもできます。ただ、10分以上の動画や細かいテロップ入れはパソコンの方がずっと楽です。</p></div>
<div class="qa"><p class="q">Q. 有料ソフトは買い切りとサブスク、どちらがいいですか?</p><p>A. まず1年続くかわからないなら、無料体験やサブスクで始めるのがおすすめです。2年以上使うと決まったら、買い切りの方が安くなることが多いです。</p></div>
<div class="qa"><p class="q">Q. パソコンはどれくらいの性能が必要ですか?</p><p>A. FilmoraやPowerDirectorなら、ここ数年のふつうのノートパソコンで動くことが多いです。DaVinci ResolveやPremiere Proは、メモリ16GB以上が目安です。各ソフトの公式サイトに「動作環境」が書かれているので確認してください。</p></div>

<h2 id="matome">まとめ</h2>
<div class="summary"><p>迷ったら、まずは<b>無料版・無料体験で1本作ってみる</b>のがいちばんの近道です。ボタンの場所が「なんとなく分かる」と感じたソフトが、あなたに合うソフトです。</p>
<p>総合1位は<b>${S[0].short}</b>でした。</p>
<p><a class="btn" href="${S[0].url}" target="_blank" rel="noopener sponsored">${S[0].short}の公式サイトを見る(PR)</a></p></div>
`;
fs.writeFileSync("src/articles/beginner-video-editor-ranking.html", `<!--${JSON.stringify(meta)}-->\n${body}`);
console.log("比較記事を作りました");

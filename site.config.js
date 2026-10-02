// サイト全体の設定。名前や RINSEQ の案内文はここを変えれば全ページに反映される。
export default {
  name: "動画で稼ぐ研究所",
  catch: "動画編集初心者の頃に、欲しかったものを。",
  description:
    "動画編集も「動画で稼ぐ」もゼロから始めた運営者が、編集ソフトの選び方・使い方・YouTubeで稼ぐ方法を、初心者の言葉でまとめるサイトです。",
  // 公開するアドレス(独自ドメインにしたらここを変える)
  baseUrl: "https://douga-kasegu-lab.github.io",
  author: "日田",

  rinseq: {
    // "beta" の間はβ版無料の案内、"release" にすると正式版(7日間無料)の案内に切り替わる
    phase: "beta",
    betaUntil: "10月31日",
    url: "https://rinseq.com/?utm_source=douga-kasegu-lab&utm_medium=referral",
    downloadUrl: "https://rinseq.com/#download",
    pricingUrl: "https://rinseq.com/pricing.html",
  },

  categories: [
    { id: "software", name: "編集ソフトを比べる", lead: "7本を同じ基準で採点・比較。" },
    { id: "tutorial", name: "使い方入門", lead: "はじめての1本を、手順どおりに作る。" },
    { id: "sponsorship", name: "企業案件で稼ぐ", lead: "相場・もらい方・契約の注意点。" },
    { id: "editor", name: "編集者で稼ぐ", lead: "副業の始め方・単価・仕事の探し方。" },
  ],

  // 人気記事(記事のファイル名を並べる)
  popular: ["beginner-video-editor-ranking", "first-video-5steps"],
};

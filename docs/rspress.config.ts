import { defineConfig } from "rspress/config";
import type { RspressPlugin } from "rspress";
import pluginSitemap from "rspress-plugin-sitemap";

const siteUrl = "https://gsts.moe";
const siteTitle = "Genshin-TS";
const descriptions = {
  en: "Use TypeScript to develop Genshin UGC - Miliastra Wonderland and make its development programmable and AI coding-friendly.",
  zh: "使用 TypeScript 进行原神UGC - 千星奇域开发，让千星奇域开发可编程化，并对 AI 编码友好。",
};

const pageMetadata = new Map<
  string,
  {
    title: string;
    description: string;
  }
>();

const seoPlugin: RspressPlugin = {
  name: "gsts-seo",
  extendPageData(pageData) {
    const language = pageData.lang === "zh" ? "zh" : "en";
    const isHome = pageData.frontmatter.pageType === "home";
    const title = isHome
      ? siteTitle
      : pageData.frontmatter.title || pageData.title;
    const titleSuffix = isHome
      ? pageData.frontmatter.titleSuffix
      : pageData.frontmatter.titleSuffix || siteTitle;

    pageMetadata.set(pageData.routePath, {
      title: titleSuffix ? `${title} - ${titleSuffix}` : title,
      description: pageData.frontmatter.description || descriptions[language],
    });
  },
};

const pageUrl = (routePath: string) => `${siteUrl}${routePath}`;

const escapeAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

const languagePreferenceScript = `
(() => {
  const storageKey = "gsts-doc-language";
  const languageForPath = (pathname) =>
    pathname === "/zh" || pathname.startsWith("/zh/") ? "zh" : "en";

  try {
    let preferredLanguage = window.localStorage.getItem(storageKey);
    if (preferredLanguage !== "en" && preferredLanguage !== "zh") {
      preferredLanguage = window.navigator.language
        .toLowerCase()
        .startsWith("zh")
        ? "zh"
        : "en";
      window.localStorage.setItem(storageKey, preferredLanguage);
    }

    if (preferredLanguage === "zh" && window.location.pathname === "/") {
      window.location.replace(
        "/zh/" + window.location.search + window.location.hash,
      );
      return;
    }
  } catch {}

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.origin !== window.location.origin
      ) {
        return;
      }

      const currentLanguage = languageForPath(window.location.pathname);
      const targetLanguage = languageForPath(link.pathname);
      if (currentLanguage === targetLanguage) return;

      try {
        window.localStorage.setItem(storageKey, targetLanguage);
      } catch {}
    },
    true,
  );
})();
`;

export default defineConfig({
  root: "docs",
  title: siteTitle,
  lang: "en",
  icon: "/rspress-icon.png",
  logo: "/rspress-icon.png",
  logoText: "Genshin-TS",
  head: [
    (route) => {
      if (route.routePath === "/404") return;

      const metadata = pageMetadata.get(route.routePath);
      if (!metadata) {
        throw new Error(`Missing SEO metadata for ${route.routePath}`);
      }

      const isChinese = route.lang === "zh";
      const englishRoutePath = isChinese
        ? route.routePath.replace(/^\/zh(?=\/|$)/, "") || "/"
        : route.routePath;
      const chineseRoutePath = isChinese
        ? route.routePath
        : route.routePath === "/"
          ? "/zh/"
          : `/zh${route.routePath}`;
      const canonicalUrl = pageUrl(route.routePath);
      const englishUrl = pageUrl(englishRoutePath);
      const chineseUrl = pageUrl(chineseRoutePath);

      return [
        `<link rel="canonical" href="${canonicalUrl}">`,
        `<link rel="alternate" hreflang="en" href="${englishUrl}">`,
        `<link rel="alternate" hreflang="zh-CN" href="${chineseUrl}">`,
        `<link rel="alternate" hreflang="x-default" href="${englishUrl}">`,
        '<meta property="og:type" content="website">',
        `<meta property="og:locale" content="${isChinese ? "zh_CN" : "en_US"}">`,
        `<meta property="og:locale:alternate" content="${
          isChinese ? "en_US" : "zh_CN"
        }">`,
        `<meta property="og:url" content="${canonicalUrl}">`,
        `<meta property="og:title" content="${escapeAttribute(metadata.title)}">`,
        `<meta property="og:description" content="${escapeAttribute(
          metadata.description,
        )}">`,
        `<meta property="og:site_name" content="${siteTitle}">`,
      ].join("");
    },
  ],
  markdown: {
    checkDeadLinks: true,
  },
  ssg: {
    strict: true,
  },
  plugins: [
    seoPlugin,
    pluginSitemap({
      domain: siteUrl,
    }),
  ],
  builderConfig: {
    html: {
      tags: [
        {
          tag: "script",
          children: languagePreferenceScript,
        },
        {
          tag: "script",
          // 通过 window.RSPRESS_THEME 变量来指定默认的主题模式，可选值为 'dark' 和 'light'
          children: "window.RSPRESS_THEME = 'dark';",
        },
      ],
    },
  },
  search: {
    codeBlocks: true,
  },
  themeConfig: {
    darkMode: false,
    socialLinks: [
      {
        icon: "github",
        mode: "link",
        content: "https://github.com/josStorer/genshin-ts",
      },
    ],
    locales: [
      {
        lang: "en",
        label: "English",
        description: descriptions.en,
      },
      {
        lang: "zh",
        label: "简体中文",
        description: descriptions.zh,
        searchNoResultsText: "未搜索到相关结果",
        searchPlaceholderText: "搜索文档",
        searchSuggestedQueryText: "可更换不同的关键字后重试",
        nextPageText: "下一页",
        prevPageText: "上一页",
        outlineTitle: "目录",
      },
    ],
  },
});

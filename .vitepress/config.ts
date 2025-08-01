import { defineConfig, HeadConfig } from "vitepress";
import { genFeed } from "./genFeed.ts";
import llmstxt from "vitepress-plugin-llms";
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from "@nolebase/vitepress-plugin-git-changelog/vite";
import { BiDirectionalLinks } from "@nolebase/markdown-it-bi-directional-links";
import { InlineLinkPreviewElementTransform } from "@nolebase/vitepress-plugin-inline-link-preview/markdown-it";
import { tabsMarkdownPlugin } from "vitepress-plugin-tabs";

const umamiScript: HeadConfig = [
  "script",
  {
    defer: "true",
    src: "https://cloud.umami.is/script.js",
    "data-website-id": "860fa816-3591-4fb6-8406-9bcfdbd045f0",
  },
];

const baseHeaders: HeadConfig[] = [
  ["link", { rel: "icon", type: "image/png", href: "/logo.png" }],
  ["meta", { property: "og:type", content: "website" }],
  ["meta", { property: "og:site_name", content: "编程手札" }],
  [
    "meta",
    {
      property: "og:url",
      content: "http://wangqiyangx.github.io/",
    },
  ],
];

const headers =
  process.env.NODE_ENV === "production"
    ? [...baseHeaders, umamiScript]
    : baseHeaders;

export default defineConfig({
  srcExclude: ["**/README.md", "**/TODO.md"],

  title: "Coding Notes",

  rewrites: {
    "zh/:rest*": ":rest*",
  },

  locales: {
    root: { label: "简体中文" },
    en: { label: "English" },
  },

  lastUpdated: true,
  cleanUrls: true,
  metaChunk: true,

  head: headers,

  markdown: {
    // theme: "monokai",
    math: true,
    lineNumbers: true,
    codeTransformers: [
      {
        postprocess(code) {
          return code.replace(/\[\!\!code/g, "[!code");
        },
      },
    ],
    config(md) {
      const fence = md.renderer.rules.fence!;
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const { localeIndex = "root" } = env;
        const codeCopyButtonTitle = (() => {
          switch (localeIndex) {
            case "es":
              return "Copiar código";
            case "fa":
              return "کپی کد";
            case "ko":
              return "코드 복사";
            case "pt":
              return "Copiar código";
            case "ru":
              return "Скопировать код";
            case "zh":
              return "复制代码";
            default:
              return "Copy code";
          }
        })();
        return fence(tokens, idx, options, env, self).replace(
          '<button title="Copy Code" class="copy"></button>',
          `<button title="${codeCopyButtonTitle}" class="copy"></button>`
        );
      };
      md.use(BiDirectionalLinks());
      md.use(InlineLinkPreviewElementTransform);
      md.use(tabsMarkdownPlugin);
    },
  },

  sitemap: {
    hostname: "https://wangqiyangx.github.io/",
    transformItems(items) {
      return items.filter((item) => !item.url.includes("migration"));
    },
  },

  vite: {
    plugins: [
      llmstxt({
        workDir: "en",
        ignoreFiles: ["index.md"],
      }),
      GitChangelog({
        repoURL: "https://github.com/wangqiyangx/wangqiyangx.github.io",
      }),
      GitChangelogMarkdownSection(),
    ],
    optimizeDeps: {
      exclude: ["@nolebase/vitepress-plugin-inline-link-preview/client"],
    },
    ssr: {
      noExternal: [
        "@nolebase/vitepress-plugin-highlight-targeted-heading",
        "@nolebase/vitepress-plugin-inline-link-preview",
      ],
    },
    build: {
      chunkSizeWarningLimit: Infinity,
    },
  },

  themeConfig: {
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/wangqiyangx/wangqiyangx.github.io",
        ariaLabel: "GitHub",
      },
      { icon: "x", link: "https://x.com/wangqiyangx", ariaLabel: "X" },
    ],

    search: {
      provider: "local",
    },
  },

  buildEnd: genFeed,
});

import { defineConfig, type HeadConfig } from "vitepress";
import {
	groupIconMdPlugin,
	groupIconVitePlugin,
} from "vitepress-plugin-group-icons";
import { genFeed } from "./genFeed";

const umamiScript: HeadConfig = [
	"script",
	{
		defer: "true",
		src: "https://cloud.umami.is/script.js",
		"data-website-id": "782d2000-b3aa-4c57-9654-928a79c43972",
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
			content: "http://blog.wangqiyang.com/",
		},
	],
];

const headers =
	process.env.NODE_ENV === "production"
		? [...baseHeaders, umamiScript]
		: baseHeaders;

export default defineConfig({
	rewrites: {
		"zh/:rest*": ":rest*",
	},
	head: headers,
	markdown: {
		math: true,
		lineNumbers: true,
		codeTransformers: [
			{
				postprocess(code) {
					return code.replace(/\[!!code/g, "[!code");
				},
			},
		],
		config(md) {
			md.use(groupIconMdPlugin);
			const fence = md.renderer.rules.fence;
			md.renderer.rules.fence = (tokens, idx, options, env, self) => {
				const { localeIndex = "root" } = env;
				const codeCopyButtonTitle = (() => {
					switch (localeIndex) {
						case "zh":
							return "复制代码";
						default:
							return "Copy code";
					}
				})();
				return (
					fence?.(tokens, idx, options, env, self).replace(
						'<button title="Copy Code" class="copy"></button>',
						`<button title="${codeCopyButtonTitle}" class="copy"></button>`,
					) ?? 'button title="Copy Code" class="copy"></button>'
				);
			};
		},
	},
	vite: {
		plugins: [
			groupIconVitePlugin({
				customIcon: {
					rss: "mdi:rss",
				},
			}),
		],
	},
	lastUpdated: true,
	cleanUrls: true,
	metaChunk: true,
	locales: {
		root: { label: "简体中文" },
		en: { label: "English" },
	},
	sitemap: {
		hostname: "https://blog.wangqiyang.com/",
		lastmodDateOnly: false,
		xmlns: {
			// trim the xml namespace
			news: true, // flip to false to omit the xml namespace for news
			xhtml: true,
			image: true,
			video: true,
			custom: [
				'xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"',
				'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
			],
		},
		transformItems(items) {
			return items.filter((item) => !item.url.includes("migration"));
		},
	},
	themeConfig: {
		socialLinks: [
			{ icon: "x", link: "https://x.com/wangqiyangx", ariaLabel: "X" },
			{
				icon: "rss",
				link: "/feed.rss",
				ariaLabel: "rss",
			},
		],
		search: {
			provider: "local",
		},
		externalLinkIcon: true,
	},

	buildEnd: genFeed,
});

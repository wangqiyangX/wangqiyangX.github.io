import { type DefaultTheme, defineAdditionalConfig } from "vitepress";

export default defineAdditionalConfig({
	lang: "en-US",
	title: "Coding Notes",
	description: "Record.",

	themeConfig: {
		nav: nav(),

		sidebar: {
			"/en/posts/": { base: "/en/posts/", items: sidebarPosts() },
			"/en/category/tutorial/": {
				items: sidebarTutorial(),
			},
		},

		editLink: {
			pattern:
				"https://github.com/wangqiyangx/vitepress-blog/edit/main/docs/:path",
			text: "Edit this page on GitHub",
		},

		footer: {
			copyright: "Copyright © 2025 Wang Qiyang.",
		},
	},
});

function nav(): DefaultTheme.NavItem[] {
	return [
		{
			text: "Posts",
			link: "/en/posts/",
			activeMatch: "/en/posts/",
		},
		{
			text: "Categories",
			activeMatch: "/en/category",
			items: [
				{
					text: "Tutorials",
					link: "/en/category/tutorial",
				},
				{
					text: "Essays",
					link: "/en/category/essay",
				},
			],
		},
		{
			text: "Tags",
			link: "/en/tag",
			activeMatch: "/en/tag",
		},
		{
			text: "Weekly",
			link: "/en/weekly",
			activeMatch: "/en/weekly",
		},
		{
			text: "About",
			link: "/en/about",
			activeMatch: "/en/about",
		},
	];
}

function sidebarPosts(): DefaultTheme.SidebarItem[] {
	return [];
}

function sidebarTutorial(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "How to Use WeatherKit",
			link: "/en/posts/introduction-to-weatherkit",
		},
	];
}

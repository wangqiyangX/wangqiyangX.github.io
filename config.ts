import { type DefaultTheme, defineAdditionalConfig } from "vitepress";

export default defineAdditionalConfig({
	lang: "zh-Hans",
	title: "编程手札",
	description: "记录",

	themeConfig: {
		nav: nav(),

		search: { options: searchOptions() },

		sidebar: {
			"/posts/": { base: "/posts/", items: sidebarPosts() },
			"/category/tutorial/": {
				items: sidebarTutorial(),
			},
		},

		editLink: {
			pattern:
				"https://github.com/wangqiyangx/vitepress-blog/edit/main/docs/:path",
			text: "在 GitHUab 上编辑此页面",
		},

		footer: {
			message: "黔ICP备2025055547号",
			copyright: "版权所有 © 2025 王启阳。",
		},

		docFooter: {
			prev: "上一页",
			next: "下一页",
		},

		outline: {
			level: "deep",
			label: "页面导航",
		},

		lastUpdated: {
			text: "最后更新于",
			formatOptions: {
				forceLocale: true,
				dateStyle: "full",
				timeStyle: "medium",
			},
		},

		notFound: {
			title: "页面未找到",
			quote:
				"但如果您不改变方向，并且继续寻找，您可能最终会到达您所前往的地方。",
			linkLabel: "前往首页",
			linkText: "带我回首页",
		},

		langMenuLabel: "多语言",
		returnToTopLabel: "回到顶部",
		sidebarMenuLabel: "菜单",
		darkModeSwitchLabel: "主题",
		lightModeSwitchTitle: "切换到浅色模式",
		darkModeSwitchTitle: "切换到深色模式",
		skipToContentLabel: "跳转到内容",
	},
});

function nav(): DefaultTheme.NavItem[] {
	return [
		{
			text: "文章",
			link: "/posts/",
			activeMatch: "/posts/",
		},
		{
			text: "分类",
			activeMatch: "/category",
			items: [
				{
					text: "教程",
					link: "/category/tutorial",
				},
				{
					text: "随笔",
					link: "/category/essay",
				},
			],
		},
		{
			text: "标签",
			link: "/tag",
			activeMatch: "/tag",
		},
		// {
		// 	text: "周刊",
		// 	link: "/weekly",
		// 	activeMatch: "/weekly",
		// },
		{
			text: "关于",
			link: "/about",
			activeMatch: "/about",
		},
	];
}

function sidebarPosts(): DefaultTheme.SidebarItem[] {
	return [];
}

function sidebarTutorial(): DefaultTheme.SidebarItem[] {
	return [
		{
			text: "如何使用 WeatherKit",
			link: "/posts/introduction-to-weatherkit",
		},
	];
}

function searchOptions(): Partial<DefaultTheme.LocalSearchOptions> {
	return {
		translations: {
			button: {
				buttonText: "搜索",
				buttonAriaLabel: "搜索",
			},
			modal: {
				displayDetails: "显示细节",
				resetButtonTitle: "重置搜索",
				backButtonTitle: "返回",
				noResultsText: "无搜索结果",
				footer: {
					selectText: "跳转",
					selectKeyAriaLabel: "跳转",
					navigateText: "选择",
					navigateUpKeyAriaLabel: "选择上一项",
					navigateDownKeyAriaLabel: "选择下一项",
					closeText: "关闭",
					closeKeyAriaLabel: "关闭",
				},
			},
		},
	};
}

import { defineAdditionalConfig, type DefaultTheme } from "vitepress";

export default defineAdditionalConfig({
  lang: "en-US",
  description: "Some notes about coding.",

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/en/posts/": {
        base: "/en/posts/",
        items: sidebarPosts(),
      },
    },

    editLink: {
      pattern:
        "https://github.com/wangqiyangx/wangqiyangx.github.io/edit/main/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025, @wangqiyangx",
    },
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "Blog",
      link: "/en/posts/",
      activeMatch: "/en/posts",
    },
    {
      text: "Projects",
      activeMatch: "/en/projects",
      items: [
        {
          text: "Examples",
          link: "/en/projects/examples",
        },
      ],
    },
  ];
}

function sidebarPosts(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "Tutorials",
      collapsed: true,
      base: "/en/posts/tutorials/",
      items: [
        {
          text: "Button",
          link: "the-ultimate-swiftui-button-tutorial",
        },
      ],
    },
    {
      text: "RSS Feed",
      base: "/en",
      link: "/en/feed.rss",
    },
  ];
}

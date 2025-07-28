import { defineAdditionalConfig, type DefaultTheme } from "vitepress";

export default defineAdditionalConfig({
  lang: "en-US",
  description: "Some notes about coding.",

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/posts/": {
        base: "/posts/",
        items: sidebarPosts(),
      },
    },

    editLink: {
      pattern: "https://github.com/wangqiyangx/swift-notes/edit/main/:path",
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
      link: "/posts/",
      activeMatch: "/posts",
    },
    {
      text: "Projects",
      activeMatch: "/projects",
      items: [
        {
          text: "Examples",
          link: "/projects/examples",
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
      base: "/posts/tutorials/",
      items: [
        {
          text: "Button",
          link: "the-ultimate-swiftui-button-tutorial",
        },
      ],
    },
    {
      text: "RSS Feed",
      base: "/",
      link: "/feed.rss",
    },
  ];
}

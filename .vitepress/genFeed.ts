// https://github.com/vuejs/blog/blob/main/.vitepress/genFeed.ts

import path from "path";
import { writeFileSync } from "fs";
import { Feed } from "feed";
import { createContentLoader, type SiteConfig } from "vitepress";

const baseUrl = `https://wangqiyangx.github.io/swift-notes`;

async function genFeedZH(config: SiteConfig) {
  const feed = new Feed({
    title: "Swift 开发笔记",
    description: "记录开发日常",
    id: baseUrl,
    link: baseUrl,
    language: "zh",
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `版权所有 © 2025， @wangqiyangx`,
  });

  const posts = await createContentLoader("zh/posts/*/*.md", {
    excerpt: true,
    render: true,
  }).load();

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string)
  );

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
      description: excerpt,
      content: html?.replaceAll("&ZeroWidthSpace;", ""),
      author: [
        {
          name: frontmatter.author,
          link: frontmatter.x ? `https://x.com/${frontmatter.x}` : undefined,
        },
      ],
      date: frontmatter.date,
    });
  }

  writeFileSync(path.join(config.outDir, `zh/feed.rss`), feed.rss2());
}

async function genFeedEN(config: SiteConfig) {
  const feed = new Feed({
    title: "Coding Notes",
    description: "Some articles",
    id: baseUrl,
    link: baseUrl,
    language: "en",
    favicon: `${baseUrl}/favicon.ico`,
    copyright: `Copyright (c) 2025, @wangqiyangx`,
  });

  const posts = await createContentLoader("en/posts/*/*.md", {
    excerpt: true,
    render: true,
  }).load();

  posts.sort(
    (a, b) =>
      +new Date(b.frontmatter.date as string) -
      +new Date(a.frontmatter.date as string)
  );

  for (const { url, excerpt, frontmatter, html } of posts) {
    feed.addItem({
      title: frontmatter.title,
      id: `${baseUrl}${url}`,
      link: `${baseUrl}${url}`,
      description: excerpt,
      content: html?.replaceAll("&ZeroWidthSpace;", ""),
      author: [
        {
          name: frontmatter.author,
          link: frontmatter.x ? `https://x.com/${frontmatter.x}` : undefined,
        },
      ],
      date: frontmatter.date,
    });
  }

  writeFileSync(path.join(config.outDir, `/feed.rss`), feed.rss2());
}

export async function genFeed(config: SiteConfig) {
  await genFeedEN(config);
  await genFeedZH(config);
}

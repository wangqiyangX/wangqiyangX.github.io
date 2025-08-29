# wangqiyangX.github.io

[![VitePress](https://img.shields.io/badge/VitePress-2.0.0--alpha.11-646cff?style=flat-square&logo=Vite)](https://vitepress.dev/)
[![Lunaria](https://img.shields.io/badge/Lunaria-0.1.1-4f46e5?style=flat-square)](https://lunaria.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.5.19-4fc08d?style=flat-square&logo=Vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org/)

个人博客网站，基于 VitePress 2.0 构建，支持中英文双语内容。

## ✨ 特性

- 🚀 基于 VitePress 2.0 的现代化静态站点生成
- 🌍 完整的中英文双语支持
- 📱 响应式设计，支持移动端和桌面端
- 🎨 简洁优雅的界面设计
- 📝 Markdown 支持，包含数学公式渲染
- 💬 集成 Giscus 评论系统
- 🔍 内置搜索功能
- 📊 自动生成 RSS Feed
- 🏷️ 分类和标签系统

## 🛠️ 技术栈

- **框架**: VitePress 2.0
- **构建工具**: Vite
- **前端**: Vue 3 + TypeScript
- **国际化**: Lunaria
- **样式**: CSS + Tailwind CSS
- **部署**: GitHub Pages

## 📁 项目结构

```
wangqiyangX.github.io/
├── .vitepress/         # VitePress 配置
├── en/                 # 英文内容
│   ├── about.md        # 关于页面
│   ├── category/       # 分类页面
│   ├── posts/          # 博客文章
│   ├── tag/            # 标签页面
│   └── weekly/         # 周报
├── zh/                 # 中文内容
│   ├── about.md        # 关于页面
│   ├── category/       # 分类页面
│   ├── posts/          # 博客文章
│   ├── tag/            # 标签页面
│   └── weekly/         # 周报
├── lunaria.config.json # Lunaria 国际化配置
└── package.json        # 项目依赖
```

## 🚀 快速开始

### 环境要求

- Node.js 22+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
# 启动开发服务器
pnpm docs:dev

# 构建生产版本
pnpm docs:build

# 预览构建结果
pnpm docs:preview
```

### 国际化相关

```bash
# 构建翻译文件
pnpm lunaria:build

# 预览翻译结果
pnpm lunaria:preview
```

## 📝 内容管理

### 添加新文章

1. 在对应语言目录的 `posts/` 文件夹中创建新的 `.md` 文件
2. 在文件头部添加必要的 frontmatter：

    ```yaml
    ---
    title: 文章标题
    date: 2025-08-29
    author:
    twitter:
    comments: true
    ---

    文章简介
    <!-- end -->
    ```

3. 使用 Markdown 语法编写内容

### 添加新分类或标签

在对应语言目录的 `category/` 或 `tag/` 文件夹中创建新的 `.md` 文件。

## 🌐 国际化

项目使用 Lunaria 进行国际化管理：

- 默认语言：简体中文 (`zh`)
- 支持语言：中文、英文
- 自动检测内容变更并生成翻译建议

## 📚 内容分类

### 博客文章 (`/posts`)

- iOS 开发相关技术文章
- 工具和效率提升

### 分类 (`/category`)

- 教程 (`tutorial`)
- 随笔 (`essay`)

### 标签 (`/tag`)

- Swift
- SwiftUI
- UIKit
- iOS 开发
- 前端技术

## 🔧 配置说明

### VitePress 配置

主要配置文件位于 `.vitepress/config.ts`，包含：

- 站点基本信息
- 导航栏配置
- 侧边栏配置
- 插件配置

### Lunaria 配置

国际化配置位于 `lunaria.config.json`，包含：

- 仓库信息
- 语言配置
- 文件匹配规则

## 📦 部署

项目配置为自动部署到 GitHub Pages：

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建和部署
3. 访问 `https://wangqiyangx.github.io`

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

- GitHub: [@wangqiyangX](https://github.com/wangqiyangX)
- Email: <wangqiyangx@gmail.com>
- X: [@wangqiyangx](https://x.com/wangqiyangx)

---

**求知若饥，虚心若愚** - 保持学习的热情，保持谦逊的态度。

# wangqiyangX.github.io

[![VitePress](https://img.shields.io/badge/VitePress-2.0.0--alpha.11-646cff?style=flat-square&logo=Vite)](https://vitepress.dev/)
[![Lunaria](https://img.shields.io/badge/Lunaria-0.1.1-4f46e5?style=flat-square)](https://lunaria.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.5.19-4fc08d?style=flat-square&logo=Vue.js)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178c6?style=flat-square&logo=TypeScript)](https://www.typescriptlang.org/)

Personal blog website built with VitePress 2.0, supporting both Chinese and English content.

## ✨ Features

- 🚀 Modern static site generation based on VitePress 2.0
- 🌍 Complete bilingual support for Chinese and English
- 📱 Responsive design for mobile and desktop
- 🎨 Clean and elegant interface design
- 📝 Markdown support with math formula rendering
- 💬 Integrated Giscus comment system
- 🔍 Built-in search functionality
- 📊 Automatic RSS Feed generation
- 🏷️ Category and tag system

## 🛠️ Tech Stack

- **Framework**: VitePress 2.0
- **Build Tool**: Vite
- **Frontend**: Vue 3 + TypeScript
- **Internationalization**: Lunaria
- **Styling**: CSS + Tailwind CSS
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
wangqiyangX.github.io/
├── .vitepress/         # VitePress configuration
├── en/                 # English content
│   ├── about.md        # About page
│   ├── category/       # Category pages
│   ├── posts/          # Blog posts
│   ├── tag/            # Tag pages
│   └── weekly/         # Weekly reports
├── zh/                 # Chinese content
│   ├── about.md        # About page
│   ├── category/       # Category pages
│   ├── posts/          # Blog posts
│   ├── tag/            # Tag pages
│   └── weekly/         # Weekly reports
├── lunaria.config.json # Lunaria i18n configuration
└── package.json        # Project dependencies
```

## 🚀 Quick Start

### Requirements

- Node.js 22+
- pnpm 8+

### Install Dependencies

```bash
pnpm install
```

### Local Development

```bash
# Start development server
pnpm docs:dev

# Build for production
pnpm docs:build

# Preview build results
pnpm docs:preview
```

### Internationalization

```bash
# Build translation files
pnpm lunaria:build

# Preview translation results
pnpm lunaria:preview
```

## 📝 Content Management

### Adding New Posts

1. Create a new `.md` file in the `posts/` folder of the corresponding language directory
2. Add necessary frontmatter at the beginning of the file:

    ```yaml
    ---
    title: Post Title
    date: 2025-08-29
    author:
    twitter:
    comments: true
    ---

    Post description
    <!-- end -->
    ```

3. Write content using Markdown syntax

### Adding New Categories or Tags

Create new `.md` files in the `category/` or `tag/` folders of the corresponding language directory.

## 🌐 Internationalization

The project uses Lunaria for internationalization management:

- Default language: Simplified Chinese (`zh`)
- Supported languages: Chinese, English
- Automatically detects content changes and generates translation suggestions

## 📚 Content Categories

### Blog Posts (`/posts`)

- iOS development related technical articles
- Tool and efficiency improvement

### Categories (`/category`)

- Tutorial (`tutorial`)
- Essay (`essay`)

### Tags (`/tag`)

- Swift
- SwiftUI
- UIKit
- iOS Development
- Frontend Technology

## 🔧 Configuration

### VitePress Configuration

Main configuration file is located at `.vitepress/config.ts`, including:

- Site basic information
- Navigation bar configuration
- Sidebar configuration
- Plugin configuration

### Lunaria Configuration

Internationalization configuration is located at `lunaria.config.json`, including:

- Repository information
- Language configuration
- File matching rules

## 📦 Deployment

The project is configured for automatic deployment to GitHub Pages:

1. Push code to the `main` branch
2. GitHub Actions automatically builds and deploys
3. Visit `https://wangqiyangx.github.io`

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

- GitHub: [@wangqiyangX](https://github.com/wangqiyangX)
- Email: <wangqiyangx@gmail.com>
- X: [@wangqiyangx](https://x.com/wangqiyangx)

---

**Stay hungry, stay foolish** - Keep the passion for learning and maintain a humble attitude.

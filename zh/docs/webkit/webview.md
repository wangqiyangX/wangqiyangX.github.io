# WebView
>
> 一个显示网页内容的视图。

::: tip
iOS 26.0+ Beta
iPadOS 26.0+ Beta
Mac Catalyst 26.0+ Beta
macOS 26.0+ Beta
visionOS 26.0+ Beta
:::

```swift
@MainActor @preconcurrency
struct WebView
```

## 概述

使用 WebView 在应用的本地视图中展示 HTML、CSS 和 JavaScript 内容。当使用 init(url:) 初始化器时，通过 URL 指定网页内容，或者在使用 init(_:) 初始化器时，通过 WebPage 指定，这样可以完全控制浏览体验。页面的任何更新都会将信息传播到视图中。

WebView 提供完整的浏览体验，包括使用链接在不同网页之间导航的能力、前进和后退按钮等。当用户点击您内容中的链接时，视图会像浏览器一样，显示该链接的内容。要自定义导航，请使用与您的 WebView 配合的 WebPage，并自定义 WebPage.Configuration，或者创建一个符合 WebPage.NavigationDeciding 的新类型。

以下示例根据切换的状态显示两个不同的 URL，并且还防止了前后导航手势：

```swift
struct ContentView: View {
    @State private var toggle = false


    private var url: URL? {
        toggle ? URL(string: "https://www.webkit.org") : URL(string: "https://www.swift.org")
    }


    var body: some View {
        WebView(url: url)
            .toolbar {
                Button(buttonName, systemImage: buttonIcon) {
                    toggle.toggle()
                }
            }
            .webViewBackForwardNavigationGestures(.disabled)
    }
}
```

A WebView 是一个可滚动的视图，行为类似于 ScrollView。可以通过以下方式自定义 WebView 中的滚动：

- `scrollBounceBehavior(_:axes:)`
- `webViewScrollInputBehavior(_:for:)`
- `webViewScrollPosition(_:)`
- `webViewOnScrollGeometryChange(for:of:action:)`

自定义 WebView 的显示和交互，使用视图修饰符，例如：

- `webViewBackForwardNavigationGestures(_:)`
- `webViewMagnificationGestures(_:)`
- `webViewLinkPreviews(_:)`
- `webViewTextSelection(_:)`
- `webViewElementFullscreenBehavior(_)`
- `webViewContextMenu(menu:)`
- `webViewContentBackground(_:)`

要进一步自定义和控制网页交互，将一个 WebView 连接到一个 WebPage。以下示例通过将视图的导航标题配置为网页的标题来演示这一点，系统会自动更新该标题，因为 WebPage 是一个 Observable 类型：

```swift
struct ContentView: View {
    @State private var page = WebPage()

    var body: some View {
        NavigationStack {
            WebView(page)
                .navigationTitle(page.title)
        }
    }
}
```

您只能将一个 WebPage 绑定到一个 WebView。

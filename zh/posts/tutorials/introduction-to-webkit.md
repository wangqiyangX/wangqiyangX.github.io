# WebKit 入门

> 基于 iOS 26+

## WebView

SwiftUI 提供的原生视图，可用于显示 HTML 等内容。

WebView 提供了两种初始化方法：

1. `init(WebPage)`

2. `init(url: URL?)`

### 加载 URL 指向的网页

直接给 WebView 传递一个 URL 对象即可。

```swift
struct ContentView: View {
    var body: some View {
        WebView(url: URL(string: "https://www.webkit.org"))
    }
}
```

### 加载 WebPage 管理的页面

### 控制 WebView 的滚动

#### `webViewOnScrollGeometryChange`

### 配置 WebView 的交互行为

#### `webViewBackForwardNavigationGestures`

禁止左右滑手势控制页面前进和返回。

## WebPage

Observable 类型
控制和管理交互式网页

### 控制 WebPage 状态

#### load

初始化加载网页数据，支持 html 字符串、链接等。

```swift
let page = WebPage()
page.load(html: "")

page.load(webData)
// page.load()
```

#### reload

重新加载当前 WebPage 内容。

### 获取当前 webpage 的状态

#### `isLoading` 指示当前 WebPage 是否加载完成

```swift
if webPage.isLoading {
  ProgressView()
} else {
  WebView(webPage)
}
```

## 控制 WebPage 的行为

### WebPage.Configuration

通过 `WebPage.Configuration` 来自定义 WebPage 。

```swift
var configuration = WebPage.Configuration()
configuration.supportsAdaptiveImageGlyph = true
// 
```

### 其他配置项

## WebPage 导航控制

## 代码示例

## 常见问题

### 网页横向滚动

网页内容宽度需要进行限制，同时调整 `ScrollBounceBehavior` 的值为 `.basedOnSize`

```swift
WebView()
    .scrollBounceBehavior(.basedOnSize, axes: .horizontal)
```

```css
*,
*::before,
*::after {
  box-sizing: border-box;
  max-width: 100%;
}

html,
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
}
```

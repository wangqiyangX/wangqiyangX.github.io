# 文本编辑器

> 一个可以显示和编辑长文本的视图。

::: tip
iOS 14.0+
iPadOS 14.0+
Mac Catalyst 14.0+
macOS 11.0+
visionOS 1.0+
:::

```swift
struct TextEditor
```

## 概述

文本编辑器视图允许您在应用的用户界面中显示和编辑多行可滚动文本。默认情况下，文本编辑器视图使用从环境中继承的特性来样式化文本，例如 `font(_:)`、`foregroundColor(_:)` 和 `multilineTextAlignment(_:)`。

您可以通过将一个 TextEditor 实例添加到视图的主体中来创建文本编辑器，并通过传入应用中的字符串变量的 Binding 来初始化它：

```swift
struct TextEditingView: View {
    @State private var fullText: String = "This is some editable text..."


    var body: some View {
        TextEditor(text: $fullText)
    }
}
```

要样式化文本，请使用标准视图修饰符来配置系统字体、设置自定义字体或更改视图文本的颜色。

在这个例子中，视图将编辑器的文本以灰色和自定义字体呈现：

```swift
struct TextEditingView: View {
    @State private var fullText: String = "This is some editable text..."


    var body: some View {
        TextEditor(text: $fullText)
            .foregroundColor(Color.gray)
            .font(.custom("HelveticaNeue", size: 13))
    }
}
```

如果您想更改文本的间距或字体缩放方面，可以使用修饰符，如 `lineLimit(_:)`、`lineSpacing(_:)` 和 `minimumScaleFactor(_:)` 来配置视图如何根据空间限制显示文本。例如，这里 `lineSpacing(_:)` 修饰符将行间距设置为 5 个点：

```swift
struct TextEditingView: View {
    @State private var fullText: String = "This is some editable text..."


    var body: some View {
        TextEditor(text: $fullText)
            .foregroundColor(Color.gray)
            .font(.custom("HelveticaNeue", size: 13))
            .lineSpacing(5)
    }
}
```

## `init(text:)`

> 创建一个纯文本编辑器。

::: tip
iOS 14.0+
iPadOS 14.0+
Mac Catalyst 14.0+
macOS 11.0+
visionOS 1.0+
:::

`init(text: Binding<String>)`

### 参数

#### text

一个 Binding，用于绑定包含要编辑文本的变量。

## 讨论

使用 TextEditor 实例创建一个视图，用户可以在其中输入和编辑长文本。

在这个例子中，文本编辑器使用 13 号 Helvetica Neue 字体渲染灰色文本，每行之间有 5 点的间距：

```swift
struct TextEditingView: View {
    @State private var fullText: String = "This is some editable text..."


    var body: some View {
        TextEditor(text: $fullText)
            .foregroundColor(Color.gray)
            .font(.custom("HelveticaNeue", size: 13))
            .lineSpacing(5)
    }
}
```

您可以定义视图内文本的样式，包括文本颜色、字体和行间距。您通过将标准视图修饰符应用于视图来定义这些样式。

默认的文本编辑器不支持富文本，例如在编辑器视图内对单个元素的样式设置。您设置的样式会全局应用于视图中的所有文本。

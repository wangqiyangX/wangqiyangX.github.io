# 支持更多小组件尺寸

> 通过支持各种小组件尺寸，在更多场景中提供小组件。

## 概述

在为你的应用添加了小组件扩展并创建了第一个小组件后，使用 `supportedFamilies(_:)` 属性修饰符添加代码，声明你的应用支持的其他小组件。你使用的尺寸取决于你的应用支持的设备。如果你的应用支持多个平台，请确保有条件地声明支持的小组件系列。
以下示例来自 Emoji Rangers: Supporting Live Activities, interactivity, and animations 示例代码项目，展示了如何在 Widget 实现中声明多个小组件尺寸。该应用在 watchOS 和 iOS 上都支持配件小组件，并在 iOS 上支持 WidgetFamily.systemSmall 和 WidgetFamily.systemMedium 小组件。请注意 `#if os(watchOS)` 宏的用法，以确保为每个平台声明正确支持的小组件系列。

```swift
public var body: some WidgetConfiguration {
    makeWidgetConfiguration()
        .configurationDisplayName("Ranger Detail")
        .description("See your favorite ranger.")
#if os(watchOS)
        .supportedFamilies([.accessoryCircular,
                            .accessoryRectangular, .accessoryInline])
#else
        .supportedFamilies([.accessoryCircular,
                            .accessoryRectangular, .accessoryInline,
                            .systemSmall, .systemMedium, .systemLarge])
#endif
}
```

## 更新 SwiftUI 视图以支持更多尺寸

在你在 Widget 中声明支持额外的小组件尺寸后，更新你的小组件视图以支持这些额外的系列尺寸。在你的视图代码中：
使用 widgetFamily 环境变量来检测不同的小组件系列。
为每种尺寸构建视图，并根据需要包含处理如鲜明和深色模式等外观的代码。要了解更多信息，请参阅为其他平台、上下文和外观准备小组件 。
以下示例展示了 Emoji Rangers: Supporting Live Activities, interactivity, and animations 示例代码项目中的一段简化代码片段。它会根据不同的小组件系列有条件地返回正确的 SwiftUI 视图。

```swift
struct EmojiRangerWidgetEntryView: View {
    var entry: Provider.Entry

    @Environment(\.widgetFamily) var family


    @ViewBuilder
    var body: some View {
        switch family {
        case .accessoryCircular:
            // Code to construct the view for the circular accessory widget or watch complication.
        case .accessoryRectangular:
            // Code to construct the view for the rectangular accessory widget or watch complication.
        case .accessoryInline:
            // Code to construct the view for the inline accessory widget or watch complication.
        case .systemSmall:
            // Code to construct the view for the small widget.
        case .systemLarge:
            // Code to construct the view for the large widget.
        case .systemMedium
            // Code to construct the view for the medium widget.
        default:
            // Code to construct the view for other widgets, for example, the extra large widget.
        }
    }
}
```

::: tip
Tip
Use Xcode previews to view your widget designs without running your app in Simulator or on a device. For more information, see Preview widgets in Xcode.
:::

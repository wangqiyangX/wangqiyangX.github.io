# SwiftUI

> 在每个平台上声明你的应用的用户界面和行为。
> :::tip
> iOS 13.0+
> iPadOS 13.0+
> Mac Catalyst 13.0+
> macOS 10.15+
> tvOS 13.0+
> visionOS 1.0+
> watchOS 6.0+
> :::

## 概述

SwiftUI 提供用于声明应用用户界面的视图、控件和布局结构。该框架为应用提供事件处理器，用于传递点击、手势和其他类型的输入，并提供工具来管理从应用模型到用户所见并与之交互的视图和控件的数据流。

使用 App 协议定义你的应用结构，并通过包含构成应用用户界面的视图的场景来填充它。创建符合 View 协议的自定义视图，并将它们与 SwiftUI 视图组合，利用堆叠、列表等方式显示文本、图片和自定义形状。对内置视图和自定义视图应用强大的修饰符，以自定义它们的渲染和交互性。通过能够适应不同上下文和展示方式的视图和控件，在多个平台的应用之间共享代码。

![An image of the Landmarks sample app on Mac, iPad, and iPhone showing the Mount Fuji landmark.](https://docs-assets.developer.apple.com/published/ce193ec494e91d4150c3356442824213/landmarks-app-article-hero@2x.png)

你可以将 SwiftUI 视图与 UIKit、AppKit 和 WatchKit 框架中的对象集成，以进一步利用平台特定的功能。你还可以在 SwiftUI 中自定义辅助功能支持，并为不同的语言、国家或文化地区本地化你的应用界面。

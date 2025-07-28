# 手势

> 定义从轻触、点击和滑动到精细手势的交互。

## 概述

通过向视图添加手势修饰符来响应手势。您可以监听轻触、拖动、捏合和其他标准手势。

![gestures-hero](/public/docs/swiftui/gestures/gestures-hero@2x.png)

您还可以使用 `simultaneously(with:)` 、 `sequenced(before:)` 或 `exclusively(before:)` 修饰符从单个手势组合自定义手势，或使用 `modifiers(_:)` 修饰符将手势与键盘修饰符结合。

::: tip
当您需要一个按钮时，使用 Button 实例而不是轻触手势。您可以使用任何视图作为按钮的标签，按钮类型会自动提供用户期望的许多标准行为，例如可访问性标签和提示。
:::

有关设计指导，请参阅《人机界面指南》中的[手势](https://developer.apple.com/design/Human-Interface-Guidelines/gestures)部分。

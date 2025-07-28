# TapGesture

> 识别一个或多个点击的手势。

::: tip
iOS 13.0+
iPadOS 13.0+
Mac Catalyst 13.0+
macOS 10.15+
tvOS 16.0+
visionOS 1.0+
watchOS 6.0+
:::

```swift
struct TapGesture
```

## 概述

要在视图上识别点击手势，请创建并配置手势，然后使用 `gesture(_:including:)` 修饰符将其添加到视图中。以下代码为 Circle 添加了一个点击手势，用于切换圆形的颜色：

```swift{5-8}
struct TapGestureView: View {
    @State private var tapped = false


    var tap: some Gesture {
        TapGesture(count: 1)
            .onEnded { _ in self.tapped = !self.tapped }
    }


    var body: some View {
        Circle()
            .fill(self.tapped ? Color.blue : Color.red)
            .frame(width: 100, height: 100, alignment: .center)
            .gesture(tap)
    }
}
```

## 创建点击手势

### `init(count:)`

> 创建一个具有所需点击次数的点击手势。

```swift
init(count: Int = 1)
```

#### count

完成点击手势所需的点击次数。

### `count`

> 实例属性

所需的点击事件次数。

```swift
var count: Int
```

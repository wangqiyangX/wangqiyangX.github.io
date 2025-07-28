# `onTapGesture(count:perform:)`

> 当此视图识别到点击手势时，添加要执行的操作。

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
nonisolated
func onTapGesture(
    count: Int = 1,
    perform action: @escaping () -> Void
) -> some View
```

## 参数

### count

触发 `action` 中提供的操作闭包所需的点击或轻点次数。默认为 1 。

### action

要执行的操作

## 讨论

使用此方法可在用户点击或轻触视图或容器 `count` 次时执行指定的 `action` 。

在下面的示例中，每当用户在视图上点击或轻触两次时，心形图像的颜色会从 `colors` 数组中随机变换：

```swift {12-14}
struct TapGestureExample: View {
    let colors: [Color] = [.gray, .red, .orange, .yellow,
                           .green, .blue, .purple, .pink]
    @State private var fgColor: Color = .gray


    var body: some View {
        Image(systemName: "heart.fill")
            .resizable()
            .frame(width: 200, height: 200)
            .foregroundColor(fgColor)
            .onTapGesture(count: 2) {
                fgColor = colors.randomElement()!
            }
    }
}
```

![SwiftUI-View-TapGesture](/docs/swiftui/gestures/SwiftUI-View-TapGesture@2x.png){.light-only}
![SwiftUI-View-TapGesture](/docs/swiftui/gestures/SwiftUI-View-TapGesture~dark@2x.png){.dark-only}

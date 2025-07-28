# `onTapGesture(count:coordinateSpace:perform:)`

> 当此视图识别到点击手势时，添加要执行的操作，并为该操作提供交互的位置。

::: tip
iOS 17.0+
iPadOS 17.0+
Mac Catalyst 17.0+
macOS 14.0+
visionOS 1.0+
watchOS 10.0+
:::

```swift
nonisolated
func onTapGesture(
    count: Int = 1,
    coordinateSpace: some CoordinateSpaceProtocol = .local,
    perform action: @escaping (CGPoint) -> Void
) -> some View
```

## 参数

### count

触发 `action` 中提供的操作闭包所需的点击或轻点次数。默认为 1 。

### coordinateSpace

接收位置值的坐标空间。默认为 [[CoordinateSpace.local]] 。

### action

要执行的操作。此闭包会接收一个输入，指示交互发生的位置。

## 讨论

使用此方法可在用户点击或轻点被修改视图 `count` 次时执行指定的 `action` 。操作闭包会接收交互发生的位置。

:::
如果你创建了一个在功能上等同于 Button 的控件，请使用 ButtonStyle 来创建一个自定义按钮。
:::

以下代码为 Circle 添加了一个点击手势，根据点击位置切换圆形的颜色。

```swift
struct TapGestureExample: View {
    @State private var location: CGPoint = .zero


    var body: some View {
        Circle()
            .fill(self.location.y > 50 ? Color.blue : Color.red)
            .frame(width: 100, height: 100, alignment: .center)
            .onTapGesture { location in
                self.location = location
            }
    }
}
```

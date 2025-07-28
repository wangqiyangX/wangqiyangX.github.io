# `onLongPressGesture(minimumDuration:maximumDistance:perform:onPressingChanged:)`

当此视图识别到长按手势时，添加要执行的操作。
::: tip
iOS 13.0+
iPadOS 13.0+
Mac Catalyst 13.0+
macOS 10.15+
visionOS 1.0+
watchOS 6.0+
:::

```swift
nonisolated
func onLongPressGesture(
    minimumDuration: Double = 0.5,
    maximumDistance: CGFloat = 10,
    perform action: @escaping () -> Void,
    onPressingChanged: ((Bool) -> Void)? = nil
) -> some View
```

## 参数

### `minimumDuration`

在手势被识别为长按之前，必须经过的最短按压时间。

### `maximumDistance`

在长按手势识别失败前，执行长按的手指或光标可移动的最大距离。

### `action`

识别到长按时要执行的操作。

### `onPressingChanged`

当手势的按压状态发生变化时运行的闭包，并将当前状态作为参数传递。

# `onLongPressGesture(minimumDuration:perform:onPressingChanged:)`

> 当此视图识别到长按手势时，添加要执行的操作。

::: tip
tvOS 14.0+
:::

```swift
nonisolated
func onLongPressGesture(
    minimumDuration: Double = 0.5,
    perform action: @escaping () -> Void,
    onPressingChanged: ((Bool) -> Void)? = nil
) -> some View
```

## 参数

### `minimumDuration`

在手势被识别为长按之前，必须经过的最短按压时间。

### `action`

识别到长按时要执行的操作。

### `onPressingChanged`

当手势的按压状态发生变化时运行的闭包，并将当前状态作为参数传递。

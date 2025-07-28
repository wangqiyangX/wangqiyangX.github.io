# `onLongTouchGesture(minimumDuration:perform:onTouchingChanged:)`

> 当此视图识别到遥控器长触摸手势时，添加要执行的操作。长触摸手势是指手指放在遥控器触摸表面上但没有实际按下。
> ::: tip
> tvOS 16.0+
> :::

```swift
nonisolated
func onLongTouchGesture(
    minimumDuration: Double = 0.5,
    perform action: @escaping () -> Void,
    onTouchingChanged: ((Bool) -> Void)? = nil
) -> some View
```

## 参数

### `minimumDuration`

长按手势在被识别为成功前，必须经过的最短持续时间。

### `action`

当识别到长按手势时要执行的操作

### `onTouchingChanged`

当手势的触摸状态发生变化时要运行的闭包，并将当前状态作为参数传递。

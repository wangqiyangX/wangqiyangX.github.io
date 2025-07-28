# `sensoryFeedback(trigger:_:)`

> 当提供的 trigger 值发生变化后，从 feedback 闭包返回时播放反馈。
> ::: tip
> iOS 17.0+
> iPadOS 17.0+
> Mac Catalyst 17.0+
> macOS 14.0+
> tvOS 17.0+
> visionOS 26.0+
> Beta
> watchOS 10.0+
> :::

```swift
nonisolated
func sensoryFeedback<T>(
    trigger: T,
    _ feedback: @escaping () -> SensoryFeedback?
) -> some View where T : Equatable
```

## 参数

### trigger

用于监控变化以确定何时播放的值。

### feedback

一个闭包，用于确定当 `trigger` 发生变化时，是否播放反馈以及播放哪种类型的反馈。

## 讨论

例如，你可以为不同的状态转换播放不同的反馈：

```swift
struct MyView: View {
    @State private var isExpanded = false


    var body: some View {
        ContentView(isExpanded: $isExpanded)
            .sensoryFeedback(trigger: isExpanded) {
                isExpanded ? .impact : nil
            }
    }
}
```

当该值发生变化时，将调用闭包的新版本，因此任何被捕获的值都将具有被观察值更新后的值。

# `sensoryFeedback(_:trigger:)`

> 当提供的 trigger 值发生变化时，播放指定的 feedback。
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
    _ feedback: SensoryFeedback,
    trigger: T
) -> some View where T : Equatable
```

## 参数

### feedback

要播放的反馈类型。

### trigger

用于监测变化以确定何时播放的值。

## 讨论

例如，您可以在状态值发生变化时播放反馈：

```swift
struct MyView: View {
    @State private var showAccessory = false


    var body: some View {
        ContentView()
            .sensoryFeedback(.selection, trigger: showAccessory)
            .onLongPressGesture {
                showAccessory.toggle()
            }


        if showAccessory {
            AccessoryView()
        }
    }
}
```

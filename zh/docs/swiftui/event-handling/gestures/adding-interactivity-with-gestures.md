# 通过手势添加交互性

> 使用手势修饰符为您的应用添加交互性。

## 概述

手势修饰符处理处理用户输入事件（如触摸）所需的所有逻辑，并识别这些事件何时与已知的手势模式（如长按或旋转）匹配。当识别到某种模式时，SwiftUI 会运行一个回调，您可以用它来更新视图的状态或执行某个操作。

## 为视图添加手势修饰符

您添加的每个手势都应用于视图层级中的特定视图。要在某个特定视图上识别手势事件，请创建并配置手势，然后使用 `gesture(_:including:)` 修饰符：

```swift
struct ShapeTapView: View {
    var body: some View {
        let tap = TapGesture()
            .onEnded { _ in
                print("View tapped!")
            }

        return Circle()
            .fill(Color.blue)
            .frame(width: 100, height: 100, alignment: .center)
            .gesture(tap)
    }
}
```

## 响应手势回调

根据你添加到手势修饰符的回调，SwiftUI 会在手势状态发生变化时将信息反馈给你的代码。手势修饰符提供三种接收更新的方式： `updating(_:body:)` 、 `onChanged(_:)` 和 `onEnded(_:)` 。

## 更新临时 UI 状态

要在手势变化时更新视图，请在你的视图中添加一个 [[gesturestate|GestureState]] 属性，并在 `updating(_:body:)` 回调中进行更新。SwiftUI 一旦识别到手势并且手势的值发生变化时，就会调用 `updating` 回调。例如，当缩放手势开始时，SwiftUI 会立即调用 `updating` 回调，并且每当缩放值发生变化时也会再次调用。SwiftUI 不会在用户结束或取消手势时调用 `updating` 回调。相反，手势状态属性会自动将其状态重置为初始值。

例如，要让一个视图在用户执行长按时改变颜色，可以添加一个手势状态属性，并在 `updating` 回调中进行更新。

```swift
struct CounterView: View {
    @GestureState private var isDetectingLongPress = false

    var body: some View {
        let press = LongPressGesture(minimumDuration: 1)
            .updating($isDetectingLongPress) { currentState, gestureState, transaction in
                gestureState = currentState
            }

        return Circle()
            .fill(isDetectingLongPress ? Color.yellow : Color.green)
            .frame(width: 100, height: 100, alignment: .center)
            .gesture(press)
    }
}
```

## 在手势过程中更新永久状态

要跟踪手势的变化，并且在手势结束后不重置这些变化，请使用 `onChanged(_:)` 回调。例如，如果你想统计应用识别到长按的次数，可以添加一个 `onChanged(_:)` 回调并递增计数器。

```swift
struct CounterView: View {
    @GestureState private var isDetectingLongPress = false
    @State private var totalNumberOfTaps = 0

    var body: some View {
        let press = LongPressGesture(minimumDuration: 1)
            .updating($isDetectingLongPress) { currentState, gestureState, transaction in
                gestureState = currentState
            }.onChanged { _ in
                self.totalNumberOfTaps += 1
            }

        return VStack {
            Text("\(totalNumberOfTaps)")
                .font(.largeTitle)

            Circle()
                .fill(isDetectingLongPress ? Color.yellow : Color.green)
                .frame(width: 100, height: 100, alignment: .center)
                .gesture(press)
        }
    }
}
```

## 在手势结束时更新永久状态

要识别手势何时成功完成并获取手势的最终值，请在回调中使用 `onEnded(_:)` 函数来更新应用的状态。SwiftUI 只会在手势成功时调用 `onEnded(_:)` 回调。例如，在 LongPressGesture 期间，如果用户在 `minimumDuration` 秒内松开手指，或者手指移动超过 `maximumDistance` 点，SwiftUI 都不会调用 `onEnded(_:)` 回调。

例如，要在用户完成长按后停止计数长按尝试次数，可以添加一个 `onEnded(_:)` 回调，并有条件地应用手势修饰符。

```swift
struct CounterView: View {
    @GestureState private var isDetectingLongPress = false
    @State private var totalNumberOfTaps = 0
    @State private var doneCounting = false

    var body: some View {
        let press = LongPressGesture(minimumDuration: 1)
            .updating($isDetectingLongPress) { currentState, gestureState, transaction in
                gestureState = currentState
            }.onChanged { _ in
                self.totalNumberOfTaps += 1
            }
            .onEnded { _ in
                self.doneCounting = true
            }

        return VStack {
            Text("\(totalNumberOfTaps)")
                .font(.largeTitle)

            Circle()
                .fill(doneCounting ? Color.red : isDetectingLongPress ? Color.yellow : Color.green)
                .frame(width: 100, height: 100, alignment: .center)
                .gesture(doneCounting ? nil : press)
        }
    }
}
```

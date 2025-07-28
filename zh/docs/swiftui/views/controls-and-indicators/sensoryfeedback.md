# SensoryFeedback

> 表示可以播放的一种触觉和/或音频反馈类型。

::: tip
iOS 17.0+
iPadOS 17.0+
Mac Catalyst 17.0+
macOS 14.0+
tvOS 17.0+
visionOS 26.0+ Beta
watchOS 10.0+
:::

```swift
struct SensoryFeedback
```

## 概述

此反馈可以传递给 `View.sensoryFeedback` 以进行播放。

## 指示开始和停止

### start

> 表示某项活动已开始。

```swift
static let start: SensoryFeedback
```

在启动计时器或任何其他可以明确开始和停止的活动时，使用此触觉反馈。
仅在 watchOS 上播放反馈。

### stop

> 表示某项活动已停止。

```swift
static let stop: SensoryFeedback
```

在停止计时器或其他先前已启动的活动时使用此触觉反馈。
仅在 watchOS 上播放反馈。

## 指示更改和选择

### alignment

> 表示被拖动项目的对齐方式。

```swift
static let alignment: SensoryFeedback
```

例如，在绘图应用中，当用户将一个形状拖动到与另一个形状对齐时，可以使用此模式。
仅在 iOS 和 macOS 上播放反馈。

### decrease

### increase

### levelChange

### selection

### pathComplete

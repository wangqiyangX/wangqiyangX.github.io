# CMHeadphoneActivityManager

> 一个启动和管理耳机活动服务的对象。

::: tip
iOS 18.0+
iPadOS 18.0+
Mac Catalyst 18.0+
macOS 15.0+
watchOS 11.0+
:::

```swift
class CMHeadphoneActivityManager
```

## 概述

此类将耳机活动更新传递给您的应用程序。使用管理器的实例来确定设备是否支持耳机活动更新，以及启动和停止更新。在使用此类之前，请检查 `isActivityAvailable` 和 `isStatusAvailable` 以确保这些功能可用。

此类提供的信息与 CMMotionActivityManager 类似，唯一不同的是活动信息来自耳机运动，而不是设备运动。

::: warning 注意
In iOS and macOS, include the NSMotionUsageDescription key in your app’s Info.plist file. If this key is absent, trying to start headphone activity updates terminates your app.
:::

# 请求使用通知的权限

> 请求显示提醒、播放声音或在应用图标上显示角标以响应通知的权限。

## 概述

本地和远程通知通过显示提醒、播放声音或在应用图标上显示角标来吸引用户注意。这些交互发生在您的应用未运行或在后台运行时。它们让用户知道您的应用有相关信息需要他们查看。由于用户可能认为基于通知的交互具有干扰性，因此您必须获得使用它们的许可。

![A screenshot showing the system prompting a person to allow or disallow the use of alerts, sounds, and badges when the app sends notifications.](https://docs-assets.developer.apple.com/published/09fe7bfb520668466145ef245b3c0a50/media-3559454~dark%402x.png)

## 明确地在上下文中请求授权

要请求授权，获取共享的 UNUserNotificationCenter 实例，并调用其 requestAuthorization(options:completionHandler:) 方法。指定您的应用使用的所有交互类型。例如，您可以请求授权以显示提醒、在应用图标上添加角标或播放声音：

```swift
let center = UNUserNotificationCenter.current()


do {
    try await center.requestAuthorization(options: [.alert, .sound, .badge])
} catch {
    // Handle the error here.
}
// Enable or disable features based on the authorization.
```

当您的应用首次发出此授权请求时，系统会提示用户授予或拒绝该请求，并记录该响应。后续的授权请求不会再次提示用户。

在有助于人们理解您的应用程序为何需要授权的情境下提出请求。在发送提醒通知的任务跟踪应用中，您可以在用户安排第一个任务后提出请求。在情境中发送请求比在首次启动时自动请求授权提供了更好的体验，因为人们可以看到您的应用通知所服务的目的。

## 使用临时授权发送试用通知

当您明确要求获得发送通知的权限时，人们必须在看到您的应用发送的通知之前决定是否允许或拒绝授权。即使您在请求授权之前仔细设置了情境，人们可能没有足够的信息来做出决定，并可能拒绝授权。

使用临时授权来试用发送通知。人们随后可以评估这些通知，并决定是否授权它们。

系统会以静默方式发送临时通知——它们不会以声音或横幅打断用户，也不会出现在锁屏上。相反，它们只会出现在通知中心的历史记录中。这些通知还包含按钮，提示用户保留或关闭通知。

![A screenshot of a provisional notification in the notification center, with buttons to keep or turn off the notification.](https://docs-assets.developer.apple.com/published/7ab9098dfb8cdbc554b7da2b7c7d3097/media-3544497~dark%402x.png)

如果用户按下"保留"按钮，系统会提示他们在两个选项之间进行选择：立即发送或在预定摘要中发送。立即发送会以静默方式发送未来的通知。系统授权您的应用发送通知，但不允许您的应用显示提醒、播放声音或在应用图标上显示角标。除非用户更改其通知设置，否则您的通知只会出现在通知中心历史记录中。仅当用户在设置中开启了预定摘要功能时，才会显示"在预定摘要中发送"选项。

如果用户按下"关闭"按钮，系统会在拒绝您的应用发送额外通知的授权之前确认该选择。
要请求临时授权，请在请求发送通知的权限时添加 `provisional` 选项。

```swift
let center = UNUserNotificationCenter.current()


do {
    try await center.requestAuthorization(options: [.alert, .sound, .badge, .provisional])
} catch {
    // Handle errors that may occur during requestAuthorization.
}
```

与显式请求授权不同，这段代码不会提示用户允许接收通知。相反，第一次调用此方法时，它会自动授予授权。然而，在用户明确保留或关闭通知之前，授权状态为 `UNAuthorizationStatus.provisional`。由于用户可以随时更改授权状态，因此在安排本地通知之前请检查状态。
此外，如果您请求临时授权，您可以在应用程序首次启动时请求授权。只有当用户实际收到通知时，才会被要求保留或关闭通知。

## 根据当前授权自定义通知

在安排本地通知之前，始终检查应用程序的授权状态。用户可以随时更改应用程序的授权设置。他们还可以更改应用程序允许的交互类型——这可能会导致您需要改变应用程序发送的通知数量或类型。
为了给用户提供最佳体验，请调用通知中心的 `getNotificationSettings(completionHandler:)` 方法来获取当前的通知设置。然后根据这些设置来自定义通知。

```swift
let center = UNUserNotificationCenter.current()


// Obtain the notification settings.
let settings = await center.notificationSettings()


// Verify the authorization status.
guard (settings.authorizationStatus == .authorized) ||
      (settings.authorizationStatus == .provisional) else { return }


if settings.alertSetting == .enabled {
    // Schedule an alert-only notification.
} else {
    // Schedule a notification with a badge and sound.
}
```

上述示例使用了一个保护条件，以防止在应用未获授权的情况下安排通知。然后，代码根据允许的交互类型配置通知，尽可能优先使用基于警报的通知。
即使您的应用程序未获得某些交互的授权，您可能仍想配置通知的警报、声音和标记信息。如果您的 UNNotificationSettings 实例的 `notificationCenterSetting` 属性设置为 `UNNotificationSetting.enabled`，系统仍会在通知中心显示警报。当您的应用程序在前台运行时，您的通知中心代理的 `userNotificationCenter(_:willPresent:withCompletionHandler:)` 方法也会接收到通知，并且仍然可以访问警报、声音或标记信息。

# 用户通知

> 从服务器向用户设备推送面向用户的通知，或从您的应用程序本地生成通知。

::: tip
iOS 10.0+
iPadOS 10.0+
Mac Catalyst 13.0+
macOS 10.14+
tvOS 10.0+
visionOS 1.0+
watchOS 3.0+
:::

## 概述

面向用户的通知可以向您的应用程序用户传达重要信息，无论您的应用程序是否在用户设备上运行。例如，一个体育应用可以让用户知道他们喜欢的球队得分了。通知还可以告诉您的应用下载信息并更新其界面。通知可以显示警报、播放声音或在应用图标上显示角标。

![A notification interface displayed on the lock screen and on the Home screen of an iOS device.](https://docs-assets.developer.apple.com/published/bbded47b8403179709770e735dcac1b0/media-4182210~dark%402x.png){.dark-only}

您可以从您的应用程序本地生成通知，或从您管理的服务器远程生成通知。对于本地通知 ，应用程序创建通知内容并指定触发通知传递的条件，如时间或位置。对于远程通知 ，您公司的服务器生成推送通知，而 Apple 推送通知服务（APNs）负责将这些通知传递到用户的设备。
使用此框架可以执行以下操作：

- 定义您的应用支持的通知类型。
- 定义与您的通知类型相关的任何自定义操作。
- 安排本地通知的发送。
- 处理已经发送的通知。
- 响应用户选择的操作。

系统会尽力及时传递本地和远程通知，但无法保证一定能送达。PushKit 框架为特定类型的通知（如 VoIP 和 watchOS 复杂功能使用的通知）提供了更及时的传递机制。更多信息，请参阅 PushKit。

对于 Safari 16.0 及更高版本中的网页，可以使用在 Safari 和其他浏览器中都能工作的 Push API 代码，从您管理的服务器生成远程通知。

::: tip 注意
Siri 可以使用您的应用通过通知 API 贡献的设备内信息，在搜索、新闻、Safari 和其他应用中为用户提供建议。用户可以随时通过您应用的 Siri 和搜索设置来更改此功能。
:::

有关设计指南，请参阅 Human Interface Guidelines > Notifications。

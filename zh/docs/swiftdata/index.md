# SwiftData

> 以声明式方式编写模型代码，以添加托管持久化和高效的模型获取。

::: tip
iOS 17.0+
iPadOS 17.0+
Mac Catalyst 17.0+
macOS 14.0+
tvOS 17.0+
visionOS 1.0+
watchOS 10.0+
:::

## 概述

SwiftData 结合了 Core Data 经过验证的持久化技术和 Swift 现代并发特性，使你能够以极少的代码、无需外部依赖，快速为应用添加持久化功能。通过使用宏等现代语言特性，SwiftData 让你能够编写快速、高效且安全的代码，从而描述应用的整个模型层（或对象图）。该框架负责存储底层模型数据，并可选地在多台设备间同步这些数据。

SwiftData 的用途不仅限于本地持久化内容。例如，一个从远程网络服务获取数据的应用可以使用 SwiftData 实现轻量级缓存机制，并提供有限的离线功能。

![swiftdata-hero](https://docs-assets.developer.apple.com/published/aa99d190da3e4c58796b4201d5e7b4c7/swiftdata-hero@2x.png)

SwiftData 设计上不具侵入性，并可补充你应用现有的模型类。只需为任意模型类添加 `Model()` 宏，即可使其具备持久化能力。你可以使用 `Attribute(_:originalName:hashModifier:)` 和 `Relationship(_:deleteRule:minimumModelCount:maximumModelCount:originalName:inverse:hashModifier:)` 宏自定义该模型属性的行为。使用 ModelContext 类可以插入、更新和删除该模型的实例，并将未保存的更改写入磁盘。

要在 SwiftUI 视图中显示模型，请使用 `Query()` 宏，并指定谓词或获取描述符。SwiftData 会在视图出现时执行获取操作，并在获取到的模型发生任何后续更改时通知 SwiftUI，以便视图能够相应地更新。你可以在任何 SwiftUI 视图中使用 `modelContext` 环境值访问模型上下文，并通过 `modelContainer(_:)` 和 `modelContext(_:)` 视图修饰符为视图指定特定的模型容器或上下文。

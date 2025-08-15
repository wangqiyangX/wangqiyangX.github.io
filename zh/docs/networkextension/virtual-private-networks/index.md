# 路由您的 VPN 网络流量

> 配置您的 VPN 以包含和排除部分网络流量。

## 概述

你可以控制系统路由到和来自个人 VPN、数据包隧道提供商或应用代理提供商的部分网络流量。网络扩展框架为所有 VPN 类型提供路由设置，并为个人 VPN 和数据包隧道提供商提供一些特定设置。你可以使用规则配置到每个应用的 VPN 数据包路由，并在 MDM 监督设备上为始终在线 VPN 设置例外。
要查看创建不同类型 VPN 的完整 API，请参见个人 VPN、 数据包隧道提供商和应用代理提供商 。

## 配置数据包隧道提供商的流量

通过将 NEPacketTunnelNetworkSettings 实例传递给 NETunnelProvider 实例的 `setTunnelNetworkSettings(_:completionHandler:)` 方法，来配置数据包隧道提供商的虚拟接口。系统默认使用你在 NEPacketTunnelNetworkSettings 实例中提供的路由设置。
要通过数据包隧道提供程序路由流量,请创建一个同质数组的 NEIPv4Route 或 NEIPv6Route 元素,并将其分配给相应的设置属性,即:

- includedRoutes 属性的 ipv4Settings 属性
- includedRoutes 属性的 ipv6Settings 属性

您在这些数组中传递的 NEIPv4Route 和 NEIPv6Route 对象指定了 VPN 包含的流量类型。例如,以下代码指定了互联网协议版本 4 的流量:

```swift
// Create an internet protocol settings object.
let ipv4Settings = NEIPv4Settings(addresses: [ "192.168.3.4" ],
                                  subnetMasks: [ "255.255.0.0" ])

// Specify the types of traffic to include and exclude.
ipv4Settings.includedRoutes = [ NEIPv4Route(destinationAddress: "192.168.0.0",
                                            subnetMask: "255.255.0.0") ]
```

如果您在 includedRoutes 属性中包含默认路由（0.0.0.0/0 或 ::/0），系统会将不匹配系统路由表中任何其他更具体规则的网络流量通过 VPN 路由。
要排除 VPN 的流量，创建一个同质的 NEIPv4Route 或 NEIPv6Route 元素数组，并将其分配给相应的设置属性，可以是：

- 被排除的路由属性的 ipv4 设置属性
- 被排除的路由属性的 ipv6 设置属性

路由实例指定 VPN 排除的流量类型。

```swift
// Specify the types of traffic to exclude.
ipv4Settings.excludedRoutes = [ NEIPv4Route(destinationAddress: "192.168.5.6",
                                            subnetMask: "255.255.255.255")]
```

然后将数据包隧道提供程序的设置设置为一个 NEPacketTunnelNetworkSettings 实例,该实例包含使用 `setTunnelNetworkSettings(_:completionHandler:)` 方法的互联网协议设置。

```swift
// Create a network settings object with the internet protocol settings.
let networkSettings = NEPacketTunnelNetworkSettings(tunnelRemoteAddress: "127.0.0.1")
networkSettings.ipv4Settings = ipv4Settings

// Set the packet tunnel provider's settings.
setTunnelNetworkSettings(networkSettings) { error in
    completionHandler(error)
}
```

请注意，系统路由表优先于 `includedRoutes` 和 `excludedRoutes` 属性。例如，如果表格将流量路由到本地网络上的主机，这些路由将优先于这些属性。
此外，如果应用程序创建了一个网络连接,通过特定的网络接口路由流量,称为作用域 ,那么它将取代系统路由表。

## 通过个人 VPN 或数据包隧道提供商路由额外流量

要将与维持设备预期功能所需的指定系统服务无关的网络流量路由到个人 VPN 或数据包隧道提供商，请将 `includeAllNetworks` 属性设置为 true。

```swift
// Create the tunnel provider configuration.
let protocolConfiguration = NETunnelProviderProtocol()
protocolConfiguration.serverAddress = "<https://127.0.0.1>"

// Include network traffic.
protocolConfiguration.includeAllNetworks = true
```

然后系统将网络连接范围限定为 VPN 隧道，但有一些例外。

此外，当 VPN 从断开连接（NEVPNStatus.disconnected）状态转换到连接中（NEVPNStatus.connecting）状态时，系统不会关闭 TCP 连接，但会丢弃先前建立的网络连接发送或接收的后续数据包。

当 VPN 从已连接状态过渡到其他状态时，系统会丢弃网络流量。例如，当设备从 Wi-Fi 网络切换到蜂窝网络时，以及 VPN 正在通过蜂窝网络重新连接到 VPN 服务器时，系统会丢弃网络流量。

系统总是将以下流量排除在 VPN 之外,而 `includeAllNetworks` 属性对此没有影响:

- 维持设备与本地网络连接的网络控制平面流量,如 DHCP 流量,或直接与 VPN 服务器通信的流量。
- 受限门户协商网络流量,授权设备连接 Wi-Fi 热点。例如,咖啡店的 Wi-Fi 热点可能要求用户接受法律条款和条件,然后才允许设备访问互联网。
- 某些仅使用蜂窝网络的蜂窝服务流量,如 VoLTE。
- 与伴随设备（如 Apple Watch）通信的流量。

## 从个人 VPN 或数据包隧道提供商中排除某些流

您可以在通过 VPN 路由网络流量时使用其他 NEVPNProtocol 属性进行其他例外。如果将 includeAllNetworks 属性设置为 true，您可以排除特定类型的流量不通过 VPN。

- 要排除与本地网络上的主机（如 AirPlay、AirDrop 和 CarPlay）的网络连接，请将 `excludeLocalNetworks` 属性设置为 true。
- 要排除蜂窝服务网络流量（如 Wi-Fi 通话、彩信、短信和可视语音信箱），请将 `excludeCellularServices` 属性设置为 true。此属性不会影响仅使用蜂窝网络的服务（如 - VoLTE），系统会自动排除这些服务。
- 要排除 Apple 推送通知服务(APNs)流量,请将 `excludeAPNs` 属性设置为 true。许多系统和应用程序功能使用 APNs,当您通过 VPN 路由 APNs 时,可能无法可靠地工作,从而导致推送通知和 iMessage 丢失或延迟。

```swift
// Include network traffic.
protocolConfiguration.includeAllNetworks = true

// Except for local network, APNs, and cellular traffic.
protocolConfiguration.excludeLocalNetworks = true
protocolConfiguration.excludeAPNs = true
protocolConfiguration.excludeCellularServices = true
```

## 为数据包隧道提供程序强制执行包含和排除规则

要强制执行 includedRoutes 和 excludedRoutes 属性，请将 enforceRoutes 属性设置为 true。

```swift
protocolConfiguration.enforceRoutes = true
```

系统将包含的路由范围限定在 VPN 内，将排除的路由范围限定在当前主要网络接口上，如 Wi-Fi 或蜂窝网络。此属性覆盖系统路由表和应用程序的路由范围操作。它与 `includeAllNetworks` 属性互斥。如果将 `includeAllNetworks` 设置为 true，系统将忽略 `enforceRoutes` 属性。
如果将 `enforceRoutes` 和 `excludeLocalNetworks` 属性都设置为 true，系统将从强制路由行为中排除对本地网络主机的网络连接。

```swift
protocolConfiguration.excludeLocalNetworks = true
protocolConfiguration.enforceRoutes = true
```

例如，如果 `includedRoutes` 属性包含 10.0.0.0/8 地址，而本地网络子网是 10.10.0.0/16，系统会将 10.0.0.0/8 网络中的主机的网络连接限定在 VPN 中，但不包括 10.10.0.0/16 网络中的主机。

## 将网络流量路由到特定应用程序及其从特定应用程序路由出去

在网络扩展框架中，你可以使用两种类型的每应用 VPN 功能来控制特定应用的网络流量。你可以使用数据包隧道提供程序将应用的网络连接限定在 VPN 范围内，或使用应用代理将应用的网络连接转发到透明代理。要以编程方式配置每应用 VPN，请对于数据包隧道使用 NEPacketTunnelProvider 类，对于应用代理使用 NEAppProxyProviderManager 类。

对于数据包隧道提供程序，使用每个应用的 VPN 规则来覆盖应用执行的任何作用域操作。

- 对于 macOS 应用，使用 appRules 属性将 MDM 管理的应用与每应用 VPN 配置关联。然后使用 excludedDomains 属性配置排除项。将此属性设置为要从每应用 VPN 中排除的域名列表。
- 对于 iOS 应用，使用 MDM 系统创建规则，并在代码中使用 copyAppRules() 方法访问这些规则。
系统遵循您的按需断开连接规则。如果启用按需功能（将 isOnDemandEnabled 属性设置为 true）并提供断开连接应用规则，系统将为符合按需规则条件的网络设备绕过每应用 VPN。

请注意，除非 VPN 处于连接状态，否则应用程序通常无法通过网络进行通信。
有关每个应用的 VPN 功能的更多信息，请参阅 NETunnelProviderManager 类概述。

## 从始终连接的 VPN 中排除流量

在 iOS 中，您可以从始终连接的 VPN 设备配置中排除某些网络流量。始终连接的 VPN 作为 iOS 设备连接互联网的唯一方式。通过在 MDM 监管的设备上安装始终连接的 VPN 配置文件，可以启用此功能。

然后系统会通过 VPN 路由设备上的网络流量，但有一些排除项。当 VPN 未处于连接状态，且设备在 VPN 启动之前启动时，系统会丢弃网络流量。例如，当系统从 Wi-Fi 网络切换或用户禁用 VPN 时，VPN 会断开连接。

系统始终排除网络控制平面流量（如 DHCP），但仅在您启用配置文件中的 AllowAllCaptiveNetworkPlugins、AllowCaptiveWebSheet 或 AllowedCaptiveNetworkPlugins 负载密钥时排除 captive portal 协商流量。

在始终开启的 VPN 配置文件中，您可以使用以下键来排除其他流量：

- 应用程序异常(VPN.AlwaysOn.ApplicationExceptionElement) — 指定要从始终开启的 VPN 中排除的应用程序。
- 服务异常(VPN.AlwaysOn.ServiceExceptionElement) — 指定从始终连接的 VPN 中排除的服务。可能的值包括语音邮件、AirPrint 和蜂窝服务。

有关 MDM 和配置始终在线 VPN 的更多信息，请参见使用配置文件配置多个设备和特定配置文件的有效负载密钥 。

# 建立点对点 Wi-Fi 连接

> 与配对设备建立安全的传出和传入连接。

## 概述

有了 Wi-Fi Aware™技术，您的应用程序可以在 Wi-Fi 设备之间安全地建立点对点(P2P)连接。通过使用 Wi-Fi Aware 框架，设备可以在没有互联网连接或接入点的情况下发现、配对和与其他附近的设备进行通信。

要让您的应用程序配对设备，或要求使用您的应用程序的人访问现有设备，您可以使用以下两种方法之一:

- 设备发现 UI：为设备到设备和应用到应用的用例（如文件传输和媒体流）配对任何类型的设备。
- 配件设置工具包：将个人硬件配件与配件的配套应用程序配对，用于设置和配件管理。

在用户配对设备或授予您的应用程序访问设备的权限后，系统会将该设备添加到您应用程序的 WAPairedDevice.Devices 集合中，您可以通过 allDevices API 访问该集合。

## 连接配对设备

在您的应用程序配对设备后，它可以根据需要在这些设备之间启动安全的点对点 Wi-Fi 连接。Wi-Fi Aware 框架与网络框架集成,提供 Wi-Fi Aware 连接和相关功能,扩展了几个常见的网络原语:

- 网络浏览器订阅配对设备上的 Wi-Fi Aware 服务,并与之建立安全的出站连接。
- 网络监听器向配对设备发布 Wi-Fi Aware 服务,并接受来自它们的安全连接。
- 网络连接打开了一个安全、高性能的数据连接到 Wi-Fi Aware 设备。
- NWParameters 配置 Wi-Fi Aware 参数。
- NWPath 获取 Wi-Fi Aware 连接状态和性能指标。
- NWError 获取 Wi-Fi Aware 错误状态。

## 创建监听器以发布

以下代码示例创建了一个 NetworkListener，通过 Wi-Fi Aware 发布 _example-service._tcp 服务，并接受来自指定配对设备的传入连接:

```swift
// Specifies a service.
extension WAPublishableService {
    public static var exampleService: WAPublishableService {
        allServices["_example-service._tcp"]!
    }
}


// Selects devices from the list of the example app's paired devices.
let devices = #Predicate<WAPairedDevice> { $0.name?.starts(with: "My Device") ?? false }


// Constructs a `NetworkListener` to publish the service and accept connections from the selected devices.
// Can optionally provide Wi-Fi Aware configuration parameters in the `datapath:` parameter.
let listener = try NetworkListener(for:
        .wifiAware(.connecting(to: .exampleService, from: .matching(devices), datapath: .defaults)),
    using: {
        TLS()
    })
    .onStateUpdate { listener, state in
    // Processes state updates.
}
```

## 创建一个浏览器以订阅

以下示例代码创建了一个网络浏览器 ，它订阅了通过 Wi-Fi Aware 提供的 _example-service._tcp 服务，并提供浏览结果供系统用于与指定配对设备建立出站连接:

```swift
// Specifies a service.
extension WASubscribableService {
    public static var exampleService: WASubscribableService {
        allServices["_example-service._tcp"]!
    }
}


// Selects `devices` from the list of all paired devices.
let devices = #Predicate<WAPairedDevice> { $0.name?.starts(with: "My Device") ?? false }


// Constructs a `NetworkBrowser` to subscribe for the service on the selected devices. 
let browser = NetworkBrowser(
    for:
        .wifiAware( .connecting(to: .matching(devices),  from: .exampleService))
)
```

有关制作和管理网络连接的更多信息,请参考网络框架。

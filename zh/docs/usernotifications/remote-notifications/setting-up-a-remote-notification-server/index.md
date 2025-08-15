设置远程通知服务器
生成通知并将其推送到用户设备。
概述
使用远程通知（也称为推送通知）向使用您的应用程序的设备推送少量数据,即使您的应用程序未运行。应用程序使用通知向用户提供重要信息。例如,消息服务在收到新消息时发送远程通知。
远程通知的传递涉及几个关键组件: 1. 应用程序:负责注册设备并接收远程通知。 2. 推送通知服务:负责将通知从应用程序传递到设备。常见的推送通知服务有 Apple Push Notification Service(APNS)和 Google Cloud Messaging(GCM)。 3. 通知内容:包括标题、消息体、声音、图标等。 4. 设备:接收并显示远程通知的终端设备,如 iOS 设备或 Android 设备。 5. 网络连接:应用程序、推送通知服务和设备之间的网络连接,确保通知能够及时传递
您公司的服务器，被称为提供商服务器
Apple 推送通知服务(APNs)
用户设备
在用户设备上运行的您的应用程序
远程通知始于您公司的服务器。您决定要向用户发送哪些通知以及何时发送。到了发送通知的时候,您会生成一个包含通知数据和用户设备唯一标识符的请求,然后将请求转发给 APNs,由它负责将通知送达用户设备。收到通知后,用户设备上的操作系统会处理用户交互并将通知传递给您的应用程序。
Your company’s provider server communicates with Apple Push Notification service, which in turn communicates with the user’s devices.
您需要负责设置提供商服务器并配置您的应用程序以处理用户设备上的通知。苹果公司负责中间的一切,包括向用户呈现通知。您还必须在用户设备上运行一个可以与您的服务器通信并提供必要信息的应用程序。有关如何配置您的应用程序以处理远程通知的信息,请参见向 APNs 注册您的应用程序 。
Tip
If you’re setting up a provider server to send push notifications to users in Safari and other browsers, see Sending web push notifications in web apps and browsers.
为通知构建自定义基础设施
设置远程通知服务器包括几个关键任务。您如何实现这些任务取决于您的基础设施。使用适合您公司的技术： 1. 创建一个可以接收和处理通知的服务器。这可以是一个专用的服务器或一个现有的服务器。 2. 配置服务器以接收来自移动设备的通知。这可能涉及设置推送通知服务、消息队列或其他通信机制。 3. 编写代码来处理接收到的通知。这可能包括存储通知数据、触发其他系统操作或将通知转发给最终用户。 4. 测试您的远程通知系统,确保它能可靠地接收和处理通知。 5. 部署您的远程通知服务器,并确保它能与您的移动应用程序和其他系统顺利集成。
编写代码以从用户设备上运行的应用程序实例接收设备令牌,并将这些令牌与用户帐户关联。请参见向 APNs 注册您的应用程序 。
确定何时向用户发送通知,并编写代码生成通知有效负载。请参见生成远程通知 。
使用 HTTP/2 和 TLS 管理与 APNs 的连接。请参见向 APNs 发送通知请求 。
编写代码生成包含您有效负载的 POST 请求,并通过 HTTP/2 连接发送这些请求。参见向 APNs 发送通知请求 。
定期重新生成您的令牌以进行基于令牌的身份验证。请参见建立与 APNs 的基于令牌的连接 。
建立与 APNs 的可信连接
您的提供商服务器与 APNs 之间的通信必须通过安全连接进行。创建安全连接需要在每个提供商服务器上安装 AAA Certificate Services 根证书和 SHA-2 根证书：USERTrust RSA 认证机构证书 。
如果您的提供商服务器运行 macOS Sequoia 或更高版本,AAA 和 UserTrust 证书服务根证书默认存在于密钥链中。在其他系统上,您可能需要自行安装此证书。您可以从 Sectigo 知识库网站下载"AAACertificateServices 5/12/2020"证书,并从 Sectigo 知识库网站下载"SHA-2 Root : USERTrust RSA Certification Authority"证书。
Tip
APNs is migrating from AAA to UserTrust Certificate Services root certificate. For migration dates, consult Developer News.
要发送通知,您的提供商服务器必须使用 HTTP/2 和 TLS 与 APNs 建立基于令牌或基于证书的信任。这两种技术都有优缺点,因此请决定哪种技术最适合您的公司。
要设置基于令牌的 APNs 信任，请参见建立与 APNs 的基于令牌的连接 。
要建立基于证书的与 APNs 的信任关系，请参见建立与 APNs 的基于证书的连接 。
了解 APNs 的功能
APNs 会尽最大努力传递您的通知,并提供最佳的用户体验:
APNs 管理一个经过认证、加密和持久的 IP 连接到用户设备。
APNs 可以为当前离线的设备存储通知。当设备上线时,APNs 会转发这些已存储的通知。
如果 APNs 由于设备电源考虑或目标离线而无法立即传递通知,它可能会合并同一包 ID 的通知。

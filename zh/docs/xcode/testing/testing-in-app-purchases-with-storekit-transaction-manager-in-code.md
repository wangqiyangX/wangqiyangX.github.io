使用 Xcode 中的 StoreKit 交易管理器测试应用内购买
使用 Xcode 中的交易管理器测试应用内购买,无需连接 App Store 服务器。
概述
Xcode 提供了一个交易管理器 ，可与 Xcode 中的 StoreKit 测试一起使用。使用交易管理器，您可以在开发的任何阶段测试应用内购买。在将您的应用推送到线上之前测试应用内购买有助于确保无缝的购买流程、测试各种边缘情况和逻辑,并验证购买行为是否正确。
使用交易管理器来更改设置和启动测试条件,检查交易,并模拟不同类型的购买。
笔记
您需要在 Xcode 中设置 StoreKit，然后才能使用交易管理器进行测试。更多信息请参见在 Xcode 中设置 StoreKit 测试 。
更改设置并启动测试条件
在项目导航器中选择您的 StoreKit 配置文件，然后选择"编辑"以更改以下设置：
Default Storefront
设置事务的 storefront 属性。
Default Localization
设置影响支付单中货币显示以及 Product 本地化属性返回值的本地化设置。您需要在 StoreKit 配置文件中提供本地化数据。
Subscription Renewal Rate
改变测试环境中订阅的时间流逝速率与实际时间的比率。
Enable Interrupted Purchases
Causes the test environment to simulate a condition that prevents the customer from completing a purchase. Conditions that cause an interrupted purchase include a payment card expiring, or a customer needing to approve updated terms and conditions. Choose the Resolve Issue option in Debug > StoreKit > Manage Transactions to simulate the customer resolving the issue.
Enable Billing Retry on Renewal
使测试环境模拟客户续订付款失败的情况,订阅进入计费重试状态。在"调试>StoreKit>管理交易"中选择"解决问题"选项,模拟计费重试成功。
Enable Billing Grace Period
在 Xcode 测试环境中为您的应用启用计费宽限期。要测试此条件,请设置"启用续订时的计费重试"。当订阅无法续订时,它将进入启用计费宽限期的计费重试状态。
Enable Ask to Buy
使测试环境在测试者尝试购买时显示"请求购买"提示。在"调试 > StoreKit > 管理交易"菜单中选择"批准交易"或"拒绝交易"选项来解决该交易。
Enable Dialogs
关闭此选项可以更快地运行您的测试。当您关闭此选项时，您假定用户已确认付款。系统然后在测试期间抑制确认动画和交互。打开此选项可在测试期间显示所有付款对话框。
Subscription Offers Key
提供一个您在测试环境中用于签署订阅优惠的密钥。使用此密钥而不是您的常规密钥在您的服务器上生成签名。有关更多信息,请参见为促销优惠生成签名 。
Simulate StoreKit failures
使测试环境应用您指定的错误条件,以使您能够测试应用程序的错误处理。
A screenshot in Xcode of a selected StoreKit configuration file in the Project navigator of Xcode. The sidebars shows the Configuration Settings option selected, and the main content area lists the various test conditions to test.
使用事务管理器检查事务
使用交易管理器中的选项来执行通常在应用程序外部发生的应用内购买流程中的步骤,例如批准或拒绝"询问购买"交易、接收退款等。要打开交易管理器,请选择"调试">"StoreKit">"管理交易"。
A screenshot of the StoreKit transaction manager listing app transactions. The left-hand side of the window lists devices and simulators along with their respective installed apps. The main content area lists the transactions. Each translation has a title, timestamp, and short product description.
交易管理器列出了正在运行的应用程序的所有交易。如果您在多个设备上运行多个应用程序,请在侧边栏中选择应用程序以查看其交易。使用交易管理器执行以下操作:
筛选交易 — 在对话框底部的筛选框中输入搜索词,以缩小显示的交易数量。
检查交易 - 点击一笔交易,然后在检查器中查看该交易的详细信息。点击产品或组旁边的跳转按钮,即可在 Xcode 的 StoreKit 配置文件中导航到它。
创建交易 - 点击过滤栏左侧的加号按钮。选择您想要创建交易的产品,然后配置交易。使用此功能来测试在设备外进行的应用内购买,并模拟客户在不同设备上完成的应用内购买。有关创建交易的更多信息,请参见模拟购买 。
删除交易 — 选择一笔交易并点击删除以重新测试客户只能执行一次的场景。例如，客户只能购买一次非消耗性产品，因此删除该交易以重新测试购买。删除订阅交易以重新测试优惠活动。更多信息请参见在应用程序中实施优惠活动 。如果您的应用程序使用应用内购买原始 API，请刷新收据以获取删除该交易的更新收据。
发送购买意向 — 模拟向您的应用程序发送购买意向,以确保您的应用程序正确处理它们。有关在应用程序中接收和处理购买意向的更多信息,请参见 PurchaseIntent。有关在测试环境中发送购买意向的更多信息,请参见发送购买意向 。
批准或拒绝交易 — 点击"批准"或"拒绝"来解决正在测试"购买请求"场景的待处理交易。
退款交易 — 点击"退款"来模拟客户收到退款。
解决交易 — 点击"解决"来模拟客户解决中断的购买。要模拟中断,请选择编辑器 > 启用中断购买。
测试价格上涨 — 选择一笔订阅交易,然后在工具栏中点击"请求价格上涨同意"按钮。使用系统在您的应用程序中显示的价格上涨表单进行测试,或使用按钮从应用程序外部模拟客户的响应,例如从推送通知。点击"批准"按钮表示客户接受价格上涨。点击"拒绝"按钮来模拟客户取消订阅。
测试环境会自动同步您所做的交易变更。您无需重新构建和运行您的应用程序。
模拟购买
应用内购买配置文件允许您在两个部分中定义应用内购买。使用"产品"部分定义可消耗和不可消耗的应用内购买。使用"订阅"部分定义自动续订订阅和非续订订阅。
要进行一次性应用内购买,请从左侧选择要测试的应用程序,然后单击过滤器栏左侧的加号按钮。在显示的产品屏幕上,选择您要购买的产品,然后单击下一步。
A screenshot of the Storekit products for a given app. The top of the window displays an empty search. The main content area lists the products with one of the products selected. The bottom section displays the various types of purchases that can be made (the default Purchase product is selected). The bottom row lists three buttons: Cancel, Previous, and Next. The Next button is active and enabled.
在显示的配置弹出窗口中，您可以接受默认设置,或者更改属性以反映您想要的购买。配置您的应用内购买后,单击"完成"按钮。
A screenshot of the product purchase configuration popup that displays a list of configuration options from top to bottom. The Quantity option has an entered value of 1. The Purchase Date text fields contain a date and time. The App Account Token text field is empty. The bottom row lists three buttons: Cancel, Previous, and Done. The Done button is active and enabled.
如果您的设备或模拟器未运行,该交易将以未完成状态显示在交易管理器屏幕顶部的新项目中。未完成的交易旁边会显示警告符号。要完成交易,请在设备或模拟器上运行您的应用程序。然后,您可以测试您的应用程序是否成功完成了交易。
要创建测试订阅购买,请返回交易管理器主屏幕,再次点击加号按钮,但这次从产品列表中选择一个自动续订订阅,然后点击下一步。
A screenshot of the Storekit transaction manager product popup with a filtered subscription product selected. A filter text field in the upper right-hand corner contains the text pass. A filtered list of products appears in the center content area, with one of the subscription products selected. Near the bottom is a row listing the different types of in-app purchases as radio button selections. The default, Purchase, is selected. The bottom row lists three buttons: Cancel, Previous, and Next. The Next button is active and enabled.
当订阅配置弹窗出现时,可接受默认设置,或者更改属性以反映您想要的订阅类型。例如,如果您的订阅有多种优惠类型,您可以选择从优惠下拉菜单中选择一个优惠代码。要测试不同的续订选项,请选择"自动续订"来测试生产环境中默认的续订行为,或选择"不续订",这将创建一次性购买,然后取消订阅。单击"完成"触发订阅购买。
A screenshot that displays the product configuration options for a subscription. The first option displays Offers that can be selected from a menu. No offers are selected. Beneath it is a Purchase Date text field that contains a date and time. The Renewal Options section displays two radio button options: Automatically Renew and Don’t Renew. The Automatically Renew radio button is selected. Next is an App Account Token text field that is blank. The bottom row lists three buttons: Cancel, Previous, and Done.
要完成测试购买,请在您进行购买的设备或模拟器上启动应用程序,您将在交易管理器中看到购买完成,并在应用程序中显示。
发送购买意向
在应用内购买并非人们购买您应用或游戏内容的唯一方式。作为开发者,您可以在 App Store 上推广应用内购买。当用户在 App Store 上看到应用内购买时,他们可以发起购买。App Store 然后将该购买意向发送到用户的设备上。当用户打开设备时,他们就可以完成购买。
Note
要发送购买意向,您的应用程序需要实现 PurchaseIntentAPI。
这个从 App Store 发送购买意图到你的应用程序的动作被称为购买意图。你可以按照以下方式在交易管理器中测试这个交互:
点击加号创建新的采购。
选择要发送购买意向的产品。
将产品列表下方的购买类型更改为"购买意向"。
单击"完成"并检查您的设备以继续。
A screenshot of the StoreKit transaction manager product of type Purchase Intent. The middle content area shows a selected product with the product type Purchase Intent radio button selected as its purchase type. Near the bottom is a row listing the different types of in-app purchases as radio button selections. The bottom row lists three buttons: Cancel, Previous, and Done. The Done button is active and enabled.
客户在其设备上确认购买后，购买即可完成。之后，交易将显示。

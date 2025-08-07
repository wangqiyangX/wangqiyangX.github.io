# 在 Xcode 中智能编写代码

> 生成代码、快速修复错误，并在 Xcode 中直接内置的智能帮助下边学边做。

## 概述

Xcode 中的编码智能功能帮助您编写代码、浏览不熟悉的代码库、寻找新功能的机会、修复或重构现有代码，并在此过程中生成文档。

![A screenshot of the project editor with the coding assistant in the sidebar on the left and a source file open in the source editor on the right. The coding assistant shows a prompt that asks to change the code and a response from the model.](https://docs-assets.developer.apple.com/published/aa5cfb394e845f0317e94147975790f1/coding-assistant-hero~dark%402x.png)

您可以使用自然语言提示与您选择的大型语言模型进行交互，提出问题并给出指令。该模型根据您之前的互动和项目上下文来优化对您提示的响应。您可以通过自动应用建议或自行选择性地审查和应用建议来控制对项目的更改。Xcode 会维护您与模型之间对话的历史记录，以便您可以查看过去的响应、跟踪更改，并返回到项目的任何先前状态。

## 设置 Coding Intelligence

在开始之前，您需要一个模型。只需几次点击，您就可以启用 ChatGPT 或添加您喜欢的任何模型提供者：

1. 在 Xcode 中，选择 *Xcode > Settings*。
2. 在侧边栏中选择 *Intelligence*。
3. 将 ChatGPT（如可用）设置为您的模型，或点击添加模型提供者按钮以使用其他模型提供者。

![A screenshot of the Intelligence settings showing the About Coding Intelligence and privacy link, the ChatGPT Turn On button, and the Add a Model Provider button.](https://docs-assets.developer.apple.com/published/33150263f08f496f0ddfccb6ff1678e2/coding-assistant-intell-settings~dark%402x.png){.dark-only}

要添加一个托管在互联网上的模型，选择互联网托管，输入 URL 和其他详细信息，然后在出现的对话框中点击添加。要添加一个托管在您 Mac 本地的模型，选择本地托管并输入端口和可选描述。

![A screenshot of the Intelligence settings showing the Add a Model Provider dialog with the Internet Hosted option selected, and the URL, other controls, and Add button below.](https://docs-assets.developer.apple.com/published/f267d21dc6ff574ec48e25c9a96c3e43/coding-add-model-provider-internet-hosted~dark%402x.png){.dark-only}

如果您选择其他模型，它需要支持聊天完成 API。此外，Xcode 期望该模型支持以下列出模型和执行完成的端点：

- {模型提供者 URL}/v1/models
- {模型提供者 URL}/v1/chat/completions

## 显示编码助手

在工具栏的左上角，点击导航按钮右侧的按钮以打开侧边栏中的编码助手区域，或按 Command-0。在这里，您可以输入提示，查看响应，开始和在对话之间导航，回滚更改等。

![A screenshot that shows the coding assistant sidebar cropped with a sample prompt and response displayed. The screenshot is annotated with callouts for the buttons, menus, and areas of the coding assistant.](https://docs-assets.developer.apple.com/published/0425b09c10e3611e9bde981703a17b4f/coding-assistant-anatomy~dark%402x.png){.dark-only}

如果侧边栏中出现“设置智能”按钮，请点击该按钮并在 `Xcode > 设置 > 智能` 中选择一个编码智能模型，例如 ChatGPT。

## 探索不熟悉的代码

您可以随时要求 Xcode 解释代码并查找文件以实现新功能，或者仅仅是为了熟悉一些代码。例如，如果您下载了 Landmarks 示例应用程序，您可以选择代码并提出问题，例如：

- 这个应用程序有什么功能？

![A screenshot of the coding assistant in the sidebar and a source file open in the source editor on the right. The coding assistant shows the results of entering the prompt, What does this app do? in the conversation area.](https://docs-assets.developer.apple.com/published/3940d5fbe7030db8e53f5f6b452b2b79/coding-assistant-explore-code-question~dark%402x.png){.dark-only}

Xcode 在编码助手的对话区域根据您的提示作出回应。回应可能包含您可以互动的内容。例如，如果回应中提到一个文件名，请点击文件名旁边的箭头按钮以在源编辑器中打开它。要继续与编码助手的对话，请输入后续提示，例如：

- 告诉我更多关于显示此对象的视图的信息

当您输入另一个提示时，编码助手会将您的提示和回应附加到对话中。Xcode 保留了您与模型互动的完整记录，以便您可以随时查阅。

## 了解符号和代码

在源代码编辑器中，按住 Control 键点击一个符号或代码选择，然后从上下文菜单中选择“显示编码工具”，或按 Command-Option-0。然后点击“解释”，或在编码工具弹出窗口中输入更具体的提示。编码助手将在对话区域显示提示及其响应。

![A screenshot that shows the project navigator in the sidebar and the source editor on the right with a code snippet selected and the Show Coding Tools popover displayed with the Explain button.](https://docs-assets.developer.apple.com/published/9dcc1c168409401c563ba441b9d476ec/coding-assistant-show-coding-tools~dark%402x.png){.dark-only}

或者，点击源代码编辑器边栏中的编码助手按钮以显示编码工具弹出窗口。

## 生成或修改代码

给 Xcode 提供具体的指令，以生成或修改代码。如果您没有得到预期的结果，请尝试将问题分解或添加更详细的指令。在每个提示之间，通过预览或游乐场检查和验证代码更改，并通过调整提示继续迭代您的应用，以获得您想要的行为。

例如，如果您是 Swift 和 SwiftUI 的新手，您可以跟随 Xcode 所做的修改进行编码。从您创建的模板开始一个 Swift 应用，并指示 Xcode 进行增量更改，例如：

- 向类添加属性和方法
- 创建一个列表视图并将其包装在 NavigationStack 中
- 添加编辑列表视图中项目属性的功能
- 将列表视图更改为显示所有属性的表格视图

在处理响应时，Xcode 会在消息文本字段中显示进度消息，然后在对话区域发布其响应。响应可能包含对更改的描述，包括一些步骤或代码更改。

![A screenshot of the coding assistant in the sidebar on the left and a file opened in the source editor on the right. The coding assistant shows the prompt, a code snippet, and a description of the changes.](https://docs-assets.developer.apple.com/published/0c18329c0bbb6f40ff9177ef7d1a5c82/coding-assistant-propose-code~dark%402x.png){.dark-only}

更改可能超出您的要求或基于您之前的提示。响应可能包含后续步骤并向您提出后续问题。Xcode 让您掌控局面，您可以根据需要引导和重定向对话，以将模型引导到您希望的方向。

您可以回答问题（与助手继续对话）或输入新的提示。

在源代码编辑器中生成关于特定符号的代码时，可以使用编码工具弹出窗口。控制点击一个符号，从上下文菜单中选择“Show Coding Tools”，然后在编码工具弹出窗口中输入提示。

## 将更改应用到您的代码

您可以在对话中看到 Xcode 自动应用于您的文件的代码更改，作为文件片段 。这些片段显示了修改或添加的文件，点击它们会带您到源编辑器中的特定更改。

::: tip 提示
Use snippets to navigate through all of the changes that Xcode applies and review them in the source editor.
:::

如果您希望 Xcode 自动编辑您的代码，请通过点击侧边栏右下角的按钮来开启自动应用更改。响应可能包含您可以互动的内容。例如，点击代码列表以在源编辑器中打开更改。Xcode 使用多彩的更改条来突出显示它使用编码智能所更改的代码行。

要撤销更改，请点击消息文本字段上方的“还原”。要重新应用更改，请点击“重新应用”。或者，点击侧边栏右上角的“历史”按钮，以查看更改历史并通过提示回滚它们（请参见使用对话历史回滚更改 ）。

如果您关闭自动应用按钮，Xcode 将建议对您的代码进行更改，而不是直接应用这些更改，并在对话中将其标记为“建议更改”。响应可能会描述助手建议的代码更改，并包含您可以选择性应用或粘贴到文件中的建议代码。要应用建议的更改，请单击响应中的代码，然后单击应用。要应用所有建议的更改，请单击消息文本字段上方的应用按钮。

![A screenshot that shows the coding assistant on the left containing a proposed changes response with the source code opened on the right highlighting the proposed changes with a multicolor change bar in the gutter.](https://docs-assets.developer.apple.com/published/0c18329c0bbb6f40ff9177ef7d1a5c82/coding-assistant-propose-code~dark%402x.png){.dark-only}

## 自定义提示的上下文

默认情况下，Xcode 会根据您的提示和对话历史自动收集相关上下文以发送给模型。除了自动上下文，您还可以通过在提示中提及特定符号和文件、上传附件或引用源编辑器中的选择来进行参考。
您可以通过输入 @ 字符并选择一个符号或文件来添加特定的符号和文件引用：

![A screenshot that highlights the coding assistant at the bottom of the sidebar. There’s an at-character in the message text field, and a completion menu shows suggested symbols and filenames the person can use.](https://docs-assets.developer.apple.com/published/147f7cc233f0ed5d0cb6402b3631e015/coding-assistant-enter-symbols~dark%402x.png){.dark-only}

要从项目外添加其他文件，请在消息文本字段下方的左下角的附件弹出菜单中选择“上传文件”，并从对话框中选择要上传的文件。
侧边栏右下角的项目上下文按钮默认开启。这允许 Xcode 与模型共享来自您项目的相关代码和其他上下文。要查看 Xcode 使用的文件和搜索词，如果在响应中出现项目上下文，请单击信息图标。要缩小项目文件的范围，请关闭自动搜索功能，并在提示中添加对文件和符号的明确引用。

![A screenshot of the coding assistant in the sidebar on the left and the source editor on the right with the Project Context information popover overlaying both panes.](https://docs-assets.developer.apple.com/published/f8cadff30189143f200b0821fe191a8a/coding-assistant-project-context~dark%402x.png){.dark-only}

## 生成 Playground 和 Preview

Playground 和预览是实验新代码的好方法，无需修改您的应用程序。使用 Playground 在画布中运行和显示代码片段，使用预览在不同平台上验证 UI 代码。Xcode 生成的 Playground 和预览代码可能包含示例数据，以帮助您更好地理解和可视化画布中的代码。

要将一个游乐场宏添加到您的项目中，请打开编码工具并选择生成游乐场：

![A screenshot that shows the Show Coding Tools popover open and the Generate a Playground button highlighted.](https://docs-assets.developer.apple.com/published/f8cadff30189143f200b0821fe191a8a/coding-assistant-project-context~dark%402x.png){.dark-only}

Xcode 在画布区域显示 playground 的结果，对于 SwiftUI 文件，则显示预览。如果画布未打开，请选择 *Edit > Canvas* 来显示它，然后点击 继续。

![A screenshot that shows the project navigator in the sidebar, a file opened in the source editor with the playground code generated, and the playground run in the canvas on the right.](https://docs-assets.developer.apple.com/published/682d9a16ba4d1dfe8fdcf7fcbab74d24/coding-assistant-run-playground~dark%402x.png)

要了解更多关于 playground 宏的信息，请参见 使用 playground 宏运行代码片段 。有关预览，请参见 [在 Xcode 中预览您的应用界面](https://developer.apple.com/documentation/xcode/previewing-your-apps-interface-in-xcode)。

## 修复您的代码

如果在构建应用时遇到编译警告或错误，Xcode 可能能够为您生成修复。

源代码编辑器用红色下划线突出显示任何问题，并提供问题摘要和图标。单击图标以显示有关该问题的更多信息，然后单击“生成修复”旁边的生成。Xcode 应用模型生成的更改，并在编码助手中显示修复。

![A screenshot that shows the issue navigator on the left with an issue selected and a file open in the source editor with a Fix-it dialog with the syntax error message and a Generate button.](https://docs-assets.developer.apple.com/published/9431d4fa3b96d58d4de76f1183b5da96/coding-assistant-generate-fix-it~dark%402x.png)

## 生成文档

让 Xcode 为您起草 API 文档。在源代码编辑器中选择一个符号，然后点击出现的编码智能图标。在对话框中，点击文档。

![A screenshot of the project navigator on the left, a file open in the source editor with generated DocC style comments above the structure name.](https://docs-assets.developer.apple.com/published/bbcd747b2704304863c019819bdff858/coding-assistant-generate-docs~dark%402x.png){.dark-only}

Xcode 可以在符号上方的源文件中添加 DocC 风格的注释。例如，选择一个类，Xcode 会为该类及其属性和方法添加文档，包括方法参数。

Xcode 在源代码编辑器的底部显示编码智能控制，概述了更改内容。要查看编码助手对话区域的响应，请点击编码助手按钮。要撤销更改，请点击还原按钮。

![A screenshot of the coding assistant dialog that appears in the source editor.](https://docs-assets.developer.apple.com/published/dea7acfa9d715903cacffa5f92bd20ce/coding-assistant-source-editor-dialog~dark%402x.png){.dark-only}

## 浏览之前的对话

您可以随时查看与编码助手的对话。对话是出现在对话区域中的一系列提示和响应。例如，您可以在同一对话中请求模型对您正在处理的功能进行一系列更改。然后为您代码中不同部分的另一个功能创建一个新对话。

- 您可以在对话区域管理您的对话，或使用工具栏中的对话弹出菜单来：
- 通过在提示列表中向上或向下滚动来查看同一对话中的提示和响应。
- 通过点击提示右侧的展开三角形来显示或隐藏回复。
- 通过从菜单中选择对话来跳转到最近或之前的对话。
- 通过从菜单中选择清除所有来删除之前的对话。
- 通过点击工具栏左侧的新建对话按钮开始一个新对话，然后在下面的消息文本框中输入提示。

![A screenshot that shows the coding assistant area with the conversation pop-up menu open and containing multiple conversations and previous conversations to choose from.](https://docs-assets.developer.apple.com/published/5908c069ac59b31ae65ace7086dd423b/coding-assistant-conversation-menu~dark%402x.png){.dark-only}

## 使用对话历史回滚更改

利用 Xcode 维护的对话历史，将更改回滚到项目的已知状态，或查看项目中多个文件的更改。
通过提示回滚对话中的更改，请从对话弹出菜单中选择对话，然后点击历史按钮。Xcode 会显示您提示的时间顺序列表，右侧有一个滑块。将滑块从底部移动到顶部，以按您进行更改的顺序撤销更改。向上移动滑块以移除 Xcode 在右侧显示的更改，向下移动滑块以在下一个提示中恢复更改。

![A screenshot that shows the History view in the sidebar with the slider on the right, and the Cancel and Restore buttons below. The changes for the current state are in the source editor to the right.](https://docs-assets.developer.apple.com/published/f99e7c60ebb097f1e32dd5b20b097d97/coding-assistant-history-view~dark%402x.png){.dark-only}

Xcode 保留了在该状态之后所做的所有编辑，以防您决定稍后恢复任何更改。在回溯到您希望恢复的点后，点击“恢复”按钮以将您的项目文件更新为从此点开始的状态。要保持对话中的所有更改，无论当前滑块位置如何，请点击“取消”。

::: tip 提示
要使用历史记录功能，您的项目必须具有 Git 仓库。要创建本地仓库，请选择集成 > 新建 Git 仓库。Xcode 不会对您的仓库进行更改，但其历史记录依赖于您项目的 Git 历史记录作为参考。
:::

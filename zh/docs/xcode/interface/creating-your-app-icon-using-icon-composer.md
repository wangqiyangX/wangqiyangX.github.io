# 使用 Icon Composer 创建你的应用图标

> 使用 Icon Composer 为不同平台和外观设计你的应用图标风格。

::: tip
macOS 16.0+
Xcode 17.0+
:::

## 概述

你可以使用 Icon Composer 为你的 Liquid Glass 应用图标创建一个单一文件，涵盖你在 iOS、iPadOS、macOS 和 watchOS 上使用的所有图标和小组件样式外观及尺寸。你可以继续使用你喜欢的设计工具来创作应用图标的美术作品，但可以将部分设计决策留到 Icon Composer 中完成，在那里你可以充分利用 Liquid Glass 的动态特性。然后，使用 Icon Composer 来组织和美化 Liquid Glass 的美术作品，并为不同平台和外观自定义你的应用图标变体。

![A screenshot of Icon Composer that shows a group selected in the sidebar, iOS, macOS platform and mono appearance selected in the canvas, and Liquid Glass settings in the Appearance inspector. The canvas shows the icon over a custom background image with 50% blur and translucency Liquid Glass settings.](https://docs-assets.developer.apple.com/published/412080bfa4f678e0dc3a7dc9eb77b6a2/icon-composer-hero-overview~dark%402x.png){.dark-only}

系统从位于您应用程序包中的单个 Icon Composer 文件中渲染您的应用图标，以适应不同的平台、外观和尺寸。对于没有相同图标和小部件样式外观以及液态玻璃材质的先前版本，Xcode 在构建时从 Icon Composer 文件生成应用图标图像。

如果你选择不使用 Icon Composer，你仍然可以在项目中使用包含单独应用图标图片的 AppIcon 资源目录，并让系统应用 Liquid Glass 材质。

如需了解更多信息，请参阅以下资源：

- 关于设计应用图标的指导，请参阅[人机界面指南 > 基础知识 > 应用图标](https://developer.apple.com/design/Human-Interface-Guidelines/app-icons)。
- 关于将旧版应用图标转换为使用 Liquid Glass 材质，请参阅[采用 Liquid Glass > 应用图标](https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass)。
- 关于 Liquid Glass 和 Icon Composer 的更多信息，请观看[应用图标新外观介绍](https://developer.apple.com/videos/play/wwdc2025/9911/)和[使用 Icon Composer 创建图标](https://developer.apple.com/videos/play/wwdc2025/10087/)。
  对于仍然使用 AppIcon 资源目录的 tvOS 和 visionOS 目标，请参阅[使用资源目录配置应用图标](https://developer.apple.com/documentation/xcode/configuring-your-app-icon)。

## 准备好你的美术作品以便导出

要设计你的 Liquid Glass 应用图标，请使用你选择的第三方矢量图形编辑器，将你的图层导出为 SVG 或 PNG 格式的图形文件。为了获得最大的可扩展性，请使用矢量图形绘制形状并导出 SVG 文件。

在你设计应用图标并导出图层之前，请遵循以下指南以获得最佳效果：

- 从 [Apple Design Resources](https://developer.apple.com/design/resources/) 下载一个具有最新网格、形状和画布大小的应用图标模板开始。
- 否则，将画布大小更改为与您在 Icon Composer 中使用的尺寸相匹配，例如 iPhone、iPad 和 Mac 使用 1024 x 1024 像素，Apple Watch 使用 1088 x 1088 像素。
- 将您的应用图标设计为分层，系统会按照 z 轴从后到前进行渲染。
- 将颜色、文本和其他任何图形分离到不同的图层，以便您在 Icon Composer 中针对不同平台和外观进行修改。
- 由于 SVG 格式无法保留字体，请将文本转换为轮廓。
- 为图层赋予有意义的名称，并包含数字（从后到前递增），以便在 Icon Composer 中更好地组织它们。

此外，请等到在 Icon Composer 中应用某些效果，在那里你可以为 Liquid Glass 预览并调整这些效果：

- 移除模糊和阴影，以及高光、不透明度和半透明设置。
- 移除背景颜色和渐变。

当你准备从第三方工具导出图层时，尽可能选择 SVG 格式。对于包含不受支持 SVG 功能的图层，请选择 PNG 或 Icon Composer 支持的其他光栅图像格式。不要导出画布蒙版，因为系统会自动应用蒙版以确保完美裁剪。

## 创建你的 Icon Composer 文件

要在最新版本的 Xcode 中启动 Icon Composer，选择 Xcode > 打开开发者工具 > Icon Composer。如果你没有安装 Xcode，可以从[下载 > 应用程序](https://developer.apple.com/download/applications)下载 Icon Composer。

Icon Composer 会显示一个带有纯色背景的默认应用图标。为该文件命名，建议使用你稍后将在 Xcode 项目中使用的名称，例如 AppIcon。选择文件 > 保存，在弹出的对话框中输入文件名并点击保存。

![A screenshot of Icon Composer with callouts showing the groups and layers for the Landmarks sample app in the sidebar, the iOS, macOS platform and default appearance selected in the canvas, and the settings for a group in the Appearance inspector.](https://docs-assets.developer.apple.com/published/f4ea0512144480d1f93743adc6e90f3a/icon-composer-app-anatomy~dark%402x.png)

你可以使用左侧的侧边栏将图层组织成组，使用中间的画布预览不同的变体，使用右侧的检查器修改外观。在画布区域，你可以使用底部的控件选择平台和外观的组合，使用顶部的控件应用网格或模拟设备条件。

你可以继续使用 Icon Composer 对你的应用图标进行微调，并稍后将其添加到 Xcode 项目中。要将你的应用图标添加到 Xcode 项目并与应用目标关联，请参阅[将你的 Icon Composer 文件添加到 Xcode 项目](https://developer.apple.com/documentation/xcode/creating-your-app-icon-using-icon-composer#Add-your-Icon-Composer-file-to-an-Xcode-project)。

如果你的 Icon Composer 文件在 Xcode 项目中，你可以在项目导航器中选择它，并在画布区域看到预览。要打开 Xcode 项目中的 Icon Composer 文件，请点击预览下方的“使用 Icon Composer 打开”，或在项目导航器中按住 Control 键点击该文件，然后选择“使用外部编辑器打开”。

## 导入你的图形文件

将你的设计工具中导出的艺术作品以 SVG 或 PNG 格式的图形文件导入到你的 Icon Composer 文件中。

从 Finder 中拖动一个或多个图形文件到侧边栏，每个文件都会成为 Icon Composer 创建的默认分组中的一个图层。或者，将包含图形文件的文件夹拖到侧边栏。这样，文件夹会变成分组，文件夹中的文件会成为这些分组中的图层。Icon Composer 会按照文件夹和文件的名称，将分组和图层按字母顺序进行组织。

![A screenshot that shows the group and layer hierarchy after you drop a folder on the sidebar. There are three groups with different numbers of layers. The groups and layers appear alphabetically from bottom to top in the sidebar.](https://docs-assets.developer.apple.com/published/646b3076683d0223068990a07e4d5890/icon-composer-layer-import-groups~dark%402x.png)

使用这些图形文件的应用图标预览会显示在画布区域。如果你在导出文件时使用了与 Icon Composer 相同的画布尺寸，图层中的图形会出现在相同的相对位置。

或者，点击侧边栏下方的添加按钮（+），并在弹出菜单中选择“图像”。在出现的对话框中，选择一个或多个文件（使用 Command 键点击可选择多个文件），然后点击“打开”。

![A screenshot of the Add button pop-up menu at the bottom of the sidebar with the Group menu item selected.](https://docs-assets.developer.apple.com/published/5fd566c448f587d07cafcd2f4afddda5/icon-composer-add-new-layer~dark%402x.png)

之后，如果你想更换与某一图层关联的图形文件，请在侧边栏中选择该图层，然后在外观检查器的“合成”下方的“图像”弹出菜单中选择“替换”。接着，在出现的对话框中选择新的图形文件。

## 将图层组织到组中

导入图形文件后，将默认组中出现的图层组织为最多四个组，以减少复杂性。这些组会成为平台渲染应用图标图像时的图层，从而赋予图标深度。系统会按照它们在侧边栏中的顺序，从下到上在 z 轴平面上渲染这些图层。分组还允许你对多个图层应用通用设置。

![A screenshot of the sidebar with callouts that show the groups and layers in the Landmarks sample app icon.](https://docs-assets.developer.apple.com/published/6242e6286e089df4da8612a6af73cb29/icon-composer-layer-groups~dark%402x.png)

您可以使用侧边栏进行以下编辑：

- 要创建一个分组，请点击侧边栏底部的添加按钮，并从弹出菜单中选择“分组”。
- 要更改组或图层的名称，请双击它并输入名称。
- 要将图层移动到组中，请将它们拖动到你想要的组里。
- 要更改组或图层的顺序，请将它们向上或向下拖动。
- 要添加另一个图层，请点击添加按钮并选择图片。

## 自定义 Icon Composer 界面

在开始预览变体和为应用图标添加效果之前，可以先自定义 Icon Composer 界面，仅显示您的应用所支持的平台。点击右上角的文档按钮，并在文档检查器中选择平台。

![A screenshot of the Document inspector that shows the platform controls where you can select the platforms you support to reduce the complexity of the interface.](https://docs-assets.developer.apple.com/published/1e4fbb419ff498d5c38f7b1e4f54643a/icon-composer-document-target-platforms~dark%402x.png)

例如，如果您的应用仅在 iOS 上运行，请在 iOS、macOS 弹出菜单中选择“仅限 iOS”，并将 watchOS 切换为关闭。Icon Composer 会隐藏 macOS 和 watchOS 的控件，这样您就可以专注于 iOS 应用图标的设计。

## 预览应用图标的变体

Icon Composer 会在不同平台（iOS、macOS 和 watchOS）上为你预览应用图标，并且对于 iOS 和 macOS，还能预览不同的外观（默认、深色和单色）。对于单色，你还可以预览清晰和着色两种变体。对于 watchOS，则没有外观可供预览。
在画布区域的图标图片下方，点击左侧的平台和右侧的外观，即可预览或编辑该变体。例如，要在 iOS 上预览深色外观，选择左侧的 iOS，右侧选择深色。

::: tabs
== default
![A screenshot that shows the Landmarks icon preview when you select the default appearance.](https://docs-assets.developer.apple.com/published/2e7c8b33509261b2f9029f07e4a0a785/icon-composer-mode-preview-default~dark%402x.png)
== dark
![A screenshot that shows the Landmarks icon preview when you select the dark appearance.](https://docs-assets.developer.apple.com/published/e34442b86186f77bf4f80d8bf0ec2fe1/icon-composer-mode-preview-dark~dark%402x.png)
== mono
![A screenshot that shows the Landmarks icon preview when you select the mono appearance.](https://docs-assets.developer.apple.com/published/d5726e42a594f2c19b6de92afce6c497/icon-composer-mode-preview-mono~dark%402x.png)
:::

要预览 clear 和 tinted 变体，点击单色，然后点击选项。在弹出的对话框中，选择浅色或深色，切换着色开关，并使用滑块选择着色颜色。

![A screenshot that shows the Mono options settings with a toggle between light and dark appearance, a toggle for tinted, and color sliders.](https://docs-assets.developer.apple.com/published/3ad5935708125733bf914016de75b2d1/icon-composer-mono-preview-settings~dark%402x.png)

## 模拟设备背景和光照

要在不同的环境中预览你的应用图标，请使用画布区域上方工具栏中的控件。这些控件只会更改你的应用图标出现的模拟设备，不会编辑你的应用图标。

![A screenshot with callouts that shows the background, grid, lighting angle, and icon size controls.](https://docs-assets.developer.apple.com/published/59a85afffec1be5982ff675dfe9dcb58/icon-composer-canvas-preview-settings~dark%402x.png)

你可以使用工具栏控件设置以下内容：

- 要更改背景颜色，请从左侧的颜色选择器中选择一种颜色。
- 要更改背景图片，请从“背景图片”弹出菜单中选择一张背景图片。要使用你自己的图片，请在弹出菜单中点击“添加背景”。
- 要在背景颜色和图片之间切换，请点击背景切换按钮。
- 要添加网格线，请从网格弹出菜单中选择浅色或深色。
- 要切换网格线的显示或隐藏，请点击网格按钮。
- 要从不同的光照方向查看应用图标，请旋转光照角度旋钮。
- 要放大或缩小，请从大小弹出菜单中选择一个百分比。

您可以使用这些控件，通过自定义背景在透明和着色模式下查看透明效果。例如，要在示例图片上预览清晰的深色变体，请选择 iOS 或 macOS 作为平台，并将外观设置为 Mono。在 Mono 选项对话框中，关闭“着色”选项。然后，在画布顶部的“背景图片”弹出菜单中选择“添加背景”，并在弹出的对话框中选择截图。

![A screenshot of the canvas that shows the mono appearance over a blue background image.](https://docs-assets.developer.apple.com/published/a5f83c79536464706abf0f8a7de4d5d9/icon-composer-background-preview-mode-clear-dark~dark%402x.png){height=100px}

## 对背景、组和图层应用效果

在不同平台和设备设置上预览应用图标的不同变体时，可以使用“外观检查器”应用效果并修复你发现的任何问题。探索组和组内图层的不同设置。

通常，“颜色”下的设置适用于为深色和单色外观创建变体。对于组和图层，你可以在“液态玻璃”下自定义动态材质。然后，使用“合成”下的控件在不同平台上调整你的设计。

![A screenshot of the Appearance inspector with callouts that show the Color, Liquid Glass, and Composition areas of the settings.](https://docs-assets.developer.apple.com/published/5842b1e71d840b2cbb74f68fbdbdc496/icon-composer-applying-effects-inspector~dark%402x.png)

例如，在“颜色”下，可以按照以下步骤为应用图标的背景应用渐变：

- 在侧边栏中，点击图标文件名。
- 在画布中，选择一个平台，并可选择外观。
- 要显示设置，请点击窗口右上角的“外观检查器”。
- 在“颜色”弹出菜单中，选择“全部”以更改所有变体。
- 在“填充”弹出菜单中，选择“渐变”。
- 从下方出现的两个颜色选择框中，选择“起始色”和“结束色”。

![A screenshot of the Color settings for the app icon that shows Fill set to Gradient with Auto as the “From” color and blue as the “To” color.](https://docs-assets.developer.apple.com/published/d6ab39a158493a86191c7b6151cbe9a6/icon-composer-color-app-icon-base~dark%402x.png)

同样，你也可以将图层的填充从 Icon Composer 根据图形文件获取的默认值（自动）更改为其他选项。在侧边栏中选择该图层，然后在外观检查器的填充弹出菜单中，选择无、纯色或渐变。

![A screenshot of the Color settings for a layer that shows Fill set to Gradient with yellow as the “From” color and orange as the “To” color.](https://docs-assets.developer.apple.com/published/f8b2e9db7ea98d663f0f28c55e7ca98d/icon-composer-color-app-icon-layer~dark%402x.png)

::: tip 提示
要为颜色设置 RGB 值或十六进制（hex）颜色编号，请在颜色选择器的颜色滑块检查器中使用 RGB 滑块。
:::

你还可以通过“颜色”下的“不透明度”设置，使某个组或图层变为透明，从而显示其背后的细节。使用“合成”下的“可见性”切换按钮来隐藏或显示图层和组。或者，在侧边栏中点击组或图层旁边的眼睛图标。

要移除你在外观检查器中所做的任何更改，请选择“编辑”>“撤销”。

## 对组和图层应用 Liquid Glass 效果

当你导入图形文件时，Icon Composer 会自动为图层添加 Liquid Glass 材质，并在你创建组时为其应用其他默认的 Liquid Glass 设置。
对于组，你可以自定义所有 Liquid Glass 材质选项。在侧边栏中选择一个组，然后在检查器的模式弹出菜单中选择“Individual”或“Combined”。“Individual”会将效果分别应用于组中的每个图层。“Combined”会将效果作为一个对象应用于组中的所有图层。

::: tabs
== Individual
![A screenshot of the preview that shows Liquid Glass applied to individual layers in a group.](https://docs-assets.developer.apple.com/published/b720f1c3f4bd601f50a09ee79098b324/icon-composer-liquid-glass-on-individual%402x.png)
== Combined
![A screenshot that shows the Mode set to Individual.](https://docs-assets.developer.apple.com/published/daa44c88949c0eb4c1bcfdd4c21989b2/icon-composer-liquid-glass-on-combined%402x.png)
:::

镜面材质默认是开启的。如果你关闭镜面效果，背景的轻微模糊和边缘的高光会消失。下图显示了一个包含太阳和山脉的分组，并且镜面效果已关闭。

::: tabs
== Specular on
![A screenshot of the preview that shows Liquid Glass applied to individual layers in a group.](https://docs-assets.developer.apple.com/published/b720f1c3f4bd601f50a09ee79098b324/icon-composer-liquid-glass-on-individual%402x.png)
== Specular off
![A screenshot that shows the Mode set to Individual.](https://docs-assets.developer.apple.com/published/c2eb38fec7bc3a5e8060d3ac7e42be56/icon-composer-specular-off%402x.png)
:::

在镜面效果下方，你可以对该分组应用其余的液态玻璃设置（模糊、半透明和阴影）。
要为单独的图层关闭液态玻璃效果，请在侧边栏中选择该图层，然后在检查器中关闭液态玻璃下的效果开关。

::: tabs
== Effects on
![A screenshot of a preview with Liquid Glass effects on for all layers.](https://docs-assets.developer.apple.com/published/b720f1c3f4bd601f50a09ee79098b324/icon-composer-liquid-glass-layer-on%402x.png)
== Effects off
![A screenshot of the Liquid Glass settings for a layer with Effects toggled on.](https://docs-assets.developer.apple.com/published/992befb950ec194a5c151f9aa4f1d253/icon-composer-liquid-glass-layer-off%402x.png)
:::

## 更改图形的位置和缩放

您可以使用 Icon Composer 重新定位和缩放图层中的图形。

首先，打开网格，这样你就能看到应该将图形放置在哪里。在工具栏中，点击“网格”按钮，或在“网格”弹出菜单中选择“浅色”或“深色”。Icon Composer 会在你的应用图标预览上以你选择的颜色叠加网格线。要移除网格线，只需关闭“网格”即可。

![A screenshot that shows Dark selected from the Grid pop-up menu at the top of the canvas.](https://docs-assets.developer.apple.com/published/3ab0e9f2010cd2847f784ad3fab76011/icon-composer-grid-toggle~dark%402x.png)

要重新定位某一图层中的图形，请在侧边栏中选择一个组或图层，然后在画布区域内拖动图形。如果你选择的是一个组，则会拖动该组中的所有图层。

::: tabs
== Layer
![icon-composer-individual-layer-move](https://docs-assets.developer.apple.com/published/98599dd3569c207fb7e5c9cfea5600d5/icon-composer-individual-layer-move.mp4)
== Group
![icon-composer-layer-group-move](https://docs-assets.developer.apple.com/published/3b5345297537fbebe899aeca51d4f3a0/icon-composer-layer-group-move.mp4)
:::

要进行更精确的编辑，请选择一个组或图层，在外观检查器的“组合”下，在布局部分输入 x、y 和缩放比例。

![A screenshot that shows the Layout section under Composition with the x, y, and scale settings.](https://docs-assets.developer.apple.com/published/299cf1d2fff6d684d8fb42f72127788e/icon-composer-composition-edit-selection~dark%402x.png)

## 自定义应用图标的变体

你可以使用外观检查器自定义应用图标在特定平台和外观下的变体。

要查看你自定义的设置，请在侧边栏中选择图标、组或图层，并在外观检查器的颜色、液态玻璃或组合弹出菜单中选择“全部”。自定义设置会显示在主设置下方。例如，如果你更改了 iOS 中深色和单色外观的混合模式设置，那么在混合模式设置下方会出现“深色”和“单色”设置。主设置适用于你未自定义的变体。

![A screenshot that shows custom settings for dark and mono appearances when you choose All from the Color pop-up menu.](https://docs-assets.developer.apple.com/published/a0bb77d8b112ed36924a24e652bc67a5/icon-composer-inspector-color-varied-by-mode~dark%402x.png)

外观检查器会根据你在画布中选择的平台或外观启用相应的控件。例如，要启用混合模式下方显示的“深色”设置，请在画布中选择深色外观。

要添加另一个自定义设置，请在画布中选择你想要变化的平台或外观，然后在“外观”检查器中，点击设置旁边的图标。从“添加”按钮的弹出菜单中选择“针对[外观 | 平台]变化”。例如，在画布中选择 iOS / macOS 和默认，然后在 Liquid Glass 下的 Blur 弹出菜单中选择“针对 iOS / macOS 变化”。

![A screenshot that shows the Vary for pop-up menu under the Blur setting when you choose All from the Liquid Glass pop-up menu.](https://docs-assets.developer.apple.com/published/89845201a1e8eb669cfd0f3289c70841/icon-composer-edit-all-exception~dark%402x.png)

要移除自定义设置，请点击平台或外观旁边的 X。例如，要移除 Blend Mode 设置下的 Dark 设置，请点击 Dark 旁边的 X。

或者，也可以在 Color 或 Liquid Glass 弹出菜单中选择你在画布中选中的外观。这样，该部分的控件只适用于该外观。同样地，在 Composition 弹出菜单中选择你在画布中选中的平台，该部分的控件只适用于该平台。控件以这种方式运作，是为了确保你的应用图标外观保持一致，只有几何形状会在不同平台间变化。

![A screenshot that shows Dark selected from the Color pop-up menu when you select the dark appearance in the canvas.](https://docs-assets.developer.apple.com/published/40237d529652a2c70af0fef73cbec9b0/icon-composer-color-edit-selection~dark%402x.png)

然后，您可以通过在颜色、液态玻璃和构图弹出菜单中选择“全部”，切换回在一个位置查看您为各个平台和外观所做的所有自定义设置。

## 将你的 Icon Composer 文件添加到 Xcode 项目

如果你在 Xcode 之外创建了 Icon Composer 文件，可以随时将其添加到 Xcode 项目中，以便在模拟器和真实设备上查看你的图标。

只需将 Icon Composer 文件从 Finder 拖到项目导航器中，Xcode 会提示你将其放置到目标文件夹的位置。或者，也可以点击项目导航器底部的添加按钮，选择“添加文件”，然后在弹出的对话框中选择你的 Icon Composer 文件。

在项目编辑器中，选择目标并切换到“常规”标签。在“应用图标与启动画面”下，确保“应用图标”文本字段中的名称与 Icon Composer 文件的名称（不包含扩展名）一致。你可以在项目中拥有多个 Icon Composer 文件，但只有一个文件的名称需要与“应用图标”文本字段中的名称相匹配。
注意

::: tip 注意
最新版本的 Xcode 使用 Icon Composer 文件，而不是你项目中现有的 AppIcon 资源目录。
:::

## 在模拟器和真实设备上测试你的应用图标

在 Xcode 中，从运行目标菜单中选择一个模拟器或真实设备，然后点击运行按钮。请确认你的应用图标在不同平台和外观下均能正确显示。使用模拟器或真实设备中的外观系统设置来测试不同的外观效果。

有关在 Xcode 中运行应用的更多信息，请参阅[在模拟器或设备上运行你的应用](https://developer.apple.com/documentation/xcode/running-your-app-in-simulator-or-on-a-device)。

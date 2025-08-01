import { defineAdditionalConfig, type DefaultTheme } from "vitepress";

export default defineAdditionalConfig({
  lang: "zh-Hans",
  title: "编程手札",
  description: "",

  themeConfig: {
    nav: nav(),

    search: { options: searchOptions() },

    sidebar: {
      "/docs/swift/": {
        base: "/docs/swift/",
        items: sidebarSwift(),
      },
      "/docs/swiftui": {
        base: "/docs/swiftui/",
        items: sidebarSwiftUI(),
      },
      "/docs/swiftdata": {
        base: "/docs/swiftdata",
        items: sidebarSwiftDate(),
      },
      "/docs/foundation": {
        base: "/docs/foundation",
        items: sidebarFoundation(),
      },
      "/docs/usernotifications": {
        base: "/docs/usernotifications",
        items: sidebaruserNotifications(),
      },
      "/docs/xcode": {
        base: "/docs/xcode",
        items: sidebarXcode(),
      },
      "/posts/": {
        base: "/posts/",
        items: sidebarPosts(),
      },
      "/projects/examples/": {
        base: "/projects/examples/",
        items: sidebarExamples(),
      },
      "/projects/open-source/": {
        base: "/projects/open-source/",
        items: sidebarOpenSource(),
      },
      "/books": {
        base: "/books/ddia/",
        items: sidebarDDIA(),
      },
    },

    editLink: {
      pattern:
        "https://github.com/wangqiyangx/wangqiyangx.github.io/edit/main/:path",
      text: "在 GitHub 上编辑此页面",
    },

    footer: {
      message: "基于 MIT 许可发布",
      copyright: `版权所有 © 2025-${new Date().getFullYear()} @wangqiyangx`,
    },

    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    outline: {
      level: "deep",
      label: "页面导航",
    },

    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        forceLocale: true,
        dateStyle: "full",
        timeStyle: "medium",
      },
    },

    notFound: {
      title: "页面未找到",
      quote:
        "但如果您不改变方向，并且继续寻找，您可能最终会到达您所前往的地方。",
      linkLabel: "前往首页",
      linkText: "带我回首页",
    },

    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    skipToContentLabel: "跳转到内容",
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [
    {
      text: "博客",
      link: "/posts/",
      activeMatch: "/posts",
    },
    {
      text: "项目",
      activeMatch: "/projects",
      items: [
        {
          text: "代码示例",
          link: "/projects/examples",
        },
        {
          text: "开源项目",
          link: "/projects/open-source",
        },
        {
          text: "上架项目",
          link: "/store/news",
        },
      ],
    },
    {
      text: "文档",
      activeMatch: "/docs",
      items: [
        {
          text: "Swift",
          link: "/docs/swift/preface/about-swift",
        },
        {
          text: "SwiftUI",
          link: "/docs/swiftui/",
        },
        {
          text: "Swift Data",
          link: "/docs/swiftdata/",
        },
        {
          text: "Foundation",
          link: "/docs/foundation/",
        },
        {
          text: "User Notifications",
          link: "/docs/usernotifications/",
        },
        {
          text: "WidgetKit",
          link: "/docs/widgetkit/",
        },
        {
          text: "Xcode",
          link: "/docs/xcode/",
        },
      ],
    },
    {
      text: "书籍",
      activeMatch: "/books",
      items: [
        {
          text: "设计数据密集型应用程序",
          link: "/books/ddia",
        },
      ],
    },
  ];
}

function sidebarSwift(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "开始",
      collapsed: false,
      base: "/docs/swift/preface/",
      items: [
        {
          text: "关于 Swift",
          link: "about-swift",
        },
        {
          text: "版本兼容性",
          link: "version-compatibility",
        },
        {
          text: "Swift 入门之旅",
          link: "a-swift-tour",
        },
      ],
    },
    {
      text: "指南",
      collapsed: true,
      base: "/docs/swift/guide/",
      items: [
        {
          text: "基础语法",
          link: "the-basics",
        },
        {
          text: "基本运算符",
          link: "basic-operators",
        },
        {
          text: "字符串和字符",
          link: "strings-and-characters",
        },
        {
          text: "集合类型",
          link: "collection-types",
        },
        {
          text: "控制流",
          link: "control-flow",
        },
        {
          text: "函数",
          link: "functions",
        },
        {
          text: "闭包",
          link: "closures",
        },
        {
          text: "枚举",
          link: "enumerations",
        },
        {
          text: "结构体和类",
          link: "structures-and-classes",
        },
        {
          text: "属性",
          link: "properties",
        },
        {
          text: "方法",
          link: "methods",
        },
        {
          text: "下标",
          link: "subscripts",
        },
        {
          text: "继承",
          link: "inheritance",
        },
        {
          text: "初始化",
          link: "initialization",
        },
        {
          text: "反初始化",
          link: "deinitialization",
        },
        {
          text: "可选链",
          link: "optional-chaining",
        },
        {
          text: "错误处理",
          link: "error-handling",
        },
        {
          text: "并发",
          link: "concurrency",
        },
        {
          text: "宏",
          link: "macros",
        },
        {
          text: "类型转换",
          link: "type-casting",
        },
        {
          text: "嵌套类型",
          link: "nested-types",
        },
        {
          text: "扩展",
          link: "extensions",
        },
        {
          text: "协议",
          link: "protocols",
        },
        {
          text: "泛型",
          link: "generics",
        },
        {
          text: "不透明和装箱协议类型",
          link: "opaque-and-boxed-protocol-types",
        },
        {
          text: "自动引用计数",
          link: "automatic-reference-counting",
        },
        {
          text: "内存安全",
          link: "memory-safety",
        },
        {
          text: "访问控制",
          link: "access-control",
        },
        {
          text: "高级运算符",
          link: "advanced-operators",
        },
      ],
    },
    {
      text: "参考",
      collapsed: true,
      base: "/docs/swift/reference/",
      items: [
        {
          text: "关于语言参考",
          link: "about-the-language-reference",
        },
        {
          text: "词法结构",
          link: "lexical-structure",
        },
        {
          text: "类型",
          link: "types",
        },
        {
          text: "表达式",
          link: "expressions",
        },
        {
          text: "语句",
          link: "statements",
        },
        {
          text: "声明",
          link: "declarations",
        },
      ],
    },
  ];
}

function sidebarSwiftUI(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "视图",
      base: "/docs/swiftui/views/",
      items: [
        {
          text: "控件和指示器",
          collapsed: true,
          base: "/docs/swiftui/views/controls-and-indicators/",
          link: "/",
          items: [
            {
              text: "提供触觉反馈",
              collapsed: true,
              items: [
                {
                  text: "sensoryFeedback(_:trigger:)",
                  link: "sensoryfeedback(_:trigger:)",
                },
                {
                  text: "sensoryFeedback(trigger:_:)",
                  link: "sensoryfeedback(trigger:_:)",
                },
                {
                  text: "SensoryFeedback",
                  link: "sensoryfeedback",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      text: "视图布局",
      base: "/docs/swiftui/view-layout/",
      items: [
        {
          text: "视图分组",
          collapsed: true,
          base: "/docs/swiftui/view-layout/view-groupings/",
          link: "/",
          items: [],
        },
        {
          text: "滚动视图",
          collapsed: true,
          base: "/docs/swiftui/view-layout/scroll-views/",
          link: "/",
          items: [
            {
              text: "创建滚动视图",
              collapsed: true,
              items: [
                {
                  text: "ScrollView",
                  link: "scrollview",
                },
                {
                  text: "ScrollViewReader",
                  link: "scrollviewreader",
                },
                {
                  text: "ScrollViewProxy",
                  link: "scrollviewproxy",
                },
              ],
            },
            {
              text: "管理滚动位置",
              collapsed: true,
              items: [
                {
                  text: "scrollPosition(_:anchor:)",
                  link: "scrollPosition(_:anchor:)",
                },
                {
                  text: "scrollPosition(id:anchor:)",
                  link: "scrollPosition(id:anchor:)",
                },
                {
                  text: "defaultScrollAnchor(_:)",
                  link: "defaultScrollAnchor(_:)",
                },
                {
                  text: "defaultScrollAnchor(_:for:)",
                  link: "defaultScrollAnchor(_:for:)",
                },
                {
                  text: "ScrollPosition",
                  link: "scrollposition",
                },
              ],
            },
            {
              text: "定义滚动目标",
              collapsed: true,
              items: [
                {
                  text: "scrollTargetBehavior(_:)",
                  link: "scrollTargetBehavior(_:)",
                },
                {
                  text: "scrollTargetLayout(isEnabled:)",
                  link: "scrollTargetLayout(isEnabled:)",
                },
                {
                  text: "ScrollTarget",
                  link: "scrolltarget",
                },
                {
                  text: "ScrollTargetBehavior",
                  link: "scrolltargetbehavior",
                },
                {
                  text: "ScrollTargetBehaviorContext",
                  link: "scrolltargetbehaviorcontext",
                },
                {
                  text: "PagingScrollTargetBehavior",
                  link: "pagingscrolltargetbehavior",
                },
                {
                  text: "ViewAlignedScrollTargetBehavior",
                  link: "viewalignedscrolltargetbehavior",
                },
                {
                  text: "AnyScrollTargetBehavior",
                  link: "anyscrolltargetbehavior",
                },
                {
                  text: "ScrollTargetBehaviorProperties",
                  link: "scrolltargetbehaviorproperties",
                },
                {
                  text: "ScrollTargetBehaviorPropertiesContext",
                  link: "scrolltargetbehaviorpropertiescontext",
                },
              ],
            },
          ],
        },
      ],
    },
    {
      text: "事件处理",
      collapsed: true,
      base: "/docs/swiftui/event-handling/",
      items: [
        {
          text: "手势",
          base: "/docs/swiftui/event-handling/gestures/",
          link: "/",
          items: [
            {
              text: "重点",
              collapsed: false,
              items: [
                {
                  text: "通过手势添加交互性",
                  link: "adding-interactivity-with-gestures",
                },
              ],
            },
            {
              text: "识别点击手势",
              collapsed: false,
              items: [
                {
                  text: "onTapGesture(count:perform:)",
                  link: "ontapgesture(count:perform:)",
                },
                {
                  text: "onTapGesture(count:coordinateSpace:perform:)",
                  link: "ontapgesture(count:coordinatespace:perform:)",
                },
                {
                  text: "TapGesture",
                  link: "tapgesture",
                },
                {
                  text: "SpatialTapGesture",
                  link: "spatialtapgesture",
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

function sidebarSwiftDate(): DefaultTheme.SidebarItem[] {
  return [];
}

function sidebarFoundation(): DefaultTheme.SidebarItem[] {
  return [];
}

function sidebaruserNotifications(): DefaultTheme.SidebarItem[] {
  return [];
}

function sidebarXcode(): DefaultTheme.SidebarItem[] {
  return [];
}

function sidebarPosts(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "教程",
      collapsed: true,
      base: "/posts/tutorials/",
      items: [
        {
          text: "Button 教程",
          link: "the-ultimate-swiftui-button-tutorial",
        },
      ],
    },
    {
      text: "RSS 订阅",
      base: "/",
      link: "/feed.rss",
    },
  ];
}

function sidebarExamples(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "代码示例",
      collapsed: false,
      base: "/projects/examples",
      items: [
        { text: "范围选择器", link: "/the-dual-slider" },
        {
          text: "贝塞尔曲线控制器",
          link: "/the-bezier-curve-picker",
        },
      ],
    },
  ];
}

function sidebarOpenSource(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "开源项目",
      collapsed: false,
      base: "/projects/open-source",
      items: [
        {
          text: "SFSymbolPicker",
          link: "/sfsymbolpicker",
        },
      ],
    },
  ];
}

function sidebarDDIA(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: "数据系统架构中的权衡",
      link: "/tradeoffs-in-data-systems-architecture",
    },
    {
      text: "定义非功能性需求",
      link: "/defining-nonfunctional-requirements",
    },
  ];
}

function searchOptions(): Partial<DefaultTheme.LocalSearchOptions> {
  return {
    translations: {
      button: {
        buttonText: "搜索",
        buttonAriaLabel: "搜索",
      },
      modal: {
        displayDetails: "显示细节",
        resetButtonTitle: "重置搜索",
        backButtonTitle: "返回",
        noResultsText: "无搜索结果",
        footer: {
          selectText: "跳转",
          selectKeyAriaLabel: "跳转",
          navigateText: "选择",
          navigateUpKeyAriaLabel: "选择上一项",
          navigateDownKeyAriaLabel: "选择下一项",
          closeText: "关闭",
          closeKeyAriaLabel: "关闭",
        },
      },
    },
  };
}

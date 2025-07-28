# 如何使用 SwiftUI 解析 HTML 文件

> 在写 RSS 阅读器项目时，RSS 返回的每篇文章的内容为 HTML 片段，因此需要对其进行渲染，使用 WebView 渲染看起来不是很舒服，因此决定基于 SwiftUI 写一个简单的视图用于渲染 HTML 片段。

## 省流

### 效果

### 代码

```swift
import SwiftSoup
import SwiftUI

struct HTMLView: View {
    let html: String

    private let blockTags: Set<String> = [
        "div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li",
        "table", "tr", "td", "th", "tbody", "thead",
        "blockquote", "figure", "table", "img", "header", "footer", "main",
        "nav", "section", "article", "aside", "form", "fieldset", "pre", "hr",
    ]

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 8) {
                if let rootNode = try? SwiftSoup.parseBodyFragment(html).body()
                {
                    renderBlockChildren(of: rootNode)
                } else {
                    Text("Failed to parse HTML")
                        .foregroundColor(.red)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
        }
    }

    @ViewBuilder
    private func renderBlockChildren(of node: Node) -> some View {
        ForEach(node.getChildNodes().enumerated(), id: \.offset) {
            _,
            child in
            renderNode(node: child)
        }
    }

    private func renderNode(node: Node) -> some View {
        if let element = node as? Element {
            let tag = element.tagName().lowercased()
            if blockTags.contains(tag) {
                switch tag {
                case "ul", "ol":
                    return AnyView(
                        VStack(alignment: .leading, spacing: 4) {
                            ForEach(
                                Array(element.childrenArray().enumerated()),
                                id: \.0
                            ) { idx, child in
                                HStack(alignment: .top) {
                                    if tag == "ul" {
                                        Text("•")
                                    } else {
                                        Text("\(idx + 1).")
                                    }
                                    renderNode(node: child)
                                }
                            }
                        }
                        .padding(.vertical, 2)
                    )
                case "li", "p":
                    return AnyView(
                        Text(makeInlineAttributedString(from: element))
                            .font(.body)
                            .padding(.vertical, 2)
                    )
                case "h1":
                    return AnyView(
                        Text(makeInlineAttributedString(from: element))
                            .font(.largeTitle)
                            .bold()
                            .foregroundColor(.primary)
                            .padding(.vertical, 2)
                    )
                case "h2":
                    return AnyView(
                        Text(makeInlineAttributedString(from: element))
                            .font(.title)
                            .bold()
                            .foregroundColor(.blue)
                            .padding(.vertical, 2)
                    )
                case "img":
                    if let src = try? element.attr("src"),
                        let url = URL(string: src)
                    {
                        return AnyView(
                            AsyncImage(url: url) { image in
                                image.resizable().scaledToFit()
                            } placeholder: {
                                ProgressView()
                            }
                            .frame(maxWidth: .infinity)
                            .clipShape(.rect(cornerRadius: 12))
                        )
                    }
                case "table":
                    return AnyView(
                        VStack(alignment: .leading, spacing: 0) {
                            renderBlockChildren(of: element)
                        }
                        .frame(maxWidth: .infinity, alignment: .center)
                    )
                case "thead", "tbody":
                    return AnyView(
                        VStack(alignment: .leading, spacing: 0) {
                            renderBlockChildren(of: element)
                        }
                    )
                case "tr":
                    return AnyView(
                        HStack(alignment: .top, spacing: 0) {
                            ForEach(
                                Array(element.childrenArray().enumerated()),
                                id: \.0
                            ) { _, child in
                                renderNode(node: child)
                            }
                        }
                    )
                case "th":
                    return AnyView(
                        Text(makeInlineAttributedString(from: element))
                            .font(.headline)
                            .padding(6)
                            .frame(minWidth: 60)
                            .background(Color.gray.opacity(0.15))
                            .border(Color.gray.opacity(0.3), width: 1)
                    )
                case "td":
                    return AnyView(
                        Text(makeInlineAttributedString(from: element))
                            .font(.body)
                            .padding(6)
                            .frame(minWidth: 60)
                            .border(Color.gray.opacity(0.2), width: 1)
                    )
                default:
                    return AnyView(
                        renderBlockChildren(of: element)
                            .padding(.vertical, 2)
                    )
                }
            } else {
                return AnyView(
                    Text(makeInlineAttributedString(from: element))
                        .font(.body)
                )
            }
        }
        return AnyView(EmptyView())
    }

    // 递归拼接行内标签为 AttributedString
    private func makeInlineAttributedString(from element: Element)
        -> AttributedString
    {
        element.getChildNodes().reduce(into: AttributedString()) {
            attributed,
            node in
            if let textNode = node as? TextNode {
                let text = textNode.text()
                attributed.append(AttributedString(text))
            } else if let childElement = node as? Element {
                let tag = childElement.tagName().lowercased()
                var childAttr = makeInlineAttributedString(from: childElement)
                switch tag {
                case "strong", "b":
                    childAttr = AttributedString(
                        childAttr.characters,
                        attributes: .init([
                            .font: UIFont.boldSystemFont(
                                ofSize: UIFont.systemFontSize
                            )
                        ])
                    )
                case "em", "i":
                    childAttr = AttributedString(
                        childAttr.characters,
                        attributes: .init([
                            .font: UIFont.italicSystemFont(
                                ofSize: UIFont.systemFontSize
                            )
                        ])
                    )
                case "u":
                    childAttr.underlineStyle = .single
                case "a":
                    if let href = try? childElement.attr("href"),
                        let url = URL(string: href)
                    {
                        childAttr = AttributedString(
                            childAttr.characters,
                            attributes: .init([
                                .font: UIFont.systemFontSize,
                                .link: url,
                                .foregroundColor: Color.blue,
                                .underlineStyle: NSUnderlineStyle.single,
                            ])
                        )
                    }
                default:
                    break
                }
                attributed.append(childAttr)
            }
        }
    }
}

extension Element {
    fileprivate func childrenArray() -> [Element] {
        self.children().array()
    }
}

#Preview {
    HTMLView(
        html: """
                <header>
                    <h1>HTML 基本结构</h1>
                    <nav>
                        <a href="#section1">段落</a>
                        <a href="#section2">列表</a>
                        <a href="#section3">表格</a>
                    </nav>
                </header>

                <main>
                    <section id="section1">
                        <h2>段落和文本格式</h2>
                        <p>这是一个普通段落。</p>
                        <p><strong>加粗文本</strong> 和 <em>斜体文本</em></p>
                        <p>链接示例：<a href="https://example.com">访问 Example.com</a></p>
                    </section>

                    <section id="section2">
                        <h2>列表</h2>
                        <h3>无序列表</h3>
                        <ul>
                            <li>苹果</li>
                            <li>香蕉</li>
                            <li>橙子</li>
                        </ul>
                        <h3>有序列表</h3>
                        <ol>
                            <li>第一步</li>
                            <li>第二步</li>
                            <li>第三步</li>
                        </ol>
                    </section>

                    <section id="section3">
                        <h2>表格</h2>
                        <table>
                            <thead>
                                <tr>
                                    <th>姓名</th>
                                    <th>年龄</th>
                                    <th>城市</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>张三</td>
                                    <td>25</td>
                                    <td>北京</td>
                                </tr>
                                <tr>
                                    <td>李四</td>
                                    <td>30</td>
                                    <td>上海</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>
                </main>

                <footer>
                    <p>&copy; 2025 HTML 示例页面</p>
                </footer>
            """
    )
}
```

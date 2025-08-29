---
title: 使用 UITableView 创建列表
date: 2025-08-29
author: 王启阳
twitter: '@wangqiyangx'
comments: true
---

在 iOS 开发中，列表展示是最常见的界面需求，而 UITableView 是 UIKit 中实现列表的核心控件。本文将从基础概念、核心 API 到高级用法，带你全面了解如何使用 UITableView 创建高效、灵活的列表。
<!-- end -->

## UITableView 基本概念

UITableView 是一个专门用于显示单列多行数据的视图控件，它继承自 UIScrollView，天然支持滚动。

其核心特点包括：

- 高性能：通过 cell 重用机制 (dequeueReusableCell) 避免重复创建大量视图。
- 灵活布局：支持多种 cell 样式、自定义布局以及行高自适应。
- 分组显示：支持普通列表和分组列表，带 header/footer。
- 丰富交互：支持选择、编辑（删除/插入）、拖拽重排等操作。

## UITablViewController

## UITableView

## UITableViewCell

列表的每一行，可自定义显示内容。

### Cell 重用机制

UITableView 的高性能关键在于 cell 重用。当 cell 滚出屏幕时，它会被缓存并重用，避免重复创建视图。

```swift
let cell = tableView.dequeueReusableCell(withIdentifier: "MyCell", for: indexPath)
```

### 注册 cell 类型

```swift
tableView.register(UITableViewCell.self, forCellReuseIdentifier: "MyCell")
```

### 自定义 cell

```swift
class MyCustomCell: UITableViewCell { ... }
tableView.register(MyCustomCell.self, forCellReuseIdentifier: "MyCell")
```

## UITableViewDataSource

协议 UITableViewDataSource 对 Table 所管理的数据源进行了抽象，通过重写协议中的指定方法，你可以对列表作所需的定制。

其中有两个方法是必需重写的：分别为：

- `tableView(_:numberOfRowsInSection:)`
- `tableView(_:cellForRowAt:)`

下面对这两个方法做一些介绍。

### 指定 Section 的行数

重写 `tableView(_:numberOfRowsInSection:)` 可以设置指定 Section 的行数。

```swift
override func tableView(
    _ tableView: UITableView,
    numberOfRowsInSection section: Int
) -> Int {
    return tableData[section].cells.count
}
```

### 定义 Cell 实现的逻辑

重写 `tableView(_:cellForRowAt:)` 方法，在其内部定义构造一个 cell 的逻辑，并将其返回。

```swift
override func tableView(
    _ tableView: UITableView,
    cellForRowAt indexPath: IndexPath
) -> UITableViewCell {
    let cell = tableView.dequeueReusableCell(
        withIdentifier: "Cell",
        for: indexPath
    )
    let cellItem = tableData[indexPath.section].cells[indexPath.row]
    cell.textLabel?.text = cellItem.title
    cell.detailTextLabel?.text = cellItem.detail
    
    return cell
}
```

### 定义 Section 的标题和脚注

重写 `tableView(_:titleForHeaderInSection:)`，指定获取 Section 标题的逻辑。

```swift
override func tableView(
    _ tableView: UITableView,
    titleForHeaderInSection section: Int
) -> String? {
    return tableData[section].header
}
```

重写 `tableView(_:titleForFooterInSection:)`，指定获取 Section 脚注的逻辑。

```swift
override func tableView(
    _ tableView: UITableView,
    titleForFooterInSection section: Int
) -> String? {
    return tableData[section].footer
}
```

### 定义如何插入或删除行

要实现编辑列表行的逻辑，首先需要指定数据是否可以编辑，通过重写方法 `tableView(_:canEditRowAt:)` 来指定数据可编辑的逻辑。

```swift
override func tableView(
    _ tableView: UITableView,
    canEditRowAt indexPath: IndexPath
) -> Bool {
    // 简单返回 true，则所有列表行都可以编辑
    return true
}
```

### 定义如何重新排序指定行

### 定义列表侧边栏 Section 标题索引

## UITableViewDelegate（可选）

- tableView(_:didSelectRowAt:)：点击事件处理。
- tableView(_:heightForRowAt:)：行高设置。
- tableView(_:willDisplay:forRowAt:)：cell 即将显示。
- 还支持编辑、拖拽、上下文菜单等功能。

## 指定列表样式

创建表格时，可以指定样式：

```swift
let tableView = UITableView(frame: .zero, style: .plain)       // 普通列表
let tableView = UITableView(frame: .zero, style: .grouped)     // 分组列表
```

- `.plain`：section header 会浮动。
- `.grouped`：section 独立显示，不浮动。
- `.insetGrouped`（iOS 13+）：分组列表带内边距效果。

## UITableView 使用示例

下面是一个简单的列表示例：

```swift
class MyTableViewController: UITableViewController {
    let fruits = ["Apple", "Banana", "Orange"]

    override func viewDidLoad() {
        super.viewDidLoad()
        tableView.register(UITableViewCell.self, forCellReuseIdentifier: "Cell")
    }

    override func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return fruits.count
    }

    override func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath)
        cell.textLabel?.text = fruits[indexPath.row]
        return cell
    }

    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        print("Selected: \(fruits[indexPath.row])")
    }
}
```

## 高级功能

### 自适应行高

```swift
tableView.rowHeight = UITableView.automaticDimension
tableView.estimatedRowHeight = 44
```

### 编辑模式（删除/插入）

```swift
override func tableView(_ tableView: UITableView,
                        commit editingStyle: UITableViewCell.EditingStyle,
                        forRowAt indexPath: IndexPath) {
    if editingStyle == .delete {
        fruits.remove(at: indexPath.row)
        tableView.deleteRows(at: [indexPath], with: .automatic)
    }
}
```

### 拖拽重排

```swift
tableView.isEditing = true
```

实现 delegate 的移动方法即可支持拖拽重排。

### 自定义 Section Header/Footer

```swift
override func tableView(_ tableView: UITableView, viewForHeaderInSection section: Int) -> UIView? {
    let label = UILabel()
    label.text = "Section \(section)"
    label.backgroundColor = .lightGray
    return label
}
```

## 性能优化建议

- 尽量复用 cell，避免每次创建。
- 避免在 cellForRowAt 做复杂布局，使用自定义 cell 或懒加载。
- 开启预估行高 (estimatedRowHeight) 提升滚动性能。
- 大数据列表采用分页加载，避免一次性加载全部数据。

## 总结

UITableView 是 iOS 开发中最常用、最基础的列表控件，通过数据源和委托机制，可以高效、灵活地展示大量数据。掌握它的使用和优化技巧，是 UIKit 开发者必须掌握的核心技能。

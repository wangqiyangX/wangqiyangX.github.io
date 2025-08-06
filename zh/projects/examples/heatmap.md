# 热力图

> 对 Github iOS 端 App 热力图 Widget 的复刻

## 解析

该组件由 $7 \times 7$ 的格子组成，根据每天的数据量（具体来说是 commit 数目）进行分级别填充（不同量级透明度不同），最右一列为本周数据。
数据自左到右，自上到下进行填充，最上一行始终为一周起始（视设备具体情况而定，可能为周日或周一）。
最右一列在本周未到之前，保持空数据占位。

具体如下图所示：

::: tabs
== GitHub iOS App Small Widget
![GitHub iOS App Small Widget](/github-heatmap-small.png){width=300px}
== GitHub iOS App Medium Widget
![GitHub iOS App Medium Widget](/github-heatmap-medium.png){width=300px}
:::

## 实现方案

本示例提供两种实现方案。

### 使用 HStack 和 VStack 嵌套渲染

![HeatMap Demo](/heatmap-demo.png){width=300px}

```swift
struct DayActivity: Identifiable {
    let id = UUID()
    let date: Date
    let count: Int
}

struct HeatMapView: View {
    let data: [DayActivity]

    private func color(for count: Int) -> Color {
        switch count {
        case 0: return Color.gray.opacity(0.1)
        case 1...10: return Color.green.opacity(0.3)
        case 11...20: return Color.green.opacity(0.5)
        case 21...30: return Color.green.opacity(0.7)
        default: return Color.green
        }
    }

    var body: some View {
        HStack(spacing: 4) {
            ForEach(0..<7, id: \.self) { column in
                VStack(spacing: 4) {
                    ForEach(0..<7, id: \.self) { row in
                        let index = column * 7 + row
                        if index < data.count {
                            let day = data[index]
                            Rectangle()
                                .fill(color(for: day.count))
                                .frame(width: 16, height: 16)
                                .cornerRadius(2)
                        }
                    }
                }
            }
        }
        .clipShape(.rect(cornerRadius: 12))
    }
}

func generateHeatmapData(existingData: [DayActivity]) -> [DayActivity] {
    guard let firstDate = existingData.first?.date,
          let lastDate = existingData.last?.date else {
        return []
    }

    let calendar = Calendar.current
    let today = calendar.startOfDay(for: lastDate)

    // 当前周的起点（根据系统设置的 firstWeekday）
    guard let startOfWeek = calendar.dateInterval(of: .weekOfYear, for: today)?.start,
          let endOfWeek = calendar.dateInterval(of: .weekOfYear, for: today)?.end else {
        return []
    }

    // 开始日期：往前数 6 周（42 天）
    guard let desiredStartDate = calendar.date(byAdding: .day, value: -42, to: startOfWeek) else {
        return []
    }

    var result: [DayActivity] = []

    // 补前面的占位（直到 existingData.first 之前）
    var current = desiredStartDate
    while current < firstDate {
        result.append(DayActivity(date: current, count: 0))
        current = calendar.date(byAdding: .day, value: 1, to: current)!
    }

    // 添加已有数据
    result.append(contentsOf: existingData)

    // 补后面的占位（直到本周结束，但最多总共 49 个）
    current = calendar.date(byAdding: .day, value: 1, to: lastDate)!
    while result.count < 49 && current < endOfWeek {
        result.append(DayActivity(date: current, count: 0))
        current = calendar.date(byAdding: .day, value: 1, to: current)!
    }

    // 若仍不足 49 个，再补（跨下周，但不推荐这样）
    while result.count < 49 {
        result.append(DayActivity(date: current, count: 0))
        current = calendar.date(byAdding: .day, value: 1, to: current)!
    }

    // 若多于 49，裁剪尾部
    if result.count > 49 {
        result = Array(result.suffix(49))
    }

    return result
}

#Preview {
    let calendar = Calendar.current
    let today = calendar.startOfDay(for: Date())

    let existing: [DayActivity] = (0..<7).compactMap {
        guard
            let date = calendar.date(byAdding: .day, value: -6 + $0, to: today)
        else { return nil }
        return DayActivity(date: date, count: Int.random(in: 5...20))
    }

    let fullData = generateHeatmapData(existingData: existing)
    HeatMapView(data: fullData)
}
```

### 使用 Grid

## 拓展

## 总结

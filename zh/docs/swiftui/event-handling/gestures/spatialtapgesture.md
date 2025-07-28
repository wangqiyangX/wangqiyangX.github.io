# SpatialTapGesture

> 识别一个或多个点击并报告其位置的手势。

:::tip
iOS 16.0+
iPadOS 16.0+
Mac Catalyst 16.0+
macOS 13.0+
visionOS 1.0+
watchOS 9.0+
:::

## 概述

要在视图上识别点击手势，需创建并配置该手势，然后使用 `gesture(_:including:)` 修饰符将其添加到视图中。以下代码为 Circle 添加了一个点击手势，根据点击位置切换圆形的颜色：

```swift
struct TapGestureView: View {
    @State private var location: CGPoint = .zero


    var tap: some Gesture {
        SpatialTapGesture()
            .onEnded { event in
                self.location = event.location
             }
    }


    var body: some View {
        Circle()
            .fill(self.location.y > 50 ? Color.blue : Color.red)
            .frame(width: 100, height: 100, alignment: .center)
            .gesture(tap)
    }
}
```

## 创建空间点击手势

### `init(count:coordinateSpace:)`

> 创建一个点击手势，指定所需的点击次数和手势位置的坐标空间。

```swift
init(
    count: Int = 1,
    coordinateSpace: some CoordinateSpaceProtocol = .local
)
```

#### 参数

##### `count`

完成点击手势所需的点击次数。

##### `coordinateSpace`

点击手势位置的坐标空间。

### coordinateSpace

> 用于接收位置值的坐标空间。

```swift
var coordinateSpace: CoordinateSpace
```

### count

> 所需的点击事件次数。

```swift

```

## 获取手势的值

### SpatialTapGesture.Value

> 点击手势的属性。

```swift
struct Value
```

#### 获取点击位置

##### `location`

> 点击手势当前事件的位置。

```swift
var location: CGPoint
```

##### `location3D`

> 点击的三维位置。

::: tip
visionOS 1.0+
:::

```swift
var location3D: Point3D { get }
```

## 其他初始化器

### `init(count:coordinateSpace3D:)`

> 创建一个点击手势，指定所需的点击次数和手势位置的坐标空间。

::: tip
visionOS 26.0+
:::

```swift
init(
    count: Int = 1,
    coordinateSpace3D: some CoordinateSpace3D
)
```

### 参数

#### `count`

完成点击手势所需的点击次数。

#### `coordinateSpace3D`

点击手势位置的三维坐标空间。

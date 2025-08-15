# 维度

> 一个表示维度测量单位的抽象类。

::: tip
iOS 10.0+
iPadOS 10.0+
Mac Catalyst 13.1+
macOS 10.12+
tvOS 10.0+
visionOS 1.0+
watchOS 3.0+
:::

```swift
class Dimension
```

## 概述

Foundation 框架为许多最常见的物理单位类型提供了具体的子类。

表 1: Dimension 子类。

| 维度类型                        |           描述           |        基本单位        |
| :------------------------------ | :----------------------: | :--------------------: |
| UnitAcceleration                |     加速度的计量单位     |   米每秒平方 (m/s²)    |
| UnitAngle                       | 平面角度和旋转的测量单位 |         度 (°)         |
| UnitArea                        |      面积的计量单位      |      平方米 (m²)       |
| UnitConcentrationMass           |    质量浓度的计量单位    |      克每升 (g/L)      |
| UnitDispersion                  |      分散的计量单位      |    百万分之一 (ppm)    |
| UnitDuration                    |    时间持续的计量单位    |       秒（sec）        |
| UnitElectricCharge              |      电荷的计量单位      |        库仑 (C)        |
| UnitElectricCurrent             |      电流的计量单位      |        安培 (A)        |
| UnitElectricPotentialDifference |     电势差的计量单位     |        伏特 (V)        |
| UnitElectricResistance          |      电阻的计量单位      |        欧姆 (Ω)        |
| UnitEnergy                      |      能量的计量单位      |        焦耳 (J)        |
| UnitFrequency                   |      频率的计量单位      |       赫兹 (Hz)        |
| UnitFuelEfficiency              |    燃油效率的计量单位    | 每百公里升数 (L/100km) |
| UnitIlluminance                 |      照度的计量单位      |      勒克斯 (lx)       |
| UnitInformationStorage          |     信息量的计量单位     |        字节 (b)        |
| UnitLength                      |      长度的计量单位      |         米 (m)         |
| UnitMass                        |      质量的计量单位      |       千克 (kg)        |
| UnitPower                       |      功率的计量单位      |        瓦特 (W)        |
| UnitPressure                    |      压力的计量单位      |  每平方米牛顿 (N/m²)   |
| UnitSpeed                       |      速度的计量单位      |      米每秒 (m/s)      |
| UnitTemperature                 |      温度的计量单位      |       开尔文 (K)       |
| UnitVolume                      |      体积的计量单位      |         升 (L)         |

每个 Dimension 子类的实例都有一个 converter，它表示该维度的 baseUnit() 的单位。例如，NSLengthUnit 类使用 meters 作为其基本单位。系统通过一个 UnitConverterLinear 定义预定义的 miles 单位，其 coefficient 为 1609.34，这对应于英里与米的转换比率 (1 mi = 1609.34 m)；系统通过一个 UnitConverterLinear 定义预定义的 meters 单位，其 coefficient 为 1.0，因为它是基本单位。

您通常将 NSDimension 子类与 NSMeasurement 类结合使用，以表示特定单位的特定数量。

## 使用自定义单位

除了 Apple 提供的单位外，您还可以定义自定义单位。您可以从现有类型的符号和转换器初始化自定义单位，或者将其作为现有类型的类方法实现，以便于使用。您还可以定义自己的 NSDimension 子类，以表示全新的单位维度。

## 使用指定符号和定义初始化自定义单位

定义自定义单位的最简单方法是使用 `init(symbol:converter:)` 方法创建现有 NSDimension 子类的新实例。
例如，smoot 是一种非标准长度单位（1 smoot = 1.70180 m）。您可以按如下方式创建 UnitLength 的新实例：

```swift
let smoots = UnitLength(symbol: "smoot", converter: UnitConverterLinear(coefficient: 1.70180))
```

## 扩展现有的维度子类

或者，如果您在整个应用中广泛使用自定义单位，请考虑扩展相应的 Dimension 子类并添加一个静态变量。

例如，速度的测量可以是每两周的弗隆（1 fur/ftn = 201.168 m / 1,209,600 s）。如果一个应用频繁使用这个单位，您可以扩展 UnitSpeed，添加一个 `furlongsPerFortnight` 静态变量，以便于访问，如下所示：

```swift
extension UnitSpeed {
    static let furlongPerFortnight = UnitSpeed(symbol: "fur/ftn", converter: UnitConverterLinear(coefficient: 201.168 / 1209600.0))
}
```

## 创建自定义维度子类

您可以创建一个新的 Dimension 子类来描述一个新的单位维度。
例如，Foundation 框架并未定义任何放射性单位。放射性是原子核发射辐射的过程。放射性的国际单位制（SI）计量单位是贝克勒尔（Bq），它表示每秒衰变一个原子核的放射性物质的数量（1 Bq = 1 s-1）。放射性通常也用居里（Ci）来描述，这是一个相对于 226 号镭同位素衰变一克的单位（1 Ci = 3.7 × 10^10 Bq）。您可以实现一个 CustomUnitRadioactivity 类，定义这两种放射性单位，如下所示：

```swift
class CustomRadioactivityUnit: Dimension {
    static let becquerel = CustomRadioactivityUnit(symbol: "Bq", UnitConverterLinear(coefficient: 1.0))
    static let curie = CustomRadioactivityUnit(symbol: "Ci", UnitConverterLinear(coefficient: 3.7e10))

    static let baseUnit = self.becquerel
}
```

## 子类化说明

系统提供了 Dimension 以供子类化。尽管上表中的子类适用于大多数目的，但您可能希望定义一个自定义单位类型。例如，您可能需要一个自定义单位类型来表示派生单位，例如磁通量（测量为电势差和时间的乘积）。
要表示无量纲单位，请直接子类化 Unit。

## 重写的方法

所有子类必须完全实现 `baseUnit()` 方法，该方法指定基单位，相对于此您可以定义任何附加单位。
您还必须实现一个以基单位本身命名的类方法，以便可以互换使用。例如，UnitIlluminance 类以勒克斯（lx）定义其 baseUnit()，并提供相应的 lux 类方法。

## 替代子类化的方法

如处理自定义单位中所述，只有在您或系统尚未定义所需维度的单位时，您才需要创建 Dimension 的自定义子类。您可以通过调用 `init(symbol:converter:)` 方法或扩展子类并添加相应的类方法来为现有的 Dimension 子类定义自定义单位。

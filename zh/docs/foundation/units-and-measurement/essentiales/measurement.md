# 测量

> 带有计量单位的数值量，支持单位转换和单位感知计算。

::: tip
iOS 10.0+
iPadOS 10.0+
Mac Catalyst 10.0+
macOS 10.12+
tvOS 10.0+
visionOS 1.0+
watchOS 3.0+
:::

```swift
struct Measurement<UnitType> where UnitType : Unit
```

## 概述

Measurement 对象表示一个数量和计量单位。Measurement 类型提供了一个编程接口，用于将测量值转换为不同的单位，以及计算两个测量值之间的和或差。

Measurement 对象通过 Unit 对象和双精度值进行初始化。Measurement 对象是不可变的，创建后无法更改。
测量支持一大组运算符，包括 +、-、*、/，以及一整套比较运算符。

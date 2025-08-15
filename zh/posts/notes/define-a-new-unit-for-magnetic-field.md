# 为磁场定义一个新的 Unit

Foundation 提供了 Measurement 类用于表示测量单位，其中 Diemension 可以定义了一组统一纬度的，可以相互进行转换的单位，Foundation 内置了一系列可用的单位，具体情况可以参考[相关文档](/docs/foundation/units-and-measurement/essentiales/dimension)。

但 Foundation 并没有提供磁场强度单位，下列代码提供了一个可用的实现：

```swift
class UnitMagneticField: Dimension, @unchecked Sendable {
    // 定义基本单位（特斯拉）
    static let tesla = UnitMagneticField(
        symbol: "T",
        converter: UnitConverterLinear(coefficient: 1.0)
    )
    static let millitesla = UnitMagneticField(
        symbol: "mT",
        converter: UnitConverterLinear(coefficient: 1e-3)
    )
    static let microtesla = UnitMagneticField(
        symbol: "μT",
        converter: UnitConverterLinear(coefficient: 1e-6)
    )
    static let gauss = UnitMagneticField(
        symbol: "G",
        converter: UnitConverterLinear(coefficient: 1e-4)
    )

    override class func baseUnit() -> Self {
        self.tesla as! Self
    }
}
```

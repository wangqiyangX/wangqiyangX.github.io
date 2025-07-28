# 高级运算符

> 定义自定义运算符，执行位操作，并使用构建器语法。

除了基本运算符中描述的运算符之外，Swift 还提供几个高级运算符，可以执行更复杂的值操作。这些包括您将熟悉的所有来自 C 和 Objective-C 的位运算符和位移运算符。

与 C 的算术运算符不同，Swift 的算术运算符默认情况下**不会溢出**。溢出行为会被捕获并报告为错误。要选择溢出行为，可以使用 Swift 的第二组默认情况下会溢出的算术运算符，例如溢出加法运算符 ( `&+` )。所有这些溢出运算符都以一个**字符 '&' 开头** ( `&` )。

当您定义自己的结构、类和枚举时，提供这些自定义类型的标准 Swift 运算符的自定义实现是很有用的。Swift 使得为这些运算符提供量身定制的实现变得容易，并能确定为您创建的每个类型其行为应该是什么。

您并不局限于预定义的运算符。Swift 让您自由定义自己的自定义中缀、前缀、后缀和赋值运算符，具有自定义的优先级和结合性值。这些运算符可以像任何预定义运算符一样在您的代码中使用和采纳，甚至可以扩展现有类型以支持您定义的自定义运算符。

## [位运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Bitwise-Operators)

按位运算符使您能够操作数据结构中的单个原始数据位。它们通常用于低级编程，例如图形编程和设备驱动程序创建。当您处理来自外部源的原始数据时，例如为通过自定义协议进行通信而编码和解码数据，按位运算符也非常有用。

Swift 支持 C 中的所有位运算符，如下所述。

### [按位非运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Bitwise-NOT-Operator)

按位非运算符 ( `~` ) 反转数字中的所有位：

![bitwiseNOT](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseNOT@2x.png){.light-only}
![bitwiseNOT~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseNOT~dark@2x.png){.dark-only}

按位非运算符是一个前缀运算符，它出现在其操作的值之前，没有任何空格：

```swift
let initialBits: UInt8 = 0b00001111
let invertedBits = ~initialBits  // 等于 11110000
```

`UInt8` 个整数有八位，可以存储从 `0` 到 `255` 之间的任何值。此示例使用二进制值 `00001111` 初始化一个 `UInt8` 整数，该整数的前四位设置为 `0` ，后四位设置为 `1` 。这相当于十进制值 `15` 。

位运算 NOT 运算符用于创建一个新的常量 `invertedBits` ，它等于 `initialBits` ，但所有位都反转。零变为一， 一变为零。 `invertedBits` 的值是 `11110000` ，这相当于无符号十进制值 `240` 。

### [位运算 AND 运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Bitwise-AND-Operator)

位运算 AND 运算符 ( `&` ) 将两个数字的位结合在一起。当输入数字中的位都等于 `1` 时，它返回一个新数字，其位设置为 `1` ：

![bitwiseAND](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseAND@2x.png){.light-only}
![bitwiseAND~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseAND~dark@2x.png){.dark-only}

在下面的示例中， `firstSixBits` 和 `lastSixBits` 的值都有四个中间位等于 `1` 。按位与操作符将它们结合成数字 `00111100` ，其无符号十进制值为 `60` ：

```swift
let firstSixBits: UInt8 = 0b11111100
let lastSixBits: UInt8  = 0b00111111
let middleFourBits = firstSixBits & lastSixBits  // 等于 00111100
```

### [按位或操作符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Bitwise-OR-Operator)

按位或操作符 ( `|` ) 比较两个数字的位。如果任一输入数字中的位等于 `1` ，则操作符返回一个新数字，其位设置为 `1` ：

![bitwiseOR](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseOR@2x.png){.light-only}
![bitwiseOR~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseOR~dark@2x.png){.dark-only}

在下面的示例中， `someBits` 和 `moreBits` 的值有不同的位设置为 `1` 。按位或操作符将它们结合成数字 `11111110` ，其无符号十进制值等于 `254` ：

```swift
let someBits: UInt8 = 0b10110010
let moreBits: UInt8 = 0b01011110
let combinedbits = someBits | moreBits  // 等于 11111110
```

### [按位异或运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Bitwise-XOR-Operator)

按位异或运算符，或称为“排他或运算符” ( `^` )，比较两个数字的位。该运算符返回一个新数字，其位在输入位不同的地方设置为 `1` ，在输入位相同的地方设置为 `0` ：

![bitwiseXOR](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseXOR@2x.png){.light-only}
![bitwiseXOR~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitwiseXOR~dark@2x.png){.dark-only}

在下面的示例中， `firstBits` 和 `otherBits` 的值在一个位置各自有一个位设置为 `1` ，而另一个则没有。按位异或运算符在其输出值中将这两个位都设置为 `1` 。 `firstBits` 和 `otherBits` 中的其余位匹配，并在输出值中设置为 `0` ：

```swift
let firstBits: UInt8 = 0b00010100
let otherBits: UInt8 = 0b00000101
let outputBits = firstBits ^ otherBits  // 等于 00010001
```

### [按位左移和右移运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Bitwise-Left-and-Right-Shift-Operators)

位运算左移运算符 ( `<<` ) 和位运算右移运算符 ( `>>` ) 将数字中的所有位根据下面定义的规则向左或向右移动一定数量的位置。

位运算左移和右移的效果是将**整数乘以或除以二的因子**。将整数的位向左移动一个位置会使其值加倍，而向右移动一个位置则会使其值减半。

[**无符号整数的移位行为**](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Shifting-Behavior-for-Unsigned-Integers)

无符号整数的位移行为如下：

1. 现有的位根据请求的位数向左或向右移动。
2. 任何超出整数存储边界的位都会被丢弃。
3. 在原始位向左或向右移动后留下的空位中插入零。

这种方法被称为**逻辑移位**。

下面的插图显示了 `11111111 << 1` （向左移位的 `11111111` ，移位 `1` 位）和 `11111111 >> 1` （向右移位的 `11111111` ，移位 `1` 位）的结果。绿色数字为移位，灰色数字被丢弃，粉色 0 被插入：

![bitshiftUnsigned](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftUnsigned@2x.png){.light-only}
![bitshiftUnsigned~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftUnsigned~dark@2x.png){.dark-only}

以下是 Swift 代码中位移的样子：

```swift
let shiftBits: UInt8 = 4   // 对应的二进制 00000100
shiftBits << 1             // 00001000
shiftBits << 2             // 00010000
shiftBits << 5             // 10000000
shiftBits << 6             // 00000000
shiftBits >> 2             // 00000001
```

您可以使用位移在其他数据类型中编码和解码值：

```swift
let pink: UInt32 = 0xCC6699
let redComponent = (pink & 0xFF0000) >> 16    // redComponent 为 0xCC, or 204
let greenComponent = (pink & 0x00FF00) >> 8   // greenComponent 为 0x66, or 102
let blueComponent = pink & 0x0000FF           // blueComponent 为 0x99, or 153
```

这个例子使用了一个名为 `pink` 的 `UInt32` 常量来存储颜色 pink 的层叠样式表颜色值。CSS 颜色值 `#CC6699` 在 Swift 的十六进制数字表示中写作 `0xCC6699` 。然后，通过按位与运算符（ `&` ）和按位右移运算符（ `>>` ），该颜色被分解为其红色（ `CC` ）、绿色（ `66` ）和蓝色（ `99` ）成分。

redComponent 是通过对数字 `0xCC6699` 和 `0xFF0000` 进行按位与操作获得的。 `0xFF0000` 中的零有效地“屏蔽”了 `0xCC6699` 的第二和第三个字节，导致 `6699` 被忽略，结果为 `0xCC0000` 。

这个数字然后向右移动 16 位（ `>> 16` ）。十六进制数字中的每对字符使用 8 位，因此向右移动 16 位将把 `0xCC0000` 转换为 `0x0000CC` 。这与 `0xCC` 相同，其十进制值为 `204` 。

同样，greenComponent 分是通过对数字 `0xCC6699` 和 `0x00FF00` 进行按位与操作获得的，输出值为 `0x006600` 。这个输出值然后右移八位，得到值 `0x66` ，其十进制值为 `102` 。

最后，blueComponent 是通过对数字 `0xCC6699` 和 `0x0000FF` 进行按位与操作获得的，输出值为 `0x000099` 。因为 `0x000099` 已经等于 `0x99` ，其十进制值为 `153` ，这个值被直接使用而无需右移。

[**有符号整数的移位行为**](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Shifting-Behavior-for-Signed-Integers)

对于有符号整数，移位行为比无符号整数更复杂，因为有符号整数在二进制中表示的方式。(下面的例子基于 8 位有符号整数以简化说明，但相同的原则适用于任何大小的有符号整数。)

带符号整数使用其第一个位（称为符号位）来指示整数是正数还是负数。符号位为 `0` 表示正数，符号位为 `1` 表示负数。

其余的位（称为值位）存储实际值。正数的存储方式与无符号整数完全相同，从 `0` 开始向上计数。以下是数字 `4` 的 `Int8` 内部位的样子：

![bitshiftSignedFour](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedFour@2x.png){.light-only}
![bitshiftSignedFour~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedFour~dark@2x.png){.dark-only}

符号位是 `0` （表示“正数”），七个值位就是数字 `4` ，以二进制表示。

负数的存储方式有所不同。它们是通过从 `2` 的 `n` 次方中减去它们的绝对值来存储的，其中 `n` 是有效位的数量。一个八位数字有七个位，因此这意味着 `2` 的 `7` 次方，或 `128` 。

这是数字 `-4` 在 `Int8` 中的位的表示：

![bitshiftSignedMinusFour](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedMinusFour@2x.png){.light-only}
![bitshiftSignedMinusFour~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedMinusFour~dark@2x.png){.dark-only}

这次，符号位是 `1` （表示“负数”），七个位的值的二进制值为 `124` （即 `128 - 4` ）：

![bitshiftSignedMinusFourValue](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedMinusFourValue@2x.png){.light-only}
![bitshiftSignedMinusFourValue~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedMinusFourValue~dark@2x.png){.dark-only}

这种负数的编码被称为二的**补码表示**。它可能看起来是表示负数的一种不寻常方式，但它有几个优点。

首先，您可以通过对所有八位（包括符号位）进行标准的二进制加法，将 `-1` 添加到 `-4` ，并在完成后丢弃任何不适合这八位的内容：

![bitshiftSignedAddition](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedAddition@2x.png){.light-only}
![bitshiftSignedAddition~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSignedAddition~dark@2x.png){.dark-only}

其次，二的补码表示还允许您像正数一样将负数的位向左和向右移动，并且每次向左移动时仍然会使其翻倍，向右移动时则会使其减半。为了实现这一点，当有符号整数向右移动时，会使用一个额外的规则：当您向右移动有符号整数时，应用与无符号整数相同的规则，但将左侧的任何空位**填充为符号位**，而不是零。

![bitshiftSigned](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSigned@2x.png){.light-only}
![bitshiftSigned~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/bitshiftSigned~dark@2x.png){.dark-only}

此操作确保有符号整数在向右移动后具有相同的符号，这被称为**算术右移**。

由于正数和负数的存储方式特殊，向右移动它们会使它们更接近零。在此移动过程中保持符号位不变意味着负整数在其值接近零时仍然保持负值。

## [溢出运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Overflow-Operators)

如果您尝试将一个数字插入到一个无法容纳该值的整数常量或变量中，默认情况下，Swift 会报告一个错误，而不是允许创建无效值。这种行为在您处理过大或过小的数字时提供了额外的安全性。

例如， `Int16` 整数类型可以容纳任何在 `-32768` 和 `32767` 之间的有符号整数。尝试将一个 `Int16` 常量或变量设置为超出此范围的数字会导致错误：

```swift
var potentialOverflow = Int16.max
// potentialOverflow equals 32767, which is the maximum value an Int16 can hold
potentialOverflow += 1
// this causes an error
```

在值变得过大或过小时提供错误处理，可以在编写边界值条件时为您提供更大的灵活性。

但是，当您特别希望溢出条件截断可用位数时，您可以选择这种行为而不是触发错误。Swift 提供了三种算术溢出运算符，它们为整数计算选择了溢出行为。这些运算符都以符号（ `&` ）开头：

- 溢出加法（ `&+` ）
- 溢出减法（ `&-` ）
- 溢出乘法（ `&*` ）

### [值溢出](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Value-Overflow)

数字可以在正方向和负方向上溢出。

以下是一个示例，当一个无符号整数允许在正方向溢出时会发生什么，使用溢出加法运算符 ( `&+` )：

```swift
var unsignedOverflow = UInt8.max
// unsignedOverflow equals 255, which is the maximum value a UInt8 can hold
unsignedOverflow = unsignedOverflow &+ 1
// unsignedOverflow is now equal to 0
```

变量 `unsignedOverflow` 被初始化为 `UInt8` 可以容纳的最大值 ( `255` ，或 `11111111` 以二进制表示)。然后它通过溢出加法运算符 ( `&+` ) 增加 `1` 。这使其二进制表示超过了 `UInt8` 可以容纳的大小，导致它溢出其界限，如下图所示。溢出加法后仍然在 `UInt8` 范围内的值是 `00000000` ，或零。

![overflowAddition](https://docs.swift.org/swift-book/images/org.swift.tspl/overflowAddition@2x.png){.light-only}
![overflowAddition~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/overflowAddition~dark@2x.png){.dark-only}

当无符号整数允许在负方向溢出时，会发生类似的情况。以下是使用溢出减法运算符 ( `&-` ) 的示例：

```swift
var unsignedOverflow = UInt8.min
// unsignedOverflow equals 0, which is the minimum value a UInt8 can hold
unsignedOverflow = unsignedOverflow &- 1
// unsignedOverflow is now equal to 255
```

`UInt8` 能持有的最小值为零，或者在二进制中为 `00000000` 。如果您使用溢出减法运算符 ( `&-` ) 从 `00000000` 中减去 `1` ，该数字将会溢出并循环回 `11111111` ，或者在十进制中为 `255` 。

![overflowUnsignedSubtraction](https://docs.swift.org/swift-book/images/org.swift.tspl/overflowUnsignedSubtraction@2x.png){.light-only}
![overflowUnsignedSubtraction~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/overflowUnsignedSubtraction~dark@2x.png){.dark-only}

溢出也会发生在带符号整数上。所有带符号整数的加法和减法都是以按位方式执行的，符号位作为加或减的数字的一部分，正如在按位左移和右移运算符中所描述的。

```swift
var signedOverflow = Int8.min
// signedOverflow equals -128, which is the minimum value an Int8 can hold
signedOverflow = signedOverflow &- 1
// signedOverflow is now equal to 127
```

一个 `Int8` 可以容纳的最小值是 `-128` ，或在二进制中是 `10000000` 。用溢出运算符从这个二进制数中减去 `1` 得到的二进制值是 `01111111` ，这会切换符号位并给出正值 `127` ，这是一个 `Int8` 可以持有的最大正值。

![overflowSignedSubtraction](https://docs.swift.org/swift-book/images/org.swift.tspl/overflowSignedSubtraction@2x.png){.light-only}
![overflowSignedSubtraction~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/overflowSignedSubtraction~dark@2x.png){.dark-only}

对于带符号和不带符号的整数，正方向的溢出从最大有效整数值回绕到最小值，而负方向的溢出从最小值回绕到最大值。

## [优先级和结合性](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Precedence-and-Associativity)

运算符优先级给某些运算符更高的优先级；这些运算符首先被应用。

运算符结合性定义了相同优先级的运算符是如何分组的——要么从左分组，要么从右分组。可以理解为“它们与左侧的表达式关联”，或“它们与右侧的表达式关联。”

在计算复合表达式的顺序时，考虑每个运算符的优先级和结合性是很重要的。例如，运算符优先级解释了为什么以下表达式等于 `17` 。

```swift
2 + 3 % 4 * 5
// this equals 17
```

如果您严格从左到右阅读，您可能会期望表达式按如下方式计算：

- `2` 加 `3` 等于 `5`
- `5` 余 `4` 等于 `1`
- `1` 乘 `5` 等于 `5`

然而，实际答案是 `17` ，而不是 `5` 。 高优先级运算符在低优先级运算符之前被计算。在 Swift 中，与 C 一样，余数运算符 ( `%` ) 和乘法运算符 ( `*` ) 的优先级高于加法运算符 ( `+` ) 。 因此，它们在考虑加法之前都会被计算。

然而，余数和乘法的优先级相同。要确定确切的求值顺序，还需要考虑它们的结合性。余数和乘法都与其左侧的表达式结合。可以将其视作在表达式的这些部分周围添加隐式括号，从左侧开始：

```swift
2 + ((3 % 4) * 5)
```

`(3 % 4)` 是 `3` ，所以这等价于：

```swift
2 + (3 * 5)
```

`(3 * 5)` 是 `15` ，所以这等价于：

```swift
2 + 15
```

此计算得出的最终答案为 `17` 。

有关 Swift 标准库提供的运算符的信息，包括运算符优先级组和结合性设置的完整列表，请参见运算符声明。

> 注意
>
> Swift 的运算符优先级和结合性规则比 C 和 Objective-C 中的更简单、更可预测。然而，这意味着它们与 C 语言及其衍生语言并不完全相同。在将现有代码迁移到 Swift 时，请小心确保运算符的交互仍然按照您预期的方式进行。

## [运算符方法](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Operator-Methods)

类和结构可以提供现有运算符的自定义实现。这被称为重载现有运算符。

下面的示例展示了如何为自定义结构实现算术加法运算符 ( `+` )。算术加法运算符是一个二元运算符，因为它作用于两个目标，并且它是一个中缀运算符，因为它出现在这两个目标之间。

该示例定义了一个 `Vector2D` 结构，用于表示二维位置向量 `(x, y)` ，接下来是一个运算符方法的定义，用于将 `Vector2D` 结构的实例相加：

```swift
struct Vector2D {
    var x = 0.0, y = 0.0
}


extension Vector2D {
    static func + (left: Vector2D, right: Vector2D) -> Vector2D {
       return Vector2D(x: left.x + right.x, y: left.y + right.y)
    }
}
```

运算符方法被定义为 `Vector2D` 上的一个类型方法，其方法名称与要重载的运算符匹配（ `+` ）。由于加法不是向量的基本行为的一部分，因此类型方法在 `Vector2D` 的扩展中定义，而不是在 `Vector2D` 的主要结构声明中。由于算术加法运算符是一个二元运算符，因此该运算符方法接受两个类型为 `Vector2D` 的输入参数，并返回一个类型为 `Vector2D` 的单一输出值。

在这个实现中，输入参数被命名为 `left` 和 `right` ，以表示将位于 `+` 运算符的左侧和右侧的 `Vector2D` 实例。该方法返回一个新的 `Vector2D` 实例，其 `x` 和 `y` 属性被初始化为两个相加的 `Vector2D` 实例的 `x` 和 `y` 属性的总和。

类型方法可以作为现有 `Vector2D` 实例之间的中缀运算符使用：

```swift
let vector = Vector2D(x: 3.0, y: 1.0)
let anotherVector = Vector2D(x: 2.0, y: 4.0)
let combinedVector = vector + anotherVector
// combinedVector is a Vector2D instance with values of (5.0, 5.0)
```

此示例将向量 `(3.0, 1.0)` 和 `(2.0, 4.0)` 相加，以生成向量 `(5.0, 5.0)` ，如下所示。

![vectorAddition](https://docs.swift.org/swift-book/images/org.swift.tspl/vectorAddition@2x.png){.light-only}
![vectorAddition~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/vectorAddition~dark@2x.png){.dark-only}

### [前缀和后缀运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Prefix-and-Postfix-Operators)

上面展示的示例演示了二元中缀运算符的自定义实现。类和结构体也可以提供标准一元运算符的实现。一元运算符作用于单个目标。它们是前缀运算符，如果它们位于目标之前（例如 `-a` ），如果它们位于目标之后（例如 `b!` ）则是后缀运算符。

通过在声明运算符方法时在 `func` 关键字前面写 `prefix` 或 `postfix` 修饰符，来实现前缀或后缀一元运算符：

```swift
extension Vector2D {
    static prefix func - (vector: Vector2D) -> Vector2D {
        return Vector2D(x: -vector.x, y: -vector.y)
    }
}
```

上述示例为 `Vector2D` 实例实现了一元负号运算符 ( `-a` )。一元负号运算符是前缀运算符，因此此方法必须带有 `prefix` 修饰符。

对于简单的数值，单目负号运算符将正数转换为其负数等价物，反之亦然。对应于 `Vector2D` 实例的实现对 `x` 和 `y` 属性执行此操作：

```swift
let positive = Vector2D(x: 3.0, y: 4.0)
let negative = -positive
// negative is a Vector2D instance with values of (-3.0, -4.0)
let alsoPositive = -negative
// alsoPositive is a Vector2D instance with values of (3.0, 4.0)
```

### [复合赋值运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Compound-Assignment-Operators)

复合赋值运算符将赋值 ( `=` ) 与另一个操作结合在一起。例如，加法赋值运算符 ( `+=` ) 将加法和赋值结合为一个操作。您将复合赋值运算符的左输入参数类型标记为 `inout` ，因为参数的值将直接从运算符方法内部修改。

下面的示例为 `Vector2D` 实例实现了一个加法赋值运算符方法：

```swift
extension Vector2D {
    static func += (left: inout Vector2D, right: Vector2D) {
        left = left + right
    }
}
```

由于之前定义了加法运算符，因此您不需要在这里重新实现加法过程。相反，加法赋值运算符方法利用现有的加法运算符方法，并使用它将左值设置为左值加上右值：

```swift
var original = Vector2D(x: 1.0, y: 2.0)
let vectorToAdd = Vector2D(x: 3.0, y: 4.0)
original += vectorToAdd
// original now has values of (4.0, 6.0)
```

> 注意
>
> 无法重载默认赋值运算符 ( `=` )。只有复合赋值运算符可以被重载。同样，三元条件运算符 ( `a ? b : c` ) 也不能被重载。

### [等价运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Equivalence-Operators)

默认情况下，自定义类和结构没有等价运算符的实现，称为等于运算符 ( `==` ) 和不等于运算符 ( `!=` )。您通常实现 `==` 运算符，并使用 Swift 标准库的 `!=` 运算符的默认实现，该实现否定 `==` 运算符的结果。有两种方法可以实现 `==` 运算符：您可以自己实现，或者对于许多类型，您可以请求 Swift 为您合成实现。在这两种情况下，您都需要遵循 Swift 标准库的 `Equatable` 协议。

您以与实现其他中缀运算符相同的方式提供 `==` 运算符的实现：

```swift
extension Vector2D: Equatable {
    static func == (left: Vector2D, right: Vector2D) -> Bool {
       return (left.x == right.x) && (left.y == right.y)
    }
}
```

上面的示例实现了一个 `==` 运算符，以检查两个 `Vector2D` 实例是否具有等效值。在 `Vector2D` 的上下文中，将“相等”视为“两个实例具有相同的 `x` 值和 `y` 值”是有意义的，因此这是运算符实现所使用的逻辑。

您现在可以使用此运算符检查两个 `Vector2D` 实例是否等价：

```swift
let twoThree = Vector2D(x: 2.0, y: 3.0)
let anotherTwoThree = Vector2D(x: 2.0, y: 3.0)
if twoThree == anotherTwoThree {
    print("These two vectors are equivalent.")
}
// Prints "These two vectors are equivalent."
```

在许多简单的情况下，您可以要求 Swift 为您提供等价运算符的合成实现，如《使用合成实现采用协议》中所述。

## [自定义运算符](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Custom-Operators)

除了 Swift 提供的标准运算符外，您还可以声明和实现自己的自定义运算符。有关可以用于定义自定义运算符的字符列表，请参见运算符。

新运算符在全局级别使用 `operator` 关键字声明，并使用 `prefix` 、 `infix` 或 `postfix` 修饰符标记：

```swift
prefix operator +++
```

上面的示例定义了一个名为 `+++` 的新前缀运算符。该运算符在 Swift 中没有现有的含义，因此在处理 `Vector2D` 实例的特定上下文中，它被赋予了自己的自定义含义。为了这个示例的目的， `+++` 被视为一个新的“前缀加倍”运算符。它通过将向量与自身相加（使用之前定义的加法赋值运算符）来加倍 `x` 和 `y` 的值。要实现 `+++` 运算符，您需要向 `Vector2D` 添加一个名为 `+++` 的类型方法，如下所示：

```swift
extension Vector2D {
    static prefix func +++ (vector: inout Vector2D) -> Vector2D {
        vector += vector
        return vector
    }
}


var toBeDoubled = Vector2D(x: 1.0, y: 4.0)
let afterDoubling = +++toBeDoubled
// toBeDoubled now has values of (2.0, 8.0)
// afterDoubling also has values of (2.0, 8.0)
```

### [自定义中缀运算符的优先级](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Precedence-for-Custom-Infix-Operators)

自定义中缀运算符各自属于一个优先级组。优先级组指定运算符相对于其他中缀运算符的优先级，以及运算符的结合性。有关这些特征如何影响中缀运算符与其他中缀运算符之间相互作用的解释，请参见优先级和结合性。

未被明确放入优先级组的自定义中缀运算符将被赋予一个默认的优先级组，其优先级立即高于三元条件运算符的优先级。

以下示例定义了一个名为 `+-` 的新自定义中缀运算符，该运算符属于优先级组 `AdditionPrecedence` :

```swift
infix operator +-: AdditionPrecedence
extension Vector2D {
    static func +- (left: Vector2D, right: Vector2D) -> Vector2D {
        return Vector2D(x: left.x + right.x, y: left.y - right.y)
    }
}
let firstVector = Vector2D(x: 1.0, y: 2.0)
let secondVector = Vector2D(x: 3.0, y: 4.0)
let plusMinusVector = firstVector +- secondVector
// plusMinusVector is a Vector2D instance with values of (4.0, -2.0)
```

这个运算符将两个向量的 `x` 值相加，并从第一个向量中减去第二个向量的 `y` 值。因为它本质上是一个“加法”运算符，所以它被赋予与加法中缀运算符如 `+` 和 `-` 相同的优先级组。有关 Swift 标准库提供的运算符的信息，包括运算符优先级组和结合性设置的完整列表，请参见运算符声明。有关优先级组的更多信息以及查看定义您自己运算符和优先级组的语法，请参见运算符声明。

> 注意
>
> 在定义前缀或后缀运算符时，您不需要指定优先级。然而，如果您对同一个操作数同时应用前缀和后缀运算符，则先应用后缀运算符。

## [结果构建器](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/advancedoperators#Result-Builders)

结果构建器是一种您定义的类型，它添加了以自然、声明的方式创建嵌套数据（如列表或树）的语法。使用结果构建器的代码可以包含普通的 Swift 语法，例如 `if` 和 `for` ，以处理条件或重复的数据块。

下面的代码定义了一些类型，用于使用星号和文本在单行上绘图。

```swift
protocol Drawable {
    func draw() -> String
}
struct Line: Drawable {
    var elements: [Drawable]
    func draw() -> String {
        return elements.map { $0.draw() }.joined(separator: "")
    }
}
struct Text: Drawable {
    var content: String
    init(_ content: String) { self.content = content }
    func draw() -> String { return content }
}
struct Space: Drawable {
    func draw() -> String { return " " }
}
struct Stars: Drawable {
    var length: Int
    func draw() -> String { return String(repeating: "*", count: length) }
}
struct AllCaps: Drawable {
    var content: Drawable
    func draw() -> String { return content.draw().uppercased() }
}
```

`Drawable` 协议定义了可以绘制的内容的要求，例如线条或形状：该类型必须实现 `draw()` 方法。 `Line` 结构表示单行绘图，并作为大多数绘图的顶级容器。要绘制 `Line` ，该结构在每个线段的组件上调用 `draw()` ，然后将结果字符串连接成一个字符串。 `Text` 结构包装一个字符串，使其成为绘图的一部分。 `AllCaps` 结构包装并修改另一个绘图，将绘图中的任何文本转换为大写。

可以通过调用它们的初始化器来使用这些类型进行绘图：

```swift
let name: String? = "Ravi Patel"
let manualDrawing = Line(elements: [
     Stars(length: 3),
     Text("Hello"),
     Space(),
     AllCaps(content: Text((name ?? "World") + "!")),
     Stars(length: 2),
])
print(manualDrawing.draw())
// Prints "***Hello RAVI PATEL!**"
```

这段代码可以工作，但有点别扭。 `AllCaps` 后面的深层嵌套括号很难阅读。当 `name` 为 `nil` 时，使用“World”的回退逻辑必须使用 `??` 运算符以内联的方式完成，这在任何更复杂的情况下都会很困难。如果需要包括开关或 `for` 循环来构建绘图的一部分，是没有办法做到的。结果构建器可以让您重写代码，使其看起来像正常的 Swift 代码。

要定义一个结果构建器，可以在类型声明上写上 `@resultBuilder` 属性。例如，这段代码定义了一个名为 `DrawingBuilder` 的结果构建器，它允许您使用声明式语法来描述绘图：

```swift
@resultBuilder
struct DrawingBuilder {
    static func buildBlock(_ components: Drawable...) -> Drawable {
        return Line(elements: components)
    }
    static func buildEither(first: Drawable) -> Drawable {
        return first
    }
    static func buildEither(second: Drawable) -> Drawable {
        return second
    }
}
```

`DrawingBuilder` 结构定义了三个方法，这些方法实现了结果构建器语法的部分功能。 `buildBlock(_:)` 方法支持在代码块中编写一系列行。它将该块中的组件组合成一个 `Line` 。 `buildEither(first:)` 和 `buildEither(second:)` 方法支持 `if` - `else` 。

您可以将 `@DrawingBuilder` 属性应用于函数的参数，这将把传递给该函数的闭包转换为结果构建器从该闭包创建的值。例如：

```swift
func draw(@DrawingBuilder content: () -> Drawable) -> Drawable {
    return content()
}
func caps(@DrawingBuilder content: () -> Drawable) -> Drawable {
    return AllCaps(content: content())
}


func makeGreeting(for name: String? = nil) -> Drawable {
    let greeting = draw {
        Stars(length: 3)
        Text("Hello")
        Space()
        caps {
            if let name = name {
                Text(name + "!")
            } else {
                Text("World!")
            }
        }
        Stars(length: 2)
    }
    return greeting
}
let genericGreeting = makeGreeting()
print(genericGreeting.draw())
// Prints "***Hello WORLD!**"


let personalGreeting = makeGreeting(for: "Ravi Patel")
print(personalGreeting.draw())
// Prints "***Hello RAVI PATEL!**"
```

`makeGreeting(for:)` 函数接受一个 `name` 参数，并使用它来绘制个性化的问候。 `draw(_:)` 和 `caps(_:)` 函数都接受一个闭包作为参数，该闭包被标记为 `@DrawingBuilder` 属性。当您调用这些函数时，您使用 `DrawingBuilder` 定义的特殊语法。 Swift 将绘图的声明性描述转换为对 `DrawingBuilder` 上方法的一系列调用，以构建作为函数参数传递的值。例如，Swift 将该示例中的对 `caps(_:)` 的调用转换为如下代码：

```swift
let capsDrawing = caps {
    let partialDrawing: Drawable
    if let name = name {
        let text = Text(name + "!")
        partialDrawing = DrawingBuilder.buildEither(first: text)
    } else {
        let text = Text("World!")
        partialDrawing = DrawingBuilder.buildEither(second: text)
    }
    return partialDrawing
}
```

Swift 将 `if` - `else` 块转换为对 `buildEither(first:)` 和 `buildEither(second:)` 方法的调用。尽管您在自己的代码中没有调用这些方法，但展示转换结果可以更容易地看到当您使用 `DrawingBuilder` 语法时 Swift 是如何转换您的代码的。

要在特殊绘图语法中添加对写入 `for` 循环的支持，请添加 `buildArray(_:)` 方法。

```swift
extension DrawingBuilder {
    static func buildArray(_ components: [Drawable]) -> Drawable {
        return Line(elements: components)
    }
}
let manyStars = draw {
    Text("Stars:")
    for length in 1...3 {
        Space()
        Stars(length: length)
    }
}
```

在上面的代码中， `for` 循环创建了一个画作数组，而 `buildArray(_:)` 方法将该数组转换为 `Line` 。

有关 Swift 如何将构建器语法转换为对构建器类型方法的调用的完整列表，请参见 resultBuilder。

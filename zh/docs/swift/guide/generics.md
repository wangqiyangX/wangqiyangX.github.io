# 泛型

> 编写适用于多种类型的代码，并指定这些类型的要求。

泛型代码使您能够编写灵活、可重用的函数和类型，这些函数和类型可以与您定义的任何类型一起使用。您可以编写避免重复的代码，并以清晰、抽象的方式表达其意图。

泛型是 Swift 最强大的特性之一，Swift 标准库的大部分都是用泛型代码构建的。事实上，即使你没有意识到，你在整个语言指南中一直在使用泛型。例如，Swift 的 Array 和 Dictionary 类型都是泛型集合。你可以创建一个存储 Int 值的数组，或者一个存储 String 值的数组，或者实际上是一个可以在 Swift 中创建的任何其他类型的数组。同样，你可以创建一个字典来存储任何指定类型的值，并且对该类型没有限制。

## [泛型解决的问题](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#The-Problem-That-Generics-Solve)

这是一个名为 `swapTwoInts(_:_:)` 的标准非泛型函数，它交换两个 `Int` 值：

```swift
func swapTwoInts(_ a: inout Int, _ b: inout Int) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```

该函数使用 `in-out` 参数来交换 `a` 和 `b` 的值，如 `in-out` 参数中所述。

`swapTwoInts(_:_:)` 函数将 `b` 的原始值交换到 `a` 中，将 `a` 的原始值交换到 `b` 中。您可以调用此函数来交换两个 `Int` 变量的值：

```swift
var someInt = 3
var anotherInt = 107
swapTwoInts(&someInt, &anotherInt)
print("someInt is now \(someInt), and anotherInt is now \(anotherInt)")
// Prints "someInt is now 107, and anotherInt is now 3"
```

`swapTwoInts(_:_:)` 函数很有用，但它只能与 `Int` 值一起使用。如果您想交换两个 `String` 值或两个 `Double` 值，您必须编写更多函数，例如下面显示的 `swapTwoStrings(_:_:)` 和 `swapTwoDoubles(_:_:)` 函数：

```swift
func swapTwoStrings(_ a: inout String, _ b: inout String) {
    let temporaryA = a
    a = b
    b = temporaryA
}

func swapTwoDoubles(_ a: inout Double, _ b: inout Double) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```

您可能已经注意到 `swapTwoInts(_:_:)` 、 `swapTwoStrings(_:_:)` 和 `swapTwoDoubles(_:_:)` 函数的主体是相同的。唯一的区别是它们接受的值的类型 ( `Int` 、 `String` 和 `Double` )。

编写一个可以交换任何类型的两个值的单一函数更有用，并且灵活性更大。泛型代码使您能够编写这样的函数。(这些函数的泛型版本在下面定义。)

> 注意
>
> 在所有三个函数中， `a` 和 `b` 的类型必须相同。如果 `a` 和 `b` 不是同一类型，则无法交换它们的值。Swift 是一种类型安全的语言，不允许 (例如) 类型为 `String` 的变量和类型为 `Double` 的变量相互交换值。尝试这样做会导致编译时错误。

## [泛型函数](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Generic-Functions)

*泛型函数*可以与任何类型一起工作。以下是上述 `swapTwoInts(_:_:)` 函数的泛型版本，称为 `swapTwoValues(_:_:)` :

```swift
func swapTwoValues<T>(_ a: inout T, _ b: inout T) {
    let temporaryA = a
    a = b
    b = temporaryA
}
```

`swapTwoValues(_:_:)` 函数的主体与 `swapTwoInts(_:_:)` 函数的主体相同。然而， `swapTwoValues(_:_:)` 的第一行与 `swapTwoInts(_:_:)` 有些不同。以下是第一行的比较：

```swift
func swapTwoInts(_ a: inout Int, _ b: inout Int)
func swapTwoValues<T>(_ a: inout T, _ b: inout T)
```

该函数的泛型版本使用*占位*类型名称 (在本例中称为 `T` ) 而不是*实际*类型名称 (如 `Int` 、 `String` 或 `Double` )。占位符类型名称并未指明 `T` 必须是什么，但确实说明 `a` 和 `b` 必须是相同类型 `T` ，无论 `T` 代表什么。每次调用 `swapTwoValues(_:_:)` 函数时，使用的实际类型由 `T` 决定。

泛型函数和非泛型函数之间的另一个区别是，泛型函数的名称 ( `swapTwoValues(_:_:)` ) 后面跟着占位符类型名称 ( `T` ) ，并用尖括号 ( `<T>` ) 括起来。括号告诉 Swift ， `T` 是 `swapTwoValues(_:_:)` 函数定义中的占位符类型名称。因为 `T` 是一个占位符，Swift 不会查找名为 `T` 的实际类型。

`swapTwoValues(_:_:)` 函数现在可以像 `swapTwoInts` 一样调用，唯一的区别是它可以接收*任何*类型的两个值，只要这两个值的类型相同。每次调用 `swapTwoValues(_:_:)` 时，T 的类型会根据传递给函数的值的类型进行推断。

在下面的两个示例中， `T` 分别推断为 `Int` 和 `String` ：

```swift
var someInt = 3
var anotherInt = 107
swapTwoValues(&someInt, &anotherInt)
// someInt is now 107, and anotherInt is now 3


var someString = "hello"
var anotherString = "world"
swapTwoValues(&someString, &anotherString)
// someString is now "world", and anotherString is now "hello"
```

> 注意
>
> 上面定义的 `swapTwoValues(_:_:)` 函数受到一个名为 `swap` 的泛型函数的启发，该函数是 Swift 标准库的一部分，并会自动提供给您在应用中使用。如果您需要在自己的代码中实现 `swapTwoValues(_:_:)` 函数的行为，可以使用 Swift 现有的 `swap(_:_:)` 函数，而不是提供自己的实现。

## [类型参数](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Type-Parameters)

在上述 `swapTwoValues(_:_:)` 示例中，*占位*类型 `T` 是类型参数的一个例子。类型参数指定并命名一个*占位*类型，并在函数名称后面紧接着写出，位于一对匹配的尖括号之间 (例如 `<T>` )。

一旦指定了类型参数，您可以用它来定义函数参数的类型 (例如 `swapTwoValues(_:_:)` 函数的参数 `a` 和 `b`)，或作为函数的返回类型，或作为函数主体内的类型注释。在每种情况下，每当调用函数时，类型参数都将被替换为实际类型。(在上面的 `swapTwoValues(_:_:)` 示例中， `T` 在第一次调用函数时被替换为 `Int` ，在第二次调用时被替换为 `String` 。)

您可以通过在尖括号内写多个类型参数名称，并用逗号分隔，来提供多个类型参数。

## [命名类型参数](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Naming-Type-Parameters)

在大多数情况下，类型参数具有描述性的名称，例如在 `Dictionary<Key, Value>` 中的 `Key` 和 `Value`，以及在 `Array<Element>` 中的 `Element`，这告诉读者类型参数与其使用的泛型类型或函数之间的关系。然而，当它们之间没有有意义的关系时，传统上使用单个字母命名，例如 T、U 和 V，例如在上面的 `swapTwoValues(_:_:)` 函数中的 T。

> 注意
>
> 始终使用大驼峰命名法为类型参数命名 (例如 `T` 和 `MyTypeParameter` )，以表明它们是占位类型，而不是值。

## [泛型类型](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Generic-Types)

除了泛型函数，Swift 还允许您定义自己的泛型类型。这些是可以与任何类型一起使用的自定义类、结构和枚举，类似于 `Array` 和 `Dictionary` 。

本节向您展示如何编写一个名为 `Stack` 的泛型集合类型。栈是一个有序值集合，类似于数组，但其操作集比 Swift 的 `Array` 类型更受限制。数组允许在数组的任何位置插入和删除新项。然而，栈只允许将新项附加到集合的末尾 (称为将新值*推入*栈中)。同样，栈只允许从集合的末尾删除项 (称为从栈中*弹出*值)。

> 注意
>
> 栈的概念被 `UINavigationController` 类用于建模其导航层次结构中的视图控制器。您可以调用 `UINavigationController` 类的 `pushViewController(_:animated:)` 方法将视图控制器添加 (或推入) 到导航栈中，并使用其 `popViewControllerAnimated(_:)` 方法从导航栈中移除 (或弹出) 视图控制器。栈是一种有用的集合模型，适用于您需要严格的 “后进先出” 方法来管理集合的情况。

下图显示了栈的推入和弹出行为：

![stackPushPop](https://docs.swift.org/swift-book/images/org.swift.tspl/stackPushPop@2x.png){.light-only}
![stackPushPop\~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/stackPushPop~dark@2x.png){.dark-only}

1. 当前栈上有三个值。
2. 第四个值被推入栈顶。
3. 栈现在有四个值，最新的值在顶部。
4. 栈顶的项目被弹出。
5. 弹出一个值后，栈再次持有三个值。

以下是如何编写非泛型版本的栈，在这种情况下是一个 `Int` 值的栈：

```swift
struct IntStack {
    var items: [Int] = []
    mutating func push(_ item: Int) {
        items.append(item)
    }
    mutating func pop() -> Int {
        return items.removeLast()
    }
}
```

该结构使用一个名为 items 的 Array 属性来存储栈中的值。Stack 提供了两个方法，push 和 pop，用于将值推入和弹出栈。这些方法被标记为 `mutating`，因为它们需要修改（或 mutate）结构的 items 数组。

上面显示的 `IntStack` 类型只能与 `Int` 值一起使用。然而，定义一个泛型的 `Stack` 结构来管理任何类型的值的堆栈会更有用。

这是相同代码的泛型版本：

```swift
struct Stack<Element> {
    var items: [Element] = []
    mutating func push(_ item: Element) {
        items.append(item)
    }
    mutating func pop() -> Element {
        return items.removeLast()
    }
}
```

注意泛型版本的 `Stack` 在本质上与非泛型版本相同，但使用了一个名为 `Element` 的类型参数，而不是实际的 `Int` 类型。这个类型参数以一对尖括号 ( `<Element>` ) 的形式书写，紧跟在结构的名称后面。

`Element` 定义了一个占位名称，以便稍后提供类型。这个未来的类型可以在结构的定义中任何地方称为 `Element` 。在这种情况下， `Element` 被用作三个地方的占位符：

- 要创建一个名为 `items` 的属性，该属性初始化为一个类型为 `Element` 的空值数组
- 要指定 `push(_:)` 方法具有一个名为 `item` 的单个参数，该参数必须为 `Element` 类型
- 指定由 `pop()` 方法返回的值将是 `Element` 类型的值

因为它是一个泛型类型， `Stack` 可以像 `Array` 和 `Dictionary` 一样用于创建任意有效类型的堆栈。

您可以通过在尖括号内写入要存储在堆栈中的类型来创建新的 `Stack` 实例。例如，要创建一个新的字符串堆栈，您可以写 `Stack<String>()` ：

```swift
var stackOfStrings = Stack<String>()
stackOfStrings.push("uno")
stackOfStrings.push("dos")
stackOfStrings.push("tres")
stackOfStrings.push("cuatro")
// the stack now contains 4 strings
```

这里是推送这四个值到堆栈后 `stackOfStrings` 的样子：

![stackPushedFourStrings](https://docs.swift.org/swift-book/images/org.swift.tspl/stackPushedFourStrings@2x.png){.light-only}
![stackPushedFourStrings\~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/stackPushedFourStrings~dark@2x.png){.dark-only}

从堆栈中弹出一个值会移除并返回顶部值， `"cuatro"` :

```swift
let fromTheTop = stackOfStrings.pop()
// fromTheTop 等于 “cuatro”，栈中现在包含 3 个字符串。
```

弹出顶部值后，堆栈的样子如下：

![stackPoppedOneString](https://docs.swift.org/swift-book/images/org.swift.tspl/stackPoppedOneString@2x.png){.light-only}
![stackPoppedOneString\~dark](https://docs.swift.org/swift-book/images/org.swift.tspl/stackPoppedOneString~dark@2x.png){.dark-only}

## [扩展泛型类型](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Extending-a-Generic-Type)

当您扩展一个泛型类型时，您不需要在扩展的定义中提供类型参数列表。相反，原始类型定义中的类型参数列表在扩展的主体内可用，并且使用原始类型参数名称来引用原始定义中的类型参数。

以下示例扩展了泛型 `Stack` 类型，以添加一个名为 `topItem` 的只读计算属性，该属性返回栈顶的项目，而不从栈中弹出它：

```swift
extension Stack {
    var topItem: Element? {
        return items.isEmpty ? nil : items[items.count - 1]
    }
}
```

`topItem` 属性返回类型为 `Element` 的可选值。如果栈为空， `topItem` 返回 `nil` ；如果栈不为空， `topItem` 返回 `items` 数组中的最后一个项目。

注意，这个扩展并没有定义类型参数列表。相反， `Stack` 类型的现有类型参数名称 `Element` 在扩展中被使用，以指示 `topItem` 计算属性的可选类型。

`topItem` 计算属性现在可以与任何 `Stack` 实例一起使用，以访问和查询其顶部项目，而无需移除它。

```swift
if let topItem = stackOfStrings.topItem {
    print("The top item on the stack is \(topItem).")
}
// Prints "The top item on the stack is tres."
```

泛型类型的扩展也可以包括扩展类型的实例必须满足的要求，以便获得新的功能，如下文中的带有泛型 Where 子句的扩展所讨论的。

## [类型约束](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Type-Constraints)

`swapTwoValues(_:_:)` 函数和 `Stack` 类型可以与任何类型一起使用。然而，有时强制对可以与泛型函数和泛型类型一起使用的类型施加某些类型约束是有用的。类型约束指定类型参数必须继承自特定类，或符合特定协议或协议组合。

例如，Swift 的 `Dictionary` 类型对可以作为字典键使用的类型施加了限制。如在字典中所述，字典键的类型必须是可哈希的。这就是说，它必须提供一种方法使自身唯一可表示。 `Dictionary` 需要其键是可哈希的，以便它可以检查是否已经为特定键包含一个值。如果没有这个要求， `Dictionary` 就无法判断是否应该插入或替换特定键的值，也无法找到已在字典中的给定键的值。

这一要求通过对 `Dictionary` 的键类型施加类型约束来强制执行，该约束规定键类型必须遵循 Swift 标准库中定义的 `Hashable` 协议。Swift 的所有基本类型 (例如 `String` 、 `Int` 、 `Double` 和 `Bool` ) 默认都是可哈希的。如需有关使您自定义类型遵循 `Hashable` 协议的信息，请参阅 遵循 Hashable 协议。

您可以在创建自定义泛型类型时定义自己的类型约束，这些约束提供了泛型编程的大部分能力。像 `Hashable` 这样的抽象概念根据其概念特征而不是其具体类型来表征类型。

### [类型约束语法](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Type-Constraint-Syntax)

您通过在类型参数名称后放置单个类或协议约束 (用冒号分隔) 来编写类型约束，作为类型参数列表的一部分。以下是泛型函数类型约束的基本语法 (尽管泛型类型的语法是相同的)：

```swift
func someFunction<T: SomeClass, U: SomeProtocol>(someT: T, someU: U) {
    // 函数体
}
```

上述假设函数有两个类型参数。第一个类型参数 `T` 有一个类型约束，要求 `T` 是 `SomeClass` 的子类。第二个类型参数 `U` 有一个类型约束，要求 `U` 符合协议 `SomeProtocol` 。

### [类型约束的实际应用](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Type-Constraints-in-Action)

这是一个名为 `findIndex(ofString:in:)` 的非泛型函数，它接收一个 `String` 值用于查找，以及一个包含要查找值的 `String` 数组。 `findIndex(ofString:in:)` 函数返回一个可选的 `Int` 值，如果找到匹配的字符串，它将是数组中第一个匹配字符串的索引，如果找不到该字符串，则返回 `nil` ：

```swift
func findIndex(ofString valueToFind: String, in array: [String]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```

`findIndex(ofString:in:)` 函数可用于在字符串数组中查找字符串值：

```swift
let strings = ["cat", "dog", "llama", "parakeet", "terrapin"]
if let foundIndex = findIndex(ofString: "llama", in: strings) {
    print("The index of llama is \(foundIndex)")
}
// 打印 "The index of llama is 2"
```

在数组中查找值索引的原理不仅对字符串有用。您可以通过将字符串的任何提及替换为某种类型的值 `T` 来编写相同的功能作为泛型函数。

这里是您可能期望的一个泛型版本 `findIndex(ofString:in:)` ，称为 `findIndex(of:in:)` ，的写法。请注意，该函数的返回类型仍然是 `Int?` ，因为该函数返回的是一个可选的索引号，而不是来自数组的可选值。不过请注意 —— 这个函数无法编译，原因在示例之后解释：

```swift
func findIndex<T>(of valueToFind: T, in array:[T]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```

这个函数如上所写无法编译。问题出在等式检查 “ `if value == valueToFind` ” 上。并不是所有类型都可以使用等于运算符 ( `==` ) 进行比较。如果您创建自己的类或结构来表示复杂的数据模型，例如，那么对于该类或结构的 “等于” 的含义并不是 Swift 可以为您猜测的。因此，无法保证这段代码对每种可能的类型 `T` 都能正常工作，当您尝试编译代码时会报告适当的错误。

然而，并非一切都失去了希望。Swift 标准库定义了一个名为 `Equatable` 的协议，该协议要求任何符合该协议的类型实现等于运算符 (==) 和不等于运算符 (!=) 以比较该类型的任意两个值。所有 Swift 的标准类型自动支持 `Equatable` 协议。

任何类型为 `Equatable` 的值都可以安全地与 `findIndex(of:in:)` 函数一起使用，因为它保证支持相等运算符。为了表达这一事实，当您定义函数时，可以在类型参数的定义中写出一个 `Equatable` 的类型约束：

```swift
func findIndex<T: Equatable>(of valueToFind: T, in array:[T]) -> Int? {
    for (index, value) in array.enumerated() {
        if value == valueToFind {
            return index
        }
    }
    return nil
}
```

对于 `findIndex(of:in:)` 的单一类型参数写作 `T: Equatable` ，这意味着 “任何符合 `Equatable` 协议的类型 `T` 。”

`findIndex(of:in:)` 函数现在可以成功编译，并且可以与任何类型的 `Equatable` 一起使用，例如 `Double` 或 `String` :

```swift
let doubleIndex = findIndex(of: 9.3, in: [3.14159, 0.1, 0.25])
// doubleIndex is an optional Int with no value, because 9.3 isn't in the array
let stringIndex = findIndex(of: "Andrea", in: ["Mike", "Malcolm", "Andrea"])
// stringIndex is an optional Int containing a value of 2
```

## [关联类型](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Associated-Types)

在定义协议时，有时声明一个或多个关联类型作为协议定义的一部分是很有用的。关联类型为作为协议一部分使用的类型提供了一个占位名称。实际用于该关联类型的类型在协议被采纳之前并未指定。关联类型使用 `associatedtype` 关键字来指定。

### [关联类型的实际应用](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Associated-Types-in-Action)

这是一个名为 `Container` 的协议的示例，它声明了一个名为 `Item` 的关联类型：

```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```

`Container` 协议定义了任何容器必须提供的三个必需功能：

- 必须能够使用 `append(_:)` 方法向容器添加新项。
- 必须能够通过一个 `count` 属性访问容器中项目的计数，该属性返回一个 `Int` 值。
- 必须能够使用一个带有 `Int` 索引值的下标来检索容器中的每个项目。

该协议并未指定容器中的项目应如何存储或允许的类型。该协议仅指定任何类型必须提供的三项功能，以便被视为 `Container`。符合要求的类型可以提供额外的功能，只要满足这三项要求。

任何符合 `Container` 协议的类型必须能够指定其存储的值的类型。具体而言，它必须确保只有正确类型的项目被添加到容器中，并且必须明确返回其下标的项目的类型。

为了定义这些要求， `Container` 协议需要一个方法来引用容器将持有的元素类型，而不必知道特定容器的那种类型。 `Container` 协议需要指定传递给 `append(_:)` 方法的任何值必须与容器的元素类型相同，并且容器的下标返回的值将与容器的元素类型相同。

要实现这一点， `Container` 协议声明了一个名为 `Item` 的相关类型，写作 `associatedtype Item` 。该协议并未定义 `Item` 是什么 —— 该信息留给任何符合该协议的类型提供。不过， `Item` 别名提供了一种引用 `Container` 中项目类型的方法，并定义一个可以与 `append(_:)` 方法和下标一起使用的类型，以确保任何 `Container` 的预期行为得到执行。

这是上述泛型类型中的非泛型 `IntStack` 类型的一个版本，已调整为符合 `Container` 协议：

```swift
struct IntStack: Container {
    // 原实现
    var items: [Int] = []
    mutating func push(_ item: Int) {
        items.append(item)
    }
    mutating func pop() -> Int {
        return items.removeLast()
    }
    // 遵循 Container 协议
    typealias Item = Int
    mutating func append(_ item: Int) {
        self.push(item)
    }
    var count: Int {
        return items.count
    }
    subscript(i: Int) -> Int {
        return items[i]
    }
}
```

`IntStack` 类型实现了 `Container` 协议的所有三个要求，并在每种情况下包装了 `IntStack` 类型现有功能的一部分以满足这些要求。

此外， `IntStack` 指定对于 `Container` 的这个实现，适当的 `Item` 使用的是一种 `Int` 的类型。 `typealias Item = Int` 的定义将 `Item` 的抽象类型转变为该 `Container` 协议实现的具体类型 `Int` 。

得益于 Swift 的类型推断，您实际上不需要在 IntStack 的定义中声明一个具体的 Item 为 Int。因为 IntStack 符合 Container 协议的所有要求，Swift 可以通过查看 `append(_:)` 方法的 item 参数的类型和下标的返回类型来推断出适当的 Item。实际上，如果您从上面的代码中删除 `typealias Item = Int` 这一行，所有内容仍然可以正常工作，因为很明显应该使用什么类型作为 Item。

您还可以使泛型 `Stack` 类型符合 `Container` 协议：

```swift
struct Stack<Element>: Container {
    // Stack<Element> 原实现
    var items: [Element] = []
    mutating func push(_ item: Element) {
        items.append(item)
    }
    mutating func pop() -> Element {
        return items.removeLast()
    }
    // 遵循 Container 协议
    mutating func append(_ item: Element) {
        self.push(item)
    }
    var count: Int {
        return items.count
    }
    subscript(i: Int) -> Element {
        return items[i]
    }
}
```

这次，类型参数 `Element` 被用作 `append(_:)` 方法的 `item` 参数的类型和下标的返回类型。因此，Swift 可以推断出 `Element` 是这个特定容器的 `Item` 的合适类型。

> bookmark

### [扩展现有类型以指定关联类型](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Extending-an-Existing-Type-to-Specify-an-Associated-Type)

您可以扩展现有类型以添加对协议的符合性，如在通过扩展添加协议符合性中所述。这包括具有关联类型的协议。

Swift 的 `Array` 类型已经提供了一个 `append(_:)` 方法，一个 `count` 属性，以及一个带有 `Int` 索引的下标来检索其元素。这三种能力符合 `Container` 协议的要求。这意味着您可以扩展 `Array` 以符合 `Container` 协议，只需声明 `Array` 采用该协议即可。您可以通过一个空扩展来实现，如在通过扩展声明协议采用中所述：

```swift
extension Array: Container {}
```

Array 的现有 `append(_:)` 方法和下标使 Swift 能够推断出适合 `Item` 的类型，就像上面的泛型 `Stack` 类型一样。在定义此扩展后，您可以将任何 `Array` 用作 `Container` 。

### [为关联类型添加约束](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Adding-Constraints-to-an-Associated-Type)

您可以在协议的相关类型中添加类型约束，以要求符合的类型满足这些约束。例如，以下代码定义了一个版本的 `Container` ，要求容器中的项目是可比较的。

```swift
protocol Container {
    associatedtype Item: Equatable
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }
}
```

为了符合这一版本的 `Container` ，容器的 `Item` 类型必须符合 `Equatable` 协议。

### [在其关联类型约束中使用协议](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Using-a-Protocol-in-Its-Associated-Types-Constraints)

一个协议可以作为其自身要求的一部分出现。例如，这里有一个细化了 `Container` 协议的协议，增加了 `suffix(_:)` 方法的要求。 `suffix(_:)` 方法从容器的末尾返回一定数量的元素，将它们存储在 `Suffix` 类型的实例中。

```swift
protocol SuffixableContainer: Container {
    associatedtype Suffix: SuffixableContainer where Suffix.Item == Item
    func suffix(_ size: Int) -> Suffix
}
```

在这个协议中， `Suffix` 是一个关联类型，类似于上面 `Container` 示例中的 `Item` 类型。 `Suffix` 有两个约束：它必须符合 `SuffixableContainer` 协议 (当前正在定义的协议)，并且它的 `Item` 类型必须与容器的 `Item` 类型相同。对 `Item` 的约束是一个泛型 `where` 子句，详细讨论见下文的带泛型 Where 子句的关联类型。

这是对上面泛型类型中 `Stack` 类型的扩展，增加了对 `SuffixableContainer` 协议的符合性：

```swift
extension Stack: SuffixableContainer {
    func suffix(_ size: Int) -> Stack {
        var result = Stack()
        for index in (count-size)..<count {
            result.append(self[index])
        }
        return result
    }
    // Inferred that Suffix is Stack.
}
var stackOfInts = Stack<Int>()
stackOfInts.append(10)
stackOfInts.append(20)
stackOfInts.append(30)
let suffix = stackOfInts.suffix(2)
// suffix contains 20 and 30
```

在上面的示例中， `Suffix` 关联类型对于 `Stack` 也是 `Stack` ，因此对 `Stack` 的后缀操作返回另一个 `Stack` 。或者，符合 `SuffixableContainer` 的类型可以有一个与自身不同的 `Suffix` 类型 —— 这意味着后缀操作可以返回不同的类型。例如，这里是对非泛型 `IntStack` 类型的扩展，它添加了 `SuffixableContainer` 兼容性，使用 `Stack<Int>` 作为其后缀类型，而不是 `IntStack` ：

```swift
extension IntStack: SuffixableContainer {
    func suffix(_ size: Int) -> Stack<Int> {
        var result = Stack<Int>()
        for index in (count-size)..<count {
            result.append(self[index])
        }
        return result
    }
    // Inferred that Suffix is Stack<Int>.
}
```

## [泛型 Where 子句](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Generic-Where-Clauses)

类型约束，如类型约束中所述，使您能够定义与泛型函数、下标或类型相关的类型参数的要求。

定义关联类型的要求也很有用。您可以通过定义一个泛型 where 子句来实现。一个泛型 `where` 子句使您能够要求关联类型必须符合某个协议，或者某些类型参数和关联类型必须相同。一个泛型 `where` 子句以 `where` 关键字开头，后跟关联类型的约束或类型与关联类型之间的等式关系。您在类型或函数体的开括号之前编写一个泛型 `where` 子句。

下面的示例定义了一个名为 `allItemsMatch` 的泛型函数，该函数检查两个 `Container` 实例是否包含相同顺序的相同项。如果所有项匹配，函数返回布尔值 `true` ，如果不匹配，则返回 `false` 。

要检查的两个容器不必是相同类型的容器 (尽管可以是)，但它们必须容纳相同类型的物品。这个要求通过类型约束和一个泛型的 `where` 条款的组合来表达：

```swift
func allItemsMatch<C1: Container, C2: Container>
        (_ someContainer: C1, _ anotherContainer: C2) -> Bool
        where C1.Item == C2.Item, C1.Item: Equatable {


    // Check that both containers contain the same number of items.
    if someContainer.count != anotherContainer.count {
        return false
    }


    // Check each pair of items to see if they're equivalent.
    for i in 0..<someContainer.count {
        if someContainer[i] != anotherContainer[i] {
            return false
        }
    }


    // All items match, so return true.
    return true
}
```

此函数接受两个参数，分别称为 `someContainer` 和 `anotherContainer` 。 `someContainer` 参数的类型为 `C1` ，而 `anotherContainer` 参数的类型为 `C2` 。 `C1` 和 `C2` 都是类型参数，用于在调用函数时确定的两个容器类型。

以下要求适用于函数的两个类型参数：

- `C1` 必须符合 `Container` 协议 (写作 `C1: Container` )。
- `C2` 还必须符合 `Container` 协议 (写作 `C2: Container` )。
- `C1` 的 `Item` 必须与 `C2` 的 `Item` 相同 (写作 `C1.Item == C2.Item` )。
- `C1` 的 `Item` 必须符合 `Equatable` 协议 (写作 `C1.Item: Equatable` )。

第一个和第二个要求在函数的类型参数列表中定义，第三个和第四个要求在函数的泛型 `where` 子句中定义。

这些要求意味着：

- `someContainer` 是类型 `C1` 的容器。
- `anotherContainer` 是类型 `C2` 的容器。
- `someContainer` 和 `anotherContainer` 包含相同类型的项目。
- `someContainer` 中的项目可以使用不等运算符 ( `!=` ) 检查，以查看它们是否彼此不同。

第三和第四个要求结合在一起意味着 `anotherContainer` 中的项目也可以使用 `!=` 运算符进行检查，因为它们与 `someContainer` 中的项目完全相同。

这些要求使得 `allItemsMatch(_:_:)` 函数能够比较两个容器，即使它们是不同的容器类型。

该 `allItemsMatch(_:_:)` 函数首先检查两个容器是否包含相同数量的项目。如果它们包含不同数量的项目，则无法匹配，函数返回 `false` 。

在进行此检查后，函数使用 `for` - `in` 循环和半开区间运算符 ( `..<` ) 遍历 `someContainer` 中的所有项目。对于每个项目，函数检查 `someContainer` 中的项目是否不等于 `anotherContainer` 中的相应项目。如果两个项目不相等，则两个容器不匹配，函数返回 `false` 。

如果循环在没有找到不匹配的情况下结束，则两个容器匹配，函数返回 `true` 。

以下是 `allItemsMatch(_:_:)` 函数实际运行的样子：

```swift
var stackOfStrings = Stack<String>()
stackOfStrings.push("uno")
stackOfStrings.push("dos")
stackOfStrings.push("tres")


var arrayOfStrings = ["uno", "dos", "tres"]


if allItemsMatch(stackOfStrings, arrayOfStrings) {
    print("All items match.")
} else {
    print("Not all items match.")
}
// Prints "All items match."
```

上面的示例创建了一个 `Stack` 实例来存储 `String` 值，并将三个字符串推入栈中。该示例还创建了一个 `Array` 实例，使用包含与栈中相同的三个字符串的数组字面量进行初始化。尽管栈和数组是不同类型，但它们都符合 `Container` 协议，并且都包含相同类型的值。因此，您可以将这两个容器作为参数调用 `allItemsMatch(_:_:)` 函数。在上面的示例中， `allItemsMatch(_:_:)` 函数正确报告了两个容器中的所有项目匹配。

## [带有泛型 Where 子句的扩展](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Extensions-with-a-Generic-Where-Clause)

您还可以将泛型 `where` 子句作为扩展的一部分。下面的示例扩展了前面示例中的泛型 `Stack` 结构，以添加 `isTop(_:)` 方法。

```swift
extension Stack where Element: Equatable {
    func isTop(_ item: Element) -> Bool {
        guard let topItem = items.last else {
            return false
        }
        return topItem == item
    }
}
```

这个新的 `isTop(_:)` 方法首先检查栈是否为空，然后将给定的项与栈顶项进行比较。如果没有泛型的 `where` 条款您尝试这样做，就会出现问题： `isTop(_:)` 的实现使用了 `==` 运算符，但 `Stack` 的定义并不要求其项必须是可比较的，因此使用 `==` 运算符会导致编译时错误。使用泛型的 `where` 条款可以让您向扩展中添加新的要求，从而使扩展仅在栈中的项可比较时添加 `isTop(_:)` 方法。

这是 `isTop(_:)` 方法在实际中的样子：

```swift
if stackOfStrings.isTop("tres") {
    print("Top element is tres.")
} else {
    print("Top element is something else.")
}
// Prints "Top element is tres."
```

如果您尝试在一个元素不可比较的栈上调用 `isTop(_:)` 方法，您将会得到一个编译时错误。

```swift
struct NotEquatable { }
var notEquatableStack = Stack<NotEquatable>()
let notEquatableValue = NotEquatable()
notEquatableStack.push(notEquatableValue)
notEquatableStack.isTop(notEquatableValue)  // Error
```

您可以使用泛型的 `where` 子句与协议的扩展。下面的示例扩展了之前示例中的 `Container` 协议，以添加 `startsWith(_:)` 方法。

```swift
extension Container where Item: Equatable {
    func startsWith(_ item: Item) -> Bool {
        return count >= 1 && self[0] == item
    }
}
```

`startsWith(_:)` 方法首先确保容器至少有一个项目，然后检查容器中的第一个项目是否与给定项目匹配。这个新的 `startsWith(_:)` 方法可以与任何符合 `Container` 协议的类型一起使用，包括上面使用的栈和数组，只要容器中的项目是可比较的。

```swift
if [9, 9, 9].startsWith(42) {
    print("Starts with 42.")
} else {
    print("Starts with something else.")
}
// Prints "Starts with something else."
```

上述示例中的泛型 `where` 子句要求 `Item` 遵循一个协议，但您也可以编写泛型 `where` 子句，要求 `Item` 是特定类型。例如：

```swift
extension Container where Item == Double {
    func average() -> Double {
        var sum = 0.0
        for index in 0..<count {
            sum += self[index]
        }
        return sum / Double(count)
    }
}
print([1260.0, 1200.0, 98.6, 37.0].average())
// Prints "648.9"
```

此示例为类型为 `Double` 的容器添加 `average()` 方法。它遍历容器中的项目以将它们相加，并通过容器的计数来计算平均值。它明确将计数从 `Int` 转换为 `Double` 以便能够进行浮点除法。

您可以在扩展的泛型 `where` 子句中包含多个要求，就像您可以在其他地方编写的泛型 `where` 子句一样。用逗号分隔列表中的每个要求。

## [上下文 Where 子句](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Contextual-Where-Clauses)

当您已经在泛型类型的上下文中工作时，您可以将泛型 `where` 子句作为声明的一部分编写，而该声明没有自己的泛型类型约束。例如，您可以在泛型类型的下标或泛型类型扩展中的方法上编写泛型 `where` 子句。 `Container` 结构是泛型的，下面示例中的 `where` 子句指定了必须满足哪些类型约束，以使这些新方法在容器上可用。

```swift
extension Container {
    func average() -> Double where Item == Int {
        var sum = 0.0
        for index in 0..<count {
            sum += Double(self[index])
        }
        return sum / Double(count)
    }
    func endsWith(_ item: Item) -> Bool where Item: Equatable {
        return count >= 1 && self[count-1] == item
    }
}
let numbers = [1260, 1200, 98, 37]
print(numbers.average())
// Prints "648.75"
print(numbers.endsWith(37))
// Prints "true"
```

此示例在项为整数时向 `Container` 添加一个 `average()` 方法，在项可比较时添加一个 `endsWith(_:)` 方法。两个函数都包含一个泛型 `where` 子句，该子句为来自 `Container` 原始声明的泛型 `Item` 类型参数添加类型约束。

如果您想在不使用上下文 `where` 子句的情况下编写此代码，您需要为每个泛型 `where` 子句编写两个扩展。上面的示例和下面的示例具有相同的行为。

```swift
extension Container where Item == Int {
    func average() -> Double {
        var sum = 0.0
        for index in 0..<count {
            sum += Double(self[index])
        }
        return sum / Double(count)
    }
}
extension Container where Item: Equatable {
    func endsWith(_ item: Item) -> Bool {
        return count >= 1 && self[count-1] == item
    }
}
```

在这个使用上下文 `where` 子句的示例版本中， `average()` 和 `endsWith(_:)` 的实现都在同一个扩展中，因为每个方法的泛型 `where` 子句说明了需要满足的要求以使该方法可用。将这些要求移到扩展的泛型 `where` 子句中，使这些方法在相同的情况下可用，但每个要求需要一个扩展。

## [与泛型 where 子句的关联类型](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Associated-Types-with-a-Generic-Where-Clause)

您可以在关联类型中包含一个泛型 `where` 子句。比如说，假设您想制作一个包含迭代器的 `Container` 的版本，就像 `Sequence` 协议在 Swift 标准库中使用的那样。以下是您如何编写它的：

```swift
protocol Container {
    associatedtype Item
    mutating func append(_ item: Item)
    var count: Int { get }
    subscript(i: Int) -> Item { get }


    associatedtype Iterator: IteratorProtocol where Iterator.Element == Item
    func makeIterator() -> Iterator
}
```

泛型 `where` 子句在 `Iterator` 上要求迭代器必须遍历与容器项相同项类型的元素，而不管迭代器的类型。 `makeIterator()` 函数提供对容器迭代器的访问。

对于从另一个协议继承的协议，您可以通过在协议声明中包含泛型 `where` 子句来为继承的关联类型添加约束。例如，以下代码声明了一个 `ComparableContainer` 协议，该协议要求 `Item` 遵循 `Comparable` :

```swift
protocol ComparableContainer: Container where Item: Comparable { }
```

## [泛型下标](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/generics#Generic-Subscripts)

下标可以是泛型的，并且可以包含泛型 `where` 子句。您在 `subscript` 后的尖括号内写入占位符类型名称，并在下标主体的开括号之前写入泛型 `where` 子句。例如：

```swift
extension Container {
    subscript<Indices: Sequence>(indices: Indices) -> [Item]
            where Indices.Iterator.Element == Int {
        var result: [Item] = []
        for index in indices {
            result.append(self[index])
        }
        return result
    }
}
```

此扩展到 `Container` 协议添加了一个下标，该下标接受一系列索引并返回一个包含每个给定索引处项目的数组。此泛型下标的约束如下：

- 尖括号中的泛型参数 `Indices` 必须是遵循 Swift 标准库中 `Sequence` 协议的类型。
- 下标接受一个参数 `indices` ，该参数是 `Indices` 类型的实例。
- 泛型 `where` 子句要求序列的迭代器必须遍历类型为 `Int` 的元素。这确保序列中的索引与用于容器的索引是相同类型。

综上所述，这些约束意味着传递给 `indices` 参数的值是一个整数序列。

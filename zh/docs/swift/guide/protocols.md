# 协议

> 定义符合类型必须实现的要求。

协议定义了一组适合特定任务或功能的的方法、属性和其他要求的蓝图。然后，类、结构或枚举可以采用该协议，以提供这些要求的实际实现。任何满足协议要求的类型都被称为符合该协议。

除了指定符合的类型必须实现的要求外，您还可以扩展协议以实现其中一些要求或实现符合类型可以利用的附加功能。

## [协议语法](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Protocol-Syntax)

您可以以与类、结构和枚举非常相似的方式定义协议：

```swift
protocol SomeProtocol {
    // protocol definition goes here
}
```

自定义类型通过在类型名称后放置协议名称，并用冒号分隔，将其定义为采用特定协议。可以列出多个协议，并用逗号分隔：

```swift
struct SomeStructure: FirstProtocol, AnotherProtocol {
    // structure definition goes here
}
```

如果一个类有一个超类，在任何采用的协议之前列出超类名称，然后跟上一个逗号：

```swift
class SomeClass: SomeSuperclass, FirstProtocol, AnotherProtocol {
    // class definition goes here
}
```

> 注意
>
> 因为协议是类型，所以它们的名称首字母大写（例如 `FullyNamed` 和 `RandomNumberGenerator` ）以匹配 Swift 中其他类型的名称（例如 `Int` 、 `String` 和 `Double` ）。

## [属性要求](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Property-Requirements)

协议可以要求任何符合类型提供具有特定名称和类型的实例属性或类型属性。协议并没有指定属性应该是存储属性还是计算属性——它只是指定了所需的属性名称和类型。协议还指定了每个属性是否必须是可获取的或可获取和可设置的。

如果一个协议要求属性是可获取和可设置的，则该属性要求不能由常量存储属性或只读计算属性满足。如果协议仅要求属性是可获取的，则可以通过任何类型的属性满足要求，如果这对您的代码有用，属性也可以是可设置的。

属性要求总是被声明为变量属性，以 `var` 关键字作为前缀。可获取和可设置的属性通过在其类型声明后写 `{ get set }` 来表示，而可获取属性通过写 `{ get }` 来表示。

```swift
protocol SomeProtocol {
    var mustBeSettable: Int { get set }
    var doesNotNeedToBeSettable: Int { get }
}
```

在协议中定义类型属性要求时，总是用 `static` 关键字作为前缀。尽管类型属性要求在由类实现时可以用 `class` 或 `static` 关键字作为前缀，但此规则依然适用：

```swift
protocol AnotherProtocol {
    static var someTypeProperty: Int { get set }
}
```

这是一个带有单个实例属性要求的协议示例：

```swift
protocol FullyNamed {
    var fullName: String { get }
}
```

`FullyNamed` 协议要求符合类型提供一个完全限定的名称。该协议没有指定符合类型的其他性质 — 它仅规定该类型必须能够提供自己的全名。协议说明任何 `FullyNamed` 类型必须具有一个可获取的实例属性，名称为 `fullName` ，类型为 `String` 。

这里是一个简单结构的示例，它采用并遵循 `FullyNamed` 协议：

```swift
struct Person: FullyNamed {
    var fullName: String
}
let john = Person(fullName: "John Appleseed")
// john.fullName is "John Appleseed"
```

此示例定义了一个名为 `Person` 的结构，表示特定命名的人。它声明作为定义的第一行，它采用 `FullyNamed` 协议。

每个 `Person` 的实例都有一个名为 `fullName` 的单个存储属性，类型为 `String` 。这符合 `FullyNamed` 协议的单个要求，这意味着 `Person` 正确遵循了该协议。（如果未满足协议要求，Swift 在编译时会报告错误。）

这里是一个更复杂的类，同样采用并遵循 `FullyNamed` 协议：

```swift
class Starship: FullyNamed {
    var prefix: String?
    var name: String
    init(name: String, prefix: String? = nil) {
        self.name = name
        self.prefix = prefix
    }
    var fullName: String {
        return (prefix != nil ? prefix! + " " : "") + name
    }
}
var ncc1701 = Starship(name: "Enterprise", prefix: "USS")
// ncc1701.fullName is "USS Enterprise"
```

该类实现了 `fullName` 属性要求，作为星舰的一个计算只读属性。每个 `Starship` 类实例存储一个必需的 `name` 和一个可选的 `prefix` 。 `fullName` 属性如果存在，将使用 `prefix` 值，并将其添加到 `name` 的开头，以创建星舰的完整名称。

## [方法要求](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Method-Requirements)

协议可以要求符合类型实现特定的实例方法和类型方法。这些方法以与普通实例和类型方法完全相同的方式写入协议的定义中，但不包括大括号或方法体。可变参数被允许，遵循与普通方法相同的规则。然而，协议定义中的方法参数不能指定默认值。

与类型属性要求一样，当在协议中定义类型方法要求时，您始终使用 `static` 关键字作为前缀。尽管当类实现时，类型方法要求是以 `class` 或 `static` 关键字作为前缀，这一点依然成立：

```swift
protocol SomeProtocol {
    static func someTypeMethod()
}
```

以下示例定义了一个具有单个实例方法要求的协议：

```swift
protocol RandomNumberGenerator {
    func random() -> Double
}
```

这个协议 `RandomNumberGenerator` 要求任何符合类型都有一个实例方法，名为 `random` ，每当被调用时返回一个 `Double` 值。虽然它没有作为协议的一部分被指定，但假定这个值将是一个从 `0.0` 到（但不包括） `1.0` 的数字。

`RandomNumberGenerator` 协议不对每个随机数的生成方式做出任何假设 - 它仅要求生成器提供一种标准方法来生成新的随机数。

这是一个实现了 `RandomNumberGenerator` 协议的类。这个类实现了一个被称为线性同余生成器的伪随机数生成算法：

```swift
class LinearCongruentialGenerator: RandomNumberGenerator {
    var lastRandom = 42.0
    let m = 139968.0
    let a = 3877.0
    let c = 29573.0
    func random() -> Double {
        lastRandom = ((lastRandom * a + c)
            .truncatingRemainder(dividingBy:m))
        return lastRandom / m
    }
}
let generator = LinearCongruentialGenerator()
print("Here's a random number: \(generator.random())")
// Prints "Here's a random number: 0.3746499199817101"
print("And another one: \(generator.random())")
// Prints "And another one: 0.729023776863283"
```

## [变异方法要求](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Mutating-Method-Requirements)

有时，方法需要修改（或变更）它所属的实例。对于值类型（即结构和枚举）上的实例方法，您需要在方法的 `func` 关键字之前放置 `mutating` 关键字，以指示该方法被允许修改它所属的实例及该实例的任何属性。此过程在《从实例方法中修改值类型》中进行了描述。

如果您定义了一个协议实例方法的要求，旨在修改任何采用该协议的类型的实例，请在协议定义中使用 `mutating` 关键字标记该方法。这使得结构体和枚举可以采用该协议并满足该方法的要求。

> 注意
>
> 如果将协议实例方法要求标记为 `mutating` ，则在为类编写该方法的实现时不需要写 `mutating` 关键字。 `mutating` 关键字仅由结构体和枚举使用。

下面的例子定义了一个名为 `Togglable` 的协议，它定义了一个名为 `toggle` 的单例方法要求。正如其名称所示， `toggle()` 方法旨在切换或反转任何符合类型的状态，通常通过修改该类型的一个属性。

`toggle()` 方法在 `Togglable` 协议定义中使用 `mutating` 关键字标记，以指示在调用该方法时，期望该方法更改符合实例的状态：

```swift
protocol Togglable {
    mutating func toggle()
}
```

如果您为某个结构体或枚举实现了 `Togglable` 协议，那么该结构体或枚举可以通过提供一个实现了 `toggle()` 方法的方式来符合该协议，并且该方法也标记为 `mutating` 。

下面的示例定义了一个名为 `OnOffSwitch` 的枚举。该枚举在两个状态之间切换，状态由枚举案例 `on` 和 `off` 表示。该枚举的 `toggle` 实现标记为 `mutating` ，以符合 `Togglable` 协议的要求：

```swift
enum OnOffSwitch: Togglable {
    case off, on
    mutating func toggle() {
        switch self {
        case .off:
            self = .on
        case .on:
            self = .off
        }
    }
}
var lightSwitch = OnOffSwitch.off
lightSwitch.toggle()
// lightSwitch is now equal to .on
```

## [初始化器要求](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Initializer-Requirements)

协议可以要求符合类型实现特定的初始化器。您可以像定义普通初始化器一样在协议的定义中编写这些初始化器，但不需要大括号或初始化器主体：

```swift
protocol SomeProtocol {
    init(someParameter: Int)
}
```

### [协议初始化器要求的类实现](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Class-Implementations-of-Protocol-Initializer-Requirements)

您可以在符合的类上实现协议初始化器要求，作为指定初始化器或便利初始化器。在这两种情况下，您必须使用 `required` 修饰符标记初始化器实现：

```swift
class SomeClass: SomeProtocol {
    required init(someParameter: Int) {
        // initializer implementation goes here
    }
}
```

使用 `required` 修饰符确保您在符合类的所有子类上提供初始化器要求的显式或继承实现，以便它们也符合该协议。

有关必需初始化器的更多信息，请参见 必需初始化器。

> 注意
>
> 您不需要在标记为 `final` 修饰符的类上使用 `required` 修饰符标记协议初始化器的实现，因为最终类无法被子类化。有关 `final` 修饰符的更多信息，请参见防止覆盖。

如果子类重写了超类的指定初始化器，并且还实现了协议的匹配初始化器要求，请使用 `required` 和 `override` 修饰符标记初始化器实现：

```swift
protocol SomeProtocol {
    init()
}


class SomeSuperClass {
    init() {
        // initializer implementation goes here
    }
}


class SomeSubClass: SomeSuperClass, SomeProtocol {
    // "required" from SomeProtocol conformance; "override" from SomeSuperClass
    required override init() {
        // initializer implementation goes here
    }
}
```

### [可失败的初始化器要求](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Failable-Initializer-Requirements)

协议可以为符合类型定义可失败的初始化器要求，如可失败初始化器中所定义的。

可失败的初始化器要求可以通过符合类型上的可失败或非可失败初始化器来满足。非可失败的初始化器要求可以通过非可失败初始化器或隐式解包的可失败初始化器来满足。

## [协议作为类型](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Protocols-as-Types)

协议实际上并不实现任何功能。尽管如此，您可以在代码中将协议用作类型。

将协议作为类型使用的最常见方法是将协议用作泛型约束。带有泛型约束的代码可以与符合该协议的任何类型一起工作，具体类型由使用该 API 的代码选择。例如，当您调用一个接受参数的函数且该参数的类型是泛型时，调用者选择该类型。

使用不透明类型的代码与符合协议的某种类型一起工作。底层类型在编译时已知，API 实现选择该类型，但该类型的身份对 API 的客户端是隐藏的。使用不透明类型可以防止 API 的实现细节通过抽象层泄漏——例如，通过隐藏函数的具体返回类型，仅保证该值符合给定协议。

使用盒状协议类型的代码可以与任何在运行时选择的符合该协议的类型一起工作。为了支持这种运行时灵活性，Swift 在必要时添加了一个间接级别 — 被称为盒子，这会带来性能成本。由于这种灵活性，Swift 在编译时无法知道底层类型，这意味着您只能访问协议要求的成员。访问底层类型的任何其他 API 需要在运行时进行转换。

有关将协议用作泛型约束的信息，请参见泛型。有关不透明类型和盒状协议类型的信息，请参见不透明和盒状协议类型。

## [委托](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Delegation)

委托是一种设计模式，它使一个类或结构能够将其部分责任转交（或委托）给另一种类型的实例。该设计模式通过定义一个封装了被委托责任的协议来实现，以确保符合该协议的类型（称为委托）能够提供已委托的功能。委托可以用于响应特定的操作，或从外部源检索数据，而无需了解该源的底层类型。

下面的示例定义了一个骰子游戏和一个嵌套协议，用于跟踪游戏进展的委托：

```swift
class DiceGame {
    let sides: Int
    let generator = LinearCongruentialGenerator()
    weak var delegate: Delegate?


    init(sides: Int) {
        self.sides = sides
    }


    func roll() -> Int {
        return Int(generator.random() * Double(sides)) + 1
    }


    func play(rounds: Int) {
        delegate?.gameDidStart(self)
        for round in 1...rounds {
            let player1 = roll()
            let player2 = roll()
            if player1 == player2 {
                delegate?.game(self, didEndRound: round, winner: nil)
            } else if player1 > player2 {
                delegate?.game(self, didEndRound: round, winner: 1)
            } else {
                delegate?.game(self, didEndRound: round, winner: 2)
            }
        }
        delegate?.gameDidEnd(self)
    }


    protocol Delegate: AnyObject {
        func gameDidStart(_ game: DiceGame)
        func game(_ game: DiceGame, didEndRound round: Int, winner: Int?)
        func gameDidEnd(_ game: DiceGame)
    }
}
```

`DiceGame` 类实现了一个游戏，每个玩家轮流掷骰子，掷出最高点数的玩家赢得这一轮。它使用了本章前面示例中的线性同余生成器，来生成掷骰子的随机数字。

`DiceGame.Delegate` 协议可以被采用来跟踪掷骰子游戏的进度。因为 `DiceGame.Delegate` 协议总是在掷骰子游戏的上下文中使用，所以它嵌套在 `DiceGame` 类内。协议可以嵌套在类型声明中，如结构体和类，只要外部声明不是泛型。有关嵌套类型的信息，请参见嵌套类型。

为了防止强引用循环，委托被声明为弱引用。有关弱引用的信息，请参见类实例之间的强引用循环。将协议标记为仅限类使得 `DiceGame` 类可以声明其委托必须使用弱引用。仅限类的协议通过继承 `AnyObject` 来标记，如在仅限类的协议中讨论的那样。

`DiceGame.Delegate` 提供了三种跟踪游戏进度的方法。这三种方法被纳入了上面 `play(rounds:)` 方法中的游戏逻辑。 `DiceGame` 类在新游戏开始、新回合开始或游戏结束时调用其代理方法。

因为 `delegate` 属性是一个可选的 `DiceGame.Delegate` ，所以 `play(rounds:)` 方法在每次调用委托的方法时都使用可选链，如在可选链中讨论的那样。如果 `delegate` 属性为 nil，这些委托调用将被忽略。如果 `delegate` 属性非 nil，则调用委托方法，并将 `DiceGame` 实例作为参数传递。

这个下一个示例展示了一个名为 `DiceGameTracker` 的类，它采用了 `DiceGame.Delegate` 协议：

```swift
class DiceGameTracker: DiceGame.Delegate {
    var playerScore1 = 0
    var playerScore2 = 0
    func gameDidStart(_ game: DiceGame) {
        print("Started a new game")
        playerScore1 = 0
        playerScore2 = 0
    }
    func game(_ game: DiceGame, didEndRound round: Int, winner: Int?) {
        switch winner {
            case 1:
                playerScore1 += 1
                print("Player 1 won round \(round)")
            case 2: playerScore2 += 1
                print("Player 2 won round \(round)")
            default:
                print("The round was a draw")
        }
    }
    func gameDidEnd(_ game: DiceGame) {
        if playerScore1 == playerScore2 {
            print("The game ended in a draw.")
        } else if playerScore1 > playerScore2 {
            print("Player 1 won!")
        } else {
            print("Player 2 won!")
        }
    }
}
```

`DiceGameTracker` 类实现了 `DiceGame.Delegate` 协议所需的所有三个方法。它使用这些方法在新游戏开始时将两个玩家的分数清零，在每轮结束时更新他们的分数，并在游戏结束时宣布获胜者。

这里是 `DiceGame` 和 `DiceGameTracker` 在实际中的表现：

```swift
let tracker = DiceGameTracker()
let game = DiceGame(sides: 6)
game.delegate = tracker
game.play(rounds: 3)
// Started a new game
// Player 2 won round 1
// Player 2 won round 2
// Player 1 won round 3
// Player 2 won!
```

## [通过扩展添加协议符合性](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Adding-Protocol-Conformance-with-an-Extension)

您可以扩展现有类型以采用并符合新协议，即使您无法访问现有类型的源代码。扩展可以向现有类型添加新的属性、方法和下标，因此能够添加协议可能要求的任何要求。有关扩展的更多信息，请参见扩展。

> 注意
>
> 当在扩展中将该符合性添加到实例的类型时，类型的现有实例会自动采用并符合该协议。

例如，这个协议，称为 `TextRepresentable` ，可以由任何一种能够以文本形式表示的类型实现。这可能是对其自身的描述，或者是其当前状态的文本版本：

```swift
protocol TextRepresentable {
    var textualDescription: String { get }
}
```

`Dice` 类可以扩展以采纳并符合 `TextRepresentable` ：

```swift
extension Dice: TextRepresentable {
    var textualDescription: String {
        return "A \(sides)-sided dice"
    }
}
```

这个扩展以完全相同的方式采纳新的协议，就像 `Dice` 在其原始实现中提供它一样。协议名称在类型名称之后提供，用冒号分隔，协议的所有要求的实现提供在扩展的花括号内。

任何 `Dice` 实例现在可以被视为 `TextRepresentable` :

```swift
let d12 = Dice(sides: 12, generator: LinearCongruentialGenerator())
print(d12.textualDescription)
// Prints "A 12-sided dice"
```

同样， `SnakesAndLadders` 游戏类可以扩展以采用并符合 `TextRepresentable` 协议：

```swift
extension SnakesAndLadders: TextRepresentable {
    var textualDescription: String {
        return "A game of Snakes and Ladders with \(finalSquare) squares"
    }
}
print(game.textualDescription)
// Prints "A game of Snakes and Ladders with 25 squares"
```

### [条件符合协议](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Conditionally-Conforming-to-a-Protocol)

一个泛型类型可能只能在某些条件下满足协议的要求，例如当该类型的泛型参数符合该协议时。您可以通过在扩展类型时列出约束，使泛型类型条件符合协议。在您采用的协议名称后写下这些约束，通过编写泛型 `where` 子句。有关泛型 `where` 子句的更多信息，请参见泛型 Where 子句。

以下扩展使得 `Array` 实例在存储符合 `TextRepresentable` 类型的元素时遵循 `TextRepresentable` 协议。

```swift
extension Array: TextRepresentable where Element: TextRepresentable {
    var textualDescription: String {
        let itemsAsText = self.map { $0.textualDescription }
        return "[" + itemsAsText.joined(separator: ", ") + "]"
    }
}
let myDice = [d6, d12]
print(myDice.textualDescription)
// Prints "[A 6-sided dice, A 12-sided dice]"
```

### [使用扩展声明协议采用](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Declaring-Protocol-Adoption-with-an-Extension)

如果一个类型已经符合协议的所有要求，但尚未声明其采用该协议，您可以通过一个空扩展使其采纳该协议：

```swift
struct Hamster {
    var name: String
    var textualDescription: String {
        return "A hamster named \(name)"
    }
}
extension Hamster: TextRepresentable {}
```

`Hamster` 的实例现在可以在需要 `TextRepresentable` 类型的地方使用：

```swift
let simonTheHamster = Hamster(name: "Simon")
let somethingTextRepresentable: TextRepresentable = simonTheHamster
print(somethingTextRepresentable.textualDescription)
// Prints "A hamster named Simon"
```

> 注意
>
> 类型不会因为满足协议的要求而自动采用该协议。它们必须始终明确声明对该协议的采用。

## [采用使用合成实现的协议](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Adopting-a-Protocol-Using-a-Synthesized-Implementation)

Swift 可以在许多简单情况下自动提供 `Equatable` 、 `Hashable` 和 `Comparable` 的协议符合性。使用此合成实现意味着您不必编写重复的样板代码来自己实现协议要求。

Swift 为以下自定义类型提供了 `Equatable` 的合成实现：

- 只包含符合 `Equatable` 协议的存储属性的结构体
- 仅包含符合 `Equatable` 协议的关联类型的枚举
- 没有关联类型的枚举

要接收 `==` 的合成实现，请在包含原始声明的文件中声明对 `Equatable` 的符合，而无需自己实现 `==` 运算符。 `Equatable` 协议提供了 `!=` 的默认实现。

下面的示例定义了一个三维位置向量 `(x, y, z)` 的 `Vector3D` 结构，类似于 `Vector2D` 结构。由于 `x` 、 `y` 和 `z` 属性都是 `Equatable` 类型， `Vector3D` 接收等价运算符的合成实现。

```swift
struct Vector3D: Equatable {
    var x = 0.0, y = 0.0, z = 0.0
}


let twoThreeFour = Vector3D(x: 2.0, y: 3.0, z: 4.0)
let anotherTwoThreeFour = Vector3D(x: 2.0, y: 3.0, z: 4.0)
if twoThreeFour == anotherTwoThreeFour {
    print("These two vectors are also equivalent.")
}
// Prints "These two vectors are also equivalent."
```

Swift 提供了对以下类型的自定义类型合成实现 `Hashable` ：

- 只有存储属性并遵循 `Hashable` 协议的结构
- 仅包含符合 `Hashable` 协议的关联类型的枚举
- 没有关联类型的枚举

要接收 `hash(into:)` 的合成实现，请在包含原始声明的文件中声明对 `Hashable` 的符合性，而无需自己实现 `hash(into:)` 方法。

Swift 为没有原始值的枚举提供了 `Comparable` 的合成实现。如果枚举具有关联类型，则它们必须全部符合 `Comparable` 协议。要接收 `<` 的合成实现，请在包含原始枚举声明的文件中声明对 `Comparable` 的符合性，而无需自己实现 `<` 运算符。 `Comparable` 协议的默认实现提供了剩余的比较运算符 `<=` 、 `>` 和 `>=` 。

下面的示例定义了一个 `SkillLevel` 枚举，包含初学者、中级和专家的案例。专家还根据他们拥有的星星数量进行排名。

```swift
enum SkillLevel: Comparable {
    case beginner
    case intermediate
    case expert(stars: Int)
}
var levels = [SkillLevel.intermediate, SkillLevel.beginner,
              SkillLevel.expert(stars: 5), SkillLevel.expert(stars: 3)]
for level in levels.sorted() {
    print(level)
}
// Prints "beginner"
// Prints "intermediate"
// Prints "expert(stars: 3)"
// Prints "expert(stars: 5)"
```

## [协议类型集合](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Collections-of-Protocol-Types)

协议可以用作存储在集合中的类型，例如数组或字典，如《协议作为类型》中所提到的。此示例创建一个包含 `TextRepresentable` 个事物的数组：

```swift
let things: [TextRepresentable] = [game, d12, simonTheHamster]
```

现在可以遍历数组中的项目，并打印每个项目的文本描述：

```swift
for thing in things {
    print(thing.textualDescription)
}
// A game of Snakes and Ladders with 25 squares
// A 12-sided dice
// A hamster named Simon
```

请注意， `thing` 常量的类型为 `TextRepresentable` 。它不是 `Dice` 、 `DiceGame` 或 `Hamster` 类型，即使背后的实际实例是这些类型之一。不过，由于它的类型为 `TextRepresentable` ，并且任何 `TextRepresentable` 的东西都已知拥有 `textualDescription` 属性，因此在每次循环中安全地访问 `thing.textualDescription` 。

## [协议继承](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Protocol-Inheritance)

一个协议可以继承一个或多个其他协议，并可以在其继承的要求基础上添加进一步的要求。协议继承的语法类似于类继承的语法，但可以列出多个以逗号分隔的继承协议：

```swift
protocol InheritingProtocol: SomeProtocol, AnotherProtocol {
    // protocol definition goes here
}
```

以下是一个继承上述 `TextRepresentable` 协议的协议示例：

```swift
protocol PrettyTextRepresentable: TextRepresentable {
    var prettyTextualDescription: String { get }
}
```

此示例定义了一个新的协议 `PrettyTextRepresentable` ，它继承自 `TextRepresentable` 。任何采用 `PrettyTextRepresentable` 的对象必须满足 `TextRepresentable` 强制的所有要求，以及 `PrettyTextRepresentable` 强制的额外要求。在此示例中， `PrettyTextRepresentable` 添加了一个要求，提供一个可获取的属性，名为 `prettyTextualDescription` ，返回一个 `String` 。

`SnakesAndLadders` 类可以被扩展以采用和符合 `PrettyTextRepresentable` :

```swift
extension SnakesAndLadders: PrettyTextRepresentable {
    var prettyTextualDescription: String {
        var output = textualDescription + ":\n"
        for index in 1...finalSquare {
            switch board[index] {
            case let ladder where ladder > 0:
                output += "▲ "
            case let snake where snake < 0:
                output += "▼ "
            default:
                output += "○ "
            }
        }
        return output
    }
}
```

此扩展声明它采用 `PrettyTextRepresentable` 协议，并为 `SnakesAndLadders` 类型提供 `prettyTextualDescription` 属性的实现。任何 `PrettyTextRepresentable` 的内容也必须是 `TextRepresentable` ，因此 `prettyTextualDescription` 的实现首先通过访问 `TextRepresentable` 协议中的 `textualDescription` 属性来开始输出字符串。它附加一个冒号和换行符，并将其作为其美观文本表示的开始。然后，它遍历棋盘方块的数组，并附加一个几何形状以表示每个方块的内容：

- 如果方块的值大于 `0` ，它是梯子的底部，表示为 `▲` 。
- 如果方块的值小于 `0` ，它是蛇的头部，表示为 `▼` 。
- 否则，方块的值是 `0` ，它是一个“免费”方块，表示为 `○` 。

现在可以使用 `prettyTextualDescription` 属性来打印任何 `SnakesAndLadders` 实例的漂亮文本描述：

```swift
print(game.prettyTextualDescription)
// A game of Snakes and Ladders with 25 squares:
// ○ ○ ▲ ○ ○ ▲ ○ ○ ▲ ▲ ○ ○ ○ ▼ ○ ○ ○ ○ ▼ ○ ○ ▼ ○ ▼ ○
```

## [仅限类协议](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Class-Only-Protocols)

您可以通过将 `AnyObject` 协议添加到协议的继承列表中，将协议采用限制为类类型（而不是结构或枚举）。

```swift
protocol SomeClassOnlyProtocol: AnyObject, SomeInheritedProtocol {
    // class-only protocol definition goes here
}
```

在上面的示例中， `SomeClassOnlyProtocol` 只能被类类型采用。编写尝试采用 `SomeClassOnlyProtocol` 的结构或枚举定义是编译时错误。

> 注意
>
> 当该协议的要求所定义的行为假定或要求符合的类型具有引用语义而不是值语义时，请使用仅限类的协议。有关引用语义和值语义的更多信息，请参阅结构和枚举是值类型，而类是引用类型。

## [协议组合](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Protocol-Composition)

同时要求一个类型符合多个协议是很有用的。您可以通过协议组合将多个协议合并为一个单一的要求。协议组合的行为就像您定义了一个临时的本地协议，该协议具有组合中所有协议的合并要求。协议组合不定义任何新的协议类型。

协议组合的形式为 `SomeProtocol & AnotherProtocol` 。您可以列出所需的任意多个协议，用与号 ( `&` ) 分隔。除了协议列表外，协议组合还可以包含一个类类型，您可以用它来指定所需的超类。

这是一个示例，将两个名为 `Named` 和 `Aged` 的协议组合成一个函数参数上的单一协议组合要求：

```swift
protocol Named {
    var name: String { get }
}
protocol Aged {
    var age: Int { get }
}
struct Person: Named, Aged {
    var name: String
    var age: Int
}
func wishHappyBirthday(to celebrator: Named & Aged) {
    print("Happy birthday, \(celebrator.name), you're \(celebrator.age)!")
}
let birthdayPerson = Person(name: "Malcolm", age: 21)
wishHappyBirthday(to: birthdayPerson)
// Prints "Happy birthday, Malcolm, you're 21!"
```

在这个例子中， `Named` 协议有一个要求，即可获取的 `String` 属性，名为 `name` 。 `Aged` 协议有一个要求，即可获取的 `Int` 属性，名为 `age` 。这两个协议都被一个名为 `Person` 的结构所采用。

示例还定义了一个 `wishHappyBirthday(to:)` 函数。 `celebrator` 参数的类型是 `Named & Aged` ，这意味着“任何符合 `Named` 和 `Aged` 协议的类型。”传递给函数的具体类型并不重要，只要它符合这两个必需的协议。

该示例然后创建一个新的 `Person` 实例，称为 `birthdayPerson` ，并将这个新实例传递给 `wishHappyBirthday(to:)` 函数。因为 `Person` 遵循两个协议，这个调用是有效的， `wishHappyBirthday(to:)` 函数可以打印它的生日祝福。

这是一个将之前示例中的 `Named` 协议与 `Location` 类结合的示例：

```swift
class Location {
    var latitude: Double
    var longitude: Double
    init(latitude: Double, longitude: Double) {
        self.latitude = latitude
        self.longitude = longitude
    }
}
class City: Location, Named {
    var name: String
    init(name: String, latitude: Double, longitude: Double) {
        self.name = name
        super.init(latitude: latitude, longitude: longitude)
    }
}
func beginConcert(in location: Location & Named) {
    print("Hello, \(location.name)!")
}


let seattle = City(name: "Seattle", latitude: 47.6, longitude: -122.3)
beginConcert(in: seattle)
// Prints "Hello, Seattle!"
```

`beginConcert(in:)` 函数接受一个类型为 `Location & Named` 的参数，这意味着“任何是 `Location` 的子类并符合 `Named` 协议的类型。”在这种情况下， `City` 满足这两个要求。

将 `birthdayPerson` 传递给 `beginConcert(in:)` 函数是无效的，因为 `Person` 不是 `Location` 的子类。同样，如果您创建了一个不符合 `Named` 协议的 `Location` 的子类，使用该类型的实例调用 `beginConcert(in:)` 也是无效的。

## [检查协议符合性](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Checking-for-Protocol-Conformance)

您可以使用在类型转换中描述的 `is` 和 `as` 运算符来检查协议符合性，并转换为特定协议。检查和转换协议的语法与检查和转换类型的语法完全相同：

- `is` 运算符如果一个实例符合协议则返回 `true` ，否则返回 `false` 。
- `as?` 版本的下 cast 运算符返回协议类型的可选值，如果实例不符合该协议，则该值为 `nil` 。
- `as!` 版本的下 cast 运算符强制将类型转换为协议类型，并在类型转换失败时触发运行时错误。

此示例定义了一个名为 `HasArea` 的协议，具有一个可获取的 `Double` 属性要求，属性名为 `area` ：

```swift
protocol HasArea {
    var area: Double { get }
}
```

这里有两个类， `Circle` 和 `Country` ，它们都符合 `HasArea` 协议：

```swift
class Circle: HasArea {
    let pi = 3.1415927
    var radius: Double
    var area: Double { return pi * radius * radius }
    init(radius: Double) { self.radius = radius }
}
class Country: HasArea {
    var area: Double
    init(area: Double) { self.area = area }
}
```

`Circle` 类将 `area` 属性要求作为一个计算属性实现，基于存储的 `radius` 属性。 `Country` 类直接将 `area` 要求作为存储属性实现。两个类都正确地遵循了 `HasArea` 协议。

这里有一个名为 `Animal` 的类，它不符合 `HasArea` 协议：

```swift
class Animal {
    var legs: Int
    init(legs: Int) { self.legs = legs }
}
```

`Circle` 、 `Country` 和 `Animal` 类没有共享的基类。尽管如此，它们都是类，因此所有三种类型的实例都可以用来初始化一个存储 `AnyObject` 类型值的数组：

```swift
let objects: [AnyObject] = [
    Circle(radius: 2.0),
    Country(area: 243_610),
    Animal(legs: 4)
]
```

`objects` 数组使用一个数组字面量进行初始化，该字面量包含一个半径为 2 个单位的 `Circle` 实例；一个使用英国的表面积（以平方公里为单位）初始化的 `Country` 实例；以及一个有四条腿的 `Animal` 实例。

现在可以迭代 `objects` 数组，并且可以检查数组中的每个对象是否符合 `HasArea` 协议：

```swift
for object in objects {
    if let objectWithArea = object as? HasArea {
        print("Area is \(objectWithArea.area)")
    } else {
        print("Something that doesn't have an area")
    }
}
// Area is 12.5663708
// Area is 243610.0
// Something that doesn't have an area
```

每当数组中的一个对象符合 `HasArea` 协议时， `as?` 运算符返回的可选值会通过可选绑定解包到一个名为 `objectWithArea` 的常量中。 `objectWithArea` 常量已知为 `HasArea` 类型，因此可以以类型安全的方式访问和打印其 `area` 属性。

请注意，底层对象在转换过程中并没有改变。它们仍然是一个 `Circle` 、一个 `Country` 和一个 `Animal` 。然而，当它们被存储在 `objectWithArea` 常量中时，它们仅被知道是类型 `HasArea` ，因此只能访问它们的 `area` 属性。

## [可选协议要求](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Optional-Protocol-Requirements)

您可以为协议定义可选要求。这些要求不必由遵循该协议的类型实现。可选要求在协议定义的部分以 `optional` 修饰符作为前缀。提供可选要求是为了让您可以编写与 Objective-C 互操作的代码。协议和可选要求都必须标记为 `@objc` 属性。请注意， `@objc` 协议只能被类采用，而不能被结构或枚举采用。

当您在可选要求中使用方法或属性时，其类型会自动变为可选。例如，类型为 `(Int) -> String` 的方法变为 `((Int) -> String)?` 。请注意，整个函数类型被包装在可选中，而不是方法的返回值。

可选协议要求可以通过可选链式调用来调用，以考虑到实现该要求的类型可能不符合该协议。您可以通过在调用方法时在方法名称后加上问号来检查可选方法的实现，例如 `someOptionalMethod?(someArgument)` 。有关可选链式调用的信息，请参阅可选链式调用。

以下示例定义了一个名为 `Counter` 的整数计数类，它使用外部数据源来提供其增量值。该数据源由 `CounterDataSource` 协议定义，该协议有两个可选要求：

```swift
@objc protocol CounterDataSource {
    @objc optional func increment(forCount count: Int) -> Int
    @objc optional var fixedIncrement: Int { get }
}
```

`CounterDataSource` 协议定义了一个可选的方法要求，称为 `increment(forCount:)` ，以及一个可选的属性要求，称为 `fixedIncrement` 。这些要求定义了数据源为 `Counter` 实例提供适当增量值的两种不同方式。

> 注意
>
> 严格来说，您可以编写一个符合 `CounterDataSource` 的自定义类，而无需实现任何协议要求。毕竟，它们都是可选的。虽然从技术上讲是允许的，但这并不构成一个很好的数据源。

下面定义的 `Counter` 类具有一个类型为 `CounterDataSource?` 的可选 `dataSource` 属性：

```swift
class Counter {
    var count = 0
    var dataSource: CounterDataSource?
    func increment() {
        if let amount = dataSource?.increment?(forCount: count) {
            count += amount
        } else if let amount = dataSource?.fixedIncrement {
            count += amount
        }
    }
}
```

`Counter` 类将其当前值存储在一个名为 `count` 的变量属性中。 `Counter` 类还定义了一个名为 `increment` 的方法，该方法每次被调用时都会递增 `count` 属性。

该 `increment()` 方法首先尝试通过查找其数据源上 `increment(forCount:)` 方法的实现来检索增量金额。 `increment()` 方法使用可选链来尝试调用 `increment(forCount:)` ，并将当前 `count` 值作为该方法的唯一参数传递。

请注意，这里涉及两个级别的可选链。首先， `dataSource` 可能是 `nil` ，因此 `dataSource` 的名称后面有一个问号，表示只有在 `dataSource` 不是 `nil` 的情况下才应调用 `increment(forCount:)` 。其次，即使 `dataSource` 确实存在，也不能保证它实现了 `increment(forCount:)` ，因为这是一个可选要求。在这里， `increment(forCount:)` 可能未实现的可能性也通过可选链进行处理。只有在 `increment(forCount:)` 存在时，即它不是 `nil` 的情况下，才会调用 `increment(forCount:)` 。这就是为什么 `increment(forCount:)` 的名称后面也写有问号。

因为对 `increment(forCount:)` 的调用可能由于这两个原因中的任意一个而失败，因此该调用返回一个可选的 `Int` 值。尽管在 `CounterDataSource` 的定义中 `increment(forCount:)` 被定义为返回一个非可选的 `Int` 值，这一点仍然成立。尽管有两个可选链操作一个接一个地进行，结果仍然被包装在一个单一的可选中。有关使用多个可选链操作的更多信息，请参见链接多个级别的链。

在调用 `increment(forCount:)` 之后，返回的可选 `Int` 被解包为一个名为 `amount` 的常量，使用可选绑定。如果可选 `Int` 确实包含一个值——也就是说，如果委托和方法都存在，并且方法返回了一个值——解包后的 `amount` 将被添加到存储的 `count` 属性中，并且增量完成。

如果无法从 `increment(forCount:)` 方法中检索到值——要么是因为 `dataSource` 为 nil，要么是因为数据源未实现 `increment(forCount:)` ——那么 `increment()` 方法将尝试从数据源的 `fixedIncrement` 属性中检索一个值。 `fixedIncrement` 属性也是一个可选的要求，因此它的值是一个可选的 `Int` 值，即使 `fixedIncrement` 被定义为 `CounterDataSource` 协议定义的一部分的非可选 `Int` 属性。

这是一个简单的 `CounterDataSource` 实现，其中数据源每次查询时返回一个恒定值 `3` 。它通过实现可选的 `fixedIncrement` 属性要求来完成这一点：

```swift
class ThreeSource: NSObject, CounterDataSource {
    let fixedIncrement = 3
}
```

您可以使用 `ThreeSource` 的实例作为新 `Counter` 实例的数据源：

```swift
var counter = Counter()
counter.dataSource = ThreeSource()
for _ in 1...4 {
    counter.increment()
    print(counter.count)
}
// 3
// 6
// 9
// 12
```

上面的代码创建了一个新的 `Counter` 实例；将其数据源设置为一个新的 `ThreeSource` 实例；并调用计数器的 `increment()` 方法四次。正如预期的那样，计数器的 `count` 属性在每次调用 `increment()` 时增加三。

这里有一个更复杂的数据源，称为 `TowardsZeroSource` ，它使得 `Counter` 实例从其当前 `count` 值向零递增或递减：

```swift
class TowardsZeroSource: NSObject, CounterDataSource {
    func increment(forCount count: Int) -> Int {
        if count == 0 {
            return 0
        } else if count < 0 {
            return 1
        } else {
            return -1
        }
    }
}
```

`TowardsZeroSource` 类实现了 `CounterDataSource` 协议中的可选 `increment(forCount:)` 方法，并使用 `count` 参数值来确定计数的方向。如果 `count` 已经为零，方法将返回 `0` 以指示不应再继续计数。

您可以使用现有的 `Counter` 实例与 `TowardsZeroSource` 的实例从 `-4` 计数到零。一旦计数器达到零，就不再进行计数：

```swift
counter.count = -4
counter.dataSource = TowardsZeroSource()
for _ in 1...5 {
    counter.increment()
    print(counter.count)
}
// -3
// -2
// -1
// 0
// 0
```

## [协议扩展](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Protocol-Extensions)

协议可以扩展，以提供方法、初始化器、下标和计算属性实现，以满足符合的类型。这允许您在协议本身上定义行为，而不是在每个类型的单独遵循中或在全局函数中。

例如， `RandomNumberGenerator` 协议可以扩展以提供 `randomBool()` 方法，该方法使用所需 `random()` 方法的结果返回一个随机 `Bool` 值：

```swift
extension RandomNumberGenerator {
    func randomBool() -> Bool {
        return random() > 0.5
    }
}
```

通过在协议上创建扩展，所有符合的类型自动获得此方法实现，而无需任何额外修改。

```swift
let generator = LinearCongruentialGenerator()
print("Here's a random number: \(generator.random())")
// Prints "Here's a random number: 0.3746499199817101"
print("And here's a random Boolean: \(generator.randomBool())")
// Prints "And here's a random Boolean: true"
```

协议扩展可以为符合类型添加实现，但不能使协议扩展或继承自另一个协议。协议继承始终在协议声明中指定。

### [提供默认实现](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Providing-Default-Implementations)

您可以使用协议扩展为该协议的任何方法或计算属性要求提供默认实现。如果符合类型提供了所需方法或属性的自定义实现，则将使用该实现，而不是扩展提供的实现。

> 注意
>
> 具有默认实现的协议要求与可选协议要求是不同的。尽管符合类型不必提供它们自己的实现，但可以在不使用可选链的情况下调用具有默认实现的要求。

例如， `PrettyTextRepresentable` 协议，它继承了 `TextRepresentable` 协议，可以提供其所需 `prettyTextualDescription` 属性的默认实现，以简单地返回访问 `textualDescription` 属性的结果：

```swift
extension PrettyTextRepresentable  {
    var prettyTextualDescription: String {
        return textualDescription
    }
}
```

### [为协议扩展添加约束](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/protocols#Adding-Constraints-to-Protocol-Extensions)

当您定义一个协议扩展时，可以指定符合类型必须满足的约束，以便扩展的方法和属性可用。您可以在要扩展的协议名称后写一个泛型 `where` 子句来编写这些约束。有关泛型 `where` 子句的更多信息，请参见[泛型 Where 子句](generics.md#泛型-where-子句)。

例如，您可以定义一个扩展，用于适用于任何符合 `Equatable` 协议的集合的 `Collection` 协议。通过将集合的元素限制为 `Equatable` 协议（Swift 标准库的一部分），您可以使用 `==` 和 `!=` 运算符来检查两个元素之间的相等性和不等性。

```swift
extension Collection where Element: Equatable {
    func allEqual() -> Bool {
        for element in self {
            if element != self.first {
                return false
            }
        }
        return true
    }
}
```

`allEqual()` 方法仅在集合中的所有元素相等时返回 `true` 。

考虑两个整数数组，一个所有元素相同，另一个则不相同：

```swift
let equalNumbers = [100, 100, 100, 100, 100]
let differentNumbers = [100, 100, 200, 100, 200]
```

因为数组符合 `Collection` 而整数符合 `Equatable` ， `equalNumbers` 和 `differentNumbers` 可以使用 `allEqual()` 方法：

```swift
print(equalNumbers.allEqual())
// Prints "true"
print(differentNumbers.allEqual())
// Prints "false"
```

> 注意
>
> 如果一个符合类型满足多个约束扩展的要求，这些扩展为相同的方法或属性提供实现，Swift 将使用对应于最专业约束的实现。

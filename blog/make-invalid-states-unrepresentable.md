---
title: 'Make Invalid States Unrepresentable'
description: 'Let the compiler do the hard work of data validation for you'
published: '2024-02-01'
tags: ['scala', 'principles']
canonicalUrl: "https://www.improving.com/thoughts/make-invalid-states-unrepresentable"
ogImageUrl: "/images/blog/make-invalid-states-unrepresentable.jpg"
ogImageAltText: "Penrose Triangle optical illusion created out wafer biscuits. Image by Emmanuel Lefebvre from Pixabay."
---

Suppose you have a `Person` class in your program, and that a `Person` has an `age`. What type should the `age` be?

## `age` as a `String`

```scala
case class Person(age: String)
```

"Of course it shouldn't be a `String`" you might think. But why? The reason is that we can then end up with code like

```scala
val person = Person("Jeff")
```

If we ever wanted to _do_ anything with an `age: String`, we would need to validate it everywhere

```scala
def isOldEnoughToSmoke(person: Person): Boolean = {
  Try(person.age.toInt) match {
    case Failure(_) => throw new Exception(s"cannot parse age '${person.age}' as numeric")
    case Success(value) => value >= 18
  }
}

def isOldEnoughToDrink(person: Person): Boolean = {
  Try(person.age.toInt) match {
    case Failure(_) => throw new Exception(s"cannot parse age '${person.age}' as numeric")
    case Success(value) => value >= 21
  }
}

// etc.
```

This is cumbersome for the programmer _writing_ the code, and makes it difficult for any programmer _reading_ the code, as well.

We could move this validation to a separate method

```scala
def parseAge(age: String): Int = {
  Try(age.toInt) match {
    case Failure(_) => throw new Exception(s"cannot parse age '$age' as numeric")
    case Success(value) => value
  }
}

def isOldEnoughToSmoke(person: Person): Boolean =
  parseAge(person.age) >= 18

def isOldEnoughToDrink(person: Person): Boolean =
  parseAge(person.age) >= 21
```

...but this is still not ideal. The code is a bit cleaner, but we still need to parse a `String` into an `Int` every time we want to do anything numeric (comparison, arithmetic, etc.) with the `age`. This is often called ["stringly-typed" data](https://en.wiktionary.org/wiki/stringly-typed).

This can also move the program into an illegal state by throwing an `Exception`. If we're going to fail anyway, we should [fail fast](https://www.martinfowler.com/ieeeSoftware/failFast.pdf). We can do better.

## `age` as an `Int`

Your first instinct might have been to make `age` an `Int`, rather than a `String`

```scala
case class Person(age: Int)
```

If so, you have good instincts. An `age: Int` is much nicer to work with

```scala
def isOldEnoughToSmoke(person: Person): Boolean =
  person.age >= 18

def isOldEnoughToDrink(person: Person): Boolean =
  person.age >= 21
```

This 
- is easier to write
- is easier to read
- fails fast

You _cannot construct_ an instance of the  `Person` class with a `String` `age` now. That is an invalid state. We have [made it unrepresentable](https://www.cs.rice.edu/~javaplt/411/23-spring/NewReadings/functional_programming_on_Wall_Street.pdf), using the type system. The compiler will not allow this program to compile.

Problem solved, right?

```scala
val person = Person(-1)
```

This is clearly an invalid state as well. A person cannot have a negative age.

```scala
val person = Person(90210)
```

This is also invalid -- it looks like someone accidentally entered their [ZIP code](https://en.wikipedia.org/wiki/Beverly_Hills,_California) instead of their age.

So how can we constrain this type even further? How can we make even more invalid states unrepresentable?

## `age` as an `Int` with constraints

### at runtime

We can enforce _runtime constraints_ in any statically-typed language

```scala
case class Person(age: Int) {
  assert(age >= 0 && age < 150)
}
```

In Scala, `assert` will throw a `java.lang.AssertionError` if the assertion fails.

Now we can be sure that the `age` for any `Person` will always be within the range `[0, 150)`. Both

```scala
val person = Person(-1)
```

and

```scala
val person = Person(90210)
```

will now fail. But they will fail at runtime, halting the execution of our program.

This is similar to what we saw in "`age` as a `String`", above. This is still not ideal. Is there a better way?

### at compile time

Many languages allow _compile-time_ constraints, as well. Usually this is accomplished through macros, which inspect the source code during a compilation phase. These are often referred to as [refined types](https://en.wikipedia.org/wiki/Refinement_type).

Scala has [quite good](https://blog.rockthejvm.com/refined-types/) support for [refined types](https://github.com/Iltotore/iron) across multiple libraries. A solution using the [`refined` library](https://github.com/fthomas/refined) might look something like

```scala
case class Person(age: Int Refined GreaterEqual[0] And Less[150])
```

A limitation of this approach is that the field(s) to be constrained at compile-time must be [_literal_, hard-coded](https://en.wikipedia.org/wiki/Literal_(computer_programming)) values. Compile-time constraints cannot be enforced on, for example, values provided by a user. By that point, the program has already been compiled. In this case, we can always fall back to runtime constraints, which is often what these libraries do.

For now, we'll continue with runtime constraints only, since often that's the best we can do.

## `age` as an `Age` with constraints

From simplest to most complex implementation, we moved left to right in the diagram below

```
String => Int => Int with constraints
```

This increase in complexity directly correlates with the _accuracy_ with which we're modelling this data

> "The problems tackled have inherent complexity, and it takes some effort to model them appropriately." [[source]](https://fasterthanli.me/articles/i-want-off-mr-golangs-wild-ride)

The move left-to-right above should be driven by the requirements of your system. You should not implement compile-time refinements, for example, unless you have lots of hard-coded values to validate at compile time: otherwise [you aren't gonna need it](https://martinfowler.com/bliki/Yagni.html). Every line of code has a cost to implement and maintain. Avoiding premature specification is just as important as avoiding [premature generalization](https://www.codewithjason.com/premature-generalization), though it's **_always easier_ to move from more specific types to less specific types**, so prefer specificity over generalization.

Every bit of data has a _context_, as well. There is no such thing as a "pure" `Int` value floating around in the universe. An age can be modelled as an `Int`, but it's different from a weight, which could also be modelled as an Int. The labels we attach to these raw values are the _context_

```scala
case class Person(age: Int, weight: Int) {
  assert(age >= 0 && age < 150)
  assert(weight >= 0 && weight < 500)
}
```

There is one more problem for us to solve here. Suppose I'm 81kg and 33 years old

```scala
val me = Person(81, 33)
```

That compiles, but... it shouldn't. I swapped my weight and age!

An easy way to avoid this confusion is to define some more types. In this case, [_newtypes_](https://doc.rust-lang.org/rust-by-example/generics/new_types.html)

```scala
case class Age(years: Int) {
  assert(years >= 0 && years < 150)
}

case class Weight(kgs: Int) {
  assert(kgs >= 0 && kgs < 500)
}

case class Person(age: Age, weight: Weight)
```

The name _newtype_ for this pattern [comes from Haskell](https://wiki.haskell.org/Newtype). This is a simple way to ensure that we don't accidentally swap values with the same underlying type. The following, for example, will not compile

```scala
val age = Age(33)
val weight = Weight(81)

val me = Person(weight, age) // does not compile!
```

We could also use [_tagged types_](https://medium.com/iterators/to-tag-a-type-88dc344bb66c). In Scala, the simplest possible example of this looks something like

```scala
trait AgeTag
type Age = Int with AgeTag

object Age {
  def apply(years: Int): Age = {
    assert(years >= 0 && years < 150)
    years.asInstanceOf[Age]
  }
}

trait WeightTag
type Weight = Int with WeightTag

object Weight {
  def apply(kgs: Int): Weight = {
    assert(kgs >= 0 && kgs < 500)
    kgs.asInstanceOf[Weight]
  }
}

case class Person(age: Age, weight: Weight)

val p0 = Person(42, 42) // does not compile -- an Int is not an Age
val p1 = Person(Age(42), 42) // does not compile -- an Int is not a Weight	
val p2 = Person(Age(42), Weight(42)) // compiles!
val p3 = Person(Weight(42), Weight(42)) // does not compile -- a Weight is not an Age
```

This makes use of the fact that function application `f()` is syntactic sugar in Scala for an `apply()` method. So `f()` is equivalent to `f.apply()`.

This approach allows us to model the idea that an `Age` / a `Weight` is an `Int`, but an `Int` is not an `Age` / a `Weight`. This means we can treat an `Age` / a `Weight` _as_ an `Int` and add, subtract, or do whatever other `Int`-like things we want to do.

Mixing these two approaches in one example, you can see the difference between newtypes and tagged types. You must extract the "raw value" from a newtype. You do not need to do this with a tagged type

```scala
// `Age` is a tagged type
trait AgeTag
type Age = Int with AgeTag

object Age {
  def apply(years: Int): Age = {
    assert(years >= 0 && years < 150)
    years.asInstanceOf[Age]
  }
}

// `Weight` is a newtype
case class Weight(kgs: Int) {
  assert(kgs >= 0 && kgs < 500)
}

// `Age`s can be treated as `Int`s, because they _are_ `Int`s
assert(40 == Age(10) + Age(30))

// `Weight`s are not `Int`s, they _contain_ `Int`s
Weight(10) + Weight(30) // does not compile

// To add `Weight`s, we must "unwrap" them
Weight(10).kgs + Weight(30).kgs
```

In some languages, the "unwrapping" of newtypes can be done automatically. This can make newtypes as ergonomic as tagged types. For example, in Scala, this could be done with an _implicit conversion_

```scala
implicit def weightAsInt(weight: Weight): Int = weight.kgs

// `Weight`s are not `Int`s, but they can be _converted_ to `Int`s
Weight(10) + Weight(30) // this now compiles
```

## Further refinements

The important point of the above discussion is that, as much as possible, we want to _make invalid states unrepresentable_.

- "Jeff" is an invalid age. Age isn't a string, it is a number.
- -1 is an invalid age. Age cannot be negative, it should be 0 or positive, and probably less than about 150.
- My age is not 88. An age should be easily distinguishable from other integral values, like weight.

Everything discussed above implemented these refinements on the concept of "age", one at a time.

We can make further refinements if there is a need for those refinements.

For example, suppose we want to send a "Happy Birthday!" email to a `Person` on their birthday. Rather than an `Age`, we now need a date of birth.

```scala
case class Date(year: Year, month: Month, day: Day)

case class Year(value: Int, currentYear: Int) {
  assert(value >= 1900 && value <= currentYear)
}

case class Month(value: Int) {
  assert(value >= 1 && value <= 12)
}

case class Day(value: Int) {
  assert(value >= 1 && value <= 31)
}

case class Person(dateOfBirth: Date, weight: Weight) {
  def age(currentDate: Date): Age = {
    ??? // TODO calculate Age from dateOfBirth
  }
}
```

The amount of information provided by `dateOfBirth` is strictly greater than the amount of information provided by `Age`. We can calculate someone's age from their date of birth, but we cannot do the opposite.

The above implementation leaves much to be desired, though -- there are lots of invalid states. A better way to implement this would be for `Month` to be an enum, and for `Day` validity to depend on the `Month` (February never has 30 days, for example)

```scala
case class Year(value: Int, currentYear: Int) {
  assert(value >= 1900 && value <= currentYear)
}

sealed trait Month

case object January extends Month
case object February extends Month
case object March extends Month
case object April extends Month
case object May extends Month
case object June extends Month
case object July extends Month
case object August extends Month
case object September extends Month
case object October extends Month
case object November extends Month
case object December extends Month

case class Day(value: Int, month: Month) {
  month match {
    case February => assert(value >= 1 && value <= 28)
    case April | June | September | November => assert(value >= 1 && value <= 30)
    case _ => assert(value >= 1 && value <= 31)
  }
}

case class Date(year: Year, month: Month, day: Day)
```

Always prefer low-cardinality types to [high-cardinality types](https://www.seas.upenn.edu/~sweirich/types/archive/1999-2003/msg01233.html), when possible. It limits the number of possible invalid states. In most languages, `enum`s are the way to go here (in Scala 2, an `enum` can be modelled using a `sealed trait`, as shown above). But there are still invalid states hiding above. Can you find them?

In some cases, stringly-typed data validated using regular expressions can be replaced entirely by `enum`s. Could you model [Canadian postal codes](https://www150.statcan.gc.ca/n1/pub/92-153-g/2011002/tech-eng.htm) such that it's impossible to construct an invalid one?

Use the above knowledge to go forth and _make invalid states unrepresentable_.
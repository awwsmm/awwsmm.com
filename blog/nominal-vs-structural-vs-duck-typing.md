---
title: "What's the Difference Between Nominal, Structural, and Duck Typing?"
description: "Nominal, Structural, and Duck Typing in Java, TypeScript, and JavaScript"
published: '2022-01-09'
lastUpdated: '2022-01-14'
tags: ['language-design']
---

## Nominal Typing

Most major programming languages with objects use [nominal typing](https://en.wikipedia.org/wiki/Nominal_type_system), where the _name_ (or [fully qualified class name, FQCN](https://en.wikipedia.org/wiki/Fully_qualified_name)) of an object determines whether or not it is equal to another object, or assignable to a variable of a particular type. [For example, in Java](https://www.mycompiler.io/view/BDKXhWg)

```java
class Dog {
  public String name;
  public Dog (String name) {
    this.name = name;
  }
}

class Person {
  public String name;
  public Person (String name) {
    this.name = name;
  }
}
```

If you create a `Dog` and a `Person` with the same `name`, [Java will tell you that they're not the same thing](https://www.mycompiler.io/view/JJSt7fK), even though both classes have the same _structure_ (a single `String` field named `name`) and the same internal state (`name` is `"Fido"`)

```java
Dog dog = new Dog("Fido");
Person person = new Person("Fido");

// System.out.println(dog == person); // error: incomparable types: Dog and Person
System.out.println(dog.equals(person)); // false
System.out.println(person.equals(dog)); // false
```

And [you cannot pass a `Dog` to a method which expects a `Person`](https://www.mycompiler.io/view/88L7lwy)

```java
class Greeter {
    public static void greet (Person person) {
        System.out.println("Hello, " + person.name + "!");
    }
}

// ...

Greeter.greet(person); // Hello, Fido!
// Greeter.greet(dog); // error: incompatible types: Dog cannot be converted to Person
```

## Structural Typing

In contrast, TypeScript allows for _structural typing_ in some scenarios, where the structure of the objects is all that matters (and class names are immaterial). If we had the following two classes in TypeScript, we will see -- similar to Java -- that [they are not equal when compared with `==`](https://www.typescriptlang.org/play?#code/MYGwhgzhAEAiD2BzaBvAUNaA7MBbApgFzQQAuATgJZaIbTDxZnkCuwp850AFDgcc2qIAlKjqZSAC0oQAdH3zQAvNjz4A3HQC+aHWlCQYABXzkIjMZgUCKQugyYU2HLrzU2qNUekwTpchWVVAk1MHT0HMmgAEyQgrHwAdzgkbgAiADFKWLThTUjSaAAHU3MseKToEzNGdKycvLR9RnMQfFkQVNjkJRUSmqw86AB6YegAMzAQCHwgA)

```ts
class Dog {
  name: string
  constructor (name: string) {
    this.name = name;
  }
}

class Person {
  name: string
  constructor (name: string) {
    this.name = name;
  }
}

const dog = new Dog("Fido");
const person = new Person("Fido");

console.log(dog == person); // false
```

But suppose [we write our `Greeter` class in TypeScript as](https://www.typescriptlang.org/play?#code/MYGwhgzhAEAiD2BzaBvAUNaA7MBbApgFzQQAuATgJZaIbTDxZnkCuwp850AFDgcc2qIAlKjqZSAC0oQAdH3zQAvNjz4A3HQC+aHWlCQYABXzkIjMZgUCKQugyYU2HLrzU2qNUekwTpchWVVAk1MHT0HMmgAEyQgrHwAdzgkbgAiADFKWLThTUjSaAAHU3MseKToEzNGdKycvLR9RnMQfFkQVNjkJRUSmqw86AB6YegAMzAQCHwmgyhoAHFyfHxSU0sSUjBSSmBoRBW1nkPV7YAjNuIUYKItz2Qtb3F6Fvg2jtSAAwAJfBBOgAaaAAEhQpzWYEu7QUWgAhF9GmFdE1lmdTLIIaRuP0ykNRtA-gD4MD6vA4Wg0WsMVjuN18WMiUDoGS4UA)

```ts
class Greeter {
  static greet (greetable: { name: string }) {
    console.log(`Hello, ${greetable.name}!`);
  }
}

Greeter.greet(person); // Hello, Fido!
Greeter.greet(dog); // Hello, Fido!
```

TypeScript simply checks that the object passed to `greet()` has a `name: string` field, because that's the type we specified for `greetable`: an object with a `name: string` field. It doesn't care what class `greetable` might be, [or if it has other fields and methods as well](https://www.typescriptlang.org/play?#code/MYGwhgzhAEAiD2BzaBvAUNaA7MBbApgFzQQAuATgJZaIbTDxZnkCuwp850AFDgcc2qIAlKjqZSAC0oQAdH3zQAvNjz4A3HQC+aHWlCQYABXzkIjMZgUCKQugyYU2HLrzU2qNUekwTpchWVVAk1MHT0HMmgAEyQgrHwAdzgkbgAiADFKWLThTUjSaAAHU3MseKToEzNGdKycvLR9RnMQfFkQVNjkJRUSmqw86AB6YegAMzAQCHwmgyhoAHFyfHxSU0sSUjBSSmBoRBW1nkPV7YAjNuIUYKItz2Qtb3F6Fvg2jtSAAwAJfBBOgAaaAAEhQpzWYEu7QUWgAhF9GmFdE1lmdTLIIaRuP0ykNRtA-gD4MD6vA4Wg0WsMVjuN18WMiUDoGSKfpwAsAEKUcjRTYMTrkDx2Kzue4i16OVjsTg8AWcYU0YHWcVeTZ+GSyeVcFTa0K+KSawIqBT68JzFqFc48vkmyrc3npFbRNLAtKc+AATxdjSp63ImKO2OtvIZhP+zI93rhQA)

```ts
class Bird {
  color: string
  name: string
  constructor (color: string, name: string) {
    this.color = color;
    this.name = name;
  }
}

const bird = new Bird("red", "Boyd");
Greeter.greet(bird); // Hello, Boyd!
```

## Duck Typing

In JavaScript, we might [rewrite the above TypeScript classes like](https://jsfiddle.net/y5vts2Lk/)

```js
class Dog {
  constructor (name) {
    this.name = name;
  }
}

class Person {
  constructor (name) {
    this.name = name;
  }
}

class Bird {
  constructor (color, name) {
    this.color = color;
    this.name = name;
  }
}

const dog = new Dog("Fido");
const person = new Person("Fido");
const bird = new Bird("red", "Boyd");
```

But, as JavaScript doesn't specify types using the `:` as TypeScript does, we also have to [rewrite our `Greeter` slightly](https://jsfiddle.net/y5vts2Lk/1/)

```js
class Greeter {
  static greet (greetable) {
    console.log("Hello, " + greetable.name + "!");
  }
}

Greeter.greet(person); // Hello, Fido!
Greeter.greet(dog); // Hello, Fido!
Greeter.greet(bird); // Hello, Boyd!
```

In this case, there are no type or structural constraints at all on `greetable`. JavaScript is using [duck typing](https://en.wikipedia.org/wiki/Duck_typing) here, where field and method accesses are only checked at runtime (and not at compile time, because JavaScript isn't compiled). If a `greetable` has all of the required fields, no errors will be thrown.

However, [if a field is missing...](https://jsfiddle.net/bjgz7cuo/)

```js
class Complimenter {
  static compliment (target) {
    console.log("Hello, " + target.name + "!");
    console.log("What a nice shade of " + target.color + " you are!");
  }
}

Complimenter.compliment(person); // Hello, Fido! What a nice shade of undefined you are!
Complimenter.compliment(dog); // Hello, Fido! What a nice shade of undefined you are!
Complimenter.compliment(bird); // Hello, Boyd! What a nice shade of red you are!
```

...we can get `undefined` results.

> The name "duck typing" comes from the phrase ["If it looks like a duck, swims like a duck, and quacks like a duck, then it probably is a duck"](https://en.wikipedia.org/wiki/Duck_test). When using duck typing, we run the program as long as we can until we hit a runtime error -- until the "duck" no longer looks like a duck.
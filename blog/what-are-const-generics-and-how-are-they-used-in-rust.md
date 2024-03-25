---
title: 'What Are Const Generics and How Are They Used in Rust?'
description: 'Understanding const generics in the Rust programming language with a few examples'
published: '2024-03-25'
lastUpdated: '2024-03-25'
tags: ['rust', 'bevy']
---

[I was working through an example](https://github.com/awwsmm/daily-bevy/tree/time/virtual_time) in [the repo for the Bevy game engine](https://github.com/bevyengine/bevy/blob/v0.13.0/examples/time/virtual_time.rs) recently and came across this code

```rust
/// Update the speed of `Time<Virtual>.` by `DELTA`
fn change_time_speed<const DELTA: i8>(mut time: ResMut<Time<Virtual>>) {
    let time_speed = (time.relative_speed() + DELTA as f32)
        .round()
        .clamp(0.25, 5.);

    // set the speed of the virtual time to speed it up or slow it down
    time.set_relative_speed(time_speed);
}
```

This is a function (`fn`) which takes a `mut`able argument called `time`. The type of `time`, `ResMut<Time<Virtual>>`, comes after the colon, `:`.

The thing that caught my eye here was the generic parameter: `<const DELTA: i8>`. What is that?

Here's another example from Bevy

```rust
pub unsafe fn read<T>(self) -> T {
    let ptr = self.as_ptr().cast::<T>().debug_ensure_aligned();
    // -- snip --
}
```

The `read` function takes a generic type parameter `T` and uses it in two places: in the body of the function, and as a return type. Programmers who are familiar with generics know that an unconstrained `T` is a placeholder that means "any type"; it could be `String` or `bool` or anything else.

> In languages with a global type hierarchy, like Java, a value `t: T` has _some_ operations which can be performed on it, like `.toString()`, because _every_ type `T` in Java extends the base `Object` type. Rust has no such global type hierarchy, and no root `Object` type, so there's not much at all you can do with an instance of an unconstrainted type.

Going back to the first example, `const DELTA: i8` clearly already _has_ a type, appearing after the colon, `:`. (It is `i8`, an 8-bit signed integer.) So what is it doing sitting between those angle brackets (`<>`) where generic parameters usually sit?

In this position, `const DELTA: i8` is acting as a [const generic](https://doc.rust-lang.org/reference/items/generics.html#const-generics).

## What Are Const Generics?

Const generic parameters are a new ([ish](https://blog.rust-lang.org/2021/02/26/const-generics-mvp-beta.html)) kind of generic parameter in Rust, similar to type parameters (e.g. `T`) and lifetime parameters (e.g. `'a`). In the same way that a function (or method, `struct`, `enum`, `impl`, `trait`, or `type` alias) can use a generic _type_ parameter, it can also use _const generic_ parameters.

Const generic parameters are what power `[T; N]` type annotation of arrays in Rust. They are why `[T; 3]` (an array of three `T` values) and `[T; 4]` (an array of four `T` values) are _different types_, but different types which can be handled _generically_ as specific implementations of `[T; N]`.

Const generic parameters allow items to be generic over _constant values_, rather than over types.

The difference can be subtle. Here's a simple example

```rust
fn add<const b: i8>(a: i8) -> i8 {
  a + b
}
```

Here, `b` is not a "type parameter"; it is a _value_, and so it can be treated exactly as a value, used in expressions, and so on. But since it is `const`, the value of `b` must be known at compile time. For example, the following will not compile

```rust
fn example(a: i8, b: i8) -> i8 {
    add::<b>(a) // error: attempt to use a non-constant value in a constant
}
```

The logic in this function, of course, could also be expressed like

```rust
fn add(a: i8, b: i8) -> i8 {
  a + b
}
```

...so what's the benefit of const generics? Let's look at some other examples

## Using Const Generics to Enforce Correctness

There are a few examples from linear algebra where const generics are very helpful. For example, the [dot product](https://en.wikipedia.org/wiki/Dot_product) of two vectors `a` and `b`, is defined for any two vectors of any dimensionality (length), provided they have the _same_ dimensionality

```rust
struct Vector<const N: usize>([i32; N]);

impl<const N: usize> Vector<N> {
    fn dot(&self, other: &Vector<N>) -> i32 {
        let mut result = 0;
        for index in 0..N {
            result += self.0[index] * other.0[index]
        }
        result
    }
}
```

We get a compile-time error if we try to find the dot product of two vectors with different numbers of elements

```rust
fn main() {
    let a = Vector([1, 2, 3]);
    let b = Vector([4, 5, 6]);
    
    assert_eq!(a.dot(&b), 32); // ok: a and b have the same length
    
    let c = Vector([7, 8, 9, 10]);
    
    a.dot(&c); // error: expected `&Vector<3>`, but found `&Vector<4>`
}
```

Const generics can be applied to [matrix multiplication](https://amacal.medium.com/learning-rust-const-generics-8c29fc26fad4), as well. Two matrices [can be multiplied](https://en.wikipedia.org/wiki/Matrix_multiplication) only if the first one has `M` rows and `N` columns and the second has `N` rows and `P` columns. The resulting matrix will have `M` rows and `P` columns.

```rust
struct Matrix<const nRows: usize, const nCols: usize>([[i32; nCols]; nRows]);

impl<const M: usize, const N: usize> Matrix<M, N> {
    fn multiply<const P: usize>(&self, other: &Matrix<N, P>) -> Matrix<M, P> {
        todo!()
    }
}
```

Here, we again get a compile-time error if we ignore this constraint

```rust
fn main() {
    let a = Matrix([[1, 2, 3], [4, 5, 6]]); // 2 x 3 matrix
    let b = Matrix([[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]]); // 3 x 4 matrix
    
    a.multiply(&b); // ok: 2 x 4 matrix
    
    let c = Matrix([[1, 2, 3], [2, 3, 4]]); // 2 x 3 matrix
    
    a.multiply(&c); // error: expected `&Matrix<3, <unknown>>`, but found `&Matrix<2, 3>`
}
```

These constraints can be enforced at runtime without const generics, but const generics can help [shift these issues left](https://en.wikipedia.org/wiki/Shift-left_testing), catching them earlier in the development process, tightening [the inner dev loop](https://www.getambassador.io/docs/telepresence/latest/concepts/devloop#what-is-the-inner-dev-loop).

## Using Const Generics to Conditionally Implement `trait`s

(Adapted from [Nora's example here](https://nora.codes/post/its-time-to-get-hyped-about-const-generics-in-rust/).)

Const generics also enable really powerful patterns, like compile-type checks on values in signatures. For example...

```rust
struct Assert<const COND: bool> {}
```

...this `struct` takes a constant generic `bool` parameter, `COND`. If we define a `trait` `IsTrue`...

```rust
trait IsTrue {}

impl IsTrue for Assert<true> {}
```

...we can conditionally implement `trait`s by requiring some `Assert` to `impl IsTrue`, like so

```rust
trait IsOdd<const N: i32> {}

impl<const N: i32> IsOdd<N> for i32 where Assert<{N % 2 == 1}>: IsTrue {}
```

> The above `Assert<{N % 2 == 1}>` requires `#![feature(generic_const_exprs)]` and the `nightly` toolchain. See https://github.com/rust-lang/rust/issues/76560 for more info.

Above, `trait IsOdd` is implemented for the `i32` type, but only on values `N` which satisfy `N % 2 == 1`. We can use this trait to get compile-time checks that constant (hard-coded) `i32` values are odd

```rust
fn do_something_odd<const N: i32>() where i32: IsOdd<N> {
    println!("oogabooga!")
}

fn do_something() {
    do_something_odd::<19>();
    do_something_odd::<42>(); // does not compile
    do_something_odd::<7>();
    do_something_odd::<64>(); // does not compile
    do_something_odd::<8>(); // does not compile
}
```

The above will generate a compiler error like

```rust
error[E0308]: mismatched types
  --> src/main.rs:70:5
   |
70 |     do_something_odd::<42>();
   |     ^^^^^^^^^^^^^^^^^^^^^^^^ expected `false`, found `true`
   |
   = note: expected constant `false`
              found constant `true`
```

## Using Const Generics to Avoid Complex Return Types

Finally, const generics can be used to make code more readable, and more performant. The example from the beginning of this post comes from Bevy, and the reason const generics are used there is because Bevy is expecting a function pointer as an argument to a method

```rust
fn main() {
    App::new()
        // -- snip --
        .add_systems(
            Update,
            (
                // -- snip --
                change_time_speed::<1>.run_if(input_just_pressed(KeyCode::ArrowUp)),
                // -- snip --
            ),
        )
        .run();
}
```

`change_time_speed::<1>`, above, is a function pointer. We can rearrange this method to take an argument, rather than using a const generic parameter...

```rust
change_time_speed_2(1).run_if(input_just_pressed(KeyCode::ArrowUp)),
```

...but then we would have to change the return type as well

```rust
/// Update the speed of `Time<Virtual>.` by `DELTA`
fn change_time_speed_2(delta: i8) -> impl FnMut(ResMut<Time<Virtual>>) {
    move |mut time| {
        let time_speed = (time.relative_speed() + delta as f32)
            .round()
            .clamp(0.25, 5.);

        // set the speed of the virtual time to speed it up or slow it down
        time.set_relative_speed(time_speed);
    }
}
```

To many, the original function may be more readable

```rust
/// Update the speed of `Time<Virtual>.` by `DELTA`
fn change_time_speed<const DELTA: i8>(mut time: ResMut<Time<Virtual>>) {
    let time_speed = (time.relative_speed() + DELTA as f32)
        .round()
        .clamp(0.25, 5.);

    // set the speed of the virtual time to speed it up or slow it down
    time.set_relative_speed(time_speed);
}
```

Remember, as well, that Rust uses [monomorphization of generics](https://doc.rust-lang.org/book/ch10-01-syntax.html#performance-of-code-using-generics) to improve runtime performance. So not only is the const generic version of this function more readable, but it's possible (though I haven't benchmarked) that it's more performant as well. Either way, it's good to know that there are multiple ways to attack a problem, and to be able to weigh the pros and cons of each approach.

Hopefully this discussion has helped you to understand what const generics are, and how they can be used in Rust.
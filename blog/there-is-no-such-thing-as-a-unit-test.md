---
title: "There is No Such Thing as a Unit Test"
description: 'Thinking differently about software testing paradigms'
published: '2024-10-30'
tags: ['principles', 'software-development']
ogImageUrl: "/blog/there-is-no-such-thing-as-a-unit-test/banner.jpg"
ogImageAltText: "Photo by Simon Berger: https://www.pexels.com/photo/brown-camel-931881/"
---

> "The terms 'unit test' and 'integration test' have always been rather murky, even by the slippery standards of most software terminology."<br/>
> -- [Martin Fowler](https://martinfowler.com/articles/2021-test-shapes.html)

> "...there is no such thing as a Unit Test"<br/>
> -- [Michael Belivanakis](https://blog.michael.gr/2022/10/incremental-integration-testing.html)

## What is a Unit Test?

I typed the above question into a popular search engine, and the first three results I got back were as follows (emphasis mine)

> A unit test is a block of code that verifies the accuracy of a smaller, isolated block of application code, typically a function or method. -- [aws.amazon.com](https://aws.amazon.com/what-is/unit-testing/)

> A unit test is a way of testing a unit - the smallest piece of code **that can be logically isolated** in a system. In most programming languages, that is a function, a subroutine, a method or property. -- [smartbear.com](https://smartbear.com/learn/automated-testing/what-is-unit-testing/)

> Unit is defined as a single behaviour exhibited by the system under test (SUT), usually corresponding to a requirement. While it may imply that it is a function or a module (in procedural programming) or a method or a class (in object-oriented programming) **it does not mean functions/methods, modules or classes always correspond to units**. From the system-requirements perspective only the perimeter of the system is relevant, thus **only entry points to externally-visible system behaviours define units**. -- [Kent Beck via Wikipedia](https://en.wikipedia.org/wiki/Unit_testing)

A problem I often see with modern software testing is that [we lean toward the second definition too often](https://www.reddit.com/r/learnprogramming/comments/nwpzx9/how_can_unit_tests_be_useful_if_refactoring/): a unit is "the smallest piece of code that can be logically isolated in a system". The word "can" is carrying a _lot_ of weight in this sentence. We _can_ logically isolate just about anything.

"Is a unit a file?"

-- "Definitely not", I can hear you say.

"Assuming an object-oriented program, how about a class?"

-- "Probably not", you say with slightly less conviction.

"How about a method?"

-- "Probably", with a bit more confidence, agreeing with the first two results above.

"What if that method is 300 lines of code?"

-- "Ooh, yeah, you should probably break that out into smaller methods."

Suppose we do this. Let's break our 300-line method into, say, 10 methods of 30 lines each, as [some CS professors seem to teach their students that this is a good rule of thumb for function length](https://www.reddit.com/r/learnprogramming/comments/toynah/when_i_was_in_undergrad_they_told_us_no_function/#:~:text=In%20general%2C%20the%20most%20common,should%20only%20do%20one%20thing.).

```scala
// before
def original(x: String, y: Int): Boolean = {

  // ...
  // hundreds of lines of code
  // ...

}
```

```scala
// after
def improved(x: String, y: Int): Boolean = {

  val intermediateValueA = a(x)
  val intermediateValueB = b(intermediateValueA, y)
  val intermediateValueC = c(intermediateValueB)
  // ...
  val intermediateValueH = h(intermediateValueG)
  val intermediateValueI = i(intermediateValueH)
  
  j(intermediateValueI)

}

private def a(x: String): Long = {
  // ...
}

private def b(z: Long, y: Int): Double = {
  // ...
}

// eight more private functions...
```

All of these methods could be `private` (or whatever your language's equivalent of that is). In that case, they can only be accessed by the class which contains them. They used to be all in one method anyway, so we can be sure nobody else is using this logic anywhere else.

But now we face another decision: should we write unit tests for all of these individual methods? For many of us, our gut reaction will be "yes". This could make refactoring more difficult in the future, though, because ["the closer your tests are to the implementation the more sensitive they are to changes"](https://www.effective-software-testing.com/do-unit-tests-make-refactoring-harder).

> Anecdotally, I've worked on codebases with hundreds of tests like this, all tightly coupled to the production implementation. Adding one field to a class meant updating a hundred or more tests which didn't care about this field at all, but needed the new field in order to compile. The test changes regularly took longer to implement than the production changes.

Writing unit tests for these smaller methods might also require us to make them more `public` than they need to be; the world outside this class doesn't care about these individual methods, all it cares about is the one `improved` method which now ties them all together.

The real question is, are these functions "units" of code?

The answer is no.

As Kent Beck would say, these are not "entry points to externally-visible system behaviours".

The only externally-visible entry point in the refactored example above is the `improved` function, just as the `original` function was initially. But these pervasive ideas that...

1. large functions should be broken up into smaller ones, and
2. a "unit test" is a "test of a single function"

...combine to produce a result that is much worse than the sum of its parts: huge suites of tests tightly-coupled to unnecessarily-public production code that take too long to write and are difficult to maintain.

Outcomes like this lead many developers to believe things like...

> "Most Unit Testing is Waste"<br/>
> -- [James O. Coplien](https://wikileaks.org/ciav7p1/cms/files/Why-Most-Unit-Testing-is-Waste.pdf)

## Kinds of Tests

Rather than thinking of tests along the traditional [unit / integration / end-to-end spectrum](https://qase.io/blog/test-pyramid/), I think it's helpful to think along a few other dimensions

1. is this test _fast_ or _slow_?
2. is this a _black-box_ test or a _white-box_ test?
3. is this test _informed by_ development or does _it inform_ development?

### Fast and Slow Tests

Let me start by asserting that "fast" is not synonymous with "good", and "slow" is not synonymous with "bad" in this context.

Fast tests are tests that run in a few seconds, milliseconds, microseconds, or less. Fast tests, therefore, must be entirely in-memory. They [do no disk IO and they make no network calls](https://gist.github.com/jboner/2841832). They can be run every single time a code change is made without being a roadblock to development speed, and should therefore be run as part of the developer's [inner loop](https://www.awwsmm.com/blog/drop-everything-and-review). Every time you compile, you can run these tests.

Slow tests take several seconds, minutes, or hours to run. The dividing line between fast and slow tests is somewhere around 2-5 seconds. Slow tests may require reading large input files from disk, doing lots of computation, or communicating across the network. That is: they are [IO, CPU, or network _bound_](https://stackoverflow.com/q/868568/2925434). [Contract tests](https://testsigma.com/blog/api-contract-testing/) (which often spin up Docker containers) and performance tests (which may run gigabytes of data or thousands of requests through the system) are examples of slow tests. These tests should be run less regularly, as they can impact development speed: before each commit to `main` / `master` is probably fine for tests shorter than a few minutes, daily or weekly might be a good cadence for tests much longer than that.

### Black-Box and White-Box Tests

Black-box tests make no assumptions about the internals of the thing they are testing. They provide inputs and assert on observable outputs, and that's it. The observable output is usually a return value from a method, but a black-box test might instead assert that a side effect has occurred, like that a log line has been written, or that a metric has been recorded, or that some state has been mutated.

White-box tests specifically test the internals of the thing they are testing. They are [_introspective_](https://stackoverflow.com/a/25199156/2925434). Tests which have assertions like "when 'x' happens, function a() should call function b()" are white-box tests. They are explicitly testing _how_ something should happen (_how_ some code is implemented), rather than testing only that it _has_ happened. Tests which rely heavily on mocking frameworks are often white-box tests, asserting that [such-and-such a method has (or hasn't) been called](https://sachithradangalla.medium.com/mockito-verify-how-to-test-method-invocations-8cf15be9bc19) in response to some inputs.

If you don't care about _how_ something is implemented -- just that that it does what it's supposed to do -- you should write a black-box test. This is usually the case, so opt for black-box tests as a default.

### Development-Informed Tests and Development-Informing Tests

Development-informed tests are written _reactively_, in that the production code is written first, and the tests are written afterward. Development-informed tests codify the behaviour of the system as-is. Traditional "unit tests" are almost exclusively development-informed tests.

Development-informing tests are written _proactively_, in that a test is written first, and the production code is written after. [Test-Driven Development (TDD)](https://en.wikipedia.org/wiki/Test-driven_development) is a software development methodology which encourages writing _only_ development-informing tests, ensuring that 100% of the system's behaviour is always codified in tests.

Development-informing tests can also provide confidence that some tricky piece of logic has been implemented correctly. For example, you might write a [regex](https://en.wikipedia.org/wiki/Regular_expression) to parse U.S. phone numbers, and -- at the same time -- add a handful of tests to ensure that you catch things like
- area codes surrounded by parentheses
- spaces vs. no spaces vs. hyphens
- the presence or absence of a `+1` country code

It can be hard to be sure -- just by staring at the regular expression -- that it catches all of these cases. Usually it's more convincing to just write a handful of simple tests to convince yourself that the most common edge cases are being handled correctly.

I always write bug fix tests in a development-informing way, as well. First, I write a test which _should_ pass, but which I expect to fail due to the presence of a bug. Then, I fix the bug in the production code, ensuring that the test now passes. This process shows that -- had the test existed originally -- it would have caught the bug. This gives confidence that the bug should not reappear in the future.

## "Most Unit Testing is Waste"

The three ways of looking at tests outlined above can provide insight into why developers like [James O. Coplien](https://wikileaks.org/ciav7p1/cms/files/Why-Most-Unit-Testing-is-Waste.pdf) believe that most unit testing is a waste of time.

### Most Unit Tests are Development-Informed

In my experience, TDD is not practiced by [_most_](https://www.reddit.com/r/ExperiencedDevs/comments/1g1xdqu/do_you_guys_use_tdd/) developers.

Most tests, therefore, are development-informed. A developer writes some production code and then writes a test, usually to ensure that some [code coverage minimum](https://www.atlassian.com/continuous-delivery/software-testing/code-coverage#:~:text=With%20that%20being%20said%20it,fairly%20low%20percentage%20of%20coverage.) is reached.

These tests are not written to catch bugs, and they are not written to help a developer think through some difficult implementation, and so their value is not immediately apparent.

### Most Unit Tests do not test "Externally-Visible System Behaviours"

As mentioned earlier, the twin practices of (1) breaking large functions up into smaller ones and (2) writing tests for each _function_ rather than for each _externally-visible system behaviour_ leads to a proliferation of tests tightly-coupled to the production implementation. These tests are, by their nature, fragile. They must be updated whenever the smallest implementation detail is changed, even if the externally-visible system behaviour is identical.

> This often happens when using mocking frameworks, since every method called on [a mocked object](https://www.digitalocean.com/community/tutorials/mockito-mock-examples) must be declared, with its return value specified.

In the worst-case scenario, developers will sometimes copy-and-paste the production implementation directly into the test, asserting that the "expected" result from the test implementation equals the "actual" result from the production code. This kind of white-box test unquestionably adds no value, even if it does increase "code coverage".

## A New Test Pyramid

The traditional [test pyramid](https://qase.io/blog/test-pyramid/) aims to emphasise to developers that they should be mostly writing "unit tests", with fewer "integration tests" and only a handful of "end-to-end tests". Although different formulations of the pyramid may use different terms for the latter two levels, almost all agree that the base of the pyramid should be composed of "unit tests". [Google recommends](https://testing.googleblog.com/2015/04/just-say-no-to-more-end-to-end-tests.html) a 70% / 20% / 10% split of unit / integration / end-to-end tests.

The idea is that you should cover most of the code's logic in small, fast tests which can be run over and over during the [inner loop of development](https://www.awwsmm.com/blog/drop-everything-and-review). Your integration tests should cover interactions between units; and your end-to-end tests should validate that an end user's actions result in some expected overall outcome.

That advice is fine, provided all developers agree what constitutes a "unit test" or an "integration test". Clearly this is not the case. (See the search engine results at the top of this blog post.) However, we can use the objective criteria above (fast vs. slow, black-box vs. white-box, development-informed vs. development-informing) to construct a New Test Pyramid.

![A New Test Pyramid](/blog/there-is-no-such-thing-as-a-unit-test/pyramid.png)

### The Base

Opt for black-box tests wherever possible. Where external dependencies are required, prefer [fake](https://stackoverflow.com/q/346372/2925434) implementations [rather than mocks](https://testing.googleblog.com/2024/02/increase-test-fidelity-by-avoiding-mocks.html) (and add corresponding contract tests to ensure that external dependency behaves as you think it does). This keeps the entire test in-memory, making it fast enough to run before each commit to `main` / `master`. You will find that most of your tests are these fast, black-box tests.

Note that this is _not_ synonymous with "unit test". As discussed above, traditional "unit tests" are usually fast, but are sometimes white-box tests, and are often development-informed.

### The Middle

Prefer development-informing tests over development-informed tests (prefer a TDD style of development). Development-informed tests are often written [by rote](https://www.merriam-webster.com/dictionary/rote) and offer little value.

Prefer slow black-box tests over fast white-box tests. The former are easier to maintain as they are less tightly-coupled to the production implementation.

Traditional "integration tests" and "end-to-end" tests both fall into the "slow, black-box tests" category.

### The Top

Write as few white-box tests as possible. That is, do as little code introspection as possible. Only test observable outputs.

Write development-informed tests only when necessary. If the production implementation works, it works. If it doesn't, you will find a bug, write a development-informing test, and fix the bug. This process is described above.

## Conclusion

The traditional unit / integration / end-to-end categorization of tests is fuzzy at best. Differing interpretations of what constitutes a "unit test", combined with well-intentioned but misapplied advice on keeping code readable by reducing the number of lines per function, class, etc. has led to a proliferation of hard-to-maintain, low-value test suites that negatively impact developer productivity.

Categorizing tests objectively, using the three criteria described above, can lead to more maintainable tests which provide more value.
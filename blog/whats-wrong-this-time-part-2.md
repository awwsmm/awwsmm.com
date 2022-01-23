---
title: "What's Wrong This Time? Part II: Electric Bugaloo"
description: "Debugging a New Feature in a Vercel TypeScript GitHub Repo"
---

**Part II: The Bugs**

There's an old programming joke that goes [something like](https://martinfowler.com/bliki/TwoHardThings.html)

> _There are only two hard problems in computer science: cache invalidation, naming things, and off-by-one errors._

I think we should add a third (fourth?) problem to that list: sorting things.

## Sorting Things

There are [lots of different ways to sort things](https://en.wikipedia.org/wiki/Sorting_algorithm) in computer science. C.S. students learn about time and space complexity of these sorting algorithms, YouTubers make [cool visualisations](https://www.youtube.com/watch?v=BeoCbJPuvSE) of them, and occasionally, [a guy named Tim](https://en.wikipedia.org/wiki/Timsort) will invent a new one.

But there's one aspect of sorting algorithms that -- for me, at least -- seems completely impossible: remembering in which direction things are sorted.

If you say to a group of people: "okay, everyone, stand in a single-file line, ordered by height", the next question you might ask is "okay, but in which direction?" Who should stand at the _front_ of the line? The shortest person or the tallest person?

In programming, we define comparison functions, which describe how to order whatever objects we're interested in.

Some comparison functions seem obvious. For example, in TypeScript, using the default `string` comparison...

```ts
const array: string[] = ["cherry", "apple", "banana"]
array.sort()
//...
```

...we would expect `array` to be sorted alphabetically, with `apple` as the first (`0`th) element of the sorted array

```ts
//...
console.log(array)    // [ 'apple', 'banana', 'cherry' ]
console.log(array[0]) // apple
```

> Note that `<array>.sort()` in JavaScript sorts the array "in place", so that the original, unsorted `array` no longer exists afterward. In some languages, and for some sorting algorithms, arrays are not sorted in place, and a new array will be returned. This new array should be assigned to a new variable.

But often we will be working with objects more complex than `string`s, and we will need to define custom comparison functions. These are functions which take two elements of type `T` and return a `number`, and are used to sort arrays of type `T`:

```ts
type T = string

const newArray: T[] = ["cherry", "apple", "banana"]

function comparison(t1: T, t2: T): number {
  return t1.charCodeAt(0) - t2.charCodeAt(0)
}

newArray.sort(comparison)

console.log(newArray)    // ?
console.log(newArray[0]) // ?
```

Without [reading the docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort), will the `console.log()`s above give the same result as the earlier ones? How about something a bit simpler -- sorting an array of `number`s:

```ts
type T = number

const newArray: T[] = [42, 2112, 19]

function comparison(t1: T, t2: T): number {
  return t2 - t1
}

newArray.sort(comparison)

console.log(newArray)    // ?
console.log(newArray[0]) // ?
```

Will the first element above be `19`? Or `2112`? Are you sure?

I understand the utility of sorting algorithms, and I understand the need for a ternary (greater than, less than, or equal) return value, and hence `number` as the return type instead of `boolean`, but comparison functions are just one of those things that I've always had to test every time. Sometimes in development, and sometimes in production.

## So What Happened?

With what we learned above, you should now be able to see what went wrong with [my initial code](https://github.com/awwsmm/awwsmm.com/commit/69e038a919e448251fa2211a9fcf3fda914812fe). The problem was here

```ts
    // get the blog post date from its git commit date
    const gitLog = SlugFactory.git.log({ file: `blog/${slug.params.slug}.md` });

    return gitLog.then(lines => {
      const dates = lines.all.map(each => each.date);

      // if blog post hasn't been committed yet, use current date
      const date = dates[0] ?? new Date().toISOString();

      return new FrontMatter(slug.params.slug, title, description, date, rawContent);
    });
```

`git log` returns commits sorted by date, such that _newer_ commits come first and _later_ commits come afterward. So `dates[0]`, above, is the _newest commit_ returned from `git log`, and each blog post was being given a "publication" date of the most recent commit in which that post was modified.

When were these blog posts most recently modified? Well, all of them were modified in [that same commit](https://github.com/awwsmm/awwsmm.com/commit/69e038a919e448251fa2211a9fcf3fda914812fe), because the point of the commit was to remove the `date` parameter from the front matter. Essentially, I was mixing up the `lastUpdated` date and the `published` date. One of these is the first element in the list (`dates[0]`) and one of them is the last element in the list (`dates[dates.length-1]`).

So like I said, there are four hard problems in computer science.

## On To The Next One

With that fixed, we're off to the races, right?

![Screenshot from awwsmm.com showing blog posts with incorrect dates](https://i.imgur.com/ME7yZQ9.png)

Oh... well, that's not right.

Those two posts were both committed on January 2 ([Hello, World!](https://github.com/awwsmm/awwsmm.com/commit/ec96618d38c71134f4a9ed14d6ae6d7a2b5c9e59) and [Git Hooks](https://github.com/awwsmm/awwsmm.com/commit/b2e504f52e4df0ddf77c662903e39b4aaf12f242)), not on January 6. So why did they both have the wrong date?

That's right, it's another bug... Or is it?

Find out in the _thrilling_ final installation of this debugging mystery! Stay tuned!
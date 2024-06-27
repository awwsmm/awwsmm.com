---
title: 'Solving for the Minimum Number of Unique Values in a Set'
description: 'Given only inequality relationships between members of the set'
published: '2024-04-29'
tags: ['scala', 'mathematics']
---

## Sayonara Scala Steward

One of my ongoing projects at work is developing and maintaining an in-house dependency updating solution for our code.

We used to use [Scala Steward](https://github.com/scala-steward-org/scala-steward) to keep our Scala projects up-to-date, but found that it [created a lot of noise](https://medium.com/permutive/scala-steward-without-the-noise-da7424f3c315) -- failed pipelines, merge conflicts, and new versions of software being released where the only change was a patch version bump to a dependency. 

We wanted a cleaner solution
- one update PR per week per repo, containing all of the dependency updates
- PRs with failed pipelines would be assigned to a "repo owner" who could resolve them during the week
- and next week, if that PR was still open, it would be closed in favour of a new one

The last point ensures that at most one dependency update PR is open at any given time for any project. This seriously reduces the mental overhead on the developer (usually, the team lead) tasked with handling these weekly update PRs.

This project is implemented in two parts.

First, there's the [`sbt-dependency-updater`](https://gitlab.com/improving-andrew/sbt-dependency-updater), which adds an `updateDependencies` task to any [`sbt`](https://www.scala-sbt.org/)-managed Scala project (as all of ours are). This task makes it easy to update all of the dependencies for a specific repo. (Note that the way in which these dependencies are updated is pretty primitive and could use some refinement.)

Second, there's a (privately-hosted) `dependency-updater` repo which uses GitLab pipelines and the GitLab API to clone a project, run `updateDependencies` in that project, and -- if there is a nonzero number of updates -- create a branch and MR against `master` / `main`, assigning the team lead to the MR.

It's all been working very smoothly for the past few months. Noise (both cognitive and pipeline) has decreased significantly, and dependencies are as up-to-date as they have always been.

But this blog post is not about that dependency updating software; it's about how we grouped our dozens of repos into "Tiers", based on dependencies, to ensure that everything is always as up-to-date as possible.

## Tiers

A repository of code has some list of dependencies (upstream libraries which it uses to do its job).

Suppose you have some `infrastructure` library which is depended on by most projects, and a `utilities` library which depends on `infrastructure`, and that most projects also depend on `utilities`.

In order to ensure that some project `a` has the latest version of `utilities` and the latest version of `infrastructure`, ideally with no transitive version conflicts, we want to do something like the following

1. update `infrastructure`'s dependencies
2. update `utilities`'s dependencies, which include `infrastructure`
3. update `a`'s dependencies, which include `utilities` and `infrastructure`

A natural step-by-step process has emerged. Here we introduce some terminology and say that projects which can be updated at the same time belong to the same "tier". For instance, if we have another project `b` which also depends on `utilities` and `infrastructure`, then `a` and `b` can be updated simultaneously (in the same CI pipeline) without any problems. But if `b` depends on `a`, then updating `b`'s dependencies should happen _after_ updating `a`'s dependencies. `b` gets bumped into a lower tier.

This begs the question: _what is the minimum required number of tiers for some set of projects with dependencies on each other_? In other words, by analyzing their dependencies, how can we efficiently group a set of projects into tiers such that updates to higher tiers efficiently "flow" into lower tiers during the course of the week's dependency updates?

## Problem Statement

Given a set of `N` values representing projects: `a`, `b`, `c`, `d`, and `e`, let inequality relationships between the values indicate dependencies between projects. For example, `a < b` indicates that `a` depends on `b`.

What is the minimum number of unique values that can be assigned to `a`, `b`, `c`, `d`, and `e`, given some set of `M` unique inequality relationships?

"Unique equality relationships" means `a < b` and `b > a` count as only a single relationship, because they are just two different ways to express the same information.

## Discussion

I'm not planning on _proving_ this in the mathematical sense, but I think we can come up with an intuitive solution by thinking through this problem logically.

Let's start with `M = 0`. This is the case where there is _no_ inequality information. In this case, there is no reason we cannot assume `a = b = c = d = e`, and put all dependencies in the same tier. The minimum number of unique values in this case is `1`, when there is only a single tier. So in the `M = 0` case, we have no inequality information, and `1` tier is sufficient when `N = 5` and `M = 0`.

`1` is the minimum number of unique values when `N = 5` and `M = 0`.

> Note that `a`, `b`, `c`, `d`, and `e` _could_ also have five unique values. This is always possible if we assume that there _exists_ some additional information which we are just not currently aware of. But the problem we are trying to solve is the _minimum_ number of unique values _required_ to satisfy the known information. 

In the `M = 1` case we have a single unique inequality, for example `a < b`. Here, we must have at least two unique values, since `a` and `b` are explicitly not equal; `b` is in tier `1` and `a` is in tier `2`. However, `c`, `d`, and `e` can fall into either tier without contradicting any known inequality information, so `2` is the minimum number of unique values when `N = 5` and `M = 1`.

`M = 2` is where things start to get interesting, because there are two kinds of scenarios here.

First, suppose our two known inequalities are `a < b` and `b < c`. This requires `a`, `b`, and `c` to have three unique values, and so we require three tiers. But if our two known inequalities are `a < b` and `a < c`, then it's possible that `b = c`, and only two tiers are required. In fact, we could have up to four inequalities and still only require two tiers, if `a < b`, `a < c`, `a < d`, and `a < e`. In this case, `b = c = d = e`, `a` is in tier 2, and all other projects are in tier 1.

So `2` is the minimum number of unique values when `N = 5` and `0 < M <= 4`.

But when `M = 5` something changes. If our initial four inequalities are `a < b`, `a < c`, `a < d`, and `a < e`, and we add a fifth unique inequality, we must split tier `1` into two tiers. For example, if `b < c`, then `a`, `b`, and `c` must exist in different tiers, and the minimum required number of tiers is `3`.

But like the `1 < M <= 4` case, we can continue to add inequalities for a while with only three tiers. If `b < d` and `b < e`, then it's possible that `c = d = e`, `a < b`, and `b < c`, and all of our previous inequalities still hold (`a < b`, `a < c`, `a < d`, `a < e`, `b < c`, `b < d`, and `b < e`).

So `3` is the minimum number of unique values when `N = 5` and `4 < M <= 7`.

You may be starting to see where this is going. If we add another inequality, say `c < d`, we require a fourth tier. But four tiers is also enough for _another_ inequality, `c < e`.

`4` is the minimum number of unique values when `N = 5` and `7 < M <= 9`.

Finally, when `N = 5`, we can have at most `M = 10` unique inequalities. For example: `a < b`, `a < c`, `a < d`, `a < e`, `b < c`, `b < d`, `b < e`, `c < d`, `c < e`, and `d < e`. This uniquely orders all projects `a < b < c < d < e` and requires the maximum number of `5` tiers.

`5` is the minimum number of unique values when `N = 5` and `M = 10`.

Let's recap. If `k` is the minimum number of unique values required, then, when `N = 5`

- when `M = 0`, `k = 1`
- when `0 < M <= 4`, `k = 2`
- when `4 < M <= 7`, `k = 3`
- when `7 < M <= 9`, `k = 4`, and
- when `M = 10`, `k = 5`

Writing this another way

- when `M = 0`, `k = 1`, else
- when `M <= 4`, `k = 2`, else
- when `M <= 4 + 3`, `k = 3`, else
- when `M <= 4 + 3 + 2`, `k = 4`, and
- when `M = 4 + 3 + 2 + 1`, `k = 5`

The [triangular numbers](https://en.wikipedia.org/wiki/Triangular_number) have emerged. If `T(N)` is the `N`th triangular number, then

- `T(0) = 0`
- `T(1) = 1`
- `T(2) = 3`
- `T(3) = 6`
- `T(4) = 10`

So we can re-express the above as

- when `M = 0`, `k = 1`, else
- when `M <= T(4) - T(3)`, `k = 2`, else
- when `M <= T(4) - T(2)`, `k = 3`, else
- when `M <= T(4) - T(1)`, `k = 4`, and
- when `M = T(4)`, `k = 5`

Since `M` is bounded by the range `[0, T(4)]` when `N = N`, this covers all possible values of `M` and `k`.

We can postulate that, for any set of `N` values, described only by `M` unique inequalities between values, the set must be composed of at least `k` unique values, where

- `M` is bounded by the range `[0, T(N-1)]`
- when `M = 0`, `k = 1`
- when `M = T(N-1)`, `k = N`, and
- `T(N-1) - T(k) < M <= T(N-1) - T(k-1)`

## Future Work

### Optimal Number of Tiers

The above reasoning was enough to convince me that this is procedure gives the correct _minimum_ number of tiers required for staggered, grouped dependency updates. But the next step is more difficult -- actually determining what those tiers should be.

It's easy to see that when `a < b` and `b < c`, we can construct three tiers...

- tier 1: `c`, `d`, and `e` (these receive dependency updates first)
- tier 2: `b` (then this project receives dependency updates)
- tier 3: `a` (and finally, this one)

...but that `d` and `e` can be put into any tier.

However, it's much harder to reason about what the tiers should be, and where projects should be placed on them, when you have dozens of projects with dozens of dependencies. We know the _minimum_ number of tiers from the above analysis, but we've also seen that this minimum is exceeded when we have dependency chains like `a < b < c`. Does the longest dependency chain determine the "optimal" number of tiers? Can we prove this? Can we turn this process into an algorithm?

### Circular Dependencies

Another possible extension to this problem is the idea of _circular dependencies_. In the real world, it's possible (though an anti-pattern) for `a` to depend on `b` while `b` depends on `a`. Notationally, we could express this with the `<=` operator, rather than `<`. If `a <= b` and `b <= a`, then it must be the case that `a = b`, and these two dependencies should be updated at the same time, on the same tier.

This _is_ the case in my real-world system, and the way I handle this is to update any tiers with circular dependencies _twice_. Here's how that looks

- `a v1` depends on `b v0` and `b v1` depends on `a v0`
- update `a` to depend on `b v1`, producing `a v2`; update `b` to depend on `a v1`, producing `b v2`
- at this point, `a v2` still (circularly) depends on the "old" `a v0` via `b v1`, and vice versa for `b v2`
- so update `a` again to depend on `b v2`, producing `a v3`; and update `b` again to depend on `a v2`, producing `b v3`
- now, we have `a v3 < b v2 < a v1` and vice versa for `b`, and the old dependencies are no longer brought in transitively (at least two levels deep)

How does the possibility of circular dependencies affect the minimum required number of tiers? How do we express that, when `a <= b`, for example, but we have no corresponding `b <= a`, that `a` and `b` should be in different tiers?

There's a bit more to think about here, but I'll leave that for another time.
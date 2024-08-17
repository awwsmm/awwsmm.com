---
title: 'Drop Everything and Review'
description: 'On prioritizing code review when developing software'
published: '2024-04-22'
tags: ['principles', 'software-development']
canonicalUrl: "https://www.improving.com/thoughts/drop-everything-and-review"
---

## The Inner and Outer Development Loops

Feedback is critical when developing software; the earlier it can be given, the better. Static code analysis tools will _immediately_ write <span style="text-decoration:underline;text-decoration-style:wavy;text-decoration-color: red;">red squigglies</span> underneath code, as it's being written, to let a programmer know that there's a syntax error. (In fact, as I'm writing this blog post, I'm getting blue underlines from my spellchecker.) Unit tests, similarly, give very quick feedback, validating the logic of any newly-written code, and ensuring that there are no regressions (that the new code doesn't cause previously-written tests to break).

This very fast code-build-test feedback loop is often called the [inner loop of software development](https://sourcegraph.com/blog/developer-productivity-thoughts). It requires no input from other people, and the time for a complete loop can be as short as the time it takes static analysis to run, which might be only a few hundred milliseconds. The only blockers in the inner loop are the speed of the compiler or interpreter and the speed at which the developer can program.

The _outer loop_, by contrast, usually refers to the process of deploying code to a live environment and iterating based on integration with the larger system, acceptance tests, performance tests, and so on (though [different](https://sourcegraph.com/blog/developer-productivity-thoughts) sources [disagree](https://docs.stakater.com/saap/for-developers/explanation/inner-outer-loop.html) about [which steps](https://notes.paulswail.com/public/The+inner+and+outer+loops+of+software+development+workflow) should be included in the [outer loop](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/yes-you-can-measure-software-developer-productivity)). This loop is much more involved and, accordingly, takes much more time to provide feedback to the developer. Depending on how fast your CI / CD pipeline runs, and whether your QA tests are automated or manual, it could take anywhere from minutes to days.

But I propose that there is a _middle loop_, as well, which often gets incorrectly lumped into the outer loop: the code review loop.

## The Middle Loop

The Middle Development Loop involves getting feedback from developers and other stakeholders, adjusting your code according to that feedback, and then requesting additional feedback. It is distinct from the inner loop, which is traced by a single developer in a single codebase in a single environment, as well as from the outer loop, which is traced by many developers across many environments. The key differentiator here is that this is the first time that multiple stakeholders will be looking at the same new bit of code.

This often happens during code review, but feedback can come in many forms: pair programming, mob programming, [synchronous code review](https://glia.engineering/the-case-for-synchronous-code-reviews-51a19b76b7b7), as well as traditional asynchronous code review. The latter is, in many workplaces, the standard: you create a PR, add some reviewers, and go off and do something else while you wait for feedback.

![https://xkcd.com/303/](/blog/drop-everything-and-review/approvals.png)

This is usually fine, provided you have lots of tasks to work on and can context switch easily from one to another while waiting for reviews. And while this is often the case, in my experience, the opposite happens just as often: you're building some feature across multiple code bases, or in multiple steps, and you need reviews and approvals at each stage. In this case, each time a review is required, it becomes a blocker.

Developers can get frustrated waiting for reviews and glob multiple fixes into a single PR to reduce the number of reviews required, or they might ping other developers directly to ask for reviews. Those pinged might be taken out of their [flow state](https://github.blog/2024-01-22-how-to-get-in-the-flow-while-coding-and-why-its-important), or even feel harassed, if contacted over and over.

For all parties involved, it can be a very frustrating experience.

If you have the power to do so in your organization, push for [synchronous code reviews](https://glia.engineering/the-case-for-synchronous-code-reviews-51a19b76b7b7), which greatly reduce the size of the middle loop, or for synchronous _coding_, like pair or mob programming, which eliminates the middle loop entirely. For many reading this, though, I know this is not an option. You've got async code reviews and you're stuck with them. In that case, let's try to make the best of a less-than-ideal situation: what is it that makes async review frustrating?

The problem with async code review is that it often unnecessarily inflates the duration of the middle loop.

Code review can be a thankless job. When's the last time you heard of someone getting promoted for being the most thorough reviewer on a team? Plus, it's easy to hide in a crowd, and if 10 developers are added as reviewers to a PR which only needs 2 approvals, they may ignore the request, assuming that their teammates will pick up the slack. Even when a developer _does_ review some code, they may delay doing so. Waiting until you're finished your current task, or until after lunch, or even until after your next meeting, to review a PR may not seem like a delay for you. In fact, in may seem downright prompt. But to the developer waiting for a review to continue their work, they are blocked.

The next time _you_ put up a PR, you will _also_ need reviews. And just like your coworkers, you will want them as quickly as possible. So remember that when someone requests a code review, the courteous thing to do is to **Drop Everything and Review (DEAR)**.

## Minimize the Middle Loop, Dear

After handling any active production incidents, the first thing on a developer's <span style="white-space: nowrap"> `// TODO` </span> list should _always_ be reviewing code.

If you've just sat down at your desk and are looking for something to work on, checking which pull requests you've been assigned to should become a reflex.

Don't start that little bug fix, don't read that next blog post (unless it's this one), don't check your inbox.

Remember **DEAR** and do the courteous thing: Drop Everything and Review.
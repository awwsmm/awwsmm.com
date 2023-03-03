---
title: "What's Wrong This Time? A Debugging Mystery in Three Parts"
description: "Debugging a New Feature in a Vercel TypeScript GitHub Repo"
published: '2022-01-16'
lastUpdated: '2022-01-23'
---

**Part I: The Idea**

## _"I have an idea"_*, I said to myself.

"What if, instead of adding arbitrary dates to blog posts as I write them, I just got the dates from git?"

> [Git](https://git-scm.com/) is a [version control system](https://www.atlassian.com/git/tutorials/what-is-version-control) used by software developers which tracks changes to files, as well as creation and deletion of files. Every change, addition, or deletion is timestamped and has a [hash](https://en.wikipedia.org/wiki/Hash_function) which uniquely identifies those changes, like a fingerprint.

"[Each git commit](https://github.com/awwsmm/awwsmm.com/commits/master) has a date, so I should be able to programatically determine when a file in my [repo](https://www.gitkraken.com/learn/git/tutorials/what-is-a-git-repository) was added, or edited."

That was my idea for simplifying the metadata ("front matter") that I add to each of my blog post files on [my website](https://github.com/awwsmm/awwsmm.com). Before this adventure, that metadata looked [something like this](https://raw.githubusercontent.com/awwsmm/awwsmm.com/ec96618d38c71134f4a9ed14d6ae6d7a2b5c9e59/blog/hello-world.md):

```txt
---
title: 'Hello, World!'
description: 'Rewriting My Personal Website in Next.js and TypeScript'
date: '2022-01-01'
---
```

What I wanted to do was get rid of that arbitrary `date` field I was adding to every blog post, and just let git tell me when I published or updated a file. I could pull this information from the history of file changes that git keeps track of.

Sounds relatively simple, right?

Well, there were a few roadblocks to getting this up and running. Before we get into them, let's take a look at my initial, quick-and-dirty solution.

## First Attempt

### Git background

When working locally (on your personal computer), you can interact with git using the command line. One command, [`git log`](https://git-scm.com/docs/git-log), gives a list of all of the changes saved ("committed") to the project

```txt
$ git log --oneline -n 5
b6eea85 (HEAD -> master, origin/master, origin/HEAD) Merge pull request #15 from awwsmm/development
bc222b3 (origin/development, development) automatically date blog posts using git history
88c4208 order blog posts on index page reverse chronologically
9368f24 new blog post about nominal, structural, and duck typing
6bbe307 Merge pull request #1 from awwsmm/development
```

The options I passed to `git log`, `--oneline` and `-n 5`, tell git that I only want one line of minimal information for each commit (just the hash and the first line of the commit message), and that I only want the five most recent commits. By default, git shows something like

```txt
$ git log
commit b6eea85256fe54f34013f17aca4e892aba0778dd (HEAD -> master, origin/master, origin/HEAD)
Merge: 88c4208 bc222b3
Author: Andrew <aww@awwsmm.com>
Date:   Fri Jan 14 19:01:11 2022 +0000

    Merge pull request #15 from awwsmm/development

    automatically date blog posts using git history
```

...with the commit hash, the commit message, the date of the commit, the author, and so on. But lots of other options can be set for `git log`, for instance, specifying a hash will show only that commit and its ancestors (commits that came before it), and `--name-only` shows the names of all files modified in that commit

```txt
$ git log bc222b3 --name-only -n 1
commit bc222b37913ec2cdd7ff5f152dfaca06d33ec9f3 (origin/development, development)
Author: Andrew Watson <aww@awwsmm.com>
Date:   Fri Jan 14 18:54:39 2022 +0000

    automatically date blog posts using git history

.gitignore
README.md
blog/cache.json
blog/git-commit-hooks.md
blog/hello-world.md
blog/nominal-vs-structural-vs-duck-typing.md
lib/blog/FrontMatterFactory.ts
lib/blog/SlugFactory.ts
package-lock.json
package.json
pages/blog/[slug].tsx
pages/index.tsx
```

You can also pass a file path to `git log` and it will only show you commits in which that file was modified

```txt
$ git log blog/hello-world.md
commit bc222b37913ec2cdd7ff5f152dfaca06d33ec9f3 (origin/development, development)
Author: Andrew Watson <aww@awwsmm.com>
Date:   Fri Jan 14 18:54:39 2022 +0000

    automatically date blog posts using git history

commit ec96618d38c71134f4a9ed14d6ae6d7a2b5c9e59
Author: Andrew Watson <aww@awwsmm.com>
Date:   Sun Jan 2 12:11:54 2022 +0000

    attempting to deploy to Vercel
```

That's all well and good, but I wanted to get this information when building my website, which is written in TypeScript. So I would need a TypeScript or a JavaScript library to be able to do this easily. That's where [`simple-git`](https://www.npmjs.com/package/simple-git) comes in.

### Git in TypeScript

`simple-git` is a JavaScript library which [allows you to run git commands](https://github.com/steveukx/git-js) from within TypeScript / JavaScript code.

For instance, instead of the above `git log blog/hello-world.md`, we can write something like

```ts
import simpleGit from 'simple-git'

const git = simpleGit()
const logResult = await git.log({ file: 'blog/hello-world.md' })
const commits = logResult.all
```

Then, we can loop over all commits and easily access each commit's data

```ts
commits.forEach(commit => {        // example:
  console.log(commit.author_email) // aww@awwsmm.com
  console.log(commit.author_name)  // Andrew Watson
  console.log(commit.body)         //
  console.log(commit.date)         // 2022-01-14T18:54:39+00:00
  console.log(commit.diff)         // null
  console.log(commit.hash)         // bc222b37913ec2cdd7ff5f152dfaca06d33ec9f3
  console.log(commit.message)      // automatically date blog posts using git history
  console.log(commit.refs)         // origin/development, development
})
```

So that should be it: when compiling the project, we should be able to use this library to get all log lines which refer to a specific file. The most recent one should be the `lastUpdated` date of the file, while the least recent one should be the `published` date of the file.

[I quickly coded this up](https://github.com/awwsmm/awwsmm.com/commit/69e038a919e448251fa2211a9fcf3fda914812fe), ran it locally, and everything looked fine. I thought that would be the end of the story.

But then I pushed it to production.

## First Problem

The first problem I hit was that all of my blog posts now had the same date (which at the time was the current date):

![Screenshot of awwsmm.com showing multiple blog posts with the same date](https://i.imgur.com/C0WGWdp.png)

Do you see any problems with [the code I wrote here?](https://github.com/awwsmm/awwsmm.com/commit/69e038a919e448251fa2211a9fcf3fda914812fe)

What's going on here?

Check out the answer in [the second part of this series](https://www.awwsmm.com/blog/whats-wrong-this-time-part-2).

---

> \* This is the traditional phrase for conjuring bugs in your programs. See also: _"I'll just do a little refactoring"_.
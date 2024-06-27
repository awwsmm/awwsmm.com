---
title: "What's Wrong This Time? Part III: The Deep End"
description: "Debugging a New Feature in a Vercel TypeScript GitHub Repo"
published: '2022-03-06'
---

**Part III: The Deep End**

At this point, I wasn't sure where to go next.

Why should [these blog posts now have a seemingly random publication date](https://www.awwsmm.com/blog/whats-wrong-this-time-part-2), which was not the current date, and was not the date they were first added to the repo? What was going on?

So I did what most programmers do in a situation like this: I added some `console.log()`s.

## Digging Deeper

I wanted to know what commits were available, and what information they had. In other words, I wanted better [_observability_](https://dzone.com/articles/rethinking-programming-automated-observability) into what was going on in this bit of the codebase.

My first idea was to just [print out the dates of every line returned from `git log`](https://github.com/awwsmm/awwsmm.com/commit/a43bf7c356aa4b649ddfbf26528a454ae94bd807). The output of that (for a given blog post) looked something like

```
lines returned from git log
2022-01-09T20:48:23+00:00
2022-01-06T09:18:41+00:00
```

...okay, not extremely useful. Why are there only two commits here? This is just the same information we had on the website. Maybe [printing out the hash of each commit](https://github.com/awwsmm/awwsmm.com/commit/0477f384c0cb604c8cd4b64307c1b37b150575dc) would be a bit more helpful? Then I could check if there was anything unusual about these commits

```
lines returned from git log
69e038a919e448251fa2211a9fcf3fda914812fe @ 2022-01-09T20:48:23+00:00
d5cf8fbc05891ac9d8d7067b5cb1fb195dc2cf99 @ 2022-01-06T09:18:41+00:00
```

Now we can search GitHub for that commit [`dc2cf99`](https://github.com/awwsmm/awwsmm.com/commit/d5cf8fbc05891ac9d8d7067b5cb1fb195dc2cf99).

But this commit doesn't add or update _any_ blog posts... so why is it being returned from `git log <path/to/blogpost>`?

What if I `git log`ged a file that has _definitely_ been around since the first commit, like `index.tsx`. I tried printing out every log line for this file and saw the following on Vercel

```
lines returned from git log index.tsx
69e038a919e448251fa2211a9fcf3fda914812fe @ 2022-01-09T20:48:23+00:00
88c420835d35a008de808b7cef04980a15b029bc @ 2022-01-09T12:55:49+00:00
0a882cf5062e4c0ac4505ed609ca77f14b35a76a @ 2022-01-08T20:15:44+00:00
d4a9a360c38398cdd41825aa0fe193e8176cb4fd @ 2022-01-07T22:41:52+00:00
3acb76c1f6c6d1b4cdb76939496e251220aa29ea @ 2022-01-06T20:09:17+00:00
```

It only goes back five commits! The commit history looked the same for other long-lived files as well. Only ever going back to that last commit on January 6.

Running the same code on my local machine gives many more commits, going back all the way to the first commit on January 2.

What gives?

## The Shallow End

At this point, I wasn't sure how much more debugging I could do. So I started doing a bit of research.

And I found [this issue ("How to unshallow repo?")](https://github.com/vercel/vercel/discussions/5737) on the Vercel GitHub repo

> _"Hello, I need to define a variable at build time that depends on `git describe` which depends on git history, but it seems the repo in vercel build enviroment is a shallow clone with only few last commits."_

That sounds like my problem! And it sounds like it's caused by Vercel making [a _shallow clone_ of my git repo](https://www.perforce.com/blog/vcs/git-beyond-basics-using-shallow-clones) before building. I'd never encountered shallow cloning _in the wild_ before, but I knew of it as a concept, which is how I found that GitHub issue.

So how can we work around this? We simply won't have the information available at build time to determine the correct "published" and "last updated" dates for a given blog post.

But there's always a way to work around these kinds of limitations. In this case, that involves a cache.

## Cache Rules Everything Around Me

There are a few ways we could solve this problem. We could, for instance, use the GitHub API to pull commit information from the repo hosted on GitHub.com. I chose not to do this as I preferred to keep the solution self-contained: we have all the information available at build time _when running locally_, so how could we make that information available when building _for production_ (on Vercel), as well? (Where we'll have a shallow clone of the repo.)

Rather than make API calls over the internet for information which is available locally, I thought we could simply save this information in a cache, and then use that cache when building on Vercel.

The workflow I came up with for writing blog posts (and caching the important git info) looked something like this

1. draft a `wip-` post (these are [ignored for version control by my `.gitignore`](https://github.com/awwsmm/awwsmm.com/blob/4281812447b58b08bcd613530e4d8db2b1855be6/.gitignore#L23))
2. when the draft is ready, `git commit` it to the `development` branch and push to Vercel
3. for...
    - new blog posts (where the only commit in `git log` is the current commit), Vercel assumes the post is brand-new and uses the date of the current commit for the "published" and "last updated" times
    - old blog posts (where more than one commit references this blog post), Vercel looks for cached "published" and "last updated" times, and throws an error if it doesn't find any

There are a few small problems with this.

First, when do we update the cache? You'll notice that there is no step in the workflow above for ensuring that the cache is up-to-date. Since we only have access to the required information when building locally, we have to update the cache when building locally. But when does this information get pushed to the remote repo? We have to enforce that, as well.

Second, the above workflow has a problem when we merge the `development` branch into the `master` branch when promoting a new release to production -- the merge commit itself means that the "new" blog post is now in two commits. As outlined above, this will cause Vercel to throw an error if the post isn't in the cache (it won't be).

## So... What Now?

I've got some hacky fixes for the above problems implemented.

For instance, I've got a [pre-push git hook](https://github.com/awwsmm/awwsmm.com/blob/4281812447b58b08bcd613530e4d8db2b1855be6/git-hooks/pre-push) which runs a build before each `git push`. This means that -- in theory -- the cache is always up to date. But of course, I need to make sure to `git add` it in the _next_ commit.

As for the "merging creates a new commit" issue, I've tried two solutions so far.

The first was to distinguish between commits on the `development` branch and commits on the `master` branch. Only blog posts with commits on `master` should be considered as "old". This works great when running locally, but the clone that Vercel creates seems to _rename_ this `development` branch to `master` when building a preview deployment. So that's a no-go.

The second solution (which I'm currently using) is to simply [ignore merge commits](https://github.com/awwsmm/awwsmm.com/blob/4281812447b58b08bcd613530e4d8db2b1855be6/lib/blog/SlugFactory.ts#L28).

So far, the above appears to be working. But it feels like an overly complex and fragile solution, and I hope to improve upon it in the future. Maybe just querying GitHub for the commit history is easier than going through all of this cache trouble.

## Conclusion

So that's it! The goal was simple: get rid of arbitrary "published" times on blog posts and pull that data directly from the project's git history. But the solution ended up being much more complex and nuanced than I had initially planned.

But along the way, I learned some new tools and tricks, I learned a bit more about how my repo is built and deployed on Vercel, and I have some ideas for how I can make things more streamlined in the future. And that's what this is all meant to be, really, a learning experience.

In the future, maybe I'll do away with this overly-complex caching mechanism, but I do want to get the "published" and "last updated" dates from the repo's git history. This initial solution, while messy, does the job for now.
---
title: 'Software Development is About Compromise'
description: 'A Case Study in Building a Website using Next.js'
published: '2023-04-09'
tags: ['software-development', 'nextjs']
---

## Trade-Offs in Software Development

> "Where's all my CPU and memory gone?"
>
> -- [thegeomaster](https://news.ycombinator.com/item?id=14868999)

### Software development is -- and has always been -- about trade-offs.

The [CAP theorem](https://en.wikipedia.org/wiki/CAP_theorem) tells us that we need to choose between consistency, availability, and partition tolerance when designing distributed data stores.

[Caches](https://www.indeed.com/career-advice/career-development/cache-pros-and-cons) can make information available more quickly, but it might be out of date, and it will definitely use more storage space than making a fresh request each time.

And, as always, money can be a factor. [SSDs are faster than HDDs](https://reviewed.usatoday.com/laptops/features/ssd-vs-hdd), but they are more expensive per GB. And microservices in a distributed system should each have their own database, but cloud computing costs can mean that shared DBs are more cost-effective.

Weighing the pros and cons of varied solutions to a problem was something I needed to tackle recently when redesigning part of my personal website, [awwsmm.com](https://awwsmm.com). Here's how that went down...

## A Case Study: My Website

### The Setup

My website is a pretty minimal Next.js site, written in TypeScript, hosted [on GitHub](https://github.com/awwsmm/awwsmm.com), built and deployed [by Vercel](https://vercel.com/).

In general, Next.js allows you to have two kinds of pages: static pre-rendered pages, and dynamic pages, rendered "just in time", when a visitor to your website tries to visit that page.

My website has static [blog posts](https://www.awwsmm.com/blog), as well as ["project" pages](https://www.awwsmm.com/projects), which give a quick overview of personal projects that I've been working on lately.

My initial design was for a given project page (for example, [this one for my website itself](https://www.awwsmm.com/projects/awwsmm.com)) to have an up-to-date commit history, interleaved with occasional "log entries", summarizing big sweeping changes made to these projects. (Kind of like release notes, but with more detail behind _why_ certain changes are being made.)

So what was the problem?

### The Problem

The problem was that these project pages were statically rendered; they were built in advance.

I would [request the commit history of a project from GitHub](https://github.com/awwsmm/awwsmm.com/blob/cfec0c66a0cf1ba8cc54459ee77c85b707d21d61/lib/utils/ProjectUtils.ts#L59) and write it to a local cache, saved in the repository.

When [a new PR is opened](https://github.com/awwsmm/awwsmm.com/pull/74) against the repo containing my website, Vercel runs a test deployment. When the test deployment looks good, I hit "merge" and the new changes are added to the repo in a merge commit.

But, because the cache is created only when I'm developing locally, _this merge commit is not a part of the commit history in the cache._ It couldn't possibly be. It would require updating the cache file, which would introduce changes not included in that commit, which would require another commit, ad infinitum.

This means that the commit history for the `awwsmm.com` project page is _always_ at least one commit behind `master`.

This bothered me, and I wanted to see if I could fix it.

### First Attempt: Environment-Aware Caching

[My first attempt at a solution](https://github.com/awwsmm/awwsmm.com/commit/569a6368f7bd115a13aa219b398b4bf23eab04ad#diff-e1998422d9b0a8903593c437a2bf074f2d47e10bede05c333e3a2312797ca486) was (what I'm going to call) "environment-aware caching".

What if, after the deployment passed and the new PR was merged into `master`, Vercel ignored the cache, only using it as a backup? During deployment, we could hit the GitHub API again, which should then have the new commit, right?

This required knowing which environment the build was running on. This is straightforward, as Vercel populates [a `VERCEL_ENV` environment variable](https://vercel.com/docs/concepts/projects/environment-variables/system-environment-variables) to `"production"`, `"preview"`, or `"deployment"`, depending on where the build is running.

But this also required maintaining a cache which we hopefully would never fall back to, which seemed kind of silly.

It also meant that each release would have to be deployed at least twice: once to satisfy the checks before merging the PR, and once after the PR was merged to pick up the new commit on `master`. I'd have to remember to do this "double deployment" to keep things up-to-date.

Finally, there was some human error here in that I tried to use [the same caching mechanism for "last updated" dates on my blog posts](https://github.com/awwsmm/awwsmm.com/commit/cb38f6411859de4586f945eaae6231ebcd87a78f#diff-8779cf4bd89603a2f8a50f4ea24460afbd79e6d8b65ba8575183d02f47cf074b), confusing the issue.

All in all, this solution was pretty complex to maintain (all I want is a static blog), and it put me off of keeping my website up-to-date for a while. When I finally came back here after a few months, I decided that a simpler solution was in order.

### Second Attempt: Server-Side Rendering

So how about trying to [render the project pages "just in time"?](https://github.com/awwsmm/awwsmm.com/commit/5daf1b29cbdcafa7f26f6fed340adbfc6482df2e#diff-dc938814c5900cd48c67f3c5b743ac02c3d0730245e9fa633d02e9fef4cdb801R104)

Vercel's [server-side rendering (SSR)](https://vercel.com/blog/nextjs-server-side-rendering-vs-static-generation) also generates static pages, but it renders them only when the user navigates to the page, not during deployment.

"This is great!" I thought. I could just request the commit history when the page is requested, and it would always be up-to-date.

Unfortunately, requesting and processing 100 commits from GitHub seemed to be too much to ask. I was consistently waiting about 3 seconds for the page to load, which is [really bad](https://web.dev/ttfb/). Project pages with shorter commit histories loaded a bit faster, but there was still a noticeable delay. Sending the request to GitHub, awaiting a response, processing the response, generating the resulting page, and displaying it just took too much time.

This approach would also send a request to GitHub _every time_ a user loaded that page.

This second issue could be solved by [fine-tuning the `Cache-Control`](https://github.com/awwsmm/awwsmm.com/commit/d6eb611eb5d9c746670cceeffc0fecfe32fd0817#diff-dc938814c5900cd48c67f3c5b743ac02c3d0730245e9fa633d02e9fef4cdb801R105-R123) header sent along with the request, such that I could guarantee that the 5000-requests-per-hour (authenticated) limit would never be exceeded.

But the first issue remained a problem.

### Third Attempt: Non-Blocking Server-Side Rendering

"Maybe I'm the problem" I thought.

"Maybe it's the way I (think I) am blocking inside of `getServerSideProps`."

[I rearranged this method](https://github.com/awwsmm/awwsmm.com/commit/ea8ec00ed8905f55d6bb780df5535dcb459af638) to not `await` anywhere, but return a `Promise` which is a result of other `Promise`s chained together with `then`, and nothing else.

I was hoping that, with everything done in a non-blocking way in the return value, Vercel could work some magic to speed up the call. (Maybe it could run the request as soon as the user _hovered over_ the link to the page?)

But it didn't help. I was still stuck at ~3 seconds of loading time. Worth a try, at least.

### Fourth Attempt: GraphQL

"Maybe the response from GitHub is taking so long because it's returning too much data?"

I wasn't using _most_ of the response anyway; all I cared about was the commit hash, the message, and the date. I'd never used GraphQL before, but I knew that it could be used in situations like this, where you wanted to request only _particular_ data from an endpoint.

So I learned enough about GraphQL and GitHub's API to [request only the commit data I cared about](https://github.com/awwsmm/awwsmm.com/commit/f6260bbc9bd1d181fbf3f613a73008f1cfe53e4c#diff-93b7ed2c3a46038993bf9d2c1478cc9dbb3f14e3beeafd30cb21983fbfc75befR67-R79).

This sped up the page a bit _locally_ but not in production on Vercel. It was still taking about 3 seconds.

### Fifth Attempt: Timeout / Fallback to Cache

"Well, if it's loading fast enough locally, but not remotely, maybe I can set a timeout threshold?"

My thought was that I could [cache](https://www.google.com/search?q=time+is+a+flat+circle) a "stale" version of the page to display if the "live" version of the page took too long to load. Maybe longer than 500ms or so.

So I would now [generate a cache when building locally](https://github.com/awwsmm/awwsmm.com/commit/927db29fb8cdfb53402d8a7aeff047503ec36ff1#diff-93b7ed2c3a46038993bf9d2c1478cc9dbb3f14e3beeafd30cb21983fbfc75bef), and save the cache to the repo. In production, I would attempt to request fresh data from GitHub, but if it took longer than 500ms, I would fall back to the cache.

...but it still took 3 seconds to render the page remotely.

"Why?" I thought, pulling my hair out in frustration.

Other project pages loaded quickly... maybe Vercel was just (somwehow?) slow to process this 600-line JSON file, generate the hundreds of components for it, style all of them, and display them.

I found [issues on the `vercel` repo](https://github.com/vercel/vercel/discussions/7961) of people complaining about similar problems. Maybe it just took a few seconds for Vercel to spin up a runner to render the page? (That didn't seem to square with the load times of the other project pages.)

I took solace in the fact that other people on the Internet _also_ thought that [`getServerSideProps` is weird](https://www.youtube.com/watch?v=1er7Zqs_h9k) and unintuitive.

I assessed other possible avenues for investigation: [timing the response?](https://web.dev/custom-metrics/?utm_source=devtools#server-timing-api), [actually reading the docs? (no thanks)](https://vercel.com/blog/nextjs-server-side-rendering-vs-static-generation), incremental static generation?, [edge functions?](https://vercel.com/docs/concepts/functions/edge-functions).

I was beginning to lose the will to live... all I wanted was a blog.

## Regrouping

I took a breather and came back to it all after a little while.

"What is it I actually want?"

- up-to-date commit histories
- fast page loads

The problem was that those two things were -- if not mutually exclusive, at least -- in competition with each other. Up-to-the-second commit histories would require a request to GitHub as soon as the user requested the project page. Which meant that all of the data fetching, and processing, and rendering would have to be done _quickly_.

This didn't seem like too big of an ask to me, but apparently it was. Maybe it was my code, maybe it was the Lambda cold start times, maybe it was something on Vercel's end... whatever it was, it was pinning me to 3-second page load times.

"Maybe I can request and process _most_ of the history in advance, then only request _recent_ history when a user clicks on a page?"

This sounded overcomplicated, though. (Unlikely, but) what if a project had had 100 new commits since I last deployed my website (and generated the cache)? Then I would have the same problem: trying to request and render 100 commits onto this history page.

[So I compromised](https://github.com/awwsmm/awwsmm.com/commit/34ee82581280b28da6041b4966da0d423665b885), and came up with a simpler solution:

1. generate `project/` pages statically

   This solves the load time issue -- by the time we get to production, the pages will have already been generated, so nothing needs to be done except displaying them.
   
   But this means that we will not have an up-to-date commit history.

2. accept that the commit history will not be up-to-date

   I'd already sunk so much time into this, I was ready to compromise.

   Nobody coming to my website will care if my commit histories are slightly out of date. So I decided to just put a disclaimer at the top and bottom of the histories, saying something like "for the most up-to-date commit history, see GitHub".

Now, we can generate pages in advance, keep load times to basically zero, and we don't have to worry about complex caching solutions, or what environment the build is running in, or GitHub rate limits, or anything.

My compromise was that my time and energy were worth more to me than having this one feature on my website be exactly the way I had envisioned it initially.

## Software Development is About Compromise

In my case, I tried and tried to get my website to do what I wanted it to, but my two requirements: up-to-date commit histories and fast loading times, were in direct competition with each other.

Having an up-to-date history will require a request when the user clicks the button, and processing the result of that request, which will take time.

Surely there are more complex solutions which balance these two better, but in the end, having these pages be up-to-date is not critical for my blog. Choosing where to use my time is another trade-off. I learned a lot about Vercel, GraphQL, and Promises in JavaScript / TypeScript during this process, but ultimately, "see GitHub" is good enough for me. And that's a compromise I'm willing to accept.
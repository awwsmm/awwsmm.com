import simpleGit, {SimpleGit} from 'simple-git';
import { FrontMatter } from './FrontMatter';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { Post } from './Post';
import Slug from './Slug';

type CacheEntry = { slug: string, lastUpdated: string, published: string }

export default class SlugFactory {

  private static readonly git: SimpleGit = simpleGit();

  // Get the dates of all git commits
  // - in development, this will be _all_ commits
  // - in production, this will be only recent commits, as Vercel only does a shallow clone of the repo
  //     - see: https://github.com/vercel/vercel/discussions/5737

  static getAll(): Slug[] {
    const fileNames: string[] = fs.readdirSync(Post.directory);
    return fileNames.filter(fileName => fileName.endsWith('.md')).map(fileName => new Slug(fileName.replace(/\.md$/, '')));
  }

  // TODO move this to a Utilities class
  // Is this running on Vercel? Check some env vars unlikely to be set locally to determine this
  //   ex:
  //     process.env.VERCEL:                1
  //     process.env.VERCEL_ENV:            preview
  //     process.env.VERCEL_URL:            awwsmm-com-d3xso77cm-awwsmm.vercel.app
  //     process.env.VERCEL_GIT_REPO_SLUG:  awwsmm.com
  //     process.env.VERCEL_GIT_PROVIDER:   github
  //     process.env.VERCEL_GIT_REPO_OWNER: awwsmm

  private static onVercel: boolean = process.env.VERCEL === '1' && process.env.VERCEL_GIT_REPO_SLUG === 'awwsmm.com';

  // in-memory cache
  private static inMemoryCache: CacheEntry[] = [];

  // on-disk cache file
  private static readonly cacheFile: string = path.join(Post.directory, "cache.json");

  // write cache to disk when in local development mode
  private static writeCacheToDisk(cache: CacheEntry[]): void {
    const contents = JSON.stringify(cache, undefined, 2);
    fs.writeFileSync(SlugFactory.cacheFile, contents);
  }

  // read cache from disk when this class is created
  private static readCacheFromDisk(): CacheEntry[] {
    try {
      return JSON.parse(fs.readFileSync(SlugFactory.cacheFile, 'utf8'));
    } catch (error) {
      console.log("Error reading blog/cache.json. Returning empty cache."); // eslint-disable-line no-console
      return [];
    }
  }

  static async getFrontMatter(slugWrapper: Slug): Promise<FrontMatter> {
    const { slug } = slugWrapper.params;
    const fullPath = path.join(Post.directory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const rawContent = matterResult.content;

    // get all (non-merge) commits on the branch (master branch only, because that's all Vercel will know about)
    const allCommits: readonly { date: string, hash: string, message: string }[] =
      await SlugFactory.git.log([ 'master' ]).
      then(commits => commits.all.filter(commit => commit.message != "Merge branch 'development'"));

    // get the most recent commit, ignoring merge commits
    const mostRecentBranchCommit = allCommits[0];

    // get all (non-merge) commits related to this post (master branch only, because that's all Vercel will know about)
    const postCommits: readonly { date: string, hash: string, message: string }[] =
      await SlugFactory.git.log([ 'master', `blog/${slug}.md` ]).
      then(commits => commits.all.filter(commit => commit.message != "Merge branch 'development'"));

    // get the oldest and most recent post commits, ignoring merge commits
    const oldestPostCommit = (postCommits.length > 0) ? postCommits[postCommits.length - 1] : undefined;
    const mostRecentPostCommit = (postCommits.length > 0) ? postCommits[0] : undefined;

    console.log(`${slug} all commits:`);
    allCommits.forEach(commit => console.log(commit.hash.slice(0,7) + " @ " + commit.date));
    console.log(`${slug} post commits:`);
    postCommits.forEach(commit => console.log(commit.hash.slice(0,7) + " @ " + commit.date));

    // update the cache only when we're in development (not running on Vercel)
    const env = process.env.NODE_ENV;
    const branch = await SlugFactory.git.branch().then(branchSummary => branchSummary.current);

    // if we're on Vercel, we have a shallow Git clone and only a 'master' branch
    if (SlugFactory.onVercel) {

      // fine to not use in-memory cache here as on-disk cache is static on Vercel
      const cache = SlugFactory.readCacheFromDisk();
      const cacheIndex = cache.findIndex((entry) => entry.slug === slug);
      const inCache = cacheIndex >= 0;

      // test our assumptions
      if (branch != 'master')      throw Error(`Expected branch name to be "master" but found "${branch}"`);
      if (allCommits.find(commit => commit.hash.startsWith('0144e41')) != undefined) throw Error(`Found origin commit but was expecting this to be a shallow clone`);
      if (env != 'production')     throw Error(`Expected env == "production" but found "${env}"`);

      // every blog post should either
      //   1. be brand new (only appear in the most recent commit), or
      //   2. be old (appear in at least one commit older than the most recent one, and be recorded in the cache)

      if (oldestPostCommit == undefined)     throw Error("oldestPostCommit is undefined");
      if (mostRecentPostCommit == undefined) throw Error("mostRecentPostCommit is undefined");

      // (1) a blog post only appears in a single commit
      if (postCommits.length == 1) {

        if (oldestPostCommit.hash != mostRecentPostCommit.hash) throw Error("Expected oldestPostCommit to equal mostRecentPostCommit");

        const onlyPostCommit = oldestPostCommit;

        console.log(`only post commit:          ${onlyPostCommit.hash.slice(0,7)} @ ${onlyPostCommit.date}`);
        console.log(`most recent branch commit: ${mostRecentBranchCommit.hash.slice(0,7)} @ ${mostRecentBranchCommit.date}`);

        // if a post only appears in one commit, and it's the most recent commit to the branch, it's a brand-new post (and not cached)
        if (onlyPostCommit.hash == mostRecentBranchCommit.hash) {
          const published = onlyPostCommit.date;
          const lastUpdated = onlyPostCommit.date;
          return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
        }

        // if a post only appears in one commit, and it's not the most recent commit, the post's metadata must be cached
        else {

          // if it's not in the cache, there's a problem
          if (!inCache) throw Error(`Blog post ${slug} has not been added to the cache (1)`);

          // if it is in the cache, we can use its cached info
          else {
            const cached = cache[cacheIndex];
            return new FrontMatter(slug, title, description, cached.published, cached.lastUpdated, rawContent);
          }
        }
      }

      // (2) a blog post appears in multiple commits
      else {

        // if it's not in the cache, there's a problem
        if (!inCache) throw Error(`Blog post ${slug} has not been added to the cache (2)`);

        // we always use the cached published date
        const cached = cache[cacheIndex];

        // get the most recent commit to this branch and the most recent commit for this post
        if (oldestPostCommit.hash == mostRecentPostCommit.hash) throw Error("Expected oldestPostCommit to not equal mostRecentPostCommit");

        // we ignore the cached lastUpdated date if the post was updated this commit
        if (mostRecentPostCommit == mostRecentBranchCommit) {
          const published = cached.published;
          const lastUpdated = mostRecentPostCommit.date;
          return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
        }

        // if the post was not updated this commit, use both values from the cache
        else {
          const published = cached.published;
          const lastUpdated = cached.lastUpdated;
          return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
        }
      }
    }

    // if we're not on Vercel, we're on the 'development' branch and we're either inDevelopment (npm run dev) or doing a local build
    else {

      // make sure we have the most up-to-date info by using both the on-disk and the in-memory cache
      const cache = SlugFactory.readCacheFromDisk().concat(SlugFactory.inMemoryCache);
      const cacheIndex = cache.findIndex((entry) => entry.slug === slug);
      const inCache = cacheIndex >= 0;

      // test our assumptions
      if (allCommits.find(commit => commit.hash.startsWith('0144e41')) == undefined) throw Error(`Could not find origin commit (is this a shallow clone?)`);

      // if we're in local development, we're running 'npm run dev' on the 'development' branch
      // we don't always do an 'npm run dev' before pushing to production, so update the cache only on 'npm run build'
      if (env == "development") {

        // test our assumptions
        if (branch != 'development') throw Error(`Expected branch name to be "development" but found "${branch}"`);

        // development mode is the same as running on Vercel except we might also have uncommitted files
        // TODO: we might also have uncommitted updates to posts which have already been committed -- but their lastUpdated dates won't be updated

        // (0) a blog post appears in no commits
        if (postCommits.length == 0) {

          // remove it from the cache, if it's there
          const newArr = cache.filter((entry) => entry.slug != slug);
          SlugFactory.writeCacheToDisk(newArr);

          const now = new Date().toISOString();
          return new FrontMatter(slug, title, description, now, now, rawContent);
        }

        // a blog post appears in commits
        else {

          if (oldestPostCommit == undefined)     throw Error("oldestPostCommit is undefined");
          if (mostRecentPostCommit == undefined) throw Error("mostRecentPostCommit is undefined");

          // (1) a blog post only appears in a single commit
          if (postCommits.length == 1) {

            // TODO use git diff here to update lastUpdated date for uncommitted changes to local files
            if (oldestPostCommit.hash != mostRecentPostCommit.hash) throw Error("Expected oldestPostCommit to equal mostRecentPostCommit");
            const onlyPostCommit = oldestPostCommit;

            // if a post only appears in one commit, and it's the most recent commit to the branch, it's a brand-new post (and not cached)
            if (onlyPostCommit == mostRecentBranchCommit) {
              const published = onlyPostCommit.date;
              const lastUpdated = onlyPostCommit.date;
              return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
            }

            // if a post only appears in one commit, and it's not the most recent commit, the post's metadata must be cached
            else {

              // if it's not in the cache, add it to the cache
              if (!inCache) {
                const published = oldestPostCommit.date;
                const lastUpdated = mostRecentPostCommit.date;

                const newArr = cache.concat([{ slug, published, lastUpdated }]);
                SlugFactory.writeCacheToDisk(newArr);
                return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
              }

              // if it is in the cache, we can use its cached info
              else {
                const cached = cache[cacheIndex];
                const published = cached.published;
                const lastUpdated = cached.lastUpdated;
                return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
              }
            }
          }

          // (2) a blog post appears in multiple commits
          else {

            // if it's not in the cache, add it to the cache
            if (!inCache) {
              const published = oldestPostCommit.date;
              const lastUpdated = mostRecentPostCommit.date;

              const newArr = cache.concat([{ slug, published, lastUpdated }]);
              SlugFactory.writeCacheToDisk(newArr);
              return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
            }

            // we always use the cached published date
            const cached = cache[cacheIndex];

            // we ignore the cached lastUpdated date if the post was updated this commit
            if (mostRecentPostCommit == mostRecentBranchCommit) {
              const published = cached.published;
              const lastUpdated = mostRecentPostCommit.date;
              return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
            }

            // if the post was not updated this commit, use both values from the cache
            else {
              const published = cached.published;
              const lastUpdated = cached.lastUpdated;
              return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
            }
          }
        }
      }

      // if we're running a build locally, we're running 'npm run build' on the 'development' branch
      // we don't always do an 'npm run dev' before pushing to production, so update the cache only on 'npm run build'
      else if (env == "production") {

        if (postCommits.length > 0) {

          if (oldestPostCommit == undefined)     throw Error("oldestPostCommit is undefined");
          if (mostRecentPostCommit == undefined) throw Error("mostRecentPostCommit is undefined");

          // if this post was just committed, it might not be in the cache at all, so update the cache but don't do any verification
          if (postCommits.length == 1) {

            const published = oldestPostCommit.date;
            const lastUpdated = mostRecentPostCommit.date;

            if (inCache) {
              cache[cacheIndex] = { slug, published, lastUpdated };
              SlugFactory.writeCacheToDisk(cache);

            } else {
              const newArr = cache.concat([{ slug, published, lastUpdated }]);
              SlugFactory.writeCacheToDisk(newArr);
            }

            return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);

          }

          // if a post has been committed, add, update, or verify its cache entry
          else {

            // if it's in the cache, verify the published date and update / verify the lastUpdated date
            if (inCache) {
              const cached = cache[cacheIndex];

              console.log(`Most recent post commit:             ${mostRecentPostCommit.hash.slice(0,7)}`); // eslint-disable-line no-console
              console.log(`Most recent non-merge branch commit: ${mostRecentBranchCommit.hash.slice(0,7)}`); // eslint-disable-line no-console

              // if this post was updated this commit, update its lastUpdated date in the cache
              if (mostRecentPostCommit.hash == mostRecentBranchCommit.hash) {
                if (oldestPostCommit.date != cached.published) throw Error(`(1) Blog post ${slug} cached published date ${cached.published} does not match expected date ${oldestPostCommit.date}`);

                const published = cached.published;
                const lastUpdated = mostRecentPostCommit.date;

                cache[cacheIndex] = { slug, published, lastUpdated };
                SlugFactory.writeCacheToDisk(cache);

                return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
              }

              // if it wasn't updated this commit, just verify its published and lastUpdated dates
              else {

                const published = cached.published;
                const lastUpdated = cached.lastUpdated;

                if (oldestPostCommit.date != published)           throw Error(`(2) Blog post ${slug} cached published date ${published} does not match expected date ${oldestPostCommit.date}`);
                if (mostRecentPostCommit.date != lastUpdated) throw Error(`(2) Blog post ${slug} cached lastUpdated date ${lastUpdated} does not match expected date ${mostRecentPostCommit.date}`);
                return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
              }
            }

            // if it's not in the cache, add it
            else {

              const published = oldestPostCommit.date;
              const lastUpdated = mostRecentPostCommit.date;

              const newArr = cache.concat([{ slug, published, lastUpdated }]);
              SlugFactory.writeCacheToDisk(newArr);
              return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
            }
          }
        }

        // if post has not been committed, do nothing with the cache
        else {
          const now = new Date().toISOString();
          return new FrontMatter(slug, title, description, now, now, rawContent);
        }
      }

      // if env is "test" or "undefined"
      else throw Error(`Unexpected environment: ${env}`);
    }
  }
}
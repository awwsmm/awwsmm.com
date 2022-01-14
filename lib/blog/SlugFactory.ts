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

  private static readonly allCommitDates: Promise<string[]> = SlugFactory.git.log().then(commits => commits.all.map(each => each.date));

  private static readonly cacheFile: string = path.join(Post.directory, "cache.json");

  private static cache(): CacheEntry[] {
    try {
      return JSON.parse(fs.readFileSync(SlugFactory.cacheFile, 'utf8'));
    } catch (error) {
      console.log("Error reading blog/cache.json. Returning empty cache."); // eslint-disable-line no-console
      return [];
    }
  }

  static getAll(): Slug[] {
    const fileNames: string[] = fs.readdirSync(Post.directory);
    return fileNames.filter(fileName => fileName.endsWith('.md')).map(fileName => new Slug(fileName.replace(/\.md$/, '')));
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

    // Get all git history entries which mention this file
    const dates: string[] = await SlugFactory.git.log({ file: `blog/${slug}.md` }).then(commits => commits.all.map(each => each.date));

    // if a blog post has been previously committed, it will have one or more log lines when 'git log' is run
    const committed = dates.length > 0 ? { lastUpdated: dates[0], published: dates[dates.length - 1] } : undefined;

    // update the cache only when we're in development (not running on Vercel)
    const inDevelopment = process.env.NODE_ENV === "development";

    const cache = SlugFactory.cache();
    const cacheIndex = cache.findIndex((entry) => entry.slug === slug);
    const inCache = cacheIndex >= 0;

    // if we're in development (running locally), we maintain the cache
    if (inDevelopment) {

      // if a blog post has no commit history, don't add it to the cache
      if (!committed) {

        const now = new Date().toISOString();
        console.log(`(0) Post '${slug}' not committed`); // eslint-disable-line no-console
        return new FrontMatter(slug, title, description, now, rawContent);

      } else {
        // if a blog post has a commit history
        const { lastUpdated, published } = committed;

        // if it's not in the cache -- add it to the cache
        if (!inCache) {
          const newArr = cache.concat([{ slug: slug, lastUpdated, published }]);
          fs.writeFileSync(SlugFactory.cacheFile, JSON.stringify(newArr, undefined, 2));

        // if it's in the cache -- update the cache
        } else {
          cache[cacheIndex] = { slug: slug, lastUpdated, published };
          fs.writeFileSync(SlugFactory.cacheFile, JSON.stringify(cache, undefined, 2));
        }

        console.log(`(1) Post '${slug}' published: ${published}, last updated: ${lastUpdated}`); // eslint-disable-line no-console
        return new FrontMatter(slug, title, description, published, rawContent);
      }

    // if we're in production (building locally, or running on Vercel), we utilise the cache
    } else {

      // if a blog post has a commit history
      if (committed) {

        // if it's not in the cache, the post must be brand-new
        if (!inCache) {

          // throw an error if there are multiple commits -- it should have been added to the cache in development
          if (committed.lastUpdated !== committed.published) {
            throw new Error(`Blog entry ${slug}.md appears in multiple commits but is not in the cache!`);
          }

          console.log(`(2) Post '${slug}' published: ${committed.published}, last updated: ${committed.lastUpdated}`); // eslint-disable-line no-console
          return new FrontMatter(slug, title, description, committed.published, rawContent);

        // if it is in the cache, ignore the local history and use the cache
        } else {
          const commitDates = await SlugFactory.allCommitDates;
          const oldestAvailableCommit = commitDates[commitDates.length - 1];
          const newestAvailableCommit = commitDates[0];

          // Get rid of all this logging once this has had some time to bake

          console.log(`newest available commit time:  ${newestAvailableCommit}`); // eslint-disable-line no-console
          console.log(`published time from git log:   ${committed.published}`); // eslint-disable-line no-console
          console.log(`lastUpdated time from git log: ${committed.lastUpdated}`); // eslint-disable-line no-console
          console.log(`oldest available commit time:  ${oldestAvailableCommit}`); // eslint-disable-line no-console

          const cached = cache[cacheIndex];

          console.log(`published time from cache:     ${cached.published}`); // eslint-disable-line no-console
          console.log(`lastUpdated time from cache:   ${cached.lastUpdated}`); // eslint-disable-line no-console

          // use the lastUpdated time from git log only if it's the time of the newest available commit (if this post was updated _this commit_)
          const lastUpdated = (committed.lastUpdated === newestAvailableCommit) ? newestAvailableCommit : cached.lastUpdated;

          console.log(`(3) Post '${slug}' published: ${cached.published}, last updated: ${lastUpdated}`); // eslint-disable-line no-console
          return new FrontMatter(slug, title, description, cached.published, rawContent);
        }

      } else {

        if (slug.startsWith('wip-')) {
          const now = new Date().toISOString();

          // this is an uncommitted local WIP file which will not be pushed to production
          console.log(`(4) Post '${slug}' not committed`); // eslint-disable-line no-console
          return new FrontMatter(slug, title, description, now, rawContent);

        } else {
          // shouldn't be possible to get here? (clean this up later)
          throw new Error("Should never see this -- uncommitted blog post in production");
        }
      }
    }
  }
}
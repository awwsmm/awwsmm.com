import Environment, { RichCommit } from '../utils/Environment';
import Cache from '../utils/Cache';
import { FrontMatter } from './FrontMatter';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { Post } from './Post';
import Slug from './Slug';

type CacheKey = string
type CacheValue = { lastUpdated: string, published: string }

export default class SlugFactory {

  // get all slugs from /blog directory
  static getAll(): Slug[] {
    const fileNames: string[] = fs.readdirSync(Post.directory);
    return fileNames.filter(name => name.endsWith('.md')).map(name => new Slug(name.replace(/\.md$/, '')));
  }

  // get the published and lastUpdated dates for a given post
  static async getDates(slugWrapper: Slug): Promise<{ published: string | undefined, lastUpdated: string | undefined }> {
    const env = await Environment.get();
    const { slug } = slugWrapper.params;

    // get all (non-merge) commits related to this post (master branch only, because that's all Vercel will know about)
    const postCommits: RichCommit[] = await env.git.log([ 'master', `blog/${slug}.md` ]).
      then(commits => commits.all
        .filter(commit => commit.message != "Merge branch 'development'")
        .filter(commit => !commit.message.startsWith("Merge pull request "))
      );

    // if there are no commits, these dates are undefined
    if (postCommits.length < 1) {
      return { published: undefined, lastUpdated: undefined };
    } else {

      const oldestCommit = postCommits[postCommits.length - 1];
      const newestCommit = postCommits[0];

      // if running locally, always pull dates directly from git
      if (env.vercel === undefined) {
        return { published: oldestCommit.date, lastUpdated: newestCommit.date };
      }

      // if running on Vercel, use git unless a commit equals the "horizon commit", where we lose information; then, use cache
      else {
        const horizon = await env.horizonCommit;
        const published = (oldestCommit == horizon) ? SlugFactory.cache.get(slug)?.published : oldestCommit.date;
        const lastUpdated = (newestCommit == horizon) ? SlugFactory.cache.get(slug)?.lastUpdated : newestCommit.date;
        return { published, lastUpdated };
      }
    }
  }

  private static cache = new Cache<CacheKey,CacheValue>("posts.json");

  static async getFrontMatter(slugWrapper: Slug): Promise<FrontMatter> {
    const env = await Environment.get();

    const { slug } = slugWrapper.params;
    const fullPath = path.join(Post.directory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const rawContent = matterResult.content;

    const dates = await SlugFactory.getDates(slugWrapper);

    // if running locally and dates are undefined:
    // - file hasn't yet been committed to master
    // - don't do anything with the cache

    // when running locally
    if (env.vercel === undefined) {

      // if dates are undefined
      // - file hasn't yet been committed to master
      // - don't do anything with the cache

      if (dates.lastUpdated === undefined || dates.published === undefined) {
        if (dates.lastUpdated !== dates.published) throw Error("Expected both dates or neither to be defined, found one of each");
        const now = new Date().toISOString();
        return new FrontMatter(slug, title, description, now, now, rawContent);
      }

      // if dates are defined, use them, and keep the cache up-to-date
      else {
        const { published, lastUpdated } = dates;
        this.cache.set(slug, { published, lastUpdated });
        return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
      }
    }

    // when running on Vercel, don't do anything with the cache
    else {

      // when running a "production" build (on "master"), we should never have files not committed to "master"
      if (env.vercel == 'production') {
        if (dates.lastUpdated === undefined || dates.published === undefined) {
          if (dates.lastUpdated !== dates.published) throw Error("Expected both dates or neither to be defined, found one of each");
          throw Error(`Running a production build on Vercel, expected all dates to be defined`);
        } else {
          return new FrontMatter(slug, title, description, dates.published, dates.lastUpdated, rawContent);
        }
      }

      // when running a "preview" build, we could have files not yet committed to "master"
      // do exactly the same as we do above when (env.vercel === undefined), but don't do anything with the cache
      else {

        if (dates.lastUpdated === undefined || dates.published === undefined) {
          if (dates.lastUpdated !== dates.published) throw Error("Expected both dates or neither to be defined, found one of each");
          const now = new Date().toISOString();
          return new FrontMatter(slug, title, description, now, now, rawContent);
        }

        // if dates are defined, use them
        else {
          const { published, lastUpdated } = dates;
          return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
        }
      }
    }
  }
}
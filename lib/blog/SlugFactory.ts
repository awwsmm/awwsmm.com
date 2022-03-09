import Cache from '../utils/Cache';
import Environment from '../utils/Environment';
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
  static async getDatesNew(slugWrapper: Slug): Promise<{ published: string, lastUpdated: string }> {

    const { slug } = slugWrapper.params;
    type C = { sha: string, message: string, date: string, link: string }
    const fileName = `blog/${slug}.md`;
    const cacheFileName = `blog/${slug}.json`;

    const cache = new Cache<string,C[]>(cacheFileName);
    const cached: C[] | undefined = cache.get(slug);

    if (cached) {
      console.log(`Using cached commits from caches/${cacheFileName} (delete this file to force an update)`); // eslint-disable-line no-console
      cached.sort((a,b) => (a.date < b.date) ? 1 : -1);
      const published = cached[cached.length - 1].date;
      const lastUpdated = cached[0].date;
      return { published, lastUpdated };

    } else {
      console.log(`Querying local git history for commits for ${fileName}`); // eslint-disable-line no-console
      const env = await Environment.get();
      const result = await env.git.log({ file: fileName }).then(commits =>
        commits.all.map(commit =>
          `      {
          |        "sha":     "${commit.hash}",
          |        "message": "${commit.message}",
          |        "date":    "${commit.date}",
          |        "link":    "https://github.com/awwsmm/awwsmm.com/commit/${commit.hash}"
          |      }
          `.replaceAll(/^[\r\t\n]*/g, '').replaceAll(/[\r\t\n ]*$/g, '').replaceAll(/[ ]*\|/g, '')
        ).join(',\n')
      );

      const prefix = `[\n  [\n    "${slug}",\n    [\n`;
      const postfix = `\n    ]\n  ]\n]`;

      fs.writeFileSync(`caches/${cacheFileName}`, prefix + result + postfix);

      // recursively call this function now that we've fixed the cache
      return SlugFactory.getDatesNew(slugWrapper);
    }
  }

  private static cache = new Cache<CacheKey,CacheValue>("posts.json");

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

    const { published, lastUpdated } = await SlugFactory.getDatesNew(slugWrapper);
    return new FrontMatter(slug, title, description, published, lastUpdated, rawContent);
  }

}
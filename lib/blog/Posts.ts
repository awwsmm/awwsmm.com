import Cache from '../utils/Cache';
import Commit from '../model/Commit';
import Environment from '../utils/Environment';
import fs from 'fs';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';
import path from "path";
import PostData from '../model/PostData';
import PostDates from '../model/PostDates';
import { rehype } from 'rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import scala from 'highlight.js/lib/languages/scala';
import { unified } from 'unified';

export default abstract class Posts {

  static readonly dir = path.join(process.cwd(), "blog");

  // get all blog post slugs
  static getSlugs(): string[] {
    const fileNames: string[] = fs.readdirSync(Posts.dir);
    return fileNames.filter(name => name.endsWith('.md')).map(name => name.replace(/\.md$/, ''));
  }

  // get the published and lastUpdated dates for a blog post from the git history
  static async getDates(slug: string): Promise<PostDates> {

    const fileName = `blog/${slug}.md`;
    const cacheFileName = `blog/${slug}.json`;

    const cache = new Cache<string, Commit[]>(cacheFileName);
    const cached: Commit[] | undefined = cache.get(slug);

    if (cached) {
      console.log(`Using cached commits from caches/${cacheFileName} (delete this file to force an update)`); // eslint-disable-line no-console
      cached.sort((a,b) => (parseISO(a.date) < parseISO(b.date)) ? 1 : -1);
      const published = cached[cached.length - 1].date;
      const lastUpdated = cached[0].date;
      return new PostDates(slug, published, lastUpdated);

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
          `.replace(/^[\r\t\n]*/g, '').replace(/[\r\t\n ]*$/g, '').replace(/[ ]*\|/g, '')
        ).join(',\n')
      );

      // the file has not been committed yet, so do not create a cache file for it
      if (result === "") {
        return new Promise((resolve, reject) => { // eslint-disable-line @typescript-eslint/no-unused-vars
          const now = new Date().toISOString();
          resolve(new PostDates(slug, now, now));
        });

      // fix the cache and then call this function again
      } else {
        const prefix = `[\n  [\n    "${slug}",\n    [\n`;
        const postfix = `\n    ]\n  ]\n]`;
        fs.writeFileSync(`caches/${cacheFileName}`, prefix + result + postfix);
        return Posts.getDates(slug);
      }
    }
  }

  // read a post, given its slug, but do no processing
  static getRaw(slug: string): PostData {
    const fullPath = path.join(Posts.dir, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const rawContent = matterResult.content;

    return new PostData(slug, title, description, rawContent);
  }

  // process an unprocessed post
  static async process(rawPost: PostData): Promise<string> {
    const { rawContent } = rawPost;

    // Use remark-rehype to convert markdown into HTML string
    const html = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(rawContent);

    // Use rehype-highlight to generate language-specific AST
    const ast = await rehype()
      .data('settings', {fragment: true})
      .use(rehypeHighlight, {languages: {scala}})
      .process(String(html));

    return String(ast);
  }

}
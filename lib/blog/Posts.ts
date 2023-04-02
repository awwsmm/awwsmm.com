import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import PostData from '../model/PostData';
import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import scala from 'highlight.js/lib/languages/scala';
import { unified } from 'unified';

export type PostWrapperMap = {
  slug: string;
  post: PostData;
};

export abstract class Posts {
  static readonly dir = path.join(process.cwd(), 'blog');

  // get all blog post slugs
  static getSlugs(): string[] {
    const fileNames: string[] = fs.readdirSync(Posts.dir);
    return fileNames.filter((name) => name.endsWith('.md')).map((name) => name.replace(/\.md$/, ''));
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
    const published: string = matterResult.data.published;
    const lastUpdated: string = matterResult.data.lastUpdated;
    const rawContent = matterResult.content;

    return new PostData(slug, title, description, published, lastUpdated, rawContent);
  }

  // process an unprocessed post
  static async process(rawPost: PostData): Promise<string> {
    const { rawContent } = rawPost;

    // Use remark-rehype to convert markdown into HTML string
    const html = await unified().use(remarkParse).use(remarkRehype).use(rehypeStringify).process(rawContent);

    // Use rehype-highlight to generate language-specific AST
    const ast = await rehype()
      .data('settings', { fragment: true })
      .use(rehypeHighlight, { languages: { scala } })
      .process(String(html));

    return String(ast);
  }

  static async getPostWrappers(): Promise<PostWrapperMap[]> {
    // get all the info about all blog posts
    const slugs = Posts.getSlugs();
    const allPosts = slugs.map((slug) => Posts.getRaw(slug));

    // collect all post info into wrapper type
    const posts: PostWrapperMap[] = slugs.map((slug) => {
      const post = allPosts.find((p) => p.slug === slug);

      if (post === undefined) throw new Error('!');

      return {
        slug,
        post,
      };
    });

    return posts;
  }
}

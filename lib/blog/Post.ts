import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import {rehype} from 'rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import scala from 'highlight.js/lib/languages/scala';
import {unified} from 'unified';

/**
 * A Slug contains the minimum amount of information we can know about a blog post: just its filename.
 */
export class Slug {

  // Because getStaticPaths() in /pages/blog/[slug].tsx returns an object with params: Slug[],
  //  this class must have a 'params' field which itself has a 'slug' field
  readonly params: { readonly slug: string };

  constructor(slug: string) {
    this.params = { slug };
  }

  static getAll(): Slug[] {
    const fileNames: string[] = fs.readdirSync(Post.directory);
    return fileNames.map(fileName => new Slug(fileName.replace(/\.md$/, '')));
  }

  getFrontMatter(): FrontMatter {
    const fullPath = path.join(Post.directory, `${this.params.slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const dateAsISOString = matterResult.data.date;

    const rawContent = matterResult.content;

    return new FrontMatter(this.params.slug, title, description, dateAsISOString, rawContent);
  }
}

/**
 * A blog post's front matter contains its title, description, and date.
 *
 * We don't process the content of the post until asked.
 */
export class FrontMatter {
  readonly slugAsString: string;
  readonly title: string;
  readonly description: string;
  readonly dateAsISOString: string;
  readonly rawContent: string;

  constructor(slugAsString: string, title: string, description: string, dateAsISOString: string, rawContent: string) {
    this.slugAsString = slugAsString;
    this.title = title;
    this.description = description;
    this.dateAsISOString = dateAsISOString;
    this.rawContent = rawContent;
  }

  // Return all blog posts, sorted by date
  static getAll(): FrontMatter[] {
    const allFrontMatter = Slug.getAll().map(slug => slug.getFrontMatter());
    return allFrontMatter.sort((a, b) => (a.dateAsISOString < b.dateAsISOString) ? 1 : -1);
  }

  async processContent(): Promise<Post> {

    // Use remark-rehype to convert markdown into HTML string
    const html = await unified()
      .use(remarkParse)
      .use(remarkRehype)
      .use(rehypeDocument)
      .use(rehypeFormat)
      .use(rehypeStringify)
      .process(this.rawContent);

    // TODO: make this look better
    // https://ped.ro/blog/code-blocks-but-better

    // Use rehype-highlight to generate language-specific AST
    const ast = await rehype()
      .data('settings', {fragment: true})
      .use(rehypeHighlight, {languages: {scala}})
      .process(String(html));

    // Return all the data and metadata in a Post object
    return new Post(this.slugAsString, this.title, this.description, this.dateAsISOString, String(ast));
  }
}

/**
 * Represents a blog post which has been fully processed.
 */
export class Post {
  readonly slugAsString: string;
  readonly title: string;
  readonly description: string;
  readonly dateAsISOString: string;
  readonly htmlContent: string;

  constructor(slugAsString: string, title: string, description: string, dateAsISOString: string, htmlContent: string) {
    this.slugAsString = slugAsString;
    this.title = title;
    this.description = description;
    this.dateAsISOString = dateAsISOString;
    this.htmlContent = htmlContent;
  }

  // process.cwd() is the root directory of this project TODO move into util class
  static readonly directory: string = path.join(process.cwd(), 'blog');
}
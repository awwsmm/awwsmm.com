import { Post } from './Post';
import {rehype} from 'rehype';
import rehypeDocument from 'rehype-document';
import rehypeFormat from 'rehype-format';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import scala from 'highlight.js/lib/languages/scala';
import { unified } from 'unified';

/**
 * A blog post's front matter contains its title, description, and date.
 *
 * We don't process the content of the post until asked.
 */
 export class FrontMatter {
  readonly slugAsString: string;
  readonly title: string;
  readonly description: string;
  readonly published: string;
  readonly lastUpdated: string;
  readonly rawContent: string;

  constructor(slugAsString: string, title: string, description: string, published: string, lastUpdated: string, rawContent: string) {
    this.slugAsString = slugAsString;
    this.title = title;
    this.description = description;
    this.published = published;
    this.lastUpdated = lastUpdated;
    this.rawContent = rawContent;
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
    return new Post(this.slugAsString, this.title, this.description, this.published, this.lastUpdated, String(ast));
  }
}
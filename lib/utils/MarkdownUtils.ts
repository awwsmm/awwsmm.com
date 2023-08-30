import 'rehype-parse'; // see: https://github.com/orgs/rehypejs/discussions/150
import bf from 'highlight.js/lib/languages/brainfuck';
import lisp from 'highlight.js/lib/languages/lisp';
import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import scala from 'highlight.js/lib/languages/scala';
import { unified } from 'unified';

/**
 * Utility class for handling Markdown.
 */
export default abstract class MarkdownUtils {
  static async process(markdown: string): Promise<string> {
    // Use remark-rehype to convert markdown into HTML string
    const html = await unified()
      .use(remarkParse) // create Markdown AST (mdast)
      .use(remarkGfm) // use GitHub-flavoured Markdown
      .use(remarkRehype, { allowDangerousHtml: true }) // convert mast to HTML AST (hast)
      .use(rehypeStringify, { allowDangerousHtml: true }) // convert hast into HTML
      .process(markdown)
      .then((vfile) => String(vfile));

    // Use rehype-highlight to generate language-specific AST
    const processed = await rehype()
      .data('settings', { fragment: true })
      .use(rehypeHighlight, { languages: { scala, bf, lisp } })
      .process(html)
      .then((vfile) => String(vfile));

    return `<div class="processed-markdown">${processed}</div>`;
  }
}

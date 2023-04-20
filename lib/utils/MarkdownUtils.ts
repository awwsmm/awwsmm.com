import { rehype } from 'rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
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
      .use(remarkParse) // create Markdown AST (mast)
      .use(remarkRehype) // convert mast to HTML AST (hast)
      .use(rehypeStringify) // convert hast into HTML
      .process(markdown)
      .then((vfile) => String(vfile));

    // Use rehype-highlight to generate language-specific AST
    const processed = await rehype()
      .data('settings', { fragment: true })
      .use(rehypeHighlight, { languages: { scala } })
      .process(html)
      .then((vfile) => String(vfile));

    return `<div class="processedMarkdown">${processed}</div>`;
  }
}

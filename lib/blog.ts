import fs from 'fs';
import matter from 'gray-matter';
import { parseISO } from 'date-fns';
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

const blogDir = path.join(process.cwd(), 'blog');

export class PostMetadata {
  date: Date;
  title: string;
  description: string;
  id: string;

  constructor(date: Date, title: string, description: string, id: string) {
    this.date = date;
    this.title = title;
    this.description = description;
    this.id = id;
  }
}

export class Post {
  date: Date;
  title: string;
  description: string;
  id: string;
  htmlContent: string;

  constructor(date: Date, title: string, description: string, id: string, htmlContent: string) {
    this.date = date;
    this.title = title;
    this.description = description;
    this.id = id;
    this.htmlContent = htmlContent;
  }
}

export function getSortedPostsData(): PostMetadata[] {
  // Get file names under /posts
  const fileNames = fs.readdirSync(blogDir);
  const allPostsData = fileNames.map(fileName => {

    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Read markdown file as string
    const fullPath = path.join(blogDir, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    const date: Date = parseISO(matterResult.data.date);
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;

    return new PostMetadata(date, title, description, id);
  });

  // Sort blog posts by date
  return allPostsData.sort((a, b) => (a.date < b.date) ? 1 : -1);
}

export function getAllPostIds(): string[] {
  const fileNames: string[] = fs.readdirSync(blogDir);
  return fileNames.map(fileName => fileName.replace(/\.md$/, ''));
}

export async function getPostData(id: string): Promise<Post> {
  const fullPath = path.join(blogDir, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark-rehype to convert markdown into HTML string
  const html = await unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypeDocument)
    .use(rehypeFormat)
    .use(rehypeStringify)
    .process(matterResult.content);

  // Use rehype-highlight to generate language-specific AST
  const ast = await rehype()
    .data('settings', {fragment: true})
    .use(rehypeHighlight, {languages: {scala}})
    .process(String(html));

  // Return all the data and metadata in a Post object
  const date: Date = parseISO(matterResult.data.date);
  const title: string = matterResult.data.title;
  const description: string = matterResult.data.description;
  return new Post(date, title, description, id, String(ast));
}
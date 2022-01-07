import { FrontMatter } from './FrontMatter';
import fs from 'fs';
import matter from 'gray-matter';
import path from 'path';
import { Post } from './Post';
import Slug from './Slug';

export default class SlugFactory {
  static getAll(): Slug[] {
    const fileNames: string[] = fs.readdirSync(Post.directory);
    return fileNames.map(fileName => new Slug(fileName.replace(/\.md$/, '')));
  }

  static getFrontMatter(slug: Slug): FrontMatter {
    const fullPath = path.join(Post.directory, `${slug.params.slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Return all the data and metadata in a Post object
    const title: string = matterResult.data.title;
    const description: string = matterResult.data.description;
    const dateAsISOString = matterResult.data.date;

    const rawContent = matterResult.content;

    return new FrontMatter(slug.params.slug, title, description, dateAsISOString, rawContent);
  }
}
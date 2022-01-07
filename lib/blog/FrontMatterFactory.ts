import { FrontMatter } from './FrontMatter';
import SlugFactory from './SlugFactory';

/**
 * A blog post's front matter contains its title, description, and date.
 *
 * We don't process the content of the post until asked.
 */
 export class FrontMatterFactory {

  // Return all blog posts, sorted by date
  static getAll(): FrontMatter[] {
    const allFrontMatter = SlugFactory.getAll().map(slug => SlugFactory.getFrontMatter(slug));
    return allFrontMatter.sort((a, b) => (a.dateAsISOString < b.dateAsISOString) ? 1 : -1);
  }
}
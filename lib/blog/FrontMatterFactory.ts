import { FrontMatter } from './FrontMatter';
import SlugFactory from './SlugFactory';

/**
 * A blog post's front matter contains its title, description, and date.
 *
 * We don't process the content of the post until asked.
 */
 export class FrontMatterFactory {

  // Return all blog posts, sorted by date
  static async getAll(): Promise<FrontMatter[]> {
    const allFrontMatter = Promise.all(SlugFactory.getAll().map(slug => SlugFactory.getFrontMatter(slug)));
    const thing = allFrontMatter.then(fms => fms.sort((a, b) => (a.published < b.published) ? 1 : -1));
    return thing;
  }
}
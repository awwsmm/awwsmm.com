/**
 * Represents an unprocessed blog post file.
 */
 export default class PostData {
   slug: string;
   title: string;
   description: string;
   published: string;
   lastUpdated: string;
   rawContent: string;

  constructor(slug: string, title: string, description: string, published: string, lastUpdated: string, rawContent: string) {
    this.slug = slug;
    this.title = title;
    this.description = description;
    this.published = published;
    this.lastUpdated = lastUpdated;
    this.rawContent = rawContent;
  }
}